"use client";

import { useMemo, useState } from "react";
import { Badge, Card } from "@altftool/ui";
import { ArrowDown, TrendingDown } from "lucide-react";

const sampleSteps = `Landing details,10000,86
Account fields,8600,72
Business info,6192,58
Payment intent,3591,61
Final consent,2190,88`;

function parseSteps(value) {
  return value
    .split(/\n+/)
    .map((line) => line.split(",").map((part) => part.trim()))
    .filter(([name, visitors, completion]) => name && visitors && completion)
    .map(([name, visitors, completion]) => ({
      name,
      visitors: Number(visitors) || 0,
      completion: Math.max(0, Math.min(100, Number(completion) || 0)),
    }));
}

export default function FormAbandonmentSimulatorPage() {
  const [stepsText, setStepsText] = useState(sampleSteps);
  const steps = useMemo(() => parseSteps(stepsText), [stepsText]);
  const modeled = useMemo(() => {
    let currentVisitors = steps[0]?.visitors || 0;
    return steps.map((step) => {
      const entered = currentVisitors || step.visitors;
      const completed = Math.round(entered * (step.completion / 100));
      const dropped = Math.max(0, entered - completed);
      currentVisitors = completed;
      return { ...step, entered, completed, dropped };
    });
  }, [steps]);
  const firstVisitors = modeled[0]?.entered || 0;
  const finalCompletions = modeled.at(-1)?.completed || 0;
  const conversion = firstVisitors ? Math.round((finalCompletions / firstVisitors) * 100) : 0;
  const bottleneck = [...modeled].sort((left, right) => right.dropped - left.dropped)[0];

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-4 p-4 text-(--foreground)">
      <section className="rounded-lg border border-(--border) bg-(--card) p-5 shadow-sm">
        <Badge tone="primary">Conversion modelling</Badge>
        <h1 className="mt-3 text-2xl font-bold">Form Abandonment Simulator</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-(--muted-foreground)">
          Paste step names, visitors, and completion rates to simulate form drop-off and spot where users are leaking out.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.42fr_0.58fr]">
        <Card className="p-4">
          <label className="text-sm font-semibold" htmlFor="form-steps">Steps: name, visitors, completion %</label>
          <textarea id="form-steps" value={stepsText} onChange={(event) => setStepsText(event.target.value)} className="mt-3 min-h-80 w-full rounded-lg border border-(--border) bg-(--background) p-3 font-mono text-sm outline-none focus:border-(--primary) focus:shadow-[var(--anslation-ds-focus-ring)]" />
        </Card>

        <div className="grid gap-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Card className="p-4"><p className="text-xs font-semibold uppercase text-(--muted-foreground)">Conversion</p><p className="mt-2 text-3xl font-bold">{conversion}%</p></Card>
            <Card className="p-4"><p className="text-xs font-semibold uppercase text-(--muted-foreground)">Completions</p><p className="mt-2 text-3xl font-bold">{finalCompletions.toLocaleString()}</p></Card>
            <Card className="p-4"><p className="text-xs font-semibold uppercase text-(--muted-foreground)">Biggest leak</p><p className="mt-2 text-lg font-bold">{bottleneck?.name || "None"}</p></Card>
          </div>

          <Card className="p-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold"><TrendingDown className="h-5 w-5 text-(--primary)" /> Step funnel</h2>
            <div className="mt-4 space-y-3">
              {modeled.map((step) => (
                <div key={step.name} className="rounded-lg border border-(--border) bg-(--background) p-3">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-semibold">{step.name}</span>
                    <span className="text-(--muted-foreground)">{step.completion}% complete</span>
                  </div>
                  <div className="mt-3 h-3 overflow-hidden rounded-full bg-(--muted)">
                    <div className="h-full rounded-full bg-(--primary)" style={{ width: `${step.completion}%` }} />
                  </div>
                  <p className="mt-2 text-xs text-(--muted-foreground)">{step.entered.toLocaleString()} entered · {step.dropped.toLocaleString()} dropped · {step.completed.toLocaleString()} continued</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}
