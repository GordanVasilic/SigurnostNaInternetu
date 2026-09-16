"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import {
  Copy,
  Check,
  QrCode as QrIcon,
  Maximize2,
  Minimize2,
  Download,
  Share2,
  X,
  ExternalLink,
} from "lucide-react";

interface QRCodeDisplayProps {
  url?: string;
  size?: number;
}

export function QRCodeDisplay({ url, size = 260 }: QRCodeDisplayProps) {
  const [targetUrl, setTargetUrl] = useState(url || "");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [largeQrDataUrl, setLargeQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [shareFeedback, setShareFeedback] = useState("");

  useEffect(() => {
    if (!url && typeof window !== "undefined") {
      setTargetUrl(window.location.origin);
    } else if (url) {
      setTargetUrl(url);
    }
  }, [url]);

  useEffect(() => {
    if (!targetUrl) return;

    // Generate normal QR code
    QRCode.toDataURL(targetUrl, {
      width: size,
      margin: 2,
      color: {
        dark: "#0f172a", // Slate-900
        light: "#ffffff",
      },
    })
      .then((dataUri) => setQrDataUrl(dataUri))
      .catch((err) => console.error("Greška pri kreiranju QR koda:", err));

    // Generate high-resolution large QR code for fullscreen and download
    QRCode.toDataURL(targetUrl, {
      width: 700,
      margin: 3,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
    })
      .then((dataUri) => setLargeQrDataUrl(dataUri))
      .catch((err) => console.error("Greška pri kreiranju velikog QR koda:", err));
  }, [targetUrl, size]);

  // Handle ESC key to close fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

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

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = largeQrDataUrl || qrDataUrl;
    link.download = "sigurnost-na-internetu-qr-kod.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Kviz: Sigurnost na Internetu (9. razred)",
          text: "Drugari, priključite se kvizu o sigurnosti na internetu!",
          url: targetUrl,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      await handleCopyLink();
      setShareFeedback("Link je kopiran! Pošaljite ga u Viber / WhatsApp grupu.");
      setTimeout(() => setShareFeedback(""), 3500);
    }
  };

  return (
    <>
      {/* Standard Card Display */}
      <div className="flex flex-col items-center p-5 sm:p-6 bg-slate-900/90 rounded-3xl border border-slate-800 shadow-2xl max-w-sm w-full">
        <div className="flex items-center justify-between w-full mb-3 text-cyan-400 font-bold text-xs uppercase tracking-wider">
          <div className="flex items-center gap-1.5">
            <QrIcon className="w-4 h-4" />
            <span>Skeniraj za ulazak</span>
          </div>

          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-[11px] font-semibold border border-slate-700"
            title="Prikaži preko cijelog ekrana"
          >
            <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Cijeli ekran</span>
          </button>
        </div>

        {/* QR Code Container with Click-to-Fullscreen */}
        <div
          onClick={() => setIsFullscreen(true)}
          className="cursor-pointer group relative p-3 sm:p-4 bg-white rounded-2xl shadow-inner border-4 border-cyan-500/30 flex items-center justify-center transition-transform hover:scale-[1.02]"
        >
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

          <div className="absolute inset-0 bg-slate-950/40 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <span className="px-3 py-1.5 rounded-full bg-slate-900 text-cyan-300 text-xs font-bold shadow-lg flex items-center gap-1.5 border border-cyan-500/50">
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Klikni za uvećanje</span>
            </span>
          </div>
        </div>

        {/* Action Buttons: Preuzmi & Podijeli */}
        <div className="grid grid-cols-2 gap-2 w-full mt-3.5">
          <button
            type="button"
            onClick={handleDownload}
            disabled={!qrDataUrl}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-xs font-bold text-slate-200 border border-slate-700 transition-all"
            title="Preuzmi sliku QR koda kao PNG"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Preuzmi sliku</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-95 text-xs font-bold text-slate-950 transition-all shadow-md shadow-cyan-500/20"
            title="Pošalji link u Viber/WhatsApp grupu"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-950" />
            <span>Podijeli u grupu</span>
          </button>
        </div>

        {/* Share Feedback Notice */}
        {shareFeedback && (
          <div className="mt-2 w-full p-2 rounded-xl bg-cyan-950/80 border border-cyan-800 text-cyan-300 text-[11px] text-center font-semibold animate-in fade-in">
            {shareFeedback}
          </div>
        )}

        {/* URL text & Copy Button */}
        <div className="mt-3 w-full flex items-center gap-2 bg-slate-800/80 p-2 rounded-xl border border-slate-700/60">
          <span className="text-xs text-slate-300 font-mono truncate flex-1 px-2">
            {targetUrl || "Učitavanje linka..."}
          </span>
          <button
            type="button"
            onClick={handleCopyLink}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all shadow-sm active:scale-95"
            title="Kopiraj link"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3] text-emerald-400" />
                <span className="text-emerald-400">Kopirano</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Kopiraj</span>
              </>
            )}
          </button>
        </div>

        <p className="text-[11px] text-slate-400 mt-2 text-center">
          Usmjerite kameru telefona ili podijelite link drugarima u Viber/WhatsApp grupu.
        </p>
      </div>

      {/* ================= FULLSCREEN MODAL FOR PROJECTOR / SMARTBOARD ================= */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-2xl flex flex-col items-center justify-between p-4 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
          {/* Fullscreen Header */}
          <div className="w-full max-w-4xl flex items-center justify-between pt-2">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 text-xs font-bold uppercase tracking-wider mb-1">
                <QrIcon className="w-4 h-4" />
                <span>OŠ Petar Petrović Njegoš Banja Luka</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white">
                Skeniraj i priključi se kvizu! 📱
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              className="p-2.5 sm:p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors flex items-center gap-2 text-sm font-bold"
              title="Zatvori (Esc)"
            >
              <X className="w-6 h-6" />
              <span className="hidden sm:inline">Zatvori</span>
            </button>
          </div>

          {/* Huge QR Code in Center */}
          <div className="flex flex-col items-center justify-center my-auto">
            <div className="p-6 sm:p-8 bg-white rounded-3xl shadow-2xl border-8 border-cyan-500/40">
              {largeQrDataUrl || qrDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={largeQrDataUrl || qrDataUrl}
                  alt="Veliki QR kod za projektor"
                  className="w-[280px] h-[280px] sm:w-[420px] sm:h-[420px] md:w-[480px] md:h-[480px] object-contain rounded-xl"
                />
              ) : (
                <div className="w-[300px] h-[300px] flex items-center justify-center text-slate-500">
                  Učitavanje...
                </div>
              )}
            </div>

            <div className="mt-4 text-center">
              <span className="text-base sm:text-2xl font-mono font-bold text-cyan-300 bg-slate-900/80 px-4 py-1.5 rounded-xl border border-slate-800">
                {targetUrl}
              </span>
              <p className="text-slate-400 text-xs sm:text-sm mt-2">
                Otvorite kameru na telefonu i usmjerite prema ekranu.
              </p>
            </div>
          </div>

          {/* Fullscreen Footer Controls */}
          <div className="flex flex-wrap items-center justify-center gap-3 pb-2">
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs sm:text-sm font-bold border border-slate-700 transition-all active:scale-95"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Preuzmi sliku QR koda</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs sm:text-sm font-black transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
            >
              <Share2 className="w-4 h-4" />
              <span>Podijeli u Viber / WhatsApp grupu</span>
            </button>

            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs sm:text-sm font-semibold border border-slate-800 transition-colors"
            >
              <Minimize2 className="w-4 h-4" />
              <span>Smanji</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
