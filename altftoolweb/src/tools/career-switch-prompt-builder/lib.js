/**
 * Career Switch Prompt Builder — pure logic.
 *
 * Does two things:
 *  1. A real set comparison between the skills you already have and the skills a
 *     target role advertises, producing an overlap score and an explicit gap list.
 *  2. Deterministic assembly of an AI prompt that feeds that analysis to a model.
 *
 * No React, no DOM, no clocks.
 */

/** OpenAI's published rule of thumb for English: ~4 characters per token. */
export const CHARS_PER_TOKEN = 4;

/**
 * Planning assumption, exposed as an input so the user owns it: hours of
 * deliberate practice budgeted per missing skill before it is interview-ready.
 * The default of 40 h is one full-time working week per skill — a planning
 * figure, not a research finding.
 */
export const DEFAULT_HOURS_PER_SKILL = 40;
export const MAX_HOURS_PER_SKILL = 400;
export const MAX_HOURS_PER_WEEK = 80;
export const MAX_YEARS_EXPERIENCE = 60;
/** Guard against a pasted CV blowing up the prompt. */
export const MAX_SKILLS = 60;

/** Overlap bands used to label how far the switch really is. */
export const READINESS_BANDS = [
  { min: 80, label: "Adjacent move", note: "You already cover most of the requirement list — this reads as a sideways step, not a switch." },
  { min: 55, label: "Stretch move", note: "A credible switch with a focused gap-closing plan and one bridging project." },
  { min: 30, label: "Bridge move", note: "You will need an intermediate role or a substantial portfolio to be taken seriously." },
  { min: 0, label: "Rebuild", note: "Little overlap on paper — plan for retraining, and lead with outcomes rather than job titles." },
];

/** Angles the prompt can be pointed at. */
export const PLAN_FOCUS = {
  "skill-gap": "Prioritise the gap list: what to learn, in what order, and how to prove each one.",
  "resume-rewrite": "Prioritise rewriting my experience so a recruiter for the target role recognises it in six seconds.",
  "interview-story": "Prioritise the narrative: why the switch, why now, and how to answer the 'you have never done this' objection.",
  "network-outreach": "Prioritise outreach: who to contact, what to ask, and the exact messages to send.",
};

/** Evidence types the model should suggest for each gap. */
export const EVIDENCE_TYPES = [
  "Portfolio project",
  "Certification",
  "Internal transfer or secondment",
  "Freelance or contract work",
  "Open-source contribution",
  "Volunteering",
];

function clean(text) {
  return String(text ?? "").trim();
}

/** Split a comma or newline separated list into trimmed, de-duplicated entries. */
export function parseSkills(raw) {
  const seen = new Set();
  const out = [];
  for (const piece of String(raw ?? "").split(/[,\n;]+/)) {
    const value = piece.trim().replace(/\s+/g, " ");
    if (!value) continue;
    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(value);
    if (out.length >= MAX_SKILLS) break;
  }
  return out;
}

/**
 * Case-insensitive overlap. A current skill matches a target skill when either
 * string contains the other, so "Python" matches "Python scripting".
 */
export function matchSkills(currentSkills, targetSkills) {
  const matched = [];
  const gaps = [];
  const lowerCurrent = currentSkills.map((skill) => skill.toLowerCase());
  for (const target of targetSkills) {
    const t = target.toLowerCase();
    const hit = lowerCurrent.some((c) => c === t || c.includes(t) || t.includes(c));
    if (hit) matched.push(target);
    else gaps.push(target);
  }
  return { matched, gaps };
}

export function readinessBand(overlapPct) {
  return READINESS_BANDS.find((band) => overlapPct >= band.min) ?? READINESS_BANDS[READINESS_BANDS.length - 1];
}

/**
 * @returns {{error: string} | {
 *   prompt: string, matched: string[], gaps: string[], overlapPct: number,
 *   band: {label: string, note: string}, learningHours: number,
 *   learningWeeks: number, wordCount: number, tokenEstimate: number
 * }}
 */
