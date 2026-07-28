/**
 * Thank you note generator — pure logic, no React and no DOM.
 *
 * The note is assembled from the four parts that etiquette and business-writing
 * guides consistently recommend:
 *   1. Greeting
 *   2. Specific thanks — name the actual gift, favour or conversation
 *   3. Impact — say what it meant or what you will do with it
 *   4. Forward-looking close and sign-off
 * Interview notes add a fifth element, a restated interest in the role, and the
 * widely used convention is to send them within 24 hours of the interview.
 */

/** Conventional deadline for an interview follow-up note. */
export const INTERVIEW_FOLLOW_UP_HOURS = 24;
export const MAX_FIELD_LENGTH = 160;
export const MAX_NAME_LENGTH = 60;

export const CHANNELS = [
  {
    id: "card",
    label: "Handwritten card",
    minWords: 25,
    maxWords: 90,
    guide: "Three to five sentences is the usual length for a card.",
    subject: false,
  },
  {
    id: "email",
    label: "Email",
    minWords: 60,
    maxWords: 200,
    guide: "An email thank you normally runs 60-200 words with a clear subject line.",
    subject: true,
  },
  {
    id: "message",
    label: "Text or WhatsApp",
    minWords: 15,
    maxWords: 70,
    guide: "Keep a message short — two or three sentences, no formal sign-off.",
    subject: false,
  },
];

export const TONES = [
  { id: "warm", label: "Warm" },
  { id: "formal", label: "Formal" },
  { id: "casual", label: "Casual" },
];

export const OCCASIONS = [
  {
    id: "gift",
    label: "A gift",
    itemLabel: "What was the gift?",
    itemPlaceholder: "the blue ceramic teapot",
    subject: "Thank you for the {item}",
  },
  {
    id: "help",
    label: "Help or a favour",
    itemLabel: "What did they do?",
    itemPlaceholder: "helping us move house on Sunday",
    subject: "Thank you for your help",
  },
  {
    id: "interview",
    label: "A job interview",
    itemLabel: "Which role?",
    itemPlaceholder: "Backend Engineer",
    subject: "Thank you for your time today",
  },
  {
    id: "hospitality",
    label: "Hospitality",
    itemLabel: "What did they host?",
    itemPlaceholder: "dinner on Saturday",
    subject: "Thank you for having us",
  },
  {
    id: "mentor",
    label: "Mentoring or teaching",
    itemLabel: "What did they help with?",
    itemPlaceholder: "coaching me through the certification",
    subject: "Thank you for your guidance",
  },
  {
    id: "donation",
    label: "A donation or sponsorship",
    itemLabel: "What did they give?",
    itemPlaceholder: "contribution to the school library fund",
    subject: "Thank you for your support",
  },
];

/** Greeting by tone. */
export const GREETINGS = {
  warm: "Dear {recipient},",
  formal: "Dear {recipient},",
  casual: "Hi {recipient},",
};

/** The specific-thanks sentence: one per occasion and tone. */
export const THANKS = {
  gift: {
    warm: "Thank you so much for the {item} — it was such a thoughtful choice.",
    formal: "Thank you very much for the {item}.",
    casual: "Thanks so much for the {item}!",
  },
  help: {
    warm: "Thank you for {item} — you stepped in exactly when it was needed.",
    formal: "Thank you for {item}.",
    casual: "Thanks a lot for {item}!",
  },
  interview: {
    warm: "Thank you for taking the time to talk with me about the {item} role.",
    formal: "Thank you for the opportunity to discuss the {item} position with you.",
    casual: "Thanks for the chat about the {item} role.",
  },
  hospitality: {
    warm: "Thank you for {item} — we enjoyed every minute of it.",
    formal: "Thank you for {item}.",
    casual: "Thanks for {item}!",
  },
  mentor: {
    warm: "Thank you for {item}; it made far more difference than you probably realise.",
    formal: "Thank you for {item}.",
    casual: "Thanks for {item} — genuinely helpful.",
  },
  donation: {
    warm: "Thank you for your {item}, and for backing this so generously.",
    formal: "Thank you for your {item}.",
    casual: "Thanks for the {item}!",
  },
};

