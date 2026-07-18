"use client";

import { useMemo, useState } from "react";
import { ArrowRightLeft, Copy, Info, Lightbulb, RotateCcw, Scale, Wheat } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";
import { ingredientGroups, ingredients, popularIds } from "../data";

const cupStandards = [
  { id: "us", label: "US cup", ml: 240, hint: "240 ml — American blogs, King Arthur, NYT Cooking" },
  { id: "metric", label: "Metric cup", ml: 250, hint: "250 ml — Australian, Indian and EU recipe books" },
];

const volumeUnits = [
  { id: "cup", label: "cups", short: "cup" },
  { id: "tbsp", label: "tablespoons", short: "tbsp" },
  { id: "tsp", label: "teaspoons", short: "tsp" },
  { id: "ml", label: "millilitres", short: "ml" },
  { id: "floz", label: "fluid ounces", short: "fl oz" },
];

const weightUnits = [
  { id: "g", label: "grams", short: "g", perGram: 1 },
  { id: "oz", label: "ounces", short: "oz", perGram: 28.349523125 },
];

const chartRows = [
  { label: "1 tsp", cups: 0, tsp: 1 },
  { label: "1 tbsp", cups: 0, tsp: 3 },
  { label: "¼ cup", cups: 0.25 },
  { label: "⅓ cup", cups: 1 / 3 },
  { label: "½ cup", cups: 0.5 },
  { label: "⅔ cup", cups: 2 / 3 },
  { label: "¾ cup", cups: 0.75 },
  { label: "1 cup", cups: 1 },
];

const fractionSteps = [
  [0, ""],
  [0.125, "⅛"],
  [0.25, "¼"],
  [1 / 3, "⅓"],
  [0.375, "⅜"],
  [0.5, "½"],
  [0.625, "⅝"],
  [2 / 3, "⅔"],
  [0.75, "¾"],
  [0.875, "⅞"],
  [1, ""],
];

const formatNumber = (value, digits = 2) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: digits }).format(
    Number.isFinite(value) ? value : 0
  );

const trimNumber = (value, digits = 2) => {
  if (!Number.isFinite(value) || value === 0) return "";
  return String(Number(value.toFixed(digits)));
};

const volumeUnitMl = (unitId, cupMl) => {
  if (unitId === "cup") return cupMl;
  if (unitId === "tbsp") return 15;
  if (unitId === "tsp") return 5;
  if (unitId === "floz") return 29.5735295625;
  return 1;
};

const weightUnitGrams = (unitId) =>
  weightUnits.find((item) => item.id === unitId)?.perGram || 1;

const toFriendly = (value) => {
  if (!Number.isFinite(value) || value <= 0) return "0";
  const whole = Math.floor(value);
  const frac = value - whole;
  let best = fractionSteps[0];
  let bestDiff = Infinity;
  fractionSteps.forEach((step) => {
    const diff = Math.abs(frac - step[0]);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = step;
    }
  });
  if (bestDiff > 0.045) return formatNumber(value, 2);
  const carry = best[0] === 1 ? 1 : 0;
  const wholePart = whole + carry;
  const symbol = carry ? "" : best[1];
  if (!symbol) return String(wholePart);
  if (wholePart === 0) return symbol;
  return `${wholePart} ${symbol}`;
};

