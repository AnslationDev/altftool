"use client";

import React from 'react';
import { HelpCircle, Network, Code2, Zap } from 'lucide-react';

const cards = [
  {
    icon: <Network size={18} />,
    title: 'What is IP to Number?',
    body: 'Convert IP addresses (dotted decimal notation) to their numeric representation and vice versa.',
  },
  {
    icon: <Code2 size={18} />,
    title: 'How it Works',
    body: 'Each IP octet (0-255) is multiplied by its power of 256: (a×256³) + (b×256²) + (c×256) + d',
  },
  {
    icon: <Zap size={18} />,
    title: 'Why Convert?',
    body: 'Numeric IPs are useful for range calculations, database storage, network programming, and bitwise operations.',
  },
  {
    icon: <HelpCircle size={18} />,
    title: 'Range Information',
    body: 'Valid IP range: 0.0.0.0 (0) to 255.255.255.255 (4,294,967,295)',
  },
];

export default function ConversionGuide() {
  return (
    <section className="mt-4">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[var(--primary)]">
        Conversion Guide
      </h2>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article
            key={card.title}
            className="min-h-[156px] rounded-2xl border border-[var(--card-border)] bg-[var(--card)]/70 p-5 shadow-lg backdrop-blur-xl"
          >
            <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--primary)]/30 bg-[var(--primary)]/10 text-[var(--primary)]">
              {card.icon}
            </div>
            <h3 className="mb-2 text-base font-semibold text-[var(--primary)]">{card.title}</h3>
            <p className="text-sm leading-6 text-[var(--secondary-foreground)]">{card.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