/** Fallback impact sentences, used when the writer does not supply their own. */
export const IMPACT_FALLBACK = {
  gift: [
    "It has already found a place in the house and gets used most days.",
    "It is exactly the sort of thing I would never buy for myself, which is what makes it so good.",
  ],
  help: [
    "It saved me a day of work and a good deal of stress.",
    "The whole thing would have taken twice as long without you.",
  ],
  interview: [
    "The conversation left me more interested in the role, particularly the parts we discussed about the team's roadmap.",
    "It was useful to hear how the team works day to day, and it matches the kind of work I want to be doing.",
  ],
  hospitality: [
    "The food, the company and the whole evening were a real treat.",
    "It was the most relaxed we have felt in weeks.",
  ],
  mentor: [
    "The advice changed how I approached the problem, and the result speaks for itself.",
    "I have already passed on two of the things you told me.",
  ],
  donation: [
    "It goes straight into the work and will be visible in the results.",
    "Support like this is what keeps the project running.",
  ],
};

/** Optional extra paragraph, used in the longer email format. */
export const EXTRAS = {
  gift: [
    "It was good of you to think of us at such a busy time.",
    "Please pass on our thanks to everyone who was in on it.",
  ],
  help: [
    "If there is ever anything I can do in return, say the word.",
    "I owe you one, and I intend to pay it back.",
  ],
  interview: [
    "Having heard more about the priorities for the first six months, I am confident I could contribute quickly, and I remain very interested in the role.",
    "If it would help, I am happy to share more detail on the project we discussed or to answer any follow-up questions.",
  ],
  hospitality: [
    "Next time it is our turn to host — we will be in touch with dates.",
    "Please thank everyone who helped in the kitchen.",
  ],
  mentor: [
    "I will keep you posted on how it goes from here.",
    "If you ever need a second pair of eyes on something, I would be glad to help.",
  ],
  donation: [
    "We will share an update once the next stage is complete.",
    "You are welcome to visit and see the work in progress whenever it suits you.",
  ],
};

/** Closing line by occasion. */
export const CLOSES = {
  gift: ["Thank you again.", "Thanks once more for such a kind thought."],
  help: ["Thank you again for stepping in.", "Thanks again — it really was appreciated."],
  interview: [
    "Thank you again for your time, and I look forward to hearing from you.",
    "Thank you once more for the conversation; I hope to hear from you soon.",
  ],
  hospitality: ["Thank you again for having us.", "Thanks again for a lovely evening."],
  mentor: ["Thank you again for your time and patience.", "Thanks again for the guidance."],
  donation: ["Thank you again for your support.", "Thanks once more for backing this."],
};

/** Sign-off by tone. */
export const SIGNOFFS = {
  warm: ["With thanks,", "Warmly,"],
  formal: ["Yours sincerely,", "With appreciation,"],
  casual: ["Thanks again,", "Cheers,"],
};

