/**
 * Urdu New Year Wishes — greeting bank plus pure composition helpers.
 * No React, no DOM, no timers. Same input -> same output.
 */

/**
 * GSM 03.38 default 7-bit alphabet. A message made only of these characters is
 * sent as GSM-7; anything else forces the UCS-2 (UTF-16) alphabet.
 */
export const GSM7_BASIC =
  "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà";

/** GSM 03.38 extension table — each of these costs 2 septets (escape + char). */
export const GSM7_EXTENDED = "^{}\\[~]|€";

/**
 * One SMS carries 140 bytes of payload (3GPP TS 23.038 / 23.040).
 * 140 bytes = 160 septets in GSM-7, or 70 UTF-16 code units in UCS-2.
 * A concatenated message spends 6 bytes on the UDH header, leaving
 * 153 septets or 67 UTF-16 code units per part.
 */
export const SMS_LIMITS = {
  gsm7Single: 160,
  gsm7Multi: 153,
  ucs2Single: 70,
  ucs2Multi: 67,
};

/** Longest name accepted, so a greeting stays readable on one screen. */
export const NAME_MAX_LENGTH = 40;

export const OCCASIONS = [
  {
    id: "gregorian",
    label: "1 January (naya saal)",
    note: "The Gregorian new year, greeted with naya saal mubarak.",
  },
  {
    id: "hijri",
    label: "Hijri new year (1 Muharram)",
    note: "First day of Muharram in the Islamic lunar calendar. Muharram is also a month of mourning, so these greetings are worded soberly rather than festively.",
  },
];

export const TONES = [
  { id: "all", label: "All tones" },
  { id: "traditional", label: "Traditional" },
  { id: "warm", label: "Warm and personal" },
  { id: "formal", label: "Formal / business" },
  { id: "short", label: "Short status line" },
  { id: "poetic", label: "Poetic" },
];

export const SCRIPTS = [
  { id: "native", label: "Urdu script only" },
  { id: "roman", label: "Roman Urdu only" },
  { id: "both", label: "Urdu + Roman Urdu" },
];

/**
 * Salutations follow ordinary Urdu letter usage: mohtaram for a senior, janab
 * in formal writing, pyare for family, aziz for a younger person, and a bare
 * name between friends. The punctuation mark is the Arabic comma U+060C.
 */
export const RELATIONSHIPS = [
  { id: "none", label: "No salutation", native: "", roman: "", english: "" },
  {
    id: "elder",
    label: "Elder / teacher",
    native: "محترم {name}،",
    roman: "Mohtaram {name},",
    english: "Respected {name},",
  },
  {
    id: "family",
    label: "Family",
    native: "پیارے {name}،",
    roman: "Pyare {name},",
    english: "Dear {name},",
  },
  {
    id: "friend",
    label: "Friend",
    native: "{name}،",
    roman: "{name},",
    english: "{name},",
  },
  {
    id: "colleague",
    label: "Colleague / client",
    native: "جناب {name}،",
    roman: "Janab {name},",
    english: "Honourable {name},",
  },
  {
    id: "younger",
    label: "Younger relative",
    native: "عزیز {name}،",
    roman: "Aziz {name},",
    english: "Dear (younger) {name},",
  },
];

