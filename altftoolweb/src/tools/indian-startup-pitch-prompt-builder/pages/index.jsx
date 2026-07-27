"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Presentation, RotateCcw } from "lucide-react";

import { DECK_TYPES, SECTORS, STAGES, buildPitchPrompt, toCroreLakh } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const AUDIENCES = [
  "Indian early-stage VC",
  "Angel investor / angel network",
  "Accelerator selection panel",
  "Family office",
  "Corporate strategic investor",
  "Government / DPIIT startup grant panel",
];

const DEFAULTS = {
  startupName: "Khetly",
  stage: "seed",
  sector: "agritech",
  deckType: "pitch-deck",
  oneLiner: "We help farmer producer organisations sell produce directly to urban retailers.",
  pitchMinutes: "10",
  cashInBank: "12000000",
  monthlyBurn: "1500000",
  raiseAmount: "60000000",
  dilutionPct: "15",
  audience: "Indian early-stage VC",
};

const DASH = "—";

export default function ToolHome() {
  const [startupName, setStartupName] = useState(DEFAULTS.startupName);
  const [stage, setStage] = useState(DEFAULTS.stage);
  const [sector, setSector] = useState(DEFAULTS.sector);
  const [deckType, setDeckType] = useState(DEFAULTS.deckType);
  const [oneLiner, setOneLiner] = useState(DEFAULTS.oneLiner);
  const [pitchMinutes, setPitchMinutes] = useState(DEFAULTS.pitchMinutes);
  const [cashInBank, setCashInBank] = useState(DEFAULTS.cashInBank);
  const [monthlyBurn, setMonthlyBurn] = useState(DEFAULTS.monthlyBurn);
  const [raiseAmount, setRaiseAmount] = useState(DEFAULTS.raiseAmount);
  const [dilutionPct, setDilutionPct] = useState(DEFAULTS.dilutionPct);
  const [audience, setAudience] = useState(DEFAULTS.audience);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildPitchPrompt({
        startupName,
        stage,
        sector,
        deckType,
        oneLiner,
        pitchMinutes,
        cashInBank,
        monthlyBurn,
        raiseAmount,
        dilutionPct,
        audience,
      }),
    [
      startupName,
      stage,
      sector,
      deckType,
      oneLiner,
      pitchMinutes,
      cashInBank,
      monthlyBurn,
      raiseAmount,
      dilutionPct,
      audience,
    ],
  );

  const ok = !result.error;
  const fin = ok ? result.financials : null;

  const copyPrompt = async () => {
    if (!ok) return;
    try {
      await navigator.clipboard.writeText(result.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setStartupName(DEFAULTS.startupName);
    setStage(DEFAULTS.stage);
    setSector(DEFAULTS.sector);
    setDeckType(DEFAULTS.deckType);
    setOneLiner(DEFAULTS.oneLiner);
    setPitchMinutes(DEFAULTS.pitchMinutes);
    setCashInBank(DEFAULTS.cashInBank);
    setMonthlyBurn(DEFAULTS.monthlyBurn);
    setRaiseAmount(DEFAULTS.raiseAmount);
    setDilutionPct(DEFAULTS.dilutionPct);
    setAudience(DEFAULTS.audience);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Presentation className="h-4 w-4" aria-hidden="true" />
          Fundraising
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Indian Startup Pitch Prompt Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter your stage, sector and the round you are raising. The tool works out runway, implied
          valuation and slide timings, then writes the prompt so the AI cannot invent numbers.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pitch-name">
              Startup name
            </label>
            <input
              id="pitch-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={startupName}
              onChange={(event) => setStartupName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pitch-deck-type">
              What to write
            </label>
            <select
              id="pitch-deck-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={deckType}
              onChange={(event) => setDeckType(event.target.value)}
            >
              {Object.entries(DECK_TYPES).map(([key, spec]) => (
                <option key={key} value={key}>
                  {spec.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pitch-oneliner">
              What you do, in one sentence
            </label>
            <textarea
              id="pitch-oneliner"
              className="mt-2 min-h-20 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              value={oneLiner}
              onChange={(event) => setOneLiner(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pitch-stage">
              Stage
            </label>
            <select
              id="pitch-stage"
              className={`mt-2 ${INPUT_CLASS}`}
              value={stage}
              onChange={(event) => setStage(event.target.value)}
            >
              {Object.entries(STAGES).map(([key, spec]) => (
                <option key={key} value={key}>
                  {spec.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pitch-sector">
              Sector
            </label>
            <select
              id="pitch-sector"
              className={`mt-2 ${INPUT_CLASS}`}
              value={sector}
              onChange={(event) => setSector(event.target.value)}
            >
              {Object.entries(SECTORS).map(([key, spec]) => (
                <option key={key} value={key}>
                  {spec.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pitch-audience">
              Audience
            </label>
            <select
              id="pitch-audience"
              className={`mt-2 ${INPUT_CLASS}`}
              value={audience}
              onChange={(event) => setAudience(event.target.value)}
            >
              {AUDIENCES.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pitch-minutes">
              Pitch length (minutes)
            </label>
            <input
              id="pitch-minutes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="2"
              max="60"
              step="1"
              value={pitchMinutes}
              onChange={(event) => setPitchMinutes(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pitch-cash">
              Cash in bank (INR)
            </label>
            <input
              id="pitch-cash"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100000"
              value={cashInBank}
              onChange={(event) => setCashInBank(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pitch-burn">
              Net monthly burn (INR)
            </label>
            <input
              id="pitch-burn"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="50000"
              value={monthlyBurn}
              onChange={(event) => setMonthlyBurn(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pitch-raise">
              Raise amount (INR)
            </label>
            <input
              id="pitch-raise"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500000"
              value={raiseAmount}
              onChange={(event) => setRaiseAmount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pitch-dilution">
              Equity offered (%)
            </label>
            <input
              id="pitch-dilution"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.1"
              max="99"
              step="0.5"
              value={dilutionPct}
              onChange={(event) => setDilutionPct(event.target.value)}
            />
          </div>
        </div>
      </section>

      {result.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Current runway
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {fin ? `${NUM.format(fin.currentRunwayMonths)} months` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {fin
                ? fin.raiseIsUrgent
                  ? "Under six months of cash — a priced round usually takes that long to close."
                  : `Start the next raise in about ${NUM.format(fin.startNextRaiseInMonths)} months.`
                : "Fix the inputs above to see the numbers."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyPrompt}
              aria-label="Copy the generated startup pitch prompt"
              className={PRIMARY_BTN}
              disabled={!ok}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy prompt"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all fields" className={GHOST_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-md bg-[var(--muted)] px-3 py-2">
            <dt className="text-xs text-[var(--muted-foreground)]">Implied post-money</dt>
            <dd className="text-base font-semibold">{fin ? toCroreLakh(fin.postMoney) : DASH}</dd>
          </div>
          <div className="rounded-md bg-[var(--muted)] px-3 py-2">
            <dt className="text-xs text-[var(--muted-foreground)]">Implied pre-money</dt>
            <dd className="text-base font-semibold">{fin ? toCroreLakh(fin.preMoney) : DASH}</dd>
          </div>
          <div className="rounded-md bg-[var(--muted)] px-3 py-2">
            <dt className="text-xs text-[var(--muted-foreground)]">Months the raise buys</dt>
            <dd className="text-base font-semibold">
              {fin ? NUM.format(fin.monthsBought) : DASH}
            </dd>
          </div>
          <div className="rounded-md bg-[var(--muted)] px-3 py-2">
            <dt className="text-xs text-[var(--muted-foreground)]">Runway after the round</dt>
            <dd className="text-base font-semibold">
              {fin ? `${NUM.format(fin.postRaiseRunwayMonths)} months` : DASH}
            </dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-[var(--muted-foreground)]">
          Informational arithmetic on the figures you entered — not investment advice or a
          valuation opinion. Have a CA or lawyer check anything that goes into a term sheet.
        </p>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-lg font-semibold">Slide-by-slide time budget</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[22rem] text-left text-sm">
            <thead>
              <tr className="text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-medium">
                  Slide
                </th>
                <th scope="col" className="py-2 pr-3 font-medium">
                  Seconds
                </th>
                <th scope="col" className="py-2 font-medium">
                  What has to land
                </th>
              </tr>
            </thead>
            <tbody>
              {ok ? (
                result.timing.slides.map((slide) => (
                  <tr key={slide.name} className="border-t border-[var(--border)]">
                    <td className="py-2 pr-3 font-medium">{slide.name}</td>
                    <td className="py-2 pr-3">{slide.seconds}s</td>
                    <td className="py-2 text-[var(--muted-foreground)]">{slide.note}</td>
                  </tr>
                ))
              ) : (
                <tr className="border-t border-[var(--border)]">
                  <td className="py-2 pr-3">{DASH}</td>
                  <td className="py-2 pr-3">{DASH}</td>
                  <td className="py-2">{DASH}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-lg font-semibold">Generated prompt</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {ok ? `${result.title} · ${result.wordCount} words` : DASH}
        </p>
        <pre className="mt-3 max-h-96 overflow-auto rounded-md bg-[var(--muted)] p-3 text-sm leading-6 whitespace-pre-wrap text-[var(--foreground)]">
          {ok ? result.prompt : DASH}
        </pre>
      </section>
    </main>
  );
}
