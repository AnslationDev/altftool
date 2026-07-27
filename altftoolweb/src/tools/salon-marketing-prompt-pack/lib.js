/**
 * A pack of salon marketing prompts, plus the channel maths that decides how
 * long each message may be.
 *
 * SMS length is not a style choice — it is set by the GSM 03.38 encoding. A
 * message that fits the 7-bit alphabet gets 160 characters in one segment; add
 * one character outside that alphabet and the whole message switches to UCS-2
 * at 70 characters. Concatenated messages lose room to the 6-byte user data
 * header, leaving 153 and 67 respectively.
 */

/** GSM 03.38 7-bit alphabet: 160 septets fit in a single, unconcatenated SMS. */
export const GSM7_SINGLE = 160;

/** Concatenated GSM-7 segments carry a 7-septet header, leaving 153. */
export const GSM7_CONCAT = 153;

/** UCS-2 (any character outside the GSM alphabet) fits 70 units in one segment. */
export const UCS2_SINGLE = 70;

/** Concatenated UCS-2 segments lose 3 units to the header, leaving 67. */
export const UCS2_CONCAT = 67;

/** Characters in the GSM 03.38 basic alphabet. */
const GSM7_BASIC =
  "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?" +
  "¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà";

/** Extension-table characters cost two septets each. */
const GSM7_EXTENDED = "^{}\\[~]|€";

const GSM7_BASIC_SET = new Set(GSM7_BASIC.split(""));
const GSM7_EXTENDED_SET = new Set(GSM7_EXTENDED.split(""));

/**
 * Count SMS segments for a message.
 *
 * @returns {object} { encoding, units, segments, perSegment, capacity, remaining }
 */
export function countSmsSegments(text) {
  const value = String(text ?? "");
  if (value.length === 0) {
    return { encoding: "GSM-7", units: 0, segments: 0, perSegment: GSM7_SINGLE, capacity: GSM7_SINGLE, remaining: GSM7_SINGLE };
  }

  let gsmCompatible = true;
  let septets = 0;
  for (const char of value) {
    if (GSM7_BASIC_SET.has(char)) septets += 1;
    else if (GSM7_EXTENDED_SET.has(char)) septets += 2;
    else {
      gsmCompatible = false;
      break;
    }
  }

  if (gsmCompatible) {
    const segments = septets <= GSM7_SINGLE ? 1 : Math.ceil(septets / GSM7_CONCAT);
    const perSegment = segments === 1 ? GSM7_SINGLE : GSM7_CONCAT;
    const capacity = segments === 1 ? GSM7_SINGLE : segments * GSM7_CONCAT;
    return { encoding: "GSM-7", units: septets, segments, perSegment, capacity, remaining: capacity - septets };
  }

  // UCS-2 counts UTF-16 code units, so an emoji outside the BMP costs two.
  const units = value.length;
  const segments = units <= UCS2_SINGLE ? 1 : Math.ceil(units / UCS2_CONCAT);
  const perSegment = segments === 1 ? UCS2_SINGLE : UCS2_CONCAT;
  const capacity = segments === 1 ? UCS2_SINGLE : segments * UCS2_CONCAT;
  return { encoding: "UCS-2", units, segments, perSegment, capacity, remaining: capacity - units };
}

/** How many characters a given number of GSM-7 segments buys you. */
export function smsBudget(segments) {
  if (!Number.isFinite(segments) || segments < 1) return { error: "Segments must be 1 or more." };
  const whole = Math.floor(segments);
  return {
    segments: whole,
    gsm7: whole === 1 ? GSM7_SINGLE : whole * GSM7_CONCAT,
    ucs2: whole === 1 ? UCS2_SINGLE : whole * UCS2_CONCAT,
  };
}

/** Published per-channel limits used to set the character budget in a prompt. */
export const CHANNEL_LIMITS = {
  whatsapp: { label: "WhatsApp", limit: 1024, note: "Keep under about 1,000 characters so the message is not collapsed behind 'Read more'." },
  sms: { label: "SMS", limit: GSM7_SINGLE, note: "160 GSM-7 characters in one segment; 70 if any emoji or non-Latin character is used." },
  instagram: { label: "Instagram caption", limit: 2200, note: "2,200 character cap, 30 hashtags maximum; only the first ~125 characters show before 'more'." },
  gbp: { label: "Google Business Profile post", limit: 1500, note: "1,500 character cap; the first 150 or so are what most people read." },
  poster: { label: "In-salon poster", limit: 220, note: "Read from two metres away — one offer, one price, one action." },
};

