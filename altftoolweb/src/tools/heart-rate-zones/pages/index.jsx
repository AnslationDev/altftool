"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Copy,
  HeartPulse,
  Info,
  Stethoscope,
  Target,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const FORMULAS = [
  {
    id: "tanaka",
    label: "Tanaka",
    expr: "208 − 0.7 × age",
    recommended: true,
    calc: (age) => 208 - 0.7 * age,
    note: "Drawn from a meta-analysis of 351 studies covering more than 18,000 people. It tracks measured max heart rate better than 220 − age across the whole age range, which is why it is the default here.",
  },
  {
    id: "fox",
    label: "Fox",
    expr: "220 − age",
    calc: (age) => 220 - age,
    note: "The famous one, and the weakest. It was never derived from a proper regression — it came out of a rough eyeball of existing data in the 1970s. It overestimates max heart rate in younger people and underestimates it in older ones.",
  },
  {
    id: "gulati",
    label: "Gulati (women)",
    expr: "206 − 0.88 × age",
    calc: (age) => 206 - 0.88 * age,
    note: "Derived from a study of over 5,000 women. 220 − age was built largely on men and overstates women's max heart rate, which drags every zone too high. If you are a woman, start here.",
  },
];

const METHODS = [
  {
    id: "pctmax",
    label: "% of max HR",
    blurb: "Simple. Takes a flat percentage of your max heart rate and ignores your resting rate.",
  },
  {
    id: "karvonen",
    label: "Karvonen (HR reserve)",
    blurb: "Works from your heart rate reserve — the gap between resting and max — so it adapts to your fitness.",
  },
];

const ZONES = [
  {
    id: 1,
    name: "Zone 1",
    title: "Active recovery",
    low: 0.5,
    high: 0.6,
    purpose:
      "Blood flow without stress. Warm-ups, cool-downs, and the day after something hard.",
    feels: "Very easy — you could hold a conversation, or sing along.",
    duration: "20–60 min",
    tone: "var(--anslation-ds-info)",
  },
  {
    id: 2,
    name: "Zone 2",
    title: "Fat burn / aerobic base",
    low: 0.6,
    high: 0.7,
    purpose:
      "Builds mitochondria, capillaries and stroke volume, and trains your body to run on fat. Almost all endurance progress is made here.",
    feels: "Easy — full sentences without gasping. Slower than your ego wants.",
    duration: "45 min – 3 hours",
    tone: "var(--anslation-ds-success)",
  },
  {
    id: 3,
    name: "Zone 3",
    title: "Aerobic / tempo",
    low: 0.7,
    high: 0.8,
    purpose:
      "Improves aerobic efficiency, but it is the classic grey zone — hard enough to tire you out, not hard enough to drive a strong adaptation.",
    feels: "Moderate — short sentences only. Comfortably uncomfortable.",
    duration: "20–60 min",
    tone: "var(--anslation-ds-warning)",
  },
  {
    id: 4,
    name: "Zone 4",
    title: "Lactate threshold",
    low: 0.8,
    high: 0.9,
    purpose:
      "Raises the pace you can hold before lactate runs away from you. This is where race speed lives.",
    feels: "Hard — a few words at a time, and your breathing is loud.",
    duration: "8–30 min, usually as intervals",
    tone: "color-mix(in srgb, var(--anslation-ds-danger) 65%, var(--anslation-ds-warning))",
  },
  {
    id: 5,
    name: "Zone 5",
    title: "VO2 max",
    low: 0.9,
    high: 1,
    purpose:
      "Pushes the ceiling on how much oxygen you can actually use. Small doses, big effect, long recovery.",
    feels: "Maximal — you cannot talk, and you are counting down the seconds.",
    duration: "30 sec – 4 min intervals, 5–15 min total",
    tone: "var(--anslation-ds-danger)",
  },
];

