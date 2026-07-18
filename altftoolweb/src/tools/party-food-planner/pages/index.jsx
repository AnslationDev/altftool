"use client";

import { useMemo, useState } from "react";
import {
  Copy,
  CupSoda,
  FileDown,
  Lightbulb,
  PartyPopper,
  RotateCcw,
  UtensilsCrossed,
  Users,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const MEALS = [
  { id: "dinner", label: "Full dinner" },
  { id: "snacks", label: "Snacks & starters" },
  { id: "hightea", label: "High tea" },
];

const CUISINES = [
  { id: "indian", label: "Indian buffet" },
  { id: "western", label: "Western" },
  { id: "mixed", label: "Mixed" },
];

const APPETITES = [
  { id: 0, label: "Light", mult: 0.8, hint: "-20% portions — office crowd, heavy lunch already done" },
  { id: 1, label: "Normal", mult: 1, hint: "standard caterer portions" },
  { id: 2, label: "Hearty", mult: 1.2, hint: "+20% portions — young crowd or a long hungry gap" },
];

const MENUS = {
  dinner: {
    indian: {
      courses: [
        {
          title: "Starters",
          items: [
            { name: "Paneer starter (tikka / chilli paneer)", qty: 3, unit: "pcs", kid: 0.7, note: "pass-around pieces before dinner" },
            { name: "Veg starter (hara bhara kebab / tikki)", qty: 2, unit: "pcs", kid: 0.7 },
            { name: "Papad, chips & namkeen", qty: 15, unit: "g", kid: 0.6 },
          ],
        },
        {
          title: "Mains",
          items: [
            { name: "Rice — basmati (raw)", qty: 90, unit: "g", kid: 0.5, note: "steamed + one pulao from the same stock" },
            { name: "Dal (raw, for dal fry / makhani)", qty: 80, unit: "g", kid: 0.5 },
            { name: "Dry sabzi (raw vegetables)", qty: 100, unit: "g", kid: 0.5 },
            { name: "Paneer for main gravy", qty: 50, unit: "g", kid: 0.5 },
            { name: "Roti / naan", qty: 2.5, unit: "pcs", kid: 0.6, note: "order in two rounds so they stay warm" },
            { name: "Curd for raita", qty: 80, unit: "g", kid: 0.5 },
            { name: "Salad (kachumber)", qty: 40, unit: "g", kid: 0.3 },
            { name: "Pickle & chutney", qty: 10, unit: "g", kid: 0.3 },
          ],
        },
        {
          title: "Dessert",
          items: [
            { name: "Dessert pieces (gulab jamun / barfi)", qty: 1.5, unit: "pcs", kid: 1 },
            { name: "Ice cream (optional pairing)", qty: 50, unit: "ml", kid: 1.2, note: "kids come back for seconds" },
          ],
        },
      ],
    },
    western: {
      courses: [
        {
          title: "Appetizers",
          items: [
            { name: "Finger appetizers (canapes, skewers, bruschetta)", qty: 5, unit: "pcs", kid: 0.6, note: "4-6 pieces per person during the pre-dinner hour" },
            { name: "Dips, breadsticks & crackers", qty: 25, unit: "g", kid: 0.5 },
          ],
        },
        {
          title: "Mains",
          items: [
            { name: "Main course (grill / roast / bake, cooked weight)", qty: 180, unit: "g", kid: 0.5 },
            { name: "Sides — plan two kinds (120 g each)", qty: 240, unit: "g", kid: 0.5, note: "one starchy (mash / pasta), one veg" },
            { name: "Dinner rolls / garlic bread", qty: 1.5, unit: "pcs", kid: 0.7 },
            { name: "Fresh salad", qty: 60, unit: "g", kid: 0.3 },
          ],
        },
        {
          title: "Dessert",
          items: [
            { name: "Plated dessert (brownie / pastry / pie slice)", qty: 1, unit: "pcs", kid: 1 },
            { name: "Ice cream scoop", qty: 60, unit: "ml", kid: 1.2 },
          ],
        },
      ],
    },
    mixed: {
      courses: [
        {
          title: "Starters",
          items: [
            { name: "Mixed starters (2 Indian + 2 Western pieces)", qty: 4, unit: "pcs", kid: 0.7 },
            { name: "Chips, dips & namkeen", qty: 20, unit: "g", kid: 0.6 },
          ],
        },
        {
          title: "Mains",
          items: [
            { name: "Rice (raw)", qty: 60, unit: "g", kid: 0.5 },
            { name: "Dal (raw)", qty: 50, unit: "g", kid: 0.5 },
            { name: "Sabzi / stir-fry vegetables (raw)", qty: 80, unit: "g", kid: 0.5 },
            { name: "Roti / naan", qty: 1.5, unit: "pcs", kid: 0.6 },
            { name: "Continental main (pasta bake / sizzler, cooked)", qty: 100, unit: "g", kid: 0.6 },
            { name: "Salad & raita", qty: 80, unit: "g", kid: 0.4 },
          ],
        },
        {
          title: "Dessert",
          items: [
            { name: "Dessert (one Indian mithai + one Western bite)", qty: 1.5, unit: "pcs", kid: 1 },
          ],
        },
      ],
    },
  },
  snacks: {
    indian: {
      courses: [
        {
          title: "Hot starters",
          items: [
            { name: "Paneer / soya tikka", qty: 2, unit: "pcs", kid: 0.6, perHour: true },
            { name: "Fried snack (samosa / pakora / spring roll)", qty: 1.5, unit: "pcs", kid: 0.7, perHour: true },
          ],
        },
        {
          title: "Bites & chaat",
          items: [
            { name: "Mini chaat cups (papdi / bhel / dahi puri)", qty: 0.8, unit: "cups", kid: 0.5, perHour: true },
            { name: "Veg sandwiches / sliders", qty: 1, unit: "pcs", kid: 0.8, perHour: true },
            { name: "Namkeen & chips on tables", qty: 12, unit: "g", kid: 0.6, perHour: true },
          ],
        },
        {
          title: "Sweet finish",
          items: [
            { name: "Sweet bite (gulab jamun / jalebi)", qty: 1, unit: "pcs", kid: 1 },
            { name: "Fruit platter", qty: 40, unit: "g", kid: 0.8 },
          ],
        },
      ],
    },
    western: {
      courses: [
        {
          title: "Hot bites",
          items: [
            { name: "Canapes & crostini", qty: 2, unit: "pcs", kid: 0.5, perHour: true },
            { name: "Fried bites (nuggets / wedges / poppers)", qty: 1.5, unit: "pcs", kid: 1, perHour: true },
            { name: "Mini pizzas / sliders", qty: 0.8, unit: "pcs", kid: 0.8, perHour: true },
          ],
        },
        {
          title: "Grazing table",
          items: [
            { name: "Cheese & crackers", qty: 15, unit: "g", kid: 0.4, perHour: true },
            { name: "Chips with dips", qty: 15, unit: "g", kid: 0.8, perHour: true },
          ],
        },
        {
          title: "Sweet finish",
          items: [
            { name: "Cupcake / brownie bite", qty: 1, unit: "pcs", kid: 1 },
            { name: "Fruit skewers", qty: 40, unit: "g", kid: 0.8 },
          ],
        },
      ],
    },
    mixed: {
      courses: [
        {
          title: "Hot bites",
          items: [
            { name: "Tikka & kebab platter", qty: 1.5, unit: "pcs", kid: 0.6, perHour: true },
            { name: "Fried bites (samosa / nuggets)", qty: 1.5, unit: "pcs", kid: 0.9, perHour: true },
            { name: "Sandwiches / sliders", qty: 0.8, unit: "pcs", kid: 0.8, perHour: true },
          ],
        },
        {
          title: "Grazing table",
          items: [
            { name: "Chaat or nacho station", qty: 0.6, unit: "cups", kid: 0.5, perHour: true },
            { name: "Chips, dips & namkeen", qty: 15, unit: "g", kid: 0.7, perHour: true },
          ],
        },
        {
          title: "Sweet finish",
          items: [
            { name: "Mithai + brownie bites", qty: 1, unit: "pcs", kid: 1 },
            { name: "Fruit platter", qty: 40, unit: "g", kid: 0.8 },
          ],
        },
      ],
    },
  },
  hightea: {
    indian: {
      courses: [
        {
          title: "Savouries",
          items: [
            { name: "Veg sandwiches", qty: 2, unit: "pcs", kid: 0.8 },
            { name: "Samosa / pakora", qty: 2, unit: "pcs", kid: 0.6 },
            { name: "Namkeen mixture", qty: 20, unit: "g", kid: 0.5 },
          ],
        },
        {
          title: "Bakery & sweets",
          items: [
            { name: "Biscuits / cookies", qty: 2, unit: "pcs", kid: 1 },
            { name: "Cake / pastry slice", qty: 1, unit: "pcs", kid: 1 },
            { name: "Mithai piece", qty: 1, unit: "pcs", kid: 0.7 },
          ],
        },
      ],
    },
    western: {
      courses: [
        {
          title: "Savouries",
          items: [
            { name: "Finger sandwiches", qty: 3, unit: "pcs", kid: 0.8 },
            { name: "Quiche / veg puff", qty: 1, unit: "pcs", kid: 0.6 },
            { name: "Cheese & crackers", qty: 15, unit: "g", kid: 0.4 },
          ],
        },
        {
          title: "Bakery & sweets",
          items: [
            { name: "Scone / muffin", qty: 1, unit: "pcs", kid: 0.8 },
            { name: "Cookies", qty: 2, unit: "pcs", kid: 1 },
            { name: "Cake slice", qty: 1, unit: "pcs", kid: 1 },
          ],
        },
      ],
    },
    mixed: {
      courses: [
        {
          title: "Savouries",
          items: [
            { name: "Veg / chutney sandwiches", qty: 2, unit: "pcs", kid: 0.8 },
            { name: "Samosa or veg puff", qty: 1.5, unit: "pcs", kid: 0.6 },
            { name: "Namkeen & wafers", qty: 15, unit: "g", kid: 0.5 },
          ],
        },
        {
          title: "Bakery & sweets",
          items: [
            { name: "Cookies / biscuits", qty: 2, unit: "pcs", kid: 1 },
            { name: "Pastry / cake slice", qty: 1, unit: "pcs", kid: 1 },
            { name: "Mithai piece", qty: 1, unit: "pcs", kid: 0.7 },
          ],
        },
      ],
    },
  },
};

const PRESETS = [
  { label: "Birthday bash — 18 adults, 12 kids", adults: 18, kids: 12, hours: 3, meal: "snacks", cuisine: "mixed", appetite: 1 },
  { label: "Family dinner — 30 adults, 10 kids", adults: 30, kids: 10, hours: 4, meal: "dinner", cuisine: "indian", appetite: 1 },
  { label: "Office high tea — 25 adults", adults: 25, kids: 0, hours: 2, meal: "hightea", cuisine: "mixed", appetite: 0 },
];

const MEAL_NOTES = {
  dinner: "Duration mainly changes drinks and ice — dinner food is planned per event, not per hour.",
  snacks: "Grazing math: hour one counts in full, every later hour at 70% (people slow down).",
  hightea: "High tea runs on ritual, not on the clock — quantities are per event; 1.5 to 2 hours is typical.",
};

const nf = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

function formatTotal(value, unit) {
  if (!Number.isFinite(value) || value <= 0) return "0";
  if (unit === "g") {
    if (value >= 1000) return `${nf.format(Math.ceil(value / 250) / 4)} kg`;
    return `${nf.format(Math.ceil(value / 25) * 25)} g`;
  }
  if (unit === "ml") {
    if (value >= 1000) return `${nf.format(Math.ceil(value / 250) / 4)} L`;
    return `${nf.format(Math.ceil(value / 50) * 50)} ml`;
  }
  const rounded = value >= 40 ? Math.ceil(value / 5) * 5 : Math.ceil(value);
  return `${nf.format(rounded)} ${unit}`;
}

function perAdultLabel(item) {
  return `${nf.format(item.qty)} ${item.unit}${item.perHour ? " / hr" : ""}`;
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
  const [adults, setAdults] = useState(20);
  const [kids, setKids] = useState(8);
  const [hours, setHours] = useState(3);
  const [meal, setMeal] = useState("dinner");
  const [cuisine, setCuisine] = useState("indian");
  const [appetite, setAppetite] = useState(1);
  const [buffer, setBuffer] = useState(true);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(() => {
    const menu = MENUS[meal][cuisine];
    const appetiteMult = APPETITES[appetite].mult;
    const bufferMult = buffer ? 1.1 : 1;
    const effHours = meal === "snacks" ? Math.round((1 + 0.7 * (Math.max(hours, 1) - 1)) * 10) / 10 : 1;
    const headsFor = (kidShare) => adults + kids * kidShare;

    const courses = menu.courses.map((course) => ({
      title: course.title,
      items: course.items.map((item) => ({
        ...item,
        total: item.qty * (item.perHour ? effHours : 1) * headsFor(item.kid) * appetiteMult * bufferMult,
      })),
    }));

    const extraHours = Math.max(0, hours - 3);
    const teaCups = meal === "hightea" ? 2 : meal === "snacks" ? 1 : 0.8;
    const drinks = [
      { name: "Drinking water", qty: 500 + extraHours * 100, unit: "ml", kid: 0.7, note: "500 ml per person, +100 ml for every hour beyond 3" },
      { name: "Soft drinks / juice", qty: 300 + extraHours * 75, unit: "ml", kid: 1, note: "300 ml per person, +75 ml for every hour beyond 3" },
      { name: "Tea / coffee", qty: teaCups, unit: "cups", kid: 0.15, note: "plan ~120 ml brew, milk and sugar per cup" },
      { name: "Ice", qty: 500, unit: "g", kid: 0.5, note: "500 g per person — take more in peak summer" },
    ].map((item) => ({
      ...item,
      total: item.qty * headsFor(item.kid) * bufferMult,
    }));

    return { courses, drinks, effHours };
  }, [adults, kids, hours, meal, cuisine, appetite, buffer]);

  const mealLabel = MEALS.find((m) => m.id === meal)?.label;
  const cuisineLabel = CUISINES.find((c) => c.id === cuisine)?.label;
  const plates = Math.ceil(adults + kids * 0.5);

  const report = useMemo(() => {
    const lines = [
      `PARTY FOOD PLAN — ${mealLabel}, ${cuisineLabel}`,
      `Guests: ${adults} adults + ${kids} kids | Duration: ${nf.format(hours)} hrs | Appetite: ${APPETITES[appetite].label}${buffer ? " | +10% host buffer" : ""}`,
      "",
    ];
    plan.courses.forEach((course) => {
      lines.push(course.title.toUpperCase());
      course.items.forEach((item) => {
        lines.push(`[ ] ${item.name} — ${formatTotal(item.total, item.unit)}  (${perAdultLabel(item)} per adult)`);
      });
      lines.push("");
    });
    lines.push("DRINKS & ICE");
    plan.drinks.forEach((item) => {
      lines.push(`[ ] ${item.name} — ${formatTotal(item.total, item.unit)}  (${perAdultLabel(item)} per adult)`);
    });
    lines.push("");
    lines.push("Math: total = per-adult figure x (adults + kid-share x kids) x appetite x buffer.");
    lines.push(`Generated: ${new Date().toLocaleString()}`);
    return lines.join("\n");
  }, [plan, adults, kids, hours, appetite, buffer, mealLabel, cuisineLabel]);

  const applyPreset = (preset) => {
    setAdults(preset.adults);
    setKids(preset.kids);
    setHours(preset.hours);
    setMeal(preset.meal);
    setCuisine(preset.cuisine);
    setAppetite(preset.appetite);
  };

  const copyReport = async () => {
    const success = await safeCopyText(report);
    if (!success) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const noGuests = adults + kids === 0;

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <PartyPopper className="h-4 w-4" />
            Host like a caterer
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Party Food Quantity Planner</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Enter your guest list and get a shopping-ready plan built on real caterer per-person figures — rice by the
            gram, starters by the piece, drinks by the litre. No more midnight roti panic or a fridge full of regret.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[390px_1fr]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-semibold">Adults</span>
                <input
                  type="number"
                  min="0"
                  max="2000"
                  value={adults}
                  onChange={(event) => setAdults(Math.min(2000, Math.max(0, Math.round(Number(event.target.value) || 0))))}
                  className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold">Kids (3-12 yrs)</span>
                <input
                  type="number"
                  min="0"
                  max="2000"
                  value={kids}
                  onChange={(event) => setKids(Math.min(2000, Math.max(0, Math.round(Number(event.target.value) || 0))))}
                  className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>
            </div>

            <label className="mt-5 block">
              <span className="flex items-center justify-between text-sm font-semibold">
                Party duration
                <span className="text-[var(--primary)]">{nf.format(hours)} hrs</span>
              </span>
              <input
                type="range"
                min="1"
                max="8"
                step="0.5"
                value={hours}
                onChange={(event) => setHours(Number(event.target.value))}
                className="mt-3 w-full accent-[var(--primary)]"
              />
              <span className="mt-1 block text-xs text-[var(--muted-foreground)]">{MEAL_NOTES[meal]}</span>
            </label>

            <div className="mt-5">
              <span className="text-sm font-semibold">Meal type</span>
              <div className="mt-2 grid gap-2">
                {MEALS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMeal(item.id)}
                    className={`rounded-md border px-3 py-2.5 text-left text-sm font-semibold transition ${
                      meal === item.id
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <span className="text-sm font-semibold">Cuisine style</span>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {CUISINES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCuisine(item.id)}
                    className={`rounded-md border px-2 py-2.5 text-center text-sm font-semibold transition ${
                      cuisine === item.id
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <label className="mt-5 block">
              <span className="flex items-center justify-between text-sm font-semibold">
                Appetite level
                <span className="text-[var(--primary)]">{APPETITES[appetite].label}</span>
              </span>
              <input
                type="range"
                min="0"
                max="2"
                step="1"
                value={appetite}
                onChange={(event) => setAppetite(Number(event.target.value))}
                className="mt-3 w-full accent-[var(--primary)]"
              />
              <span className="mt-1 block text-xs text-[var(--muted-foreground)]">{APPETITES[appetite].hint}</span>
            </label>

            <label className="mt-5 flex cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-3">
              <input
                type="checkbox"
                checked={buffer}
                onChange={(event) => setBuffer(event.target.checked)}
                className="h-4 w-4 accent-[var(--primary)]"
              />
              <span className="text-sm font-semibold">
                Add 10% host buffer
                <span className="block text-xs font-normal text-[var(--muted-foreground)]">the classic caterer safety margin on everything</span>
              </span>
            </label>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-sm font-semibold">Quick presets</span>
                <button
                  type="button"
                  onClick={() => {
                    setAdults(20);
                    setKids(8);
                    setHours(3);
                    setMeal("dinner");
                    setCuisine("indian");
                    setAppetite(1);
                    setBuffer(true);
                  }}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)]"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </button>
              </div>
              <div className="grid gap-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-left text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                {mealLabel} · {cuisineLabel}
              </p>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={copyReport} className="btn-secondary min-h-9 px-3 py-1.5 text-sm">
                  <Copy className="h-4 w-4" />
                  {copied ? "Copied" : "Copy list"}
                </button>
                <button
                  type="button"
                  onClick={() => downloadTextFile("party-food-shopping-list.txt", report)}
                  className="btn-secondary min-h-9 px-3 py-1.5 text-sm"
                >
                  <FileDown className="h-4 w-4" />
                  Download
                </button>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3" aria-live="polite">
              <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                <p className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
                  <Users className="h-3.5 w-3.5" />
                  Headcount
                </p>
                <p className="mt-1 font-semibold">
                  {adults + kids} guests
                  <span className="ml-1 text-xs font-normal text-[var(--muted-foreground)]">({adults} adults · {kids} kids)</span>
                </p>
              </div>
              <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                <p className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
                  <UtensilsCrossed className="h-3.5 w-3.5" />
                  Plates to plan
                </p>
                <p className="mt-1 font-semibold">
                  ≈ {plates}
                  <span className="ml-1 text-xs font-normal text-[var(--muted-foreground)]">a kid plate ≈ half an adult plate</span>
                </p>
              </div>
              <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                <p className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
                  <CupSoda className="h-3.5 w-3.5" />
                  Eating window
                </p>
                <p className="mt-1 font-semibold">
                  {nf.format(hours)} hrs
                  {meal === "snacks" && (
                    <span className="ml-1 text-xs font-normal text-[var(--muted-foreground)]">({nf.format(plan.effHours)} grazing-hours)</span>
                  )}
                </p>
              </div>
            </div>

            {noGuests ? (
              <p className="mt-6 rounded-md bg-[var(--muted)] p-4 text-sm text-[var(--muted-foreground)]">
                Add at least one guest to build the plan.
              </p>
            ) : (
              <>
                {plan.courses.map((course) => (
                  <div key={course.title} className="mt-6">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--primary)]">{course.title}</h2>
                    <div className="mt-2 overflow-x-auto">
                      <table className="w-full min-w-[520px] text-sm">
                        <thead>
                          <tr className="border-b border-[var(--border)] text-left text-xs uppercase text-[var(--muted-foreground)]">
                            <th scope="col" className="py-2 pr-3 font-semibold">Item</th>
                            <th scope="col" className="py-2 pr-3 font-semibold">Per adult</th>
                            <th scope="col" className="py-2 pr-3 font-semibold">Kid share</th>
                            <th scope="col" className="py-2 text-right font-semibold">Total to arrange</th>
                          </tr>
                        </thead>
                        <tbody>
                          {course.items.map((item) => (
                            <tr key={item.name} className="border-b border-[var(--border)] last:border-0">
                              <td className="py-2.5 pr-3">
                                <p className="font-medium">{item.name}</p>
                                {item.note && <p className="text-xs text-[var(--muted-foreground)]">{item.note}</p>}
                              </td>
                              <td className="py-2.5 pr-3 text-[var(--muted-foreground)]">{perAdultLabel(item)}</td>
                              <td className="py-2.5 pr-3 text-[var(--muted-foreground)]">{Math.round(item.kid * 100)}%</td>
                              <td className="py-2.5 text-right font-semibold text-[var(--primary)]">{formatTotal(item.total, item.unit)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}

                <div className="mt-6">
                  <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-[var(--primary)]">
                    <CupSoda className="h-4 w-4" />
                    Drinks & ice
                  </h2>
                  <div className="mt-2 overflow-x-auto">
                    <table className="w-full min-w-[520px] text-sm">
                      <thead>
                        <tr className="border-b border-[var(--border)] text-left text-xs uppercase text-[var(--muted-foreground)]">
                          <th scope="col" className="py-2 pr-3 font-semibold">Item</th>
                          <th scope="col" className="py-2 pr-3 font-semibold">Per adult</th>
                          <th scope="col" className="py-2 pr-3 font-semibold">Kid share</th>
                          <th scope="col" className="py-2 text-right font-semibold">Total to arrange</th>
                        </tr>
                      </thead>
                      <tbody>
                        {plan.drinks.map((item) => (
                          <tr key={item.name} className="border-b border-[var(--border)] last:border-0">
                            <td className="py-2.5 pr-3">
                              <p className="font-medium">{item.name}</p>
                              {item.note && <p className="text-xs text-[var(--muted-foreground)]">{item.note}</p>}
                            </td>
                            <td className="py-2.5 pr-3 text-[var(--muted-foreground)]">{perAdultLabel(item)}</td>
                            <td className="py-2.5 pr-3 text-[var(--muted-foreground)]">{Math.round(item.kid * 100)}%</td>
                            <td className="py-2.5 text-right font-semibold text-[var(--primary)]">{formatTotal(item.total, item.unit)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <p className="mt-5 text-sm leading-6 text-[var(--muted-foreground)]">
                  Formula: total = per-adult figure x (adults + kid-share x kids) x appetite ({APPETITES[appetite].mult}x)
                  {buffer ? " x 1.1 buffer" : ""}. Piece counts round up to the next practical pack size.
                </p>
              </>
            )}

            <div className="mt-6 rounded-md bg-[var(--muted)] p-4">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <Lightbulb className="h-4 w-4 text-[var(--primary)]" />
                Leftovers vs shortage — pick your side once
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                A good host plans to run out of nothing and accepts a little left over. Keep the 10% buffer on staples
                (rice, dal, water) where leftovers store well, and stay exact on costly pieces (paneer starters,
                desserts) where counts are easy to control. Running short mid-party cannot be fixed; a box of leftovers
                becomes tomorrow&apos;s lunch — or a happy parting gift for guests.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
