/**
 * AI Training Plan Builder — assembles a week-by-week upskilling plan from a
 * module catalogue filtered by role and starting skill level, then packs the
 * module hours into the learner's weekly time budget.
 *
 * Module hour estimates follow the common corporate micro-learning convention of
 * 1-4 hour blocks (anything longer gets abandoned alongside day-job work), and the
 * plan is sequenced foundations → applied practice → governance, mirroring how
 * vendor academies (Microsoft Learn, Google Cloud Skills Boost) order AI curricula.
 */

export const ROLES = [
  { id: "general", label: "General staff" },
  { id: "manager", label: "Managers & team leads" },
  { id: "developer", label: "Developers & engineers" },
  { id: "marketing", label: "Marketing & content" },
  { id: "operations", label: "Operations & support" },
  { id: "analyst", label: "Data & analysts" },
];

/** Skill levels in ascending order; index is used for filtering. */
export const LEVELS = [
  { id: "beginner", label: "Beginner — has barely used AI tools" },
  { id: "intermediate", label: "Intermediate — uses AI weekly" },
  { id: "advanced", label: "Advanced — builds prompts/workflows for others" },
];

/** A learner should put in at least 1 h/week; beyond 10 h/week is a course, not upskilling beside a day job. */
export const MIN_HOURS_PER_WEEK = 1;
export const MAX_HOURS_PER_WEEK = 10;

/**
 * Module catalogue. `level` is the level index the module is pitched at
 * (a learner takes modules at their level and above). `roles` limits the module
 * to specific roles; "all" applies to everyone.
 */
export const MODULES = [
  { id: "found-1", title: "How LLMs work: capabilities and failure modes", hours: 2, level: 0, roles: "all", outcome: "Explain hallucination, context limits and why output needs review" },
  { id: "found-2", title: "Prompting fundamentals: role, context, format, examples", hours: 3, level: 0, roles: "all", outcome: "Write structured prompts that beat one-liners on real tasks" },
  { id: "found-3", title: "Safe use: data classification and what never goes in a prompt", hours: 1, level: 0, roles: "all", outcome: "Apply the company data rules to every AI interaction" },
  { id: "int-1", title: "Iterative prompting and output evaluation", hours: 2, level: 1, roles: "all", outcome: "Refine outputs systematically instead of retrying blindly" },
  { id: "int-2", title: "Building reusable prompt templates for your team", hours: 2, level: 1, roles: "all", outcome: "Ship 3 tested templates for recurring team tasks" },
  { id: "mgr-1", title: "Redesigning team workflows around AI", hours: 3, level: 1, roles: ["manager", "operations"], outcome: "Map one workflow before/after with measurable checkpoints" },
  { id: "mgr-2", title: "Reviewing AI-assisted work: quality bars and spot checks", hours: 2, level: 1, roles: ["manager"], outcome: "Define review rules for AI-assisted deliverables" },
  { id: "dev-1", title: "AI pair programming: completion, refactoring, tests", hours: 4, level: 1, roles: ["developer"], outcome: "Use an AI assistant across the edit-test-review loop" },
  { id: "dev-2", title: "Calling model APIs: structure, function calls, evals", hours: 4, level: 2, roles: ["developer"], outcome: "Build a small evaluated feature on a model API" },
  { id: "mkt-1", title: "Brand-safe content generation and editing workflows", hours: 3, level: 1, roles: ["marketing"], outcome: "Produce on-brand drafts with a documented edit pass" },
  { id: "ops-1", title: "AI for documentation, summaries and ticket triage", hours: 2, level: 1, roles: ["operations", "general"], outcome: "Automate one recurring documentation task" },
  { id: "ana-1", title: "AI-assisted analysis: queries, sanity checks, charts", hours: 3, level: 1, roles: ["analyst"], outcome: "Use AI on a real dataset without trusting it blindly" },
  { id: "adv-1", title: "Designing multi-step AI workflows and automations", hours: 4, level: 2, roles: "all", outcome: "Chain prompts/tools into a reviewed automation" },
  { id: "adv-2", title: "Coaching others: running internal AI clinics", hours: 2, level: 2, roles: "all", outcome: "Run a repeatable 1-hour clinic for teammates" },
];

function moduleAppliesToRole(module, roleId) {
  return module.roles === "all" || module.roles.includes(roleId);
}

/**
 * Builds the plan. Returns { modules, totalHours, weeks, weekCount } or { error }.
 * Modules are packed greedily in catalogue order; a module may span weeks.
 */
export function buildTrainingPlan({ roleId, levelId, hoursPerWeek }) {
  const role = ROLES.find((r) => r.id === roleId);
  if (!role) return { error: "Pick a role to build the plan for." };

  const levelIndex = LEVELS.findIndex((l) => l.id === levelId);
  if (levelIndex === -1) return { error: "Pick the learner's current skill level." };

  const hpw = Number(hoursPerWeek);
  if (!Number.isFinite(hpw) || hpw < MIN_HOURS_PER_WEEK || hpw > MAX_HOURS_PER_WEEK) {
    return {
      error: `Weekly time budget must be between ${MIN_HOURS_PER_WEEK} and ${MAX_HOURS_PER_WEEK} hours.`,
    };
  }

  const selected = MODULES.filter(
    (m) => moduleAppliesToRole(m, roleId) && m.level >= levelIndex,
  );
  if (selected.length === 0) {
    return { error: "No modules match this role and level combination." };
  }

  let cumulative = 0;
  const scheduled = selected.map((m) => {
    const startWeek = Math.floor(cumulative / hpw) + 1;
    cumulative += m.hours;
    const endWeek = Math.ceil(cumulative / hpw);
    return { ...m, startWeek, endWeek };
  });

  const totalHours = cumulative;
  const weekCount = Math.ceil(totalHours / hpw);

  return {
    roleLabel: role.label,
    levelLabel: LEVELS[levelIndex].label,
    modules: scheduled,
    totalHours,
    weekCount,
    hoursPerWeek: hpw,
  };
}

/** Plain-text export of the plan for pasting into a doc. */
export function formatPlanText(plan) {
  if (!plan || plan.error) return "";
  const lines = [
    `AI upskilling plan — ${plan.roleLabel} (${plan.levelLabel})`,
    `${plan.totalHours} hours over ${plan.weekCount} week${plan.weekCount === 1 ? "" : "s"} at ${plan.hoursPerWeek} h/week`,
    "",
  ];
  plan.modules.forEach((m, i) => {
    const span = m.startWeek === m.endWeek ? `Week ${m.startWeek}` : `Weeks ${m.startWeek}-${m.endWeek}`;
    lines.push(`${i + 1}. [${span}] ${m.title} (${m.hours} h)`);
    lines.push(`   Outcome: ${m.outcome}`);
  });
  return lines.join("\n");
}
