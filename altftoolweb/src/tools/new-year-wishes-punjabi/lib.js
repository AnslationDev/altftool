/**
 * Punjabi New Year Wishes — greeting bank plus pure composition helpers.
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
    id: "vaisakhi",
    label: "Vaisakhi (13 or 14 April)",
    note: "The Punjabi harvest festival and the day the Khalsa was founded in 1699; also kept as a new year by many Punjabi families.",
  },
  {
    id: "nanakshahi",
    label: "Nanakshahi new year (1 Chet)",
    note: "New year of the Nanakshahi calendar, which begins on 1 Chet, corresponding to 14 March.",
  },
  {
    id: "gregorian",
    label: "1 January",
    note: "The Gregorian new year, greeted with nave saal diyan vadhaiyan.",
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
  { id: "native", label: "Gurmukhi only" },
  { id: "roman", label: "Roman transliteration only" },
  { id: "both", label: "Gurmukhi + Roman" },
];

/**
 * Salutations follow ordinary Punjabi usage. The honorific ਜੀ (ji) is added for
 * anyone senior or formal and dropped when addressing someone younger.
 */
export const RELATIONSHIPS = [
  { id: "none", label: "No salutation", native: "", roman: "", english: "" },
  {
    id: "elder",
    label: "Elder / teacher",
    native: "ਸਤਿਕਾਰਯੋਗ {name} ਜੀ,",
    roman: "Satikaryog {name} ji,",
    english: "Respected {name} ji,",
  },
  {
    id: "family",
    label: "Family",
    native: "ਪਿਆਰੇ {name} ਜੀ,",
    roman: "Pyare {name} ji,",
    english: "Dear {name} ji,",
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
    native: "ਮਾਨਯੋਗ {name} ਜੀ,",
    roman: "Manyog {name} ji,",
    english: "Honourable {name} ji,",
  },
  {
    id: "younger",
    label: "Younger relative",
    native: "ਪਿਆਰੇ {name},",
    roman: "Pyare {name},",
    english: "Dear (younger) {name},",
  },
];

