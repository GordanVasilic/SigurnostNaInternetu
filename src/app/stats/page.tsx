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
  Printer,
  Copy,
  Check,
  Share2,
  FileText,
  Sparkles,
} from "lucide-react";

function WhatsAppIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.05 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

function ViberIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19.78 3.52C17.58 1.48 14.54.54 11.45.5 5.56.5 1.15 4.88 1.12 10.74c-.02 3.16 1.43 6.06 3.86 7.95v3.31c0 .54.49.95 1.01.83l3.52-.84c1.1.27 2.23.41 3.39.41 5.89 0 10.3-4.38 10.33-10.24.03-3.26-1.29-6.3-3.45-8.63zm-2.07 13.06c-.32.53-1.02.94-1.68.96-.3.01-.61-.06-.89-.17-2.31-.88-4.52-2.34-6.35-4.17-1.83-1.83-3.29-4.04-4.17-6.35-.11-.28-.18-.59-.17-.89.02-.66.43-1.36.96-1.68.6-.36 1.34-.23 1.77.31l1.19 1.48c.37.46.36 1.13-.04 1.57l-.54.6c.37.76.88 1.5 1.48 2.11.61.6 1.35 1.11 2.11 1.48l.6-.54c.44-.4 1.11-.41 1.57-.04l1.48 1.19c.54.43.67 1.17.31 1.77z"/>
    </svg>
  );
}

