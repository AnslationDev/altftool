/**
 * Cold Email Prompt Builder.
 *
 * Builds an outreach-drafting prompt around three things that decide whether
 * a cold email gets a reply: a specific persona, a real trigger event, and
 * one single ask — inside the word range that performs.
 */

/**
 * Boomerang's large-scale reply-rate analysis found emails of roughly
 * 50–125 words got the best response rates, with reply rates falling off
 * on both sides of that band. Used here as the target range.
 */
export const IDEAL_MIN_WORDS = 50;
export const IDEAL_MAX_WORDS = 125;

/**
 * Mobile mail clients truncate subjects around 30–40 characters; cold email
 * subjects also perform better lowercase-short than headline-long.
 */
export const SUBJECT_MAX_CHARS = 40;

/**
 * Mean silent reading rate for English non-fiction, 238 words per minute
 * (Brysbaert, 2019). A 100-word cold email is ~25 seconds of attention.
 */
export const READING_WORDS_PER_MINUTE = 238;

/** Block shares of the total word budget, with floors. */
export const OPENER_SHARE = 0.2;
export const MIN_OPENER_WORDS = 12;
export const ASK_SHARE = 0.15;
export const MIN_ASK_WORDS = 10;

/** About four characters per token for ordinary English prose. */
export const AVERAGE_CHARS_PER_TOKEN = 4;

export const LIMITS = {
  totalWords: { min: 40, max: 200 },
};

/**
 * Trigger events — the observable reason to write today. Referencing a real
 * trigger is what separates researched outreach from spray-and-pray.
 */
export const TRIGGERS = [
  {
    id: "funding",
    label: "Raised funding",
    directive:
      "Reference the round only as evidence of the problem growing (headcount, scale), never congratulate for a full sentence.",
  },
  {
    id: "new-role",
    label: "Started a new role",
    directive:
      "New leaders audit their stack in the first 90 days — frame the email around what they are likely re-evaluating, not around congratulations.",
  },
  {
    id: "content",
    label: "Published a post, talk or interview",
    directive:
      "Quote or paraphrase one specific point they made and connect it to the problem you solve. Generic 'loved your post' is worse than no trigger.",
  },
  {
    id: "launch",
    label: "Launched a product or feature",
    directive:
      "Tie the email to what launches create: new users, new load, new support burden. Name the launch, skip the praise.",
  },
  {
    id: "hiring",
    label: "Hiring for a relevant role",
    directive:
      "Name the open role as evidence of the initiative behind it, and position the email against the problem that initiative exists to fix.",
  },
  {
    id: "none",
    label: "No trigger — pure cold",
    directive:
      "With no event to reference, the first line must instead prove research: one specific, verifiable observation about their company that a mail-merge could not produce.",
  },
];

/** Ask types — exactly one per email. */
export const ASKS = [
  {
    id: "call",
    label: "Short call",
    directive:
      "Ask for a specific, small block ('15 minutes Tuesday or Wednesday afternoon?'), not 'a quick chat sometime'.",
  },
  {
    id: "interest",
    label: "Interest question (reply-based)",
    directive:
      "End on a yes/no interest question answerable in one line ('Worth a look?'), lowering the reply cost to seconds.",
  },
  {
    id: "resource",
    label: "Offer a resource",
    directive:
      "Offer one genuinely useful artifact (teardown, benchmark, audit) and ask permission to send it — the ask is the permission, not the meeting.",
  },
  {
    id: "referral",
    label: "Referral to the right person",
    directive:
      "Ask who owns the problem ('Are you the right person for X, or should I ask someone else?') — answerable with a name in one line.",
  },
];

function toInt(value) {
  const cleaned = String(value ?? "")
    .replace(/,/g, "")
    .trim();
  if (cleaned === "") return NaN;
  const number = Number(cleaned);
  return Number.isFinite(number) ? Math.round(number) : NaN;
}

export function getTrigger(triggerId) {
  return TRIGGERS.find((trigger) => trigger.id === triggerId) || null;
}

export function getAsk(askId) {
  return ASKS.find((ask) => ask.id === askId) || null;
}

/**
 * Allocate the word budget across opener, body and ask.
 * @returns {{error:string}|object}
 */
