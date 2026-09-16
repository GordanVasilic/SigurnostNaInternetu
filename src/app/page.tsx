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
  submitAnswer,
  createInitialState,
} from "@/lib/quizSync";
import { QuizState, Player } from "@/types/quiz";
import { Shield, Sparkles, Users, Lock, ArrowRight, Hourglass } from "lucide-react";
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

  // 2. Restore saved player from localStorage if any
  useEffect(() => {
    const savedPlayer = localStorage.getItem("sergej_quiz_player");
    if (savedPlayer) {
      try {
        const parsed: Player = JSON.parse(savedPlayer);
        setPlayer(parsed);
      } catch {
        // ignore
      }
    }
  }, []);

  // 3. Keep local player score/state updated with server state
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

  // Determine current question player answer status
  const currentAnswer = player?.answers?.[quizState.currentQuestionIndex];
  const hasAnsweredCurrent = Boolean(currentAnswer);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        {/* ================= STATE 1: NOT JOINED YET ================= */}
        {!player && quizState.status !== "finished" && (
          <div className="w-full max-w-md mx-auto my-auto py-6">
            {/* Header / Hero */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-950/70 text-cyan-400 border border-cyan-800/50 text-xs font-bold uppercase tracking-wider mb-3">
                <Shield className="w-3.5 h-3.5" />
                OŠ Petar Petrović Njegoš • Banja Luka
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                Sigurnost na Internetu
              </h1>
              <p className="text-slate-400 text-sm mt-1.5">
                Školski kviz za 9. razred • Pripremi se i pokaži znanje!
              </p>
            </div>

            {/* Join Form Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-xl">
              <form onSubmit={handleJoin} className="flex flex-col gap-5">
                {/* Avatar Picker */}
                <AvatarPicker
                  selectedAvatarId={selectedAvatar.id}
                  onSelectAvatar={(av) => setSelectedAvatar(av)}
                />

                {/* Name Input */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Tvoje ime ili nadimak:
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={25}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="npr. Marko, Ana P., Nikola..."
                    className="w-full px-4 py-3 rounded-2xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-base font-semibold"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !name.trim()}
                  className="w-full mt-2 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-lg shadow-xl shadow-cyan-500/25 transition-all duration-200 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <span>{isSubmitting ? "Prijava u toku..." : "Pridruži se kvizu"}</span>
                  <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                </button>
              </form>

              <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-center gap-2 text-xs text-slate-400">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                <span>14 pitanja • 15 sekundi po pitanju • Sinhronizovano</span>
              </div>
            </div>
          </div>
        )}

        {/* ================= STATE 2: WAITING IN LOBBY ================= */}
        {player && quizState.status === "lobby" && (
          <div className="w-full max-w-lg mx-auto text-center py-10 px-4">
            <div className="relative inline-block mb-4">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-5xl sm:text-6xl shadow-2xl ring-4 ring-cyan-400/40 animate-pulse">
                {player.avatar}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-slate-950 p-1.5 rounded-full shadow">
                <Sparkles className="w-4 h-4 stroke-[2.5]" />
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Dobrodošao/la, <span className="text-cyan-400">{player.name}</span>!
            </h2>
            <p className="text-slate-400 text-sm mt-2 max-w-sm mx-auto">
              Uspješno si prijavljen/a. Čekamo Sergeja da označi početak kviza sa projektora!
            </p>

            {/* Waiting indicator */}
            <div className="my-6 inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-slate-800/80 border border-slate-700 text-cyan-300 font-semibold text-sm animate-pulse">
              <Hourglass className="w-4 h-4 animate-spin text-cyan-400" />
              <span>Čekamo početak kviza...</span>
            </div>

            {/* Classmates connected */}
            <div className="mt-4 p-5 bg-slate-900/80 rounded-3xl border border-slate-800">
              <div className="flex items-center justify-between mb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-cyan-400" />
                  <span>Prijavljeni drugari ({Object.keys(quizState.players || {}).length})</span>
                </div>
                <span className="text-emerald-400">Spremni za igru</span>
              </div>

              <div className="flex flex-wrap gap-2 justify-center max-h-40 overflow-y-auto p-1">
                {Object.values(quizState.players || {}).map((p) => (
                  <div
                    key={p.id}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${
                      p.id === player.id
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                        : "bg-slate-800 text-slate-300 border border-slate-700/50"
                    }`}
                  >
                    <span>{p.avatar}</span>
                    <span className="truncate max-w-[90px]">{p.name}</span>
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
            <h2 className="text-2xl font-bold text-white mt-6">Spremite se! 🚀</h2>
            <p className="text-slate-400 text-xs mt-1">15 sekundi po pitanju • Srećno svima!</p>
          </div>
        )}

        {/* ================= STATE 4: LIVE QUESTION ================= */}
        {quizState.status === "question" && (
          <QuestionCard
            question={QUIZ_QUESTIONS[quizState.currentQuestionIndex]}
            questionIndex={quizState.currentQuestionIndex}
            totalQuestions={QUIZ_QUESTIONS.length}
            questionStartTime={quizState.questionStartTime}
            durationSeconds={quizState.durationSeconds || 15}
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
