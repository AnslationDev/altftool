/**
 * Fathers Day message generator - pure, deterministic text builder.
 *
 * No React, no DOM, no Math.random, no Date.now. Variety comes from an integer
 * seed supplied by the caller, so identical input gives identical output.
 *
 * Date rules referenced:
 *  - In India, the United States, the United Kingdom, Canada, Japan and much of
 *    Asia, Father's Day falls on the third Sunday of June, so its date moves
 *    every year. It is computed here from a year rather than hard-coded.
 *  - The first Father's Day service was held in Spokane, Washington in 1910 at
 *    the urging of Sonora Smart Dodd. It became a permanent United States
 *    national holiday in 1972.
 *  - Australia and New Zealand mark it on the first Sunday of September.
 *  - Italy, Spain and Portugal keep it on 19 March, St Joseph's Day.
 *  - In Germany, Vatertag falls on Ascension Day, 39 days after Easter Sunday.
 *
 * Message length rules used by the counter:
 *  - GSM-7 encoded SMS fits 160 characters in one segment.
 *  - Any non-Latin character forces UCS-2, which fits 70 per segment.
 *  - WhatsApp text status allows up to 700 characters.
 */

/** Ordinal of the Sunday in June used by India, the US, the UK and others. */
export const FATHERS_DAY_SUNDAY_OF_JUNE = 3;

/** Ordinal of the Sunday in September used by Australia and New Zealand. */
export const FATHERS_DAY_SUNDAY_OF_SEPTEMBER = 1;

/** Year of the first Father's Day service, in Spokane, Washington. */
export const FIRST_FATHERS_DAY_YEAR = 1910;

/** Year Father's Day became a permanent United States national holiday. */
export const US_PERMANENT_HOLIDAY_YEAR = 1972;

/** St Joseph's Day, kept as Father's Day in Italy, Spain and Portugal. */
export const ST_JOSEPHS_DAY = "19 March";

/** Single-segment SMS length for plain Latin (GSM-7) text. */
export const SMS_GSM7_LIMIT = 160;

/** Single-segment SMS length once any non-Latin character forces UCS-2. */
export const SMS_UNICODE_LIMIT = 70;

/** Maximum length of a WhatsApp text status. */
export const WHATSAPP_STATUS_LIMIT = 700;

export const MIN_MESSAGES = 1;
export const MAX_MESSAGES = 6;

export const TONES = [
  {
    id: "heartfelt",
    label: "Heartfelt",
    lines: [
      "Thank you for the steadiness - the kind you only notice when you actually need it.",
      "A lot of what I get quietly right, I copied straight from you.",
      "You never made a speech about any of it. You just showed up, every single time.",
      "Thank you for the patience it must have taken to let me learn things the slow way.",
    ],
    closers: ["Enjoy today - you have earned an easy one.", "With love, always."],
  },
  {
    id: "funny",
    label: "Funny",
    lines: [
      "Thanks for the jokes nobody asked for and the advice everyone eventually took.",
      "You were right about the tyre pressure, the traffic and the weather. You can stop saying it now.",
      "Still the only person alive who can fall asleep during a film he chose himself.",
      "Congratulations on another year as the household's most confident navigator.",
    ],
    closers: ["Enjoy the day, legend.", "The good chair is yours today - do not get up."],
  },
  {
    id: "proud",
    label: "Proud and grown-up",
    lines: [
      "The older I get, the more of your decisions I understand.",
      "You made hard things look ordinary, and I only worked out later how hard they were.",
      "I have watched you keep your word when it cost you something. That stayed with me.",
      "Everything solid I know how to do, I learnt from watching you do it without complaint.",
    ],
    closers: ["Thank you, for all of it.", "Proud to be yours."],
  },
  {
    id: "short",
    label: "Short caption",
    lines: [
      "Happy Father's Day, boss.",
      "Best in the business.",
      "One of one.",
      "Thanks for everything, always.",
    ],
    closers: [],
  },
];

