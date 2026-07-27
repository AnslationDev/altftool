/**
 * AI Project Scoping Worksheet — turns answers to the seven questions every ML/AI
 * project-scoping framework asks (problem, users, data, metric, baseline, target,
 * fallback) into a structured scoping document with a completeness score.
 *
 * The field set follows the widely taught ML project-scoping checklists
 * (e.g. Google's "People + AI" guidebook and Andrew Ng's ML project scoping steps:
 * define the problem, the metric, the baseline, and the fallback before modelling).
 */

/** Required fields; each unanswered one costs completeness. */
export const REQUIRED_FIELDS = [
  { id: "problem", label: "Problem statement", hint: "What specific pain, in whose workflow, measured how today?" },
  { id: "users", label: "Users & beneficiaries", hint: "Who uses the output, and who is affected by mistakes?" },
  { id: "dataSources", label: "Data sources", hint: "Which systems hold the data, who owns access, is it allowed to be used?" },
  { id: "successMetric", label: "Success metric", hint: "One primary measurable metric (time, cost, error rate, CSAT…)" },
  { id: "baseline", label: "Current baseline", hint: "Today's measured value of that metric, before AI" },
  { id: "target", label: "Target", hint: "The metric value that makes the project worth it" },
  { id: "fallback", label: "Fallback plan", hint: "What happens when the AI is wrong or unavailable — human path, rollback" },
];

/** Optional fields; they enrich the doc but do not affect the score. */
export const OPTIONAL_FIELDS = [
  { id: "constraints", label: "Constraints", hint: "Privacy, latency, budget, regulation, languages" },
  { id: "owner", label: "Accountable owner", hint: "One name, not a committee" },
];

/** Timeline sanity range: a scoping-stage estimate of 1-52 weeks. */
export const TIMELINE_MIN_WEEKS = 1;
export const TIMELINE_MAX_WEEKS = 52;

/** Verdict bands on the completeness percentage. */
export const VERDICTS = [
  { min: 100, label: "Ready to build", advice: "All seven scoping questions are answered — proceed to a scoped pilot." },
  { min: 70, label: "Nearly scoped", advice: "Close the remaining gaps before writing any code; they are the ones that kill projects late." },
  { min: 40, label: "Half scoped", advice: "The idea is forming, but do not commit budget until metric, baseline and fallback exist." },
  { min: 0, label: "Not scoped", advice: "This is an idea, not a project yet. Answer the problem and metric questions first." },
];

function clean(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

/**
 * Builds the scoping document and score.
 * `fields` maps field id -> text. `timelineWeeks` optional number.
 * Returns { doc, completenessPct, verdict, missing, answered } or { error }.
 */
export function buildScopingDoc({ projectName, fields = {}, timelineWeeks = "" }) {
  const name = clean(projectName);
  if (!name) return { error: "Give the project a name so the document has a title." };

  const timelineRaw = String(timelineWeeks ?? "").trim();
  let timeline = null;
  if (timelineRaw !== "") {
    const t = Number(timelineRaw);
    if (!Number.isFinite(t) || t < TIMELINE_MIN_WEEKS || t > TIMELINE_MAX_WEEKS) {
      return {
        error: `Timeline must be between ${TIMELINE_MIN_WEEKS} and ${TIMELINE_MAX_WEEKS} weeks (or left blank).`,
      };
    }
    timeline = t;
  }

  const answered = REQUIRED_FIELDS.filter((f) => clean(fields[f.id]) !== "");
  const missing = REQUIRED_FIELDS.filter((f) => clean(fields[f.id]) === "");
  const completenessPct = (answered.length / REQUIRED_FIELDS.length) * 100;
  const verdict = VERDICTS.find((v) => completenessPct >= v.min) ?? VERDICTS[VERDICTS.length - 1];

  const lines = [];
  lines.push(`# AI project scope — ${name}`);
  lines.push("");
  REQUIRED_FIELDS.forEach((f) => {
    const value = clean(fields[f.id]);
    lines.push(`## ${f.label}`);
    lines.push(value !== "" ? value : `_TBD — ${f.hint}_`);
    lines.push("");
  });
  OPTIONAL_FIELDS.forEach((f) => {
    const value = clean(fields[f.id]);
    if (value !== "") {
      lines.push(`## ${f.label}`);
      lines.push(value);
      lines.push("");
    }
  });
  if (timeline !== null) {
    lines.push("## Timeline");
    lines.push(`${timeline} week${timeline === 1 ? "" : "s"} to a go/no-go decision.`);
    lines.push("");
  }
  lines.push("## Scoping status");
  lines.push(
    `${answered.length}/${REQUIRED_FIELDS.length} core questions answered (${Math.round(completenessPct)}%) — ${verdict.label}. ${verdict.advice}`,
  );

  return {
    doc: lines.join("\n"),
    completenessPct,
    verdict,
    missing: missing.map((f) => f.label),
    answered: answered.length,
    requiredCount: REQUIRED_FIELDS.length,
    timeline,
  };
}
