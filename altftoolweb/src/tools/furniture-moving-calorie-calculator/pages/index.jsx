"use client";

import QuickToolPage from "@/tools/_shared/QuickToolPage";

import { MOVING_TASKS, computeMovingCalories } from "../lib";

const defaults = {
  packing: "45",
  loading: "40",
  carrying: "30",
  pushing: "15",
  stairs: "10",
};

const fmt = (value, digits = 0) =>
  Number.isFinite(value) ? new Intl.NumberFormat("en-IN", { maximumFractionDigits: digits }).format(value) : "—";

export default function ToolHome() {
  return (
    <QuickToolPage
      eyebrow="Moving day"
      title="Furniture Moving Calorie Calculator"
      description="Estimate calories burned while packing, loading, carrying furniture, pushing heavy items, and using stairs."
      defaults={{
        weight: "70",
        weightUnit: "kg",
        ...defaults,
      }}
      fields={[
        { key: "weight", label: "Body weight", placeholder: "70", inputMode: "decimal" },
        {
          key: "weightUnit",
          label: "Weight unit",
          type: "select",
          options: [
            { value: "kg", label: "kg" },
            { value: "lb", label: "lb" },
          ],
        },
        ...MOVING_TASKS.map((task) => ({
          key: task.id,
          label: `${task.label} (minutes)`,
          placeholder: "0",
          inputMode: "decimal",
        })),
      ]}
      outputLabel="Moving-day calorie estimate"
      buildOutput={(values) => {
        const minutes = Object.fromEntries(
          MOVING_TASKS.map((task) => [task.id, Number(String(values[task.id] ?? "0").trim() || 0)]),
        );
        const result = computeMovingCalories({
          weight: Number(values.weight),
          weightUnit: values.weightUnit,
          minutes,
        });
        if (result.error) return result.error;
        return [
          `Body weight: ${fmt(result.weightKg, 1)} kg`,
          `Total moving time: ${fmt(result.dayMinutes, 1)} min`,
          `Total burn: ${fmt(result.dayKcal)} kcal gross (${fmt(result.dayNetKcal)} kcal net)`,
          `Average intensity: ${fmt(result.averageMet, 2)} MET`,
          `Moderate/vigorous time: ${fmt(result.moderateMinutes, 1)} / ${fmt(result.vigorousMinutes, 1)} min`,
          `Jogging equivalent: ${fmt(result.joggingEquivalentMinutes, 1)} min`,
          "",
          "Task breakdown:",
          ...result.rows.map((row) => `- ${row.label}: ${row.minutes} min × ${row.met} MET = ${fmt(row.kcal)} kcal`),
        ].join("\n");
      }}
    />
  );
}