export const RELATIONSHIPS = [
  {
    id: "dad",
    label: "My dad",
    defaultAddress: "Dad",
    line: "",
    allowFunny: true,
  },
  {
    id: "father-in-law",
    label: "Father-in-law",
    defaultAddress: "Dad",
    line: "Thank you for making me feel like family from the first day.",
    allowFunny: true,
  },
  {
    id: "grandfather",
    label: "Grandfather",
    defaultAddress: "Grandpa",
    line: "Thank you for the stories, and for having all that patience the second time around.",
    allowFunny: true,
  },
  {
    id: "stepfather",
    label: "Stepfather",
    defaultAddress: "Dad",
    line: "You chose this, and you have never once made it feel like a choice.",
    allowFunny: true,
  },
  {
    id: "husband",
    label: "Husband or partner, from the mother",
    defaultAddress: "",
    line: "Watching you with the kids is the best decision I ever made, confirmed daily.",
    allowFunny: true,
  },
  {
    id: "mentor",
    label: "Uncle, mentor or father figure",
    defaultAddress: "",
    line: "You have been a father figure in every way that counts.",
    allowFunny: true,
  },
  {
    id: "memory",
    label: "A father who has passed away",
    defaultAddress: "Dad",
    line: "Not a day goes by without something of yours showing up in how we do things.",
    allowFunny: false,
    // A remembrance still speaks to him, so the whole message stays in the
    // second person - only the opening changes shape.
    greeting: {
      withAddress: "Happy Father's Day, {address}. Missing you today.",
      withoutAddress: "Happy Father's Day. Missing you today.",
    },
    // "Enjoy the day" is wrong for a remembrance, so this relationship replaces
    // whatever closing line the tone would otherwise use.
    closers: ["Remembered, every single day.", "With love, always."],
  },
];

const byId = (list, id) => list.find((item) => item.id === id) || null;

const clean = (value) => String(value == null ? "" : value).trim().replace(/\s+/g, " ");

/** Deterministic 32-bit mixer - the same seed always yields the same stream. */
function mix(seed, salt) {
  let h = (Math.trunc(seed) ^ (salt * 0x9e3779b1)) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35) >>> 0;
  return (h ^ (h >>> 16)) >>> 0;
}

/** Character count plus SMS segment count under GSM-7 / UCS-2 rules. */
export function measureMessage(text) {
  const characters = Array.from(String(text || ""));
  const length = characters.length;
  const isUnicode = characters.some((ch) => ch.codePointAt(0) > 0x7f);
  const smsLimit = isUnicode ? SMS_UNICODE_LIMIT : SMS_GSM7_LIMIT;
  return {
    length,
    isUnicode,
    smsLimit,
    smsSegments: length === 0 ? 0 : Math.ceil(length / smsLimit),
    fitsOneSms: length > 0 && length <= smsLimit,
    fitsWhatsAppStatus: length <= WHATSAPP_STATUS_LIMIT,
  };
}

/**
 * The nth Sunday of a month, as "YYYY-MM-DD". Month is 1-12.
 * Returns an empty string if the year is out of range or the nth Sunday does
 * not exist in that month.
 */
