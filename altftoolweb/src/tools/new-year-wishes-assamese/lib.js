/**
 * Assamese New Year Wishes — greeting bank plus pure composition helpers.
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
    id: "bohag-bihu",
    label: "Bohag Bihu / Rongali Bihu (Assamese new year)",
    note: "The first day of Bohag in the Assamese calendar, on 14 or 15 April, opening the Rongali Bihu festival.",
  },
  {
    id: "gregorian",
    label: "1 January (Natun bosor)",
    note: "The Gregorian new year, greeted with natun bosoror xubhessa.",
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
  { id: "native", label: "Assamese script only" },
  { id: "roman", label: "Roman transliteration only" },
  { id: "both", label: "Assamese + Roman" },
];

/**
 * Salutations follow ordinary Assamese letter usage: xroddheyo for a senior,
 * mananiyo in formal writing, priyo for family, xnehor for a younger person,
 * and a bare name between friends.
 */
export const RELATIONSHIPS = [
  { id: "none", label: "No salutation", native: "", roman: "", english: "" },
  {
    id: "elder",
    label: "Elder / teacher",
    native: "শ্ৰদ্ধেয় {name},",
    roman: "Xroddheyo {name},",
    english: "Respected {name},",
  },
  {
    id: "family",
    label: "Family",
    native: "প্ৰিয় {name},",
    roman: "Priyo {name},",
    english: "Dear {name},",
  },
  {
    id: "friend",
    label: "Friend",
    native: "{name},",
    roman: "{name},",
    english: "{name},",
  },
  {
    id: "colleague",
    label: "Colleague / client",
    native: "মাননীয় {name},",
    roman: "Mananiyo {name},",
    english: "Honourable {name},",
  },
  {
    id: "younger",
    label: "Younger relative",
    native: "স্নেহৰ {name},",
    roman: "Xnehor {name},",
    english: "Dear (younger) {name},",
  },
];

export const WISHES = [
  {
    id: "bb-trad-1",
    occasion: "bohag-bihu",
    tone: "traditional",
    native:
      "ৰঙালী বিহু আৰু নতুন বছৰৰ আন্তৰিক শুভেচ্ছা! নতুন বছৰে আপোনাৰ জীৱনলৈ সুখ আৰু সমৃদ্ধি আনক।",
    roman:
      "Rongali Bihu aru natun bosoror antorik xubhessa! Natun bosore aponar jivanoloi xukh aru xamriddhi anok.",
    english:
      "Sincere greetings for Rongali Bihu and the new year! May the new year bring happiness and prosperity into your life.",
  },
  {
    id: "bb-trad-2",
    occasion: "bohag-bihu",
    tone: "traditional",
    native: "বহাগ মাহৰ প্ৰথম দিনটোৱে সকলোৰে জীৱনত নতুন আশা আনক। বিহুৰ শুভেচ্ছা।",
    roman:
      "Bohag mahor prothom dintowe xokolore jivanot natun axa anok. Bihur xubhessa.",
    english:
      "May the first day of the month of Bohag bring new hope into everyone's life. Bihu greetings.",
  },
  {
    id: "bb-warm-1",
    occasion: "bohag-bihu",
    tone: "warm",
    native:
      "গামোচা, পিঠা আৰু ঢোলৰ মাত — নতুন বছৰটো এইদৰেই আনন্দেৰে ভৰি থাকক। বিহুৰ শুভেচ্ছা!",
    roman:
      "Gamosa, pitha aru dholor maat — natun bosorto eidorei anandere bhori thakok. Bihur xubhessa!",
    english:
      "The gamosa, the pitha and the beat of the dhol — may the new year stay exactly this full of joy. Bihu greetings!",
  },
  {
    id: "bb-formal-1",
    occasion: "bohag-bihu",
    tone: "formal",
    native:
      "ৰঙালী বিহু উপলক্ষে আপোনাক আৰু আপোনাৰ পৰিয়ালক আন্তৰিক শুভেচ্ছা। নতুন বছৰে আপোনাৰ ব্যৱসায়ত উন্নতি আনক।",
    roman:
      "Rongali Bihu upolokhye aponak aru aponar poriyalok antorik xubhessa. Natun bosore aponar byavosayot unnati anok.",
    english:
      "Sincere greetings to you and your family on the occasion of Rongali Bihu. May the new year bring growth to your business.",
  },
  {
    id: "bb-short-1",
    occasion: "bohag-bihu",
    tone: "short",
    native: "ৰঙালী বিহুৰ শুভেচ্ছা! 🌾",
    roman: "Rongali Bihur xubhessa! 🌾",
    english: "Rongali Bihu greetings!",
  },
  {
    id: "bb-poetic-1",
    occasion: "bohag-bihu",
    tone: "poetic",
    native: "কপৌ ফুল ফুলিল, বহাগ আহিল। নতুন বছৰ শুভ হওক।",
    roman: "Kopou phul phulil, Bohag ahil. Natun bosor xubho how'k.",
    english:
      "The kopou orchid has bloomed and Bohag has arrived. May the new year be a good one.",
  },
  {
    id: "gr-trad-1",
    occasion: "gregorian",
    tone: "traditional",
    native:
      "নতুন বছৰৰ আন্তৰিক শুভেচ্ছা! এই বছৰে আপোনাক সুস্বাস্থ্য আৰু সফলতা দিয়ক।",
    roman:
      "Natun bosoror antorik xubhessa! Ei bosore aponak suswasthya aru xophalota diyok.",
    english:
      "Sincere new year greetings! May this year give you good health and success.",
  },
  {
    id: "gr-warm-1",
    occasion: "gregorian",
    tone: "warm",
    native: "নতুন বছৰত তোমাৰ প্ৰতিটো দিন ভালকৈ কাটক, প্ৰতিটো সপোন সঁচা হওক।",
    roman: "Natun bosorot tomar protito din bhalkoi katok, protito xopon sosa how'k.",
    english:
      "In the new year may each of your days go well and every dream come true.",
  },
  {
    id: "gr-formal-1",
    occasion: "gregorian",
    tone: "formal",
    native:
      "নতুন বছৰৰ শুভেচ্ছা। যোৱা বছৰৰ সহযোগিতাৰ বাবে ধন্যবাদ; অহা বছৰতো একেলগে কাম কৰাৰ আশা ৰাখিলোঁ।",
    roman:
      "Natun bosoror xubhessa. Juwa bosoror xohojogitar babe dhonyobad; oha bosorotu ekeloge kaam korar axa rakhilu.",
    english:
      "New year greetings. Thank you for your cooperation last year; I hope to work together in the coming year too.",
  },
  {
    id: "gr-short-1",
    occasion: "gregorian",
    tone: "short",
    native: "নতুন বছৰৰ শুভেচ্ছা! ✨",
    roman: "Natun bosoror xubhessa! ✨",
    english: "New year greetings!",
  },
  {
    id: "gr-poetic-1",
    occasion: "gregorian",
    tone: "poetic",
    native:
      "কেলেণ্ডাৰৰ পাত সলনি হ'ল, কিন্তু আমাৰ মৰম একেই থাকক। নতুন বছৰৰ শুভেচ্ছা।",
    roman:
      "Calendaror paat xoloni hol, kintu amar morom ekei thakok. Natun bosoror xubhessa.",
    english:
      "The calendar page has changed, but may our affection stay the same. New year greetings.",
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
  occasionId = "bohag-bihu",
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
