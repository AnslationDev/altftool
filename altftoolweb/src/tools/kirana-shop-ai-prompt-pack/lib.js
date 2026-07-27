/**
 * Kirana Shop AI Prompt Pack — pure prompt-composition logic.
 *
 * No React, no DOM. Every export is a pure function or a constant table.
 */

/**
 * WhatsApp Cloud API text messages carry the body in a `text.body` field whose
 * documented maximum length is 4096 characters. Longer copy has to be split
 * across several messages.
 */
export const WHATSAPP_BODY_LIMIT = 4096;

/**
 * 3GPP TS 23.040: a single-part SMS in the GSM 7-bit alphabet holds 160
 * characters. Once a message is concatenated, 6 bytes (7 characters worth) of
 * every part are consumed by the user-data header, leaving 153 characters each.
 */
export const SMS_SINGLE_PART_CHARS = 160;
export const SMS_MULTI_PART_CHARS = 153;

/**
 * Rule of thumb published by OpenAI for English prose: roughly 4 characters of
 * text per token. Used only to give a ballpark prompt size, never billing.
 */
export const CHARS_PER_TOKEN = 4;

/** Sensible bounds for the "how long should the reply be" control. */
export const MIN_TARGET_CHARS = 40;
export const MAX_TARGET_CHARS = 2000;

export const LANGUAGES = [
  {
    id: "hinglish",
    label: "Hinglish (Roman script)",
    instruction:
      "Write in Hinglish — Hindi words typed in the Roman script, the way shopkeepers and customers actually type on WhatsApp.",
  },
  {
    id: "hindi",
    label: "Hindi (Devanagari)",
    instruction: "Write in simple conversational Hindi using the Devanagari script.",
  },
  {
    id: "english",
    label: "English",
    instruction: "Write in plain Indian English, short sentences, no jargon.",
  },
  {
    id: "marathi",
    label: "Marathi",
    instruction: "Write in simple conversational Marathi using the Devanagari script.",
  },
  {
    id: "tamil",
    label: "Tamil",
    instruction: "Write in simple conversational Tamil using the Tamil script.",
  },
  {
    id: "telugu",
    label: "Telugu",
    instruction: "Write in simple conversational Telugu using the Telugu script.",
  },
  {
    id: "bengali",
    label: "Bengali",
    instruction: "Write in simple conversational Bengali using the Bengali script.",
  },
  {
    id: "gujarati",
    label: "Gujarati",
    instruction: "Write in simple conversational Gujarati using the Gujarati script.",
  },
  {
    id: "kannada",
    label: "Kannada",
    instruction: "Write in simple conversational Kannada using the Kannada script.",
  },
];

export const TONES = [
  {
    id: "friendly",
    label: "Friendly regular-customer",
    instruction:
      "Warm and familiar, the way you speak to a regular who comes in every week. Use 'aap'. No slang that sounds like an ad.",
  },
  {
    id: "respectful",
    label: "Respectful and formal",
    instruction:
      "Polite and formal. Use respectful address, no emojis, no exclamation marks beyond one.",
  },
  {
    id: "direct",
    label: "Short and direct",
    instruction: "Straight to the point. No greeting padding, no closing pleasantries beyond a thank you.",
  },
  {
    id: "festive",
    label: "Festive and upbeat",
    instruction:
      "Cheerful festival-season energy. At most two emojis, and never on a price or a payment request.",
  },
];

