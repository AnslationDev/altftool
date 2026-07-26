"use client";

import { useMemo, useState } from "react";
import { Copy, Divide, RotateCcw } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const DEFAULTS = { a: "3", b: "4", c: "9", d: "" };

const SLOTS = [
  { id: "a", label: "a", position: "Left numerator" },
  { id: "b", label: "b", position: "Left denominator" },
  { id: "c", label: "c", position: "Right numerator" },
  { id: "d", label: "d", position: "Right denominator" },
];

const PRESETS = [
  { label: "Recipe scale-up", values: { a: "2", b: "5", c: "8", d: "" }, unknown: "d" },
  { label: "Map scale 1:250", values: { a: "1", b: "250", c: "", d: "6000" }, unknown: "c" },
  { label: "Unit price", values: { a: "3", b: "149", c: "7", d: "" }, unknown: "d" },
];

const numberFmt = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 6 });
const formatNumber = (value) => (Number.isFinite(value) ? numberFmt.format(value) : "—");

function gcd(x, y) {
  let a = Math.abs(Math.round(x));
  let b = Math.abs(Math.round(y));
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

function simplifyRatio(num, den) {
  if (!Number.isFinite(num) || !Number.isFinite(den) || den === 0) return null;
  if (!Number.isInteger(num) || !Number.isInteger(den)) return null;
  const divisor = gcd(num, den);
  if (!divisor) return null;
  let sNum = num / divisor;
  let sDen = den / divisor;
  if (sDen < 0) {
    sNum = -sNum;
    sDen = -sDen;
  }
  return `${sNum} : ${sDen}`;
}

export default function ToolHome() {
  const [values, setValues] = useState(DEFAULTS);
  const [unknown, setUnknown] = useState("d");
  const [copied, setCopied] = useState(false);

  const setValue = (key, next) => setValues((prev) => ({ ...prev, [key]: next }));

  const result = useMemo(() => {
    const known = SLOTS.map((slot) => slot.id).filter((id) => id !== unknown);
    const nums = {};

    for (const id of known) {
      const raw = String(values[id] ?? "").trim();
      if (raw === "") return { error: `Enter a value for ${id}. Three of the four terms are required.` };
      const parsed = Number(raw);
      if (!Number.isFinite(parsed)) return { error: `"${raw}" is not a valid number for ${id}.` };
      nums[id] = parsed;
    }

    const { a, b, c, d } = nums;

    // Cross multiplication: a/b = c/d  =>  a x d = b x c
    let solved;
    let divisorLabel;
    let divisorValue;
    let formula;

    if (unknown === "a") {
      divisorLabel = "d";
      divisorValue = d;
      formula = "a = (b × c) ÷ d";
      solved = (b * c) / d;
    } else if (unknown === "b") {
      divisorLabel = "c";
      divisorValue = c;
      formula = "b = (a × d) ÷ c";
      solved = (a * d) / c;
    } else if (unknown === "c") {
      divisorLabel = "b";
      divisorValue = b;
      formula = "c = (a × d) ÷ b";
      solved = (a * d) / b;
    } else {
      divisorLabel = "a";
      divisorValue = a;
      formula = "d = (b × c) ÷ a";
      solved = (b * c) / a;
    }

    if (divisorValue === 0) {
      return {
        error: `Cannot solve for ${unknown}: that requires dividing by ${divisorLabel}, and ${divisorLabel} is 0.`,
      };
    }
    if (!Number.isFinite(solved)) {
      return { error: "These values do not produce a finite result. Check your inputs." };
    }

    const full = { ...nums, [unknown]: solved };
    const leftDen = full.b;
    const rightDen = full.d;

    const steps = [
      `Start with the proportion:  a / b = c / d`,
      `Cross multiply:  a × d = b × c`,
      `Rearrange to isolate ${unknown}:  ${formula}`,
      unknown === "a"
        ? `Substitute:  a = (${formatNumber(b)} × ${formatNumber(c)}) ÷ ${formatNumber(d)}`
        : unknown === "b"
          ? `Substitute:  b = (${formatNumber(a)} × ${formatNumber(d)}) ÷ ${formatNumber(c)}`
          : unknown === "c"
            ? `Substitute:  c = (${formatNumber(a)} × ${formatNumber(d)}) ÷ ${formatNumber(b)}`
            : `Substitute:  d = (${formatNumber(b)} × ${formatNumber(c)}) ÷ ${formatNumber(a)}`,
      `${unknown} = ${formatNumber(solved)}`,
    ];

    const crossLeft = full.a * full.d;
    const crossRight = full.b * full.c;

    return {
      solved,
      formula,
      steps,
      full,
      leftRatio: leftDen === 0 ? null : full.a / leftDen,
      rightRatio: rightDen === 0 ? null : full.c / rightDen,
      simplifiedLeft: simplifyRatio(full.a, leftDen),
      scaleFactor: full.a === 0 ? null : full.c / full.a,
      crossLeft,
      crossRight,
      crossMatches: Math.abs(crossLeft - crossRight) < 1e-9 * Math.max(1, Math.abs(crossLeft)),
    };
  }, [values, unknown]);

  const report = useMemo(() => {
    if (result.error) return "";
    const f = result.full;
    return [
      "Proportion Solver",
      `Proportion: ${formatNumber(f.a)} / ${formatNumber(f.b)} = ${formatNumber(f.c)} / ${formatNumber(f.d)}`,
      `Unknown: ${unknown} = ${formatNumber(result.solved)}`,
      "",
      ...result.steps,
      "",
      `Check: a × d = ${formatNumber(result.crossLeft)}, b × c = ${formatNumber(result.crossRight)}`,
    ].join("\n");
  }, [result, unknown]);

  const copyResult = async () => {
    if (!report) return;
    const ok = await safeCopyText(report);
    if (!ok) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const reset = () => {
    setValues(DEFAULTS);
    setUnknown("d");
  };

  const inputClass =
    "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none disabled:opacity-60";

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
            <Divide className="h-4 w-4" aria-hidden="true" />
            Ratio &amp; proportion
          </div>
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Proportion Solver</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Enter any three terms of <span className="font-semibold">a / b = c / d</span> and get the missing one,
            solved by cross multiplication with every step shown.
          </p>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Which term is unknown?
            </h2>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {SLOTS.map((slot) => (
                <button
                  key={slot.id}
                  type="button"
                  aria-pressed={unknown === slot.id}
                  onClick={() => setUnknown(slot.id)}
                  className={`min-h-11 rounded-md border px-2 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                    unknown === slot.id
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                  }`}
                >
                  {slot.label}
                </button>
              ))}
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {SLOTS.map((slot) => (
                <div key={slot.id}>
                  <label
                    htmlFor={`prop-${slot.id}`}
                    className="mb-1.5 block text-sm font-semibold"
                  >
                    {slot.label}{" "}
                    <span className="font-normal text-[var(--muted-foreground)]">— {slot.position}</span>
                  </label>
                  <input
                    id={`prop-${slot.id}`}
                    type="number"
                    inputMode="decimal"
                    step="any"
                    disabled={unknown === slot.id}
                    placeholder={unknown === slot.id ? "solving…" : "0"}
                    value={unknown === slot.id ? "" : values[slot.id]}
                    onChange={(event) => setValue(slot.id, event.target.value)}
                    className={inputClass}
                  />
                </div>
              ))}
            </div>

            <div className="mt-5">
              <p className="mb-2 text-sm font-semibold">Quick examples</p>
              <div className="grid gap-2 sm:grid-cols-3">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setValues(preset.values);
                      setUnknown(preset.unknown);
                    }}
                    className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-left text-sm font-medium text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={copyResult}
                disabled={Boolean(result.error)}
                aria-label="Copy proportion result and steps"
                className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50"
              >
                <Copy className="h-4 w-4" aria-hidden="true" />
                {copied ? "Copied!" : "Copy result"}
              </button>
              <button
                type="button"
                onClick={reset}
                aria-label="Reset all inputs"
                className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Reset
              </button>
            </div>
          </section>

          <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            {result.error ? (
              <div
                role="alert"
                className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
              >
                {result.error}
              </div>
            ) : (
              <>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  {unknown} equals
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)] sm:text-5xl">
                  {formatNumber(result.solved)}
                </p>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                  {formatNumber(result.full.a)} / {formatNumber(result.full.b)} ={" "}
                  {formatNumber(result.full.c)} / {formatNumber(result.full.d)}
                </p>

                <dl className="mt-5 divide-y divide-[var(--border)] border-y border-[var(--border)]">
                  <div className="flex items-center justify-between gap-3 py-2.5">
                    <dt className="text-sm text-[var(--muted-foreground)]">Left ratio a ÷ b</dt>
                    <dd className="text-sm font-semibold">
                      {result.leftRatio === null ? "undefined" : formatNumber(result.leftRatio)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 py-2.5">
                    <dt className="text-sm text-[var(--muted-foreground)]">Right ratio c ÷ d</dt>
                    <dd className="text-sm font-semibold">
                      {result.rightRatio === null ? "undefined" : formatNumber(result.rightRatio)}
                    </dd>
                  </div>
                  {result.simplifiedLeft && (
                    <div className="flex items-center justify-between gap-3 py-2.5">
                      <dt className="text-sm text-[var(--muted-foreground)]">Simplified a : b</dt>
                      <dd className="text-sm font-semibold">{result.simplifiedLeft}</dd>
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-3 py-2.5">
                    <dt className="text-sm text-[var(--muted-foreground)]">Scale factor a → c</dt>
                    <dd className="text-sm font-semibold">
                      {result.scaleFactor === null ? "undefined" : `× ${formatNumber(result.scaleFactor)}`}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 py-2.5">
                    <dt className="text-sm text-[var(--muted-foreground)]">Cross check a×d vs b×c</dt>
                    <dd
                      className={`text-sm font-semibold ${
                        result.crossMatches ? "text-[var(--success)]" : "text-[var(--danger)]"
                      }`}
                    >
                      {formatNumber(result.crossLeft)} vs {formatNumber(result.crossRight)}
                    </dd>
                  </div>
                </dl>

                <h2 className="mt-5 text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Cross multiplication steps
                </h2>
                <ol className="mt-2 space-y-2">
                  {result.steps.map((step, index) => (
                    <li
                      key={`${index}-${step}`}
                      className="flex gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                    >
                      <span className="font-semibold text-[var(--primary)]">{index + 1}.</span>
                      <span className="whitespace-pre-wrap">{step}</span>
                    </li>
                  ))}
                </ol>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
