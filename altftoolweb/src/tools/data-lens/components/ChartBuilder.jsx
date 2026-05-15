import React, { useMemo, useState } from "react";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  PieChart, Pie, Cell, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { aggregateData } from "../utils/dataTransform";

const COLORS = [
  "var(--primary)",
  "#06b6d4",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#10b981",
];

const downsampleScatter = (data, maxPoints = 2000) => {
  if (!data || data.length <= maxPoints) return data;
  const step = Math.ceil(data.length / maxPoints);
  return data.filter((_, i) => i % step === 0);
};

const ChartBuilder = ({ data, columns, columnTypes, chartConfig, onChange, isLoading }) => {
  const config = chartConfig;
  const setConfig = (newConfig) => onChange({ ...config, ...newConfig });

  const [expanded, setExpanded] = useState(false);

  const numericColumns = useMemo(
    () => columns.filter((c) => columnTypes[c] === "numeric"),
    [columns, columnTypes]
  );
  const categoricalColumns = useMemo(
    () => columns.filter((c) => columnTypes[c] !== "numeric"),
    [columns, columnTypes]
  );

  const chartData = useMemo(() => {
    if (!data.length) return [];

    const ct = config.chartType;

    if (ct === "scatter") {
      if (!config.xColumn || !config.yColumn) return [];
      let validRows = [];
      data.forEach((row) => {
        const x = parseFloat(row[config.xColumn]);
        const y = parseFloat(row[config.yColumn]);
        if (!isNaN(x) && isFinite(x) && !isNaN(y) && isFinite(y)) validRows.push({ x, y });
      });
      return downsampleScatter(validRows);
    }

    if (ct === "pie") {
      if (!config.groupBy || !config.yColumn) return [];
      const agg = config.aggregation || "COUNT";
      if (agg === "COUNT") {
        const freq = {};
        data.forEach((row) => {
          const key = row[config.groupBy];
          if (key != null && key !== "") freq[key] = (freq[key] || 0) + 1;
        });
        return Object.entries(freq).map(([key, cnt]) => ({
          [config.groupBy]: key,
          count: cnt,
        }));
      }
      return aggregateData(data, config.groupBy, config.yColumn, agg);
    }

    // bar, line, area
    if (!config.xColumn || !config.yColumn) return [];
    const agg = config.aggregation || "SUM";
    return aggregateData(data, config.xColumn, config.yColumn, agg);
  }, [data, config, columnTypes]);

  const renderChartContent = () => {
    if (!chartData.length) {
      return (
        <div className="flex items-center justify-center h-full text-sm text-[var(--muted-foreground)]">
          Select fields to generate chart
        </div>
      );
    }

    if (config.chartType === "scatter") {
      return (
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                type="number"
                dataKey="x"
                name={config.xColumn}
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name={config.yColumn}
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
              />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              <Scatter data={chartData} fill="var(--primary)" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      );
    }

    if (config.chartType === "pie") {
      const dataKey = config.aggregation === "COUNT" ? "count" : (config.yColumn || "count");
      return (
        <PieChart>
          <Pie
            data={chartData}
            dataKey={dataKey}
            nameKey={config.groupBy}
            cx="50%"
            cy="50%"
            outerRadius={80}
            label
          >
            {chartData.map((_, idx) => (
              <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      );
    }

    // bar, line, area
    const common = (
      <>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey={config.xColumn}
          tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
          angle={-25}
          textAnchor="end"
          height={60}
        />
        <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
        <Tooltip />
        <Legend />
      </>
    );
    const shared = { data: chartData, margin: { top: 5, right: 20, bottom: 5, left: 0 } };

    switch (config.chartType) {
      case "bar":
        return (
          <BarChart {...shared}>
            {common}
            <Bar dataKey={config.yColumn} fill="var(--primary)" radius={[4, 4, 0, 0]} />
          </BarChart>
        );
      case "line":
        return (
          <LineChart {...shared}>
            {common}
            <Line
              type="monotone"
              dataKey={config.yColumn}
              stroke="var(--primary)"
              strokeWidth={2}
            />
          </LineChart>
        );
      case "area":
        return (
          <AreaChart {...shared}>
            {common}
            <Area
              type="monotone"
              dataKey={config.yColumn}
              stroke="var(--primary)"
              fill="var(--primary)"
              fillOpacity={0.2}
            />
          </AreaChart>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* Normal card */}
      <div className="glass-card p-4 h-full flex flex-col min-w-0 overflow-hidden relative">
        {/* Controls bar + expand icon */}
        <div className="flex items-center justify-between mb-3">
          <div className="w-full overflow-x-auto pb-1 no-scrollbar">
            <div className="flex items-center gap-2 text-xs w-max min-w-min">
              <select
                value={config.chartType}
                onChange={(e) => setConfig({ chartType: e.target.value })}
                className="bg-[var(--background)] border border-[var(--border)] rounded-lg px-2.5 py-1.5 text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] flex-shrink-0"
              >
                <option value="bar">Bar</option>
                <option value="line">Line</option>
                <option value="area">Area</option>
                <option value="scatter">Scatter</option>
                <option value="pie">Pie</option>
              </select>

              {config.chartType !== "pie" && (
                <>
                  <select
                    value={config.xColumn || ""}
                    onChange={(e) => setConfig({ xColumn: e.target.value })}
                    className="bg-[var(--background)] border border-[var(--border)] rounded-lg px-2.5 py-1.5 text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] min-w-[100px] flex-shrink-0"
                  >
                    <option value="">
                      {config.chartType === "scatter" ? "X Axis" : "Category"}
                    </option>
                    {columns.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <select
                    value={config.yColumn || ""}
                    onChange={(e) => setConfig({ yColumn: e.target.value })}
                    className="bg-[var(--background)] border border-[var(--border)] rounded-lg px-2.5 py-1.5 text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] min-w-[100px] flex-shrink-0"
                  >
                    <option value="">
                      {config.chartType === "scatter" ? "Y Axis" : "Value"}
                    </option>
                    {numericColumns.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </>
              )}

              {config.chartType === "pie" && (
                <>
                  <select
                    value={config.groupBy || ""}
                    onChange={(e) => setConfig({ groupBy: e.target.value })}
                    className="bg-[var(--background)] border border-[var(--border)] rounded-lg px-2.5 py-1.5 text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] min-w-[100px] flex-shrink-0"
                  >
                    <option value="">Group By</option>
                    {categoricalColumns.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <select
                    value={config.yColumn || ""}
                    onChange={(e) => setConfig({ yColumn: e.target.value })}
                    className="bg-[var(--background)] border border-[var(--border)] rounded-lg px-2.5 py-1.5 text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] min-w-[100px] flex-shrink-0"
                  >
                    <option value="">Value</option>
                    {numericColumns.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </>
              )}

              {config.chartType !== "scatter" && (
                <select
                  value={
                    config.aggregation ||
                    (config.chartType === "pie" ? "COUNT" : "SUM")
                  }
                  onChange={(e) => setConfig({ aggregation: e.target.value })}
                  className="bg-[var(--background)] border border-[var(--border)] rounded-lg px-2.5 py-1.5 text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] flex-shrink-0"
                >
                  <option value="SUM">Sum</option>
                  <option value="AVG">Avg</option>
                  <option value="COUNT">Count</option>
                  <option value="MIN">Min</option>
                  <option value="MAX">Max</option>
                </select>
              )}
            </div>
          </div>

          {/* Expand button */}
          <button
            onClick={() => setExpanded(true)}
            className="flex-shrink-0 ml-2 text-xs text-[var(--muted-foreground)] hover:text-[var(--primary)]"
            title="Expand chart"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 3 21 3 21 9" />
              <polyline points="9 21 3 21 3 15" />
              <line x1="21" y1="3" x2="14" y2="10" />
              <line x1="3" y1="21" x2="10" y2="14" />
            </svg>
          </button>
        </div>

        {/* Chart area */}
        <div className="flex-1 min-h-0 w-full min-w-0" style={{ minHeight: 240 }}>
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <svg className="animate-spin h-8 w-8 text-[var(--primary)]" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            </div>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              {renderChartContent()}
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-[var(--muted-foreground)]">
              Select fields to generate chart
            </div>
          )}
        </div>
      </div>

      {/* Expanded overlay */}
      {expanded && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(6px)' }}
          onClick={() => setExpanded(false)}
        >
          <div
            className="glass-card p-6 max-w-6xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="subheading">Chart</span>
              <button
                onClick={() => setExpanded(false)}
                className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              >
                ✕ Close
              </button>
            </div>
            <div style={{ width: '100%', height: '70vh' }}>
              <ResponsiveContainer width="100%" height="100%">
                {renderChartContent()}
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChartBuilder;