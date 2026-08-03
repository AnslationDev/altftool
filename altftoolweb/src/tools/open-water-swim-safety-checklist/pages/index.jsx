"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, ShieldCheck, TriangleAlert } from "lucide-react";

import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import {
  CHECKLIST_ITEMS,
  assessReadiness,
  checklistGroups,
} from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_CHECKED = [
  "buddy",
  "toldSomeone",
  "towFloat",
  "brightCap",
  "conditions",
  "entryExit",
  "turnaround",
  "warmChange",
];

const DEFAULTS = {
  waterTemp: "18",
  minutes: "30",
  wetsuit: true,
  acclimatised: false,
};

const TONE_TEXT = {
  ok: "text-[var(--success)]",
  warning: "text-[var(--warning)]",
  danger: "text-[var(--danger)]",
};

const TONE_PANEL = {
  ok: "bg-[var(--success-soft)] text-[var(--success)]",
  warning: "bg-[var(--warning-soft)] text-[var(--warning)]",
  danger: "bg-[var(--danger-soft)] text-[var(--danger)]",
};

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [checked, setChecked] = useState(DEFAULT_CHECKED);
  const [waterTemp, setWaterTemp] = useState(DEFAULTS.waterTemp);
  const [minutes, setMinutes] = useState(DEFAULTS.minutes);
  const [wetsuit, setWetsuit] = useState(DEFAULTS.wetsuit);
  const [acclimatised, setAcclimatised] = useState(DEFAULTS.acclimatised);
  const { copy: copyToClipboard, isCopied, announcement, reset: resetCopyState } =
    useCopyToClipboard();

  const result = useMemo(
    () =>
      assessReadiness({
        checkedIds: checked,
        waterTempC: toNumber(waterTemp),
        plannedMinutes: toNumber(minutes),
        wearingWetsuit: wetsuit,
        acclimatised,
      }),
    [checked, waterTemp, minutes, wetsuit, acclimatised],
  );

  const hasError = Boolean(result.error);

  const toggle = (id) => {
    setChecked((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Open Water Swim Safety Check",
      `Verdict: ${result.verdict}`,
      `Score: ${NUM0.format(result.score)}% (${result.tickedCount} of ${result.totalCount} checks ticked)`,
      `Water: ${NUM1.format(result.temperature.waterTempC)} °C — ${result.temperature.bandLabel}`,
      result.temperature.wetsuitRule,
      `Planned time in water: ${NUM0.format(result.plannedMinutes)} min`,
      result.missingCritical.length
        ? `Missing critical: ${result.missingCritical.map((item) => item.label).join("; ")}`
        : "No safety-critical items missing",
      ...result.warnings.map((warning) => `Note: ${warning}`),
    ].join("\n");
  }, [hasError, result]);

  const copyResult = async () => {
    if (!summary) return;
    await copyToClipboard("summary", summary, { label: "Safety check summary" });
  };

  const reset = () => {
    if (
      !window.confirm(
        "Reset the checklist and all inputs back to the starting defaults? This cannot be undone.",
      )
    ) {
      return;
    }
    setChecked(DEFAULT_CHECKED);
    setWaterTemp(DEFAULTS.waterTemp);
    setMinutes(DEFAULTS.minutes);
    setWetsuit(DEFAULTS.wetsuit);
    setAcclimatised(DEFAULTS.acclimatised);
    resetCopyState();
  };

  const clearAll = () => {
    if (!window.confirm("Untick every checklist item? This cannot be undone.")) {
      return;
    }
    setChecked([]);
  };

  const groups = checklistGroups();

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          Open water safety
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Open Water Swim Safety Checklist
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Tick off the checks before you get in. The score weights safety-critical items double and
          reads your water temperature against the limits used in open water competition.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ows-temp">
              Water temperature (°C)
            </label>
            <input
              id="ows-temp"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="-2"
              max="45"
              step="0.5"
              value={waterTemp}
              onChange={(event) => setWaterTemp(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ows-minutes">
              Planned time in the water (minutes)
            </label>
            <input
              id="ows-minutes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="720"
              step="5"
              value={minutes}
              onChange={(event) => setMinutes(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label
            className="flex min-h-11 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-medium"
            htmlFor="ows-wetsuit"
          >
            <input
              id="ows-wetsuit"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={wetsuit}
              onChange={(event) => setWetsuit(event.target.checked)}
            />
            Wearing a wetsuit
          </label>
          <label
            className="flex min-h-11 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-medium"
            htmlFor="ows-acclimatised"
          >
            <input
              id="ows-acclimatised"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={acclimatised}
              onChange={(event) => setAcclimatised(event.target.checked)}
            />
            Cold acclimatised this season
          </label>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div aria-live="polite" role="status">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Readiness score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM0.format(result.score)}%`}
            </p>
            <p
              className={`mt-1 text-sm font-semibold ${
                hasError ? "text-[var(--muted-foreground)]" : TONE_TEXT[result.verdictTone]
              }`}
            >
              {hasError ? "Fix the inputs above to score your checks." : result.verdict}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy open water safety check summary"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {isCopied("summary") ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {isCopied("summary") ? "Copied!" : "Copy summary"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the checklist"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>
        <span className="sr-only" role="status" aria-live="polite">
          {announcement}
        </span>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Checks ticked", hasError ? DASH : `${result.tickedCount} of ${result.totalCount}`],
            [
              "Weighted points",
              hasError ? DASH : `${NUM0.format(result.earned)} of ${NUM0.format(result.possible)}`,
            ],
            [
              "Water temperature band",
              hasError ? DASH : `${NUM1.format(result.temperature.waterTempC)} °C — ${result.temperature.bandLabel}`,
            ],
            [
              "In competition temperature range",
              hasError ? DASH : result.temperature.withinCompetitionRange ? "Yes (16–31 °C)" : "No",
            ],
            [
              "Unacclimatised skins guideline",
              hasError ? DASH : `about ${NUM0.format(result.temperature.novicePlainSwimMinutes)} min`,
            ],
            [
              "Safety-critical items missing",
              hasError ? DASH : NUM0.format(result.missingCritical.length),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <p className={`mt-4 rounded-md px-3 py-2 text-sm ${TONE_PANEL[result.temperature.bandTone]}`}>
            {result.temperature.bandSummary} {result.temperature.wetsuitRule}
          </p>
        )}
      </section>

      {!hasError && (result.missingCritical.length > 0 || result.warnings.length > 0) && (
        <section
          className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
          aria-live="polite"
          role="status"
        >
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <TriangleAlert className="h-4 w-4 text-[var(--warning)]" aria-hidden="true" />
            Before you get in
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            {result.missingCritical.map((item) => (
              <li
                key={item.id}
                className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-[var(--danger)]"
              >
                <span className="font-semibold">{item.label}</span> — {item.why}
              </li>
            ))}
            {result.warnings.map((warning) => (
              <li
                key={warning}
                className="rounded-md bg-[var(--warning-soft)] px-3 py-2 text-[var(--warning)]"
              >
                {warning}
              </li>
            ))}
          </ul>
        </section>
      )}

      {!hasError && result.missingRecommended.length > 0 && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Also worth having</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Not safety-critical on their own, but each one closes a gap in the score above.
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            {result.missingRecommended.map((item) => (
              <li
                key={item.id}
                className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2"
              >
                <span className="font-semibold">{item.label}</span>{" "}
                <span className="text-[var(--muted-foreground)]">— {item.why}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Pre-swim checks</h2>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setChecked(CHECKLIST_ITEMS.map((item) => item.id))}
              className={GHOST_BTN}
            >
              Tick all
            </button>
            <button type="button" onClick={clearAll} className={GHOST_BTN}>
              Clear all
            </button>
          </div>
        </div>

        <div className="mt-4 space-y-5">
          {groups.map((group) => (
            <div key={group.group}>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                {group.group}
              </h3>
              <ul className="mt-2 space-y-2">
                {group.items.map((item) => {
                  const on = checked.includes(item.id);
                  return (
                    <li key={item.id}>
                      <label
                        htmlFor={`ows-item-${item.id}`}
                        className={`flex min-h-11 cursor-pointer items-start gap-3 rounded-md border px-3 py-3 text-sm transition ${
                          on
                            ? "border-[var(--primary)] bg-[var(--muted)]"
                            : "border-[var(--border)] bg-[var(--background)]"
                        }`}
                      >
                        <input
                          id={`ows-item-${item.id}`}
                          type="checkbox"
                          className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]"
                          checked={on}
                          onChange={() => toggle(item.id)}
                        />
                        <span>
                          <span className="font-semibold">{item.label}</span>
                          {item.weight === 2 && (
                            <span className="ml-2 rounded-full bg-[var(--danger-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--danger)]">
                              critical
                            </span>
                          )}
                          <span className="mt-1 block text-[var(--muted-foreground)]">{item.why}</span>
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. This checklist does not replace a lifeguard, a venue risk assessment or
        medical advice. If you have a heart condition, asthma, epilepsy or take medication that
        affects circulation, talk to your doctor before cold water swimming.
      </p>
    </main>
  );
}
