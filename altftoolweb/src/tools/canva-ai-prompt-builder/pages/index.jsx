"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Palette, RotateCcw, TriangleAlert } from "lucide-react";

import {
  CANVA_FORMATS,
  STYLE_PRESETS,
  TONE_PRESETS,
  buildCanvaPrompt,
  clean,
} from "../lib";

const DASH = "—";

const INT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

const FIELD =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-medium text-[var(--foreground)]";
const HELP = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  formatId: "instagram-post",
  subject: "Launch of a weekly cold brew coffee subscription",
  audience: "City coffee drinkers aged 25 to 40 who already buy beans online",
  brandName: "Northbrew",
  brandColors: "deep navy, warm cream, copper",
  brandFonts: "Poppins, Inter",
  headline: "Cold brew, every Friday",
  subheadline: "Fresh batch delivered before the weekend. Pause any time.",
  cta: "Start your box",
  styleId: "bold-editorial",
  tone: "Confident and direct",
  mustInclude: "bottle of cold brew, subscription badge",
  avoid: "generic stock handshakes, drop shadows",
  variations: "3",
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);
  const copiedTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current);
    };
  }, []);

  const result = useMemo(
    () => buildCanvaPrompt({ ...form, variations: Number(form.variations) }),
    [form],
  );
  const hasError = Boolean(result.error);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setCopied(false);
  };

  const reset = () => {
    setForm(DEFAULTS);
    setCopied(false);
  };

  const copyResult = async () => {
    if (hasError || !result.prompt) return;
    try {
      await navigator.clipboard.writeText(result.prompt);
      setCopied(true);
      if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current);
      copiedTimeoutRef.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Palette className="h-4 w-4" aria-hidden="true" />
          Design prompting
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Canva AI Prompt Builder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Writes a structured Canva design brief with the real preset canvas size, its reduced
          aspect ratio, your brand slots, and a character budget for each line of copy worked out
          from the smallest size the finished design is actually seen at.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Canvas and brief</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="format">
              Canva format
            </label>
            <select
              id="format"
              className={`${FIELD} mt-1`}
              value={form.formatId}
              onChange={(e) => setField("formatId", e.target.value)}
            >
              {CANVA_FORMATS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="variations">
              How many options to ask for
            </label>
            <input
              id="variations"
              type="number"
              min="1"
              max="10"
              step="1"
              inputMode="numeric"
              className={`${FIELD} mt-1`}
              value={form.variations}
              onChange={(e) => setField("variations", e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="subject">
              What is the design for?
            </label>
            <textarea
              id="subject"
              rows={2}
              className={`${TEXTAREA} mt-1`}
              value={form.subject}
              onChange={(e) => setField("subject", e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="audience">
              Audience
            </label>
            <input
              id="audience"
              type="text"
              className={`${FIELD} mt-1`}
              value={form.audience}
              onChange={(e) => setField("audience", e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Brand</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="brand-name">
              Brand name
            </label>
            <input
              id="brand-name"
              type="text"
              className={`${FIELD} mt-1`}
              value={form.brandName}
              onChange={(e) => setField("brandName", e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="brand-colors">
              Brand colours
            </label>
            <input
              id="brand-colors"
              type="text"
              className={`${FIELD} mt-1`}
              value={form.brandColors}
              onChange={(e) => setField("brandColors", e.target.value)}
            />
            <p className={HELP}>Comma separated. The first becomes the dominant colour.</p>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="brand-fonts">
              Brand fonts
            </label>
            <input
              id="brand-fonts"
              type="text"
              className={`${FIELD} mt-1`}
              value={form.brandFonts}
              onChange={(e) => setField("brandFonts", e.target.value)}
            />
            <p className={HELP}>Display face first, then the text face.</p>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Copy</h2>
        <div className="mt-4 grid gap-4">
          <div>
            <label className={LABEL} htmlFor="headline">
              Headline
            </label>
            <input
              id="headline"
              type="text"
              className={`${FIELD} mt-1`}
              value={form.headline}
              onChange={(e) => setField("headline", e.target.value)}
            />
            <p className={HELP}>
              {hasError
                ? "Budget appears once the brief is valid."
                : `${clean(form.headline).length} of about ${result.budget.headlineMax} characters`}
            </p>
          </div>
          <div>
            <label className={LABEL} htmlFor="subheadline">
              Supporting line
            </label>
            <input
              id="subheadline"
              type="text"
              className={`${FIELD} mt-1`}
              value={form.subheadline}
              onChange={(e) => setField("subheadline", e.target.value)}
            />
            <p className={HELP}>
              {hasError
                ? "Budget appears once the brief is valid."
                : `${clean(form.subheadline).length} of about ${result.budget.subheadMax} characters`}
            </p>
          </div>
          <div>
            <label className={LABEL} htmlFor="cta">
              Call to action
            </label>
            <input
              id="cta"
              type="text"
              className={`${FIELD} mt-1`}
              value={form.cta}
              onChange={(e) => setField("cta", e.target.value)}
            />
            <p className={HELP}>
              {hasError
                ? "Budget appears once the brief is valid."
                : `${clean(form.cta).length} of ${result.budget.ctaMax} characters`}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Style and guardrails</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="style">
              Visual direction
            </label>
            <select
              id="style"
              className={`${FIELD} mt-1`}
              value={form.styleId}
              onChange={(e) => setField("styleId", e.target.value)}
            >
              {STYLE_PRESETS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="tone">
              Tone of voice
            </label>
            <select
              id="tone"
              className={`${FIELD} mt-1`}
              value={form.tone}
              onChange={(e) => setField("tone", e.target.value)}
            >
              {TONE_PRESETS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="must-include">
              Must include
            </label>
            <textarea
              id="must-include"
              rows={2}
              className={`${TEXTAREA} mt-1`}
              value={form.mustInclude}
              onChange={(e) => setField("mustInclude", e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="avoid">
              Do not include
            </label>
            <textarea
              id="avoid"
              rows={2}
              className={`${TEXTAREA} mt-1`}
              value={form.avoid}
              onChange={(e) => setField("avoid", e.target.value)}
            />
          </div>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5" aria-live="polite" role="status">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Canvas
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError
                ? DASH
                : `${INT.format(result.format.width)} × ${INT.format(result.format.height)}`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Describe the design to build a prompt."
                : `${result.aspectRatio} aspect ratio${result.physical ? `, ${result.physical.widthMm} × ${result.physical.heightMm} mm at ${result.format.dpi} DPI` : ""} — prompt is ${INT.format(result.promptWords)} words.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the Canva design prompt"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy prompt"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the builder to its defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
              Seen at (smallest)
            </dt>
            <dd className="text-sm font-semibold">
              {hasError ? DASH : `${INT.format(result.budget.renderWidth)} px wide`}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
              Headline type size
            </dt>
            <dd className="text-sm font-semibold">
              {hasError ? DASH : `${INT.format(result.budget.headlineTypePx)} px on canvas`}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
              Headline budget
            </dt>
            <dd className="text-sm font-semibold">
              {hasError ? DASH : `${result.budget.headlineMax} characters`}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
              Supporting line budget
            </dt>
            <dd className="text-sm font-semibold">
              {hasError ? DASH : `${result.budget.subheadMax} characters`}
            </dd>
          </div>
        </dl>

        {!hasError && result.warnings.length > 0 ? (
          <ul className="mt-4 grid gap-2" aria-live="polite" aria-atomic="true">
            {result.warnings.map((w) => (
              <li
                key={w}
                className="flex items-start gap-2 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--warning-text)]"
              >
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{w}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      {!hasError ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5" aria-live="polite">
          <h2 className="text-base font-semibold">Your Canva prompt</h2>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Paste this into Canva&apos;s Magic Design or Magic Media box, or any AI design assistant.
          </p>
          <div className="mt-3 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
            <pre className="whitespace-pre-wrap break-words text-sm leading-6 text-[var(--foreground)]">
              {result.prompt}
            </pre>
          </div>
        </section>
      ) : null}
    </main>
  );
}
