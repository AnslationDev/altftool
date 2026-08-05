"use client";

import {
  CheckCircle2, AlertTriangle, Lightbulb, Camera, Sun, Palette, Ban,
  Eye, GraduationCap, Sparkles,
} from "lucide-react";
import { Badge } from "../ui/badge";

function List({ items, icon: Icon, tone }) {
  return (
    <ul className="space-y-1.5">
      {items.map((it, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-foreground/85">
          <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${tone}`} />
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}

function Tile({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-border bg-foreground/[0.02] p-3">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-primary" /> {label}
      </div>
      <div className="mt-1 text-sm font-medium text-foreground/90">{value}</div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mt-4">
      <div className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">{title}</div>
      {children}
    </div>
  );
}

export function ExplanationPanel({ ex }) {
  return (
    <div className="rounded-2xl border border-border bg-card/50 p-5">
      <div className="mb-4 flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-amber-400" />
        <h3 className="font-display text-sm font-semibold uppercase tracking-wider">Prompt Explanation</h3>
      </div>

      <div className="rounded-xl border border-primary/20 bg-primary/[0.06] p-4">
        <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-primary">
          <Sparkles className="h-3.5 w-3.5" /> Why this structure may help
        </div>
        <p className="text-sm leading-relaxed text-foreground/85">{ex.summary}</p>
      </div>

      <div className="mt-3 rounded-xl border border-border bg-foreground/[0.02] p-4">
        <div className="mb-1 text-xs font-semibold text-muted-foreground">How the checklist works</div>
        <p className="text-sm leading-relaxed text-foreground/80">{ex.scoreReason}</p>
      </div>

      <Section title="Strengths">
        <List items={ex.strengths} icon={CheckCircle2} tone="text-emerald-400" />
      </Section>

      <Section title="Weaknesses">
        <List items={ex.weaknesses} icon={AlertTriangle} tone="text-amber-400" />
      </Section>

      <Section title="Recommended Improvements">
        <List items={ex.improvements} icon={Lightbulb} tone="text-primary" />
      </Section>

      <Section title="Missing Keywords">
        <div className="flex flex-wrap gap-1.5">
          {ex.missingKeywords.map((k) => (
            <Badge key={k} variant="warning" className="font-normal">+ {k}</Badge>
          ))}
        </div>
      </Section>

      <Section title="Better Creative Direction">
        <div className="grid gap-2 sm:grid-cols-3">
          <Tile icon={Camera} label="Camera" value={ex.betterCamera} />
          <Tile icon={Sun} label="Lighting" value={ex.betterLighting} />
          <Tile icon={Palette} label="Color" value={ex.betterColor} />
        </div>
      </Section>

      <Section title="Negative Prompt Suggestions">
        <div className="flex flex-wrap gap-1.5">
          {ex.negativeSuggestions.map((k) => (
            <Badge key={k} variant="secondary" className="gap-1 font-normal text-rose-300">
              <Ban className="h-3 w-3" /> {k}
            </Badge>
          ))}
        </div>
      </Section>

      <Section title="Possible output direction">
        <p className="flex items-start gap-2 text-sm text-foreground/80">
          <Eye className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {ex.expectedOutput}
        </p>
      </Section>

      <div className="mt-4 flex items-center justify-between rounded-xl border border-border bg-foreground/[0.02] p-3">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <GraduationCap className="h-4 w-4" /> Prompt Complexity
        </span>
        <Badge variant="gradient">{ex.complexity}</Badge>
      </div>
    </div>
  );
}
