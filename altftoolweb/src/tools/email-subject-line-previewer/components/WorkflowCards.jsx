import React from 'react';
import { ClipboardCheck, Eye, Gauge, Send, SplitSquareHorizontal, Wand2 } from 'lucide-react';

const workflow = [
  {
    icon: <Wand2 size={16} />,
    title: 'Draft',
    body: 'Write one focused subject and matching preview text for the campaign goal.',
  },
  {
    icon: <Eye size={16} />,
    title: 'Preview',
    body: 'Check how the line appears across mobile, desktop, Apple Mail, and Outlook views.',
  },
  {
    icon: <Gauge size={16} />,
    title: 'Score',
    body: 'Review length, risk words, clarity signals, and preview-text coverage.',
  },
  {
    icon: <SplitSquareHorizontal size={16} />,
    title: 'Compare',
    body: 'Use variants to compare concise, question-based, numeric, and announcement formats.',
  },
  {
    icon: <ClipboardCheck size={16} />,
    title: 'Approve',
    body: 'Pick the strongest option and copy it into the email campaign builder.',
  },
  {
    icon: <Send size={16} />,
    title: 'Launch',
    body: 'Keep the winning subject, preview text, and score as a reusable campaign note.',
  },
];

export default function WorkflowCards() {
  return (
    <section className="mt-6">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[var(--primary)]">
        Subject Line Workflow
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {workflow.map((item) => (
          <article
            key={item.title}
            className="flex flex-col justify-between min-h-[140px] rounded-xl border border-[var(--card-border)] bg-[var(--card)]/75 p-5 shadow-sm backdrop-blur-xl transition-all duration-200 hover:border-[var(--primary)]/20 hover:bg-[var(--card)]/90"
          >
            <div>
              <div className="mb-3.5 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--primary)]/20 bg-[var(--primary)]/5 text-[var(--primary)] transition-all">
                {item.icon}
              </div>
              <h3 className="mb-2 text-sm font-bold text-[var(--primary)] leading-tight">{item.title}</h3>
              <p className="text-xs leading-5 text-[var(--secondary-foreground)]/90">{item.body}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
