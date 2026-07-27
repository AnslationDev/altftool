/**
 * Gym Marketing Prompt Pack
 *
 * Assembles a structured AI prompt (role, context, task, hard constraints,
 * output format) for the marketing messages a gym actually sends, and carries
 * two things a generic prompt cannot: the real character limit of the delivery
 * channel, and the true per-day and per-month cost of the offer being sold.
 *
 * Channel limits are published platform limits, not estimates:
 *   - SMS: 160 characters per segment in the GSM 7-bit default alphabet and 70
 *     in UCS-2, defined by 3GPP TS 23.038.
 *   - WhatsApp Business Platform: 1024 characters in a message template body.
 *   - Instagram: 2200 characters per caption.
 *   - Email subject lines have no protocol limit; the 45-character figure is a
 *     display guideline for narrow mobile inboxes, flagged as such.
 */

/** Mean length of a calendar month: 365.25 days / 12 (Julian year convention). */
export const AVERAGE_DAYS_PER_MONTH = 365.25 / 12;

/** Longest offer window this tool will price, in days. */
export const MAX_OFFER_DAYS = 1095;

export const CHANNELS = [
  {
    id: "sms",
    label: "SMS",
    limit: 160,
    limitNote:
      "160 characters per segment in the GSM 7-bit alphabet (3GPP TS 23.038); a single emoji or Hindi character switches the whole message to UCS-2 and drops the segment to 70 characters.",
  },
  {
    id: "whatsapp",
    label: "WhatsApp template",
    limit: 1024,
    limitNote:
      "The WhatsApp Business Platform caps a message template body at 1024 characters, and the template must be approved before sending.",
  },
  {
    id: "instagram",
    label: "Instagram caption",
    limit: 2200,
    limitNote:
      "Instagram allows 2200 characters per caption, but only the first two lines show before the More link.",
  },
  {
    id: "email-subject",
    label: "Email subject line",
    limit: 45,
    limitNote:
      "There is no protocol limit on a subject line. 45 characters is a display guideline so it is not truncated in narrow mobile inboxes.",
  },
  {
    id: "poster",
    label: "Poster or standee",
    limit: null,
    limitNote: "No character limit, but readable poster copy rarely runs past three short lines.",
  },
];

export const TONES = [
  { id: "warm", label: "Warm and encouraging" },
  { id: "direct", label: "Direct and no-nonsense" },
  { id: "premium", label: "Premium and understated" },
  { id: "playful", label: "Playful and high energy" },
  { id: "clinical", label: "Clinical and evidence-led" },
];

export const LANGUAGES = [
  { id: "english", label: "English" },
  { id: "hindi", label: "Hindi (Devanagari)" },
  { id: "hinglish", label: "Hinglish (Roman script)" },
  { id: "regional", label: "English with a regional greeting" },
];

export const PROMPT_KINDS = [
  {
    id: "membership-offer",
    label: "Membership offer",
    goal: "sell a specific membership package to someone who has not joined yet",
    mustInclude: [
      "the exact price, what it covers and when the offer ends",
      "one concrete reason to act now that is not manufactured scarcity",
      "the joining step in a single sentence",
    ],
    output: "three variants of the message, each labelled A, B and C",
  },
  {
    id: "class-description",
    label: "Class description",
    goal: "describe a class so the right person books it and the wrong person self-selects out",
    mustInclude: [
      "who the class suits and who it does not",
      "what a session physically involves and how long it runs",
      "what a first-timer should bring or wear",
    ],
    output: "a short paragraph plus a three-line at a glance block",
  },
  {
    id: "checkin-message",
    label: "Member check-in",
    goal: "check in with an active member so they feel noticed, without selling anything",
    mustInclude: [
      "a reference to something specific about their training",
      "one open question they can answer in a few words",
      "no offer, no upsell and no discount",
    ],
    output: "two variants, one short and one slightly warmer",
  },
  {
    id: "winback",
    label: "Lapsed member win-back",
    goal: "reopen the conversation with someone whose membership has lapsed",
    mustInclude: [
      "an acknowledgement that life gets in the way, with no guilt",
      "the single easiest way back in",
      "a clear opt-out line",
    ],
    output: "two variants plus one follow-up to send a week later",
  },
  {
    id: "trial-followup",
    label: "Free trial follow-up",
    goal: "follow up after a free trial session and ask for a decision",
    mustInclude: [
      "a reference to the specific session they attended",
      "the exact next step and its price",
      "one honest sentence about what changes after four weeks",
    ],
    output: "one message plus a one-line SMS version",
  },
  {
    id: "referral-ask",
    label: "Referral request",
    goal: "ask a happy member to refer a friend without making it feel transactional",
    mustInclude: [
      "why this member specifically is being asked",
      "exactly what the friend gets",
      "how little effort the referral takes",
    ],
    output: "one message plus a forwardable one-liner the member can paste",
  },
  {
    id: "social-caption",
    label: "Social caption",
    goal: "write a caption for a gym social post that earns a save rather than a scroll",
    mustInclude: [
      "a first line that works as a standalone hook",
      "one specific detail only this gym could write",
      "a call to action that is not follow us",
    ],
    output: "three captions of different lengths and a hashtag set of no more than eight tags",
  },
];