export const TASKS = [
  {
    id: "stock-note",
    label: "Reorder note for the distributor",
    blurb: "Turn a scribbled stock count into a clean order list.",
    channel: "WhatsApp to distributor",
    fields: [
      {
        id: "items",
        label: "Items and what is left",
        multiline: true,
        required: true,
        placeholder:
          "Aashirvaad atta 5kg - 3 bags\nAmul butter 100g - 0\nTata salt 1kg - 12\nMaggi 70g - 8 packets",
      },
      {
        id: "supplier",
        label: "Distributor name",
        required: false,
        fallback: "my distributor",
        placeholder: "Sharma Distributors",
      },
    ],
    template:
      "This is today's stock count at my shop:\n{{items}}\n\nWrite the reorder message I should send to {{supplier}}. Group items by brand, state the pack size and the quantity to order for each, and put anything that is already at zero in a separate line at the very top so it does not get missed.",
    outputFormat:
      "One message. First an 'Out of stock - send today' line, then a numbered order list of brand, pack size and quantity.",
  },
  {
    id: "offer-message",
    label: "Offer / discount broadcast",
    blurb: "Announce a weekend or festival offer to your customer list.",
    channel: "WhatsApp broadcast",
    fields: [
      {
        id: "offer",
        label: "What the offer is",
        multiline: true,
        required: true,
        placeholder: "Sugar 1kg at 42 instead of 48\nAll Britannia biscuits buy 3 get 1\nOffer valid Saturday and Sunday only",
      },
      { id: "shop", label: "Shop name", required: false, fallback: "my shop", placeholder: "Gupta Kirana Store" },
      { id: "area", label: "Area / locality", required: false, fallback: "the neighbourhood", placeholder: "Sector 12, Noida" },
    ],
    template:
      "I run {{shop}}, a kirana shop in {{area}}. This weekend's offer:\n{{offer}}\n\nWrite the broadcast message I can send to my customer list. Lead with the single strongest saving, keep every price exactly as I gave it, and end with one clear line telling people how to order or when to come.",
    outputFormat:
      "One ready-to-send message. No headings, no bullet symbols that break on older phones - use plain dashes.",
  },
  {
    id: "whatsapp-reply",
    label: "Reply to a customer message",
    blurb: "Draft a reply to an enquiry, complaint or order on WhatsApp.",
    channel: "WhatsApp 1:1",
    fields: [
      {
        id: "message",
        label: "What the customer wrote",
        multiline: true,
        required: true,
        placeholder: "Bhaiya kal jo atta diya wo kharab nikla, poora packet phenkna pada",
      },
      {
        id: "situation",
        label: "What you can actually offer",
        multiline: true,
        required: false,
        fallback: "a replacement or a refund, whichever the customer prefers",
        placeholder: "I can replace the packet free, or adjust 250 rupees in the next bill",
      },
    ],
    template:
      "A customer sent me this on WhatsApp:\n{{message}}\n\nWhat I can offer: {{situation}}\n\nWrite my reply. Acknowledge what happened in the first line before offering anything, state exactly what I will do, and do not promise anything beyond what I listed.",
    outputFormat: "One reply message, ready to paste. Give me a second shorter variant underneath, separated by a line of dashes.",
  },
  {
    id: "udhaar-reminder",
    label: "Udhaar (credit) payment reminder",
    blurb: "A reminder that gets paid without losing the customer.",
    channel: "WhatsApp 1:1",
    fields: [
      { id: "customer", label: "Customer name", required: false, fallback: "the customer", placeholder: "Ramesh ji" },
      { id: "amount", label: "Amount pending", required: true, placeholder: "1,850" },
      { id: "since", label: "Pending since", required: false, fallback: "a while now", placeholder: "since 4 March" },
    ],
    template:
      "{{customer}} has {{amount}} rupees pending on the shop khata, outstanding {{since}}. Write a payment reminder that keeps the relationship intact: no shaming, no threat, no legal language. State the amount and the period clearly, then offer a way to settle it - full payment or a part payment now with the rest later.",
    outputFormat:
      "Three versions in increasing firmness, labelled 'First reminder', 'Second reminder' and 'Final polite reminder', separated by blank lines.",
  },
  {
    id: "price-list",
    label: "Weekly price list post",
    blurb: "A tidy, readable rate list for your status or group.",
    channel: "WhatsApp status / group",
    fields: [
      {
        id: "rates",
        label: "Items and rates",
        multiline: true,
        required: true,
        placeholder: "Toor dal 1kg 145\nRice sona masoori 5kg 320\nRefined oil 1L 132\nSugar 1kg 48",
      },
      { id: "validity", label: "Rates valid until", required: false, fallback: "further notice", placeholder: "Sunday evening" },
    ],
    template:
      "These are this week's rates at my kirana shop:\n{{rates}}\n\nFormat this into a clean price list post. Keep every number exactly as written, align the item and the rate so it reads well on a phone screen, and add one line at the end saying the rates hold until {{validity}}.",
    outputFormat:
      "A single plain-text block. Item name, then a dash, then the rate. No table characters, no markdown - they render badly on WhatsApp.",
  },
  {
    id: "new-arrival",
    label: "New product announcement",
    blurb: "Tell customers you now stock something they were asking for.",
    channel: "WhatsApp broadcast",
    fields: [
      {
        id: "product",
        label: "What you have started stocking",
        multiline: true,
        required: true,
        placeholder: "Cold-pressed groundnut oil 1L, 285 rupees\nAlso 5L can at 1,340",
      },
      { id: "reason", label: "Why you brought it in", required: false, fallback: "customers kept asking for it", placeholder: "three regulars asked for it last month" },
    ],
    template:
      "I have started stocking this at my kirana shop:\n{{product}}\n\nReason I brought it in: {{reason}}\n\nWrite the announcement message. Say what it is and the price in the first two lines, mention that customers asked for it, and close by inviting people to try one pack.",
    outputFormat: "One short message, ready to send. No headline, no hashtags.",
  },
];

/** Look up a task definition by id. Returns null when the id is unknown. */
export function getTask(taskId) {
  return TASKS.find((task) => task.id === taskId) || null;
}

