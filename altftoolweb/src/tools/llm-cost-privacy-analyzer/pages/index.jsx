"use client";

import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  FileSearch,
  LoaderCircle,
  RotateCcw,
} from "lucide-react";

import {
  SAMPLE_RATE_PRESETS,
  analyzeUsageLogs,
  buildUsageReport,
} from "../lib/analyzeUsage.mjs";

import CostAnalyticsCharts from "../components/CostAnalyticsCharts";
import ExportCenter from "../components/ExportCenter";
import HeaderHero from "../components/HeaderHero";
import LogExplorerTable from "../components/LogExplorerTable";
import MetricsGrid from "../components/MetricsGrid";
import ModelFleetTable from "../components/ModelFleetTable";
import PrivacyRiskRadar from "../components/PrivacyRiskRadar";
import RateConfigurator from "../components/RateConfigurator";
import SmartInsightsPanel from "../components/SmartInsightsPanel";
import UploadDropzone from "../components/UploadDropzone";

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const SAMPLE_LOG = JSON.stringify(
  [
    {
      model: "sample-local-model",
      prompt: "Summarize this public product note for our team.",
      usage: { input_tokens: 1200, output_tokens: 260 },
    },
    {
      model: "sample-local-model",
      prompt: "Rewrite this public paragraph in an active voice.",
      usage: { input_tokens: 800, output_tokens: 180 },
    },
    {
      model: "gpt-4o",
      prompt: "Generate API integration code snippet.",
      usage: { input_tokens: 2400, output_tokens: 650 },
    },
    {
      model: "claude-3-5-sonnet",
      prompt: "Refactor TypeScript type declarations.",
      usage: { input_tokens: 3100, output_tokens: 820 },
    },
  ],
  null,
  2,
);

const SAMPLE_RATES = JSON.stringify(
  {
    "sample-local-model": { inputPerMillion: 1.0, outputPerMillion: 2.0 },
    "gpt-4o": { inputPerMillion: 2.5, outputPerMillion: 10.0 },
    "claude-3-5-sonnet": { inputPerMillion: 3.0, outputPerMillion: 15.0 },
    "*": { inputPerMillion: 2.0, outputPerMillion: 5.0 },
  },
  null,
  2,
);

