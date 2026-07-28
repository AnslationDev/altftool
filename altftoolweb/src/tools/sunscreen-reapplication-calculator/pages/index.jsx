"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Sun } from "lucide-react";
import {
  ACTIVITIES,
  BODY_AREAS,
  SKIN_TYPES,
  WATER_RESISTANCE_OPTIONS,
  computeSunscreenPlan,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const ALL_AREA_IDS = BODY_AREAS.map((area) => area.id);

const DEFAULTS = {
  areas: ["head", "left-arm", "right-arm"],
  spf: "50",
  uvIndex: "9",
  skinTypeId: "iii",
  outdoorMinutes: "180",
  activity: "dry",
  waterResistance: "none",
  bottleMl: "200",
};

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DASH = "—";

const formatMinutes = (mins) => {
  if (mins === null || !Number.isFinite(mins)) return DASH;
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  const rest = mins % 60;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const toggleArea = (id) => {
    setForm((prev) => ({
      ...prev,
      areas: prev.areas.includes(id)
        ? prev.areas.filter((item) => item !== id)
        : [...prev.areas, id],
    }));
  };

  const result = useMemo(
    () =>
      computeSunscreenPlan({
        areas: form.areas,
        spf: Number(form.spf),
        uvIndex: Number(form.uvIndex),
        skinTypeId: form.skinTypeId,
        outdoorMinutes: Number(form.outdoorMinutes),
        activity: form.activity,
        waterResistance: form.waterResistance,
        bottleMl: Number(form.bottleMl),
      }),
    [form],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Sunscreen plan",
      `Apply ${NUM.format(result.mlPerApplication)} ml (${NUM.format(result.teaspoonsPerApplication)} teaspoons) each time`,
      `Areas: ${result.areasSelected.join(", ")}`,
      `Reapply every ${formatMinutes(result.reapplyMinutes)} — ${result.reapplyReason}`,
      `${result.applications} application${result.applications === 1 ? "" : "s"} for ${formatMinutes(result.outdoorMinutes)} outdoors, using about ${NUM.format(result.totalMl)} ml`,
      `UV index ${NUM.format(result.uvIndex)} (${result.uvBandLabel}) — ${result.uvAdvice}`,
    ];
    if (result.unprotectedBurnMinutes !== null) {
      lines.push(
        `Unprotected skin of this type would reach a minimal erythemal dose in about ${formatMinutes(result.unprotectedBurnMinutes)}.`,
      );
    }
    lines.push("", "Timing:");
    for (const step of result.schedule) lines.push(`- ${step.label}`);
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
          <Sun className="h-4 w-4" aria-hidden="true" />
          Sun protection
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Sunscreen Reapplication Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Get the millilitres to put on each uncovered area using the teaspoon rule, the interval
          to reapply at given your activity and the label's water-resistance claim, and a timed
          schedule for the whole outing.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <fieldset>
          <legend className="text-sm font-semibold">Which areas will be uncovered?</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {BODY_AREAS.map((area) => (
              <label
                key={area.id}
                htmlFor={`area-${area.id}`}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              >
                <input
                  id={`area-${area.id}`}
                  type="checkbox"
                  checked={form.areas.includes(area.id)}
                  onChange={() => toggleArea(area.id)}
                  className="h-5 w-5 accent-[var(--primary)]"
                />
                <span>{area.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => update("areas", ALL_AREA_IDS)}
            className={GHOST_BTN}
          >
            Whole body
          </button>
          <button
            type="button"
            onClick={() => update("areas", ["head"])}
            className={GHOST_BTN}
          >
            Face only
          </button>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sun-spf">
              SPF on the bottle
            </label>
            <input
              id="sun-spf"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="2"
              max="100"
              step="1"
              value={form.spf}
              onChange={(event) => update("spf", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sun-uv">
              UV index today
            </label>
            <input
              id="sun-uv"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="20"
              step="0.5"
              value={form.uvIndex}
              onChange={(event) => update("uvIndex", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sun-skin">
              Skin type
            </label>
            <select
              id="sun-skin"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.skinTypeId}
              onChange={(event) => update("skinTypeId", event.target.value)}
            >
              {SKIN_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sun-minutes">
              Time outdoors (minutes)
            </label>
            <input
              id="sun-minutes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="720"
              step="15"
              value={form.outdoorMinutes}
              onChange={(event) => update("outdoorMinutes", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sun-activity">
              What you will be doing
            </label>
            <select
              id="sun-activity"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.activity}
              onChange={(event) => update("activity", event.target.value)}
            >
              {ACTIVITIES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sun-water">
              Water resistance on the label
            </label>
            <select
              id="sun-water"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.waterResistance}
              onChange={(event) => update("waterResistance", event.target.value)}
            >
              {WATER_RESISTANCE_OPTIONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sun-bottle">
              Bottle size (ml, optional)
            </label>
            <input
              id="sun-bottle"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="10"
              value={form.bottleMl}
              onChange={(event) => update("bottleMl", event.target.value)}
            />
          </div>
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
              Per application
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(result.mlPerApplication)} ml`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs above to see your plan."
                : `${NUM.format(result.teaspoonsPerApplication)} level teaspoons across ${result.areasSelected.length} area${result.areasSelected.length === 1 ? "" : "s"}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy sunscreen plan"
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
            <button type="button" onClick={reset} aria-label="Reset the calculator" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Reapply every", hasError ? DASH : formatMinutes(result.reapplyMinutes)],
            [
              "Applications for this outing",
              hasError ? DASH : `${result.applications} (about ${NUM.format(result.totalMl)} ml in total)`,
            ],
            [
              "UV index band",
              hasError ? DASH : `${NUM.format(result.uvIndex)} — ${result.uvBandLabel}`,
            ],
            [
              "Unprotected burn time for this skin type",
              hasError
                ? DASH
                : result.unprotectedBurnMinutes === null
                  ? "No measurable UV"
                  : formatMinutes(result.unprotectedBurnMinutes),
            ],
            [
              `Theoretical SPF ${hasError ? "" : result.spf} protection`,
              hasError
                ? DASH
                : result.theoreticalProtectedMinutes === null
                  ? "Not applicable"
                  : formatMinutes(result.theoreticalProtectedMinutes),
            ],
            [
              "Bottle will cover",
              hasError || !result.bottle
                ? DASH
                : `${result.bottle.applications} application${result.bottle.applications === 1 ? "" : "s"} (${result.bottle.outings} outing${result.bottle.outings === 1 ? "" : "s"} like this)`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6 text-[var(--muted-foreground)]">
            {result.uvAdvice} {result.reapplyReason}
          </p>
        )}
      </section>

      {!hasError && (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Your schedule</h2>
            <ol className="mt-3 space-y-2">
              {result.schedule.map((step) => (
                <li
                  key={step.minute}
                  className="flex items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                >
                  <span className="inline-flex h-7 min-w-14 items-center justify-center rounded-full bg-[var(--muted)] px-2 text-xs font-semibold text-[var(--primary)]">
                    {step.minute < 0 ? `-${Math.abs(step.minute)}` : `+${step.minute}`} min
                  </span>
                  <span>{step.label}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Worth knowing</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
              {result.notes.map((note) => (
                <li key={note} className="flex gap-2">
                  <span aria-hidden="true" className="text-[var(--primary)]">
                    •
                  </span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. The SPF multiplication is a laboratory relationship, not a countdown
        you should ride to the end — reapply on the schedule regardless. Anyone with photosensitivity,
        a history of skin cancer or on photosensitising medication should follow specialist advice.
      </p>
    </main>
  );
}
