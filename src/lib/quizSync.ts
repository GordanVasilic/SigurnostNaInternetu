import { db, isFirebaseConfigured } from "./firebase";
import { ref, onValue, set, update, get } from "firebase/database";
import { QuizState, Player, PlayerAnswer, QuestionStat } from "@/types/quiz";
import { QUIZ_QUESTIONS } from "@/data/questions";

export const DEFAULT_ROOM_CODE = "sigurnost";

const LOCAL_STORAGE_KEY_PREFIX = "quiz_room_state_";
const channelMap = new Map<string, BroadcastChannel>();

function getLocalState(roomCode: string): QuizState {
  if (typeof window === "undefined") {
    return createInitialState(roomCode);
  }
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + roomCode);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // fallback
    }
  }
  return createInitialState(roomCode);
}

const localSubscribersMap = new Map<string, Set<(state: QuizState) => void>>();

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

function saveLocalState(roomCode: string, state: QuizState, broadcast = false) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + roomCode, JSON.stringify(state));
  notifyLocalSubscribers(roomCode, state);
  if (broadcast) {
    const ch = getBroadcastChannel(roomCode);
    if (ch) {
      ch.postMessage({ type: "STATE_UPDATE", state });
    }
  }
}

function getBroadcastChannel(roomCode: string): BroadcastChannel | null {
  if (typeof window === "undefined" || !("BroadcastChannel" in window)) return null;
  if (!channelMap.has(roomCode)) {
    channelMap.set(roomCode, new BroadcastChannel("quiz_sync_" + roomCode));
  }
  return channelMap.get(roomCode) || null;
}

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
  };
}

// 1. Subscribe to Live Quiz State (Firebase WebSockets OR Built-in Vercel API Polling)
export function subscribeToQuizState(
  roomCode: string,
  onUpdate: (state: QuizState) => void
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

  // Mode B: Built-in Next.js Serverless API Polling (Zero setup required!)
  let active = true;
  let lastKnownState: QuizState | null = null;

  function areStatesEqual(prev: QuizState | null, next: QuizState): boolean {
    if (!prev) return false;
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

  if (!localSubscribersMap.has(roomCode)) {
    localSubscribersMap.set(roomCode, new Set());
  }
  localSubscribersMap.get(roomCode)!.add(onUpdate);

  const fetchApiState = async () => {
    try {
      const res = await fetch(`/api/quiz?room=${encodeURIComponent(roomCode)}`);
      if (res.ok && active) {
        const data: QuizState = await res.json();

        // In lobby: guarantee no players belonging to this reset are dropped due to race conditions
        if (
          lastKnownState &&
          data.status === "lobby" &&
          (data.resetId || 1) === (lastKnownState.resetId || 1)
        ) {
          data.players = {
            ...(lastKnownState.players || {}),
            ...(data.players || {}),
          };
        }

        if (areStatesEqual(lastKnownState, data)) {
          return;
        }

        lastKnownState = data;
        saveLocalState(roomCode, data, false);
        onUpdate(data);
      }
    } catch {
      // Fallback to local state if offline
      if (active) {
        const local = getLocalState(roomCode);
        if (!areStatesEqual(lastKnownState, local)) {
          lastKnownState = local;
          onUpdate(local);
        }
      }
    }
  };

  // Immediate fetch
  fetchApiState();

  // Poll every 1000ms for smooth live updates across all phones
  const pollInterval = setInterval(fetchApiState, 1000);

  // Also listen for immediate tab-to-tab broadcast on the same device
  const channel = getBroadcastChannel(roomCode);
  const handleMessage = (e: MessageEvent) => {
    if (e.data && e.data.type === "STATE_UPDATE" && e.data.state && active) {
      const state = e.data.state as QuizState;
      if (!areStatesEqual(lastKnownState, state)) {
        lastKnownState = state;
        onUpdate(state);
      }
    }
  };

  if (channel) {
    channel.addEventListener("message", handleMessage);
  }

  return () => {
    active = false;
    localSubscribersMap.get(roomCode)?.delete(onUpdate);
    clearInterval(pollInterval);
    if (channel) {
      channel.removeEventListener("message", handleMessage);
    }
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
      saveLocalState(roomCode, json, true);
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

  // Use Built-in API
  return await sendApiAction(roomCode, "join", { player });
}

// 2b. Player leaves / changes profile
export async function leavePlayer(roomCode: string, playerId: string): Promise<void> {
  if (isFirebaseConfigured && db) {
    const playerRef = ref(db, `rooms/${roomCode}/players/${playerId}`);
    await set(playerRef, null);
    return;
  }

  // Use Built-in API
  await sendApiAction(roomCode, "leave", { playerId });
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

  // Use Built-in API
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

  // Use Built-in API
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

  // Use Built-in API
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

  // Use Built-in API
  await sendApiAction(roomCode, "reset");
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
