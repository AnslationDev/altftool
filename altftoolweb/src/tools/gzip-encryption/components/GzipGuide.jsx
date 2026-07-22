"use client";

import React from 'react';
import { Database, Zap, Lock, Download, Zap as ZapIcon, Info } from 'lucide-react';

const cards = [
  {
    icon: <Database size={18} />,
    title: 'What is Gzip?',
    body: 'Gzip is a compression algorithm that reduces file size. It\'s widely used for web optimization and data transfer.',
  },
  {
    icon: <Zap size={18} />,
    title: 'Compress Text',
    body: 'Convert any text into compressed gzip format. The result is Base64 encoded for safe transmission.',
  },
  {
    icon: <Lock size={18} />,
    title: 'Decompress Data',
    body: 'Convert gzip-compressed data back to original readable text. Paste the gzip data to restore it.',
  },
  {
    icon: <Download size={18} />,
    title: 'Export Results',
    body: 'Download your compressed or decompressed data as a file for further processing or storage.',
  },
  {
    icon: <ZapIcon size={18} />,
    title: 'Real-time Stats',
    body: 'View compression ratio, file size reduction, and other metrics in real-time as you compress data.',
  },
  {
    icon: <Info size={18} />,
    title: 'Local Processing',
    body: 'All compression happens in your browser. Your data is never sent to any server.',
  },
];

export default function GzipGuide() {
  return (
    <section className="mt-4">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[var(--primary)]">
        How to Use Gzip Tool
      </h2>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <article key={card.title} className="min-h-[156px] rounded-2xl border border-[var(--card-border)] bg-[var(--card)]/70 p-5 shadow-lg backdrop-blur-xl">
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
