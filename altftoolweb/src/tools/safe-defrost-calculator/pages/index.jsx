"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Beef,
  CalendarClock,
  Copy,
  Croissant,
  Drumstick,
  Fish,
  Microwave,
  Refrigerator,
  ShieldCheck,
  Shrimp,
  Snowflake,
  Soup,
  Thermometer,
  TriangleAlert,
  Waves,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const foodTypes = [
  {
    id: "chicken-whole",
    label: "Chicken, whole",
    icon: Drumstick,
    defaultKg: 1.5,
    fridgeHoursPerKg: 12,
    fridgeMinHours: 12,
    coldWater: true,
    microwave: false,
    microwaveNote: "A whole bird cooks on the outside long before the cavity thaws. Use the fridge or cold water.",
    roomTempSafe: false,
    tempKey: "poultry",
    tip: "Thaw it breast-side up on a tray. The giblet bag inside is usually the last thing to free up — if it will not pull out, it is not thawed yet.",
  },
  {
    id: "chicken-pieces",
    label: "Chicken pieces",
    icon: Drumstick,
    defaultKg: 0.75,
    fridgeHoursPerKg: 10,
    fridgeMinHours: 6,
    coldWater: true,
    microwave: true,
    microwaveMinPerKg: 9,
    roomTempSafe: false,
    tempKey: "poultry",
    tip: "Separate the pieces as soon as they loosen. A frozen block of thighs takes twice as long as the same weight spread out.",
  },
  {
    id: "mince",
    label: "Mince / ground meat",
    icon: Beef,
    defaultKg: 0.5,
    fridgeHoursPerKg: 10,
    fridgeMinHours: 6,
    coldWater: true,
    microwave: true,
    microwaveMinPerKg: 8,
    roomTempSafe: false,
    tempKey: "mince",
    tip: "Freeze it flat in a bag next time. A 2 cm slab thaws in a third of the time a fist-shaped lump takes.",
  },
  {
    id: "fish",
    label: "Fish fillets",
    icon: Fish,
    defaultKg: 0.5,
    fridgeHoursPerKg: 8,
    fridgeMinHours: 4,
    coldWater: true,
    microwave: true,
    microwaveMinPerKg: 6,
    roomTempSafe: false,
    tempKey: "fish",
    tip: "Take fish out of vacuum packaging before thawing. Sealed airless bags are a botulism risk with fish specifically.",
  },
  {
    id: "prawns",
    label: "Prawns / shrimp",
    icon: Shrimp,
    defaultKg: 0.35,
    fridgeHoursPerKg: 6,
    fridgeMinHours: 3,
    coldWater: true,
    microwave: false,
    microwaveNote: "Prawns go from frozen to rubbery in seconds. Cold water is faster anyway.",
    roomTempSafe: false,
    tempKey: "fish",
    tip: "Cold water in a colander is the standard restaurant move — prawns are small enough to be ready in well under an hour.",
  },
  {
    id: "roast",
    label: "Red meat roast",
    icon: Beef,
    defaultKg: 2,
    fridgeHoursPerKg: 12,
    fridgeMinHours: 12,
    coldWater: true,
    microwave: false,
    microwaveNote: "A joint this thick will grey and part-cook at the edges while the centre stays solid. Plan the fridge instead.",
    roomTempSafe: false,
    tempKey: "wholecuts",
    tip: "Big joints are the one thing worth planning two days ahead for. Leave it on the bottom shelf on a tray.",
  },
  {
    id: "steaks",
    label: "Steaks / chops",
    icon: Beef,
    defaultKg: 0.5,
    fridgeHoursPerKg: 10,
    fridgeMinHours: 5,
    coldWater: true,
    microwave: true,
    microwaveMinPerKg: 7,
    roomTempSafe: false,
    tempKey: "wholecuts",
    tip: "Microwave defrost ruins a good steak — the edges start to cook. Cold water gets a single steak ready in about half an hour.",
  },
  {
    id: "bread",
    label: "Bread / baked goods",
    icon: Croissant,
    defaultKg: 0.4,
    fridgeHoursPerKg: 4,
    fridgeMinHours: 2,
    coldWater: false,
    coldWaterNote: "Water and bread do not mix. Room temperature or a low oven is the right call here.",
    microwave: true,
    microwaveMinPerKg: 4,
    roomTempSafe: true,
    tempKey: null,
    tip: "Bread is the exception to the countertop rule — it is not a food bacteria can grow in dangerously. Thaw it on the side, or refresh a loaf straight from frozen in a 160°C oven for 10 minutes.",
  },
  {
    id: "leftovers",
    label: "Cooked leftovers",
    icon: Soup,
    defaultKg: 0.6,
    fridgeHoursPerKg: 10,
    fridgeMinHours: 6,
    coldWater: true,
    microwave: true,
    microwaveMinPerKg: 8,
    roomTempSafe: false,
    tempKey: "leftovers",
    tip: "Already-cooked food has no safety margin left — it will not get a second kill step unless you reheat it properly to steaming hot.",
  },
];

