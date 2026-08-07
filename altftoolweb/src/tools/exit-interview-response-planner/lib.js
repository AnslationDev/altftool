/**
 * Exit interview planner.
 *
 * Two explicit models are used, both stated so the output is auditable:
 *
 * 1. Driver ranking. You rate each reason for leaving from 0 to 5. Each reason
 *    carries an ACTIONABILITY weight of 1 to 3 — how far the employer can
 *    actually change the thing you are describing. Feedback on a high
 *    actionability item is what an exit interview can use; feedback on
 *    something structural mostly is not. Rank = rating x weight, expressed as a
 *    share of the total. This is why a slightly lower-rated but highly
 *    actionable reason can outrank a top-rated structural one.
 *
 * 2. Disclosure risk. A rubric, not a measurement: a base figure per candour
 *    level, plus fixed increments for naming individuals, for raising a maxed-out
 *    grievance, and for wanting to be rehired later while speaking candidly.
 *    It is a prompt to think, not a prediction.
 *
 * An exit interview is not confidential unless your employer says in writing
 * that it is, and notes from it are usually retained on the employee file.
 * Anything involving harassment, discrimination or unlawful conduct belongs in
 * a written complaint through the formal channel, not in an exit interview.
 */

export const CANDOUR_LEVELS = [
  {
    id: "guarded",
    label: "Guarded — say little, protect the reference",
    baseRisk: 10,
    note: "Neutral, factual, forward-looking. Nothing that can be quoted back.",
  },
  {
    id: "balanced",
    label: "Balanced — honest about patterns, not people",
    baseRisk: 35,
    note: "Names problems as processes rather than individuals. The default most people should use.",
  },
  {
    id: "candid",
    label: "Candid — say what actually happened",
    baseRisk: 65,
    note: "Only worth it when you have nothing riding on this employer and something needs to be on record.",
  },
];

/** Rating scale used for each driver. */
export const MAX_RATING = 5;

/** Risk added when you intend to name specific individuals. */
export const RISK_NAMING_INDIVIDUALS = 20;

/** Risk added when any driver is rated at the top of the scale and you are not
 *  being guarded — a maxed-out grievance tends to be delivered with heat. */
export const RISK_MAXED_GRIEVANCE = 10;

/** Risk added when you would consider returning but plan to speak candidly. */
export const RISK_REHIRE_CONFLICT = 15;

export const DRIVERS = [
  { id: "compensation", label: "Pay and benefits", weight: 2, theme: "the compensation band for this role" },
  { id: "growth", label: "Career growth and promotion", weight: 3, theme: "the path from this role to the next one" },
  { id: "manager", label: "Relationship with the manager", weight: 3, theme: "how work was prioritised and reviewed" },
  { id: "workload", label: "Workload and hours", weight: 3, theme: "the volume of work carried by the team" },
  { id: "wlb", label: "Work-life balance", weight: 3, theme: "the expectations around availability outside hours" },
  { id: "culture", label: "Team culture", weight: 2, theme: "how decisions and disagreements were handled" },
  { id: "recognition", label: "Recognition for work done", weight: 2, theme: "how contribution was acknowledged" },
  { id: "role-fit", label: "The work itself was not what I wanted", weight: 3, theme: "the shape of the role against what I want to do" },
  { id: "tools", label: "Tools, process and support", weight: 3, theme: "the tooling and process the team works with" },
  { id: "stability", label: "Company direction or stability", weight: 1, theme: "the direction the business is taking" },
  { id: "commute", label: "Commute or location policy", weight: 1, theme: "the location and attendance policy" },
  { id: "personal", label: "Personal or family reasons", weight: 1, theme: "circumstances outside work" },
];

export const QUESTIONS = [
  { id: "why-leaving", question: "Why are you leaving?" },
  { id: "liked-most", question: "What did you enjoy most about working here?" },
  { id: "could-have-kept", question: "Is there anything we could have done to keep you?" },
  { id: "manager", question: "How would you describe your relationship with your manager?" },
  { id: "support", question: "Did you have the tools, training and support you needed?" },
  { id: "recommend", question: "Would you recommend this company to a friend?" },
  { id: "return", question: "Would you consider coming back in the future?" },
  { id: "anything-else", question: "Is there anything else you would like to share?" },
];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const round1 = (value) => Math.round(value * 10) / 10;

