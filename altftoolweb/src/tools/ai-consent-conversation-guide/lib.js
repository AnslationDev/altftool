/**
 * AI Consent Conversation Guide — pure disclosure-tier logic and script builder.
 *
 * The tiering is a weighted checklist, not a legal test. It is anchored on
 * obligations that actually exist:
 *  - EU AI Act Article 50: providers must mark synthetic audio, image, video and
 *    text in machine-readable form; deployers must disclose deepfakes and must
 *    disclose AI-generated text published to inform the public on matters of
 *    public interest. These transparency duties apply from 2 August 2026.
 *  - ICMJE and the major academic publishers: AI tools cannot be listed as an
 *    author and their use must be declared in the methods or acknowledgements.
 *  - GDPR Article 28: putting personal data into a third-party AI service makes
 *    that provider a processor, which needs a contract and, usually, the client's
 *    knowledge.
 * Always check the contract, employer policy and, where money or law is at stake,
 * a qualified professional.
 */

/** Date EU AI Act Article 50 transparency obligations start to apply. */
export const AI_ACT_ARTICLE_50_APPLIES_FROM = "2 August 2026";

/** How the AI was used, with a weight reflecting how much of the output it shaped. */
export const INVOLVEMENT_LEVELS = [
  {
    id: "ideation",
    label: "Brainstorming and ideas only — nothing AI wrote survives",
    phrase: "brainstorm ideas, none of which it wrote in the final version",
    weight: 1,
  },
  {
    id: "research",
    label: "Summarising sources or research I then rewrote",
    phrase: "summarise source material, which I then rewrote",
    weight: 2,
  },
  {
    id: "editing",
    label: "Editing, proofreading or tone changes on my own writing",
    phrase: "edit and proofread writing that was already mine",
    weight: 2,
  },
  {
    id: "code",
    label: "Generated code that ships in the deliverable",
    phrase: "generate code that ships in the deliverable",
    weight: 3,
  },
  {
    id: "analysis",
    label: "Analysed or transformed the client's data",
    phrase: "analyse and transform the underlying data",
    weight: 3,
  },
  {
    id: "drafting",
    label: "Drafted substantial text I then edited",
    phrase: "draft substantial sections that I then edited",
    weight: 3,
  },
  {
    id: "generated",
    label: "Produced the deliverable end to end",
    phrase: "produce the deliverable end to end",
    weight: 4,
  },
  {
    id: "likeness",
    label: "Generated a synthetic voice, face or likeness",
    phrase: "generate a synthetic voice, face or likeness",
    weight: 5,
  },
];

/** Who the work goes to. */
export const AUDIENCES = [
  { id: "self", label: "Only me — internal notes", weight: 0 },
  { id: "colleague", label: "A colleague on my team", weight: 1 },
  { id: "manager", label: "My manager or an internal review", weight: 2 },
  { id: "client", label: "A paying client", weight: 3 },
  { id: "public", label: "A public audience — site, press, social", weight: 4 },
  { id: "academic", label: "A journal, university or peer reviewer", weight: 4 },
  { id: "regulated", label: "A regulator, court, auditor or insurer", weight: 5 },
];

/** Situational modifiers. Each adds its weight when true. */
export const MODIFIERS = [
  {
    id: "confidential",
    label: "Client or employee data went into the tool",
    weight: 3,
    note:
      "Under GDPR Article 28 the AI provider becomes a processor of that data, which needs a contract and normally the data owner's knowledge.",
  },
  {
    id: "noReview",
    label: "Nobody checked the output line by line",
    weight: 3,
    note: "Unreviewed output is the single biggest source of AI incidents — say so plainly rather than implying review happened.",
  },
  {
    id: "publicInterest",
    label: "It is published to inform the public on a matter of public interest",
    weight: 2,
    note: `EU AI Act Article 50 requires AI-generated text of this kind to be disclosed, from ${AI_ACT_ARTICLE_50_APPLIES_FROM}.`,
  },
  {
    id: "realPerson",
    label: "It depicts or imitates a real, identifiable person",
    weight: 4,
    note: `Deepfake content must be labelled as artificially generated under EU AI Act Article 50, from ${AI_ACT_ARTICLE_50_APPLIES_FROM}; you also need that person's permission.`,
  },
  {
    id: "policyBans",
    label: "The contract or policy restricts AI use on this work",
    weight: 4,
    note: "If a term restricts AI use, disclosure is not optional and the work may need redoing — raise it before delivery.",
  },
  {
    id: "billedAsHuman",
    label: "The client is billed for human hours on this task",
    weight: 3,
    note: "Billing human time for generated output is the fastest way to turn a disclosure question into a trust problem.",
  },
];

/** Tier thresholds on the total weighted score. */
export const TIERS = [
  {
    id: "none",
    max: 3,
    label: "No formal disclosure needed",
    action: "Note it in your own working log and move on.",
  },
  {
    id: "mention",
    max: 7,
    label: "Mention it in conversation",
    action: "Say it out loud in the next call or thread — no formal statement required.",
  },
  {
    id: "written",
    max: 12,
    label: "Written note with the deliverable",
    action: "Put one or two sentences in the covering email or the document itself.",
  },
  {
    id: "formal",
    max: Infinity,
    label: "Formal disclosure and sign-off",
    action:
      "Disclose in writing before delivery, name the tool and the data involved, and get explicit agreement before the work is used.",
  },
];

const TONES = {
  plain: "plain",
  warm: "warm",
  formal: "formal",
};

