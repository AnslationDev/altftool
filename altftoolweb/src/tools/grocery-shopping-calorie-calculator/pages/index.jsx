"use client";

import QuickToolPage from "@/tools/_shared/QuickToolPage";

import { TRIP_STAGES, WALK_PACES, computeGroceryCalories } from "../lib";

const stageDefaults = {
  inStore: "35",
  carryHome: "10",
  stairs: "2",
  putAway: "8",
};

const fields = [
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
  {
    key: "walkPace",
    label: "Walking pace to shop",
    type: "select",
    options: WALK_PACES.map((pace) => ({ value: pace.id, label: pace.label })),
  },
  { key: "walkToStoreMinutes", label: "Walk to store (minutes)", placeholder: "12", inputMode: "decimal" },
  ...TRIP_STAGES.map((stage) => ({
    key: stage.id,
    label: `${stage.label} (minutes)`,
    placeholder: "0",
    inputMode: "decimal",
  })),
  { key: "tripsPerWeek", label: "Trips per week", placeholder: "2", inputMode: "decimal" },
];

const num = (value, digits = 0) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: digits }).format(value);

export default function ToolHome() {
  return (
    <QuickToolPage
      eyebrow="Everyday activity"
      title="Grocery Shopping Calorie Calculator"
      description="Estimate calories burned across a full grocery trip: walk, shop, carry bags, stairs, and unpacking."
      defaults={{
        weight: "70",
        weightUnit: "kg",
        walkPace: "moderate",
        walkToStoreMinutes: "12",
        tripsPerWeek: "2",
        ...stageDefaults,
      }}
      fields={fields}
      outputLabel="Trip calorie estimate"
      buildOutput={(values) => {
        const minutes = Object.fromEntries(
          TRIP_STAGES.map((stage) => [stage.id, Number(String(values[stage.id] ?? "0").trim() || 0)]),
        );
        const result = computeGroceryCalories({
          weight: Number(values.weight),
          weightUnit: values.weightUnit,
          walkPace: values.walkPace,
          walkToStoreMinutes: Number(values.walkToStoreMinutes),
          minutes,
          tripsPerWeek: Number(values.tripsPerWeek),
        });
        if (result.error) return result.error;
        return [
          `Body weight: ${num(result.weightKg, 1)} kg`,
          `Trip time: ${num(result.tripMinutes, 1)} min`,
          `Trip burn: ${num(result.tripKcal)} kcal gross (${num(result.tripNetKcal)} kcal net)`,
          `Average intensity: ${num(result.averageMet, 2)} MET`,
          `Weekly burn: ${num(result.weekKcal)} kcal across ${result.tripsPerWeek} trip(s)`,
          `Yearly projection: ${num(result.yearKcal)} kcal gross`,
          "",
          "Stage breakdown:",
          ...result.rows.map((row) => `- ${row.label}: ${row.minutes} min × ${row.met} MET = ${num(row.kcal)} kcal`),
        ].join("\n");
      }}
    />
  );
}
