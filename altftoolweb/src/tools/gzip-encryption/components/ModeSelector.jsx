"use client";

import React from 'react';
import { Zap, Unlock } from 'lucide-react';

const modes = [
  { key: 'compress', label: 'Compress', icon: <Zap size={16} /> },
  { key: 'decompress', label: 'Decompress', icon: <Unlock size={16} /> },
];

export default function ModeSelector({ mode, onModeChange }) {
  return (
    <section className="mb-4 grid gap-3 md:grid-cols-2">
      {modes.map((item) => {
        const active = mode === item.key;
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onModeChange(item.key)}
            className={`rounded-2xl border p-5 text-left shadow-lg backdrop-blur-xl transition-all ${
              active
                ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                : 'border-[var(--card-border)] bg-[var(--card)]/70 hover:border-[var(--primary)]/50'
            }`}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--primary)]/30 bg-[var(--primary)]/10 text-[var(--primary)]">
                {item.icon}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--secondary-foreground)]">
                {active ? 'Active' : 'Mode'}
              </span>
            </div>
            <h2 className="text-base font-bold text-[var(--primary)]">{item.label}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--secondary-foreground)]">
              {item.key === 'compress'
                ? 'Convert text to compressed gzip format'
                : 'Convert gzip data back to readable text'}
            </p>
          </button>
        );
      })}
    </section>
  );
}
