"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plus, RotateCcw, Ruler, Trash2 } from "lucide-react";
import {
  MCDONALD_MAX_WEEK,
  MCDONALD_MIN_WEEK,
  NORMAL_TOLERANCE_CM,
  REVIEW_TOLERANCE_CM,
  analyseLog,
  johnsonEstimatedWeight,
  normaliseEntry,
} from "../lib";

const SEED_ENTRIES = [
  { id: "seed-26", week: "26", fundalHeightCm: "26", circumferenceCm: "88" },
  { id: "seed-30", week: "30", fundalHeightCm: "29", circumferenceCm: "95" },
  { id: "seed-34", week: "34", fundalHeightCm: "34", circumferenceCm: "101" },
];

const BLANK_DRAFT = { week: "36", fundalHeightCm: "35", circumferenceCm: "104" };

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const CM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const G = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const signed = (value) =>
  value === null || value === undefined || !Number.isFinite(value)
    ? DASH
    : `${value > 0 ? "+" : value < 0 ? "−" : ""}${CM.format(Math.abs(value))}`;

const BAND_TEXT = {
  normal: "text-[var(--success)]",
  watch: "text-[var(--foreground)]",
  review: "text-[var(--danger)]",
  "outside-window": "text-[var(--muted-foreground)]",
  unknown: "text-[var(--muted-foreground)]",
};

