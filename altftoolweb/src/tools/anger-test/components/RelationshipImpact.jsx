"use client";

import { Users } from "lucide-react";

const getImpact = (angerLevel) => {
  const lower = angerLevel?.toLowerCase() || "";

  if (lower.includes("minimal") || lower.includes("constructive"))
    return {
      impact: "No Risk",
      description: "Your anger rarely affects relationships. People feel safe around you.",
      color: "text-green-600",
      bg: "bg-green-50 dark:bg-green-950/20",
      border: "border-green-200",
      bar: 5,
      barColor: "bg-green-500",
    };

  if (lower.includes("low") || lower.includes("passive"))
    return {
      impact: "Low Risk",
      description: "Minor tension occasionally but relationships remain healthy overall.",
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-950/20",
      border: "border-blue-200",
      bar: 25,
      barColor: "bg-blue-500",
    };

  if (lower.includes("moderate") || lower.includes("reactive"))
    return {
      impact: "Moderate Risk",
      description: "Anger sometimes creates tension with people close to you.",
      color: "text-yellow-600",
      bg: "bg-yellow-50 dark:bg-yellow-950/20",
      border: "border-yellow-200",
      bar: 55,
      barColor: "bg-yellow-500",
    };

  if (lower.includes("elevated") || lower.includes("suppressed"))
    return {
      impact: "High Risk",
      description: "Suppressed or elevated anger is quietly straining your relationships.",
      color: "text-orange-600",
      bg: "bg-orange-50 dark:bg-orange-950/20",
      border: "border-orange-200",
      bar: 75,
      barColor: "bg-orange-500",
    };

  return {
    impact: "Very High Risk",
    description: "Frequent anger may damage trust and communication in close relationships.",
    color: "text-red-600",
    bg: "bg-red-50 dark:bg-red-950/20",
    border: "border-red-200",
    bar: 95,
    barColor: "bg-red-500",
  };
};

export default function RelationshipImpact({ angerLevel }) {
  const { impact, description, color, bg, border, bar, barColor } = getImpact(angerLevel);

  return (
    <div className={"bg-(--card) rounded-2xl p-6 mb-6 border-2 border-(--border)"}>

      {/* Header */}
      <h3 className="subheading flex items-center gap-2 mb-4">
        <Users size={22} className="text-(--primary)" />
        Relationship Impact
      </h3>

      {/* Impact level + description */}
      <div className="text-center mb-4">
        <h4 className={`font-primary text-2xl font-bold ${color}`}>
          {impact}
        </h4>
        <p className="description mt-2">{description}</p>
      </div>

      {/* Risk bar */}
      <div className="w-full bg-(--border) rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-700 ${barColor}`}
          style={{ width: `${bar}%` }}
        />
      </div>

    </div>
  );
}