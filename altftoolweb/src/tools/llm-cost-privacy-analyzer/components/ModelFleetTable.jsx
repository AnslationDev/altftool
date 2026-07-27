"use client";

import { useState } from "react";
import { Cpu, Download, Search } from "lucide-react";

function formatTokens(value) {
  return Number(value || 0).toLocaleString();
}

export default function ModelFleetTable({
  result,
  costFormatter,
  onDownloadReport,
}) {
  const [search, setSearch] = useState("");

  if (!result || !result.models.length) return null;

  const filteredModels = result.models.filter((m) =>
    m.model.toLowerCase().includes(search.toLowerCase()),
  );

  const totalCost = result.estimatedCost || 1;
  const totalTokens = result.totalTokens || 1;

  return (
    <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--border)] pb-4">
        <div>
          <h2 className="flex items-center gap-2 text-base font-extrabold text-[var(--foreground)] sm:text-lg">
            <Cpu className="size-5 text-[var(--primary)]" />
            <span>AI Model Fleet Overview</span>
          </h2>
          <p className="text-xs text-[var(--muted-foreground)]">
            Summary of requests, split token volumes, and estimated costs per model
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[var(--muted-foreground)]" />
            <input
              type="text"
              placeholder="Search model name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-44 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] pl-9 pr-3 text-xs font-medium text-[var(--foreground)] outline-none focus:border-[var(--primary)] sm:w-60"
            />
          </div>

          <button
            type="button"
            onClick={onDownloadReport}
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3.5 text-xs font-bold text-[var(--foreground)] transition-all hover:bg-[var(--surface)]"
          >
            <Download className="size-4 text-[var(--primary)]" />
            <span>Export Counts-Only Report</span>
          </button>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-left text-xs font-medium">
          <thead>
            <tr className="border-b border-[var(--border)] text-[11px] font-extrabold uppercase text-[var(--muted-foreground)]">
              <th className="px-3 py-3">#</th>
              <th className="px-3 py-3">Model Name</th>
              <th className="px-3 py-3 text-right">Requests</th>
              <th className="px-3 py-3 text-right">Input Tokens</th>
              <th className="px-3 py-3 text-right">Output Tokens</th>
              <th className="px-3 py-3 text-right">Total Tokens</th>
              <th className="px-3 py-3 text-right">Token Share</th>
              <th className="px-3 py-3 text-right">Estimated Cost</th>
              <th className="px-3 py-3 text-right">Pricing Coverage</th>
            </tr>
          </thead>
          <tbody>
            {filteredModels.map((model, index) => {
              const tokenShare = Math.round((model.totalTokens / totalTokens) * 100);
              const costShare = Math.round((model.estimatedCost / totalCost) * 100);

              return (
                <tr
                  key={model.model}
                  className="border-b border-[var(--border)] transition-colors hover:bg-[var(--surface-soft)]/50"
                >
                  <td className="px-3 py-3 font-mono text-[var(--muted-foreground)]">
                    {index + 1}
                  </td>
                  <td className="break-all px-3 py-3 font-mono font-bold text-[var(--foreground)]">
                    {model.model}
                  </td>
                  <td className="px-3 py-3 text-right font-semibold text-[var(--foreground)]">
                    {model.requestCount.toLocaleString()}
                  </td>
                  <td className="px-3 py-3 text-right font-mono text-[var(--foreground)]">
                    {formatTokens(model.inputTokens)}
                  </td>
                  <td className="px-3 py-3 text-right font-mono text-[var(--foreground)]">
                    {formatTokens(model.outputTokens)}
                  </td>
                  <td className="px-3 py-3 text-right font-mono font-bold text-[var(--foreground)]">
                    {formatTokens(model.totalTokens)}
                  </td>
                  <td className="px-3 py-3 text-right">
                    <span className="inline-flex rounded-md bg-[var(--primary-soft)] px-2 py-0.5 font-mono text-[11px] font-bold text-[var(--primary)]">
                      {tokenShare}%
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right font-mono font-black text-[var(--success)]">
                    {costFormatter.format(model.estimatedCost)}
                    <span className="block text-[10px] text-[var(--muted-foreground)] font-normal">
                      {costShare}% cost share
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <span className="inline-flex rounded-md bg-[var(--surface-soft)] px-2 py-0.5 text-[11px] font-bold text-[var(--muted-foreground)] border border-[var(--border)]">
                      {model.pricedRequestCount}/{model.requestCount} priced
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
