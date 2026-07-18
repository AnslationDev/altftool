"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ChefHat,
  CookingPot,
  Copy,
  Droplets,
  FileDown,
  Gauge,
  ListChecks,
  Soup,
  Timer,
  Utensils,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";
import { CUP_ML, GRAINS, METHOD_TABS } from "../data";

const nf1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const nf2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const toNum = (value) => {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
};

const fmt1 = (value) => nf1.format(Number.isFinite(value) ? value : 0);
const fmt2 = (value) => nf2.format(Number.isFinite(value) ? value : 0);
const roundMl = (value) => Math.round(value / 5) * 5;

function downloadTextFile(filename, content) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

const TAB_ICONS = { pot: CookingPot, pressure: Gauge, cooker: Timer };

export default function ToolHome() {
  const [grainId, setGrainId] = useState("basmati");
  const [unit, setUnit] = useState("cups");
  const [amount, setAmount] = useState("1");
  const [people, setPeople] = useState(2);
  const [tab, setTab] = useState("pot");
  const [copied, setCopied] = useState(false);

  const grain = GRAINS.find((item) => item.id === grainId) || GRAINS[0];
  const method = grain.methods[tab];

  const calc = useMemo(() => {
    const qty = Math.max(toNum(amount), 0);
    const cups = unit === "cups" ? qty : qty / grain.gramsPerCup;
    const rawG = unit === "grams" ? qty : qty * grain.gramsPerCup;
    const ratio = method?.ratio ?? 0;
    const waterCups = cups * ratio;
    const waterMl = roundMl(waterCups * CUP_ML);
    const cookedG = rawG * grain.cookedMultiplier;
    const serves = grain.perPersonG > 0 ? rawG / grain.perPersonG : 0;
    return { qty, cups, rawG, ratio, waterCups, waterMl, cookedG, serves };
  }, [amount, unit, grain, method]);

  const qtyLabel =
    unit === "cups"
      ? `${fmt2(calc.qty)} cup${calc.qty === 1 ? "" : "s"} (${fmt1(calc.rawG)} g raw)`
      : `${fmt1(calc.rawG)} g raw (${fmt2(calc.cups)} cups)`;

  const steps = useMemo(() => {
    if (grain.noCook) return grain.noCook.steps;
    if (method?.unsuitable) return [];
    const list = [`Rinse: ${grain.rinse}`];
    if (grain.soak && !/^No soak|^None|^No rinsing/.test(grain.soak)) list.push(`Soak: ${grain.soak}`);
    list.push(
      `Measure ${calc.waterMl} ml water (${fmt2(calc.waterCups)} cups) for ${qtyLabel} — ratio 1 : ${calc.ratio} by volume.`
    );
    if (tab === "pot") list.push(`Cook: ${method.time}.`);
    if (tab === "pressure") list.push(`Pressure cook: ${method.whistles}.`);
    if (tab === "cooker") list.push(`Rice cooker: ${method.note}`);
    list.push("Rest 10 min with the lid on, then fluff gently with a fork — never stir hot grains.");
    return list;
  }, [grain, method, tab, calc, qtyLabel]);

  const report = useMemo(() => {
    const lines = [
      "Rice & Grain Water Ratio Guide",
      `Grain: ${grain.name}`,
      `Quantity: ${qtyLabel} — serves ~${fmt1(calc.serves)}`,
      `Method: ${METHOD_TABS.find((item) => item.id === tab)?.label}`,
    ];
    if (grain.noCook) {
      lines.push("Water: no measured water — rinse and drain only");
    } else if (method?.unsuitable) {
      lines.push(`Note: ${method.unsuitable}`);
    } else {
      lines.push(`Water: ${calc.waterMl} ml (${fmt2(calc.waterCups)} cups) — ratio 1 : ${calc.ratio}`);
    }
    lines.push(`Expected yield: ~${fmt1(calc.cookedG)} g cooked (${grain.cookedMultiplier}x raw weight)`);
    if (steps.length) {
      lines.push("", "Steps:");
      steps.forEach((step, index) => lines.push(`${index + 1}. ${step}`));
    }
    lines.push("", `Generated: ${new Date().toLocaleString()}`);
    return lines.join("\n");
  }, [grain, method, tab, calc, steps, qtyLabel]);

  const copyReport = async () => {
    const success = await safeCopyText(report);
    if (!success) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const applyPeople = () => {
    setUnit("grams");
    setAmount(String(people * grain.perPersonG));
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Utensils className="h-4 w-4" />
            Kitchen companion
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Rice &amp; Grain Water Ratio Guide</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            The exact water for 13 everyday grains — basmati to bajra — by open pot, pressure-cooker whistles or rice
            cooker, with soak and rinse guidance and how much cooked food you will end up with.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[420px_1fr]">
          <div className="grid content-start gap-6">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <span className="text-sm font-semibold">Pick your grain</span>
              <div className="mt-3 flex flex-wrap gap-2">
                {GRAINS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setGrainId(item.id)}
                    className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition ${
                      grainId === item.id
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-xs text-[var(--muted-foreground)]">
                {grain.name} • {grain.tag} • ~{grain.gramsPerCup} g per cup
              </p>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold">Quantity</span>
                <div className="inline-flex rounded-md border border-[var(--border)] p-0.5">
                  {["cups", "grams"].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setUnit(option)}
                      className={`rounded px-3 py-1 text-xs font-semibold uppercase transition ${
                        unit === option
                          ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                          : "text-[var(--muted-foreground)]"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
              <label className="mt-3 block">
                <span className="text-xs font-semibold text-[var(--muted-foreground)]">
                  Raw {grain.name.toLowerCase()} ({unit})
                </span>
                <div className="relative mt-2">
                  <input
                    type="number"
                    inputMode="decimal"
                    step="any"
                    min="0"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    className="h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 pr-16 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--muted-foreground)]">
                    {unit}
                  </span>
                </div>
              </label>
              <div className="mt-4 rounded-md bg-[var(--muted)] p-3">
                <div className="flex flex-wrap items-center gap-3">
                  <ChefHat className="h-4 w-4 text-[var(--primary)]" />
                  <span className="text-sm font-semibold">Cooking for</span>
                  <div className="inline-flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setPeople((n) => Math.max(1, n - 1))}
                      aria-label="Fewer people"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--background)] font-semibold"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-semibold" aria-live="polite">
                      {people}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPeople((n) => Math.min(20, n + 1))}
                      aria-label="More people"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--background)] font-semibold"
                    >
                      +
                    </button>
                  </div>
                  <button type="button" onClick={applyPeople} className="btn-secondary min-h-8 px-3 py-1 text-xs">
                    Set quantity
                  </button>
                </div>
                <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                  ≈ {grain.perPersonG} g raw per person for {grain.name.toLowerCase()} → {people} people ={" "}
                  {people * grain.perPersonG} g.
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <span className="text-sm font-semibold">Cooking method</span>
              <div className="mt-3 grid gap-2">
                {METHOD_TABS.map((item) => {
                  const Icon = TAB_ICONS[item.id];
                  const unavailable = Boolean(grain.methods[item.id]?.unsuitable);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTab(item.id)}
                      className={`flex items-center gap-2 rounded-md border px-3 py-3 text-left text-sm font-semibold transition ${
                        tab === item.id
                          ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                          : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                      {unavailable && (
                        <span className="ml-auto text-xs font-semibold uppercase opacity-70">not suited</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid content-start gap-6">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                  {grain.name} • {METHOD_TABS.find((item) => item.id === tab)?.label}
                </p>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={copyReport} className="btn-secondary min-h-9 px-3 py-1.5 text-sm">
                    <Copy className="h-4 w-4" />
                    {copied ? "Copied" : "Copy plan"}
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadTextFile(`${grain.id}-cooking-plan.txt`, report)}
                    className="btn-secondary min-h-9 px-3 py-1.5 text-sm"
                  >
                    <FileDown className="h-4 w-4" />
                    Download
                  </button>
                </div>
              </div>

              <div aria-live="polite" className="mt-4">
                {grain.noCook ? (
                  <div className="rounded-lg bg-[var(--muted)] p-5">
                    <p className="text-2xl font-semibold text-[var(--primary)]">No measured water needed</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{grain.noCook.note}</p>
                  </div>
                ) : method?.unsuitable ? (
                  <div className="flex items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--muted)] p-5">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--anslation-ds-danger)]" />
                    <p className="text-sm leading-6">{method.unsuitable}</p>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-end gap-4">
                    <div className="rounded-lg bg-[var(--muted)] px-6 py-4">
                      <p className="flex items-center gap-2 text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                        <Droplets className="h-4 w-4 text-[var(--primary)]" />
                        Water needed
                      </p>
                      <p className="mt-1 text-5xl font-semibold text-[var(--primary)]">{calc.waterMl} ml</p>
                      <p className="mt-1 text-sm text-[var(--muted-foreground)]">= {fmt2(calc.waterCups)} cups</p>
                    </div>
                    <div className="min-w-[200px] flex-1 text-sm leading-6 text-[var(--muted-foreground)]">
                      <p>
                        For <span className="font-semibold text-[var(--foreground)]">{qtyLabel}</span> at ratio{" "}
                        <span className="font-semibold text-[var(--foreground)]">1 : {calc.ratio}</span> by volume.
                      </p>
                      {tab === "pressure" && method.whistles && (
                        <p className="mt-1">
                          Whistles: <span className="font-semibold text-[var(--foreground)]">{method.whistles}</span>
                        </p>
                      )}
                      <p className="mt-1">{method.note}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="tool-compact-grid mt-6">
                {[
                  ["Raw quantity", `${fmt1(calc.rawG)} g`],
                  ["Cooked yield", `≈ ${fmt1(calc.cookedG)} g`, `${grain.cookedMultiplier}× raw weight`],
                  ["Serves", `~${fmt1(calc.serves)}`, `${grain.perPersonG} g raw / person`],
                ].map(([label, value, sub]) => (
                  <div key={label} className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                    <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
                    <p className="mt-1 font-semibold">{value}</p>
                    {sub && <p className="text-xs text-[var(--muted-foreground)]">{sub}</p>}
                  </div>
                ))}
              </div>

              <p className="mt-4 text-xs text-[var(--muted-foreground)]">
                All ratios are by volume, 1 cup = 240 ml. Grams convert using ~{grain.gramsPerCup} g per cup of raw{" "}
                {grain.name.toLowerCase()}.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
                <div className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-[var(--primary)]" />
                  <h2 className="text-base font-semibold">Rinse &amp; soak</h2>
                </div>
                <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
                  <span className="font-semibold text-[var(--foreground)]">Rinse:</span> {grain.rinse}
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                  <span className="font-semibold text-[var(--foreground)]">Soak:</span> {grain.soak}
                </p>
              </div>

              <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
                <div className="flex items-center gap-2">
                  <Soup className="h-4 w-4 text-[var(--primary)]" />
                  <h2 className="text-base font-semibold">
                    {grain.noCook ? "Perfect poha, step by step" : "Perfect grains, step by step"}
                  </h2>
                </div>
                {steps.length ? (
                  <ol className="mt-3 grid gap-2">
                    {steps.map((step, index) => (
                      <li key={index} className="flex gap-3 text-sm leading-6 text-[var(--muted-foreground)]">
                        <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--muted)] text-xs font-bold text-[var(--primary)]">
                          {index + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
                    Switch to a suitable method above to see the step-by-step guide for {grain.name.toLowerCase()}.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
          <div className="flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-[var(--primary)]" />
            <h2 className="text-base font-semibold">Every grain at a glance</h2>
          </div>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Water : grain ratios by volume. Click a row to load it into the calculator.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-xs uppercase text-[var(--muted-foreground)]">
                  <th className="py-2 pr-3 font-semibold">Grain</th>
                  <th className="py-2 pr-3 font-semibold">Absorption</th>
                  <th className="py-2 pr-3 font-semibold">Pressure cooker</th>
                  <th className="py-2 pr-3 font-semibold">Rice cooker</th>
                  <th className="py-2 font-semibold">Open-pot notes</th>
                </tr>
              </thead>
              <tbody>
                {GRAINS.map((item) => (
                  <tr
                    key={item.id}
                    className={`border-b border-[var(--border)] align-top ${
                      item.id === grainId ? "bg-[var(--muted)]" : ""
                    }`}
                  >
                    <td className="py-2.5 pr-3">
                      <button
                        type="button"
                        onClick={() => setGrainId(item.id)}
                        className="text-left font-semibold text-[var(--primary)] hover:underline"
                      >
                        {item.name}
                      </button>
                      <p className="text-xs text-[var(--muted-foreground)]">{item.tag}</p>
                    </td>
                    <td className="py-2.5 pr-3 font-semibold">
                      {item.noCook ? "Rinse & drain" : `1 : ${item.methods.pot.ratio}`}
                    </td>
                    <td className="py-2.5 pr-3">
                      {item.methods.pressure.unsuitable ? (
                        <span className="text-[var(--muted-foreground)]">Not suitable</span>
                      ) : (
                        <>
                          <span className="font-semibold">1 : {item.methods.pressure.ratio}</span>
                          <p className="text-xs text-[var(--muted-foreground)]">{item.methods.pressure.whistles}</p>
                        </>
                      )}
                    </td>
                    <td className="py-2.5 pr-3">
                      {item.methods.cooker.unsuitable ? (
                        <span className="text-[var(--muted-foreground)]">Not suitable</span>
                      ) : (
                        <span className="font-semibold">1 : {item.methods.cooker.ratio}</span>
                      )}
                    </td>
                    <td className="py-2.5 text-[var(--muted-foreground)]">{item.methods.pot.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--anslation-ds-danger)]" />
            <div>
              <h2 className="text-base font-semibold">Leftover rice &amp; grain safety</h2>
              <ul className="mt-2 grid gap-1.5 text-sm leading-6 text-[var(--muted-foreground)]">
                <li>
                  Cool cooked rice within 1 hour — spread it on a plate or tray so it loses heat fast, then refrigerate
                  at 5°C or below.
                </li>
                <li>Eat refrigerated rice within 24–48 hours, and reheat it only once, until steaming hot throughout.</li>
                <li>
                  Never leave cooked rice or grains at room temperature for more than 2 hours — Bacillus cereus spores
                  survive cooking and produce toxins that reheating cannot destroy.
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
