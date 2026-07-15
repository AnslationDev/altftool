"use client";

import React, { useMemo, useState } from "react";
import {
  CheckCircle2,
  ClipboardList,
  Copy,
  Download,
  Flag,
  Gauge,
  Lightbulb,
  ListChecks,
  RefreshCcw,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";

const focusTypes = ["Outcome", "Deliverable", "Learning", "Improvement"];
const sprintLengths = ["1 week", "2 weeks", "3 weeks", "4 weeks"];
const sampleBacklog =
  "Improve onboarding activation, fix checkout errors, add analytics events, reduce support tickets";

const benefits = [
  {
    icon: Target,
    title: "Maintain team focus",
    text: "A clear sprint goal gives the team one outcome to protect when priorities compete during the sprint.",
  },
  {
    icon: TrendingUp,
    title: "Measure progress effectively",
    text: "Measurable success signals make reviews easier because the team can compare intent with delivered value.",
  },
  {
    icon: ListChecks,
    title: "Choose the right work",
    text: "The generator turns backlog items into a coherent sprint theme instead of a loose task list.",
  },
  {
    icon: Lightbulb,
    title: "Improve sprint reviews",
    text: "Review prompts help the team explain customer value, tradeoffs, and what they learned.",
  },
];

function splitItems(value) {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 6);
}

function buildSprintPlan(form) {
  const team = form.team.trim() || "the team";
  const product = form.product.trim() || "the product";
  const outcome = form.outcome.trim() || "deliver visible customer value";
  const backlog = splitItems(form.backlog || sampleBacklog);
  const metric = form.metric.trim() || "review-ready progress and stakeholder feedback";
  const risk = form.risks.trim() || "scope growth, unclear acceptance criteria, or blocked dependencies";
  const focus = form.focusType.toLowerCase();

  return {
    goal: `By the end of this ${form.sprintLength} sprint, ${team} will ${outcome} for ${product} by completing the highest-value ${focus} work and proving progress with ${metric}.`,
    successSignals: [
      `Primary outcome is demonstrable in sprint review for ${product}.`,
      `${metric} is captured with enough evidence for a go/no-go decision.`,
      "Remaining work is clearly separated from completed sprint scope.",
    ],
    scope: backlog.length
      ? backlog.map((item) => `Include: ${item}`)
      : ["Include the smallest backlog slice that proves the sprint outcome."],
    risks: [
      `Watch for ${risk}.`,
      "Keep nice-to-have work outside the sprint goal unless capacity is confirmed.",
      "Reconfirm acceptance criteria before development starts.",
    ],
    reviewPrompts: [
      "What changed for users or stakeholders because of this sprint?",
      "Which metric or evidence proves that the sprint goal was met?",
      "What should carry into the next sprint, and what should stop?",
    ],
  };
}

function formatPlan(plan) {
  if (!plan) return "";
  return `Sprint Goal:
${plan.goal}

Success Signals:
${plan.successSignals.map((item) => `- ${item}`).join("\n")}

Scope:
${plan.scope.map((item) => `- ${item}`).join("\n")}

Risks:
${plan.risks.map((item) => `- ${item}`).join("\n")}

Sprint Review Prompts:
${plan.reviewPrompts.map((item) => `- ${item}`).join("\n")}`;
}

