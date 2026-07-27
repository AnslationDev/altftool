"use client";

import { useMemo, useState } from "react";
import { Briefcase, Check, Copy, RotateCcw } from "lucide-react";

import { analyzeJobDescription, scoreMatch } from "../lib";

const DEFAULT_JD = `About the role
We are hiring a Senior Frontend Engineer with 5-8 years of experience to own our customer dashboard.

Responsibilities
- Build and ship features in React, Next.js and TypeScript
- Design REST APIs with the Node.js platform team
- Keep our CI/CD pipeline green and deploys boring

Requirements
- Strong JavaScript, TypeScript and CSS fundamentals
- Experience with testing (Jest, Playwright) and Git workflows
- Comfortable with AWS and Docker
- A competitive, self-reliant rockstar who thrives under pressure

Location: Hybrid, Bengaluru (3 days on-site).
Salary: 28-40 LPA CTC depending on experience.
Benefits: health insurance for family, paid leave, learning budget.

About us
We build billing software for Indian SaaS companies.

Hiring process
Screen, technical round, system design, culture round. How to apply: send your CV.

We are an equal opportunity employer and hire regardless of gender, caste or background.`;

const DEFAULT_SKILLS = "React, TypeScript, JavaScript, CSS, Git, Testing, Docker";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-sm leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD = "rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]";
const DASH = "—";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const num = (value) => (Number.isFinite(value) ? NUM.format(value) : DASH);
const pct = (value) => (Number.isFinite(value) ? `${NUM.format(value)}%` : DASH);

const SEVERITY_STYLE = {
  high: "text-[var(--danger)]",
  medium: "text-[var(--foreground)]",
  low: "text-[var(--muted-foreground)]",
};

