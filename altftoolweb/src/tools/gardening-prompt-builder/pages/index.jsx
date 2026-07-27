"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Sprout } from "lucide-react";
import { CONTAINERS, HARDINESS_TYPES, SUN_LEVELS, buildGardeningPrompt } from "../lib";

const DEFAULTS = {
  crop: "Tomatoes (cordon)",
  zone: "7b",
  container: "bed",
  sun: "full",
  hardiness: "tender",
  bedLengthCm: "240",
  bedWidthCm: "120",
  spacingCm: "45",
  daysToMaturity: "75",
  sowISO: "2026-05-20",
  lastFrostISO: "2026-05-10",
  soil: "Loam over clay, pH 6.5, mulched with compost each spring.",
  goals: "Enough fruit for weekly salads and one batch of passata.",
};

const INPUT =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const HINT = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const result = useMemo(
    () =>
      buildGardeningPrompt({
        crop: form.crop,
        zone: form.zone,
        container: form.container,
        sun: form.sun,
        hardiness: form.hardiness,
        bedLengthCm: form.bedLengthCm === "" ? 0 : Number(form.bedLengthCm),
        bedWidthCm: form.bedWidthCm === "" ? 0 : Number(form.bedWidthCm),
        spacingCm: form.spacingCm === "" ? 0 : Number(form.spacingCm),
        daysToMaturity: form.daysToMaturity === "" ? 0 : Number(form.daysToMaturity),
        sowISO: form.sowISO,
        lastFrostISO: form.lastFrostISO,
        soil: form.soil,
        goals: form.goals,
      }),
    [form],
  );

  const failed = Boolean(result.error);

  const copyResult = async () => {
    if (failed) return;
    try {
      await navigator.clipboard.writeText(result.prompt);
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

  const rows = [
    ["Layout", failed ? DASH : `${result.plantsAlong} along × ${result.plantsAcross} across`],
    ["Bed area", failed ? DASH : `${result.areaSqm} m²`],
    ["Water at 25 mm a week", failed ? DASH : `${result.weeklyWaterLitres} litres`],
    ["First harvest", failed || !result.harvestISO ? DASH : result.harvestISO],
    [
      "Zone minimum temperature",
      failed || !result.zoneBand
        ? DASH
        : `${result.zoneBand.lowF} to ${result.zoneBand.highF} °F (${result.zoneBand.lowC} to ${result.zoneBand.highC} °C)`,
    ],
    ["Prompt length", failed ? DASH : `${result.wordCount} words · ~${result.tokenEstimate} tokens`],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Sprout className="h-4 w-4" aria-hidden="true" />
          Everyday prompts
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Gardening Prompt Builder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter the bed, the spacing and the sowing date. The tool works out how many plants fit, the
          weekly watering and the harvest date, then writes the prompt around those real numbers.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="gd-crop">Crop or plant</label>
            <input id="gd-crop" className={`mt-2 ${INPUT}`} value={form.crop} onChange={set("crop")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="gd-zone">USDA hardiness zone</label>
            <input id="gd-zone" className={`mt-2 ${INPUT}`} value={form.zone} onChange={set("zone")} placeholder="7b" />
            <p className={HINT}>A number from 1 to 13, optionally with a or b. Leave blank if unknown.</p>
          </div>
          <div>
            <label className={LABEL} htmlFor="gd-site">Where it is growing</label>
            <select id="gd-site" className={`mt-2 ${INPUT}`} value={form.container} onChange={set("container")}>
              {Object.entries(CONTAINERS).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="gd-sun">Light</label>
            <select id="gd-sun" className={`mt-2 ${INPUT}`} value={form.sun} onChange={set("sun")}>
              {Object.entries(SUN_LEVELS).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="gd-hardiness">Crop hardiness</label>
            <select id="gd-hardiness" className={`mt-2 ${INPUT}`} value={form.hardiness} onChange={set("hardiness")}>
              {Object.entries(HARDINESS_TYPES).map(([key, value]) => (
                <option key={key} value={key}>{value.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="gd-length">Bed length (cm)</label>
            <input id="gd-length" className={`mt-2 ${INPUT}`} type="number" inputMode="numeric" min="1" max="3000" value={form.bedLengthCm} onChange={set("bedLengthCm")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="gd-width">Bed width (cm)</label>
            <input id="gd-width" className={`mt-2 ${INPUT}`} type="number" inputMode="numeric" min="1" max="3000" value={form.bedWidthCm} onChange={set("bedWidthCm")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="gd-spacing">Plant spacing (cm)</label>
            <input id="gd-spacing" className={`mt-2 ${INPUT}`} type="number" inputMode="numeric" min="1" value={form.spacingCm} onChange={set("spacingCm")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="gd-maturity">Days to maturity</label>
            <input id="gd-maturity" className={`mt-2 ${INPUT}`} type="number" inputMode="numeric" min="1" max="400" value={form.daysToMaturity} onChange={set("daysToMaturity")} />
            <p className={HINT}>Printed on the seed packet.</p>
          </div>
          <div>
            <label className={LABEL} htmlFor="gd-sow">Sowing date</label>
            <input id="gd-sow" className={`mt-2 ${INPUT}`} type="date" value={form.sowISO} onChange={set("sowISO")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="gd-frost">Last spring frost date</label>
            <input id="gd-frost" className={`mt-2 ${INPUT}`} type="date" value={form.lastFrostISO} onChange={set("lastFrostISO")} />
          </div>
        </div>

        <div className="mt-4 grid gap-4">
          <div>
            <label className={LABEL} htmlFor="gd-soil">Soil</label>
            <textarea id="gd-soil" rows={2} className={`mt-2 ${TEXTAREA}`} value={form.soil} onChange={set("soil")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="gd-goals">What you want out of it</label>
            <textarea id="gd-goals" rows={2} className={`mt-2 ${TEXTAREA}`} value={form.goals} onChange={set("goals")} />
          </div>
        </div>
      </section>

      {failed && (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Plants that fit at this spacing
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : result.plantCount}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the highlighted input to generate your prompt."
                : `${form.spacingCm} cm each way in a ${form.bedLengthCm} × ${form.bedWidthCm} cm bed.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} disabled={failed} aria-label="Copy the gardening plan prompt" className={`${GHOST_BTN} disabled:opacity-50`}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy prompt"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!failed && result.frostWarning && (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            {result.frostWarning}
          </p>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Your prompt</h2>
        <div className="mt-3 overflow-x-auto">
          <pre className="min-w-0 whitespace-pre-wrap break-words rounded-md bg-[var(--background)] p-4 text-sm leading-6 text-[var(--foreground)] ring-1 ring-[var(--border)]">
            {failed ? DASH : result.prompt}
          </pre>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Harvest dates from days-to-maturity are an estimate — a cool spring pushes them back. The
        watering figure counts rainfall, so measure what actually falls before topping up. Follow the
        label on any product you apply, and never eat a plant you cannot positively identify.
      </p>
    </main>
  );
}
