"use client";

import { useMemo, useState } from "react";
import { Camera, Check, Copy, RotateCcw } from "lucide-react";

import {
  CAPTURE_TYPES,
  LAWFUL_BASES,
  OPT_OUT_METHODS,
  USE_PURPOSES,
  buildEventPhotographyNotice,
} from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_ROW =
  "flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] transition hover:border-[var(--primary)]";
const CHECKBOX =
  "mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  eventName: "Bengaluru Product Summit 2026",
  organiserName: "Brightloop Events LLP",
  venueName: "Taj MG Road",
  contactEmail: "privacy@brightloop.example",
  eventDate: "2026-09-18",
  captureTypes: ["photos", "video"],
  purposes: ["socialMedia", "website", "marketing"],
  lawfulBasisId: "legitimateInterests",
  optOutId: "lanyard",
  childrenPresent: false,
  retentionYears: "3",
  viewingDistanceM: "3",
  signWidthMm: "600",
  dwellSeconds: "3",
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copiedId, setCopiedId] = useState("");

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const toggleIn = (key, id) =>
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].includes(id) ? prev[key].filter((item) => item !== id) : [...prev[key], id],
    }));

  const result = useMemo(
    () =>
      buildEventPhotographyNotice({
        ...form,
        retentionYears: form.retentionYears === "" ? NaN : Number(form.retentionYears),
        viewingDistanceM: form.viewingDistanceM === "" ? NaN : Number(form.viewingDistanceM),
        signWidthMm: form.signWidthMm === "" ? NaN : Number(form.signWidthMm),
        dwellSeconds: form.dwellSeconds === "" ? NaN : Number(form.dwellSeconds),
      }),
    [form],
  );

  const hasError = Boolean(result.error);

  const copy = async (id, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(""), 1500);
    } catch {
      setCopiedId("");
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setCopiedId("");
  };

  const rows = hasError
    ? [
        ["Readable-at-a-glance capitals", DASH],
        ["Minimum legible capitals", DASH],
        ["Headline point size", DASH],
        ["Characters that fit per line", DASH],
        ["Words read in the dwell time", DASH],
        ["Headline length", DASH],
        ["Lawful basis", DASH],
        ["Retention", DASH],
      ]
    : [
        ["Readable-at-a-glance capitals", `${NUM0.format(result.sign.glanceCapHeightMm)} mm`],
        ["Minimum legible capitals", `${NUM0.format(result.sign.capHeightMm)} mm`],
        ["Headline point size", `${NUM0.format(result.sign.headlinePointSize)} pt`],
        ["Characters that fit per line", `${NUM0.format(result.sign.charsPerLine)}`],
        [
          "Words read in the dwell time",
          `${NUM0.format(result.sign.readableWords)} in ${NUM1.format(result.sign.dwellSeconds)} s`,
        ],
        [
          "Headline length",
          `${result.headlineWords} words / ${result.headline.length} characters`,
        ],
        ["Lawful basis", result.basisLabel],
        [
          "Retention",
          `${result.retentionYears} year${result.retentionYears === 1 ? "" : "s"} after the event`,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Camera className="h-4 w-4" aria-hidden="true" />
          Consent forms
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Event Photography Consent Notice Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Write the filming notice for every surface an attendee meets {DASH} ticket, registration
          form, entrance sign, PA script and web page {DASH} and size the sign so people can actually
          read it on the way in.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Event</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="epc-event">
              Event name
            </label>
            <input
              id="epc-event"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.eventName}
              onChange={(event) => set("eventName", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="epc-organiser">
              Organiser
            </label>
            <input
              id="epc-organiser"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.organiserName}
              onChange={(event) => set("organiserName", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="epc-venue">
              Venue
            </label>
            <input
              id="epc-venue"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.venueName}
              onChange={(event) => set("venueName", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="epc-date">
              Event date
            </label>
            <input
              id="epc-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.eventDate}
              onChange={(event) => set("eventDate", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="epc-contact">
              Contact for objections
            </label>
            <input
              id="epc-contact"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.contactEmail}
              onChange={(event) => set("contactEmail", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="epc-retention">
              Keep footage for (years)
            </label>
            <input
              id="epc-retention"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="50"
              step="1"
              value={form.retentionYears}
              onChange={(event) => set("retentionYears", event.target.value)}
            />
          </div>
        </div>

        <label className={`mt-4 ${CHECK_ROW}`} htmlFor="epc-children">
          <input
            id="epc-children"
            className={CHECKBOX}
            type="checkbox"
            checked={form.childrenPresent}
            onChange={(event) => set("childrenPresent", event.target.checked)}
          />
          <span>Children under 18 will be present</span>
        </label>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">What is being captured</h2>
        <fieldset className="mt-4 grid gap-3 sm:grid-cols-2">
          <legend className="sr-only">Types of recording</legend>
          {CAPTURE_TYPES.map((type) => (
            <label key={type.id} className={CHECK_ROW} htmlFor={`epc-cap-${type.id}`}>
              <input
                id={`epc-cap-${type.id}`}
                className={CHECKBOX}
                type="checkbox"
                checked={form.captureTypes.includes(type.id)}
                onChange={() => toggleIn("captureTypes", type.id)}
              />
              <span>{type.label}</span>
            </label>
          ))}
        </fieldset>

        <h3 className="mt-5 text-sm font-semibold">Where the images will be used</h3>
        <fieldset className="mt-3 grid gap-3 sm:grid-cols-2">
          <legend className="sr-only">Purposes</legend>
          {USE_PURPOSES.map((purpose) => (
            <label key={purpose.id} className={CHECK_ROW} htmlFor={`epc-pur-${purpose.id}`}>
              <input
                id={`epc-pur-${purpose.id}`}
                className={CHECKBOX}
                type="checkbox"
                checked={form.purposes.includes(purpose.id)}
                onChange={() => toggleIn("purposes", purpose.id)}
              />
              <span className="first-letter:uppercase">{purpose.label}</span>
            </label>
          ))}
        </fieldset>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="epc-basis">
              Lawful basis
            </label>
            <select
              id="epc-basis"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.lawfulBasisId}
              onChange={(event) => set("lawfulBasisId", event.target.value)}
            >
              {LAWFUL_BASES.map((basis) => (
                <option key={basis.id} value={basis.id}>
                  {basis.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="epc-optout">
              How attendees opt out
            </label>
            <select
              id="epc-optout"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.optOutId}
              onChange={(event) => set("optOutId", event.target.value)}
            >
              {OPT_OUT_METHODS.map((method) => (
                <option key={method.id} value={method.id}>
                  {method.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        {!hasError && (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">{result.basisNote}</p>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Entrance sign sizing</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="epc-distance">
              Read from (metres)
            </label>
            <input
              id="epc-distance"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.5"
              max="50"
              step="0.5"
              value={form.viewingDistanceM}
              onChange={(event) => set("viewingDistanceM", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="epc-width">
              Board width (mm)
            </label>
            <input
              id="epc-width"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="100"
              max="5000"
              step="10"
              value={form.signWidthMm}
              onChange={(event) => set("signWidthMm", event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="epc-dwell">
              Seconds a passer-by looks at it
            </label>
            <input
              id="epc-dwell"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="120"
              step="1"
              value={form.dwellSeconds}
              onChange={(event) => set("dwellSeconds", event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Headline capital height
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM0.format(result.sign.glanceCapHeightMm)} mm`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the problem below to size the sign"
                : `So it reads at a glance from ${NUM1.format(Number(form.viewingDistanceM))} m`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copy("all", result.fullText)}
              disabled={hasError}
              aria-label="Copy all notice copy"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copiedId === "all" ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copiedId === "all" ? "Copied!" : "Copy all"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all fields" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {hasError && (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {result.error}
          </p>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.warnings.length > 0 && (
          <ul className="mt-4 grid gap-2 text-sm text-[var(--muted-foreground)]">
            {result.warnings.map((warning) => (
              <li
                key={warning}
                className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2"
              >
                {warning}
              </li>
            ))}
          </ul>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 grid gap-4">
          {result.blocks.map((block) => (
            <article
              key={block.id}
              className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-base font-semibold">{block.label}</h2>
                <button
                  type="button"
                  onClick={() => copy(block.id, block.text)}
                  aria-label={`Copy ${block.label}`}
                  className={GHOST_BTN}
                >
                  {copiedId === block.id ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}
                  {copiedId === block.id ? "Copied!" : "Copy"}
                </button>
              </div>
              <div className="mt-3 overflow-x-auto">
                <pre className="min-w-full whitespace-pre-wrap break-words font-sans text-sm leading-6">
                  {block.text}
                </pre>
              </div>
            </article>
          ))}
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational template only, not legal advice. Sign sizing follows the common wayfinding rule
        of about 25 mm of capital height per 3 m of viewing distance and is a starting point, not a
        standards-compliant specification. Check local privacy, filming and venue rules, and take
        professional advice for high-risk events.
      </p>
    </main>
  );
}
