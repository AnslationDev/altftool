/**
 * Burnout self-check.
 *
 * Model: burnout is described in the occupational-health literature (Maslach &
 * Leiter; adopted in ICD-11 as an occupational phenomenon, not a medical
 * condition) as three separate dimensions rather than one feeling:
 *   1. Exhaustion            - energy depletion.
 *   2. Cynicism / distance   - mental distance from, or negativism about, the job.
 *   3. Professional efficacy - sense of accomplishment at work (scored positively).
 * ICD-11 (code QD85) lists exactly these three: energy depletion, increased mental
 * distance or negativism, and reduced professional efficacy.
 *
 * Rating scale: 0-6 by how often the statement is true, the standard frequency
 * anchoring used for occupational burnout questionnaires
 * (0 never ... 6 every working day).
 *
 * Item wording is written for this page. The band thresholds below are defined
 * here for interpretation only - published burnout instruments deliberately avoid
 * clinical cut-offs, so nothing here is a diagnosis.
 */

export const MIN_RATING = 0;
export const MAX_RATING = 6;

/** Frequency anchors for every item. */
export const FREQUENCY_OPTIONS = [
  { value: 0, label: "Never" },
  { value: 1, label: "A few times a year" },
  { value: 2, label: "About once a month" },
  { value: 3, label: "A few times a month" },
  { value: 4, label: "About once a week" },
  { value: 5, label: "A few times a week" },
  { value: 6, label: "Every working day" },
];

export const DIMENSIONS = {
  exhaustion: {
    key: "exhaustion",
    label: "Exhaustion",
    blurb: "Energy depletion - how empty the job leaves you.",
    higherIsWorse: true,
  },
  cynicism: {
    key: "cynicism",
    label: "Cynicism and distance",
    blurb: "Mental distance from the job and the people in it.",
    higherIsWorse: true,
  },
  efficacy: {
    key: "efficacy",
    label: "Professional efficacy",
    blurb: "Sense of competence and accomplishment at work.",
    higherIsWorse: false,
  },
};

export const BURNOUT_ITEMS = [
  { id: "e1", dimension: "exhaustion", text: "Felt drained by the time the working day ends" },
  { id: "e2", dimension: "exhaustion", text: "Woken up already tired at the thought of the day ahead" },
  { id: "e3", dimension: "exhaustion", text: "Felt you had nothing left to give by the middle of the week" },
  { id: "e4", dimension: "exhaustion", text: "Found that a weekend or a day off no longer restores you" },
  { id: "c1", dimension: "cynicism", text: "Felt detached or indifferent about the work you produce" },
  { id: "c2", dimension: "cynicism", text: "Been short or dismissive with colleagues, clients or patients" },
  { id: "c3", dimension: "cynicism", text: "Doubted that the work you do matters to anyone" },
  { id: "c4", dimension: "cynicism", text: "Done only the minimum required and switched off from the rest" },
  { id: "f1", dimension: "efficacy", text: "Felt confident that you are handling the demands of your role" },
  { id: "f2", dimension: "efficacy", text: "Dealt effectively with the problems people bring to you" },
  { id: "f3", dimension: "efficacy", text: "Felt you accomplished something worthwhile at work" },
  { id: "f4", dimension: "efficacy", text: "Felt energised after solving a difficult problem" },
];

/** Band edges on the 0-6 item mean. Defined for this page, not clinical cut-offs. */
export const BAND_LOW_MAX = 2; // mean below 2 = "low"
export const BAND_HIGH_MIN = 4; // mean 4 and above = "high"

const round1 = (value) => Math.round(value * 10) / 10;

const isRating = (value) =>
  typeof value === "number" && Number.isInteger(value) && value >= MIN_RATING && value <= MAX_RATING;

/** Low / moderate / high on the raw 0-6 mean, before any "is this good or bad" reading. */
export function levelForMean(mean) {
  if (typeof mean !== "number" || !Number.isFinite(mean)) return null;
  if (mean < BAND_LOW_MAX) return "low";
  if (mean < BAND_HIGH_MIN) return "moderate";
  return "high";
}

export const PROFILES = {
  engaged: {
    key: "engaged",
    label: "Engaged",
    summary:
      "Low exhaustion, low cynicism and a strong sense of doing the job well - the pattern the research calls engagement.",
    actions: [
      "Note what is protecting you right now: workload ceilings, control over your day, or a manager who removes obstacles.",
      "Re-run this check after any major change of role, team or workload.",
    ],
  },
  overextended: {
    key: "overextended",
    label: "Overextended",
    summary:
      "Exhaustion is high but you still believe in the work and feel effective. This is a workload problem, not a motivation problem.",
    actions: [
      "Attack the volume: cut, defer or hand over at least one recurring commitment this month.",
      "Protect a genuine recovery block - detachment from work in the evening predicts next-day energy better than sleep length alone.",
      "Raise it with your manager as a capacity conversation while you still have the goodwill to have it.",
    ],
  },
  disengaged: {
    key: "disengaged",
    label: "Disengaged",
    summary:
      "Energy is holding up but you have pulled away mentally - cynicism about the work, the organisation or the people in it.",
    actions: [
      "Name the specific thing you have stopped believing in: the task, the outcome, the fairness of it, or the leadership.",
      "Look at values and fairness rather than hours - distance usually follows a mismatch, not tiredness.",
      "Reconnect with one part of the job that still produces a visible result.",
    ],
  },
  ineffective: {
    key: "ineffective",
    label: "Ineffective",
    summary:
      "Energy and attitude are reasonable, but your sense of accomplishment is low. Often a feedback, skills or clarity gap.",
    actions: [
      "Ask for concrete feedback - low efficacy is frequently a visibility problem rather than a performance one.",
      "Break work into pieces that finish, so there is something to point at each week.",
      "Check whether the role has drifted away from what you are actually good at.",
    ],
  },
  burnout: {
    key: "burnout",
    label: "Burnout pattern",
    summary:
      "High exhaustion, high cynicism and low efficacy together - the full three-dimension pattern. This rarely resolves by trying harder.",
    actions: [
      "Speak to a doctor or occupational health professional, particularly if sleep, appetite or mood have changed.",
      "Reduce load before adding coping strategies; recovery needs the demand to come down first.",
      "Treat this as a work-design issue with your manager or HR, not only a personal resilience issue.",
      "If you have thoughts of harming yourself, contact your local emergency number or a crisis line straight away.",
    ],
  },
  mixed: {
    key: "mixed",
    label: "Mixed pattern",
    summary:
      "Your three dimensions do not fall into one clean profile. Read each dimension on its own rather than the overall label.",
    actions: [
      "Start with whichever dimension scored furthest from where you want it.",
      "Re-take the check in two to four weeks to see whether it is a bad patch or a trend.",
    ],
  },
};

