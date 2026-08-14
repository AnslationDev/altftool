"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, RotateCcw, UtensilsCrossed } from "lucide-react";

import {
  ALLERGEN_REGIMES,
  DESCRIPTION_WORDS_MAX,
  DESCRIPTION_WORDS_MIN,
  MENU_SECTIONS,
  PRICING_TONES,
  buildMenuPrompt,
} from "../lib";

const DEFAULTS = {
  restaurantName: "The Bombay Canteen",
  cuisine: "Modern Indian, wood fire",
  sectionName: "Mains",
  dishesRaw:
    "Paneer butter masala\nPrawn balchao with pao\nDal makhani\nJackfruit ghee roast\nTandoori broccoli",
  ingredientsRaw:
    "paneer, butter, fresh cream, cashew paste, tomato, kashmiri chilli\nprawn, vinegar, garlic, jaggery\nurad dal, rajma, ghee\njackfruit, curry leaf, coconut oil\nbroccoli, yoghurt, mustard oil, wheat flour",
  regimeId: "eu",
  pricingTone: "plain",
  descriptionWords: "18",
  houseStyle: "Short, ingredient-first, no exclamation marks",
  dietaryLabels: true,
  includeUpsell: false,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState("");
  const copyTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  const setField = (key) => (event) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const result = useMemo(
    () =>
      buildMenuPrompt({
        restaurantName: form.restaurantName,
        cuisine: form.cuisine,
        sectionName: form.sectionName,
        dishesRaw: form.dishesRaw,
        ingredientsRaw: form.ingredientsRaw,
        regimeId: form.regimeId,
        pricingTone: form.pricingTone,
        descriptionWords: toNumber(form.descriptionWords),
        houseStyle: form.houseStyle,
        dietaryLabels: form.dietaryLabels,
        includeUpsell: form.includeUpsell,
      }),
    [form],
  );

  const failed = Boolean(result.error);
  const stat = (value) => (failed ? DASH : NUM.format(value));
  const screen = failed ? null : result.screen;

  const copy = async (key, text) => {
    if (failed || !text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopied(""), 1500);
    } catch {
      setCopied("");
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setCopied("");
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <UtensilsCrossed className="h-4 w-4" aria-hidden="true" />
          Menu copy
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Restaurant Menu Prompt Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Write menu descriptions from a fixed ingredient list, and screen those ingredients against
          the allergen groups your jurisdiction requires you to declare.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Restaurant</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="menu-name">
              Restaurant name
            </label>
            <input
              id="menu-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.restaurantName}
              onChange={setField("restaurantName")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="menu-cuisine">
              Cuisine
            </label>
            <input
              id="menu-cuisine"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.cuisine}
              onChange={setField("cuisine")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="menu-section">
              Menu section
            </label>
            <input
              id="menu-section"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              list="menu-section-options"
              value={form.sectionName}
              onChange={setField("sectionName")}
            />
            <datalist id="menu-section-options">
              {MENU_SECTIONS.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="menu-style">
              House style
            </label>
            <input
              id="menu-style"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.houseStyle}
              onChange={setField("houseStyle")}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Dishes and ingredients</h2>
        <div className="mt-3 grid gap-4">
          <div>
            <label className={LABEL_CLASS} htmlFor="menu-dishes">
              Dishes — one per line
            </label>
            <textarea
              id="menu-dishes"
              rows={5}
              className={`mt-2 ${TEXTAREA_CLASS}`}
              value={form.dishesRaw}
              onChange={setField("dishesRaw")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="menu-ingredients">
              Ingredients — comma or line separated
            </label>
            <textarea
              id="menu-ingredients"
              rows={6}
              className={`mt-2 ${TEXTAREA_CLASS}`}
              value={form.ingredientsRaw}
              onChange={setField("ingredientsRaw")}
            />
            <p className={HINT_CLASS}>
              Include stocks, oils, thickeners and garnishes. Every line is pooled into one shared
              ingredient list for the allergen screen and prompt — it is not kept per dish. The screen
              only sees what you type.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Rules and output</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="menu-regime">
              Allergen declaration regime
            </label>
            <select
              id="menu-regime"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.regimeId}
              onChange={setField("regimeId")}
            >
              {ALLERGEN_REGIMES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            {!failed && <p className={HINT_CLASS}>{screen.regime.citation}</p>}
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="menu-pricing">
              Pricing presentation
            </label>
            <select
              id="menu-pricing"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.pricingTone}
              onChange={setField("pricingTone")}
            >
              {PRICING_TONES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="menu-words">
              Words per description
            </label>
            <input
              id="menu-words"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={DESCRIPTION_WORDS_MIN}
              max={DESCRIPTION_WORDS_MAX}
              step="1"
              value={form.descriptionWords}
              onChange={setField("descriptionWords")}
            />
          </div>
          <div className="flex flex-col justify-center gap-2 sm:col-span-2">
            <label
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold"
              htmlFor="menu-dietary"
            >
              <input
                id="menu-dietary"
                type="checkbox"
                className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
                checked={form.dietaryLabels}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, dietaryLabels: event.target.checked }))
                }
              />
              Ask for dietary markers (V, Ve, GF, N)
            </label>
            <label
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold"
              htmlFor="menu-upsell"
            >
              <input
                id="menu-upsell"
                type="checkbox"
                className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
                checked={form.includeUpsell}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, includeUpsell: event.target.checked }))
                }
              />
              Ask for a pairing suggestion per dish
            </label>
          </div>
        </div>
      </section>

      {failed && (
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
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Allergen groups flagged
            </p>
            <p
              className="mt-1 text-4xl font-semibold text-[var(--primary)]"
              aria-live="polite"
              aria-atomic="true"
            >
              {failed
                ? DASH
                : `${stat(result.stats.allergensDetected)} / ${stat(result.stats.allergensInRegime)}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the inputs to run the screen."
                : `${stat(result.stats.dishCount)} dishes · keyword screen only, not a substitute for a kitchen check`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copy("prompt", result.prompt)}
              aria-label="Copy the generated menu prompt"
              className={PRIMARY_BTN}
              disabled={failed}
            >
              {copied === "prompt" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied === "prompt" ? "Copied!" : "Copy prompt"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={GHOST_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!failed && screen.detected.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <caption className="pb-2 text-left text-sm font-semibold">Matched by keyword</caption>
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Allergen group</th>
                  <th scope="col" className="py-2 font-semibold">Triggered by</th>
                </tr>
              </thead>
              <tbody>
                {screen.detected.map((item) => (
                  <tr key={item.allergen} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{item.allergen}</td>
                    <td className="py-2 text-[var(--muted-foreground)]">{item.matches.join(", ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!failed && screen.notDetected.length > 0 && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            <span className="font-semibold text-[var(--foreground)]">Not matched:</span>{" "}
            {screen.notDetected.join(", ")}. A non-match is not a declaration that a dish is free
            from these.
          </p>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Dishes", failed ? DASH : stat(result.stats.dishCount)],
            ["Ingredient lines", failed ? DASH : stat(result.stats.ingredientCount)],
            ["Words per description", failed ? DASH : stat(result.stats.descriptionWords)],
            ["Total description word budget", failed ? DASH : stat(result.stats.wordBudget)],
            ["Prompt length", failed ? DASH : `${stat(result.stats.promptChars)} characters`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!failed && result.warnings.length > 0 && (
          <ul className="mt-4 space-y-2 text-sm">
            {result.warnings.map((warning) => (
              <li
                key={warning}
                className="rounded-md bg-[var(--muted)] px-3 py-2 text-[var(--muted-foreground)]"
              >
                {warning}
              </li>
            ))}
          </ul>
        )}

        {!failed && (
          <div className="mt-5">
            <h3 className="text-sm font-semibold">Generated prompt</h3>
            <pre
              className="mt-2 max-h-96 overflow-auto whitespace-pre-wrap break-words rounded-md bg-[var(--background)] p-3 text-xs leading-6 text-[var(--foreground)] ring-1 ring-[var(--border)]"
              aria-live="polite"
            >
              {result.prompt}
            </pre>
          </div>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        This keyword screen is an aid to a human allergen check, not a legal compliance tool. It
        cannot see cross-contact in the kitchen, shared fryers, stocks, marinades or supplier recipe
        changes. Allergen declaration is a legal obligation in most jurisdictions — verify every dish
        against your own recipe records and take professional advice on your local rules.
      </p>
    </main>
  );
}
