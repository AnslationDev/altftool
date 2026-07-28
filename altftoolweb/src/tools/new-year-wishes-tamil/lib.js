/**
 * Tamil new year (Puthandu) wishes generator - pure, deterministic text builder.
 *
 * No React, no DOM, no Math.random, no Date.now. Variety comes from an integer
 * seed supplied by the caller, so identical input always gives identical output.
 *
 * Festival facts used in the generated wording:
 *  - Puthandu is the first day of Chithirai, the opening month of the Tamil
 *    solar calendar. In the Gregorian calendar it falls on 14 April in most
 *    years and on 13 or 15 April in some, because the date is fixed by the
 *    sun's entry into Mesha rather than by a fixed civil date.
 *  - The morning begins with kanni - viewing an arrangement of fruit, gold,
 *    betel leaves, coins and a mirror as the first sight of the year.
 *  - Maanga pachadi, the Puthandu dish, combines raw mango, neem flower,
 *    jaggery, tamarind, chilli and salt so the year is tasted in all its
 *    flavours at once.
 *  - Panchanga padanam, the reading of the almanac for the coming year, is
 *    done at the temple or at home on the same morning.
 *  - The Tamil year is named from a repeating cycle of 60 names; the name
 *    changes on Chithirai 1, not on 1 January, so it is taken as free text
 *    here rather than guessed.
 *
 * Message length rules used by the counter:
 *  - GSM-7 encoded SMS fits 160 characters in one segment.
 *  - Any Tamil character forces UCS-2 encoding, which fits 70 per segment.
 *  - WhatsApp text status allows up to 700 characters.
 */

/** Single-segment SMS length for plain Latin (GSM-7) text. */
export const SMS_GSM7_LIMIT = 160;

/** Single-segment SMS length once any non-Latin character forces UCS-2. */
export const SMS_UNICODE_LIMIT = 70;

/** Maximum length of a WhatsApp text status. */
export const WHATSAPP_STATUS_LIMIT = 700;

/** Usual Gregorian date of Chithirai 1; it shifts to 13 or 15 April some years. */
export const PUTHANDU_USUAL_DATE = "14 April";

/** Number of names in the repeating Tamil year-name cycle. */
export const TAMIL_YEAR_CYCLE_LENGTH = 60;

/** Number of tastes combined in maanga pachadi. */
export const PACHADI_TASTE_COUNT = 6;

export const MIN_WISHES = 1;
export const MAX_WISHES = 8;

export const SCRIPTS = [
  { id: "tamil", label: "Tamil script (தமிழ்)" },
  { id: "tanglish", label: "Tanglish (Tamil in Roman letters)" },
  { id: "english", label: "English" },
];

