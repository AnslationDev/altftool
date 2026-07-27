"use client";

import { useMemo, useState } from "react";
import { Camera, Check, Copy, RotateCcw, Search } from "lucide-react";

import {
  BACKUP_RULE_COPIES,
  CATEGORIES,
  LONG_PROMPT_TOKENS,
  PROMPTS,
  computeShootPlan,
  fillPrompt,
  searchPrompts,
} from "../lib";

const COUNT = new Intl.NumberFormat("en-IN");
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const gib = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)} GiB`;
const hrs = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)} h`;

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const FIRST = PROMPTS[0];

const PLAN_DEFAULTS = {
  hours: "8",
  framesPerHour: "250",
  avgRawMb: "30",
  cardRatedGb: "128",
  deliveryRate: "20",
  minutesPerEdit: "1.5",
  copies: String(BACKUP_RULE_COPIES),
};

const exampleValues = (prompt) =>
  prompt ? Object.fromEntries(prompt.variables.map((variable) => [variable.key, variable.placeholder])) : {};

const toNumber = (raw) => {
  const text = String(raw).replace(/,/g, "").trim();
  if (text === "") return NaN;
  return Number(text);
};

export default function ToolHome() {
  const [hours, setHours] = useState(PLAN_DEFAULTS.hours);
  const [framesPerHour, setFramesPerHour] = useState(PLAN_DEFAULTS.framesPerHour);
  const [avgRawMb, setAvgRawMb] = useState(PLAN_DEFAULTS.avgRawMb);
  const [cardRatedGb, setCardRatedGb] = useState(PLAN_DEFAULTS.cardRatedGb);
  const [deliveryRate, setDeliveryRate] = useState(PLAN_DEFAULTS.deliveryRate);
  const [minutesPerEdit, setMinutesPerEdit] = useState(PLAN_DEFAULTS.minutesPerEdit);
  const [copies, setCopies] = useState(PLAN_DEFAULTS.copies);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [activeId, setActiveId] = useState(FIRST.id);
  const [values, setValues] = useState(() => exampleValues(FIRST));
  const [copiedPlan, setCopiedPlan] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const plan = useMemo(
    () =>
      computeShootPlan({
        hours: toNumber(hours),
        framesPerHour: toNumber(framesPerHour),
        avgRawMb: toNumber(avgRawMb),
        cardRatedGb: toNumber(cardRatedGb),
        deliveryRatePercent: toNumber(deliveryRate),
        minutesPerEdit: toNumber(minutesPerEdit),
        backupCopies: toNumber(copies),
      }),
    [hours, framesPerHour, avgRawMb, cardRatedGb, deliveryRate, minutesPerEdit, copies],
  );

  const results = useMemo(() => searchPrompts({ query, category }), [query, category]);
  const active = useMemo(() => PROMPTS.find((prompt) => prompt.id === activeId) || null, [activeId]);
  const filled = useMemo(
    () => fillPrompt({ template: active ? active.template : "", values }),
    [active, values],
  );

  const planFailed = Boolean(plan.error);
  const promptFailed = Boolean(filled.error);

  const planSummary = planFailed
    ? ""
    : [
        "Shoot plan",
        `Frames expected: ${COUNT.format(plan.frames)}`,
        `RAW on the card: ${gib(plan.rawGib)}`,
        `Cards needed: ${COUNT.format(plan.cardsNeeded)} (about ${COUNT.format(plan.framesPerCard)} frames per card)`,
        `Archive at ${COUNT.format(plan.copies)} copies: ${gib(plan.archiveGib)}`,
        `Images delivered: ${COUNT.format(plan.delivered)}`,
        `Editing time: ${hrs(plan.editHours)}`,
      ].join("\n");

  const copyPlan = async () => {
    if (!planSummary) return;
    try {
      await navigator.clipboard.writeText(planSummary);
      setCopiedPlan(true);
      setTimeout(() => setCopiedPlan(false), 1500);
    } catch {
      setCopiedPlan(false);
    }
  };

  const copyPrompt = async () => {
    if (promptFailed) return;
    try {
      await navigator.clipboard.writeText(filled.text);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 1500);
    } catch {
      setCopiedPrompt(false);
    }
  };

  const selectPrompt = (prompt) => {
    setActiveId(prompt.id);
    setValues(exampleValues(prompt));
    setCopiedPrompt(false);
  };

  const updateValue = (key, value) => {
    setValues((previous) => ({ ...previous, [key]: value }));
    setCopiedPrompt(false);
  };

  const reset = () => {
    setHours(PLAN_DEFAULTS.hours);
    setFramesPerHour(PLAN_DEFAULTS.framesPerHour);
    setAvgRawMb(PLAN_DEFAULTS.avgRawMb);
    setCardRatedGb(PLAN_DEFAULTS.cardRatedGb);
    setDeliveryRate(PLAN_DEFAULTS.deliveryRate);
    setMinutesPerEdit(PLAN_DEFAULTS.minutesPerEdit);
    setCopies(PLAN_DEFAULTS.copies);
    setQuery("");
    setCategory("All");
    setActiveId(FIRST.id);
    setValues(exampleValues(FIRST));
    setCopiedPlan(false);
    setCopiedPrompt(false);
  };

  const planRows = planFailed
    ? [
        ["Frames expected", DASH],
        ["RAW written", DASH],
        ["Frames per card", DASH],
        ["Cards to carry", DASH],
        ["Archive across all copies", DASH],
        ["Images delivered", DASH],
        ["Frames culled", DASH],
        ["Editing time", DASH],
      ]
    : [
        ["Frames expected", COUNT.format(plan.frames)],
        ["RAW written", `${gib(plan.rawGib)} (${gib(plan.gibPerHour)} per hour)`],
        [
          "Frames per card",
          `${COUNT.format(plan.framesPerCard)} on a ${NUM2.format(plan.usableCardGib)} GiB usable card, roughly ${NUM.format(plan.minutesPerCard)} minutes of shooting`,
        ],
        ["Cards to carry", COUNT.format(plan.cardsNeeded)],
        ["Archive across all copies", `${gib(plan.archiveGib)} at ${COUNT.format(plan.copies)} copies`],
        ["Images delivered", COUNT.format(plan.delivered)],
        ["Frames culled", COUNT.format(plan.culled)],
        ["Editing time", `${hrs(plan.editHours)} — about ${NUM.format(plan.editDaysAtSix)} days at six focused hours`],
      ];

  const promptRows = promptFailed
    ? [
        ["Prompt", DASH],
        ["Blanks filled", DASH],
        ["Words", DASH],
        ["Estimated tokens", DASH],
      ]
    : [
        ["Prompt", active ? active.title : DASH],
        ["Blanks filled", `${COUNT.format(filled.filledCount)} / ${COUNT.format(filled.totalCount)}`],
        ["Words", COUNT.format(filled.words)],
        [
          "Estimated tokens",
          `${COUNT.format(filled.estimatedTokens)}${filled.isLong ? ` — over ${COUNT.format(LONG_PROMPT_TOKENS)}` : ""}`,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Camera className="h-4 w-4" aria-hidden="true" />
          Event photography
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Event Photographer Prompt Pack</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A shoot planner that turns your shooting rate and RAW size into cards, backup storage and editing hours, plus{" "}
          {COUNT.format(PROMPTS.length)} fill-in-the-blank prompts for shot lists, client emails, gallery copy and the
          conversations nobody enjoys.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Card, storage and edit-time planner</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="photo-hours">
              Shoot length (hours)
            </label>
            <input
              id="photo-hours"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={hours}
              onChange={(event) => setHours(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="photo-rate">
              Frames per hour (all cameras)
            </label>
            <input
              id="photo-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="10"
              value={framesPerHour}
              onChange={(event) => setFramesPerHour(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="photo-raw">
              Average RAW file size (MB)
            </label>
            <input
              id="photo-raw"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={avgRawMb}
              onChange={(event) => setAvgRawMb(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="photo-card">
              Card capacity as printed (GB)
            </label>
            <input
              id="photo-card"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={cardRatedGb}
              onChange={(event) => setCardRatedGb(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="photo-delivery">
              Share of frames delivered (%)
            </label>
            <input
              id="photo-delivery"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="1"
              value={deliveryRate}
              onChange={(event) => setDeliveryRate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="photo-minutes">
              Editing minutes per delivered image
            </label>
            <input
              id="photo-minutes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.25"
              value={minutesPerEdit}
              onChange={(event) => setMinutesPerEdit(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="photo-copies">
              Copies you keep (3-2-1 rule)
            </label>
            <input
              id="photo-copies"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="6"
              step="1"
              value={copies}
              onChange={(event) => setCopies(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Cards to carry
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {planFailed ? DASH : COUNT.format(plan.cardsNeeded)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {planFailed
                ? "Fix the input above to see the plan."
                : `${COUNT.format(plan.frames)} frames, ${gib(plan.rawGib)} of RAW`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyPlan}
              aria-label="Copy the shoot plan to the clipboard"
              className={GHOST_BTN}
              disabled={planFailed}
            >
              {copiedPlan ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copiedPlan ? "Copied!" : "Copy plan"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the planner and the prompt" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {planFailed && (
          <p role="alert" className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            {plan.error}
          </p>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {planRows.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold break-words">{value}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
          Card capacity is printed in decimal gigabytes but reported by your computer in binary gibibytes, so a 128 GB
          card shows about 119 GiB before formatting. Carry spare cards rather than filling the last one: the card in the
          camera is not a backup until it has been copied twice.
        </p>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Prompt library</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="photo-search">
              Search prompts
            </label>
            <div className="relative mt-2">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]"
                aria-hidden="true"
              />
              <input
                id="photo-search"
                type="search"
                className={`${INPUT_CLASS} pl-9`}
                placeholder="shot list, delivery, pricing, weather"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="photo-category">
              Category
            </label>
            <select
              id="photo-category"
              className={`mt-2 ${INPUT_CLASS}`}
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="All">All categories</option>
              {CATEGORIES.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="mt-4 text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
          {COUNT.format(results.length)} of {COUNT.format(PROMPTS.length)} prompts
        </p>

        {results.length === 0 ? (
          <p className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            No prompt matches that search. Try a shorter word or set the category back to all.
          </p>
        ) : (
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {results.map((prompt) => {
              const isActive = prompt.id === activeId;
              return (
                <li key={prompt.id}>
                  <button
                    type="button"
                    onClick={() => selectPrompt(prompt)}
                    aria-pressed={isActive}
                    className={`flex min-h-11 w-full flex-col items-start gap-1 rounded-lg border p-3 text-left transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                      isActive
                        ? "border-[var(--primary)] bg-[var(--primary-soft)]"
                        : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]"
                    }`}
                  >
                    <span className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
                      {prompt.category}
                    </span>
                    <span className="text-sm font-semibold">{prompt.title}</span>
                    <span className="text-xs leading-5 text-[var(--muted-foreground)]">{prompt.goal}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {active && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Fill in the blanks</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">{active.tip}</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {active.variables.map((variable) => (
              <div key={variable.key}>
                <label className={LABEL_CLASS} htmlFor={`photo-var-${variable.key}`}>
                  {variable.label}
                </label>
                <input
                  id={`photo-var-${variable.key}`}
                  type="text"
                  className={`mt-2 ${INPUT_CLASS}`}
                  placeholder={variable.placeholder}
                  value={values[variable.key] ?? ""}
                  onChange={(event) => updateValue(variable.key, event.target.value)}
                />
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyPrompt}
              aria-label="Copy the finished prompt to the clipboard"
              className={GHOST_BTN}
              disabled={promptFailed}
            >
              {copiedPrompt ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copiedPrompt ? "Copied!" : "Copy prompt"}
            </button>
            <button
              type="button"
              onClick={() => setValues(Object.fromEntries(active.variables.map((variable) => [variable.key, ""])))}
              className={GHOST_BTN}
            >
              Clear fields
            </button>
          </div>

          {promptFailed && (
            <p role="alert" className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
              {filled.error}
            </p>
          )}

          {!promptFailed && filled.missing.length > 0 && (
            <p role="status" className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm font-medium text-[var(--warning)]">
              Still blank: {filled.missing.join(", ")}. They stay visible as {"{{placeholders}}"} in the copied text.
            </p>
          )}

          <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
            {promptRows.map(([label, value]) => (
              <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold break-words">{value}</dd>
              </div>
            ))}
          </dl>

          {!promptFailed && (
            <div className="mt-5 overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
              <pre className="text-sm leading-6 break-words whitespace-pre-wrap text-[var(--foreground)]">
                {filled.text}
              </pre>
            </div>
          )}
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Planner figures are estimates from your own inputs — real RAW sizes vary with ISO, subject detail and
        compression, and a burst-heavy hour can double the frame count. Everything runs in your browser.
      </p>
    </main>
  );
}
