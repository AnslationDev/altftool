"use client";

import QuickToolPage from "@/tools/_shared/QuickToolPage";

const activityOptions = [
  { value: "2.0", label: "Light supervision / feeding (2.0 MET)" },
  { value: "2.5", label: "Bathing, dressing, light care (2.5 MET)" },
  { value: "3.0", label: "General childcare, active standing (3.0 MET)" },
  { value: "3.5", label: "Playing with children, moderate effort (3.5 MET)" },
  { value: "4.0", label: "Carrying child / active play (4.0 MET)" },
];

const fmt = (value, digits = 0) =>
  Number.isFinite(value) ? new Intl.NumberFormat("en-IN", { maximumFractionDigits: digits }).format(value) : "—";

export default function ToolHome() {
  return (
    <QuickToolPage
      eyebrow="Everyday activity"
      title="Childcare Calorie Calculator"
      description="Estimate calories burned during childcare tasks from body weight, duration, and activity intensity."
      defaults={{
        weightKg: "70",
        minutes: "60",
        met: "3.0",
        sessionsPerWeek: "7",
      }}
      fields={[
        { key: "weightKg", label: "Body weight (kg)", placeholder: "70", inputMode: "decimal" },
        { key: "minutes", label: "Minutes per session", placeholder: "60", inputMode: "decimal" },
        {
          key: "met",
          label: "Childcare activity",
          type: "select",
          options: activityOptions,
          full: true,
        },
        { key: "sessionsPerWeek", label: "Sessions per week", placeholder: "7", inputMode: "decimal" },
      ]}
      outputLabel="Childcare calorie estimate"
      buildOutput={(values) => {
        const weightKg = Number(values.weightKg);
        const minutes = Number(values.minutes);
        const met = Number(values.met);
        const sessionsPerWeek = Number(values.sessionsPerWeek);
        if (![weightKg, minutes, met, sessionsPerWeek].every(Number.isFinite)) {
          return "Enter valid numbers in every field.";
        }
        if (weightKg <= 0 || minutes <= 0 || sessionsPerWeek <= 0) {
          return "Weight, minutes, and weekly sessions must be greater than zero.";
        }
        const kcalPerMinute = (met * 3.5 * weightKg) / 200;
        const sessionKcal = kcalPerMinute * minutes;
        const weeklyKcal = sessionKcal * sessionsPerWeek;
        const netKcal = Math.max(0, sessionKcal - (1 * 3.5 * weightKg * minutes) / 200);
        return [
          `Intensity: ${met} MET`,
          `Burn rate: ${fmt(kcalPerMinute, 2)} kcal/min`,
          `Session burn: ${fmt(sessionKcal)} kcal gross (${fmt(netKcal)} kcal net)`,
          `Weekly estimate: ${fmt(weeklyKcal)} kcal`,
          "This is a fitness estimate only; childcare effort varies heavily by age, lifting, stairs, and interruptions.",
        ].join("\n");
      }}
    />
  );
}
