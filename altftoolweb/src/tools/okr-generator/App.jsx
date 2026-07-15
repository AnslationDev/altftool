"use client";

import React, { useMemo, useState } from "react";
import { CheckCircle2, Copy, Download, Rocket, Sparkles, Target, TrendingUp } from "lucide-react";

const timeframes = ["Quarterly (3 months)", "6 months", "Annual (12 months)", "30 days"];

const benefitCards = [
  {
    icon: Target,
    title: "Everyone pulls in the same direction",
    text: "OKRs connect individual work to company goals. When people see how their project supports a department objective, they make better prioritization decisions.",
  },
  {
    icon: TrendingUp,
    title: "Progress you can actually measure",
    text: 'Key results force you to define success with numbers. "Improve onboarding" becomes "Reduce time-to-first-value from 14 days to 5 days."',
  },
  {
    icon: Rocket,
    title: "Fewer goals, better results",
    text: "Limiting yourself to 2-3 objectives per cycle means saying no to good ideas so the team can say yes to the best ones.",
  },
  {
    icon: CheckCircle2,
    title: "Honest conversations about progress",
    text: "Weekly OKR check-ins surface problems early so teams can adjust course before the end of the quarter.",
  },
];

function buildOKRs({ department, mission, timeframe, challenges }) {
  const team = department.trim() || "Team";
  const purpose = mission.trim() || "improve execution and deliver measurable business value";
  const blockerText = challenges.trim() || "current delivery bottlenecks and customer feedback";

  return [
    {
      objective: `Improve ${team} impact on the highest-priority mission`,
      keyResults: [
        `Define and publish 3 priority outcomes tied to: ${purpose.slice(0, 90)}`,
        "Increase weekly progress visibility to 90% of active work items",
        "Complete at least 2 high-impact initiatives before the end of the cycle",
      ],
      initiatives: [
        "Run a planning workshop to choose the top outcomes",
        "Create a weekly OKR review dashboard",
        "Assign owners for each key result",
      ],
    },
    {
      objective: `Reduce the biggest blockers for ${team}`,
      keyResults: [
        `Resolve or materially improve 3 focus areas related to ${blockerText.slice(0, 80)}`,
        "Cut handoff or decision delays by 30%",
        "Document learnings and next actions in every weekly check-in",
      ],
      initiatives: [
        "Map the current workflow and identify friction points",
        "Create a blocker escalation path",
        "Review progress every Friday with owners",
      ],
    },
    {
      objective: `Build a stronger execution rhythm for the ${timeframe.toLowerCase()} cycle`,
      keyResults: [
        "Hold weekly OKR check-ins with clear confidence scores",
        "Keep at least 80% of key results updated with evidence",
        "End the cycle with a written review of wins, misses, and next bets",
      ],
      initiatives: [
        "Create a simple OKR tracking template",
        "Schedule recurring review time",
        "Capture decisions and changes in one shared place",
      ],
    },
  ];
}

function formatOKRs(okrs) {
  return okrs.map((okr, index) => `Objective ${index + 1}: ${okr.objective}
Key Results:
${okr.keyResults.map((item) => `- ${item}`).join("\n")}
Initiatives:
${okr.initiatives.map((item) => `- ${item}`).join("\n")}`).join("\n\n");
}

