"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Smile } from "lucide-react";

import { BLEEDING_OPTIONS, MAX_SCORE, TOBACCO_OPTIONS, scoreOralHygiene } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  brushingsPerDay: "2",
  brushingMinutes: "1.5",
  fluorideToothpaste: true,
  interdentalDaysPerWeek: "2",
  brushAgeMonths: "5",
  sugarIntakesPerDay: "2",
  tobacco: "none",
  lastDentalVisitMonths: "14",
  gumBleeding: "sometimes",
};

const TOBACCO_LABEL = {
  none: "I do not use tobacco",
  occasional: "Occasionally",
  daily: "Daily",
};

const BLEEDING_LABEL = {
  never: "Never",
  sometimes: "Sometimes",
  often: "Most times I clean",
};

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return String(raw).trim() === "" || !Number.isFinite(value) ? NaN : value;
};

export default function ToolHome() {
  const [brushingsPerDay, setBrushingsPerDay] = useState(DEFAULTS.brushingsPerDay);
  const [brushingMinutes, setBrushingMinutes] = useState(DEFAULTS.brushingMinutes);
  const [fluorideToothpaste, setFluorideToothpaste] = useState(DEFAULTS.fluorideToothpaste);
  const [interdentalDaysPerWeek, setInterdentalDaysPerWeek] = useState(DEFAULTS.interdentalDaysPerWeek);
  const [brushAgeMonths, setBrushAgeMonths] = useState(DEFAULTS.brushAgeMonths);
  const [sugarIntakesPerDay, setSugarIntakesPerDay] = useState(DEFAULTS.sugarIntakesPerDay);
  const [tobacco, setTobacco] = useState(DEFAULTS.tobacco);
  const [lastDentalVisitMonths, setLastDentalVisitMonths] = useState(DEFAULTS.lastDentalVisitMonths);
  const [gumBleeding, setGumBleeding] = useState(DEFAULTS.gumBleeding);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      scoreOralHygiene({
        brushingsPerDay: toNumber(brushingsPerDay),
        brushingMinutes: toNumber(brushingMinutes),
        fluorideToothpaste,
        interdentalDaysPerWeek: toNumber(interdentalDaysPerWeek),
        brushAgeMonths: toNumber(brushAgeMonths),
        sugarIntakesPerDay: toNumber(sugarIntakesPerDay),
        tobacco,
        lastDentalVisitMonths: toNumber(lastDentalVisitMonths),
        gumBleeding,
      }),
    [
      brushingsPerDay,
      brushingMinutes,
      fluorideToothpaste,
      interdentalDaysPerWeek,
      brushAgeMonths,
      sugarIntakesPerDay,
      tobacco,
      lastDentalVisitMonths,
      gumBleeding,
    ],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Oral Hygiene Score",
      `Score: ${result.score} / ${MAX_SCORE} (${result.band})`,
      "",
      ...result.items.map((item) => `${item.label}: ${item.earned}/${item.max}`),
    ];
    if (result.tips.length) {
      lines.push("", "What to fix first:");
      result.tips.slice(0, 3).forEach((tip, index) => lines.push(`${index + 1}. ${tip}`));
    }
    return lines.join("\n");
  }, [hasError, result]);

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
    setBrushingsPerDay(DEFAULTS.brushingsPerDay);
    setBrushingMinutes(DEFAULTS.brushingMinutes);
    setFluorideToothpaste(DEFAULTS.fluorideToothpaste);
    setInterdentalDaysPerWeek(DEFAULTS.interdentalDaysPerWeek);
    setBrushAgeMonths(DEFAULTS.brushAgeMonths);
    setSugarIntakesPerDay(DEFAULTS.sugarIntakesPerDay);
    setTobacco(DEFAULTS.tobacco);
    setLastDentalVisitMonths(DEFAULTS.lastDentalVisitMonths);
    setGumBleeding(DEFAULTS.gumBleeding);
    setCopied(false);
  };

  const dash = "—";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Smile className="h-4 w-4" aria-hidden="true" />
          Dental care
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Oral Hygiene Score Tool</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Answer nine questions about your routine and get a score out of 100, weighted towards the
          habits dental guidance links most strongly to decay and gum disease.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ohs-brushings">
              Times you brush per day
            </label>
            <input
              id="ohs-brushings"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="6"
              step="1"
              value={brushingsPerDay}
              onChange={(event) => setBrushingsPerDay(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ohs-minutes">
              Minutes per brushing session
            </label>
            <input
              id="ohs-minutes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="10"
              step="0.5"
              value={brushingMinutes}
              onChange={(event) => setBrushingMinutes(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ohs-interdental">
              Days per week you floss or use interdental brushes
            </label>
            <input
              id="ohs-interdental"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="7"
              step="1"
              value={interdentalDaysPerWeek}
              onChange={(event) => setInterdentalDaysPerWeek(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ohs-brush-age">
              Age of your brush or brush head (months)
            </label>
            <input
              id="ohs-brush-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="36"
              step="0.5"
              value={brushAgeMonths}
              onChange={(event) => setBrushAgeMonths(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ohs-sugar">
              Separate sugary snacks or drinks per day
            </label>
            <input
              id="ohs-sugar"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="20"
              step="1"
              value={sugarIntakesPerDay}
              onChange={(event) => setSugarIntakesPerDay(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ohs-checkup">
              Months since your last dental visit
            </label>
            <input
              id="ohs-checkup"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="240"
              step="1"
              value={lastDentalVisitMonths}
              onChange={(event) => setLastDentalVisitMonths(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ohs-tobacco">
              Tobacco (smoked or chewed)
            </label>
            <select
              id="ohs-tobacco"
              className={`mt-2 ${INPUT_CLASS}`}
              value={tobacco}
              onChange={(event) => setTobacco(event.target.value)}
            >
              {TOBACCO_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {TOBACCO_LABEL[option]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ohs-bleeding">
              Do your gums bleed when you brush or floss?
            </label>
            <select
              id="ohs-bleeding"
              className={`mt-2 ${INPUT_CLASS}`}
              value={gumBleeding}
              onChange={(event) => setGumBleeding(event.target.value)}
            >
              {BLEEDING_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {BLEEDING_LABEL[option]}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold"
              htmlFor="ohs-fluoride"
            >
              <input
                id="ohs-fluoride"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={fluorideToothpaste}
                onChange={(event) => setFluorideToothpaste(event.target.checked)}
              />
              My toothpaste contains fluoride (1000–1500 ppm)
            </label>
          </div>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Oral hygiene score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? dash : `${NUM.format(result.score)} / ${MAX_SCORE}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? dash : `${result.band} — ${result.bandNote}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy oral hygiene score result"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all answers" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && (
          <div
            className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
            role="img"
            aria-label={`Score ${result.score} out of ${MAX_SCORE}`}
          >
            <span
              className="block h-full bg-[var(--primary)]"
              style={{ width: `${Math.max(0, Math.min(100, result.score))}%` }}
            />
          </div>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {(hasError
            ? [
                ["Brushing frequency", dash],
                ["Brushing time per session", dash],
                ["Fluoride toothpaste", dash],
                ["Cleaning between teeth", dash],
                ["Brush / head freshness", dash],
                ["Sugar exposures per day", dash],
                ["Tobacco use", dash],
                ["Dental check-up recency", dash],
                ["Bleeding gums", dash],
                ["Points lost", dash],
              ]
            : [
                ...result.items.map((item) => [item.label, `${item.earned} / ${item.max}`]),
                ["Points lost", `${result.pointsLost}`],
              ]
          ).map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && result.tips.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Fix these first</h2>
          <ol className="mt-3 space-y-3 text-sm leading-6">
            {result.tips.map((tip, index) => (
              <li key={tip} className="flex gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--muted)] text-xs font-bold text-[var(--primary)]">
                  {index + 1}
                </span>
                <span className="text-[var(--muted-foreground)]">{tip}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {!hasError && result.tips.length === 0 && (
        <p className="mt-6 rounded-md bg-[var(--card)] px-3 py-3 text-sm text-[var(--success)] ring-1 ring-[var(--border)]">
          Every habit scored full marks. Keep the routine and stay on your dentist&apos;s recall interval.
        </p>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. This is a habit checklist, not a clinical examination or the OHI-S plaque
        index — it cannot detect decay, hidden calculus or gum pocketing. See a dentist or hygienist
        for diagnosis, and sooner if you have pain, swelling, a loose tooth or persistent bleeding.
      </p>
    </main>
  );
}