export default function SprintGoalGeneratorApp() {
  const [form, setForm] = useState({
    team: "",
    product: "",
    outcome: "",
    backlog: "",
    metric: "",
    risks: "",
    focusType: "Outcome",
    sprintLength: "2 weeks",
  });
  const [plan, setPlan] = useState(null);
  const [message, setMessage] = useState("");

  const output = useMemo(() => formatPlan(plan), [plan]);

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function generatePlan(event) {
    event.preventDefault();
    if (!form.team.trim() || !form.product.trim() || !form.outcome.trim()) {
      setMessage("Team, product, and sprint outcome are required.");
      return;
    }
    setPlan(buildSprintPlan(form));
    setMessage("Sprint goal generated. Review scope, success signals, and risks.");
  }

  function resetForm() {
    setForm({
      team: "",
      product: "",
      outcome: "",
      backlog: "",
      metric: "",
      risks: "",
      focusType: "Outcome",
      sprintLength: "2 weeks",
    });
    setPlan(null);
    setMessage("");
  }

  async function copyPlan() {
    if (!output) return setMessage("Generate a sprint goal first.");
    await navigator.clipboard.writeText(output);
    setMessage("Sprint goal copied.");
  }

  function downloadPlan() {
    if (!output) return setMessage("Generate a sprint goal first.");
    const blob = new Blob([output], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "sprint-goal-generator.txt";
    link.click();
    URL.revokeObjectURL(link.href);
    setMessage("Sprint goal downloaded.");
  }

  return (
    <div className="sprint-goal-generator min-h-screen overflow-x-hidden bg-(--background) py-8 font-secondary text-(--foreground)">
      <div className="section-container space-y-8 px-4 sm:px-6">
        <header className="section-header mb-5">
          <div className="mx-auto mb-3 flex w-fit items-center justify-center gap-3 text-(--primary)">
            <Flag className="h-8 w-8 shrink-0" />
            <h1 className="section-title mb-0 text-(--primary)">Free Sprint Goal Generator</h1>
          </div>
          <p className="section-subtitle mx-auto mb-0">
            Create focused sprint goals with measurable outcomes, scope notes, risks, and review prompts
          </p>
        </header>

        {message && (
          <div className="rounded-lg border border-(--border) bg-(--card) px-4 py-3 text-sm font-bold text-(--primary)">
            {message}
          </div>
        )}

        <main className="w-full min-w-0">
          <section className="w-full min-w-0 max-w-[440px] rounded-lg border border-(--border) bg-(--card) p-4 shadow-lg sm:p-5">
            <div className="mb-4 flex min-w-0 items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-(--muted) text-(--primary)">
                <Sparkles className="h-4 w-4" />
              </div>
              <h2 className="subheading min-w-0 break-words">Generate Sprint Goal</h2>
            </div>

            <form onSubmit={generatePlan} className="space-y-3">
              <Field label="Team" value={form.team} onChange={(value) => updateField("team", value)} placeholder="E.g., Growth squad" />
              <Field label="Product or Area" value={form.product} onChange={(value) => updateField("product", value)} placeholder="E.g., onboarding flow" />
              <Field label="Sprint Outcome" value={form.outcome} onChange={(value) => updateField("outcome", value)} placeholder="E.g., increase trial activation by reducing setup friction" textarea />
              <div className="grid min-w-0 gap-3 sm:grid-cols-2">
                <Select label="Focus Type" value={form.focusType} onChange={(value) => updateField("focusType", value)} options={focusTypes} />
                <Select label="Sprint Length" value={form.sprintLength} onChange={(value) => updateField("sprintLength", value)} options={sprintLengths} />
              </div>
              <Field label="Backlog Items" value={form.backlog} onChange={(value) => updateField("backlog", value)} placeholder={sampleBacklog} textarea />
              <Field label="Success Metric" value={form.metric} onChange={(value) => updateField("metric", value)} placeholder="E.g., activation rate, escaped defects, support ticket volume" />
              <Field label="Risks or Dependencies" value={form.risks} onChange={(value) => updateField("risks", value)} placeholder="E.g., API dependency, design review, QA capacity" />
              <div className="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                <button className="inline-flex min-w-0 items-center justify-center gap-2 rounded-lg bg-(--primary) px-4 py-2.5 text-sm font-black text-(--primary-foreground) shadow-md transition hover:bg-(--primary-hover)">
                  <Sparkles className="h-4 w-4 shrink-0" />
                  <span className="truncate">Generate Sprint Goal</span>
                </button>
                <button type="button" onClick={resetForm} className="inline-flex min-w-0 items-center justify-center gap-2 rounded-lg border border-(--border) bg-(--background) px-4 py-2.5 text-sm font-bold text-(--foreground) transition hover:border-(--primary)">
                  <RefreshCcw className="h-4 w-4 shrink-0" />
                  <span className="truncate">Reset</span>
                </button>
              </div>
            </form>
          </section>
        </main>

        <section className="min-w-0 rounded-lg border border-(--border) bg-(--card) p-4 shadow-lg sm:p-6">
            <div className="flex min-w-0 flex-col gap-3">
              <div className="min-w-0">
                <div className="text-xs font-black uppercase tracking-widest text-(--primary)">Sprint Goal</div>
                <h2 className="mt-1 whitespace-normal text-xl font-black leading-tight sm:text-2xl">Generated Plan</h2>
              </div>
              <div className="grid w-full min-w-0 grid-cols-2 gap-2">
                <IconButton onClick={copyPlan} icon={Copy} label="Copy" />
                <IconButton onClick={downloadPlan} icon={Download} label="Export" />
              </div>
            </div>

            {plan ? (
              <div className="mt-5 w-full min-w-0 max-w-full space-y-4">
                <article className="w-full min-w-0 max-w-full rounded-lg border border-(--border) bg-(--background) p-4">
                  <div className="flex min-w-0 gap-3">
                    <Flag className="mt-1 h-5 w-5 shrink-0 text-(--primary)" />
                    <p className="min-w-0 whitespace-normal break-words text-base font-bold leading-7">{plan.goal}</p>
                  </div>
                </article>
                <ResultGroup icon={Gauge} title="Success Signals" items={plan.successSignals} />
                <ResultGroup icon={ClipboardList} title="Scope" items={plan.scope} />
                <ResultGroup icon={Target} title="Risks" items={plan.risks} />
                <ResultGroup icon={CheckCircle2} title="Review Prompts" items={plan.reviewPrompts} />
              </div>
            ) : (
              <div className="mt-5 w-full min-w-0 rounded-lg border border-dashed border-(--border) bg-(--background) p-8 text-center">
                <p className="description mx-auto max-w-xl whitespace-normal break-words">
                  Fill in the sprint context to generate a focused goal with success signals, scope boundaries, risks, and review prompts.
                </p>
              </div>
            )}
        </section>

        <section className="space-y-5">
          <div className="section-header">
            <h2 className="section-title">Benefits of Using AI-Generated Sprint Goals</h2>
          </div>
          <div className="grid min-w-0 gap-4 md:grid-cols-2">
            {benefits.map(({ icon: Icon, title, text }) => (
              <article key={title} className="grid min-h-[168px] min-w-0 gap-3 rounded-lg border border-(--border) bg-(--card) p-4 shadow-md sm:grid-cols-[36px_minmax(0,1fr)] sm:p-5">
                <Icon className="h-7 w-7 text-(--primary)" />
                <div className="min-w-0">
                  <h3 className="break-words text-lg font-black leading-snug text-(--foreground)">{title}</h3>
                  <p className="mt-3 break-words text-sm leading-6 text-(--muted-foreground) sm:text-base">{text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
      <style jsx global>{`
        .sprint-goal-generator * {
          min-width: 0;
        }
      `}</style>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, textarea = false }) {
  const classes =
    "w-full rounded-lg border border-(--border) bg-(--background) px-3 py-2 text-sm text-(--foreground) outline-none transition placeholder:text-(--input-placeholder) focus:border-(--primary) focus:ring-2 focus:ring-(--primary)";

  return (
    <label className="block min-w-0">
      <span className="mb-1 block px-2 text-xs font-bold uppercase tracking-wider text-(--muted-foreground)">{label}</span>
      {textarea ? (
        <textarea className={`${classes} min-h-20 resize-y`} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
      ) : (
        <input className={classes} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
      )}
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1 block px-2 text-xs font-bold uppercase tracking-wider text-(--muted-foreground)">{label}</span>
      <select className="w-full rounded-lg border border-(--border) bg-(--background) px-3 py-2 text-sm text-(--foreground) outline-none transition focus:border-(--primary) focus:ring-2 focus:ring-(--primary)" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function IconButton({ icon: Icon, label, onClick }) {
  return (
    <button onClick={onClick} className="inline-flex min-w-0 items-center justify-center gap-2 rounded-lg border border-(--border) bg-(--background) px-3 py-2 text-sm font-bold transition hover:border-(--primary)">
      <Icon className="h-4 w-4 shrink-0" />
      <span className="min-w-0 whitespace-nowrap">{label}</span>
    </button>
  );
}

function ResultGroup({ icon: Icon, title, items }) {
  return (
    <article className="w-full min-w-0 max-w-full rounded-lg border border-(--border) bg-(--background) p-4">
      <div className="mb-3 flex min-w-0 items-center gap-2">
        <Icon className="h-5 w-5 shrink-0 text-(--primary)" />
        <h3 className="break-words text-base font-black">{title}</h3>
      </div>
      <div className="w-full min-w-0 space-y-2">
        {items.map((item) => (
          <div key={item} className="flex min-w-0 gap-2 text-sm leading-6 text-(--muted-foreground)">
            <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-(--primary)" />
            <span className="min-w-0 whitespace-normal break-words">{item}</span>
          </div>
        ))}
      </div>
    </article>
  );
}
