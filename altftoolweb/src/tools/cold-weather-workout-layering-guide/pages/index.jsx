"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Snowflake, TriangleAlert } from "lucide-react";
import { INTENSITIES, planColdWeatherKit } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  tempC: "-4",
  windKmh: "18",
  intensity: "easy",
  minutes: "50",
  wet: false,
  asthma: false,
};

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DASH = "—";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const result = useMemo(
    () =>
      planColdWeatherKit({
        tempC: Number(form.tempC),
        windKmh: Number(form.windKmh),
        intensity: form.intensity,
        minutes: Number(form.minutes),
        wet: form.wet,
        asthma: form.asthma,
      }),
    [form],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Cold-weather kit plan",
      `${NUM.format(result.tempC)} °C with ${NUM.format(result.windKmh)} km/h wind → wind chill ${NUM.format(result.windChill)} °C`,
      `${result.intensityLabel} for ${result.minutes} min → dress for ${NUM.format(result.dressingTemp)} °C (${result.bandLabel})`,
      `Frostbite risk: ${result.frostbiteLabel} (${result.frostbiteExposure})`,
      "",
      "Wear:",
      ...result.layers.map((layer) => `- ${layer.zone}: ${layer.item}`),
    ];
    if (result.extras.length > 0) {
      lines.push("", "Also:", ...result.extras.map((extra) => `- ${extra}`));
    }
    if (result.warnings.length > 0) {
      lines.push("", "Watch out:", ...result.warnings.map((warning) => `- ${warning}`));
    }
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

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Snowflake className="h-4 w-4" aria-hidden="true" />
          Winter training
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Cold Weather Workout Layering Guide
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter the temperature, wind and what you are about to do. This applies the 2001 North
          American wind chill index, adds the warmth your own effort generates, and returns the
          layers for each part of the body plus the frostbite exposure time.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cold-temp">
              Air temperature (°C)
            </label>
            <input
              id="cold-temp"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="-60"
              max="40"
              step="1"
              value={form.tempC}
              onChange={(event) => update("tempC", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cold-wind">
              Wind speed (km/h)
            </label>
            <input
              id="cold-wind"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="200"
              step="1"
              value={form.windKmh}
              onChange={(event) => update("windKmh", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cold-intensity">
              What you are doing
            </label>
            <select
              id="cold-intensity"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.intensity}
              onChange={(event) => update("intensity", event.target.value)}
            >
              {INTENSITIES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cold-minutes">
              Session length (minutes)
            </label>
            <input
              id="cold-minutes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="600"
              step="5"
              value={form.minutes}
              onChange={(event) => update("minutes", event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <label
            htmlFor="cold-wet"
            className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
          >
            <input
              id="cold-wet"
              type="checkbox"
              checked={form.wet}
              onChange={(event) => update("wet", event.target.checked)}
              className="h-5 w-5 accent-[var(--primary)]"
            />
            <span>Rain, sleet or wet snow</span>
          </label>
          <label
            htmlFor="cold-asthma"
            className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
          >
            <input
              id="cold-asthma"
              type="checkbox"
              checked={form.asthma}
              onChange={(event) => update("asthma", event.target.checked)}
              className="h-5 w-5 accent-[var(--primary)]"
            />
            <span>Asthma or cold-air wheeze</span>
          </label>
        </div>
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
              Wind chill
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(result.windChill)} °C`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs above to see the plan."
                : `Dress for ${NUM.format(result.dressingTemp)} °C — the ${result.bandLabel.toLowerCase()} band`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy cold weather kit list"
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

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Air temperature", hasError ? DASH : `${NUM.format(result.tempC)} °C`],
            [
              "Wind chill index",
              hasError
                ? DASH
                : result.windChillApplies
                  ? `${NUM.format(result.windChill)} °C`
                  : `${NUM.format(result.windChill)} °C (formula not applicable — too warm or too still)`,
            ],
            [
              "Warmth your effort adds",
              hasError ? DASH : `+${result.warmthBonusC} °C (${result.intensityLabel.toLowerCase()})`,
            ],
            [
              "Penalty for being wet",
              hasError ? DASH : result.wetPenaltyC > 0 ? `−${result.wetPenaltyC} °C` : "None",
            ],
            ["Dressing temperature", hasError ? DASH : `${NUM.format(result.dressingTemp)} °C`],
            ["Frostbite risk", hasError ? DASH : result.frostbiteLabel],
            ["Safe time for exposed skin", hasError ? DASH : result.frostbiteExposure],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6 text-[var(--muted-foreground)]">
            {result.frostbiteDetail}
          </p>
        )}
      </section>

      {!hasError && (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">What to wear</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Zone
                    </th>
                    <th scope="col" className="py-2 font-semibold">
                      Layer
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.layers.map((layer) => (
                    <tr key={layer.zone} className="border-b border-[var(--border)] last:border-0">
                      <th scope="row" className="py-2 pr-3 text-left font-semibold">
                        {layer.zone}
                      </th>
                      <td className="py-2 text-[var(--muted-foreground)]">{layer.item}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {result.extras.length > 0 && (
              <ul className="mt-4 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
                {result.extras.map((extra) => (
                  <li key={extra} className="flex gap-2">
                    <span aria-hidden="true" className="text-[var(--primary)]">
                      •
                    </span>
                    <span>{extra}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {result.warnings.length > 0 && (
            <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
              <div
                role="alert"
                className="rounded-md bg-[var(--danger-soft)] px-3 py-3 text-sm text-[var(--danger)]"
              >
                <p className="flex items-center gap-2 font-semibold">
                  <TriangleAlert className="h-4 w-4" aria-hidden="true" />
                  Before you head out
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {result.warnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              </div>
            </section>
          )}
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. The wind chill index and frostbite times are the published Environment
        Canada figures; the allowance for your own body heat is a coaching rule of thumb, so treat
        the kit list as a starting point and adjust from experience. Anyone with asthma, Raynaud's
        or a heart condition should follow their clinician's advice about training in the cold.
      </p>
    </main>
  );
}
