"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Sparkles, Stethoscope } from "lucide-react";

import {
  BASES,
  MAX_VARIATION,
  MODES,
  formatPaletteCss,
  formatPaletteText,
  generateMedicalPalette,
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
  baseId: "clinicalBlue",
  mode: "light",
  statusIntensity: "0",
  variation: 0,
};

export default function ToolHome() {
  const [baseId, setBaseId] = useState(DEFAULTS.baseId);
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [statusIntensity, setStatusIntensity] = useState(DEFAULTS.statusIntensity);
  const [variation, setVariation] = useState(DEFAULTS.variation);
  const [copied, setCopied] = useState("");

  const palette = useMemo(
    () =>
      generateMedicalPalette({
        baseId,
        mode,
        statusIntensity: statusIntensity === "" ? Number.NaN : Number(statusIntensity),
        variation,
      }),
    [baseId, mode, statusIntensity, variation],
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
    setBaseId(DEFAULTS.baseId);
    setMode(DEFAULTS.mode);
    setStatusIntensity(DEFAULTS.statusIntensity);
    setVariation(DEFAULTS.variation);
    setCopied("");
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Stethoscope className="h-4 w-4" aria-hidden="true" />
          Vibe palettes
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Medical Clean Palette Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A quiet clinical base plus five status colours, scored for WCAG contrast and checked for
          separation under simulated protanopia and deuteranopia.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="med-base">
              Base hue
            </label>
            <select
              id="med-base"
              className={`mt-2 ${INPUT_CLASS}`}
              value={baseId}
              onChange={(event) => {
                setBaseId(event.target.value);
                setCopied("");
              }}
            >
              {Object.values(BASES).map((base) => (
                <option key={base.id} value={base.id}>
                  {base.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="med-mode">
              Interface mode
            </label>
            <select
              id="med-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={mode}
              onChange={(event) => {
                setMode(event.target.value);
                setCopied("");
              }}
            >
              {Object.values(MODES).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="med-intensity">
              Status intensity (-20 to 20)
            </label>
            <input
              id="med-intensity"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="-20"
              max="20"
              step="2"
              value={statusIntensity}
              onChange={(event) => {
                setStatusIntensity(event.target.value);
                setCopied("");
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="med-variation">
              Base variation (0-{MAX_VARIATION})
            </label>
            <input
              id="med-variation"
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
              Status pairs still separable under red-green CVD
            </p>
            <p aria-live="polite" className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${palette.safeStatusPairs} / ${palette.totalStatusPairs}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs above"
                : `${palette.baseLabel} · ${palette.modeLabel} · variation ${palette.variation}`}
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
              aria-label="Copy the palette and both audits as text"
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
          <dl className="mt-4 grid gap-3 sm:grid-cols-3">
            <div>
              <dt className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
                Interface pairs passing
              </dt>
              <dd className="mt-1 text-sm font-semibold">
                {palette.passingContrastPairs} / {palette.totalContrastPairs}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
                Vivid statuses readable as text
              </dt>
              <dd className="mt-1 text-sm font-semibold">
                {palette.statusesReadableAsText} / {palette.statuses.length}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
                Text tones {mode === "dark" ? "lightened" : "darkened"} for you
              </dt>
              <dd className="mt-1 text-sm font-semibold">{palette.statusTextTonesFixed}</dd>
            </div>
          </dl>
        )}
        {hasError ? null : (
          <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">{palette.baseNote}</p>
        )}
      </section>

      {hasError ? null : (
        <>
          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">Surfaces and text</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {palette.surfaces.map((item) => (
                <div
                  key={item.role}
                  className="flex items-center gap-3 rounded-lg border border-[var(--border)] p-3"
                >
                  <div
                    aria-hidden="true"
                    className="h-11 w-11 shrink-0 rounded-md border border-[var(--border)]"
                    style={{ backgroundColor: HASH + item.hex }}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{item.label}</p>
                    <p className="font-mono text-xs text-[var(--muted-foreground)]">
                      {HASH}
                      {item.hex}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">Clinical statuses</h2>
            <div className="mt-4 grid gap-3">
              {palette.statuses.map((status) => (
                <div key={status.id} className="rounded-lg border border-[var(--border)] p-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold"
                      style={{
                        backgroundColor: HASH + status.softHex,
                        color: HASH + status.textHex,
                      }}
                    >
                      <span
                        aria-hidden="true"
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: HASH + status.hex }}
                      />
                      {status.label}
                    </span>
                    <span className="font-mono text-xs text-[var(--muted-foreground)]">
                      dot {HASH}
                      {status.hex} · text {HASH}
                      {status.textHex} · soft {HASH}
                      {status.softHex}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
                    {status.note} Vivid tone measures {status.onSurfaceRatio}:1 on the card (
                    {status.onSurfaceLevel}); the text tone measures {status.textRatio}:1
                    {status.textMoved > 0 ? ` after moving lightness ${status.textMoved}%` : " unchanged"}.
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">Interface contrast</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[380px] text-left text-sm">
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
                  {palette.contrastPairs.map((pair) => (
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
            <h2 className="text-base font-semibold">Colour-blindness separation</h2>
            <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
              CIE76 colour difference between each pair of status colours, under normal vision and
              under the Viénot 1999 simulation of protanopia and deuteranopia. Target is{" "}
              {palette.minStatusDeltaE}.
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[420px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Pair
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      Normal
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      Worst case
                    </th>
                    <th scope="col" className="py-2 font-semibold">
                      Verdict
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {palette.statusPairs.map((pair) => (
                    <tr key={pair.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3">{pair.label}</td>
                      <td className="py-2 pr-3 text-right">{pair.normalDeltaE}</td>
                      <td className="py-2 pr-3 text-right font-semibold">{pair.worstDeltaE}</td>
                      <td
                        className={
                          pair.safe
                            ? "py-2 font-semibold text-[var(--success)]"
                            : "py-2 font-semibold text-[var(--danger)]"
                        }
                      >
                        {pair.safe ? "Separable" : `Too close (${pair.worstType})`}
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
        This is a design aid, not clinical guidance or a safety certification. Never let colour be the
        only carrier of meaning — pair every status with a text label or an icon — and validate any
        patient-facing interface with your own clinical safety and accessibility review.
      </p>
    </main>
  );
}
