/**
 * Telugu new year (Ugadi) wishes generator - pure, deterministic text builder.
 *
 * No React, no DOM, no Math.random, no Date.now. Variety comes from an integer
 * seed passed in by the caller, so identical input gives identical output.
 *
 * Festival facts used in the generated wording:
 *  - Ugadi is the Telugu and Kannada new year, celebrated on Chaitra Shuddha
 *    Padyami - the first day of the bright fortnight of Chaitra in the
 *    lunisolar calendar. It falls in late March or April and moves every year,
 *    so no fixed Gregorian date is hard-coded here.
 *  - Ugadi pachadi combines six tastes in one preparation: jaggery for sweet,
 *    raw mango for tangy, neem flower for bitter, tamarind for sour, salt for
 *    salty and green chilli for hot - a reminder that the year holds all of them.
 *  - Panchanga sravanam, the public reading of the almanac for the coming year,
 *    is done at the temple or at home on the same day.
 *  - The Telugu year takes a name from a repeating cycle of 60, changing on
 *    Ugadi rather than on 1 January, so the name is taken as free text here.
 *
 * Message length rules used by the counter:
 *  - GSM-7 encoded SMS fits 160 characters in a single segment.
 *  - Any Telugu character forces UCS-2, which fits 70 per segment.
 *  - Once a message needs more than one segment, every part of that
 *    concatenated SMS loses a few characters to the UDH header carriers use
 *    to stitch the parts back together, so per-part capacity drops to 153
 *    (GSM-7) or 67 (UCS-2) - the standard concatenated-SMS convention used by
 *    SMS aggregators such as Twilio.
 *  - WhatsApp text status allows up to 700 characters.
 */

/** Single-segment SMS length for plain Latin (GSM-7) text. */
export const SMS_GSM7_LIMIT = 160;

/** Single-segment SMS length once any non-Latin character forces UCS-2. */
export const SMS_UNICODE_LIMIT = 70;

/** Per-part length for GSM-7 text once a message spans multiple concatenated SMS segments. */
export const SMS_GSM7_CONCAT_LIMIT = 153;

/** Per-part length for UCS-2 text once a message spans multiple concatenated SMS segments. */
export const SMS_UNICODE_CONCAT_LIMIT = 67;

/** Maximum length of a WhatsApp text status. */
export const WHATSAPP_STATUS_LIMIT = 700;

/** Tastes combined in Ugadi pachadi: sweet, sour, bitter, tangy, salty, hot. */
export const UGADI_PACHADI_TASTE_COUNT = 6;

/** Names in the repeating Telugu year-name cycle. */
export const TELUGU_YEAR_CYCLE_LENGTH = 60;

export const MIN_WISHES = 1;
export const MAX_WISHES = 8;

export const SCRIPTS = [
  { id: "telugu", label: "Telugu script (తెలుగు)" },
  { id: "tenglish", label: "Tenglish (Telugu in Roman letters)" },
  { id: "english", label: "English" },
];

