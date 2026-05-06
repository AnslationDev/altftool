"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BarChart3,
  ChartColumnBig,
  PieChart as PieChartIcon,
} from "lucide-react";
import { formatNumber } from "@/lib/analytics/analytics.utils";

const COLORS = [
  "#2563eb",
  "#ef4444",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#06b6d4",
];
const UPDATE_COLOR = "#2563eb";
const CREATE_COLOR = "#f97316";

function ChartToggle({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 text-sm font-medium transition ${
        active ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
    >
      {label}
    </button>
  );
}

function MetricButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] transition ${
        active
          ? "border-gray-900 bg-gray-900 text-white"
          : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700"
      }`}
    >
      {label}
    </button>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="border border-gray-200 bg-white px-3 py-2 text-sm shadow-lg">
      <p className="font-semibold text-gray-900">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="mt-1 text-gray-600">
          {entry.name}: {formatNumber(entry.value)}
        </p>
      ))}
    </div>
  );
}

export default function AnalyticsCharts({ projectData, moduleData }) {
  const [view, setView] = useState("projects");
  const [metric, setMetric] = useState("records");

  const currentData = view === "projects" ? projectData : moduleData;

  const chartData = useMemo(() => {
    return currentData.map((item) => ({
      name: item.label,
      records: item.totalRecords,
      stale: item.staleModules,
      additions: item.recentAdditions7d,
      updates: item.recentUpdates7d,
    }));
  }, [currentData]);

  const pieData = useMemo(() => {
    return currentData
      .slice(0, 6)
      .map((item) => ({
        name: item.label,
        value: item.totalRecords,
      }))
      .filter((item) => item.value > 0);
  }, [currentData]);

  const metricLabelMap = {
    records: "Tracked Records",
    additions: "Recent Additions",
    updates: "Recent Updates",
    stale: "Stale Modules",
  };

  const barChartLabel = view === "projects" ? "Project-wise comparison" : "Module-wise comparison";

  return (
    <section className="border border-gray-200 bg-white p-6 shadow-sm rounded-md">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="border border-gray-200 bg-gray-100 p-2 text-gray-600">
              <BarChart3 className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Analytics view</h2>
              <p className="text-sm text-gray-500">
                Compare activity by project or by module with switchable metrics.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 xl:items-end">
          <div className="flex flex-wrap gap-2">
            <ChartToggle label="Projects" active={view === "projects"} onClick={() => setView("projects")} />
            <ChartToggle label="Modules" active={view === "modules"} onClick={() => setView("modules")} />
          </div>
          <div className="flex flex-wrap gap-2">
            <MetricButton label="Records" active={metric === "records"} onClick={() => setMetric("records")} />
            <MetricButton label="Additions" active={metric === "additions"} onClick={() => setMetric("additions")} />
            <MetricButton label="Updates" active={metric === "updates"} onClick={() => setMetric("updates")} />
            <MetricButton label="Stale" active={metric === "stale"} onClick={() => setMetric("stale")} />
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_0.8fr] ">
        <div className="border border-gray-200 bg-gray-50 p-4 rounded-md">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-gray-900">{metricLabelMap[metric]}</p>
              <p className="text-xs text-gray-500">{barChartLabel}</p>
            </div>
            <div className="border border-gray-200 bg-white p-2 text-gray-500">
              <ChartColumnBig className="h-4 w-4" />
            </div>
          </div>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
              <BarChart data={chartData} margin={{ top: 10, right: 16, left: -8, bottom: 10 }}>
                <CartesianGrid stroke="#dbe4f0" vertical={false} />
                <XAxis
                  dataKey="name"
                  interval={0}
                  height={56}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "#475569" }}
                  angle={-18}
                  textAnchor="end"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: "#475569" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey={metric} name={metricLabelMap[metric]} radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`${entry.name}-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="border border-gray-200 bg-gray-50 p-4 rounded-md">
          <div className="mb-4 flex items-center gap-3">
            <div className="border border-gray-200 bg-white p-2 text-gray-500">
              <PieChartIcon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Record share</p>
              <p className="text-xs text-gray-500">Top slices in current view</p>
            </div>
          </div>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={70}
                  outerRadius={108}
                  paddingAngle={2}
                  labelLine={false}
                  label={({ percent }) =>
                    percent >= 0.08 ? `${Math.round(percent * 100)}%` : ""
                  }
                >
                  {pieData.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 space-y-2">
            {pieData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-gray-700">{item.name}</span>
                </div>
                <span className="font-medium text-gray-900">{formatNumber(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
