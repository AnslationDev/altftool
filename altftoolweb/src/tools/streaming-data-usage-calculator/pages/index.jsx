"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Wifi } from "lucide-react";

import {
  DEFAULT_OVERHEAD_PERCENT,
  MAX_BITRATE_KBPS,
  MAX_CAP_GB,
  MAX_DAYS_PER_MONTH,
  MAX_HOURS_PER_DAY,
  MAX_OVERHEAD_PERCENT,
  MIN_BITRATE_KBPS,
  MIN_CAP_GB,
  QUALITY_PRESETS,
  comparePresets,
  computeStreamingUsage,
  formatData,
  formatHours,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN");
const PCT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULT_PRESET = "video-1080";

const DEFAULTS = {
  presetId: DEFAULT_PRESET,
  bitrateKbps: String(QUALITY_PRESETS.find((preset) => preset.id === DEFAULT_PRESET).kbps),
  hoursPerDay: "2",
  daysPerMonth: "30",
  dataCapGB: "50",
  overheadPercent: String(DEFAULT_OVERHEAD_PERCENT),
};

const AUDIO_PRESETS = QUALITY_PRESETS.filter((preset) => preset.group === "Audio");
const VIDEO_PRESETS = QUALITY_PRESETS.filter((preset) => preset.group === "Video");

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => {
    const { value } = event.target;
    setForm((previous) => ({ ...previous, [key]: value }));
    setCopied(false);
  };

  const choosePreset = (event) => {
    const { value } = event.target;
    const preset = QUALITY_PRESETS.find((item) => item.id === value);
    setForm((previous) => ({
      ...previous,
      presetId: value,
      bitrateKbps: preset ? String(preset.kbps) : previous.bitrateKbps,
    }));
    setCopied(false);
  };

  const changeBitrate = (event) => {
    const { value } = event.target;
    setForm((previous) => ({ ...previous, bitrateKbps: value, presetId: "custom" }));
    setCopied(false);
  };

  const result = useMemo(
    () =>
      computeStreamingUsage({
        bitrateKbps: form.bitrateKbps,
        hoursPerDay: form.hoursPerDay,
        daysPerMonth: form.daysPerMonth,
        dataCapGB: form.dataCapGB,
        overheadPercent: form.overheadPercent,
      }),
    [form],
  );

  const failed = Boolean(result.error);
  const tableOverhead = failed ? DEFAULT_OVERHEAD_PERCENT : result.overheadPercent;
  const table = useMemo(() => comparePresets(tableOverhead), [tableOverhead]);

  const copyResult = async () => {
    if (failed) return;
    try {
      await navigator.clipboard.writeText(result.summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setCopied(false);
  };

  const rows = failed
    ? [
        ["Effective bitrate", DASH],
        ["Per minute", DASH],
        ["Per hour", DASH],
        ["Per day", DASH],
        ["Over the whole period", DASH],
        ["Allowance used", DASH],
        ["Hours the allowance covers", DASH],
        ["Days at this daily habit", DASH],
      ]
    : [
        ["Effective bitrate", `${NUM.format(result.effectiveKbps)} kbps (${NUM.format(result.mbps)} Mbps raw)`],
        ["Per minute", formatData(result.gbPerMinute)],
        ["Per hour", formatData(result.gbPerHour)],
        ["Per day", formatData(result.gbPerDay)],
        [
          "Over the whole period",
          `${formatData(result.gbPerMonth)} across ${NUM.format(result.daysPerMonth)} days`,
        ],
        [
          "Allowance used",
          `${PCT.format(result.capUsedPercent)}% of ${NUM.format(result.capGB)} GB`,
        ],
        ["Hours the allowance covers", formatHours(result.hoursOnAllowance)],
        [
          "Days at this daily habit",
          result.daysOnAllowance === null ? "Not streaming daily" : `${NUM.format(result.daysOnAllowance)} days`,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Wifi className="h-4 w-4" aria-hidden="true" />
          Mobile data planner
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Streaming Data Usage Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick a quality, and this works out how much mobile data an hour of streaming costs and how long your allowance
          lasts. One Mbps sustained for an hour is 0.45 GB — everything below follows from that.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">What you are streaming</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sd-preset">
              Quality
            </label>
            <select id="sd-preset" className={`mt-2 ${INPUT_CLASS}`} value={form.presetId} onChange={choosePreset}>
              <optgroup label="Audio">
                {AUDIO_PRESETS.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Video">
                {VIDEO_PRESETS.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.label}
                  </option>
                ))}
              </optgroup>
              <option value="custom">Custom bitrate</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sd-bitrate">
              Bitrate in kbps ({NUM.format(MIN_BITRATE_KBPS)}–{NUM.format(MAX_BITRATE_KBPS)})
            </label>
            <input
              id="sd-bitrate"
              type="number"
              inputMode="numeric"
              min={MIN_BITRATE_KBPS}
              max={MAX_BITRATE_KBPS}
              step={1}
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.bitrateKbps}
              onChange={changeBitrate}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sd-overhead">
              Protocol overhead (%, 0–{MAX_OVERHEAD_PERCENT})
            </label>
            <input
              id="sd-overhead"
              type="number"
              inputMode="decimal"
              min={0}
              max={MAX_OVERHEAD_PERCENT}
              step={1}
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.overheadPercent}
              onChange={set("overheadPercent")}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Your habit and your allowance</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sd-hours">
              Hours per day (0–{MAX_HOURS_PER_DAY})
            </label>
            <input
              id="sd-hours"
              type="number"
              inputMode="decimal"
              min={0}
              max={MAX_HOURS_PER_DAY}
              step={0.5}
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.hoursPerDay}
              onChange={set("hoursPerDay")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sd-days">
              Days in the period (1–{MAX_DAYS_PER_MONTH})
            </label>
            <input
              id="sd-days"
              type="number"
              inputMode="numeric"
              min={1}
              max={MAX_DAYS_PER_MONTH}
              step={1}
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.daysPerMonth}
              onChange={set("daysPerMonth")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sd-cap">
              Data allowance in GB ({MIN_CAP_GB}–{NUM.format(MAX_CAP_GB)})
            </label>
            <input
              id="sd-cap"
              type="number"
              inputMode="decimal"
              min={MIN_CAP_GB}
              max={MAX_CAP_GB}
              step={1}
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.dataCapGB}
              onChange={set("dataCapGB")}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Data used per hour
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : formatData(result.gbPerHour)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the inputs above to see the numbers."
                : `${formatData(result.gbPerMonth)} over ${NUM.format(result.daysPerMonth)} days at ${NUM.format(result.hoursPerDay)} h a day`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the streaming data summary to the clipboard"
              className={GHOST_BTN}
              disabled={failed}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset every field to the defaults" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {failed && (
          <p role="alert" className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            {result.error}
          </p>
        )}

        {!failed && (
          <p
            role="status"
            className={`mt-4 rounded-md px-3 py-2 text-sm font-medium ${
              result.overAllowance
                ? "bg-[var(--danger-soft)] text-[var(--danger)]"
                : "bg-[var(--muted)] text-[var(--success)]"
            }`}
          >
            {result.overAllowance
              ? `That is ${formatData(result.overageGB)} over your ${NUM.format(result.capGB)} GB allowance — the allowance runs out after ${formatHours(result.hoursOnAllowance)} of streaming.`
              : `Within your ${NUM.format(result.capGB)} GB allowance, with ${formatData(result.spareGB)} spare.`}
          </p>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold break-words">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">An hour at every quality</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Including {NUM.format(tableOverhead)}% protocol overhead.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[30rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Quality</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Bitrate</th>
                <th scope="col" className="py-2 text-right font-semibold">Per hour</th>
              </tr>
            </thead>
            <tbody>
              {table.map((preset) => (
                <tr key={preset.id} className="border-b border-[var(--border)]">
                  <td className="py-2.5 pr-3">{preset.label}</td>
                  <td className="py-2.5 pr-3 text-right text-[var(--muted-foreground)]">
                    {NUM.format(preset.kbps)} kbps
                  </td>
                  <td className="py-2.5 text-right font-semibold">{formatData(preset.gbPerHour)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Data is shown in decimal gigabytes (1 GB = 1,000,000,000 bytes), the unit mobile networks meter allowances in.
        Streaming services use adaptive bitrate ladders, so the presets are representative rungs rather than
        guarantees — enter your service&apos;s published figure for an exact answer. Everything runs in your browser.
      </p>
    </main>
  );
}