export default function ToolHome() {
  const [jdText, setJdText] = useState(DEFAULT_JD);
  const [candidateSkills, setCandidateSkills] = useState(DEFAULT_SKILLS);
  const [copied, setCopied] = useState(false);

  const analysis = useMemo(() => analyzeJobDescription({ jdText }), [jdText]);
  const match = useMemo(
    () => scoreMatch({ jdText, candidateSkills }),
    [jdText, candidateSkills],
  );

  const hasError = Boolean(analysis.error);
  const matchError = Boolean(match.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Job description analysis",
      `Quality score: ${analysis.score}/100 (${analysis.grade})`,
      `Words: ${analysis.reading.words} | Reading ease: ${num(analysis.reading.readingEase)} (${analysis.reading.band}) | Grade level: ${num(analysis.reading.gradeLevel)}`,
      `Seniority: ${analysis.seniority.level}${analysis.seniority.years !== null ? ` (${analysis.seniority.years}+ years)` : ""}`,
      `Skills found (${analysis.skills.length}): ${analysis.skills.map((s) => s.name).join(", ") || "none"}`,
      `Missing sections: ${analysis.sections.missing.join(", ") || "none"}`,
      `Masculine-coded words: ${analysis.gendered.masculine.map((h) => h.word).join(", ") || "none"}`,
    ];
    if (!matchError) {
      lines.push(
        `Candidate match: ${num(match.percent)}% (${match.matchedCount}/${match.jdSkillCount} skills) — ${match.verdict}`,
        `Gaps: ${match.missing.map((s) => s.name).join(", ") || "none"}`,
      );
    }
    lines.push("", "Rewrite suggestions:");
    for (const item of analysis.suggestions) lines.push(`- [${item.severity}] ${item.text}`);
    return lines.join("\n");
  }, [analysis, hasError, match, matchError]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setJdText(DEFAULT_JD);
    setCandidateSkills(DEFAULT_SKILLS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Briefcase className="h-4 w-4" aria-hidden="true" />
          JD analyser
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">AI JD Analyzer</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste a job description to pull out the named skills, the seniority band, the Flesch
          reading scores and any gendered wording — then score your own skills against it. Everything
          runs in your browser; nothing is uploaded.
        </p>
      </header>

      <section className={CARD}>
        <label className={LABEL_CLASS} htmlFor="jd-text">
          Job description
        </label>
        <textarea
          id="jd-text"
          rows={12}
          className={`mt-2 ${TEXTAREA_CLASS}`}
          value={jdText}
          onChange={(event) => setJdText(event.target.value)}
          placeholder="Paste the full job post here…"
        />
        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="candidate-skills">
            Your skills (comma separated)
          </label>
          <input
            id="candidate-skills"
            className={`mt-2 ${INPUT_CLASS}`}
            type="text"
            value={candidateSkills}
            onChange={(event) => setCandidateSkills(event.target.value)}
            placeholder="React, Python, AWS…"
          />
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {analysis.error}
        </p>
      )}

      <section className={`mt-6 ${CARD}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Job description quality score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${analysis.score}/100`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Paste a longer job description to see a result." : analysis.grade}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the full job description analysis to clipboard"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the job description and skills"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Words", hasError ? DASH : num(analysis.reading.words)],
            [
              "Flesch reading ease",
              hasError ? DASH : `${num(analysis.reading.readingEase)} (${analysis.reading.band})`,
            ],
            ["Flesch–Kincaid grade level", hasError ? DASH : num(analysis.reading.gradeLevel)],
            ["Average words per sentence", hasError ? DASH : num(analysis.reading.wordsPerSentence)],
            [
              "Seniority",
              hasError
                ? DASH
                : `${analysis.seniority.level}${analysis.seniority.years !== null ? ` · ${analysis.seniority.years}+ yrs` : ""}`,
            ],
            ["Skills named", hasError ? DASH : num(analysis.skills.length)],
            [
              "Sections missing",
              hasError
                ? DASH
                : analysis.sections.missing.length === 0
                  ? "None"
                  : analysis.sections.missing.join(", "),
            ],
            [
              "Masculine-coded words",
              hasError ? DASH : num(analysis.masculineHits),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={`mt-6 ${CARD}`}>
        <h2 className="text-base font-semibold">Your match against this job</h2>
        {matchError ? (
          <p
            role="alert"
            className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {match.error}
          </p>
        ) : null}
        <p className="mt-3 text-4xl font-semibold text-[var(--primary)]">
          {matchError ? DASH : pct(match.percent)}
        </p>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {matchError
            ? "Add your skills above to score the fit."
            : `${match.matchedCount} of ${match.jdSkillCount} named skills — ${match.verdict}`}
        </p>
        {!matchError && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
                You have
              </h3>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {match.matched.length === 0 ? (
                  <li className="text-sm text-[var(--muted-foreground)]">None yet</li>
                ) : (
                  match.matched.map((skill) => (
                    <li
                      key={skill.name}
                      className="rounded-full bg-[var(--muted)] px-2.5 py-1 text-xs font-semibold text-[var(--success)]"
                    >
                      {skill.name}
                    </li>
                  ))
                )}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
                Gaps to close
              </h3>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {match.missing.length === 0 ? (
                  <li className="text-sm text-[var(--muted-foreground)]">Nothing missing</li>
                ) : (
                  match.missing.map((skill) => (
                    <li
                      key={skill.name}
                      className="rounded-full bg-[var(--muted)] px-2.5 py-1 text-xs font-semibold text-[var(--danger)]"
                    >
                      {skill.name}
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        )}
      </section>

      {!hasError && analysis.skillGroups.length > 0 && (
        <section className={`mt-6 ${CARD}`}>
          <h2 className="text-base font-semibold">Skills found in the post</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Group
                  </th>
                  <th scope="col" className="py-2 font-semibold">
                    Skills (mentions)
                  </th>
                </tr>
              </thead>
              <tbody>
                {analysis.skillGroups.map((group) => (
                  <tr key={group.group} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 align-top font-semibold">{group.group}</td>
                    <td className="py-2 text-[var(--muted-foreground)]">
                      {group.items.map((item) => `${item.name} (${item.mentions})`).join(", ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {!hasError && analysis.suggestions.length > 0 && (
        <section className={`mt-6 ${CARD}`}>
          <h2 className="text-base font-semibold">Rewrite suggestions</h2>
          <ol className="mt-3 space-y-2 text-sm">
            {analysis.suggestions.map((item) => (
              <li key={item.id} className="flex gap-2">
                <span
                  className={`shrink-0 text-xs font-semibold tracking-wide uppercase ${SEVERITY_STYLE[item.severity]}`}
                >
                  {item.severity}
                </span>
                <span className="leading-6">{item.text}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Skill extraction is dictionary-based, so a tool that is not in the library will not be
        listed. The gendered-wording check uses the published Gaucher, Friesen &amp; Kay (2011) word
        stems and flags wording, not intent. This is a writing aid, not employment or legal advice.
      </p>
    </main>
  );
}
