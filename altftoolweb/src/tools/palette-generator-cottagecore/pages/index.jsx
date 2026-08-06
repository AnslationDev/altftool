"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Flower2, RotateCcw, Shuffle } from "lucide-react";

import { AA_LARGE, AA_NORMAL, SEASONS, generateCottagecorePalette } from "../lib";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

const DEFAULTS = { seed: "elderflower", season: "spring", softness: "60" };

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
  "elderflower",
  "hedgerow",
  "bramble",
  "linen-press",
  "beeswax",
  "quince",
  "wildflower",
  "rosehip",
  "gooseberry",
  "meadowsweet",
];

export default function ToolHome() {
  const [seed, setSeed] = useState(DEFAULTS.seed);
  const [season, setSeason] = useState(DEFAULTS.season);
  const [softness, setSoftness] = useState(DEFAULTS.softness);
  const [exportKind, setExportKind] = useState("css");
  const { copy, isCopied, announcement, reset: resetCopyState } = useCopyToClipboard();

  const palette = useMemo(
    () => generateCottagecorePalette({ seed, season, softness: Number(softness) }),
    [seed, season, softness],
  );
  const failed = Boolean(palette.error);

  const exportText = failed
    ? ""
    : exportKind === "css"
      ? palette.cssVariables
      : exportKind === "tailwind"
        ? palette.tailwindTheme
        : palette.json;

  const roleLabel = (key) =>
    key === "summary"
      ? "All palette hex codes"
      : key === "export"
        ? "Export snippet"
        : `${palette.roles.concat([palette.ink]).find((role) => role.key === key)?.name ?? "Colour"} hex code`;

  const copyKeyed = (key, text) => copy(key, text, { label: roleLabel(key) });

  const shuffle = () => {
    const word = SEED_WORDS[Math.floor(Math.random() * SEED_WORDS.length)];
    setSeed(`${word}-${Math.floor(Math.random() * 1000)}`);
  };

  const reset = () => {
    setSeed(DEFAULTS.seed);
    setSeason(DEFAULTS.season);
    setSoftness(DEFAULTS.softness);
    resetCopyState();
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <span aria-live="polite" role="status" className="sr-only">
        {announcement}
      </span>
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Flower2 className="h-4 w-4" aria-hidden="true" />
          Cottagecore palettes
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Cottagecore Palette Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Cream, sage, moss, berry and honey — kept under a saturation ceiling so the palette stays
          faded rather than candy-bright. Includes a sage tint ramp, readable button pairings and
          darkened variants that clear WCAG contrast.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cottage-seed">
              Seed word or phrase
            </label>
            <input
              id="cottage-seed"
              className={`mt-2 ${INPUT_CLASS}`}
              value={seed}
              onChange={(event) => setSeed(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cottage-season">
              Season
            </label>
            <select
              id="cottage-season"
              className={`mt-2 ${INPUT_CLASS}`}
              value={season}
              onChange={(event) => setSeason(event.target.value)}
            >
              {SEASONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cottage-softness">
              Softness: {softness} (higher means a lower saturation ceiling)
            </label>
            <input
              id="cottage-softness"
              className="mt-3 h-11 w-full accent-[var(--primary)]"
              type="range"
              min="0"
              max="100"
              step="5"
              value={softness}
              onChange={(event) => setSoftness(event.target.value)}
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Primary — sage
            </p>
            <p className="mt-1 font-mono text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : palette.roles[2].hex}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed ? DASH : `${palette.roles[2].hslText} · ${palette.season.label}`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => copyKeyed("summary", failed ? "" : palette.summary)}
            disabled={failed}
            aria-label="Copy all palette hex codes"
            className={`${PRIMARY_BTN} disabled:opacity-50`}
          >
            {isCopied("summary") ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {isCopied("summary") ? "Copied!" : "Copy hex codes"}
          </button>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {(failed
            ? [
                ["Saturation ceiling", DASH],
                ["Mean saturation", DASH],
                ["Softness score", DASH],
                ["Contrast checks passing", DASH],
              ]
            : [
                ["Saturation ceiling", `${palette.saturationCeiling}%`],
                ["Mean saturation of the colour roles", `${palette.meanSaturation}%`],
                ["Softness score", `${palette.softnessScore}/100`],
                [
                  "Contrast checks passing",
                  `${palette.checks.filter((check) => check.passes).length} of ${palette.checks.length}`,
                ],
                ["Text colour", palette.ink.hex],
              ]
          ).map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!failed && (
        <>
          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">Palette</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {palette.roles.concat([palette.ink]).map((role) => (
                <li key={role.key} className="rounded-lg border border-[var(--border)] p-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="h-11 w-11 shrink-0 rounded-md ring-1 ring-[var(--border)]"
                      style={{ backgroundColor: role.hex }}
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{role.name}</p>
                      <p className="font-mono text-xs text-[var(--muted-foreground)]">{role.hex}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyKeyed(role.key, role.hex)}
                      aria-label={`Copy ${role.name} hex code`}
                      className="ml-auto inline-flex h-11 w-11 items-center justify-center rounded-md text-[var(--muted-foreground)] transition hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                    >
                      {isCopied(role.key) ? (
                        <Check className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Copy className="h-4 w-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">{role.use}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">Sage tint ramp</h2>
            <div className="mt-3 flex overflow-hidden rounded-lg ring-1 ring-[var(--border)]">
              {palette.tintRamp.map((step) => (
                <span key={step.key} className="h-14 flex-1" style={{ backgroundColor: step.hex }} title={step.hex} />
              ))}
            </div>
            <p className="mt-2 font-mono text-xs text-[var(--muted-foreground)]">
              {palette.tintRamp.map((step) => step.hex).join("  ")}
            </p>
          </section>

          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">Button pairings</h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              For each fill, the label colour that reads better — ink or cream — with its ratio against
              the {AA_NORMAL}:1 body-text minimum.
            </p>
            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
              {palette.buttonPairs.map((pair) => (
                <li key={pair.key} className="rounded-lg border border-[var(--border)] p-3">
                  <span
                    className="flex min-h-11 items-center justify-center rounded-md px-3 text-sm font-semibold"
                    style={{ backgroundColor: pair.fillHex, color: pair.labelHex }}
                  >
                    {pair.name}
                  </span>
                  <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                    {pair.labelName} label · {pair.ratio}:1 ·{" "}
                    <span className={pair.passes ? "text-[var(--success)]" : "text-[var(--danger)]"}>
                      {pair.passes ? "passes AA" : "below AA"}
                    </span>
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">UI-safe variants</h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Pastels on cream can fall short of the {AA_LARGE}:1 minimum for borders, icons and other
              non-text UI. These are the same hues, darkened only as far as needed to clear it — some
              already pass as-is.
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[360px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Colour
                    </th>
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Original
                    </th>
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      UI-safe
                    </th>
                    <th scope="col" className="py-2 text-right font-semibold">
                      Ratio
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {palette.uiSafe.map((item) => (
                    <tr key={item.key} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{item.name}</td>
                      <td className="py-2 pr-3 font-mono text-[var(--muted-foreground)]">{item.originalHex}</td>
                      <td className="py-2 pr-3">
                        <span className="inline-flex items-center gap-2">
                          <span
                            className="h-4 w-4 rounded ring-1 ring-[var(--border)]"
                            style={{ backgroundColor: item.hex }}
                            aria-hidden="true"
                          />
                          <span className="font-mono">{item.hex}</span>
                        </span>
                      </td>
                      <td className="py-2 text-right font-semibold">{item.ratio}:1</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">Contrast</h2>
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
                        className={`py-2 text-right ${check.passes ? "text-[var(--success-text)]" : "text-[var(--danger-text)]"}`}
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
                onClick={() => copyKeyed("export", exportText)}
                aria-label="Copy the export snippet"
                className={GHOST_BTN}
              >
                {isCopied("export") ? (
                  <Check className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Copy className="h-4 w-4" aria-hidden="true" />
                )}
                {isCopied("export") ? "Copied!" : "Copy snippet"}
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
        Ratios use the WCAG 2.1 relative-luminance formula. Screen colour and printed or dyed colour
        are not the same thing — order a sample before committing a palette to paint, paper or fabric.
      </p>
    </main>
  );
}
