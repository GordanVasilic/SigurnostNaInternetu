"use client";

import React, { useState, useEffect } from "react";
import { Question } from "@/data/questions";
import { Timer } from "./Timer";
import { playCorrect, playWrong } from "@/lib/sounds";
import { CheckCircle2, XCircle, Clock, Hourglass } from "lucide-react";

interface QuestionCardProps {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  questionStartTime: number;
  durationSeconds?: number;
  hasAnswered: boolean;
  selectedOptionIndex?: number;
  isCorrect?: boolean;
  onSelectOption: (optionIndex: number, timeTakenMs: number) => void;
  onTimeUp?: () => void;
}

export function QuestionCard({
  question,
  questionIndex,
  totalQuestions,
  questionStartTime,
  durationSeconds = 15,
  hasAnswered,
  selectedOptionIndex,
  isCorrect,
  onSelectOption,
  onTimeUp,
}: QuestionCardProps) {
  const [localAnswered, setLocalAnswered] = useState(hasAnswered);
  const [localSelected, setLocalSelected] = useState<number | undefined>(selectedOptionIndex);
  const [localIsCorrect, setLocalIsCorrect] = useState<boolean | undefined>(isCorrect);
  const [timeExpired, setTimeExpired] = useState(false);

  useEffect(() => {
    setLocalAnswered(hasAnswered);
    setLocalSelected(selectedOptionIndex);
    setLocalIsCorrect(isCorrect);
    setTimeExpired(false);
  }, [questionIndex, hasAnswered, selectedOptionIndex, isCorrect]);

  const handleOptionClick = (idx: number) => {
    if (localAnswered || timeExpired) return;

    const timeTakenMs = Math.max(100, Date.now() - questionStartTime);
    const correct = idx === question.correctIndex;

    setLocalAnswered(true);
    setLocalSelected(idx);
    setLocalIsCorrect(correct);

    if (correct) {
      playCorrect();
    } else {
      playWrong();
    }

    onSelectOption(idx, timeTakenMs);
  };

  const handleTimeUp = () => {
    setTimeExpired(true);
    if (!localAnswered) {
      playWrong();
      onSelectOption(-1, 15000);
    }
    if (onTimeUp) onTimeUp();
  };

  const optionLetters = ["A", "B", "C"];
  const optionColors = [
    {
      bg: "bg-gradient-to-r from-red-600/90 to-rose-600/90 hover:from-red-500 hover:to-rose-500",
      border: "border-red-500/50",
      badge: "bg-red-950/60 text-red-200",
    },
    {
      bg: "bg-gradient-to-r from-blue-600/90 to-indigo-600/90 hover:from-blue-500 hover:to-indigo-500",
      border: "border-blue-500/50",
      badge: "bg-blue-950/60 text-blue-200",
    },
    {
      bg: "bg-gradient-to-r from-amber-600/90 to-orange-600/90 hover:from-amber-500 hover:to-orange-500",
      border: "border-amber-500/50",
      badge: "bg-amber-950/60 text-amber-200",
    },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-4 flex flex-col items-center">
      {/* Top Bar: Question Progress & Category */}
      <div className="w-full flex items-center justify-between text-xs text-slate-400 font-semibold mb-3">
        <div className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
          Pitanje <span className="text-cyan-400 font-bold">{questionIndex + 1}</span> od {totalQuestions}
        </div>
        <div className="px-3 py-1 rounded-full bg-cyan-950/50 border border-cyan-800/40 text-cyan-300 font-medium">
          {question.category}
        </div>
      </div>

      {/* 15s Synchronized Timer */}
      <div className="my-2">
        <Timer
          startTime={questionStartTime}
          durationSeconds={durationSeconds}
          onTimeUp={handleTimeUp}
        />
      </div>

      {/* Question Box */}
      <div className="w-full bg-slate-900/90 rounded-3xl border border-slate-800 p-5 sm:p-7 shadow-2xl my-3 text-center">
        <h2 className="text-lg sm:text-xl md:text-2xl font-black text-white leading-snug">
          {question.question}
        </h2>
      </div>

      {/* Immediate Feedback Banner (if answered) */}
      {localAnswered && (
        <div
          className={`w-full p-4 rounded-2xl mb-4 text-center font-bold shadow-lg transition-all animate-in fade-in zoom-in-95 duration-200 ${
            localIsCorrect
              ? "bg-emerald-500/20 border-2 border-emerald-500/60 text-emerald-300"
              : "bg-rose-500/20 border-2 border-rose-500/60 text-rose-300"
          }`}
        >
          <div className="flex items-center justify-center gap-2 text-lg sm:text-xl">
            {localIsCorrect ? (
              <>
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                <span>Tačno! 🎉 (+1 bod)</span>
              </>
            ) : (
              <>
                <XCircle className="w-6 h-6 text-rose-400" />
                <span>Netačno! ❌</span>
              </>
            )}
          </div>
          <div className="text-xs text-slate-300 mt-1 flex items-center justify-center gap-1.5">
            <Hourglass className="w-3.5 h-3.5 animate-spin text-cyan-400" />
            <span>Čekamo istek vremena za sledeće pitanje...</span>
          </div>
        </div>
      )}

      {/* Time Expired Notice (if not answered) */}
      {!localAnswered && timeExpired && (
        <div className="w-full p-4 rounded-2xl mb-4 text-center font-bold bg-amber-500/20 border-2 border-amber-500/60 text-amber-300 animate-in fade-in">
          <div className="flex items-center justify-center gap-2 text-lg">
            <Clock className="w-5 h-5" />
            <span>Vrijeme je isteklo! ⏳</span>
          </div>
          <div className="text-xs text-slate-300 mt-1 flex items-center justify-center gap-1.5">
            <Hourglass className="w-3.5 h-3.5 animate-spin text-cyan-400" />
            <span>Prelazimo na sledeće pitanje...</span>
          </div>
        </div>
      )}

      {/* 3 Answer Options */}
      <div className="w-full flex flex-col gap-3.5 mt-2">
        {question.options.map((opt, idx) => {
          const letter = optionLetters[idx];
          const color = optionColors[idx];
          const isSelected = localSelected === idx;

          let buttonStyle = `${color.bg} text-white ${color.border} shadow-lg`;
          if (localAnswered || timeExpired) {
            if (isSelected) {
              buttonStyle = localIsCorrect
                ? "bg-emerald-600 text-white border-2 border-emerald-400 shadow-emerald-500/30 scale-[1.02]"
                : "bg-rose-600 text-white border-2 border-rose-400 shadow-rose-500/30 scale-[1.02]";
            } else {
              buttonStyle = "bg-slate-800/60 text-slate-400 border border-slate-700/40 opacity-50 cursor-not-allowed";
            }
          }

          return (
            <button
              key={idx}
              type="button"
              disabled={localAnswered || timeExpired}
              onClick={() => handleOptionClick(idx)}
              className={`w-full min-h-[60px] sm:min-h-[64px] p-3.5 sm:p-4 rounded-2xl border-2 font-bold text-sm sm:text-lg flex items-center gap-3 text-left transition-all duration-150 active:scale-[0.98] touch-manipulation select-none ${buttonStyle}`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black shrink-0 ${
                  isSelected ? "bg-white/20 text-white" : color.badge
                }`}
              >
                {letter}
              </div>
              <span className="flex-1 leading-snug">{opt}</span>
              {isSelected && (
                <div className="shrink-0 text-sm font-black px-2 py-0.5 rounded-md bg-white/20">
                  Tvoj izbor
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