export function getKind(id) {
  return PROMPT_KINDS.find((kind) => kind.id === id) || null;
}

export function getChannel(id) {
  return CHANNELS.find((channel) => channel.id === id) || null;
}

function toneLine(toneId) {
  const tone = TONES.find((item) => item.id === toneId);
  return tone ? tone.label.toLowerCase() : "warm and encouraging";
}

function languageLine(languageId) {
  switch (languageId) {
    case "hindi":
      return "Write in Hindi using Devanagari script. Keep fitness terms in English where that is how people say them.";
    case "hinglish":
      return "Write in Hinglish using Roman script, the way people actually message in Indian cities. Do not translate gym vocabulary into formal Hindi.";
    case "regional":
      return "Write in English but open with a natural local greeting for the city named above. Do not overdo the local flavour.";
    default:
      return "Write in plain English at roughly a Grade 8 reading level.";
  }
}

function money(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: value < 100 ? 2 : 0,
  }).format(value);
}

/**
 * Build the prompt.
 *
 * @param {object} input
 * @param {string} input.gymName
 * @param {string} input.city
 * @param {string} input.audience   who the message is for
 * @param {string} input.offer      what is being sold or described
 * @param {number} input.priceInr   package price in rupees (0 means not priced)
 * @param {number} input.durationDays how many days the package covers
 * @param {string} input.kind       a PROMPT_KINDS id
 * @param {string} input.channel    a CHANNELS id
 * @param {string} input.tone       a TONES id
 * @param {string} input.language   a LANGUAGES id
 * @returns {{prompt:string,charCount:number,wordCount:number,perDay:number,
 *   perMonth:number,channel:object,kind:object}|{error:string}}
 */
export function buildGymPrompt({
  gymName = "",
  city = "",
  audience = "",
  offer = "",
  priceInr = 0,
  durationDays = 30,
  kind = "membership-offer",
  channel = "whatsapp",
  tone = "warm",
  language = "english",
} = {}) {
  const name = String(gymName).trim();
  if (!name) return { error: "Enter the gym or studio name so the prompt is not generic." };

  const kindSpec = getKind(kind);
  if (!kindSpec) return { error: "Pick one of the supported message types." };

  const channelSpec = getChannel(channel);
  if (!channelSpec) return { error: "Pick one of the supported delivery channels." };

  const price = Number(priceInr);
  const days = Number(durationDays);

  if (!Number.isFinite(price) || price < 0) {
    return { error: "Package price must be zero or a positive number of rupees." };
  }
  if (!Number.isFinite(days) || days <= 0) {
    return { error: "Package length must be at least one day." };
  }
  if (days > MAX_OFFER_DAYS) {
    return { error: `Package length above ${MAX_OFFER_DAYS} days is longer than this tool prices.` };
  }

  const perDay = price > 0 ? price / days : 0;
  const perMonth = perDay * AVERAGE_DAYS_PER_MONTH;

  const audienceText = String(audience).trim() || "adults in their late twenties to forties";
  const offerText = String(offer).trim() || "a standard membership";
  const cityText = String(city).trim();

  const priceLines =
    price > 0
      ? [
          `- Price: ${money(price)} for ${days} day${days === 1 ? "" : "s"}.`,
          `- That works out to ${money(perDay)} a day, or about ${money(perMonth)} a month. Use whichever of these three framings is most persuasive for this audience, and do not state a figure that is not one of them.`,
        ]
      : ["- No price is being quoted in this message. Do not invent one."];

  const limitLine = channelSpec.limit
    ? `- Hard limit: ${channelSpec.limit} characters. ${channelSpec.limitNote}`
    : `- No character limit. ${channelSpec.limitNote}`;

  const lines = [
    `You are a direct-response copywriter who has written for independent gyms and studios for ten years. You write the way a good front-desk manager talks, not the way a fitness brand posts.`,
    "",
    "CONTEXT",
    `- Business: ${name}${cityText ? `, ${cityText}` : ""}.`,
    `- Reader: ${audienceText}.`,
    `- Subject of the message: ${offerText}.`,
    ...priceLines,
    `- Channel: ${channelSpec.label}.`,
    "",
    "TASK",
    `Write copy that will ${kindSpec.goal}.`,
    "",
    "MUST INCLUDE",
    ...kindSpec.mustInclude.map((item) => `- ${item}`),
    "",
    "CONSTRAINTS",
    limitLine,
    `- Tone: ${toneLine(tone)}.`,
    `- ${languageLine(language)}`,
    "- Do not invent results, timelines, member counts, testimonials or transformation claims.",
    "- Do not make health or medical claims. Do not promise weight loss in a stated number of days.",
    "- No hype words: journey, unleash, crush it, beast mode, game changer.",
    "- Use the second person. One idea per sentence.",
    "",
    "OUTPUT",
    `Return ${kindSpec.output}. Put the character count in brackets after each variant. Add nothing else - no preamble, no explanation of your choices.`,
  ];

  const prompt = lines.join("\n");
  const wordCount = prompt.split(/\s+/).filter(Boolean).length;

  return {
    prompt,
    charCount: prompt.length,
    wordCount,
    perDay,
    perMonth,
    channel: channelSpec,
    kind: kindSpec,
  };
}
