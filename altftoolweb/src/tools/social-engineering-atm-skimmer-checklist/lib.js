/**
 * ATM Skimmer Inspection Checklist — inspection routine and verdict rules.
 *
 * Pure module: no React, no DOM, no clock reads.
 *
 * The steps below are the standard physical checks published by card networks,
 * police cyber cells and bank fraud advisories. Three of them are treated as
 * STOP findings because each one, on its own, means the machine has been
 * physically tampered with and no amount of care makes it safe to use:
 *   1. A card slot that moves, wobbles or lifts (an overlay skimmer).
 *   2. A keypad that sits proud, feels spongy or is a different colour
 *      (an overlay keypad that records the PIN as you type it).
 *   3. A pinhole, mirror or extra fascia above the keypad (a PIN camera).
 * The remaining checks are graded by how strongly they indicate tampering
 * versus an ATM that is merely poorly maintained.
 */

/** Weight ladder. STOP findings bypass the arithmetic entirely. */
export const WEIGHT_STOP = 40;
export const WEIGHT_HIGH = 15;
export const WEIGHT_MEDIUM = 8;
export const WEIGHT_LOW = 4;

/** Risk sum at which the guidance becomes "walk to another machine". */
export const AVOID_THRESHOLD = 20;
/** Risk sum at which the guidance becomes "proceed, but with extra care". */
export const CAUTION_THRESHOLD = 8;

/** Status values a step can hold. */
export const STATUS = { UNCHECKED: "unchecked", OK: "ok", PROBLEM: "problem" };

export const CHECK_GROUPS = [
  {
    id: "approach",
    title: "Before you touch anything",
    steps: [
      {
        id: "location",
        label: "The ATM is lit, overlooked and not tucked away in a blind corner",
        how: "Skimmer crews prefer machines with no queue and no line of sight from staff.",
        severity: "medium",
        seconds: 5,
      },
      {
        id: "camera",
        label: "The bank's own CCTV dome above the machine is present and unobstructed",
        how: "A taped-over or missing dome is a sign someone did not want to be recorded.",
        severity: "medium",
        seconds: 5,
      },
      {
        id: "branding",
        label: "Bank name, ATM ID and a 24x7 helpline number are printed on the fascia",
        how: "You need the ATM ID to report a card capture or a short dispense.",
        severity: "low",
        seconds: 5,
      },
      {
        id: "notices",
        label: "No handwritten notice telling you to use a different slot or a nearby machine",
        how: "Fake 'out of order' and 'swipe card here' notices are used to steer you onto a skimmer.",
        severity: "high",
        seconds: 5,
      },
    ],
  },
  {
    id: "cardslot",
    title: "The card slot",
    steps: [
      {
        id: "slotWobble",
        label: "The card slot does not move, wobble, lift or come away when you tug it",
        how: "Grip the slot and pull firmly. Bank hardware is bolted through the fascia; an overlay is glued on.",
        severity: "stop",
        seconds: 8,
      },
      {
        id: "slotColour",
        label: "The slot matches the rest of the fascia in colour, finish and wear",
        how: "Compare against another machine in the same lobby if there is one.",
        severity: "high",
        seconds: 5,
      },
      {
        id: "glue",
        label: "No glue residue, tape, fresh scratches or gaps around the slot or screen bezel",
        how: "Adhesive smear at the edges is the most common leftover of a fitted overlay.",
        severity: "high",
        seconds: 5,
      },
      {
        id: "greenLight",
        label: "The flashing card-slot indicator is visible and not covered by anything",
        how: "Overlays often sit over the light or block it entirely.",
        severity: "medium",
        seconds: 4,
      },
    ],
  },
  {
    id: "keypad",
    title: "The keypad and the area above it",
    steps: [
      {
        id: "keypadOverlay",
        label: "The keypad is flush with the panel, keys feel firm, and it does not lift at a corner",
        how: "Press a corner. An overlay flexes; the moulded metal keypad does not.",
        severity: "stop",
        seconds: 8,
      },
      {
        id: "pinhole",
        label: "No pinhole, mirror, plastic strip or extra panel above or beside the keypad",
        how: "PIN cameras hide in a false brochure holder, a light bar or a speaker grille.",
        severity: "stop",
        seconds: 8,
      },
      {
        id: "leaflet",
        label: "Any leaflet holder or side panel faces outward, not down at the keypad",
        how: "A holder angled towards the keys is a camera housing until proven otherwise.",
        severity: "high",
        seconds: 5,
      },
      {
        id: "shield",
        label: "The moulded privacy shield around the keypad is intact and original",
        how: "A removed or replaced shield gives a hidden camera a clear view.",
        severity: "medium",
        seconds: 4,
      },
    ],
  },
  {
    id: "during",
    title: "While you transact",
    steps: [
      {
        id: "coverPin",
        label: "You will cover the keypad with your free hand while entering the PIN",
        how: "This defeats every overhead camera even when you missed spotting it.",
        severity: "high",
        seconds: 2,
      },
      {
        id: "dispenser",
        label: "The cash dispenser shutter looks standard and has nothing wedged inside it",
        how: "Cash-trapping claws hold the notes back so a waiting thief collects them after you leave.",
        severity: "high",
        seconds: 5,
      },
      {
        id: "helper",
        label: "Nobody is offering to help, hovering close, or watching the keypad",
        how: "Distraction plus card swap is still the most common ATM loss, with no electronics involved.",
        severity: "high",
        seconds: 4,
      },
      {
        id: "alerts",
        label: "SMS or app alerts are switched on so a wrong debit reaches you within minutes",
        how: "Alerts turn a silent skim into something you can dispute the same day.",
        severity: "medium",
        seconds: 4,
      },
    ],
  },
];

