export interface PlayerAnswer {
  questionIndex: number;
  selectedIndex: number;
  isCorrect: boolean;
  timeTakenMs: number;
  submittedAt: number;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  score: number;
  totalTimeMs: number;
  joinedAt: number;
  resetId?: number;
  answers?: Record<string, PlayerAnswer>;
}

export type QuizStatus = "lobby" | "countdown" | "question" | "finished";

export interface QuizState {
  status: QuizStatus;
  currentQuestionIndex: number;
  questionStartTime: number; // epoch timestamp ms
  countdownStartTime?: number; // epoch timestamp ms for 3..2..1 start
  durationSeconds: number; // 20 seconds
  roomCode: string;
  updatedAt: number;
  resetAt?: number;
  resetId?: number;
  players?: Record<string, Player>;
}

export interface QuestionStat {
  questionId: number;
  questionText: string;
  totalAnswered: number;
  correctCount: number;
  incorrectCount: number;
  correctPercentage: number;
  optionCounts: [number, number, number];
  averageTimeMs: number;
}
