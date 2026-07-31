"use client";

import React from 'react';
import { RotateCcw, User, Mail, FileText, Eye } from 'lucide-react';
import { DEFAULT_EMAIL } from '../utils/subjectLine';

export default function EditorPanel({ email, onChange, onReset }) {
  return (
    <section className="rounded-xl border border-[var(--card-border)] bg-[var(--card)]/70 p-5 shadow-lg backdrop-blur-xl transition-all duration-200">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-[var(--primary)]">
          Subject Builder
        </h2>
        <button
          type="button"
          onClick={() => onReset(DEFAULT_EMAIL)}
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--secondary-border)] bg-[var(--secondary-bg)] px-3 py-1.5 text-xs font-semibold text-[var(--secondary-foreground)] hover:bg-[var(--secondary-hover)] transition-all duration-200 active:scale-95"
        >
          <RotateCcw size={14} />
          Sample Data
        </button>
      </div>

      <div className="grid gap-4">
        <Field label="Sender name" id="email-subject-previewer-sender">
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--secondary-foreground)]/50" size={16} />
            <input
              id="email-subject-previewer-sender"
              value={email.sender}
              onChange={(event) => onChange('sender', event.target.value)}
              className="w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] pl-10 pr-4 py-2.5 text-sm text-[var(--foreground)] outline-none transition-all duration-200 focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10"
              placeholder="Brand or sender"
            />
          </div>
        </Field>

        <Field label="Recipient inbox" id="email-subject-previewer-inbox">
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--secondary-foreground)]/50" size={16} />
            <input
              id="email-subject-previewer-inbox"
              value={email.inbox}
              onChange={(event) => onChange('inbox', event.target.value)}
              className="w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] pl-10 pr-4 py-2.5 text-sm text-[var(--foreground)] outline-none transition-all duration-200 focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10"
              placeholder="customer@example.com"
            />
          </div>
        </Field>

        <Field
          label="Subject line"
          id="email-subject-previewer-subject"
          extra={
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${email.subject.length > 60 || email.subject.length < 20 ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>
              {email.subject.length} chars (ideal: 30-55)
            </span>
          }
        >
          <div className="relative">
            <FileText className="absolute left-3.5 top-3 text-[var(--secondary-foreground)]/50" size={16} />
            <textarea
              id="email-subject-previewer-subject"
              value={email.subject}
              onChange={(event) => onChange('subject', event.target.value)}
              className="min-h-[100px] w-full resize-y rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] pl-10 pr-4 py-2.5 text-sm leading-6 text-[var(--foreground)] outline-none transition-all duration-200 focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10"
              placeholder="Write the email subject line..."
            />
          </div>
        </Field>

        <Field
          label="Preview text"
          id="email-subject-previewer-preview"
          extra={
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${email.preview.length > 95 || email.preview.length < 40 ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>
              {email.preview.length} chars (ideal: 40-95)
            </span>
          }
        >
          <div className="relative">
            <Eye className="absolute left-3.5 top-3 text-[var(--secondary-foreground)]/50" size={16} />
            <textarea
              id="email-subject-previewer-preview"
              value={email.preview}
              onChange={(event) => onChange('preview', event.target.value)}
              className="min-h-[100px] w-full resize-y rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] pl-10 pr-4 py-2.5 text-sm leading-6 text-[var(--foreground)] outline-none transition-all duration-200 focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10"
              placeholder="Write the preheader or preview text..."
            />
          </div>
        </Field>
      </div>
    </section>
  );
}

function Field({ label, id, extra, children }) {
  return (
    <div className="block">
      <div className="mb-2 flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-xs font-bold uppercase tracking-wider text-[var(--secondary-foreground)]">
          {label}
        </label>
        {extra}
      </div>
      {children}
    </div>
  );
}
