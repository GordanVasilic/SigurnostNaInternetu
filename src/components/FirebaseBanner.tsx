"use client";

import React, { useState } from "react";
import { isFirebaseConfigured } from "@/lib/firebase";
import { Wifi, CheckCircle2, ChevronDown, ChevronUp, ExternalLink, Sparkles } from "lucide-react";

export function FirebaseBanner() {
  const [expanded, setExpanded] = useState(false);

  if (isFirebaseConfigured) {
    return (
      <div className="w-full bg-emerald-950/40 border-b border-emerald-800/40 px-4 py-1.5 text-xs text-emerald-300 flex items-center justify-center gap-2">
        <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
        <span className="font-semibold">Firebase WebSockets sinhronizacija je AKTIVNA.</span>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-900 border-b border-cyan-800/40 px-4 py-2 text-xs text-slate-300">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong className="text-white">Ugrađeni Vercel Serverless backend je AKTIVAN:</strong>{" "}
            Kviz radi direktno na svim telefonima i računarima <strong>bez ikakve potrebe za Firebase nalogom</strong>!
          </span>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-cyan-400 hover:text-cyan-300 underline font-semibold flex items-center gap-1 shrink-0"
        >
          {expanded ? "Zatvori" : "Opcije (Firebase/KV)"}
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {expanded && (
        <div className="max-w-4xl mx-auto mt-3 p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Da li vam je potreban Firebase?</span>
          </div>
          <p>
            <strong>NE, nije obavezan!</strong> Aplikacija sada ima sopstveni ugrađeni backend (<code>/api/quiz</code>) koji automatski sinhronizuje sve telefone u razredu svakih 1000ms. Čim postavite projekat na Vercel, sve radi odmah "iz kutije" sa 0 podešavanja.
          </p>
          <p className="text-slate-400">
            Ako ikada poželite preći na WebSocket vezu ispod 50ms, možete opciono povezati besplatnu bazu na{" "}
            <a
              href="https://console.firebase.google.com"
              target="_blank"
              rel="noreferrer"
              className="text-cyan-400 hover:underline inline-flex items-center gap-0.5"
            >
              console.firebase.google.com <ExternalLink className="w-3 h-3" />
            </a>, ali za školsku prezentaciju i kviz ovo uopšte nije neophodno!
          </p>
        </div>
      )}
    </div>
  );
}
