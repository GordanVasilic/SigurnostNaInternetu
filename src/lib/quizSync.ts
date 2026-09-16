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

function saveLocalState(roomCode: string, state: QuizState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + roomCode, JSON.stringify(state));
  const ch = getBroadcastChannel(roomCode);
  if (ch) {
    ch.postMessage({ type: "STATE_UPDATE", state });
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
    durationSeconds: 15,
    roomCode,
    updatedAt: Date.now(),
    players: {},
  };
}

// 1. Subscribe to Live Quiz State
export function subscribeToQuizState(
  roomCode: string,
  onUpdate: (state: QuizState) => void
): () => void {
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

  // Fallback: Local BroadcastChannel + LocalStorage
  onUpdate(getLocalState(roomCode));

  const channel = getBroadcastChannel(roomCode);
  const handleMessage = (e: MessageEvent) => {
    if (e.data && e.data.type === "STATE_UPDATE" && e.data.state) {
      onUpdate(e.data.state);
    }
  };

  const handleStorage = (e: StorageEvent) => {
    if (e.key === LOCAL_STORAGE_KEY_PREFIX + roomCode && e.newValue) {
      try {
        onUpdate(JSON.parse(e.newValue));
      } catch {
        // ignore
      }
    }
  };

  if (channel) {
    channel.addEventListener("message", handleMessage);
  }
  window.addEventListener("storage", handleStorage);

  return () => {
    if (channel) {
      channel.removeEventListener("message", handleMessage);
    }
    window.removeEventListener("storage", handleStorage);
  };
}

// 2. Player joins
export async function joinPlayer(roomCode: string, player: Player): Promise<void> {
  if (isFirebaseConfigured && db) {
    const playerRef = ref(db, `rooms/${roomCode}/players/${player.id}`);
    await set(playerRef, player);
    return;
  }

  const state = getLocalState(roomCode);
  const players = state.players || {};
  players[player.id] = player;
  const newState: QuizState = {
    ...state,
    players,
    updatedAt: Date.now(),
  };
  saveLocalState(roomCode, newState);
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

  const state = getLocalState(roomCode);
  const newState: QuizState = {
    ...state,
    status: "countdown",
    countdownStartTime: now,
    updatedAt: now,
  };
  saveLocalState(roomCode, newState);
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

  const state = getLocalState(roomCode);
  const newState: QuizState = {
    ...state,
    status: "question",
    currentQuestionIndex: questionIndex,
    questionStartTime: now,
    updatedAt: now,
  };
  saveLocalState(roomCode, newState);
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

  const state = getLocalState(roomCode);
  const newState: QuizState = {
    ...state,
    status: "finished",
    updatedAt: now,
  };
  saveLocalState(roomCode, newState);
}

// 6. Reset Quiz to lobby
export async function resetQuiz(roomCode: string, keepPlayers = false): Promise<void> {
  const now = Date.now();
  const resetData: Partial<QuizState> = {
    status: "lobby",
    currentQuestionIndex: 0,
    questionStartTime: 0,
    updatedAt: now,
  };

  if (!keepPlayers) {
    resetData.players = {};
  } else {
    // Reset players' scores & answers
    const current = isFirebaseConfigured && db
      ? (await get(ref(db, `rooms/${roomCode}`))).val()
      : getLocalState(roomCode);
    if (current && current.players) {
      const resetPlayers: Record<string, Player> = {};
      Object.keys(current.players).forEach((id) => {
        const p = current.players[id];
        resetPlayers[id] = {
          ...p,
          score: 0,
          totalTimeMs: 0,
          answers: {},
        };
      });
      resetData.players = resetPlayers;
    }
  }

  if (isFirebaseConfigured && db) {
    const roomRef = ref(db, `rooms/${roomCode}`);
    await update(roomRef, resetData);
    return;
  }

  const state = getLocalState(roomCode);
  const newState: QuizState = {
    ...state,
    ...resetData,
  };
  saveLocalState(roomCode, newState);
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
      
      // Avoid duplicate scoring if already answered this question
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

  // Local fallback
  const state = getLocalState(roomCode);
  const player = state.players?.[playerId];
  if (player) {
    const answers = player.answers || {};
    if (!answers[questionIndex]) {
      answers[questionIndex] = answer;
      player.answers = answers;
      if (isCorrect) player.score += 1;
      player.totalTimeMs = (player.totalTimeMs || 0) + timeTakenMs;
      state.players![playerId] = player;
      saveLocalState(roomCode, state);
    }
  }

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

    const correctPercentage = answeredCount > 0 
      ? Math.round((correctCount / answeredCount) * 100) 
      : 0;
    const averageTimeMs = answeredCount > 0 
      ? Math.round(totalTime / answeredCount) 
      : 0;

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