/** Look up a language definition by id. Returns null when the id is unknown. */
export function getLanguage(languageId) {
  return LANGUAGES.find((item) => item.id === languageId) || null;
}

/** Look up a tone definition by id. Returns null when the id is unknown. */
export function getTone(toneId) {
  return TONES.find((item) => item.id === toneId) || null;
}

/**
 * Replace every {{token}} in `template` with the matching trimmed value.
 * Unknown tokens collapse to an empty string rather than leaking braces.
 */
export function fillTemplate(template, values) {
  if (typeof template !== "string") return "";
  const source = values && typeof values === "object" ? values : {};
  return template.replace(/\{\{(\w+)\}\}/g, (_match, key) => {
    const raw = source[key];
    return typeof raw === "string" ? raw.trim() : "";
  });
}

/** Word count that treats any run of whitespace as one separator. */
export function countWords(text) {
  if (typeof text !== "string") return 0;
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

/** Ballpark token count at CHARS_PER_TOKEN characters per token. Never NaN. */
export function estimateTokens(text) {
  if (typeof text !== "string" || text.length === 0) return 0;
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

/**
 * How many SMS parts a message of `chars` characters would occupy.
 * <= 160 characters is one part; beyond that every part holds 153.
 */
export function countSmsParts(chars) {
  const n = Number(chars);
  if (!Number.isFinite(n) || n <= 0) return 0;
  if (n <= SMS_SINGLE_PART_CHARS) return 1;
  return Math.ceil(n / SMS_MULTI_PART_CHARS);
}

/**
 * Compose the final prompt.
 *
 * @param {object} input
 * @param {string} input.taskId      one of TASKS[].id
 * @param {object} input.values      field id -> user text
 * @param {string} input.languageId  one of LANGUAGES[].id
 * @param {string} input.toneId      one of TONES[].id
 * @param {number} input.targetChars desired length of the message the AI writes
 * @param {string} input.shopContext optional extra background about the shop
 * @returns {object} { prompt, ... } or { error }
 */
export function buildPrompt({
  taskId,
  values = {},
  languageId = "hinglish",
  toneId = "friendly",
  targetChars = 400,
  shopContext = "",
} = {}) {
  const task = getTask(taskId);
  if (!task) return { error: "Pick one of the prompt packs to build a prompt." };

  const language = getLanguage(languageId);
  if (!language) return { error: "Pick a language for the message." };

  const tone = getTone(toneId);
  if (!tone) return { error: "Pick a tone for the message." };

  const limit = Number(targetChars);
  if (!Number.isFinite(limit)) return { error: "Message length must be a number." };
  if (limit < MIN_TARGET_CHARS || limit > MAX_TARGET_CHARS) {
    return {
      error: `Message length must be between ${MIN_TARGET_CHARS} and ${MAX_TARGET_CHARS} characters.`,
    };
  }

  const resolved = {};
  const missing = [];
  for (const field of task.fields) {
    const raw = typeof values[field.id] === "string" ? values[field.id].trim() : "";
    if (raw) {
      resolved[field.id] = raw;
    } else if (field.required) {
      missing.push(field.label);
      resolved[field.id] = "";
    } else {
      resolved[field.id] = field.fallback || "";
    }
  }
  if (missing.length > 0) {
    return { error: `Fill in ${missing.join(" and ")} to build the prompt.` };
  }

  const background = String(shopContext || "").trim();
  const sections = [
    {
      title: "Role",
      body: "You are helping the owner of a small Indian kirana (neighbourhood grocery) shop write everyday messages. You know how kirana trade works: khata credit, distributor beats, MRP versus shop rate, and festival demand.",
    },
    ...(background ? [{ title: "About the shop", body: background }] : []),
    { title: "Task", body: fillTemplate(task.template, resolved) },
    {
      title: "Constraints",
      body: [
        language.instruction,
        tone.instruction,
        `Keep the message under ${Math.round(limit)} characters so it reads in one screen on ${task.channel}.`,
        "Never invent a price, a discount, a date or a quantity I did not give you. If something is missing, leave a clearly marked blank like [___] instead of guessing.",
        "No hashtags. No links unless I supplied one.",
      ].join("\n"),
    },
    { title: "Output format", body: task.outputFormat },
  ];

  const prompt = sections.map((section) => `${section.title}:\n${section.body}`).join("\n\n");
  const roundedLimit = Math.round(limit);

  return {
    prompt,
    sections,
    taskLabel: task.label,
    channel: task.channel,
    charCount: prompt.length,
    wordCount: countWords(prompt),
    tokenEstimate: estimateTokens(prompt),
    targetChars: roundedLimit,
    smsParts: countSmsParts(roundedLimit),
    fitsWhatsApp: roundedLimit <= WHATSAPP_BODY_LIMIT,
  };
}
