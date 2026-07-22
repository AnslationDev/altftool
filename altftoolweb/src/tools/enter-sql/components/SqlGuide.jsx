import React from 'react';
import { AlignLeft, Database, FileInput, Minimize2, ShieldCheck, Wand2 } from 'lucide-react';

const cards = [
  {
    icon: <Database size={18} />,
    title: 'What is Enter SQL?',
    body: 'A developer tool for turning dense SQL statement strings into readable queries or compact one-line output.',
  },
  {
    icon: <AlignLeft size={18} />,
    title: 'Beautify queries',
    body: 'Break long SELECT, JOIN, WHERE, GROUP BY, and ORDER BY clauses into a more reviewable structure.',
  },
  {
    icon: <Minimize2 size={18} />,
    title: 'Compress SQL',
    body: 'Remove extra whitespace when you need a short query string for logs, scripts, config, or database clients.',
  },
  {
    icon: <FileInput size={18} />,
    title: 'Escaped string output',
    body: 'Convert the compressed statement into an escaped string that is easier to paste into code or forms.',
  },
  {
    icon: <Wand2 size={18} />,
    title: 'Workflow',
    body: 'Paste SQL, choose output mode, inspect metrics, then copy or download the transformed statement.',
  },
  {
    icon: <ShieldCheck size={18} />,
    title: 'Local only',
    body: 'Formatting runs in your browser. The tool does not need to send SQL text to a server.',
  },
];

export default function SqlGuide() {
  return (
    <section className="mt-4">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[var(--primary)]">
        SQL Workflow Guide
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
