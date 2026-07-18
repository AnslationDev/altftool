"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Beer,
  Car,
  Copy,
  GlassWater,
  Info,
  LifeBuoy,
  Martini,
  Minus,
  Plus,
  RotateCcw,
  Scale,
  Trash2,
  TriangleAlert,
  Wine,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const LOG_KEY = "altf:alcohol-unit-calculator:log";

const ETHANOL_DENSITY = 0.789;
const US_STANDARD_GRAMS = 14;
const ELIMINATION_PER_HOUR = 0.015;
const INDIA_LIMIT = 0.03;

const drinkPresets = [
  { id: "beer", name: "Beer", detail: "Bottle or can", ml: 330, abv: 5, icon: Beer },
  { id: "pint", name: "Pint of beer", detail: "Draught", ml: 568, abv: 5, icon: Beer },
  { id: "strong-beer", name: "Strong beer", detail: "Large bottle", ml: 650, abv: 8, icon: Beer },
  { id: "wine", name: "Wine", detail: "Standard glass", ml: 150, abv: 12, icon: Wine },
  { id: "wine-large", name: "Wine", detail: "Large glass", ml: 250, abv: 12, icon: Wine },
  { id: "wine-bottle", name: "Wine", detail: "Full bottle", ml: 750, abv: 12, icon: Wine },
  { id: "peg", name: "Small peg", detail: "Whisky, rum or vodka", ml: 30, abv: 42.8, icon: GlassWater },
  { id: "large-peg", name: "Large peg", detail: "Whisky, rum or vodka", ml: 60, abv: 42.8, icon: GlassWater },
  { id: "patiala", name: "Patiala peg", detail: "Whisky, generous pour", ml: 120, abv: 42.8, icon: GlassWater },
  { id: "gin-tonic", name: "Gin & tonic", detail: "Estimate", ml: 250, abv: 8, icon: Martini },
  { id: "rum-coke", name: "Rum & coke", detail: "Estimate", ml: 250, abv: 9, icon: Martini },
  { id: "mojito", name: "Mojito", detail: "Estimate", ml: 240, abv: 10, icon: Martini },
  { id: "margarita", name: "Margarita", detail: "Estimate", ml: 120, abv: 25, icon: Martini },
  { id: "long-island", name: "Long Island iced tea", detail: "Estimate", ml: 250, abv: 22, icon: Martini },
];

const bands = [
  {
    min: 0,
    max: 0.02,
    label: "Little to no measurable impairment",
    note: "Most people notice nothing much. That is not the same as being unaffected.",
    danger: false,
  },
  {
    min: 0.02,
    max: INDIA_LIMIT,
    label: "Mild effects",
    note: "Some relaxation and warmth, a slight loss of judgement, mild decline in visual tracking.",
    danger: false,
  },
  {
    min: INDIA_LIMIT,
    max: 0.05,
    label: "Over India’s legal driving limit",
    note: "India’s limit is 0.03% (30 mg per 100 ml of blood). At or above this, driving is a criminal offence.",
    danger: true,
  },
  {
    min: 0.05,
    max: 0.08,
    label: "Over the legal limit in many countries",
    note: "0.05% is the limit across most of Europe and much of the world. Judgement, coordination and reaction time are measurably worse.",
    danger: true,
  },
  {
    min: 0.08,
    max: 0.15,
    label: "Over the limit essentially everywhere",
    note: "0.08% is the limit in the US and in England and Wales. Clear loss of balance, speech, reaction time and self-control.",
    danger: true,
  },
  {
    min: 0.15,
    max: 0.3,
    label: "Severe impairment",
    note: "Vomiting, major loss of balance, memory gaps and blackouts become likely.",
    danger: true,
  },
  {
    min: 0.3,
    max: Infinity,
    label: "Risk of alcohol poisoning",
    note: "Confusion, unresponsiveness and suppressed breathing. This is a medical emergency — call for help, do not let someone “sleep it off”.",
    danger: true,
  },
];

const tips = [
  "Keep several days a week completely alcohol-free. Consecutive days off matter more than a low daily average.",
  "Space drinks out — roughly one per hour is about the rate an average adult clears alcohol.",
  "Alternate each drink with a glass of water. It slows the pace and helps the hangover.",
  "Eat before and while you drink. It slows absorption, so the peak is lower and later.",
  "Measure spirits at home. A free-poured peg is very often a double.",
  "Decide your number before you start, not at the point when it stops feeling important.",
];

