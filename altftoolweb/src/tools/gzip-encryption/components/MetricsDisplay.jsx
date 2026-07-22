"use client";

import React from 'react';
import { Database, Zap, FileText, TrendingDown } from 'lucide-react';

export default function MetricsDisplay({ inputMetrics, outputMetrics, mode }) {
  const compressionRatio = inputMetrics.bytes > 0
    ? Math.round((outputMetrics.bytes / inputMetrics.bytes) * 100)
    : 0;

  const cards = [
    { icon: <FileText size={16} />, label: 'Input Size', value: formatBytes(inputMetrics.bytes), helper: 'Original' },
    { icon: <Database size={16} />, label: 'Output Size', value: formatBytes(outputMetrics.bytes), helper: mode === 'compress' ? 'Compressed' : 'Decompressed' },
    { icon: <Zap size={16} />, label: 'Compression', value: compressionRatio + '%', helper: mode === 'compress' ? 'Reduced' : 'Expanded' },
    { icon: <TrendingDown size={16} />, label: 'Savings', value: formatBytes(inputMetrics.bytes - outputMetrics.bytes), helper: 'Space saved' },
  ];

  return (
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((card) => (
        <article key={card.label} className="min-h-[112px] rounded-2xl border border-[var(--card-border)] bg-[var(--card)]/70 p-5 shadow-lg backdrop-blur-xl">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--primary)]/30 bg-[var(--primary)]/10 text-[var(--primary)]">{card.icon}</span>
            <span className="text-right text-[10px] uppercase tracking-wide text-[var(--secondary-foreground)]">{card.label}</span>
          </div>
          <p className="font-mono text-2xl font-bold text-[var(--primary)]">{card.value}</p>
          <p className="mt-1 text-xs text-[var(--secondary-foreground)]">{card.helper}</p>
        </article>
      ))}
    </section>
  );
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
