"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Copy,
  FileDown,
  Flame,
  Lightbulb,
  RotateCcw,
  ShieldCheck,
  Thermometer,
  Timer,
  Wind,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const TEMP_DROP = { C: 25, F: 50 };
const MAX_AIR_TEMP = { C: 200, F: 400 };

const ovenPresets = [
  { label: "Roast vegetables", c: 200, minutes: 30 },
  { label: "Chicken breast", c: 200, minutes: 25 },
  { label: "Cookies", c: 180, minutes: 12 },
  { label: "Frozen pizza", c: 220, minutes: 15 },
];

const foodCheatSheet = [
  {
    id: "fries",
    name: "French fries (fresh cut)",
    c: 190,
    f: 375,
    minutes: 20,
    flip: "Shake the basket every 6-7 min",
    note: "Soak 20 min, pat completely dry",
  },
  {
    id: "wings",
    name: "Chicken wings",
    c: 200,
    f: 400,
    minutes: 24,
    flip: "Flip once at 12 min",
    note: "Cook to 74°C internal",
  },
  {
    id: "whole-chicken",
    name: "Whole chicken (~1.4 kg)",
    c: 180,
    f: 360,
    minutes: 60,
    flip: "Flip breast-side up at 30 min",
    note: "Rest 10 min before carving",
  },
  {
    id: "fish",
    name: "Fish fillet",
    c: 190,
    f: 380,
    minutes: 11,
    flip: "No flip — fillets are delicate",
    note: "Done at 63°C, flakes easily",
  },
  {
    id: "veggies",
    name: "Mixed vegetables",
    c: 190,
    f: 375,
    minutes: 14,
    flip: "Shake at 5 and 10 min",
    note: "Toss with 1 tsp oil first",
  },
  {
    id: "frozen",
    name: "Frozen snacks (nuggets, samosa, rolls)",
    c: 195,
    f: 385,
    minutes: 10,
    flip: "Shake once at 5 min",
    note: "Cook straight from frozen",
  },
  {
    id: "pizza",
    name: "Reheating pizza",
    c: 175,
    f: 350,
    minutes: 4,
    flip: "No flip needed",
    note: "Crispier crust than a microwave",
  },
];

const safetyTemps = [
  { food: "Chicken & all poultry", c: 74, f: 165 },
  { food: "Ground meat, keema, patties", c: 71, f: 160 },
  { food: "Fish & seafood", c: 63, f: 145 },
  { food: "Beef, lamb, pork whole cuts", c: 63, f: 145, extra: "+ 3 min rest" },
  { food: "Egg dishes", c: 71, f: 160 },
  { food: "Leftovers & reheating", c: 74, f: 165 },
];

const roundTo = (value, step) => Math.round(value / step) * step;

