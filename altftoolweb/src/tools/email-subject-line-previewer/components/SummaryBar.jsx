import React from 'react';
import { MailCheck, ShieldAlert, Smartphone, TextCursorInput } from 'lucide-react';
import { scoreLabel } from '../utils/subjectLine';

export default function SummaryBar({ analysis }) {
  const getReadinessTheme = (score) => {
    if (score >= 85) return { text: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
    if (score >= 70) return { text: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' };
    if (score >= 50) return { text: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
    return { text: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20' };
  };

  const getMobileFitTheme = (length) => {
    return length <= 38
      ? { text: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Fits' }
      : { text: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'Truncates' };
  };

  const getPreheaderTheme = (length) => {
    return length > 0
      ? { text: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Set' }
      : { text: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'Missing' };
  };

  const getRiskTheme = (hits) => {
    return hits.length === 0
      ? { text: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Low' }
      : { text: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20', label: 'Review' };
  };

  const readiness = getReadinessTheme(analysis.score);
  const mobile = getMobileFitTheme(analysis.subjectLength);
  const preheader = getPreheaderTheme(analysis.previewLength);
  const risk = getRiskTheme(analysis.spamHits);

  const items = [
    {
      icon: <MailCheck size={16} />,
      label: 'Readiness',
      value: scoreLabel(analysis.score),
      theme: readiness,
    },
    {
      icon: <Smartphone size={16} />,
      label: 'Mobile Fit',
      value: mobile.label,
      theme: mobile,
    },
    {
      icon: <TextCursorInput size={16} />,
      label: 'Preheader',
      value: preheader.label,
      theme: preheader,
    },
    {
      icon: <ShieldAlert size={16} />,
      label: 'Risk Level',
      value: risk.label,
      theme: risk,
    },
  ];

  return (
    <section className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex flex-col justify-between rounded-xl border border-[var(--card-border)] bg-[var(--card)]/70 p-4 shadow-sm backdrop-blur-xl transition-all duration-200 hover:border-[var(--primary)]/30 hover:bg-[var(--card)]/90"
        >
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-[var(--secondary-foreground)]/80">{item.icon}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--secondary-foreground)]">
              {item.label}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2 mt-1">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${item.theme.bg} ${item.theme.text} border ${item.theme.border}`}>
              {item.value}
            </span>
          </div>
        </div>
      ))}
    </section>
  );
}
