import React from "react";

export default function TopBar({ data }) {
  const metrics = ["totalsales", "activesales", "pausedsales"];

  const metricLabelMap = {
    totalsales: "Total Sales",
    activesales: "Active Sales",
    pausedsales: "Paused Sales",
  };

  const metricValues = {
    totalsales: data.length,
    activesales: data.filter((sale) => sale.status === "active").length,
    pausedsales: data.filter((sale) => sale.status === "paused").length,
  };

  return (
    <div className=" w-full p-4 ">

      <div className="flex flex-wrap gap-4">
        {metrics.map((metric) => (
          <div key={metric} className="flex-1 min-w-[180px]">
            <MetricCard
              title={metricLabelMap[metric]}
              value={metricValues[metric] ?? "-"}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function MetricCard({ title, value }) {
  return (
    <div className="border border-(--border) bg-muted p-4 rounded-md shadow-md hover:scale-102 transition-transform">
      <p className="text-sm font-medium text-muted-foreground">
        {title}
      </p>
      <p className="mt-1 text-2xl font-semibold">
        {value}
      </p>
    </div>
  );
}