"use client";

import React from "react";
import { AVATARS, AvatarOption } from "@/data/avatars";
import { Check } from "lucide-react";

interface AvatarPickerProps {
  selectedAvatarId: string;
  onSelectAvatar: (avatar: AvatarOption) => void;
}

export function AvatarPicker({ selectedAvatarId, onSelectAvatar }: AvatarPickerProps) {
  return (
    <div className="w-full">
      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
        Izaberi svog avatara:
      </label>
      <div className="grid grid-cols-4 sm:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto p-1.5 rounded-2xl bg-slate-900/60 border border-slate-800 scrollbar-thin scrollbar-thumb-slate-700">
        {AVATARS.map((av) => {
          const isSelected = av.id === selectedAvatarId;
          return (
            <button
              key={av.id}
              type="button"
              onClick={() => onSelectAvatar(av)}
              className={`group relative flex flex-col items-center justify-center p-2.5 rounded-xl transition-all duration-200 text-center ${
                isSelected
                  ? "bg-slate-800 ring-2 ring-cyan-400 shadow-lg shadow-cyan-500/20 scale-[1.03]"
                  : "bg-slate-800/40 hover:bg-slate-800/90 border border-slate-700/40 hover:border-slate-600"
              }`}
            >
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center text-2xl bg-gradient-to-br ${av.bgColor} shadow-sm group-hover:scale-105 transition-transform`}
              >
                {av.emoji}
              </div>
              <span className="mt-1 text-[11px] font-medium text-slate-300 truncate max-w-full">
                {av.label.split(" ")[1] || av.label}
              </span>
              {isSelected && (
                <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