export const OCCASIONS = [
  {
    id: "ugadi",
    label: "Ugadi - Telugu New Year (Chaitra Shuddha Padyami)",
    greeting: {
      telugu: "ఉగాది శుభాకాంక్షలు",
      tenglish: "Ugadi Shubhakankshalu",
      english: "Happy Ugadi",
    },
    context: {
      telugu:
        "చైత్ర శుద్ధ పాడ్యమి - ఉగాది పచ్చడి రుచి చూసి, పంచాంగ శ్రవణంతో కొత్త సంవత్సరాన్ని మొదలుపెడదాం.",
      tenglish:
        "Chaitra Shuddha Padyami - Ugadi pachadi ruchi chusi, panchanga sravanam-tho kotha samvatsaram modalupedadam.",
      english:
        "Chaitra Shuddha Padyami opens the year with the six tastes of Ugadi pachadi and the panchanga sravanam reading.",
    },
    statusLines: {
      telugu: [
        "ఉగాది వచ్చేసింది!",
        "పచ్చడి ముందు, తీర్మానాలు తర్వాత.",
        "వేప పువ్వు నుంచి బెల్లం దాకా.",
        "కొత్త సంవత్సరం, కొత్త మొదలు.",
        "శుభాకాంక్షలు!",
      ],
      tenglish: [
        "Ugadi vachesindi!",
        "Pachadi mundu, teermanalu tarvata.",
        "Vepa puvvu nunchi bellam daaka.",
        "Kotha samvatsaram, kotha modalu.",
        "Shubhakankshalu!",
      ],
      english: [
        "Ugadi is here.",
        "Pachadi first, resolutions later.",
        "From neem flower to jaggery, all of it.",
        "New year, new page.",
        "Shubhakankshalu!",
      ],
    },
  },
  {
    id: "january",
    label: "1 January new year",
    greeting: {
      telugu: "నూతన సంవత్సర శుభాకాంక్షలు",
      tenglish: "Nutana Samvatsara Shubhakankshalu",
      english: "Happy New Year",
    },
    context: {
      telugu: "గడిచిన సంవత్సరం నేర్పిన పాఠాలతో కొత్త సంవత్సరాన్ని మొదలుపెడదాం.",
      tenglish: "Gadichina samvatsaram nerpina paathaalatho kotha samvatsaram modalupedadam.",
      english: "Take what the last year taught you and open the new one on a clean page.",
    },
    statusLines: {
      telugu: [
        "కొత్త సంవత్సరం, కొత్త మొదలు.",
        "కొత్త ఏడాది శుభాకాంక్షలు!",
        "గడిచిన ఏడాదికి వీడ్కోలు.",
        "ఈ ఏడాది మనదే.",
        "కొత్త పేజీ మొదలైంది.",
      ],
      tenglish: [
        "Kotha samvatsaram, kotha modalu.",
        "Kotha edadi shubhakankshalu!",
        "Gadichina edadiki veedkolu.",
        "Ee edadi manade.",
        "Kotha page modalaindi.",
      ],
      english: [
        "New year, new page.",
        "Happy new year, everyone.",
        "Goodbye to the old one.",
        "This year is ours.",
        "Chapter one, page one.",
      ],
    },
  },
];

export const TONES = [
  {
    id: "traditional",
    label: "Traditional and respectful",
    lines: {
      telugu: [
        "ఈ సంవత్సరం మీకు ఆరోగ్యం, ఐశ్వర్యం, ఆనందం కలగాలని కోరుకుంటున్నాను.",
        "మీ ఇంట్లో శాంతి, సౌభాగ్యం నిలిచి ఉండాలి.",
        "మీరు అనుకున్నవన్నీ ఈ ఏడాది నెరవేరాలి.",
      ],
      tenglish: [
        "Ee samvatsaram meeku aarogyam, aishwaryam, aanandam kalagalani korukuntunnanu.",
        "Mee intlo shanti, soubhagyam nilichi undali.",
        "Meeru anukunnavanni ee edadi neraveraali.",
      ],
      english: [
        "May this year bring you health, prosperity and peace of mind.",
        "May your home stay full of calm and good fortune right through the year.",
        "May everything you have been working towards finally come through this year.",
      ],
    },
  },
  {
    id: "family",
    label: "Family and friends",
    // The Ugadi-pachadi line only makes sense for the Ugadi occasion, so
    // (unlike "traditional" and "professional", which are genuinely
    // occasion-neutral) this tone's lines are split per occasion the same
    // way OCCASIONS.statusLines is - see linesFor().
    linesByOccasion: {
      ugadi: {
        telugu: [
          "ఉగాది పచ్చడిలా ఈ సంవత్సరం కూడా అన్ని రుచులతో నిండుగా ఉండాలి.",
          "ఈ ఏడాది మనం ఇంకా ఎక్కువసార్లు కలుద్దాం, ఇంకా ఎక్కువ నవ్వుదాం.",
          "కొత్త బట్టలు, మంచి భోజనం, కొత్త మొదలు - బాగుండండి!",
        ],
        tenglish: [
          "Ugadi pachadi laaga ee samvatsaram kuda anni ruchulatho nindugaa undali.",
          "Ee edadi manam inka ekkuvasarlu kaluddam, inka ekkuva navvudam.",
          "Kotha battalu, manchi bhojanam, kotha modalu - baagundandi!",
        ],
        english: [
          "May the year taste like Ugadi pachadi - every flavour in its right place.",
          "Here is to meeting more often and laughing a lot louder this year.",
          "New clothes, a full plate and a clean slate. Enjoy all of it.",
        ],
      },
      january: {
        telugu: [
          "ఈ కొత్త సంవత్సరం మీ కుటుంబానికి ఆనందం, ఆరోగ్యం, మంచి భోజనం తీసుకురావాలి.",
          "ఈ ఏడాది మనం ఇంకా ఎక్కువసార్లు కలుద్దాం, ఇంకా ఎక్కువ నవ్వుదాం.",
          "కొత్త బట్టలు, మంచి భోజనం, కొత్త మొదలు - బాగుండండి!",
        ],
        tenglish: [
          "Ee kotha samvatsaram mee kutumbaniki aanandam, aarogyam, manchi bhojanam theesukuravali.",
          "Ee edadi manam inka ekkuvasarlu kaluddam, inka ekkuva navvudam.",
          "Kotha battalu, manchi bhojanam, kotha modalu - baagundandi!",
        ],
        english: [
          "May this new year bring your family joy, good health and plenty of good food.",
          "Here is to meeting more often and laughing a lot louder this year.",
          "New clothes, a full plate and a clean slate. Enjoy all of it.",
        ],
      },
    },
  },
  {
    id: "professional",
    label: "Colleagues and clients",
    lines: {
      telugu: [
        "మీకు మరియు మీ కుటుంబ సభ్యులకు హృదయపూర్వక నూతన సంవత్సర శుభాకాంక్షలు.",
        "రాబోయే సంవత్సరం మీ సంస్థకు వృద్ధిని, విజయాన్ని అందించాలి.",
        "మీ నిరంతర సహకారానికి ధన్యవాదాలు; ఈ ఏడాది కూడా కలిసి పని చేద్దాం.",
      ],
      tenglish: [
        "Meeku mariyu mee kutumba sabhyulaku hrudayapoorvaka nutana samvatsara shubhakankshalu.",
        "Raaboye samvatsaram mee samsthaku vruddhini, vijayanni andinchali.",
        "Mee nirantara sahakaraaniki dhanyavaadalu; ee edadi kuda kalisi pani cheddam.",
      ],
      english: [
        "Warm new year greetings to you and your family from all of us.",
        "May the coming year bring steady growth to you and your organisation.",
        "Thank you for your continued support - here is to another year of working together.",
      ],
    },
  },
  {
    id: "status",
    // Short captions are occasion-specific, so they live on OCCASIONS.statusLines
    // instead of here - an Ugadi caption must not appear under a 1 January wish.
    label: "Short status or caption",
    lines: null,
  },
];