export default function ToolHome() {
  const [entries, setEntries] = useState(SEED_ENTRIES);
  const [draft, setDraft] = useState(BLANK_DRAFT);
  const [belowSpines, setBelowSpines] = useState(false);
  const [maternalWeight, setMaternalWeight] = useState("");
  const [copied, setCopied] = useState(false);

  const draftCheck = useMemo(() => normaliseEntry({ id: "draft", ...draft }), [draft]);
  const draftError = draftCheck.error || "";

  const analysis = useMemo(() => analyseLog(entries), [entries]);
  const latest = analysis.latest;

  const johnson = useMemo(() => {
    if (!latest) return null;
    return johnsonEstimatedWeight({
      fundalHeightCm: latest.fundalHeightCm,
      belowSpines,
      maternalWeightKg: maternalWeight === "" ? null : maternalWeight,
    });
  }, [latest, belowSpines, maternalWeight]);

  const addEntry = () => {
    if (draftCheck.error) return;
    setEntries((current) => [
      ...current,
      {
        id: `entry-${draftCheck.week}-${current.length}-${draftCheck.fundalHeightCm}`,
        week: String(draftCheck.week),
        fundalHeightCm: String(draftCheck.fundalHeightCm),
        circumferenceCm:
          draftCheck.circumferenceCm === null ? "" : String(draftCheck.circumferenceCm),
      },
    ]);
  };

  const removeEntry = (id) => {
    setEntries((current) => current.filter((entry) => entry.id !== id));
  };

  const summary = useMemo(() => {
    if (!latest) return "";
    const lines = [
      "Pregnancy Belly Measurement Tracker",
      `Entries logged: ${analysis.count}`,
      `Latest: week ${latest.week} — fundal height ${CM.format(latest.fundalHeightCm)} cm (expected ${latest.expected} cm, difference ${signed(latest.difference)} cm)`,
    ];
    if (latest.circumferenceCm !== null) {
      lines.push(`Belly circumference: ${CM.format(latest.circumferenceCm)} cm`);
    }
    if (analysis.growth) {
      lines.push(
        `Growth: ${CM.format(analysis.growth.fundalTotal)} cm over ${analysis.growth.spanWeeks} weeks (${CM.format(analysis.growth.fundalPerWeek)} cm per week)`,
      );
    }
    if (johnson && !johnson.error) {
      lines.push(`Johnson's formula estimate: about ${G.format(johnson.grams)} g`);
    }
    return lines.join("\n");
  }, [latest, analysis, johnson]);

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
    setEntries(SEED_ENTRIES);
    setDraft(BLANK_DRAFT);
    setBelowSpines(false);
    setMaternalWeight("");
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Ruler className="h-4 w-4" aria-hidden="true" />
          Pregnancy
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Pregnancy Belly Measurement Tracker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Log fundal height and belly circumference at each check-up. Each entry is compared with
          McDonald&apos;s rule — fundal height in centimetres roughly equals gestational age in weeks
          between {MCDONALD_MIN_WEEK} and {MCDONALD_MAX_WEEK} weeks — and the week-to-week growth
          rate is worked out for you.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Add a measurement</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="bm-week">
              Gestational week
            </label>
            <input
              id="bm-week"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="16"
              max="44"
              step="1"
              value={draft.week}
              onChange={(event) => setDraft((current) => ({ ...current, week: event.target.value }))}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bm-fundal">
              Fundal height (cm)
            </label>
            <input
              id="bm-fundal"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="5"
              max="60"
              step="0.5"
              value={draft.fundalHeightCm}
              onChange={(event) =>
                setDraft((current) => ({ ...current, fundalHeightCm: event.target.value }))
              }
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="bm-circumference">
              Belly circumference at the navel (cm, optional)
            </label>
            <input
              id="bm-circumference"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="40"
              max="200"
              step="0.5"
              value={draft.circumferenceCm}
              onChange={(event) =>
                setDraft((current) => ({ ...current, circumferenceCm: event.target.value }))
              }
            />
          </div>
        </div>

        {draftError && (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {draftError}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={addEntry}
            className={PRIMARY_BTN}
            disabled={Boolean(draftError)}
            aria-label="Add this measurement to the log"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add to log
          </button>
          <button
            type="button"
            onClick={copyResult}
            aria-label="Copy the measurement summary"
            className={GHOST_BTN}
            disabled={!latest}
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
            aria-label="Reset the log to the sample entries"
            className={GHOST_BTN}
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
          Latest fundal height
        </p>
        <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
          {latest ? `${CM.format(latest.fundalHeightCm)} cm` : DASH}
        </p>
        <p className={`mt-1 text-sm ${latest ? BAND_TEXT[latest.band] : "text-[var(--muted-foreground)]"}`}>
          {latest ? latest.message : "Add a measurement to see how it compares."}
        </p>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Week of this measurement", latest ? String(latest.week) : DASH],
            ["Expected fundal height", latest ? `${latest.expected} cm` : DASH],
            [
              "Difference from expected",
              latest ? `${signed(latest.difference)} cm` : DASH,
            ],
            [
              "Belly circumference",
              latest && latest.circumferenceCm !== null
                ? `${CM.format(latest.circumferenceCm)} cm`
                : DASH,
            ],
            [
              "Fundal growth since the previous entry",
              latest && latest.fundalPerWeek !== null
                ? `${signed(latest.fundalPerWeek)} cm per week`
                : DASH,
            ],
            [
              "Average growth across the log",
              analysis.growth ? `${CM.format(analysis.growth.fundalPerWeek)} cm per week` : DASH,
            ],
            [
              "Johnson's formula weight estimate",
              johnson && !johnson.error ? `${G.format(johnson.grams)} g` : DASH,
            ],
            ["Entries flagged for review", latest ? String(analysis.flagged) : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="bm-weight">
              Your current weight (kg, optional)
            </label>
            <input
              id="bm-weight"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="30"
              max="200"
              step="0.5"
              value={maternalWeight}
              onChange={(event) => setMaternalWeight(event.target.value)}
            />
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              Johnson&apos;s rule subtracts 1 cm above 91 kg.
            </p>
          </div>
          <div className="flex items-start">
            <label
              className="mt-8 flex min-h-11 w-full items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold"
              htmlFor="bm-spines"
            >
              <input
                id="bm-spines"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={belowSpines}
                onChange={(event) => setBelowSpines(event.target.checked)}
              />
              Head engaged (below the spines)
            </label>
          </div>
        </div>
        {johnson && johnson.error && (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {johnson.error}
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Your log</h2>
        {analysis.rows.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
            No measurements yet. Add one above.
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Week
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Fundal
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    vs expected
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Belly
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Remove
                  </th>
                </tr>
              </thead>
              <tbody>
                {analysis.rows.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.week}</td>
                    <td className="py-2 pr-3 text-right">{CM.format(row.fundalHeightCm)} cm</td>
                    <td className={`py-2 pr-3 text-right font-semibold ${BAND_TEXT[row.band]}`}>
                      {signed(row.difference)} cm
                    </td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {row.circumferenceCm === null ? DASH : `${CM.format(row.circumferenceCm)} cm`}
                    </td>
                    <td className="py-2 text-right">
                      <button
                        type="button"
                        onClick={() => removeEntry(row.id)}
                        aria-label={`Remove the week ${row.week} measurement`}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-md text-[var(--muted-foreground)] transition hover:text-[var(--danger)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, and not a substitute for antenatal care. Fundal height measured at home
        varies with bladder fullness, technique and body shape, and a difference of more than{" "}
        {REVIEW_TOLERANCE_CM} cm from expected — or less than {NORMAL_TOLERANCE_CM} cm of growth over
        several weeks — should be checked by your midwife or obstetrician rather than tracked alone.
      </p>
    </main>
  );
}
