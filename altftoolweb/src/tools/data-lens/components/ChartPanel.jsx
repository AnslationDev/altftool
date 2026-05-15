import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { computeBins, computeFrequencies } from "../utils/chartHelpers";

const ChartPanel = ({ column, data, type }) => {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    const columnValues = data
      .map((row) => row[column])
      .filter((v) => v !== null && v !== undefined && v !== "");

    if (type === "numeric") {
      return computeBins(columnValues);
    } else {
      return computeFrequencies(columnValues);
    }
  }, [data, column, type]);

  if (!chartData || chartData.length === 0) {
    return (
      <p className="text-xs text-[var(--muted-foreground)] mt-2">
        Not enough data to chart.
      </p>
    );
  }

  const dataKey = type === "numeric" ? "label" : "name";

  return (
    <div className="mt-3">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
          />
          <XAxis
            dataKey={dataKey}
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
            angle={-20}
            textAnchor="end"
            height={50}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
          />
          <Tooltip />
          <Bar
            dataKey="count"
            fill="var(--primary)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChartPanel;