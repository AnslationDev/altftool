"use client";

import { useMemo, useState } from "react";
import {
  ChefHat,
  Copy,
  Droplets,
  FileDown,
  Percent,
  Plus,
  RotateCcw,
  Scale,
  Trash2,
  Wheat,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const BANDS = [
  { from: 50, to: 55, label: "Very stiff", styles: "Pasta, pretzels" },
  { from: 55, to: 60, label: "Bagels", styles: "Bagels & stiff doughs" },
  { from: 60, to: 65, label: "Sandwich", styles: "Sandwich loaves, rolls" },
  { from: 65, to: 75, label: "Rustic / pizza", styles: "Country loaves, Neapolitan pizza" },
  { from: 75, to: 85, label: "Ciabatta", styles: "Ciabatta, high-hydration artisan" },
  { from: 85, to: 95, label: "Focaccia", styles: "Focaccia & very slack doughs" },
];

const FEEL = {
  "Very stiff": "Very stiff and dense — pasta or pretzel territory. Hard work to knead, very tight crumb.",
  Bagels: "Stiff, low-tack dough that holds its shape firmly. Classic for bagels and pretzels with a chewy, tight crumb.",
  Sandwich: "Easy-going dough — smooth to knead and shape. The sweet spot for soft sandwich loaves and dinner rolls.",
  "Rustic / pizza": "Slightly tacky but manageable. Ideal for rustic country loaves, baguettes and Neapolitan-style pizza with an open crumb.",
  Ciabatta: "Sticky, slack dough — skip kneading and use stretch-and-folds with wet hands. Rewards you with big open holes.",
  Focaccia: "Very slack, almost pourable. Best handled in a pan — focaccia, Sicilian and Detroit-style pizza shine here.",
};

const EXTRA_SUGGESTIONS = [
  { name: "Olive oil", pct: 3 },
  { name: "Sugar", pct: 4 },
  { name: "Butter", pct: 5 },
  { name: "Milk powder", pct: 3 },
  { name: "Seeds", pct: 6 },
];

const nf = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const toNum = (value) => {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
};

const fmt = (value) => nf.format(Number.isFinite(value) ? value : 0);

const fmtField = (value) => {
  if (!Number.isFinite(value)) return "";
  const decimals = Math.abs(value) < 10 ? 2 : 1;
  return String(parseFloat(value.toFixed(decimals)));
};

const gramsFor = (pct, flour) => (flour > 0 ? fmtField((toNum(pct) / 100) * flour) : "");
const pctFor = (grams, flour) => (flour > 0 ? fmtField((toNum(grams) / flour) * 100) : "");

function starterSplit(starterG, starterHydration) {
  const h = Math.max(toNum(starterHydration), 0);
  const flourPart = h >= 0 ? starterG / (1 + h / 100) : starterG;
  return { flourPart, waterPart: starterG - flourPart };
}

function downloadTextFile(filename, content) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

const PRESETS = [
  {
    name: "Pizza napoletana",
    sub: "62% • instant yeast",
    mode: "yeast",
    flour: 500,
    water: 62,
    salt: 2.8,
    yeast: 0.2,
    extras: [],
    note: "AVPN-style lean dough for a long, slow ferment. 62% stays workable by hand and puffs beautifully in a hot oven.",
  },
  {
    name: "Baguette",
    sub: "68% • instant yeast",
    mode: "yeast",
    flour: 500,
    water: 68,
    salt: 2,
    yeast: 0.5,
    extras: [],
    note: "Classic lean French dough. 68% gives a crisp crust and moderately open crumb — handle with gentle folds.",
  },
  {
    name: "Sandwich loaf",
    sub: "62% • enriched",
    mode: "yeast",
    flour: 500,
    water: 62,
    salt: 2,
    yeast: 1.2,
    extras: [
      { name: "Sugar", pct: 4 },
      { name: "Butter", pct: 5 },
    ],
    note: "Soft enriched loaf — sugar and butter tenderise the crumb. Knead well for a fine, even slice.",
  },
  {
    name: "100% wholewheat",
    sub: "80% • high absorption",
    mode: "yeast",
    flour: 500,
    water: 80,
    salt: 2,
    yeast: 1,
    extras: [],
    note: "Wholegrain flour absorbs far more water — 80% here handles like ~65% in white flour. Add the last water gradually and rest (autolyse) 30 min.",
  },
  {
    name: "Country sourdough",
    sub: "72% true • 20% starter",
    mode: "sourdough",
    flour: 500,
    trueTarget: 72,
    salt: 2,
    starterPct: 20,
    starterHydration: 100,
    extras: [],
    note: "20% starter at 100% hydration. Added water is solved so TRUE hydration (counting the starter) lands exactly on 72%.",
  },
];

function IngredientRow({ id, label, hint, row, onPct, onGrams, onName, onRemove }) {
  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
      <div className="flex items-center justify-between gap-2">
        {onName ? (
          <label className="flex-1">
            <span className="sr-only">Ingredient name</span>
            <input
              type="text"
              value={label}
              onChange={(event) => onName(event.target.value)}
              className="h-9 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-2 text-sm font-semibold outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
            />
          </label>
        ) : (
          <span className="text-sm font-semibold">{label}</span>
        )}
        {hint ? <span className="text-xs text-[var(--muted-foreground)]">{hint}</span> : null}
        {onRemove ? (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${label}`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border)] text-[var(--muted-foreground)] transition hover:border-[var(--anslation-ds-danger)] hover:text-[var(--anslation-ds-danger)]"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        ) : null}
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <label className="block">
          <span className="text-xs font-semibold text-[var(--muted-foreground)]">Baker&apos;s %</span>
          <div className="relative mt-1">
            <input
              type="number"
              inputMode="decimal"
              step="any"
              min="0"
              value={row.pct}
              onChange={(event) => onPct(event.target.value)}
              id={`${id}-pct`}
              className="h-11 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 pr-8 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--muted-foreground)]">
              %
            </span>
          </div>
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-[var(--muted-foreground)]">Weight</span>
          <div className="relative mt-1">
            <input
              type="number"
              inputMode="decimal"
              step="any"
              min="0"
              value={row.g}
              onChange={(event) => onGrams(event.target.value)}
              id={`${id}-g`}
              className="h-11 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 pr-8 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--muted-foreground)]">
              g
            </span>
          </div>
        </label>
      </div>
    </div>
  );
}

function HydrationBand({ hydration }) {
  const clamped = Math.min(Math.max(hydration, 50), 95);
  const pos = ((clamped - 50) / 45) * 100;
  return (
    <div>
      <div className="relative mt-6">
        <div
          className="absolute -top-4 z-10 flex -translate-x-1/2 flex-col items-center"
          style={{ left: `${pos}%` }}
        >
          <span className="rounded-full bg-[var(--foreground)] px-2 py-0.5 text-[10px] font-bold text-[var(--background)]">
            {fmt(hydration)}%
          </span>
          <span className="h-4 w-0.5 bg-[var(--foreground)]" />
        </div>
        <div className="flex h-3 overflow-hidden rounded-full border border-[var(--border)]">
          {BANDS.map((band) => {
            const active = hydration >= band.from && (hydration < band.to || (band.to === 95 && hydration >= 85));
            return (
              <div
                key={band.label}
                title={`${band.from}-${band.to}% ${band.styles}`}
                className={active ? "bg-[var(--primary)]" : "bg-[var(--muted)]"}
                style={{ width: `${((band.to - band.from) / 45) * 100}%` }}
              />
            );
          })}
        </div>
      </div>
      <div className="relative mt-1 h-4 text-[10px] font-semibold text-[var(--muted-foreground)]">
        {[50, 55, 60, 65, 75, 85, 95].map((tick) => (
          <span
            key={tick}
            className="absolute -translate-x-1/2"
            style={{ left: `${((tick - 50) / 45) * 100}%` }}
          >
            {tick}
          </span>
        ))}
      </div>
      <div className="mt-2 grid gap-1 sm:grid-cols-3">
        {BANDS.filter((band) => band.from >= 55).map((band) => {
          const active = hydration >= band.from && (hydration < band.to || (band.to === 95 && hydration >= 85));
          return (
            <div
              key={band.label}
              className={`rounded-md border px-2 py-1.5 text-xs ${
                active
                  ? "border-[var(--primary)] text-[var(--foreground)]"
                  : "border-[var(--border)] text-[var(--muted-foreground)]"
              }`}
            >
              <span className="font-semibold">
                {band.from}–{band.to === 95 ? "95+" : band.to}%
              </span>{" "}
              {band.styles}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ToolHome() {
  const [mode, setMode] = useState("yeast");
  const [flour, setFlour] = useState("500");
  const [water, setWater] = useState({ pct: "68", g: "340" });
  const [salt, setSalt] = useState({ pct: "2", g: "10" });
  const [yeast, setYeast] = useState({ pct: "0.4", g: "2" });
  const [starter, setStarter] = useState({ pct: "20", g: "100" });
  const [starterHydration, setStarterHydration] = useState("100");
  const [extras, setExtras] = useState([]);
  const [multiplier, setMultiplier] = useState("2");
  const [target, setTarget] = useState("72");
  const [presetNote, setPresetNote] = useState(null);
  const [copied, setCopied] = useState(false);

  const flourNum = toNum(flour);

  const setRowPct = (setter) => (value) =>
    setter({ pct: value, g: gramsFor(value, flourNum) });
  const setRowGrams = (setter) => (value) =>
    setter({ g: value, pct: pctFor(value, flourNum) });

  const changeFlour = (value) => {
    setFlour(value);
    const f = toNum(value);
    setWater((row) => ({ ...row, g: gramsFor(row.pct, f) }));
    setSalt((row) => ({ ...row, g: gramsFor(row.pct, f) }));
    setYeast((row) => ({ ...row, g: gramsFor(row.pct, f) }));
    setStarter((row) => ({ ...row, g: gramsFor(row.pct, f) }));
    setExtras((rows) => rows.map((row) => ({ ...row, g: gramsFor(row.pct, f) })));
  };

  const scaleRecipe = (factor) => {
    if (!(factor > 0) || flourNum <= 0) return;
    changeFlour(fmtField(flourNum * factor));
  };

  const addExtra = () => {
    const suggestion = EXTRA_SUGGESTIONS[extras.length % EXTRA_SUGGESTIONS.length];
    setExtras((rows) => [
      ...rows,
      {
        id: Date.now() + rows.length,
        name: suggestion.name,
        pct: String(suggestion.pct),
        g: gramsFor(suggestion.pct, flourNum),
      },
    ]);
  };

  const updateExtra = (id, patch) => {
    setExtras((rows) => rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const applyPreset = (preset) => {
    setMode(preset.mode);
    const f = preset.flour;
    setFlour(String(f));
    setSalt({ pct: String(preset.salt), g: gramsFor(preset.salt, f) });
    setExtras(
      preset.extras.map((extra, index) => ({
        id: Date.now() + index,
        name: extra.name,
        pct: String(extra.pct),
        g: gramsFor(extra.pct, f),
      }))
    );
    if (preset.mode === "sourdough") {
      const starterG = (preset.starterPct / 100) * f;
      const { flourPart, waterPart } = starterSplit(starterG, preset.starterHydration);
      const addedWater = (preset.trueTarget / 100) * (f + flourPart) - waterPart;
      setStarter({ pct: String(preset.starterPct), g: fmtField(starterG) });
      setStarterHydration(String(preset.starterHydration));
      setWater({ pct: pctFor(addedWater, f), g: fmtField(addedWater) });
      setTarget(String(preset.trueTarget));
    } else {
      setYeast({ pct: String(preset.yeast), g: gramsFor(preset.yeast, f) });
      setWater({ pct: String(preset.water), g: gramsFor(preset.water, f) });
      setTarget(String(preset.water));
    }
    setPresetNote({ name: preset.name, note: preset.note });
  };

  const resetAll = () => {
    setMode("yeast");
    setFlour("500");
    setWater({ pct: "68", g: "340" });
    setSalt({ pct: "2", g: "10" });
    setYeast({ pct: "0.4", g: "2" });
    setStarter({ pct: "20", g: "100" });
    setStarterHydration("100");
    setExtras([]);
    setTarget("72");
    setPresetNote(null);
  };

  const calc = useMemo(() => {
    const F = flourNum;
    const W = (toNum(water.pct) / 100) * F;
    const saltG = (toNum(salt.pct) / 100) * F;
    const yeastG = mode === "yeast" ? (toNum(yeast.pct) / 100) * F : 0;
    const starterG = mode === "sourdough" ? (toNum(starter.pct) / 100) * F : 0;
    const { flourPart, waterPart } =
      mode === "sourdough" ? starterSplit(starterG, starterHydration) : { flourPart: 0, waterPart: 0 };
    const totalFlour = F + flourPart;
    const totalWater = W + waterPart;
    const hydration = totalFlour > 0 ? (totalWater / totalFlour) * 100 : 0;
    const extrasG = extras.reduce((sum, row) => sum + (toNum(row.pct) / 100) * F, 0);
    const totalDough = F + W + saltG + yeastG + starterG + extrasG;
    const effectiveSalt = totalFlour > 0 ? (saltG / totalFlour) * 100 : 0;
    const band =
      hydration < 55
        ? BANDS[0]
        : BANDS.find((item) => hydration >= item.from && hydration < item.to) || BANDS[BANDS.length - 1];
    return {
      F,
      W,
      saltG,
      yeastG,
      starterG,
      starterFlour: flourPart,
      starterWater: waterPart,
      totalFlour,
      totalWater,
      hydration,
      totalDough,
      effectiveSalt,
      band,
    };
  }, [flourNum, water.pct, salt.pct, yeast.pct, starter.pct, starterHydration, extras, mode]);

  const solver = useMemo(() => {
    const H = toNum(target);
    const needed = (H / 100) * calc.totalFlour - calc.starterWater;
    return { needed, delta: needed - calc.W, valid: calc.totalFlour > 0 && H > 0 };
  }, [target, calc]);

  const applySolver = () => {
    if (!solver.valid || flourNum <= 0) return;
    const grams = Math.max(solver.needed, 0);
    setWater({ g: fmtField(grams), pct: pctFor(grams, flourNum) });
  };

  const report = useMemo(() => {
    const lines = [
      "Dough Hydration Calculator - Baker's Formula",
      "",
      `${"Ingredient".padEnd(24)}${"Grams".padStart(10)}${"Baker's %".padStart(12)}`,
      `${"Flour".padEnd(24)}${fmt(calc.F).padStart(10)}${"100%".padStart(12)}`,
      `${"Water".padEnd(24)}${fmt(calc.W).padStart(10)}${`${fmt(toNum(water.pct))}%`.padStart(12)}`,
      `${"Salt".padEnd(24)}${fmt(calc.saltG).padStart(10)}${`${fmt(toNum(salt.pct))}%`.padStart(12)}`,
    ];
    if (mode === "yeast") {
      lines.push(
        `${"Instant yeast".padEnd(24)}${fmt(calc.yeastG).padStart(10)}${`${fmt(toNum(yeast.pct))}%`.padStart(12)}`
      );
    } else {
      lines.push(
        `${`Starter (${fmt(toNum(starterHydration))}% hydr.)`.padEnd(24)}${fmt(calc.starterG).padStart(10)}${`${fmt(
          toNum(starter.pct)
        )}%`.padStart(12)}`,
        `${"  - flour in starter".padEnd(24)}${fmt(calc.starterFlour).padStart(10)}${"".padStart(12)}`,
        `${"  - water in starter".padEnd(24)}${fmt(calc.starterWater).padStart(10)}${"".padStart(12)}`
      );
    }
    extras.forEach((row) => {
      lines.push(
        `${(row.name || "Extra").padEnd(24)}${fmt((toNum(row.pct) / 100) * calc.F).padStart(10)}${`${fmt(
          toNum(row.pct)
        )}%`.padStart(12)}`
      );
    });
    lines.push(
      "",
      `Total flour: ${fmt(calc.totalFlour)} g | Total water: ${fmt(calc.totalWater)} g`,
      `Total dough weight: ${fmt(calc.totalDough)} g`,
      `True hydration: ${fmt(calc.hydration)}% (${fmt(calc.totalWater)} / ${fmt(calc.totalFlour)} x 100)`,
      `Effective salt: ${fmt(calc.effectiveSalt)}% of total flour`,
      `Dough style: ${calc.band.label} - ${calc.band.styles}`,
      `Generated: ${new Date().toLocaleString()}`
    );
    return lines.join("\n");
  }, [calc, extras, mode, salt.pct, starter.pct, starterHydration, water.pct, yeast.pct]);

  const copyReport = async () => {
    const success = await safeCopyText(report);
    if (!success) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const breakdownRows = [
    { name: "Flour (added)", grams: calc.F, pct: 100 },
    { name: "Water (added)", grams: calc.W, pct: toNum(water.pct) },
    { name: "Salt", grams: calc.saltG, pct: toNum(salt.pct) },
    ...(mode === "yeast"
      ? [{ name: "Instant yeast", grams: calc.yeastG, pct: toNum(yeast.pct) }]
      : [
          { name: `Starter (${fmt(toNum(starterHydration))}% hydr.)`, grams: calc.starterG, pct: toNum(starter.pct) },
          { name: "→ flour inside starter", grams: calc.starterFlour, pct: null, sub: true },
          { name: "→ water inside starter", grams: calc.starterWater, pct: null, sub: true },
        ]),
    ...extras.map((row) => ({
      name: row.name || "Extra",
      grams: (toNum(row.pct) / 100) * calc.F,
      pct: toNum(row.pct),
    })),
  ];

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Wheat className="h-4 w-4" />
            Baker&apos;s percentage
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Dough Hydration Calculator</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Build any bread or pizza dough with baker&apos;s math — enter flour, tune water, salt and yeast or sourdough
            starter as percentages or grams, and see true hydration with what it means for your dough.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[420px_1fr]">
          <div className="grid content-start gap-6">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "yeast", label: "Instant yeast" },
                  { id: "sourdough", label: "Sourdough starter" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMode(item.id)}
                    className={`rounded-md border px-3 py-3 text-sm font-semibold transition ${
                      mode === item.id
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <label className="mt-5 block">
                <span className="text-sm font-semibold">Flour weight (the flour you add to the bowl)</span>
                <div className="relative mt-2">
                  <input
                    type="number"
                    inputMode="decimal"
                    step="any"
                    min="0"
                    value={flour}
                    onChange={(event) => changeFlour(event.target.value)}
                    className="h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 pr-8 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--muted-foreground)]">
                    g
                  </span>
                </div>
              </label>

              <div className="mt-4 grid gap-3">
                <IngredientRow
                  id="water"
                  label="Water"
                  hint="drives hydration"
                  row={water}
                  onPct={setRowPct(setWater)}
                  onGrams={setRowGrams(setWater)}
                />
                <IngredientRow
                  id="salt"
                  label="Salt"
                  hint="typical 1.8–2.2%"
                  row={salt}
                  onPct={setRowPct(setSalt)}
                  onGrams={setRowGrams(setSalt)}
                />
                {mode === "yeast" ? (
                  <IngredientRow
                    id="yeast"
                    label="Instant yeast"
                    hint="0.1–1.5%"
                    row={yeast}
                    onPct={setRowPct(setYeast)}
                    onGrams={setRowGrams(setYeast)}
                  />
                ) : (
                  <>
                    <IngredientRow
                      id="starter"
                      label="Sourdough starter"
                      hint="typical 10–30%"
                      row={starter}
                      onPct={setRowPct(setStarter)}
                      onGrams={setRowGrams(setStarter)}
                    />
                    <label className="block rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                      <span className="text-sm font-semibold">Starter hydration</span>
                      <span className="ml-2 text-xs text-[var(--muted-foreground)]">
                        100% = equal flour &amp; water feed
                      </span>
                      <div className="relative mt-2">
                        <input
                          type="number"
                          inputMode="decimal"
                          step="any"
                          min="0"
                          value={starterHydration}
                          onChange={(event) => setStarterHydration(event.target.value)}
                          className="h-11 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 pr-8 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                        />
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--muted-foreground)]">
                          %
                        </span>
                      </div>
                    </label>
                  </>
                )}
                {extras.map((row) => (
                  <IngredientRow
                    key={row.id}
                    id={`extra-${row.id}`}
                    label={row.name}
                    row={row}
                    onName={(value) => updateExtra(row.id, { name: value })}
                    onPct={(value) => updateExtra(row.id, { pct: value, g: gramsFor(value, flourNum) })}
                    onGrams={(value) => updateExtra(row.id, { g: value, pct: pctFor(value, flourNum) })}
                    onRemove={() => setExtras((rows) => rows.filter((item) => item.id !== row.id))}
                  />
                ))}
                <button
                  type="button"
                  onClick={addExtra}
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-dashed border-[var(--border)] px-3 py-2.5 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
                >
                  <Plus className="h-4 w-4" />
                  Add ingredient (oil, sugar, butter…)
                </button>
                {extras.length > 0 && (
                  <p className="text-xs leading-5 text-[var(--muted-foreground)]">
                    Extras add to dough weight but are not counted as water in the hydration math.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-[var(--primary)]" />
                <span className="text-sm font-semibold">Scale the whole recipe</span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {[0.5, 1.5, 2, 3].map((factor) => (
                  <button
                    key={factor}
                    type="button"
                    onClick={() => scaleRecipe(factor)}
                    className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                  >
                    ×{factor}
                  </button>
                ))}
                <label className="ml-auto flex items-center gap-2">
                  <span className="text-xs font-semibold text-[var(--muted-foreground)]">Custom ×</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="any"
                    min="0"
                    value={multiplier}
                    onChange={(event) => setMultiplier(event.target.value)}
                    className="h-10 w-20 rounded-md border border-[var(--border)] bg-[var(--background)] px-2 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                  />
                  <button
                    type="button"
                    onClick={() => scaleRecipe(toNum(multiplier))}
                    className="btn-secondary min-h-9 px-3 py-1.5 text-sm"
                  >
                    Apply
                  </button>
                </label>
              </div>
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                Percentages stay fixed — only the flour (and every weight with it) changes.
              </p>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ChefHat className="h-4 w-4 text-[var(--primary)]" />
                  <span className="text-sm font-semibold">Classic recipe presets</span>
                </div>
                <button
                  type="button"
                  onClick={resetAll}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)]"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </button>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 2xl:grid-cols-1">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className={`rounded-md border px-3 py-2 text-left transition hover:border-[var(--primary)] ${
                      presetNote?.name === preset.name
                        ? "border-[var(--primary)] bg-[var(--muted)]"
                        : "border-[var(--border)] bg-[var(--background)]"
                    }`}
                  >
                    <span className="block text-sm font-semibold">{preset.name}</span>
                    <span className="block text-xs text-[var(--muted-foreground)]">{preset.sub}</span>
                  </button>
                ))}
              </div>
              {presetNote && (
                <p className="mt-3 rounded-md bg-[var(--muted)] p-3 text-xs leading-5 text-[var(--muted-foreground)]">
                  <span className="font-semibold text-[var(--foreground)]">{presetNote.name}:</span> {presetNote.note}
                </p>
              )}
            </div>
          </div>

          <div className="grid content-start gap-6">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                  {mode === "sourdough" ? "True hydration (starter included)" : "Hydration"}
                </p>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={copyReport} className="btn-secondary min-h-9 px-3 py-1.5 text-sm">
                    <Copy className="h-4 w-4" />
                    {copied ? "Copied" : "Copy formula"}
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadTextFile("dough-hydration-formula.txt", report)}
                    className="btn-secondary min-h-9 px-3 py-1.5 text-sm"
                  >
                    <FileDown className="h-4 w-4" />
                    Download
                  </button>
                </div>
              </div>

              <div aria-live="polite" className="mt-4 flex flex-wrap items-end gap-4">
                <div className="rounded-lg bg-[var(--muted)] px-6 py-4">
                  <p className="text-5xl font-semibold text-[var(--primary)]">{fmt(calc.hydration)}%</p>
                </div>
                <div className="min-w-[200px] flex-1">
                  <p className="text-sm font-semibold">{calc.band.label}</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{FEEL[calc.band.label]}</p>
                </div>
              </div>

              <HydrationBand hydration={calc.hydration} />

              <div className="tool-compact-grid mt-6">
                {[
                  ["Total flour", `${fmt(calc.totalFlour)} g`],
                  ["Total water", `${fmt(calc.totalWater)} g`],
                  ["Total dough", `${fmt(calc.totalDough)} g`],
                  ["Salt of total flour", `${fmt(calc.effectiveSalt)}%`],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                    <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
                    <p className="mt-1 font-semibold">{value}</p>
                  </div>
                ))}
              </div>

              <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
                Formula: hydration = total water ÷ total flour × 100 = {fmt(calc.totalWater)} ÷ {fmt(calc.totalFlour)} ×
                100 = <span className="font-semibold text-[var(--foreground)]">{fmt(calc.hydration)}%</span>
                {mode === "sourdough" &&
                  " — the flour and water inside your starter are counted, which is what most recipes gloss over."}
              </p>

              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[380px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-left text-xs uppercase text-[var(--muted-foreground)]">
                      <th className="py-2 pr-3 font-semibold">Ingredient</th>
                      <th className="py-2 pr-3 text-right font-semibold">Grams</th>
                      <th className="py-2 text-right font-semibold">Baker&apos;s %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {breakdownRows.map((row, index) => (
                      <tr key={`${row.name}-${index}`} className="border-b border-[var(--border)]">
                        <td className={`py-2 pr-3 ${row.sub ? "pl-4 text-xs text-[var(--muted-foreground)]" : "font-semibold"}`}>
                          {row.name}
                        </td>
                        <td className={`py-2 pr-3 text-right ${row.sub ? "text-xs text-[var(--muted-foreground)]" : ""}`}>
                          {fmt(row.grams)} g
                        </td>
                        <td className="py-2 text-right text-[var(--muted-foreground)]">
                          {row.pct === null ? "—" : `${fmt(row.pct)}%`}
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td className="py-2 pr-3 font-semibold">Total dough</td>
                      <td className="py-2 pr-3 text-right font-semibold text-[var(--primary)]">
                        {fmt(calc.totalDough)} g
                      </td>
                      <td className="py-2 text-right text-[var(--muted-foreground)]"> </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-[var(--primary)]" />
                <h2 className="text-base font-semibold">Target hydration solver</h2>
              </div>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                Pick the hydration you want — get the exact water to add for {fmt(calc.F)} g flour
                {mode === "sourdough" ? " with your starter already accounted for." : "."}
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                <label className="block">
                  <span className="text-sm font-semibold">Target hydration: {fmt(toNum(target))}%</span>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    step="0.5"
                    value={toNum(target) || 50}
                    onChange={(event) => setTarget(event.target.value)}
                    className="mt-3 w-full"
                    style={{ accentColor: "var(--primary)" }}
                  />
                </label>
                <label className="block">
                  <span className="sr-only">Target hydration percent</span>
                  <div className="relative">
                    <input
                      type="number"
                      inputMode="decimal"
                      step="any"
                      min="0"
                      value={target}
                      onChange={(event) => setTarget(event.target.value)}
                      className="h-12 w-28 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 pr-8 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--muted-foreground)]">
                      %
                    </span>
                  </div>
                </label>
              </div>
              <div aria-live="polite" className="mt-4 rounded-md bg-[var(--muted)] p-4">
                {solver.needed >= 0 ? (
                  <p className="text-sm leading-6">
                    Add <span className="text-xl font-semibold text-[var(--primary)]">{fmt(solver.needed)} g</span>{" "}
                    water{" "}
                    <span className="text-[var(--muted-foreground)]">
                      ({solver.delta >= 0 ? "+" : ""}
                      {fmt(solver.delta)} g vs current)
                      {mode === "sourdough" &&
                        ` — after subtracting ${fmt(calc.starterWater)} g water already in the starter`}
                    </span>
                  </p>
                ) : (
                  <p className="text-sm leading-6 text-[var(--anslation-ds-danger)]">
                    Your starter alone already brings more water than {fmt(toNum(target))}% allows — lower the starter
                    amount or raise the target.
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={applySolver}
                disabled={!solver.valid || solver.needed < 0}
                className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-foreground)] transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Percent className="h-4 w-4" />
                Apply to recipe
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
