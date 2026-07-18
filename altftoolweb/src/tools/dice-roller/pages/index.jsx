"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Copy, Dices, RotateCcw, Sparkles } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const dieOptions = [4, 6, 8, 10, 12, 20, 100];

const quickRolls = [
  { label: "2d6", sides: 6, count: 2, dropLowest: false },
  { label: "3d6", sides: 6, count: 3, dropLowest: false },
  { label: "1d20", sides: 20, count: 1, dropLowest: false },
  { label: "4d6 drop lowest", sides: 6, count: 4, dropLowest: true },
];

const pipLayouts = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

const polyPoints = {
  4: "50,10 94,90 6,90",
  8: "50,4 96,50 50,96 4,50",
  10: "50,4 90,42 50,96 10,42",
  12: "50,4 93.8,35.8 77,87.2 23,87.2 6.2,35.8",
  20: "50,4 89.8,27 89.8,73 50,96 10.2,73 10.2,27",
};

function fairRandomInt(sides) {
  if (typeof window !== "undefined" && window.crypto?.getRandomValues) {
    const range = 4294967296;
    const limit = range - (range % sides);
    const buffer = new Uint32Array(1);
    let value = limit;
    while (value >= limit) {
      window.crypto.getRandomValues(buffer);
      value = buffer[0];
    }
    return (value % sides) + 1;
  }
  return Math.floor(Math.random() * sides) + 1;
}

function buildNotation(count, sides, modifier, dropLowest) {
  const base = `${count}d${sides}${dropLowest ? "dl" : ""}`;
  if (modifier > 0) return `${base}+${modifier}`;
  if (modifier < 0) return `${base}${modifier}`;
  return base;
}

function performRoll(sides, count, modifier, dropLowest) {
  const effectiveDrop = dropLowest && count > 1;
  const values = Array.from({ length: count }, () => fairRandomInt(sides));
  const droppedIndex = effectiveDrop ? values.indexOf(Math.min(...values)) : -1;
  const kept = values.filter((_, index) => index !== droppedIndex);
  const diceTotal = kept.reduce((sum, value) => sum + value, 0);
  return {
    sides,
    count,
    modifier,
    dropLowest: effectiveDrop,
    values,
    droppedIndex,
    diceTotal,
    total: diceTotal + modifier,
    notation: buildNotation(count, sides, modifier, effectiveDrop),
  };
}

function strokeFor(value, sides, dropped) {
  if (dropped) return "var(--border)";
  if (value === sides) return "var(--anslation-ds-success)";
  if (value === 1 && sides > 2) return "var(--anslation-ds-danger)";
  return "var(--border)";
}

function DieFace({ sides, value, dropped }) {
  const stroke = strokeFor(value, sides, dropped);
  return (
    <div className={`flex flex-col items-center gap-1 ${dropped ? "opacity-40" : ""}`}>
      <svg
        viewBox="0 0 100 100"
        className="h-14 w-14"
        role="img"
        aria-label={`d${sides} showing ${value}${dropped ? ", dropped" : ""}`}
      >
        {sides === 6 ? (
          <rect x="5" y="5" width="90" height="90" rx="18" fill="var(--card)" stroke={stroke} strokeWidth="5" />
        ) : sides === 100 ? (
          <circle cx="50" cy="50" r="45" fill="var(--card)" stroke={stroke} strokeWidth="5" />
        ) : (
          <polygon points={polyPoints[sides]} fill="var(--card)" stroke={stroke} strokeWidth="5" strokeLinejoin="round" />
        )}
        {sides === 6 ? (
          pipLayouts[value]?.map((cell) => (
            <circle
              key={cell}
              cx={25 + (cell % 3) * 25}
              cy={25 + Math.floor(cell / 3) * 25}
              r="8.5"
              fill="var(--foreground)"
            />
          ))
        ) : (
          <text
            x="50"
            y={sides === 4 ? 74 : 61}
            textAnchor="middle"
            fontSize={sides === 100 ? 28 : 32}
            fontWeight="700"
            fill="var(--foreground)"
          >
            {value}
          </text>
        )}
      </svg>
      {dropped && (
        <span className="text-[10px] font-semibold uppercase text-[var(--muted-foreground)]">Dropped</span>
      )}
    </div>
  );
}

const inputClass =
  "mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]";

const clampCount = (value) => {
  const parsed = Math.round(Number(value));
  if (!Number.isFinite(parsed)) return 1;
  return Math.min(10, Math.max(1, parsed));
};

