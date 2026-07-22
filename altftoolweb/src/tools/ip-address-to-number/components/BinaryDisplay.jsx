"use client";

import React from 'react';
import { Binary } from 'lucide-react';

export default function BinaryDisplay({ number, ip }) {
  if (!number) return null;

  const parts = ip ? ip.split('.').map(p => parseInt(p, 10)) : null;

  return (
    <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)]/70 p-5 shadow-lg backdrop-blur-xl">
      <h2 className="mb-4 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-[var(--primary)]">
        <Binary size={16} />
        Binary Representation
      </h2>

      <div className="space-y-3">
        {parts && (
          <>
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--background)] p-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--secondary-foreground)]">
                By Octets
              </p>
              <div className="space-y-2">
                {parts.map((part, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-4">
                    <span className="text-sm font-semibold text-[var(--foreground)]">Octet {idx + 1}:</span>
                    <code className="font-mono text-xs text-[var(--primary)]">
                      {part.toString(2).padStart(8, '0')}
                    </code>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--background)] p-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--secondary-foreground)]">
                Full Binary (32-bit)
              </p>
              <code className="block break-all font-mono text-sm text-[var(--primary)] leading-relaxed">
                {number.toString(2).padStart(32, '0')}
              </code>
            </div>

            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--background)] p-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--secondary-foreground)]">
                Hexadecimal
              </p>
              <code className="block font-mono text-sm text-[var(--primary)]">
                0x{number.toString(16).toUpperCase().padStart(8, '0')}
              </code>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
