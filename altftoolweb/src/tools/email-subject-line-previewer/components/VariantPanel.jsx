"use client";

import React, { useState } from 'react';
import { Copy, Check, MousePointerClick, Sparkles } from 'lucide-react';
import { analyzeSubject, createVariants, scoreLabel } from '../utils/subjectLine';

export default function VariantPanel({ subject, preview, onUseVariant }) {
  const variants = createVariants(subject);
  const [copiedVariant, setCopiedVariant] = useState(null);

  const copyVariant = async (value) => {
    if (!navigator?.clipboard) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopiedVariant(value);
      setTimeout(() => {
        setCopiedVariant(null);
      }, 1500);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <section className="rounded-xl border border-[var(--card-border)] bg-[var(--card)]/70 p-5 shadow-lg backdrop-blur-xl transition-all duration-200">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-[var(--primary)]">
          Variant Lab
        </h2>
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--primary)]/30 bg-[var(--primary)]/10 px-3 py-1.5 text-xs text-[var(--primary)]">
          <Sparkles size={14} />
          A/B Ideas
        </span>
      </div>

      <div className="grid gap-3.5">
        {variants.map((variant) => {
          const analysis = analyzeSubject(variant, preview);
          const isCopied = copiedVariant === variant;

          return (
            <article
              key={variant}
              className="grid gap-3.5 rounded-xl border border-[var(--card-border)] bg-[var(--background)] p-3.5 transition-all duration-200 hover:border-[var(--primary)]/20 md:grid-cols-[minmax(0,1fr)_90px_84px]"
            >
              <div className="min-w-0 flex flex-col justify-between">
                <p className="truncate text-sm font-bold text-[var(--foreground)]" title={variant}>
                  {variant}
                </p>
                <p className="mt-1.5 text-[10px] font-semibold text-[var(--secondary-foreground)]/80 flex items-center gap-1.5">
                  <span className="font-mono">{variant.length} chars</span>
                  <span className="h-1 w-1 rounded-full bg-[var(--card-border)]" />
                  <span>{scoreLabel(analysis.score)}</span>
                </p>
              </div>

              <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)]/60 px-3 py-1.5 text-center flex flex-col justify-center">
                <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--secondary-foreground)]/70">Score</span>
                <span className="font-mono text-sm font-black text-[var(--primary)]">{analysis.score}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onUseVariant(variant)}
                  className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] transition-all duration-200 hover:opacity-90 active:scale-95 shrink-0"
                  title="Use variant"
                >
                  <MousePointerClick size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => copyVariant(variant)}
                  className={`grid h-9 w-9 place-items-center rounded-lg border transition-all duration-300 active:scale-95 shrink-0 ${
                    isCopied
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500 scale-105'
                      : 'border-[var(--secondary-border)] text-[var(--secondary-foreground)] hover:bg-[var(--secondary-hover)]'
                  }`}
                  title={isCopied ? "Copied!" : "Copy variant"}
                >
                  {isCopied ? <Check size={15} /> : <Copy size={15} />}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
