/**
 * Onboarding Doc Prompt Builder.
 *
 * Takes a role, team, seniority and an access/tooling list and writes a prompt for a
 * first-week onboarding document. It also lays out how the week's available hours split
 * across the standard onboarding sections, so the generated document has a real timetable
 * rather than an open-ended reading list.
 *
 * The section order follows the conventional new-hire sequence used in structured
 * onboarding programmes: access and administration first (a new joiner blocked on a login
 * cannot start), then team and product context, then how the work is actually done, then a
 * small supervised contribution, closing with rituals and a first feedback checkpoint.
 * Ramp checkpoints use the standard 30/60/90-day plan horizons.
 */

/** Schedules are written in quarter-hour blocks — the smallest unit worth putting in a doc. */
export const SCHEDULE_GRANULARITY_HOURS = 0.25;

/** A standard first week is five working days, Monday to Friday. */
export const DEFAULT_WORKING_DAYS = 5;

/** The conventional 30-60-90 day plan checkpoints. */
export const RAMP_HORIZONS_DAYS = [30, 60, 90];

/** Bounds that keep the timetable and prompt realistic. */
export const LIMITS = {
  hoursPerDay: { min: 1, max: 12 },
  days: { min: 1, max: 10 },
  accessItems: { max: 40 },
};

/**
 * Standard first-week sections with their share of the week.
 * `weight` is a relative share (these sum to 100, but any subset is re-normalised).
 */
export const ONBOARDING_SECTIONS = [
  {
    id: "access",
    label: "Accounts, access and tooling",
    weight: 15,
    dayWindow: "Day 1",
    directive:
      "List every account, repository, channel and physical item the new hire needs, who grants it, and the exact request path. Mark anything that takes more than a day to provision so it can be requested before the start date.",
  },
  {
    id: "team",
    label: "Team, mission and who does what",
    weight: 10,
    dayWindow: "Day 1",
    directive:
      "Explain what the team is accountable for, name each person with their area and the kind of question to bring them, and identify the onboarding buddy and the escalation path.",
  },
  {
    id: "product",
    label: "Product and domain primer",
    weight: 20,
    dayWindow: "Days 1-2",
    directive:
      "Explain what the product does, who pays for it, the two or three domain terms an outsider would misread, and one end-to-end walkthrough of the main user journey.",
  },
  {
    id: "systems",
    label: "How the work actually gets done",
    weight: 20,
    dayWindow: "Days 2-3",
    directive:
      "Document the day-to-day workflow end to end: where work is tracked, how it moves from idea to shipped, review and approval rules, and where the written standards live.",
  },
  {
    id: "first-task",
    label: "Supervised first contribution",
    weight: 25,
    dayWindow: "Days 3-5",
    directive:
      "Define one small, genuinely useful task the hire can complete in the first week with support, with an explicit definition of done and the named reviewer.",
  },
  {
    id: "rituals",
    label: "Rituals, expectations and feedback loop",
    weight: 10,
    dayWindow: "Day 5",
    directive:
      "List recurring meetings with purpose and whether attendance is optional, state working-hours and response-time expectations, and schedule the end-of-week and 30/60/90-day check-ins.",
  },
];

