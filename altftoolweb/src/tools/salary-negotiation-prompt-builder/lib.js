/**
 * Salary Negotiation Prompt Builder — pure logic.
 *
 * Two things happen here:
 *  1. Real compensation arithmetic (compa-ratio and range penetration, the two
 *     standard measures HR teams use to place an offer inside a salary band).
 *  2. Deterministic assembly of a roleplay prompt string from those numbers.
 *
 * No React, no DOM, no clocks. Same input -> same output.
 */

/**
 * OpenAI's published rule of thumb for English text: roughly 4 characters per
 * token. Used only to warn when a prompt is getting long, never for billing.
 * https://platform.openai.com/tokenizer
 */
export const CHARS_PER_TOKEN = 4;

/** Guard rails so a typo cannot produce an absurd rehearsal script. */
export const MAX_ROUNDS = 10;
export const MIN_ROUNDS = 1;
/** A raise ask above this multiple of current pay is almost certainly a typo. */
export const MAX_TARGET_MULTIPLE = 10;

/** Counterpart personas. Each line is injected verbatim as the roleplay brief. */
export const COUNTERPART_STYLES = {
  "budget-constrained": {
    label: "Budget-constrained manager",
    brief:
      "You genuinely want to keep me but you insist the band is frozen this cycle. Push non-cash alternatives before you move on base.",
  },
  "data-driven": {
    label: "Data-driven HR partner",
    brief:
      "You answer every claim with benchmark data and internal equity arguments. Ask me for the source of any number I quote.",
  },
  "hard-bargainer": {
    label: "Hard bargainer",
    brief:
      "You anchor low, use silence, and treat the first number I say as a ceiling. Do not concede without a concrete justification.",
  },
  "friendly-avoidant": {
    label: "Friendly but avoidant",
    brief:
      "You are warm and agreeable but keep deferring the decision. Try to end the meeting without committing to anything.",
  },
  "competing-offer": {
    label: "Recruiter with a competing offer on the table",
    brief:
      "You are hiring me and know I have another offer. Probe for the exact number and try to close me today.",
  },
};

/** Tone of my own side of the rehearsal. */
export const TONES = {
  collaborative: "Collaborative and evidence-led, never adversarial.",
  assertive: "Assertive and direct, comfortable with silence and with saying no.",
  cautious: "Cautious and relationship-first, protecting the long-term working relationship.",
};

/** Levers the model should be told to test, beyond base pay. */
export const LEVERS = [
  "Base salary",
  "Signing bonus",
  "Annual bonus target",
  "Equity or stock options",
  "Title and level",
  "Remote or hybrid days",
  "Learning and conference budget",
  "Extra paid leave",
  "Guaranteed review date",
  "Severance or notice terms",
];

