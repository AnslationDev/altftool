"use client";

import { useMemo, useState } from "react";
import { Calculator, Check, Copy, RotateCcw } from "lucide-react";

import {
  CHALDEAN_GROUPS,
  MAX_COMPOUND_IN_TABLE,
  compareNameToBirth,
  computeDateNumbers,
  computeNameNumber,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const ERROR_CLASS =
  "rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]";

const DEFAULTS = { name: "Aditya Sharma", day: "19", month: "5", year: "1990" };
const DASH = "—";

const toInt = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isInteger(value) ? value : NaN;
};

export default function ToolHome() {
  const [name, setName] = useState(DEFAULTS.name);
  const [day, setDay] = useState(DEFAULTS.day);
  const [month, setMonth] = useState(DEFAULTS.month);
  const [year, setYear] = useState(DEFAULTS.year);
  const [copied, setCopied] = useState(false);

  const nameResult = useMemo(() => computeNameNumber(name), [name]);

  const dateResult = useMemo(
    () => computeDateNumbers({ day: toInt(day), month: toInt(month), year: toInt(year) }),
    [day, month, year],
  );

  const comparison = useMemo(
    () => compareNameToBirth(nameResult, dateResult),
    [nameResult, dateResult],
  );

  const summary = useMemo(() => {
    if (nameResult.error) return "";
    const lines = [
      "Chaldean numerology",
      `Name: ${nameResult.name}`,
      `Compound number: ${nameResult.compound}`,
      `Root number: ${nameResult.root} (${nameResult.rootInfo.planet})`,
    ];
    if (!dateResult.error) {
      lines.push(
        `Date of birth: ${dateResult.day}/${dateResult.month}/${dateResult.year}`,
        `Psychic number: ${dateResult.psychic} (${dateResult.psychicInfo.planet})`,
        `Destiny number: ${dateResult.destiny} (${dateResult.destinyInfo.planet})`,
      );
    }
    return lines.join("\n");
  }, [nameResult, dateResult]);

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
    setName(DEFAULTS.name);
    setDay(DEFAULTS.day);
    setMonth(DEFAULTS.month);
    setYear(DEFAULTS.year);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Calculator className="h-4 w-4" aria-hidden="true" />
          Chaldean system
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Chaldean Numerology Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Scores a name with the classical Chaldean table, where letters take values 1 to 8 and 9 is
          never assigned. You get the unreduced compound number, its single-digit root, and the
          psychic and destiny numbers from a date of birth.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div>
          <label className={LABEL_CLASS} htmlFor="chaldean-name">
            Name as it is written
          </label>
          <input
            id="chaldean-name"
            className={`mt-2 ${INPUT_CLASS}`}
            type="text"
            autoComplete="off"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Spaces, dots and hyphens are ignored; only A–Z letters are scored.
          </p>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label className={LABEL_CLASS} htmlFor="chaldean-day">
              Day of birth
            </label>
            <input
              id="chaldean-day"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="31"
              step="1"
              value={day}
              onChange={(event) => setDay(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="chaldean-month">
              Month
            </label>
            <input
              id="chaldean-month"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="12"
              step="1"
              value={month}
              onChange={(event) => setMonth(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="chaldean-year">
              Year
            </label>
            <input
              id="chaldean-year"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1000"
              max="2999"
              step="1"
              value={year}
              onChange={(event) => setYear(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        {nameResult.error ? (
          <p role="alert" className={ERROR_CLASS}>
            {nameResult.error}
          </p>
        ) : null}

        <div className="mt-1 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Name compound number
            </p>
            <p className="mt-1 text-5xl font-semibold leading-none text-[var(--primary)]">
              {nameResult.error ? DASH : nameResult.compound}
            </p>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              {nameResult.error
                ? DASH
                : `reduces to root ${nameResult.root} · ruled by ${nameResult.rootInfo.planet}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the Chaldean numerology result"
              className={GHOST_BTN}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Letters scored", nameResult.error ? DASH : String(nameResult.letterCount)],
            ["Compound total", nameResult.error ? DASH : String(nameResult.compound)],
            [
              "Reduction",
              nameResult.error
                ? DASH
                : nameResult.steps.length === 0
                  ? "already a single digit"
                  : nameResult.steps.map((s) => `${s.from} → ${s.to}`).join(", "),
            ],
            ["Root number", nameResult.error ? DASH : String(nameResult.root)],
            ["Root keynote", nameResult.error ? DASH : nameResult.rootInfo.keynote],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!nameResult.error ? (
          <div className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm">
            {nameResult.compoundInTable ? (
              <p>
                <span className="font-semibold">Compound {nameResult.compound}:</span>{" "}
                {nameResult.compoundMeaning}
              </p>
            ) : (
              <p className="text-[var(--muted-foreground)]">
                The classical compound table runs from 10 to {MAX_COMPOUND_IN_TABLE}. A total of{" "}
                {nameResult.compound} sits outside it, so only the root number {nameResult.root} is read.
              </p>
            )}
          </div>
        ) : null}

        {!nameResult.error ? (
          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Letter by letter
            </p>
            <div className="flex flex-wrap gap-1.5">
              {nameResult.letters.map((item, index) => (
                <span
                  key={`${item.letter}-${index}`}
                  className="inline-flex flex-col items-center rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-1"
                >
                  <span className="text-sm font-semibold">{item.letter}</span>
                  <span className="text-xs text-[var(--primary)]">{item.value}</span>
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Numbers from the date of birth</h2>
        {dateResult.error ? (
          <p role="alert" className={`mt-3 ${ERROR_CLASS}`}>
            {dateResult.error}
          </p>
        ) : null}
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Psychic number (moolank)
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)]">
              {dateResult.error ? DASH : dateResult.psychic}
            </p>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              {dateResult.error
                ? DASH
                : `day ${dateResult.day} reduced · ${dateResult.psychicInfo.planet}`}
            </p>
          </div>
          <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Destiny number (bhagyank)
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)]">
              {dateResult.error ? DASH : dateResult.destiny}
            </p>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              {dateResult.error
                ? DASH
                : `all digits total ${dateResult.destinyTotal} · ${dateResult.destinyInfo.planet}`}
            </p>
          </div>
        </div>
        {!comparison.error ? (
          <p className="mt-4 text-sm text-[var(--muted-foreground)]">{comparison.note}</p>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">The Chaldean letter table</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Values run 1 to 8 only. No letter is given the value 9.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-4 font-semibold">Value</th>
                <th scope="col" className="py-2 font-semibold">Letters</th>
              </tr>
            </thead>
            <tbody>
              {CHALDEAN_GROUPS.map((group) => (
                <tr key={group.value} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-4 font-semibold text-[var(--primary)]">{group.value}</td>
                  <td className="py-2 tracking-wide">{group.letters.join("  ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Numerology is a cultural and entertainment tradition, not a science. Nothing here predicts
        health, wealth, relationships or events, and it should never replace professional advice on
        medical, legal or financial decisions.
      </p>
    </main>
  );
}
