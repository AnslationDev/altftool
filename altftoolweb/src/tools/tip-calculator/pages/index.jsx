"use client";

import { useMemo, useState } from "react";
import { Copy, HandCoins, Minus, Plus, RotateCcw } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const quickTips = [5, 10, 12, 15, 18, 20, 25];

const tippingNorms = [
  { context: "India - restaurant", norm: "5-10%, skip it when a service charge is already on the bill" },
  { context: "India - food delivery", norm: "₹20-₹50 per order for the rider" },
  { context: "India - salon", norm: "Around 10% of the service value" },
  { context: "US - restaurant", norm: "15-20% of the pre-tax bill" },
  { context: "Europe - restaurant", norm: "5-10%, or simply round up the bill" },
];

const inrWhole = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const inrExact = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatINR = (value) => {
  const safe = Number.isFinite(value) ? value : 0;
  return Math.abs(safe - Math.round(safe)) < 0.005
    ? inrWhole.format(Math.round(safe))
    : inrExact.format(safe);
};

const formatPct = (value) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(
    Number.isFinite(value) ? value : 0
  );

function Toggle({ checked, onChange, label, hint }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-3 text-left transition hover:border-[var(--primary)]"
    >
      <span>
        <span className="block text-sm font-semibold">{label}</span>
        {hint ? (
          <span className="mt-0.5 block text-xs text-[var(--muted-foreground)]">{hint}</span>
        ) : null}
      </span>
      <span
        aria-hidden="true"
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
          checked ? "bg-[var(--primary)]" : "bg-[var(--muted)]"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 rounded-full bg-[var(--card)] shadow-[var(--anslation-ds-shadow-sm)] transition ${
            checked ? "translate-x-5" : "translate-x-1"
          }`}
        />
      </span>
    </button>
  );
}

export default function ToolHome() {
  const [bill, setBill] = useState("1850");
  const [tipPct, setTipPct] = useState(10);
  const [people, setPeople] = useState(3);
  const [roundUp, setRoundUp] = useState(false);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const billValue = Math.max(0, Number(bill) || 0);
    const heads = Math.max(1, Math.round(Number(people) || 1));
    const baseTip = (billValue * tipPct) / 100;
    const exactPerPerson = (billValue + baseTip) / heads;
    const perPersonTotal = roundUp ? Math.ceil(exactPerPerson) : exactPerPerson;
    const totalCollected = perPersonTotal * heads;
    const tipAmount = Math.max(0, totalCollected - billValue);
    return {
      billValue,
      heads,
      baseTip,
      perPersonTotal,
      totalCollected,
      tipAmount,
      perPersonTip: tipAmount / heads,
      effectiveTipPct: billValue > 0 ? (tipAmount / billValue) * 100 : 0,
    };
  }, [bill, people, roundUp, tipPct]);

  const summary = useMemo(() => {
    const lines = [
      "Tip Calculator Summary",
      `Bill: ${formatINR(result.billValue)}`,
      `Tip picked: ${tipPct}% -> ${formatINR(result.baseTip)}`,
      `Split between: ${result.heads} ${result.heads === 1 ? "person" : "people"}`,
      `Per-person total: ${formatINR(result.perPersonTotal)}`,
      `Per-person tip: ${formatINR(result.perPersonTip)}`,
      `Total paid: ${formatINR(result.totalCollected)}`,
    ];
    if (roundUp) {
      lines.push(
        `Round-up on -> effective tip ${formatPct(result.effectiveTipPct)}% (${formatINR(result.tipAmount)})`
      );
    }
    lines.push(`Generated: ${new Date().toLocaleString()}`);
    return lines.join("\n");
  }, [result, roundUp, tipPct]);

  const copySummary = async () => {
    const success = await safeCopyText(summary);
    if (!success) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const reset = () => {
    setBill("1850");
    setTipPct(10);
    setPeople(3);
    setRoundUp(false);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <HandCoins className="h-4 w-4" />
            Everyday finance
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Tip Calculator</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Enter the bill, pick a tip percentage, and split it between friends. Round up each
            share to a clean rupee amount and see the effective tip you actually left.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[390px_1fr]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <label className="block">
              <span className="text-sm font-semibold">Bill amount (₹)</span>
              <input
                type="number"
                min="0"
                inputMode="decimal"
                value={bill}
                onChange={(event) => setBill(event.target.value)}
                className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
              />
            </label>

            <div className="mt-5">
              <span className="text-sm font-semibold">Quick tip</span>
              <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-7 2xl:grid-cols-4">
                {quickTips.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setTipPct(value)}
                    className={`rounded-md border px-2 py-2.5 text-sm font-semibold transition ${
                      tipPct === value
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                    }`}
                  >
                    {value}%
                  </button>
                ))}
              </div>
            </div>

            <label className="mt-5 block">
              <span className="flex items-center justify-between text-sm font-semibold">
                Custom tip
                <span className="text-[var(--primary)]">{tipPct}%</span>
              </span>
              <input
                type="range"
                min="0"
                max="30"
                step="1"
                value={tipPct}
                onChange={(event) => setTipPct(Number(event.target.value))}
                className="mt-3 w-full accent-[var(--primary)]"
              />
              <span className="mt-1 flex justify-between text-xs text-[var(--muted-foreground)]">
                <span>0%</span>
                <span>30%</span>
              </span>
            </label>

            <div className="mt-5">
              <label htmlFor="tip-people" className="text-sm font-semibold">
                Split between (people)
              </label>
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  aria-label="One less person"
                  onClick={() => setPeople((value) => Math.max(1, value - 1))}
                  className="flex h-12 w-14 shrink-0 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--background)] transition hover:border-[var(--primary)]"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <input
                  id="tip-people"
                  type="number"
                  min="1"
                  max="50"
                  value={people}
                  onChange={(event) =>
                    setPeople(
                      Math.min(50, Math.max(1, Math.round(Number(event.target.value) || 1)))
                    )
                  }
                  className="h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-center font-semibold outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
                <button
                  type="button"
                  aria-label="One more person"
                  onClick={() => setPeople((value) => Math.min(50, value + 1))}
                  className="flex h-12 w-14 shrink-0 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--background)] transition hover:border-[var(--primary)]"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-5">
              <Toggle
                checked={roundUp}
                onChange={setRoundUp}
                label="Round up per-person total"
                hint="Each share is rounded up to the next rupee; the extra goes to the tip."
              />
            </div>

            <button
              type="button"
              onClick={reset}
              className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          </div>

          <div className="grid content-start gap-6">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                  Each person pays
                </p>
                <button
                  type="button"
                  onClick={copySummary}
                  className="btn-secondary min-h-9 px-3 py-1.5 text-sm"
                >
                  <Copy className="h-4 w-4" />
                  {copied ? "Copied" : "Copy summary"}
                </button>
              </div>

              <div aria-live="polite">
                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <div className="rounded-lg bg-[var(--muted)] p-5">
                    <p className="text-4xl font-semibold text-[var(--primary)]">
                      {formatINR(result.perPersonTotal)}
                    </p>
                  </div>
                  <div className="text-sm leading-6 text-[var(--muted-foreground)]">
                    <p>
                      {result.heads} {result.heads === 1 ? "person" : "people"} · tip set at{" "}
                      {tipPct}%
                    </p>
                    {roundUp && (
                      <p className="font-semibold text-[var(--foreground)]">
                        Effective tip after round-up: {formatPct(result.effectiveTipPct)}%
                      </p>
                    )}
                  </div>
                </div>

                <div className="tool-compact-grid mt-6">
                  {[
                    ["Tip amount", formatINR(result.tipAmount)],
                    ["Total to pay", formatINR(result.totalCollected)],
                    ["Per-person tip", formatINR(result.perPersonTip)],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
                    >
                      <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
                      <p className="mt-1 font-semibold">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <p className="mt-5 text-sm leading-6 text-[var(--muted-foreground)]">
                Formula: tip = bill x tip% / 100 · per person = (bill + tip) / people
                {roundUp ? " · per-person total rounded up to the next rupee" : ""}
              </p>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                Typical tipping norms
              </p>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {tippingNorms.map((entry) => (
                  <li
                    key={entry.context}
                    className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
                  >
                    <p className="text-sm font-semibold">{entry.context}</p>
                    <p className="mt-0.5 text-xs leading-5 text-[var(--muted-foreground)]">
                      {entry.norm}
                    </p>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
                Norms vary by city and service quality — treat these as friendly starting points.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
