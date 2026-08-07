"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Shuffle, Zap } from "lucide-react";

import { AAA_NORMAL, AA_NORMAL, AA_UI, NEON_PAIRS, TEXT_TARGETS, generateCyberpunkPalette } from "../lib";

const DEFAULTS = { seed: "neon-alley", pairId: NEON_PAIRS[0].id, grit: "60", textTarget: "aa" };

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const EXPORTS = [
  { id: "css", label: "CSS variables" },
  { id: "tailwind", label: "Tailwind @theme" },
  { id: "json", label: "JSON" },
];

const SEED_WORDS = [
  "neon-alley",
  "night-city",
  "rain-slick",
  "chrome-spine",
  "black-ice",
  "sprawl",
  "signal-noise",
  "kill-switch",
  "hologram",
  "back-alley-clinic",
];

export default function ToolHome() {
  const [seed, setSeed] = useState(DEFAULTS.seed);
  const [pairId, setPairId] = useState(DEFAULTS.pairId);
  const [grit, setGrit] = useState(DEFAULTS.grit);
  const [textTarget, setTextTarget] = useState(DEFAULTS.textTarget);
  const [exportKind, setExportKind] = useState("css");
  const [copied, setCopied] = useState("");

  const palette = useMemo(
    () => generateCyberpunkPalette({ seed, pairId, grit: Number(grit), textTarget }),
    [seed, pairId, grit, textTarget],
  );
  const failed = Boolean(palette.error);

  const exportText = failed
    ? ""
    : exportKind === "css"
      ? palette.cssVariables
      : exportKind === "tailwind"
        ? palette.tailwindTheme
        : palette.json;

  const copy = async (key, text) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      setCopied("");
    }
  };

  const shuffle = () => {
    const word = SEED_WORDS[Math.floor(Math.random() * SEED_WORDS.length)];
    setSeed(`${word}-${Math.floor(Math.random() * 1000)}`);
  };

  const reset = () => {
    setSeed(DEFAULTS.seed);
    setPairId(DEFAULTS.pairId);
    setGrit(DEFAULTS.grit);
    setTextTarget(DEFAULTS.textTarget);
    setCopied("");
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Zap className="h-4 w-4" aria-hidden="true" />
          Cyberpunk palettes
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Cyberpunk Palette Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Neon on near-black, tuned to stay readable. Each accent is walked up in lightness until it
          clears your contrast target against the base, with a four-step elevation ramp, semantic
          status colours and ready glow shadows.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cp-seed">
              Seed word or phrase
            </label>
            <input
              id="cp-seed"
              className={`mt-2 ${INPUT_CLASS}`}
              value={seed}
              onChange={(event) => setSeed(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cp-pair">
              Neon pair
            </label>
            <select
              id="cp-pair"
              className={`mt-2 ${INPUT_CLASS}`}
              value={pairId}
              onChange={(event) => setPairId(event.target.value)}
            >
              {NEON_PAIRS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cp-target">
              Text contrast target
            </label>
            <select
              id="cp-target"
              className={`mt-2 ${INPUT_CLASS}`}
              value={textTarget}
              onChange={(event) => setTextTarget(event.target.value)}
            >
              {TEXT_TARGETS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cp-grit">
              Grit: {grit}
            </label>
            <input
              id="cp-grit"
              className="mt-3 h-11 w-full accent-[var(--primary)]"
              type="range"
              min="0"
              max="100"
              step="5"
              value={grit}
              onChange={(event) => setGrit(event.target.value)}
            />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={shuffle} aria-label="Shuffle to a new seed" className={GHOST_BTN}>
            <Shuffle className="h-4 w-4" aria-hidden="true" />
            Shuffle seed
          </button>
          <button type="button" onClick={reset} aria-label="Reset the generator" className={GHOST_BTN}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
      </section>

      {failed && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {palette.error}
        </p>
      )}

      <section
        aria-live="polite"
        aria-atomic="true"
        className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Primary neon (UI-tuned)
            </p>
            <p className="mt-1 font-mono text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : palette.neons[0].uiHex}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed ? DASH : `${palette.neons[0].uiRatio}:1 on base · ${palette.pair.label}`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => copy("summary", failed ? "" : palette.summary)}
            disabled={failed}
            aria-label="Copy all palette hex codes"
            className={`${PRIMARY_BTN} disabled:opacity-50`}
          >
            {copied === "summary" ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copied === "summary" ? "Copied!" : "Copy hex codes"}
          </button>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {(failed
            ? [
                ["Base", DASH],
                ["Text on base", DASH],
                ["Muted text", DASH],
                ["Colours adjusted for contrast", DASH],
              ]
            : [
                ["Base", `${palette.surfaces[0].hex} (${palette.surfaces.length} elevation steps)`],
                ["Text on base", `${palette.ink.hex} · ${palette.ink.ratio}:1`],
                ["Muted text", `${palette.mutedInk.hex} · ${palette.mutedInk.ratio}:1`],
                ["Target for text", palette.target.label],
                [
                  "Colours adjusted to reach it",
                  palette.adjustments.length === 0
                    ? "none needed"
                    : palette.adjustments.map((neon) => neon.name).join(", "),
                ],
              ]
          ).map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!failed && (
        <>
          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">Live preview</h2>
            <div className="mt-3 rounded-lg p-5 ring-1 ring-[var(--border)]" style={{ backgroundColor: palette.surfaces[0].hex }}>
              <div className="rounded-lg p-4" style={{ backgroundColor: palette.surfaces[1].hex }}>
                <p className="text-lg font-semibold" style={{ color: palette.ink.hex }}>
                  System online
                </p>
                <p className="mt-1 text-sm" style={{ color: palette.mutedInk.hex }}>
                  Muted copy sits at {palette.mutedInk.ratio}:1 — the quietest value that still passes.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span
                    className="inline-flex min-h-11 items-center rounded-md px-4 text-sm font-semibold"
                    style={{
                      backgroundColor: palette.neons[0].uiHex,
                      color: palette.surfaces[0].hex,
                      boxShadow: palette.glows[0].css,
                    }}
                  >
                    Primary
                  </span>
                  <span
                    className="inline-flex min-h-11 items-center rounded-md px-4 text-sm font-semibold"
                    style={{
                      backgroundColor: palette.surfaces[2].hex,
                      color: palette.neons[1].textHex,
                      boxShadow: palette.glows[1].css,
                    }}
                  >
                    Secondary
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">Elevation ramp</h2>
            <div className="mt-3 flex overflow-hidden rounded-lg ring-1 ring-[var(--border)]">
              {palette.surfaces.map((surface) => (
                <span
                  key={surface.key}
                  className="h-14 flex-1"
                  style={{ backgroundColor: surface.hex }}
                  title={surface.hex}
                />
              ))}
            </div>
            <ul className="mt-3 space-y-2 text-sm">
              {palette.surfaces.map((surface) => (
                <li key={surface.key} className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[var(--muted-foreground)]">{surface.use}</span>
                  <span className="font-mono font-semibold">{surface.hex}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">Neon and status colours</h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Two versions of each: the UI value tuned to {AA_UI}:1 for fills and borders, and the text
              value tuned to your {AA_NORMAL === palette.target.value ? "AA" : "AAA"} target.
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[420px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Role
                    </th>
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      UI
                    </th>
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Text
                    </th>
                    <th scope="col" className="py-2 text-right font-semibold">
                      Text ratio
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {palette.neons.map((neon) => (
                    <tr key={neon.key} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3">
                        <span className="font-semibold">{neon.name}</span>
                        <span className="block text-xs text-[var(--muted-foreground)]">{neon.use}</span>
                      </td>
                      <td className="py-2 pr-3">
                        <span className="inline-flex items-center gap-2">
                          <span
                            className="h-4 w-4 rounded ring-1 ring-[var(--border)]"
                            style={{ backgroundColor: neon.uiHex }}
                            aria-hidden="true"
                          />
                          <span className="font-mono">{neon.uiHex}</span>
                        </span>
                      </td>
                      <td className="py-2 pr-3 font-mono">{neon.textHex}</td>
                      <td className="py-2 text-right font-semibold">
                        {neon.textRatio}:1
                        {neon.textAdjusted && (
                          <span className="block text-xs font-normal text-[var(--muted-foreground)]">
                            +{neon.lightnessShift}% lightness
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {palette.unreachable.length > 0 && (
              <p className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
                {palette.unreachable.map((neon) => neon.name).join(", ")} cannot reach the text target at
                this saturation — lower the grit or use it for fills only.
              </p>
            )}
          </section>

          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">Glow shadows</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {palette.glows.map((glow) => (
                <li key={glow.key} className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-xs break-all">{glow.css}</span>
                  <button
                    type="button"
                    onClick={() => copy(glow.key, glow.css)}
                    aria-label={`Copy the ${glow.name} shadow`}
                    className={GHOST_BTN}
                  >
                    {copied === glow.key ? (
                      <Check className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Copy className="h-4 w-4" aria-hidden="true" />
                    )}
                    {copied === glow.key ? "Copied!" : "Copy"}
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">Contrast</h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              WCAG 2.1: {AA_NORMAL}:1 for body text, {AAA_NORMAL}:1 for AAA, {AA_UI}:1 for large text and
              UI components.
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[360px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Pair
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      Ratio
                    </th>
                    <th scope="col" className="py-2 text-right font-semibold">
                      Safe for
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {palette.checks.map((check) => (
                    <tr key={check.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3">{check.label}</td>
                      <td className="py-2 pr-3 text-right font-semibold">{check.ratio}:1</td>
                      <td
                        className={`py-2 text-right ${check.passes ? "text-[var(--success)]" : "text-[var(--muted-foreground)]"}`}
                      >
                        {check.verdict}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-semibold">Export</h2>
              <button
                type="button"
                onClick={() => copy("export", exportText)}
                aria-label="Copy the export snippet"
                className={GHOST_BTN}
              >
                {copied === "export" ? (
                  <Check className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Copy className="h-4 w-4" aria-hidden="true" />
                )}
                {copied === "export" ? "Copied!" : "Copy snippet"}
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {EXPORTS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setExportKind(option.id)}
                  aria-pressed={exportKind === option.id}
                  className={
                    exportKind === option.id
                      ? `${PRIMARY_BTN} px-3`
                      : `${GHOST_BTN} px-3 text-[var(--muted-foreground)]`
                  }
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className="mt-3 overflow-x-auto rounded-lg bg-[var(--muted)] p-3">
              <pre className="font-mono text-xs leading-5 whitespace-pre">{exportText}</pre>
            </div>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Contrast ratios are computed with the WCAG 2.1 relative-luminance formula. Saturated colour on
        a near-black background can still shimmer for some readers even when it passes — offer a
        lower-contrast or light theme where you can.
      </p>
    </main>
  );
}
