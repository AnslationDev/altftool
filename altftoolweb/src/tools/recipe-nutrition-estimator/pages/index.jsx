"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Apple,
  ArrowDownWideNarrow,
  Bookmark,
  ChefHat,
  Copy,
  Flame,
  Lightbulb,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  Utensils,
  X,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";
import {
  GROUPS,
  INGREDIENTS,
  INGREDIENT_BY_ID,
  RDA,
  STARTER_RECIPE,
  SWAPS,
  defaultGramsFor,
  measuresFor,
} from "../data";

const STORAGE_KEY = "altf:recipe-nutrition-estimator:recipes";

const MACROS = [
  { id: "protein", label: "Protein", unit: "g", tone: "var(--primary)" },
  { id: "carbs", label: "Carbs", unit: "g", tone: "var(--anslation-ds-warning)" },
  { id: "fat", label: "Fat", unit: "g", tone: "var(--anslation-ds-danger)" },
  { id: "fiber", label: "Fibre", unit: "g", tone: "var(--anslation-ds-success)" },
];

let uidSeed = 0;
const uid = () => `r${Date.now().toString(36)}${(uidSeed += 1).toString(36)}`;

const num = (value, digits = 1) =>
  new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(Number.isFinite(value) ? value : 0);

const whole = (value) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
    Number.isFinite(value) ? value : 0
  );

function readRecipes() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeRecipes(recipes) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
  } catch {
    return false;
  }
  return true;
}

