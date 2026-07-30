"use client";

import { useMemo, useState } from "react";
import { Activity, AlertTriangle, Check, Copy, RotateCcw, X } from "lucide-react";
import {
  assessMeasurementPlan,
  DATA_RETENTION_MONTHS,
  DIMENSIONS,
  KINDS,
  MAX_PRODUCT_NAME,
  MAX_RETENTION_DAYS,
  SIGNAL_GROUPS,
  SIGNALS,
} from "../lib";

const DASH = "—";

const DEFAULT_PRODUCT = "Our app";
const DEFAULT_PROCESSOR = "";
const DEFAULT_RETENTION = "180";
const DEFAULT_SIGNALS = [
  "crash-stack",
  "error-counts",
  "app-version",
  "cold-start",
  "page-path",
  "session-duration",
  "visitor-id",
];

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const KIND_TONE = {
  telemetry: "bg-[var(--muted)] text-[var(--muted-foreground)]",
  analytics: "bg-[var(--muted)] text-[var(--foreground)]",
  both: "bg-[var(--warning-soft)] text-[var(--warning)]",
};

export default function ToolHome() {
  const [productName, setProductName] = useState(DEFAULT_PRODUCT);
  const [processor, setProcessor] = useState(DEFAULT_PROCESSOR);
  const [retentionDays, setRetentionDays] = useState(DEFAULT_RETENTION);
  const [selected, setSelected] = useState(DEFAULT_SIGNALS);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [copiedNotice, setCopiedNotice] = useState(false);

  const result = useMemo(
    () =>
      assessMeasurementPlan({
        productName,
        signalIds: selected,
        retentionDays: retentionDays.trim() === "" ? Number.NaN : Number(retentionDays),
        processor,
      }),
    [productName, selected, retentionDays, processor],
  );

  const hasError = Boolean(result.error);

  const toggle = (id) => {
    setSelected((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
    setCopiedSummary(false);
    setCopiedNotice(false);
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      `Measurement plan for ${productName.trim()}`,
      `Honesty score: ${result.honestyPercent}% (${result.checks.filter((check) => check.ok).length} of ${result.checks.length} checks pass).`,
      `${result.telemetryCount} telemetry signals, ${result.analyticsCount} analytics signals, ${result.eitherCount} that depend on how they are keyed.`,
      `${result.identifyingCount} identify a person, ${result.storingCount} write to the device, ${result.leakyCount} are a common route for accidental PII.`,
      `Consent required: ${result.consentRequired ? "yes" : "no"}.`,
      `Retention: ${result.retentionDays} days (about ${result.retentionMonths} months).`,
      "",
      "Checks:",
    ];
    result.checks.forEach((check) => {
      lines.push(`${check.ok ? "PASS" : "FAIL"} — ${check.label}: ${check.detail}`);
    });
    return lines.join("\n");
  }, [hasError, result, productName]);

  const copySummary = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 1500);
    } catch {
      setCopiedSummary(false);
    }
  };

  const copyNotice = async () => {
    if (hasError || !result.notice) return;
    try {
      await navigator.clipboard.writeText(result.notice);
      setCopiedNotice(true);
      setTimeout(() => setCopiedNotice(false), 1500);
    } catch {
      setCopiedNotice(false);
    }
  };

  const reset = () => {
    setProductName(DEFAULT_PRODUCT);
    setProcessor(DEFAULT_PROCESSOR);
    setRetentionDays(DEFAULT_RETENTION);
    setSelected(DEFAULT_SIGNALS);
    setCopiedSummary(false);
    setCopiedNotice(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Activity className="h-4 w-4" aria-hidden="true" />
          Tracking literacy
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Telemetry vs Analytics Explainer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Telemetry measures the build; analytics measures the person. Tick what your product
          collects, set how long you keep it, and get a consent check and an honest notice you can
          paste straight into a privacy page.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">What does it collect?</h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="tva-product">
              Product or site name
            </label>
            <input
              id="tva-product"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              maxLength={MAX_PRODUCT_NAME}
              value={productName}
              onChange={(event) => {
                setProductName(event.target.value);
                setCopiedSummary(false);
                setCopiedNotice(false);
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tva-processor">
              Analytics processor (optional)
            </label>
            <input
              id="tva-processor"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              placeholder="Leave blank if self-hosted"
              value={processor}
              onChange={(event) => {
                setProcessor(event.target.value);
                setCopiedSummary(false);
                setCopiedNotice(false);
              }}
            />
          </div>
        </div>

        <div className="mt-6 space-y-6">
          {SIGNAL_GROUPS.map((group) => (
            <fieldset key={group.id} className="border-0 p-0">
              <legend className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
                {group.label}
              </legend>
              <div className="mt-2 space-y-2">
                {SIGNALS.filter((signal) => signal.group === group.id).map((signal) => (
                  <label
                    key={signal.id}
                    htmlFor={`tva-${signal.id}`}
                    className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3 transition hover:border-[var(--primary)]"
                  >
                    <input
                      id={`tva-${signal.id}`}
                      type="checkbox"
                      checked={selected.includes(signal.id)}
                      onChange={() => toggle(signal.id)}
                      className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                    />
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold">{signal.label}</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase ${KIND_TONE[signal.kind]}`}
                        >
                          {KINDS[signal.kind].label}
                        </span>
                      </span>
                      <span className="mt-0.5 block text-xs leading-5 text-[var(--muted-foreground)]">
                        {signal.note}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="tva-retention">
              Retention (days, 1–{MAX_RETENTION_DAYS})
            </label>
            <input
              id="tva-retention"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max={MAX_RETENTION_DAYS}
              step="1"
              value={retentionDays}
              onChange={(event) => {
                setRetentionDays(event.target.value);
                setCopiedSummary(false);
                setCopiedNotice(false);
              }}
            />
          </div>
          <div className="flex flex-wrap items-end gap-2">
            {[30, 90, 180, 365].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  setRetentionDays(String(preset));
                  setCopiedSummary(false);
                  setCopiedNotice(false);
                }}
                className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                {preset}d
              </button>
            ))}
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Honesty score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.honestyPercent}%`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? DASH
                : `${result.checks.filter((check) => check.ok).length} of ${result.checks.length} checks pass`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copySummary}
              aria-label="Copy the measurement plan summary"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copiedSummary ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copiedSummary ? "Copied!" : "Copy summary"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the explainer to its defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Telemetry signals", hasError ? DASH : String(result.telemetryCount)],
            ["Analytics signals", hasError ? DASH : String(result.analyticsCount)],
            ["Depends how it's keyed", hasError ? DASH : String(result.eitherCount)],
            ["Identify a person", hasError ? DASH : String(result.identifyingCount)],
            ["Write to the device", hasError ? DASH : String(result.storingCount)],
            ["Common PII leak route", hasError ? DASH : String(result.leakyCount)],
            [
              "Retention",
              hasError ? DASH : `${result.retentionDays} days (about ${result.retentionMonths} months)`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="shrink-0 text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.consentRequired && (
          <div
            role="status"
            className="mt-4 flex items-start gap-2 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm font-medium text-[var(--warning)]"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              Consent is required.{" "}
              {result.consentReasons.join(" ")}
            </span>
          </div>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Checks</h2>
          <ul className="mt-3 space-y-2">
            {result.checks.map((check) => (
              <li
                key={check.id}
                className="flex items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
              >
                {check.ok ? (
                  <Check
                    className="mt-0.5 h-4 w-4 shrink-0 text-[var(--success)]"
                    aria-hidden="true"
                  />
                ) : (
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-[var(--danger)]" aria-hidden="true" />
                )}
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{check.label}</span>
                  <span className="mt-0.5 block text-xs leading-5 text-[var(--muted-foreground)]">
                    {check.detail}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Telemetry vs analytics, side by side</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3">
                  Dimension
                </th>
                <th scope="col" className="py-2 pr-3">
                  Telemetry
                </th>
                <th scope="col" className="py-2">
                  Analytics
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {DIMENSIONS.map((dimension) => (
                <tr key={dimension.id} className="align-top">
                  <th scope="row" className="py-2.5 pr-3 text-left font-semibold">
                    {dimension.label}
                  </th>
                  <td className="py-2.5 pr-3 leading-6 text-[var(--muted-foreground)]">
                    {dimension.telemetry}
                  </td>
                  <td className="py-2.5 leading-6 text-[var(--muted-foreground)]">
                    {dimension.analytics}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Generated notice</h2>
            <button
              type="button"
              onClick={copyNotice}
              aria-label="Copy the generated measurement notice"
              className={GHOST_BTN}
            >
              {copiedNotice ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copiedNotice ? "Copied!" : "Copy notice"}
            </button>
          </div>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            A starting draft, not a finished privacy page — edit it to match how the product
            actually behaves before you publish it.
          </p>
          <pre className="mt-3 max-h-96 overflow-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-xs leading-6 whitespace-pre-wrap text-[var(--foreground)]">
            {result.notice}
          </pre>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Educational only, not legal advice. Retention checkpoints reference CNIL&apos;s published
        audience-measurement exemption ({DATA_RETENTION_MONTHS} months for derived data); other
        national authorities set different limits, and this exemption does not apply once
        identifiers leave for a third-party network.
      </p>
    </main>
  );
}
