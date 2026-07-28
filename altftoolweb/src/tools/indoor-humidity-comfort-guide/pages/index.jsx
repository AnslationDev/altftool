"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Droplets, RotateCcw, TriangleAlert } from "lucide-react";
import { CONCERNS, MOULD_SURFACE_RH, assessIndoorHumidity } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  tempC: "22",
  rh: "58",
  surfaceTempC: "14",
  roomVolumeM3: "40",
  concerns: ["dustmite"],
};

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DASH = "—";

const TONE_CLASS = {
  success: "text-[var(--success)]",
  warning: "text-[var(--danger)]",
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const toggleConcern = (id) => {
    setForm((prev) => ({
      ...prev,
      concerns: prev.concerns.includes(id)
        ? prev.concerns.filter((item) => item !== id)
        : [...prev.concerns, id],
    }));
  };

  const result = useMemo(
    () =>
      assessIndoorHumidity({
        tempC: Number(form.tempC),
        rh: Number(form.rh),
        surfaceTempC: Number(form.surfaceTempC),
        concerns: form.concerns,
        roomVolumeM3: Number(form.roomVolumeM3),
      }),
    [form],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Indoor humidity check",
      `Room: ${NUM.format(result.tempC)} °C at ${NUM.format(result.rh)}% RH, ${NUM.format(result.volume)} m³`,
      `Target band: ${result.targetMin}% to ${result.targetMax}% — ${result.verdict}`,
      `Dew point: ${NUM.format(result.dewPoint)} °C`,
      `Absolute humidity: ${NUM.format(result.absoluteHumidity)} g/m³`,
      `Coldest surface at ${NUM.format(result.surfaceTempC)} °C sits at ${NUM.format(result.surfaceRh)}% RH${result.mouldRisk ? " — above the 80% mould criterion" : ""}`,
      result.condensationRisk ? "Condensation is forming on that surface." : "No condensation on that surface.",
      "",
      "What to do:",
      ...result.actions.map((action) => `- ${action.title}: ${action.detail}`),
    ];
    return lines.join("\n");
  }, [hasError, result]);

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

  const markerPct = hasError ? 0 : Math.max(0, Math.min(100, result.rh));
  const bandLeft = hasError ? 30 : result.targetMin;
  const bandWidth = hasError ? 20 : Math.max(1, result.targetMax - result.targetMin);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Droplets className="h-4 w-4" aria-hidden="true" />
          Indoor air
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Indoor Humidity Comfort Guide
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Set a target humidity band from the EPA and ASHRAE baseline plus whatever matters in
          your home, then see your dew point, the humidity right at the coldest surface, and how
          many grams of water you need to add or take out.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="hum-temp">
              Room temperature (°C)
            </label>
            <input
              id="hum-temp"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="-20"
              max="60"
              step="0.5"
              value={form.tempC}
              onChange={(event) => update("tempC", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hum-rh">
              Relative humidity now (%)
            </label>
            <input
              id="hum-rh"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="100"
              step="1"
              value={form.rh}
              onChange={(event) => update("rh", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hum-surface">
              Coldest surface temperature (°C)
            </label>
            <input
              id="hum-surface"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="-30"
              max="60"
              step="0.5"
              value={form.surfaceTempC}
              onChange={(event) => update("surfaceTempC", event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Usually a window pane or an outside-facing wall behind furniture.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hum-volume">
              Room volume (m³)
            </label>
            <input
              id="hum-volume"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="5000"
              step="1"
              value={form.roomVolumeM3}
              onChange={(event) => update("roomVolumeM3", event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Floor area × ceiling height. A 4 m × 4 m room at 2.5 m is 40 m³.
            </p>
          </div>
        </div>

        <fieldset className="mt-4">
          <legend className="text-sm font-semibold">What matters in this room?</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {CONCERNS.map((concern) => (
              <label
                key={concern.id}
                htmlFor={`concern-${concern.id}`}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              >
                <input
                  id={`concern-${concern.id}`}
                  type="checkbox"
                  checked={form.concerns.includes(concern.id)}
                  onChange={() => toggleConcern(concern.id)}
                  className="h-5 w-5 accent-[var(--primary)]"
                />
                <span>{concern.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Target humidity band
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.targetMin}–${result.targetMax}%`}
            </p>
            <p
              className={`mt-1 text-sm font-semibold ${
                hasError ? "text-[var(--muted-foreground)]" : TONE_CLASS[result.verdictTone]
              }`}
            >
              {hasError
                ? "Fix the inputs above to see your band."
                : `Currently ${NUM.format(result.rh)}% — ${result.verdict.toLowerCase()}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy humidity assessment"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the guide" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-5">
          <div
            className="relative h-3 w-full rounded-full bg-[var(--muted)]"
            role="img"
            aria-label={
              hasError
                ? "Humidity scale"
                : `Current humidity ${NUM.format(result.rh)} percent against a target band of ${result.targetMin} to ${result.targetMax} percent`
            }
          >
            <span
              className="absolute inset-y-0 rounded-full bg-[var(--primary)]/35"
              style={{ left: `${bandLeft}%`, width: `${bandWidth}%` }}
            />
            {!hasError && (
              <span
                className="absolute top-1/2 h-5 w-1.5 -translate-y-1/2 rounded-full bg-[var(--foreground)]"
                style={{ left: `calc(${markerPct}% - 3px)` }}
              />
            )}
          </div>
          <div className="mt-1 flex justify-between text-xs text-[var(--muted-foreground)]">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Dew point", hasError ? DASH : `${NUM.format(result.dewPoint)} °C`],
            ["Absolute humidity", hasError ? DASH : `${NUM.format(result.absoluteHumidity)} g/m³`],
            [
              "Humidity at the coldest surface",
              hasError ? DASH : `${NUM.format(result.surfaceRh)}%`,
            ],
            [
              `Mould criterion (${MOULD_SURFACE_RH}% at the surface)`,
              hasError ? DASH : result.mouldRisk ? "Exceeded" : "Not exceeded",
            ],
            [
              "Condensation on that surface",
              hasError ? DASH : result.condensationRisk ? "Forming now" : "None",
            ],
            [
              result.waterDeltaG >= 0 ? "Water to add" : "Water to remove",
              hasError ? DASH : `${NUM.format(Math.abs(result.waterDeltaG))} g`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (result.mouldRisk || result.condensationRisk) && (
          <div
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-3 text-sm text-[var(--danger)]"
          >
            <p className="flex items-center gap-2 font-semibold">
              <TriangleAlert className="h-4 w-4" aria-hidden="true" />
              Damp risk at the cold surface
            </p>
            <p className="mt-1">
              At {NUM.format(result.surfaceTempC)} °C that surface is at{" "}
              {NUM.format(result.surfaceRh)}% relative humidity. Mould can germinate above{" "}
              {MOULD_SURFACE_RH}% even when the room reading looks acceptable.
            </p>
          </div>
        )}
      </section>

      {!hasError && (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">What to do</h2>
            <ul className="mt-3 space-y-3">
              {result.actions.map((action) => (
                <li
                  key={action.title}
                  className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
                >
                  <p className="text-sm font-semibold">{action.title}</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                    {action.detail}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Why this band</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
              {result.reasons.map((reason) => (
                <li key={reason} className="flex gap-2">
                  <span aria-hidden="true" className="text-[var(--primary)]">
                    •
                  </span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, and not a substitute for a damp survey or medical advice. Persistent
        mould, unexplained damp, or symptoms that worsen at home should be looked at by a
        professional rather than managed with a humidity reading alone.
      </p>
    </main>
  );
}