/** Prompt templates. {{placeholders}} are substituted before the prompt is used. */
export const PROMPT_PACK = [
  {
    id: "offer",
    title: "Seasonal or launch offer",
    channel: "whatsapp",
    useWhen: "You have a dated offer and a list that has opted in.",
    template:
      "Write a WhatsApp broadcast for {{salon}}, a salon in {{city}}.\nOffer: {{offer}}\nValid: {{dates}}\nBooking: {{booking}}\n\nRules: under {{limit}} characters. One offer only. State the price and the end date as given — invent neither. Open with the benefit, not a greeting. End with one clear booking instruction. No emoji strings, at most one emoji. Do not imply the offer is limited unless {{dates}} says so.",
  },
  {
    id: "reminder",
    title: "Appointment reminder",
    channel: "sms",
    useWhen: "24 hours before an appointment.",
    template:
      "Write an SMS appointment reminder for {{salon}}.\nService: {{service}}\nBooking window: {{dates}}\nCancellation window: {{cancellation}}\n\nRules: at most {{limit}} characters using plain Latin characters only, so it sends as a single GSM-7 segment. No emoji. Include the salon name, the service, a placeholder for date and time as [DATE] [TIME], and how to reschedule. No marketing message.",
  },
  {
    id: "beforeafter",
    title: "Before and after caption",
    channel: "instagram",
    useWhen: "Posting a client transformation with written consent.",
    template:
      "Write an Instagram caption for a before-and-after post from {{salon}} in {{city}}.\nService shown: {{service}}\nWhat actually changed: {{detail}}\n\nRules: under {{limit}} characters, with the hook in the first 125 characters. Describe the technique and the maintenance honestly. Never claim a result is permanent, universal or guaranteed. Never name the client. Add at most 8 relevant hashtags on a separate line. State that the client consented to the photo.",
  },
  {
    id: "rebook",
    title: "Rebooking nudge",
    channel: "whatsapp",
    useWhen: "A regular client is past their usual interval.",
    template:
      "Write a short WhatsApp message from {{salon}} to a client whose usual interval for {{service}} is {{interval}} and who is now overdue.\nBooking: {{booking}}\n\nRules: under {{limit}} characters. Friendly, not guilt-inducing. One sentence of context, one practical reason the interval matters for this service, one booking line. No discount unless {{offer}} is filled in. Do not assume why they have not been back.",
  },
  {
    id: "review",
    title: "Review request",
    channel: "sms",
    useWhen: "A few hours after a completed appointment.",
    template:
      "Write an SMS asking a client of {{salon}} to leave a review after their {{service}}.\nLink: {{link}}\n\nRules: at most {{limit}} plain Latin characters, single segment, no emoji. Ask once, make it easy, and give an opt-out. Never offer a reward, discount or entry in exchange for a review, and never ask only clients who seemed happy — both breach most platform policies.",
  },
  {
    id: "stylist",
    title: "New stylist introduction",
    channel: "instagram",
    useWhen: "Someone new joins the floor.",
    template:
      "Write an Instagram caption introducing a new team member at {{salon}} in {{city}}.\nName and role: {{detail}}\nWhat they specialise in: {{service}}\nBooking: {{booking}}\n\nRules: under {{limit}} characters. Two or three specifics about their work, one line on what a client can book them for, one booking instruction. No invented awards, training or years of experience. First 125 characters must stand alone.",
  },
  {
    id: "quietday",
    title: "Quiet-day filler",
    channel: "sms",
    useWhen: "Midweek gaps you want to fill this week.",
    template:
      "Write an SMS from {{salon}} offering {{offer}} to fill quiet appointment slots.\nWindow: {{dates}}\nBooking: {{booking}}\n\nRules: at most {{limit}} plain Latin characters, one segment, no emoji. Name the service, the saving and the window exactly as given. One instruction to book. Include STOP-to-opt-out wording appropriate for a marketing SMS.",
  },
  {
    id: "policy",
    title: "Cancellation policy note",
    channel: "whatsapp",
    useWhen: "Sending the policy at the point of booking.",
    template:
      "Write a WhatsApp message from {{salon}} setting out the cancellation and no-show policy.\nPolicy: {{cancellation}}\n\nRules: under {{limit}} characters. Neutral and factual, no apologising and no scolding. State the notice period, what happens if it is missed, and how to reschedule. Do not add terms that are not in the policy text above. Say the policy applies to everyone equally.",
  },
  {
    id: "package",
    title: "Package or membership pitch",
    channel: "whatsapp",
    useWhen: "Offering a multi-visit package to regulars.",
    template:
      "Write a WhatsApp message from {{salon}} pitching a package for {{service}}.\nPackage terms: {{offer}}\nValid: {{dates}}\nBooking: {{booking}}\n\nRules: under {{limit}} characters. State what is included, the total price and the per-visit price as given — do not calculate a saving you were not given. Name any expiry. One booking line. No pressure language.",
  },
  {
    id: "gbp",
    title: "Google Business Profile update",
    channel: "gbp",
    useWhen: "Weekly post to keep the profile active.",
    template:
      "Write a Google Business Profile post for {{salon}} in {{city}}.\nTopic: {{offer}}\nService: {{service}}\nBooking: {{booking}}\n\nRules: under {{limit}} characters, with the point made in the first 150. Plain sentences, no hashtags, no emoji. One call to action. Mention the neighbourhood or landmark only if it is in {{city}}. No claims about being the best or the only.",
  },
];

