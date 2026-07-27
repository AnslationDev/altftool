"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Check, Copy, Lightbulb, RotateCcw } from "lucide-react";

import {
  DEFAULT_EFFICACY_LM_W,
  DEFAULT_MAINTENANCE,
  DEFAULT_UTILISATION,
  MOODS,
  ROOM_PROFILES,
  cctScale,
  recommendLighting,
} from "../lib";

const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const n2 = (v) => (Number.isFinite(v) ? NUM2.format(v) : "—");
const n0 = (v) => (Number.isFinite(v) ? NUM0.format(v) : "—");

const DEFAULTS = {
  room: "living",
  mood: "neutral",
  lengthM: "4.5",
  widthM: "3.5",
  target: "ambient",
  utilisation: String(DEFAULT_UTILISATION),
  maintenance: String(DEFAULT_MAINTENANCE),
  lumensPerFixture: "800",
  efficacy: String(DEFAULT_EFFICACY_LM_W),
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

  const result = useMemo(() => recommendLighting(form), [form]);
  const scale = useMemo(() => cctScale(), []);
  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Room Color Temperature Selector",
      `${result.roomLabel} — ${result.moodLabel}`,
      `Recommended: ${n0(result.recommendedCct)} K (${result.bandLabel}), usable band ${n0(result.bandLow)}–${n0(result.bandHigh)} K`,
      `Colour rendering: CRI ${result.criMin} or better`,
      `Target illuminance: ${n0(result.targetLux)} lux over the ${result.targetLabel}`,
      `Room area: ${n2(result.areaM2)} m² (${n0(result.areaSqft)} sqft)`,
      `Lamp lumens needed: ${n0(result.totalLumens)} lm`,
      `Fittings at ${n0(result.lumensPerFixture)} lm each: ${result.fixtures}`,
      `LED load at ${n0(result.efficacy)} lm/W: about ${n0(result.watts)} W`,
    ].join("\n");
  }, [ok, result]);

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

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Lightbulb className="h-4 w-4" aria-hidden="true" />
          Lighting design
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Room Color Temperature Selector</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick a room and the feeling you want, and get the colour temperature in kelvin, the minimum
          CRI, the illuminance target from EN 12464-1, and the lamp lumens and wattage that reach it
          in a room your size.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rt-room">
              Room
            </label>
            <select id="rt-room" className={`mt-2 ${INPUT_CLASS}`} value={form.room} onChange={set("room")}>
              {ROOM_PROFILES.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rt-mood">
              Mood
            </label>
            <select id="rt-mood" className={`mt-2 ${INPUT_CLASS}`} value={form.mood} onChange={set("mood")}>
              {MOODS.map((mood) => (
                <option key={mood.id} value={mood.id}>
                  {mood.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rt-length">
              Room length (m)
            </label>
            <input
              id="rt-length"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={form.lengthM}
              onChange={set("lengthM")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rt-width">
              Room width (m)
            </label>
            <input
              id="rt-width"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={form.widthM}
              onChange={set("widthM")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rt-target">
              Lighting the…
            </label>
            <select id="rt-target" className={`mt-2 ${INPUT_CLASS}`} value={form.target} onChange={set("target")}>
              <option value="ambient">whole room (ambient level)</option>
              <option value="task">task area (desk, worktop, mirror)</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rt-fixture">
              Lumens per fitting
            </label>
            <input
              id="rt-fixture"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="50"
              value={form.lumensPerFixture}
              onChange={set("lumensPerFixture")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rt-util">
              Utilisation factor
            </label>
            <input
              id="rt-util"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.1"
              max="1"
              step="0.05"
              value={form.utilisation}
              onChange={set("utilisation")}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Share of lamp output reaching the working plane. About 0.6 in a light-coloured room.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rt-maint">
              Maintenance factor
            </label>
            <input
              id="rt-maint"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.1"
              max="1"
              step="0.05"
              value={form.maintenance}
              onChange={set("maintenance")}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Allowance for dirt and lumen depreciation. 0.8 is typical for a domestic interior.
            </p>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="rt-efficacy">
              LED efficacy (lumens per watt)
            </label>
            <input
              id="rt-efficacy"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="10"
              max="250"
              step="5"
              value={form.efficacy}
              onChange={set("efficacy")}
            />
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
                className="mt-1 block h-14 w-14 shrink-0 rounded-full ring-1 ring-[var(--border)]"
                style={{ backgroundColor: result.swatchHex }}
                role="img"
                aria-label={`Approximate appearance of ${n0(result.recommendedCct)} kelvin white light`}
              />
            ) : null}
            <div>
              <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
                Recommended colour temperature
              </p>
              <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
                {ok ? `${n0(result.recommendedCct)} K` : "—"}
              </p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                {ok
                  ? `${result.bandLabel} · usable band ${n0(result.bandLow)}–${n0(result.bandHigh)} K · CRI ${result.criMin}+`
                  : "Fix the inputs above to see a recommendation"}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy lighting recommendation"
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
            ["Room area", ok ? `${n2(result.areaM2)} m² · ${n0(result.areaSqft)} sqft` : "—"],
            ["Illuminance target", ok ? `${n0(result.targetLux)} lux over the ${result.targetLabel}` : "—"],
            ["Ambient / task levels for this room", ok ? `${n0(result.ambientLux)} lux / ${n0(result.taskLux)} lux` : "—"],
            ["Lamp lumens needed", ok ? `${n0(result.totalLumens)} lm` : "—"],
            ["Lumens per square metre", ok ? `${n0(result.lumensPerM2)} lm/m²` : "—"],
            [
              "Fittings",
              ok ? `${result.fixtures} × ${n0(result.lumensPerFixture)} lm = ${n0(result.installedLumens)} lm` : "—",
            ],
            ["LED load", ok ? `${n0(result.watts)} W · ${n2(result.wattsPerM2)} W/m²` : "—"],
            ["Minimum colour rendering", ok ? `CRI ${result.criMin}` : "—"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            {result.note}
          </p>
        ) : null}

        {ok && result.kruithofWarning ? (
          <p className="mt-3 flex items-start gap-2 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--warning)]">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{result.kruithofWarning}</span>
          </p>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">What each colour temperature looks like</h2>
        <div className="mt-3 overflow-x-auto">
          <div className="flex min-w-[560px] gap-1">
            {scale.map((entry) => (
              <div key={entry.kelvin} className="flex-1 text-center">
                <span
                  className="block h-10 rounded-sm ring-1 ring-[var(--border)]"
                  style={{ backgroundColor: entry.hex }}
                  role="img"
                  aria-label={`${entry.kelvin} kelvin, ${entry.band}`}
                />
                <span className="mt-1 block text-[10px] text-[var(--muted-foreground)]">{entry.kelvin}K</span>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          Swatches approximate the appearance of a black-body radiator at each temperature. Screens
          cannot reproduce a light source exactly, so treat these as relative rather than absolute.
        </p>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Room-by-room reference</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[460px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Room</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Kelvin</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Ambient</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Task</th>
                <th scope="col" className="py-2 text-right font-semibold">CRI</th>
              </tr>
            </thead>
            <tbody>
              {ROOM_PROFILES.map((profile) => (
                <tr key={profile.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{profile.label}</td>
                  <td className="py-2 pr-3 text-right whitespace-nowrap">
                    {profile.cctMin === profile.cctMax
                      ? `${profile.cctMin} K`
                      : `${profile.cctMin}–${profile.cctMax} K`}
                  </td>
                  <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">{profile.ambientLux} lx</td>
                  <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">{profile.taskLux} lx</td>
                  <td className="py-2 text-right">{profile.criMin}+</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Guidance for design and specification, not a lighting calculation to code. A workplace,
        clinical or public installation should be verified against the applicable standard with a
        proper point-by-point calculation, and emergency lighting is a separate requirement.
      </p>
    </main>
  );
}
