"use client";

import { FileDiff } from "lucide-react";
import DiffViewer from "../components/DiffViewer";
import MetricCard from "../components/MetricCard";
import OptionsBar from "../components/OptionsBar";
import TextInputPanel from "../components/TextInputPanel";
import { useTextCompare } from "../hooks/useTextCompare";

export default function ToolHome() {
  const compare = useTextCompare();
  const stats = compare.result.stats;

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <FileDiff className="h-4 w-4" />
            Text utility
          </div>
          <h1 className="tool-heading-accent text-3xl font-semibold leading-tight sm:text-4xl">Text Compare</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Compare two text blocks in real time with added, removed, modified, and similarity statistics.
          </p>
        </section>

        {(compare.message || compare.isLarge) && (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 text-sm font-semibold text-[var(--muted-foreground)]">
            {compare.isLarge ? "Large text detected. Comparison remains local in your browser." : compare.message}
          </div>
        )}

        <OptionsBar options={compare.options} onToggle={compare.toggleOption} onCopy={compare.copyReport} onDownload={compare.downloadReport} onClear={compare.clearAll} />

        <section className="grid gap-4 lg:grid-cols-2">
          <TextInputPanel id="text-compare-left" label="Left text input" value={compare.leftText} onChange={compare.setLeftText} metrics={compare.leftMetrics} />
          <TextInputPanel id="text-compare-right" label="Right text input" value={compare.rightText} onChange={compare.setRightText} metrics={compare.rightMetrics} />
        </section>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <MetricCard label="Added lines" value={stats.added} />
          <MetricCard label="Removed lines" value={stats.removed} />
          <MetricCard label="Modified lines" value={stats.modified} />
          <MetricCard label="Similarity" value={`${stats.similarity}%`} />
          <MetricCard label="Total lines" value={stats.total} />
        </section>

        <DiffViewer rows={compare.result.rows} showLineNumbers={compare.options.lineNumbers} isEmpty={compare.isEmpty} />
      </div>
    </main>
  );
}