export const WISHES = [
  {
    id: "vs-trad-1",
    occasion: "vaisakhi",
    tone: "traditional",
    native:
      "ਵਿਸਾਖੀ ਦੀਆਂ ਲੱਖ ਲੱਖ ਵਧਾਈਆਂ! ਨਵਾਂ ਸਾਲ ਤੁਹਾਡੇ ਲਈ ਖੁਸ਼ੀਆਂ ਅਤੇ ਬਰਕਤਾਂ ਲੈ ਕੇ ਆਵੇ।",
    roman:
      "Vaisakhi diyan lakh lakh vadhaiyan! Nava saal tuhade layi khushiyan ate barkatan lai ke aave.",
    english:
      "A hundred thousand congratulations on Vaisakhi! May the new year bring you joy and blessings.",
  },
  {
    id: "vs-trad-2",
    occasion: "vaisakhi",
    tone: "traditional",
    native:
      "ਖਾਲਸਾ ਸਾਜਨਾ ਦਿਵਸ ਅਤੇ ਵਿਸਾਖੀ ਦੀਆਂ ਵਧਾਈਆਂ। ਵਾਹਿਗੁਰੂ ਸਭ ਦਾ ਭਲਾ ਕਰੇ।",
    roman:
      "Khalsa Sajna Divas ate Vaisakhi diyan vadhaiyan. Waheguru sabh da bhala kare.",
    english:
      "Greetings on the founding day of the Khalsa and on Vaisakhi. May Waheguru do good to everyone.",
  },
  {
    id: "vs-warm-1",
    occasion: "vaisakhi",
    tone: "warm",
    native:
      "ਕਣਕ ਪੱਕ ਗਈ, ਢੋਲ ਵੱਜ ਪਿਆ — ਆ ਭੰਗੜਾ ਪਾਈਏ! ਵਿਸਾਖੀ ਦੀਆਂ ਵਧਾਈਆਂ।",
    roman:
      "Kanak pakk gayi, dhol vajj piya — aa bhangra paiye! Vaisakhi diyan vadhaiyan.",
    english:
      "The wheat has ripened and the dhol has started — come, let us dance bhangra! Greetings on Vaisakhi.",
  },
  {
    id: "vs-formal-1",
    occasion: "vaisakhi",
    tone: "formal",
    native:
      "ਵਿਸਾਖੀ ਦੇ ਸ਼ੁਭ ਮੌਕੇ ਤੇ ਤੁਹਾਨੂੰ ਅਤੇ ਤੁਹਾਡੇ ਪਰਿਵਾਰ ਨੂੰ ਦਿਲੀ ਵਧਾਈਆਂ। ਨਵਾਂ ਸਾਲ ਤਰੱਕੀ ਭਰਿਆ ਰਹੇ।",
    roman:
      "Vaisakhi de shubh mauke te tuhanu ate tuhade parivar nu dili vadhaiyan. Nava saal tarakki bhariya rahe.",
    english:
      "Heartfelt congratulations to you and your family on the auspicious occasion of Vaisakhi. May the new year be full of progress.",
  },
  {
    id: "vs-short-1",
    occasion: "vaisakhi",
    tone: "short",
    native: "ਵਿਸਾਖੀ ਦੀਆਂ ਵਧਾਈਆਂ! 🌾",
    roman: "Vaisakhi diyan vadhaiyan! 🌾",
    english: "Greetings on Vaisakhi!",
  },
  {
    id: "vs-poetic-1",
    occasion: "vaisakhi",
    tone: "poetic",
    native:
      "ਨਵੀਂ ਫ਼ਸਲ, ਨਵੀਂ ਉਮੀਦ, ਨਵਾਂ ਸਾਲ — ਸਭ ਕੁਝ ਸੋਹਣਾ ਹੋਵੇ। ਵਿਸਾਖੀ ਮੁਬਾਰਕ।",
    roman:
      "Navin fasal, navin umeed, nava saal — sabh kujh sohna hove. Vaisakhi mubarak.",
    english:
      "New harvest, new hope, new year — may all of it be beautiful. Happy Vaisakhi.",
  },
  {
    id: "ns-trad-1",
    occasion: "nanakshahi",
    tone: "traditional",
    native:
      "ਨਾਨਕਸ਼ਾਹੀ ਨਵੇਂ ਸਾਲ ਦੀਆਂ ਲੱਖ ਲੱਖ ਵਧਾਈਆਂ। ਚੇਤ ਦਾ ਮਹੀਨਾ ਸਭ ਲਈ ਸੁੱਖ ਲੈ ਕੇ ਆਵੇ।",
    roman:
      "Nanakshahi nave saal diyan lakh lakh vadhaiyan. Chet da mahina sabh layi sukh lai ke aave.",
    english:
      "Many congratulations on the Nanakshahi new year. May the month of Chet bring ease to everyone.",
  },
  {
    id: "ns-formal-1",
    occasion: "nanakshahi",
    tone: "formal",
    native:
      "ਨਾਨਕਸ਼ਾਹੀ ਸੰਮਤ ਦੇ ਨਵੇਂ ਸਾਲ ਦੀ ਵਧਾਈ। ਆਉਣ ਵਾਲਾ ਵਰ੍ਹਾ ਤੁਹਾਡੇ ਕੰਮਕਾਜ ਵਿੱਚ ਬਰਕਤ ਲਿਆਵੇ।",
    roman:
      "Nanakshahi Sammat de nave saal di vadhai. Aaun vala varha tuhade kamkaaj vich barkat liaave.",
    english:
      "Congratulations on the new year of the Nanakshahi era. May the coming year bring blessing to your work.",
  },
  {
    id: "ns-short-1",
    occasion: "nanakshahi",
    tone: "short",
    native: "ਨਾਨਕਸ਼ਾਹੀ ਨਵਾਂ ਸਾਲ ਮੁਬਾਰਕ!",
    roman: "Nanakshahi nava saal mubarak!",
    english: "Happy Nanakshahi new year!",
  },
  {
    id: "gr-trad-1",
    occasion: "gregorian",
    tone: "traditional",
    native:
      "ਨਵੇਂ ਸਾਲ ਦੀਆਂ ਲੱਖ ਲੱਖ ਵਧਾਈਆਂ! ਇਹ ਸਾਲ ਤੁਹਾਨੂੰ ਸਿਹਤ ਅਤੇ ਕਾਮਯਾਬੀ ਦੇਵੇ।",
    roman:
      "Nave saal diyan lakh lakh vadhaiyan! Ih saal tuhanu sehat ate kamyabi deve.",
    english:
      "Many congratulations on the new year! May this year give you health and success.",
  },
  {
    id: "gr-warm-1",
    occasion: "gregorian",
    tone: "warm",
    native: "ਨਵੇਂ ਸਾਲ ਵਿੱਚ ਤੇਰਾ ਹਰ ਦਿਨ ਹੱਸਦਾ ਲੰਘੇ ਤੇ ਹਰ ਸੁਪਨਾ ਪੂਰਾ ਹੋਵੇ।",
    roman: "Nave saal vich tera har din hasda langhe te har supna pura hove.",
    english:
      "In the new year may each of your days pass in laughter and every dream come true.",
  },
  {
    id: "gr-formal-1",
    occasion: "gregorian",
    tone: "formal",
    native:
      "ਨਵੇਂ ਸਾਲ ਦੀ ਵਧਾਈ। ਪਿਛਲੇ ਸਾਲ ਦੇ ਸਹਿਯੋਗ ਲਈ ਧੰਨਵਾਦ, ਅਗਲੇ ਸਾਲ ਵੀ ਸਾਥ ਬਣਿਆ ਰਹੇ।",
    roman:
      "Nave saal di vadhai. Pichhle saal de sehyog layi dhanwad, agle saal vi saath baniya rahe.",
    english:
      "New year congratulations. Thank you for your cooperation last year; may our association continue next year too.",
  },
  {
    id: "gr-short-1",
    occasion: "gregorian",
    tone: "short",
    native: "ਨਵਾਂ ਸਾਲ ਮੁਬਾਰਕ! ✨",
    roman: "Nava saal mubarak! ✨",
    english: "Happy new year!",
  },
  {
    id: "gr-poetic-1",
    occasion: "gregorian",
    tone: "poetic",
    native: "ਕੈਲੰਡਰ ਬਦਲ ਗਿਆ, ਪਰ ਆਪਣਾ ਪਿਆਰ ਉਹੀ ਰਹੇ। ਨਵਾਂ ਸਾਲ ਮੁਬਾਰਕ।",
    roman: "Calendar badal gaya, par aapna pyaar ohi rahe. Nava saal mubarak.",
    english:
      "The calendar has changed, but may the love between us stay the same. Happy new year.",
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
  occasionId = "vaisakhi",
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
