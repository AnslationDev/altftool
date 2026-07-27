"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Check, Copy, PaintRoller, RotateCcw } from "lucide-react";

import {
  DEFAULT_BASE_HEX,
  MIN_LRV_GAP,
  ORIENTATIONS,
  ROOM_SIZES,
  suggestAccentWall,
} from "../lib";

const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const n1 = (v) => (Number.isFinite(v) ? NUM1.format(v) : "—");
const n2 = (v) => (Number.isFinite(v) ? NUM2.format(v) : "—");

const DEFAULTS = {
  baseHex: DEFAULT_BASE_HEX,
  orientation: "north",
  roomSize: "medium",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
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

  const result = useMemo(() => suggestAccentWall(form), [form]);
  const ok = !result.error;
  const top = ok ? result.topPick : null;

  const summary = useMemo(() => {
    if (!ok) return "";
    const lines = [
      "Accent Wall Colour Suggester",
      `Existing wall: ${result.baseHex} — LRV ${n1(result.baseLrv)}, hue ${n1(result.baseHue)}°`,
      `${result.orientationLabel} · ${result.roomSizeLabel}`,
      `Accent should go ${result.direction} than the existing wall.`,
      "",
      `Best match: ${top.label} — ${top.hex} (LRV ${n1(top.lrv)}, ${n1(top.lrvGap)} LRV points from the wall)`,
      "",
      "All suggestions:",
    ];
    result.ranked.forEach((s, i) => {
      lines.push(
        `${i + 1}. ${s.hex}  ${s.label} — LRV ${n1(s.lrv)}, gap ${n1(s.lrvGap)}, trim ${s.trimHex}${s.readsAsAccent ? "" : "  (too close to the existing wall)"}`,
      );
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
          <PaintRoller className="h-4 w-4" aria-hidden="true" />
          Paint planning
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Accent Wall Colour Suggester</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Give it the colour already on your walls and it returns eight accent shades from the
          standard colour-wheel harmonies, each with its Light Reflectance Value, the gap from your
          existing wall, and the trim colour that stays legible on it.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="aw-base">
              Existing wall colour (hex)
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="aw-base-picker"
                type="color"
                aria-label="Pick the existing wall colour"
                className="h-11 w-14 shrink-0 cursor-pointer rounded-md border border-[var(--border)] bg-[var(--background)] p-1"
                value={ok ? result.baseHex : DEFAULT_BASE_HEX}
                onChange={set("baseHex")}
              />
              <input
                id="aw-base"
                className={INPUT_CLASS}
                type="text"
                inputMode="text"
                spellCheck="false"
                autoComplete="off"
                placeholder={DEFAULT_BASE_HEX}
                value={form.baseHex}
                onChange={set("baseHex")}
              />
            </div>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Most paint brands publish a hex value for each colour, or photograph the wall in
              daylight and read the hex from the photo.
            </p>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="aw-orientation">
              Which way the room faces
            </label>
            <select
              id="aw-orientation"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.orientation}
              onChange={set("orientation")}
            >
              {ORIENTATIONS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="aw-size">
              Room size
            </label>
            <select
              id="aw-size"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.roomSize}
              onChange={set("roomSize")}
            >
              {ROOM_SIZES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
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
                aria-label={`Suggested accent colour ${top.hex}`}
              />
            ) : null}
            <div>
              <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
                Best accent match
              </p>
              <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{ok ? top.hex : "—"}</p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                {ok
                  ? `${top.label} · LRV ${n1(top.lrv)} · ${n1(top.lrvGap)} LRV points from your wall`
                  : "Enter a valid hex colour to see suggestions"}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy the accent colour suggestions"
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
            ["Existing wall", ok ? `${result.baseHex} · LRV ${n1(result.baseLrv)}` : "—"],
            [
              "Existing wall in HSL",
              ok ? `${n1(result.baseHue)}° · ${n1(result.baseSaturation)}% · ${n1(result.baseLightness)}%` : "—",
            ],
            ["Accent should go", ok ? `${result.direction} than the existing wall` : "—"],
            ["Contrast with the wall", ok ? `${n2(top.contrastWithBase)}:1` : "—"],
            [
              "Trim and lettering",
              ok
                ? `${top.trimIsWhite ? "White" : "Near-black"} — ${n2(top.trimContrast)}:1 ${top.trimPassesAA ? "(passes WCAG AA)" : "(below WCAG AA 4.5:1)"}`
                : "—",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            {top.note}
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
          <h2 className="text-base font-semibold">All eight suggestions</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Ranked best first. A gap of at least {MIN_LRV_GAP} LRV points is what makes an accent
            read as a choice rather than a touch-up.
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
                      LRV {n1(s.lrv)} · gap {n1(s.lrvGap)} · {n2(s.contrastWithBase)}:1
                    </p>
                    <p
                      className={`mt-1 text-xs font-semibold ${s.readsAsAccent ? "text-[var(--success)]" : "text-[var(--warning)]"}`}
                    >
                      {s.readsAsAccent ? "Reads as an accent" : `Under ${MIN_LRV_GAP} LRV points — too close`}
                    </p>
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
                  <th scope="col" className="py-2 pr-3 font-semibold">Harmony</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Hex</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">LRV</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Gap</th>
                  <th scope="col" className="py-2 text-right font-semibold">Trim</th>
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
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">{n1(s.lrvGap)}</td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">
                      {s.trimIsWhite ? "White" : "Near-black"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.orientationNote} {result.roomSizeNote}
          </p>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Screens cannot show paint accurately — colour depends on sheen, undercoat and the light in
        the room. Treat these as a shortlist, buy sample pots, and paint a large patch on the actual
        wall before committing.
      </p>
    </main>
  );
}