export const OCCASIONS = [
  {
    id: "puthandu",
    label: "Puthandu - Tamil New Year (Chithirai 1)",
    greeting: {
      tamil: "இனிய தமிழ்ப் புத்தாண்டு நல்வாழ்த்துக்கள்",
      tanglish: "Iniya Tamil Puthaandu Nalvaazhthukkal",
      english: "Happy Tamil New Year",
    },
    context: {
      tamil:
        "சித்திரை முதல் நாள் - கண்ணி பார்த்து, மாங்காய் பச்சடி சுவைத்து, பஞ்சாங்கம் கேட்டு புத்தாண்டைத் தொடங்குவோம்.",
      tanglish:
        "Chithirai mudhal naal - kanni paarthu, maanga pachadi suvaithu, panchangam kettu puthaandai thodanguvom.",
      english:
        "Chithirai 1 starts with the kanni viewing, a bowl of six-taste maanga pachadi and the panchangam reading.",
    },
    statusLines: {
      tamil: [
        "புத்தாண்டு பிறந்தது!",
        "சித்திரை வந்தாச்சு.",
        "மாங்காய் பச்சடி ரெடி.",
        "புது வருடம், புது ஆரம்பம்.",
        "வாழ்த்துக்கள்!",
      ],
      tanglish: [
        "Puthaandu piranthadhu!",
        "Chithirai vandhaachu.",
        "Maanga pachadi ready.",
        "Pudhu varudam, pudhu aarambam.",
        "Vaazhthukkal!",
      ],
      english: [
        "Tamil New Year is here.",
        "Chithirai has arrived.",
        "Pachadi first, resolutions later.",
        "New year, new page.",
        "Vaazhthukkal!",
      ],
    },
  },
  {
    id: "january",
    label: "1 January new year",
    greeting: {
      tamil: "இனிய புத்தாண்டு வாழ்த்துக்கள்",
      tanglish: "Iniya Puthaandu Vaazhthukkal",
      english: "Happy New Year",
    },
    context: {
      tamil: "பழைய ஆண்டு கற்றுத் தந்ததை மனதில் வைத்து, புதிய ஆண்டைத் தொடங்குவோம்.",
      tanglish: "Pazhaiya aandu katruthanthathai manathil vaithu, pudhiya aandai thodanguvom.",
      english: "Keep what the last year taught you and start the new one with a clean page.",
    },
    statusLines: {
      tamil: [
        "புது வருடம், புது ஆரம்பம்.",
        "இனிய புத்தாண்டு!",
        "பழைய வருடத்திற்கு விடைகொடுப்போம்.",
        "இந்த வருடம் நம்முடையது.",
        "புதிய பக்கம் ஆரம்பம்.",
      ],
      tanglish: [
        "Pudhu varudam, pudhu aarambam.",
        "Iniya Puthaandu!",
        "Pazhaiya varudathirku vidaikoduppom.",
        "Indha varudam nammudaiyathu.",
        "Pudhiya pakkam aarambam.",
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
      tamil: [
        "இறைவன் அருளால் இந்த ஆண்டு உங்களுக்கு நல்ல ஆரோக்கியமும் செல்வமும் கிடைக்கட்டும்.",
        "உங்கள் குடும்பத்தில் அமைதியும் மகிழ்ச்சியும் நிலைக்கட்டும்.",
        "நீங்கள் நினைத்தது அனைத்தும் இந்த ஆண்டில் நிறைவேறட்டும்.",
      ],
      tanglish: [
        "Iraivan arulaal indha aandu ungalukku nalla aarogyamum selvamum kidaikattum.",
        "Ungal kudumbathil amaidhiyum magizhchiyum nilaikattum.",
        "Neengal ninaithathu anaithum indha aandil niraiverattum.",
      ],
      english: [
        "May this year bring you good health, steady prosperity and the grace you have prayed for.",
        "May peace and contentment stay in your home all through the year.",
        "May everything you quietly hope for this year come true.",
      ],
    },
  },
  {
    id: "family",
    label: "Family and friends",
    lines: {
      tamil: [
        "மாங்காய் பச்சடி போல இந்த ஆண்டும் இனிப்பும் புளிப்பும் கலந்து சுவையாக இருக்கட்டும்.",
        "இந்த ஆண்டு நாம் இன்னும் அதிகமாகச் சந்திக்க வேண்டும், சிரிக்க வேண்டும்.",
        "புது உடை, நல்ல சாப்பாடு, புது ஆரம்பம் - நன்றாக இருங்கள்!",
      ],
      tanglish: [
        "Maanga pachadi pola indha aandum inippum pulippum kalandhu suvaiyaaga irukkattum.",
        "Indha aandu naam innum adhigamaaga sandhikkanum, sirikkanum.",
        "Pudhu udai, nalla saappadu, pudhu aarambam - nandraaga irungal!",
      ],
      english: [
        "May the year taste like maanga pachadi - sweet, sour and bitter in the right measure.",
        "Here is to seeing you more often and laughing a lot louder this year.",
        "New clothes, a full sappadu and a clean slate. Enjoy every bit of it.",
      ],
    },
  },
  {
    id: "professional",
    label: "Colleagues and clients",
    lines: {
      tamil: [
        "உங்களுக்கும் உங்கள் குடும்பத்தினருக்கும் எங்கள் இதயப்பூர்வ புத்தாண்டு வாழ்த்துக்கள்.",
        "வரும் ஆண்டு உங்கள் நிறுவனத்திற்கு வளர்ச்சியையும் வெற்றியையும் தரட்டும்.",
        "உங்கள் தொடர் ஆதரவுக்கு நன்றி; இந்த ஆண்டும் இணைந்து பயணிப்போம்.",
      ],
      tanglish: [
        "Ungalukkum ungal kudumbathinarukkum engal idhayapoorva puthaandu vaazhthukkal.",
        "Varum aandu ungal niruvanathirku valarchiyaiyum vetriyaiyum tharattum.",
        "Ungal thodar aadharavukku nandri; indha aandum inaindhu payanippom.",
      ],
      english: [
        "Warm new year greetings to you and your family from all of us.",
        "May the coming year bring steady growth to you and your team.",
        "Thank you for your continued support - here is to another year of working together.",
      ],
    },
  },
  {
    id: "status",
    // Captions are occasion-specific, so they live on OCCASIONS.statusLines - a
    // Chithirai caption must never appear under a 1 January greeting.
    label: "Short status or caption",
    lines: null,
  },
];

const CLOSERS = {
  tamil: ["நல்வாழ்த்துக்கள்!", "அன்புடன்.", "இனிய புத்தாண்டு!"],
  tanglish: ["Nalvaazhthukkal!", "Anbudan.", "Iniya Puthaandu!"],
  english: ["Wishing you the very best.", "With love.", "Happy new year!"],
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
  return {
    length,
    isUnicode,
    smsLimit,
    smsSegments: length === 0 ? 0 : Math.ceil(length / smsLimit),
    fitsOneSms: length > 0 && length <= smsLimit,
    fitsWhatsAppStatus: length <= WHATSAPP_STATUS_LIMIT,
  };
}

/** The body lines available for an occasion + tone + script combination. */
function linesFor(occasion, tone, script) {
  if (tone.id === "status") return occasion.statusLines[script] || [];
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
 * Build a list of Tamil new year greetings.
 *
 * @param {object} input
 * @param {string} [input.occasionId]    One of OCCASIONS ids.
 * @param {string} [input.toneId]        One of TONES ids.
 * @param {string} [input.script]        One of SCRIPTS ids.
 * @param {string} [input.recipientName] Inserted after the greeting.
 * @param {string} [input.senderName]    Signed at the end.
 * @param {string} [input.yearName]      Optional Tamil year name, e.g. Vishvavasu.
 * @param {number} [input.count]         How many variants, 1 to 8.
 * @param {number} [input.seed]          Integer that shuffles the variants.
 * @returns {{error:string}|object}
 */
export function generateTamilNewYearWishes(input) {
  const data = input && typeof input === "object" ? input : {};

  const occasion = byId(OCCASIONS, data.occasionId);
  if (!occasion) return { error: "Choose Puthandu or the 1 January new year." };

  const tone = byId(TONES, data.toneId);
  if (!tone) return { error: "Pick a tone for the message." };

  const script = byId(SCRIPTS, data.script) ? data.script : null;
  if (!script) return { error: "Pick Tamil script, Tanglish or English." };

  const recipient = clean(data.recipientName);
  const sender = clean(data.senderName);
  const yearName = clean(data.yearName);

  if (recipient.length > 40) return { error: "Recipient name is too long - keep it under 40 characters." };
  if (sender.length > 40) return { error: "Your name is too long - keep it under 40 characters." };
  if (yearName.length > 30) return { error: "Tamil year name is too long - keep it under 30 characters." };

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
  if (yearName && occasion.id === "puthandu") {
    greeting = script === "tamil" ? `${yearName} ஆண்டு - ${greeting}` : `${greeting} (${yearName})`;
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
    greetingUsed: greeting,
  };
}
