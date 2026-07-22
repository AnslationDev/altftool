import React from 'react';
import { AlignLeft, ClipboardPaste, Minimize2, Quote } from 'lucide-react';

const transforms = [
  {
    key: 'format',
    icon: <AlignLeft size={18} />,
    title: 'Beautify SQL',
    body: 'Split clauses into readable lines for review and debugging.',
  },
  {
    key: 'compress',
    icon: <Minimize2 size={18} />,
    title: 'Compress SQL',
    body: 'Minify whitespace for compact strings and configuration fields.',
  },
  {
    key: 'escape',
    icon: <Quote size={18} />,
    title: 'Escape String',
    body: 'Prepare a compact SQL string for code or form inputs.',
  },
];

export default function TransformCards({ mode, onModeChange, onSample }) {
  return (
    <section className="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {transforms.map((item) => {
        const active = mode === item.key;
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onModeChange(item.key)}
            className={`rounded-2xl border p-5 text-left shadow-lg backdrop-blur-xl ${
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
            <h2 className="text-base font-bold text-[var(--primary)]">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--secondary-foreground)]">{item.body}</p>
          </button>
        );
      })}

      <button
        type="button"
        onClick={onSample}
        className="rounded-2xl border border-[var(--card-border)] bg-[var(--background)] p-5 text-left shadow-lg hover:border-[var(--primary)]/50"
      >
        <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--primary)]/30 bg-[var(--primary)]/10 text-[var(--primary)]">
          <ClipboardPaste size={18} />
        </div>
        <h2 className="text-base font-bold text-[var(--foreground)]">Load Sample</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--secondary-foreground)]">
          Restore the example query and test the formatter quickly.
        </p>
      </button>
    </section>
  );
}
