"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Mail, RotateCcw } from "lucide-react";

import {
  ASPECT_PRESETS,
  FORMATS,
  GMAIL_CLIP_KB,
  MIN_READABLE_PX,
  darkModeChecks,
  planHeader,
} from "../lib";

const DEFAULTS = {
  emailWidth: "600",
  retina: "2",
  aspectId: "3:1",
  mobileViewport: "375",
  mobilePadding: "20",
  maxKB: "200",
  formatId: "jpeg",
  transparentBackground: false,
  darkArtwork: true,
  textInImage: true,
  animated: false,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const NUM = new Intl.NumberFormat("en-US");

const FLAGS = [
  ["transparentBackground", "Header has a transparent background"],
  ["darkArtwork", "Artwork or logo is dark-coloured"],
  ["textInImage", "Headline text is baked into the image"],
  ["animated", "Header is an animated GIF"],
];

export default function ToolHome() {
  const [emailWidth, setEmailWidth] = useState(DEFAULTS.emailWidth);
  const [retina, setRetina] = useState(DEFAULTS.retina);
  const [aspectId, setAspectId] = useState(DEFAULTS.aspectId);
  const [mobileViewport, setMobileViewport] = useState(DEFAULTS.mobileViewport);
  const [mobilePadding, setMobilePadding] = useState(DEFAULTS.mobilePadding);
  const [maxKB, setMaxKB] = useState(DEFAULTS.maxKB);
  const [formatId, setFormatId] = useState(DEFAULTS.formatId);
  const [flags, setFlags] = useState({
    transparentBackground: DEFAULTS.transparentBackground,
    darkArtwork: DEFAULTS.darkArtwork,
    textInImage: DEFAULTS.textInImage,
    animated: DEFAULTS.animated,
  });
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () =>
      planHeader({ emailWidth, retina, aspectId, mobileViewport, mobilePadding, maxKB, formatId }),
    [emailWidth, retina, aspectId, mobileViewport, mobilePadding, maxKB, formatId],
  );

  const checks = useMemo(() => darkModeChecks({ ...flags, formatId }), [flags, formatId]);

  const ok = !plan.error;
  const dash = "—";

  const copyResult = async () => {
    if (!ok) return;
    const lines = [
      "Newsletter header image plan",
      `Export: ${plan.exportWidth} x ${plan.exportHeight} px (${plan.retina}x)`,
      `Displays at: ${plan.cssWidth} x ${plan.cssHeight} px`,
      `On a ${mobileViewport}px phone: ${plan.mobileDisplayWidth} x ${plan.mobileDisplayHeight} px (${plan.mobileScalePercent}%)`,
      `Smallest text in the design: ${plan.minDesignTextPx}px (${plan.minExportTextPx}px in the export)`,
      `Format: ${plan.format.label}`,
      `Estimated weight: ${plan.estimatedKB} KB against a ${plan.budgetKB} KB budget`,
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setEmailWidth(DEFAULTS.emailWidth);
    setRetina(DEFAULTS.retina);
    setAspectId(DEFAULTS.aspectId);
    setMobileViewport(DEFAULTS.mobileViewport);
    setMobilePadding(DEFAULTS.mobilePadding);
    setMaxKB(DEFAULTS.maxKB);
    setFormatId(DEFAULTS.formatId);
    setFlags({
      transparentBackground: DEFAULTS.transparentBackground,
      darkArtwork: DEFAULTS.darkArtwork,
      textInImage: DEFAULTS.textInImage,
      animated: DEFAULTS.animated,
    });
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Mail className="h-4 w-4" aria-hidden="true" />
          Email design
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Newsletter Header Image Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Work out the export size, how far the header shrinks on a phone, the smallest text that
          stays readable after that scaling, and whether the file weight is realistic.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="hdr-width">
              Email body width (px)
            </label>
            <input
              id="hdr-width"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="320"
              max="800"
              step="10"
              value={emailWidth}
              onChange={(event) => setEmailWidth(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hdr-aspect">
              Aspect ratio
            </label>
            <select
              id="hdr-aspect"
              className={`mt-2 ${INPUT_CLASS}`}
              value={aspectId}
              onChange={(event) => setAspectId(event.target.value)}
            >
              {ASPECT_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hdr-retina">
              Export multiplier
            </label>
            <input
              id="hdr-retina"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="4"
              step="1"
              value={retina}
              onChange={(event) => setRetina(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hdr-format">
              Image format
            </label>
            <select
              id="hdr-format"
              className={`mt-2 ${INPUT_CLASS}`}
              value={formatId}
              onChange={(event) => setFormatId(event.target.value)}
            >
              {FORMATS.map((format) => (
                <option key={format.id} value={format.id}>
                  {format.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hdr-viewport">
              Phone viewport width (px)
            </label>
            <input
              id="hdr-viewport"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="240"
              max="1024"
              step="5"
              value={mobileViewport}
              onChange={(event) => setMobileViewport(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hdr-padding">
              Body padding each side (px)
            </label>
            <input
              id="hdr-padding"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="80"
              step="2"
              value={mobilePadding}
              onChange={(event) => setMobilePadding(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hdr-kb">
              Weight budget (KB)
            </label>
            <input
              id="hdr-kb"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="10"
              max="5000"
              step="10"
              value={maxKB}
              onChange={(event) => setMaxKB(event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            What is in the header?
          </legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {FLAGS.map(([key, label]) => (
              <label
                key={key}
                htmlFor={`hdr-${key}`}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              >
                <input
                  id={`hdr-${key}`}
                  type="checkbox"
                  className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                  checked={flags[key]}
                  onChange={() => setFlags((prev) => ({ ...prev, [key]: !prev[key] }))}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      {plan.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Export at
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${NUM.format(plan.exportWidth)} × ${NUM.format(plan.exportHeight)}` : dash}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `pixels, displayed at ${plan.cssWidth} × ${plan.cssHeight}`
                : "Fix the input above to see the plan"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the header image plan"
              className={GHOST_BTN}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the planner" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "On the phone you set",
              ok
                ? `${plan.mobileDisplayWidth} × ${plan.mobileDisplayHeight} px (${plan.mobileScalePercent}% of design size)`
                : dash,
            ],
            [
              `Smallest text that still reads at ${MIN_READABLE_PX}px`,
              ok ? `${plan.minDesignTextPx}px in the design` : dash,
            ],
            ["Same text in the export file", ok ? `${plan.minExportTextPx}px` : dash],
            ["Estimated file weight", ok ? `${plan.estimatedKB} KB` : dash],
            ["Weight budget", ok ? `${plan.budgetKB} KB` : dash],
            ["Total pixels", ok ? NUM.format(plan.pixels) : dash],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok ? (
          <p
            className={`mt-4 rounded-md px-3 py-2 text-sm font-medium ${
              plan.withinBudget
                ? "text-[var(--success)]"
                : "bg-[var(--danger-soft)] text-[var(--danger)]"
            }`}
          >
            {plan.withinBudget
              ? `Estimated ${plan.estimatedKB} KB sits inside the ${plan.budgetKB} KB budget.`
              : `Estimated ${plan.estimatedKB} KB is over the ${plan.budgetKB} KB budget.`}
          </p>
        ) : null}

        {ok && plan.suggestions.length > 0 ? (
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[var(--muted-foreground)]">
            {plan.suggestions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Dark mode and client checks</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {checks.clean
            ? "Nothing flagged for this combination."
            : `${checks.blockers} blocking issue${checks.blockers === 1 ? "" : "s"}, ${checks.warnings} to watch.`}
        </p>
        <ul className="mt-3 space-y-2">
          {checks.checks.map((check) => (
            <li
              key={check.id}
              className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6"
            >
              <span
                className={`mr-2 inline-block rounded px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                  check.ok
                    ? "bg-[var(--muted)] text-[var(--muted-foreground)]"
                    : "bg-[var(--danger-soft)] text-[var(--danger)]"
                }`}
              >
                {check.ok ? "OK" : check.severity === "blocker" ? "Fix" : "Watch"}
              </span>
              {check.text}
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        File-weight figures are estimates from typical bytes-per-pixel at normal export quality; the
        real number depends on the artwork. Separately, Gmail clips a message once the HTML itself
        passes about {GMAIL_CLIP_KB} KB — image bytes do not count toward that.
      </p>
    </main>
  );
}
