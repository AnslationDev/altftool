/**
 * Apology message composer — pure logic, no React and no DOM.
 *
 * Structure comes from Lewicki, Polin & Lount (2016), "An Exploration of the
 * Structure of Effective Apologies" (Negotiation and Conflict Management
 * Research), which identifies six components of an apology:
 *   1. Expression of regret
 *   2. Explanation of what went wrong
 *   3. Acknowledgement of responsibility
 *   4. Declaration of repentance
 *   5. Offer of repair
 *   6. Request for forgiveness
 * The study found acknowledgement of responsibility the most effective single
 * component and offer of repair the next; request for forgiveness ranked last.
 *
 * The weights below are OUR OWN 100-point weighting derived from that ranking
 * order — the paper reports rankings and effectiveness ratings, not these
 * numbers. They exist so the score is transparent and reproducible, not to
 * imply a published figure.
 */

/** Citation shown in the UI. */
export const SOURCE =
  "Lewicki, Polin & Lount (2016), An Exploration of the Structure of Effective Apologies";

/**
 * The six components, in the order they read best in a written apology.
 * `weight` is our ranking-derived score contribution; the six sum to 100.
 */
export const COMPONENTS = [
  {
    id: "regret",
    label: "Expression of regret",
    weight: 15,
    description: "Say sorry plainly, and say what for.",
    needs: "what",
  },
  {
    id: "responsibility",
    label: "Acknowledgement of responsibility",
    weight: 30,
    description: "Own it in the first person. Ranked the most effective single component.",
    needs: null,
  },
  {
    id: "impact",
    label: "Acknowledgement of the impact",
    weight: 0,
    description: "Name the cost to the other person. Strengthens the responsibility line.",
    needs: "impact",
  },
  {
    id: "explanation",
    label: "Explanation of what went wrong",
    weight: 12,
    description: "A short factual cause — not a defence.",
    needs: "cause",
  },
  {
    id: "repentance",
    label: "Declaration of repentance",
    weight: 12,
    description: "State what you will do differently.",
    needs: "change",
  },
  {
    id: "repair",
    label: "Offer of repair",
    weight: 25,
    description: "Concrete action to put it right. Ranked second most effective.",
    needs: "repair",
  },
  {
    id: "forgiveness",
    label: "Request for forgiveness",
    weight: 6,
    description: "Ask, do not demand. Ranked least important of the six.",
    needs: null,
  },
];

/** Total achievable score. */
export const MAX_SCORE = COMPONENTS.reduce((sum, c) => sum + c.weight, 0);

export const TONES = [
  { id: "sincere", label: "Sincere & personal" },
  { id: "professional", label: "Professional" },
  { id: "brief", label: "Short and direct" },
];

export const MAX_FIELD_LENGTH = 220;
export const MAX_NAME_LENGTH = 60;

/**
 * Phrasings that undermine an apology. Each entry explains why, so the writer
 * can decide rather than being silently corrected.
 */
export const WEAKENERS = [
  {
    id: "conditional",
    test: /\bif\s+(?:you|anyone|anybody)\s+(?:was|were|are|is|felt|feel|found)\b/i,
    label: "Conditional apology",
    why: "\"If you were offended\" treats the harm as hypothetical and puts the judgement on the other person.",
  },
  {
    id: "sorry-you-feel",
    test: /\bsorry\s+(?:that\s+)?(?:you|they)\s+(?:feel|felt|took|were|are)\b/i,
    label: "Apologising for their reaction",
    why: "\"Sorry you feel that way\" apologises for their emotion, not for what you did.",
  },
  {
    id: "sorry-but",
    test: /\bsorry\b[^.!?]{0,60}\bbut\b/i,
    label: "\"Sorry, but\"",
    why: "Anything after \"but\" reads as the real message and cancels the apology in front of it.",
  },
  {
    id: "passive",
    test: /\b(?:mistakes were made|errors occurred|it happened|things went wrong)\b/i,
    label: "Passive voice",
    why: "Passive phrasing removes the actor. Say who did what.",
  },
  {
    id: "intent-defence",
    test: /\b(?:was not|wasn'?t) my intention\b|\b(?:did ?n[o']t|didnt) mean to\b/i,
    label: "Intent defence",
    why: "Intent explains you; it does not address the harm. Put responsibility before intent, if you mention intent at all.",
  },
  {
    id: "blame-shift",
    test: /\byou\s+(?:misunderstood|misread|took it the wrong way|overreacted)\b/i,
    label: "Blame shift",
    why: "Telling someone they misread you turns the apology into an accusation.",
  },
  {
    id: "inconvenience",
    test: /\bapologi[sz]e for (?:any )?(?:inconvenience|confusion)\b/i,
    label: "Corporate filler",
    why: "\"Apologise for any inconvenience\" names no specific harm and reads as boilerplate.",
  },
  {
    id: "hedge",
    test: /\b(?:kind of|sort of|somewhat|a bit) sorry\b|\bi guess i'?m sorry\b/i,
    label: "Hedged regret",
    why: "Qualifying the regret signals you do not mean it.",
  },
];

