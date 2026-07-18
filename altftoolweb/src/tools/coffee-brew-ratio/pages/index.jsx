"use client";

import { useMemo, useState } from "react";
import { Coffee, Copy, Droplets, Info, Lightbulb, RotateCcw, Scale, Thermometer, Timer } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const methods = [
  {
    id: "pour-over",
    name: "Pour-over",
    gear: "V60, Kalita, Chemex",
    ratioWeak: 18,
    ratioDefault: 16,
    ratioStrong: 14,
    absorption: 2,
    grind: "Medium — like table salt",
    temp: "92–96°C",
    time: "2:30 – 3:30 total",
    steps: [
      "Rinse the filter with hot water, then discard the rinse and add the grounds.",
      "Bloom: pour twice the coffee weight in water, swirl, and wait 30–45 seconds.",
      "Pour the rest in slow spirals, keeping the bed level and never letting it run dry.",
      "Aim to finish the drawdown by 3:30 — much slower means grind coarser.",
    ],
  },
  {
    id: "french-press",
    name: "French press",
    gear: "Cafetiere, plunger pot",
    ratioWeak: 17,
    ratioDefault: 15,
    ratioStrong: 12,
    absorption: 2,
    grind: "Coarse — like sea salt",
    temp: "93–96°C",
    time: "4:00 steep, then plunge",
    steps: [
      "Add grounds, pour all the water at once, and start a 4 minute timer.",
      "At 4:00 break the crust with a spoon and skim off the foam and floaters.",
      "Let it settle 5 more minutes, then press the plunger down slowly.",
      "Decant everything straight away — coffee left on the grounds keeps extracting.",
    ],
  },
  {
    id: "aeropress",
    name: "AeroPress",
    gear: "Standard or inverted",
    ratioWeak: 17,
    ratioDefault: 14,
    ratioStrong: 11,
    absorption: 1.8,
    grind: "Medium-fine — between salt and sugar",
    temp: "80–90°C",
    time: "1:00 – 2:00 steep, 30s press",
    steps: [
      "Add grounds, pour water to the top, and stir gently 3–4 times.",
      "Cap it and steep for 1–2 minutes. Longer steeps want a cooler pour.",
      "Press slowly and evenly — about 30 seconds of steady pressure.",
      "Stop pressing when you hear the hiss; that last bit is bitter.",
    ],
  },
  {
    id: "espresso",
    name: "Espresso",
    gear: "Pump machine, portafilter",
    ratioWeak: 2.5,
    ratioDefault: 2,
    ratioStrong: 1.5,
    absorption: 0,
    grind: "Fine — like powdered sugar",
    temp: "92–94°C",
    time: "25–30 seconds",
    steps: [
      "Dose into a dry basket, distribute evenly, then tamp level with firm pressure.",
      "Start the shot and the timer together, and weigh the cup as it pours.",
      "Stop at your target yield in grams, not by eye and not by the machine.",
      "Running fast and sour means grind finer; slow and bitter means grind coarser.",
    ],
    yieldNote:
      "Espresso ratios are dose-to-yield, not dose-to-water — 18 g in at 1:2 means 36 g of liquid espresso in the cup.",
  },
  {
    id: "cold-brew",
    name: "Cold brew concentrate",
    gear: "Jar, bottle, Toddy",
    ratioWeak: 8,
    ratioDefault: 5,
    ratioStrong: 4,
    absorption: 2.5,
    grind: "Coarse — like cracked pepper",
    temp: "Room temperature or fridge cold",
    time: "12–18 hours",
    steps: [
      "Combine grounds and cold water, stir until every ground is wet, and cover.",
      "Steep 12–18 hours. Room temperature is faster and rounder; the fridge is cleaner.",
      "Strain through a fine mesh, then again through a paper filter for clarity.",
      "This is concentrate — dilute 1:1 to 1:3 with water or milk before drinking.",
    ],
    yieldNote:
      "Coarse grounds soak up a lot, so a 1:5 brew hands back noticeably less liquid than you poured in.",
  },
  {
    id: "moka",
    name: "Moka pot",
    gear: "Stovetop, Bialetti",
    ratioWeak: 12,
    ratioDefault: 10,
    ratioStrong: 8,
    absorption: 1.5,
    grind: "Fine-medium — finer than pour-over, coarser than espresso",
    temp: "Start with pre-boiled water, about 95°C",
    time: "4–5 minutes on low heat",
    steps: [
      "Fill the base with pre-boiled water to just below the valve — it stops the coffee scorching.",
      "Level the grounds in the basket. Do not tamp; moka pots are not espresso machines.",
      "Assemble with a towel, put it on low heat, and leave the lid open.",
      "Pull it off the heat the moment it gurgles, and cool the base under a tap.",
    ],
  },
  {
    id: "south-indian-filter",
    name: "South Indian filter",
    gear: "Steel drip filter, kaapi",
    ratioWeak: 16,
    ratioDefault: 14,
    ratioStrong: 10,
    absorption: 2,
    grind: "Fine — slightly coarser than espresso",
    temp: "90–95°C",
    time: "10–20 minutes to drip",
    steps: [
      "Spoon the grounds into the upper chamber and press level with the disc.",
      "Pour just-off-the-boil water in, cover, and leave it alone to drip.",
      "Give it 10–20 minutes. Rushing it or pressing harder only makes it bitter.",
      "Serve roughly 1 part decoction to 3 parts hot milk, then pull it between tumbler and dabara.",
    ],
    yieldNote:
      "This gives a drinkable decoction that takes milk well. Slide towards strong for a thick decoction you dilute more.",
  },
];

