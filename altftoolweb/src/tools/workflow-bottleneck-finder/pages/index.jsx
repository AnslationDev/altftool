"use client";

import { useMemo, useState } from "react";
import { Badge, Card } from "@altftool/ui";
import { Activity, TimerReset } from "lucide-react";

const sampleWorkflow = `Intake,12,18,4
Review,25,70,12
Approval,10,96,8
Implementation,120,24,18
QA handoff,45,50,14`;

function parseWorkflow(value) {
  return value
    .split(/\n+/)
    .map((line) => line.split(",").map((part) => part.trim()))
    .filter(([name, active, wait, rework]) => name && active && wait && rework)
    .map(([name, active, wait, rework]) => ({
      name,
      active: Number(active) || 0,
      wait: Number(wait) || 0,
      rework: Number(rework) || 0,
    }));
}

export default function WorkflowBottleneckFinderPage() {
  const [input, setInput] = useState(sampleWorkflow);
  const steps = useMemo(() => parseWorkflow(input), [input]);
  const enriched = useMemo(() => steps.map((step) => ({
    ...step,
    total: step.active + step.wait + step.rework,
    waitShare: step.active + step.wait + step.rework ? Math.round((step.wait / (step.active + step.wait + step.rework)) * 100) : 0,
  })), [steps]);
  const bottleneck = [...enriched].sort((left, right) => right.total - left.total)[0];
  const totalCycle = enriched.reduce((total, step) => total + step.total, 0);

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-4 p-4 text-(--foreground)">
      <section className="rounded-lg border border-(--border) bg-(--card) p-5 shadow-sm">
        <Badge tone="primary">Operations analysis</Badge>
        <h1 className="mt-3 text-2xl font-bold">Workflow Bottleneck Finder</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-(--muted-foreground)">
          Paste workflow steps with active, wait, and rework minutes to identify the step creating the most cycle-time drag.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.42fr_0.58fr]">
        <Card className="p-4">
          <label className="text-sm font-semibold" htmlFor="workflow-input">Step, active minutes, wait minutes, rework minutes</label>
          <textarea id="workflow-input" value={input} onChange={(event) => setInput(event.target.value)} className="mt-3 min-h-96 w-full rounded-lg border border-(--border) bg-(--background) p-3 font-mono text-sm outline-none focus:border-(--primary) focus:shadow-[var(--anslation-ds-focus-ring)]" />
        </Card>

        <div className="grid gap-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Card className="p-4"><p className="text-xs font-semibold uppercase text-(--muted-foreground)">Cycle time</p><p className="mt-2 text-3xl font-bold">{totalCycle}m</p></Card>
            <Card className="p-4"><p className="text-xs font-semibold uppercase text-(--muted-foreground)">Bottleneck</p><p className="mt-2 text-lg font-bold">{bottleneck?.name || "—"}</p></Card>
            <Card className="p-4"><p className="text-xs font-semibold uppercase text-(--muted-foreground)">Steps</p><p className="mt-2 text-3xl font-bold">{enriched.length}</p></Card>
          </div>

          <Card className="p-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold"><Activity className="h-5 w-5 text-(--primary)" /> Bottleneck map</h2>
            <div className="mt-4 space-y-3">
              {enriched.map((step) => (
                <div key={step.name} className="rounded-lg border border-(--border) bg-(--background) p-3">
                  <div className="flex justify-between gap-3 text-sm"><span className="font-semibold">{step.name}</span><span className="text-(--muted-foreground)">{step.total}m total</span></div>
                  <div className="mt-3 h-3 overflow-hidden rounded-full bg-(--muted)">
                    <div className="h-full rounded-full bg-(--primary)" style={{ width: `${totalCycle ? Math.max(5, (step.total / Math.max(...enriched.map((item) => item.total))) * 100) : 0}%` }} />
                  </div>
                  <p className="mt-2 text-xs text-(--muted-foreground)">Active {step.active}m · Wait {step.wait}m · Rework {step.rework}m · Wait share {step.waitShare}%</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}