function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function countWords(text) {
  if (typeof text !== "string") return 0;
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

/** Trim, collapse whitespace and cap a free-text field. */
export function cleanText(raw, limit = MAX_FIELD_LENGTH) {
  if (typeof raw !== "string") return "";
  return raw.replace(/\s+/g, " ").trim().slice(0, limit);
}

/** Make sure a sentence ends with terminal punctuation. */
function endSentence(text) {
  const trimmed = text.trim();
  if (!trimmed) return "";
  return /[.!?…]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

/**
 * Build a thank you note.
 *
 * @param {object} options
 * @param {string} options.recipient  who is being thanked (required)
 * @param {string} [options.sender]   who is signing it
 * @param {string} options.occasion   one of OCCASIONS
 * @param {string} options.channel    "card" | "email" | "message"
 * @param {string} options.tone       "warm" | "formal" | "casual"
 * @param {string} [options.item]     the specific gift, favour or role
 * @param {string} [options.detail]   the writer's own sentence about the impact
 * @param {number} [options.seed]     integer seed — same seed, same wording
 * @returns {{subject: string|null, body: string, wordCount: number, inRange: boolean,
 *           minWords: number, maxWords: number, checks: Array}|{error: string}}
 */
export function buildNote({
  recipient = "",
  sender = "",
  occasion = "gift",
  channel = "card",
  tone = "warm",
  item = "",
  detail = "",
  seed = 1,
} = {}) {
  const occ = OCCASIONS.find((o) => o.id === occasion);
  if (!occ) return { error: "Choose what you are saying thank you for." };
  const ch = CHANNELS.find((c) => c.id === channel);
  if (!ch) return { error: "Choose where the note is going — card, email or message." };
  if (!TONES.some((t) => t.id === tone)) return { error: "Choose a tone." };

  const who = cleanText(recipient, MAX_NAME_LENGTH);
  if (!who) return { error: "Enter the name of the person you are thanking." };

  const from = cleanText(sender, MAX_NAME_LENGTH);
  const thing = cleanText(item);
  const impactOwn = cleanText(detail);

  const safeSeed = Number.isFinite(Number(seed)) ? Math.abs(Math.floor(Number(seed))) : 1;
  const rand = mulberry32(safeSeed + 1);
  const pick = (list) => list[Math.floor(rand() * list.length) % list.length];

  // Specific thanks. Without a named item, fall back to a general phrase.
  const thanksTemplate = THANKS[occ.id][tone];
  const thanksLine = thing
    ? thanksTemplate.replace(/\{item\}/g, thing)
    : endSentence(`Thank you for ${occ.id === "interview" ? "your time today" : "everything"}`);

  const impactLine = endSentence(impactOwn || pick(IMPACT_FALLBACK[occ.id]));
  const extraLine = endSentence(pick(EXTRAS[occ.id]));
  const closeLine = endSentence(pick(CLOSES[occ.id]));
  const signoff = pick(SIGNOFFS[tone]);

  let body;
  if (ch.id === "message") {
    const opener =
      tone === "casual" ? `Hi ${who} —` : tone === "formal" ? `Dear ${who},` : `${who}!`;
    body = [`${opener} ${endSentence(thanksLine)}`, impactLine, closeLine].join(" ");
  } else if (ch.id === "email") {
    const greeting = GREETINGS[tone].replace(/\{recipient\}/g, who);
    body = [
      greeting,
      "",
      `${endSentence(thanksLine)} ${impactLine}`,
      "",
      extraLine,
      "",
      closeLine,
      "",
      signoff,
      from || "[your name]",
    ].join("\n");
  } else {
    const greeting = GREETINGS[tone].replace(/\{recipient\}/g, who);
    body = [
      greeting,
      "",
      `${endSentence(thanksLine)} ${impactLine} ${closeLine}`,
      "",
      signoff,
      from || "[your name]",
    ].join("\n");
  }

  const subject = ch.subject ? occ.subject.replace(/\{item\}/g, thing || "your kindness") : null;
  const wordCount = countWords(body);

  const checks = [
    {
      label: "Names something specific",
      ok: Boolean(thing),
      hint: "Fill in the field above so the note refers to the actual gift, favour or role.",
    },
    {
      label: "Says what it meant",
      ok: Boolean(impactOwn),
      hint: "Add your own sentence about the difference it made — a generic line is being used instead.",
    },
    {
      label: `Length suits the ${ch.label.toLowerCase()}`,
      ok: wordCount >= ch.minWords && wordCount <= ch.maxWords,
      hint: `${ch.guide} This draft is ${wordCount} words.`,
    },
    {
      label: "Signed off",
      ok: Boolean(from),
      hint: "Add your name so the note does not go out with a placeholder.",
    },
  ];

  if (occ.id === "interview") {
    checks.push({
      label: `Sent within ${INTERVIEW_FOLLOW_UP_HOURS} hours`,
      ok: null,
      hint: `The usual convention is to send an interview thank you within ${INTERVIEW_FOLLOW_UP_HOURS} hours, while the conversation is fresh.`,
    });
  }

  return {
    subject,
    body,
    wordCount,
    minWords: ch.minWords,
    maxWords: ch.maxWords,
    inRange: wordCount >= ch.minWords && wordCount <= ch.maxWords,
    checks,
  };
}