export const ALL_STEPS = CHECK_GROUPS.flatMap((group) => group.steps);

const STEP_BY_ID = new Map(ALL_STEPS.map((step) => [step.id, step]));

const SEVERITY_WEIGHT = {
  stop: WEIGHT_STOP,
  high: WEIGHT_HIGH,
  medium: WEIGHT_MEDIUM,
  low: WEIGHT_LOW,
};

export const SEVERITY_LABEL = {
  stop: "Stop finding",
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const VERDICTS = {
  stop: {
    id: "stop",
    label: "Do not use this ATM",
    tone: "danger",
    advice:
      "A stop finding means the machine has been physically altered. Take your card, do not enter a PIN, and report the ATM ID to the bank's helpline so it can be taken out of service.",
  },
  avoid: {
    id: "avoid",
    label: "Use another machine if you can",
    tone: "danger",
    advice:
      "Several problems together are enough reason to walk. If you must use it, withdraw the minimum, cover the keypad, and check your balance afterwards.",
  },
  caution: {
    id: "caution",
    label: "Proceed with extra care",
    tone: "warning",
    advice:
      "Nothing points at tampering, but the environment is not ideal. Cover the keypad, take your receipt, and confirm the debit in your banking app before you leave the lobby.",
  },
  incomplete: {
    id: "incomplete",
    label: "Finish the inspection first",
    tone: "warning",
    advice: "Work through the remaining checks — the full routine takes under 90 seconds.",
  },
  clear: {
    id: "clear",
    label: "Checks passed",
    tone: "success",
    advice:
      "Nothing suspicious found. Still cover the keypad while typing your PIN and keep transaction alerts on.",
  },
};

/** Total seconds the full routine takes if nothing goes wrong. */
export const TOTAL_SECONDS = ALL_STEPS.reduce((sum, step) => sum + step.seconds, 0);

/**
 * Turn a status map into a verdict.
 *
 * @param {object} input
 * @param {Record<string,string>} input.statuses  step id -> STATUS value
 * @returns {object} verdict data, or { error } when the input is unusable
 */
export function evaluateInspection({ statuses = {} } = {}) {
  if (!statuses || typeof statuses !== "object" || Array.isArray(statuses)) {
    return { error: "Mark each check as fine or a problem to get a verdict." };
  }

  const entries = Object.entries(statuses);
  const badKey = entries.find(([id]) => !STEP_BY_ID.has(id));
  if (badKey) return { error: "One of the checks is not part of this routine." };

  const badValue = entries.find(([, value]) => !Object.values(STATUS).includes(value));
  if (badValue) return { error: "Each check must be unchecked, fine, or a problem." };

  const problems = [];
  const passed = [];
  const pending = [];

  ALL_STEPS.forEach((step) => {
    const status = statuses[step.id] || STATUS.UNCHECKED;
    if (status === STATUS.PROBLEM) problems.push(step);
    else if (status === STATUS.OK) passed.push(step);
    else pending.push(step);
  });

  const riskScore = problems.reduce((sum, step) => sum + SEVERITY_WEIGHT[step.severity], 0);
  const stopFindings = problems.filter((step) => step.severity === "stop");
  const checkedCount = problems.length + passed.length;
  const coverage = ALL_STEPS.length > 0 ? Math.round((checkedCount / ALL_STEPS.length) * 100) : 0;
  const secondsRemaining = pending.reduce((sum, step) => sum + step.seconds, 0);

  let verdict;
  if (stopFindings.length > 0) verdict = VERDICTS.stop;
  else if (riskScore >= AVOID_THRESHOLD) verdict = VERDICTS.avoid;
  // Any problem at all, however minor, keeps the verdict at caution or worse.
  else if (riskScore >= CAUTION_THRESHOLD || problems.length > 0) verdict = VERDICTS.caution;
  else if (pending.length > 0) verdict = VERDICTS.incomplete;
  else verdict = VERDICTS.clear;

  const orderedProblems = [...problems].sort(
    (a, b) => SEVERITY_WEIGHT[b.severity] - SEVERITY_WEIGHT[a.severity],
  );

  return {
    verdict,
    riskScore,
    stopFindings,
    problems: orderedProblems,
    passed,
    pending,
    coverage,
    checkedCount,
    totalSteps: ALL_STEPS.length,
    secondsRemaining,
    totalSeconds: TOTAL_SECONDS,
  };
}

/** Plain-text summary for the copy button. Pure. */
export function formatInspection(result) {
  if (!result || result.error) return "";
  const lines = [
    "ATM skimmer inspection",
    `Verdict: ${result.verdict.label}`,
    `Checks completed: ${result.checkedCount}/${result.totalSteps} (${result.coverage}%)`,
    `Risk score from problems found: ${result.riskScore}`,
  ];
  if (result.problems.length > 0) {
    lines.push("", "Problems found:");
    result.problems.forEach((step) =>
      lines.push(`- [${SEVERITY_LABEL[step.severity]}] ${step.label}`),
    );
  }
  if (result.pending.length > 0) {
    lines.push("", "Still to check:");
    result.pending.forEach((step) => lines.push(`- ${step.label}`));
  }
  lines.push("", result.verdict.advice);
  return lines.join("\n");
}
