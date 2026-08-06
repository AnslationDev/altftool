/**
 * Bengali New Year Wishes — greeting bank plus pure composition helpers.
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
    id: "poila-boishakh",
    label: "Poila Boishakh (Bengali new year)",
    note: "First day of Boishakh, observed on 14 or 15 April.",
  },
  {
    id: "gregorian",
    label: "1 January (Ingreji nababarsha)",
    note: "The Gregorian new year, called Ingreji nababarsha in Bengali.",
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
  { id: "native", label: "Bengali script only" },
  { id: "roman", label: "Roman transliteration only" },
  { id: "both", label: "Bengali + Roman" },
];

/**
 * Salutations follow ordinary Bengali letter usage: shroddheyo for someone
 * senior, mananiyo in formal/official writing, priyo for family, sneher for a
 * younger person, and a bare name between friends.
 */
export const RELATIONSHIPS = [
  { id: "none", label: "No salutation", native: "", roman: "", english: "" },
  {
    id: "elder",
    label: "Elder / teacher",
    native: "শ্রদ্ধেয় {name},",
    roman: "Shroddheyo {name},",
    english: "Respected {name},",
  },
  {
    id: "family",
    label: "Family",
    native: "প্রিয় {name},",
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
    native: "স্নেহের {name},",
    roman: "Sneher {name},",
    english: "Dear (younger) {name},",
  },
];