export default function LlmCostPrivacyAnalyzer() {
  const fileRef = useRef(null);
  const [logSource, setLogSource] = useState("");
  const [rateSource, setRateSource] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const report = useMemo(
    () => (result?.ok ? buildUsageReport(result) : null),
    [result],
  );

  const invalidate = () => {
    setResult(null);
    setError("");
  };

  const readFile = async (file) => {
    invalidate();
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setError("Choose a JSON, JSONL, CSV, or TSV log up to 8 MB.");
      return;
    }
    try {
      setLogSource(await file.text());
    } catch {
      setError("The selected usage log could not be read as text.");
    }
  };

  const analyze = () => {
    setIsAnalyzing(true);
    setError("");
    setTimeout(() => {
      const next = analyzeUsageLogs(logSource, rateSource);
      if (!next.ok) {
        setError(next.error);
        setResult(null);
      } else {
        setError("");
        setResult(next);
      }
      setIsAnalyzing(false);
    }, 100);
  };

  const reset = () => {
    setLogSource("");
    setRateSource("");
    setCurrency("USD");
    setResult(null);
    setError("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const loadSample = () => {
    setLogSource(SAMPLE_LOG);
    setRateSource(SAMPLE_RATES);
    invalidate();
  };

  const applyRatePreset = (ratesObj) => {
    setRateSource(JSON.stringify(ratesObj, null, 2));
    invalidate();
  };

  const costFormatter = useMemo(() => {
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: currency.trim().toUpperCase() || "USD",
        maximumFractionDigits: 6,
      });
    } catch {
      return new Intl.NumberFormat(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 6,
      });
    }
  }, [currency]);

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Hero Header */}
      <HeaderHero
        hasResult={Boolean(result)}
        privacySignalCount={result?.privacySignalCount || 0}
        onLoadSample={loadSample}
        onResetWorkspace={reset}
      />

      {/* Main Input Grid */}
      <div className="grid gap-6 xl:grid-cols-12">
        {/* Left 7 cols: Log Upload & Text Input */}
        <div className="xl:col-span-7">
          <UploadDropzone
            logSource={logSource}
            onLogSourceChange={(text) => {
              setLogSource(text);
              invalidate();
            }}
            fileRef={fileRef}
            onFileRead={readFile}
            error={error}
          />
        </div>

        {/* Right 5 cols: Rate Configurator */}
        <div className="xl:col-span-5">
          <RateConfigurator
            rateSource={rateSource}
            onRateSourceChange={(text) => {
              setRateSource(text);
              invalidate();
            }}
            currency={currency}
            onCurrencyChange={setCurrency}
            onApplyPreset={applyRatePreset}
          />
        </div>
      </div>

      {/* Analyze Action Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={!logSource.trim() || isAnalyzing}
          onClick={analyze}
          className="inline-flex h-12 items-center justify-center gap-2.5 rounded-2xl bg-[var(--primary)] px-7 text-sm font-extrabold text-[var(--primary-foreground)] shadow-md transition-all hover:bg-[var(--primary-hover)] disabled:opacity-40 disabled:shadow-none"
        >
          {isAnalyzing ? (
            <LoaderCircle className="size-5 animate-spin" />
          ) : (
            <FileSearch className="size-5" />
          )}
          <span>Analyze Usage Logs</span>
        </button>

        <button
          type="button"
          onClick={reset}
          className="inline-flex h-12 items-center justify-center gap-2.5 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-6 text-sm font-bold text-[var(--foreground)] shadow-2xs transition-colors hover:bg-[var(--surface)]"
        >
          <RotateCcw className="size-5 text-[var(--primary)]" />
          <span>Clear Workspace</span>
        </button>
      </div>

      {/* Results Dashboard Section */}
      {result && (
        <div className="space-y-6" aria-live="polite">
          {/* Truncation Warning Alert */}
          {result.truncated && (
            <div className="rounded-2xl border border-[var(--warning)] bg-[var(--warning-soft)] p-4 text-xs font-semibold leading-relaxed text-[var(--foreground)]">
              ⚠️ Local limit reached: A processing limit was encountered during scan, so token counts or privacy signal totals may be partial.
            </div>
          )}

          {/* 8 KPI Cards */}
          <MetricsGrid result={result} costFormatter={costFormatter} />

          {/* Smart Advisory Insights */}
          <SmartInsightsPanel result={result} costFormatter={costFormatter} />

          {/* Cost Analytics & Token Volume Split */}
          <CostAnalyticsCharts result={result} costFormatter={costFormatter} />

          {/* Privacy Audit & Credentials Radar */}
          <PrivacyRiskRadar result={result} />

          {/* AI Model Fleet Summary Table */}
          <ModelFleetTable
            result={result}
            costFormatter={costFormatter}
            onDownloadReport={() => {
              if (report) {
                const url = URL.createObjectURL(
                  new Blob([JSON.stringify(report, null, 2)], {
                    type: "application/json;charset=utf-8",
                  }),
                );
                const a = document.createElement("a");
                a.href = url;
                a.download = "llm-cost-privacy-summary.json";
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
              }
            }}
          />

          {/* Parsed Log Request Explorer */}
          <LogExplorerTable
            records={result.records}
            costFormatter={costFormatter}
          />

          {/* Export & Sharing Center */}
          <ExportCenter
            report={report}
            result={result}
            costFormatter={costFormatter}
          />
        </div>
      )}

      {/* Bottom Legal & Safety Disclaimer */}
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface-soft)] p-5 text-xs font-medium text-[var(--muted-foreground)]">
        <p className="flex items-start gap-2.5 leading-relaxed">
          <AlertTriangle className="mt-0.5 size-4.5 shrink-0 text-[var(--warning)]" />
          <span>
            <strong>Audit &amp; Estimation Disclaimer:</strong> Cost calculations depend entirely on your provided token rate table. Cached tokens, batch discounts, tools, audio, image attachments, provider metering, and currency conversion can cause billing invoices to differ. Privacy signals are automated pattern matches and do not replace a full security audit.
          </span>
        </p>
      </section>
    </main>
  );
}