export function countWords(text) {
  if (typeof text !== "string") return 0;
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function cleanText(raw, limit = MAX_FIELD_LENGTH) {
  if (typeof raw !== "string") return "";
  return raw.replace(/\s+/g, " ").trim().slice(0, limit);
}

/** Strip a trailing full stop so a fragment can be embedded in a sentence. */
function fragment(text) {
  return text.replace(/[.\s]+$/, "");
}

function endSentence(text) {
  const trimmed = text.trim();
  if (!trimmed) return "";
  return /[.!?…]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

/** Scan any text for phrasing that weakens an apology. */
export function scanForWeakeners(text) {
  if (typeof text !== "string" || !text.trim()) return [];
  return WEAKENERS.filter((w) => w.test.test(text)).map(({ id, label, why }) => ({
    id,
    label,
    why,
  }));
}

const OPENERS = {
  sincere: {
    regret: "{recipient}, I am sorry for {what}.",
    responsibility: "That was my responsibility, and I am not going to explain it away.",
    forgiveness: "I hope you can forgive me, and I understand if that takes time.",
  },
  professional: {
    regret: "{recipient}, I want to apologise for {what}.",
    responsibility: "This was my error and I take full responsibility for it.",
    forgiveness: "I hope we can move past this, and I am happy to discuss it further.",
  },
  brief: {
    regret: "{recipient}, I'm sorry for {what}.",
    responsibility: "That one is on me.",
    forgiveness: "I hope you can forgive me.",
  },
};

const IMPACT_LEAD = {
  sincere: "I know what it cost you:",
  professional: "I recognise the impact this had:",
  brief: "I know it meant",
};

const EXPLANATION_LEAD = {
  sincere: "For context, and not as an excuse:",
  professional: "For context:",
  brief: "What happened:",
};

const REPENTANCE_LEAD = {
  sincere: "It will not happen again —",
  professional: "To prevent a repeat,",
  brief: "Going forward,",
};

const REPAIR_LEAD = {
  sincere: "To put it right,",
  professional: "To make this right,",
  brief: "To fix it,",
};

/**
 * Compose an apology from the selected components.
 *
 * @param {object} options
 * @param {string} options.recipient  who the apology is to (required)
 * @param {string} options.what       what you are apologising for (required)
 * @param {string} [options.impact]   the cost to them
 * @param {string} [options.cause]    a short factual explanation
 * @param {string} [options.change]   what you will do differently
 * @param {string} [options.repair]   the concrete repair offered
 * @param {string} [options.sender]   your name
 * @param {string} options.tone       "sincere" | "professional" | "brief"
 * @param {string[]} options.include  component ids to include
 * @returns {{text: string, score: number, maxScore: number, wordCount: number,
 *           included: object[], missing: object[], warnings: object[]}|{error: string}}
 */
export function composeApology({
  recipient = "",
  what = "",
  impact = "",
  cause = "",
  change = "",
  repair = "",
  sender = "",
  tone = "sincere",
  include = [],
} = {}) {
  if (!TONES.some((t) => t.id === tone)) return { error: "Choose a tone." };

  const who = cleanText(recipient, MAX_NAME_LENGTH);
  if (!who) return { error: "Enter the name of the person you are apologising to." };

  const whatText = cleanText(what);
  if (!whatText) return { error: "Say what you are apologising for — that line carries the apology." };

  const selected = new Set(Array.isArray(include) ? include : []);
  if (selected.size === 0) return { error: "Select at least one part of the apology to include." };

  const values = {
    what: whatText,
    impact: cleanText(impact),
    cause: cleanText(cause),
    change: cleanText(change),
    repair: cleanText(repair),
  };
  const from = cleanText(sender, MAX_NAME_LENGTH);

  const included = [];
  const missing = [];
  const lines = [];

  for (const component of COMPONENTS) {
    const chosen = selected.has(component.id);
    const hasInput = component.needs ? Boolean(values[component.needs]) : true;

    if (!chosen || !hasInput) {
      missing.push({
        id: component.id,
        label: component.label,
        weight: component.weight,
        reason: !chosen ? "Not selected" : "No text entered for it yet",
      });
      continue;
    }

    included.push({ id: component.id, label: component.label, weight: component.weight });

    switch (component.id) {
      case "regret":
        lines.push(
          OPENERS[tone].regret
            .replace(/\{recipient\}/g, who)
            .replace(/\{what\}/g, fragment(values.what)),
        );
        break;
      case "responsibility":
        lines.push(OPENERS[tone].responsibility);
        break;
      case "impact":
        lines.push(endSentence(`${IMPACT_LEAD[tone]} ${fragment(values.impact)}`));
        break;
      case "explanation":
        lines.push(endSentence(`${EXPLANATION_LEAD[tone]} ${fragment(values.cause)}`));
        break;
      case "repentance":
        lines.push(endSentence(`${REPENTANCE_LEAD[tone]} ${fragment(values.change)}`));
        break;
      case "repair":
        lines.push(endSentence(`${REPAIR_LEAD[tone]} ${fragment(values.repair)}`));
        break;
      case "forgiveness":
        lines.push(OPENERS[tone].forgiveness);
        break;
      default:
        break;
    }
  }

  if (lines.length === 0) {
    return { error: "Nothing to write yet — fill in the fields for the parts you selected." };
  }

  let text = lines.join(" ");
  if (from) text = `${text}\n\n— ${from}`;

  const score = included.reduce((sum, c) => sum + c.weight, 0);
  const warnings = scanForWeakeners(
    [values.what, values.impact, values.cause, values.change, values.repair].join(" "),
  );

  return {
    text,
    score,
    maxScore: MAX_SCORE,
    wordCount: countWords(text),
    included,
    missing,
    warnings,
  };
}
