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
  try {
    if (fs.existsSync(p)) {
      const raw = fs.readFileSync(p, "utf-8");
      if (raw && raw.trim().length > 0) {
        return JSON.parse(raw);
      }
    }
  } catch {
    // Ignore, memory is authoritative
  }
  return {};
}

function writeRoomsToDisk(data: Record<string, QuizState>) {
  try {
    const p = getCacheFilePath();
    const dir = path.dirname(p);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const tempFile = p + ".tmp." + process.pid + "." + Math.random().toString(36).substring(2, 8);
    fs.writeFileSync(tempFile, JSON.stringify(data), "utf-8");
    fs.renameSync(tempFile, p);
  } catch {
    // Memory remains single source of truth
  }
}

function getOrCreateRoom(roomCode = "sigurnost", activePlayerId?: string | null): QuizState {
  // If not yet in memory, load from disk once on startup
  if (!rooms[roomCode]) {
    const disk = readRoomsFromDisk();
    if (disk[roomCode]) {
      rooms[roomCode] = disk[roomCode];
    } else {
      rooms[roomCode] = {
        status: "lobby",
        currentQuestionIndex: 0,
        questionStartTime: 0,
        durationSeconds: 20,
        roomCode,
        resetId: 1,
        updatedAt: Date.now(),
        players: {},
      };
      writeRoomsToDisk(rooms);
    }
  }

  const state = rooms[roomCode];
  const now = Date.now();

  // If this request is from an active player, refresh their lastSeen right away in memory!
  if (activePlayerId && state.players?.[activePlayerId]) {
    state.players[activePlayerId].lastSeen = now;
  }

  // Prune only truly inactive / abandoned connections in lobby (no poll for > 60s)
  if (state.status === "lobby" && state.players) {
    let pruned = false;
    for (const [id, p] of Object.entries(state.players)) {
      if (activePlayerId && id === activePlayerId) continue;
      const lastActive = p.lastSeen || p.joinedAt || now;
      if (now - lastActive > 60000) {
        delete state.players[id];
        pruned = true;
      }
    }
    if (pruned) {
      writeRoomsToDisk(rooms);
    }
  }

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

// GET /api/quiz?room=sigurnost&player=...
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const roomCode = searchParams.get("room") || "sigurnost";
  const playerId = searchParams.get("player");
  const state = getOrCreateRoom(roomCode, playerId);

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
    const targetPlayerId = action === "join" ? data?.player?.id : action === "leave" ? data?.playerId : undefined;
    const state = getOrCreateRoom(room, targetPlayerId);
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
          lastSeen: now,
          joinedAt: existing?.joinedAt || now,
          resetId: currentResetId,
        };
        state.updatedAt = now;
        rooms[room] = state;
        writeRoomsToDisk(rooms);
        break;
      }

      case "leave": {
        const playerId = data?.playerId;
        if (playerId) {
          if (state.players && state.players[playerId]) {
            delete state.players[playerId];
          }
          if (rooms[room]?.players?.[playerId]) {
            delete rooms[room].players[playerId];
          }
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