export const WISHES = [
  {
    id: "gr-trad-1",
    occasion: "gregorian",
    tone: "traditional",
    native: "نیا سال مبارک ہو! یہ سال آپ کے لیے خوشیاں اور برکتیں لے کر آئے۔",
    roman:
      "Naya saal mubarak ho! Yeh saal aap ke liye khushiyan aur barkatein le kar aaye.",
    english: "Happy new year! May this year bring you joys and blessings.",
  },
  {
    id: "gr-trad-2",
    occasion: "gregorian",
    tone: "traditional",
    native: "نئے سال کی دلی مبارکباد۔ اللہ آپ کو صحت اور کامیابی عطا فرمائے۔",
    roman:
      "Naye saal ki dili mubarakbaad. Allah aap ko sehat aur kamyabi ata farmaye.",
    english:
      "Heartfelt congratulations on the new year. May God grant you health and success.",
  },
  {
    id: "gr-warm-1",
    occasion: "gregorian",
    tone: "warm",
    native: "نئے سال میں تمہارا ہر دن ہنستا ہوا گزرے اور ہر خواب پورا ہو۔",
    roman: "Naye saal mein tumhara har din hansta hua guzre aur har khwab pura ho.",
    english:
      "In the new year may each of your days pass smiling and every dream be fulfilled.",
  },
  {
    id: "gr-formal-1",
    occasion: "gregorian",
    tone: "formal",
    native:
      "نئے سال کی مبارکباد۔ گزشتہ سال کے تعاون کا شکریہ؛ آئندہ بھی ساتھ کام کرنے کے منتظر ہیں۔",
    roman:
      "Naye saal ki mubarakbaad. Guzishta saal ke taawun ka shukriya; aainda bhi saath kaam karne ke muntazir hain.",
    english:
      "Congratulations on the new year. Thank you for your cooperation last year; we look forward to working together again.",
  },
  {
    id: "gr-short-1",
    occasion: "gregorian",
    tone: "short",
    native: "نیا سال مبارک! ✨",
    roman: "Naya saal mubarak! ✨",
    english: "Happy new year!",
  },
  {
    id: "gr-poetic-1",
    occasion: "gregorian",
    tone: "poetic",
    native: "پرانا ورق پلٹ گیا، نئی کہانی شروع۔ نیا سال مبارک۔",
    roman: "Purana waraq palat gaya, nayi kahani shuru. Naya saal mubarak.",
    english: "The old page has turned and a new story begins. Happy new year.",
  },
  {
    id: "hj-trad-1",
    occasion: "hijri",
    tone: "traditional",
    native: "نئے ہجری سال کی مبارکباد۔ یہ سال امن اور رحمت کا سال ہو۔",
    roman: "Naye Hijri saal ki mubarakbaad. Yeh saal aman aur rehmat ka saal ho.",
    english:
      "Congratulations on the new Hijri year. May it be a year of peace and mercy.",
  },
  {
    id: "hj-trad-2",
    occasion: "hijri",
    tone: "traditional",
    native: "ماہِ محرم کے آغاز پر نیا اسلامی سال مبارک ہو۔",
    roman: "Maah-e-Muharram ke aaghaz par naya Islami saal mubarak ho.",
    english:
      "A blessed new Islamic year to you at the beginning of the month of Muharram.",
  },
  {
    id: "hj-formal-1",
    occasion: "hijri",
    tone: "formal",
    native: "نئے اسلامی سال کے موقع پر آپ کو اور آپ کے اہلِ خانہ کو مبارکباد۔",
    roman:
      "Naye Islami saal ke mauqe par aap ko aur aap ke ahl-e-khana ko mubarakbaad.",
    english:
      "Congratulations to you and your household on the occasion of the new Islamic year.",
  },
  {
    id: "hj-short-1",
    occasion: "hijri",
    tone: "short",
    native: "نیا اسلامی سال مبارک۔",
    roman: "Naya Islami saal mubarak.",
    english: "A blessed new Islamic year.",
  },
  {
    id: "hj-poetic-1",
    occasion: "hijri",
    tone: "poetic",
    native: "ایک اور سال کا چاند نکلا؛ دل سکون سے بھرے رہیں۔",
    roman: "Ek aur saal ka chaand nikla; dil sukoon se bhare rahein.",
    english:
      "The moon of another year has risen; may hearts stay filled with calm.",
  },
];

/**
 * Billable length of an SMS under 3GPP TS 23.038.
 * Returns the alphabet the network would pick, the billable unit count and the
 * number of 140-byte segments the message would occupy.
 */
