"use client";

import { useEffect, useMemo, useState } from "react";
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
import { SectionCard } from "@/ansets";
import { formatNumber } from "@/lib/analytics/analytics.utils";

// Brand chart palette per master.md (teal + cyan + violet first), resolved from
// the semantic CSS tokens at runtime so charts follow the active theme.
// Fallbacks mirror the light-theme token values.
const CHART_TOKENS = [
  ["--primary", "#0d9488"],
  ["--secondary", "#22d3ee"],
  ["--accent", "#8b5cf6"],
  ["--success", "#16a34a"],
  ["--warning", "#f59e0b"],
  ["--info", "#0ea5e9"],
];
const GRID_TOKEN = ["--border", "#e2e8f0"];
const TICK_TOKEN = ["--muted", "#607083"];

function readToken([name, fallback]) {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value || fallback;
}

function useChartTheme() {
  const [themeVersion, setThemeVersion] = useState(0);

  useEffect(() => {
    // Re-resolve token values when the admin theme toggles (data-theme flips).
    const observer = new MutationObserver(() => setThemeVersion((v) => v + 1));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  return useMemo(
    () => ({
      colors: CHART_TOKENS.map(readToken),
      grid: readToken(GRID_TOKEN),
      tick: readToken(TICK_TOKEN),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [themeVersion],
  );
}

function ChartToggle({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)] ${
        active
          ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
          : "bg-[var(--surface-soft)] text-[var(--muted)] hover:text-[var(--foreground)]"
      }`}
    >
      {label}
    </button>
  );
}

function MetricButton({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] transition focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)] ${
        active
          ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
          : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--border-strong)] hover:text-[var(--foreground)]"
      }`}
    >
      {label}
    </button>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm shadow-lg">
      <p className="font-semibold text-[var(--foreground)]">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="mt-1 text-[var(--muted)]">
          {entry.name}: {formatNumber(entry.value)}
        </p>
      ))}
    </div>
  );
}

export default function AnalyticsCharts({ projectData, moduleData }) {
  const [view, setView] = useState("projects");
  const [metric, setMetric] = useState("records");
  const chartTheme = useChartTheme();
  const chartColors = chartTheme.colors;

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
    <SectionCard
      icon={BarChart3}
      title="Analytics view"
      description="Compare activity by project or by module with switchable metrics."
      actions={
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
      }
    >
      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">{metricLabelMap[metric]}</p>
              <p className="text-xs text-[var(--muted)]">{barChartLabel}</p>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2 text-[var(--muted)]">
              <ChartColumnBig className="h-4 w-4" aria-hidden="true" />
            </div>
          </div>
          <div className="h-[320px]">
            <ResponsiveContainer
              width="100%"
              height="100%"
              minWidth={1}
              minHeight={1}
              initialDimension={{ width: 1, height: 1 }}
            >
              <BarChart data={chartData} margin={{ top: 10, right: 16, left: -8, bottom: 10 }}>
                <CartesianGrid stroke={chartTheme.grid} vertical={false} />
                <XAxis
                  dataKey="name"
                  interval={0}
                  height={56}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: chartTheme.tick }}
                  angle={-18}
                  textAnchor="end"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: chartTheme.tick }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey={metric} name={metricLabelMap[metric]} radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`${entry.name}-${index}`}
                      fill={chartColors[index % chartColors.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] p-4">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2 text-[var(--muted)]">
              <PieChartIcon className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">Record share</p>
              <p className="text-xs text-[var(--muted)]">Top slices in current view</p>
            </div>
          </div>
          <div className="h-[320px]">
            <ResponsiveContainer
              width="100%"
              height="100%"
              minWidth={1}
              minHeight={1}
              initialDimension={{ width: 1, height: 1 }}
            >
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
                    <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
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
                    className="h-2.5 w-2.5 rounded-sm"
                    style={{ backgroundColor: chartColors[index % chartColors.length] }}
                    aria-hidden="true"
                  />
                  <span className="text-[var(--muted)]">{item.name}</span>
                </div>
                <span className="font-medium text-[var(--foreground)]">{formatNumber(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
