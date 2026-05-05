"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";

import SidebarForm from "../components/SidebarForm";
import TrafficSlider from "../components/TrafficSlider";
import ResultCards from "../components/ResultCards";
import RiskMeter from "../components/RiskMeter";
import SuggestionPanel from "../components/SuggestionPanel";
import HealthScore from "../components/HealthScore";
import PerformanceCharts from "../components/PerformanceCharts";
import Features from "../components/features";

import {
  estimateApiStress,
  upgradedConfig,
} from "../utils/estimator";

import { makeReportText } from "../utils/helpers";

const initialConfig = {
  endpoint: "https://api.acme.dev/v1/orders",
  method: "GET",
  runtime: "Node.js",
  baseResponseTime: 140,
  concurrentUsers: 850,
  cpuCores: 8,
  ramGb: 16,
  dbType: "Postgres",
  hostingType: "Kubernetes",
  cacheEnabled: true,
};

export const App = () => {
  const [config, setConfig] = useState(initialConfig);
  const [traffic, setTraffic] = useState(1800);
  const [mode, setMode] = useState("Constant Traffic");
  const [blackFridayMode, setBlackFridayMode] = useState(false);
  const [compareEnabled, setCompareEnabled] = useState(false);

  const metrics = useMemo(() => {
    return estimateApiStress(
      config,
      traffic,
      mode,
      blackFridayMode
    );
  }, [config, traffic, mode, blackFridayMode]);

  const compareMetrics = useMemo(() => {
    if (!compareEnabled) return null;

    return estimateApiStress(
      upgradedConfig(config),
      traffic,
      mode,
      blackFridayMode
    );
  }, [
    compareEnabled,
    config,
    traffic,
    mode,
    blackFridayMode,
  ]);

  const reportText = useMemo(() => {
    return makeReportText({
      config,
      traffic,
      mode,
      blackFridayMode,
      metrics,
    });
  }, [
    config,
    traffic,
    mode,
    blackFridayMode,
    metrics,
  ]);

  const handleDownload = () => {
    const blob = new Blob([reportText], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "api-stress-report.txt";
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        reportText
      );
      alert("Report copied successfully");
    } catch {
      alert("Copy failed");
    }
  };

  return (
    <div className="px-4 py-6 text-(--foreground)">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-4"
        >
          <div className="bg-(--background) text-(--primary)">
            <h1 className="heading animate-fade-up">
              API Stress Estimator
            </h1>

            <p className="description opacity-90 mt-1 text-(--secondary) animate-fade-up">
              Predict your API behavior before traffic hits
            </p>
          </div>
        </motion.div>
      </div>

      {/* Main Card */}
      <div className="max-w-5xl mx-auto bg-(--card) rounded-xl shadow-lg overflow-hidden py-5">
        <div className="p-6 space-y-6">
          {/* KPI Cards */}
          <section>
            <ResultCards metrics={metrics} />
          </section>

          {/* Copy + Download Buttons */}
          <section className="flex flex-wrap gap-4 justify-end">
            <button
              onClick={handleCopy}
              className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              Copy
            </button>

            <button
              onClick={handleDownload}
              className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              Download
            </button>
          </section>

          {/* Compare */}
          {compareMetrics && (
            <section>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-xl border p-4">
                <div>
                  <p className="text-sm opacity-70">
                    Latency Delta
                  </p>
                  <h3 className="font-bold text-lg">
                    {(
                      metrics.responseTime -
                      compareMetrics.responseTime
                    ).toFixed(0)}{" "}
                    ms faster
                  </h3>
                </div>

                <div>
                  <p className="text-sm opacity-70">
                    CPU Delta
                  </p>
                  <h3 className="font-bold text-lg">
                    {(
                      metrics.cpuUsage -
                      compareMetrics.cpuUsage
                    ).toFixed(1)}
                    % lower
                  </h3>
                </div>

                <div>
                  <p className="text-sm opacity-70">
                    Health Gain
                  </p>
                  <h3 className="font-bold text-lg">
                    +
                    {(
                      compareMetrics.healthScore -
                      metrics.healthScore
                    ).toFixed(0)}{" "}
                    points
                  </h3>
                </div>
              </div>
            </section>
          )}

          {/* Form + Slider */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SidebarForm
              config={config}
              onChange={setConfig}
            />

            <TrafficSlider
              traffic={traffic}
              onTrafficChange={setTraffic}
              mode={mode}
              onModeChange={setMode}
              blackFridayMode={blackFridayMode}
              onBlackFridayMode={setBlackFridayMode}
              compareEnabled={compareEnabled}
              onToggleCompare={() =>
                setCompareEnabled(!compareEnabled)
              }
            />
          </section>

          {/* Health + Risk */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <HealthScore
              score={metrics.healthScore}
            />

            <RiskMeter
              timeoutRisk={metrics.timeoutRisk}
              crashProbability={
                metrics.crashProbability
              }
              errorRate={metrics.errorRate}
            />
          </section>

          {/* Charts */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PerformanceCharts
              data={metrics.chartData}
              safeTrafficLimit={
                metrics.safeTrafficLimit
              }
            />

            <SuggestionPanel
              suggestions={metrics.suggestions}
              safeTrafficLimit={
                metrics.safeTrafficLimit
              }
              bottleneck={metrics.bottleneck}
            />
          </section>
        </div>
      </div>

      <Features />
    </div>
  );
};

export default App;