export default function StatisticsPage() {
  const [quizState, setQuizState] = useState<QuizState>(createInitialState());
  const [stats, setStats] = useState<QuestionStat[]>([]);
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      setCanNativeShare(true);
    }
  }, []);

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

  const getShareUrl = () => {
    if (typeof window !== "undefined") {
      return window.location.href;
    }
    return "";
  };

  const getShareMessage = () => {
    const url = getShareUrl();
    const statsHighlight = hardestQuestion
      ? `\n⚠️ Pitanje za analizu: Pitanje #${hardestQuestion.questionId} (${hardestQuestion.correctPercentage}% tačno)`
      : "";

    return `🛡️ KVIZ: SIGURNOST NA INTERNETU\n📊 Detaljna statistika i edukativna objašnjenja svih odgovora\n\n👥 Broj učenika: ${totalPlayers}\n🎯 Ukupna uspješnost: ${overallAccuracy}%${statsHighlight}\n\n👉 Pogledajte kompletnu analizu i tačne odgovore sa objašnjenjima na linku:\n${url}`;
  };

  const handleCopyLink = async () => {
    const text = getShareMessage();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.warn("Greška pri kopiranju:", err);
    }
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(getShareMessage());
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank", "noopener,noreferrer");
  };

  const handleViberShare = () => {
    const text = encodeURIComponent(getShareMessage());
    window.location.href = `viber://forward?text=${text}`;
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Sigurnost na Internetu - Statistika Kviza",
          text: getShareMessage(),
          url: getShareUrl(),
        });
      } catch {
        // user cancelled or share failed
      }
    }
  };

  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 print:bg-white print:text-black">
      {/* Inline styles specifically for printing / saving as PDF */}
      <style jsx global>{`
        @media print {
          @page {
            margin: 12mm 15mm;
            size: A4 portrait;
          }
          body {
            background-color: #ffffff !important;
            color: #0f172a !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          .print-avoid-break {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          .print-border {
            border: 1px solid #cbd5e1 !important;
            background-color: #ffffff !important;
          }
        }
      `}</style>

      {/* Screen Navbar (Hidden on Print) */}
      <div className="no-print">
        <Navbar showHomeLink={true} />
      </div>

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 flex flex-col print:p-0 print:max-w-none">
        {/* ================= PRINT-ONLY HEADER ================= */}
        <div className="hidden print:block mb-8 pb-4 border-b-2 border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                IZVJEŠTAJ STATISTIKE KVIZA: SIGURNOST NA INTERNETU
              </h1>
              <p className="text-xs text-slate-600 mt-1">
                Edukativna analiza odgovora i objašnjenja svih 14 pitanja • Sergej
              </p>
            </div>
            <div className="text-right text-xs text-slate-500 font-mono">
              Generisano: {new Date().toLocaleDateString("sr-RS", { day: "2-digit", month: "2-digit", year: "numeric" })}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 mt-5 p-3 rounded-xl bg-slate-100 border border-slate-300 text-xs">
            <div>
              <span className="text-slate-500 font-bold uppercase block text-[10px]">Ukupno Učenika</span>
              <strong className="text-sm text-slate-900">{totalPlayers}</strong>
            </div>
            <div>
              <span className="text-slate-500 font-bold uppercase block text-[10px]">Ukupna Uspješnost</span>
              <strong className="text-sm text-emerald-700">{overallAccuracy}%</strong>
            </div>
            <div>
              <span className="text-slate-500 font-bold uppercase block text-[10px]">Tačnih Odgovora</span>
              <strong className="text-sm text-slate-900">{totalCorrectAll} od {totalAnswersAll}</strong>
            </div>
            <div>
              <span className="text-slate-500 font-bold uppercase block text-[10px]">Broj Pitanja</span>
              <strong className="text-sm text-slate-900">14 pitanja</strong>
            </div>
          </div>
        </div>

        {/* ================= SCREEN HEADER & CONTROLS ================= */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 no-print">
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
              Analiza znanja i odgovora učesnika o sigurnosti na internetu sa edukativnim objašnjenjima.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrintPdf}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white border border-slate-700 shadow-sm transition-all active:scale-95"
            >
              <Printer className="w-4 h-4 text-cyan-400" />
              <span>Štampaj / PDF</span>
            </button>

            <Link
              href="/admin"
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-colors"
            >
              Admin Kontrola
            </Link>
          </div>
        </div>

        {/* ================= SHARING TOOLBAR (VIBER / WHATSAPP / PDF) ================= */}
        <div className="no-print bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-900 rounded-3xl border border-slate-800 p-5 sm:p-6 mb-8 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-bold uppercase tracking-wider mb-1.5">
                <Share2 className="w-3.5 h-3.5" />
                <span>Dijeljenje rezultata</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                Podijeli statistiku sa objašnjenjima sa drugarima
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
                Pošalji direktno u Viber ili WhatsApp grupu odjeljenja ili sačuvaj zvanični PDF izvještaj.
              </p>
            </div>

            {copied && (
              <div className="animate-in fade-in slide-in-from-top duration-200 flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Link i sažetak su kopirani!</span>
              </div>
            )}
          </div>

          {/* Action Buttons Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
            {/* 1. Viber Button */}
            <button
              onClick={handleViberShare}
              title="Otvori Viber i pošalji u grupu"
              className="flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-2xl bg-[#7360f2] hover:bg-[#6653ea] text-white font-black text-sm shadow-lg shadow-[#7360f2]/20 transition-all active:scale-95 group"
            >
              <ViberIcon className="w-5 h-5 fill-current shrink-0" />
              <span>Viber Grupa</span>
            </button>

            {/* 2. WhatsApp Button */}
            <button
              onClick={handleWhatsAppShare}
              title="Otvori WhatsApp i pošalji u grupu"
              className="flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-sm shadow-lg shadow-[#25D366]/20 transition-all active:scale-95 group"
            >
              <WhatsAppIcon className="w-5 h-5 fill-current shrink-0" />
              <span>WhatsApp Grupa</span>
            </button>

            {/* 3. Copy Link Button */}
            <button
              onClick={handleCopyLink}
              title="Kopiraj link za dijeljenje"
              className="flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-sm border border-slate-700 shadow-md transition-all active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-emerald-300">Kopirano!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Kopiraj Link</span>
                </>
              )}
            </button>

            {/* 4. PDF / Print Button */}
            <button
              onClick={handlePrintPdf}
              title="Preuzmi kao PDF ili odštampaj"
              className="flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-sm shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span>Preuzmi PDF</span>
            </button>
          </div>

          {/* Optional Native Phone Share (mobile browsers) */}
          {canNativeShare && (
            <div className="mt-3 pt-3 border-t border-slate-800/60 flex justify-end">
              <button
                onClick={handleNativeShare}
                className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-bold transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Otvori meni za dijeljenje na telefonu (druge aplikacije)</span>
              </button>
            </div>
          )}
        </div>

        {/* Overview Metric Cards (Screen only) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-8 no-print">
          {/* Card 1: Total Players */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
              <span>Broj učesnika</span>
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
              <span>Ukupna uspješnost</span>
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
        <div className="flex flex-col gap-6 print:gap-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-white print:text-slate-900">
              Pregled po Pitanjima i Edukativna Objašnjenja
            </h2>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider print:text-slate-500">
              14 pitanja
            </span>
          </div>

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
                className="bg-slate-900/90 rounded-3xl border border-slate-800 p-5 sm:p-6 shadow-xl print-avoid-break print:bg-white print:border-slate-300 print:shadow-none print:p-4 print:rounded-2xl print:border"
              >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 font-black text-sm flex items-center justify-center border border-cyan-500/40 print:bg-slate-100 print:text-slate-900 print:border-slate-400">
                      {q.id}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wide print:bg-slate-100 print:text-slate-700 print:border print:border-slate-300">
                      {q.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-slate-400 flex items-center gap-1 font-mono print:text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-slate-500 print:text-slate-400" />
                      Prosječno: <strong className="text-slate-200 print:text-slate-900">{avgSec}s</strong>
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-bold print:bg-slate-100 print:text-slate-800 print:border print:border-slate-300">
                      Odgovorilo: {total}
                    </span>
                  </div>
                </div>

                {/* Question Text */}
                <h3 className="text-base sm:text-lg font-black text-white mb-4 print:text-slate-900">
                  {q.question}
                </h3>

                {/* Progress Bar (Correct vs Incorrect) */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                    <span className="text-emerald-400 flex items-center gap-1 print:text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Tačno: {correct} ({pct}%)
                    </span>
                    <span className="text-rose-400 flex items-center gap-1 print:text-rose-700">
                      <XCircle className="w-3.5 h-3.5" />
                      Netačno: {incorrect} ({100 - pct}%)
                    </span>
                  </div>

                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex border border-slate-700/50 print:bg-slate-200 print:border-slate-300">
                    <div
                      style={{ width: `${pct}%` }}
                      className="bg-emerald-500 h-full transition-all duration-300 print:bg-emerald-600"
                    />
                    <div
                      style={{ width: `${100 - pct}%` }}
                      className="bg-rose-500/80 h-full transition-all duration-300 print:bg-rose-400"
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
                        className={`p-3 rounded-2xl border flex flex-col justify-between text-xs transition-colors ${
                          isCorrect
                            ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200 print:bg-emerald-50 print:border-emerald-500 print:text-emerald-950"
                            : "bg-slate-800/50 border-slate-700/40 text-slate-300 print:bg-slate-50 print:border-slate-200 print:text-slate-800"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <span
                            className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] shrink-0 ${
                              isCorrect
                                ? "bg-emerald-500 text-slate-950 print:bg-emerald-600 print:text-white"
                                : "bg-slate-700 text-slate-300 print:bg-slate-200 print:text-slate-800"
                            }`}
                          >
                            {letters[optIdx]}
                          </span>
                          <span className="font-semibold leading-tight">{opt}</span>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-slate-700/40 print:border-slate-200 flex items-center justify-between text-[11px] font-mono">
                          <span className={isCorrect ? "text-emerald-400 font-bold print:text-emerald-700" : "text-slate-400 print:text-slate-600"}>
                            {optCount} učenika ({optPct}%)
                          </span>
                          {isCorrect && (
                            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 print:bg-emerald-100 print:text-emerald-800 print:border-emerald-300">
                              Tačan odgovor
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Educational Note / Explanation */}
                <div className="mt-3 p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-800/40 flex items-start gap-2.5 text-xs text-cyan-200 print:bg-blue-50 print:border-blue-200 print:text-slate-800">
                  <Lightbulb className="w-4 h-4 text-cyan-400 print:text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-cyan-300 print:text-blue-700 font-bold">Edukativno objašnjenje: </strong>
                    <span>{q.explanation}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ================= PRINT-ONLY FOOTER ================= */}
        <div className="hidden print:block mt-8 pt-4 border-t border-slate-300 text-center text-xs text-slate-500">
          Kviz &quot;Sigurnost na Internetu&quot; • Edukativni materijal za učenike • Sergej
        </div>
      </main>
    </div>
  );
}
