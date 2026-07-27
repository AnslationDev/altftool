"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Flame, RotateCcw } from "lucide-react";

import {
  FESTIVALS,
  TONES,
  formatFestivalCss,
  formatFestivalText,
  generateFestivalPalette,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const HASH = "#";
const DASH = "—";

export default function ToolHome() {
  const [festivalId, setFestivalId] = useState("diwali");
  const [tone, setTone] = useState("classic");
  const [hueShift, setHueShift] = useState("0");
  const [copied, setCopied] = useState("");

  const palette = useMemo(
    () => generateFestivalPalette({ festivalId, tone, hueShift: Number(hueShift) }),
    [festivalId, tone, hueShift],
  );

  const hasError = Boolean(palette.error);
  const cssText = useMemo(() => (hasError ? "" : formatFestivalCss(palette)), [palette, hasError]);
  const plainText = useMemo(
    () => (hasError ? "" : formatFestivalText(palette)),
    [palette, hasError],
  );

  const copy = async (kind, text) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      setCopied("");
    }
  };

  const reset = () => {
    setFestivalId("diwali");
    setTone("classic");
    setHueShift("0");
    setCopied("");
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Flame className="h-4 w-4" aria-hidden="true" />
          Festival creatives
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Indian Festival Colour Palette Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Six-role palettes drawn from the materials each festival actually uses, with a 50-900 tint
          ramp for the hero colour and a WCAG contrast audit of every text pairing.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="fest-name">
              Festival
            </label>
            <select
              id="fest-name"
              className={`mt-2 ${INPUT_CLASS}`}
              value={festivalId}
              onChange={(event) => {
                setFestivalId(event.target.value);
                setCopied("");
              }}
            >
              {Object.values(FESTIVALS).map((festival) => (
                <option key={festival.id} value={festival.id}>
                  {festival.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fest-tone">
              Ground tone
            </label>
            <select
              id="fest-tone"
              className={`mt-2 ${INPUT_CLASS}`}
              value={tone}
              onChange={(event) => {
                setTone(event.target.value);
                setCopied("");
              }}
            >
              {Object.values(TONES).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fest-hue">
              Hue rotation (degrees)
            </label>
            <input
              id="fest-hue"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="-180"
              max="180"
              step="5"
              value={hueShift}
              onChange={(event) => {
                setHueShift(event.target.value);
                setCopied("");
              }}
            />
          </div>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {palette.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Pairings meeting WCAG AA for body text
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${palette.accessiblePairs} / ${palette.totalPairs}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the inputs above" : `${palette.festivalLabel} · ${palette.toneLabel}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copy("css", cssText)}
              disabled={hasError}
              aria-label="Copy the palette as CSS custom properties"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied === "css" ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied === "css" ? "Copied!" : "Copy CSS"}
            </button>
            <button
              type="button"
              onClick={() => copy("text", plainText)}
              disabled={hasError}
              aria-label="Copy the palette and contrast audit as text"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied === "text" ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied === "text" ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the generator" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>
        {!hasError ? (
          <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">{palette.note}</p>
        ) : null}
      </section>

      {!hasError ? (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Palette</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {palette.swatches.map((swatch) => (
                <div key={swatch.role} className="rounded-lg border border-[var(--border)] p-3">
                  <div
                    aria-hidden="true"
                    className="h-16 w-full rounded-md border border-[var(--border)]"
                    style={{ backgroundColor: HASH + swatch.hex }}
                  />
                  <p className="mt-2 text-sm font-semibold">{swatch.name}</p>
                  <p className="text-xs capitalize text-[var(--muted-foreground)]">{swatch.role}</p>
                  <p className="mt-1 font-mono text-xs text-[var(--muted-foreground)]">
                    {HASH}
                    {swatch.hex} · hsl({swatch.hsl.h} {swatch.hsl.s}% {swatch.hsl.l}%)
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Hero colour ramp</h2>
            <div className="mt-4 overflow-x-auto">
              <div className="flex min-w-[420px] overflow-hidden rounded-lg border border-[var(--border)]">
                {palette.ramp.map((stop) => (
                  <div
                    key={stop.step}
                    className="flex h-20 flex-1 items-end justify-center pb-1 text-[10px] font-semibold"
                    style={{ backgroundColor: HASH + stop.hex, color: stop.bestText }}
                  >
                    {stop.step}
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Step</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">Hex</th>
                    <th scope="col" className="py-2 font-semibold">Readable text</th>
                  </tr>
                </thead>
                <tbody>
                  {palette.ramp.map((stop) => (
                    <tr key={stop.step} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{stop.step}</td>
                      <td className="py-2 pr-3 font-mono text-xs">
                        {HASH}
                        {stop.hex}
                      </td>
                      <td className="py-2 text-[var(--muted-foreground)]">
                        {stop.bestText} at {stop.bestTextRatio}:1
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Contrast audit</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[340px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Pairing</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Ratio</th>
                    <th scope="col" className="py-2 font-semibold">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {palette.pairs.map((pair) => (
                    <tr key={pair.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3">{pair.label}</td>
                      <td className="py-2 pr-3 text-right font-semibold">{pair.ratio}:1</td>
                      <td
                        className={
                          pair.passesBody
                            ? "py-2 font-semibold text-[var(--success)]"
                            : "py-2 font-semibold text-[var(--danger)]"
                        }
                      >
                        {pair.grade}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">CSS variables and gradient</h2>
            <pre className="mt-3 overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs leading-5">
              {cssText}
            </pre>
          </section>
        </>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Colour associations differ widely by region, community and family, so treat these as a
        starting point for creative work rather than a rule. When a campaign targets a specific
        community, check the palette with people who celebrate the festival.
      </p>
    </main>
  );
}
