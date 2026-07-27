"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Recycle, RotateCcw } from "lucide-react";

import {
  CHANNELS,
  DEFAULT_CHANNEL_IDS,
  MAX_CLIP_SECONDS,
  MAX_MOMENTS,
  MAX_PER_WEEK,
  MAX_SOURCE_MINUTES,
  MIN_CLIP_SECONDS,
  MIN_MOMENTS,
  MIN_PER_WEEK,
  MIN_SOURCE_MINUTES,
  buildRepurposingPlan,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const PCT = new Intl.NumberFormat("en-IN", { style: "percent", maximumFractionDigits: 0 });
const DASH = "—";

const DEFAULTS = {
  sourceMinutes: "42",
  moments: "6",
  clipSeconds: "45",
  perWeek: "4",
  effortFactor: "1",
  channelIds: DEFAULT_CHANNEL_IDS,
};

/** Today as YYYY-MM-DD, used only as the form's starting value. */
function todayIso() {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [sourceMinutes, setSourceMinutes] = useState(DEFAULTS.sourceMinutes);
  const [moments, setMoments] = useState(DEFAULTS.moments);
  const [clipSeconds, setClipSeconds] = useState(DEFAULTS.clipSeconds);
  const [perWeek, setPerWeek] = useState(DEFAULTS.perWeek);
  const [effortFactor, setEffortFactor] = useState(DEFAULTS.effortFactor);
  const [channelIds, setChannelIds] = useState(DEFAULTS.channelIds);
  const [startDate, setStartDate] = useState(todayIso);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () =>
      buildRepurposingPlan({
        sourceMinutes: Number(sourceMinutes),
        moments: Number(moments),
        clipSeconds: Number(clipSeconds),
        channelIds,
        perWeek: Number(perWeek),
        startDate,
        effortFactor: Number(effortFactor),
      }),
    [sourceMinutes, moments, clipSeconds, channelIds, perWeek, startDate, effortFactor],
  );

  const hasError = Boolean(plan.error);

  const toggleChannel = (id) => {
    setChannelIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      `Repurposing plan — ${plan.sourceMinutes} min source, ${plan.moments} key moments`,
      `${plan.totalAssets} assets · ${NUM.format(plan.totalEffortHours)} production hours · ${plan.weeks} weeks at ${plan.perWeek}/week`,
      "",
      "ASSETS",
      ...plan.rows.map((row) => `${row.count} x ${row.label} (${row.rule})`),
      "",
      "CALENDAR",
      ...plan.schedule.map((item) => `${item.date} — ${item.title}`),
    ];
    return lines.join("\n");
  }, [plan, hasError]);

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
    setSourceMinutes(DEFAULTS.sourceMinutes);
    setMoments(DEFAULTS.moments);
    setClipSeconds(DEFAULTS.clipSeconds);
    setPerWeek(DEFAULTS.perWeek);
    setEffortFactor(DEFAULTS.effortFactor);
    setChannelIds(DEFAULTS.channelIds);
    setStartDate(todayIso());
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Recycle className="h-4 w-4" aria-hidden="true" />
          Repurposing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Content Repurposing Matrix
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          One long video in, a counted list of clips, carousels, threads and posts out — with the
          production hours it will actually cost and a calendar to publish them on.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rp-minutes">
              Source video runtime (minutes)
            </label>
            <input
              id="rp-minutes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min={MIN_SOURCE_MINUTES}
              max={MAX_SOURCE_MINUTES}
              step="1"
              value={sourceMinutes}
              onChange={(event) => setSourceMinutes(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rp-moments">
              Key moments marked
            </label>
            <input
              id="rp-moments"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_MOMENTS}
              max={MAX_MOMENTS}
              step="1"
              value={moments}
              onChange={(event) => setMoments(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rp-clip">
              Average clip length (seconds)
            </label>
            <input
              id="rp-clip"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_CLIP_SECONDS}
              max={MAX_CLIP_SECONDS}
              step="5"
              value={clipSeconds}
              onChange={(event) => setClipSeconds(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rp-cadence">
              Publish per week
            </label>
            <input
              id="rp-cadence"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_PER_WEEK}
              max={MAX_PER_WEEK}
              step="1"
              value={perWeek}
              onChange={(event) => setPerWeek(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rp-start">
              First publish date
            </label>
            <input
              id="rp-start"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rp-effort">
              Effort multiplier (1 = standard)
            </label>
            <input
              id="rp-effort"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.1"
              max="5"
              step="0.1"
              value={effortFactor}
              onChange={(event) => setEffortFactor(event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold">Output channels</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {CHANNELS.map((channel) => (
              <label
                key={channel.id}
                htmlFor={`rp-channel-${channel.id}`}
                className="flex min-h-11 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-semibold"
              >
                <input
                  id={`rp-channel-${channel.id}`}
                  type="checkbox"
                  className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                  checked={channelIds.includes(channel.id)}
                  onChange={() => toggleChannel(channel.id)}
                />
                <span className="min-w-0">{channel.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Assets from this one video
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(plan.totalAssets)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? DASH
                : `${NUM.format(plan.totalEffortHours)} production hours across ${plan.weeks} week(s)`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the repurposing plan and calendar"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the repurposing matrix"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Average effort per asset",
              hasError ? DASH : `${NUM.format(plan.effortPerAsset)} minutes`,
            ],
            [
              "Vertical clips cut",
              hasError ? DASH : `${plan.clipCount} (${NUM.format(plan.clipSecondsTotal / 60)} min total)`,
            ],
            ["Share of source footage used", hasError ? DASH : PCT.format(plan.sourceCoverage)],
            [
              "Source per key moment",
              hasError ? DASH : `${NUM.format(plan.minutesPerMoment)} minutes`,
            ],
            [
              "Publishing window",
              hasError ? DASH : `${plan.startDate} to ${plan.lastDate}`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && plan.warnings.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Worth a second look</h2>
          <ul className="mt-3 space-y-2">
            {plan.warnings.map((warning) => (
              <li
                key={warning}
                className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
              >
                {warning}
              </li>
            ))}
          </ul>
        </section>
      )}

      {!hasError && (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">The matrix</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[420px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Output
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      Count
                    </th>
                    <th scope="col" className="py-2 text-right font-semibold">
                      Minutes
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {plan.rows.map((row) => (
                    <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3">
                        <span className="font-semibold">{row.label}</span>
                        <span className="block text-xs text-[var(--muted-foreground)]">
                          {row.rule} · {row.spec}
                        </span>
                      </td>
                      <td className="py-2 pr-3 text-right font-semibold">{row.count}</td>
                      <td className="py-2 text-right text-[var(--muted-foreground)]">
                        {NUM.format(row.effortMinutes)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Publishing calendar</h2>
            <ol className="mt-3 divide-y divide-[var(--border)] text-sm">
              {plan.schedule.map((item) => (
                <li key={item.key} className="flex items-center justify-between gap-4 py-2.5">
                  <span className="font-mono text-xs text-[var(--muted-foreground)]">
                    {item.date}
                  </span>
                  <span className="text-right font-semibold">{item.title}</span>
                </li>
              ))}
            </ol>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Per-asset minute estimates are planning defaults for one editor working from a finished
        video with a transcript. Use the effort multiplier to match your own pace, and drop
        channels rather than rushing them.
      </p>
    </main>
  );
}
