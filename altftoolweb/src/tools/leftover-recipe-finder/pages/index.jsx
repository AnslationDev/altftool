"use client";

import { useMemo, useState } from "react";
import {
  Ban,
  Check,
  ChefHat,
  Clock,
  Copy,
  Drumstick,
  Egg,
  Flame,
  Leaf,
  Milk,
  Droplet,
  RotateCcw,
  Salad,
  Search,
  Shuffle,
  Soup,
  Sparkles,
  Wheat,
  X,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";
import { ingredients, pantryGroups, recipeIdeas, staples } from "../data";

const groupIcons = {
  grains: Wheat,
  dals: Soup,
  veggies: Leaf,
  dairy: Milk,
  sauces: Droplet,
  nonveg: Drumstick,
};

const tagMeta = {
  veg: { label: "Veg", icon: Leaf, color: "var(--anslation-ds-success)" },
  egg: { label: "Egg", icon: Egg, color: "var(--anslation-ds-warning)" },
  "non-veg": { label: "Non-veg", icon: Drumstick, color: "var(--anslation-ds-danger)" },
};

const labelById = new Map(ingredients.map((item) => [item.id, item.label]));

const presets = [
  {
    label: "Typical Indian fridge",
    items: [
      "cooked-rice",
      "roti",
      "onion",
      "tomato",
      "potato",
      "eggs",
      "curd",
      "garlic",
      "green-chilli",
      "coriander",
      "lemon",
      "bread",
    ],
  },
  {
    label: "Hostel / bachelor pad",
    items: ["bread", "eggs", "noodles", "onion", "potato", "cheese", "ketchup", "milk", "oats", "butter"],
  },
  {
    label: "Sunday leftovers",
    items: ["cooked-rice", "cooked-dal", "roti", "onion", "tomato", "curd", "ghee", "jaggery", "coriander", "paneer"],
  },
];

const formatList = (ids) => ids.map((id) => labelById.get(id) || id).join(", ");

function IngredientChip({ item, active, onToggle }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={() => onToggle(item.id)}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
        active
          ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
          : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--foreground)]"
      }`}
    >
      {active ? <Check className="h-3.5 w-3.5" /> : null}
      {item.label}
    </button>
  );
}

function RecipeCard({ recipe, selected, missing, onAddMissing, onCopy, copied, spotlight }) {
  const TagIcon = tagMeta[recipe.tag].icon;
  const haveAddIns = recipe.optional.filter((id) => selected.has(id));
  const otherAddIns = recipe.optional.filter((id) => !selected.has(id));

  return (
    <article
      className={`rounded-lg border bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)] ${
        spotlight ? "border-[var(--primary)]" : "border-[var(--border)]"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold leading-tight">{recipe.name}</h3>
          <p className="mt-1 text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
            {recipe.cuisine}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onCopy(recipe)}
          className="btn-secondary min-h-9 px-3 py-1.5 text-sm"
        >
          <Copy className="h-4 w-4" />
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span
          className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] px-2.5 py-1 text-xs font-semibold"
          style={{ color: tagMeta[recipe.tag].color }}
        >
          <TagIcon className="h-3.5 w-3.5" />
          {tagMeta[recipe.tag].label}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] px-2.5 py-1 text-xs font-semibold text-[var(--muted-foreground)]">
          <Clock className="h-3.5 w-3.5" />
          {recipe.time} min
        </span>
        {recipe.stove ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] px-2.5 py-1 text-xs font-semibold text-[var(--muted-foreground)]">
            <Flame className="h-3.5 w-3.5" />
            Stove
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] px-2.5 py-1 text-xs font-semibold text-[var(--muted-foreground)]">
            <Ban className="h-3.5 w-3.5" />
            No stove
          </span>
        )}
      </div>

      {missing.length > 0 && (
        <div className="mt-4 rounded-md bg-[var(--muted)] p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            You still need
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {missing.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => onAddMissing(id)}
                title="I actually have this — add it"
                className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-[var(--primary)] px-3 py-1 text-sm font-semibold text-[var(--primary)] transition hover:bg-[var(--background)]"
              >
                {labelById.get(id)}
                <Check className="h-3.5 w-3.5" />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">Core</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {recipe.need.map((id) => {
            const have = selected.has(id);
            return (
              <span
                key={id}
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                  have
                    ? "bg-[var(--muted)] text-[var(--foreground)]"
                    : "border border-dashed border-[var(--border)] text-[var(--muted-foreground)]"
                }`}
              >
                {have ? <Check className="h-3 w-3 text-[var(--primary)]" /> : <X className="h-3 w-3" />}
                {labelById.get(id)}
              </span>
            );
          })}
        </div>
      </div>

      {(haveAddIns.length > 0 || otherAddIns.length > 0) && (
        <div className="mt-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Add-ins {haveAddIns.length > 0 && `(${haveAddIns.length} in your kitchen)`}
          </p>
          <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
            {haveAddIns.length > 0 && (
              <span className="font-semibold text-[var(--foreground)]">{formatList(haveAddIns)}</span>
            )}
            {haveAddIns.length > 0 && otherAddIns.length > 0 && " · "}
            {otherAddIns.length > 0 && formatList(otherAddIns)}
          </p>
        </div>
      )}

      <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">{recipe.method}</p>
    </article>
  );
}

export default function ToolHome() {
  const [selected, setSelected] = useState(() => presets[0].items);
  const [query, setQuery] = useState("");
  const [vegOnly, setVegOnly] = useState(false);
  const [quickOnly, setQuickOnly] = useState(false);
  const [noStoveOnly, setNoStoveOnly] = useState(false);
  const [spotlightId, setSpotlightId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const toggle = (id) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));

  const { ready, almost } = useMemo(() => {
    const passesFilters = (recipe) => {
      if (vegOnly && recipe.tag !== "veg") return false;
      if (quickOnly && recipe.time > 15) return false;
      if (noStoveOnly && recipe.stove) return false;
      return true;
    };

    const scored = recipeIdeas.filter(passesFilters).map((recipe) => {
      const missing = recipe.need.filter((id) => !selectedSet.has(id));
      const bonus = recipe.optional.filter((id) => selectedSet.has(id)).length;
      return { recipe, missing, bonus };
    });

    const sorter = (a, b) => b.bonus - a.bonus || a.recipe.time - b.recipe.time;

    return {
      ready: scored.filter((item) => item.missing.length === 0).sort(sorter),
      almost: scored.filter((item) => item.missing.length === 1).sort(sorter),
    };
  }, [selectedSet, vegOnly, quickOnly, noStoveOnly]);

  const visibleIngredients = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return ingredients;
    return ingredients.filter((item) => item.label.toLowerCase().includes(term));
  }, [query]);

  const spotlight = useMemo(
    () => ready.find((item) => item.recipe.id === spotlightId) || null,
    [ready, spotlightId]
  );

  const surpriseMe = () => {
    if (ready.length === 0) return;
    const pool = ready.filter((item) => item.recipe.id !== spotlightId);
    const source = pool.length > 0 ? pool : ready;
    setSpotlightId(source[Math.floor(Math.random() * source.length)].recipe.id);
  };

  const copyRecipe = async (recipe) => {
    const text = [
      recipe.name,
      `${recipe.cuisine} · ${tagMeta[recipe.tag].label} · ${recipe.time} min · ${
        recipe.stove ? "Needs a stove" : "No stove needed"
      }`,
      "",
      `Core ingredients: ${formatList(recipe.need)}`,
      `Optional add-ins: ${formatList(recipe.optional)}`,
      "",
      recipe.method,
      "",
      staples,
      "",
      "Found with the ALTFTool Leftover Ingredients Recipe Finder",
    ].join("\n");

    const success = await safeCopyText(text);
    if (!success) return;
    setCopiedId(recipe.id);
    setTimeout(() => setCopiedId((current) => (current === recipe.id ? null : current)), 1200);
  };

  const filters = [
    { label: "Veg only", active: vegOnly, toggle: () => setVegOnly((v) => !v), icon: Leaf },
    { label: "Under 15 min", active: quickOnly, toggle: () => setQuickOnly((v) => !v), icon: Clock },
    { label: "No stove", active: noStoveOnly, toggle: () => setNoStoveOnly((v) => !v), icon: Ban },
  ];

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Salad className="h-4 w-4" />
            Zero-waste kitchen
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Leftover Ingredients Recipe Finder</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Tick whatever is actually sitting in your fridge and pantry, and get real dishes you can cook
            tonight — plus the ones you are just one ingredient away from. {recipeIdeas.length} tried recipe
            ideas across Indian and global kitchens.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[390px_1fr]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold">What is in your kitchen?</h2>
              <button
                type="button"
                onClick={() => setSelected([])}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Clear all
              </button>
            </div>

            <label className="mt-3 block">
              <span className="sr-only">Search ingredients</span>
              <span className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search an ingredient"
                  className="h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] pl-9 pr-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </span>
            </label>

            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Start from a preset
              </p>
              <div className="grid gap-2">
                {presets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setSelected(preset.items)}
                    className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-left text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-5">
              {pantryGroups.map((group) => {
                const items = visibleIngredients.filter((item) => item.group === group.id);
                if (items.length === 0) return null;
                const GroupIcon = groupIcons[group.id];
                const count = items.filter((item) => selectedSet.has(item.id)).length;
                return (
                  <div key={group.id}>
                    <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                      <GroupIcon className="h-4 w-4 text-[var(--primary)]" />
                      {group.label}
                      {count > 0 && <span className="text-[var(--primary)]">{count}</span>}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {items.map((item) => (
                        <IngredientChip
                          key={item.id}
                          item={item}
                          active={selectedSet.has(item.id)}
                          onToggle={toggle}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
              {visibleIngredients.length === 0 && (
                <p className="text-sm text-[var(--muted-foreground)]">
                  No ingredient matches &ldquo;{query}&rdquo;.
                </p>
              )}
            </div>

            <p className="mt-5 rounded-md bg-[var(--muted)] p-3 text-xs leading-5 text-[var(--muted-foreground)]">
              {staples}
            </p>
          </div>

          <div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  {filters.map((filter) => {
                    const FilterIcon = filter.icon;
                    return (
                      <button
                        key={filter.label}
                        type="button"
                        aria-pressed={filter.active}
                        onClick={filter.toggle}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold transition ${
                          filter.active
                            ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                            : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                        }`}
                      >
                        <FilterIcon className="h-3.5 w-3.5" />
                        {filter.label}
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={surpriseMe}
                  disabled={ready.length === 0}
                  className="inline-flex min-h-9 items-center gap-2 rounded-md bg-[var(--primary)] px-3 py-1.5 text-sm font-semibold text-[var(--primary-foreground)] transition disabled:opacity-50"
                >
                  <Shuffle className="h-4 w-4" />
                  Surprise me
                </button>
              </div>

              <p className="mt-4 text-sm text-[var(--muted-foreground)]" aria-live="polite">
                <span className="text-2xl font-semibold text-[var(--primary)]">{ready.length}</span>{" "}
                {ready.length === 1 ? "dish" : "dishes"} you can cook right now from{" "}
                <span className="font-semibold text-[var(--foreground)]">{selected.length}</span>{" "}
                {selected.length === 1 ? "ingredient" : "ingredients"} · {almost.length} more are one item
                away.
              </p>
              <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
                Matching rule: a dish is ready when every core ingredient is ticked. Add-ins only improve the
                ranking, they never block a match.
              </p>
            </div>

            {spotlight && (
              <div className="mt-5">
                <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--primary)]">
                  <Sparkles className="h-4 w-4" />
                  Tonight&rsquo;s pick
                </p>
                <RecipeCard
                  recipe={spotlight.recipe}
                  selected={selectedSet}
                  missing={spotlight.missing}
                  onAddMissing={toggle}
                  onCopy={copyRecipe}
                  copied={copiedId === spotlight.recipe.id}
                  spotlight
                />
              </div>
            )}

            {selected.length === 0 ? (
              <div className="mt-5 rounded-lg border border-[var(--border)] bg-[var(--card)] p-8 text-center shadow-[var(--anslation-ds-shadow-sm)]">
                <ChefHat className="mx-auto h-8 w-8 text-[var(--muted-foreground)]" />
                <p className="mt-3 text-sm text-[var(--muted-foreground)]">
                  Tick a few ingredients on the left to see what you can cook.
                </p>
              </div>
            ) : (
              <>
                <div className="mt-6">
                  <h2 className="flex items-center gap-2 text-lg font-semibold">
                    <ChefHat className="h-5 w-5 text-[var(--primary)]" />
                    Cook it now
                    <span className="text-sm font-normal text-[var(--muted-foreground)]">({ready.length})</span>
                  </h2>
                  {ready.length === 0 ? (
                    <p className="mt-3 rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 text-sm text-[var(--muted-foreground)] shadow-[var(--anslation-ds-shadow-sm)]">
                      Nothing is a full match yet. Try ticking a staple like onion, tomato or eggs, relax a
                      filter, or check the one-item-away list below.
                    </p>
                  ) : (
                    <div className="mt-3 grid gap-4 xl:grid-cols-2 2xl:grid-cols-2">
                      {ready.map((item) => (
                        <RecipeCard
                          key={item.recipe.id}
                          recipe={item.recipe}
                          selected={selectedSet}
                          missing={item.missing}
                          onAddMissing={toggle}
                          onCopy={copyRecipe}
                          copied={copiedId === item.recipe.id}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {almost.length > 0 && (
                  <div className="mt-8">
                    <h2 className="flex items-center gap-2 text-lg font-semibold">
                      <Sparkles className="h-5 w-5 text-[var(--primary)]" />
                      One ingredient away
                      <span className="text-sm font-normal text-[var(--muted-foreground)]">
                        ({almost.length})
                      </span>
                    </h2>
                    <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                      Grab the missing item on the way home — or tap it if you already have it.
                    </p>
                    <div className="mt-3 grid gap-4 xl:grid-cols-2 2xl:grid-cols-2">
                      {almost.map((item) => (
                        <RecipeCard
                          key={item.recipe.id}
                          recipe={item.recipe}
                          selected={selectedSet}
                          missing={item.missing}
                          onAddMissing={toggle}
                          onCopy={copyRecipe}
                          copied={copiedId === item.recipe.id}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