function RecipeRow({ row, onIngredient, onGrams, onRemove }) {
  const ingredient = INGREDIENT_BY_ID[row.ingredientId];
  if (!ingredient) return null;
  const measures = measuresFor(ingredient);
  const kcal = (ingredient.kcal * row.grams) / 100;

  return (
    <li className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
      <div className="flex flex-wrap items-end gap-2">
        <label className="min-w-[180px] flex-1">
          <span className="sr-only">Ingredient</span>
          <select
            value={row.ingredientId}
            onChange={(event) => onIngredient(event.target.value)}
            className="h-10 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-2 text-sm font-semibold outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
          >
            {GROUPS.map((group) => (
              <optgroup key={group.id} label={group.label}>
                {INGREDIENTS.filter((item) => item.group === group.id).map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>

        <label>
          <span className="sr-only">Grams of {ingredient.name}</span>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min="0"
              step="1"
              value={row.grams}
              onChange={(event) => onGrams(Number(event.target.value))}
              className="h-10 w-20 rounded-md border border-[var(--border)] bg-[var(--background)] px-2 text-sm outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
            />
            <span className="text-xs font-semibold text-[var(--muted-foreground)]">g</span>
          </div>
        </label>

        <span className="min-w-[64px] text-right text-sm font-semibold text-[var(--primary)]">
          {whole(kcal)} kcal
        </span>

        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${ingredient.name}`}
          className="flex h-10 w-10 items-center justify-center rounded-md border border-[var(--border)] text-[var(--muted-foreground)] transition hover:border-[var(--anslation-ds-danger)] hover:text-[var(--anslation-ds-danger)]"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] font-semibold uppercase text-[var(--muted-foreground)]">
          Tap to add
        </span>
        {measures.map((measure) => (
          <button
            key={measure.label}
            type="button"
            onClick={() => onGrams(Number((row.grams + measure.grams).toFixed(1)))}
            className="rounded-full border border-[var(--border)] bg-[var(--card)] px-2 py-0.5 text-[11px] font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)]"
          >
            {measure.label} ({measure.grams} g)
          </button>
        ))}
        <button
          type="button"
          onClick={() => onGrams(0)}
          className="rounded-full px-2 py-0.5 text-[11px] font-semibold text-[var(--muted-foreground)] underline"
        >
          reset
        </button>
      </div>
    </li>
  );
}

export default function ToolHome() {
  const [name, setName] = useState(STARTER_RECIPE.name);
  const [servings, setServings] = useState(STARTER_RECIPE.servings);
  const [rows, setRows] = useState(STARTER_RECIPE.rows);
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState([]);
  const [hydrated, setHydrated] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setSaved(readRecipes());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writeRecipes(saved);
  }, [hydrated, saved]);

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];
    return INGREDIENTS.filter((item) => item.name.toLowerCase().includes(needle)).slice(0, 8);
  }, [query]);

  const totals = useMemo(() => {
    const base = { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, grams: 0 };
    return rows.reduce((acc, row) => {
      const ingredient = INGREDIENT_BY_ID[row.ingredientId];
      if (!ingredient) return acc;
      const factor = (Number(row.grams) || 0) / 100;
      acc.kcal += ingredient.kcal * factor;
      acc.protein += ingredient.protein * factor;
      acc.carbs += ingredient.carbs * factor;
      acc.fat += ingredient.fat * factor;
      acc.fiber += ingredient.fiber * factor;
      acc.grams += Number(row.grams) || 0;
      return acc;
    }, base);
  }, [rows]);

  const perServing = useMemo(() => {
    const count = Number(servings) > 0 ? Number(servings) : 1;
    return {
      kcal: totals.kcal / count,
      protein: totals.protein / count,
      carbs: totals.carbs / count,
      fat: totals.fat / count,
      fiber: totals.fiber / count,
      grams: totals.grams / count,
    };
  }, [totals, servings]);

  const split = useMemo(() => {
    const proteinCal = totals.protein * 4;
    const carbCal = totals.carbs * 4;
    const fatCal = totals.fat * 9;
    const macroCal = proteinCal + carbCal + fatCal;
    if (macroCal <= 0) return { protein: 0, carbs: 0, fat: 0, macroCal: 0 };
    return {
      protein: (proteinCal / macroCal) * 100,
      carbs: (carbCal / macroCal) * 100,
      fat: (fatCal / macroCal) * 100,
      macroCal,
    };
  }, [totals]);

  const contributors = useMemo(
    () =>
      rows
        .map((row) => {
          const ingredient = INGREDIENT_BY_ID[row.ingredientId];
          if (!ingredient) return null;
          const kcal = (ingredient.kcal * (Number(row.grams) || 0)) / 100;
          return {
            id: row.id,
            ingredientId: ingredient.id,
            name: ingredient.name,
            grams: Number(row.grams) || 0,
            kcal,
            share: totals.kcal > 0 ? (kcal / totals.kcal) * 100 : 0,
          };
        })
        .filter(Boolean)
        .sort((a, b) => b.kcal - a.kcal),
    [rows, totals.kcal]
  );

  const topContributor = contributors[0];
  const topSwaps = topContributor ? SWAPS[topContributor.ingredientId] : null;

  const addIngredient = (ingredient) => {
    setRows((prev) => [
      ...prev,
      { id: uid(), ingredientId: ingredient.id, grams: defaultGramsFor(ingredient) },
    ]);
    setQuery("");
  };

  const patchRow = (id, patch) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const labelText = useMemo(() => {
    const dv = (value, ref) => `${Math.round((value / ref) * 100)}% DV`;
    const line = (key, value, unit, ref, digits = 1) =>
      `${key.padEnd(16)}${`${num(value, digits)} ${unit}`.padStart(12)}${dv(value, ref).padStart(10)}`;
    return [
      name || "Untitled recipe",
      `${servings} serving${Number(servings) === 1 ? "" : "s"} · ${whole(totals.grams)} g total · ${whole(
        perServing.grams
      )} g per serving`,
      "",
      "PER SERVING",
      line("Calories", perServing.kcal, "kcal", RDA.kcal, 0),
      line("Protein", perServing.protein, "g", RDA.protein),
      line("Carbohydrate", perServing.carbs, "g", RDA.carbs),
      line("Fat", perServing.fat, "g", RDA.fat),
      line("Fibre", perServing.fiber, "g", RDA.fiber),
      "",
      "WHOLE RECIPE",
      `Calories        ${whole(totals.kcal)} kcal`,
      `Protein         ${num(totals.protein)} g`,
      `Carbohydrate    ${num(totals.carbs)} g`,
      `Fat             ${num(totals.fat)} g`,
      `Fibre           ${num(totals.fiber)} g`,
      "",
      `Macro split: protein ${Math.round(split.protein)}% · carbs ${Math.round(
        split.carbs
      )}% · fat ${Math.round(split.fat)}% of calories`,
      "",
      "% DV against a 2,000 kcal reference diet. Estimated from raw per-100g values;",
      "cooking losses, oil absorbed and brand differences are not counted.",
      "Estimates for awareness, not medical advice.",
      "ALTFTool Recipe Nutrition Estimator",
    ].join("\n");
  }, [name, servings, totals, perServing, split]);

  const copyLabel = async () => {
    const success = await safeCopyText(labelText);
    if (!success) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const saveRecipe = () => {
    const entry = {
      id: uid(),
      name: name.trim() || "Untitled recipe",
      servings: Number(servings) || 1,
      rows,
      kcal: Math.round(perServing.kcal),
    };
    setSaved((prev) => [entry, ...prev.filter((item) => item.name !== entry.name)].slice(0, 12));
  };

  const loadRecipe = (entry) => {
    setName(entry.name);
    setServings(entry.servings);
    setRows(entry.rows);
  };

  const resetRecipe = () => {
    setName(STARTER_RECIPE.name);
    setServings(STARTER_RECIPE.servings);
    setRows(STARTER_RECIPE.rows);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Apple className="h-4 w-4" />
            Nutrition math
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Recipe Nutrition Estimator</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Build any dish from {INGREDIENTS.length} real ingredients — atta, dals, paneer, ghee,
            vegetables, chicken — and see exactly what a katori of it costs you. Household measures
            included, so you can log &ldquo;1 tbsp ghee&rdquo; without weighing anything.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[1fr_420px]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)] sm:p-6">
            <div className="flex flex-wrap items-end gap-3">
              <label className="min-w-[200px] flex-1">
                <span className="text-sm font-semibold">Recipe name</span>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>
              <label className="w-28">
                <span className="text-sm font-semibold">Servings</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={servings}
                  onChange={(event) => setServings(Number(event.target.value))}
                  className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>
              <button
                type="button"
                onClick={resetRecipe}
                className="btn-secondary h-12 px-3 text-sm"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
            </div>

            <div className="mt-5">
              <label className="block">
                <span className="text-sm font-semibold">Add an ingredient</span>
                <div className="relative mt-2">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
                  <input
                    type="text"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="paneer, atta, ghee, chicken breast..."
                    className="h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] pl-9 pr-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                  />
                </div>
              </label>
              {matches.length > 0 && (
                <div className="mt-2 grid gap-1.5 rounded-md border border-[var(--border)] bg-[var(--background)] p-2">
                  {matches.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => addIngredient(item)}
                      className="flex items-center justify-between gap-3 rounded px-2 py-1.5 text-left text-sm transition hover:bg-[var(--muted)]"
                    >
                      <span className="font-semibold">{item.name}</span>
                      <span className="text-xs text-[var(--muted-foreground)]">
                        {item.kcal} kcal / 100 g
                      </span>
                    </button>
                  ))}
                </div>
              )}
              {query.trim() && matches.length === 0 && (
                <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                  Nothing matched. Try a simpler word, or pick the closest match from a row dropdown.
                </p>
              )}
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold uppercase text-[var(--muted-foreground)]">
                  Ingredients ({rows.length})
                </h2>
                <span className="text-xs text-[var(--muted-foreground)]">
                  {whole(totals.grams)} g total
                </span>
              </div>

              {rows.length === 0 ? (
                <div className="mt-3 rounded-md bg-[var(--muted)] p-8 text-center">
                  <ChefHat className="mx-auto h-8 w-8 text-[var(--muted-foreground)]" />
                  <p className="mt-3 text-sm font-semibold">No ingredients yet</p>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                    Search above to add your first one.
                  </p>
                </div>
              ) : (
                <ul className="mt-3 grid gap-2">
                  {rows.map((row) => (
                    <RecipeRow
                      key={row.id}
                      row={row}
                      onIngredient={(ingredientId) => patchRow(row.id, { ingredientId })}
                      onGrams={(grams) => patchRow(row.id, { grams: Math.max(0, grams) })}
                      onRemove={() => setRows((prev) => prev.filter((item) => item.id !== row.id))}
                    />
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button type="button" onClick={saveRecipe} className="btn-secondary min-h-9 px-3 py-1.5 text-sm">
                <Bookmark className="h-4 w-4" />
                Save recipe
              </button>
              <button type="button" onClick={copyLabel} className="btn-secondary min-h-9 px-3 py-1.5 text-sm">
                <Copy className="h-4 w-4" />
                {copied ? "Copied" : "Copy nutrition label"}
              </button>
            </div>

            {saved.length > 0 && (
              <div className="mt-5 border-t border-[var(--border)] pt-5">
                <h2 className="text-sm font-semibold uppercase text-[var(--muted-foreground)]">
                  Saved recipes
                </h2>
                <div className="mt-3 grid gap-2">
                  {saved.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2"
                    >
                      <button
                        type="button"
                        onClick={() => loadRecipe(entry)}
                        className="flex-1 text-left"
                      >
                        <span className="text-sm font-semibold">{entry.name}</span>
                        <span className="ml-2 text-xs text-[var(--muted-foreground)]">
                          {entry.kcal} kcal / serving · {entry.servings} servings
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSaved((prev) => prev.filter((item) => item.id !== entry.id))}
                        aria-label={`Delete ${entry.name}`}
                        className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border)] text-[var(--muted-foreground)] transition hover:border-[var(--anslation-ds-danger)] hover:text-[var(--anslation-ds-danger)]"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-6">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-[var(--primary)]" />
                <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                  Per serving
                </p>
              </div>
              <div className="mt-3 rounded-lg bg-[var(--muted)] p-5" aria-live="polite">
                <p className="text-5xl font-semibold text-[var(--primary)]">
                  {whole(perServing.kcal)}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  kcal per serving · {whole(perServing.grams)} g on the plate
                </p>
                <p className="mt-3 text-sm font-semibold">
                  {whole(totals.kcal)} kcal for the whole recipe
                </p>
              </div>

              <div className="mt-5">
                <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                  Where the calories come from
                </p>
                <div className="mt-2 flex h-3 w-full overflow-hidden rounded-full bg-[var(--muted)]">
                  <div style={{ width: `${split.protein}%`, background: "var(--primary)" }} />
                  <div style={{ width: `${split.carbs}%`, background: "var(--anslation-ds-warning)" }} />
                  <div style={{ width: `${split.fat}%`, background: "var(--anslation-ds-danger)" }} />
                </div>
                <div className="mt-2 flex flex-wrap gap-3">
                  {[
                    ["Protein", split.protein, "var(--primary)"],
                    ["Carbs", split.carbs, "var(--anslation-ds-warning)"],
                    ["Fat", split.fat, "var(--anslation-ds-danger)"],
                  ].map(([label, value, tone]) => (
                    <span key={label} className="inline-flex items-center gap-1.5 text-xs font-semibold">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: tone }} />
                      {label} {Math.round(value)}%
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
                  Formula: protein and carbs 4 kcal/g, fat 9 kcal/g (Atwater factors), each shown as
                  a share of the total.
                </p>
              </div>

              <div className="mt-5 overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-xs uppercase text-[var(--muted-foreground)]">
                      <th className="py-2 font-semibold">Macro</th>
                      <th className="py-2 text-right font-semibold">Per serving</th>
                      <th className="py-2 text-right font-semibold">Recipe</th>
                      <th className="py-2 text-right font-semibold">% DV</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MACROS.map((macro) => (
                      <tr key={macro.id} className="border-b border-[var(--border)]">
                        <td className="py-2.5">
                          <span className="inline-flex items-center gap-2 font-semibold">
                            <span
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ background: macro.tone }}
                            />
                            {macro.label}
                          </span>
                        </td>
                        <td className="py-2.5 text-right font-semibold">
                          {num(perServing[macro.id])} {macro.unit}
                        </td>
                        <td className="py-2.5 text-right text-[var(--muted-foreground)]">
                          {num(totals[macro.id])} {macro.unit}
                        </td>
                        <td className="py-2.5 text-right text-[var(--muted-foreground)]">
                          {Math.round((perServing[macro.id] / RDA[macro.id]) * 100)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  ["Calories", perServing.kcal, RDA.kcal, "kcal"],
                  ["Protein", perServing.protein, RDA.protein, "g"],
                  ["Fibre", perServing.fiber, RDA.fiber, "g"],
                ].map(([label, value, ref, unit]) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-xs font-semibold text-[var(--muted-foreground)]"
                  >
                    {label}: {whole(value)} {unit}
                    <span className="text-[var(--primary)]">
                      {Math.round((value / ref) * 100)}% of {ref} {unit}
                    </span>
                  </span>
                ))}
              </div>
              <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
                % DV compares one serving with a 2,000 kcal reference diet. Your own needs depend on
                age, size, activity and health.
              </p>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex items-center gap-2">
                <ArrowDownWideNarrow className="h-4 w-4 text-[var(--primary)]" />
                <h2 className="text-sm font-semibold uppercase text-[var(--muted-foreground)]">
                  What is making this heavy
                </h2>
              </div>
              {contributors.length === 0 ? (
                <p className="mt-3 text-sm text-[var(--muted-foreground)]">
                  Add ingredients to see the breakdown.
                </p>
              ) : (
                <ul className="mt-3 grid gap-2.5">
                  {contributors.map((item) => (
                    <li key={item.id}>
                      <div className="flex items-baseline justify-between gap-3 text-sm">
                        <span className="truncate font-semibold">{item.name}</span>
                        <span className="shrink-0 text-[var(--muted-foreground)]">
                          {whole(item.kcal)} kcal · {Math.round(item.share)}%
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[var(--muted)]">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${item.share}%`, background: "var(--primary)" }}
                        />
                      </div>
                      <p className="mt-0.5 text-[11px] text-[var(--muted-foreground)]">
                        {num(item.grams, 0)} g
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {topContributor && topContributor.kcal > 0 && (
              <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-[var(--primary)]" />
                  <h2 className="text-sm font-semibold uppercase text-[var(--muted-foreground)]">
                    Healthier swaps
                  </h2>
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                  <strong className="text-[var(--foreground)]">{topContributor.name}</strong> is the
                  biggest single contributor at {whole(topContributor.kcal)} kcal —{" "}
                  {Math.round(topContributor.share)}% of the recipe.
                </p>
                {topSwaps ? (
                  <ul className="mt-3 grid gap-2.5">
                    {topSwaps.map((swap) => (
                      <li key={swap.label} className="rounded-md bg-[var(--muted)] p-3">
                        <p className="text-sm font-semibold">{swap.label}</p>
                        <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                          {swap.detail}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 rounded-md bg-[var(--muted)] p-3 text-sm leading-6 text-[var(--muted-foreground)]">
                    Nothing to swap here — this one is doing honest work. The usual wins are in the
                    fats and sugars: measure the oil rather than pouring it, and cut sugar by a third.
                  </p>
                )}
              </div>
            )}
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)] sm:p-6">
          <div className="flex items-center gap-2">
            <Utensils className="h-5 w-5 text-[var(--primary)]" />
            <h2 className="text-2xl font-semibold">Reading these numbers honestly</h2>
          </div>
          <div className="tool-compact-grid mt-4">
            {[
              [
                "Raw weights, not cooked",
                "Values are per 100 g of the raw ingredient, which is how you actually measure while cooking. 100 g of raw rice becomes roughly 250 g cooked — the calories do not change, only the water does.",
              ],
              [
                "Oil is the swing factor",
                "The single biggest error in any home estimate is the oil. A free pour is three to four times a measured tablespoon, and every extra tbsp is 115 kcal.",
              ],
              [
                "Deep frying is not counted",
                "Food absorbs oil while frying — a pakoda can take on 10-15% of its weight. Add the oil you think was absorbed as its own row.",
              ],
              [
                "Brands and produce vary",
                "Real food is not a spreadsheet. Fat in milk, the cut of chicken and how ripe a mango is all move the numbers by 10-20%.",
              ],
            ].map(([title, body]) => (
              <div key={title} className="rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
                <p className="text-sm font-semibold">{title}</p>
                <p className="mt-1.5 text-sm leading-6 text-[var(--muted-foreground)]">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--muted)] p-5">
          <h2 className="text-sm font-semibold">A note on these estimates</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
            These are estimates for awareness, not medical advice. The values come from standard
            food-composition references and are close enough for everyday decisions, but they are not
            a lab analysis of your dish. Do not use them to manage a medical condition, and treat any
            single number as a ballpark rather than a fact. If you are managing diabetes, kidney
            disease, pregnancy, an eating disorder or any condition where intake genuinely matters,
            please consult a doctor or a registered dietitian.
          </p>
        </section>
      </div>
    </main>
  );
}
