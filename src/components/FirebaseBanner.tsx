"use client";

import React, { useState } from "react";
import { isFirebaseConfigured } from "@/lib/firebase";
import { Wifi, AlertTriangle, ChevronDown, ChevronUp, CheckCircle, ExternalLink } from "lucide-react";

export function FirebaseBanner() {
  const [expanded, setExpanded] = useState(false);

  if (isFirebaseConfigured) {
    return (
      <div className="w-full bg-emerald-950/40 border-b border-emerald-800/40 px-4 py-1.5 text-xs text-emerald-300 flex items-center justify-center gap-2">
        <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
        <span className="font-semibold">Firebase sinhronizacija u realnom vremenu je AKTIVNA.</span>
      </div>
    );
  }

  return (
    <div className="w-full bg-amber-950/50 border-b border-amber-800/60 px-4 py-2 text-xs text-amber-200">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Režim lokalne simulacije:</strong> Aplikacija trenutno koristi lokalnu sinhronizaciju (tabovi u istom pregledaču). Za sinhronizaciju više mobilnih telefona u razredu, povežite besplatan Firebase.
          </span>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-amber-300 hover:text-white underline font-semibold flex items-center gap-1 shrink-0"
        >
          {expanded ? "Sakrij" : "Uputstvo (2 min)"}
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {expanded && (
        <div className="max-w-4xl mx-auto mt-3 p-4 rounded-xl bg-slate-900/90 border border-amber-700/50 text-slate-300 space-y-2 text-xs">
          <p className="font-bold text-white text-sm">
            Kako povezati besplatnu Google Firebase bazu za 2 minuta (nije potrebna kartica):
          </p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>
              Otvorite{" "}
              <a
                href="https://console.firebase.google.com"
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:underline inline-flex items-center gap-0.5"
              >
                console.firebase.google.com <ExternalLink className="w-3 h-3" />
              </a>{" "}
              i kliknite <strong>Add project</strong> (nazovite npr. <em>sigurnost-kviz</em>).
            </li>
            <li>
              U lijevom meniju idite na <strong>Build → Realtime Database</strong>, kliknite <strong>Create Database</strong> i izaberite <strong>Start in test mode</strong>.
            </li>
            <li>
              U podešavanjima projekta (ikona zupčanika → <em>Project Settings</em>) dodajte Web aplikaciju (&lt;/&gt;), kopirajte podatke i upišite ih u <code>.env.local</code> ili na Vercel Environment Variables.
            </li>
          </ol>
          <div className="pt-2 flex items-center gap-2 text-emerald-400 font-semibold">
            <CheckCircle className="w-4 h-4" />
            <span>Čim unesete podatke, svi telefoni u učionici će raditi trenutno sinhronizovano!</span>
          </div>
        </div>
      )}
    </div>
  );
}