/** Every placeholder the pack uses, with the label shown beside its input. */
export const PACK_PLACEHOLDERS = [
  { key: "salon", label: "Salon name", placeholder: "Glow Studio" },
  { key: "city", label: "City or neighbourhood", placeholder: "Koregaon Park, Pune" },
  { key: "service", label: "Service in focus", placeholder: "Balayage colour" },
  { key: "offer", label: "Offer or package terms", placeholder: "20% off colour on Tuesdays and Wednesdays" },
  { key: "dates", label: "Valid dates or window", placeholder: "1 to 15 August" },
  { key: "booking", label: "How to book", placeholder: "Reply BOOK or call 020 1234 5678" },
  { key: "interval", label: "Usual rebooking interval", placeholder: "6 to 8 weeks" },
  { key: "cancellation", label: "Cancellation policy", placeholder: "24 hours notice, otherwise 50% of the service price" },
  { key: "detail", label: "Specific detail for this post", placeholder: "Root shadow added, ends toned twice" },
  { key: "link", label: "Link", placeholder: "g.page/r/example/review" },
];

const PLACEHOLDER_PATTERN = /\{\{([a-z_]+)\}\}/gi;

/** Which placeholders a template uses, in order of first appearance. */
export function listPlaceholders(template) {
  const found = [];
  const seen = new Set();
  for (const match of String(template ?? "").matchAll(PLACEHOLDER_PATTERN)) {
    const key = match[1];
    if (seen.has(key)) continue;
    seen.add(key);
    found.push(key);
  }
  return found;
}

/**
 * Substitute values into a template.
 *
 * @returns {object} { text, missing } — missing lists placeholders left unfilled,
 * which stay visible in the text so they cannot be sent by accident.
 */
export function fillTemplate(template, values = {}) {
  const source = String(template ?? "");
  if (!source) return { error: "There is no template to fill." };
  const missing = [];
  const text = source.replace(PLACEHOLDER_PATTERN, (whole, key) => {
    const value = values[key];
    if (value === undefined || value === null || String(value).trim() === "") {
      if (!missing.includes(key)) missing.push(key);
      return whole;
    }
    return String(value).trim();
  });
  return { text, missing };
}

/**
 * Build the selected prompts with the channel character budget filled in.
 *
 * @returns {object} Either { error } or { prompts, stats, warnings }.
 */
export function buildPack({ values = {}, selectedIds = [], smsSegments = 1 } = {}) {
  if (!Array.isArray(selectedIds) || selectedIds.length === 0) {
    return { error: "Select at least one prompt from the pack." };
  }
  const budget = smsBudget(smsSegments);
  if (budget.error) return { error: budget.error };

  const chosen = PROMPT_PACK.filter((item) => selectedIds.includes(item.id));
  if (chosen.length === 0) return { error: "None of the selected ids match a prompt in this pack." };

  const prompts = chosen.map((item) => {
    const channel = CHANNEL_LIMITS[item.channel];
    const limit = item.channel === "sms" ? budget.gsm7 : channel.limit;
    const filled = fillTemplate(item.template, { ...values, limit: String(limit) });
    return {
      id: item.id,
      title: item.title,
      channel: channel.label,
      channelNote: channel.note,
      useWhen: item.useWhen,
      limit,
      text: filled.text,
      missing: filled.missing.filter((key) => key !== "limit"),
      chars: filled.text.length,
    };
  });

  const missingKeys = [...new Set(prompts.flatMap((item) => item.missing))];
  const warnings = [];
  if (missingKeys.length > 0) {
    warnings.push(`Unfilled placeholders remain: ${missingKeys.join(", ")}. They are left visible so nothing is sent half-written.`);
  }
  if (smsSegments > 1) {
    warnings.push(`SMS prompts are budgeted for ${budget.segments} segments (${budget.gsm7} GSM-7 characters). Each extra segment is billed separately by most providers.`);
  }

  const combined = prompts
    .map((item) => `### ${item.title} — ${item.channel}\nUse when: ${item.useWhen}\n\n${item.text}`)
    .join("\n\n---\n\n");

  return {
    prompts,
    combined,
    warnings,
    stats: {
      promptCount: prompts.length,
      totalChars: combined.length,
      missingCount: missingKeys.length,
      smsSegments: budget.segments,
      smsBudgetGsm7: budget.gsm7,
      smsBudgetUcs2: budget.ucs2,
    },
  };
}
