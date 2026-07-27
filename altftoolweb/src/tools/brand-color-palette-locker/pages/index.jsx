"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Lock, Plus, RotateCcw, Trash2 } from "lucide-react";

import { DEFAULT_SEEDS, NEW_SEED_HEX, buildCssTokens, buildPaletteReport } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const DASH = "—";

export default function ToolHome() {
  const [seeds, setSeeds] = useState(DEFAULT_SEEDS);
  const [stock, setStock] = useState("coated");
  const [activeId, setActiveId] = useState(DEFAULT_SEEDS[0].id);
  const [copied, setCopied] = useState("");

  const report = useMemo(() => buildPaletteReport({ seeds, stock }), [seeds, stock]);
  const tokens = useMemo(() => buildCssTokens({ seeds, stock }), [seeds, stock]);

  const active = useMemo(() => {
    if (report.error) return null;
    return report.colors.find((color) => color.id === activeId) || report.colors[0];
  }, [report, activeId]);

  const updateSeed = (id, patch) => {
    setSeeds((current) => current.map((seed) => (seed.id === id ? { ...seed, ...patch } : seed)));
  };

  const addSeed = () => {
    if (seeds.length >= 8) return;
    const taken = new Set(seeds.map((seed) => seed.id));
    let index = seeds.length + 1;
    while (taken.has(`color-${index}`)) index += 1;
    setSeeds([...seeds, { id: `color-${index}`, role: `Colour ${index}`, hex: NEW_SEED_HEX }]);
  };

  const removeSeed = (id) => {
    if (seeds.length <= 1) return;
    const next = seeds.filter((seed) => seed.id !== id);
    setSeeds(next);
    if (activeId === id) setActiveId(next[0].id);
  };

  const summary = useMemo(() => {
    if (report.error) return "";
    const lines = ["Brand Colour Palette Locker", `Print stock: ${stock === "uncoated" ? "Uncoated" : "Coated"}`, ""];
    for (const color of report.colors) {
      lines.push(
        `${color.role}: ${color.hex} · rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}) · hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`,
        `  CMYK ${color.cmyk.c}/${color.cmyk.m}/${color.cmyk.y}/${color.cmyk.k} · ink coverage ${color.cmyk.tac}% (limit ${color.tacLimit}%)`,
        `  Contrast on white ${color.onWhite}:1, on black ${color.onBlack}:1 — use ${color.bestText.text} text`,
      );
    }
    lines.push("", "Pair contrast:");
    for (const pair of report.pairs) {
      lines.push(`  ${pair.a} vs ${pair.b}: ${pair.ratio}:1${pair.usableForText ? " (safe for text)" : ""}`);
    }
    if (!tokens.error) lines.push("", tokens.css);
    return lines.join("\n");
  }, [report, tokens, stock]);

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

  const reset = () => {
    setSeeds(DEFAULT_SEEDS);
    setStock("coated");
    setActiveId(DEFAULT_SEEDS[0].id);
    setCopied("");
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Lock className="h-4 w-4" aria-hidden="true" />
          Brand kit
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Brand Colour Palette Locker</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Lock your brand colours once and get everything downstream from them: a 50-900 tint and shade
          ramp, hex, RGB, HSL and CMYK values, WCAG contrast for every stop, and a total ink coverage
          check before anything goes to press.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Locked colours</h2>
          <button
            type="button"
            onClick={addSeed}
            disabled={seeds.length >= 8}
            className={`${GHOST_BTN} disabled:opacity-50`}
            aria-label="Add another brand colour"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add colour
          </button>
        </div>

        <div className="mt-4 grid gap-4">
          {seeds.map((seed) => (
            <div
              key={seed.id}
              className="grid gap-3 rounded-lg border border-[var(--border)] p-3 sm:grid-cols-[auto_1fr_1fr_auto] sm:items-end"
            >
              <div
                className="h-11 w-11 shrink-0 rounded-md border border-[var(--border)]"
                style={{ backgroundColor: seed.hex }}
                role="img"
                aria-label={`${seed.role} swatch, ${seed.hex}`}
              />
              <div>
                <label className={LABEL_CLASS} htmlFor={`bp-role-${seed.id}`}>
                  Role
                </label>
                <input
                  id={`bp-role-${seed.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="text"
                  maxLength={24}
                  value={seed.role}
                  onChange={(event) => updateSeed(seed.id, { role: event.target.value })}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`bp-hex-${seed.id}`}>
                  Hex
                </label>
                <input
                  id={`bp-hex-${seed.id}`}
                  className={`mt-2 ${INPUT_CLASS} font-mono`}
                  type="text"
                  maxLength={7}
                  spellCheck={false}
                  value={seed.hex}
                  onChange={(event) => updateSeed(seed.id, { hex: event.target.value })}
                />
              </div>
              <button
                type="button"
                onClick={() => removeSeed(seed.id)}
                disabled={seeds.length <= 1}
                className={`${GHOST_BTN} disabled:opacity-40`}
                aria-label={`Remove ${seed.role}`}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="bp-stock">
            Print stock (sets the ink coverage limit)
          </label>
          <select
            id="bp-stock"
            className={`mt-2 ${INPUT_CLASS}`}
            value={stock}
            onChange={(event) => setStock(event.target.value)}
          >
            <option value="coated">Coated, sheet-fed — 300% limit</option>
            <option value="uncoated">Uncoated / web offset — 260% limit</option>
          </select>
        </div>
      </section>

      {report.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {report.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Tokens generated
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {report.error ? DASH : report.colors.length * 10}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {report.error ? DASH : `${report.colors.length} locked colours x 10 ramp stops`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copy("summary", summary)}
              disabled={Boolean(report.error)}
              aria-label="Copy the full palette report"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied === "summary" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied === "summary" ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the palette" className={GHOST_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Colours over the ink limit", report.error ? DASH : String(report.overInkLimit)],
            ["Pairs too close to tell apart", report.error ? DASH : String(report.lowContrastPairs)],
            [
              "Pairs safe for text on background",
              report.error ? DASH : String(report.pairs.filter((pair) => pair.usableForText).length),
            ],
            ["Ink coverage limit in use", report.error ? DASH : `${stock === "uncoated" ? 260 : 300}%`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!report.error && active && (
        <>
          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-semibold">Ramp</h2>
              <select
                aria-label="Colour to show the ramp for"
                className={`${INPUT_CLASS} max-w-[14rem]`}
                value={active.id}
                onChange={(event) => setActiveId(event.target.value)}
              >
                {report.colors.map((color) => (
                  <option key={color.id} value={color.id}>
                    {color.role}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4 grid grid-cols-5 gap-1 sm:grid-cols-10">
              {active.ramp.map((stop) => (
                <div
                  key={stop.key}
                  className="flex h-16 flex-col items-center justify-center rounded-md text-[10px] font-semibold"
                  style={{ backgroundColor: stop.hex, color: stop.text.text }}
                  title={`${stop.key} — ${stop.hex}`}
                >
                  <span>{stop.key}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[540px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Stop</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">Hex</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">RGB</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">HSL</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">CMYK</th>
                    <th scope="col" className="py-2 text-right font-semibold">Text contrast</th>
                  </tr>
                </thead>
                <tbody>
                  {active.ramp.map((stop) => (
                    <tr key={stop.key} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{stop.key}</td>
                      <td className="py-2 pr-3 font-mono whitespace-nowrap">{stop.hex}</td>
                      <td className="py-2 pr-3 whitespace-nowrap text-[var(--muted-foreground)]">
                        {stop.rgb.r}, {stop.rgb.g}, {stop.rgb.b}
                      </td>
                      <td className="py-2 pr-3 whitespace-nowrap text-[var(--muted-foreground)]">
                        {stop.hsl.h}, {stop.hsl.s}%, {stop.hsl.l}%
                      </td>
                      <td className="py-2 pr-3 whitespace-nowrap text-[var(--muted-foreground)]">
                        {stop.cmyk.c}/{stop.cmyk.m}/{stop.cmyk.y}/{stop.cmyk.k}
                      </td>
                      <td
                        className={`py-2 text-right font-semibold ${
                          stop.text.passesNormal ? "text-[var(--success)]" : "text-[var(--danger)]"
                        }`}
                      >
                        {NUM.format(stop.text.ratio)}:1
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">Base colour detail</h2>
            <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
              {[
                ["Hex", active.hex],
                ["RGB", `${active.rgb.r}, ${active.rgb.g}, ${active.rgb.b}`],
                ["HSL", `${active.hsl.h}, ${active.hsl.s}%, ${active.hsl.l}%`],
                ["CMYK", `${active.cmyk.c} / ${active.cmyk.m} / ${active.cmyk.y} / ${active.cmyk.k}`],
                ["Total ink coverage", `${active.cmyk.tac}% (limit ${active.tacLimit}%)`],
                ["Contrast on white", `${NUM.format(active.onWhite)}:1`],
                ["Contrast on black", `${NUM.format(active.onBlack)}:1`],
                ["Recommended text colour", active.bestText.text],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
            {active.tacOverLimit && (
              <p role="alert" className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
                Total ink coverage of {active.cmyk.tac}% exceeds the {active.tacLimit}% limit for this stock. Ask
                your printer for a separation with more grey component replacement.
              </p>
            )}
          </section>

          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">Colour against colour</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[420px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Pair</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Contrast</th>
                    <th scope="col" className="py-2 font-semibold">Safe for</th>
                  </tr>
                </thead>
                <tbody>
                  {report.pairs.map((pair) => (
                    <tr key={`${pair.a}-${pair.b}`} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">
                        {pair.a} on {pair.b}
                      </td>
                      <td className="py-2 pr-3 text-right">{NUM.format(pair.ratio)}:1</td>
                      <td className="py-2 text-[var(--muted-foreground)]">
                        {pair.usableForText
                          ? "Body text"
                          : pair.distinguishable
                            ? "Large text and shapes only"
                            : "Too close — avoid side by side"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-semibold">CSS custom properties</h2>
              <button
                type="button"
                onClick={() => copy("css", tokens.error ? "" : tokens.css)}
                className={PRIMARY_BTN}
                aria-label="Copy the CSS custom properties"
              >
                {copied === "css" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                {copied === "css" ? "Copied!" : "Copy tokens"}
              </button>
            </div>
            <div className="mt-3 max-h-96 overflow-auto rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
              <pre className="text-xs leading-5">{tokens.error ? tokens.error : tokens.css}</pre>
            </div>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        CMYK values use the standard naive conversion from sRGB and ignore the ICC profile, paper and
        press your job will actually run on. Use them to sanity-check ink coverage, then let your printer
        produce the final separation.
      </p>
    </main>
  );
}
