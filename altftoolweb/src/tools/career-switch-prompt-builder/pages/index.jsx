"use client";

import { useMemo, useState } from "react";
import { Copy, Route, RotateCcw } from "lucide-react";
import { EVIDENCE_TYPES, PLAN_FOCUS, buildCareerSwitchPrompt } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS = `${INPUT_CLASS} min-h-28 py-3`;
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [currentRole, setCurrentRole] = useState("Marketing executive");
  const [targetRole, setTargetRole] = useState("Product manager");
  const [currentSkills, setCurrentSkills] = useState("customer research, campaign analytics, stakeholder management, copywriting");
  const [targetSkills, setTargetSkills] = useState("roadmapping, customer research, analytics, prioritization, stakeholder management, product specs");
  const [focus, setFocus] = useState("skill-gap");
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildCareerSwitchPrompt({
        currentRole,
        targetRole,
        currentSkills,
        targetSkills,
        yearsExperience: 4,
        hoursPerWeek: 6,
        focus,
        evidence: EVIDENCE_TYPES.slice(0, 3),
      }),
    [currentRole, targetRole, currentSkills, targetSkills, focus],
  );

  const copyPrompt = async () => {
    if (!result.prompt) return;
    await navigator.clipboard.writeText(result.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Route className="h-4 w-4" aria-hidden="true" /> Career switch
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Career Switch Prompt Builder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">Compare skill overlap and generate a focused AI prompt for your transition plan.</p>
      </header>
      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold">Current role<input className={`mt-2 ${INPUT_CLASS}`} value={currentRole} onChange={(e) => setCurrentRole(e.target.value)} /></label>
          <label className="text-sm font-semibold">Target role<input className={`mt-2 ${INPUT_CLASS}`} value={targetRole} onChange={(e) => setTargetRole(e.target.value)} /></label>
        </div>
        <label className="mt-4 block text-sm font-semibold">Current skills<textarea className={`mt-2 ${AREA_CLASS}`} value={currentSkills} onChange={(e) => setCurrentSkills(e.target.value)} /></label>
        <label className="mt-4 block text-sm font-semibold">Target skills<textarea className={`mt-2 ${AREA_CLASS}`} value={targetSkills} onChange={(e) => setTargetSkills(e.target.value)} /></label>
        <label className="mt-4 block text-sm font-semibold">Plan focus
          <select className={`mt-2 ${INPUT_CLASS}`} value={focus} onChange={(e) => setFocus(e.target.value)}>
            {Object.entries(PLAN_FOCUS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
      </section>
      <section className="mt-5 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        {result.error ? <p role="alert" className="text-sm font-semibold text-[var(--danger)]">{result.error}</p> : (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <div><p className="text-xs uppercase text-[var(--muted-foreground)]">Overlap</p><p className="text-3xl font-semibold">{result.overlapPct}%</p></div>
              <div><p className="text-xs uppercase text-[var(--muted-foreground)]">Band</p><p className="text-lg font-semibold">{result.band.label}</p></div>
              <div><p className="text-xs uppercase text-[var(--muted-foreground)]">Learning time</p><p className="text-lg font-semibold">{result.learningWeeks} weeks</p></div>
            </div>
            <p className="mt-3 text-sm text-[var(--muted-foreground)]">Gaps: {result.gaps.join(", ") || "None"}</p>
            <textarea readOnly className={`mt-4 ${AREA_CLASS}`} rows={9} value={result.prompt} />
            <button type="button" className={`mt-3 ${PRIMARY_BTN}`} onClick={copyPrompt}><Copy className="h-4 w-4" /> {copied ? "Copied" : "Copy prompt"}</button>
          </>
        )}
        <button type="button" className={`mt-3 sm:ml-3 ${GHOST_BTN}`} onClick={() => { setCurrentRole("Marketing executive"); setTargetRole("Product manager"); setFocus("skill-gap"); }}>
          <RotateCcw className="h-4 w-4" /> Reset basics
        </button>
      </section>
    </main>
  );
}
