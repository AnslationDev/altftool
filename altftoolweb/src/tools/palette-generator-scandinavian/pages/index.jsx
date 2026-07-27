"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Shuffle, Snowflake } from "lucide-react";

import {
  ACCENT_LRV_MAX,
  CEILING_LRV_MIN,
  ORIENTATIONS,
  WALL_LRV_MIN,
  generateScandiPalette,
} from "../lib";

const DEFAULTS = { seed: "hygge", orientation: "north", warmth: "55" };

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
  "hygge",
  "fjord",
  "birch-floor",
  "lagom",
  "white-oak",
  "winter-light",
  "linen-curtain",
  "pine-cabin",
  "stone-hearth",
  "snowfall",
];

export default function ToolHome() {
  const [seed, setSeed] = useState(DEFAULTS.seed);
  const [orientation, setOrientation] = useState(DEFAULTS.orientation);
  const [warmth, setWarmth] = useState(DEFAULTS.warmth);
  const [exportKind, setExportKind] = useState("css");
  const [copied, setCopied] = useState("");

  const palette = useMemo(
    () => generateScandiPalette({ seed, orientation, warmth: Number(warmth) }),
    [seed, orientation, warmth],
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
    setOrientation(DEFAULTS.orientation);
    setWarmth(DEFAULTS.warmth);
    setCopied("");
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Snowflake className="h-4 w-4" aria-hidden="true" />
          Nordic palettes
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Scandinavian Palette Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Calm, light, low-saturation colour for interiors and minimal brands. Every surface reports
          its Light Reflectance Value alongside WCAG contrast, and the palette compensates for which
          way the room faces.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="scandi-seed">
              Seed word or phrase
            </label>
            <input
              id="scandi-seed"
              className={`mt-2 ${INPUT_CLASS}`}
              value={seed}
              onChange={(event) => setSeed(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="scandi-orientation">
              Room orientation
            </label>
            <select
              id="scandi-orientation"
              className={`mt-2 ${INPUT_CLASS}`}
              value={orientation}
              onChange={(event) => setOrientation(event.target.value)}
            >
              {ORIENTATIONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="scandi-warmth">
              Warmth: {warmth} (0 is cold stone, 100 is warm plaster)
            </label>
            <input
              id="scandi-warmth"
              className="mt-3 h-11 w-full accent-[var(--primary)]"
              type="range"
              min="0"
              max="100"
              step="5"
              value={warmth}
              onChange={(event) => setWarmth(event.target.value)}
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
              Wall white
            </p>
            <p className="mt-1 font-mono text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : palette.roles[1].hex}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed ? DASH : `LRV ${palette.roles[1].lrv} · ${palette.orientation.label}`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => copy("summary", failed ? "" : palette.summary)}
            disabled={failed}
            aria-label="Copy all palette hex codes and LRV values"
            className={`${PRIMARY_BTN} disabled:opacity-50`}
          >
            {copied === "summary" ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copied === "summary" ? "Copied!" : "Copy palette"}
          </button>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {(failed
            ? [
                ["Weighted room LRV", DASH],
                ["Mean saturation", DASH],
                ["Contrast checks passing", DASH],
              ]
            : [
                ["Weighted room LRV (60/30/10)", `${palette.roomLrv}`],
                ["Mean saturation", `${palette.meanSaturation}% (band ${palette.saturationBand.min}-${palette.saturationBand.max}%)`],
                [
                  "Contrast checks passing",
                  `${palette.checks.filter((check) => check.passes).length} of ${palette.checks.length}`,
                ],
                ["Text colour", `${palette.roles[6].hex} (LRV ${palette.roles[6].lrv})`],
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
            <h2 className="text-base font-semibold">Palette and LRV</h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Light Reflectance Value runs 0 to 100. Walls are usually kept at {WALL_LRV_MIN}+ where
              daylight is limited, ceilings at {CEILING_LRV_MIN}+, and a true dark accent sits below{" "}
              {ACCENT_LRV_MAX}.
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[380px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Surface
                    </th>
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Hex
                    </th>
                    <th scope="col" className="py-2 text-right font-semibold">
                      LRV
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {palette.roles.map((role) => (
                    <tr key={role.key} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3">
                        <span className="font-semibold">{role.name}</span>
                        <span className="block text-xs text-[var(--muted-foreground)]">{role.use}</span>
                      </td>
                      <td className="py-2 pr-3">
                        <span className="inline-flex items-center gap-2">
                          <span
                            className="h-5 w-5 rounded ring-1 ring-[var(--border)]"
                            style={{ backgroundColor: role.hex }}
                            aria-hidden="true"
                          />
                          <span className="font-mono">{role.hex}</span>
                        </span>
                      </td>
                      <td className="py-2 text-right font-semibold">{role.lrv}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {palette.roles.map((role) => (
                <button
                  key={role.key}
                  type="button"
                  onClick={() => copy(role.key, role.hex)}
                  aria-label={`Copy ${role.name} hex code`}
                  className={`${GHOST_BTN} px-3`}
                >
                  {copied === role.key ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}
                  {role.name}
                </button>
              ))}
            </div>
          </section>

          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">60-30-10 allocation</h2>
            <ul className="mt-3 space-y-3">
              {palette.allocation.map((slot) => (
                <li key={slot.key}>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="font-semibold">
                      {slot.share}% · {slot.role.name}
                    </span>
                    <span className="font-mono text-[var(--muted-foreground)]">{slot.role.hex}</span>
                  </div>
                  <div className="mt-1 h-3 w-full overflow-hidden rounded-full ring-1 ring-[var(--border)]">
                    <span
                      className="block h-full"
                      style={{ width: `${slot.share}%`, backgroundColor: slot.role.hex }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">{slot.note}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">Notes</h2>
            <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
              {palette.notes.map((note) => (
                <li key={note} className="flex gap-2">
                  <span aria-hidden="true" className="text-[var(--primary)]">
                    •
                  </span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">Contrast</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[380px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Pair
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      Ratio
                    </th>
                    <th scope="col" className="py-2 text-right font-semibold">
                      Reading
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
        LRV here is the screen approximation — sRGB relative luminance as a percentage. A paint
        supplier measures LRV on a physical sample under standard light, so treat these values as a
        guide and check a real tester pot on the wall before ordering.
      </p>
    </main>
  );
}
