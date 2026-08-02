"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Leaf, RotateCcw, Shuffle } from "lucide-react";

import { AA_LARGE, AA_NORMAL, LEADS, WARM_SHARE_TARGET, generateEarthyPalette } from "../lib";

const DEFAULTS = { seed: "raw-clay", lead: "clay", earthiness: "55" };

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
  "raw-clay",
  "harvest",
  "millstone",
  "olive-grove",
  "riverbed",
  "unbleached",
  "wild-honey",
  "terracotta-pot",
  "cold-press",
  "root-cellar",
];

export default function ToolHome() {
  const [seed, setSeed] = useState(DEFAULTS.seed);
  const [lead, setLead] = useState(DEFAULTS.lead);
  const [earthiness, setEarthiness] = useState(DEFAULTS.earthiness);
  const [exportKind, setExportKind] = useState("css");
  const [copied, setCopied] = useState("");

  const palette = useMemo(
    () => generateEarthyPalette({ seed, lead, earthiness: Number(earthiness) }),
    [seed, lead, earthiness],
  );
  const failed = Boolean(palette.error);
  const leadPigment = failed ? null : palette.roles.find((role) => role.key === "primary");

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
    setLead(DEFAULTS.lead);
    setEarthiness(DEFAULTS.earthiness);
    setCopied("");
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Leaf className="h-4 w-4" aria-hidden="true" />
          Earth pigments
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Earthy Organic Palette Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Clay, sienna, ochre, green earth and raw umber — built on the hue positions of real mineral
          pigments, with a warm/cool balance reading, a kraft-board packaging preview and label ink
          picked by contrast.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="earth-seed">
              Seed word or phrase
            </label>
            <input
              id="earth-seed"
              className={`mt-2 ${INPUT_CLASS}`}
              value={seed}
              onChange={(event) => setSeed(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="earth-lead">
              Lead pigment family
            </label>
            <select
              id="earth-lead"
              className={`mt-2 ${INPUT_CLASS}`}
              value={lead}
              onChange={(event) => setLead(event.target.value)}
            >
              {LEADS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="earth-earthiness">
              Earthiness: {earthiness} (higher pulls saturation towards raw pigment)
            </label>
            <input
              id="earth-earthiness"
              className="mt-3 h-11 w-full accent-[var(--primary)]"
              type="range"
              min="0"
              max="100"
              step="5"
              value={earthiness}
              onChange={(event) => setEarthiness(event.target.value)}
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
              Lead pigment
            </p>
            <p className="mt-1 font-mono text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : leadPigment.hex}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed ? DASH : `${leadPigment.name} · ${leadPigment.hslText}`}
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
                ["Warm share", DASH],
                ["Mean saturation", DASH],
                ["Lightness spread", DASH],
                ["Contrast checks passing", DASH],
              ]
            : [
                ["Warm share of the palette", `${palette.warmShare}% (target ${WARM_SHARE_TARGET}%+)`],
                ["Mean saturation", `${palette.meanSaturation}%`],
                ["Lightness spread", `${palette.lightnessSpread} points`],
                [
                  "Contrast checks passing",
                  `${palette.checks.filter((check) => check.passes).length} of ${palette.checks.length}`,
                ],
                ["Kraft board reference", palette.kraft.hex],
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
            <h2 className="text-base font-semibold">Palette</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {palette.roles.map((role) => (
                <li key={role.key} className="rounded-lg border border-[var(--border)] p-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="h-11 w-11 shrink-0 rounded-md ring-1 ring-[var(--border)]"
                      style={{ backgroundColor: role.hex }}
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{role.name}</p>
                      <p className="font-mono text-xs text-[var(--muted-foreground)]">
                        {role.hex} · {role.warm ? "warm" : "cool"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => copy(role.key, role.hex)}
                      aria-label={`Copy ${role.name} hex code`}
                      className="ml-auto inline-flex h-11 w-11 items-center justify-center rounded-md text-[var(--muted-foreground)] transition hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                    >
                      {copied === role.key ? (
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
            <h2 className="text-base font-semibold">Lead pigment ramp</h2>
            <div className="mt-3 flex overflow-hidden rounded-lg ring-1 ring-[var(--border)]">
              {palette.ramp.map((step) => (
                <span key={step.key} className="h-14 flex-1" style={{ backgroundColor: step.hex }} title={step.hex} />
              ))}
            </div>
            <p className="mt-2 font-mono text-xs text-[var(--muted-foreground)]">
              {palette.ramp.map((step) => step.hex).join("  ")}
            </p>
          </section>

          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">Packaging labels</h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              For each fill — including unbleached kraft board — the ink that reads best, and whether
              it clears the {AA_NORMAL}:1 body-text minimum.
            </p>
            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
              {palette.packaging.map((item) => (
                <li key={item.key} className="rounded-lg border border-[var(--border)] p-3">
                  <span
                    className="flex min-h-11 items-center justify-center rounded-md px-3 text-sm font-semibold"
                    style={{ backgroundColor: item.fillHex, color: item.hex }}
                  >
                    {item.name}
                  </span>
                  <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                    {item.name === "Kraft board" ? "Kraft" : "Fill"} {item.fillHex} · ink {item.hex} ·{" "}
                    {item.ratio}:1{" "}
                    <span className={item.passes ? "text-[var(--success)]" : "text-[var(--danger)]"}>
                      {item.passes ? "passes AA" : "below AA"}
                    </span>
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">Balance notes</h2>
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
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {AA_NORMAL}:1 is the WCAG 2.1 minimum for body text, {AA_LARGE}:1 for large text and UI
              shapes.
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
        Hue positions approximate where each mineral pigment sits when mixed to a usable tint; they
        are not a substitute for a physical swatch. Printing on uncoated or recycled stock will shift
        colour further — pull a press proof before signing off packaging.
      </p>
    </main>
  );
}