export const WISHES = [
  {
    id: "pb-trad-1",
    occasion: "poila-boishakh",
    tone: "traditional",
    native:
      "শুভ নববর্ষ! নতুন বছর আপনার জীবনে সুখ, শান্তি ও সমৃদ্ধি বয়ে আনুক।",
    roman:
      "Shubho Nabobarsho! Notun bochhor apnar jibone shukh, shanti o somriddhi boye anuk.",
    english:
      "Happy Bengali New Year! May the new year bring happiness, peace and prosperity into your life.",
  },
  {
    id: "pb-trad-2",
    occasion: "poila-boishakh",
    tone: "traditional",
    native:
      "নতুন বছরের আন্তরিক শুভেচ্ছা ও অভিনন্দন। বছরটি মঙ্গলময় হোক।",
    roman:
      "Notun bochhorer antorik shubhechha o obhinondon. Bochhorti mongolmoy hok.",
    english:
      "Heartfelt greetings and congratulations on the new year. May the year be auspicious.",
  },
  {
    id: "pb-warm-1",
    occasion: "poila-boishakh",
    tone: "warm",
    native:
      "পুরোনো বছরের সব গ্লানি মুছে যাক, নতুন বছর হাসি আর ভালোবাসায় ভরে উঠুক। শুভ নববর্ষ!",
    roman:
      "Purono bochhorer shob glani muchhe jak, notun bochhor hashi ar bhalobashay bhore uthuk. Shubho Nabobarsho!",
    english:
      "May every regret of the old year be washed away and the new year fill up with laughter and love. Happy New Year!",
  },
  {
    id: "pb-warm-2",
    occasion: "poila-boishakh",
    tone: "warm",
    native:
      "মিষ্টিমুখ, নতুন জামা আর হালখাতা — নতুন বছর শুরু হোক আনন্দে। শুভ নববর্ষ!",
    roman:
      "Mishtimukh, notun jama ar halkhata — notun bochhor shuru hok anonde. Shubho Nabobarsho!",
    english:
      "Sweets, new clothes and the halkhata ledger — may the new year begin in joy. Happy New Year!",
  },
  {
    id: "pb-formal-1",
    occasion: "poila-boishakh",
    tone: "formal",
    native:
      "নববর্ষের আন্তরিক শুভেচ্ছা। আগামী বছর আপনার ও আপনার প্রতিষ্ঠানের সাফল্য ও উন্নতি কামনা করি।",
    roman:
      "Nabobarsher antorik shubhechha. Agami bochhor apnar o apnar protishthaner shafolyo o unnoti kamona kori.",
    english:
      "Sincere new year greetings. I wish you and your organisation success and progress in the year ahead.",
  },
  {
    id: "pb-formal-2",
    occasion: "poila-boishakh",
    tone: "formal",
    native:
      "হালখাতার শুভ সূচনায় আপনার ব্যবসার মঙ্গল ও শ্রীবৃদ্ধি কামনা করি। শুভ নববর্ষ।",
    roman:
      "Halkhatar shubho suchonay apnar byabshar mongol o shribriddhi kamona kori. Shubho Nabobarsho.",
    english:
      "On the auspicious opening of the halkhata account book I wish your business well-being and growth. Happy New Year.",
  },
  {
    id: "pb-short-1",
    occasion: "poila-boishakh",
    tone: "short",
    native: "শুভ নববর্ষ! 🌼",
    roman: "Shubho Nabobarsho! 🌼",
    english: "Happy Bengali New Year!",
  },
  {
    id: "pb-short-2",
    occasion: "poila-boishakh",
    tone: "short",
    native:
      "নতুন বছর, নতুন শুরু। শুভ নববর্ষ!",
    roman: "Notun bochhor, notun shuru. Shubho Nabobarsho!",
    english: "New year, new beginning. Happy New Year!",
  },
  {
    id: "pb-poetic-1",
    occasion: "poila-boishakh",
    tone: "poetic",
    native:
      "বৈশাখের প্রথম ভোরে নতুন আলো আসুক, মনের সব আঁধার কেটে যাক। শুভ নববর্ষ।",
    roman:
      "Boishakher prothom bhore notun alo ashuk, moner shob adhar kete jak. Shubho Nabobarsho.",
    english:
      "May new light arrive on the first dawn of Boishakh and every shadow of the mind lift. Happy New Year.",
  },
  {
    id: "gr-trad-1",
    occasion: "gregorian",
    tone: "traditional",
    native:
      "ইংরেজি নববর্ষের আন্তরিক শুভেচ্ছা। নতুন বছর সুস্থতা ও সাফল্যে ভরে উঠুক।",
    roman:
      "Ingreji nabobarsher antorik shubhechha. Notun bochhor shusthota o shafolye bhore uthuk.",
    english:
      "Heartfelt greetings for the January new year. May it be full of good health and success.",
  },
  {
    id: "gr-warm-1",
    occasion: "gregorian",
    tone: "warm",
    native:
      "নতুন বছরে তোমার প্রতিটি দিন ভালো কাটুক, প্রতিটি স্বপ্ন সত্যি হোক।",
    roman:
      "Notun bochhore tomar protiti din bhalo katuk, protiti shopno shotti hok.",
    english:
      "May every day of your new year go well and every dream of yours come true.",
  },
  {
    id: "gr-formal-1",
    occasion: "gregorian",
    tone: "formal",
    native:
      "নতুন বছরের শুভেচ্ছা। গত বছরের সহযোগিতার জন্য ধন্যবাদ, আগামী দিনেও একসঙ্গে কাজ করার অপেক্ষায় রইলাম।",
    roman:
      "Notun bochhorer shubhechha. Goto bochhorer shohojogitar jonno dhonnobad, agami dine-o eksonge kaj korar opekkhay roilam.",
    english:
      "New year greetings. Thank you for your cooperation last year; I look forward to working together in the year ahead.",
  },
  {
    id: "gr-short-1",
    occasion: "gregorian",
    tone: "short",
    native:
      "নতুন বছর শুভ হোক! ✨",
    roman: "Notun bochhor shubho hok! ✨",
    english: "May the new year be a good one!",
  },
  {
    id: "gr-poetic-1",
    occasion: "gregorian",
    tone: "poetic",
    native:
      "ঘড়ির কাঁটা ঘুরে গেল, রয়ে গেল ভালোবাসা। নতুন বছর ভালো কাটুক।",
    roman:
      "Ghorir kanta ghure gelo, roye gelo bhalobasha. Notun bochhor bhalo katuk.",
    english:
      "The hands of the clock have turned; the love stays behind. May the new year go well.",
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
  // Use a function replacer so the name is inserted literally — a string replacer treats
  // sequences like $&, $$, $` and $' in `name` as special replacement patterns instead of
  // literal text, which can corrupt or drop the {name} placeholder entirely.
  return template.replace(/\{name\}/g, () => name);
}

function joinLines(parts) {
  return parts.filter((part) => part && part.length > 0).join("\n");
}

/**
 * Build the greeting list for one occasion / tone / relationship combination.
 * Returns { error } for anything it cannot honestly answer.
 */
export function buildWishes({
  occasionId = "poila-boishakh",
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
    // "Bengali + Roman" shows both wish bodies, but the salutation and
    // signature should each appear once — concatenating the two complete
    // blocks (as before) greeted and signed off twice in the same message.
    if (script === "both") {
      const openingBlock = joinLines([nativeSalutation, wish.native]);
      const closingLines = joinLines([wish.roman, signature]);
      message = closingLines ? `${openingBlock}\n\n${closingLines}` : openingBlock;
    }

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
