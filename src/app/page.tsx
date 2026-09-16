"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { AvatarPicker } from "@/components/AvatarPicker";
import { QuestionCard } from "@/components/QuestionCard";
import { Leaderboard } from "@/components/Leaderboard";
import { AVATARS, AvatarOption } from "@/data/avatars";
import { QUIZ_QUESTIONS } from "@/data/questions";
import {
  DEFAULT_ROOM_CODE,
  subscribeToQuizState,
  joinPlayer,
  leavePlayer,
  submitAnswer,
  createInitialState,
} from "@/lib/quizSync";
import { QuizState, Player } from "@/types/quiz";
import { Shield, Sparkles, Users, Lock, ArrowRight, Hourglass, LogOut } from "lucide-react";
import { playStartFanfare } from "@/lib/sounds";

export default function StudentHomePage() {
  const [quizState, setQuizState] = useState<QuizState>(createInitialState());
  const [player, setPlayer] = useState<Player | null>(null);
  const [name, setName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarOption>(AVATARS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdownNum, setCountdownNum] = useState<number | null>(null);

  // 1. Subscribe to quiz room state
  useEffect(() => {
    const unsubscribe = subscribeToQuizState(DEFAULT_ROOM_CODE, (state) => {
      setQuizState(state);
    });
    return () => unsubscribe();
  }, []);

  // 2. Restore saved player from localStorage only if valid in active room
  useEffect(() => {
    const savedPlayer = localStorage.getItem("sergej_quiz_player");
    if (!savedPlayer) return;

    try {
      const parsed: Player = JSON.parse(savedPlayer);
      if (quizState.players) {
        const isInPlayers = Boolean(quizState.players[parsed.id]);
        const wasReset = Boolean(quizState.resetAt && parsed.joinedAt && parsed.joinedAt < quizState.resetAt);

        if (isInPlayers && !wasReset && quizState.status !== "finished") {
          setPlayer(parsed);
        } else if (!isInPlayers || wasReset) {
          localStorage.removeItem("sergej_quiz_player");
          setPlayer(null);
        }
      } else {
        setPlayer(parsed);
      }
    } catch {
      localStorage.removeItem("sergej_quiz_player");
      setPlayer(null);
    }
  }, [quizState.players, quizState.resetAt, quizState.status]);

  // 3. Auto-logout on reset: When admin resets quiz, return all players to avatar & name selection
  useEffect(() => {
    if (player) {
      const isInPlayers = Boolean(quizState.players && quizState.players[player.id]);
      const wasReset = Boolean(quizState.resetAt && player.joinedAt && player.joinedAt < quizState.resetAt);

      if (quizState.status === "lobby" && (!isInPlayers || wasReset)) {
        setPlayer(null);
        localStorage.removeItem("sergej_quiz_player");
      }
    }
  }, [quizState.status, quizState.players, quizState.resetAt, player]);

  // 4. Keep local player score/state updated with server state
  useEffect(() => {
    if (player && quizState.players && quizState.players[player.id]) {
      const serverPlayer = quizState.players[player.id];
      setPlayer((prev) => (prev ? { ...prev, ...serverPlayer } : serverPlayer));
    }
  }, [quizState.players, player?.id]);

  // 4. Handle countdown animation
  useEffect(() => {
    if (quizState.status === "countdown" && quizState.countdownStartTime) {
      playStartFanfare();
      const interval = setInterval(() => {
        const elapsed = Date.now() - (quizState.countdownStartTime || 0);
        const remaining = Math.max(0, 3 - Math.floor(elapsed / 1000));
        setCountdownNum(remaining);
        if (remaining <= 0) {
          clearInterval(interval);
        }
      }, 200);
      return () => clearInterval(interval);
    } else {
      setCountdownNum(null);
    }
  }, [quizState.status, quizState.countdownStartTime]);

  // Join quiz handler
  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    const playerId = "p_" + Math.random().toString(36).substring(2, 9);
    const newPlayer: Player = {
      id: playerId,
      name: name.trim(),
      avatar: selectedAvatar.emoji,
      score: 0,
      totalTimeMs: 0,
      joinedAt: Date.now(),
      answers: {},
    };

    try {
      await joinPlayer(DEFAULT_ROOM_CODE, newPlayer);
      localStorage.setItem("sergej_quiz_player", JSON.stringify(newPlayer));
      setPlayer(newPlayer);
    } catch (err) {
      console.error("Greška pri prijavi:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit question answer
  const handleAnswerQuestion = async (selectedIndex: number, timeTakenMs: number) => {
    if (!player) return;
    try {
      await submitAnswer(
        DEFAULT_ROOM_CODE,
        player.id,
        quizState.currentQuestionIndex,
        selectedIndex,
        timeTakenMs
      );
    } catch (err) {
      console.error("Greška pri slanju odgovora:", err);
    }
  };

  const handleLogout = async () => {
    if (player) {
      const oldId = player.id;
      setPlayer(null);
      localStorage.removeItem("sergej_quiz_player");
      try {
        await leavePlayer(DEFAULT_ROOM_CODE, oldId);
      } catch (err) {
        console.warn("Greška pri odjavi starog profila:", err);
      }
    } else {
      localStorage.removeItem("sergej_quiz_player");
      setPlayer(null);
    }
  };

  // Determine current question player answer status
  const currentAnswer = player?.answers?.[quizState.currentQuestionIndex];
  const hasAnsweredCurrent = Boolean(currentAnswer);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        {/* ================= STATE 1: NOT JOINED YET ================= */}
        {!player && quizState.status !== "finished" && (
          <div className="w-full max-w-md mx-auto my-auto py-2 sm:py-6">
            {/* Header / Hero */}
            <div className="text-center mb-5 sm:mb-7">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/70 text-cyan-400 border border-cyan-800/50 text-xs sm:text-sm font-bold uppercase tracking-wider mb-2.5 sm:mb-3">
                <Shield className="w-4 h-4" />
                Sajber Bezbjednost • Edukativni Kviz
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
                Sigurnost na Internetu
              </h1>
              <p className="text-slate-300 text-sm sm:text-base mt-2 font-medium">
                Interaktivni izazov znanja • Pripremi se i testiraj svoje vještine!
              </p>
            </div>

            {/* Join Form Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-8 shadow-2xl backdrop-blur-xl">
              <form onSubmit={handleJoin} className="flex flex-col gap-5">
                {/* Avatar Picker */}
                <AvatarPicker
                  selectedAvatarId={selectedAvatar.id}
                  onSelectAvatar={(av) => setSelectedAvatar(av)}
                />

                {/* Name Input */}
                <div>
                  <label className="block text-sm sm:text-base font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Tvoje ime ili nadimak:
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={25}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="npr. Marko, Ana P., Nikola..."
                    className="w-full px-5 py-4 rounded-2xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-lg sm:text-xl font-bold"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !name.trim()}
                  className="w-full mt-2 py-4 sm:py-5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xl sm:text-2xl shadow-xl shadow-cyan-500/25 transition-all duration-200 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  <span>{isSubmitting ? "Prijava u toku..." : "Pridruži se kvizu"}</span>
                  <ArrowRight className="w-6 h-6 stroke-[3]" />
                </button>
              </form>

              <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-center gap-2 text-sm text-slate-300 font-medium">
                <Lock className="w-4 h-4 text-cyan-400" />
                <span>14 pitanja • 20 sekundi po pitanju • Sinhronizovano</span>
              </div>
            </div>
          </div>
        )}

        {/* ================= STATE 2: WAITING IN LOBBY ================= */}
        {player && quizState.status === "lobby" && (
          <div className="w-full max-w-lg mx-auto text-center py-8 px-4">
            <div className="relative inline-block mb-4">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-6xl sm:text-7xl shadow-2xl ring-4 ring-cyan-400/40 animate-pulse">
                {player.avatar}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-slate-950 p-2 rounded-full shadow">
                <Sparkles className="w-5 h-5 stroke-[2.5]" />
              </div>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Dobrodošao/la, <span className="text-cyan-400">{player.name}</span>!
            </h2>
            <p className="text-slate-300 text-base sm:text-lg mt-2 font-medium max-w-sm mx-auto">
              Uspješno si prijavljen/a. Čekamo Sergeja da označi početak kviza sa projektora!
            </p>

            {/* Waiting indicator */}
            <div className="my-6 inline-flex items-center gap-3 px-6 py-3.5 rounded-full bg-slate-800/90 border border-slate-700 text-cyan-300 font-bold text-base sm:text-lg animate-pulse shadow-lg">
              <Hourglass className="w-5 h-5 animate-spin text-cyan-400" />
              <span>Čekamo početak kviza...</span>
            </div>

            {/* Change Avatar / Name Button */}
            <div className="mb-5">
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 border border-slate-700 text-sm font-bold transition-all active:scale-95 shadow-sm"
              >
                <LogOut className="w-4 h-4" />
                <span>Promijeni ime ili avatar</span>
              </button>
            </div>

            {/* Classmates connected */}
            <div className="mt-4 p-5 bg-slate-900/80 rounded-3xl border border-slate-800">
              <div className="flex items-center justify-between mb-3 text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-cyan-400" />
                  <span>Prijavljeni drugari ({Object.keys(quizState.players || {}).length})</span>
                </div>
                <span className="text-emerald-400">Spremni za igru</span>
              </div>

              <div className="flex flex-wrap gap-2 justify-center max-h-48 overflow-y-auto p-1">
                {Object.values(quizState.players || {}).map((p) => (
                  <div
                    key={p.id}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold ${
                      p.id === player.id
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                        : "bg-slate-800 text-slate-200 border border-slate-700/60"
                    }`}
                  >
                    <span className="text-base">{p.avatar}</span>
                    <span className="truncate max-w-[100px]">{p.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= STATE 3: 3..2..1 COUNTDOWN ================= */}
        {quizState.status === "countdown" && (
          <div className="flex flex-col items-center justify-center text-center py-16 animate-in zoom-in-75 duration-300">
            <span className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-4">
              Kviz počinje za
            </span>
            <div className="w-36 h-36 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-7xl font-black text-white shadow-2xl ring-8 ring-cyan-400/30 animate-bounce">
              {countdownNum ?? 3}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-6">Spremite se! 🚀</h2>
            <p className="text-slate-300 text-sm sm:text-base font-medium mt-2">20 sekundi po pitanju • Srećno svima!</p>
          </div>
        )}

        {/* ================= STATE 4: LIVE QUESTION ================= */}
        {quizState.status === "question" && (
          <QuestionCard
            key={quizState.currentQuestionIndex}
            question={QUIZ_QUESTIONS[quizState.currentQuestionIndex]}
            questionIndex={quizState.currentQuestionIndex}
            totalQuestions={QUIZ_QUESTIONS.length}
            questionStartTime={quizState.questionStartTime}
            durationSeconds={quizState.durationSeconds || 20}
            hasAnswered={hasAnsweredCurrent}
            selectedOptionIndex={currentAnswer?.selectedIndex}
            isCorrect={currentAnswer?.isCorrect}
            onSelectOption={handleAnswerQuestion}
          />
        )}

        {/* ================= STATE 5: FINISHED / LEADERBOARD ================= */}
        {quizState.status === "finished" && (
          <Leaderboard players={quizState.players || {}} />
        )}
      </main>
    </div>
  );
}
