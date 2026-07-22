"use client";

import React, { useMemo, useState } from 'react';
import { Mail, Eye, BarChart2, Wand2 } from 'lucide-react';
import EditorPanel from '../components/EditorPanel';
import PreviewGrid from '../components/PreviewGrid';
import ScoreCards from '../components/ScoreCards';
import SummaryBar from '../components/SummaryBar';
import VariantPanel from '../components/VariantPanel';
import WorkflowCards from '../components/WorkflowCards';
import { DEFAULT_EMAIL, analyzeSubject } from '../utils/subjectLine';

export default function ToolHome() {
  const [email, setEmail] = useState(DEFAULT_EMAIL);
  const analysis = useMemo(() => analyzeSubject(email.subject, email.preview), [email.subject, email.preview]);

  const updateEmail = (field, value) => {
    setEmail((current) => ({ ...current, [field]: value }));
  };

  const useVariant = (subject) => {
    setEmail((current) => ({ ...current, subject }));
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto space-y-6">

        {/* Header Card */}
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm group">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-soft text-primary group-hover:bg-primary/10 transition-colors duration-300">
                <Mail className="h-5 w-5 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground leading-none">Email Subject Line Previewer</h1>
                  <span className="inline-flex rounded-md border border-border bg-background px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Marketing</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed">
                  Preview, score, and optimise your email subject lines across all major email clients.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold text-muted-foreground shrink-0 self-start md:self-auto">
              {["Live Preview", "Score Analysis", "AI Variants"].map((item) => (
                <span key={item} className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1">
                  <Eye className="h-3 w-3 text-primary" />{item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl space-y-4">
          <SummaryBar analysis={analysis} />

          <EditorPanel
            email={email}
            onChange={updateEmail}
            onReset={setEmail}
          />

          <PreviewGrid email={email} />

          <div className="grid gap-4 xl:grid-cols-[minmax(0,0.88fr)_minmax(380px,1.12fr)]">
            <ScoreCards analysis={analysis} />
            <VariantPanel
              subject={email.subject}
              preview={email.preview}
              onUseVariant={useVariant}
            />
          </div>

          <WorkflowCards />
        </div>
      </div>
    </div>
  );
}
