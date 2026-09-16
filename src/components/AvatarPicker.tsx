"use client";

import React, { useState } from "react";
import { AVATARS, AvatarOption } from "@/data/avatars";
import { Check, Sparkles } from "lucide-react";

interface AvatarPickerProps {
  selectedAvatarId: string;
  onSelectAvatar: (avatar: AvatarOption) => void;
}

export function AvatarPicker({ selectedAvatarId, onSelectAvatar }: AvatarPickerProps) {
  const [filter, setFilter] = useState<string>("all");

  const selectedAvatar =
    AVATARS.find((a) => a.id === selectedAvatarId) || AVATARS[0];

  const filteredAvatars = AVATARS.filter((av) => {
    if (filter === "tech") {
      return ["robot", "hacker", "shield", "rocket", "alien", "gamer", "lightning", "satellite", "brain", "detective"].includes(av.id);
    }
    if (filter === "animals") {
      return ["fox", "lion", "wolf", "owl", "eagle", "tiger", "panda", "bear", "cat", "dog", "shark", "dolphin", "dragon", "dino", "unicorn", "penguin", "turtle", "frog", "monkey", "bee"].includes(av.id);
    }
    if (filter === "heroes") {
      return ["fire", "star", "crown", "trophy", "target", "superhero", "wizard", "ninja", "diamond", "sunglasses"].includes(av.id);
    }
    return true;
  });

  return (
    <div className="w-full">
      {/* Selected Avatar Preview Banner */}
      <div className="flex items-center justify-between p-2.5 mb-2.5 rounded-2xl bg-slate-800/80 border border-slate-700/80">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl bg-gradient-to-br ${selectedAvatar.bgColor} shadow-md ring-2 ring-cyan-400 shrink-0`}
          >
            {selectedAvatar.emoji}
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Tvoj izabrani avatar:
            </span>
            <span className="text-sm font-black text-white">
              {selectedAvatar.label}
            </span>
          </div>
        </div>
        <div className="text-xs font-bold text-cyan-400 flex items-center gap-1 bg-cyan-950/60 px-2.5 py-1 rounded-lg border border-cyan-800/50">
          <Sparkles className="w-3.5 h-3.5" />
          <span>40 dostupnih</span>
        </div>
      </div>

      {/* Category Tabs for Quick Mobile Filtering */}
      <div className="flex gap-1.5 mb-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95 ${
            filter === "all"
              ? "bg-cyan-500 text-slate-950 shadow-sm"
              : "bg-slate-800/60 text-slate-400 hover:text-white border border-slate-700/40"
          }`}
        >
          Svi (40)
        </button>
        <button
          type="button"
          onClick={() => setFilter("tech")}
          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95 ${
            filter === "tech"
              ? "bg-cyan-500 text-slate-950 shadow-sm"
              : "bg-slate-800/60 text-slate-400 hover:text-white border border-slate-700/40"
          }`}
        >
          Sajber & IT
        </button>
        <button
          type="button"
          onClick={() => setFilter("animals")}
          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95 ${
            filter === "animals"
              ? "bg-cyan-500 text-slate-950 shadow-sm"
              : "bg-slate-800/60 text-slate-400 hover:text-white border border-slate-700/40"
          }`}
        >
          Životinje
        </button>
        <button
          type="button"
          onClick={() => setFilter("heroes")}
          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95 ${
            filter === "heroes"
              ? "bg-cyan-500 text-slate-950 shadow-sm"
              : "bg-slate-800/60 text-slate-400 hover:text-white border border-slate-700/40"
          }`}
        >
          Heroji & Zvijezde
        </button>
      </div>

      {/* Touch-Friendly Grid (Optimized for Mobile Phones) */}
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 max-h-56 sm:max-h-64 overflow-y-auto p-2 rounded-2xl bg-slate-900/80 border border-slate-800 scrollbar-thin scrollbar-thumb-slate-700 touch-pan-y">
        {filteredAvatars.map((av) => {
          const isSelected = av.id === selectedAvatarId;
          return (
            <button
              key={av.id}
              type="button"
              onClick={() => onSelectAvatar(av)}
              className={`group relative flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-150 text-center active:scale-90 touch-manipulation ${
                isSelected
                  ? "bg-slate-800 ring-2 ring-cyan-400 shadow-lg shadow-cyan-500/25 scale-105 z-10"
                  : "bg-slate-800/40 hover:bg-slate-800/90 border border-slate-700/40 hover:border-slate-600"
              }`}
            >
              <div
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-xl sm:text-2xl bg-gradient-to-br ${av.bgColor} shadow-sm group-hover:scale-105 transition-transform`}
              >
                {av.emoji}
              </div>
              <span className="mt-1 text-[10px] font-medium text-slate-300 truncate max-w-full px-0.5">
                {av.label.split(" ")[1] || av.label}
              </span>
              {isSelected && (
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
