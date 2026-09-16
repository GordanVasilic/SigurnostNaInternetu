"use client";

import React, { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { Navbar } from "@/components/Navbar";
import { QRCodeDisplay } from "@/components/QRCodeDisplay";
import { Leaderboard } from "@/components/Leaderboard";
import { FirebaseBanner } from "@/components/FirebaseBanner";
import { QUIZ_QUESTIONS } from "@/data/questions";
import { playStartFanfare, stopAllSounds } from "@/lib/sounds";
import {
  DEFAULT_ROOM_CODE,
  subscribeToQuizState,
  startQuizCountdown,
  setQuestion,
  finishQuiz,
  resetQuiz,
  createInitialState,
} from "@/lib/quizSync";
import { QuizState } from "@/types/quiz";
import {
  Lock,
  Play,
  SkipForward,
  RotateCcw,
  Users,
  CheckCircle,
  HelpCircle,
  BarChart3,
  Clock,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

const DEFAULT_PIN = process.env.NEXT_PUBLIC_ADMIN_PIN || "sergej2024";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [quizState, setQuizState] = useState<QuizState>(createInitialState());
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [adminElapsedMs, setAdminElapsedMs] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Check saved admin session
  useEffect(() => {
    const session = sessionStorage.getItem("sergej_admin_auth");
    if (session === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  // Subscribe to quiz state
  useEffect(() => {
    const unsubscribe = subscribeToQuizState(DEFAULT_ROOM_CODE, (state) => {
      setQuizState(state);
    });
    return () => unsubscribe();
  }, []);

  // Live timer tracker for admin projector view
  useEffect(() => {
    if (quizState.status !== "question" || !quizState.questionStartTime) {
      setAdminElapsedMs(0);
      return;
    }
    const interval = setInterval(() => {
      setAdminElapsedMs(Date.now() - (quizState.questionStartTime || Date.now()));
    }, 200);
    return () => clearInterval(interval);
  }, [quizState.status, quizState.questionStartTime]);

  // Master Quiz Coordinator (Runs on Admin browser which is projected on screen)
  useEffect(() => {
    if (!isAuthenticated) return;

    // 1. If status is countdown, wait 3.5s then start question 0
    if (quizState.status === "countdown") {
      const timer = setTimeout(() => {
        setQuestion(DEFAULT_ROOM_CODE, 0);
      }, 3500);
      return () => clearTimeout(timer);
    }

    // 2. If status is question and autoAdvance is enabled, advance after 24.5s (20s answering + 4.5s reveal)
    if (quizState.status === "question" && autoAdvance) {
      const elapsed = Date.now() - (quizState.questionStartTime || Date.now());
      const remainingMs = Math.max(0, 24500 - elapsed); // 24.5s total buffer

      if (timerRef.current) clearTimeout(timerRef.current);

      timerRef.current = setTimeout(() => {
        const nextIdx = quizState.currentQuestionIndex + 1;
        if (nextIdx < QUIZ_QUESTIONS.length) {
          setQuestion(DEFAULT_ROOM_CODE, nextIdx);
        } else {
          finishQuiz(DEFAULT_ROOM_CODE);
        }
      }, remainingMs);

      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }
  }, [
    isAuthenticated,
    quizState.status,
    quizState.currentQuestionIndex,
    quizState.questionStartTime,
    autoAdvance,
  ]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === DEFAULT_PIN || pinInput === "2024" || pinInput === "sergej") {
      setIsAuthenticated(true);
      sessionStorage.setItem("sergej_admin_auth", "true");
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleStartQuiz = async () => {
    await startQuizCountdown(DEFAULT_ROOM_CODE);
  };

  const handleNextQuestion = async () => {
    const nextIdx = quizState.currentQuestionIndex + 1;
    if (nextIdx < QUIZ_QUESTIONS.length) {
      await setQuestion(DEFAULT_ROOM_CODE, nextIdx);
    } else {
      await finishQuiz(DEFAULT_ROOM_CODE);
    }
  };

  const handleResetQuiz = async () => {
    if (confirm("Da li ste sigurni da želite resetovati kviz i vratiti sve u čekaonicu?")) {
      try {
        confetti.reset();
      } catch {}
      stopAllSounds();
      setQuizState((prev) => ({
        ...prev,
        status: "lobby",
        currentQuestionIndex: 0,
        questionStartTime: 0,
        countdownStartTime: undefined,
      }));
      await resetQuiz(DEFAULT_ROOM_CODE, true); // keep connected players
    }
  };

  const handleFullReset = async () => {
    if (confirm("Da li želite potpuno obrisati sve prijavljene učenike i početi iznova?")) {
      try {
        confetti.reset();
      } catch {}
      stopAllSounds();
      setQuizState((prev) => ({
        ...prev,
        status: "lobby",
        currentQuestionIndex: 0,
        questionStartTime: 0,
        countdownStartTime: undefined,
        players: {},
      }));
      await resetQuiz(DEFAULT_ROOM_CODE, false); // clear players
    }
  };

  // Compute answers progress for current question
  const playersList = Object.values(quizState.players || {});
  const totalPlayers = playersList.length;
  const answeredCount = playersList.filter(
    (p) => p.answers && p.answers[quizState.currentQuestionIndex] !== undefined
  ).length;

  // Render PIN login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        <Navbar showHomeLink={true} />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900/90 border border-slate-800 rounded-3xl p-7 shadow-2xl text-center">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 text-cyan-400 mx-auto flex items-center justify-center mb-4 border border-cyan-500/30">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black text-white">Admin Kontrola</h1>
            <p className="text-slate-400 text-xs mt-1 mb-6">
              Unesite PIN kod za pristup administratorskoj tabli kviza.
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="password"
                autoFocus
                placeholder="Unesite PIN (npr. sergej2024)"
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError(false);
                }}
                className="w-full px-4 py-3 rounded-2xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 text-center text-lg tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />

              {pinError && (
                <p className="text-xs text-rose-400 font-semibold">
                  Pogrešan PIN kod. Pokušajte ponovo.
                </p>
              )}

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-base shadow-lg shadow-cyan-500/20 transition-all active:scale-98"
              >
                Prijavi se kao Sergej / Admin
              </button>
            </form>

            <p className="text-[11px] text-slate-500 mt-4">
              Podrazumijevani PIN: <code className="text-cyan-400 font-mono">sergej2024</code>
            </p>
          </div>
        </main>
      </div>
    );
  }

  const currentQ = QUIZ_QUESTIONS[quizState.currentQuestionIndex];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar showHomeLink={true} />
      <FirebaseBanner />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 flex flex-col">
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-3xl bg-slate-900/80 border border-slate-800 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-black text-white text-lg">
              S
            </div>
            <div>
              <h2 className="font-bold text-base text-white">Admin Panel • Sergej</h2>
              <span className="text-xs text-slate-400">
                Stanje kviza:{" "}
                <span className="text-cyan-400 font-bold uppercase tracking-wider">
                  {quizState.status === "lobby" && "Čekaonica"}
                  {quizState.status === "countdown" && "Odbrojavanje"}
                  {quizState.status === "question" && `Pitanje ${quizState.currentQuestionIndex + 1}/14`}
                  {quizState.status === "finished" && "Kviz Završen"}
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/stats"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 hover:text-white border border-slate-700 transition-colors"
            >
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <span>Statistika</span>
            </Link>

            <button
              onClick={handleResetQuiz}
              title="Vrati sve učenike u čekaonicu"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 hover:text-white border border-slate-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4 text-amber-400" />
              <span>Resetuj Kviz</span>
            </button>
          </div>
        </div>

        {/* ================= ADMIN VIEW: LOBBY ================= */}
        {quizState.status === "lobby" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start flex-1">
            {/* Left: Big QR Code for Projector Screen */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <QRCodeDisplay size={280} />
            </div>

            {/* Right: Connected Students + Start Button */}
            <div className="lg:col-span-7 flex flex-col gap-5 bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-xl font-black text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-cyan-400" />
                    Prijavljeni drugari ({totalPlayers})
                  </h3>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Učenici koji su skenirali QR kod i unijeli ime.
                  </p>
                </div>

                {totalPlayers > 0 && (
                  <button
                    onClick={handleFullReset}
                    className="text-xs text-rose-400 hover:underline"
                  >
                    Isprazni listu
                  </button>
                )}
              </div>

              {/* Connected Players Badges Grid */}
              <div className="min-h-[220px] max-h-[300px] overflow-y-auto p-2 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                {totalPlayers === 0 ? (
                  <div className="h-48 flex flex-col items-center justify-center text-center text-slate-500">
                    <div className="w-12 h-12 rounded-full bg-slate-800/60 flex items-center justify-center mb-2">
                      <HelpCircle className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-sm font-semibold">Još se niko nije prijavio.</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Drugari treba da skeniraju QR kod sa lijeve strane.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {playersList.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/70 border border-slate-700/50 text-white animate-in zoom-in-95 duration-200"
                      >
                        <span className="text-2xl shrink-0">{p.avatar}</span>
                        <span className="font-bold text-xs truncate">{p.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Big START BUTTON */}
              <div className="pt-2">
                <button
                  onClick={handleStartQuiz}
                  disabled={totalPlayers === 0}
                  className="w-full py-5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xl tracking-wide shadow-2xl shadow-emerald-500/25 transition-all duration-200 active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  <Play className="w-6 h-6 fill-current" />
                  <span>POKRENI KVIZ ZA SVE UČENIKE</span>
                </button>
                <p className="text-[12px] text-slate-400 text-center mt-2">
                  Čim kliknete, svim prijavljenim učenicima na telefonima počinje odbrojavanje i prvo pitanje!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ================= ADMIN VIEW: COUNTDOWN ================= */}
        {quizState.status === "countdown" && (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-16">
            <h2 className="text-2xl font-black text-slate-400 uppercase tracking-widest mb-4">
              Kviz započinje...
            </h2>
            <div className="w-40 h-40 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-8xl font-black text-white shadow-2xl ring-8 ring-cyan-400/40 animate-pulse">
              3
            </div>
            <p className="text-slate-300 text-lg font-bold mt-6">
              Svim učenicima se sinhronizovano učitava pitanje 1!
            </p>
          </div>
        )}

        {/* ================= ADMIN VIEW: LIVE QUESTION ================= */}
        {quizState.status === "question" && currentQ && (
          <div className="flex-1 flex flex-col gap-6">
            {/* Question Header & Live Progress */}
            <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-2xl">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="px-3.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-black text-sm">
                    Pitanje {quizState.currentQuestionIndex + 1} / {QUIZ_QUESTIONS.length}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold px-3 py-1 rounded-full bg-slate-800">
                    Kategorija: {currentQ.category}
                  </span>
                </div>

                {/* Timer & Answers Counter */}
                <div className="flex items-center gap-3">
                  <div
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-bold ${
                      adminElapsedMs >= 20000
                        ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
                        : Math.max(0, Math.ceil((20000 - adminElapsedMs) / 1000)) <= 5
                        ? "bg-rose-950/60 border-rose-500/40 text-rose-300 animate-pulse"
                        : "bg-slate-800 border-slate-700 text-cyan-300"
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    <span>
                      {adminElapsedMs >= 20000
                        ? "Tačan odgovor otkriven ✓"
                        : `Vrijeme: ${Math.max(0, Math.ceil((20000 - adminElapsedMs) / 1000))}s`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-sm font-bold text-white">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>
                      Odgovorilo:{" "}
                      <strong className="text-cyan-400 font-black">{answeredCount}</strong> / {totalPlayers}
                    </span>
                  </div>
                </div>
              </div>

              {/* Question Text */}
              <h1 className="text-2xl sm:text-3xl font-black text-white text-center py-4 leading-relaxed">
                {currentQ.question}
              </h1>

              {/* 3 Options display on Projector (Neutral while answering, revealed after 20s) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                {currentQ.options.map((opt, i) => {
                  const letters = ["A", "B", "C"];
                  const isCorrectAnswer = i === currentQ.correctIndex;
                  const isRevealed = adminElapsedMs >= 20000;
                  return (
                    <div
                      key={i}
                      className={`p-4 rounded-2xl flex items-start gap-3 transition-all duration-300 ${
                        isRevealed && isCorrectAnswer
                          ? "bg-emerald-600/30 border-2 border-emerald-400 shadow-xl shadow-emerald-500/20 ring-2 ring-emerald-400 scale-[1.02]"
                          : isRevealed
                          ? "bg-slate-800/40 border border-slate-700/30 opacity-50"
                          : "bg-slate-800/80 border border-slate-700/60"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                          isRevealed && isCorrectAnswer
                            ? "bg-emerald-500 text-slate-950"
                            : "bg-slate-700 text-cyan-400"
                        }`}
                      >
                        {letters[i]}
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-semibold text-slate-200 leading-snug">
                          {opt}
                        </span>
                        {isRevealed && isCorrectAnswer && (
                          <span className="block mt-1 text-xs font-black text-emerald-400">
                            ✓ Tačan odgovor
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Admin Controls for next question */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-cyan-400" />
                <div>
                  <span className="text-sm font-bold text-white">
                    Automatski tajmer: 20s odgovaranje + 4s prikaz rezultata
                  </span>
                  <p className="text-xs text-slate-400">
                    Kviz automatski prelazi na sledeće pitanje nakon što se prikaže tačan odgovor.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleNextQuestion}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg flex items-center gap-2 transition-all active:scale-98"
                >
                  <span>
                    {quizState.currentQuestionIndex + 1 === QUIZ_QUESTIONS.length
                      ? "Završi Kviz i Prikaži Pobjednike"
                      : "Pređi na sledeće pitanje"}
                  </span>
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= ADMIN VIEW: FINISHED ================= */}
        {quizState.status === "finished" && (
          <Leaderboard
            players={quizState.players || {}}
            isAdmin={true}
            onResetQuiz={handleResetQuiz}
          />
        )}
      </main>
    </div>
  );
}