/**
 * Score a completed burnout self-check.
 *
 * @param {Record<string, number>} answers item id -> 0..6 rating
 * @returns {object} dimension scores and profile, or { error } when incomplete
 */
export function scoreBurnoutCheck(answers) {
  if (!answers || typeof answers !== "object") {
    return { error: "Answer all twelve statements to see a result." };
  }
  const missing = BURNOUT_ITEMS.filter((item) => !isRating(answers[item.id])).map((item) => item.id);
  if (missing.length > 0) {
    return {
      error: `Answer all twelve statements - ${missing.length} still ${
        missing.length === 1 ? "needs" : "need"
      } a response.`,
      missing,
    };
  }

  const scores = {};
  Object.keys(DIMENSIONS).forEach((key) => {
    const items = BURNOUT_ITEMS.filter((item) => item.dimension === key);
    const sum = items.reduce((acc, item) => acc + answers[item.id], 0);
    const mean = sum / items.length;
    const level = levelForMean(mean);
    scores[key] = {
      key,
      label: DIMENSIONS[key].label,
      blurb: DIMENSIONS[key].blurb,
      items: items.length,
      sum,
      max: items.length * MAX_RATING,
      mean: round1(mean),
      level,
      // "concerning" reads the level in the right direction for the dimension.
      concerning: DIMENSIONS[key].higherIsWorse ? level === "high" : level === "low",
      healthy: DIMENSIONS[key].higherIsWorse ? level === "low" : level === "high",
      percent: Math.round((sum / (items.length * MAX_RATING)) * 100),
    };
  });

  const exh = scores.exhaustion;
  const cyn = scores.cynicism;
  const eff = scores.efficacy;

  let profileKey;
  if (exh.level === "high" && cyn.level === "high" && eff.level === "low") profileKey = "burnout";
  else if (exh.level === "low" && cyn.level === "low" && eff.level === "high") profileKey = "engaged";
  else if (exh.level === "high" && cyn.level !== "high" && eff.level !== "low") profileKey = "overextended";
  else if (cyn.level === "high" && exh.level !== "high") profileKey = "disengaged";
  else if (eff.level === "low" && exh.level !== "high" && cyn.level !== "high") profileKey = "ineffective";
  else profileKey = "mixed";

  const profile = PROFILES[profileKey];

  // Composite risk on the same 0-6 scale: efficacy is flipped so higher always means worse.
  const riskScore = round1((exh.mean + cyn.mean + (MAX_RATING - eff.mean)) / 3);

  return {
    scores,
    dimensionOrder: ["exhaustion", "cynicism", "efficacy"],
    profileKey,
    profileLabel: profile.label,
    profileSummary: profile.summary,
    actions: profile.actions,
    riskScore,
    riskPercent: Math.round((riskScore / MAX_RATING) * 100),
    concerningCount: [exh, cyn, eff].filter((d) => d.concerning).length,
  };
}

/**
 * Summarise a saved log of past checks. Dates are supplied by the caller as
 * ISO YYYY-MM-DD strings so this stays pure.
 *
 * @param {Array<{date: string, exhaustion: number, cynicism: number, efficacy: number, riskScore: number}>} entries
 */
export function summariseTrend(entries) {
  if (!Array.isArray(entries) || entries.length === 0) {
    return { count: 0, latest: null, previous: null, deltas: null, direction: "none" };
  }
  const sorted = [...entries].sort((a, b) => String(a.date).localeCompare(String(b.date)));
  const latest = sorted[sorted.length - 1];
  const previous = sorted.length > 1 ? sorted[sorted.length - 2] : null;
  if (!previous) {
    return { count: sorted.length, sorted, latest, previous: null, deltas: null, direction: "first" };
  }
  const delta = (key) => round1((Number(latest[key]) || 0) - (Number(previous[key]) || 0));
  const deltas = {
    exhaustion: delta("exhaustion"),
    cynicism: delta("cynicism"),
    efficacy: delta("efficacy"),
    riskScore: delta("riskScore"),
  };
  let direction = "steady";
  if (deltas.riskScore <= -0.3) direction = "improving";
  else if (deltas.riskScore >= 0.3) direction = "worsening";
  return { count: sorted.length, sorted, latest, previous, deltas, direction };
}