const cupPresets = [
  { label: "Espresso", ml: 30 },
  { label: "Small cup", ml: 150 },
  { label: "Mug", ml: 240 },
  { label: "Large mug", ml: 350 },
];

const formatNumber = (value, digits = 0) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: digits }).format(
    Number.isFinite(value) && value > 0 ? value : 0
  );

const ratioFor = (method, strength) => {
  if (strength <= 50) {
    return method.ratioWeak + ((method.ratioDefault - method.ratioWeak) * strength) / 50;
  }
  return method.ratioDefault + ((method.ratioStrong - method.ratioDefault) * (strength - 50)) / 50;
};

const strengthLabel = (value) => {
  if (value < 20) return "Very mild";
  if (value < 40) return "Mild";
  if (value < 61) return "Balanced";
  if (value < 81) return "Strong";
  return "Intense";
};

export default function ToolHome() {
  const [methodId, setMethodId] = useState("pour-over");
  const [strength, setStrength] = useState(50);
  const [mode, setMode] = useState("dose");
  const [doseInput, setDoseInput] = useState("20");
  const [cups, setCups] = useState("2");
  const [cupSize, setCupSize] = useState("240");
  const [copied, setCopied] = useState(false);

  const method = useMemo(
    () => methods.find((item) => item.id === methodId) || methods[0],
    [methodId]
  );

  const ratio = ratioFor(method, strength);
  const netRatio = Math.max(ratio - method.absorption, 0.5);

  const targetVolume = (Number(cups) || 0) * (Number(cupSize) || 0);

  const dose =
    mode === "dose" ? Math.max(Number(doseInput) || 0, 0) : targetVolume > 0 ? targetVolume / netRatio : 0;

  const water = dose * ratio;
  const brewedYield = dose * netRatio;
  const tablespoons = dose / 5.5;

  const recipe = useMemo(
    () =>
      [
        `${method.name} — 1:${formatNumber(ratio, 1)} (${strengthLabel(strength)})`,
        `Coffee: ${formatNumber(dose, 1)} g (about ${formatNumber(tablespoons, 1)} tbsp)`,
        `Water: ${formatNumber(water, 0)} ml`,
        `In the cup: about ${formatNumber(brewedYield, 0)} ml`,
        `Grind: ${method.grind}`,
        `Water temperature: ${method.temp}`,
        `Brew time: ${method.time}`,
        "",
        ...method.steps.map((step, index) => `${index + 1}. ${step}`),
      ].join("\n"),
    [method, ratio, strength, dose, tablespoons, water, brewedYield]
  );

  const selectMethod = (id) => {
    setMethodId(id);
    setStrength(50);
  };

  const reset = () => {
    setMethodId("pour-over");
    setStrength(50);
    setMode("dose");
    setDoseInput("20");
    setCups("2");
    setCupSize("240");
  };

  const copyRecipe = async () => {
    const success = await safeCopyText(recipe);
    if (!success) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Coffee className="h-4 w-4" />
            Brew calculator
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Coffee Brew Ratio Calculator</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Pick your brewer, dial the strength, and get the exact dose and water — plus the grind, temperature
            and timing that actually make the ratio work.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[390px_1fr]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-sm font-semibold">Brew method</span>
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
            </div>

            <div className="grid gap-2">
              {methods.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectMethod(item.id)}
                  className={`rounded-md border px-3 py-2.5 text-left transition ${
                    methodId === item.id
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]"
                  }`}
                >
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="text-sm font-semibold">{item.name}</span>
                    <span className="text-xs font-semibold">1:{formatNumber(item.ratioDefault, 1)}</span>
                  </span>
                  <span
                    className={`mt-0.5 block text-xs ${
                      methodId === item.id
                        ? "text-[var(--primary-foreground)] opacity-80"
                        : "text-[var(--muted-foreground)]"
                    }`}
                  >
                    {item.gear}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-5">
              <label className="block">
                <span className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-semibold">Strength</span>
                  <span className="text-xs font-semibold text-[var(--primary)]">
                    {strengthLabel(strength)} · 1:{formatNumber(ratio, 1)}
                  </span>
                </span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={strength}
                  onChange={(event) => setStrength(Number(event.target.value))}
                  className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-[var(--muted)]"
                  style={{ accentColor: "var(--primary)" }}
                />
              </label>
              <div className="mt-1.5 flex justify-between text-xs text-[var(--muted-foreground)]">
                <span>Weak · 1:{formatNumber(method.ratioWeak, 1)}</span>
                <span>Strong · 1:{formatNumber(method.ratioStrong, 1)}</span>
              </div>
              <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
                The midpoint is the accepted default for a {method.name.toLowerCase()}. Nudge it, taste, and
                nudge again — this is a starting line, not a rule.
              </p>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="mb-4 grid gap-2 sm:grid-cols-2">
                {[
                  ["dose", "I have this much coffee"],
                  ["volume", "I want this much coffee"],
                ].map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setMode(id)}
                    className={`rounded-md border px-3 py-3 text-sm font-semibold transition ${
                      mode === id
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {mode === "dose" ? (
                <label className="block">
                  <span className="text-sm font-semibold">Coffee dose (grams)</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="any"
                    value={doseInput}
                    onChange={(event) => setDoseInput(event.target.value)}
                    className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                  />
                  <span className="mt-1.5 block text-xs text-[var(--muted-foreground)]">
                    About {formatNumber(tablespoons, 1)} level tablespoons of ground coffee.
                  </span>
                </label>
              ) : (
                <div className="grid gap-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-sm font-semibold">Cups</span>
                      <input
                        type="number"
                        inputMode="numeric"
                        min="1"
                        step="1"
                        value={cups}
                        onChange={(event) => setCups(event.target.value)}
                        className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm font-semibold">Cup size (ml)</span>
                      <input
                        type="number"
                        inputMode="numeric"
                        min="1"
                        step="5"
                        value={cupSize}
                        onChange={(event) => setCupSize(event.target.value)}
                        className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                      />
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {cupPresets.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setCupSize(String(preset.ml))}
                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                          Number(cupSize) === preset.ml
                            ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                            : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                        }`}
                      >
                        {preset.label} · {preset.ml} ml
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Target in the cup: {formatNumber(targetVolume, 0)} ml. The grounds keep some water, so the
                    dose below is worked back from what you actually drink.
                  </p>
                </div>
              )}

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                  {method.name} · 1:{formatNumber(ratio, 1)} · {strengthLabel(strength)}
                </p>
                <button
                  type="button"
                  onClick={copyRecipe}
                  className="btn-secondary min-h-9 px-3 py-1.5 text-sm"
                >
                  <Copy className="h-4 w-4" />
                  {copied ? "Copied" : "Copy recipe"}
                </button>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2" aria-live="polite">
                <div className="rounded-lg bg-[var(--muted)] p-5">
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                    <Scale className="h-3.5 w-3.5" />
                    Coffee
                  </p>
                  <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
                    {formatNumber(dose, 1)} g
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    ≈ {formatNumber(tablespoons, 1)} tbsp
                  </p>
                </div>
                <div className="rounded-lg bg-[var(--muted)] p-5">
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                    <Droplets className="h-3.5 w-3.5" />
                    Water
                  </p>
                  <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
                    {formatNumber(water, 0)} ml
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    ≈ {formatNumber(brewedYield, 0)} ml in the cup
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                    Brew strength
                  </p>
                  <p className="text-xs font-semibold text-[var(--primary)]">{strengthLabel(strength)}</p>
                </div>
                <div className="relative mt-2 h-3 overflow-hidden rounded-full border border-[var(--border)]">
                  <div
                    className="absolute inset-y-0 left-0"
                    style={{ width: `${strength}%`, background: "var(--primary)" }}
                  />
                </div>
                <div className="mt-1.5 flex justify-between text-xs text-[var(--muted-foreground)]">
                  <span>Tea-like</span>
                  <span>Balanced</span>
                  <span>Syrupy</span>
                </div>
              </div>

              <div className="tool-compact-grid mt-5">
                {[
                  [Scale, "Grind size", method.grind],
                  [Thermometer, "Water temperature", method.temp],
                  [Timer, "Brew time", method.time],
                ].map(([Icon, label, value]) => (
                  <div
                    key={label}
                    className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
                  >
                    <p className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
                      <Icon className="h-3.5 w-3.5" />
                      {label}
                    </p>
                    <p className="mt-1 text-sm font-semibold">{value}</p>
                  </div>
                ))}
              </div>

              <p className="mt-5 text-sm leading-6 text-[var(--muted-foreground)]">
                Formula: water = coffee x ratio, so {formatNumber(dose, 1)} g x {formatNumber(ratio, 1)} ={" "}
                {formatNumber(water, 0)} ml.
                {method.absorption > 0
                  ? ` The grounds hold back roughly ${method.absorption} ml per gram, which is why about ${formatNumber(
                      brewedYield,
                      0
                    )} ml reaches the cup.`
                  : ""}
              </p>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex items-center gap-2">
                <Coffee className="h-4 w-4 text-[var(--primary)]" />
                <h2 className="text-lg font-semibold">How to brew it — {method.name}</h2>
              </div>
              <ol className="mt-4 grid gap-3">
                {method.steps.map((step, index) => (
                  <li key={step} className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--muted)] text-xs font-semibold text-[var(--primary)]">
                      {index + 1}
                    </span>
                    <span className="text-sm leading-6 text-[var(--muted-foreground)]">{step}</span>
                  </li>
                ))}
              </ol>
              {method.yieldNote && (
                <div className="mt-4 flex items-start gap-2 rounded-md bg-[var(--muted)] p-4">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" />
                  <p className="text-sm leading-6 text-[var(--muted-foreground)]">{method.yieldNote}</p>
                </div>
              )}
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-[var(--primary)]" />
                <h2 className="text-lg font-semibold">No scale? Use tablespoons</h2>
              </div>
              <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                One level tablespoon of ground coffee is roughly 5–6 g — call it 5 g for a fine grind and 6 g
                for a coarse one. That puts your {formatNumber(dose, 1)} g dose at about{" "}
                {formatNumber(dose / 6, 1)}–{formatNumber(dose / 5, 1)} tablespoons.
              </p>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[420px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-xs uppercase text-[var(--muted-foreground)]">
                      <th className="pb-2 pr-3 font-semibold">Tablespoons</th>
                      <th className="pb-2 pr-3 font-semibold">Coffee</th>
                      <th className="pb-2 pr-3 font-semibold">Water at 1:{formatNumber(ratio, 1)}</th>
                      <th className="pb-2 font-semibold">In the cup</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3, 4, 5, 6].map((spoons) => {
                      const grams = spoons * 5.5;
                      return (
                        <tr key={spoons} className="border-b border-[var(--border)] last:border-0">
                          <td className="py-2.5 pr-3 font-semibold">{spoons} tbsp</td>
                          <td className="py-2.5 pr-3 text-[var(--primary)]">{formatNumber(grams, 1)} g</td>
                          <td className="py-2.5 pr-3 text-[var(--muted-foreground)]">
                            {formatNumber(grams * ratio, 0)} ml
                          </td>
                          <td className="py-2.5 text-[var(--muted-foreground)]">
                            {formatNumber(grams * netRatio, 0)} ml
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
                Spoons are a fallback, not a method — a tablespoon of light-roast beans and a tablespoon of oily
                dark roast can differ by 2 g, which is a whole ratio point on a single-cup brew. A ₹500 kitchen
                scale is the cheapest upgrade in coffee.
              </p>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-[var(--primary)]" />
                <h2 className="text-lg font-semibold">Reading your cup</h2>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  [
                    "Sour, thin, salty",
                    "Under-extracted. Grind finer, brew hotter, or give it longer. Adding more coffee will not fix it — that just makes a stronger sour cup.",
                  ],
                  [
                    "Bitter, drying, harsh",
                    "Over-extracted. Grind coarser, cool the water a few degrees, or shorten the brew.",
                  ],
                  [
                    "Correct but weak",
                    "Extraction is fine, concentration is not. This is the one the ratio actually fixes — push the strength slider up.",
                  ],
                  [
                    "Ratio is not strength alone",
                    "The ratio sets how much coffee is in the water. Grind, time and temperature set how much of the coffee got out. They are different dials, and most bad cups come from turning the wrong one.",
                  ],
                  [
                    "Water is 98% of the drink",
                    "Filtered water with some mineral content beats both distilled and hard tap water. If your coffee tastes flat everywhere, it is probably the water.",
                  ],
                  [
                    "Fresh beans, late grind",
                    "Beans 3–21 days off roast, ground right before brewing. Pre-ground coffee is stale within the hour, and no ratio rescues it.",
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
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