const CLOSERS = {
  telugu: ["శుభాకాంక్షలు!", "ప్రేమతో.", "మీ శ్రేయోభిలాషి."],
  tenglish: ["Shubhakankshalu!", "Prematho.", "Mee shreyobhilashi."],
  english: ["Wishing you the very best.", "With love.", "Warm regards."],
};

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
  const concatLimit = isUnicode ? SMS_UNICODE_CONCAT_LIMIT : SMS_GSM7_CONCAT_LIMIT;
  const fitsOneSms = length > 0 && length <= smsLimit;
  // A message that fits in one segment uses the full single-segment budget.
  // Once it needs more than one segment, every part (including the first)
  // is capped at the smaller concatenated-SMS per-part limit, because each
  // part now carries a UDH header.
  const smsSegments = length === 0 ? 0 : fitsOneSms ? 1 : Math.ceil(length / concatLimit);
  return {
    length,
    isUnicode,
    smsLimit,
    concatLimit,
    smsSegments,
    fitsOneSms,
    fitsWhatsAppStatus: length <= WHATSAPP_STATUS_LIMIT,
  };
}

/** The body lines available for an occasion + tone + script combination. */
function linesFor(occasion, tone, script) {
  if (tone.id === "status") return occasion.statusLines[script] || [];
  if (tone.linesByOccasion) {
    const byOccasion = tone.linesByOccasion[occasion.id];
    return (byOccasion && byOccasion[script]) || [];
  }
  return (tone.lines && tone.lines[script]) || [];
}

/** How many distinct messages an occasion + tone + script combination produces. */
export function variantCountFor(occasionId, toneId, script) {
  const occasion = byId(OCCASIONS, occasionId);
  const tone = byId(TONES, toneId);
  if (!occasion || !tone || !CLOSERS[script]) return 0;
  const lines = linesFor(occasion, tone, script);
  if (lines.length === 0) return 0;
  if (tone.id === "status") return lines.length;
  return lines.length * CLOSERS[script].length;
}

