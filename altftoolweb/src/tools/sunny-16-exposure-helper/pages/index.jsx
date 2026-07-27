"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Sun } from "lucide-react";

import {
  ISO_PRESETS,
  LIGHTING_CONDITIONS,
  STANDARD_APERTURES,
  STANDARD_SHUTTERS,
  computeExposure,
  formatAperture,
  formatShutter,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [conditionId, setConditionId] = useState("sunny");
  const [iso, setIso] = useState("100");
  const [mode, setMode] = useState("aperture");
  const [aperture, setAperture] = useState("16");
  const [shutterSeconds, setShutterSeconds] = useState(String(1 / 125));
  const [compensationStops, setCompensationStops] = useState("0");
  const [copied, setCopied] = useState(false);
  const condition = LIGHTING_CONDITIONS.find((item) => item.id === conditionId) || LIGHTING_CONDITIONS[1];
  const result = useMemo(
    () =>
      computeExposure({
        ev100: condition.ev100,
        iso: Number(iso),
        mode,
        aperture: Number(aperture),
        shutterSeconds: Number(shutterSeconds),
        compensationStops: Number(compensationStops),
      }),
    [condition.ev100, iso, mode, aperture, shutterSeconds, compensationStops],
  );

  const copyResult = async () => {
    if (result.error) return;
    const text = [
      "Sunny 16 Exposure Helper",
      `${condition.label}, ISO ${result.iso}, compensation ${result.compensationStops} stops`,
      `Exact: ${formatAperture(result.exactAperture)} at ${formatShutter(result.exactShutter)}`,
      `Nearest: ${formatAperture(result.snappedAperture)} at ${formatShutter(result.snappedShutter)}`,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setConditionId("sunny"); setIso("100"); setMode("aperture"); setAperture("16"); setShutterSeconds(String(1 / 125)); setCompensationStops("0"); setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Sun className="h-4 w-4" aria-hidden="true" />
          Manual exposure
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Sunny 16 Exposure Helper</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick the light, ISO and either aperture or shutter. Get the exact exposure plus nearest full-stop settings.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold" htmlFor="sunny-condition">Lighting</label>
            <select id="sunny-condition" className={`mt-2 ${INPUT_CLASS}`} value={conditionId} onChange={(event) => setConditionId(event.target.value)}>
              {LIGHTING_CONDITIONS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold" htmlFor="sunny-iso">ISO</label>
            <input id="sunny-iso" className={`mt-2 ${INPUT_CLASS}`} list="sunny-iso-list" type="number" min="6" value={iso} onChange={(event) => setIso(event.target.value)} />
            <datalist id="sunny-iso-list">{ISO_PRESETS.map((item) => <option key={item} value={item} />)}</datalist>
          </div>
          <div>
            <label className="block text-sm font-semibold" htmlFor="sunny-mode">Solve for</label>
            <select id="sunny-mode" className={`mt-2 ${INPUT_CLASS}`} value={mode} onChange={(event) => setMode(event.target.value)}>
              <option value="aperture">Shutter from aperture</option>
              <option value="shutter">Aperture from shutter</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold" htmlFor="sunny-aperture">Aperture</label>
            <input id="sunny-aperture" className={`mt-2 ${INPUT_CLASS}`} list="sunny-ap-list" type="number" min="0.5" step="0.1" value={aperture} onChange={(event) => setAperture(event.target.value)} disabled={mode === "shutter"} />
            <datalist id="sunny-ap-list">{STANDARD_APERTURES.map((item) => <option key={item} value={item} />)}</datalist>
          </div>
          <div>
            <label className="block text-sm font-semibold" htmlFor="sunny-shutter">Shutter seconds</label>
            <input id="sunny-shutter" className={`mt-2 ${INPUT_CLASS}`} list="sunny-sh-list" type="number" min="0.000125" step="0.000125" value={shutterSeconds} onChange={(event) => setShutterSeconds(event.target.value)} disabled={mode === "aperture"} />
            <datalist id="sunny-sh-list">{STANDARD_SHUTTERS.map((item) => <option key={item} value={item} />)}</datalist>
          </div>
          <div>
            <label className="block text-sm font-semibold" htmlFor="sunny-comp">Exposure comp</label>
            <input id="sunny-comp" className={`mt-2 ${INPUT_CLASS}`} type="number" min="-6" max="6" step="0.333" value={compensationStops} onChange={(event) => setCompensationStops(event.target.value)} />
          </div>
        </div>
      </section>

      {result.error ? (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">{result.error}</p>
      ) : (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Set your camera to
          </p>
          <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
            {formatAperture(result.snappedAperture)} · {formatShutter(result.snappedShutter)}
          </p>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">{condition.hint}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            <div className="rounded-lg bg-[var(--surface-soft)] p-3"><p className="text-xs text-[var(--muted-foreground)]">Exact</p><p className="mt-1 font-semibold">{formatAperture(result.exactAperture)} · {formatShutter(result.exactShutter)}</p></div>
            <div className="rounded-lg bg-[var(--surface-soft)] p-3"><p className="text-xs text-[var(--muted-foreground)]">Nearest</p><p className="mt-1 font-semibold">{formatAperture(result.snappedAperture)} · {formatShutter(result.snappedShutter)}</p></div>
            <div className="rounded-lg bg-[var(--surface-soft)] p-3"><p className="text-xs text-[var(--muted-foreground)]">EV at ISO</p><p className="mt-1 font-semibold">{result.evAtIso.toFixed(2)}</p></div>
            <div className="rounded-lg bg-[var(--surface-soft)] p-3"><p className="text-xs text-[var(--muted-foreground)]">Sunny memory</p><p className="mt-1 font-semibold">{formatShutter(result.reciprocalIsoShutter)} at f/16</p></div>
          </div>
          <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
            {[
              ["Exposure value at ISO 100", `EV ${result.ev100}`],
              ["Exposure value at your ISO", `EV ${result.evAtIso.toFixed(2)}`],
              ["Exact shutter from the formula", `${formatShutter(result.exactShutter)} (${result.exactShutter.toFixed(5)} s)`],
              ["Exact aperture from the formula", `f/${result.exactAperture.toFixed(2)}`],
              ["Shutter rounding error", `${Math.abs(result.shutterStopsOff).toFixed(2)} stop`],
              ["Classic 1/ISO shutter", formatShutter(result.reciprocalIsoShutter)],
              ["Exposure compensation applied", `${result.compensationStops} stops`],
            ].map(([label, text]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold">{text}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-5 flex flex-wrap gap-2">
            <button className={GHOST_BTN} type="button" onClick={reset} aria-label="Reset all inputs"><RotateCcw className="h-4 w-4" aria-hidden="true" />Reset</button>
            <button className={PRIMARY_BTN} type="button" onClick={copyResult} aria-label="Copy exposure settings">{copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}{copied ? "Copied!" : "Copy result"}</button>
          </div>

          <h2 className="mt-6 text-base font-semibold">Equivalent exposures</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Every pairing below lets the same amount of light reach the sensor — pick the one whose
            depth of field and motion blur you want.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Aperture</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Shutter (exact)</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Nearest dial</th>
                  <th scope="col" className="py-2 text-right font-semibold">Hand-holdable</th>
                </tr>
              </thead>
              <tbody>
                {result.equivalents.map((row) => (
                  <tr key={row.aperture} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{formatAperture(row.aperture)}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">{formatShutter(row.shutterSeconds)}</td>
                    <td className="py-2 pr-3 text-right">{formatShutter(row.nearestStandard)}</td>
                    <td className={`py-2 text-right font-semibold ${row.handHoldable ? "text-[var(--success)]" : "text-[var(--muted-foreground)]"}`}>
                      {row.handHoldable ? "yes" : "tripod"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-5 text-xs leading-5 text-[var(--muted-foreground)]">
            Sunny 16 assumes a front-lit subject of average reflectance. Back-lit subjects, snow and
            very light or very dark subjects need compensation — use the stops field above, and
            bracket when the shot matters.
          </p>
        </section>
      )}
    </main>
  );
}
