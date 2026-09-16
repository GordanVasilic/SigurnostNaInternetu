"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, Volume2, VolumeX, Settings, Home } from "lucide-react";
import { toggleSound, isSoundEnabled } from "@/lib/sounds";

interface NavbarProps {
  showAdminLink?: boolean;
  showHomeLink?: boolean;
}

export function Navbar({ showAdminLink = false, showHomeLink = false }: NavbarProps) {
  const [soundOn, setSoundOn] = useState(true);

  useEffect(() => {
    setSoundOn(isSoundEnabled());
  }, []);

  const handleToggleSound = () => {
    const newState = toggleSound();
    setSoundOn(newState);
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/80 border-b border-slate-800 text-white shadow-sm">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-bold text-lg hover:opacity-90 transition-opacity"
        >
          <div className="p-2 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl shadow-md text-white">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300 bg-clip-text text-transparent font-black tracking-wide">
              SIGURNOST
            </span>{" "}
            <span className="text-slate-300 font-medium text-sm hidden sm:inline">
              | Edukativni Kviz
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleSound}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700/50"
            title={soundOn ? "Isključi zvuk" : "Uključi zvuk"}
            aria-label="Kontrola zvuka"
          >
            {soundOn ? <Volume2 className="w-5 h-5 text-cyan-400" /> : <VolumeX className="w-5 h-5 text-slate-500" />}
          </button>

          {showHomeLink && (
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-colors border border-slate-700"
            >
              <Home className="w-4 h-4 text-cyan-400" />
              <span>Početna</span>
            </Link>
          )}

          {showAdminLink && (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-colors border border-slate-700"
            >
              <Settings className="w-4 h-4 text-cyan-400" />
              <span>Admin</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
