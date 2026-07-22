"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Trophy, CheckCircle2, ShieldCheck, Coins } from "lucide-react";
import confetti from "canvas-confetti";

function MiniResultCoinImage({ isHeads, skinId }) {
  const isUSD = skinId === "usdollar" || skinId === "usd";

  let imgSrc = isHeads ? "/images/coin/ruble_heads.png" : "/images/coin/ruble_tails.png";
  let altText = isHeads ? "Heads (Eagle)" : "Tails (5 РУБЛЕЙ)";
  let imgScale = "scale-100";

  if (isUSD) {
    imgSrc = isHeads ? "/images/coin/usdollar_heads.jpg" : "/images/coin/usdollar_tails.jpg";
    altText = isHeads ? "US Dollar Heads (1888 Liberty)" : "US Dollar Tails (Statue of Liberty $1)";
    imgScale = isHeads ? "scale-[1.05]" : "scale-[1.18]";
  }

  const [hasError, setHasError] = useState(false);

  return (
    <div className="relative flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-full overflow-hidden shadow-xl ring-2 ring-[var(--primary)]/30 bg-gradient-to-br from-amber-200 via-amber-400 to-amber-700 transition-transform hover:scale-105">
      {!hasError ? (
        <img
          src={imgSrc}
          alt={altText}
          onError={() => setHasError(true)}
          className={`h-full w-full object-cover rounded-full ${imgScale}`}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center font-black text-xl text-white">
          {isHeads ? "H" : "T"}
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/25 to-transparent" />
    </div>
  );
}

export default function ResultReveal({
  face,
  flipping,
  flippedThisSession,
  series,
  reducedMotion,
  multiResults = [],
  coinCount = 1,
  skinId = "rupee",
}) {
  const [showFlash, setShowFlash] = useState(false);

  useEffect(() => {
    if (!flipping && flippedThisSession) {
      const raf = requestAnimationFrame(() => setShowFlash(true));
      const timer = setTimeout(() => setShowFlash(false), 600);

      if (!reducedMotion) {
        if (series?.winner) {
          confetti({
            particleCount: 160,
            spread: 95,
            origin: { y: 0.5 },
          });
        } else {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.58 },
            colors: ["#FEF08A", "#EAB308", "#CA8A04", "#713F12"],
          });
        }
      }

      return () => {
        cancelAnimationFrame(raf);
        clearTimeout(timer);
      };
    }
  }, [flipping, flippedThisSession, series?.winner, face, reducedMotion]);

  const isHeads = face === "heads";
  const isUSD = skinId === "usdollar" || skinId === "usd";

  // Multi-coin stats calculation
  const headsCount = multiResults.filter((r) => r.face === "heads").length;
  const tailsCount = multiResults.length - headsCount;

  const headsLabel = isUSD ? "Obverse • 1888 Liberty Head & 13 Stars" : "Obverse • Double-Headed Eagle & ПЯТЬ РУБЛЕЙ";
  const tailsLabel = isUSD ? "Reverse • Statue of Liberty & $1 UNITED STATES" : "Reverse • 5 РУБЛЕЙ & Floral Motif";

  return (
    <div className="relative my-4 flex flex-col items-center justify-center min-h-[100px] w-full max-w-xl">
      {/* Dynamic Light Flash Background Glow */}
      <AnimatePresence>
        {showFlash && !reducedMotion && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.8, scale: 1.25 }}
            exit={{ opacity: 0, scale: 1.5 }}
            transition={{ duration: 0.5 }}
            className="pointer-events-none absolute -inset-6 rounded-3xl bg-gradient-to-r from-[var(--primary)]/30 via-amber-400/20 to-[var(--secondary)]/30 blur-2xl"
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {flipping ? (
          <motion.div
            key="flipping"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="flex items-center gap-3 rounded-full bg-[var(--card)] px-6 py-2.5 border border-[var(--primary)]/30 shadow-md"
          >
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--foreground)]">
              Flipping {coinCount > 1 ? `${coinCount} Coins...` : "3D Coin..."}
            </span>
          </motion.div>
        ) : flippedThisSession ? (
          <motion.div
            key={`result-${face}-${coinCount}`}
            initial={{ opacity: 0, scale: 0.65, y: 24, rotateX: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 20 }}
            className="relative w-full flex flex-col items-center"
          >
            {coinCount > 1 ? (
              /* MULTI COIN TOSS RESULT CARD */
              <div className="relative flex flex-col items-center gap-4 rounded-3xl bg-[var(--card)]/95 backdrop-blur-md p-5 sm:p-6 shadow-2xl border border-[var(--primary)]/30 w-full">
                <div className="flex items-center justify-between w-full border-b border-[var(--border)] pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-[var(--primary)]" />
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--foreground)]">
                      Multi Toss Results ({coinCount} Coins)
                    </span>
                  </div>
                  <span className="text-xs font-extrabold rounded-full bg-[var(--anslation-ds-primary-soft)] px-3 py-1 text-[var(--primary)] border border-[var(--primary)]/20">
                    {Math.round((headsCount / coinCount) * 100)}% Heads
                  </span>
                </div>

                {/* Big Score Breakdown */}
                <div className="grid grid-cols-2 gap-4 w-full text-center">
                  <div className="flex flex-col items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 p-3.5">
                    <span className="text-xs font-black uppercase text-amber-600 dark:text-amber-400">Heads</span>
                    <span className="text-3xl font-black text-amber-600 dark:text-amber-400">{headsCount}</span>
                    <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300">
                      {Math.round((headsCount / coinCount) * 100)}%
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/30 p-3.5">
                    <span className="text-xs font-black uppercase text-blue-600 dark:text-blue-400">Tails</span>
                    <span className="text-3xl font-black text-blue-600 dark:text-blue-400">{tailsCount}</span>
                    <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300">
                      {Math.round((tailsCount / coinCount) * 100)}%
                    </span>
                  </div>
                </div>

                {/* Individual Coin Badges Pill List */}
                <div className="flex flex-wrap items-center justify-center gap-2 w-full pt-1">
                  {multiResults.map((r, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-extrabold border ${
                        r.face === "heads"
                          ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/40"
                          : "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/40"
                      }`}
                    >
                      <Coins className="h-3.5 w-3.5" />
                      <span>Coin #{idx + 1}: {r.face.toUpperCase()}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* SINGLE COIN TOSS RESULT CARD */
              <div className="relative flex items-center gap-4 sm:gap-6 rounded-3xl bg-[var(--card)]/90 backdrop-blur-md px-6 py-4 sm:px-8 sm:py-5 shadow-2xl border border-[var(--primary)]/30 w-full justify-center">
                {/* Result-based Mini Coin Image */}
                <MiniResultCoinImage isHeads={isHeads} skinId={skinId} />

                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.25em] text-[var(--primary)] mb-0.5">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Fair Toss Result</span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black tracking-widest text-[var(--foreground)] sm:text-4xl drop-shadow-sm">
                      {isHeads ? "HEADS" : "TAILS"}
                    </span>
                    <CheckCircle2 className="h-5 w-5 text-[var(--anslation-ds-success)] shrink-0" />
                  </div>

                  <div className="mt-1 flex items-center gap-1.5 rounded-lg bg-[var(--anslation-ds-primary-soft)] px-3 py-1 text-[11px] font-extrabold text-[var(--primary)] border border-[var(--primary)]/20">
                    <span>
                      {isHeads ? headsLabel : tailsLabel}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Winner of Best-of series alert */}
            {series?.winner && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="mt-3.5 flex items-center gap-2 rounded-full bg-[var(--anslation-ds-success-soft)] px-6 py-2 border border-[var(--anslation-ds-success)]/40 text-[var(--anslation-ds-success)] font-extrabold text-xs shadow-md"
              >
                <Trophy className="h-4 w-4" />
                <span>
                  {series.winner === "heads" ? "Heads" : "Tails"} Wins Series ({series.heads}-{series.tails})!
                </span>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 rounded-full bg-[var(--card)] px-5 py-2 border border-[var(--border)] text-[11px] font-bold uppercase tracking-widest text-[var(--muted-foreground)] shadow-sm"
          >
            <Sparkles className="h-3.5 w-3.5 text-[var(--primary)]" />
            <span>Ready for Toss</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
