/**
 * Sprint Goal Generator — goal drafting, capacity maths and a commitment check.
 *
 * The 2020 Scrum Guide defines the Sprint Goal as "the single objective for the
 * Sprint": one per Sprint, committed to the Sprint Backlog, and the thing the
 * Developers protect when scope has to flex. Everything below follows that —
 * one outcome, one measure, one date.
 *
 * Pure functions only. No clock reads, no DOM.
 */

/** A Sprint is one month or less (Scrum Guide 2020); 4 weeks is the cap here. */
export const MIN_SPRINT_WEEKS = 1;
export const MAX_SPRINT_WEEKS = 4;

/** Standard five-day working week used to turn sprint weeks into capacity days. */
export const WORKING_DAYS_PER_WEEK = 5;

/**
 * Focus factor: the share of nominal hours a team actually spends on Sprint
 * Backlog work once ceremonies, support and interruptions are removed. 0.8 is
 * the usual planning default; teams with heavy on-call duty sit nearer 0.6.
 */
export const DEFAULT_FOCUS_FACTOR = 0.8;

/**
 * Commitment bands, as committed points ÷ average velocity.
 * Below 0.8 the Sprint is under-loaded; above 1.1 the team is committing to
 * more than it has ever delivered.
 */
export const UNDER_COMMIT_RATIO = 0.8;
export const OVER_COMMIT_RATIO = 1.1;

/**
 * Quality checks on the drafted goal. Points sum to 100.
 * A Sprint Goal that fails these is usually a task list wearing a goal's name.
 */
export const GOAL_CHECK_POINTS = Object.freeze({
  outcome: 30,
  measure: 25,
  commitment: 20,
  scopeOut: 15,
  risks: 10,
});

/** A goal statement longer than this stops being memorable in the daily scrum. */
export const MAX_GOAL_WORDS = 30;

/** Standing Sprint Review prompts, from the Scrum Guide's Sprint Review purpose. */
export const REVIEW_PROMPTS = Object.freeze([
  "Did we meet the Sprint Goal? Answer yes or no before discussing anything else.",
  "What did the increment let a user do that they could not do before?",
  "Which measure moved, and by how much against the target we set?",
  "Which risk we named actually bit us, and what did it cost?",
  "What should change in the Product Backlog because of what we learned?",
]);

const text = (value) => String(value == null ? "" : value).trim();

const toNumber = (value) => {
  if (value === "" || value === null || value === undefined) return Number.NaN;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
};

const round = (value, dp = 1) => {
  const factor = 10 ** dp;
  return Math.round(value * factor) / factor;
};

const cleanList = (value) =>
  (Array.isArray(value) ? value : String(value == null ? "" : value).split("\n"))
    .map(text)
    .filter((item) => item !== "");

/** Label a commitment ratio. */
export function commitmentBand(ratio) {
  if (ratio < UNDER_COMMIT_RATIO) return "Under-committed";
  if (ratio <= OVER_COMMIT_RATIO) return "Healthy";
  return "Over-committed";
}

/**
 * Draft one Sprint Goal and check it.
 *
 * @param {object} input
 * @param {string} input.sprintName        e.g. "Sprint 24".
 * @param {number} input.sprintLengthWeeks 1-4.
 * @param {number} input.teamSize          Number of Developers.
 * @param {number} input.hoursPerDay       Nominal hours per Developer per working day.
 * @param {number} input.focusFactor       0-1 share of those hours available for Sprint work.
 * @param {number} input.averageVelocity   Story points the team has averaged over recent Sprints.
 * @param {number} input.committedPoints   Points pulled into this Sprint.
 * @param {string} input.outcome           The single user- or business-visible change.
 * @param {string} input.beneficiary       Who gets that change.
 * @param {string} input.metric            What will be measured.
 * @param {number} input.baseline          Metric value today.
 * @param {number} input.target            Metric value that means the goal was met.
 * @param {string|string[]} input.scopeIn  Work inside the goal, one per line.
 * @param {string|string[]} input.scopeOut Work explicitly excluded, one per line.
 * @param {string|string[]} input.risks    Named risks, one per line.
 * @returns {object} goal, capacity and checks, or { error }
 */