const internalTemps = [
  {
    key: "poultry",
    food: "Poultry — whole, pieces, or minced",
    c: "74°C",
    f: "165°F",
    note: "No resting time needed. Check the thickest part of the thigh, away from bone.",
  },
  {
    key: "mince",
    food: "Minced beef, pork, lamb",
    c: "71°C",
    f: "160°F",
    note: "Grinding spreads surface bacteria all through the meat, so the centre has to get there.",
  },
  {
    key: "wholecuts",
    food: "Whole cuts — beef, pork, lamb, veal",
    c: "63°C",
    f: "145°F",
    note: "Then rest for 3 minutes before carving. Steaks and roasts are only contaminated on the surface.",
  },
  {
    key: "fish",
    food: "Fish and shellfish",
    c: "63°C",
    f: "145°F",
    note: "Or cook until the flesh is opaque and separates cleanly with a fork.",
  },
  {
    key: "leftovers",
    food: "Leftovers and reheated dishes",
    c: "74°C",
    f: "165°F",
    note: "Reheat until steaming hot the whole way through, not just warm at the edges.",
  },
];

const refreezingRules = [
  {
    verdict: "safe",
    title: "Thawed in the fridge, still cold",
    body: "Safe to refreeze without cooking, as long as it stayed at fridge temperature and it is within a day or two. You will lose some texture to ice crystals, but not safety.",
  },
  {
    verdict: "safe",
    title: "Thawed, then cooked",
    body: "Always safe to freeze again once it has been cooked through and cooled quickly. This is the reliable way to rescue food you cannot use in time.",
  },
  {
    verdict: "danger",
    title: "Thawed in cold water or the microwave",
    body: "Do not refreeze raw. Both methods let parts of the food warm up past fridge temperature. Cook it first, then freeze the cooked dish.",
  },
  {
    verdict: "danger",
    title: "Left out, or warm to the touch",
    body: "Anything above 5°C for more than 2 hours should not be refrozen and should not be eaten. Freezing pauses bacteria; it does not undo the growth.",
  },
];

const clampKg = (value) => Math.min(6, Math.max(0.25, Math.round(value * 4) / 4));

const formatHours = (hours) => {
  const totalMin = Math.max(0, Math.round(hours * 60));
  const days = Math.floor(totalMin / 1440);
  const h = Math.floor((totalMin % 1440) / 60);
  const m = totalMin % 60;
  const parts = [];
  if (days) parts.push(`${days} day${days > 1 ? "s" : ""}`);
  if (h) parts.push(`${h} hr`);
  if (m) parts.push(`${m} min`);
  return parts.join(" ") || "0 min";
};

const formatMinutes = (minutes) => {
  const total = Math.max(1, Math.round(minutes));
  if (total < 60) return `${total} min`;
  return formatHours(total / 60);
};

const formatWhen = (date) =>
  date.toLocaleString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });

const toDateInput = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const parseTarget = (dateStr, timeStr) => {
  const [y, m, d] = (dateStr || "").split("-").map(Number);
  const [hh, mm] = (timeStr || "").split(":").map(Number);
  if (!y || !m || !d || !Number.isFinite(hh) || !Number.isFinite(mm)) return null;
  return new Date(y, m - 1, d, hh, mm, 0, 0);
};