const foodOptions = [
  { id: "empty", label: "Empty stomach", note: "Alcohol hits the small intestine fast, so your real peak arrives sooner and higher than a smooth average suggests." },
  { id: "snack", label: "Light snack", note: "A little food slows things down. Your peak is somewhat lower and later than on an empty stomach." },
  { id: "meal", label: "Full meal", note: "A full stomach can delay the peak considerably — soon after drinking, this estimate may read higher than you actually are." },
];

const num = (value, digits = 1) =>
  new Intl.NumberFormat("en-IN", { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(
    Number.isFinite(value) ? value : 0
  );

const dayKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const unitsOf = (ml, abv) => (ml * abv) / 1000;
const gramsOf = (ml, abv) => ml * (abv / 100) * ETHANOL_DENSITY;

const formatHours = (hours) => {
  if (!Number.isFinite(hours) || hours <= 0) return "now";
  const total = Math.round(hours * 60);
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m} min`;
  return `${h}h ${String(m).padStart(2, "0")}m`;
};

function DecayStrip({ bac }) {
  const width = 640;
  const height = 180;
  const padLeft = 46;
  const padRight = 14;
  const padTop = 14;
  const padBottom = 30;

  const hoursToZero = bac / ELIMINATION_PER_HOUR;
  const span = Math.max(2, Math.ceil(hoursToZero) + 1);
  const yMax = Math.max(0.08, bac * 1.2);

  const toX = (hour) => padLeft + (hour / span) * (width - padLeft - padRight);
  const toY = (value) => padTop + (1 - value / yMax) * (height - padTop - padBottom);

  const points = [];
  for (let hour = 0; hour <= span; hour += 0.2) {
    points.push(`${toX(hour).toFixed(1)},${toY(Math.max(0, bac - ELIMINATION_PER_HOUR * hour)).toFixed(1)}`);
  }
  const line = points.join(" ");
  const area = `${padLeft},${toY(0)} ${line} ${toX(span).toFixed(1)},${toY(0)}`;

  const ticks = Array.from({ length: span + 1 }, (_, index) => index).filter(
    (hour) => span <= 8 || hour % Math.ceil(span / 8) === 0
  );

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full min-w-[420px]" role="img" aria-label="Estimated blood alcohol decay over the coming hours">
        <line
          x1={padLeft}
          y1={toY(0)}
          x2={width - padRight}
          y2={toY(0)}
          stroke="var(--border)"
          strokeWidth="1"
        />
        {[INDIA_LIMIT, 0.05].map((limit) =>
          limit <= yMax ? (
            <g key={limit}>
              <line
                x1={padLeft}
                y1={toY(limit)}
                x2={width - padRight}
                y2={toY(limit)}
                stroke={limit === INDIA_LIMIT ? "var(--anslation-ds-danger)" : "var(--muted-foreground)"}
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text
                x={padLeft - 8}
                y={toY(limit) + 4}
                textAnchor="end"
                fontSize="11"
                fill={limit === INDIA_LIMIT ? "var(--anslation-ds-danger)" : "var(--muted-foreground)"}
              >
                {limit.toFixed(2)}
              </text>
            </g>
          ) : null
        )}
        <polygon points={area} fill="var(--primary)" opacity="0.14" />
        <polyline points={line} fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinejoin="round" />
        <circle cx={toX(0)} cy={toY(bac)} r="4" fill="var(--primary)" />
        {ticks.map((hour) => (
          <text key={hour} x={toX(hour)} y={height - 10} textAnchor="middle" fontSize="11" fill="var(--muted-foreground)">
            {hour === 0 ? "now" : `+${hour}h`}
          </text>
        ))}
      </svg>
    </div>
  );
}

function WeekBars({ days }) {
  const max = Math.max(6, ...days.map((day) => day.units));
  return (
    <div className="flex items-end justify-between gap-2" aria-hidden="true">
      {days.map((day) => (
        <div key={day.key} className="flex flex-1 flex-col items-center gap-1.5">
          <div className="flex h-24 w-full items-end">
            <div
              className="w-full rounded-t-sm bg-[var(--primary)]"
              style={{ height: `${day.units === 0 ? 2 : Math.max(4, (day.units / max) * 100)}%`, opacity: day.units === 0 ? 0.25 : 1 }}
            />
          </div>
          <span className="text-[10px] font-semibold text-[var(--muted-foreground)]">{day.label}</span>
          <span className="text-[10px] tabular-nums text-[var(--muted-foreground)]">{day.units ? num(day.units) : "—"}</span>
        </div>
      ))}
    </div>
  );
}

export default function ToolHome() {
  const [session, setSession] = useState([
    { uid: "seed-beer", presetId: "beer", name: "Beer", detail: "Bottle or can", ml: 330, abv: 5, qty: 2 },
    { uid: "seed-peg", presetId: "large-peg", name: "Large peg", detail: "Whisky, rum or vodka", ml: 60, abv: 42.8, qty: 1 },
  ]);
  const [customMl, setCustomMl] = useState(200);
  const [customAbv, setCustomAbv] = useState(15);
  const [weight, setWeight] = useState(70);
  const [sex, setSex] = useState("male");
  const [hours, setHours] = useState(2);
  const [food, setFood] = useState("snack");
  const [log, setLog] = useState([]);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(LOG_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setLog(parsed);
      }
    } catch {
      setLog([]);
    }
  }, []);

  const persist = useCallback((next) => {
    setLog(next);
    try {
      window.localStorage.setItem(LOG_KEY, JSON.stringify(next.slice(-120)));
    } catch {
      /* storage unavailable — the calculator still works, the week just won’t stick */
    }
  }, []);

  const totals = useMemo(() => {
    return session.reduce(
      (acc, drink) => {
        const units = unitsOf(drink.ml, drink.abv) * drink.qty;
        const grams = gramsOf(drink.ml, drink.abv) * drink.qty;
        acc.units += units;
        acc.grams += grams;
        acc.drinks += drink.qty;
        acc.volume += drink.ml * drink.qty;
        return acc;
      },
      { units: 0, grams: 0, drinks: 0, volume: 0 }
    );
  }, [session]);

  const usDrinks = totals.grams / US_STANDARD_GRAMS;
  const kcal = totals.grams * 7;

  const r = sex === "male" ? 0.68 : 0.55;
  const weightGrams = Math.max(1, Number(weight) || 0) * 1000;
  const peakBac = (totals.grams * 100) / (weightGrams * r);
  const bac = Math.max(0, peakBac - ELIMINATION_PER_HOUR * Math.max(0, Number(hours) || 0));
  const band = bands.find((item) => bac >= item.min && bac < item.max) || bands[0];
  const hoursToZero = bac / ELIMINATION_PER_HOUR;
  const hoursToIndia = bac > INDIA_LIMIT ? (bac - INDIA_LIMIT) / ELIMINATION_PER_HOUR : 0;
  const hoursToFive = bac > 0.05 ? (bac - 0.05) / ELIMINATION_PER_HOUR : 0;
  const foodNote = foodOptions.find((item) => item.id === food)?.note || "";

  const week = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let offset = 6; offset >= 0; offset -= 1) {
      const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - offset);
      const key = dayKey(date);
      const units = log.filter((entry) => entry.day === key).reduce((sum, entry) => sum + entry.units, 0);
      days.push({ key, units, label: date.toLocaleDateString("en-IN", { weekday: "short" }).slice(0, 2) });
    }
    const total = days.reduce((sum, day) => sum + day.units, 0);
    const drinkingDays = days.filter((day) => day.units > 0).length;
    return { days, total, drinkingDays, freeDays: 7 - drinkingDays, heaviest: Math.max(0, ...days.map((d) => d.units)) };
  }, [log]);

  const addPreset = (preset) => {
    setSession((prev) => {
      const existing = prev.find((drink) => drink.presetId === preset.id);
      if (existing) {
        return prev.map((drink) => (drink.presetId === preset.id ? { ...drink, qty: drink.qty + 1 } : drink));
      }
      return [
        ...prev,
        {
          uid: `${preset.id}-${Date.now()}`,
          presetId: preset.id,
          name: preset.name,
          detail: preset.detail,
          ml: preset.ml,
          abv: preset.abv,
          qty: 1,
        },
      ];
    });
  };

  const addCustom = () => {
    const ml = Number(customMl) || 0;
    const abv = Number(customAbv) || 0;
    if (ml <= 0 || abv <= 0) return;
    setSession((prev) => [
      ...prev,
      {
        uid: `custom-${Date.now()}`,
        presetId: null,
        name: "Custom drink",
        detail: `${ml} ml at ${abv}%`,
        ml,
        abv,
        qty: 1,
      },
    ]);
  };

  const changeQty = (uid, delta) => {
    setSession((prev) =>
      prev
        .map((drink) => (drink.uid === uid ? { ...drink, qty: drink.qty + delta } : drink))
        .filter((drink) => drink.qty > 0)
    );
  };

  const saveToWeek = () => {
    if (totals.units <= 0) return;
    const today = new Date();
    persist([
      ...log,
      { at: today.toISOString(), day: dayKey(today), units: totals.units, drinks: totals.drinks, grams: totals.grams },
    ]);
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  };

  const report = useMemo(
    () =>
      [
        "Alcohol Units & BAC estimate",
        "",
        ...session.map(
          (drink) =>
            `${drink.qty} x ${drink.name} (${drink.ml} ml, ${drink.abv}%) — ${num(unitsOf(drink.ml, drink.abv) * drink.qty, 2)} units`
        ),
        "",
        `Total UK units: ${num(totals.units, 2)}`,
        `US standard drinks: ${num(usDrinks, 2)}`,
        `Pure alcohol: ${num(totals.grams, 1)} g`,
        "",
        `Estimated BAC: ${num(bac, 3)}% (Widmark, r = ${r}, ${weight} kg, ${hours} h since first drink)`,
        `Estimated time to 0.00%: ${formatHours(hoursToZero)}`,
        "",
        "This is a rough estimate. Never use it to decide whether to drive.",
        `Generated: ${new Date().toLocaleString("en-IN")}`,
      ].join("\n"),
    [session, totals, usDrinks, bac, r, weight, hours, hoursToZero]
  );

  const copyReport = async () => {
    const ok = await safeCopyText(report);
    if (!ok) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Wine className="h-4 w-4" />
            Know your numbers
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Alcohol Units &amp; BAC Calculator</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            A peg is not a glass of wine, and neither is a “drink”. Add what you actually had to get real unit counts,
            track your week against low-risk guidance, and see a Widmark estimate of your blood alcohol — with an honest
            account of how rough that estimate is.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[1fr_380px]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <h2 className="text-2xl font-semibold">What have you had?</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
              Tap to add. Cocktail figures are estimates — a bartender’s pour is not a standard.
            </p>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead>
                  <tr className="text-xs uppercase text-[var(--muted-foreground)]">
                    <th className="pb-2 font-semibold">Drink</th>
                    <th className="pb-2 font-semibold">Size</th>
                    <th className="pb-2 font-semibold">ABV</th>
                    <th className="pb-2 font-semibold">Units</th>
                    <th className="pb-2" />
                  </tr>
                </thead>
                <tbody>
                  {drinkPresets.map((preset) => {
                    const Icon = preset.icon;
                    return (
                      <tr key={preset.id} className="border-t border-[var(--border)]">
                        <td className="py-2.5">
                          <span className="flex items-center gap-2 font-semibold">
                            <Icon className="h-4 w-4 shrink-0 text-[var(--primary)]" />
                            <span>
                              {preset.name}
                              <span className="block text-xs font-normal text-[var(--muted-foreground)]">
                                {preset.detail}
                              </span>
                            </span>
                          </span>
                        </td>
                        <td className="py-2.5 tabular-nums text-[var(--muted-foreground)]">{preset.ml} ml</td>
                        <td className="py-2.5 tabular-nums text-[var(--muted-foreground)]">{preset.abv}%</td>
                        <td className="py-2.5 tabular-nums font-semibold text-[var(--primary)]">
                          {num(unitsOf(preset.ml, preset.abv), 1)}
                        </td>
                        <td className="py-2.5 text-right">
                          <button
                            type="button"
                            onClick={() => addPreset(preset)}
                            aria-label={`Add ${preset.name}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--background)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-5 rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
              <p className="text-sm font-semibold">Something else?</p>
              <div className="mt-3 flex flex-wrap items-end gap-3">
                <label className="block">
                  <span className="text-xs font-semibold text-[var(--muted-foreground)]">Volume (ml)</span>
                  <input
                    type="number"
                    min="0"
                    value={customMl}
                    onChange={(event) => setCustomMl(Number(event.target.value))}
                    className="mt-1.5 h-12 w-28 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-[var(--muted-foreground)]">ABV (%)</span>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={customAbv}
                    onChange={(event) => setCustomAbv(Number(event.target.value))}
                    className="mt-1.5 h-12 w-28 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                  />
                </label>
                <button
                  type="button"
                  onClick={addCustom}
                  className="inline-flex h-12 items-center gap-2 rounded-md bg-[var(--primary)] px-5 font-semibold text-[var(--primary-foreground)] transition hover:opacity-90"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </button>
                <p className="text-xs text-[var(--muted-foreground)]">
                  = {num(unitsOf(Number(customMl) || 0, Number(customAbv) || 0), 2)} units
                </p>
              </div>
            </div>
          </div>

          <aside className="grid gap-6 self-start">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-semibold">This session</h2>
                {session.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSession([])}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--muted-foreground)]"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Clear
                  </button>
                )}
              </div>

              {session.length === 0 ? (
                <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
                  Nothing added yet. Pick from the table and your totals appear here.
                </p>
              ) : (
                <div className="mt-4 grid gap-2">
                  {session.map((drink) => (
                    <div
                      key={drink.uid}
                      className="flex items-center justify-between gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] p-2.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{drink.name}</p>
                        <p className="truncate text-xs text-[var(--muted-foreground)]">
                          {drink.ml} ml · {drink.abv}% · {num(unitsOf(drink.ml, drink.abv) * drink.qty, 2)} units
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={() => changeQty(drink.uid, -1)}
                          aria-label={`One less ${drink.name}`}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[var(--border)] transition hover:border-[var(--primary)]"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-6 text-center text-sm font-semibold tabular-nums">{drink.qty}</span>
                        <button
                          type="button"
                          onClick={() => changeQty(drink.uid, 1)}
                          aria-label={`One more ${drink.name}`}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[var(--border)] transition hover:border-[var(--primary)]"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => changeQty(drink.uid, -drink.qty)}
                          aria-label={`Remove ${drink.name}`}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[var(--border)] text-[var(--muted-foreground)] transition hover:border-[var(--primary)]"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 rounded-md bg-[var(--muted)] p-4" aria-live="polite">
                <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Session total</p>
                <p className="mt-1 text-4xl font-semibold tabular-nums text-[var(--primary)]">{num(totals.units, 1)}</p>
                <p className="text-xs text-[var(--muted-foreground)]">UK units</p>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {[
                    ["US drinks", num(usDrinks, 1)],
                    ["Alcohol", `${num(totals.grams, 0)} g`],
                    ["Calories", `${num(kcal, 0)}`],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-md border border-[var(--border)] bg-[var(--background)] p-2 text-center">
                      <p className="text-sm font-semibold tabular-nums">{value}</p>
                      <p className="text-[10px] text-[var(--muted-foreground)]">{label}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
                  Formula: UK units = ml × ABV% ÷ 1000. Grams = ml × ABV% ÷ 100 × 0.789. A US standard drink is 14 g of
                  pure alcohol. Calories count the alcohol only (7 kcal per gram) — mixers and sugar are extra.
                </p>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={saveToWeek} className="btn-secondary min-h-10 flex-1 px-3 py-1.5 text-sm">
                  {saved ? "Saved" : "Save to my week"}
                </button>
                <button type="button" onClick={copyReport} className="btn-secondary min-h-10 px-3 py-1.5 text-sm">
                  <Copy className="h-4 w-4" />
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <h2 className="text-sm font-semibold">Your last 7 days</h2>
              <div className="mt-4">
                <WeekBars days={week.days} />
              </div>
              <div className="mt-4 rounded-md bg-[var(--muted)] p-3">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-2xl font-semibold tabular-nums text-[var(--primary)]">{num(week.total, 1)}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">of 14 units guidance</p>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--background)]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(100, (week.total / 14) * 100).toFixed(1)}%`,
                      background: week.total > 14 ? "var(--anslation-ds-danger)" : "var(--primary)",
                    }}
                  />
                </div>
                <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
                  {week.freeDays} drink-free day{week.freeDays === 1 ? "" : "s"} · {week.drinkingDays} drinking day
                  {week.drinkingDays === 1 ? "" : "s"}
                </p>
              </div>
              <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
                UK Chief Medical Officers’ low-risk guidance: no more than 14 units a week, spread over three or more
                days, with several drink-free days. Guidance differs by country, and the honest position is that no level
                of drinking is completely risk-free — 14 units is a low-risk line, not a safe one.
              </p>
              {log.length > 0 && (
                <button
                  type="button"
                  onClick={() => persist([])}
                  className="mt-3 text-xs font-semibold text-[var(--muted-foreground)] underline"
                >
                  Clear my log
                </button>
              )}
            </div>
          </aside>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[380px_1fr]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-[var(--primary)]" />
              <h2 className="text-sm font-semibold">BAC inputs</h2>
            </div>

            <div className="mt-4 grid gap-4">
              <label className="block">
                <span className="text-sm font-semibold">Body weight (kg)</span>
                <input
                  type="number"
                  min="1"
                  value={weight}
                  onChange={(event) => setWeight(Number(event.target.value))}
                  className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold">Body-water factor</span>
                <select
                  value={sex}
                  onChange={(event) => setSex(event.target.value)}
                  className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                >
                  <option value="male">Male — r = 0.68</option>
                  <option value="female">Female — r = 0.55</option>
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-semibold">Hours since your first drink</span>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={hours}
                  onChange={(event) => setHours(Number(event.target.value))}
                  className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold">Food in your stomach</span>
                <select
                  value={food}
                  onChange={(event) => setFood(event.target.value)}
                  className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                >
                  {foodOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-4 rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                <Info className="h-3.5 w-3.5" />
                About food
              </p>
              <p className="mt-1.5 text-xs leading-5 text-[var(--muted-foreground)]">{foodNote}</p>
              <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
                Food changes how fast alcohol is absorbed, not how fast your liver clears it — so it does not change the
                number below and it does not shorten your time to sober. We would rather tell you that than quietly
                multiply the answer by a made-up factor.
              </p>
            </div>

            <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
              r values of 0.68 and 0.55 come from Widmark’s original work and are population averages. Real body
              composition, liver function, medication and tolerance vary enormously between people — and within the same
              person on different days.
            </p>
          </div>

          <div className="grid gap-6">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Estimated blood alcohol</p>
              <div className="mt-3 flex flex-wrap items-end gap-5" aria-live="polite">
                <div className="rounded-lg bg-[var(--muted)] px-6 py-4">
                  <p className="text-5xl font-semibold tabular-nums text-[var(--primary)]">{num(bac, 3)}%</p>
                </div>
                <div
                  className="rounded-md border px-4 py-3"
                  style={{
                    borderColor: band.danger ? "var(--anslation-ds-danger)" : "var(--border)",
                    background: band.danger ? "var(--anslation-ds-danger-soft)" : "var(--background)",
                  }}
                >
                  <p
                    className="text-sm font-semibold"
                    style={{ color: band.danger ? "var(--anslation-ds-danger)" : "var(--foreground)" }}
                  >
                    {band.label}
                  </p>
                  <p className="mt-1 max-w-md text-xs leading-5 text-[var(--muted-foreground)]">{band.note}</p>
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
                Formula (Widmark): BAC% = (grams of alcohol × 100) ÷ (body weight in grams × r) − (0.015 × hours). Here:
                ({num(totals.grams, 1)} × 100) ÷ ({new Intl.NumberFormat("en-IN").format(weightGrams)} × {r}) − (0.015 ×{" "}
                {num(Math.max(0, Number(hours) || 0), 1)}) = {num(bac, 3)}%. Peak before elimination would be{" "}
                {num(peakBac, 3)}%.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {[
                  ["Back to 0.00%", formatHours(hoursToZero)],
                  ["Below 0.05%", hoursToFive > 0 ? formatHours(hoursToFive) : "Already below"],
                  ["Below 0.03% (India)", hoursToIndia > 0 ? formatHours(hoursToIndia) : "Already below"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                    <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
                    <p className="mt-1 font-semibold tabular-nums">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5">
                <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                  Estimated decay from now
                </p>
                <div className="mt-2">
                  <DecayStrip bac={bac} />
                </div>
                <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                  Alcohol leaves at a roughly fixed rate — about 0.015% per hour for most adults. Coffee, a cold shower,
                  food and sleep do not speed this line up. Only time moves it.
                </p>
              </div>
            </div>

            <div
              className="rounded-lg border-2 p-6"
              style={{ borderColor: "var(--anslation-ds-danger)", background: "var(--anslation-ds-danger-soft)" }}
            >
              <div className="flex items-start gap-3">
                <span
                  className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                  style={{ background: "var(--anslation-ds-danger)", color: "var(--card)" }}
                >
                  <TriangleAlert className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold" style={{ color: "var(--anslation-ds-danger)" }}>
                    Never use this number to decide whether to drive
                  </h2>
                  <div className="mt-2 grid gap-2 text-sm leading-6">
                    <p>
                      This is a rough population estimate, not a measurement. Individual variation is large — two people
                      of the same weight and sex, drinking the same amount, can land at meaningfully different real BAC
                      readings. A breathalyser measures you; this does arithmetic on averages.
                    </p>
                    <p>
                      <strong>In India the legal limit is 0.03% BAC — 30 mg per 100 ml of blood.</strong> Driving at or
                      above it is a criminal offence under the Motor Vehicles Act, carrying fines, imprisonment and
                      licence consequences. A reading below 0.03% here is not evidence that you are under it, and it is
                      not a defence.
                    </p>
                    <p className="flex items-start gap-2 font-semibold">
                      <Car className="mt-1 h-4 w-4 shrink-0" />
                      If you have been drinking, do not drive. Take a cab, take a bus, or stay where you are. There is no
                      version of this that is worth someone’s life — including yours.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-2">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <h2 className="text-2xl font-semibold">What one unit actually is</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
              One UK unit is 10 ml — about 8 g — of pure alcohol: roughly what an average adult liver clears in an hour.
              It is a measure of alcohol, not of glasses, which is the whole point. A small peg of whisky and a third of
              a pint of beer are nearly the same drink as far as your body is concerned.
            </p>
            <div className="mt-4 grid gap-2">
              {[
                { label: "1 small peg (30 ml, 42.8%)", units: unitsOf(30, 42.8) },
                { label: "1 beer (330 ml, 5%)", units: unitsOf(330, 5) },
                { label: "1 glass of wine (150 ml, 12%)", units: unitsOf(150, 12) },
                { label: "1 large peg (60 ml, 42.8%)", units: unitsOf(60, 42.8) },
                { label: "1 pint of beer (568 ml, 5%)", units: unitsOf(568, 5) },
                { label: "1 bottle of wine (750 ml, 12%)", units: unitsOf(750, 12) },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-3">
                  <span className="w-56 shrink-0 text-xs text-[var(--muted-foreground)]">{row.label}</span>
                  <div className="h-3 flex-1 overflow-hidden rounded-full bg-[var(--muted)]">
                    <div
                      className="h-full rounded-full bg-[var(--primary)]"
                      style={{ width: `${Math.min(100, (row.units / 9) * 100).toFixed(1)}%` }}
                    />
                  </div>
                  <span className="w-16 shrink-0 text-right text-xs font-semibold tabular-nums text-[var(--primary)]">
                    {num(row.units, 1)} u
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
              Bars scaled against a full bottle of wine (9 units). This is why “I only had three drinks” is not a number.
            </p>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <h2 className="text-2xl font-semibold">Drinking at lower risk</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
              None of this is about stopping. It is about the difference between drinking and drinking badly.
            </p>
            <ul className="mt-4 grid gap-2">
              {tips.map((tip) => (
                <li key={tip} className="flex items-start gap-2.5 rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
                  <span className="text-[var(--muted-foreground)]">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--muted)] text-[var(--primary)]">
              <LifeBuoy className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-semibold">If you are worried about your drinking</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted-foreground)]">
                Counting units is often how people find out something they half-knew already. If the number surprised
                you, or if cutting down has been harder than you expected, that is worth a conversation rather than a
                resolution. A doctor can talk it through without drama — and if you drink heavily every day, stopping
                abruptly on your own can be genuinely dangerous, so medical advice matters before you make a big change.
              </p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                  <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Tele-MANAS (India)</p>
                  <p className="mt-1 text-lg font-semibold text-[var(--primary)]">14416</p>
                  <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                    Free, 24x7 government mental-health support, including alcohol and substance use
                  </p>
                </div>
                <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                  <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Talk to a doctor</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                    Your GP can assess dependence, advise on safe reduction, and refer you on. It is a routine
                    conversation for them.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--muted)] p-5">
          <p className="text-sm leading-6 text-[var(--muted-foreground)]">
            These are estimates for awareness, not medical or legal advice. The Widmark formula produces a rough figure
            from population averages and cannot tell you your actual blood alcohol concentration, your fitness to drive,
            or your legal status — only a calibrated test can do that. Unit counts assume the stated volumes and
            strengths, which real pours rarely match. Consult a doctor about anything concerning your health or your
            drinking. Your session and week stay on this device.
          </p>
        </section>
      </div>
    </main>
  );
}