function downloadTextFile(filename, content) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function ToolHome() {
  const [unit, setUnit] = useState("C");
  const [ovenTemp, setOvenTemp] = useState(200);
  const [ovenTime, setOvenTime] = useState(30);
  const [activeFood, setActiveFood] = useState(null);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const temp = Number(ovenTemp) || 0;
    const minutes = Number(ovenTime) || 0;
    const airTempRaw = temp - TEMP_DROP[unit];
    const airTemp = Math.max(unit === "C" ? 40 : 100, roundTo(airTempRaw, 5));
    const airTime = Math.max(1, Math.round(minutes * 0.8));
    const flipAt = Math.max(1, Math.round(airTime / 2));
    const checkAt = Math.max(1, airTime - (airTime >= 15 ? 3 : 2));
    return {
      airTemp,
      airTime,
      flipAt,
      checkAt,
      overMax: airTemp > MAX_AIR_TEMP[unit],
      timeSaved: Math.max(0, minutes - airTime),
    };
  }, [ovenTemp, ovenTime, unit]);

  const report = useMemo(
    () =>
      [
        "Air Fryer Conversion",
        `Oven recipe: ${Number(ovenTemp) || 0}°${unit} for ${Number(ovenTime) || 0} min`,
        `Air fryer: ${result.airTemp}°${unit} for ${result.airTime} min`,
        `Rule: temperature -${TEMP_DROP[unit]}°${unit}, time -20%`,
        activeFood ? `Food note: ${activeFood.flip} (${activeFood.note})` : `Shake or flip around ${result.flipAt} min`,
        `Start checking doneness at ${result.checkAt} min`,
        `Generated: ${new Date().toLocaleString()}`,
      ].join("\n"),
    [activeFood, ovenTemp, ovenTime, result, unit]
  );

  const switchUnit = (next) => {
    if (next === unit) return;
    const temp = Number(ovenTemp) || 0;
    const converted = next === "F" ? (temp * 9) / 5 + 32 : ((temp - 32) * 5) / 9;
    setOvenTemp(roundTo(converted, 5));
    setUnit(next);
  };

  const applyOvenPreset = (preset) => {
    setOvenTemp(unit === "C" ? preset.c : roundTo((preset.c * 9) / 5 + 32, 5));
    setOvenTime(preset.minutes);
    setActiveFood(null);
  };

  const loadCheatSheetFood = (food) => {
    setOvenTemp(unit === "C" ? food.c + TEMP_DROP.C : food.f + TEMP_DROP.F);
    setOvenTime(Math.round(food.minutes / 0.8));
    setActiveFood(food);
  };

  const copyReport = async () => {
    const success = await safeCopyText(report);
    if (!success) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Flame className="h-4 w-4" />
            Kitchen converter
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Air Fryer Time & Temp Converter</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Turn any oven recipe into air fryer settings with the trusted rule of thumb: drop the temperature by 25°C
            (50°F) and cut the time by 20%. Includes a real-food cheat sheet, flip reminders, and food-safety
            temperatures.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[390px_1fr]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold">Temperature unit</span>
              <div className="inline-flex overflow-hidden rounded-md border border-[var(--border)]">
                {["C", "F"].map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => switchUnit(u)}
                    className={`px-4 py-2 text-sm font-semibold transition ${
                      unit === u
                        ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "bg-[var(--background)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    °{u}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-4">
              <label className="block">
                <span className="text-sm font-semibold">Oven temperature (°{unit})</span>
                <input
                  type="number"
                  value={ovenTemp}
                  min={0}
                  step={5}
                  onChange={(event) => {
                    setOvenTemp(Number(event.target.value));
                    setActiveFood(null);
                  }}
                  className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold">Oven time (minutes)</span>
                <input
                  type="number"
                  value={ovenTime}
                  min={1}
                  onChange={(event) => {
                    setOvenTime(Number(event.target.value));
                    setActiveFood(null);
                  }}
                  className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>
            </div>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-sm font-semibold">Common oven recipes</span>
                <button
                  type="button"
                  onClick={() => {
                    setUnit("C");
                    setOvenTemp(200);
                    setOvenTime(30);
                    setActiveFood(null);
                  }}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)]"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </button>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 2xl:grid-cols-1">
                {ovenPresets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => applyOvenPreset(preset)}
                    className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-left text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                  >
                    {preset.label}
                    <span className="mt-0.5 block text-xs font-normal">
                      {unit === "C" ? `${preset.c}°C` : `${roundTo((preset.c * 9) / 5 + 32, 5)}°F`} · {preset.minutes} min
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 rounded-md bg-[var(--muted)] p-3 text-xs leading-5 text-[var(--muted-foreground)]">
              Air fryers vary between brands. Treat converted times as a starting point and check a few minutes early
              the first time you cook a dish.
            </div>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                {activeFood ? `Converted setting · ${activeFood.name}` : "Converted setting"}
              </p>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={copyReport} className="btn-secondary min-h-9 px-3 py-1.5 text-sm">
                  <Copy className="h-4 w-4" />
                  {copied ? "Copied" : "Copy"}
                </button>
                <button
                  type="button"
                  onClick={() => downloadTextFile("air-fryer-conversion.txt", report)}
                  className="btn-secondary min-h-9 px-3 py-1.5 text-sm"
                >
                  <FileDown className="h-4 w-4" />
                  Download
                </button>
              </div>
            </div>

            <div aria-live="polite" className="mt-4 grid items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
              <div className="rounded-lg border border-[var(--border)] bg-[var(--muted)] p-5">
                <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Oven recipe</p>
                <p className="mt-2 flex items-center gap-2 text-3xl font-semibold">
                  <Thermometer className="h-6 w-6 text-[var(--muted-foreground)]" />
                  {Number(ovenTemp) || 0}°{unit}
                </p>
                <p className="mt-1 flex items-center gap-2 text-lg font-semibold text-[var(--muted-foreground)]">
                  <Timer className="h-4 w-4" />
                  {Number(ovenTime) || 0} min
                </p>
              </div>
              <div className="flex justify-center">
                <ArrowRight className="h-7 w-7 rotate-90 text-[var(--primary)] sm:rotate-0" />
              </div>
              <div
                className="rounded-lg border border-[var(--primary)] p-5"
                style={{ background: "color-mix(in srgb, var(--primary) 8%, transparent)" }}
              >
                <p className="text-xs font-semibold uppercase text-[var(--primary)]">Air fryer setting</p>
                <p className="mt-2 flex items-center gap-2 text-3xl font-semibold text-[var(--primary)]">
                  <Thermometer className="h-6 w-6" />
                  {result.airTemp}°{unit}
                </p>
                <p className="mt-1 flex items-center gap-2 text-lg font-semibold">
                  <Timer className="h-4 w-4" />
                  {result.airTime} min
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
              Formula: air fryer temp = oven temp − {TEMP_DROP[unit]}°{unit} (rounded to nearest 5°) · air fryer time =
              oven time × 0.8 (rounded to the nearest minute).
              {result.timeSaved > 0 ? ` You save about ${result.timeSaved} min versus the oven.` : ""}
            </p>

            {result.overMax && (
              <div
                className="mt-4 flex items-start gap-2 rounded-md p-3 text-sm leading-6"
                style={{ background: "var(--anslation-ds-warning-soft)" }}
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--anslation-ds-warning)]" />
                <span>
                  Most basket air fryers max out at {MAX_AIR_TEMP[unit]}°{unit}. Set yours to max and add 2-3 extra
                  minutes instead.
                </span>
              </div>
            )}

            <div className="tool-compact-grid mt-6">
              <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                <p className="text-xs text-[var(--muted-foreground)]">Shake / flip</p>
                <p className="mt-1 text-sm font-semibold">
                  {activeFood ? activeFood.flip : `Around ${result.flipAt} min (halfway)`}
                </p>
              </div>
              <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                <p className="text-xs text-[var(--muted-foreground)]">Start checking at</p>
                <p className="mt-1 text-sm font-semibold">{result.checkAt} min</p>
              </div>
              <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                <p className="text-xs text-[var(--muted-foreground)]">Preheat</p>
                <p className="mt-1 text-sm font-semibold">3-5 min at cooking temp</p>
              </div>
            </div>

            {activeFood && (
              <p className="mt-4 rounded-md bg-[var(--muted)] p-3 text-sm leading-6 text-[var(--muted-foreground)]">
                Tip for {activeFood.name.toLowerCase()}: {activeFood.note}.
              </p>
            )}
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
          <h2 className="text-xl font-semibold">Air fryer cheat sheet</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Tried-and-tested settings for everyday foods. Press “Use” to load one into the converter.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase text-[var(--muted-foreground)]">
                  <th className="py-2 pr-4 font-semibold">Food</th>
                  <th className="py-2 pr-4 font-semibold">Temp</th>
                  <th className="py-2 pr-4 font-semibold">Time</th>
                  <th className="py-2 pr-4 font-semibold">Shake / flip</th>
                  <th className="py-2 font-semibold" aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {foodCheatSheet.map((food) => (
                  <tr key={food.id} className="border-b border-[var(--border)] last:border-b-0">
                    <td className="py-3 pr-4 font-semibold">{food.name}</td>
                    <td className="py-3 pr-4 whitespace-nowrap">
                      {unit === "C" ? `${food.c}°C` : `${food.f}°F`}
                    </td>
                    <td className="py-3 pr-4 whitespace-nowrap">{food.minutes} min</td>
                    <td className="py-3 pr-4 text-[var(--muted-foreground)]">{food.flip}</td>
                    <td className="py-3">
                      <button
                        type="button"
                        onClick={() => loadCheatSheetFood(food)}
                        className={`rounded-md border px-3 py-1.5 text-xs font-semibold transition ${
                          activeFood?.id === food.id
                            ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                            : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                        }`}
                      >
                        {activeFood?.id === food.id ? "Loaded" : "Use"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <ShieldCheck className="h-5 w-5 text-[var(--anslation-ds-success)]" />
              Safe internal temperatures
            </h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Colour and crispiness can mislead — an instant-read thermometer is the only reliable doneness check.
            </p>
            <ul className="mt-4 grid gap-2">
              {safetyTemps.map((item) => (
                <li
                  key={item.food}
                  className="flex items-center justify-between gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm"
                >
                  <span>{item.food}</span>
                  <span className="whitespace-nowrap font-semibold text-[var(--primary)]">
                    {item.c}°C / {item.f}°F{item.extra ? ` ${item.extra}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-6">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <h2 className="flex items-center gap-2 text-xl font-semibold">
                <Wind className="h-5 w-5 text-[var(--primary)]" />
                Why shake and flip?
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                An air fryer is a small convection oven — hot air must reach every surface. Shake basket foods (fries,
                veggies, nuggets) once or twice, and flip flat foods (wings, cutlets, fish) halfway for even browning.
                Keep everything in a single layer; stacked food steams instead of crisping.
              </p>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <h2 className="flex items-center gap-2 text-xl font-semibold">
                <Lightbulb className="h-5 w-5 text-[var(--anslation-ds-warning)]" />
                Cooking a bigger batch?
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                Time depends on airflow, not weight. If the basket is crowded, either cook in two batches (best for
                crispiness) or add 3-5 minutes and shake more often. When doubling a recipe, keep the same temperature —
                never raise it to “speed things up”, the outside will burn before the inside cooks.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
