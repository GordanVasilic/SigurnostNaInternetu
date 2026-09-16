"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { QUIZ_QUESTIONS } from "@/data/questions";
import {
  DEFAULT_ROOM_CODE,
  subscribeToQuizState,
  calculateQuizStats,
  createInitialState,
} from "@/lib/quizSync";
import { QuizState, QuestionStat } from "@/types/quiz";
import {
  BarChart3,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  Users,
  Lightbulb,
  Award,
  AlertTriangle,
  FileSpreadsheet,
} from "lucide-react";

export default function StatisticsPage() {
  const [quizState, setQuizState] = useState<QuizState>(createInitialState());
  const [stats, setStats] = useState<QuestionStat[]>([]);

  useEffect(() => {
    const unsub = subscribeToQuizState(DEFAULT_ROOM_CODE, (state) => {
      setQuizState(state);
      const calculated = calculateQuizStats(state);
      setStats(calculated);
    });
    return () => unsub();
  }, []);

  const playersList = Object.values(quizState.players || {});
  const totalPlayers = playersList.length;

  // Aggregate metrics
  const totalAnswersAll = stats.reduce((acc, s) => acc + s.totalAnswered, 0);
  const totalCorrectAll = stats.reduce((acc, s) => acc + s.correctCount, 0);
  const overallAccuracy = totalAnswersAll > 0 ? Math.round((totalCorrectAll / totalAnswersAll) * 100) : 0;

  // Hardest and easiest question
  const questionsWithAnswers = stats.filter((s) => s.totalAnswered > 0);
  const easiestQuestion = [...questionsWithAnswers].sort(
    (a, b) => b.correctPercentage - a.correctPercentage
  )[0];
  const hardestQuestion = [...questionsWithAnswers].sort(
    (a, b) => a.correctPercentage - b.correctPercentage
  )[0];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 flex flex-col">
        {/* Header & Back Link */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Nazad na kviz</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
              <BarChart3 className="w-7 h-7 text-cyan-400" />
              <span>Detaljna Statistika Kvizа</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Analiza znanja razreda o sigurnosti na internetu (14 pitanja).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-colors"
            >
              Admin Kontrola
            </Link>
          </div>
        </div>

        {/* Overview Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-8">
          {/* Card 1: Total Players */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
              <span>Broj učenika</span>
              <Users className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white mt-2">
              {totalPlayers}
            </div>
            <span className="text-[11px] text-slate-500 mt-1">prijavljenih u kvizu</span>
          </div>

          {/* Card 2: Overall Accuracy */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
              <span>Uspješnost razreda</span>
              <Award className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-2">
              {overallAccuracy}%
            </div>
            <span className="text-[11px] text-slate-500 mt-1">
              {totalCorrectAll} tačnih od {totalAnswersAll} odgovora
            </span>
          </div>

          {/* Card 3: Easiest Question */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
              <span>Najlakša tema</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-sm font-bold text-white mt-2 truncate">
              {easiestQuestion ? `Pitanje #${easiestQuestion.questionId}` : "Nema podataka"}
            </div>
            <span className="text-[11px] text-emerald-400 mt-1 font-semibold">
              {easiestQuestion ? `${easiestQuestion.correctPercentage}% tačno` : "-"}
            </span>
          </div>

          {/* Card 4: Hardest Question */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
              <span>Za diskusiju</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-sm font-bold text-white mt-2 truncate">
              {hardestQuestion ? `Pitanje #${hardestQuestion.questionId}` : "Nema podataka"}
            </div>
            <span className="text-[11px] text-amber-400 mt-1 font-semibold">
              {hardestQuestion ? `${hardestQuestion.correctPercentage}% tačno` : "-"}
            </span>
          </div>
        </div>

        {/* Detailed Question by Question Breakdown */}
        <div className="flex flex-col gap-6">
          <h2 className="text-xl font-black text-white">Pregled po Pitanjima</h2>

          {QUIZ_QUESTIONS.map((q, idx) => {
            const stat = stats[idx];
            const total = stat?.totalAnswered || 0;
            const correct = stat?.correctCount || 0;
            const incorrect = stat?.incorrectCount || 0;
            const pct = stat?.correctPercentage || 0;
            const avgSec = stat?.averageTimeMs ? (stat.averageTimeMs / 1000).toFixed(1) : "0.0";

            return (
              <div
                key={q.id}
                className="bg-slate-900/90 rounded-3xl border border-slate-800 p-5 sm:p-6 shadow-xl"
              >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 font-black text-sm flex items-center justify-center border border-cyan-500/40">
                      {q.id}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                      {q.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-slate-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      Prosječno: <strong className="text-slate-200">{avgSec}s</strong>
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-bold">
                      Odgovorilo: {total}
                    </span>
                  </div>
                </div>

                {/* Question Text */}
                <h3 className="text-base sm:text-lg font-black text-white mb-4">
                  {q.question}
                </h3>

                {/* Progress Bar (Correct vs Incorrect) */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Tačno: {correct} ({pct}%)
                    </span>
                    <span className="text-rose-400 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" />
                      Netačno: {incorrect} ({100 - pct}%)
                    </span>
                  </div>

                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex border border-slate-700/50">
                    <div
                      style={{ width: `${pct}%` }}
                      className="bg-emerald-500 h-full transition-all duration-300"
                    />
                    <div
                      style={{ width: `${100 - pct}%` }}
                      className="bg-rose-500/80 h-full transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Breakdown of 3 Options */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 my-4">
                  {q.options.map((opt, optIdx) => {
                    const letters = ["A", "B", "C"];
                    const isCorrect = optIdx === q.correctIndex;
                    const optCount = stat?.optionCounts[optIdx] || 0;
                    const optPct = total > 0 ? Math.round((optCount / total) * 100) : 0;

                    return (
                      <div
                        key={optIdx}
                        className={`p-3 rounded-2xl border flex flex-col justify-between text-xs ${
                          isCorrect
                            ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
                            : "bg-slate-800/50 border-slate-700/40 text-slate-300"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <span
                            className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] shrink-0 ${
                              isCorrect
                                ? "bg-emerald-500 text-slate-950"
                                : "bg-slate-700 text-slate-300"
                            }`}
                          >
                            {letters[optIdx]}
                          </span>
                          <span className="font-semibold leading-tight">{opt}</span>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-slate-700/40 flex items-center justify-between text-[11px] font-mono">
                          <span className={isCorrect ? "text-emerald-400 font-bold" : "text-slate-400"}>
                            {optCount} učenika ({optPct}%)
                          </span>
                          {isCorrect && (
                            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              Tačan odgovor
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Educational Note / Explanation */}
                <div className="mt-3 p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-800/40 flex items-start gap-2.5 text-xs text-cyan-200">
                  <Lightbulb className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-cyan-300 font-bold">Edukativna poruka za razred: </strong>
                    <span>{q.explanation}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