export function buildCareerSwitchPrompt({
  currentRole = "",
  targetRole = "",
  targetIndustry = "",
  yearsExperience = 0,
  currentSkills = "",
  targetSkills = "",
  hoursPerSkill = DEFAULT_HOURS_PER_SKILL,
  hoursPerWeek = 6,
  focus = "skill-gap",
  evidence = [],
  constraints = "",
} = {}) {
  const from = clean(currentRole);
  const to = clean(targetRole);
  const industry = clean(targetIndustry);
  const years = Number(yearsExperience);
  const perSkill = Number(hoursPerSkill);
  const perWeek = Number(hoursPerWeek);

  if (!from) return { error: "Enter the role you are switching from." };
  if (!to) return { error: "Enter the role you are switching to." };
  if (![years, perSkill, perWeek].every(Number.isFinite)) {
    return { error: "Years of experience and study hours must be numbers." };
  }
  if (years < 0 || years > MAX_YEARS_EXPERIENCE) {
    return { error: `Years of experience should be between 0 and ${MAX_YEARS_EXPERIENCE}.` };
  }
  if (perSkill <= 0 || perSkill > MAX_HOURS_PER_SKILL) {
    return { error: `Hours per missing skill should be between 1 and ${MAX_HOURS_PER_SKILL}.` };
  }
  if (perWeek <= 0 || perWeek > MAX_HOURS_PER_WEEK) {
    return { error: `Study hours per week should be between 1 and ${MAX_HOURS_PER_WEEK}.` };
  }

  const have = parseSkills(currentSkills);
  const want = parseSkills(targetSkills);
  if (want.length === 0) {
    return { error: "List at least one skill the target role asks for, separated by commas." };
  }

  const { matched, gaps } = matchSkills(have, want);
  const overlapPct = Math.round((matched.length / want.length) * 100);
  const band = readinessBand(overlapPct);

  const learningHours = gaps.length * perSkill;
  const learningWeeks = Math.ceil(learningHours / perWeek);

  const focusLine = PLAN_FOCUS[focus] ?? PLAN_FOCUS["skill-gap"];
  const evidenceList = (Array.isArray(evidence) ? evidence : []).map(clean).filter(Boolean);
  const constraintText = clean(constraints);

  const lines = [];
  lines.push(
    `Act as a career coach who has placed people into ${to} roles${industry ? ` in ${industry}` : ""}. I am switching from ${from} to ${to}.`,
  );
  lines.push("");
  lines.push("MY SITUATION");
  lines.push(`- Years of experience in my current field: ${years}`);
  lines.push(`- Skills I already have: ${have.length ? have.join(", ") : "none listed"}`);
  lines.push(`- Skills the target role asks for: ${want.join(", ")}`);
  lines.push(
    `- Overlap: ${matched.length} of ${want.length} requirements (${overlapPct}%) — ${band.label}. ${band.note}`,
  );
  lines.push(`- Already covered: ${matched.length ? matched.join(", ") : "nothing on the list yet"}`);
  lines.push(`- Gaps to close: ${gaps.length ? gaps.join(", ") : "none — the gap is credibility, not capability"}`);
  if (gaps.length) {
    lines.push(
      `- My own study budget: ${perSkill} hours per gap = ${learningHours} hours total, at ${perWeek} hours a week that is about ${learningWeeks} weeks.`,
    );
  }
  if (evidenceList.length) lines.push(`- Evidence I can realistically produce: ${evidenceList.join(", ")}`);
  if (constraintText) lines.push(`- Constraints: ${constraintText}`);
  lines.push("");
  lines.push("WHAT I WANT FROM YOU");
  lines.push(`1. ${focusLine}`);
  lines.push("2. For each skill I already have, write one sentence that reframes it in the target role's own vocabulary — the exact wording I should put on my CV.");
  lines.push("3. For each gap, name the single cheapest piece of evidence that would satisfy a hiring manager, and how long it should take.");
  lines.push("4. Challenge me: which of my claimed skills would not survive a technical interview for this role, and why?");
  lines.push("5. Give me a week-by-week plan for the study budget above, ordered so the highest-signal gap is closed first.");
  lines.push("6. Finish with the three sentences I should use when someone asks 'why are you leaving your field?'");
  lines.push("");
  lines.push("Be concrete and specific to these two roles. Do not give generic career advice, and tell me plainly if the switch as described is unrealistic.");

  const prompt = lines.join("\n");

  return {
    prompt,
    matched,
    gaps,
    overlapPct,
    band: { label: band.label, note: band.note },
    learningHours,
    learningWeeks,
    wordCount: prompt.split(/\s+/).filter(Boolean).length,
    tokenEstimate: Math.ceil(prompt.length / CHARS_PER_TOKEN),
  };
}