/**
 * Build a list of Telugu new year greetings.
 *
 * @param {object} input
 * @param {string} [input.occasionId]    One of OCCASIONS ids.
 * @param {string} [input.toneId]        One of TONES ids.
 * @param {string} [input.script]        One of SCRIPTS ids.
 * @param {string} [input.recipientName] Inserted after the greeting.
 * @param {string} [input.senderName]    Signed at the end.
 * @param {string} [input.yearName]      Optional Telugu year name from the 60-year cycle.
 * @param {number} [input.count]         How many variants, 1 to 8.
 * @param {number} [input.seed]          Integer that shuffles the variants.
 * @returns {{error:string}|object}
 */
export function generateTeluguNewYearWishes(input) {
  const data = input && typeof input === "object" ? input : {};

  const occasion = byId(OCCASIONS, data.occasionId);
  if (!occasion) return { error: "Choose Ugadi or the 1 January new year." };

  const tone = byId(TONES, data.toneId);
  if (!tone) return { error: "Pick a tone for the message." };

  const script = byId(SCRIPTS, data.script) ? data.script : null;
  if (!script) return { error: "Pick Telugu script, Tenglish or English." };

  const recipient = clean(data.recipientName);
  const sender = clean(data.senderName);
  const yearName = clean(data.yearName);

  if (recipient.length > 40) return { error: "Recipient name is too long - keep it under 40 characters." };
  if (sender.length > 40) return { error: "Your name is too long - keep it under 40 characters." };
  if (yearName.length > 30) return { error: "Telugu year name is too long - keep it under 30 characters." };

  const countRaw = data.count == null || data.count === "" ? 3 : Number(data.count);
  if (!Number.isFinite(countRaw)) return { error: "Number of messages must be a whole number." };
  const count = Math.round(countRaw);
  if (count < MIN_WISHES || count > MAX_WISHES) {
    return { error: `Choose between ${MIN_WISHES} and ${MAX_WISHES} messages at a time.` };
  }

  const seedRaw = data.seed == null || data.seed === "" ? 1 : Number(data.seed);
  if (!Number.isFinite(seedRaw)) return { error: "Seed must be a number." };
  const seed = Math.trunc(seedRaw);

  const toneLines = linesFor(occasion, tone, script);
  const closers = CLOSERS[script];
  const isShort = tone.id === "status";
  if (toneLines.length === 0) return { error: "No wording is available for that combination yet." };

  const maxVariants = isShort ? toneLines.length : toneLines.length * closers.length;
  if (count > maxVariants) {
    return {
      error: `This tone has ${maxVariants} distinct messages - lower the count or pick another tone.`,
    };
  }

  let greeting = occasion.greeting[script];
  if (yearName && occasion.id === "ugadi") {
    greeting = script === "telugu" ? `${yearName} నామ సంవత్సర ${greeting}` : `${greeting} (${yearName})`;
  }
  const context = occasion.context[script];

  // Deterministic walk: the tone line advances every step and the closer once per
  // full pass, so the first maxVariants messages are all different.
  const toneOffset = mix(seed, 1) % toneLines.length;
  const closerOffset = mix(seed, 101) % closers.length;

  const wishes = [];
  for (let index = 0; index < count; index += 1) {
    const toneLine = toneLines[(toneOffset + index) % toneLines.length];
    const closer =
      closers[(closerOffset + Math.floor((toneOffset + index) / toneLines.length)) % closers.length];

    // A status caption stands on its own; prefixing the greeting would repeat it.
    const head = recipient ? `${greeting}, ${recipient}!` : `${greeting}!`;
    const parts = isShort ? [toneLine] : [head, context, toneLine, closer];
    let text = parts.join(" ");
    if (sender) text += `\n\n- ${sender}`;

    wishes.push({
      id: `${occasion.id}-${tone.id}-${script}-${index}`,
      text,
      ...measureMessage(text),
    });
  }

  const longestLength = wishes.reduce((max, wish) => (wish.length > max ? wish.length : max), 0);

  return {
    occasion,
    tone,
    script,
    seed,
    count,
    wishes,
    longestLength,
    variantsAvailable: maxVariants,
    // Short captions never include the greeting/head (see the loop above),
    // so there is nothing meaningful to report here for that tone - reporting
    // `greeting` unconditionally would show text the copyable messages don't
    // actually contain, including any yearName customization the user typed.
    greetingUsed: isShort ? null : greeting,
  };
}