/**
 * Rank the reasons for leaving and score the disclosure risk.
 * @returns {object} { error } or the profile.
 */
export function computeExitProfile({
  ratings = {},
  candourId = "balanced",
  namesIndividuals = false,
  wouldReturn = false,
}) {
  const candour = CANDOUR_LEVELS.find((level) => level.id === candourId) || CANDOUR_LEVELS[1];

  const entries = [];
  for (const driver of DRIVERS) {
    const raw = ratings[driver.id];
    const rating = typeof raw === "number" ? raw : Number(raw);
    if (!Number.isFinite(rating)) continue;
    if (rating < 0 || rating > MAX_RATING) {
      return { error: `Ratings must be between 0 and ${MAX_RATING}.` };
    }
    if (rating > 0) entries.push({ ...driver, rating, score: rating * driver.weight });
  }

  if (entries.length === 0) {
    return { error: "Rate at least one reason for leaving above zero." };
  }

  const totalScore = entries.reduce((sum, entry) => sum + entry.score, 0);
  const ranked = entries
    .map((entry) => ({ ...entry, sharePct: round1((entry.score / totalScore) * 100) }))
    .sort((a, b) => b.score - a.score || b.rating - a.rating);

  const primary = ranked[0];
  const secondary = ranked[1] || null;
  const maxedOut = ranked.filter((entry) => entry.rating === MAX_RATING);

  let risk = candour.baseRisk;
  if (namesIndividuals) risk += RISK_NAMING_INDIVIDUALS;
  if (maxedOut.length > 0 && candour.id !== "guarded") risk += RISK_MAXED_GRIEVANCE;
  if (wouldReturn && candour.id === "candid") risk += RISK_REHIRE_CONFLICT;
  risk = clamp(risk, 0, 100);

  const band =
    risk >= 70 ? "high" : risk >= 40 ? "moderate" : "low";

  const cautions = [];
  if (namesIndividuals) {
    cautions.push(
      "Naming individuals turns feedback into an allegation. Describe the behaviour and its effect instead, and keep names for a formal written complaint where they belong.",
    );
  }
  if (wouldReturn && candour.id === "candid") {
    cautions.push(
      "You said you would consider returning. Candid criticism sits on the employee file that a rehire decision is made from — pick one or the other.",
    );
  }
  if (maxedOut.length > 0) {
    cautions.push(
      `You rated ${maxedOut.map((entry) => entry.label.toLowerCase()).join(" and ")} at the top of the scale. Write those answers down before the meeting rather than improvising them.`,
    );
  }
  if (candour.id === "candid") {
    cautions.push(
      "An exit interview is not confidential unless your employer says so in writing, and the notes usually stay on your file.",
    );
  }
  if (cautions.length === 0) {
    cautions.push("Nothing here is high risk. Keep answers short and stop talking once you have made the point.");
  }

  return {
    ranked,
    primary,
    secondary,
    totalScore,
    candour,
    risk,
    band,
    cautions,
    namesIndividuals: Boolean(namesIndividuals),
    wouldReturn: Boolean(wouldReturn),
  };
}

const clean = (value) => (typeof value === "string" ? value.trim() : "");

/**
 * Build a calibrated answer for each selected question.
 * Pure string composition driven by the profile.
 */
