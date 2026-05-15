"use client";

import { useMemo, useState } from "react";
import { Activity, Calculator } from "lucide-react";

const activityFactors = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  athlete: 1.9,
};

function Stat({ label, value }) {
  return (
    <div className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
      <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">{label}</p>
      <p className="tool-money-value mt-2">{value}</p>
    </div>
  );
}

export default function ToolHome() {
  const [gender, setGender] = useState("male");
  const [age, setAge] = useState(30);
  const [height, setHeight] = useState(175);
  const [weight, setWeight] = useState(75);
  const [activity, setActivity] = useState("moderate");

  const result = useMemo(() => {
    const base = 10 * weight + 6.25 * height - 5 * age + (gender === "male" ? 5 : -161);
    const tdee = base * activityFactors[activity];
    return {
      bmr: Math.round(base),
      tdee: Math.round(tdee),
      cut: Math.round(tdee - 500),
      bulk: Math.round(tdee + 300),
      protein: `${Math.round(weight * 1.6)}-${Math.round(weight * 2.2)}g`,
    };
  }, [activity, age, gender, height, weight]);

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Activity className="h-4 w-4" />
            Fitness estimate
          </div>
          <h1 className="tool-heading-accent text-3xl font-semibold leading-tight sm:text-4xl">Calorie / TDEE Calculator</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Estimate maintenance calories, BMR, and simple weight goal targets from common fitness formulas.
          </p>
        </section>

        <section className="grid gap-6 2xl:grid-cols-[360px_1fr]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <label className="block">
              <span className="text-sm font-semibold">Gender</span>
              <select value={gender} onChange={(event) => setGender(event.target.value)} className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none focus:border-[var(--primary)]">
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </label>
            {[
              ["Age", age, setAge, "years"],
              ["Height", height, setHeight, "cm"],
              ["Weight", weight, setWeight, "kg"],
            ].map(([label, value, setter, suffix]) => (
              <label key={label} className="mt-5 block">
                <span className="text-sm font-semibold">{label}</span>
                <div className="mt-2 flex overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--background)] focus-within:border-[var(--primary)]">
                  <input type="number" value={value} onChange={(event) => setter(Number(event.target.value))} className="min-w-0 flex-1 bg-transparent px-4 py-3 outline-none" />
                  <span className="shrink-0 bg-[var(--muted)] px-3 py-3 text-sm font-semibold text-[var(--muted-foreground)] sm:px-4">{suffix}</span>
                </div>
              </label>
            ))}
            <label className="mt-5 block">
              <span className="text-sm font-semibold">Activity level</span>
              <select value={activity} onChange={(event) => setActivity(event.target.value)} className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none focus:border-[var(--primary)]">
                <option value="sedentary">Sedentary</option>
                <option value="light">Light exercise</option>
                <option value="moderate">Moderate exercise</option>
                <option value="active">Very active</option>
                <option value="athlete">Athlete</option>
              </select>
            </label>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="tool-card-grid">
              <Stat label="BMR" value={`${result.bmr} kcal`} />
              <Stat label="Maintenance" value={`${result.tdee} kcal`} />
              <Stat label="Fat loss" value={`${result.cut} kcal`} />
              <Stat label="Lean gain" value={`${result.bulk} kcal`} />
              <Stat label="Protein range" value={result.protein} />
            </div>
            <div className="mt-6 rounded-lg bg-[var(--muted)] p-4 text-sm leading-6 text-[var(--muted-foreground)]">
              This is a planning estimate, not medical advice. Individual needs vary by health, training, and goals.
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
