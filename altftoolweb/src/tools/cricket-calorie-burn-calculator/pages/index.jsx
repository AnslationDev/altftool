"use client";

import QuickToolPage from "../../_shared/QuickToolPage";
import { BOWLING_TYPES, computeCricketCalories, FIELD_ROLES } from "../lib";

const nf = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const toNumber = (value) => Number(String(value ?? "").replace(/,/g, "").trim());
const fmt = (value, suffix = "") => (Number.isFinite(value) ? `${nf.format(value)}${suffix}` : "—");

export default function ToolHome() {
  return (
    <QuickToolPage
      eyebrow="Match calories"
      title="Cricket Calorie Burn Calculator"
      description="Estimate calories from batting, bowling, fielding, running between wickets, and waiting time."
      defaults={{
        weightKg: "75",
        fieldingMinutes: "120",
        fieldingRole: "outfield",
        battingMinutes: "35",
        oversBowled: "4",
        bowlingType: "medium",
        minutesPerOver: "4",
        waitingMinutes: "45",
        runsRun: "22",
      }}
      fields={[
        { key: "weightKg", label: "Body weight (kg)", inputMode: "decimal" },
        { key: "fieldingMinutes", label: "Fielding minutes", inputMode: "numeric" },
        { key: "fieldingRole", label: "Fielding role", type: "select", options: Object.entries(FIELD_ROLES).map(([value, role]) => ({ value, label: role.label })) },
        { key: "battingMinutes", label: "Batting minutes", inputMode: "numeric" },
        { key: "oversBowled", label: "Overs bowled", inputMode: "decimal" },
        { key: "bowlingType", label: "Bowling type", type: "select", options: Object.entries(BOWLING_TYPES).map(([value, type]) => ({ value, label: type.label })) },
        { key: "minutesPerOver", label: "Minutes per over", inputMode: "decimal" },
        { key: "waitingMinutes", label: "Waiting minutes", inputMode: "numeric" },
        { key: "runsRun", label: "Runs physically run", inputMode: "numeric" },
      ]}
      outputLabel="Cricket burn estimate"
      buildOutput={(values) => {
        const result = computeCricketCalories({
          weightKg: toNumber(values.weightKg),
          fieldingMinutes: toNumber(values.fieldingMinutes),
          fieldingRole: values.fieldingRole,
          battingMinutes: toNumber(values.battingMinutes),
          oversBowled: toNumber(values.oversBowled),
          bowlingType: values.bowlingType,
          minutesPerOver: toNumber(values.minutesPerOver),
          waitingMinutes: toNumber(values.waitingMinutes),
          runsRun: toNumber(values.runsRun),
        });
        if (result.error) return result.error;
        const segments = result.segments.map((segment) => `${segment.label}: ${fmt(segment.minutes, " min")} · ${fmt(segment.kcal, " kcal")}`);
        return [
          `Total time: ${fmt(result.totalMinutes, " min")}`,
          `Gross calories: ${fmt(result.grossKcal, " kcal")}`,
          `Net calories: ${fmt(result.netKcal, " kcal")}`,
          `Average intensity: ${fmt(result.averageMet, " MET")}`,
          `Calories/hour: ${fmt(result.kcalPerHour, " kcal")}`,
          `Balls bowled: ${fmt(result.ballsBowled)}`,
          `Running distance: ${fmt(result.runningDistanceM, " m")}`,
          "",
          ...segments,
        ].join("\n");
      }}
    />
  );
}
