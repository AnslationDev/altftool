"use client";

import { useMemo, useState } from "react";
import {
  Bell,
  ChevronDown,
  ChevronUp,
  CookingPot,
  Copy,
  Droplets,
  FileDown,
  Gauge,
  Mountain,
  Timer,
  Wind,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const FOODS = [
  { id: "toor", group: "Dal & lentils", name: "Toor / arhar dal (unsoaked)", whistles: "3-4", whistlesMid: 3.5, minutes: "8-10", minutesMid: 9, release: "natural", water: "1 : 3", note: "Mash-soft base for dal fry and sambar" },
  { id: "moong", group: "Dal & lentils", name: "Moong dal (yellow, split)", whistles: "2-3", whistlesMid: 2.5, minutes: "6-8", minutesMid: 7, release: "natural", water: "1 : 2.5", note: "The fastest-cooking dal" },
  { id: "masoor", group: "Dal & lentils", name: "Masoor dal (red)", whistles: "2-3", whistlesMid: 2.5, minutes: "5-6", minutesMid: 5.5, release: "natural", water: "1 : 2.5", note: "Softens quickly; great for everyday dal" },
  { id: "chana-dal", group: "Dal & lentils", name: "Chana dal (soaked 30 min)", whistles: "4-5", whistlesMid: 4.5, minutes: "12-15", minutesMid: 13, release: "natural", water: "1 : 3", note: "Soak 30 min so grains cook evenly" },
  { id: "urad", group: "Dal & lentils", name: "Whole urad dal (soaked 4-6 hrs)", whistles: "5-6", whistlesMid: 5.5, minutes: "14-16", minutesMid: 15, release: "natural", water: "1 : 3.5", note: "Base for dal makhani" },
  { id: "white-rice", group: "Rice & grains", name: "White rice", whistles: "2", whistlesMid: 2, minutes: "5-6", minutesMid: 5.5, release: "natural", water: "1 : 2", note: "Count from the first whistle on medium heat" },
  { id: "basmati", group: "Rice & grains", name: "Basmati rice (soaked 20 min)", whistles: "1-2", whistlesMid: 1.5, minutes: "4-5", minutesMid: 4.5, release: "natural", water: "1 : 1.5", note: "Soaking keeps the grains long and separate" },
  { id: "brown-rice", group: "Rice & grains", name: "Brown rice", whistles: "4-5", whistlesMid: 4.5, minutes: "20-22", minutesMid: 21, release: "natural", water: "1 : 2.25", note: "Older stock may need one extra whistle" },
  { id: "chole", group: "Chana, rajma & beans", name: "Kabuli chana / chole (soaked overnight)", whistles: "5-6", whistlesMid: 5.5, minutes: "18-20", minutesMid: 19, release: "natural", water: "Cover by 5 cm", note: "Soak 8 hours; pinch of soda softens hard water" },
  { id: "kala-chana", group: "Chana, rajma & beans", name: "Kala chana (soaked overnight)", whistles: "6-7", whistlesMid: 6.5, minutes: "22-25", minutesMid: 23, release: "natural", water: "Cover by 5 cm", note: "Firmer than kabuli chana" },
  { id: "rajma", group: "Chana, rajma & beans", name: "Rajma (soaked overnight)", whistles: "5-6", whistlesMid: 5.5, minutes: "20-25", minutesMid: 22, release: "natural", water: "Cover by 5 cm", note: "Never quick-release beans — foam can clog the vent" },
  { id: "potato-whole", group: "Potatoes & vegetables", name: "Potatoes, whole medium", whistles: "3-4", whistlesMid: 3.5, minutes: "10-12", minutesMid: 11, release: "quick", water: "1 cup below rack", note: "Pierce once so skins don't split" },
  { id: "potato-cubed", group: "Potatoes & vegetables", name: "Potatoes, cubed", whistles: "2", whistlesMid: 2, minutes: "4-5", minutesMid: 4.5, release: "quick", water: "1 cup", note: "For sabzi and mash" },
  { id: "mixed-veg", group: "Potatoes & vegetables", name: "Mixed vegetables", whistles: "1-2", whistlesMid: 1.5, minutes: "2-3", minutesMid: 2.5, release: "quick", water: "1 cup", note: "Release right away or they turn mushy" },
  { id: "beetroot", group: "Potatoes & vegetables", name: "Beetroot, whole", whistles: "4-5", whistlesMid: 4.5, minutes: "15-18", minutesMid: 16, release: "quick", water: "1 cup below rack", note: "Skins slip off after cooking" },
  { id: "chicken", group: "Meat", name: "Chicken, curry cut", whistles: "2-3", whistlesMid: 2.5, minutes: "8-10", minutesMid: 9, release: "natural", water: "1 cup liquid", note: "Bone-in pieces add flavour; easy to overcook" },
  { id: "mutton", group: "Meat", name: "Mutton / goat, curry cut", whistles: "5-6", whistlesMid: 5.5, minutes: "20-25", minutesMid: 22, release: "natural", water: "1-1.5 cups liquid", note: "Cook until fork-tender" },
  { id: "keema", group: "Meat", name: "Keema (minced meat)", whistles: "2-3", whistlesMid: 2.5, minutes: "8-9", minutesMid: 8.5, release: "natural", water: "0.5-1 cup", note: "Brown it first for better texture" },
];

const FOOD_GROUPS = [...new Set(FOODS.map((food) => food.group))];

const CUSTOM_CATEGORIES = [
  { id: "soup", label: "Soup / stew / curry", divisor: 3, release: "natural" },
  { id: "beans", label: "Dried beans & legumes (soaked)", divisor: 3, release: "natural" },
  { id: "meat", label: "Tough meat braise", divisor: 3, release: "natural" },
  { id: "root", label: "Root vegetables", divisor: 3, release: "quick" },
  { id: "tender", label: "Tender vegetables", divisor: 4, release: "quick" },
];

const CITY_PRESETS = [
  { label: "Mumbai", alt: 14 },
  { label: "Delhi", alt: 216 },
  { label: "Bengaluru", alt: 920 },
  { label: "Shimla", alt: 2276 },
  { label: "Leh", alt: 3524 },
];

const whistlesFromMinutes = (minutes) => Math.max(1, Math.round(minutes / 3.5));

function ReleaseChip({ release }) {
  const natural = release === "natural";
  return (
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{
        background: natural ? "var(--anslation-ds-info-soft)" : "var(--anslation-ds-warning-soft)",
        color: natural ? "var(--anslation-ds-info)" : "var(--anslation-ds-warning)",
      }}
    >
      <Wind className="h-3 w-3" />
      {natural ? "Natural release" : "Quick release"}
    </span>
  );
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

export default function ToolHome() {
  const [mode, setMode] = useState("food");
  const [foodId, setFoodId] = useState("toor");
  const [customMinutes, setCustomMinutes] = useState(60);
  const [categoryId, setCategoryId] = useState("soup");
  const [altOpen, setAltOpen] = useState(false);
  const [altitude, setAltitude] = useState(0);
  const [copied, setCopied] = useState(false);

  const food = FOODS.find((item) => item.id === foodId) || FOODS[0];
  const category = CUSTOM_CATEGORIES.find((item) => item.id === categoryId) || CUSTOM_CATEGORIES[0];

  const altMult = useMemo(() => {
    const alt = Number(altitude) || 0;
    return alt > 600 ? 1 + ((alt - 600) / 300) * 0.05 : 1;
  }, [altitude]);
  const altPct = Math.round((altMult - 1) * 100);

  const result = useMemo(() => {
    if (mode === "food") {
      const baseMinutes = food.minutesMid;
      const adjMinutes = Math.round(baseMinutes * altMult);
      const adjWhistles = Math.max(1, Math.round(food.whistlesMid * altMult));
      return {
        title: food.name,
        whistles: food.whistles,
        minutes: food.minutes,
        adjMinutes,
        adjWhistles,
        release: food.release,
        water: food.water,
        note: food.note,
        formula: "Chart values for a standard 3-5 L stovetop cooker and an electric cooker on high pressure.",
      };
    }
    const conventional = Math.max(0, Number(customMinutes) || 0);
    const electric = Math.max(1, Math.ceil(conventional / category.divisor));
    const adjMinutes = Math.max(1, Math.round(electric * altMult));
    return {
      title: `${category.label} · ${conventional} min conventional`,
      whistles: `≈ ${whistlesFromMinutes(electric)}`,
      minutes: `≈ ${electric}`,
      adjMinutes,
      adjWhistles: whistlesFromMinutes(adjMinutes),
      release: category.release,
      water: "At least 1 cup (250 mL) liquid",
      note: "Rule of thumb — start here, then fine-tune to taste next time.",
      formula: `Formula: pressure-cooker minutes ≈ conventional time ÷ ${category.divisor} · whistles ≈ minutes ÷ 3.5`,
    };
  }, [altMult, category, customMinutes, food, mode]);

  const showAltitude = altPct !== 0;

  const reportLines = useMemo(
    () =>
      [
        "Pressure Cooker Conversion",
        `Item: ${result.title}`,
        `Stovetop cooker: ${result.whistles} whistles`,
        `Electric (Instant-Pot style): ${result.minutes} min at high pressure`,
        showAltitude
          ? `Altitude ${Number(altitude) || 0} m (+${altPct}%): ≈ ${result.adjWhistles} whistles / ${result.adjMinutes} min`
          : null,
        `Release: ${result.release === "natural" ? "Natural release" : "Quick release"}`,
        `Water: ${result.water}`,
        result.formula,
      ].filter(Boolean),
    [altPct, altitude, result, showAltitude]
  );

  const buildReport = () => [...reportLines, `Generated: ${new Date().toLocaleString()}`].join("\n");

  const copyReport = async () => {
    const success = await safeCopyText(buildReport());
    if (!success) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <CookingPot className="h-4 w-4" />
            Indian kitchen converter
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Pressure Cooker Time Converter</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Get whistle counts for your stovetop cooker and minutes for an Instant-Pot-style electric cooker — from a
            real chart of dals, rice, chana, rajma, vegetables and meat, or from any conventional recipe time. Includes
            altitude adjustment for hill stations.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[390px_1fr]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "food", label: "Food picker" },
                { id: "custom", label: "Custom time" },
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

            {mode === "food" ? (
              <label className="mt-5 block">
                <span className="text-sm font-semibold">What are you cooking?</span>
                <select
                  value={foodId}
                  onChange={(event) => setFoodId(event.target.value)}
                  className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                >
                  {FOOD_GROUPS.map((group) => (
                    <optgroup key={group} label={group}>
                      {FOODS.filter((item) => item.group === group).map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </label>
            ) : (
              <div className="mt-5 grid gap-4">
                <label className="block">
                  <span className="text-sm font-semibold">Conventional cook time (minutes)</span>
                  <input
                    type="number"
                    value={customMinutes}
                    min={1}
                    onChange={(event) => setCustomMinutes(Number(event.target.value))}
                    className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                  />
                  <span className="mt-1 block text-xs text-[var(--muted-foreground)]">
                    The simmer / oven time the original recipe asks for
                  </span>
                </label>
                <label className="block">
                  <span className="text-sm font-semibold">Type of dish</span>
                  <select
                    value={categoryId}
                    onChange={(event) => setCategoryId(event.target.value)}
                    className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                  >
                    {CUSTOM_CATEGORIES.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label} (÷{item.divisor})
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )}

            <div className="mt-5 rounded-md border border-[var(--border)] bg-[var(--background)]">
              <button
                type="button"
                onClick={() => setAltOpen((open) => !open)}
                aria-expanded={altOpen}
                className="flex w-full items-center justify-between gap-2 px-4 py-3 text-sm font-semibold"
              >
                <span className="inline-flex items-center gap-2">
                  <Mountain className="h-4 w-4 text-[var(--primary)]" />
                  Altitude adjustment
                  {showAltitude && <span className="text-xs font-semibold text-[var(--primary)]">+{altPct}%</span>}
                </span>
                {altOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {altOpen && (
                <div className="border-t border-[var(--border)] px-4 py-4">
                  <label className="block">
                    <span className="text-xs font-semibold text-[var(--muted-foreground)]">Your altitude (metres)</span>
                    <input
                      type="number"
                      value={altitude}
                      min={0}
                      step={50}
                      onChange={(event) => setAltitude(Number(event.target.value))}
                      className="mt-1.5 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                    />
                  </label>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {CITY_PRESETS.map((city) => (
                      <button
                        key={city.label}
                        type="button"
                        onClick={() => setAltitude(city.alt)}
                        className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                          Number(altitude) === city.alt
                            ? "border-[var(--primary)] text-[var(--primary)]"
                            : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                        }`}
                      >
                        {city.label} · {city.alt} m
                      </button>
                    ))}
                  </div>
                  <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
                    Water boils cooler up high, so pressure cooking slows down: add 5% time for every 300 m above
                    600 m. Below 600 m no change is needed.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">{result.title}</p>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={copyReport} className="btn-secondary min-h-9 px-3 py-1.5 text-sm">
                  <Copy className="h-4 w-4" />
                  {copied ? "Copied" : "Copy"}
                </button>
                <button
                  type="button"
                  onClick={() => downloadTextFile("pressure-cooker-conversion.txt", buildReport())}
                  className="btn-secondary min-h-9 px-3 py-1.5 text-sm"
                >
                  <FileDown className="h-4 w-4" />
                  Download
                </button>
              </div>
            </div>

            <div aria-live="polite" className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-[var(--muted)] p-5">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                  <Bell className="h-4 w-4" />
                  Stovetop cooker
                </p>
                <p className="mt-2 text-4xl font-semibold text-[var(--primary)]">{result.whistles}</p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">whistles on medium heat</p>
              </div>
              <div className="rounded-lg bg-[var(--muted)] p-5">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                  <Timer className="h-4 w-4" />
                  Electric cooker
                </p>
                <p className="mt-2 text-4xl font-semibold text-[var(--primary)]">{result.minutes}</p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">minutes at high pressure</p>
              </div>
            </div>

            {showAltitude && (
              <div
                className="mt-3 flex items-start gap-2 rounded-md p-3 text-sm leading-6"
                style={{ background: "var(--anslation-ds-info-soft)" }}
              >
                <Mountain className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--anslation-ds-info)" }} />
                <span>
                  At {Number(altitude) || 0} m (+{altPct}% time): use about{" "}
                  <strong>{result.adjWhistles} whistles</strong> or <strong>{result.adjMinutes} min</strong> electric.
                </span>
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <ReleaseChip release={result.release} />
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-2.5 py-1 text-xs font-semibold text-[var(--muted-foreground)]">
                <Droplets className="h-3 w-3" />
                Water: {result.water}
              </span>
            </div>

            <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">{result.note}</p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{result.formula}</p>

            <div className="tool-compact-grid mt-6">
              <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                <p className="text-xs text-[var(--muted-foreground)]">1 whistle ≈</p>
                <p className="mt-1 text-sm font-semibold">3-4 min at pressure</p>
              </div>
              <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                <p className="text-xs text-[var(--muted-foreground)]">Start counting from</p>
                <p className="mt-1 text-sm font-semibold">the first whistle</p>
              </div>
              <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                <p className="text-xs text-[var(--muted-foreground)]">Minimum liquid</p>
                <p className="mt-1 text-sm font-semibold">1 cup (250 mL)</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
          <h2 className="text-xl font-semibold">Whistle & minute chart</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Everyday Indian staples with stovetop whistles, electric minutes and the right release method.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase text-[var(--muted-foreground)]">
                  <th className="py-2 pr-4 font-semibold">Food</th>
                  <th className="py-2 pr-4 font-semibold">Whistles</th>
                  <th className="py-2 pr-4 font-semibold">Electric (min)</th>
                  <th className="py-2 pr-4 font-semibold">Release</th>
                  <th className="py-2 pr-4 font-semibold">Water</th>
                  <th className="py-2 font-semibold" aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {FOOD_GROUPS.map((group) => (
                  <FoodGroupRows
                    key={group}
                    group={group}
                    foods={FOODS.filter((item) => item.group === group)}
                    activeId={mode === "food" ? foodId : null}
                    onSelect={(id) => {
                      setFoodId(id);
                      setMode("food");
                    }}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Bell className="h-5 w-5 text-[var(--primary)]" />
              Whistle ≈ minutes
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
              The first whistle just means pressure has been reached — it can take 5-10 minutes and isn&apos;t counted.
              From the first whistle, lower the flame to medium and start timing: each whistle after that is roughly
              3-4 minutes under pressure. Electric cookers count only minutes at full pressure and run at slightly
              lower pressure than a stovetop cooker, so their timings run a little longer.
            </p>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Wind className="h-5 w-5 text-[var(--primary)]" />
              Natural vs quick release
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
              <strong>Natural release:</strong> switch off and wait 10-15 minutes for the pressure pin to drop on its
              own. Food keeps cooking gently — best for dals, beans, rice and meat. <strong>Quick release:</strong>{" "}
              vent immediately (turn the valve, or lift the whistle with tongs, steam pointed away from you) — best for
              vegetables. Never quick-release foamy foods like dal and rajma; the froth can clog the vent.
            </p>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Gauge className="h-5 w-5 text-[var(--primary)]" />
              Water rules
            </h2>
            <ul className="mt-2 grid gap-1.5 text-sm leading-6 text-[var(--muted-foreground)]">
              <li>Always at least 1 cup (250 mL) liquid — steam is what builds pressure.</li>
              <li>Never fill past ⅔ of the cooker; only ½ for foamy dals and beans.</li>
              <li>Dal 1 : 2.5-3 · white rice 1 : 2 · soaked basmati 1 : 1.5 · brown rice 1 : 2¼.</li>
              <li>Soaked rajma and chole: water 5 cm above the beans.</li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}

function FoodGroupRows({ group, foods, activeId, onSelect }) {
  return (
    <>
      <tr>
        <td colSpan={6} className="pb-1 pt-4 text-xs font-semibold uppercase text-[var(--primary)]">
          {group}
        </td>
      </tr>
      {foods.map((food) => (
        <tr
          key={food.id}
          className="border-b border-[var(--border)] last:border-b-0"
          style={activeId === food.id ? { background: "color-mix(in srgb, var(--primary) 6%, transparent)" } : undefined}
        >
          <td className="py-3 pr-4">
            <span className="font-semibold">{food.name}</span>
            <span className="mt-0.5 block text-xs text-[var(--muted-foreground)]">{food.note}</span>
          </td>
          <td className="py-3 pr-4 whitespace-nowrap font-semibold">{food.whistles}</td>
          <td className="py-3 pr-4 whitespace-nowrap">{food.minutes}</td>
          <td className="py-3 pr-4">
            <ReleaseChip release={food.release} />
          </td>
          <td className="py-3 pr-4 whitespace-nowrap text-[var(--muted-foreground)]">{food.water}</td>
          <td className="py-3">
            <button
              type="button"
              onClick={() => onSelect(food.id)}
              className={`rounded-md border px-3 py-1.5 text-xs font-semibold transition ${
                activeId === food.id
                  ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--foreground)]"
              }`}
            >
              {activeId === food.id ? "Loaded" : "Use"}
            </button>
          </td>
        </tr>
      ))}
    </>
  );
}