const GOALS = [
  {
    id: "fatloss",
    label: "Fat loss",
    zone: 2,
    note: "Zone 2 burns the highest percentage of its calories from fat, which is where the 'fat burning zone' name came from. But total calories burned is what moves weight, and that comes from time — Zone 2 is simply the hardest you can go and still last an hour. Diet does the heavy lifting; training builds the engine and protects muscle.",
  },
  {
    id: "base",
    label: "Endurance base",
    zone: 2,
    note: "Zone 2 is the entire foundation. Mitochondrial density, capillary growth, stroke volume — all built at conversational pace, over hours, across months. There is genuinely no shortcut, and going harder makes it worse, not faster.",
  },
  {
    id: "speed",
    label: "Race speed",
    zone: 4,
    note: "Zone 4 lifts your threshold, with Zone 5 touches to raise the ceiling. Even here, roughly 80% of your weekly time should still be easy — hard sessions only work if you arrive recovered enough to actually hit them.",
  },
  {
    id: "health",
    label: "General health",
    zone: 2,
    note: "Zone 2 for most of the week plus one or two Zone 4 sessions. The standard 150 minutes of moderate or 75 minutes of vigorous activity per week lands almost exactly here, and it is among the best-evidenced things you can do for how long and how well you live.",
  },
];

const RHR_BANDS = [
  {
    id: "athlete",
    limit: 60,
    label: "Athletic / well-trained",
    tone: "var(--anslation-ds-success)",
    soft: "var(--anslation-ds-success-soft)",
    range: "Under 60 bpm",
    detail:
      "A strong heart moves more blood per beat, so it needs fewer beats. Endurance training is the usual reason — though some people simply run low naturally.",
  },
  {
    id: "good",
    limit: 70,
    label: "Good",
    tone: "var(--anslation-ds-success)",
    soft: "var(--anslation-ds-success-soft)",
    range: "60–70 bpm",
    detail:
      "Better than most adults. Regular aerobic work will pull this down by 5–10 beats over a few months.",
  },
  {
    id: "average",
    limit: 80,
    label: "Average",
    tone: "var(--anslation-ds-warning)",
    soft: "var(--anslation-ds-warning-soft)",
    range: "70–80 bpm",
    detail:
      "Normal, and there is room to improve. Consistent Zone 2 volume is the most reliable way to lower it.",
  },
  {
    id: "high",
    limit: Infinity,
    label: "Higher than ideal",
    tone: "var(--anslation-ds-danger)",
    soft: "var(--anslation-ds-danger-soft)",
    range: "Above 80 bpm",
    detail:
      "Still inside the normal 60–100 range, but at the top of it. Deconditioning, stress, poor sleep, caffeine, dehydration, and some medications all push it up. A rising resting rate over weeks is worth paying attention to.",
  },
];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const bandForRhr = (rhr) => RHR_BANDS.find((band) => rhr < band.limit) || RHR_BANDS[RHR_BANDS.length - 1];

