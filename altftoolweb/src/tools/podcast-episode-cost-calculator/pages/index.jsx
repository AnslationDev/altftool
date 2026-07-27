"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Podcast, RotateCcw } from "lucide-react";

import { computeEpisodeCost, DOWNLOADS_PER_CPM_UNIT } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const INR2 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const DASH = "—";
const money = (value) => (Number.isFinite(value) ? INR.format(value) : DASH);
const money2 = (value) => (Number.isFinite(value) ? INR2.format(value) : DASH);
const count = (value) => (Number.isFinite(value) ? NUM.format(value) : DASH);

const DEFAULTS = {
  episodeMinutes: "45",
  episodesPerMonth: "4",
  editingHours: "4",
  editingHourlyRate: "1500",
  transcriptionPerMinute: "10",
  artworkPerEpisode: "800",
  musicLicensing: "300",
  guestFees: "0",
  otherPerEpisode: "200",
  monthlyHosting: "1200",
  monthlySoftware: "900",
  gearInvestment: "60000",
  gearLifetimeEpisodes: "100",
  downloadsPerEpisode: "2000",
  sponsorCpm: "500",
};

const FIELDS = [
  { key: "episodeMinutes", label: "Finished episode length (minutes)", step: "1" },
  { key: "episodesPerMonth", label: "Episodes released per month", step: "0.25" },
  { key: "editingHours", label: "Editing hours per episode", step: "0.5" },
  { key: "editingHourlyRate", label: "Editor rate (INR per hour)", step: "50" },
  { key: "transcriptionPerMinute", label: "Transcription (INR per audio minute)", step: "1" },
  { key: "artworkPerEpisode", label: "Artwork & design (INR per episode)", step: "50" },
  { key: "musicLicensing", label: "Music licensing (INR per episode)", step: "50" },
  { key: "guestFees", label: "Guest or talent fee (INR per episode)", step: "100" },
  { key: "otherPerEpisode", label: "Other per-episode costs (INR)", step: "50" },
  { key: "monthlyHosting", label: "Podcast hosting (INR per month)", step: "50" },
  { key: "monthlySoftware", label: "Software subscriptions (INR per month)", step: "50" },
  { key: "gearInvestment", label: "Gear investment (INR, one-off)", step: "500" },
  { key: "gearLifetimeEpisodes", label: "Episodes the gear should last", step: "10" },
  { key: "downloadsPerEpisode", label: "Downloads per episode", step: "100" },
  { key: "sponsorCpm", label: `Sponsor CPM (INR per ${DOWNLOADS_PER_CPM_UNIT} downloads)`, step: "50" },
];

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const text = String(raw).replace(/,/g, "").trim();
  if (text === "") return 0;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [values, setValues] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setField = (key, next) => {
    setValues((prev) => ({ ...prev, [key]: next }));
  };

  const result = useMemo(() => {
    const parsed = {};
    for (const field of FIELDS) {
      parsed[field.key] = toNumber(values[field.key]);
    }
    if (Object.values(parsed).some((value) => Number.isNaN(value))) {
      return { error: "Enter valid numbers in every field." };
    }
    return computeEpisodeCost(parsed);
  }, [values]);

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Podcast Episode Cost Calculator",
      `Cost per episode: ${money(result.costPerEpisode)}`,
      `Cost per finished minute: ${money2(result.costPerFinishedMinute)}`,
      `Sponsor revenue per episode: ${money(result.sponsorRevenue)}`,
      `Net per episode: ${money(result.netPerEpisode)}`,
      result.breakEvenCpm === null
        ? "Break-even CPM: not available (no downloads entered)"
        : `Break-even CPM: ${money2(result.breakEvenCpm)}`,
      result.breakEvenDownloads === null
        ? "Break-even downloads: not available (no CPM entered)"
        : `Break-even downloads: ${count(result.breakEvenDownloads)}`,
      `Cost for ${count(result.episodesPerYear)} episodes a year: ${money(result.annualCost)}`,
    ].join("\n");
  }, [ok, result]);

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
    setValues(DEFAULTS);
    setCopied(false);
  };

  const breakdown = ok ? result.lines.filter((line) => line.amount > 0) : [];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Podcast className="h-4 w-4" aria-hidden="true" />
          Podcast budgeting
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Podcast Episode Cost Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Add up editing, transcription, artwork, hosting and gear to get the true cost of one
          episode — then see the sponsor CPM you would need to cover it.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Your numbers</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {FIELDS.map((field) => (
            <div key={field.key}>
              <label className={LABEL_CLASS} htmlFor={`pec-${field.key}`}>
                {field.label}
              </label>
              <input
                id={`pec-${field.key}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step={field.step}
                value={values[field.key]}
                onChange={(event) => setField(field.key, event.target.value)}
              />
            </div>
          ))}
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Cost per episode
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? money(result.costPerEpisode) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${money2(result.costPerFinishedMinute)} per finished minute`
                : "Fix the inputs above to see a result"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy podcast episode cost result"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
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
            ["Direct per-episode spend", ok ? money(result.directCost) : DASH],
            ["Hosting & software share", ok ? money(result.recurringCost) : DASH],
            ["Gear amortised per episode", ok ? money(result.gearCost) : DASH],
            ["Sponsor revenue per episode", ok ? money(result.sponsorRevenue) : DASH],
            [
              "Net per episode",
              ok ? money(result.netPerEpisode) : DASH,
              ok && result.netPerEpisode < 0 ? "text-[var(--danger)]" : "text-[var(--success)]",
            ],
            [
              `Break-even CPM (per ${DOWNLOADS_PER_CPM_UNIT} downloads)`,
              ok && result.breakEvenCpm !== null ? money2(result.breakEvenCpm) : DASH,
            ],
            [
              "Break-even downloads at your CPM",
              ok && result.breakEvenDownloads !== null ? count(result.breakEvenDownloads) : DASH,
            ],
            [
              "Cost for a full year",
              ok ? `${money(result.annualCost)} (${count(result.episodesPerYear)} episodes)` : DASH,
            ],
          ].map(([label, value, tone]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className={`text-right font-semibold ${tone || ""}`}>{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Where the money goes</h2>
        {ok && breakdown.length > 0 ? (
          <ul className="mt-4 space-y-3">
            {breakdown.map((line) => {
              const share =
                result.costPerEpisode > 0 ? (line.amount / result.costPerEpisode) * 100 : 0;
              return (
                <li key={line.label}>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-[var(--muted-foreground)]">{line.label}</span>
                    <span className="font-semibold">
                      {money(line.amount)} · {share.toFixed(0)}%
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]">
                    <span
                      className="block h-full bg-[var(--primary)]"
                      style={{ width: `${Math.max(0, Math.min(100, share))}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">{DASH}</p>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Estimates only. Sponsor CPMs vary widely by niche and country, hosting plans often meter
        bandwidth or upload hours, and taxes on freelance invoices are not included here.
      </p>
    </main>
  );
}
