"use client";

import {
  BarChart3,
  Boxes,
  Coins,
  Cpu,
  PieChart,
  Sparkles,
  Zap,
} from "lucide-react";

function formatTokens(value) {
  return Number(value || 0).toLocaleString();
}

export default function CostAnalyticsCharts({
  result,
  costFormatter,
}) {
  if (!result || !result.models.length) return null;

  const totalCost = result.estimatedCost || 1;
  const totalTokens = result.totalTokens || 1;

  return (
    <section className="grid gap-6 lg:grid-cols-2">
      {/* 1. Model Cost Share Distribution */}
      <div className="flex flex-col rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
          <div className="flex items-center gap-2.5">
            <Coins className="size-5 text-[var(--success)]" />
            <div>
              <h2 className="text-base font-extrabold text-[var(--foreground)]">Cost Distribution by Model</h2>
              <p className="text-xs text-[var(--muted-foreground)]">Model share of total estimated API spend</p>
            </div>
          </div>
          <span className="text-xs font-black text-[var(--success)]">
            Total: {costFormatter.format(result.estimatedCost)}
          </span>
        </div>

        <div className="mt-5 space-y-4">
          {result.models.map((model) => {
            const costPercent = Math.min(100, Math.round((model.estimatedCost / totalCost) * 100));
            const tokenPercent = Math.min(100, Math.round((model.totalTokens / totalTokens) * 100));

            return (
              <div key={model.model} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="truncate font-mono text-[var(--foreground)]">{model.model}</span>
                  <span className="text-[var(--foreground)] font-extrabold">
                    {costFormatter.format(model.estimatedCost)} ({costPercent}%)
                  </span>
                </div>

                {/* Progress bar container */}
                <div className="relative h-3.5 w-full overflow-hidden rounded-full bg-[var(--surface-soft)] p-0.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
                    style={{ width: `${Math.max(4, costPercent)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--muted-foreground)]">
                  <span>{model.requestCount} requests</span>
                  <span>{formatTokens(model.totalTokens)} tokens ({tokenPercent}% share)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Token Volume & Input vs Output Efficiency */}
      <div className="flex flex-col rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
          <div className="flex items-center gap-2.5">
            <Cpu className="size-5 text-[var(--primary)]" />
            <div>
              <h2 className="text-base font-extrabold text-[var(--foreground)]">Token Volume Split</h2>
              <p className="text-xs text-[var(--muted-foreground)]">Ratio of Prompt Input vs Completion Output tokens</p>
            </div>
          </div>
          <span className="text-xs font-black text-[var(--foreground)]">
            {formatTokens(result.totalTokens)} Tokens
          </span>
        </div>

        <div className="mt-5 space-y-6">
          {/* Visual Stacked Ratio Bar */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-indigo-500 font-bold">Input Tokens: {formatTokens(result.inputTokens)}</span>
              <span className="text-emerald-500 font-bold">Output Tokens: {formatTokens(result.outputTokens)}</span>
            </div>

            <div className="mt-2.5 flex h-5 w-full overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-1">
              <div
                className="h-full rounded-l-lg bg-indigo-500 transition-all duration-500"
                style={{ width: `${Math.round((result.inputTokens / totalTokens) * 100)}%` }}
              />
              <div
                className="h-full rounded-r-lg bg-emerald-500 transition-all duration-500"
                style={{ width: `${Math.round((result.outputTokens / totalTokens) * 100)}%` }}
              />
            </div>

            <div className="mt-2 flex items-center justify-between text-[11px] font-semibold text-[var(--muted-foreground)]">
              <span>{Math.round((result.inputTokens / totalTokens) * 100)}% Prompt Input Ratio</span>
              <span>{Math.round((result.outputTokens / totalTokens) * 100)}% Completion Output Ratio</span>
            </div>
          </div>

          {/* Model Efficiency Stats */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 space-y-3">
            <h3 className="text-xs font-extrabold text-[var(--foreground)]">Token Efficiency Metrics</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="block text-[11px] font-bold text-[var(--muted-foreground)]">Avg. Tokens / Request</span>
                <span className="mt-0.5 block text-base font-black text-[var(--foreground)]">
                  {formatTokens(Math.round(result.totalTokens / (result.requestCount || 1)))}
                </span>
              </div>
              <div>
                <span className="block text-[11px] font-bold text-[var(--muted-foreground)]">Avg. Cost / Request</span>
                <span className="mt-0.5 block text-base font-black text-[var(--foreground)]">
                  {costFormatter.format(result.estimatedCost / (result.requestCount || 1))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
