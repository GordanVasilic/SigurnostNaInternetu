"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Copy, Check, ExternalLink, QrCode as QrIcon } from "lucide-react";

interface QRCodeDisplayProps {
  url?: string;
  size?: number;
}

export function QRCodeDisplay({ url, size = 260 }: QRCodeDisplayProps) {
  const [targetUrl, setTargetUrl] = useState(url || "");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!url && typeof window !== "undefined") {
      setTargetUrl(window.location.origin);
    } else if (url) {
      setTargetUrl(url);
    }
  }, [url]);

  useEffect(() => {
    if (!targetUrl) return;

    QRCode.toDataURL(targetUrl, {
      width: size,
      margin: 2,
      color: {
        dark: "#0f172a", // Slate-900
        light: "#ffffff",
      },
    })
      .then((dataUri) => {
        setQrDataUrl(dataUri);
      })
      .catch((err) => {
        console.error("Greška pri kreiranju QR koda:", err);
      });
  }, [targetUrl, size]);

  const handleCopyLink = async () => {
    if (!targetUrl) return;
    try {
      await navigator.clipboard.writeText(targetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex flex-col items-center p-6 bg-slate-900/90 rounded-3xl border border-slate-800 shadow-2xl max-w-sm w-full">
      <div className="flex items-center gap-2 mb-3 text-cyan-400 font-bold text-sm tracking-wide uppercase">
        <QrIcon className="w-5 h-5" />
        <span>Skeniraj za ulazak u kviz</span>
      </div>

      {/* QR Code Container */}
      <div className="p-4 bg-white rounded-2xl shadow-inner border-4 border-cyan-500/30 flex items-center justify-center">
        {qrDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={qrDataUrl}
            alt="QR kod za pristup kvizu"
            width={size}
            height={size}
            className="rounded-lg"
          />
        ) : (
          <div
            style={{ width: size, height: size }}
            className="flex items-center justify-center text-slate-400 animate-pulse text-sm"
          >
            Generišem QR kod...
          </div>
        )}
      </div>

      {/* URL text & Copy Button */}
      <div className="mt-4 w-full flex items-center gap-2 bg-slate-800/80 p-2 rounded-xl border border-slate-700/60">
        <span className="text-xs text-slate-300 font-mono truncate flex-1 px-2">
          {targetUrl || "Učitavanje linka..."}
        </span>
        <button
          onClick={handleCopyLink}
          className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1 transition-all shadow-sm active:scale-95"
          title="Kopiraj link"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 stroke-[3]" /> Kopirano
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" /> Kopiraj
            </>
          )}
        </button>
      </div>

      <p className="text-[12px] text-slate-400 mt-2 text-center">
        Drugari mogu usmjeriti kameru telefona prema ovom QR kodu da se odmah priključe.
      </p>
    </div>
  );
}
