"use client";

import { useMemo, useState } from "react";
import { Copy, Divide, RotateCcw } from "lucide-react";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const num4 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 4 });
const num2 = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const MODES = [
  { id: "simplify", label: "Simplify a ratio" },
  { id: "missing", label: "Find a missing term" },
  { id: "split", label: "Split a total" },
];

function decimalPlaces(value) {
  const text = String(value);
  const dot = text.indexOf(".");
  if (dot === -1) return 0;
  return Math.min(6, text.length - dot - 1);
}

function gcdInt(a, b) {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x;
}

/** Reduces a list of positive numbers (integers or decimals) to its simplest whole-number form. */
function simplifyTerms(values) {
  const places = values.reduce((max, v) => Math.max(max, decimalPlaces(v)), 0);
  const factor = Math.pow(10, places);
  const scaled = values.map((v) => Math.round(v * factor));
  const divisor = scaled.reduce((acc, v) => gcdInt(acc, v), 0);
  if (!divisor) return { terms: scaled, exact: false };
  return { terms: scaled.map((v) => v / divisor), exact: true };
}

export default function ToolHome() {
  const [mode, setMode] = useState("simplify");
  const [a, setA] = useState("16");
  const [b, setB] = useState("9");
  const [c, setC] = useState("");
  const [knownA, setKnownA] = useState("3");
  const [knownB, setKnownB] = useState("4");
  const [scaledA, setScaledA] = useState("12");
  const [total, setTotal] = useState("5000");
  const [splitRatio, setSplitRatio] = useState("2:3:5");
  const [copied, setCopied] = useState(false);

  const reset = () => {
    setMode("simplify");
    setA("16");
    setB("9");
    setC("");
    setKnownA("3");
    setKnownB("4");
    setScaledA("12");
    setTotal("5000");
    setSplitRatio("2:3:5");
  };

  const result = useMemo(() => {
    if (mode === "simplify") {
      if (a === "" || b === "") return { error: "Enter both terms of the ratio." };
      const raw = [a, b, c].filter((v) => v !== "").map(Number);
      if (!raw.every(Number.isFinite)) return { error: "Ratio terms must be numbers." };
      if (raw.some((v) => v <= 0)) return { error: "Ratio terms must be greater than 0." };

      const { terms } = simplifyTerms(raw);
      const sum = raw.reduce((x, y) => x + y, 0);
      const percents = raw.map((v) => (v / sum) * 100);

      return {
        headline: terms.join(" : "),
        subline: `Simplified from ${raw.map((v) => num4.format(v)).join(" : ")}`,
        rows: [
          ["Original ratio", raw.map((v) => num4.format(v)).join(" : ")],
          ["Simplest form", terms.join(" : ")],
          ["Decimal ratio (first term = 1)", raw.map((v) => num4.format(v / raw[0])).join(" : ")],
          ["Sum of terms", num4.format(sum)],
          ...percents.map((p, i) => [`Share of term ${i + 1}`, `${num2.format(p)}%`]),
        ],
      };
    }

    if (mode === "missing") {
      if (knownA === "" || knownB === "" || scaledA === "")
        return { error: "Enter the known ratio and the value of the first scaled term." };
      const ka = Number(knownA);
      const kb = Number(knownB);
      const sa = Number(scaledA);
      if (![ka, kb, sa].every(Number.isFinite))
        return { error: "All ratio terms must be numbers." };
      if (ka === 0) return { error: "The first term of the known ratio cannot be 0." };
      if (ka < 0 || kb < 0 || sa < 0) return { error: "Ratio terms cannot be negative." };

      const missing = (kb * sa) / ka;
      const scale = sa / ka;

      return {
        headline: num4.format(missing),
        subline: `${num4.format(ka)} : ${num4.format(kb)} = ${num4.format(sa)} : ${num4.format(missing)}`,
        rows: [
          ["Known ratio", `${num4.format(ka)} : ${num4.format(kb)}`],
          ["Scale factor", `x ${num4.format(scale)}`],
          ["Missing term", num4.format(missing)],
          ["Cross product check", `${num4.format(ka * missing)} = ${num4.format(kb * sa)}`],
        ],
      };
    }

    // split
    if (total === "" || splitRatio.trim() === "")
      return { error: "Enter a total and a ratio such as 2:3:5." };
    const t = Number(total);
    if (!Number.isFinite(t)) return { error: "Total must be a number." };
    if (t < 0) return { error: "Total cannot be negative." };

    const parts = splitRatio
      .split(/[:,\s]+/)
      .filter((p) => p !== "")
      .map(Number);

    if (parts.length < 2) return { error: "Enter at least two ratio parts, e.g. 2:3." };
    if (!parts.every(Number.isFinite)) return { error: "Ratio parts must be numbers, e.g. 2:3:5." };
    if (parts.some((p) => p < 0)) return { error: "Ratio parts cannot be negative." };

    const sumParts = parts.reduce((x, y) => x + y, 0);
    if (sumParts <= 0) return { error: "The ratio parts must add up to more than 0." };

    const shares = parts.map((p) => (p / sumParts) * t);
    const { terms } = simplifyTerms(parts);

    return {
      headline: shares.map((s) => num4.format(s)).join(" / "),
      subline: `${num4.format(t)} split in the ratio ${parts.join(" : ")}`,
      rows: [
        ["Total", num4.format(t)],
        ["Ratio", parts.join(" : ")],
        ["Simplest form", terms.join(" : ")],
        ["Sum of parts", num4.format(sumParts)],
        ["Value of one part", num4.format(t / sumParts)],
      ],
      shares: shares.map((value, i) => ({
        index: i + 1,
        part: parts[i],
        value,
        percent: (parts[i] / sumParts) * 100,
      })),
    };
  }, [mode, a, b, c, knownA, knownB, scaledA, total, splitRatio]);

  const copyResult = async () => {
    if (result.error) return;
    const lines = [
      "Ratio Calculator",
      `Mode: ${MODES.find((m) => m.id === mode)?.label || mode}`,
      `Result: ${result.headline}`,
      ...result.rows.map(([label, value]) => `${label}: ${value}`),
    ];
    if (result.shares) {
      lines.push("", "Shares:");
      result.shares.forEach((s) =>
        lines.push(`- Part ${s.index} (${num4.format(s.part)}): ${num4.format(s.value)} (${num2.format(s.percent)}%)`)
      );
    }
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--primary)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
            <Divide className="h-4 w-4" aria-hidden="true" />
            Ratio and proportion
          </div>
          <h1 className="text-3xl font-semibold sm:text-4xl">Ratio Calculator</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
            Reduce a ratio to its simplest whole-number form, solve a proportion for a missing term,
            or divide any total in a given ratio.
          </p>
        </header>

        <section
          aria-label="Ratio inputs"
          className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
        >
          <div className="grid gap-2 sm:grid-cols-3">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                aria-pressed={mode === m.id}
                className={`min-h-11 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                  mode === m.id
                    ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {mode === "simplify" && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="term-a" className="mb-1 block text-sm font-medium">
                  First term
                </label>
                <input
                  id="term-a"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="any"
                  value={a}
                  onChange={(e) => setA(e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label htmlFor="term-b" className="mb-1 block text-sm font-medium">
                  Second term
                </label>
                <input
                  id="term-b"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="any"
                  value={b}
                  onChange={(e) => setB(e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="term-c" className="mb-1 block text-sm font-medium">
                  Third term (optional)
                </label>
                <input
                  id="term-c"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="any"
                  value={c}
                  onChange={(e) => setC(e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>
            </div>
          )}

          {mode === "missing" && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="known-a" className="mb-1 block text-sm font-medium">
                  Known ratio - first term
                </label>
                <input
                  id="known-a"
                  type="number"
                  inputMode="decimal"
                  step="any"
                  value={knownA}
                  onChange={(e) => setKnownA(e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label htmlFor="known-b" className="mb-1 block text-sm font-medium">
                  Known ratio - second term
                </label>
                <input
                  id="known-b"
                  type="number"
                  inputMode="decimal"
                  step="any"
                  value={knownB}
                  onChange={(e) => setKnownB(e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="scaled-a" className="mb-1 block text-sm font-medium">
                  New first term (the missing second term is solved for)
                </label>
                <input
                  id="scaled-a"
                  type="number"
                  inputMode="decimal"
                  step="any"
                  value={scaledA}
                  onChange={(e) => setScaledA(e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>
            </div>
          )}

          {mode === "split" && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="total" className="mb-1 block text-sm font-medium">
                  Total to divide
                </label>
                <input
                  id="total"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="any"
                  value={total}
                  onChange={(e) => setTotal(e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label htmlFor="split-ratio" className="mb-1 block text-sm font-medium">
                  Ratio (e.g. 2:3:5)
                </label>
                <input
                  id="split-ratio"
                  type="text"
                  inputMode="text"
                  value={splitRatio}
                  onChange={(e) => setSplitRatio(e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>
            </div>
          )}

          <div className="mt-4">
            <button
              type="button"
              onClick={reset}
              aria-label="Reset ratio calculator"
              className={GHOST_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </section>

        {result.error && (
          <div
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
          >
            {result.error}
          </div>
        )}

        <section
          aria-label="Ratio result"
          className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                {mode === "simplify"
                  ? "Simplest form"
                  : mode === "missing"
                    ? "Missing term"
                    : "Shares"}
              </p>
              <p className="mt-1 break-words text-4xl font-semibold text-[var(--primary)] sm:text-5xl">
                {result.error ? "--" : result.headline}
              </p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                {result.error ? "Fix the inputs above to see a result." : result.subline}
              </p>
            </div>
            <button
              type="button"
              onClick={copyResult}
              disabled={Boolean(result.error)}
              aria-label="Copy ratio result to clipboard"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              <Copy className="h-4 w-4" aria-hidden="true" />
              {copied ? "Copied!" : "Copy result"}
            </button>
          </div>

          {!result.error && (
            <>
              <dl className="mt-5 divide-y divide-[var(--border)] border-t border-[var(--border)] text-sm">
                {result.rows.map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-3 py-2">
                    <dt className="text-[var(--muted-foreground)]">{label}</dt>
                    <dd className="text-right font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>

              {result.shares && (
                <div className="mt-5">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                    Breakdown by part
                  </p>
                  <ul className="space-y-2">
                    {result.shares.map((share) => (
                      <li
                        key={share.index}
                        className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2"
                      >
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <span className="font-medium">
                            Part {share.index} ({num4.format(share.part)})
                          </span>
                          <span className="font-semibold">{num4.format(share.value)}</span>
                        </div>
                        <div className="mt-1 text-xs text-[var(--muted-foreground)]">
                          {num2.format(share.percent)}% of the total
                        </div>
                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--border)]">
                          <div
                            className="h-full rounded-full bg-[var(--primary)]"
                            style={{ width: `${Math.min(100, Math.max(0, share.percent))}%` }}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          <p className="mt-5 text-xs leading-5 text-[var(--muted-foreground)]">
            Ratios are simplified by dividing every term by their greatest common divisor. Decimal
            terms are scaled to whole numbers first, so 1.5 : 2 reduces to 3 : 4.
          </p>
        </section>
      </div>
    </main>
  );
}