export default function ToolHome() {
  const [ingredientId, setIngredientId] = useState("flour-ap");
  const [cupStandard, setCupStandard] = useState("us");
  const [source, setSource] = useState("volume");
  const [volumeInput, setVolumeInput] = useState("1");
  const [weightInput, setWeightInput] = useState("120");
  const [volumeUnit, setVolumeUnit] = useState("cup");
  const [weightUnit, setWeightUnit] = useState("g");
  const [copied, setCopied] = useState(false);

  const ingredient = useMemo(
    () => ingredients.find((item) => item.id === ingredientId) || ingredients[0],
    [ingredientId]
  );

  const cup = useMemo(
    () => cupStandards.find((item) => item.id === cupStandard) || cupStandards[0],
    [cupStandard]
  );

  const density = ingredient.gramsPerCup / 240;

  const measured = useMemo(() => {
    if (source === "volume") {
      const amount = Number(volumeInput);
      const ml = (Number.isFinite(amount) ? amount : 0) * volumeUnitMl(volumeUnit, cup.ml);
      return { ml, grams: ml * density };
    }
    const amount = Number(weightInput);
    const grams = (Number.isFinite(amount) ? amount : 0) * weightUnitGrams(weightUnit);
    return { ml: density > 0 ? grams / density : 0, grams };
  }, [source, volumeInput, weightInput, volumeUnit, weightUnit, cup.ml, density]);

  const volumeValue =
    source === "volume" ? volumeInput : trimNumber(measured.ml / volumeUnitMl(volumeUnit, cup.ml), 3);
  const weightValue =
    source === "weight" ? weightInput : trimNumber(measured.grams / weightUnitGrams(weightUnit), 2);

  const cupsEquivalent = measured.ml / cup.ml;
  const spoonedPerCup = density * cup.ml;
  const scoopedPerCup = ingredient.scoopedGramsPerCup
    ? (ingredient.scoopedGramsPerCup / 240) * cup.ml
    : null;

  const volumeShort = volumeUnits.find((item) => item.id === volumeUnit)?.short || "";
  const weightShort = weightUnits.find((item) => item.id === weightUnit)?.short || "";

  const report = useMemo(
    () =>
      [
        "Cups to Grams Conversion",
        `Ingredient: ${ingredient.name}`,
        `Cup standard: ${cup.label} (${cup.ml} ml)`,
        `Volume: ${formatNumber(measured.ml, 1)} ml (${toFriendly(measured.ml / cup.ml)} cup)`,
        `Weight: ${formatNumber(measured.grams, 1)} g (${formatNumber(measured.grams / 28.349523125, 2)} oz)`,
        `Density: ${formatNumber(density, 3)} g/ml — 1 ${cup.label} = ${formatNumber(spoonedPerCup, 0)} g`,
        `Generated: ${new Date().toLocaleString()}`,
      ].join("\n"),
    [ingredient, cup, measured, density, spoonedPerCup]
  );

  const setVolume = (value) => {
    setSource("volume");
    setVolumeInput(value);
  };

  const setWeight = (value) => {
    setSource("weight");
    setWeightInput(value);
  };

  const reset = () => {
    setIngredientId("flour-ap");
    setCupStandard("us");
    setSource("volume");
    setVolumeUnit("cup");
    setWeightUnit("g");
    setVolumeInput("1");
    setWeightInput("120");
  };

  const copyReport = async () => {
    const success = await safeCopyText(report);
    if (!success) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const popular = popularIds
    .map((id) => ingredients.find((item) => item.id === id))
    .filter(Boolean);

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Scale className="h-4 w-4" />
            Baking converter
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Cups to Grams Converter</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            A cup of flour and a cup of honey weigh nothing alike. Pick your ingredient and convert cups,
            spoons and millilitres to grams using real density data — in either direction.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[390px_1fr]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-sm font-semibold">Ingredient</span>
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
            </div>

            <label className="block">
              <span className="sr-only">Choose an ingredient</span>
              <select
                value={ingredientId}
                onChange={(event) => setIngredientId(event.target.value)}
                className="h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
              >
                {ingredientGroups.map((group) => (
                  <optgroup key={group} label={group}>
                    {ingredients
                      .filter((item) => item.group === group)
                      .map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
            </label>

            <div className="mt-3 flex flex-wrap gap-2">
              {popular.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setIngredientId(item.id)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    ingredientId === item.id
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                  }`}
                >
                  {item.name.split(" (")[0]}
                </button>
              ))}
            </div>

            <div className="mt-5">
              <span className="text-sm font-semibold">Cup standard</span>
              <div className="mt-2 grid gap-2">
                {cupStandards.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCupStandard(item.id)}
                    className={`rounded-md border px-3 py-2.5 text-left transition ${
                      cupStandard === item.id
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]"
                    }`}
                  >
                    <span className="block text-sm font-semibold">
                      {item.label} — {item.ml} ml
                    </span>
                    <span
                      className={`mt-0.5 block text-xs ${
                        cupStandard === item.id
                          ? "text-[var(--primary-foreground)] opacity-80"
                          : "text-[var(--muted-foreground)]"
                      }`}
                    >
                      {item.hint}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 rounded-md border border-[var(--border)] bg-[var(--muted)] p-3">
              <p className="text-xs leading-5 text-[var(--muted-foreground)]">
                Tablespoons stay 15 ml and teaspoons 5 ml in both standards — only the cup changes size.
              </p>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                  {ingredient.name}
                </p>
                <button
                  type="button"
                  onClick={copyReport}
                  className="btn-secondary min-h-9 px-3 py-1.5 text-sm"
                >
                  <Copy className="h-4 w-4" />
                  {copied ? "Copied" : "Copy result"}
                </button>
              </div>

              <div className="mt-4 grid items-end gap-3 sm:grid-cols-[1fr_auto_1fr]">
                <div className="grid gap-2">
                  <label className="block">
                    <span className="text-sm font-semibold">Volume</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="any"
                      value={volumeValue}
                      onChange={(event) => setVolume(event.target.value)}
                      className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                    />
                  </label>
                  <label className="block">
                    <span className="sr-only">Volume unit</span>
                    <select
                      value={volumeUnit}
                      onChange={(event) => setVolumeUnit(event.target.value)}
                      className="h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                    >
                      {volumeUnits.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="flex justify-center pb-14 sm:pb-16">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--muted)] text-[var(--primary)]">
                    <ArrowRightLeft className="h-4 w-4" />
                  </span>
                </div>

                <div className="grid gap-2">
                  <label className="block">
                    <span className="text-sm font-semibold">Weight</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="any"
                      value={weightValue}
                      onChange={(event) => setWeight(event.target.value)}
                      className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                    />
                  </label>
                  <label className="block">
                    <span className="sr-only">Weight unit</span>
                    <select
                      value={weightUnit}
                      onChange={(event) => setWeightUnit(event.target.value)}
                      className="h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                    >
                      {weightUnits.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>

              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                Type in either box — the other updates instantly.
              </p>

              <div className="mt-5 rounded-lg bg-[var(--muted)] p-5" aria-live="polite">
                <p className="text-4xl font-semibold text-[var(--primary)]">
                  {formatNumber(measured.grams, 1)} g
                </p>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                  {toFriendly(cupsEquivalent)} {cup.label.toLowerCase()} ({formatNumber(measured.ml, 1)} ml)
                  {" of "}
                  {ingredient.name.toLowerCase()}
                </p>
              </div>

              <div className="tool-compact-grid mt-4">
                {[
                  ["Ounces", `${formatNumber(measured.grams / 28.349523125, 2)} oz`],
                  ["Tablespoons", `${formatNumber(measured.ml / 15, 2)} tbsp`],
                  ["Teaspoons", `${formatNumber(measured.ml / 5, 1)} tsp`],
                  ["Millilitres", `${formatNumber(measured.ml, 1)} ml`],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
                  >
                    <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
                    <p className="mt-1 font-semibold">{value}</p>
                  </div>
                ))}
              </div>

              <p className="mt-5 text-sm leading-6 text-[var(--muted-foreground)]">
                Formula: grams = millilitres x density. 1 US cup (240 ml) of {ingredient.name.toLowerCase()}
                {" weighs "}
                {formatNumber(ingredient.gramsPerCup, 0)} g, so density = {formatNumber(density, 3)} g/ml.
                At your {cup.label.toLowerCase()} of {cup.ml} ml, 1 cup = {formatNumber(spoonedPerCup, 0)} g.
              </p>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex items-center gap-2">
                <Wheat className="h-4 w-4 text-[var(--primary)]" />
                <h2 className="text-lg font-semibold">
                  Quick reference — {ingredient.name}
                </h2>
              </div>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                Based on a {cup.ml} ml {cup.label.toLowerCase()}, spooned and levelled.
              </p>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[420px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-xs uppercase text-[var(--muted-foreground)]">
                      <th className="pb-2 pr-3 font-semibold">Measure</th>
                      <th className="pb-2 pr-3 font-semibold">Grams</th>
                      <th className="pb-2 pr-3 font-semibold">Ounces</th>
                      <th className="pb-2 font-semibold">Millilitres</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chartRows.map((row) => {
                      const ml = row.tsp ? row.tsp * 5 : row.cups * cup.ml;
                      const grams = ml * density;
                      return (
                        <tr key={row.label} className="border-b border-[var(--border)] last:border-0">
                          <td className="py-2.5 pr-3 font-semibold">{row.label}</td>
                          <td className="py-2.5 pr-3 text-[var(--primary)]">
                            {formatNumber(grams, grams < 10 ? 1 : 0)} g
                          </td>
                          <td className="py-2.5 pr-3 text-[var(--muted-foreground)]">
                            {formatNumber(grams / 28.349523125, 2)} oz
                          </td>
                          <td className="py-2.5 text-[var(--muted-foreground)]">
                            {formatNumber(ml, ml < 10 ? 1 : 0)} ml
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {scoopedPerCup ? (
              <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-[var(--primary)]" />
                  <h2 className="text-lg font-semibold">Spoon-and-level vs scooped</h2>
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                  How you fill the cup changes the weight more than most people expect. These are both
                  &ldquo;1 cup&rdquo; of {ingredient.name.toLowerCase()}:
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
                    <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                      Spooned &amp; levelled
                    </p>
                    <p className="mt-1 text-2xl font-semibold text-[var(--anslation-ds-success)]">
                      {formatNumber(spoonedPerCup, 0)} g
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                      What recipe writers mean.
                    </p>
                  </div>
                  <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
                    <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                      Dipped &amp; scooped
                    </p>
                    <p className="mt-1 text-2xl font-semibold text-[var(--anslation-ds-danger)]">
                      {formatNumber(scoopedPerCup, 0)} g
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                      What most people actually do.
                    </p>
                  </div>
                  <div className="rounded-md border border-[var(--border)] bg-[var(--muted)] p-4">
                    <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                      Difference
                    </p>
                    <p className="mt-1 text-2xl font-semibold">
                      +{formatNumber(scoopedPerCup - spoonedPerCup, 0)} g
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                      {formatNumber(((scoopedPerCup - spoonedPerCup) / spoonedPerCup) * 100, 0)}% more per
                      cup.
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
                  Over three cups that gap is roughly{" "}
                  {formatNumber((scoopedPerCup - spoonedPerCup) * 3, 0)} g of extra{" "}
                  {ingredient.name.split(" (")[0].toLowerCase()} — enough to turn a soft cake dry and a
                  cookie cakey.
                  {ingredient.note ? ` ${ingredient.note}` : ""}
                </p>
              </div>
            ) : ingredient.note ? (
              <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-[var(--primary)]" />
                  <h2 className="text-lg font-semibold">Measuring {ingredient.name.split(" (")[0].toLowerCase()}</h2>
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{ingredient.note}</p>
              </div>
            ) : null}

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-[var(--primary)]" />
                <h2 className="text-lg font-semibold">Why weight beats volume</h2>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  [
                    "A cup is a container, not an amount",
                    "It measures space. Flour can sit loose or packed in that same space, so the weight swings by 20% while the cup looks identical.",
                  ],
                  [
                    "Baking is a ratio, not a list",
                    "Cakes, breads and pastry work on flour-to-fat-to-liquid ratios. Ratios only hold if every number is measured the same way — and grams are the only measure that never drifts.",
                  ],
                  [
                    "One bowl instead of six cups",
                    "Put the bowl on the scale, hit tare, add the ingredient, hit tare again. No nested cups, no packing, no washing up.",
                  ],
                  [
                    "Recipes finally repeat",
                    "When a bake goes right, grams let you reproduce it exactly next month. Cups only let you reproduce your mood that day.",
                  ],
                ].map(([title, body]) => (
                  <div
                    key={title}
                    className="rounded-md border border-[var(--border)] bg-[var(--background)] p-4"
                  >
                    <p className="text-sm font-semibold">{title}</p>
                    <p className="mt-1.5 text-sm leading-6 text-[var(--muted-foreground)]">{body}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
                Densities here follow standard published baking references and assume ingredients are at room
                temperature, sifted where the recipe says so, and spooned into a levelled cup. Treat them as
                accurate working values, not laboratory constants — brands and humidity move every number by a
                gram or two.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
