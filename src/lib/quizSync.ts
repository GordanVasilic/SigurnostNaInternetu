import { db, isFirebaseConfigured } from "./firebase";
import { ref, onValue, set, update, get } from "firebase/database";
import { QuizState, Player, PlayerAnswer, QuestionStat } from "@/types/quiz";
import { QUIZ_QUESTIONS } from "@/data/questions";

export const DEFAULT_ROOM_CODE = "sigurnost";

// In-memory room store per client session
const roomStateStore = new Map<string, QuizState>();
const localSubscribersMap = new Map<string, Set<(state: QuizState) => void>>();

export function createInitialState(roomCode = DEFAULT_ROOM_CODE): QuizState {
  return {
    status: "lobby",
    currentQuestionIndex: 0,
    questionStartTime: 0,
    durationSeconds: 20,
    roomCode,
    resetId: 1,
    updatedAt: Date.now(),
    players: {},
    removedPlayers: {},
  };
}

export function areStatesEqual(prev: QuizState | null, next: QuizState | null): boolean {
  if (!prev || !next) return false;
  if (prev === next) return true;
  if (prev.status !== next.status) return false;
  if (prev.currentQuestionIndex !== next.currentQuestionIndex) return false;
  if ((prev.resetId || 1) !== (next.resetId || 1)) return false;
  if (prev.countdownStartTime !== next.countdownStartTime) return false;
  if (prev.questionStartTime !== next.questionStartTime) return false;

  const prevPlayers = prev.players || {};
  const nextPlayers = next.players || {};
  const prevKeys = Object.keys(prevPlayers);
  const nextKeys = Object.keys(nextPlayers);
  if (prevKeys.length !== nextKeys.length) return false;

  for (const key of nextKeys) {
    const p1 = prevPlayers[key];
    const p2 = nextPlayers[key];
    if (!p1 || !p2) return false;
    if (p1.name !== p2.name || p1.avatar !== p2.avatar || p1.score !== p2.score) return false;
    const a1Count = p1.answers ? Object.keys(p1.answers).length : 0;
    const a2Count = p2.answers ? Object.keys(p2.answers).length : 0;
    if (a1Count !== a2Count) return false;
  }

  return true;
}

export function mergeQuizStates(current: QuizState | null, incoming: QuizState): QuizState {
  if (!current) return incoming;

  const currentResetId = current.resetId || 1;
  const incomingResetId = incoming.resetId || 1;

  // Higher resetId = authoritative reset from admin
  if (incomingResetId > currentResetId) {
    return incoming;
  }

  // Stale resetId from older session = keep current
  if (incomingResetId < currentResetId) {
    return current;
  }

  // Monotonic status progression
  const statusOrder: Record<string, number> = {
    lobby: 0,
    countdown: 1,
    question: 2,
    finished: 3,
  };

  const currentOrder = statusOrder[current.status] ?? 0;
  const incomingOrder = statusOrder[incoming.status] ?? 0;

  let status = current.status;
  let currentQuestionIndex = current.currentQuestionIndex;
  let questionStartTime = current.questionStartTime;
  let countdownStartTime = current.countdownStartTime;

  if (incomingOrder > currentOrder) {
    status = incoming.status;
    currentQuestionIndex = incoming.currentQuestionIndex;
    questionStartTime = incoming.questionStartTime;
    countdownStartTime = incoming.countdownStartTime;
  } else if (incomingOrder === currentOrder) {
    if (status === "question") {
      if (incoming.currentQuestionIndex > currentQuestionIndex) {
        currentQuestionIndex = incoming.currentQuestionIndex;
        questionStartTime = incoming.questionStartTime;
      }
    } else if (status === "countdown") {
      countdownStartTime = incoming.countdownStartTime || countdownStartTime;
    }
  }

  // Merge removed players
  const mergedRemoved: Record<string, number> = {
    ...(current.removedPlayers || {}),
    ...(incoming.removedPlayers || {}),
  };
  for (const [id, ts] of Object.entries(incoming.removedPlayers || {})) {
    mergedRemoved[id] = Math.max(mergedRemoved[id] || 0, ts);
  }

  // Merge players monotonically
  const mergedPlayers: Record<string, Player> = { ...(current.players || {}) };

  // Remove players marked as removed unless they re-joined after removal
  for (const [id, ts] of Object.entries(mergedRemoved)) {
    const existing = mergedPlayers[id];
    if (existing && (existing.joinedAt || 0) <= ts) {
      delete mergedPlayers[id];
    }
  }

  // Add / update incoming players
  for (const [id, incPlayer] of Object.entries(incoming.players || {})) {
    const removeTs = mergedRemoved[id];
    if (removeTs && (incPlayer.joinedAt || 0) <= removeTs) {
      continue;
    }
    if (removeTs && (incPlayer.joinedAt || 0) > removeTs) {
      delete mergedRemoved[id];
    }

    const existing = mergedPlayers[id];
    if (!existing) {
      mergedPlayers[id] = incPlayer;
    } else {
      const mergedAnswers = {
        ...(existing.answers || {}),
        ...(incPlayer.answers || {}),
      };
      mergedPlayers[id] = {
        ...existing,
        ...incPlayer,
        score: Math.max(existing.score || 0, incPlayer.score || 0),
        totalTimeMs: Math.max(existing.totalTimeMs || 0, incPlayer.totalTimeMs || 0),
        lastSeen: Math.max(existing.lastSeen || 0, incPlayer.lastSeen || 0),
        answers: mergedAnswers,
      };
    }
  }

  return {
    ...current,
    ...incoming,
    status,
    currentQuestionIndex,
    questionStartTime,
    countdownStartTime,
    resetId: currentResetId,
    resetAt: current.resetAt || incoming.resetAt,
    players: mergedPlayers,
    removedPlayers: mergedRemoved,
    updatedAt: Math.max(current.updatedAt || 0, incoming.updatedAt || 0),
  };
}

