"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Landmark, RotateCcw, Sparkles } from "lucide-react";

import {
  MAX_VARIATION,
  TRADITIONS,
  formatPaletteCss,
  formatPaletteText,
  generateHeritagePalette,
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

const DEFAULTS = { traditionId: "ajrakh", variation: 0 };

export default function ToolHome() {
  const [traditionId, setTraditionId] = useState(DEFAULTS.traditionId);
  const [variation, setVariation] = useState(DEFAULTS.variation);
  const [copied, setCopied] = useState("");

  const palette = useMemo(
    () => generateHeritagePalette({ traditionId, variation }),
    [traditionId, variation],
  );

  const hasError = Boolean(palette.error);
  const cssText = useMemo(() => (hasError ? "" : formatPaletteCss(palette)), [palette, hasError]);
  const plainText = useMemo(() => (hasError ? "" : formatPaletteText(palette)), [palette, hasError]);

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
    setTraditionId(DEFAULTS.traditionId);
    setVariation(DEFAULTS.variation);
    setCopied("");
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Landmark className="h-4 w-4" aria-hidden="true" />
          Vibe palettes
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Heritage India Palette Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Six-role palettes built from historical dyes and pigments, each labelled with its material
          source and checked for both screen contrast and single-ink print separation.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="her-tradition">
              Tradition
            </label>
            <select
              id="her-tradition"
              className={`mt-2 ${INPUT_CLASS}`}
              value={traditionId}
              onChange={(event) => {
                setTraditionId(event.target.value);
                setCopied("");
              }}
            >
              {Object.values(TRADITIONS).map((tradition) => (
                <option key={tradition.id} value={tradition.id}>
                  {tradition.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="her-variation">
              Variation (0-{MAX_VARIATION})
            </label>
            <input
              id="her-variation"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max={MAX_VARIATION}
              step="1"
              value={variation}
              onChange={(event) => {
                setVariation(Number(event.target.value));
                setCopied("");
              }}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className={PRIMARY_BTN}
            onClick={() => {
              setVariation((current) => (current + 1) % (MAX_VARIATION + 1));
              setCopied("");
            }}
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Next combination
          </button>
          <button type="button" onClick={reset} aria-label="Reset the generator" className={GHOST_BTN}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Motif pairs that survive a single-ink print
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${palette.separableGreyPairs} / ${palette.totalGreyPairs}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs above"
                : `${palette.traditionLabel} · variation ${palette.variation}`}
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
              aria-label="Copy the palette, provenance and both audits as text"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied === "text" ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied === "text" ? "Copied!" : "Copy result"}
            </button>
          </div>
        </div>
        {hasError ? null : (
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
                Text pairings passing 4.5:1
              </dt>
              <dd className="mt-1 text-sm font-semibold">
                {palette.passingTextPairs} / {palette.totalTextPairs}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
                Screen-adapted tones reaching 4.5:1
              </dt>
              <dd className="mt-1 text-sm font-semibold">
                {palette.webAdaptationsAchieved} / {palette.webAdaptations.length}
              </dd>
            </div>
          </dl>
        )}
        {hasError ? null : (
          <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">{palette.note}</p>
        )}
      </section>

      {hasError ? null : (
        <>
          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">Palette and provenance</h2>
            <div className="mt-4 grid gap-3">
              {palette.swatches.map((swatch) => (
                <div key={swatch.role} className="rounded-lg border border-[var(--border)] p-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <div
                      className="flex h-12 w-24 shrink-0 items-center justify-center rounded-md border border-[var(--border)] text-xs font-semibold"
                      style={{
                        backgroundColor: HASH + swatch.hex,
                        color: HASH + swatch.bestLabel.hex,
                      }}
                    >
                      {swatch.roleLabel}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{swatch.name}</p>
                      <p className="font-mono text-xs text-[var(--muted-foreground)]">
                        {HASH}
                        {swatch.hex} · luminance {swatch.luminance}%
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
                    {swatch.source}. {swatch.note}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">Contrast audit</h2>
            <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
              Text rows are held to the 4.5:1 body-text threshold. Motif rows are decorative
              adjacency, where the 3:1 non-text figure is advisory rather than binding.
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[420px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Pairing
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      Ratio
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      Needs
                    </th>
                    <th scope="col" className="py-2 font-semibold">
                      Verdict
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {palette.pairs.map((pair) => (
                    <tr key={pair.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3">{pair.label}</td>
                      <td className="py-2 pr-3 text-right font-semibold">{pair.ratio}:1</td>
                      <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                        {pair.threshold}:1
                      </td>
                      <td
                        className={
                          pair.passes
                            ? "py-2 font-semibold text-[var(--success)]"
                            : pair.kind === "text"
                              ? "py-2 font-semibold text-[var(--danger)]"
                              : "py-2 font-semibold text-[var(--warning)]"
                        }
                      >
                        {pair.passes ? pair.level : pair.kind === "text" ? "Too low for text" : "Low separation"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">Screen-adapted tones</h2>
            <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
              The same hue and saturation, lightness walked until the colour reaches 4.5:1 against
              the ground. Use these when the pigment itself has to carry words.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {palette.webAdaptations.map((item) => (
                <div key={item.role} className="rounded-lg border border-[var(--border)] p-3">
                  <p className="text-sm font-semibold">
                    {item.roleLabel} · {item.name}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="inline-block h-8 w-12 rounded border border-[var(--border)]"
                      style={{ backgroundColor: HASH + item.originalHex }}
                    />
                    <span className="text-[var(--muted-foreground)]" aria-hidden="true">
                      →
                    </span>
                    <span
                      aria-hidden="true"
                      className="inline-block h-8 w-12 rounded border border-[var(--border)]"
                      style={{ backgroundColor: HASH + item.hex }}
                    />
                  </div>
                  <p className="mt-2 font-mono text-xs text-[var(--muted-foreground)]">
                    {HASH}
                    {item.originalHex} ({item.originalRatio}:1) → {HASH}
                    {item.hex} ({item.ratio}:1)
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {item.moved > 0 ? `Lightness moved ${item.moved}%` : "Already usable, unchanged"}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">Single-ink print check</h2>
            <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
              Luminance gap between the motif colours. Under {palette.minGreyscaleGap} points they
              merge into one shape once the artwork is reduced to a single ink.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {palette.luminanceOrder.map((item) => (
                <div key={item.role} className="text-center">
                  <div
                    aria-hidden="true"
                    className="h-10 w-16 rounded border border-[var(--border)]"
                    style={{ backgroundColor: HASH + item.greyHex }}
                  />
                  <p className="mt-1 text-[10px] text-[var(--muted-foreground)]">{item.luminance}%</p>
                </div>
              ))}
            </div>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[340px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Pair
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      Gap
                    </th>
                    <th scope="col" className="py-2 font-semibold">
                      Verdict
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {palette.greyPairs.map((pair) => (
                    <tr key={pair.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3">{pair.label}</td>
                      <td className="py-2 pr-3 text-right font-semibold">{pair.gap} pts</td>
                      <td
                        className={
                          pair.separable
                            ? "py-2 font-semibold text-[var(--success)]"
                            : "py-2 font-semibold text-[var(--warning)]"
                        }
                      >
                        {pair.separable ? "Separable" : "Merges"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">CSS variables</h2>
            <pre className="mt-3 overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs leading-5">
              {cssText}
            </pre>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        These are screen interpretations of traditional dyes and pigments chosen as design
        references, not measured colour standards. Natural dyes shift with the mordant, the cloth and
        the water, so match against a physical swatch before production, and credit the craft
        community whose tradition you are drawing on.
      </p>
    </main>
  );
}
