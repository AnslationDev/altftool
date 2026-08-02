"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Coins,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Eye,
  EyeOff,
  Layers,
  RotateCcw,
  Check,
  Zap,
  Trophy,
} from "lucide-react";

import Coin3D from "../components/Coin3D";
import ResultReveal from "../components/ResultReveal";
import HistorySection from "../components/HistorySection";
import StatsSection from "../components/StatsSection";

import { soundEngine } from "../utils/audio";
import { COIN_SKINS, getSkin } from "../utils/coinSkins";

const STORAGE_KEY = "altf:coin-flip:stats";
const MUTE_KEY = "altf:coin-flip:sound-muted";
const SKIN_KEY = "altf:coin-flip:selected-skin";

const seriesOptions = [3, 5, 7, 9];

const emptyStats = {
  flips: 0,
  heads: 0,
  tails: 0,
  currentSide: null,
  currentLength: 0,
  bestSide: null,
  bestLength: 0,
  history: [],
};

// Cryptographically fair random flip logic
function fairFlip() {
  if (typeof window !== "undefined" && window.crypto?.getRandomValues) {
    const buffer = new Uint32Array(1);
    window.crypto.getRandomValues(buffer);
    return buffer[0] % 2 === 0 ? "heads" : "tails";
  }
  return Math.random() < 0.5 ? "heads" : "tails";
}
function sanitizeStats(raw) {
  if (!raw || typeof raw !== "object") return null;
  const asCount = (value) => (Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0);
  const asSide = (value) => (value === "heads" || value === "tails" ? value : null);
  return {
    flips: asCount(raw.flips),
    heads: asCount(raw.heads),
    tails: asCount(raw.tails),
    currentSide: asSide(raw.currentSide),
    currentLength: asCount(raw.currentLength),
    bestSide: asSide(raw.bestSide),
    bestLength: asCount(raw.bestLength),
    history: Array.isArray(raw.history)
      ? raw.history.map((item) => (item === "H" || item === "heads" ? "H" : "T")).slice(-30)
      : [],
  };
}