function notifyLocalSubscribers(roomCode: string, state: QuizState) {
  const subs = localSubscribersMap.get(roomCode);
  if (subs) {
    subs.forEach((fn) => {
      try {
        fn(state);
      } catch (err) {
        console.error("Greška u subscriberu:", err);
      }
    });
  }
}

// 1. Subscribe to Live Quiz State (Firebase Realtime DB OR Built-in Gossip Sync)
export function subscribeToQuizState(
  roomCode: string,
  onUpdate: (state: QuizState) => void,
  getPlayerId?: () => string | undefined
): () => void {
  // Mode A: Firebase Realtime Database
  if (isFirebaseConfigured && db) {
    const roomRef = ref(db, `rooms/${roomCode}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        onUpdate({
          ...val,
          players: val.players || {},
        });
      } else {
        const initial = createInitialState(roomCode);
        set(roomRef, initial);
        onUpdate(initial);
      }
    });

    return () => {
      unsubscribe();
    };
  }

  // Mode B: Built-in Next.js Serverless API with Gossip Sync
  let active = true;
  let lastKnownState: QuizState | null = roomStateStore.get(roomCode) || null;

  if (lastKnownState) {
    onUpdate(lastKnownState);
  }

  const listener = (state: QuizState) => {
    if (!active) return;
    if (!areStatesEqual(lastKnownState, state)) {
      lastKnownState = state;
      onUpdate(state);
    }
  };

  if (!localSubscribersMap.has(roomCode)) {
    localSubscribersMap.set(roomCode, new Set());
  }
  localSubscribersMap.get(roomCode)!.add(listener);

  const fetchApiState = async () => {
    if (!active) return;
    try {
      const pid = getPlayerId ? getPlayerId() : undefined;
      const currentState = roomStateStore.get(roomCode) || lastKnownState;

      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room: roomCode,
          action: "sync",
          data: {
            playerId: pid,
            resetId: currentState?.resetId || 1,
            resetAt: currentState?.resetAt,
            status: currentState?.status || "lobby",
            currentQuestionIndex: currentState?.currentQuestionIndex || 0,
            questionStartTime: currentState?.questionStartTime || 0,
            countdownStartTime: currentState?.countdownStartTime,
            players: currentState?.players || {},
            removedPlayers: currentState?.removedPlayers || {},
          },
        }),
      });

      if (res.ok && active) {
        const incoming: QuizState = await res.json();
        const base = roomStateStore.get(roomCode) || lastKnownState;
        const merged = mergeQuizStates(base, incoming);

        roomStateStore.set(roomCode, merged);
        notifyLocalSubscribers(roomCode, merged);
      }
    } catch {
      // Retry automatically on next poll tick
    }
  };

  // Immediate fetch
  fetchApiState();

  // Poll every 1000ms
  const pollInterval = setInterval(fetchApiState, 1000);

  return () => {
    active = false;
    localSubscribersMap.get(roomCode)?.delete(listener);
    clearInterval(pollInterval);
  };
}

// Helper for sending actions to /api/quiz
async function sendApiAction(roomCode: string, action: string, data?: unknown): Promise<QuizState | null> {
  try {
    const res = await fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ room: roomCode, action, data }),
    });
    if (res.ok) {
      const json = await res.json();
      return json;
    }
  } catch (err) {
    console.warn("Greška pri slanju na /api/quiz:", err);
  }
  return null;
}

// 2. Player joins / updates profile
export async function joinPlayer(roomCode: string, player: Player): Promise<QuizState | null> {
  if (isFirebaseConfigured && db) {
    const playerRef = ref(db, `rooms/${roomCode}/players/${player.id}`);
    await set(playerRef, player);
    return null;
  }

  // Use Built-in API with optimistic update
  const currentState = roomStateStore.get(roomCode) || null;
  const localWithPlayer: QuizState = {
    ...(currentState || createInitialState(roomCode)),
    players: {
      ...(currentState?.players || {}),
      [player.id]: player,
    },
    removedPlayers: {
      ...(currentState?.removedPlayers || {}),
    },
  };
  delete localWithPlayer.removedPlayers?.[player.id];

  roomStateStore.set(roomCode, localWithPlayer);
  notifyLocalSubscribers(roomCode, localWithPlayer);

  const serverState = await sendApiAction(roomCode, "join", { player });
  if (serverState) {
    const merged = mergeQuizStates(roomStateStore.get(roomCode) || null, serverState);
    roomStateStore.set(roomCode, merged);
    notifyLocalSubscribers(roomCode, merged);
    return merged;
  }
  return localWithPlayer;
}

// 2b. Player leaves / changes profile
export async function leavePlayer(roomCode: string, playerId: string): Promise<void> {
  if (isFirebaseConfigured && db) {
    const playerRef = ref(db, `rooms/${roomCode}/players/${playerId}`);
    await set(playerRef, null);
    return;
  }

  const now = Date.now();
  const currentState = roomStateStore.get(roomCode) || null;
  if (currentState) {
    const updatedPlayers = { ...(currentState.players || {}) };
    delete updatedPlayers[playerId];
    const updatedRemoved = { ...(currentState.removedPlayers || {}), [playerId]: now };
    const updatedState: QuizState = {
      ...currentState,
      players: updatedPlayers,
      removedPlayers: updatedRemoved,
    };
    roomStateStore.set(roomCode, updatedState);
    notifyLocalSubscribers(roomCode, updatedState);
  }

  await sendApiAction(roomCode, "leave", { playerId });
}

// 2c. Send immediate leave beacon on tab unload/close
export function sendBeaconLeave(roomCode: string, playerId: string) {
  if (typeof window === "undefined" || !playerId) return;
  const payload = JSON.stringify({
    room: roomCode,
    action: "leave",
    data: { playerId },
  });

  if (navigator.sendBeacon) {
    const blob = new Blob([payload], { type: "application/json" });
    navigator.sendBeacon("/api/quiz", blob);
  } else {
    try {
      fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      });
    } catch {}
  }
}

// 3. Admin starts countdown and then question 1
export async function startQuizCountdown(roomCode: string): Promise<void> {
  const now = Date.now();
  if (isFirebaseConfigured && db) {
    const roomRef = ref(db, `rooms/${roomCode}`);
    await update(roomRef, {
      status: "countdown",
      countdownStartTime: now,
      updatedAt: now,
    });
    return;
  }

  const currentState = roomStateStore.get(roomCode) || null;
  if (currentState) {
    const updated: QuizState = {
      ...currentState,
      status: "countdown",
      countdownStartTime: now,
      updatedAt: now,
    };
    roomStateStore.set(roomCode, updated);
    notifyLocalSubscribers(roomCode, updated);
  }

  await sendApiAction(roomCode, "start_countdown");
}

// 4. Set active question
export async function setQuestion(roomCode: string, questionIndex: number): Promise<void> {
  const now = Date.now();
  if (isFirebaseConfigured && db) {
    const roomRef = ref(db, `rooms/${roomCode}`);
    await update(roomRef, {
      status: "question",
      currentQuestionIndex: questionIndex,
      questionStartTime: now,
      updatedAt: now,
    });
    return;
  }

  const currentState = roomStateStore.get(roomCode) || null;
  if (currentState) {
    const updated: QuizState = {
      ...currentState,
      status: "question",
      currentQuestionIndex: questionIndex,
      questionStartTime: now,
      updatedAt: now,
    };
    roomStateStore.set(roomCode, updated);
    notifyLocalSubscribers(roomCode, updated);
  }

  await sendApiAction(roomCode, "set_question", { questionIndex });
}

// 5. Finish Quiz
export async function finishQuiz(roomCode: string): Promise<void> {
  const now = Date.now();
  if (isFirebaseConfigured && db) {
    const roomRef = ref(db, `rooms/${roomCode}`);
    await update(roomRef, {
      status: "finished",
      updatedAt: now,
    });
    return;
  }

  const currentState = roomStateStore.get(roomCode) || null;
  if (currentState) {
    const updated: QuizState = {
      ...currentState,
      status: "finished",
      updatedAt: now,
    };
    roomStateStore.set(roomCode, updated);
    notifyLocalSubscribers(roomCode, updated);
  }

  await sendApiAction(roomCode, "finish");
}

// 6. Reset Quiz to lobby
export async function resetQuiz(roomCode: string): Promise<void> {
  const now = Date.now();
  if (isFirebaseConfigured && db) {
    const resetData: Partial<QuizState> = {
      status: "lobby",
      currentQuestionIndex: 0,
      questionStartTime: 0,
      players: {},
      resetAt: now,
      updatedAt: now,
    };

    const roomRef = ref(db, `rooms/${roomCode}`);
    await update(roomRef, resetData);
    return;
  }

  const currentState = roomStateStore.get(roomCode) || null;
  const newResetId = (currentState?.resetId || 1) + 1;
  const resetState: QuizState = {
    ...(currentState || createInitialState(roomCode)),
    status: "lobby",
    currentQuestionIndex: 0,
    questionStartTime: 0,
    countdownStartTime: undefined,
    players: {},
    removedPlayers: {},
    resetAt: now,
    resetId: newResetId,
    updatedAt: now,
  };
  roomStateStore.set(roomCode, resetState);
  notifyLocalSubscribers(roomCode, resetState);

  await sendApiAction(roomCode, "reset", { resetId: newResetId });
}

// 7. Submit Answer by player
export async function submitAnswer(
  roomCode: string,
  playerId: string,
  questionIndex: number,
  selectedIndex: number,
  timeTakenMs: number
): Promise<{ isCorrect: boolean }> {
  const currentQ = QUIZ_QUESTIONS[questionIndex];
  const isCorrect = currentQ ? currentQ.correctIndex === selectedIndex : false;
  const now = Date.now();

  const answer: PlayerAnswer = {
    questionIndex,
    selectedIndex,
    isCorrect,
    timeTakenMs,
    submittedAt: now,
  };

  if (isFirebaseConfigured && db) {
    const playerRef = ref(db, `rooms/${roomCode}/players/${playerId}`);
    const snapshot = await get(playerRef);
    if (snapshot.exists()) {
      const player: Player = snapshot.val();
      const answers = player.answers || {};

      if (!answers[questionIndex]) {
        answers[questionIndex] = answer;
        const newScore = player.score + (isCorrect ? 1 : 0);
        const newTotalTime = (player.totalTimeMs || 0) + timeTakenMs;
        await update(playerRef, {
          score: newScore,
          totalTimeMs: newTotalTime,
          [`answers/${questionIndex}`]: answer,
        });
      }
    }
    return { isCorrect };
  }

  // Update local roomStateStore optimistically
  const currentState = roomStateStore.get(roomCode) || null;
  if (currentState && currentState.players?.[playerId]) {
    const p = currentState.players[playerId];
    const answers = { ...(p.answers || {}), [questionIndex]: answer };
    const newScore = (p.score || 0) + (isCorrect ? 1 : 0);
    const newTotalTime = (p.totalTimeMs || 0) + timeTakenMs;
    const updatedState: QuizState = {
      ...currentState,
      players: {
        ...currentState.players,
        [playerId]: {
          ...p,
          score: newScore,
          totalTimeMs: newTotalTime,
          answers,
        },
      },
    };
    roomStateStore.set(roomCode, updatedState);
    notifyLocalSubscribers(roomCode, updatedState);
  }

  // Use Built-in API
  await sendApiAction(roomCode, "answer", {
    playerId,
    questionIndex,
    selectedIndex,
    timeTakenMs,
  });

  return { isCorrect };
}

// 8. Calculate aggregate statistics
export function calculateQuizStats(quizState: QuizState): QuestionStat[] {
  const players = Object.values(quizState.players || {});

  return QUIZ_QUESTIONS.map((q, idx) => {
    let correctCount = 0;
    let incorrectCount = 0;
    let totalTime = 0;
    let answeredCount = 0;
    const optionCounts: [number, number, number] = [0, 0, 0];

    players.forEach((p) => {
      const ans = p.answers?.[idx];
      if (ans) {
        answeredCount++;
        totalTime += ans.timeTakenMs || 0;
        if (ans.selectedIndex >= 0 && ans.selectedIndex <= 2) {
          optionCounts[ans.selectedIndex]++;
        }
        if (ans.isCorrect) {
          correctCount++;
        } else {
          incorrectCount++;
        }
      }
    });

    const correctPercentage =
      answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;
    const averageTimeMs =
      answeredCount > 0 ? Math.round(totalTime / answeredCount) : 0;

    return {
      questionId: q.id,
      questionText: q.question,
      totalAnswered: answeredCount,
      correctCount,
      incorrectCount,
      correctPercentage,
      optionCounts,
      averageTimeMs,
    };
  });
}
