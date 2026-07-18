"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Copy, FileDown, Flag, Pause, Play, RotateCcw, Timer } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const pad = (value) => String(value).padStart(2, "0");

const formatStopwatch = (ms) => {
  const total = Math.max(0, Math.floor(ms));
  const cs = Math.floor((total % 1000) / 10);
  const s = Math.floor(total / 1000) % 60;
  const m = Math.floor(total / 60000) % 60;
  const h = Math.floor(total / 3600000);
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}.${pad(cs)}` : `${pad(m)}:${pad(s)}.${pad(cs)}`;
};

const formatShort = (ms) => {
  const total = Math.max(0, Math.floor(ms));
  const s = Math.floor(total / 1000) % 60;
  const m = Math.floor(total / 60000) % 60;
  const h = Math.floor(total / 3600000);
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
};

const isTypingTarget = (target) =>
  target instanceof Element &&
  Boolean(target.closest("input, textarea, select, button, a, [contenteditable]"));

function downloadTextFile(filename, content) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

const shortcuts = [
  { keys: "Space", action: "Start / Pause" },
  { keys: "L", action: "Lap" },
  { keys: "R", action: "Reset" },
];

export default function ToolHome() {
  const [running, setRunning] = useState(false);
  const [displayMs, setDisplayMs] = useState(0);
  const [laps, setLaps] = useState([]);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [copied, setCopied] = useState(false);

  const startRef = useRef(0);
  const accumulatedRef = useRef(0);
  const runningRef = useRef(false);
  const baseTitleRef = useRef("");
  const lastTitleRef = useRef("");

  useEffect(() => {
    baseTitleRef.current = document.title;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener?.("change", update);
    return () => {
      media.removeEventListener?.("change", update);
      if (baseTitleRef.current) document.title = baseTitleRef.current;
    };
  }, []);

  useEffect(() => {
    runningRef.current = running;
  }, [running]);

  useEffect(() => {
    if (!running) return undefined;
    let rafId = 0;
    let intervalId = 0;
    const update = () => {
      setDisplayMs(accumulatedRef.current + (performance.now() - startRef.current));
    };
    if (reducedMotion) {
      update();
      intervalId = window.setInterval(update, 250);
    } else {
      const loop = () => {
        update();
        rafId = window.requestAnimationFrame(loop);
      };
      rafId = window.requestAnimationFrame(loop);
    }
    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [running, reducedMotion]);

  useEffect(() => {
    const base = baseTitleRef.current || "Online Stopwatch";
    const next = running || displayMs > 0 ? `${formatShort(displayMs)} · Stopwatch` : base;
    if (next !== lastTitleRef.current) {
      document.title = next;
      lastTitleRef.current = next;
    }
  }, [displayMs, running]);

  const currentElapsed = useCallback(
    () =>
      runningRef.current
        ? accumulatedRef.current + (performance.now() - startRef.current)
        : accumulatedRef.current,
    []
  );

  const start = useCallback(() => {
    if (runningRef.current) return;
    startRef.current = performance.now();
    setRunning(true);
  }, []);

  const pause = useCallback(() => {
    if (!runningRef.current) return;
    accumulatedRef.current += performance.now() - startRef.current;
    setRunning(false);
    setDisplayMs(accumulatedRef.current);
  }, []);

  const toggle = useCallback(() => {
    if (runningRef.current) pause();
    else start();
  }, [pause, start]);

  const lap = useCallback(() => {
    if (!runningRef.current) return;
    setLaps((prev) => [...prev, currentElapsed()]);
  }, [currentElapsed]);

  const reset = useCallback(() => {
    setRunning(false);
    accumulatedRef.current = 0;
    startRef.current = 0;
    setDisplayMs(0);
    setLaps([]);
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.repeat || isTypingTarget(event.target)) return;
      if (event.code === "Space") {
        event.preventDefault();
        toggle();
      } else if (event.code === "KeyL") {
        event.preventDefault();
        lap();
      } else if (event.code === "KeyR") {
        event.preventDefault();
        reset();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggle, lap, reset]);

  const lapRows = useMemo(
    () =>
      laps.map((total, index) => ({
        number: index + 1,
        total,
        lapTime: total - (laps[index - 1] ?? 0),
        delta: index > 0 ? total - (laps[index - 1] ?? 0) - (laps[index - 1] - (laps[index - 2] ?? 0)) : null,
      })),
    [laps]
  );

  const lapStats = useMemo(() => {
    if (lapRows.length < 2) return { fastest: null, slowest: null, average: null };
    let fastest = lapRows[0];
    let slowest = lapRows[0];
    let sum = 0;
    lapRows.forEach((row) => {
      if (row.lapTime < fastest.lapTime) fastest = row;
      if (row.lapTime > slowest.lapTime) slowest = row;
      sum += row.lapTime;
    });
    return { fastest: fastest.number, slowest: slowest.number, average: sum / lapRows.length };
  }, [lapRows]);

  const report = useMemo(() => {
    const lines = [
      "Online Stopwatch Report",
      `Total time: ${formatStopwatch(displayMs)}`,
      `Laps: ${lapRows.length}`,
      "",
      ...lapRows.map(
        (row) =>
          `Lap ${row.number} — lap ${formatStopwatch(row.lapTime)} — total ${formatStopwatch(row.total)}${
            row.delta === null ? "" : ` — ${row.delta >= 0 ? "+" : "-"}${formatStopwatch(Math.abs(row.delta))} vs previous`
          }`
      ),
      "",
      `Generated: ${new Date().toLocaleString()}`,
    ];
    return lines.join("\n");
  }, [displayMs, lapRows]);

  const copyReport = async () => {
    const success = await safeCopyText(report);
    if (!success) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Timer className="h-4 w-4" />
            Precision timing
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Online Stopwatch</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Millisecond-accurate stopwatch with laps, splits, and keyboard control. Timing is measured
            with high-resolution clock deltas, so it stays correct even when the tab is in the background.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[1fr_420px]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="rounded-lg bg-[var(--muted)] px-4 py-8 text-center">
              <p className="font-mono text-6xl font-semibold tabular-nums tracking-tight sm:text-7xl">
                {formatStopwatch(displayMs)}
              </p>
              <p className="mt-2 text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                {running ? "Running" : displayMs > 0 ? "Paused" : "Ready"}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={toggle}
                className="inline-flex min-h-12 items-center gap-2 rounded-md bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-[var(--primary-foreground)] transition hover:opacity-90"
              >
                {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {running ? "Pause" : displayMs > 0 ? "Resume" : "Start"}
              </button>
              <button
                type="button"
                onClick={lap}
                disabled={!running}
                className="btn-secondary min-h-12 px-5 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Flag className="h-4 w-4" />
                Lap
              </button>
              <button
                type="button"
                onClick={reset}
                disabled={displayMs === 0 && laps.length === 0}
                className="btn-secondary min-h-12 px-5 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 py-3">
              {shortcuts.map((item) => (
                <span key={item.keys} className="inline-flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                  <kbd className="rounded-md border border-[var(--border)] bg-[var(--muted)] px-2 py-1 font-mono text-[11px] font-semibold text-[var(--foreground)]">
                    {item.keys}
                  </kbd>
                  {item.action}
                </span>
              ))}
            </div>

            <div className="tool-compact-grid mt-6">
              {[
                ["Laps recorded", String(lapRows.length)],
                [
                  "Fastest lap",
                  lapStats.fastest ? `#${lapStats.fastest}` : "—",
                ],
                [
                  "Average lap",
                  lapStats.average ? formatStopwatch(lapStats.average) : "—",
                ],
              ].map(([label, value]) => (
                <div key={label} className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                  <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
                  <p className="mt-1 font-semibold">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Lap times</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyReport}
                  disabled={lapRows.length === 0}
                  className="btn-secondary min-h-9 px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Copy className="h-4 w-4" />
                  {copied ? "Copied" : "Copy"}
                </button>
                <button
                  type="button"
                  onClick={() => downloadTextFile("stopwatch-laps.txt", report)}
                  disabled={lapRows.length === 0}
                  className="btn-secondary min-h-9 px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FileDown className="h-4 w-4" />
                  Download
                </button>
              </div>
            </div>

            {lapRows.length === 0 ? (
              <p className="mt-6 rounded-md bg-[var(--muted)] p-4 text-sm leading-6 text-[var(--muted-foreground)]">
                No laps yet. Start the stopwatch and press Lap (or the L key) to record splits. The
                fastest and slowest laps are highlighted automatically.
              </p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[360px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-left text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                      <th className="py-2 pr-3">Lap</th>
                      <th className="py-2 pr-3">Lap time</th>
                      <th className="py-2 pr-3">Total</th>
                      <th className="py-2">Δ prev</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lapRows
                      .slice()
                      .reverse()
                      .map((row) => {
                        const isFastest = lapStats.fastest === row.number;
                        const isSlowest = lapStats.slowest === row.number;
                        return (
                          <tr key={row.number} className="border-b border-[var(--border)] last:border-b-0">
                            <td className="py-2 pr-3 font-semibold">
                              <span className="inline-flex items-center gap-2">
                                #{row.number}
                                {isFastest && (
                                  <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase" style={{ background: "var(--anslation-ds-success-soft)", color: "var(--anslation-ds-success)" }}>
                                    Fastest
                                  </span>
                                )}
                                {isSlowest && (
                                  <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase" style={{ background: "var(--anslation-ds-danger-soft)", color: "var(--anslation-ds-danger)" }}>
                                    Slowest
                                  </span>
                                )}
                              </span>
                            </td>
                            <td
                              className="py-2 pr-3 font-mono tabular-nums"
                              style={
                                isFastest
                                  ? { color: "var(--anslation-ds-success)" }
                                  : isSlowest
                                    ? { color: "var(--anslation-ds-danger)" }
                                    : undefined
                              }
                            >
                              {formatStopwatch(row.lapTime)}
                            </td>
                            <td className="py-2 pr-3 font-mono tabular-nums text-[var(--muted-foreground)]">
                              {formatStopwatch(row.total)}
                            </td>
                            <td className="py-2 font-mono tabular-nums text-[var(--muted-foreground)]">
                              {row.delta === null
                                ? "—"
                                : `${row.delta >= 0 ? "+" : "−"}${formatStopwatch(Math.abs(row.delta))}`}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
