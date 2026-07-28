"use client";

import { useMemo, useState } from "react";
import { Baby, Check, Copy, RotateCcw } from "lucide-react";
import { APGAR_BANDS, APGAR_MAX, APGAR_SIGNS, computeApgarSeries } from "../lib";

const DEFAULT_ONE = [1, 2, 1, 1, 1];
const DEFAULT_FIVE = [2, 2, 2, 2, 2];
const DEFAULT_TEN = [2, 2, 2, 2, 2];

const CARD = "rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const SELECT =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

function SignPicker({ prefix, scores, onChange }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {APGAR_SIGNS.map((sign, index) => {
        const inputId = `apgar-${prefix}-${sign.id}`;
        return (
          <div key={sign.id}>
            <label className={LABEL} htmlFor={inputId}>
              {sign.letter} — {sign.name}{" "}
              <span className="font-normal text-[var(--muted-foreground)]">({sign.detail})</span>
            </label>
            <select
              id={inputId}
              className={SELECT}
              value={scores[index]}
              onChange={(event) => onChange(index, Number(event.target.value))}
            >
              {sign.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.value} — {option.label}
                </option>
              ))}
            </select>
          </div>
        );
      })}
    </div>
  );
}

export default function ToolHome() {
  const [one, setOne] = useState(DEFAULT_ONE);
  const [five, setFive] = useState(DEFAULT_FIVE);
  const [ten, setTen] = useState(DEFAULT_TEN);
  const [includeTen, setIncludeTen] = useState(false);
  const [copied, setCopied] = useState(false);

  const updater = (setter) => (index, value) =>
    setter((prev) => prev.map((item, i) => (i === index ? value : item)));

  const result = useMemo(
    () =>
      computeApgarSeries({
        oneMinute: one,
        fiveMinute: five,
        tenMinute: includeTen ? ten : null,
      }),
    [one, five, ten, includeTen],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Apgar Score",
      ...result.assessments.map(
        (item) =>
          `${item.minute} minute: ${item.total}/${item.max} (${item.band}) — ${item.breakdown
            .map((row) => `${row.letter}${row.points}`)
            .join(" ")}`,
      ),
      `Change from 1 to 5 minutes: ${result.changeOneToFive > 0 ? "+" : ""}${result.changeOneToFive} (${result.trend})`,
      result.repeatScoringAdvised
        ? `5-minute score is below ${result.repeatScoringThreshold}, so scoring continues every 5 minutes.`
        : `5-minute score is at or above ${result.repeatScoringThreshold}.`,
    ].join("\n");
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
    setOne(DEFAULT_ONE);
    setFive(DEFAULT_FIVE);
    setTen(DEFAULT_TEN);
    setIncludeTen(false);
    setCopied(false);
  };

  const headline = hasError ? DASH : `${result.five.total}`;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Baby className="h-4 w-4" aria-hidden="true" />
          Newborn score
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Apgar Score Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Appearance, Pulse, Grimace, Activity and Respiration, each scored 0, 1 or 2, give a total
          out of {APGAR_MAX}. Score at 1 and 5 minutes after birth, and at 10 minutes when the
          5-minute total is below 7.
        </p>
      </header>

      <section className={CARD}>
        <h2 className="text-base font-semibold">At 1 minute</h2>
        <div className="mt-4">
          <SignPicker prefix="one" scores={one} onChange={updater(setOne)} />
        </div>
      </section>

      <section className={`mt-6 ${CARD}`}>
        <h2 className="text-base font-semibold">At 5 minutes</h2>
        <div className="mt-4">
          <SignPicker prefix="five" scores={five} onChange={updater(setFive)} />
        </div>
      </section>

      <section className={`mt-6 ${CARD}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">At 10 minutes</h2>
          <label
            className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm"
            htmlFor="apgar-include-ten"
          >
            <input
              id="apgar-include-ten"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              checked={includeTen}
              onChange={(event) => setIncludeTen(event.target.checked)}
            />
            Include a 10-minute score
          </label>
        </div>
        {includeTen ? (
          <div className="mt-4">
            <SignPicker prefix="ten" scores={ten} onChange={updater(setTen)} />
          </div>
        ) : (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
            Not recorded. Tick the box above when the 5-minute total is below 7 and scoring
            continues.
          </p>
        )}
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className={`mt-6 ${CARD}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              5-minute Apgar
            </p>
            <p className="mt-1 text-5xl font-semibold text-[var(--primary)]">{headline}</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to see a score." : `out of ${APGAR_MAX} · ${result.five.band}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy Apgar scores"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all signs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["1-minute total", hasError ? DASH : `${result.one.total} / ${APGAR_MAX} · ${result.one.band}`],
            ["5-minute total", hasError ? DASH : `${result.five.total} / ${APGAR_MAX} · ${result.five.band}`],
            [
              "10-minute total",
              hasError ? DASH : result.ten ? `${result.ten.total} / ${APGAR_MAX} · ${result.ten.band}` : "Not recorded",
            ],
            [
              "Change from 1 to 5 minutes",
              hasError ? DASH : `${result.changeOneToFive > 0 ? "+" : ""}${result.changeOneToFive} (${result.trend})`,
            ],
            [
              "Repeat scoring advised",
              hasError
                ? DASH
                : result.repeatScoringAdvised
                  ? `Yes — 5-minute score is below ${result.repeatScoringThreshold}`
                  : "No",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className={`mt-6 ${CARD}`}>
          <h2 className="text-base font-semibold">Sign by sign</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[360px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Sign</th>
                  {result.assessments.map((item) => (
                    <th key={item.minute} scope="col" className="py-2 pr-3 text-right font-semibold">
                      {item.minute} min
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {APGAR_SIGNS.map((sign, index) => (
                  <tr key={sign.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">
                      {sign.letter} — {sign.name}
                    </td>
                    {result.assessments.map((item) => (
                      <td key={item.minute} className="py-2 pr-3 text-right">
                        {item.breakdown[index].points}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <td className="py-2 pr-3 font-semibold">Total</td>
                  {result.assessments.map((item) => (
                    <td key={item.minute} className="py-2 pr-3 text-right font-semibold text-[var(--primary)]">
                      {item.total}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className={`mt-6 ${CARD}`}>
        <h2 className="text-base font-semibold">How the total is described</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Total</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Band</th>
                <th scope="col" className="py-2 font-semibold">Usual reading</th>
              </tr>
            </thead>
            <tbody>
              {APGAR_BANDS.map((band) => (
                <tr key={band.label} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">
                    {band.min}-{band.max}
                  </td>
                  <td className="py-2 pr-3">{band.label}</td>
                  <td className="py-2 text-[var(--muted-foreground)]">{band.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Educational and informational only. The Apgar score records a newborn&apos;s condition at a
        moment in time; it is expressly not used to decide whether to begin resuscitation, which
        follows its own protocol, and a single low score does not by itself predict long-term
        outcome. Scoring in practice is done by the clinicians present at the birth.
      </p>
    </main>
  );
}
