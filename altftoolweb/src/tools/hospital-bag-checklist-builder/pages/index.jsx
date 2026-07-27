"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Luggage, RotateCcw } from "lucide-react";
import {
  CLIMATES,
  DELIVERY_MODES,
  FEEDING_PLANS,
  PACK_BY_WEEK,
  buildHospitalBag,
  checklistToText,
} from "../lib";

const DEFAULTS = {
  deliveryMode: "vaginal",
  stayNights: "2",
  feedingPlan: "breast",
  climate: "mild",
  includePartner: true,
  weeksPregnant: "34",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

export default function ToolHome() {
  const [deliveryMode, setDeliveryMode] = useState(DEFAULTS.deliveryMode);
  const [stayNights, setStayNights] = useState(DEFAULTS.stayNights);
  const [feedingPlan, setFeedingPlan] = useState(DEFAULTS.feedingPlan);
  const [climate, setClimate] = useState(DEFAULTS.climate);
  const [includePartner, setIncludePartner] = useState(DEFAULTS.includePartner);
  const [weeksPregnant, setWeeksPregnant] = useState(DEFAULTS.weeksPregnant);
  const [packed, setPacked] = useState([]);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildHospitalBag({
        deliveryMode,
        stayNights,
        feedingPlan,
        climate,
        includePartner,
        weeksPregnant,
      }),
    [deliveryMode, stayNights, feedingPlan, climate, includePartner, weeksPregnant],
  );

  const hasError = Boolean(result.error);

  const packedCount = useMemo(() => {
    if (hasError) return 0;
    return result.sections.reduce(
      (sum, section) => sum + section.items.filter((item) => packed.includes(item.id)).length,
      0,
    );
  }, [hasError, result, packed]);

  const togglePacked = (id) => {
    setPacked((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id],
    );
  };

  const copyResult = async () => {
    const text = checklistToText(result);
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setDeliveryMode(DEFAULTS.deliveryMode);
    setStayNights(DEFAULTS.stayNights);
    setFeedingPlan(DEFAULTS.feedingPlan);
    setClimate(DEFAULTS.climate);
    setIncludePartner(DEFAULTS.includePartner);
    setWeeksPregnant(DEFAULTS.weeksPregnant);
    setPacked([]);
    setCopied(false);
  };

  const progress = hasError || result.totalItems === 0 ? 0 : (packedCount / result.totalItems) * 100;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Luggage className="h-4 w-4" aria-hidden="true" />
          Pregnancy
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Hospital Bag Checklist Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Answer six questions and get a packing list tailored to your delivery type, feeding plan,
          weather and expected stay — with quantities worked out rather than guessed. Tick items off
          as you pack.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="hb-delivery">
              Expected delivery type
            </label>
            <select
              id="hb-delivery"
              className={`mt-2 ${INPUT_CLASS}`}
              value={deliveryMode}
              onChange={(event) => setDeliveryMode(event.target.value)}
            >
              {DELIVERY_MODES.map((mode) => (
                <option key={mode.id} value={mode.id}>
                  {mode.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hb-nights">
              Expected nights in hospital
            </label>
            <input
              id="hb-nights"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="14"
              step="1"
              value={stayNights}
              onChange={(event) => setStayNights(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hb-feeding">
              Feeding plan
            </label>
            <select
              id="hb-feeding"
              className={`mt-2 ${INPUT_CLASS}`}
              value={feedingPlan}
              onChange={(event) => setFeedingPlan(event.target.value)}
            >
              {FEEDING_PLANS.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hb-climate">
              Weather where you will deliver
            </label>
            <select
              id="hb-climate"
              className={`mt-2 ${INPUT_CLASS}`}
              value={climate}
              onChange={(event) => setClimate(event.target.value)}
            >
              {CLIMATES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hb-weeks">
              Weeks pregnant now
            </label>
            <input
              id="hb-weeks"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="20"
              max="44"
              step="1"
              value={weeksPregnant}
              onChange={(event) => setWeeksPregnant(event.target.value)}
            />
          </div>
          <div className="flex items-end">
            <label
              className="flex min-h-11 w-full items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold"
              htmlFor="hb-partner"
            >
              <input
                id="hb-partner"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={includePartner}
                onChange={(event) => setIncludePartner(event.target.checked)}
              />
              A birth partner is staying
            </label>
          </div>
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
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Items on your list
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.totalItems}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the answers above to build the list."
                : `${result.totalPieces} individual pieces for a ${result.nights}-night stay · ${packedCount} packed`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the hospital bag checklist"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy list"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the builder and clear ticks"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-5">
          <div
            className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
            role="img"
            aria-label={
              hasError ? "No list yet" : `${packedCount} of ${result.totalItems} items packed`
            }
          >
            <span className="block h-full bg-[var(--success)]" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Expected stay", hasError ? DASH : `${result.nights} nights`],
            ["Items still to pack", hasError ? DASH : String(result.totalItems - packedCount)],
            [
              "Pack the bag by",
              hasError
                ? DASH
                : result.packNow
                  ? `Now — you are past week ${PACK_BY_WEEK}`
                  : `Week ${PACK_BY_WEEK} (${result.weeksUntilPackBy} weeks away)`,
            ],
            [
              "Weeks to full term",
              hasError
                ? DASH
                : result.weeksUntilTerm === 0
                  ? "At or past 40 weeks"
                  : `${result.weeksUntilTerm} weeks`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError &&
        result.sections.map((section) => (
          <section
            key={section.id}
            className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
          >
            <h2 className="text-base font-semibold">{section.label}</h2>
            <ul className="mt-3 space-y-2">
              {section.items.map((item) => {
                const inputId = `hb-item-${item.id}`;
                const isPacked = packed.includes(item.id);
                return (
                  <li key={item.id}>
                    <label
                      htmlFor={inputId}
                      className="flex min-h-11 items-start gap-3 rounded-md px-1 py-2 text-sm"
                    >
                      <input
                        id={inputId}
                        type="checkbox"
                        className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]"
                        checked={isPacked}
                        onChange={() => togglePacked(item.id)}
                      />
                      <span>
                        <span
                          className={
                            isPacked
                              ? "font-semibold text-[var(--muted-foreground)] line-through"
                              : "font-semibold"
                          }
                        >
                          {item.label}
                          {item.quantity > 1 ? ` × ${item.quantity}` : ""}
                        </span>
                        {item.note && (
                          <span className="block text-[var(--muted-foreground)]">{item.note}</span>
                        )}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Hospitals differ on what they supply and what they allow — many provide
        nappies, formula or gowns, and some restrict outside food and equipment. Check your
        hospital&apos;s own list and your doctor&apos;s advice before you finish packing.
      </p>
    </main>
  );
}
