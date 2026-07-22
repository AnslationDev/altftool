import React from 'react';
import { AlertTriangle, BadgeCheck, Hash, MessageSquareText, ScanText, Type } from 'lucide-react';
import { scoreLabel } from '../utils/subjectLine';

export default function ScoreCards({ analysis }) {
  const cards = [
    {
      key: 'quality',
      icon: <BadgeCheck size={16} />,
      label: 'Quality Score',
      value: `${analysis.score}/100`,
      helper: scoreLabel(analysis.score),
      widget: (
        <div className="mt-2.5">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--card-border)]/40 border border-[var(--card-border)]/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 transition-all duration-500"
              style={{ width: `${analysis.score}%` }}
            />
          </div>
        </div>
      )
    },
    {
      key: 'subject',
      icon: <Type size={16} />,
      label: 'Subject Length',
      value: analysis.subjectLength,
      helper: idealRange(analysis.subjectLength, 30, 55),
      widget: (
        <div className="mt-2.5 flex h-1.5 w-full gap-0.5 overflow-hidden rounded-full">
          <div className={`h-full transition-all duration-300 ${analysis.subjectLength < 30 ? 'bg-amber-500 w-1/3' : 'bg-[var(--card-border)]/40 w-1/3'}`} />
          <div className={`h-full transition-all duration-300 ${analysis.subjectLength >= 30 && analysis.subjectLength <= 55 ? 'bg-emerald-500 w-1/3' : 'bg-[var(--card-border)]/40 w-1/3'}`} />
          <div className={`h-full transition-all duration-300 ${analysis.subjectLength > 55 ? 'bg-rose-500 w-1/3' : 'bg-[var(--card-border)]/40 w-1/3'}`} />
        </div>
      )
    },
    {
      key: 'preview',
      icon: <ScanText size={16} />,
      label: 'Preview Length',
      value: analysis.previewLength,
      helper: idealRange(analysis.previewLength, 40, 95),
      widget: (
        <div className="mt-2.5 flex h-1.5 w-full gap-0.5 overflow-hidden rounded-full">
          <div className={`h-full transition-all duration-300 ${analysis.previewLength < 40 ? 'bg-amber-500 w-1/3' : 'bg-[var(--card-border)]/40 w-1/3'}`} />
          <div className={`h-full transition-all duration-300 ${analysis.previewLength >= 40 && analysis.previewLength <= 95 ? 'bg-emerald-500 w-1/3' : 'bg-[var(--card-border)]/40 w-1/3'}`} />
          <div className={`h-full transition-all duration-300 ${analysis.previewLength > 95 ? 'bg-rose-500 w-1/3' : 'bg-[var(--card-border)]/40 w-1/3'}`} />
        </div>
      )
    },
    {
      key: 'words',
      icon: <Hash size={16} />,
      label: 'Word Count',
      value: analysis.wordCount,
      helper: analysis.wordCount <= 9 ? 'Concise' : 'Long',
      widget: (
        <div className="mt-2.5 flex h-1.5 w-full gap-0.5 overflow-hidden rounded-full">
          <div className={`h-full transition-all duration-300 ${analysis.wordCount <= 9 && analysis.wordCount > 0 ? 'bg-emerald-500 w-1/2' : 'bg-[var(--card-border)]/40 w-1/2'}`} />
          <div className={`h-full transition-all duration-300 ${analysis.wordCount > 9 ? 'bg-amber-500 w-1/2' : 'bg-[var(--card-border)]/40 w-1/2'}`} />
        </div>
      )
    },
    {
      key: 'risk',
      icon: <AlertTriangle size={16} />,
      label: 'Risk Words',
      value: analysis.spamHits.length,
      helper: analysis.spamHits.length ? `${analysis.spamHits.length} warning hits` : 'Spam Clear',
      widget: analysis.spamHits.length ? (
        <div className="mt-2 flex flex-wrap gap-1">
          {analysis.spamHits.map((word) => (
            <span key={word} className="rounded bg-rose-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-rose-500 border border-rose-500/20">
              {word}
            </span>
          ))}
        </div>
      ) : (
        <div className="mt-2 text-[10px] text-emerald-500 font-semibold flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Inbox safe
        </div>
      )
    },
    {
      key: 'signals',
      icon: <MessageSquareText size={16} />,
      label: 'Signals',
      value: signalCount(analysis),
      helper: signalHelper(analysis),
      widget: (
        <div className="mt-2 flex flex-wrap gap-1">
          {['number', 'question', 'token', 'emoji'].map((signal) => {
            const isActive =
              (signal === 'number' && analysis.hasNumber) ||
              (signal === 'question' && analysis.hasQuestion) ||
              (signal === 'token' && analysis.hasPersonalization) ||
              (signal === 'emoji' && analysis.hasEmoji);
            return (
              <span key={signal} className={`rounded px-1.5 py-0.5 text-[9px] font-semibold border ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                  : 'bg-[var(--card-border)]/15 text-[var(--secondary-foreground)]/40 border-transparent'
              }`}>
                {signal}
              </span>
            );
          })}
        </div>
      )
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-2">
      {cards.map((card) => (
        <article
          key={card.key}
          className="flex min-h-[140px] flex-col justify-between rounded-xl border border-[var(--card-border)] bg-[var(--card)]/70 p-5 shadow-sm backdrop-blur-xl transition-all duration-200 hover:border-[var(--primary)]/30 hover:bg-[var(--card)]/80"
        >
          <div className="flex items-center justify-between gap-3">
            <span className="text-[var(--secondary-foreground)]/80">{card.icon}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--secondary-foreground)]">{card.label}</span>
          </div>
          <div className="mt-2">
            <p className="font-mono text-xl font-bold text-[var(--primary)] leading-tight">{card.value}</p>
            <p className="mt-0.5 truncate text-[10px] font-semibold text-[var(--secondary-foreground)]">{card.helper}</p>
          </div>
          {card.widget}
        </article>
      ))}
    </section>
  );
}

function idealRange(value, min, max) {
  if (value < min) return 'Short';
  if (value > max) return 'Trim';
  return 'Ideal';
}

function signalCount(analysis) {
  return [
    analysis.hasNumber,
    analysis.hasQuestion,
    analysis.hasPersonalization,
    analysis.hasEmoji,
  ].filter(Boolean).length;
}

function signalHelper(analysis) {
  const items = [];
  if (analysis.hasNumber) items.push('number');
  if (analysis.hasQuestion) items.push('question');
  if (analysis.hasPersonalization) items.push('token');
  if (analysis.hasEmoji) items.push('emoji');
  return items.length ? items.join(', ') : 'Neutral';
}
