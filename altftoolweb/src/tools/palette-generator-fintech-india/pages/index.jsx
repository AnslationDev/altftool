"use client";

import { useMemo, useState } from "react";
import { Check, Copy, IndianRupee, RotateCcw, Sparkles } from "lucide-react";

import {
  BRANDS,
  MAX_VARIATION,
  formatPaletteCss,
  formatPaletteText,
  generateFintechPalette,
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

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** Static sample rows used only to preview the money colours in context. */
const SAMPLE_ROWS = [
  { id: "credit", title: "Salary credited", amount: 128500, sign: "+" },
  { id: "debit", title: "UPI to Ganesh Stores", amount: 1420, sign: "-" },
  { id: "pending", title: "Card authorisation", amount: 5999, sign: "-" },
];

const DEFAULTS = {
  brandId: "trustBlue",
  hueShift: "0",
  variation: 0,
  darkGroundLightness: "8",
};

export default function ToolHome() {
  const [brandId, setBrandId] = useState(DEFAULTS.brandId);
  const [hueShift, setHueShift] = useState(DEFAULTS.hueShift);
  const [variation, setVariation] = useState(DEFAULTS.variation);
  const [darkGroundLightness, setDarkGroundLightness] = useState(DEFAULTS.darkGroundLightness);
  const [copied, setCopied] = useState("");

  const palette = useMemo(
    () =>
      generateFintechPalette({
        brandId,
        hueShift: hueShift === "" ? Number.NaN : Number(hueShift),
        variation,
        darkGroundLightness:
          darkGroundLightness === "" ? Number.NaN : Number(darkGroundLightness),
      }),
    [brandId, hueShift, variation, darkGroundLightness],
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
    setBrandId(DEFAULTS.brandId);
    setHueShift(DEFAULTS.hueShift);
    setVariation(DEFAULTS.variation);
    setDarkGroundLightness(DEFAULTS.darkGroundLightness);
    setCopied("");
  };

  const moneyById = hasError
    ? {}
    : Object.fromEntries(palette.money.map((item) => [item.id, item]));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <IndianRupee className="h-4 w-4" aria-hidden="true" />
          Vibe palettes
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Fintech India Palette Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          One brand hue in, a matched light and dark theme out — tonal ramp, Material 3 elevation
          surfaces, money semantics and a WCAG contrast audit of both modes.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="fin-brand">
              Brand hue
            </label>
            <select
              id="fin-brand"
              className={`mt-2 ${INPUT_CLASS}`}
              value={brandId}
              onChange={(event) => {
                setBrandId(event.target.value);
                setCopied("");
              }}
            >
              {Object.values(BRANDS).map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fin-hue">
              Hue rotation (degrees)
            </label>
            <input
              id="fin-hue"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="-180"
              max="180"
              step="4"
              value={hueShift}
              onChange={(event) => {
                setHueShift(event.target.value);
                setCopied("");
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fin-ground">
              Dark ground lightness (4-16%)
            </label>
            <input
              id="fin-ground"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="4"
              max="16"
              step="1"
              value={darkGroundLightness}
              onChange={(event) => {
                setDarkGroundLightness(event.target.value);
                setCopied("");
              }}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="fin-variation">
              Variation (0-{MAX_VARIATION})
            </label>
            <input
              id="fin-variation"
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
              Contrast checks passing across both themes
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${palette.totalPassing} / ${palette.totalChecks}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs above"
                : `${palette.brandLabel} · hue ${palette.hue}° · variation ${palette.variation}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copy("css", cssText)}
              disabled={hasError}
              aria-label="Copy both themes as CSS custom properties"
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
                Money colours passing both
              </dt>
              <dd className="mt-1 text-sm font-semibold">
                {palette.moneyPassingBoth} / {palette.totalMoney}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
                Credit vs debit gap, light
              </dt>
              <dd className="mt-1 text-sm font-semibold">{palette.creditDebitLightGap} pts</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
                Credit vs debit gap, dark
              </dt>
              <dd className="mt-1 text-sm font-semibold">{palette.creditDebitDarkGap} pts</dd>
            </div>
          </dl>
        )}
        {hasError ? null : (
          <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">{palette.brandNote}</p>
        )}
      </section>

      {hasError ? null : (
        <>
          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">Brand ramp</h2>
            <div className="mt-3 overflow-x-auto">
              <div className="flex min-w-[420px] gap-1">
                {palette.ramp.map((tone) => (
                  <div key={tone.stop} className="flex-1">
                    <div
                      aria-hidden="true"
                      className="h-14 w-full rounded-md border border-[var(--border)]"
                      style={{ backgroundColor: HASH + tone.hex }}
                    />
                    <p className="mt-1 text-center text-xs font-semibold">{tone.stop}</p>
                    <p className="text-center font-mono text-[10px] text-[var(--muted-foreground)]">
                      {tone.hex}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-6 grid gap-4 sm:grid-cols-2">
            {palette.themes.map((theme) => (
              <div
                key={theme.id}
                className="rounded-xl border border-[var(--border)] p-4"
                style={{ backgroundColor: HASH + theme.background.hex }}
              >
                <p
                  className="text-xs font-semibold tracking-wide uppercase"
                  style={{ color: HASH + theme.mutedInk.hex }}
                >
                  {theme.label}
                </p>
                <div
                  className="mt-3 rounded-lg p-3"
                  style={{ backgroundColor: HASH + theme.surface.hex }}
                >
                  <p className="text-xs" style={{ color: HASH + theme.mutedInk.hex }}>
                    Available balance
                  </p>
                  <p
                    className="mt-1 text-2xl font-semibold"
                    style={{ color: HASH + theme.ink.hex }}
                  >
                    {INR.format(248630)}
                  </p>
                  <ul className="mt-3 grid gap-2">
                    {SAMPLE_ROWS.map((row) => (
                      <li key={row.id} className="flex items-center justify-between gap-2 text-sm">
                        <span style={{ color: HASH + theme.mutedInk.hex }}>{row.title}</span>
                        <span
                          className="font-semibold whitespace-nowrap"
                          style={{
                            color:
                              HASH +
                              (theme.id === "light"
                                ? moneyById[row.id].lightHex
                                : moneyById[row.id].darkHex),
                          }}
                        >
                          {row.sign}
                          {INR.format(row.amount)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div
                    className="mt-3 flex min-h-11 items-center justify-center rounded-md text-sm font-semibold"
                    style={{
                      backgroundColor: HASH + theme.primary.hex,
                      color: HASH + theme.onPrimary.hex,
                    }}
                  >
                    Pay now
                  </div>
                </div>
              </div>
            ))}
          </section>

          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">Dark elevation surfaces</h2>
            <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
              Brand tint composited over the dark ground at the Material 3 opacities.
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[360px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Surface
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      Tint
                    </th>
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Hex
                    </th>
                    <th scope="col" className="py-2 font-semibold">
                      Swatch
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {palette.darkElevations.map((level) => (
                    <tr key={level.level} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3">{level.label}</td>
                      <td className="py-2 pr-3 text-right">{level.opacity}%</td>
                      <td className="py-2 pr-3 font-mono text-xs">
                        {HASH}
                        {level.hex}
                      </td>
                      <td className="py-2">
                        <span
                          aria-hidden="true"
                          className="inline-block h-6 w-14 rounded border border-[var(--border)]"
                          style={{ backgroundColor: HASH + level.hex }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">Money semantics</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[420px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Meaning
                    </th>
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Light
                    </th>
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Dark
                    </th>
                    <th scope="col" className="py-2 font-semibold">
                      Both pass
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {palette.money.map((item) => (
                    <tr key={item.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3">{item.label}</td>
                      <td className="py-2 pr-3 font-mono text-xs">
                        {HASH}
                        {item.lightHex} · {item.lightRatio}:1
                      </td>
                      <td className="py-2 pr-3 font-mono text-xs">
                        {HASH}
                        {item.darkHex} · {item.darkRatio}:1
                      </td>
                      <td
                        className={
                          item.passesBoth
                            ? "py-2 font-semibold text-[var(--success)]"
                            : "py-2 font-semibold text-[var(--danger)]"
                        }
                      >
                        {item.passesBoth ? "Yes" : "No"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {palette.audits.map((audit) => (
            <section
              key={audit.themeId}
              className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
            >
              <h2 className="text-base font-semibold">
                {audit.themeLabel} contrast — {audit.passing}/{audit.total}
              </h2>
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
                    {audit.rows.map((row) => (
                      <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                        <td className="py-2 pr-3">{row.label}</td>
                        <td className="py-2 pr-3 text-right font-semibold">{row.ratio}:1</td>
                        <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                          {row.threshold}:1
                        </td>
                        <td
                          className={
                            row.passes
                              ? "py-2 font-semibold text-[var(--success)]"
                              : "py-2 font-semibold text-[var(--danger)]"
                          }
                        >
                          {row.level}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}

          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">CSS variables</h2>
            <pre className="mt-3 overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs leading-5">
              {cssText}
            </pre>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Sample balances and transaction rows are illustrative only. Colour alone should never carry
        the credit or debit meaning — keep the plus and minus signs — and treat this as a design aid
        rather than an accessibility certification or any kind of financial advice.
      </p>
    </main>
  );
}
