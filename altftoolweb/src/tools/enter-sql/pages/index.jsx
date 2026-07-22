"use client";

import React, { useMemo, useState } from 'react';
import { Database, ShieldCheck, Wand2 } from 'lucide-react';
import MetricCards from '../components/MetricCards';
import OutputPanel from '../components/OutputPanel';
import SqlEditor from '../components/SqlEditor';
import SqlGuide from '../components/SqlGuide';
import TransformCards from '../components/TransformCards';
import {
  analyzeSql,
  compressSql,
  escapeSqlString,
  formatSql,
  getSampleSql,
} from '../utils/sqlFormatter';

export default function ToolHome() {
  const [sql, setSql] = useState(getSampleSql());
  const [mode, setMode] = useState('format');
  const [indentSize, setIndentSize] = useState(2);
  const [uppercaseKeywords, setUppercaseKeywords] = useState(true);

  const output = useMemo(() => {
    if (mode === 'compress') return compressSql(sql);
    if (mode === 'escape') return escapeSqlString(sql);
    return formatSql(sql, { indentSize, uppercaseKeywords });
  }, [indentSize, mode, sql, uppercaseKeywords]);

  const inputMetrics = useMemo(() => analyzeSql(sql), [sql]);
  const outputMetrics = useMemo(() => analyzeSql(output), [output]);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto space-y-6">

        {/* Header Card */}
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm group">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-soft text-primary group-hover:bg-primary/10 transition-colors duration-300">
                <Database className="h-5 w-5 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground leading-none">Enter SQL</h1>
                  <span className="inline-flex rounded-md border border-border bg-background px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Developer Tools</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed">
                  Format, beautify, and compress SQL statement strings for easy viewing or filling.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold text-muted-foreground shrink-0 self-start md:self-auto">
              {["Format & Beautify", "Compress", "Escape"].map((item) => (
                <span key={item} className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1">
                  <Wand2 className="h-3 w-3 text-primary" />{item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl space-y-4">
          <TransformCards
            mode={mode}
            onModeChange={setMode}
            onSample={() => setSql(getSampleSql())}
          />

          <MetricCards inputMetrics={inputMetrics} outputMetrics={outputMetrics} mode={mode} />

          <div className="grid gap-4">
            <SqlEditor
              value={sql}
              mode={mode}
              indentSize={indentSize}
              uppercaseKeywords={uppercaseKeywords}
              inputMetrics={inputMetrics}
              onChange={setSql}
              onModeChange={setMode}
              onIndentChange={setIndentSize}
              onUppercaseChange={setUppercaseKeywords}
              onSample={() => setSql(getSampleSql())}
              onClear={() => setSql('')}
            />
            <OutputPanel output={output} mode={mode} metrics={outputMetrics} />
          </div>

          <SqlGuide />
        </div>
      </div>
    </div>
  );
}

function HeroCard({ icon, label, value }) {
  return (
    <article className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)]/70 p-5 shadow-lg backdrop-blur-xl">
      <div className="mb-3 flex items-center gap-3">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--primary)]/30 bg-[var(--primary)]/10 text-[var(--primary)]">{icon}</span>
        <span className="text-xs font-bold uppercase tracking-wide text-[var(--primary)]">{label}</span>
      </div>
      <p className="text-sm leading-6 text-[var(--secondary-foreground)]">{value}</p>
    </article>
  );
}