function formatMoney(value, currency) {
  if (!Number.isFinite(value)) return "n/a";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${currency} ${Math.round(value).toLocaleString("en-US")}`;
  }
}

function clean(text) {
  return String(text ?? "").trim();
}

function round(value, places = 1) {
  if (!Number.isFinite(value)) return null;
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

/**
 * Compa-ratio = pay / band midpoint. 1.00 means paid exactly at midpoint.
 * Standard compensation measure; below 0.80 or above 1.20 usually needs a
 * written justification in most banding policies.
 */
export function compaRatio(pay, bandLow, bandHigh) {
  const midpoint = (bandLow + bandHigh) / 2;
  if (!(midpoint > 0)) return null;
  return pay / midpoint;
}

/**
 * Range penetration = (pay - min) / (max - min), expressed as a percentage.
 * Shows how far up the band a number sits. Undefined for a zero-width band.
 */
export function rangePenetration(pay, bandLow, bandHigh) {
  const width = bandHigh - bandLow;
  if (!(width > 0)) return null;
  return ((pay - bandLow) / width) * 100;
}

/**
 * Build the rehearsal prompt.
 *
 * @returns {{error: string} | {
 *   prompt: string, increaseAmount: number, increasePct: number|null,
 *   midpoint: number|null, compaRatio: number|null, penetration: number|null,
 *   bandVerdict: string, wordCount: number, tokenEstimate: number
 * }}
 */
export function buildSalaryNegotiationPrompt({
  role = "",
  company = "",
  currency = "USD",
  currentSalary = 0,
  targetSalary = 0,
  marketLow = 0,
  marketHigh = 0,
  counterpartStyle = "budget-constrained",
  tone = "collaborative",
  rounds = 4,
  levers = [],
  achievements = "",
  constraints = "",
} = {}) {
  const roleText = clean(role);
  const companyText = clean(company);
  const currencyCode = clean(currency).toUpperCase() || "USD";

  const current = Number(currentSalary);
  const target = Number(targetSalary);
  const low = Number(marketLow);
  const high = Number(marketHigh);
  const roundCount = Math.round(Number(rounds));

  if (!roleText) return { error: "Enter the role or job title you are negotiating for." };
  if (![current, target, low, high, roundCount].every(Number.isFinite)) {
    return { error: "Every number must be a real value — check the salary and round fields." };
  }
  if (current < 0 || target < 0 || low < 0 || high < 0) {
    return { error: "Salary figures cannot be negative." };
  }
  if (!(target > 0)) return { error: "Enter the salary you intend to ask for." };
  if (current > 0 && target > current * MAX_TARGET_MULTIPLE) {
    return {
      error: `Target pay is more than ${MAX_TARGET_MULTIPLE}x your current pay — check for a missing or extra digit.`,
    };
  }
  if (high > 0 && low > 0 && high < low) {
    return { error: "Market range maximum must be greater than or equal to the minimum." };
  }
  if (roundCount < MIN_ROUNDS || roundCount > MAX_ROUNDS) {
    return { error: `Practise between ${MIN_ROUNDS} and ${MAX_ROUNDS} negotiation rounds.` };
  }

  const style = COUNTERPART_STYLES[counterpartStyle] ?? COUNTERPART_STYLES["budget-constrained"];
  const toneText = TONES[tone] ?? TONES.collaborative;

  const increaseAmount = target - current;
  const increasePct = current > 0 ? (increaseAmount / current) * 100 : null;

  const hasBand = low > 0 && high > 0;
  const midpoint = hasBand ? (low + high) / 2 : null;
  const ratio = hasBand ? compaRatio(target, low, high) : null;
  const penetration = hasBand ? rangePenetration(target, low, high) : null;

  let bandVerdict = "No market range supplied — ask the model to pressure-test your number first.";
  if (penetration !== null) {
    if (penetration < 0) bandVerdict = "Your ask sits below the band minimum; you are leaving money on the table.";
    else if (penetration <= 33) bandVerdict = "Your ask sits in the lower third of the band — easy for them to say yes.";
    else if (penetration <= 66) bandVerdict = "Your ask sits around the band midpoint — a defensible, evidence-backed number.";
    else if (penetration <= 100) bandVerdict = "Your ask sits in the top third of the band — expect to justify it with outcomes.";
    else bandVerdict = "Your ask is above the band maximum — expect a level or title change to be required.";
  }

  const chosenLevers = (Array.isArray(levers) ? levers : []).map(clean).filter(Boolean);
  const leverLine = chosenLevers.length
    ? chosenLevers.join(", ")
    : "Base salary, then any non-cash lever you think is realistic";

  const achievementText = clean(achievements);
  const constraintText = clean(constraints);

  const lines = [];
  lines.push(
    `Act as ${style.label.toLowerCase()} at ${companyText || "the company I am negotiating with"}. ${style.brief}`,
  );
  lines.push("");
  lines.push("CONTEXT");
  lines.push(`- Role under discussion: ${roleText}`);
  if (current > 0) lines.push(`- My current pay: ${formatMoney(current, currencyCode)} per year`);
  lines.push(`- The number I intend to ask for: ${formatMoney(target, currencyCode)} per year`);
  if (increasePct !== null) {
    lines.push(`- That is an increase of ${formatMoney(increaseAmount, currencyCode)} (${round(increasePct, 1)}%)`);
  }
  if (hasBand) {
    lines.push(
      `- Market range I researched: ${formatMoney(low, currencyCode)} to ${formatMoney(high, currencyCode)} (midpoint ${formatMoney(midpoint, currencyCode)})`,
    );
    lines.push(
      `- My ask is at compa-ratio ${round(ratio, 2)} and ${round(penetration, 0)}% range penetration. ${bandVerdict}`,
    );
  }
  lines.push(`- Levers I am willing to trade: ${leverLine}`);
  if (achievementText) lines.push(`- Evidence I can point to: ${achievementText}`);
  if (constraintText) lines.push(`- Constraints on my side: ${constraintText}`);
  lines.push("");
  lines.push("HOW TO RUN THE ROLEPLAY");
  lines.push(`1. Stay in character for ${roundCount} exchanges. Speak only as the counterpart — never write my lines for me.`);
  lines.push("2. Open the meeting yourself, then wait for my reply after every turn.");
  lines.push(`3. My intended tone is: ${toneText} Push back if I drift out of it.`);
  lines.push("4. Test at least one objection I have not prepared for, and one attempt to get me to name a number first.");
  lines.push(`5. After exchange ${roundCount}, break character.`);
  lines.push("");
  lines.push("DEBRIEF AFTER BREAKING CHARACTER");
  lines.push("- Score my anchoring, evidence, and willingness to pause, out of 10 each, with the exact line that earned each score.");
  lines.push("- Quote the single weakest sentence I said and rewrite it.");
  lines.push("- List the concessions I gave away that I did not need to.");
  lines.push("- Give me three sentences I should have said, ready to reuse verbatim.");
  lines.push("");
  lines.push("Begin now with your opening line. Do not summarise these instructions back to me.");

  const prompt = lines.join("\n");
  const wordCount = prompt.split(/\s+/).filter(Boolean).length;

  return {
    prompt,
    increaseAmount,
    increasePct: increasePct === null ? null : round(increasePct, 1),
    midpoint,
    compaRatio: ratio === null ? null : round(ratio, 2),
    penetration: penetration === null ? null : round(penetration, 0),
    bandVerdict,
    wordCount,
    tokenEstimate: Math.ceil(prompt.length / CHARS_PER_TOKEN),
  };
}