export function planColdEmail({ totalWords } = {}) {
  const total = toInt(totalWords);
  if (Number.isNaN(total)) return { error: "Enter the email length in words." };
  if (total < LIMITS.totalWords.min || total > LIMITS.totalWords.max) {
    return {
      error: `Email length must be between ${LIMITS.totalWords.min} and ${LIMITS.totalWords.max} words.`,
    };
  }

  const opener = Math.max(MIN_OPENER_WORDS, Math.round(total * OPENER_SHARE));
  const ask = Math.max(MIN_ASK_WORDS, Math.round(total * ASK_SHARE));
  const body = total - opener - ask;

  if (body < 10) {
    return {
      error: `Only ${Math.max(0, body)} words remain for the value section after the opener and ask. Raise the length.`,
    };
  }

  const warnings = [];
  if (total < IDEAL_MIN_WORDS) {
    warnings.push(
      `${total} words is under the ${IDEAL_MIN_WORDS}-${IDEAL_MAX_WORDS} word range that gets the best reply rates — very short emails read as empty.`,
    );
  }
  if (total > IDEAL_MAX_WORDS) {
    warnings.push(
      `${total} words is over the ${IDEAL_MIN_WORDS}-${IDEAL_MAX_WORDS} word range that gets the best reply rates — long cold emails get skimmed, then deleted.`,
    );
  }

  return {
    total,
    opener,
    body,
    ask,
    readingSeconds: Math.max(1, Math.round((total / READING_WORDS_PER_MINUTE) * 60)),
    inIdealRange: total >= IDEAL_MIN_WORDS && total <= IDEAL_MAX_WORDS,
    warnings,
  };
}

export function measureText(text) {
  if (typeof text !== "string" || text.trim().length === 0) {
    return { characters: 0, words: 0, approxTokens: 0 };
  }
  return {
    characters: text.length,
    words: text.trim().split(/\s+/).length,
    approxTokens: Math.max(1, Math.ceil(text.length / AVERAGE_CHARS_PER_TOKEN)),
  };
}

/**
 * Write the cold-email drafting prompt, embedding the plan.
 * @returns {{error:string}|{text:string, plan:object}}
 */
export function buildColdEmailPrompt({
  persona,
  senderContext,
  valueProp,
  triggerId,
  triggerDetail,
  askId,
  notes,
  plan,
} = {}) {
  if (!plan || plan.error) return { error: plan?.error || "Set a valid word budget first." };
  const trigger = getTrigger(triggerId);
  if (!trigger) return { error: "Choose the trigger event for writing now." };
  const ask = getAsk(askId);
  if (!ask) return { error: "Choose the one ask the email makes." };
  const personaText = typeof persona === "string" && persona.trim() ? persona.trim() : "";
  if (!personaText) return { error: "Describe who the email is to (role, company type)." };
  const value = typeof valueProp === "string" && valueProp.trim() ? valueProp.trim() : "";
  if (!value) return { error: "State the concrete outcome you deliver." };
  const sender =
    typeof senderContext === "string" && senderContext.trim()
      ? senderContext.trim()
      : "the sender";
  const triggerText = typeof triggerDetail === "string" ? triggerDetail.trim() : "";
  const extra = typeof notes === "string" ? notes.trim() : "";

  const lines = [
    "Write one cold outreach email. Follow every limit below exactly.",
    "",
    `TO (PERSONA): ${personaText}`,
    `FROM: ${sender}`,
    `OUTCOME WE DELIVER: ${value}`,
    `TRIGGER — why we are writing today: ${trigger.label}${triggerText ? ` (${triggerText})` : ""}. ${trigger.directive}`,
    `THE ONE ASK: ${ask.label} — ${ask.directive} There is exactly one ask in this email; do not add a calendar link AND a question AND an attachment offer.`,
    "",
    `STRUCTURE — total ${plan.total} words (~${plan.readingSeconds} seconds to read; the ${IDEAL_MIN_WORDS}-${IDEAL_MAX_WORDS} word band gets the best reply rates):`,
    `- OPENER (~${plan.opener} words): the trigger observation, written so it could only be about this person. No 'Hope you're well', no introducing yourself first.`,
    `- VALUE (~${plan.body} words): connect the trigger to the outcome we deliver, with one concrete proof point. Write [proof needed] rather than inventing a customer or number.`,
    `- ASK (~${plan.ask} words): the single ask, one sentence, then sign off with a first name only.`,
    "",
    "SUBJECT LINE:",
    `- At most ${SUBJECT_MAX_CHARS} characters, lowercase-conversational, referencing the trigger or outcome — it should read like an internal email, not a campaign.`,
    "- Provide 3 options and mark which one you would send.",
    "",
    "RULES:",
    "- No flattery sentences, no 'I know you're busy', no apology for writing.",
    "- Sentence length: mostly under 15 words. Grade-7 readability.",
    "- Zero jargon from our own marketing ('synergies', 'best-in-class', 'solution').",
    "- No attachments and at most one link, only if the ask requires it.",
    "- Do not invent names, metrics, customers or events — write [detail needed] where a real fact must be inserted.",
  ];
  if (extra) lines.push(`- ${extra}`);

  const text = lines.join("\n");
  return { text, plan, trigger, ask, ...measureText(text) };
}
