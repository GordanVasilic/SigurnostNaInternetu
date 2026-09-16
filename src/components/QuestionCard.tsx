"use client";

import React, { useState, useEffect, useRef } from "react";
import { Question } from "@/data/questions";
import { Timer } from "./Timer";
import { playCorrect, playWrong, playSelect } from "@/lib/sounds";
import { CheckCircle2, XCircle, Clock, Hourglass, Lock } from "lucide-react";

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
  durationSeconds = 20,
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
  const hasPlayedResultSoundRef = useRef(false);

  useEffect(() => {
    setLocalAnswered(hasAnswered);
    setLocalSelected(selectedOptionIndex);
    setLocalIsCorrect(isCorrect);
    hasPlayedResultSoundRef.current = false;

    const elapsed = Date.now() - questionStartTime;
    if (elapsed >= durationSeconds * 1000) {
      setTimeExpired(true);
    } else {
      setTimeExpired(false);
    }
  }, [questionIndex, hasAnswered, selectedOptionIndex, isCorrect, questionStartTime, durationSeconds]);

  const handleOptionClick = (idx: number) => {
    if (localAnswered || timeExpired) return;

    const timeTakenMs = Math.max(100, Date.now() - questionStartTime);
    const correct = idx === question.correctIndex;

    setLocalAnswered(true);
    setLocalSelected(idx);
    setLocalIsCorrect(correct);

    // Play neutral selection chirp: do NOT reveal right or wrong to peers nearby!
    playSelect();

    onSelectOption(idx, timeTakenMs);
  };

  const handleTimeUp = () => {
    setTimeExpired(true);
    if (!hasPlayedResultSoundRef.current) {
      hasPlayedResultSoundRef.current = true;
      if (!localAnswered) {
        playWrong();
        onSelectOption(-1, durationSeconds * 1000);
      } else if (localIsCorrect) {
        playCorrect();
      } else {
        playWrong();
      }
    }
    if (onTimeUp) onTimeUp();
  };

  const optionLetters = ["A", "B", "C"];
  const optionColors = [
    {
      bg: "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500",
      border: "border-red-500/60",
      badge: "bg-red-950/70 text-red-100",
    },
    {
      bg: "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500",
      border: "border-blue-500/60",
      badge: "bg-blue-950/70 text-blue-100",
    },
    {
      bg: "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500",
      border: "border-amber-500/60",
      badge: "bg-amber-950/70 text-amber-100",
    },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto px-3 sm:px-4 py-2 sm:py-4 flex flex-col items-center">
      {/* Top Bar: Question Progress & Category (Bigger fonts) */}
      <div className="w-full flex items-center justify-between text-sm sm:text-base text-slate-300 font-bold mb-3">
        <div className="px-4 py-1.5 rounded-2xl bg-slate-800/90 border border-slate-700 text-slate-200 shadow-sm">
          Pitanje <span className="text-cyan-400 font-black text-base sm:text-lg">{questionIndex + 1}</span> od {totalQuestions}
        </div>
        <div className="px-4 py-1.5 rounded-2xl bg-cyan-950/60 border border-cyan-800/50 text-cyan-300 font-semibold shadow-sm">
          {question.category}
        </div>
      </div>

      {/* 20s Synchronized Timer */}
      <div className="my-2 sm:my-3">
        <Timer
          startTime={questionStartTime}
          durationSeconds={durationSeconds}
          onTimeUp={handleTimeUp}
        />
      </div>

      {/* Question Box (Larger font for easy reading on phone) */}
      <div className="w-full bg-slate-900/95 rounded-3xl border-2 border-slate-800 p-5 sm:p-8 shadow-2xl my-2 sm:my-3 text-center">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-snug tracking-tight">
          {question.question}
        </h2>
      </div>

      {/* 1. Neutral Locked Banner (While timer is ticking down, answer is locked and concealed from classmates) */}
      {localAnswered && !timeExpired && (
        <div className="w-full p-4 sm:p-5 rounded-3xl mb-4 text-center font-bold bg-slate-900/95 border-2 border-cyan-500/50 text-cyan-200 shadow-xl animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-center gap-2.5 text-xl sm:text-2xl font-black text-white">
            <Lock className="w-7 h-7 text-cyan-400 shrink-0" />
            <span>Odgovor je zabilježen! 🔒</span>
          </div>
          <div className="text-sm sm:text-base text-slate-300 mt-2 flex items-center justify-center gap-2 font-medium">
            <Hourglass className="w-4 h-4 animate-spin text-cyan-400" />
            <span>Rezultat se otkriva kada istekne vrijeme... ⏳</span>
          </div>
        </div>
      )}

      {/* 2. Revealed Correct Banner (Only after time expired) */}
      {timeExpired && localAnswered && localIsCorrect && (
        <div className="w-full p-4 sm:p-5 rounded-3xl mb-4 text-center font-bold bg-emerald-500/25 border-3 border-emerald-500 text-emerald-200 shadow-xl animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-center gap-2.5 text-2xl sm:text-3xl font-black">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
            <span>Tačno! 🎉 (+1 bod)</span>
          </div>
          <div className="text-sm sm:text-base text-slate-200 mt-2 flex items-center justify-center gap-2 font-medium">
            <Hourglass className="w-4 h-4 animate-spin text-cyan-400" />
            <span>Odlično! Prelazimo na sledeće pitanje...</span>
          </div>
        </div>
      )}

      {/* 3. Revealed Incorrect Banner (Only after time expired) */}
      {timeExpired && localAnswered && !localIsCorrect && (
        <div className="w-full p-4 sm:p-5 rounded-3xl mb-4 text-center font-bold bg-rose-500/25 border-3 border-rose-500 text-rose-200 shadow-xl animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-center gap-2.5 text-2xl sm:text-3xl font-black">
            <XCircle className="w-8 h-8 text-rose-400 shrink-0" />
            <span>Netačno! ❌ (0 bodova)</span>
          </div>
          <div className="text-sm sm:text-base text-slate-200 mt-2 font-medium">
            Tačan odgovor je: <strong className="text-emerald-400 font-bold">{question.options[question.correctIndex]}</strong>
          </div>
        </div>
      )}

      {/* 4. Time Expired without answering Notice */}
      {timeExpired && !localAnswered && (
        <div className="w-full p-4 sm:p-5 rounded-3xl mb-4 text-center font-bold bg-amber-500/25 border-3 border-amber-500 text-amber-200 animate-in fade-in shadow-xl">
          <div className="flex items-center justify-center gap-2 text-2xl sm:text-3xl font-black">
            <Clock className="w-8 h-8 text-amber-400" />
            <span>Vrijeme je isteklo! ⏳</span>
          </div>
          <div className="text-sm sm:text-base text-slate-200 mt-2 font-medium">
            Tačan odgovor je bio: <strong className="text-emerald-400 font-bold">{question.options[question.correctIndex]}</strong>
          </div>
        </div>
      )}

      {/* 3 Answer Options (Extra tall, bold, easy to tap and read) */}
      <div className="w-full flex flex-col gap-3.5 sm:gap-4 mt-2">
        {question.options.map((opt, idx) => {
          const letter = optionLetters[idx];
          const color = optionColors[idx];
          const isSelected = localSelected === idx;
          const isCorrectOption = idx === question.correctIndex;

          let buttonStyle = `${color.bg} text-white ${color.border} shadow-xl`;
          let badgeText: string | null = null;
          let badgeIcon: React.ReactNode = null;

          if (!timeExpired) {
            // DURING 20s ANSWERING WINDOW
            if (localAnswered) {
              if (isSelected) {
                buttonStyle =
                  "bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-3 border-cyan-400 shadow-xl shadow-cyan-500/30 scale-[1.02] ring-2 ring-cyan-400";
                badgeText = "Tvoj izbor";
                badgeIcon = <Lock className="w-3.5 h-3.5" />;
              } else {
                buttonStyle =
                  "bg-slate-800/40 text-slate-400 border border-slate-700/30 opacity-40 cursor-not-allowed";
              }
            }
          } else {
            // AFTER TIME EXPIRED: REVEAL WINNER
            if (isCorrectOption) {
              buttonStyle =
                "bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-3 border-emerald-300 shadow-xl shadow-emerald-500/40 scale-[1.02] ring-2 ring-emerald-400";
              badgeText = isSelected ? "Tačno! Tvoj izbor ✓" : "Tačan odgovor ✓";
              badgeIcon = <CheckCircle2 className="w-4 h-4 text-emerald-300" />;
            } else if (isSelected && !localIsCorrect) {
              buttonStyle =
                "bg-gradient-to-r from-rose-600 to-red-600 text-white border-3 border-rose-300 shadow-xl shadow-rose-500/40 scale-[1.02]";
              badgeText = "Tvoj izbor ✗";
              badgeIcon = <XCircle className="w-4 h-4 text-rose-300" />;
            } else {
              buttonStyle =
                "bg-slate-800/30 text-slate-500 border border-slate-800/50 opacity-30 cursor-not-allowed";
            }
          }

          return (
            <button
              key={idx}
              type="button"
              disabled={localAnswered || timeExpired}
              onClick={() => handleOptionClick(idx)}
              className={`w-full min-h-[72px] sm:min-h-[82px] p-4 sm:p-5 rounded-2xl sm:rounded-3xl border-2 font-bold text-base sm:text-xl flex items-center gap-3.5 sm:gap-4 text-left transition-all duration-150 active:scale-[0.98] touch-manipulation select-none ${buttonStyle}`}
            >
              <div
                className={`w-11 h-11 sm:w-13 sm:h-13 rounded-2xl flex items-center justify-center text-lg sm:text-xl font-black shrink-0 shadow-md ${
                  isSelected || (timeExpired && isCorrectOption)
                    ? "bg-white/25 text-white"
                    : color.badge
                }`}
              >
                {letter}
              </div>
              <span className="flex-1 leading-snug">{opt}</span>
              {badgeText && (
                <div className="shrink-0 text-xs sm:text-sm font-black px-3 py-1.5 rounded-xl bg-slate-950/60 border border-white/20 text-white flex items-center gap-1.5 shadow">
                  {badgeIcon}
                  <span>{badgeText}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
