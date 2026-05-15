"use client";

import { useMemo, useState } from "react";
import { Droplets } from "lucide-react";

export default function ToolHome() {
  const [weight, setWeight] = useState(70);
  const [activity, setActivity] = useState(45);
  const [climate, setClimate] = useState("normal");

  const result = useMemo(() => {
    const base = weight * 35;
    const activityAdd = activity * 12;
    const climateAdd = climate === "hot" ? 500 : climate === "dry" ? 300 : 0;
    const ml = Math.round(base + activityAdd + climateAdd);
    return { ml, liters: (ml / 1000).toFixed(1), glasses: Math.round(ml / 250) };
  }, [activity, climate, weight]);

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Droplets className="h-4 w-4" />
            Hydration estimate
          </div>
          <h1 className="tool-heading-accent text-3xl font-semibold leading-tight sm:text-4xl">Water Intake Calculator</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Estimate daily water intake from body weight, activity minutes, and climate conditions.
          </p>
        </section>

        <section className="grid gap-6 2xl:grid-cols-[360px_1fr]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <label className="block">
              <span className="text-sm font-semibold">Weight in kg</span>
              <input type="number" value={weight} onChange={(event) => setWeight(Number(event.target.value))} className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none focus:border-[var(--primary)]" />
            </label>
            <label className="mt-5 block">
              <span className="text-sm font-semibold">Exercise minutes</span>
              <input type="number" value={activity} onChange={(event) => setActivity(Number(event.target.value))} className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none focus:border-[var(--primary)]" />
            </label>
            <label className="mt-5 block">
              <span className="text-sm font-semibold">Climate</span>
              <select value={climate} onChange={(event) => setClimate(event.target.value)} className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none focus:border-[var(--primary)]">
                <option value="normal">Normal</option>
                <option value="dry">Dry</option>
                <option value="hot">Hot / humid</option>
              </select>
            </label>
          </div>

          <div className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)] sm:p-6">
            <div className="rounded-lg bg-sky-50 p-6 text-sky-900 dark:bg-sky-950/30 dark:text-sky-100">
              <p className="text-sm font-semibold uppercase">Daily target</p>
              <p className="tool-money-value tool-hero-value mt-3 text-sky-900 dark:text-sky-100">{result.liters} L</p>
              <p className="mt-3 break-words text-sm font-medium">{result.ml} ml, around {result.glasses} glasses of 250 ml</p>
            </div>
            <div className="tool-compact-grid mt-5">
              {Array.from({ length: Math.min(result.glasses, 12) }, (_, index) => (
                <div key={index} className="h-12 rounded-lg bg-sky-500/80" />
              ))}
            </div>
            <p className="mt-5 rounded-lg bg-[var(--muted)] p-4 text-sm leading-6 text-[var(--muted-foreground)]">
              Hydration needs can vary with diet, health, medication, and climate. Use this as a planning estimate.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
