"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { Trophy, Medal, Clock, Award, BarChart3, RotateCcw } from "lucide-react";
import { Player } from "@/types/quiz";
import { playVictory } from "@/lib/sounds";

interface LeaderboardProps {
  players: Record<string, Player>;
  isAdmin?: boolean;
  onResetQuiz?: () => void;
}

export function Leaderboard({ players, isAdmin = false, onResetQuiz }: LeaderboardProps) {
  // Sort players: 1. score descending, 2. totalTimeMs ascending (tie-breaker)
  const sortedPlayers = Object.values(players || {}).sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return (a.totalTimeMs || 0) - (b.totalTimeMs || 0);
  });

  const top1 = sortedPlayers[0];
  const top2 = sortedPlayers[1];
  const top3 = sortedPlayers[2];
  const rest = sortedPlayers.slice(3);

  useEffect(() => {
    playVictory();

    // Trigger celebratory confetti
    const duration = 3.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  const formatSeconds = (ms?: number) => {
    if (!ms && ms !== 0) return "0.0s";
    return (ms / 1000).toFixed(1) + "s";
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 flex flex-col items-center">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-sm font-bold uppercase tracking-wider mb-2">
          <Trophy className="w-4 h-4" />
          Kviz je završen!
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Konačna Rang Lista
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Rangiranje po broju tačnih odgovora, a pri istom broju bodova pobjeđuje brži takmičar.
        </p>
      </div>

      {/* Top 3 Podium */}
      {sortedPlayers.length > 0 && (
        <div className="w-full grid grid-cols-3 gap-2 sm:gap-4 items-end max-w-2xl mb-10 pt-8">
          {/* 2nd Place */}
          <div className="flex flex-col items-center order-1">
            {top2 ? (
              <div className="flex flex-col items-center text-center w-full">
                <div className="text-3xl mb-1 animate-bounce">🥈</div>
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-slate-400 to-slate-200 text-2xl sm:text-3xl flex items-center justify-center shadow-lg border-2 border-slate-300">
                  {top2.avatar || "👤"}
                </div>
                <h3 className="font-bold text-slate-200 text-sm sm:text-base mt-2 truncate max-w-[100px] sm:max-w-[130px]">
                  {top2.name}
                </h3>
                <div className="mt-1 px-2.5 py-0.5 rounded-full bg-slate-800 text-cyan-400 text-xs font-black">
                  {top2.score} bodova
                </div>
                <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 font-mono">
                  <Clock className="w-3 h-3 text-slate-500" />
                  {formatSeconds(top2.totalTimeMs)}
                </span>
                <div className="w-full h-24 sm:h-32 bg-gradient-to-t from-slate-800 to-slate-700/70 rounded-t-2xl mt-3 flex items-center justify-center border-t border-slate-400/40">
                  <span className="text-2xl font-black text-slate-300">2</span>
                </div>
              </div>
            ) : (
              <div className="w-full h-24 bg-slate-800/30 rounded-t-2xl" />
            )}
          </div>

          {/* 1st Place (Winner) */}
          <div className="flex flex-col items-center order-2">
            {top1 && (
              <div className="flex flex-col items-center text-center w-full">
                <div className="text-4xl mb-1 animate-bounce">👑</div>
                <div className="relative">
                  <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-3xl sm:text-4xl flex items-center justify-center shadow-2xl ring-4 ring-amber-400/50">
                    {top1.avatar || "👤"}
                  </div>
                  <div className="absolute -bottom-2 -right-1 bg-amber-500 text-slate-950 p-1 rounded-full shadow">
                    <Trophy className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </div>
                <h3 className="font-black text-white text-base sm:text-lg mt-3 truncate max-w-[110px] sm:max-w-[160px]">
                  {top1.name}
                </h3>
                <div className="mt-1 px-3 py-0.5 rounded-full bg-amber-500 text-slate-950 text-xs sm:text-sm font-black shadow-md">
                  {top1.score} bodova
                </div>
                <span className="text-xs text-amber-300/90 flex items-center gap-1 mt-1 font-mono font-bold">
                  <Clock className="w-3 h-3" />
                  {formatSeconds(top1.totalTimeMs)}
                </span>
                <div className="w-full h-32 sm:h-44 bg-gradient-to-t from-amber-600/90 to-amber-500 rounded-t-2xl mt-3 flex flex-col items-center justify-center shadow-xl border-t-2 border-yellow-200">
                  <span className="text-4xl font-black text-slate-950">1</span>
                  <span className="text-[10px] font-bold tracking-widest text-slate-900 uppercase">
                    Pobjednik
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 3rd Place */}
          <div className="flex flex-col items-center order-3">
            {top3 ? (
              <div className="flex flex-col items-center text-center w-full">
                <div className="text-3xl mb-1 animate-bounce">🥉</div>
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-amber-700 to-amber-600 text-2xl sm:text-3xl flex items-center justify-center shadow-lg border-2 border-amber-600/60">
                  {top3.avatar || "👤"}
                </div>
                <h3 className="font-bold text-slate-200 text-sm sm:text-base mt-2 truncate max-w-[100px] sm:max-w-[130px]">
                  {top3.name}
                </h3>
                <div className="mt-1 px-2.5 py-0.5 rounded-full bg-slate-800 text-cyan-400 text-xs font-black">
                  {top3.score} bodova
                </div>
                <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 font-mono">
                  <Clock className="w-3 h-3 text-slate-500" />
                  {formatSeconds(top3.totalTimeMs)}
                </span>
                <div className="w-full h-20 sm:h-24 bg-gradient-to-t from-slate-800 to-slate-700/60 rounded-t-2xl mt-3 flex items-center justify-center border-t border-amber-700/40">
                  <span className="text-2xl font-black text-amber-500/80">3</span>
                </div>
              </div>
            ) : (
              <div className="w-full h-20 bg-slate-800/30 rounded-t-2xl" />
            )}
          </div>
        </div>
      )}

      {/* Action Buttons: Detailed Statistics & Reset */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-lg mb-8 px-2">
        <Link
          href="/stats"
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all active:scale-95 text-center"
        >
          <BarChart3 className="w-5 h-5 shrink-0" />
          <span>Pogledaj detaljnu statistiku</span>
        </Link>

        {isAdmin && onResetQuiz && (
          <button
            onClick={onResetQuiz}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-sm border border-slate-700 transition-colors active:scale-95 text-center"
          >
            <RotateCcw className="w-4 h-4 shrink-0" />
            <span>Resetuj kviz</span>
          </button>
        )}
      </div>

      {/* Full Leaderboard Table */}
      <div className="w-full bg-slate-900/80 rounded-3xl border border-slate-800 p-4 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-slate-300 font-bold text-sm">
            <Award className="w-4 h-4 text-cyan-400" />
            <span>Svi učesnici ({sortedPlayers.length})</span>
          </div>
          <span className="text-xs text-slate-500">Bodovi / Vrijeme</span>
        </div>

        {sortedPlayers.length === 0 ? (
          <p className="text-center py-8 text-slate-500 text-sm">Nema prijavljenih učesnika.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {sortedPlayers.map((player, index) => {
              const isFirst = index === 0;
              const isSecond = index === 1;
              const isThird = index === 2;

              let rankBadge = (
                <span className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 font-mono text-xs font-bold flex items-center justify-center">
                  #{index + 1}
                </span>
              );

              if (isFirst) {
                rankBadge = (
                  <span className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-mono text-xs font-black flex items-center justify-center">
                    🥇 1
                  </span>
                );
              } else if (isSecond) {
                rankBadge = (
                  <span className="w-7 h-7 rounded-lg bg-slate-300 text-slate-950 font-mono text-xs font-black flex items-center justify-center">
                    🥈 2
                  </span>
                );
              } else if (isThird) {
                rankBadge = (
                  <span className="w-7 h-7 rounded-lg bg-amber-700 text-amber-100 font-mono text-xs font-black flex items-center justify-center">
                    🥉 3
                  </span>
                );
              }

              return (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-3 rounded-2xl transition-all ${
                    isFirst
                      ? "bg-amber-500/10 border border-amber-500/30"
                      : "bg-slate-800/50 hover:bg-slate-800 border border-slate-700/40"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {rankBadge}
                    <div className="w-10 h-10 rounded-xl bg-slate-700/60 flex items-center justify-center text-xl shrink-0">
                      {player.avatar || "👤"}
                    </div>
                    <div className="truncate">
                      <p className="font-bold text-sm text-white truncate">{player.name}</p>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {formatSeconds(player.totalTimeMs)} ukupno
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm sm:text-base font-black text-cyan-400">
                      {player.score} <span className="text-xs font-medium text-slate-400">/ 14</span>
                    </div>
                    <span className="text-[10px] text-slate-500">tačnih odgovora</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
