"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Languages, RotateCcw } from "lucide-react";

import { PURPOSES, TESTS, rankTests } from "../lib";

const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const PRIORITY_OPTIONS = [
  { id: "low", label: "Low" },
  { id: "medium", label: "Medium" },
  { id: "high", label: "High" },
];

const DEFAULTS = {
  purpose: "us-study",
  costPriority: "medium",
  speedPriority: "medium",
  homePriority: "low",
};

const DASH = "—";

export default function ToolHome() {
  const [purpose, setPurpose] = useState(DEFAULTS.purpose);
  const [costPriority, setCostPriority] = useState(DEFAULTS.costPriority);
  const [speedPriority, setSpeedPriority] = useState(DEFAULTS.speedPriority);
  const [homePriority, setHomePriority] = useState(DEFAULTS.homePriority);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => rankTests({ purpose, costPriority, speedPriority, homePriority }),
    [purpose, costPriority, speedPriority, homePriority],
  );

  const hasError = Boolean(result.error);
  const purposeLabel = PURPOSES.find((p) => p.id === purpose)?.label ?? purpose;

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      `English test comparison — ${purposeLabel}`,
      ...result.ranking.map(
        (t, i) =>
          `${i + 1}. ${t.name} — fit score ${t.score}/100, fee ~${USD.format(t.feeUsd)}, results in ~${t.resultDays} days`,
      ),
    ];
    if (result.excluded.length > 0) {
      lines.push(
        `Not accepted for this route: ${result.excluded.map((t) => t.name).join(", ")}`,
      );
    }
    return lines.join("\n");
  }, [hasError, result, purposeLabel]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setPurpose(DEFAULTS.purpose);
    setCostPriority(DEFAULTS.costPriority);
    setSpeedPriority(DEFAULTS.speedPriority);
    setHomePriority(DEFAULTS.homePriority);
    setCopied(false);
  };

  const prioritySelect = (id, label, value, onChange) => (
    <div>
      <label className={LABEL_CLASS} htmlFor={id}>
        {label}
      </label>
      <select id={id} className={`mt-2 ${INPUT_CLASS}`} value={value} onChange={onChange}>
        {PRIORITY_OPTIONS.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Languages className="h-4 w-4" aria-hidden="true" />
          English Proficiency
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          English Test Choice Helper
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Compare IELTS Academic, TOEFL iBT, PTE Academic and the Duolingo English Test on cost,
          format, result speed and — most importantly — whether your destination actually accepts
          them.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="etc-purpose">
              What are you applying for?
            </label>
            <select
              id="etc-purpose"
              className={`mt-2 ${INPUT_CLASS}`}
              value={purpose}
              onChange={(event) => setPurpose(event.target.value)}
            >
              {PURPOSES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {prioritySelect("etc-cost", "How much does exam cost matter?", costPriority, (e) =>
            setCostPriority(e.target.value),
          )}
          {prioritySelect("etc-speed", "How urgently do you need results?", speedPriority, (e) =>
            setSpeedPriority(e.target.value),
          )}
          {prioritySelect(
            "etc-home",
            "How important is testing from home?",
            homePriority,
            (e) => setHomePriority(e.target.value),
          )}
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Best match for {purposeLabel}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.best.name}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `Fit score ${result.best.score}/100 · fee about ${USD.format(result.best.feeUsd)} · results in about ${result.best.resultDays} days`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the test comparison result"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError ? (
          <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
            {result.ranking.map((test, index) => (
              <div key={test.id} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">
                  {index + 1}. {test.name}
                </dt>
                <dd className="text-right font-semibold">{test.score}/100</dd>
              </div>
            ))}
            {result.excluded.map((test) => (
              <div key={test.id} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{test.name}</dt>
                <dd className="text-right font-semibold text-[var(--danger)]">
                  Not accepted for this route
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="mt-5 text-sm text-[var(--muted-foreground)]">{DASH}</p>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Side-by-side facts</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Test
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Approx. fee
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Length
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Results
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Score scale
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Speaking
                </th>
              </tr>
            </thead>
            <tbody>
              {TESTS.map((test) => (
                <tr key={test.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{test.name}</td>
                  <td className="py-2 pr-3">{USD.format(test.feeUsd)}</td>
                  <td className="py-2 pr-3">{test.durationMin} min</td>
                  <td className="py-2 pr-3">~{test.resultDays} days</td>
                  <td className="py-2 pr-3">{test.scale}</td>
                  <td className="py-2">{test.speaking}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Fees are approximate and vary by country; acceptance policies change, so always confirm the
        current requirement on your university&apos;s admission page and the official visa
        authority before booking a test.
      </p>
    </main>
  );
}
