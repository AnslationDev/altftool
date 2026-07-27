/**
 * Exam result day support planning.
 *
 * The plan structure follows standard psychological-first-aid and
 * stress-inoculation ideas rather than any statute:
 *  - Deciding in advance who is present and what happens next ("implementation
 *    intentions", Gollwitzer 1999) reduces in-the-moment overwhelm.
 *  - Naming a plan for each realistic outcome (better / as expected / below
 *    expected) is a scenario-planning technique that stops one feared outcome
 *    dominating.
 *  - Grounding after intense news uses the widely-taught 5-4-3-2-1 sensory
 *    technique.
 *
 * All date maths is pure; "today" is always an argument.
 */

export const CHECK_STYLES = [
  {
    id: "with-someone",
    label: "Check it together with someone I trust",
    checkingItems: [
      "Sit somewhere private with your chosen person — not in a group chat.",
      "Agree beforehand: they read it first, or you read it together — pick one now.",
      "Phones on silent for everyone else until you have taken the number in.",
    ],
  },
  {
    id: "alone-then-call",
    label: "Check it alone, then call someone straight after",
    checkingItems: [
      "Check in a quiet spot, not surrounded by classmates comparing scores.",
      "Whatever the number, your next action is fixed: call your first-call person.",
      "Do not open social media or class groups before that call.",
    ],
  },
  {
    id: "someone-checks",
    label: "Someone else checks and tells me",
    checkingItems: [
      "Give your login or roll number details to your chosen person the night before.",
      "Agree exactly how they will tell you — in person and straight, no suspense.",
      "Ask them to also note the details you will need later (marks, rank, percentile).",
    ],
  },
];

/** 5-4-3-2-1 grounding technique (widely taught in anxiety first-aid). */
export const GROUNDING_STEPS = [
  "5 things you can see",
  "4 things you can feel",
  "3 things you can hear",
  "2 things you can smell",
  "1 thing you can taste",
];

