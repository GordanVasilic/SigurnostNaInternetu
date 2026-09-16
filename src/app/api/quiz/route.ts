import { NextRequest, NextResponse } from "next/server";
import { QuizState, Player, PlayerAnswer } from "@/types/quiz";
import { QUIZ_QUESTIONS } from "@/data/questions";
import fs from "fs";
import path from "path";

// Global in-memory storage + file persistence for Vercel and local dev
declare global {
  // eslint-disable-next-line no-var
  var __QUIZ_ROOMS__: Record<string, QuizState> | undefined;
}

if (!globalThis.__QUIZ_ROOMS__) {
  globalThis.__QUIZ_ROOMS__ = {};
}

const rooms = globalThis.__QUIZ_ROOMS__;

function getCacheFilePath(): string {
  const isVercel = Boolean(process.env.VERCEL);
  return isVercel ? "/tmp/quiz-rooms.json" : path.join(process.cwd(), ".quiz-rooms.json");
}

function readRoomsFromDisk(): Record<string, QuizState> {
  try {
    const p = getCacheFilePath();
    if (fs.existsSync(p)) {
      const raw = fs.readFileSync(p, "utf-8");
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }
  return {};
}

function writeRoomsToDisk(data: Record<string, QuizState>) {
  try {
    const p = getCacheFilePath();
    fs.writeFileSync(p, JSON.stringify(data));
  } catch {
    // fallback
  }
}

function getOrCreateRoom(roomCode = "sigurnost"): QuizState {
  const diskRooms = readRoomsFromDisk();
  if (diskRooms[roomCode]) {
    rooms[roomCode] = diskRooms[roomCode];
  }

  if (!rooms[roomCode]) {
    rooms[roomCode] = {
      status: "lobby",
      currentQuestionIndex: 0,
      questionStartTime: 0,
      durationSeconds: 15,
      roomCode,
      updatedAt: Date.now(),
      players: {},
    };
    writeRoomsToDisk(rooms);
  }

  const state = rooms[roomCode];
  const now = Date.now();

  // 1. Auto-transition from countdown (3.5s) to Question 0
  if (state.status === "countdown" && state.countdownStartTime) {
    if (now - state.countdownStartTime >= 3500) {
      state.status = "question";
      state.currentQuestionIndex = 0;
      state.questionStartTime = now;
      state.updatedAt = now;
      writeRoomsToDisk(rooms);
    }
  }

  // 2. Auto-transition from question to next question after 15.5s (Guarantees flow even if user doesn't answer)
  if (state.status === "question" && state.questionStartTime) {
    const elapsed = now - state.questionStartTime;
    if (elapsed >= 15500) {
      const nextIdx = state.currentQuestionIndex + 1;
      if (nextIdx < QUIZ_QUESTIONS.length) {
        state.currentQuestionIndex = nextIdx;
        state.questionStartTime = now;
        state.updatedAt = now;
      } else {
        state.status = "finished";
        state.updatedAt = now;
      }
      writeRoomsToDisk(rooms);
    }
  }

  return state;
}

// GET /api/quiz?room=sigurnost
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const roomCode = searchParams.get("room") || "sigurnost";
  const state = getOrCreateRoom(roomCode);

  return NextResponse.json(state, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    },
  });
}

// POST /api/quiz
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { room = "sigurnost", action, data } = body;
    const state = getOrCreateRoom(room);
    const now = Date.now();

    switch (action) {
      case "join": {
        const player: Player = data.player;
        if (!state.players) state.players = {};
        state.players[player.id] = player;
        state.updatedAt = now;
        writeRoomsToDisk(rooms);
        break;
      }

      case "leave": {
        const playerId = data?.playerId;
        if (playerId && state.players && state.players[playerId]) {
          delete state.players[playerId];
          state.updatedAt = now;
          writeRoomsToDisk(rooms);
        }
        break;
      }

      case "start_countdown": {
        state.status = "countdown";
        state.countdownStartTime = now;
        state.updatedAt = now;
        writeRoomsToDisk(rooms);
        break;
      }

      case "set_question": {
        state.status = "question";
        state.currentQuestionIndex = data.questionIndex;
        state.questionStartTime = now;
        state.updatedAt = now;
        writeRoomsToDisk(rooms);
        break;
      }

      case "answer": {
        const { playerId, questionIndex, selectedIndex, timeTakenMs } = data;
        const currentQ = QUIZ_QUESTIONS[questionIndex];
        const isCorrect = selectedIndex >= 0 && currentQ ? currentQ.correctIndex === selectedIndex : false;

        const player = state.players?.[playerId];
        if (player) {
          if (!player.answers) player.answers = {};
          if (!player.answers[questionIndex]) {
            const answer: PlayerAnswer = {
              questionIndex,
              selectedIndex,
              isCorrect,
              timeTakenMs,
              submittedAt: now,
            };
            player.answers[questionIndex] = answer;
            if (isCorrect) player.score += 1;
            player.totalTimeMs = (player.totalTimeMs || 0) + timeTakenMs;
            state.players![playerId] = player;
            state.updatedAt = now;
            writeRoomsToDisk(rooms);
          }
        }
        return NextResponse.json({ success: true, isCorrect });
      }

      case "finish": {
        state.status = "finished";
        state.updatedAt = now;
        writeRoomsToDisk(rooms);
        break;
      }

      case "reset": {
        const keepPlayers = Boolean(data?.keepPlayers);
        state.status = "lobby";
        state.currentQuestionIndex = 0;
        state.questionStartTime = 0;
        state.countdownStartTime = undefined;
        state.updatedAt = now;

        if (!keepPlayers) {
          state.players = {};
        } else if (state.players) {
          Object.keys(state.players).forEach((id) => {
            const p = state.players![id];
            state.players![id] = {
              ...p,
              score: 0,
              totalTimeMs: 0,
              answers: {},
            };
          });
        }
        writeRoomsToDisk(rooms);
        break;
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    return NextResponse.json(state);
  } catch (err) {
    console.error("Greška u /api/quiz:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
