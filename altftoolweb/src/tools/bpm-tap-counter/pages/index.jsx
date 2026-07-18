"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Activity, Copy, Keyboard, ListMusic, Music, RotateCcw } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const RESET_GAP_MS = 2500;
const ROLLING_TAPS = 8;
const COMMON_TEMPOS = [90, 100, 110, 120, 128, 140, 150, 160, 174];

const tempoMarkings = [
  { name: "Largo", min: 0, max: 60, range: "below 60" },
  { name: "Adagio", min: 60, max: 76, range: "60-76" },
  { name: "Andante", min: 76, max: 108, range: "76-108" },
  { name: "Moderato", min: 108, max: 120, range: "108-120" },
  { name: "Allegro", min: 120, max: 156, range: "120-156" },
  { name: "Vivace", min: 156, max: 176, range: "156-176" },
  { name: "Presto", min: 176, max: Infinity, range: "176+" },
];

const genres = [
  { genre: "Dub / Reggae", min: 60, max: 90 },
  { genre: "Lo-fi / Chillhop", min: 70, max: 90 },
  { genre: "Hip-hop", min: 85, max: 95 },
  { genre: "Reggaeton", min: 90, max: 100 },
  { genre: "Pop", min: 100, max: 130 },
  { genre: "Rock", min: 110, max: 140 },
  { genre: "House", min: 120, max: 128 },
  { genre: "Techno", min: 130, max: 140 },
  { genre: "Trance", min: 130, max: 145 },
  { genre: "Dubstep", min: 138, max: 142 },
  { genre: "Drum & Bass", min: 170, max: 180 },
];

const intervalsOf = (taps) => {
  const intervals = [];
  for (let i = 1; i < taps.length; i += 1) intervals.push(taps[i] - taps[i - 1]);
  return intervals;
};

const meanOf = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;