export default function ToolHome() {
  const [mode, setMode] = useState("single");
  const [series, setSeries] = useState(null);
  const [face, setFace] = useState("heads");
  const [rotation, setRotation] = useState(0);
  const [flipping, setFlipping] = useState(false);
  const [stats, setStats] = useState(emptyStats);
  const [flippedThisSession, setFlippedThisSession] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Redesign state additions
  const [skinId, setSkinId] = useState("rupee");
  const [soundMuted, setSoundMuted] = useState(false);
  const [autoFlip, setAutoFlip] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Webutility.io Multi-Coin state
  const [coinCount, setCoinCount] = useState(1);
  const [multiResults, setMultiResults] = useState([{ face: "heads" }]);

  const changeCoinCount = (num) => {
    soundEngine.playClick();
    setCoinCount(num);
    setMultiResults(Array.from({ length: num }, () => ({ face: face })));
  };

  const timersRef = useRef({ flip: null, auto: null });

  const calculateNextSeries = (result) => {
    let nextState = null;
    setSeries((prev) => {
      if (!prev || prev.winner) return prev;
      const heads = prev.heads + (result === "heads" ? 1 : 0);
      const tails = prev.tails + (result === "tails" ? 1 : 0);
      const need = Math.ceil(prev.target / 2);
      const winner = heads >= need ? "heads" : tails >= need ? "tails" : null;
      nextState = { ...prev, heads, tails, winner };
      return nextState;
    });
    return nextState;
  };

  const settleMultiFlip = (resultsList, primaryResult, nextSeriesState) => {
    setFace(primaryResult);
    setFlippedThisSession(true);

    const headsCount = resultsList.filter((r) => r.face === "heads").length;
    const tailsCount = resultsList.length - headsCount;

    setStats((prev) => {
      const streak = prev.currentSide === primaryResult ? prev.currentLength + 1 : 1;
      const newHistoryEntries = resultsList.map((r) => (r.face === "heads" ? "H" : "T"));
      return {
        flips: prev.flips + resultsList.length,
        heads: prev.heads + headsCount,
        tails: prev.tails + tailsCount,
        currentSide: primaryResult,
        currentLength: streak,
        bestSide: streak > prev.bestLength ? primaryResult : prev.bestSide,
        bestLength: Math.max(prev.bestLength, streak),
        history: [...prev.history, ...newHistoryEntries].slice(-30),
      };
    });

    // Play land & victory sounds
    soundEngine.playLand();
    if (nextSeriesState?.winner) {
      soundEngine.playWin();
    }
  };

  const flipCoin = () => {
    if (flipping || series?.winner) return;

    soundEngine.playClick();
    soundEngine.playFlip();

    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([20, 50, 20]);
    }

    const newMulti = Array.from({ length: coinCount }, () => ({
      face: fairFlip(),
    }));

    const primaryResult = newMulti[0].face;
    const halfTurn = primaryResult === face ? 0 : 180;
    const spins = reducedMotion ? 180 : 1800;
    setRotation((prev) => prev + spins + halfTurn);
    setMultiResults(newMulti);

    if (!reducedMotion) {
      setTimeout(() => soundEngine.playWhoosh(), 300);
      setTimeout(() => soundEngine.playWhoosh(), 900);
    }

    if (reducedMotion) {
      const nextSeries = calculateNextSeries(primaryResult);
      settleMultiFlip(newMulti, primaryResult, nextSeries);
      return;
    }

    setFlipping(true);

    timersRef.current.flip = setTimeout(() => {
      timersRef.current.flip = null;
      setFlipping(false);
      const nextSeries = calculateNextSeries(primaryResult);
      settleMultiFlip(newMulti, primaryResult, nextSeries);
    }, 2200);
  };

  // Initialize storage & preferences
  useEffect(() => {
    try {
      const rawStats = window.localStorage.getItem(STORAGE_KEY);
      if (rawStats) {
        const parsed = sanitizeStats(JSON.parse(rawStats));
        if (parsed) {
          requestAnimationFrame(() => setStats(parsed));
        }
      }

      const rawMute = window.localStorage.getItem(MUTE_KEY);
      if (rawMute) {
        const isMuted = JSON.parse(rawMute);
        requestAnimationFrame(() => setSoundMuted(isMuted));
        soundEngine.setMuted(isMuted);
      }

      const rawSkin = window.localStorage.getItem(SKIN_KEY);
      if (rawSkin) {
        requestAnimationFrame(() => {
          setSkinId(rawSkin);
        });
      }

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        requestAnimationFrame(() => setReducedMotion(true));
      }
    } catch {
      /* ignore corrupted storage */
    }

    setHydrated(true);
    soundEngine.playAmbient();
  }, []);

  // Sync stats to localStorage
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch {
      /* storage unavailable */
    }
  }, [stats, hydrated]);

  // Sync mute state
  useEffect(() => {
    soundEngine.setMuted(soundMuted);
    try {
      window.localStorage.setItem(MUTE_KEY, JSON.stringify(soundMuted));
    } catch {
      /* ignore */
    }
  }, [soundMuted]);

  // Mobile Shake Sensor Detection
  useEffect(() => {
    if (typeof window === "undefined" || !("DeviceMotionEvent" in window)) return undefined;

    const handleMotion = (event) => {
      const acc = event.accelerationIncludingGravity;
      if (!acc) return;
      const totalAcc = Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z);
      const now = Date.now();

      if (totalAcc > 22 && now - (timersRef.current.shake || 0) > 1500) {
        timersRef.current.shake = now;
        if (!flipping && !series?.winner) {
          flipCoin();
        }
      }
    };

    window.addEventListener("devicemotion", handleMotion);
    return () => window.removeEventListener("devicemotion", handleMotion);
  }, [flipping, series, reducedMotion, face]);

  // Auto-Flip interval handler
  useEffect(() => {
    if (!autoFlip) {
      if (timersRef.current.auto) clearInterval(timersRef.current.auto);
      return undefined;
    }

    timersRef.current.auto = setInterval(() => {
      if (!flipping && !series?.winner) {
        flipCoin();
      } else if (series?.winner) {
        setAutoFlip(false);
      }
    }, 3600);

    return () => {
      if (timersRef.current.auto) clearInterval(timersRef.current.auto);
    };
  }, [autoFlip, flipping, series, reducedMotion, face]);

  // Cleanup timers on unmount
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      if (timers.flip) clearTimeout(timers.flip);
      if (timers.auto) clearInterval(timers.auto);
    };
  }, []);

  const selectMode = (nextMode) => {
    if (flipping) return;
    soundEngine.playClick();
    setMode(nextMode);
    setSeries(
      nextMode === "single" ? null : { target: nextMode, heads: 0, tails: 0, winner: null }
    );
  };

  const selectSkin = (id) => {
    soundEngine.playClick();
    setSkinId(id);
    try {
      window.localStorage.setItem(SKIN_KEY, id);
    } catch {
      /* ignore */
    }
  };

  const startNewSeries = () => {
    if (flipping || mode === "single") return;
    soundEngine.playClick();
    setSeries({ target: mode, heads: 0, tails: 0, winner: null });
  };

  const resetStats = () => {
    if (
      typeof window !== "undefined" &&
      !window.confirm(
        "Reset all coin flip stats? This clears your total flips, heads/tails tally, current and best streaks, and the recent toss history. This cannot be undone.",
      )
    ) {
      return;
    }
    soundEngine.playClick();
    setStats(emptyStats);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* storage unavailable */
    }
  };

  const activeSkin = getSkin(skinId);
  const seriesRound = series ? Math.min(series.heads + series.tails + (series.winner ? 0 : 1), series.target) : 0;

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* SAAS HERO HEADLINE SECTION */}
        <section className="py-6 sm:py-10 text-center">
          <div className="mx-auto max-w-3xl flex flex-col items-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--primary)]/20 bg-[var(--anslation-ds-primary-soft)] px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--primary)] shadow-sm">
              <Coins className="h-4 w-4" />
              <span>Interactive 3D Coin Toss</span>
            </div>

            <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl lg:text-7xl leading-tight">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 via-teal-500 to-emerald-500 dark:from-blue-400 dark:via-purple-400 dark:via-teal-300 dark:to-emerald-400 bg-clip-text text-transparent drop-shadow-sm">
                Coin Flip Simulator
              </span>
            </h1>

            <div className="mt-3.5 h-1.5 w-28 rounded-full bg-gradient-to-r from-blue-600 via-purple-600 via-teal-500 to-emerald-500 shadow-md" />

            <p className="mt-4 max-w-2xl text-base text-[var(--muted-foreground)] sm:text-lg">
              Flip a realistic 3D coin with physical rotation, custom coin skins, Web Audio sound effects &amp; toss history.
            </p>

            {/* Header Control Buttons */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setSoundMuted(!soundMuted)}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition border ${soundMuted
                  ? "bg-[var(--muted)] text-[var(--muted-foreground)] border-[var(--border)]"
                  : "bg-[var(--anslation-ds-primary-soft)] text-[var(--primary)] border-[var(--primary)]/40"
                  }`}
              >
                {soundMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                {soundMuted ? "Sound Off" : "Sound On"}
              </button>

              <button
                type="button"
                onClick={() => setReducedMotion(!reducedMotion)}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition border ${reducedMotion
                  ? "bg-[var(--anslation-ds-secondary-soft)] text-[var(--secondary)] border-[var(--secondary)]/40"
                  : "bg-[var(--background)] text-[var(--muted-foreground)] border-[var(--border)]"
                  }`}
              >
                {reducedMotion ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                {reducedMotion ? "Reduced Motion" : "Full 3D FX"}
              </button>
            </div>
          </div>
        </section>

        {/* 3D COIN STAGE AREA */}
        <section className="mt-6 flex flex-col items-center rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
          <Coin3D
            face={face}
            skinId={skinId}
            flipping={flipping}
            rotationY={rotation}
            reducedMotion={reducedMotion}
            onFlipTrigger={flipCoin}
            disabled={flipping || Boolean(series?.winner)}
          />

          {/* Outcome & Reveal */}
          <ResultReveal
            face={face}
            flipping={flipping}
            flippedThisSession={flippedThisSession}
            series={series}
            reducedMotion={reducedMotion}
            multiResults={multiResults}
            coinCount={coinCount}
            skinId={skinId}
          />

          {/* MAIN ACTION BAR */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 w-full max-w-md">
            <button
              type="button"
              onClick={flipCoin}
              disabled={flipping || Boolean(series?.winner)}
              className="group flex-1 min-w-[200px] h-12 inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-6 text-base font-bold text-[var(--primary-foreground)] shadow-[var(--anslation-ds-shadow-md)] transition hover:bg-[var(--primary-hover)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Coins className="h-5 w-5 transition-transform group-hover:rotate-12" />
              <span>{flipping ? "Flipping..." : "Flip Coin"}</span>
            </button>

            {/* Auto Flip Toggle */}
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setAutoFlip(!autoFlip);
              }}
              className={`inline-flex h-12 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold transition border ${autoFlip
                ? "bg-[var(--anslation-ds-success-soft)] text-[var(--anslation-ds-success)] border-[var(--anslation-ds-success)]/40 shadow-sm"
                : "bg-[var(--background)] text-[var(--foreground)] border-[var(--border)] hover:border-[var(--primary)]"
                }`}
            >
              {autoFlip ? <Pause className="h-4 w-4 text-[var(--anslation-ds-success)]" /> : <Play className="h-4 w-4" />}
              <span>Auto Flip</span>
            </button>
          </div>

          {/* COINS-TO-FLIP SELECTOR */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Coins to flip
            </span>
            <div className="flex flex-wrap items-center justify-center gap-1.5" role="group" aria-label="Number of coins to flip at once">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => changeCoinCount(n)}
                  disabled={flipping}
                  aria-pressed={coinCount === n}
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition border ${
                    coinCount === n
                      ? "border-[var(--primary)] bg-[var(--anslation-ds-primary-soft)] text-[var(--primary)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/60"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* MODE SEGMENTED CONTROL BAR */}
          <div className="mt-8 w-full max-w-2xl rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 sm:p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--anslation-ds-primary-soft)] text-[var(--primary)]">
                  <Coins className="h-4 w-4" />
                </div>
                <span className="text-sm font-extrabold uppercase tracking-wider text-[var(--foreground)]">
                  Select Flip Mode
                </span>
              </div>
              <span className="text-xs font-extrabold rounded-full bg-[var(--anslation-ds-primary-soft)] px-3 py-1 text-[var(--primary)] border border-[var(--primary)]/30">
                {mode === "single" ? "Single Toss Mode" : `Series: Best of ${mode}`}
              </span>
            </div>

            {/* Rich Mode Cards Grid */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
              <motion.button
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.96 }}
                type="button"
                onClick={() => selectMode("single")}
                className={`group relative flex flex-col items-center justify-center rounded-3xl p-4 sm:p-5 border transition text-center cursor-pointer shadow-sm ${mode === "single"
                    ? "border-[var(--primary)] bg-[var(--anslation-ds-primary-soft)] text-[var(--foreground)] font-extrabold shadow-xl ring-4 ring-[var(--primary)]/20"
                    : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/60 hover:text-[var(--foreground)] hover:shadow-lg"
                  }`}
              >
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full overflow-hidden mb-2 shadow-lg shrink-0 border border-black/10 transition-transform duration-300 group-hover:scale-105">
                  <img src="/images/coin/mode_single.png" alt="Single Toss" className="h-full w-full object-cover rounded-full" />
                </div>
                <span className="text-sm font-black tracking-tight">Single Toss</span>
                <span className="mt-1 rounded-full bg-[var(--anslation-ds-primary-soft)] px-2.5 py-0.5 text-[10px] font-extrabold text-[var(--primary)] border border-[var(--primary)]/20">
                  1 Quick Flip
                </span>
                {mode === "single" && (
                  <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center shadow-md">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </div>
                )}
              </motion.button>

              {seriesOptions.map((opt) => {
                const isSelected = mode === opt;
                const modeImgs = {
                  3: "/images/coin/mode_bestof3.png",
                  5: "/images/coin/mode_bestof5.png",
                  7: "/images/coin/mode_bestof7.png",
                  9: "/images/coin/mode_bestof9.png",
                };
                return (
                  <motion.button
                    key={opt}
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.96 }}
                    type="button"
                    onClick={() => selectMode(opt)}
                    className={`group relative flex flex-col items-center justify-center rounded-3xl p-4 sm:p-5 border transition text-center cursor-pointer shadow-sm ${isSelected
                        ? "border-[var(--primary)] bg-[var(--anslation-ds-primary-soft)] text-[var(--foreground)] font-extrabold shadow-xl ring-4 ring-[var(--primary)]/20"
                        : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/60 hover:text-[var(--foreground)] hover:shadow-lg"
                      }`}
                  >
                    <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full overflow-hidden mb-2 shadow-lg shrink-0 border border-black/10 transition-transform duration-300 group-hover:scale-105">
                      <img src={modeImgs[opt]} alt={`Best of ${opt}`} className="h-full w-full object-cover rounded-full" />
                    </div>
                    <span className="text-sm font-black tracking-tight">Best of {opt}</span>
                    <span className="mt-1 rounded-full bg-[var(--anslation-ds-primary-soft)] px-2.5 py-0.5 text-[10px] font-extrabold text-[var(--primary)] border border-[var(--primary)]/20">
                      First to {Math.ceil(opt / 2)}
                    </span>
                    {isSelected && (
                      <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center shadow-md">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Best of Series Live Scoreboard */}
            {series && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-5 rounded-2xl border border-[var(--primary)]/30 bg-[var(--background)] p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-extrabold border-b border-[var(--border)] pb-2.5 mb-3">
                  <span className="text-[var(--foreground)] flex items-center gap-1.5">
                    <Trophy className="h-4 w-4 text-[var(--primary)]" />
                    Best of {series.target} Series • Target: First to {Math.ceil(series.target / 2)} Wins
                  </span>
                  <span className="rounded-full bg-[var(--muted)] px-3 py-0.5 text-[11px] text-[var(--muted-foreground)]">
                    {series.winner ? "Series Finished" : `Toss ${seriesRound} of up to ${series.target}`}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-3">
                    <p className="text-[11px] font-black uppercase text-amber-600 dark:text-amber-400">Heads Wins</p>
                    <p className="text-3xl font-black text-amber-600 dark:text-amber-400">{series.heads}</p>
                  </div>
                  <div className="rounded-xl bg-blue-500/10 border border-blue-500/30 p-3">
                    <p className="text-[11px] font-black uppercase text-blue-600 dark:text-blue-400">Tails Wins</p>
                    <p className="text-3xl font-black text-blue-600 dark:text-blue-400">{series.tails}</p>
                  </div>
                </div>

                {series.winner && (
                  <div className="mt-4 text-center">
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      type="button"
                      onClick={startNewSeries}
                      className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-2 text-xs font-extrabold text-[var(--primary-foreground)] shadow-md transition hover:bg-[var(--primary-hover)] cursor-pointer"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Start Rematch Series
                    </motion.button>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* COIN SKINS SHELF */}
          <div className="mt-8 w-full max-w-4xl rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 sm:p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="flex items-center justify-between mb-4 border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-2 font-extrabold text-[var(--foreground)]">
                <Layers className="h-4.5 w-4.5 text-[var(--primary)]" />
                <span className="text-sm uppercase tracking-wider">Coin Skin Finish</span>
              </div>
              <span className="text-xs font-extrabold rounded-full bg-[var(--anslation-ds-primary-soft)] px-3 py-1 text-[var(--primary)] border border-[var(--primary)]/30">
                Active: <strong>{activeSkin.name}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4 lg:grid-cols-8">
              {COIN_SKINS.map((s) => {
                const isSelected = skinId === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => selectSkin(s.id)}
                    className={`group relative flex flex-col items-center justify-center rounded-2xl p-3 border transition cursor-pointer shadow-sm ${isSelected
                        ? "border-[var(--primary)] bg-[var(--anslation-ds-primary-soft)] text-[var(--primary)] font-extrabold shadow-lg ring-3 ring-[var(--primary)]/20"
                        : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/60 hover:shadow-md"
                      }`}
                  >
                    <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full overflow-hidden mb-1.5 shadow-md shrink-0 bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center text-xs font-black text-white border border-black/10 transition-transform duration-300 group-hover:scale-105">
                      <img
                        src={s.imageSrc}
                        alt={s.name}
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                        className="h-full w-full object-cover rounded-full"
                      />
                    </div>
                    <span className="text-xs font-extrabold truncate w-full text-center mt-1">
                      {s.name}
                    </span>
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center shadow-md">
                        <Check className="h-2.5 w-2.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* DASHBOARD SECTIONS */}
        <section className="mt-8 grid gap-6">
          <StatsSection stats={stats} onResetStats={resetStats} />
          <HistorySection history={stats.history} onClearHistory={resetStats} />
        </section>

        {/* FOOTER */}
        <footer className="mt-12 text-center text-xs text-[var(--muted-foreground)] border-t border-[var(--border)] pt-6">
          <p className="flex items-center justify-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-[var(--primary)]" />
            <strong>Cryptographically Fair:</strong> Powered by <code className="text-[var(--foreground)]">crypto.getRandomValues</code> with 50/50 probability.
          </p>
          <p className="mt-1">All stats and preferences are saved locally on your browser.</p>
        </footer>
      </div>
    </main>
  );
}