export function generateSprintGoal(input = {}) {
  const sprintName = text(input.sprintName) || "This Sprint";
  const outcome = text(input.outcome);
  const beneficiary = text(input.beneficiary);
  const metric = text(input.metric);

  const weeks = toNumber(input.sprintLengthWeeks);
  const teamSize = toNumber(input.teamSize);
  const hoursPerDay = toNumber(input.hoursPerDay);
  const focusFactor = toNumber(input.focusFactor);
  const velocity = toNumber(input.averageVelocity);
  const committed = toNumber(input.committedPoints);
  const baseline = toNumber(input.baseline);
  const target = toNumber(input.target);

  if (outcome === "") {
    return { error: "Describe the one outcome this Sprint delivers, e.g. “checkout works on mobile”." };
  }
  if (!Number.isFinite(weeks) || weeks < MIN_SPRINT_WEEKS || weeks > MAX_SPRINT_WEEKS) {
    return { error: `Sprint length must be between ${MIN_SPRINT_WEEKS} and ${MAX_SPRINT_WEEKS} weeks.` };
  }
  if (!Number.isFinite(teamSize) || teamSize < 1) {
    return { error: "Team size must be at least 1 Developer." };
  }
  if (!Number.isFinite(hoursPerDay) || hoursPerDay <= 0 || hoursPerDay > 24) {
    return { error: "Hours per day must be greater than 0 and no more than 24." };
  }
  if (!Number.isFinite(focusFactor) || focusFactor <= 0 || focusFactor > 1) {
    return { error: "Focus factor must be greater than 0 and no more than 1." };
  }
  if (!Number.isFinite(velocity) || velocity <= 0) {
    return { error: "Average velocity must be greater than 0 — the commitment check divides by it." };
  }
  if (!Number.isFinite(committed) || committed <= 0) {
    return { error: "Committed points must be greater than 0." };
  }

  const workingDays = Math.round(weeks * WORKING_DAYS_PER_WEEK);
  const nominalHours = teamSize * workingDays * hoursPerDay;
  const capacityHours = nominalHours * focusFactor;
  const hoursPerPoint = capacityHours / committed;
  const commitmentRatio = committed / velocity;
  const band = commitmentBand(commitmentRatio);

  const scopeIn = cleanList(input.scopeIn);
  const scopeOut = cleanList(input.scopeOut);
  const risks = cleanList(input.risks);

  const hasMeasure =
    metric !== "" && Number.isFinite(baseline) && Number.isFinite(target) && baseline !== target;
  const measureDelta = hasMeasure ? target - baseline : null;
  const measureChangePct =
    hasMeasure && baseline !== 0 ? round(((target - baseline) / Math.abs(baseline)) * 100, 1) : null;

  const measureClause = hasMeasure
    ? `, measured by ${metric} moving from ${baseline} to ${target}`
    : "";
  const beneficiaryClause = beneficiary ? ` for ${beneficiary}` : "";
  const goalStatement = `By the end of ${sprintName}, ${outcome}${beneficiaryClause}${measureClause}.`;
  const goalWords = goalStatement.split(/\s+/).filter(Boolean).length;

  const checks = [
    {
      key: "outcome",
      label: "One outcome, not a task list",
      pass: outcome !== "" && !/[;,]\s*(and|then)\s/i.test(outcome) && goalWords <= MAX_GOAL_WORDS,
      points:
        outcome !== "" && !/[;,]\s*(and|then)\s/i.test(outcome) && goalWords <= MAX_GOAL_WORDS
          ? GOAL_CHECK_POINTS.outcome
          : 0,
      note:
        goalWords > MAX_GOAL_WORDS
          ? `The statement runs to ${goalWords} words; keep it under ${MAX_GOAL_WORDS} so the team can repeat it from memory.`
          : "A single objective the Developers can protect when scope flexes.",
    },
    {
      key: "measure",
      label: "Measurable at review",
      pass: hasMeasure,
      points: hasMeasure ? GOAL_CHECK_POINTS.measure : 0,
      note: hasMeasure
        ? `${metric}: ${baseline} → ${target}.`
        : "Name a metric with a different baseline and target, or the review becomes an opinion poll.",
    },
    {
      key: "commitment",
      label: "Commitment fits velocity",
      pass: band === "Healthy",
      points: band === "Healthy" ? GOAL_CHECK_POINTS.commitment : 0,
      note: `${committed} points against an average velocity of ${velocity} is ${round(commitmentRatio, 2)}x — ${band.toLowerCase()}.`,
    },
    {
      key: "scopeOut",
      label: "Non-goals written down",
      pass: scopeOut.length > 0,
      points: scopeOut.length > 0 ? GOAL_CHECK_POINTS.scopeOut : 0,
      note:
        scopeOut.length > 0
          ? `${scopeOut.length} item(s) explicitly out of scope.`
          : "List what this Sprint will not do — that is what makes the goal focused.",
    },
    {
      key: "risks",
      label: "Risks named",
      pass: risks.length > 0,
      points: risks.length > 0 ? GOAL_CHECK_POINTS.risks : 0,
      note:
        risks.length > 0
          ? `${risks.length} risk(s) recorded for the review.`
          : "Name at least one thing that could stop the goal being met.",
    },
  ];

  const focusScore = checks.reduce((sum, item) => sum + item.points, 0);

  const markdown = [
    `# ${sprintName} — Sprint Goal`,
    "",
    `> ${goalStatement}`,
    "",
    `- Length: ${weeks} week(s), ${workingDays} working days`,
    `- Capacity: ${round(capacityHours, 0)} focused hours (${teamSize} × ${workingDays} × ${hoursPerDay} × ${focusFactor})`,
    `- Commitment: ${committed} points vs ${velocity} average (${round(commitmentRatio, 2)}x — ${band})`,
    "",
    "## In scope",
    ...(scopeIn.length ? scopeIn.map((item) => `- ${item}`) : ["- (nothing listed)"]),
    "",
    "## Explicitly not this Sprint",
    ...(scopeOut.length ? scopeOut.map((item) => `- ${item}`) : ["- (nothing listed)"]),
    "",
    "## Risks",
    ...(risks.length ? risks.map((item) => `- ${item}`) : ["- (nothing listed)"]),
    "",
    "## Review prompts",
    ...REVIEW_PROMPTS.map((item) => `- ${item}`),
    "",
  ].join("\n");

  return {
    sprintName,
    goalStatement,
    goalWords,
    focusScore,
    checks,
    workingDays,
    nominalHours: round(nominalHours, 0),
    capacityHours: round(capacityHours, 0),
    hoursPerPoint: round(hoursPerPoint, 2),
    commitmentRatio: round(commitmentRatio, 2),
    commitmentBand: band,
    pointsHeadroom: round(velocity * OVER_COMMIT_RATIO - committed, 1),
    measureDelta,
    measureChangePct,
    scopeIn,
    scopeOut,
    risks,
    reviewPrompts: [...REVIEW_PROMPTS],
    markdown,
  };
}