/** Role families change what the first-week deliverable and the reading list look like. */
export const ROLE_FAMILIES = [
  {
    id: "engineering",
    label: "Engineering",
    focus:
      "local environment running and one merged change; emphasise repository layout, build and test commands, deployment path and on-call basics",
    firstTask: "ship one small, reviewed code change to production or staging",
  },
  {
    id: "product",
    label: "Product management",
    focus:
      "customer problems and current roadmap; emphasise where requirements live, how discovery is run and which metrics the team is judged on",
    firstTask: "write one short problem brief for an existing backlog item",
  },
  {
    id: "design",
    label: "Design / UX",
    focus:
      "design system, research repository and handoff process; emphasise component libraries, file organisation and critique norms",
    firstTask: "produce one small screen or component that passes critique and handoff review",
  },
  {
    id: "data",
    label: "Data / Analytics",
    focus:
      "warehouse layout, metric definitions and dashboard ownership; emphasise which tables are trusted and how metrics are certified",
    firstTask: "reproduce one existing reported number from raw tables and explain any variance",
  },
  {
    id: "sales",
    label: "Sales / Account management",
    focus:
      "ideal customer profile, pricing, objection handling and CRM hygiene; emphasise the qualification framework and deal stages",
    firstTask: "deliver the product pitch to the manager and log one correctly staged CRM opportunity",
  },
  {
    id: "support",
    label: "Customer support / Success",
    focus:
      "top ticket categories, macros, escalation tiers and tone of voice; emphasise the service-level targets actually promised",
    firstTask: "resolve three real tickets under review before replying",
  },
  {
    id: "marketing",
    label: "Marketing",
    focus:
      "positioning, audience segments, channel mix and brand voice; emphasise the approval path for anything published",
    firstTask: "draft one publishable asset in the house voice and take it through review",
  },
  {
    id: "operations",
    label: "Operations / Finance / HR",
    focus:
      "recurring calendar, systems of record, approval limits and compliance obligations; emphasise which steps are audited",
    firstTask: "run one recurring process end to end alongside its current owner",
  },
];

/** Seniority changes how much scaffolding the document should provide. */
export const SENIORITY_LEVELS = [
  {
    id: "junior",
    label: "Junior / first role",
    directive:
      "Assume no prior industry context: define jargon on first use, give explicit step-by-step instructions, and pair every task with a named person to ask.",
  },
  {
    id: "mid",
    label: "Mid-level",
    directive:
      "Assume the craft is known but nothing about this company: explain conventions and decisions rather than basics, and link to reference material instead of restating it.",
  },
  {
    id: "senior",
    label: "Senior",
    directive:
      "Front-load context and open questions over instructions: current architecture or strategy, known problem areas, recent decisions and the constraints behind them.",
  },
  {
    id: "lead",
    label: "Lead / Manager",
    directive:
      "Add the people layer: direct reports with current status, in-flight commitments, budget or headcount facts, stakeholder map and the decisions awaiting this role.",
  },
];

/** Output shapes the document can take. */
export const DOC_FORMATS = [
  {
    id: "runbook",
    label: "Markdown runbook",
    directive:
      "Produce Markdown: one H2 per section, a day-by-day table at the top, checklists as - [ ] items, and every link as a named placeholder like [Deploy guide](TODO: link).",
  },
  {
    id: "wiki",
    label: "Wiki page with collapsible sections",
    directive:
      "Produce a wiki-style page: a short orientation paragraph, then one collapsible block per section with the checklist inside, so the page scans in under a minute.",
  },
  {
    id: "checklist",
    label: "Pure checklist",
    directive:
      "Produce a flat checklist grouped by day. Every line is one action starting with a verb, with the owner in brackets and no prose between items.",
  },
];

export function getRoleFamily(id) {
  return ROLE_FAMILIES.find((item) => item.id === id) || null;
}

export function getSeniority(id) {
  return SENIORITY_LEVELS.find((item) => item.id === id) || null;
}

export function getDocFormat(id) {
  return DOC_FORMATS.find((item) => item.id === id) || null;
}

export function getSection(id) {
  return ONBOARDING_SECTIONS.find((item) => item.id === id) || null;
}

/** About four characters per token for ordinary English prose. */
export const AVERAGE_CHARS_PER_TOKEN = 4;

export function measureText(text) {
  if (typeof text !== "string" || text.trim().length === 0) {
    return { characters: 0, words: 0, approxTokens: 0 };
  }
  const characters = text.length;
  const words = text.trim().split(/\s+/).length;
  return {
    characters,
    words,
    approxTokens: Math.max(1, Math.ceil(characters / AVERAGE_CHARS_PER_TOKEN)),
  };
}

/**
 * Parse a free-text access list into deduplicated items.
 * Accepts one item per line or a comma-separated line; strips bullet markers.
 * @returns {{error:string}|{items:string[]}}
 */