export default function OKRGeneratorApp() {
  const [form, setForm] = useState({
    department: "",
    mission: "",
    timeframe: "Quarterly (3 months)",
    challenges: "",
  });
  const [okrs, setOkrs] = useState([]);
  const [message, setMessage] = useState("");

  const output = useMemo(() => formatOKRs(okrs), [okrs]);

  function generateOKRs(event) {
    event.preventDefault();
    if (!form.department.trim() || !form.mission.trim()) {
      setMessage("Department or team and mission are required.");
      return;
    }
    setOkrs(buildOKRs(form));
    setMessage("OKRs generated. Review the objectives, key results, and initiatives.");
  }

  async function copyOKRs() {
    if (!output) return setMessage("Generate OKRs first.");
    await navigator.clipboard.writeText(output);
    setMessage("OKRs copied.");
  }

  function downloadOKRs() {
    if (!output) return setMessage("Generate OKRs first.");
    const blob = new Blob([output], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "okr-generator.txt";
    link.click();
    URL.revokeObjectURL(link.href);
    setMessage("OKRs downloaded.");
  }

  return (
    <div className="okr-generator min-h-screen overflow-x-hidden bg-(--background) px-4 py-8 font-secondary text-(--foreground)">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="mb-5 overflow-hidden bg-(--background) text-center text-(--primary)">
          <h1 className="heading mx-auto flex max-w-4xl items-center justify-center gap-2 break-words">
            <Sparkles className="hidden h-10 w-10 shrink-0 sm:block" />
            Free OKR Generator
          </h1>
          <p className="description mt-1 mb-1 text-(--secondary)">Create objectives with measurable key results and initiatives in seconds</p>
        </header>

        {message && <div className="rounded-xl border border-(--border) bg-(--card) px-4 py-3 text-sm font-bold text-(--primary)">{message}</div>}

        <main className="grid min-w-0 items-start gap-8 lg:grid-cols-[minmax(0,520px)_minmax(0,1fr)]">
          <div className="min-w-0 space-y-5">
            <section className="min-w-0 rounded-xl border border-(--border) bg-(--card) p-4 shadow-lg sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-(--muted) text-(--primary)">
                  <Target className="h-5 w-5" />
                </div>
                <h2 className="min-w-0 break-words text-xl font-black sm:text-2xl">Generate OKRs</h2>
              </div>
              <form onSubmit={generateOKRs} className="space-y-4">
                <Field label="Department or Team" value={form.department} onChange={(value) => setForm({ ...form, department: value })} placeholder="E.g., Engineering, Product, Marketing, Sales, Customer Success" />
                <Helper>The department or team these OKRs are for.</Helper>
                <Field label="Company or Team Mission" value={form.mission} onChange={(value) => setForm({ ...form, mission: value })} textarea placeholder="E.g., Help agile teams run better retrospectives and planning sessions. We're focused on growing our self-serve customer base..." />
                <Helper>Describe your company or team mission and current strategic priorities.</Helper>
                <Select label="Timeframe" value={form.timeframe} onChange={(value) => setForm({ ...form, timeframe: value })} options={timeframes} />
                <Helper>The time period these OKRs should cover.</Helper>
                <Field label="Key Challenges (Optional)" value={form.challenges} onChange={(value) => setForm({ ...form, challenges: value })} placeholder="E.g., We need to reduce churn, our onboarding is confusing, we're behind on mobile..." />
                <Helper>Mention specific challenges or focus areas to get more targeted OKRs.</Helper>
                <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-(--primary) px-4 py-3 text-sm font-black text-(--primary-foreground) shadow-md transition hover:bg-(--primary-hover)">
                  <Sparkles className="h-5 w-5" /> Generate OKRs
                </button>
              </form>
            </section>

            {!!okrs.length && <GeneratedOKRs okrs={okrs} onCopy={copyOKRs} onDownload={downloadOKRs} />}
          </div>

          <section className="min-w-0 rounded-xl border border-(--border) bg-(--card) shadow-lg">
            <div className="border-t border-(--border) p-6 text-center sm:p-8">
              <h2 className="break-words text-2xl font-black">Ready to Generate OKRs?</h2>
              <p className="mx-auto mt-5 max-w-3xl break-words text-lg leading-relaxed text-muted-foreground">
                Enter your department, company mission, and timeframe to get started. This tool will generate objectives with measurable key results and suggested initiatives.
              </p>
            </div>
          </section>
        </main>

        <section className="space-y-6">
          <h2 className="break-words text-3xl font-black">Why teams that use OKRs get more done</h2>
          <div className="grid min-w-0 gap-6 lg:grid-cols-2">
            {benefitCards.map(({ icon: Icon, title, text }) => (
              <div key={title} className="grid min-w-0 gap-4 rounded-xl border border-(--border) bg-(--card) p-6 shadow-md sm:grid-cols-[42px_minmax(0,1fr)] sm:p-8">
                <Icon className="h-8 w-8 text-(--primary)" />
                <div className="min-w-0">
                  <h3 className="break-words text-xl font-black">{title}</h3>
                  <p className="mt-4 break-words text-lg leading-relaxed text-muted-foreground">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      <style jsx global>{`
        .okr-generator * { min-width: 0; }
      `}</style>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, textarea = false }) {
  const base = "w-full rounded-xl border border-(--border) bg-(--background) px-3 py-2.5 text-sm text-(--foreground) outline-none transition placeholder:text-(--input-placeholder) focus:border-(--primary) focus:ring-2 focus:ring-(--primary)";
  return (
    <label className="block min-w-0">
      <span className="mb-1 block px-2 text-xs font-semibold text-muted-foreground sm:text-sm">{label}</span>
      {textarea ? <textarea className={`${base} min-h-24 resize-y`} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} /> : <input className={base} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />}
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1 block px-2 text-xs font-semibold text-muted-foreground sm:text-sm">{label}</span>
      <select className="w-full rounded-xl border border-(--border) bg-(--background) px-3 py-2.5 text-sm text-(--foreground) outline-none transition focus:border-(--primary) focus:ring-2 focus:ring-(--primary)" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

function Helper({ children }) {
  return <p className="-mt-2 break-words text-sm leading-relaxed text-muted-foreground">{children}</p>;
}

function GeneratedOKRs({ okrs, onCopy, onDownload }) {
  return (
    <section className="min-w-0 space-y-5 rounded-xl border border-(--border) bg-(--card) p-4 shadow-lg sm:p-5">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <h2 className="min-w-0 text-xl font-black leading-tight sm:text-2xl">Generated OKRs</h2>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <button onClick={onCopy} className="inline-flex min-w-0 items-center justify-center gap-2 rounded-xl border border-(--border) bg-(--background) px-3 py-2 text-sm font-bold hover:border-(--primary)"><Copy className="h-4 w-4 shrink-0" /><span className="truncate">Copy</span></button>
          <button onClick={onDownload} className="inline-flex min-w-0 items-center justify-center gap-2 rounded-xl border border-(--border) bg-(--background) px-3 py-2 text-sm font-bold hover:border-(--primary)"><Download className="h-4 w-4 shrink-0" /><span className="truncate">Export</span></button>
        </div>
      </div>
      {okrs.map((okr, index) => (
        <article key={okr.objective} className="w-full min-w-0 rounded-xl border border-(--border) bg-(--background) p-3 sm:p-4">
          <div className="text-xs font-black uppercase tracking-widest text-(--primary)">Objective {index + 1}</div>
          <h3 className="mt-2 whitespace-normal break-normal text-base font-black leading-snug sm:text-lg">{okr.objective}</h3>
          <div className="mt-4 grid min-w-0 gap-4">
            <OKRList title="Key Results" items={okr.keyResults} />
            <OKRList title="Initiatives" items={okr.initiatives} />
          </div>
        </article>
      ))}
    </section>
  );
}

function OKRList({ title, items }) {
  return (
    <div className="min-w-0">
      <div className="text-xs font-black uppercase tracking-widest text-muted-foreground sm:text-sm">{title}</div>
      <div className="mt-2 space-y-2">
        {items.map((item) => (
          <div key={item} className="flex min-w-0 gap-2 text-sm leading-relaxed text-muted-foreground">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-(--primary)" />
            <span className="min-w-0 whitespace-normal break-normal">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