export function nthSundayOfMonth(year, month, ordinal) {
  const y = Number(year);
  const m = Number(month);
  const n = Number(ordinal);
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(n)) return "";
  if (y < 1583 || y > 4000 || m < 1 || m > 12 || n < 1 || n > 5) return "";
  const first = new Date(Date.UTC(Math.trunc(y), Math.trunc(m) - 1, 1));
  const firstSunday = 1 + ((7 - first.getUTCDay()) % 7);
  const day = firstSunday + 7 * (Math.trunc(n) - 1);
  const lastDay = new Date(Date.UTC(Math.trunc(y), Math.trunc(m), 0)).getUTCDate();
  if (day > lastDay) return "";
  return `${Math.trunc(y)}-${String(Math.trunc(m)).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Father's Day for India, the US, the UK and most of Asia: third Sunday of June. */
export function fathersDayJune(year) {
  return nthSundayOfMonth(year, 6, FATHERS_DAY_SUNDAY_OF_JUNE);
}

/** Father's Day in Australia and New Zealand: first Sunday of September. */
export function fathersDaySeptember(year) {
  return nthSundayOfMonth(year, 9, FATHERS_DAY_SUNDAY_OF_SEPTEMBER);
}

/** How many distinct messages a tone + relationship combination produces. */
export function variantCountFor(toneId, relationshipId) {
  const tone = byId(TONES, toneId);
  const relationship = byId(RELATIONSHIPS, relationshipId);
  if (!tone || !relationship) return 0;
  if (tone.id === "funny" && !relationship.allowFunny) return 0;
  if (tone.closers.length === 0) return tone.lines.length;
  const closers = relationship.closers || tone.closers;
  return tone.lines.length * closers.length;
}

/**
 * Build Fathers Day messages.
 *
 * @param {object} input
 * @param {string} [input.toneId]         One of TONES ids.
 * @param {string} [input.relationshipId] One of RELATIONSHIPS ids.
 * @param {string} [input.address]        How you address him; defaults per relationship.
 * @param {string} [input.senderName]     Signed at the end.
 * @param {boolean} [input.includeRelationshipLine] Include the relationship-specific line.
 * @param {number} [input.count]          How many variants, 1 to 6.
 * @param {number} [input.seed]           Integer that shuffles the variants.
 * @returns {{error:string}|object}
 */
export function generateFathersDayMessages(input) {
  const data = input && typeof input === "object" ? input : {};

  const tone = byId(TONES, data.toneId);
  if (!tone) return { error: "Pick a tone for the message." };

  const relationship = byId(RELATIONSHIPS, data.relationshipId);
  if (!relationship) return { error: "Pick who the message is for." };

  if (tone.id === "funny" && !relationship.allowFunny) {
    return { error: "A jokey tone does not suit a remembrance - choose heartfelt or proud instead." };
  }

  const addressInput = clean(data.address);
  const senderName = clean(data.senderName);
  if (addressInput.length > 40) return { error: "That form of address is too long - keep it under 40 characters." };
  if (senderName.length > 40) return { error: "Your name is too long - keep it under 40 characters." };

  const countRaw = data.count == null || data.count === "" ? 3 : Number(data.count);
  if (!Number.isFinite(countRaw)) return { error: "Number of messages must be a whole number." };
  const count = Math.round(countRaw);
  if (count < MIN_MESSAGES || count > MAX_MESSAGES) {
    return { error: `Choose between ${MIN_MESSAGES} and ${MAX_MESSAGES} messages at a time.` };
  }

  const seedRaw = data.seed == null || data.seed === "" ? 1 : Number(data.seed);
  if (!Number.isFinite(seedRaw)) return { error: "Seed must be a number." };
  const seed = Math.trunc(seedRaw);

  const maxVariants = variantCountFor(tone.id, relationship.id);
  if (count > maxVariants) {
    return { error: `This tone gives ${maxVariants} distinct messages - lower the count.` };
  }

  const address = addressInput || relationship.defaultAddress;
  const lines = tone.lines;
  const closers = tone.closers.length === 0 ? [] : relationship.closers || tone.closers;
  const useRelationshipLine = data.includeRelationshipLine !== false && Boolean(relationship.line);

  const greeting = relationship.greeting
    ? address
      ? relationship.greeting.withAddress.replace("{address}", address)
      : relationship.greeting.withoutAddress
    : address
      ? `Happy Father's Day, ${address}!`
      : "Happy Father's Day!";

  const lineOffset = mix(seed, 1) % lines.length;
  const closerOffset = closers.length > 0 ? mix(seed, 101) % closers.length : 0;

  const messages = [];
  for (let index = 0; index < count; index += 1) {
    const position = lineOffset + index;
    const bodyLine = lines[position % lines.length];

    const parts = [greeting];
    if (useRelationshipLine) parts.push(relationship.line);
    parts.push(bodyLine);
    if (closers.length > 0) {
      parts.push(closers[(closerOffset + Math.floor(position / lines.length)) % closers.length]);
    }

    let text = tone.id === "short" ? bodyLine : parts.join(" ");
    if (senderName) text += `\n\n- ${senderName}`;

    messages.push({
      id: `${tone.id}-${relationship.id}-${index}`,
      text,
      ...measureMessage(text),
    });
  }

  const longestLength = messages.reduce((max, item) => (item.length > max ? item.length : max), 0);

  return {
    tone,
    relationship,
    seed,
    count,
    messages,
    longestLength,
    variantsAvailable: maxVariants,
    greetingUsed: greeting,
    addressUsed: address,
  };
}
