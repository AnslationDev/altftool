"use client";

import QuickToolPage from "@/tools/_shared/QuickToolPage";

import {
  DEFAULT_STEP_HEIGHT_M,
  HANDRAIL_FACTORS,
  computeStairmasterCalories,
  minutesForTarget,
} from "../lib";

const fmt = (value, digits = 0) =>
  Number.isFinite(value) ? new Intl.NumberFormat("en-IN", { maximumFractionDigits: digits }).format(value) : "—";

export default function ToolHome() {
  return (
    <QuickToolPage
      eyebrow="Gym calories"
      title="StairMaster Calorie Calculator"
      description="Estimate stair-climber calories from body weight, step rate, step height, handrail use, and session length."
      defaults={{
        weightKg: "70",
        stepsPerMinute: "70",
        minutes: "30",
        stepHeightM: String(DEFAULT_STEP_HEIGHT_M),
        handrail: "none",
        targetKcal: "300",
      }}
      fields={[
        { key: "weightKg", label: "Body weight (kg)", placeholder: "70", inputMode: "decimal" },
        { key: "stepsPerMinute", label: "Steps per minute", placeholder: "70", inputMode: "decimal" },
        { key: "minutes", label: "Minutes", placeholder: "30", inputMode: "decimal" },
        { key: "stepHeightM", label: "Step height (m)", placeholder: "0.2032", inputMode: "decimal" },
        {
          key: "handrail",
          label: "Handrail use",
          type: "select",
          options: Object.values(HANDRAIL_FACTORS).map((item) => ({ value: item.key, label: item.label })),
          full: true,
        },
        { key: "targetKcal", label: "Calorie target (optional)", placeholder: "300", inputMode: "decimal" },
      ]}
      outputLabel="StairMaster estimate"
      buildOutput={(values) => {
        const result = computeStairmasterCalories({
          weightKg: Number(values.weightKg),
          stepsPerMinute: Number(values.stepsPerMinute),
          minutes: Number(values.minutes),
          stepHeightM: Number(values.stepHeightM),
          handrail: values.handrail,
        });
        if (result.error) return result.error;
        const targetMinutes = minutesForTarget(result.grossKcalPerMinute, Number(values.targetKcal));
        return [
          `Burn rate: ${fmt(result.grossKcalPerMinute, 2)} kcal/min (${fmt(result.mets, 1)} MET)`,
          `Total: ${fmt(result.grossKcal)} kcal gross (${fmt(result.netKcal)} kcal active)`,
          `Steps: ${fmt(result.totalSteps)} · vertical climb ${fmt(result.verticalMetres, 1)} m`,
          `Floors equivalent: ${fmt(result.floors, 1)}`,
          `Mechanical power: ${fmt(result.mechanicalWatts, 1)} W`,
          `Handrail adjustment: ${result.handrailLabel}`,
          targetMinutes ? `Minutes for target: ${fmt(targetMinutes, 1)} min` : "",
        ]
          .filter(Boolean)
          .join("\n");
      }}
    />
  );
}