export const TONE_OPTIONS = [
  { id: TONES.plain, label: "Plain and direct" },
  { id: TONES.warm, label: "Warm and collaborative" },
  { id: TONES.formal, label: "Formal and contractual" },
];

const openers = {
  plain: (who) => `Hi ${who},`,
  warm: (who) => `Hi ${who},`,
  formal: (who) => `Dear ${who},`,
};

const leadIns = {
  plain: (work) => `Before you use ${work}, one thing you should know about how it was produced.`,
  warm: (work) => `I want to be upfront about how ${work} came together.`,
  formal: (work) => `This note records the use of AI tools in the preparation of ${work}.`,
};

/**
 * Builds the disclosure recommendation and script.
 *
 * @param {object} input
 * @param {string} input.recipient   who you are telling
 * @param {string} input.work        what the deliverable is
 * @param {string} input.involvement INVOLVEMENT_LEVELS id
 * @param {string} input.audience    AUDIENCES id
 * @param {string[]} input.modifiers MODIFIERS ids that apply
 * @param {string} input.toolName    name of the AI tool used
 * @param {string} input.humanWork   what you personally did
 * @param {string} input.tone        TONE_OPTIONS id
 */
export function buildDisclosurePlan({
  recipient = "",
  work = "",
  involvement,
  audience,
  modifiers = [],
  toolName = "",
  humanWork = "",
  tone = TONES.plain,
} = {}) {
  const who = String(recipient).trim();
  const what = String(work).trim();
  const tool = String(toolName).trim();
  const human = String(humanWork).trim();

  if (!who) return { error: "Say who you are telling — a name, a role or 'the client'." };
  if (!what) return { error: "Describe the piece of work in a few words." };

  const level = INVOLVEMENT_LEVELS.find((item) => item.id === involvement);
  if (!level) return { error: "Choose how the AI was actually used." };

  const target = AUDIENCES.find((item) => item.id === audience);
  if (!target) return { error: "Choose who the work is going to." };

  const active = MODIFIERS.filter((item) => modifiers.includes(item.id));
  const modifierWeight = active.reduce((sum, item) => sum + item.weight, 0);
  const score = level.weight + target.weight + modifierWeight;

  const tier = TIERS.find((item) => score <= item.max) || TIERS[TIERS.length - 1];
  const toneId = TONE_OPTIONS.some((item) => item.id === tone) ? tone : TONES.plain;

  const obligations = active.filter((item) => item.note).map((item) => item.note);
  if (target.id === "academic") {
    obligations.push(
      "Journals and universities require AI use to be declared in the methods or acknowledgements, and an AI tool cannot be named as an author.",
    );
  }
  if (target.id === "regulated") {
    obligations.push(
      "Material going to a regulator, court or auditor should state the tool, the prompt scope and who verified the output, because you may be asked to evidence it later.",
    );
  }

  const toolPhrase = tool ? tool : "an AI assistant";
  const humanPhrase = human || "reviewed and edited every line before sending it";

  const lines = [];
  lines.push(openers[toneId](who));
  lines.push("");
  lines.push(leadIns[toneId](what));
  lines.push("");
  lines.push(`I used ${toolPhrase} to ${level.phrase}. I ${humanPhrase}.`);

  if (active.some((item) => item.id === "confidential")) {
    lines.push(
      "Some of your material was pasted into that tool, so I want you to know exactly what went in and to agree the arrangement going forward.",
    );
  }
  if (active.some((item) => item.id === "noReview")) {
    lines.push(
      "I have not verified every claim in it line by line, so please treat the detail as a draft rather than a checked deliverable.",
    );
  }
  if (active.some((item) => item.id === "realPerson")) {
    lines.push(
      "It contains a synthetic likeness of a real person, which is labelled as artificially generated and used with their permission.",
    );
  }
  if (active.some((item) => item.id === "billedAsHuman")) {
    lines.push(
      "I have adjusted the time on this task to reflect what I actually spent rather than the original estimate.",
    );
  }
  if (active.some((item) => item.id === "policyBans")) {
    lines.push(
      "I know our agreement restricts this, which is why I am raising it now rather than after delivery. Tell me if you would like it redone without AI involvement.",
    );
  }

  lines.push("");
  if (tier.id === "formal") {
    lines.push("Please confirm you are happy with this before the work goes any further.");
  } else if (tier.id === "written") {
    lines.push("Happy to talk it through or share the prompts if that is useful.");
  } else {
    lines.push("Shout if you want any of it reworked.");
  }
  lines.push("");
  lines.push(toneId === TONES.formal ? "Kind regards," : "Thanks,");

  const checklist = [
    "Name the specific tool rather than saying 'AI' in the abstract.",
    "Say what you personally did — review, fact-checking, editing.",
    `Disclose before delivery, not after questions start (${tier.label.toLowerCase()}).`,
  ];
  if (active.some((item) => item.id === "confidential")) {
    checklist.push("List exactly which data went into the tool and whether it can be used for training.");
  }
  if (target.id === "public" || active.some((item) => item.id === "publicInterest")) {
    checklist.push("Add a visible label on the published item, not only in the covering email.");
  }
  if (level.id === "generated" || level.id === "likeness") {
    checklist.push("Keep the prompts and source files — you may be asked to show provenance.");
  }

  return {
    score,
    maxScore:
      Math.max(...INVOLVEMENT_LEVELS.map((item) => item.weight)) +
      Math.max(...AUDIENCES.map((item) => item.weight)) +
      MODIFIERS.reduce((sum, item) => sum + item.weight, 0),
    tier,
    level,
    audience: target,
    activeModifiers: active,
    obligations,
    checklist,
    script: lines.join("\n"),
  };
}