export default function ToolHome() {
  const [foodId, setFoodId] = useState("chicken-pieces");
  const [kg, setKg] = useState(0.75);
  const [cookDate, setCookDate] = useState("");
  const [cookTime, setCookTime] = useState("19:00");
  const [now, setNow] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const stamp = new Date();
    setNow(stamp);
    setCookDate(toDateInput(stamp));
    const id = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(id);
  }, []);

  const food = foodTypes.find((item) => item.id === foodId) || foodTypes[1];

  const selectFood = (item) => {
    setFoodId(item.id);
    setKg(item.defaultKg);
  };

  const fridgeHours = useMemo(
    () => Math.max(food.fridgeMinHours, food.fridgeHoursPerKg * kg),
    [food, kg]
  );

  const coldWaterHours = useMemo(() => Math.max(0.5, kg * 1), [kg]);

  const microwaveMinutes = useMemo(
    () => (food.microwave ? Math.max(2, (food.microwaveMinPerKg || 8) * kg) : 0),
    [food, kg]
  );

  const waterChanges = Math.max(0, Math.ceil(coldWaterHours * 2) - 1);

  const target = useMemo(() => parseTarget(cookDate, cookTime), [cookDate, cookTime]);

  const planner = useMemo(() => {
    if (!now || !target) return null;
    const fridgeStart = new Date(target.getTime() - fridgeHours * 3600 * 1000);
    const coldStart = new Date(target.getTime() - coldWaterHours * 3600 * 1000);
    const fridgeReadyIfStartedNow = new Date(now.getTime() + fridgeHours * 3600 * 1000);
    const coldReadyIfStartedNow = new Date(now.getTime() + coldWaterHours * 3600 * 1000);
    return {
      targetPassed: target.getTime() <= now.getTime(),
      fridgeStart,
      coldStart,
      fridgeFeasible: fridgeStart.getTime() > now.getTime(),
      coldFeasible: coldStart.getTime() > now.getTime(),
      fridgeReadyIfStartedNow,
      coldReadyIfStartedNow,
      lateByHours: (now.getTime() - fridgeStart.getTime()) / 3600000,
    };
  }, [coldWaterHours, fridgeHours, now, target]);

  const waterChangeTimes = useMemo(() => {
    if (!planner || !food.coldWater) return [];
    const start = planner.coldFeasible ? planner.coldStart : now;
    if (!start) return [];
    const stamps = [];
    for (let i = 1; i <= Math.min(waterChanges, 8); i += 1) {
      stamps.push(new Date(start.getTime() + i * 30 * 60 * 1000));
    }
    return stamps;
  }, [food.coldWater, now, planner, waterChanges]);

  const tempRow = internalTemps.find((row) => row.key === food.tempKey) || null;

  const plan = useMemo(() => {
    const lines = [
      "Safe Defrost Plan",
      `Food: ${food.label}`,
      `Weight: ${kg} kg`,
      "",
      `Fridge method: ${formatHours(fridgeHours)} (safest, and the only method you can refreeze from)`,
      food.coldWater
        ? `Cold water method: ${formatHours(coldWaterHours)} in a sealed bag, change the water every 30 min, cook immediately`
        : `Cold water method: not suitable — ${food.coldWaterNote || ""}`,
      food.microwave
        ? `Microwave defrost: ~${formatMinutes(microwaveMinutes)}, then cook immediately`
        : `Microwave defrost: not suitable — ${food.microwaveNote || ""}`,
      "",
      "Never thaw on the counter. Above 5°C bacteria multiply, and 2 hours is the limit.",
    ];
    if (planner && target) {
      lines.push("", `Target cook time: ${formatWhen(target)}`);
      lines.push(
        planner.fridgeFeasible
          ? `Move it from the freezer to the fridge by: ${formatWhen(planner.fridgeStart)}`
          : `Too late for the fridge — start cold water at ${formatWhen(planner.coldStart)}`
      );
    }
    if (tempRow) lines.push("", `Cook to an internal temperature of ${tempRow.c} / ${tempRow.f}.`);
    return lines.join("\n");
  }, [
    coldWaterHours,
    food,
    fridgeHours,
    kg,
    microwaveMinutes,
    planner,
    target,
    tempRow,
  ]);

  const copyPlan = async () => {
    const success = await safeCopyText(plan);
    if (!success) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Snowflake className="h-4 w-4" />
            Food safety
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Safe Defrost Time Calculator</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Pick what is in the freezer and how much of it, and get realistic thawing times for the three methods that
            are actually safe — plus the clock time you need to move it to the fridge if you want to eat on schedule.
          </p>
        </section>

        <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
          <h2 className="text-lg font-semibold">What are you defrosting?</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {foodTypes.map((item) => {
              const Icon = item.icon;
              const active = item.id === foodId;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectFood(item)}
                  aria-pressed={active}
                  className={`flex flex-col items-center gap-2 rounded-md border p-4 text-center transition ${
                    active
                      ? "border-[var(--primary)] bg-[var(--muted)]"
                      : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]"
                  }`}
                >
                  <Icon className={`h-6 w-6 ${active ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"}`} />
                  <span className={`text-sm font-semibold ${active ? "text-[var(--primary)]" : ""}`}>{item.label}</span>
                </button>
              );
            })}
          </div>

          <label className="mt-5 block">
            <span className="flex items-center justify-between gap-2 text-sm font-semibold">
              <span>Weight</span>
              <span className="tabular-nums text-[var(--muted-foreground)]">{kg.toFixed(2)} kg</span>
            </span>
            <input
              type="range"
              min={0.25}
              max={6}
              step={0.25}
              value={kg}
              onChange={(event) => setKg(clampKg(Number(event.target.value)))}
              className="mt-3 w-full accent-[var(--primary)]"
            />
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            {[0.25, 0.5, 1, 1.5, 2, 3, 5].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setKg(preset)}
                className={`rounded-md border px-3 py-1.5 text-xs font-semibold transition ${
                  kg === preset
                    ? "border-[var(--primary)] text-[var(--primary)]"
                    : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                }`}
              >
                {preset} kg
              </button>
            ))}
          </div>
          <p className="mt-4 rounded-md bg-[var(--muted)] p-3 text-sm leading-6 text-[var(--muted-foreground)]">
            <span className="font-semibold text-[var(--foreground)]">Tip:</span> {food.tip}
          </p>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-3" aria-live="polite">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Refrigerator className="h-5 w-5 text-[var(--primary)]" />
                <h3 className="font-semibold">Fridge</h3>
              </div>
              <span
                className="rounded-full px-2 py-0.5 text-xs font-semibold"
                style={{ background: "var(--anslation-ds-success-soft)", color: "var(--anslation-ds-success)" }}
              >
                Safest
              </span>
            </div>
            <p className="mt-3 text-3xl font-semibold text-[var(--primary)]">{formatHours(fridgeHours)}</p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
              Formula: {food.fridgeHoursPerKg} hr per kg × {kg.toFixed(2)} kg, minimum {food.fridgeMinHours} hr. The food
              never leaves the safe zone below 5°C, so this is the only method you can refreeze from without cooking.
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
              Put it on a tray on the bottom shelf so drips cannot land on anything ready to eat.
            </p>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Waves className="h-5 w-5 text-[var(--primary)]" />
                <h3 className="font-semibold">Cold water</h3>
              </div>
              {food.coldWater ? (
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-semibold"
                  style={{ background: "var(--anslation-ds-warning-soft)", color: "var(--anslation-ds-warning)" }}
                >
                  Cook now
                </span>
              ) : null}
            </div>
            {food.coldWater ? (
              <>
                <p className="mt-3 text-3xl font-semibold text-[var(--primary)]">{formatHours(coldWaterHours)}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                  Formula: 30 min per 500 g. Seal it in a leak-proof bag and submerge it fully in cold tap water.{" "}
                  {waterChanges === 0
                    ? "It is small enough to be done before the first water change is even due."
                    : `Change the water every 30 minutes — about ${waterChanges} change${waterChanges > 1 ? "s" : ""} for this weight.`}
                </p>
                <p className="mt-2 text-sm font-semibold" style={{ color: "var(--anslation-ds-warning)" }}>
                  Cook immediately once thawed — do not refreeze raw.
                </p>
              </>
            ) : (
              <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">{food.coldWaterNote}</p>
            )}
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Microwave className="h-5 w-5 text-[var(--primary)]" />
                <h3 className="font-semibold">Microwave</h3>
              </div>
              {food.microwave ? (
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-semibold"
                  style={{ background: "var(--anslation-ds-warning-soft)", color: "var(--anslation-ds-warning)" }}
                >
                  Cook now
                </span>
              ) : null}
            </div>
            {food.microwave ? (
              <>
                <p className="mt-3 text-3xl font-semibold text-[var(--primary)]">
                  ~{formatMinutes(microwaveMinutes)}
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                  Formula: about {food.microwaveMinPerKg} min per kg on the defrost setting. Stop and turn it every few
                  minutes, and stop early if any edge starts to look cooked.
                </p>
                <p className="mt-2 text-sm font-semibold" style={{ color: "var(--anslation-ds-warning)" }}>
                  Cook immediately — microwaves leave warm spots bacteria love.
                </p>
              </>
            ) : (
              <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">{food.microwaveNote}</p>
            )}
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-[var(--primary)]" />
              <h2 className="text-lg font-semibold">Today&apos;s planner</h2>
            </div>
            <button type="button" onClick={copyPlan} className="btn-secondary min-h-9 px-3 py-1.5 text-sm">
              <Copy className="h-4 w-4" />
              {copied ? "Copied" : "Copy plan"}
            </button>
          </div>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Tell it when you want to cook, and it works backwards from now to the moment the food has to leave the
            freezer.
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 2xl:max-w-xl">
            <label className="block">
              <span className="text-sm font-semibold">Cooking date</span>
              <input
                type="date"
                value={cookDate}
                onChange={(event) => setCookDate(event.target.value)}
                className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold">Cooking time</span>
              <input
                type="time"
                value={cookTime}
                onChange={(event) => setCookTime(event.target.value)}
                className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
              />
            </label>
          </div>

          <div className="mt-5" aria-live="polite">
            {!planner || !target ? (
              <p className="rounded-md bg-[var(--muted)] p-4 text-sm text-[var(--muted-foreground)]">
                Pick a cooking date and time to see your schedule.
              </p>
            ) : planner.targetPassed ? (
              <p className="rounded-md bg-[var(--muted)] p-4 text-sm text-[var(--muted-foreground)]">
                That time has already passed. Pick a time in the future to plan backwards from.
              </p>
            ) : (
              <div className="grid gap-4">
                <div
                  className="rounded-md border p-4"
                  style={{
                    borderColor: planner.fridgeFeasible ? "var(--anslation-ds-success)" : "var(--border)",
                    background: planner.fridgeFeasible ? "var(--anslation-ds-success-soft)" : "var(--muted)",
                  }}
                >
                  <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Fridge plan</p>
                  {planner.fridgeFeasible ? (
                    <>
                      <p className="mt-1 text-lg font-semibold text-[var(--foreground)]">
                        Cooking at {formatWhen(target)} → move it to the fridge by{" "}
                        <span style={{ color: "var(--anslation-ds-success)" }}>{formatWhen(planner.fridgeStart)}</span>
                      </p>
                      <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                        That gives it the full {formatHours(fridgeHours)} it needs. Earlier is fine — it will happily
                        sit thawed in the fridge for a day.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="mt-1 text-lg font-semibold text-[var(--foreground)]">
                        Too late for the fridge by about {formatHours(planner.lateByHours)}.
                      </p>
                      <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                        Starting now, the fridge would have it ready at {formatWhen(planner.fridgeReadyIfStartedNow)}.
                        {food.coldWater
                          ? " Use the cold-water method below instead."
                          : " Move your cooking time later if you can."}
                      </p>
                    </>
                  )}
                </div>

                {food.coldWater ? (
                  <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
                    <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                      Cold-water plan (backup)
                    </p>
                    <p className="mt-1 text-lg font-semibold">
                      {planner.coldFeasible
                        ? `Start the cold water at ${formatWhen(planner.coldStart)}`
                        : `Start now — ready at ${formatWhen(planner.coldReadyIfStartedNow)}`}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                      Sealed bag, fully submerged, {formatHours(coldWaterHours)} total.
                      {waterChangeTimes.length > 0 ? " Change the water at:" : " No water change needed at this size."}
                    </p>
                    {waterChangeTimes.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {waterChangeTimes.map((stamp) => (
                          <span
                            key={stamp.getTime()}
                            className="rounded-full border border-[var(--border)] px-2.5 py-1 text-xs font-semibold tabular-nums text-[var(--muted-foreground)]"
                          >
                            {stamp.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                          </span>
                        ))}
                        {waterChanges > waterChangeTimes.length ? (
                          <span className="px-1 py-1 text-xs text-[var(--muted-foreground)]">
                            …and every 30 min after
                          </span>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <div
            className="rounded-lg border p-6"
            style={{ borderColor: "var(--anslation-ds-danger)", background: "var(--anslation-ds-danger-soft)" }}
          >
            <div className="flex items-center gap-2">
              <TriangleAlert className="h-5 w-5" style={{ color: "var(--anslation-ds-danger)" }} />
              <h2 className="text-lg font-semibold" style={{ color: "var(--anslation-ds-danger)" }}>
                Never defrost on the countertop
              </h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-[var(--foreground)]">
              It is the most common way people get sick from their own kitchen, and it fails for a reason that is easy
              to miss: the outside thaws long before the middle does.
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--foreground)]">
              Between <strong>5°C and 60°C</strong> — the danger zone — bacteria like salmonella and E. coli double
              roughly every 20 minutes. A chicken sitting on the side has a warm, wet surface at room temperature for
              hours while the core is still frozen solid. By the time the centre is thawed, the surface has been
              breeding bacteria the whole time.
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--foreground)]">
              The rule is <strong>2 hours total</strong> above 5°C, and only <strong>1 hour</strong> if the room is
              above 32°C. That counts every minute — shopping, prep, and serving all come out of the same budget.
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--foreground)]">
              Cooking afterwards does not fix it. Heat kills bacteria, but several strains leave behind toxins that
              survive cooking temperatures completely.
            </p>
            {food.roomTempSafe ? (
              <p className="mt-3 rounded-md bg-[var(--card)] p-3 text-sm leading-6 text-[var(--foreground)]">
                <strong>Exception — {food.label.toLowerCase()}:</strong> bread and baked goods are not moist,
                protein-rich foods that dangerous bacteria can grow in, so the countertop rule does not apply. Thawing a
                loaf on the side is fine.
              </p>
            ) : null}
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[var(--primary)]" />
              <h2 className="text-lg font-semibold">Can you refreeze it?</h2>
            </div>
            <div className="mt-4 grid gap-3">
              {refreezingRules.map((rule) => (
                <div
                  key={rule.title}
                  className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
                  style={{
                    borderLeftWidth: "4px",
                    borderLeftColor:
                      rule.verdict === "safe" ? "var(--anslation-ds-success)" : "var(--anslation-ds-danger)",
                  }}
                >
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    <span
                      style={{
                        color: rule.verdict === "safe" ? "var(--anslation-ds-success)" : "var(--anslation-ds-danger)",
                      }}
                    >
                      {rule.verdict === "safe" ? "Yes" : "No"}
                    </span>
                    — {rule.title}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{rule.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
          <div className="flex items-center gap-2">
            <Thermometer className="h-5 w-5 text-[var(--primary)]" />
            <h2 className="text-lg font-semibold">Safe internal cooking temperatures</h2>
          </div>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Defrosting safely only gets you to the pan. A probe thermometer in the thickest part is the only way to
            actually know — colour and juices are not reliable.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="px-3 py-2 font-semibold">Food</th>
                  <th className="px-3 py-2 font-semibold">Celsius</th>
                  <th className="px-3 py-2 font-semibold">Fahrenheit</th>
                  <th className="px-3 py-2 font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody>
                {internalTemps.map((row) => {
                  const active = row.key === food.tempKey;
                  return (
                    <tr
                      key={row.key}
                      className="border-b border-[var(--border)]"
                      style={active ? { background: "var(--muted)" } : undefined}
                    >
                      <td className="px-3 py-2 font-semibold">
                        {row.food}
                        {active ? (
                          <span className="ml-2 rounded-full bg-[var(--primary)] px-2 py-0.5 text-xs text-[var(--primary-foreground)]">
                            Yours
                          </span>
                        ) : null}
                      </td>
                      <td className="px-3 py-2 font-semibold tabular-nums text-[var(--primary)]">{row.c}</td>
                      <td className="px-3 py-2 tabular-nums text-[var(--muted-foreground)]">{row.f}</td>
                      <td className="px-3 py-2 text-[var(--muted-foreground)]">{row.note}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--muted)] p-5">
          <p className="text-sm leading-6 text-[var(--muted-foreground)]">
            These are estimates for planning and awareness, not medical advice. Thawing times vary with your fridge
            temperature, how the food was packed and frozen, and its shape and thickness. When food safety is in
            question — or if you are pregnant, elderly, very young, or immunocompromised — follow your local food
            standards agency and consult a doctor about any illness.
          </p>
        </section>
      </div>
    </main>
  );
}