/** Practical don'ts drawn from common result-day guidance. */
export const RESULT_DAY_RULES = [
  "No big decisions (dropping a year, choosing a college, announcing plans) within 24 hours of the result.",
  "Compare with your own plan, not with classmates' scores on the day.",
  "Official portals get overloaded at release time — a slow website is not a bad omen; retry after some minutes.",
  "Keep result-day social media posting for tomorrow, whichever way it goes.",
];

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Parse an ISO yyyy-mm-dd string into a UTC-midnight Date, or null. */
export function parseIsoDate(value) {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return date;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const MAX_CONTACTS = 5;

/**
 * Build the result-day plan.
 *
 * @param {object} input
 * @param {string} input.resultDateIso   Result date, yyyy-mm-dd ("" if unknown).
 * @param {string} input.todayIso        Today, yyyy-mm-dd (passed in, never read from the clock here).
 * @param {string} input.checkStyleId    One of CHECK_STYLES ids.
 * @param {string[]} input.supportContacts Names of people in the support plan.
 * @param {{better:string, expected:string, below:string}} input.scenarioActions
 *        The user's own one-line first move for each outcome (may be empty).
 * @returns {{daysToGo, isPast, dateKnown, contacts, timeline, scenarios, rules,
 *            grounding, warnings}|{error:string}}
 */
export function buildResultDayPlan({
  resultDateIso,
  todayIso,
  checkStyleId,
  supportContacts = [],
  scenarioActions = {},
}) {
  const style = CHECK_STYLES.find((s) => s.id === checkStyleId);
  if (!style) return { error: "Choose how you want to check the result." };

  const today = parseIsoDate(todayIso);
  if (!today) return { error: "Today's date is missing — reload the page and try again." };

  const dateKnown = typeof resultDateIso === "string" && resultDateIso.trim() !== "";
  let daysToGo = null;
  let isPast = false;
  if (dateKnown) {
    const resultDate = parseIsoDate(resultDateIso);
    if (!resultDate) return { error: "Enter the result date in yyyy-mm-dd form, or leave it blank." };
    daysToGo = Math.round((resultDate.getTime() - today.getTime()) / MS_PER_DAY);
    if (daysToGo < 0) {
      isPast = true;
      daysToGo = 0;
    }
  }

  if (!Array.isArray(supportContacts)) {
    return { error: "Support contacts must be a list of names." };
  }
  const contacts = supportContacts
    .map((name) => String(name ?? "").trim())
    .filter((name) => name !== "")
    .slice(0, MAX_CONTACTS);

  const firstContact = contacts[0] ?? "your chosen person";

  const warnings = [];
  if (contacts.length === 0) {
    warnings.push(
      "No support person named yet — result day goes better with at least one name written down, even if it is a helpline.",
    );
  }

  const actions = {
    better: String(scenarioActions.better ?? "").trim(),
    expected: String(scenarioActions.expected ?? "").trim(),
    below: String(scenarioActions.below ?? "").trim(),
  };

  const timeline = [
    {
      phase: "Night before",
      items: [
        "Confirm the exact portal/site and keep your roll number and credentials written down.",
        `Tell ${contacts.length > 0 ? contacts.join(", ") : "your support person"} the result timing and your plan.`,
        "Plan tomorrow's first hour to be occupied — a walk, breakfast, any fixed routine.",
      ],
    },
    {
      phase: "Before checking",
      items: [
        "Eat something first; do not check on an empty stomach with a racing heart.",
        "Re-read your three scenario first-moves — the plan exists so the number decides less.",
        "Decide the exact time you will check, instead of refreshing from early morning.",
      ],
    },
    {
      phase: "The moment of checking",
      items: style.checkingItems,
    },
    {
      phase: "First hour after",
      items: [
        `Say the result out loud to ${firstContact} — hiding a number gives it more power.`,
        "If emotions spike, run the 5-4-3-2-1 grounding steps once before any conversation.",
        "Note down the facts you will need later (marks, percentile, cut-off gap) and close the portal.",
      ],
    },
    {
      phase: "Rest of the day",
      items: [
        "Do the first move you wrote for the outcome that actually happened — nothing more today.",
        "One normal activity that has nothing to do with exams: food, a series, a game, a walk.",
        "Big decisions wait 24 hours; sleep before strategy.",
      ],
    },
  ];

  return {
    dateKnown,
    daysToGo,
    isPast,
    contacts,
    checkStyle: { id: style.id, label: style.label },
    timeline,
    scenarios: [
      { id: "better", label: "Better than expected", action: actions.better },
      { id: "expected", label: "Roughly as expected", action: actions.expected },
      { id: "below", label: "Below what I hoped", action: actions.below },
    ],
    rules: RESULT_DAY_RULES,
    grounding: GROUNDING_STEPS,
    warnings,
  };
}

/** Compile the plan into plain text for copying. */
export function compilePlanText(plan) {
  if (!plan || plan.error) return { error: "Nothing to compile yet." };
  const lines = ["Result day support plan", ""];
  if (plan.dateKnown) {
    lines.push(
      plan.isPast
        ? "Result date: already passed"
        : `Result date: in ${plan.daysToGo} day${plan.daysToGo === 1 ? "" : "s"}`,
    );
  }
  lines.push(`Checking style: ${plan.checkStyle.label}`);
  lines.push(
    `Support: ${plan.contacts.length > 0 ? plan.contacts.join(", ") : "(no one named yet)"}`,
    "",
  );
  for (const block of plan.timeline) {
    lines.push(`${block.phase}:`);
    for (const item of block.items) lines.push(`- ${item}`);
    lines.push("");
  }
  lines.push("First move per outcome:");
  for (const scenario of plan.scenarios) {
    lines.push(`- ${scenario.label}: ${scenario.action || "(not written yet)"}`);
  }
  return { text: lines.join("\n") };
}