export function parseAccessList(text) {
  if (typeof text !== "string") return { items: [] };
  const raw = text
    .split(/\r?\n|,/)
    .map((line) => line.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "").trim())
    .filter((line) => line.length > 0);
  const items = [];
  const seen = new Set();
  for (const item of raw) {
    const key = item.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    items.push(item);
  }
  if (items.length > LIMITS.accessItems.max) {
    return {
      error: `Keep the access list to ${LIMITS.accessItems.max} items — group the rest under a named bundle such as "standard engineering kit".`,
    };
  }
  return { items };
}

/**
 * Split the week's hours across the chosen sections in proportion to their weight.
 *
 * Uses the largest-remainder (Hamilton) method on quarter-hour units, so the allocations
 * always add up to exactly hoursPerDay x days with no rounding drift.
 *
 * @param {object} input
 * @param {number} input.hoursPerDay   Productive onboarding hours available each day.
 * @param {number} input.days          Number of working days in the onboarding week.
 * @param {string[]} input.sectionIds  Ids of the sections to include.
 * @returns {{error:string}|{totalHours:number, allocations:Array<object>}}
 */
export function allocateOnboardingHours({ hoursPerDay, days, sectionIds }) {
  const perDay = Number(hoursPerDay);
  const dayCount = Number(days);

  if (!Number.isFinite(perDay) || perDay <= 0) {
    return { error: "Enter how many productive hours are available each day." };
  }
  if (perDay < LIMITS.hoursPerDay.min || perDay > LIMITS.hoursPerDay.max) {
    return {
      error: `Hours per day must be between ${LIMITS.hoursPerDay.min} and ${LIMITS.hoursPerDay.max}.`,
    };
  }
  if (!Number.isFinite(dayCount) || !Number.isInteger(dayCount)) {
    return { error: "Enter the number of onboarding days as a whole number." };
  }
  if (dayCount < LIMITS.days.min || dayCount > LIMITS.days.max) {
    return {
      error: `Onboarding days must be between ${LIMITS.days.min} and ${LIMITS.days.max}.`,
    };
  }

  const chosen = Array.isArray(sectionIds)
    ? ONBOARDING_SECTIONS.filter((section) => sectionIds.includes(section.id))
    : [];
  if (chosen.length === 0) {
    return { error: "Select at least one onboarding section to include." };
  }

  // Work in whole quarter-hour units so the arithmetic stays integral, and snap the
  // headline total to the same grid so the parts always add up to the whole.
  const totalUnits = Math.round((perDay * dayCount) / SCHEDULE_GRANULARITY_HOURS);
  const totalHours = totalUnits * SCHEDULE_GRANULARITY_HOURS;
  if (totalUnits < chosen.length) {
    return {
      error: `Only ${formatHours(totalHours)} for ${chosen.length} sections — add hours or remove sections.`,
    };
  }

  const weightSum = chosen.reduce((sum, section) => sum + section.weight, 0);
  const draft = chosen.map((section) => {
    const exact = (totalUnits * section.weight) / weightSum;
    const base = Math.floor(exact);
    return { section, base, remainder: exact - base };
  });

  let assigned = draft.reduce((sum, row) => sum + row.base, 0);
  let leftover = totalUnits - assigned;
  // Largest remainder first; ties broken by the heavier section, then by declared order.
  const order = [...draft].sort((a, b) => {
    if (b.remainder !== a.remainder) return b.remainder - a.remainder;
    return b.section.weight - a.section.weight;
  });
  let cursor = 0;
  while (leftover > 0) {
    order[cursor % order.length].base += 1;
    leftover -= 1;
    cursor += 1;
  }
  assigned = draft.reduce((sum, row) => sum + row.base, 0);

  const allocations = draft.map((row) => ({
    id: row.section.id,
    label: row.section.label,
    dayWindow: row.section.dayWindow,
    directive: row.section.directive,
    hours: row.base * SCHEDULE_GRANULARITY_HOURS,
    percent: Math.round((row.base / totalUnits) * 1000) / 10,
  }));

  return {
    totalHours,
    hoursPerDay: perDay,
    days: dayCount,
    allocatedHours: assigned * SCHEDULE_GRANULARITY_HOURS,
    allocations,
  };
}

