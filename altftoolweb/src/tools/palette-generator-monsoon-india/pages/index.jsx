"use client";

import { useMemo, useState } from "react";
import { Check, CloudRain, Copy, RotateCcw, Sparkles } from "lucide-react";

import {
  MAX_VARIATION,
  MOODS,
  SCRIMS,
  formatPaletteCss,
  formatPaletteText,
  generateMonsoonPalette,
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

const DEFAULTS = {
  moodId: "deepMonsoon",
  hueShift: "0",
  variation: 0,
  scrimId: "black",
  textRole: "white",
};

function solvedText(solved) {
  if (!solved.achievable) return `not reachable (best ${solved.ratio}:1)`;
  return `${solved.opacity}% → ${solved.ratio}:1`;
}

export default function ToolHome() {
  const [moodId, setMoodId] = useState(DEFAULTS.moodId);
  const [hueShift, setHueShift] = useState(DEFAULTS.hueShift);
  const [variation, setVariation] = useState(DEFAULTS.variation);
  const [scrimId, setScrimId] = useState(DEFAULTS.scrimId);
  const [textRole, setTextRole] = useState(DEFAULTS.textRole);
  const [copied, setCopied] = useState("");

  const palette = useMemo(
    () =>
      generateMonsoonPalette({
        moodId,
        hueShift: hueShift === "" ? Number.NaN : Number(hueShift),
        variation,
        scrimId,
        textRole,
      }),
    [moodId, hueShift, variation, scrimId, textRole],
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
    setMoodId(DEFAULTS.moodId);
    setHueShift(DEFAULTS.hueShift);
    setVariation(DEFAULTS.variation);
    setScrimId(DEFAULTS.scrimId);
    setTextRole(DEFAULTS.textRole);
    setCopied("");
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <CloudRain className="h-4 w-4" aria-hidden="true" />
          Vibe palettes
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Monsoon India Palette Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Slate, teal and wet-green campaign palettes, plus the exact scrim opacity your headline
          needs over a bright, mid or dark photo.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="mon-mood">
              Mood
            </label>
            <select
              id="mon-mood"
              className={`mt-2 ${INPUT_CLASS}`}
              value={moodId}
              onChange={(event) => {
                setMoodId(event.target.value);
                setCopied("");
              }}
            >
              {Object.values(MOODS).map((mood) => (
                <option key={mood.id} value={mood.id}>
                  {mood.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mon-text">
              Overlay text colour
            </label>
            <select
              id="mon-text"
              className={`mt-2 ${INPUT_CLASS}`}
              value={textRole}
              onChange={(event) => {
                setTextRole(event.target.value);
                setCopied("");
              }}
            >
              <option value="white">Plain white</option>
              <option value="paper">Palette paper colour</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mon-scrim">
              Scrim colour
            </label>
            <select
              id="mon-scrim"
              className={`mt-2 ${INPUT_CLASS}`}
              value={scrimId}
              onChange={(event) => {
                setScrimId(event.target.value);
                setCopied("");
              }}
            >
              {Object.values(SCRIMS).map((scrim) => (
                <option key={scrim.id} value={scrim.id}>
                  {scrim.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mon-hue">
              Hue rotation (degrees)
            </label>
            <input
              id="mon-hue"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="-60"
              max="60"
              step="2"
              value={hueShift}
              onChange={(event) => {
                setHueShift(event.target.value);
                setCopied("");
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mon-variation">
              Variation (0-{MAX_VARIATION})
            </label>
            <input
              id="mon-variation"
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
            Next variation
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
              Scrim needed over a mid-tone photo for body text
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError
                ? DASH
                : palette.scrimRows[1].aa.achievable
                  ? `${palette.scrimRows[1].aa.opacity}%`
                  : "Not reachable"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs above"
                : `${palette.moodLabel} · ${palette.textRole === "white" ? "white" : "paper"} text on a ${palette.scrimLabel.toLowerCase()}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copy("css", cssText)}
              disabled={hasError}
              aria-label="Copy the palette and scrim rule as CSS"
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
              aria-label="Copy the palette, contrast audit and scrim table as text"
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
                Palette pairings passing
              </dt>
              <dd className="mt-1 text-sm font-semibold">
                {palette.passingPairs} / {palette.totalPairs}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
                Photo tones reachable at 4.5:1
              </dt>
              <dd className="mt-1 text-sm font-semibold">
                {palette.solvedAtAa} / {palette.totalScrimRows}
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
            <h2 className="text-base font-semibold">Scrim solver</h2>
            <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
              Minimum opacity of a {palette.scrimLabel.toLowerCase()} ({HASH}
              {palette.scrimHex}) before {palette.textRole === "white" ? "white" : "paper"} text (
              {HASH}
              {palette.textHex}) reaches each threshold. The photo tone is a neutral stand-in for the
              average brightness of the area under the words.
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[460px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Photo tone
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      No scrim
                    </th>
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Large 3:1
                    </th>
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Body 4.5:1
                    </th>
                    <th scope="col" className="py-2 font-semibold">
                      AAA 7:1
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {palette.scrimRows.map((row) => (
                    <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3">{row.label}</td>
                      <td className="py-2 pr-3 text-right">{row.bareRatio}:1</td>
                      <td className="py-2 pr-3">{solvedText(row.large)}</td>
                      <td
                        className={
                          row.aa.achievable
                            ? "py-2 pr-3 font-semibold text-[var(--success)]"
                            : "py-2 pr-3 font-semibold text-[var(--danger)]"
                        }
                      >
                        {solvedText(row.aa)}
                      </td>
                      <td className="py-2">{solvedText(row.aaa)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {palette.scrimRows.map((row) => (
                <div
                  key={row.id}
                  className="flex min-h-[84px] items-center justify-center rounded-lg border border-[var(--border)] p-3 text-center text-sm font-semibold"
                  style={{
                    backgroundColor: HASH + (row.aa.achievable ? row.aa.compositedHex : row.photoHex),
                    color: HASH + palette.textHex,
                  }}
                >
                  {row.label}
                </div>
              ))}
            </div>
          </section>

          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">Swatches</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {palette.swatches.map((swatch) => (
                <div key={swatch.role} className="rounded-lg border border-[var(--border)] p-3">
                  <div
                    className="flex h-16 w-full items-center justify-center rounded-md border border-[var(--border)] text-sm font-semibold"
                    style={{
                      backgroundColor: HASH + swatch.hex,
                      color: HASH + swatch.bestLabel.hex,
                    }}
                  >
                    {swatch.label}
                  </div>
                  <p className="mt-2 font-mono text-xs text-[var(--muted-foreground)]">
                    {HASH}
                    {swatch.hex} · hsl({swatch.hsl.h} {swatch.hsl.s}% {swatch.hsl.l}%)
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    Best label: {swatch.bestLabel.name} at {swatch.bestLabel.ratio}:1
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">Contrast audit</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[400px] text-left text-sm">
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
                      Grade
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
                            : "py-2 font-semibold text-[var(--danger)]"
                        }
                      >
                        {pair.level}
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
        The photo tone here is a flat neutral standing in for the average brightness under your text.
        A real photograph varies, so check the brightest patch the headline crosses — and remember a
        gradient scrim only meets the ratio where it is at its densest.
      </p>
    </main>
  );
}
