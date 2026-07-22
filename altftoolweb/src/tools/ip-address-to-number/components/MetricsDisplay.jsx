"use client";

import React from 'react';
import { Hash, Network, Zap, Info } from 'lucide-react';

export default function MetricsDisplay({ ip, number }) {
  const cards = [
    {
      icon: <Network size={16} />,
      label: 'IP Address',
      value: ip || '—',
      helper: 'Dotted Decimal Notation'
    },
    {
      icon: <Hash size={16} />,
      label: 'Decimal',
      value: number ? parseInt(number).toLocaleString() : '—',
      helper: 'Numeric Representation'
    },
    {
      icon: <Zap size={16} />,
      label: 'Hexadecimal',
      value: number ? '0x' + parseInt(number).toString(16).toUpperCase().padStart(8, '0') : '—',
      helper: 'Hex Format'
    },
    {
      icon: <Info size={16} />,
      label: 'Binary',
      value: number ? parseInt(number).toString(2).length : '—',
      helper: 'Bits Required'
    },
  ];

  return (
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((card) => (
        <article
          key={card.label}
          className="min-h-[112px] rounded-2xl border border-[var(--card-border)] bg-[var(--card)]/70 p-5 shadow-lg backdrop-blur-xl"
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--primary)]/30 bg-[var(--primary)]/10 text-[var(--primary)]">
              {card.icon}
            </span>
            <span className="text-right text-[10px] uppercase tracking-wide text-[var(--secondary-foreground)]">
              {card.label}
            </span>
          </div>
          <p className="font-mono text-lg font-bold text-[var(--primary)]">{card.value}</p>
          <p className="mt-1 text-xs text-[var(--secondary-foreground)]">{card.helper}</p>
        </article>
      ))}
    </section>
  );
}