export default function ToolHome() {
  const tapsRef = useRef([]);
  const idleTimerRef = useRef(null);
  const rippleIdRef = useRef(0);
  const padRef = useRef(null);
  const [stats, setStats] = useState(null);
  const [idle, setIdle] = useState(true);
  const [ripples, setRipples] = useState([]);
  const [copied, setCopied] = useState(false);

  const registerTap = useCallback(() => {
    const now = performance.now();
    const taps = tapsRef.current;
    if (taps.length && now - taps[taps.length - 1] > RESET_GAP_MS) taps.length = 0;
    taps.push(now);
    setIdle(false);

    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => setIdle(true), RESET_GAP_MS);

    let bpm = null;
    let avgBpm = null;
    let steadiness = null;
    if (taps.length >= 2) {
      const rolling = intervalsOf(taps.slice(-ROLLING_TAPS));
      bpm = 60000 / meanOf(rolling);

      const all = intervalsOf(taps);
      const mean = meanOf(all);
      avgBpm = 60000 / mean;
      const variance = meanOf(all.map((value) => (value - mean) ** 2));
      steadiness = Math.max(0, Math.min(100, 100 - (Math.sqrt(variance) / mean) * 100));
    }
    setStats({ bpm, avgBpm, steadiness, taps: taps.length });

    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      rippleIdRef.current += 1;
      const id = rippleIdRef.current;
      setRipples((prev) => [...prev.slice(-3), id]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((item) => item !== id));
      }, 750);
    }
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key === "Tab" || event.key === "Escape") return;
      const target = event.target;
      if (target instanceof HTMLElement) {
        const tag = target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable) return;
        const isActivationKey = event.key === "Enter" || event.key === " ";
        if (isActivationKey && (tag === "BUTTON" || tag === "A") && target !== padRef.current) return;
      }
      event.preventDefault();
      registerTap();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [registerTap]);

  useEffect(
    () => () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    },
    []
  );

  const reset = () => {
    tapsRef.current = [];
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    setStats(null);
    setIdle(true);
    setRipples([]);
  };

  const bpm = stats?.bpm ?? null;

  const marking = useMemo(
    () => (bpm ? tempoMarkings.find((item) => bpm >= item.min && bpm < item.max) : null),
    [bpm]
  );

  const nearest = useMemo(() => {
    if (!bpm) return null;
    const common = COMMON_TEMPOS.reduce(
      (best, tempo) => (Math.abs(tempo - bpm) < Math.abs(best - bpm) ? tempo : best),
      COMMON_TEMPOS[0]
    );
    const delta = bpm - common;
    return {
      whole: Math.round(bpm),
      common,
      delta: `${delta >= 0 ? "+" : "-"}${Math.abs(delta).toFixed(1)}`,
    };
  }, [bpm]);

  const copyBpm = async () => {
    if (!bpm) return;
    const success = await safeCopyText(`${bpm.toFixed(1)} BPM`);
    if (!success) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Music className="h-4 w-4" />
            Tap tempo
          </div>
          <h1 className="text-4xl font-semibold leading-tight">BPM Tap Tempo Counter</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Tap along to any song with your mouse or keyboard and get its tempo in beats per minute, plus the
            classical tempo marking, a steadiness score, and the closest common club tempos.
          </p>
        </section>

        <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="flex flex-col items-center text-center">
            <div aria-live="polite">
              <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                {stats ? (idle ? "Paused, tap to start again" : "Live tempo") : "Tap along to the beat"}
              </p>
              <p
                className={`mt-1 text-6xl font-semibold tabular-nums sm:text-7xl ${
                  idle && stats ? "text-[var(--muted-foreground)]" : "text-[var(--primary)]"
                }`}
              >
                {bpm ? bpm.toFixed(1) : "--.-"}
              </p>
              <p className="mt-1 text-sm font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">
                BPM
              </p>
            </div>

            <div className="mt-4 min-h-9">
              {marking ? (
                <span className="inline-flex items-center gap-2 rounded-full border border-[var(--primary)] px-4 py-1.5 text-sm font-semibold text-[var(--primary)]">
                  <Activity className="h-4 w-4" />
                  {marking.name} · {marking.range} BPM
                </span>
              ) : (
                <span className="text-sm text-[var(--muted-foreground)]">
                  Two taps give a first reading, eight keep it accurate.
                </span>
              )}
            </div>

            <button
              ref={padRef}
              type="button"
              onClick={registerTap}
              aria-label="Tap tempo pad"
              className="relative mt-6 flex h-52 w-52 select-none items-center justify-center overflow-hidden rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[var(--anslation-ds-shadow-sm)] outline-none focus-visible:shadow-[var(--anslation-ds-focus-ring)] motion-safe:transition-transform motion-safe:active:scale-95 sm:h-60 sm:w-60"
            >
              {ripples.map((id) => (
                <span key={id} className="altf-bpm-ripple absolute inset-0 rounded-full" aria-hidden="true" />
              ))}
              <span className="pointer-events-none relative flex flex-col items-center gap-2">
                <Music className="h-8 w-8" />
                <span className="text-3xl font-semibold uppercase tracking-widest">Tap</span>
                <span className="text-xs opacity-85">{idle ? "tap to start" : "keep tapping"}</span>
              </span>
            </button>

            <p className="mt-5 inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
              <Keyboard className="h-4 w-4" />
              Click the pad or press any key in time with the music. It resets after a 2.5 second pause.
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-4 text-center">
              <p className="text-xs text-[var(--muted-foreground)]">Taps counted</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">{stats?.taps ?? 0}</p>
            </div>
            <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-4 text-center">
              <p className="text-xs text-[var(--muted-foreground)]">Average BPM (whole take)</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {stats?.avgBpm ? stats.avgBpm.toFixed(1) : "--"}
              </p>
            </div>
            <div
              className="rounded-md border border-[var(--border)] bg-[var(--background)] p-4 text-center"
              title="100% means perfectly even taps. Based on the standard deviation of your tap intervals."
            >
              <p className="text-xs text-[var(--muted-foreground)]">Steadiness</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {stats && stats.steadiness != null && stats.taps >= 3 ? `${stats.steadiness.toFixed(0)}%` : "--"}
              </p>
            </div>
          </div>

          {nearest ? (
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <span className="rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-sm font-semibold">
                Nearest whole: <span className="text-[var(--primary)]">{nearest.whole} BPM</span>
              </span>
              <span className="rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-sm font-semibold">
                Nearest common: <span className="text-[var(--primary)]">{nearest.common} BPM</span>{" "}
                <span className="text-[var(--muted-foreground)]">({nearest.delta})</span>
              </span>
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={copyBpm}
              disabled={!bpm}
              className="inline-flex min-h-9 items-center gap-2 rounded-md bg-[var(--primary)] px-3 py-1.5 text-sm font-semibold text-[var(--primary-foreground)] transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Copy className="h-4 w-4" />
              {copied ? "Copied" : "Copy BPM"}
            </button>
            <button type="button" onClick={reset} className="btn-secondary min-h-9 px-3 py-1.5 text-sm">
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
          </div>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[1fr_380px]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <ListMusic className="h-5 w-5 text-[var(--primary)]" />
              Genre BPM reference
            </h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Rows highlight when your tapped tempo lands inside a genre&rsquo;s typical range.
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[360px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-4 font-semibold">
                      Genre
                    </th>
                    <th scope="col" className="py-2 pr-4 font-semibold">
                      Typical BPM
                    </th>
                    <th scope="col" className="py-2 font-semibold">
                      Match
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {genres.map((item) => {
                    const active = Boolean(bpm && bpm >= item.min && bpm <= item.max);
                    return (
                      <tr
                        key={item.genre}
                        className={`border-b border-[var(--border)] last:border-b-0 ${
                          active ? "bg-[var(--muted)]" : ""
                        }`}
                      >
                        <td className={`py-2.5 pr-4 font-semibold ${active ? "text-[var(--primary)]" : ""}`}>
                          {item.genre}
                        </td>
                        <td className="py-2.5 pr-4 tabular-nums text-[var(--muted-foreground)]">
                          {item.min}-{item.max}
                        </td>
                        <td className="py-2.5">
                          {active ? (
                            <span className="rounded-full bg-[var(--primary)] px-2 py-0.5 text-xs font-semibold text-[var(--primary-foreground)]">
                              In range
                            </span>
                          ) : (
                            <span className="text-xs text-[var(--muted-foreground)]">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <h2 className="text-lg font-semibold">How the count works</h2>
            <ul className="mt-3 grid gap-3 text-sm leading-6 text-[var(--muted-foreground)]">
              <li className="rounded-md bg-[var(--muted)] p-3">
                Formula: BPM = 60000 / average milliseconds between your last {ROLLING_TAPS} taps, measured with a
                high-precision timer.
              </li>
              <li>Tap at least eight beats: the rolling average smooths out small timing wobbles.</li>
              <li>
                If the result feels twice too fast or too slow, you are tapping half or double time. Halve or double
                the number to match the kick drum.
              </li>
              <li>Steadiness compares the spread of your tap intervals, so 100% means perfectly even tapping.</li>
              <li>DJs often round to common set tempos like 120, 128, 140 or 174 BPM, shown as chips above.</li>
            </ul>
          </div>
        </section>

        <style>{`
          .altf-bpm-ripple {
            background: var(--primary-foreground);
            opacity: 0.35;
            transform: scale(0.2);
            animation: altfBpmRipple 0.7s ease-out forwards;
            pointer-events: none;
          }
          @keyframes altfBpmRipple {
            to { transform: scale(2.4); opacity: 0; }
          }
          @media (prefers-reduced-motion: reduce) {
            .altf-bpm-ripple { animation: none; opacity: 0; }
          }
        `}</style>
      </div>
    </main>
  );
}
