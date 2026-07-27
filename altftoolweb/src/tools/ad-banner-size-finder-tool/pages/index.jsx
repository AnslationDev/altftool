"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Monitor, RotateCcw, Search } from "lucide-react";

import {
  filterAdSizes,
  findClosestSizes,
  ORIENTATIONS,
  PLATFORMS,
  RETINA_SCALE,
  scaleToFit,
} from "../lib";

const DEFAULTS = {
  query: "",
  platform: "all",
  orientation: "all",
  customWidth: "1200",
  customHeight: "628",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const DASH = "—";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const INT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const toNumber = (raw) => {
  const cleaned = String(raw).replace(/,/g, "").trim();
  if (cleaned === "") return NaN;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [query, setQuery] = useState(DEFAULTS.query);
  const [platform, setPlatform] = useState(DEFAULTS.platform);
  const [orientation, setOrientation] = useState(DEFAULTS.orientation);
  const [customWidth, setCustomWidth] = useState(DEFAULTS.customWidth);
  const [customHeight, setCustomHeight] = useState(DEFAULTS.customHeight);
  const [copied, setCopied] = useState(false);

  const matches = useMemo(
    () => filterAdSizes({ query, platform, orientation }),
    [query, platform, orientation],
  );

  const closest = useMemo(
    () => findClosestSizes(toNumber(customWidth), toNumber(customHeight), 5),
    [customWidth, customHeight],
  );

  const closestError = Array.isArray(closest) ? null : closest.error;
  const bestMatch = Array.isArray(closest) ? closest[0] : null;

  const fit = useMemo(() => {
    if (!bestMatch) return null;
    return scaleToFit(
      toNumber(customWidth),
      toNumber(customHeight),
      bestMatch.width,
      bestMatch.height,
    );
  }, [bestMatch, customWidth, customHeight]);

  const summary = useMemo(() => {
    if (!bestMatch) return "";
    return [
      "Ad Banner Size Finder",
      `Custom size: ${customWidth} x ${customHeight} px`,
      `Closest standard: ${bestMatch.name} — ${bestMatch.width} x ${bestMatch.height} px (${bestMatch.aspectLabel})`,
      `Platform: ${bestMatch.platform}`,
      `Export at ${RETINA_SCALE}x: ${bestMatch.retinaWidth} x ${bestMatch.retinaHeight} px`,
      bestMatch.maxFileKb ? `File size cap: ${bestMatch.maxFileKb} KB` : "",
      `Matching sizes in view: ${matches.length}`,
    ]
      .filter(Boolean)
      .join("\n");
  }, [bestMatch, customWidth, customHeight, matches.length]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setQuery(DEFAULTS.query);
    setPlatform(DEFAULTS.platform);
    setOrientation(DEFAULTS.orientation);
    setCustomWidth(DEFAULTS.customWidth);
    setCustomHeight(DEFAULTS.customHeight);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Monitor className="h-4 w-4" aria-hidden="true" />
          Ad size reference
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Ad Banner Size Finder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Every standard banner dimension for Google Display, Meta, LinkedIn, X, Pinterest, TikTok
          and YouTube — with the exact aspect ratio, file-size cap and the nearest standard slot for
          any custom size you already have.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Match a custom size</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="custom-width">
              Your creative width (px)
            </label>
            <input
              id="custom-width"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={customWidth}
              onChange={(event) => setCustomWidth(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="custom-height">
              Your creative height (px)
            </label>
            <input
              id="custom-height"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={customHeight}
              onChange={(event) => setCustomHeight(event.target.value)}
            />
          </div>
        </div>
      </section>

      {closestError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {closestError}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Closest standard slot
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {bestMatch ? `${bestMatch.width} × ${bestMatch.height}` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {bestMatch
                ? `${bestMatch.name} · ${bestMatch.platform}`
                : "Enter a valid width and height to see a match."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the matched ad size details to clipboard"
              className={GHOST_BTN}
              disabled={!bestMatch}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all filters" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Aspect ratio", bestMatch ? bestMatch.aspectLabel : DASH],
            [
              "Ratio as a decimal",
              bestMatch && bestMatch.aspectDecimal ? NUM.format(bestMatch.aspectDecimal) : DASH,
            ],
            ["Orientation", bestMatch ? bestMatch.orientation : DASH],
            [
              `Export at ${RETINA_SCALE}× for retina`,
              bestMatch ? `${bestMatch.retinaWidth} × ${bestMatch.retinaHeight} px` : DASH,
            ],
            ["Total pixels", bestMatch ? INT.format(bestMatch.pixels) : DASH],
            [
              "File size cap",
              bestMatch && bestMatch.maxFileKb ? `${INT.format(bestMatch.maxFileKb)} KB` : DASH,
            ],
            [
              "Byte budget per pixel",
              bestMatch && bestMatch.bytesPerPixelBudget
                ? `${NUM.format(bestMatch.bytesPerPixelBudget)} bytes`
                : DASH,
            ],
            [
              "Your artwork scaled to fit",
              fit && !fit.error ? `${fit.width} × ${fit.height} px` : DASH,
            ],
            [
              "Empty space after fitting",
              fit && !fit.error ? `${fit.letterboxX} px wide, ${fit.letterboxY} px tall` : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {bestMatch && (
          <p className="mt-4 text-sm text-[var(--muted-foreground)]">{bestMatch.note}</p>
        )}
      </section>

      {Array.isArray(closest) && closest.length > 1 && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Other close slots</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Size</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Name</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Ratio</th>
                  <th scope="col" className="py-2 text-right font-semibold">Ratio gap</th>
                </tr>
              </thead>
              <tbody>
                {closest.slice(1).map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold whitespace-nowrap">
                      {row.width} × {row.height}
                    </td>
                    <td className="py-2 pr-3">{row.name}</td>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">{row.aspectLabel}</td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">
                      {NUM.format(row.ratioDeltaPercent)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Browse the full catalogue</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="size-query">
              Search by name, platform or pixels
            </label>
            <div className="relative mt-2">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]"
                aria-hidden="true"
              />
              <input
                id="size-query"
                className={`${INPUT_CLASS} pl-9`}
                type="search"
                placeholder="leaderboard, 300x250, stories…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="platform-filter">
              Platform
            </label>
            <select
              id="platform-filter"
              className={`mt-2 ${INPUT_CLASS}`}
              value={platform}
              onChange={(event) => setPlatform(event.target.value)}
            >
              <option value="all">All platforms</option>
              {PLATFORMS.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="orientation-filter">
              Orientation
            </label>
            <select
              id="orientation-filter"
              className={`mt-2 ${INPUT_CLASS}`}
              value={orientation}
              onChange={(event) => setOrientation(event.target.value)}
            >
              {ORIENTATIONS.map((name) => (
                <option key={name} value={name}>
                  {name === "all" ? "Any orientation" : name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="mt-4 text-sm text-[var(--muted-foreground)]">
          {matches.length} size{matches.length === 1 ? "" : "s"} match.
        </p>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Size</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Name</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Platform</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Ratio</th>
                <th scope="col" className="py-2 text-right font-semibold">Max file</th>
              </tr>
            </thead>
            <tbody>
              {matches.map((row) => (
                <tr key={`${row.id}`} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold whitespace-nowrap">
                    {row.width} × {row.height}
                  </td>
                  <td className="py-2 pr-3">{row.name}</td>
                  <td className="py-2 pr-3 text-[var(--muted-foreground)]">{row.platform}</td>
                  <td className="py-2 pr-3 text-[var(--muted-foreground)]">{row.aspectLabel}</td>
                  <td className="py-2 text-right text-[var(--muted-foreground)]">
                    {row.maxFileKb ? `${INT.format(row.maxFileKb)} KB` : DASH}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Networks revise their creative specs from time to time. Treat these as the published
        standard sizes and confirm the caps inside the ad platform before a large production run.
      </p>
    </main>
  );
}