const clampModifier = (value) => {
  const parsed = Math.round(Number(value));
  if (!Number.isFinite(parsed)) return 0;
  return Math.min(99, Math.max(-99, parsed));
};

const formatAverage = (value) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 }).format(value);

export default function ToolHome() {
  const [sides, setSides] = useState(6);
  const [count, setCount] = useState(2);
  const [modifier, setModifier] = useState(0);
  const [dropLowest, setDropLowest] = useState(false);
  const [rolling, setRolling] = useState(false);
  const [displayValues, setDisplayValues] = useState(null);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ rolls: 0, sum: 0, highest: null, lowest: null });
  const [copied, setCopied] = useState(false);
  const timersRef = useRef({ interval: null, timeout: null });
  const idRef = useRef(0);
  const didInitRef = useRef(false);

  const settleRoll = useCallback((roll) => {
    idRef.current += 1;
    const entry = { ...roll, id: idRef.current };
    setResult(entry);
    setDisplayValues(null);
    setHistory((prev) => [entry, ...prev].slice(0, 20));
    setStats((prev) => ({
      rolls: prev.rolls + 1,
      sum: prev.sum + roll.total,
      highest: prev.highest === null ? roll.total : Math.max(prev.highest, roll.total),
      lowest: prev.lowest === null ? roll.total : Math.min(prev.lowest, roll.total),
    }));
  }, []);

  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    settleRoll(performRoll(6, 2, 0, false));
  }, [settleRoll]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      if (timers.interval) clearInterval(timers.interval);
      if (timers.timeout) clearTimeout(timers.timeout);
    };
  }, []);

  const startRoll = (config) => {
    if (rolling) return;
    const finalRoll = performRoll(config.sides, config.count, config.modifier, config.dropLowest);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      settleRoll(finalRoll);
      return;
    }
    setRolling(true);
    setDisplayValues(Array.from({ length: config.count }, () => fairRandomInt(config.sides)));
    timersRef.current.interval = setInterval(() => {
      setDisplayValues(Array.from({ length: config.count }, () => fairRandomInt(config.sides)));
    }, 75);
    timersRef.current.timeout = setTimeout(() => {
      clearInterval(timersRef.current.interval);
      timersRef.current.interval = null;
      timersRef.current.timeout = null;
      setRolling(false);
      settleRoll(finalRoll);
    }, 600);
  };

  const applyQuickRoll = (preset) => {
    if (rolling) return;
    setSides(preset.sides);
    setCount(preset.count);
    setModifier(0);
    setDropLowest(preset.dropLowest);
    startRoll({ sides: preset.sides, count: preset.count, modifier: 0, dropLowest: preset.dropLowest });
  };

  const resetSession = () => {
    setHistory([]);
    setStats({ rolls: 0, sum: 0, highest: null, lowest: null });
  };

  const copyHistory = async () => {
    const text = history
      .map(
        (entry) =>
          `${entry.notation} = ${entry.total} [${entry.values
            .map((value, index) => (index === entry.droppedIndex ? `${value} dropped` : value))
            .join(", ")}]`
      )
      .join("\n");
    const success = await safeCopyText(text || "No rolls yet");
    if (!success) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const shownValues = displayValues || result?.values || [];
  const shownSides = displayValues ? sides : result?.sides || sides;
  const shownDroppedIndex = !displayValues && result ? result.droppedIndex : -1;
  const average = stats.rolls > 0 ? stats.sum / stats.rolls : 0;
  const keptValues = result ? result.values.filter((_, index) => index !== result.droppedIndex) : [];

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Dices className="h-4 w-4" />
            Games &amp; fun
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Dice Roller</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Roll any combination of d4 to d100 dice with modifiers and drop-lowest support. Every roll
            uses crypto-grade randomness, so results are as fair as a real tabletop throw.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[390px_1fr]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <span className="text-sm font-semibold">Die type</span>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {dieOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSides(option)}
                  className={`rounded-md border px-2 py-2.5 text-sm font-semibold transition ${
                    sides === option
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                  }`}
                >
                  d{option}
                </button>
              ))}
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold">Number of dice (1-10)</span>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={count}
                  onChange={(event) => setCount(clampCount(event.target.value))}
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold">Modifier (+/-)</span>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    aria-label="Decrease modifier"
                    onClick={() => setModifier((prev) => clampModifier(prev - 1))}
                    className="btn-secondary h-12 min-h-0 w-12 shrink-0 px-0 text-lg"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={-99}
                    max={99}
                    value={modifier}
                    onChange={(event) => setModifier(clampModifier(event.target.value))}
                    className="h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-center outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                  />
                  <button
                    type="button"
                    aria-label="Increase modifier"
                    onClick={() => setModifier((prev) => clampModifier(prev + 1))}
                    className="btn-secondary h-12 min-h-0 w-12 shrink-0 px-0 text-lg"
                  >
                    +
                  </button>
                </div>
              </label>
            </div>

            <label className="mt-4 flex items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={dropLowest}
                onChange={(event) => setDropLowest(event.target.checked)}
                className="h-4 w-4 accent-[var(--primary)]"
              />
              Drop the lowest die {count < 2 ? "(needs 2+ dice)" : ""}
            </label>

            <button
              type="button"
              onClick={() => startRoll({ sides, count, modifier, dropLowest })}
              disabled={rolling}
              className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[var(--primary)] text-base font-semibold text-[var(--primary-foreground)] transition hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Dices className="h-5 w-5" />
              {rolling ? "Rolling..." : `Roll ${buildNotation(count, sides, modifier, dropLowest && count > 1)}`}
            </button>

            <div className="mt-5">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <Sparkles className="h-4 w-4 text-[var(--primary)]" />
                Quick rolls
              </div>
              <div className="grid gap-2 sm:grid-cols-2 2xl:grid-cols-1">
                {quickRolls.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => applyQuickRoll(preset)}
                    disabled={rolling}
                    className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-left text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
              {rolling ? "Rolling..." : result ? `Result for ${result.notation}` : "Ready to roll"}
            </p>

            <div className="mt-4 flex min-h-24 flex-wrap items-start gap-3">
              {shownValues.map((value, index) => (
                <DieFace
                  key={`${index}-${value}`}
                  sides={shownSides}
                  value={value}
                  dropped={index === shownDroppedIndex}
                />
              ))}
            </div>

            <div aria-live="polite">
              {!rolling && result && (
                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <div className="rounded-lg bg-[var(--muted)] px-6 py-4">
                    <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Total</p>
                    <p className="text-4xl font-semibold text-[var(--primary)]">{result.total}</p>
                  </div>
                  <div className="text-sm leading-6 text-[var(--muted-foreground)]">
                    <p>
                      Dice: {keptValues.join(" + ") || 0} = {result.diceTotal}
                      {result.droppedIndex > -1 && (
                        <span> (dropped the lowest: {result.values[result.droppedIndex]})</span>
                      )}
                    </p>
                    {result.modifier !== 0 && (
                      <p>
                        Modifier: {result.diceTotal} {result.modifier > 0 ? "+" : "-"} {Math.abs(result.modifier)} ={" "}
                        {result.total}
                      </p>
                    )}
                    <p className="font-semibold text-[var(--foreground)]">
                      {result.notation} = {result.total}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="tool-compact-grid mt-6">
              {[
                ["Rolls made", stats.rolls],
                ["Average total", stats.rolls ? formatAverage(average) : "-"],
                ["Highest total", stats.highest === null ? "-" : stats.highest],
                ["Lowest total", stats.lowest === null ? "-" : stats.lowest],
              ].map(([label, value]) => (
                <div key={label} className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                  <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
                  <p className="mt-1 font-semibold">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Roll history (last 20)</h2>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={copyHistory} className="btn-secondary min-h-9 px-3 py-1.5 text-sm">
                <Copy className="h-4 w-4" />
                {copied ? "Copied" : "Copy history"}
              </button>
              <button type="button" onClick={resetSession} className="btn-secondary min-h-9 px-3 py-1.5 text-sm">
                <RotateCcw className="h-4 w-4" />
                Reset session
              </button>
            </div>
          </div>
          {history.length === 0 ? (
            <p className="mt-4 text-sm text-[var(--muted-foreground)]">No rolls yet - roll some dice to build history.</p>
          ) : (
            <ul className="mt-4 grid gap-2">
              {history.map((entry) => (
                <li
                  key={entry.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                >
                  <span className="font-semibold">
                    {entry.notation} = {entry.total}
                  </span>
                  <span className="text-[var(--muted-foreground)]">
                    {entry.values
                      .map((value, index) => (index === entry.droppedIndex ? `${value} (dropped)` : `${value}`))
                      .join(", ")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
