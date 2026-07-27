"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Target, TriangleAlert } from "lucide-react";

import {
  DEFAULT_INTERRUPT_EVERY_SEC,
  FRAME_RATES,
  PLATFORM_MARKS,
  buildHookPlan,
  computeFunnel,
  formatSec,
} from "../lib";

const NUM = new Intl.NumberFormat("en-US");
const RATE = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const formatRate = (percent) => `${RATE.format(percent)}%`;

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const PLATFORM_LIST = Object.values(PLATFORM_MARKS);

const DEFAULTS = {
  platform: "reels",
  duration: "30",
  fps: "30",
  interrupt: String(DEFAULT_INTERRUPT_EVERY_SEC),
  cta: "",
  impressions: "10000",
  hookViews: "4200",
  heldViews: "900",
};

const toNumber = (value) => (String(value).trim() === "" ? Number.NaN : Number(value));

export default function ToolHome() {
  const [platform, setPlatform] = useState(DEFAULTS.platform);
  const [duration, setDuration] = useState(DEFAULTS.duration);
  const [fps, setFps] = useState(DEFAULTS.fps);
  const [interrupt, setInterrupt] = useState(DEFAULTS.interrupt);
  const [cta, setCta] = useState(DEFAULTS.cta);
  const [impressions, setImpressions] = useState(DEFAULTS.impressions);
  const [hookViews, setHookViews] = useState(DEFAULTS.hookViews);
  const [heldViews, setHeldViews] = useState(DEFAULTS.heldViews);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () =>
      buildHookPlan({
        platform,
        durationSec: toNumber(duration),
        fps: toNumber(fps),
        interruptEverySec: toNumber(interrupt),
        ctaSec: String(cta).trim() === "" ? null : toNumber(cta),
      }),
    [platform, duration, fps, interrupt, cta],
  );

  const funnel = useMemo(
    () =>
      computeFunnel({
        impressions: toNumber(impressions),
        hookViews: toNumber(hookViews),
        heldViews: toNumber(heldViews),
      }),
    [impressions, hookViews, heldViews],
  );

  const hasError = Boolean(plan.error);
  const funnelError = Boolean(funnel.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      `Hook beat sheet — ${plan.marks.label}`,
      `Runtime ${formatSec(plan.durationSec)} at ${plan.fps} fps (${NUM.format(plan.totalFrames)} frames)`,
      `Hook must land by ${formatSec(plan.hookEndSec)} — frame ${NUM.format(plan.hookFrames)}`,
      `CTA runs the last ${formatSec(plan.ctaSec)}, from ${formatSec(plan.ctaStartSec)}`,
      "",
      ...plan.beats.map(
        (beat) => `${beat.startTc} – ${beat.endTc}  ${beat.label}${beat.critical ? " *" : ""}`,
      ),
    ];
    if (plan.warnings.length) lines.push("", ...plan.warnings.map((w) => `! ${w}`));
    return lines.join("\n");
  }, [hasError, plan]);

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
    setPlatform(DEFAULTS.platform);
    setDuration(DEFAULTS.duration);
    setFps(DEFAULTS.fps);
    setInterrupt(DEFAULTS.interrupt);
    setCta(DEFAULTS.cta);
    setImpressions(DEFAULTS.impressions);
    setHookViews(DEFAULTS.hookViews);
    setHeldViews(DEFAULTS.heldViews);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Hook frame", DASH],
        ["Platform view mark", DASH],
        ["Completion threshold", DASH],
        ["Pattern interrupts", DASH],
        ["CTA window", DASH],
        ["Total frames", DASH],
      ]
    : [
        ["Hook frame", `frame ${NUM.format(plan.hookFrames)} of ${NUM.format(plan.totalFrames)}`],
        [
          "Platform view mark",
          plan.marks.viewAtSec > 0 ? formatSec(plan.marks.viewAtSec) : "Counted immediately",
        ],
        ["Completion threshold", formatSec(plan.marks.creditAtSec)],
        [
          "Pattern interrupts",
          `${NUM.format(plan.interruptCount)} every ${formatSec(plan.interruptEverySec)}`,
        ],
        ["CTA window", `${formatSec(plan.ctaStartSec)} → ${formatSec(plan.durationSec)}`],
        ["Total frames", `${NUM.format(plan.totalFrames)} at ${plan.fps} fps`],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Target className="h-4 w-4" aria-hidden="true" />
          Marketing &amp; Social
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Hook Retention Timing Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter a runtime and a frame rate and get a beat sheet pinned to the platform&apos;s own
          measurement lines — where a view is counted, where the skip button appears and where a
          completion is credited — in seconds, frames and timecode.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="hook-platform">
              Platform
            </label>
            <select
              id="hook-platform"
              className={`mt-2 ${INPUT_CLASS}`}
              value={platform}
              onChange={(event) => setPlatform(event.target.value)}
            >
              {PLATFORM_LIST.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
            {!hasError ? (
              <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
                {plan.marks.note}
              </p>
            ) : null}
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="hook-duration">
              Video length (seconds)
            </label>
            <input
              id="hook-duration"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="600"
              step="1"
              value={duration}
              onChange={(event) => setDuration(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="hook-fps">
              Frame rate
            </label>
            <select
              id="hook-fps"
              className={`mt-2 ${INPUT_CLASS}`}
              value={fps}
              onChange={(event) => setFps(event.target.value)}
            >
              {FRAME_RATES.map((rate) => (
                <option key={rate} value={String(rate)}>
                  {rate} fps
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="hook-interrupt">
              Pattern interrupt every (seconds)
            </label>
            <input
              id="hook-interrupt"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.5"
              step="0.5"
              value={interrupt}
              onChange={(event) => setInterrupt(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="hook-cta">
              CTA length (seconds, blank = auto)
            </label>
            <input
              id="hook-cta"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              placeholder="auto"
              value={cta}
              onChange={(event) => setCta(event.target.value)}
            />
          </div>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Hook must land by
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : formatSec(plan.hookEndSec)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs above to see the beat sheet."
                : `Everything the viewer needs to stay must be said and captioned before frame ${NUM.format(plan.hookFrames)}.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the hook beat sheet"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy beat sheet"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the planner to its defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && plan.warnings.length ? (
        <ul className="mt-6 grid gap-2">
          {plan.warnings.map((warning) => (
            <li
              key={warning}
              className="flex gap-2 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm leading-6 text-[var(--danger)]"
            >
              <TriangleAlert className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{warning}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {!hasError ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Beat sheet</h2>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Timecode is non-drop-frame MM:SS:FF at {plan.fps} fps. Beats marked{" "}
            <span className="font-semibold text-[var(--primary)]">key</span> are the ones the
            platform actually measures.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[34rem] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    In / out
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Frames
                  </th>
                  <th scope="col" className="py-2 font-semibold">
                    Beat
                  </th>
                </tr>
              </thead>
              <tbody>
                {plan.beats.map((beat) => (
                  <tr key={beat.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-3 pr-3 font-mono text-xs whitespace-nowrap">
                      {beat.startTc}
                      <br />
                      {beat.endTc}
                    </td>
                    <td className="py-3 pr-3 font-mono text-xs whitespace-nowrap">
                      {NUM.format(beat.startFrame)}–{NUM.format(beat.endFrame)}
                    </td>
                    <td className="py-3">
                      <span className="font-semibold">{beat.label}</span>
                      {beat.critical ? (
                        <span className="ml-2 rounded-sm bg-[var(--muted)] px-1.5 py-0.5 text-[11px] font-semibold text-[var(--primary)]">
                          key
                        </span>
                      ) : null}
                      <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">
                        {beat.detail}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Check it against your reporting</h2>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          Hook rate = views at the view mark ÷ impressions. Hold rate = views at the completion
          threshold ÷ views at the view mark.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="funnel-impressions">
              Impressions
            </label>
            <input
              id="funnel-impressions"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={impressions}
              onChange={(event) => setImpressions(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="funnel-hook">
              Views at the view mark
            </label>
            <input
              id="funnel-hook"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={hookViews}
              onChange={(event) => setHookViews(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="funnel-held">
              Views at the completion threshold
            </label>
            <input
              id="funnel-held"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={heldViews}
              onChange={(event) => setHeldViews(event.target.value)}
            />
          </div>
        </div>

        {funnelError ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {funnel.error}
          </p>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {(funnelError
            ? [
                ["Hook rate", DASH],
                ["Hold rate", DASH],
                ["View-through rate", DASH],
                ["Lost before the view mark", DASH],
                ["Lost in the body", DASH],
              ]
            : [
                ["Hook rate", formatRate(funnel.hookRate)],
                ["Hold rate", formatRate(funnel.holdRate)],
                ["View-through rate", formatRate(funnel.viewThroughRate)],
                ["Lost before the view mark", NUM.format(funnel.lostAtHook)],
                ["Lost in the body", NUM.format(funnel.lostInBody)],
              ]
          ).map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Thresholds reflect each platform&apos;s published view and ThruPlay definitions and can
        change without notice. The beat placement is a production convention, not a guaranteed
        retention outcome — test against your own reporting.
      </p>
    </main>
  );
}
