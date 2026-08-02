"use client";

import { useMemo, useState } from "react";
import { Check, ChefHat, Copy, RotateCcw, Search } from "lucide-react";

import { DIET_FILTERS, findSubstitutes, searchIngredients } from "../lib";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const DASH = "—";

const DEFAULTS = {
  query: "",
  ingredientId: "butter",
  quantity: "1",
  diet: "any",
};

const toNumber = (raw) => {
  const cleaned = String(raw).replace(/,/g, "").trim();
  if (cleaned === "") return NaN;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [query, setQuery] = useState(DEFAULTS.query);
  const [ingredientId, setIngredientId] = useState(DEFAULTS.ingredientId);
  const [quantity, setQuantity] = useState(DEFAULTS.quantity);
  const [diet, setDiet] = useState(DEFAULTS.diet);
  const { copy, isCopied, announcement } = useCopyToClipboard();

  const options = useMemo(() => searchIngredients(query), [query]);
  const allIngredients = useMemo(() => searchIngredients(""), []);

  // The <select> below only ever lists `options`, so if a search term filters the
  // currently-selected ingredient out of that list, fall back to the first ingredient
  // still shown instead of silently computing substitutes for something that no
  // longer appears anywhere on screen. This is a derived value rather than state
  // synced via an effect, so it never diverges from what `options` actually renders,
  // and clearing the search naturally restores the ingredient the user last chose.
  const effectiveIngredientId =
    options.length === 0 || options.some((item) => item.id === ingredientId)
      ? ingredientId
      : options[0].id;

  const result = useMemo(
    () => findSubstitutes({ ingredientId: effectiveIngredientId, quantity: toNumber(quantity), diet }),
    [effectiveIngredientId, quantity, diet],
  );

  const hasError = Boolean(result.error);
  // Used only while the search filters out every ingredient, so the disabled
  // <select> below can still show the currently-selected ingredient's name
  // instead of rendering with zero <option> elements.
  const selectedFallback =
    options.length === 0 ? allIngredients.find((entry) => entry.id === ingredientId) : null;

  const chooseIngredient = (nextId) => {
    setIngredientId(nextId);
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `Substitutes for ${result.quantity} ${result.unit} ${result.ingredient.toLowerCase()}`,
      ...result.matches.map(
        (match) =>
          `- ${match.name}: ${match.amountLabel}${match.preparation ? ` (${match.preparation})` : ""}`,
      ),
    ].join("\n");
  }, [hasError, result]);

  const copyResult = () => copy("list", summary, { label: "Substitution list" });

  const reset = () => {
    setQuery(DEFAULTS.query);
    setIngredientId(DEFAULTS.ingredientId);
    setQuantity(DEFAULTS.quantity);
    setDiet(DEFAULTS.diet);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <ChefHat className="h-4 w-4" aria-hidden="true" />
          Kitchen swaps
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Ingredient Substitute Finder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Every swap carries a real ratio, scaled to the amount your recipe asks for and rounded to
          a fraction a measuring spoon can actually show.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="search">
              Search ingredients
            </label>
            <div className="relative mt-2">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]"
                aria-hidden="true"
              />
              <input
                id="search"
                className={`${INPUT_CLASS} pl-9`}
                type="search"
                placeholder="butter, egg, buttermilk…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            {options.length === 0 && (
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                Nothing matched that. Clear the search to see all ingredients.
              </p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ingredient">
              I need to replace
            </label>
            <select
              id="ingredient"
              className={`mt-2 ${INPUT_CLASS} disabled:opacity-60`}
              value={effectiveIngredientId}
              onChange={(event) => chooseIngredient(event.target.value)}
              disabled={options.length === 0}
            >
              {options.length > 0
                ? options.map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {entry.ingredient}
                    </option>
                  ))
                : selectedFallback && (
                    <option value={selectedFallback.id}>{selectedFallback.ingredient}</option>
                  )}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="quantity">
              Amount the recipe calls for ({hasError ? "…" : result.unit})
            </label>
            <input
              id="quantity"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.25"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
            />
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              Ratios and quantities here are calibrated to this ingredient&apos;s own unit — there is
              no cup/tablespoon/teaspoon conversion, so the amount is always in that unit.
            </p>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="diet">
              Dietary filter
            </label>
            <select
              id="diet"
              className={`mt-2 ${INPUT_CLASS}`}
              value={diet}
              onChange={(event) => setDiet(event.target.value)}
            >
              {DIET_FILTERS.map((filter) => (
                <option key={filter.id} value={filter.id}>
                  {filter.label}
                </option>
              ))}
            </select>
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

      <section
        className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
        aria-live="polite"
        role="status"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Closest replacement
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.best.amountLabel}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Pick an ingredient and an amount to see the swap."
                : `${result.best.name} in place of ${result.quantity} ${result.unit} ${result.ingredient.toLowerCase()}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label={isCopied("list") ? "Copied" : "Copy the substitution list to clipboard"}
              className={GHOST_BTN}
              disabled={hasError}
            >
              {isCopied("list") ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {isCopied("list") ? "Copied!" : "Copy list"}
            </button>
            <span className="sr-only" role="status" aria-live="polite">
              {announcement}
            </span>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Replacing", hasError ? DASH : `${result.quantity} ${result.unit} ${result.ingredient.toLowerCase()}`],
            ["Options that fit the filter", hasError ? DASH : String(result.count)],
            [
              "Ratio used",
              hasError ? DASH : `${result.best.ratio} ${result.best.unit} per ${result.unit}`,
            ],
            [
              "Best for",
              hasError ? DASH : result.best.bestFor.join(", "),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 space-y-4">
          {result.matches.map((match) => (
            <article
              key={match.name}
              className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-base font-semibold">{match.name}</h2>
                <p className="text-lg font-semibold text-[var(--primary)]">{match.amountLabel}</p>
              </div>
              {match.preparation && (
                <p className="mt-2 rounded-md bg-[var(--muted)] px-3 py-2 text-sm">
                  {match.preparation}
                </p>
              )}
              <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{match.note}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {match.bestFor.map((use) => (
                  <span
                    key={use}
                    className="rounded-full border border-[var(--border)] px-2.5 py-1 text-xs font-semibold text-[var(--muted-foreground)]"
                  >
                    {use}
                  </span>
                ))}
                {match.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[var(--muted)] px-2.5 py-1 text-xs font-semibold text-[var(--primary)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Ratios are matched on the property that matters — fat, acid, thickening power or crystal
        size — so a swap that works in a stew may not work in a sponge. Check the &quot;best
        for&quot; tags before committing. Allergy information on packaging always wins over a tag
        here.
      </p>
    </main>
  );
}
