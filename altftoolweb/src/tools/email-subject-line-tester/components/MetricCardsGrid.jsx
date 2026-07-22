"use client";

import { METRIC_CARDS } from "../lib/metricsConfig";
import MetricCard from "./MetricCard";

export default function MetricCardsGrid({ analysis }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {METRIC_CARDS.map((metric) => (
        <MetricCard key={metric.key} metric={metric} analysis={analysis} />
      ))}
    </div>
  );
}