export function measureSms(text) {
  const value = typeof text === "string" ? text : "";
  let septets = 0;
  let gsmSafe = true;

  for (const ch of value) {
    if (GSM7_BASIC.indexOf(ch) !== -1) {
      septets += 1;
    } else if (GSM7_EXTENDED.indexOf(ch) !== -1) {
      septets += 2;
    } else {
      gsmSafe = false;
      break;
    }
  }

  if (gsmSafe) {
    const segments =
      septets === 0
        ? 0
        : septets <= SMS_LIMITS.gsm7Single
          ? 1
          : Math.ceil(septets / SMS_LIMITS.gsm7Multi);
    return {
      encoding: "GSM-7",
      units: septets,
      segments,
      perSegment: segments > 1 ? SMS_LIMITS.gsm7Multi : SMS_LIMITS.gsm7Single,
    };
  }

  // UCS-2 bills UTF-16 code units, so an emoji outside the BMP costs 2.
  const units = value.length;
  const segments =
    units === 0
      ? 0
      : units <= SMS_LIMITS.ucs2Single
        ? 1
        : Math.ceil(units / SMS_LIMITS.ucs2Multi);
  return {
    encoding: "UCS-2",
    units,
    segments,
    perSegment: segments > 1 ? SMS_LIMITS.ucs2Multi : SMS_LIMITS.ucs2Single,
  };
}

/** Whitespace-separated word count; 0 for an empty or blank string. */
export function countWords(text) {
  const trimmed = typeof text === "string" ? text.trim() : "";
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

function applyName(template, name) {
  if (!template) return "";
  return template.replace(/\{name\}/g, name);
}

function joinLines(parts) {
  return parts.filter((part) => part && part.length > 0).join("\n");
}

/**
 * Build the greeting list for one occasion / tone / relationship combination.
 * Returns { error } for anything it cannot honestly answer.
 */
export function buildWishes({
  occasionId = "gregorian",
  toneId = "all",
  relationshipId = "family",
  script = "native",
  recipientName = "",
  senderName = "",
} = {}) {
  const occasion = OCCASIONS.find((item) => item.id === occasionId);
  if (!occasion) return { error: "Pick one of the listed occasions." };

  const tone = TONES.find((item) => item.id === toneId);
  if (!tone) return { error: "Pick one of the listed tones." };

  const relationship = RELATIONSHIPS.find((item) => item.id === relationshipId);
  if (!relationship) return { error: "Pick one of the listed relationships." };

  const scriptOption = SCRIPTS.find((item) => item.id === script);
  if (!scriptOption) return { error: "Pick one of the listed script options." };

  const to = String(recipientName).trim();
  const from = String(senderName).trim();
  if (to.length > NAME_MAX_LENGTH) {
    return { error: `Recipient name must be ${NAME_MAX_LENGTH} characters or fewer.` };
  }
  if (from.length > NAME_MAX_LENGTH) {
    return { error: `Your name must be ${NAME_MAX_LENGTH} characters or fewer.` };
  }

  const matches = WISHES.filter(
    (wish) => wish.occasion === occasionId && (toneId === "all" || wish.tone === toneId),
  );
  if (matches.length === 0) {
    return { error: "No greeting in the bank matches that occasion and tone yet." };
  }

  const useSalutation = relationship.id !== "none" && to.length > 0;
  const nativeSalutation = useSalutation ? applyName(relationship.native, to) : "";
  const romanSalutation = useSalutation ? applyName(relationship.roman, to) : "";
  const englishSalutation = useSalutation ? applyName(relationship.english, to) : "";
  const signature = from ? `— ${from}` : "";

  const items = matches.map((wish) => {
    const nativeBlock = joinLines([nativeSalutation, wish.native, signature]);
    const romanBlock = joinLines([romanSalutation, wish.roman, signature]);
    const englishBlock = joinLines([englishSalutation, wish.english, signature]);

    let message = nativeBlock;
    if (script === "roman") message = romanBlock;
    if (script === "both") message = `${nativeBlock}\n\n${romanBlock}`;

    return {
      id: wish.id,
      tone: wish.tone,
      toneLabel: (TONES.find((item) => item.id === wish.tone) || {}).label || wish.tone,
      native: nativeBlock,
      roman: romanBlock,
      english: englishBlock,
      message,
      characters: message.length,
      words: countWords(message),
      sms: measureSms(message),
    };
  });

  return {
    occasion,
    tone,
    relationship,
    script: scriptOption,
    recipientName: to,
    senderName: from,
    count: items.length,
    items,
  };
}