/** Render 1.75 as "1h 45m" for the timetable inside the prompt. */
export function formatHours(hours) {
  const value = Number(hours);
  if (!Number.isFinite(value) || value < 0) return "0m";
  const whole = Math.floor(value);
  const minutes = Math.round((value - whole) * 60);
  if (whole === 0) return `${minutes}m`;
  if (minutes === 0) return `${whole}h`;
  return `${whole}h ${minutes}m`;
}

/**
 * Write the onboarding-document prompt.
 * @returns {{error:string}|{text:string, schedule:object, ...}}
 */
export function buildOnboardingPrompt({
  roleTitle,
  roleFamilyId,
  teamName,
  companyName,
  seniorityId,
  formatId,
  accessText,
  hoursPerDay,
  days,
  notes,
} = {}) {
  const title = typeof roleTitle === "string" ? roleTitle.trim() : "";
  if (!title) return { error: "Enter the job title the document is for." };

  const family = getRoleFamily(roleFamilyId);
  if (!family) return { error: "Choose a role family." };
  const seniority = getSeniority(seniorityId);
  if (!seniority) return { error: "Choose a seniority level." };
  const format = getDocFormat(formatId);
  if (!format) return { error: "Choose an output format." };

  const team = typeof teamName === "string" ? teamName.trim() : "";
  const company = typeof companyName === "string" ? companyName.trim() : "";
  const extra = typeof notes === "string" ? notes.trim() : "";

  const access = parseAccessList(accessText);
  if (access.error) return { error: access.error };

  const schedule = allocateOnboardingHours({
    hoursPerDay,
    days,
    sectionIds: ONBOARDING_SECTIONS.map((section) => section.id),
  });
  if (schedule.error) return { error: schedule.error };

  const who = [title, team ? `on the ${team} team` : "", company ? `at ${company}` : ""]
    .filter(Boolean)
    .join(" ");

  const lines = [
    `Write a first-week onboarding document for a new ${who}.`,
    "",
    `OUTPUT FORMAT: ${format.directive}`,
    `READER LEVEL: ${seniority.label}. ${seniority.directive}`,
    `ROLE FOCUS (${family.label}): ${family.focus}.`,
    "",
    `TIMETABLE — ${schedule.days} working day${schedule.days === 1 ? "" : "s"} at ${formatHours(
      schedule.hoursPerDay,
    )} of onboarding time per day (${formatHours(schedule.totalHours)} total). Budget each section to fit:`,
  ];

  for (const allocation of schedule.allocations) {
    lines.push(
      `- ${allocation.label} — ${allocation.dayWindow}, ${formatHours(allocation.hours)} (${allocation.percent}% of the week)`,
    );
  }

  lines.push("", "WRITE EACH SECTION TO THIS BRIEF:");
  schedule.allocations.forEach((allocation, index) => {
    lines.push(`${index + 1}. ${allocation.label}: ${allocation.directive}`);
  });

  if (access.items.length > 0) {
    lines.push(
      "",
      `ACCESS AND TOOLS TO COVER (${access.items.length}) — give each an owner and a request step:`,
      ...access.items.map((item) => `- ${item}`),
    );
  }

  lines.push(
    "",
    "FIRST-WEEK DELIVERABLE:",
    `By the end of the week the hire should ${family.firstTask}. State the definition of done, the named reviewer and what to do if it slips.`,
    "",
    `RAMP CHECKPOINTS: after the week, add one short paragraph per ${RAMP_HORIZONS_DAYS.join("/")}-day horizon saying what "on track" looks like in observable terms, not feelings.`,
    "",
    "RULES:",
    "- Every task line names an owner and a completion signal. No line may end in a vague verb like \"learn about\" or \"get familiar with\".",
    "- Where a link, tool name, person or policy is not supplied above, write TODO(fill): with a description of what belongs there instead of inventing it.",
    "- Do not invent company policies, benefits, salaries or legal obligations.",
    "- Keep the whole document readable in fifteen minutes; push detail into linked references.",
    "- Write in the second person, present tense, plain English, no welcome-aboard filler.",
  );
  if (extra) lines.push(`- ${extra}`);

  const text = lines.join("\n");
  return {
    text,
    schedule,
    accessItems: access.items,
    family,
    seniority,
    format,
    ...measureText(text),
  };
}
