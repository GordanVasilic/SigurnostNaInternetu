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
  const p = getCacheFilePath();
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      if (fs.existsSync(p)) {
        const raw = fs.readFileSync(p, "utf-8");
        if (raw && raw.trim().length > 0) {
          return JSON.parse(raw);
        }
      }
      return {};
    } catch {
      // Small pause if file was locked by another process on Windows
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 10);
    }
  }
  // Fallback to existing memory cache if disk is temporarily locked
  return rooms || {};
}

function writeRoomsToDisk(data: Record<string, QuizState>) {
  const p = getCacheFilePath();
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      fs.writeFileSync(p, JSON.stringify(data));
      return;
    } catch {
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 10);
    }
  }
}

function getOrCreateRoom(roomCode = "sigurnost"): QuizState {
  const diskRooms = readRoomsFromDisk();
  const diskRoom = diskRooms[roomCode];
  const memRoom = rooms[roomCode];

  let state: QuizState;

  if (!memRoom && !diskRoom) {
    state = {
      status: "lobby",
      currentQuestionIndex: 0,
      questionStartTime: 0,
      durationSeconds: 20,
      roomCode,
      resetId: 1,
      updatedAt: Date.now(),
      players: {},
    };
    rooms[roomCode] = state;
    writeRoomsToDisk(rooms);
    return state;
  }

  if (!memRoom && diskRoom) {
    rooms[roomCode] = diskRoom;
    state = diskRoom;
  } else if (memRoom && !diskRoom) {
    state = memRoom;
  } else {
    // Both memory and disk exist: reconcile safely
    const diskReset = diskRoom.resetId || 1;
    const memReset = memRoom!.resetId || 1;

    if (diskReset > memReset) {
      rooms[roomCode] = diskRoom;
      state = diskRoom;
    } else if (memReset > diskReset) {
      state = memRoom!;
    } else {
      // Same resetId: merge players so none are lost between processes/workers!
      const activeReset = diskReset;
      const base = (diskRoom.updatedAt || 0) >= (memRoom!.updatedAt || 0) ? diskRoom : memRoom!;

      const mergedPlayers: Record<string, Player> = {};

      for (const [id, p] of Object.entries(diskRoom.players || {})) {
        if (!p.resetId || p.resetId === activeReset) {
          mergedPlayers[id] = p;
        }
      }

      for (const [id, p] of Object.entries(memRoom!.players || {})) {
        if (!p.resetId || p.resetId === activeReset) {
          if (!mergedPlayers[id] || (p.score || 0) >= (mergedPlayers[id].score || 0)) {
            mergedPlayers[id] = p;
          }
        }
      }

      state = {
        ...base,
        players: mergedPlayers,
        resetId: activeReset,
      };
      rooms[roomCode] = state;
    }
  }

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

  // 2. Auto-transition from question to next question after 24.5s (20s answering + 4.5s reveal)
  if (state.status === "question" && state.questionStartTime) {
    const elapsed = now - state.questionStartTime;
    if (elapsed >= 24500) {
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
        const currentResetId = state.resetId || 1;
        player.resetId = currentResetId;

        const existing = state.players[player.id];
        state.players[player.id] = {
          ...(existing || {}),
          ...player,
          resetId: currentResetId,
        };
        state.updatedAt = now;
        rooms[room] = state;
        writeRoomsToDisk(rooms);
        break;
      }

      case "leave": {
        const playerId = data?.playerId;
        if (playerId && state.players && state.players[playerId]) {
          delete state.players[playerId];
          state.updatedAt = now;
          rooms[room] = state;
          writeRoomsToDisk(rooms);
        }
        break;
      }

      case "start_countdown": {
        state.status = "countdown";
        state.countdownStartTime = now;
        state.updatedAt = now;
        rooms[room] = state;
        writeRoomsToDisk(rooms);
        break;
      }

      case "set_question": {
        state.status = "question";
        state.currentQuestionIndex = data.questionIndex;
        state.questionStartTime = now;
        state.updatedAt = now;
        rooms[room] = state;
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
            rooms[room] = state;
            writeRoomsToDisk(rooms);
          }
        }
        return NextResponse.json({ success: true, isCorrect });
      }

      case "finish": {
        state.status = "finished";
        state.updatedAt = now;
        rooms[room] = state;
        writeRoomsToDisk(rooms);
        break;
      }

      case "reset": {
        const newResetId = (state.resetId || 1) + 1;
        state.status = "lobby";
        state.currentQuestionIndex = 0;
        state.questionStartTime = 0;
        state.countdownStartTime = undefined;
        state.players = {}; // Always clear players on reset so everyone re-joins fresh
        state.resetAt = now;
        state.resetId = newResetId;
        state.updatedAt = now;
        rooms[room] = state;
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
