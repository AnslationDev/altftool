"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Disc3, RotateCcw } from "lucide-react";

import {
  CONTRAST_AA_NORMAL,
  RETRO_PAIRINGS,
  buildCss,
  buildSummary,
  computeRetroKit,
  googleFontsHref,
} from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const num = (value) => NUM.format(Number.isFinite(value) ? value : 0);

const DEFAULTS = {
  pairingId: "seventies-groove",
  headingPx: "48",
  bodyPx: "17",
  inkShift: "0",
  accentShift: "0",
  headline: "Long Play",
  body:
    "Side one opens with the horn section already halfway through a bar, which is either a mixing accident or the most confident decision on the record. Nobody involved has ever agreed on which.",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const levelClass = (level) =>
  level === "ok"
    ? "text-[var(--success)]"
    : level === "warn"
      ? "text-[var(--foreground)]"
      : "text-[var(--danger)]";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [loadFonts, setLoadFonts] = useState(false);
  const [copied, setCopied] = useState("");

  const setField = (key) => (event) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const result = useMemo(
    () =>
      computeRetroKit({
        pairingId: form.pairingId,
        headingPx: Number(form.headingPx),
        bodyPx: Number(form.bodyPx),
        inkShift: Number(form.inkShift),
        accentShift: Number(form.accentShift),
      }),
    [form],
  );

  const activePairing = useMemo(
    () => RETRO_PAIRINGS.find((item) => item.id === form.pairingId) ?? RETRO_PAIRINGS[0],
    [form.pairingId],
  );
  const fontsHref = useMemo(() => googleFontsHref(activePairing), [activePairing]);
  const css = useMemo(() => buildCss(result), [result]);
  const summary = useMemo(() => buildSummary(result), [result]);

  useEffect(() => {
    if (!loadFonts || !fontsHref) return undefined;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = fontsHref;
    document.head.appendChild(link);
    return () => {
      link.remove();
    };
  }, [loadFonts, fontsHref]);

  const copy = async (text, key) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      setCopied("");
    }
  };

  const hasError = Boolean(result.error);
  const dash = "—";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide text-[var(--primary)] uppercase">
          <Disc3 className="h-4 w-4" aria-hidden="true" />
          Retro type and colour
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Retro Vibe Font Pairing
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Eight seventies and eighties Google Font pairs, each with a period palette. Every colour
          combination is scored with the WCAG 2.1 contrast formula, so a nostalgic palette does not
          quietly become unreadable.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">1. Pick an era</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {RETRO_PAIRINGS.map((item) => {
            const active = item.id === form.pairingId;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={active}
                onClick={() => setForm((prev) => ({ ...prev, pairingId: item.id }))}
                className={`min-h-11 rounded-md border px-3 py-2 text-left transition active:scale-[0.98] focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none motion-reduce:transform-none ${
                  active
                    ? "border-[var(--primary)] bg-[var(--primary)]/10"
                    : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]"
                }`}
              >
                <span className="block text-sm font-semibold">{item.label}</span>
                <span className="block text-xs text-[var(--muted-foreground)]">
                  {item.heading.family} + {item.body.family} · {item.era}
                </span>
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">{activePairing.note}</p>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">2. Sizes and colour tuning</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="retro-heading">
              Heading size (px)
            </label>
            <input
              id="retro-heading"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="16"
              max="200"
              step="1"
              value={form.headingPx}
              onChange={setField("headingPx")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="retro-body">
              Body size (px)
            </label>
            <input
              id="retro-body"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="10"
              max="40"
              step="1"
              value={form.bodyPx}
              onChange={setField("bodyPx")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="retro-ink">
              Text lightness shift ({form.inkShift})
            </label>
            <input
              id="retro-ink"
              className="mt-4 h-11 w-full accent-[var(--primary)]"
              type="range"
              min="-40"
              max="40"
              step="1"
              value={form.inkShift}
              onChange={setField("inkShift")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="retro-accent">
              Accent lightness shift ({form.accentShift})
            </label>
            <input
              id="retro-accent"
              className="mt-4 h-11 w-full accent-[var(--primary)]"
              type="range"
              min="-40"
              max="40"
              step="1"
              value={form.accentShift}
              onChange={setField("accentShift")}
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide text-[var(--muted-foreground)] uppercase">
              Body text contrast
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? dash : `${num(result.bodyRatio)}:1`}
            </p>
            <p className={`mt-1 text-sm ${hasError ? "" : levelClass(result.bodyVerdict.level)}`}>
              {hasError ? dash : result.bodyVerdict.text}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copy(summary, "summary")}
              aria-label="Copy the retro kit result"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied === "summary" ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied === "summary" ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              onClick={() => setForm(DEFAULTS)}
              aria-label="Reset all inputs"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {(hasError
            ? [["Contrast checks", dash]]
            : result.checks.map((check) => [
                check.label,
                `${num(check.ratio)}:1 — ${check.verdict.label}`,
              ])
          ).map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Palette</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[380px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide text-[var(--muted-foreground)] uppercase">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Swatch
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Role
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Hex
                </th>
                <th scope="col" className="py-2 font-semibold">
                  HSL
                </th>
              </tr>
            </thead>
            <tbody>
              {hasError ? (
                <tr>
                  <td className="py-3 text-[var(--muted-foreground)]" colSpan={4}>
                    {dash}
                  </td>
                </tr>
              ) : (
                result.colours.map((item) => (
                  <tr key={item.role} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">
                      <span
                        className="block h-6 w-10 rounded ring-1 ring-[var(--border)]"
                        style={{ backgroundColor: item.hex }}
                        role="img"
                        aria-label={`${item.label} swatch, ${item.hex}`}
                      />
                    </td>
                    <td className="py-2 pr-3 font-semibold">{item.label}</td>
                    <td className="py-2 pr-3 font-mono">{item.hex}</td>
                    <td className="py-2 text-[var(--muted-foreground)]">{item.hslCss}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Live preview</h2>
          <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm text-[var(--muted-foreground)]">
            <input
              type="checkbox"
              className="h-4 w-4 accent-[var(--primary)]"
              checked={loadFonts}
              onChange={(event) => setLoadFonts(event.target.checked)}
            />
            Load the real fonts
          </label>
        </div>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          The preview uses the palette colours, so it deliberately ignores your light or dark theme.
          Ticking the box fetches the two families from fonts.googleapis.com.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="retro-headline-text">
              Sample headline
            </label>
            <input
              id="retro-headline-text"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.headline}
              onChange={setField("headline")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="retro-body-text">
              Sample body copy
            </label>
            <textarea
              id="retro-body-text"
              rows={3}
              className={`mt-2 ${AREA_CLASS}`}
              value={form.body}
              onChange={setField("body")}
            />
          </div>
        </div>

        {hasError ? (
          <p className="mt-4 text-sm text-[var(--muted-foreground)]">
            {dash} Fix the values above to see the preview.
          </p>
        ) : (
          <div
            className="mt-4 overflow-x-auto rounded-md p-5"
            style={{ backgroundColor: result.background.hex }}
          >
            <p
              style={{
                fontFamily: result.pairing.heading.stack,
                fontWeight: result.pairing.heading.weight,
                fontSize: `${result.headingPx}px`,
                lineHeight: 1.1,
                color: result.accent.hex,
              }}
            >
              {form.headline}
            </p>
            <p
              className="mt-4"
              style={{
                fontFamily: result.pairing.body.stack,
                fontWeight: result.pairing.body.weight,
                fontSize: `${result.bodyPx}px`,
                lineHeight: 1.6,
                color: result.ink.hex,
                maxWidth: "36em",
              }}
            >
              {form.body}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span
                className="inline-flex min-h-11 items-center rounded-md px-4 text-sm font-semibold"
                style={{
                  backgroundColor: result.accent.hex,
                  color: result.background.hex,
                  fontFamily: result.pairing.body.stack,
                }}
              >
                Accent button
              </span>
              <span
                className="inline-flex min-h-11 items-center rounded-md px-4 text-sm font-semibold"
                style={{
                  backgroundColor: result.surface.hex,
                  color: result.ink.hex,
                  fontFamily: result.pairing.body.stack,
                }}
              >
                Surface card
              </span>
            </div>
          </div>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">CSS</h2>
          <button
            type="button"
            onClick={() => copy(css, "css")}
            aria-label="Copy the generated CSS"
            className={GHOST_BTN}
            disabled={hasError}
          >
            {copied === "css" ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copied === "css" ? "Copied!" : "Copy CSS"}
          </button>
        </div>
        <div className="mt-3 overflow-x-auto rounded-md bg-[var(--muted)] p-3">
          <pre className="text-xs leading-5 whitespace-pre text-[var(--foreground)]">
            {hasError ? dash : css}
          </pre>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Contrast ratios use the WCAG 2.1 relative-luminance formula, which scores flat colour pairs
        only — text over a photograph, gradient or grain texture has to be checked against its
        darkest and lightest region separately. A ratio of {CONTRAST_AA_NORMAL}:1 is the AA minimum
        for normal-size text. Check each family&apos;s licence on Google Fonts before shipping.
      </p>
    </main>
  );
}
