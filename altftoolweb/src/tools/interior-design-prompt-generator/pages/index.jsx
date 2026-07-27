"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Sofa } from "lucide-react";

import {
  BUDGET_FEELS,
  DESIGN_STYLES,
  PALETTES,
  ROOM_TYPES,
  TIMES_OF_DAY,
  buildInteriorPrompt,
} from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  roomId: "living",
  styleId: "japandi",
  paletteId: "warm-neutral",
  budgetId: "mid",
  timeId: "morning",
  lengthM: "4.5",
  widthM: "3.6",
  ceilingM: "2.7",
  mustHave: "",
};

const DASH = "—";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const result = useMemo(
    () =>
      buildInteriorPrompt({
        roomId: form.roomId,
        styleId: form.styleId,
        paletteId: form.paletteId,
        budgetId: form.budgetId,
        timeId: form.timeId,
        lengthM: form.lengthM.trim() === "" ? Number.NaN : Number(form.lengthM),
        widthM: form.widthM.trim() === "" ? Number.NaN : Number(form.widthM),
        ceilingM: form.ceilingM.trim() === "" ? Number.NaN : Number(form.ceilingM),
        mustHave: form.mustHave,
      }),
    [form],
  );

  const hasError = Boolean(result.error);

  const copyText = hasError
    ? ""
    : `${result.prompt}\n\nNegative prompt: ${result.negativePrompt}\n\nRoom plan:\n${result.advice.map((line) => `- ${line}`).join("\n")}`;

  const copyResult = async () => {
    if (!copyText) return;
    try {
      await navigator.clipboard.writeText(copyText);
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

  const specRows = hasError
    ? [
        ["Floor area", DASH],
        ["Ambient light target", DASH],
        ["Suggested rug size", DASH],
        ["Main walkway", DASH],
      ]
    : [
        ["Floor area", `${NUM.format(result.specs.areaM2)} m²`],
        [
          "Ambient light target",
          `${result.specs.lumens.toLocaleString("en-US")} lm (${result.specs.luxTarget} lux)`,
        ],
        [
          "Suggested rug size",
          result.specs.rugFits
            ? `${NUM.format(result.specs.rugLengthM)} m x ${NUM.format(result.specs.rugWidthM)} m`
            : "Room too small for a bordered rug",
        ],
        ["Main walkway", `${NUM.format(result.specs.walkwayM * 100)} cm clear`],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Sofa className="h-4 w-4" aria-hidden="true" />
          Image prompts
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Interior Design Prompt Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Describe a room, style and budget feel as a ready-to-paste AI image prompt — and get the
          room&apos;s lighting target in lumens, a rug size that respects the 50 cm exposed-floor
          rule, and walkway clearance, all computed from your real dimensions.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="id-room">
              Room type
            </label>
            <select id="id-room" className={`mt-2 ${INPUT_CLASS}`} value={form.roomId} onChange={set("roomId")}>
              {ROOM_TYPES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="id-style">
              Design style
            </label>
            <select id="id-style" className={`mt-2 ${INPUT_CLASS}`} value={form.styleId} onChange={set("styleId")}>
              {DESIGN_STYLES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="id-palette">
              Colour palette
            </label>
            <select
              id="id-palette"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.paletteId}
              onChange={set("paletteId")}
            >
              {PALETTES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="id-budget">
              Budget feel
            </label>
            <select id="id-budget" className={`mt-2 ${INPUT_CLASS}`} value={form.budgetId} onChange={set("budgetId")}>
              {BUDGET_FEELS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="id-time">
              Light / time of day
            </label>
            <select id="id-time" className={`mt-2 ${INPUT_CLASS}`} value={form.timeId} onChange={set("timeId")}>
              {TIMES_OF_DAY.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="id-musthave">
              Must-have pieces (optional)
            </label>
            <input
              id="id-musthave"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              maxLength={220}
              placeholder="e.g. a reading nook and a wall of books"
              value={form.mustHave}
              onChange={set("mustHave")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="id-length">
              Room length (m)
            </label>
            <input
              id="id-length"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="30"
              step="0.1"
              value={form.lengthM}
              onChange={set("lengthM")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="id-width">
              Room width (m)
            </label>
            <input
              id="id-width"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="30"
              step="0.1"
              value={form.widthM}
              onChange={set("widthM")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="id-ceiling">
              Ceiling height (m)
            </label>
            <input
              id="id-ceiling"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="2"
              max="8"
              step="0.1"
              value={form.ceilingM}
              onChange={set("ceilingM")}
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
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Generated prompt
            </p>
            <p className="mt-2 whitespace-pre-wrap break-words rounded-md bg-[var(--muted)] p-3 text-sm leading-6">
              {hasError ? DASH : result.prompt}
            </p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Negative prompt
            </p>
            <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">
              {hasError ? DASH : result.negativePrompt}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the interior design prompt, negative prompt and room plan"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy prompt"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs to defaults" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {specRows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Room plan behind the prompt</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--muted-foreground)]">
            {result.advice.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Lighting targets follow published residential illuminance guidance (about 100 lux for
        bedrooms, 150 lux for living spaces, 300 lux for kitchen and desk tasks); the rug and
        walkway figures are standard space-planning conventions. Treat the output as a concept
        brief, not a construction document.
      </p>
    </main>
  );
}
