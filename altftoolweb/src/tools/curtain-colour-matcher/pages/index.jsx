"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Blinds, Check, Copy, RotateCcw } from "lucide-react";

import {
  BLEND_LRV_GAP,
  DEFAULT_UPHOLSTERY_HEX,
  DEFAULT_WALL_HEX,
  EXPOSURES,
  FOCAL_LRV_GAP,
  GOALS,
  matchCurtains,
} from "../lib";

const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const n1 = (v) => (Number.isFinite(v) ? NUM1.format(v) : "—");
const n2 = (v) => (Number.isFinite(v) ? NUM2.format(v) : "—");

const DEFAULTS = {
  wallHex: DEFAULT_WALL_HEX,
  upholsteryHex: DEFAULT_UPHOLSTERY_HEX,
  goal: "define",
  exposure: "moderate",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const SWATCH_PICKER =
  "h-11 w-14 shrink-0 cursor-pointer rounded-md border border-[var(--border)] bg-[var(--background)] p-1";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => {
    const { value } = event.target;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const result = useMemo(() => matchCurtains(form), [form]);
  const ok = !result.error;
  const top = ok ? result.topPick : null;

  const summary = useMemo(() => {
    if (!ok) return "";
    const lines = [
      "Curtain Colour Matcher",
      `Wall ${result.wallHex} (LRV ${n1(result.wallLrv)}) · Upholstery ${result.upholsteryHex} (LRV ${n1(result.upholsteryLrv)})`,
      `Wall/upholstery hue distance: ${n1(result.hueDistance)}° — ${result.bandLabel}`,
      `Goal: ${result.goalLabel} · ${result.exposureLabel}`,
      "",
      `Best match: ${top.hex} — ${top.label}`,
      `LRV ${n1(top.lrv)}, ${n1(top.lrvGapWall)} points from the wall. ${top.effect}.`,
      "",
      "All options (closest to the goal first):",
    ];
    result.ranked.forEach((s, i) => {
      lines.push(`${i + 1}. ${s.hex}  ${s.label} — LRV ${n1(s.lrv)}, wall gap ${n1(s.lrvGapWall)}`);
    });
    return lines.join("\n");
  }, [ok, result, top]);

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
    setForm(DEFAULTS);
    setCopied(false);
  };

  const swatchStyle = (hex) => ({ backgroundColor: hex });

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Blinds className="h-4 w-4" aria-hidden="true" />
          Soft furnishings
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Curtain Colour Matcher</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter your wall paint and your sofa fabric, say what the curtains should do, and get eight
          colours ranked by how far each one sits from the wall in Light Reflectance Value.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cc-wall">
              Wall colour (hex)
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="cc-wall-picker"
                type="color"
                aria-label="Pick the wall colour"
                className={SWATCH_PICKER}
                value={ok ? result.wallHex : DEFAULT_WALL_HEX}
                onChange={set("wallHex")}
              />
              <input
                id="cc-wall"
                className={INPUT_CLASS}
                type="text"
                spellCheck="false"
                autoComplete="off"
                placeholder={DEFAULT_WALL_HEX}
                value={form.wallHex}
                onChange={set("wallHex")}
              />
            </div>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="cc-sofa">
              Upholstery colour (hex)
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="cc-sofa-picker"
                type="color"
                aria-label="Pick the upholstery colour"
                className={SWATCH_PICKER}
                value={ok ? result.upholsteryHex : DEFAULT_UPHOLSTERY_HEX}
                onChange={set("upholsteryHex")}
              />
              <input
                id="cc-sofa"
                className={INPUT_CLASS}
                type="text"
                spellCheck="false"
                autoComplete="off"
                placeholder={DEFAULT_UPHOLSTERY_HEX}
                value={form.upholsteryHex}
                onChange={set("upholsteryHex")}
              />
            </div>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="cc-goal">
              What should the curtains do?
            </label>
            <select id="cc-goal" className={`mt-2 ${INPUT_CLASS}`} value={form.goal} onChange={set("goal")}>
              {GOALS.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="cc-exposure">
              Sun on this window
            </label>
            <select
              id="cc-exposure"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.exposure}
              onChange={set("exposure")}
            >
              {EXPOSURES.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {result.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-4">
            {ok ? (
              <span
                className="mt-1 block h-14 w-14 shrink-0 rounded-lg ring-1 ring-[var(--border)]"
                style={swatchStyle(top.hex)}
                role="img"
                aria-label={`Suggested curtain colour ${top.hex}`}
              />
            ) : null}
            <div>
              <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
                Best curtain match
              </p>
              <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{ok ? top.hex : "—"}</p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                {ok
                  ? `${top.label} · LRV ${n1(top.lrv)} · ${n1(top.lrvGapWall)} points from the wall`
                  : "Enter both colours as hex values to see suggestions"}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy the curtain colour suggestions"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Wall", ok ? `${result.wallHex} · LRV ${n1(result.wallLrv)} · hue ${n1(result.wallHue)}°` : "—"],
            [
              "Upholstery",
              ok ? `${result.upholsteryHex} · LRV ${n1(result.upholsteryLrv)} · hue ${n1(result.upholsteryHue)}°` : "—",
            ],
            [
              "Wall to upholstery",
              ok ? `${n1(result.hueDistance)}° apart — ${result.bandLabel} · ${n2(result.wallSofaContrast)}:1` : "—",
            ],
            ["What this curtain does", ok ? top.effect : "—"],
            ["Contrast with the wall", ok ? `${n2(top.contrastWithWall)}:1` : "—"],
            ["Contrast with the upholstery", ok ? `${n2(top.contrastWithUpholstery)}:1` : "—"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            {top.note} {result.bandAdvice}
          </p>
        ) : null}

        {ok
          ? result.warnings.map((warning) => (
              <p
                key={warning}
                className="mt-3 flex items-start gap-2 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--warning)]"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{warning}</span>
              </p>
            ))
          : null}
      </section>

      {ok ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">All eight options</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Ranked by how close each lands to the {result.goalTargetGap}-point LRV move your goal
            implies. Under {BLEND_LRV_GAP} points a curtain merges with the wall; over{" "}
            {FOCAL_LRV_GAP} points it takes over the room.
          </p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {result.ranked.map((s) => (
              <li key={s.id} className="rounded-lg border border-[var(--border)] p-3">
                <div className="flex items-start gap-3">
                  <span
                    className="block h-12 w-12 shrink-0 rounded-md ring-1 ring-[var(--border)]"
                    style={swatchStyle(s.hex)}
                    role="img"
                    aria-label={`Swatch of ${s.hex}`}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{s.hex}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">{s.label}</p>
                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                      LRV {n1(s.lrv)} · wall gap {n1(s.lrvGapWall)} · sofa gap {n1(s.lrvGapUpholstery)}
                    </p>
                    {s.fadeRisk ? (
                      <p className="mt-1 text-xs font-semibold text-[var(--warning)]">
                        Fade risk in strong sun
                      </p>
                    ) : null}
                  </div>
                </div>
                <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">{s.note}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {ok ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Numbers side by side</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Option</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Hex</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">LRV</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Wall gap</th>
                  <th scope="col" className="py-2 text-right font-semibold">Sofa gap</th>
                </tr>
              </thead>
              <tbody>
                {result.suggestions.map((s) => (
                  <tr key={s.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{s.label}</td>
                    <td className="py-2 pr-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-2">
                        <span
                          className="inline-block h-4 w-4 rounded-sm ring-1 ring-[var(--border)]"
                          style={swatchStyle(s.hex)}
                          aria-hidden="true"
                        />
                        {s.hex}
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">{n1(s.lrv)}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">{n1(s.lrvGapWall)}</td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">{n1(s.lrvGapUpholstery)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">{result.exposureNote}</p>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Fabric colour on a screen is an approximation — weave, sheen and lining all change how a
        curtain reads in a room. Order swatches, hang them at the window, and look at them in both
        daylight and lamplight before ordering the full drop.
      </p>
    </main>
  );
}
