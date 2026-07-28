"use client";

import QuickToolPage from "../../_shared/QuickToolPage";
import { computeKettlebellSwingCalories, swingsForTarget } from "../lib";

const nf = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const toNumber = (value) => Number(String(value ?? "").replace(/,/g, "").trim());
const fmt = (value, suffix = "") => (Number.isFinite(value) ? `${nf.format(value)}${suffix}` : "—");

export default function ToolHome() {
  return (
    <QuickToolPage
      eyebrow="Strength calories"
      title="Kettlebell Swing Calorie Calculator"
      description="Estimate calories from swing count, bell weight, cadence, and rest between sets."
      defaults={{
        weightKg: "75",
        bellKg: "16",
        sets: "10",
        swingsPerSet: "15",
        swingsPerMinute: "30",
        restSeconds: "45",
        targetKcal: "300",
      }}
      fields={[
        { key: "weightKg", label: "Body weight (kg)", inputMode: "decimal" },
        { key: "bellKg", label: "Bell weight (kg)", inputMode: "decimal" },
        { key: "sets", label: "Sets", inputMode: "numeric" },
        { key: "swingsPerSet", label: "Swings per set", inputMode: "numeric" },
        { key: "swingsPerMinute", label: "Cadence (swings/min)", inputMode: "decimal" },
        { key: "restSeconds", label: "Rest between sets (seconds)", inputMode: "numeric" },
        { key: "targetKcal", label: "Target calories for swing estimate", inputMode: "decimal" },
      ]}
      outputLabel="Swing calorie estimate"
      buildOutput={(values) => {
        const result = computeKettlebellSwingCalories({
          weightKg: toNumber(values.weightKg),
          bellKg: toNumber(values.bellKg),
          sets: toNumber(values.sets),
          swingsPerSet: toNumber(values.swingsPerSet),
          swingsPerMinute: toNumber(values.swingsPerMinute),
          restSeconds: toNumber(values.restSeconds),
        });
        if (result.error) return result.error;
        const targetSwings = swingsForTarget(result.kcalPerSwing, toNumber(values.targetKcal));
        return [
          `Total swings: ${fmt(result.totalSwings)}`,
          `Gross calories: ${fmt(result.grossKcal, " kcal")}`,
          `Net calories: ${fmt(result.netKcal, " kcal")}`,
          `Calories per swing: ${fmt(result.kcalPerSwing, " kcal")}`,
          `Work time: ${fmt(result.workMinutes, " min")} · rest time: ${fmt(result.restMinutes, " min")}`,
          `Estimated work intensity: ${fmt(result.workMet, " MET")}`,
          `Total volume: ${fmt(result.totalVolumeKg, " kg")}`,
          `Swings for target: ${targetSwings ?? "—"}`,
        ].join("\n");
      }}
    />
  );
}