function ZoneChart({ zones, targetZone }) {
  return (
    <div className="overflow-hidden rounded-md border border-[var(--border)]">
      {[...zones].reverse().map((zone) => {
        const isTarget = zone.id === targetZone;
        return (
          <div
            key={zone.id}
            className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-3 py-3 last:border-b-0 sm:px-4"
            style={{
              background: isTarget
                ? `color-mix(in srgb, ${zone.tone} 26%, transparent)`
                : `color-mix(in srgb, ${zone.tone} 12%, transparent)`,
            }}
          >
            <div className="flex min-w-0 items-center gap-3">
              <span
                className="h-10 w-1.5 shrink-0 rounded-full"
                style={{ background: zone.tone }}
                aria-hidden="true"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {zone.name}
                  <span className="font-normal text-[var(--muted-foreground)]"> · {zone.title}</span>
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {Math.round(zone.low * 100)}–{Math.round(zone.high * 100)}%
                  {isTarget && (
                    <span
                      className="ml-2 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase"
                      style={{ background: zone.tone, color: "var(--primary-foreground)" }}
                    >
                      <Target className="h-2.5 w-2.5" />
                      Target
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-lg font-semibold tabular-nums">
                {zone.lowBpm}–{zone.highBpm}
              </p>
              <p className="text-[11px] text-[var(--muted-foreground)]">bpm</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function ToolHome() {
  const [age, setAge] = useState(30);
  const [rhr, setRhr] = useState(60);
  const [formulaId, setFormulaId] = useState("tanaka");
  const [methodId, setMethodId] = useState("karvonen");
  const [useOverride, setUseOverride] = useState(false);
  const [overrideHr, setOverrideHr] = useState(190);
  const [goalId, setGoalId] = useState("health");
  const [copied, setCopied] = useState(false);

  const formula = useMemo(
    () => FORMULAS.find((item) => item.id === formulaId) || FORMULAS[0],
    [formulaId]
  );
  const goal = useMemo(() => GOALS.find((item) => item.id === goalId) || GOALS[3], [goalId]);

  const safeAge = clamp(Number(age) || 0, 10, 100);
  const safeRhr = clamp(Number(rhr) || 0, 30, 120);
  const formulaMax = Math.round(formula.calc(safeAge));
  const maxHr = useOverride ? clamp(Math.round(Number(overrideHr) || 0), 100, 230) : formulaMax;
  const reserve = Math.max(1, maxHr - safeRhr);

  const zones = useMemo(() => {
    const byPctMax = (pct) => Math.round(maxHr * pct);
    const byKarvonen = (pct) => Math.round(safeRhr + reserve * pct);
    const resolve = methodId === "karvonen" ? byKarvonen : byPctMax;
    return ZONES.map((zone) => ({
      ...zone,
      lowBpm: resolve(zone.low),
      highBpm: resolve(zone.high),
      pctMaxLow: byPctMax(zone.low),
      pctMaxHigh: byPctMax(zone.high),
      karvonenLow: byKarvonen(zone.low),
      karvonenHigh: byKarvonen(zone.high),
    }));
  }, [maxHr, safeRhr, reserve, methodId]);

  const rhrBand = bandForRhr(safeRhr);
  const tachycardia = safeRhr > 100;
  const goalZone = zones.find((zone) => zone.id === goal.zone) || zones[1];

  const zoneCard = useMemo(
    () =>
      [
        "Heart Rate Training Zones",
        `Age ${safeAge} · Resting HR ${safeRhr} bpm`,
        useOverride
          ? `Max HR ${maxHr} bpm (measured, entered manually)`
          : `Max HR ${maxHr} bpm (${formula.label}: ${formula.expr})`,
        `Method: ${methodId === "karvonen" ? `Karvonen — resting + (${reserve} reserve × intensity)` : "Percentage of max HR"}`,
        "",
        ...zones.map(
          (zone) =>
            `${zone.name} ${zone.title.padEnd(24)} ${zone.lowBpm}-${zone.highBpm} bpm  (${Math.round(zone.low * 100)}-${Math.round(zone.high * 100)}%)`
        ),
        "",
        `Goal: ${goal.label} → train in Zone ${goal.zone} (${goalZone.lowBpm}-${goalZone.highBpm} bpm)`,
        "Keep about 80% of weekly time easy (Z1-Z2) and 20% hard (Z4-Z5).",
        `Generated: ${new Date().toLocaleString()}`,
      ].join("\n"),
    [safeAge, safeRhr, useOverride, maxHr, formula, methodId, reserve, zones, goal, goalZone]
  );

  const copyZones = async () => {
    const success = await safeCopyText(zoneCard);
    if (!success) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <HeartPulse className="h-4 w-4" />
            Training zones
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Heart Rate Training Zones</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Get your max heart rate and all five zones in real bpm — with the formula that is
            actually accurate, the Karvonen method that accounts for your resting rate, and a clear
            answer on which zone to train in.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[390px_1fr]">
          <div className="grid gap-6">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="grid gap-4">
                <label className="block">
                  <span className="text-sm font-semibold">Age</span>
                  <input
                    type="number"
                    min={10}
                    max={100}
                    value={age}
                    onChange={(event) => setAge(event.target.value)}
                    className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold">Resting heart rate (bpm)</span>
                  <input
                    type="number"
                    min={30}
                    max={120}
                    value={rhr}
                    onChange={(event) => setRhr(event.target.value)}
                    className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                  />
                </label>
                <div className="rounded-md bg-[var(--muted)] p-3">
                  <p className="flex items-start gap-2 text-[11px] leading-4 text-[var(--muted-foreground)]">
                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>
                      <span className="font-semibold text-[var(--foreground)]">How to measure it: </span>
                      first thing in the morning, before you sit up or reach for your phone. Count
                      beats at your wrist or neck for a full 60 seconds, and average three or four
                      mornings — one reading is noisy. If you wear a watch, its resting number is
                      usually your overnight low, which reads a few beats under a true seated rate.
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <p className="text-sm font-semibold">Max HR formula</p>
              <div className="mt-3 grid gap-2">
                {FORMULAS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFormulaId(item.id)}
                    disabled={useOverride}
                    className={`rounded-md border px-3 py-2.5 text-left transition disabled:opacity-50 ${
                      formulaId === item.id && !useOverride
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]"
                    }`}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold">{item.label}</span>
                      {item.recommended && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                            formulaId === item.id && !useOverride
                              ? "bg-[var(--primary-foreground)] text-[var(--primary)]"
                              : "bg-[var(--muted)] text-[var(--primary)]"
                          }`}
                        >
                          Recommended
                        </span>
                      )}
                    </span>
                    <span
                      className={`mt-0.5 block font-[family-name:var(--anslation-ds-font-mono)] text-xs ${
                        formulaId === item.id && !useOverride
                          ? "opacity-80"
                          : "text-[var(--muted-foreground)]"
                      }`}
                    >
                      {item.expr} = {Math.round(item.calc(safeAge))} bpm
                    </span>
                  </button>
                ))}
              </div>
              <p className="mt-3 text-[11px] leading-4 text-[var(--muted-foreground)]">
                {formula.note}
              </p>

              <label className="mt-4 flex cursor-pointer items-start gap-2.5 rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                <input
                  type="checkbox"
                  checked={useOverride}
                  onChange={(event) => setUseOverride(event.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--primary)]"
                />
                <span>
                  <span className="block text-xs font-semibold">I have a tested max HR</span>
                  <span className="block text-[11px] leading-4 text-[var(--muted-foreground)]">
                    From a lab test or a genuine all-out field effort. A real measurement beats every
                    formula here.
                  </span>
                </span>
              </label>

              {useOverride && (
                <label className="mt-3 block">
                  <span className="text-sm font-semibold">Measured max HR (bpm)</span>
                  <input
                    type="number"
                    min={100}
                    max={230}
                    value={overrideHr}
                    onChange={(event) => setOverrideHr(event.target.value)}
                    className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                  />
                </label>
              )}
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <p className="text-sm font-semibold">Zone method</p>
              <div className="mt-3 grid gap-2">
                {METHODS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMethodId(item.id)}
                    className={`rounded-md border px-3 py-2.5 text-left transition ${
                      methodId === item.id
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]"
                    }`}
                  >
                    <span className="block text-sm font-semibold">{item.label}</span>
                    <span
                      className={`mt-0.5 block text-[11px] leading-4 ${
                        methodId === item.id ? "opacity-80" : "text-[var(--muted-foreground)]"
                      }`}
                    >
                      {item.blurb}
                    </span>
                  </button>
                ))}
              </div>
              <p className="mt-3 font-[family-name:var(--anslation-ds-font-mono)] text-[11px] leading-4 text-[var(--muted-foreground)]">
                {methodId === "karvonen"
                  ? `target = ${safeRhr} + (${maxHr} − ${safeRhr}) × intensity`
                  : `target = ${maxHr} × intensity`}
              </p>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                  Your zones · {methodId === "karvonen" ? "Karvonen" : "% of max"}
                </p>
                <button
                  type="button"
                  onClick={copyZones}
                  className="btn-secondary min-h-9 px-3 py-1.5 text-sm"
                >
                  <Copy className="h-4 w-4" />
                  {copied ? "Copied" : "Copy zone card"}
                </button>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4" aria-live="polite">
                <div className="rounded-lg bg-[var(--muted)] p-5">
                  <p className="text-xs text-[var(--muted-foreground)]">Max heart rate</p>
                  <p className="text-4xl font-semibold text-[var(--primary)]">{maxHr} bpm</p>
                </div>
                <div className="grid gap-1 text-sm text-[var(--muted-foreground)]">
                  <p>
                    {useOverride
                      ? "From your measured test."
                      : `${formula.label}: ${formula.expr.replace("age", String(safeAge))} = ${formulaMax} bpm`}
                  </p>
                  <p>
                    Heart rate reserve: {maxHr} − {safeRhr} ={" "}
                    <span className="font-semibold text-[var(--foreground)]">{reserve} bpm</span>
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <ZoneChart zones={zones} targetZone={goal.zone} />
              </div>

              <p className="mt-4 text-[11px] leading-4 text-[var(--muted-foreground)]">
                Formula-based max heart rates carry a standard deviation of roughly 10–12 bpm, so
                your true max could sit a full zone away from this estimate. If your easy runs feel
                brutal at the top of Zone 2, trust your body over the arithmetic.
              </p>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <p className="text-sm font-semibold">Which zone should I train in?</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-4">
                {GOALS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setGoalId(item.id)}
                    className={`rounded-md border px-3 py-2.5 text-sm font-semibold transition ${
                      goalId === item.id
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div
                className="mt-4 rounded-md border p-4"
                style={{
                  borderColor: "var(--primary)",
                  background: "color-mix(in srgb, var(--primary) 8%, transparent)",
                }}
                aria-live="polite"
              >
                <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                  For {goal.label.toLowerCase()}, train at
                </p>
                <p className="mt-1 text-3xl font-semibold text-[var(--primary)]">
                  {goalZone.lowBpm}–{goalZone.highBpm} bpm
                </p>
                <p className="mt-1 text-sm font-semibold">
                  {goalZone.name} · {goalZone.title}
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{goal.note}</p>
              </div>

              <div
                className="mt-3 rounded-md border p-4"
                style={{
                  borderColor: "var(--anslation-ds-info)",
                  background: "var(--anslation-ds-info-soft)",
                }}
              >
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <Activity className="h-4 w-4" />
                  The 80/20 rule
                </p>
                <p className="mt-1.5 text-xs leading-5">
                  Keep roughly 80% of your weekly training time easy (Zone 1–2) and about 20% hard
                  (Zone 4–5), with Zone 3 kept deliberately thin. Elite endurance athletes across
                  running, cycling, rowing and skiing all converge on this split. The common mistake
                  is the exact opposite — every session at a moderate-hard Zone 3, which piles up
                  fatigue without earning the adaptation from either end.
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <p className="text-sm font-semibold">What each zone is for</p>
              <div className="mt-4 grid gap-2">
                {zones.map((zone) => (
                  <div
                    key={zone.id}
                    className="rounded-md border p-4"
                    style={{
                      borderColor: zone.id === goal.zone ? zone.tone : "var(--border)",
                      background: "var(--background)",
                    }}
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="text-sm font-semibold">
                        <span style={{ color: zone.tone }}>{zone.name}</span> · {zone.title}
                      </p>
                      <p className="font-[family-name:var(--anslation-ds-font-mono)] text-xs font-semibold tabular-nums">
                        {zone.lowBpm}–{zone.highBpm} bpm
                      </p>
                    </div>
                    <p className="mt-1.5 text-xs leading-5 text-[var(--muted-foreground)]">
                      {zone.purpose}
                    </p>
                    <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
                      <p className="text-[11px] leading-4 text-[var(--muted-foreground)]">
                        <span className="font-semibold text-[var(--foreground)]">Talk test: </span>
                        {zone.feels}
                      </p>
                      <p className="text-[11px] leading-4 text-[var(--muted-foreground)]">
                        <span className="font-semibold text-[var(--foreground)]">Typical session: </span>
                        {zone.duration}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <p className="text-sm font-semibold">The two methods, side by side</p>
              <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                Same max heart rate, different maths. Karvonen builds up from your resting rate, so
                it lands higher at every intensity below max.
              </p>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[520px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-xs uppercase text-[var(--muted-foreground)]">
                      <th className="px-3 py-2 font-semibold">Zone</th>
                      <th className="px-3 py-2 font-semibold">Intensity</th>
                      <th className="px-3 py-2 font-semibold">% of max</th>
                      <th className="px-3 py-2 font-semibold">Karvonen</th>
                      <th className="px-3 py-2 font-semibold">Gap</th>
                    </tr>
                  </thead>
                  <tbody>
                    {zones.map((zone) => (
                      <tr key={zone.id} className="border-b border-[var(--border)] last:border-b-0">
                        <td className="px-3 py-2 font-semibold" style={{ color: zone.tone }}>
                          {zone.name}
                        </td>
                        <td className="px-3 py-2 text-[var(--muted-foreground)]">
                          {Math.round(zone.low * 100)}–{Math.round(zone.high * 100)}%
                        </td>
                        <td className="px-3 py-2 tabular-nums">
                          {zone.pctMaxLow}–{zone.pctMaxHigh}
                        </td>
                        <td className="px-3 py-2 tabular-nums">
                          {zone.karvonenLow}–{zone.karvonenHigh}
                        </td>
                        <td className="px-3 py-2 font-semibold tabular-nums text-[var(--primary)]">
                          +{zone.karvonenLow - zone.pctMaxLow}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
                The gap is exactly your resting rate × (1 − intensity): {safeRhr} × 0.5 ={" "}
                {Math.round(safeRhr * 0.5)} bpm at the bottom of Zone 1 (50%), narrowing to{" "}
                {safeRhr} × 0.1 = {Math.round(safeRhr * 0.1)} bpm at the bottom of Zone 5 (90%), and
                closing to zero at 100% where both methods must agree. Karvonen is generally the
                better prescription because
                it maps more closely onto percentage of VO2 max — and unlike % of max, it moves as
                your fitness improves and your resting rate drops.
              </p>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <p className="text-sm font-semibold">What your resting rate says</p>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <div className="rounded-lg p-5" style={{ background: rhrBand.soft }}>
                  <p className="text-4xl font-semibold" style={{ color: rhrBand.tone }}>
                    {safeRhr}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">bpm at rest</p>
                </div>
                <div className="max-w-md">
                  <span
                    className="inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase"
                    style={{ background: rhrBand.soft, color: rhrBand.tone }}
                  >
                    {rhrBand.label} · {rhrBand.range}
                  </span>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                    {rhrBand.detail}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {RHR_BANDS.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-md border p-3"
                    style={{
                      borderColor: item.id === rhrBand.id ? item.tone : "var(--border)",
                      background: item.id === rhrBand.id ? item.soft : "var(--background)",
                    }}
                  >
                    <p className="text-xs font-semibold" style={{ color: item.tone }}>
                      {item.label}
                    </p>
                    <p className="text-[11px] text-[var(--muted-foreground)]">{item.range}</p>
                  </div>
                ))}
              </div>

              {tachycardia && (
                <div
                  className="mt-4 rounded-md border-2 p-4"
                  style={{
                    borderColor: "var(--anslation-ds-danger)",
                    background: "var(--anslation-ds-danger-soft)",
                  }}
                >
                  <p
                    className="flex items-center gap-2 text-sm font-semibold"
                    style={{ color: "var(--anslation-ds-danger)" }}
                  >
                    <AlertTriangle className="h-4 w-4" />
                    See a doctor about this
                  </p>
                  <p className="mt-1.5 text-xs leading-5">
                    A resting heart rate consistently above 100 bpm is called tachycardia and sits
                    outside the normal range. It can be caused by something simple — fever,
                    dehydration, anxiety, stimulants — but it can also point to a thyroid, anaemia or
                    cardiac issue. Get it checked before building a training plan on top of it.
                  </p>
                </div>
              )}
            </div>

            <div
              className="rounded-lg border p-6 shadow-[var(--anslation-ds-shadow-sm)]"
              style={{
                borderColor: "var(--anslation-ds-warning)",
                background: "var(--anslation-ds-warning-soft)",
              }}
            >
              <p className="flex items-center gap-2 text-sm font-semibold">
                <Info className="h-4 w-4" />
                Heart rate lags your effort — do not chase the number
              </p>
              <p className="mt-1.5 text-xs leading-5">
                It takes one to two minutes for your heart rate to catch up when you surge, so on
                short intervals it will still be climbing as the interval ends. Pace those by effort,
                pace or power — not bpm. Heart rate also drifts upward through a long session at
                identical pace (cardiac drift), and heat, humidity, caffeine, dehydration, altitude,
                illness, poor sleep and stress each move it by several beats on any given day. Treat
                zones as guide rails, and let the talk test settle any argument.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--muted)] p-5">
          <p className="flex items-start gap-2 text-sm leading-6 text-[var(--muted-foreground)]">
            <Stethoscope className="mt-1 h-4 w-4 shrink-0" />
            These zones are estimates for awareness, not medical advice. Every max HR formula is a
            population average and can be off by 10–12 bpm for you personally. If you have a heart
            condition, take beta blockers or other rate-limiting medication, are pregnant, or feel
            chest pain, unusual breathlessness or dizziness during exercise, stop and consult a
            doctor before training to these numbers.
          </p>
        </section>
      </div>
    </main>
  );
}
