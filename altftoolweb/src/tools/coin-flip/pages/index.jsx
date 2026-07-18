"use client";

import { useEffect, useRef, useState } from "react";
import { Coins, RotateCcw, Trophy } from "lucide-react";

const STORAGE_KEY = "altf:coin-flip:stats";
const seriesOptions = [3, 5, 7];

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
      ? raw.history.filter((item) => item === "H" || item === "T").slice(-30)
      : [],
  };
}

const sideLabel = (side) => (side === "heads" ? "Heads" : "Tails");

export default function ToolHome() {
  const [mode, setMode] = useState("single");
  const [series, setSeries] = useState(null);
  const [face, setFace] = useState("heads");
  const [rotation, setRotation] = useState(0);
  const [flipping, setFlipping] = useState(false);
  const [stats, setStats] = useState(emptyStats);
  const [flippedThisSession, setFlippedThisSession] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const timersRef = useRef({ flip: null });

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = sanitizeStats(JSON.parse(raw));
        if (parsed) setStats(parsed);
      }
    } catch {
      /* ignore corrupted storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch {
      /* storage unavailable */
    }
  }, [stats, hydrated]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      if (timers.flip) clearTimeout(timers.flip);
    };
  }, []);

  useEffect(() => {
    if (!series?.winner) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    let cancelled = false;
    import("canvas-confetti")
      .then((mod) => {
        if (!cancelled) mod.default({ particleCount: 140, spread: 75, origin: { y: 0.6 } });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [series]);

  const settleFlip = (result) => {
    setFace(result);
    setFlippedThisSession(true);
    setStats((prev) => {
      const streak = prev.currentSide === result ? prev.currentLength + 1 : 1;
      return {
        flips: prev.flips + 1,
        heads: prev.heads + (result === "heads" ? 1 : 0),
        tails: prev.tails + (result === "tails" ? 1 : 0),
        currentSide: result,
        currentLength: streak,
        bestSide: streak > prev.bestLength ? result : prev.bestSide,
        bestLength: Math.max(prev.bestLength, streak),
        history: [...prev.history, result === "heads" ? "H" : "T"].slice(-30),
      };
    });
    setSeries((prev) => {
      if (!prev || prev.winner) return prev;
      const heads = prev.heads + (result === "heads" ? 1 : 0);
      const tails = prev.tails + (result === "tails" ? 1 : 0);
      const need = Math.ceil(prev.target / 2);
      const winner = heads >= need ? "heads" : tails >= need ? "tails" : null;
      return { ...prev, heads, tails, winner };
    });
  };

  const flipCoin = () => {
    if (flipping || series?.winner) return;
    const result = fairFlip();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const halfTurn = result === face ? 0 : 180;
    setRotation((prev) => prev + (reduceMotion ? halfTurn : 1440 + halfTurn));
    if (reduceMotion) {
      settleFlip(result);
      return;
    }
    setFlipping(true);
    timersRef.current.flip = setTimeout(() => {
      timersRef.current.flip = null;
      setFlipping(false);
      settleFlip(result);
    }, 800);
  };

  const selectMode = (nextMode) => {
    if (flipping) return;
    setMode(nextMode);
    setSeries(nextMode === "single" ? null : { target: nextMode, heads: 0, tails: 0, winner: null });
  };

  const startNewSeries = () => {
    if (flipping || mode === "single") return;
    setSeries({ target: mode, heads: 0, tails: 0, winner: null });
  };

  const resetStats = () => {
    setStats(emptyStats);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* storage unavailable */
    }
  };

  const headsPct = stats.flips ? (stats.heads / stats.flips) * 100 : 0;
  const tailsPct = stats.flips ? 100 - headsPct : 0;
  const seriesRound = series ? Math.min(series.heads + series.tails + (series.winner ? 0 : 1), series.target) : 0;

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Coins className="h-4 w-4" />
            Games &amp; fun
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Coin Flip</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Settle any decision with a perfectly fair coin. Flip once or play a best-of series, and watch
            your heads-tails record, percentages, and streaks build up over time.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[420px_1fr]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <button
              type="button"
              onClick={flipCoin}
              disabled={flipping || Boolean(series?.winner)}
              aria-label="Flip the coin"
              className="mx-auto block rounded-full outline-none focus-visible:shadow-[var(--anslation-ds-focus-ring)] disabled:cursor-not-allowed"
            >
              <span className="block h-44 w-44 [perspective:1100px] sm:h-52 sm:w-52">
                <span
                  className="relative block h-full w-full transition-transform ease-out [transform-style:preserve-3d] [transition-duration:800ms] motion-reduce:transition-none"
                  style={{ transform: `rotateY(${rotation}deg)` }}
                >
                  <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-full border-4 border-[var(--primary)] bg-[var(--anslation-ds-primary-soft)] [backface-visibility:hidden]">
                    <span className="text-6xl font-bold text-[var(--primary)]">H</span>
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">
                      Heads
                    </span>
                  </span>
                  <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-full border-4 border-[var(--secondary)] bg-[var(--anslation-ds-secondary-soft)] [backface-visibility:hidden] [transform:rotateY(180deg)]">
                    <span className="text-6xl font-bold text-[var(--secondary)]">T</span>
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--secondary)]">
                      Tails
                    </span>
                  </span>
                </span>
              </span>
            </button>

            <p aria-live="polite" className="mt-5 text-center text-2xl font-semibold">
              {flipping ? (
                <span className="text-[var(--muted-foreground)]">Flipping...</span>
              ) : flippedThisSession ? (
                <span className="text-[var(--primary)]">{sideLabel(face)}!</span>
              ) : (
                <span className="text-[var(--muted-foreground)]">Flip to start</span>
              )}
            </p>

            <button
              type="button"
              onClick={flipCoin}
              disabled={flipping || Boolean(series?.winner)}
              className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[var(--primary)] text-base font-semibold text-[var(--primary-foreground)] transition hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Coins className="h-5 w-5" />
              {flipping ? "Flipping..." : "Flip coin"}
            </button>

            <div className="mt-5">
              <span className="text-sm font-semibold">Mode</span>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {["single", ...seriesOptions].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => selectMode(option)}
                    className={`rounded-md border px-2 py-2 text-sm font-semibold transition ${
                      mode === option
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                    }`}
                  >
                    {option === "single" ? "Single" : `Best of ${option}`}
                  </button>
                ))}
              </div>
            </div>

            {series && (
              <div className="mt-5 rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold">
                    Best of {series.target} - first to {Math.ceil(series.target / 2)}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {series.winner ? "Series over" : `Flip ${seriesRound} of up to ${series.target}`}
                  </p>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                  <div className="rounded-md bg-[var(--anslation-ds-primary-soft)] px-3 py-2">
                    <p className="text-xs font-semibold uppercase text-[var(--primary)]">Heads</p>
                    <p className="text-2xl font-semibold text-[var(--primary)]">{series.heads}</p>
                  </div>
                  <div className="rounded-md bg-[var(--anslation-ds-secondary-soft)] px-3 py-2">
                    <p className="text-xs font-semibold uppercase text-[var(--secondary)]">Tails</p>
                    <p className="text-2xl font-semibold text-[var(--secondary)]">{series.tails}</p>
                  </div>
                </div>
                {series.winner && (
                  <div className="mt-3 rounded-md bg-[var(--anslation-ds-success-soft)] p-3 text-center">
                    <p className="inline-flex items-center gap-2 font-semibold text-[var(--anslation-ds-success)]">
                      <Trophy className="h-4 w-4" />
                      {sideLabel(series.winner)} wins the series{" "}
                      {Math.max(series.heads, series.tails)}-{Math.min(series.heads, series.tails)}!
                    </p>
                    <button
                      type="button"
                      onClick={startNewSeries}
                      className="btn-secondary mt-2 min-h-9 px-3 py-1.5 text-sm"
                    >
                      Start new series
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Running stats</h2>
              <button type="button" onClick={resetStats} className="btn-secondary min-h-9 px-3 py-1.5 text-sm">
                <RotateCcw className="h-4 w-4" />
                Reset stats
              </button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3 2xl:grid-cols-5">
              {[
                ["Total flips", stats.flips],
                ["Heads", `${stats.heads} (${stats.flips ? Math.round(headsPct) : 0}%)`],
                ["Tails", `${stats.tails} (${stats.flips ? Math.round(tailsPct) : 0}%)`],
                [
                  "Current streak",
                  stats.currentSide ? `${stats.currentLength} x ${sideLabel(stats.currentSide)}` : "-",
                ],
                ["Longest streak", stats.bestSide ? `${stats.bestLength} x ${sideLabel(stats.bestSide)}` : "-"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                  <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
                  <p className="mt-1 font-semibold">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-[var(--primary)]">Heads {stats.flips ? `${Math.round(headsPct)}%` : "0%"}</span>
                <span className="text-[var(--secondary)]">Tails {stats.flips ? `${Math.round(tailsPct)}%` : "0%"}</span>
              </div>
              <div className="mt-2 flex h-3 overflow-hidden rounded-full bg-[var(--muted)]">
                <div className="h-full" style={{ width: `${headsPct}%`, background: "var(--primary)" }} />
                <div className="h-full" style={{ width: `${tailsPct}%`, background: "var(--secondary)" }} />
              </div>
              {stats.flips === 0 && (
                <p className="mt-2 text-xs text-[var(--muted-foreground)]">No flips yet - the split shows here.</p>
              )}
            </div>

            <div className="mt-6">
              <p className="text-sm font-semibold">Last 30 flips (oldest to newest)</p>
              {stats.history.length === 0 ? (
                <p className="mt-2 text-xs text-[var(--muted-foreground)]">Flip the coin to build history.</p>
              ) : (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {stats.history.map((item, index) => (
                    <span
                      key={`${index}-${item}`}
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                        item === "H"
                          ? "bg-[var(--anslation-ds-primary-soft)] text-[var(--primary)]"
                          : "bg-[var(--anslation-ds-secondary-soft)] text-[var(--secondary)]"
                      }`}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <p className="mt-6 text-sm leading-6 text-[var(--muted-foreground)]">
              Fairness: each flip is decided by crypto.getRandomValues, the same randomness source used
              for cryptography - a true 50/50 chance with no patterns. Stats are saved on this device.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
