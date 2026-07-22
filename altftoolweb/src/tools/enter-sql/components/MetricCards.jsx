import React from 'react';
import { FileText, Hash, Minimize2, Rows3 } from 'lucide-react';

export default function MetricCards({ inputMetrics, outputMetrics, mode }) {
  const characterDelta = inputMetrics.characters - outputMetrics.characters;
  const cards = [
    { icon: <Hash size={16} />, label: 'Input Characters', value: inputMetrics.characters, helper: 'Source SQL' },
    { icon: <Rows3 size={16} />, label: 'Output Lines', value: outputMetrics.lines, helper: modeLabel(mode) },
    { icon: <FileText size={16} />, label: 'Statements', value: inputMetrics.statements, helper: 'Detected' },
    { icon: <Minimize2 size={16} />, label: 'Character Delta', value: characterDelta, helper: characterDelta >= 0 ? 'Shorter output' : 'Expanded output' },
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

function modeLabel(mode) {
  if (mode === 'compress') return 'Compressed';
  if (mode === 'escape') return 'Escaped string';
  return 'Beautified';
}