export function buildAnswers({ profile, questionIds = [], positiveNote, companyName, roleName }) {
  if (!profile || profile.error) {
    return { error: profile?.error || "Rate your reasons for leaving first." };
  }
  const company = clean(companyName) || "the company";
  const role = clean(roleName) || "the role";
  const good = clean(positiveNote) || "the people I worked with day to day";
  const level = profile.candour.id;
  const primary = profile.primary;
  const secondary = profile.secondary;

  const byQuestion = {
    "why-leaving": {
      guarded: `I have accepted a role that fits where I want to take my career. It was a considered decision rather than a reaction to anything specific here.`,
      balanced: `The main factor was ${primary.theme}. I have taken a role where that is set up differently. ${secondary ? `${secondary.theme.charAt(0).toUpperCase()}${secondary.theme.slice(1)} was a secondary consideration.` : ""}`,
      candid: `The decisive factor was ${primary.theme}, and it did not change over the time I raised it. ${secondary ? `${secondary.theme.charAt(0).toUpperCase()}${secondary.theme.slice(1)} added to it.` : ""} I would rather be straight about that than give you a vague answer you cannot use.`,
    },
    "liked-most": {
      guarded: `${good.charAt(0).toUpperCase()}${good.slice(1)}. That is the part I will miss.`,
      balanced: `${good.charAt(0).toUpperCase()}${good.slice(1)}. I learnt a lot in ${role} and I would not have stayed as long as I did otherwise.`,
      candid: `${good.charAt(0).toUpperCase()}${good.slice(1)}. Whatever else I say today, that part was genuine.`,
    },
    "could-have-kept": {
      guarded: `Not really — the timing of the opportunity was the deciding factor.`,
      balanced: `Realistically, a concrete change to ${primary.theme} some months ago, rather than a counter-offer now. By the time a decision like this is made it is usually too late to reverse it.`,
      candid: `Yes. A concrete change to ${primary.theme}, with a date attached, when I first raised it. A counter-offer at this stage would only confirm that it took a resignation to get movement.`,
    },
    manager: {
      guarded: `Professional and workable. We had a clear enough working relationship.`,
      balanced: `Cordial. Where it was harder was ${primary.id === "manager" ? "around how priorities were set and reviewed" : "around " + primary.theme}, and I would frame that as a process issue rather than a personal one.`,
      candid: `Cordial on the surface. The recurring problem was ${primary.id === "manager" ? "that priorities changed without the previous ones being closed out, and that feedback ran one way" : primary.theme}. I raised it more than once.`,
    },
    support: {
      guarded: `Broadly, yes. Nothing I would call a blocker.`,
      balanced: `Mostly. The gap was ${primary.id === "tools" ? "in the tooling and the process around it" : "in " + primary.theme}, which cost more time than it should have.`,
      candid: `Not consistently. ${primary.id === "tools" ? "The tooling and process were the biggest drag on output" : `The gap in ${primary.theme}`} was raised repeatedly and did not move, and that is time the team will keep losing.`,
    },
    recommend: {
      guarded: `For the right person and the right team, yes.`,
      balanced: `Yes, with the caveat that I would tell them to ask specifically about ${primary.theme} before they accept.`,
      candid: `I would tell them the truth: good people, and a real problem with ${primary.theme}. Whether that is a deal-breaker depends on what they are optimising for.`,
    },
    return: {
      guarded: profile.wouldReturn
        ? `I would certainly look at it if the right role came up.`
        : `I am focused on the next step, so I would not want to speculate.`,
      balanced: profile.wouldReturn
        ? `Yes, if ${primary.theme} looked different by then. I am leaving on good terms and I would keep in touch.`
        : `I would not rule anything out, but I am not planning on it.`,
      candid: profile.wouldReturn
        ? `Yes, if ${primary.theme} had genuinely changed — not just been reworded.`
        : `Honestly, no, unless ${primary.theme} were rebuilt rather than adjusted.`,
    },
    "anything-else": {
      guarded: `Only to say thank you for the opportunity, and that I will make sure the handover is complete.`,
      balanced: `One thing worth passing on: ${primary.theme} is the item I would look at hardest, because I doubt I am the only one who left over it. Otherwise, thank you — the handover is documented and I am available for questions afterwards.`,
      candid: `Yes. ${primary.theme.charAt(0).toUpperCase()}${primary.theme.slice(1)} is not a me-problem, and you will keep paying for it in attrition until it is addressed. I am saying it because it is useful, not because I want anything from it. The handover is complete either way.`,
    },
  };

  const wanted = Array.isArray(questionIds) ? questionIds : QUESTIONS.map((entry) => entry.id);
  const answers = QUESTIONS.filter((entry) => wanted.includes(entry.id)).map((entry) => ({
    id: entry.id,
    question: entry.question,
    answer: (byQuestion[entry.id] || {})[level] || "",
  }));

  const script = [
    `Exit interview notes — ${role} at ${company}`,
    `Approach: ${profile.candour.label}`,
    `Leading reason: ${profile.primary.label} (${profile.primary.sharePct}% of the weighted total)`,
    "",
    ...answers.flatMap((entry) => [`Q: ${entry.question}`, `A: ${entry.answer}`, ""]),
    "Reminders:",
    ...profile.cautions.map((caution) => `- ${caution}`),
  ]
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return { answers, script, wordCount: script.split(/\s+/).filter(Boolean).length };
}
