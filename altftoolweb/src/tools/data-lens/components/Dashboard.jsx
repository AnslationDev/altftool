import React, { useState, useEffect, useRef } from "react";
import ChartBuilder from "./ChartBuilder";
import { generateAutoCharts } from "../utils/autoCharts";

const AUTO_VISUALIZE_ROW_LIMIT = 10000;

const defaultConfig = () => ({
  id: Date.now(),
  chartType: "bar",
  xColumn: "",
  yColumn: "",
  aggregation: "SUM",
  groupBy: "",
  loading: false,
});

const Dashboard = ({ data, columns, columnTypes, filters, profiling }) => {
  const [charts, setCharts] = useState([defaultConfig()]);
  const [isAutoVisualizing, setIsAutoVisualizing] = useState(false);
  const autoQueue = useRef([]);
  const timerRef = useRef(null);
  const loadingTimerRef = useRef(null);

  const isLargeDataset = data.length > AUTO_VISUALIZE_ROW_LIMIT;

  const addChart = () => setCharts((prev) => [...prev, defaultConfig()]);
  const removeChart = (id) => setCharts((prev) => prev.filter((c) => c.id !== id));
  const updateChartConfig = (id, newConfig) =>
    setCharts((prev) => prev.map((c) => (c.id === id ? { ...c, ...newConfig } : c)));
  const reset = () => {
    setCharts([defaultConfig()]);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
    setIsAutoVisualizing(false);
  };

  const handleAutoVisualize = () => {
    if (!data.length || isAutoVisualizing || isLargeDataset) return;

    const newCharts = generateAutoCharts(data, columnTypes, profiling);
    if (!newCharts.length) return;

    setCharts([]);
    autoQueue.current = [...newCharts];
    setIsAutoVisualizing(true);

    const addNext = () => {
      if (autoQueue.current.length === 0) {
        setIsAutoVisualizing(false);
        return;
      }
      const nextChart = autoQueue.current.shift();
      const chartWithLoading = { ...nextChart, loading: true };
      setCharts((prev) => [...prev, chartWithLoading]);

      loadingTimerRef.current = setTimeout(() => {
        setCharts((prev) =>
          prev.map((c) => (c.id === chartWithLoading.id ? { ...c, loading: false } : c))
        );
      }, 500);

      timerRef.current = setTimeout(addNext, 200);
    };

    addNext();
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
    };
  }, []);

  if (!data.length) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={addChart} className="btn-primary text-xs px-4 py-2 flex items-center gap-1">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Chart
        </button>

        {!isLargeDataset && (
          <button
            onClick={handleAutoVisualize}
            disabled={isAutoVisualizing}
            className="btn-secondary text-xs px-4 py-2 flex items-center gap-1 disabled:opacity-50"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            {isAutoVisualizing ? "Generating…" : "Auto‑Visualize"}
          </button>
        )}

        <button onClick={reset} className="btn-secondary text-xs px-4 py-2 flex items-center gap-1">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
          Reset
        </button>

        {data.length > 2000 && !isLargeDataset && (
          <span className="text-[10px] text-[var(--muted-foreground)]">
            Auto‑generation may take a moment for larger datasets.
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {charts.map((config) => (
          <div key={config.id} className="relative group min-w-0">
            {/* Close button – removed transition-colors */}
            <button
              onClick={() => removeChart(config.id)}
              className="absolute top-3 right-3 z-10 bg-[var(--card)] border border-[var(--border)] rounded-full w-7 h-7 flex items-center justify-center text-xs text-[var(--muted-foreground)] hover:text-red-500 hover:border-red-300 shadow-sm"
            >
              ✕
            </button>
            <ChartBuilder
              data={data}
              columns={columns}
              columnTypes={columnTypes}
              chartConfig={config}
              onChange={(newCfg) => updateChartConfig(config.id, newCfg)}
              isLoading={config.loading}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;