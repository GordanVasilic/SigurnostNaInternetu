"use client";

import React, { useEffect, useState, useRef } from "react";
import { playTick } from "@/lib/sounds";

interface TimerProps {
  startTime: number;
  durationSeconds?: number;
  onTimeUp?: () => void;
  paused?: boolean;
}

export function Timer({
  startTime,
  durationSeconds = 15,
  onTimeUp,
  paused = false,
}: TimerProps) {
  const [remainingMs, setRemainingMs] = useState(durationSeconds * 1000);
  const lastSecondRef = useRef<number>(durationSeconds);
  const hasCalledTimeUpRef = useRef(false);

  useEffect(() => {
    hasCalledTimeUpRef.current = false;
    lastSecondRef.current = durationSeconds;
  }, [startTime, durationSeconds]);

  useEffect(() => {
    if (paused) return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const totalMs = durationSeconds * 1000;
      const left = Math.max(0, totalMs - elapsed);
      setRemainingMs(left);

      const currentSec = Math.ceil(left / 1000);
      if (currentSec !== lastSecondRef.current && currentSec > 0) {
        lastSecondRef.current = currentSec;
        playTick(currentSec <= 5);
      }

      if (left <= 0 && !hasCalledTimeUpRef.current) {
        hasCalledTimeUpRef.current = true;
        clearInterval(interval);
        if (onTimeUp) onTimeUp();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [startTime, durationSeconds, paused, onTimeUp]);

  const secondsLeft = Math.ceil(remainingMs / 1000);
  const progressPercent = Math.max(0, Math.min(100, (remainingMs / (durationSeconds * 1000)) * 100));

  // Color transitions: Cyan (>8s) -> Amber (5-8s) -> Red (<=4s)
  const isUrgent = secondsLeft <= 5;
  const isCritical = secondsLeft <= 3;

  let colorClass = "from-cyan-400 to-blue-500";
  let textColorClass = "text-cyan-400";
  let ringBg = "stroke-cyan-500";

  if (isCritical) {
    colorClass = "from-red-500 to-rose-600";
    textColorClass = "text-red-400 animate-pulse";
    ringBg = "stroke-red-500";
  } else if (isUrgent) {
    colorClass = "from-amber-400 to-orange-500";
    textColorClass = "text-amber-400";
    ringBg = "stroke-amber-500";
  }

  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      {/* Circular Timer for Mobile & Desktop */}
      <div className="relative w-20 h-20 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 72 72">
          {/* Background circle */}
          <circle
            cx="36"
            cy="36"
            r={radius}
            className="stroke-slate-800"
            strokeWidth="6"
            fill="transparent"
          />
          {/* Animated progress circle */}
          <circle
            cx="36"
            cy="36"
            r={radius}
            className={`${ringBg} transition-all duration-150 ease-linear`}
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className={`text-2xl font-black ${textColorClass} tracking-tighter`}>
            {secondsLeft}
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase -mt-1">sek</span>
        </div>
      </div>

      {/* Linear progress bar underneath */}
      <div className="w-full max-w-xs h-2 bg-slate-800/80 rounded-full mt-2 overflow-hidden border border-slate-700/50">
        <div
          className={`h-full bg-gradient-to-r ${colorClass} transition-all duration-150 ease-linear rounded-full`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}
