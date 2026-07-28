/**
 * Kannada New Year Wishes — greeting bank plus pure composition helpers.
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
    id: "yugadi",
    label: "Yugadi / Ugadi (Kannada new year)",
    note: "Chaitra Shukla Pratipada, the first day of the Hindu lunisolar year, falling in March or April.",
  },
  {
    id: "gregorian",
    label: "1 January (Hosa varsha)",
    note: "The Gregorian new year, greeted with hosa varshada shubhashayagalu.",
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
  { id: "native", label: "Kannada script only" },
  { id: "roman", label: "Roman transliteration only" },
  { id: "both", label: "Kannada + Roman" },
];

/**
 * Salutations follow ordinary Kannada letter usage: aadaraneeya for a senior,
 * manya in formal writing, preetiya for family, priya for a younger person,
 * and a bare name between friends. The suffix avare is the respectful form of
 * address that goes with a senior's name.
 */
export const RELATIONSHIPS = [
  { id: "none", label: "No salutation", native: "", roman: "", english: "" },
  {
    id: "elder",
    label: "Elder / teacher",
    native: "ಆದರಣೀಯ {name} ಅವರೇ,",
    roman: "Aadaraneeya {name} avare,",
    english: "Respected {name},",
  },
  {
    id: "family",
    label: "Family",
    native: "ಪ್ರೀತಿಯ {name},",
    roman: "Preetiya {name},",
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
    native: "ಮಾನ್ಯ {name} ಅವರೇ,",
    roman: "Manya {name} avare,",
    english: "Honourable {name},",
  },
  {
    id: "younger",
    label: "Younger relative",
    native: "ಪ್ರಿಯ {name},",
    roman: "Priya {name},",
    english: "Dear (younger) {name},",
  },
];

export const WISHES = [
  {
    id: "yg-trad-1",
    occasion: "yugadi",
    tone: "traditional",
    native:
      "ಯುಗಾದಿ ಹಬ್ಬದ ಶುಭಾಶಯಗಳು! ಹೊಸ ವರ್ಷ ನಿಮಗೆ ಸುಖ, ಶಾಂತಿ ಮತ್ತು ಸಮೃದ್ಧಿಯನ್ನು ತರಲಿ.",
    roman:
      "Yugadi habbada shubhashayagalu! Hosa varsha nimage sukha, shanti mattu samruddhiyannu tarali.",
    english:
      "Greetings on the festival of Yugadi! May the new year bring you happiness, peace and prosperity.",
  },
  {
    id: "yg-trad-2",
    occasion: "yugadi",
    tone: "traditional",
    native: "ಹೊಸ ವರ್ಷದ ಶುಭಾಶಯಗಳು. ಈ ಸಂವತ್ಸರ ಎಲ್ಲರಿಗೂ ಒಳಿತನ್ನು ಮಾಡಲಿ.",
    roman: "Hosa varshada shubhashayagalu. Ee samvatsara ellarigu olitannu maadali.",
    english:
      "New year greetings. May this samvatsara, the named year of the sixty-year cycle, do good to everyone.",
  },
  {
    id: "yg-warm-1",
    occasion: "yugadi",
    tone: "warm",
    native:
      "ಬೇವು-ಬೆಲ್ಲದಂತೆ ಹೊಸ ವರ್ಷವೂ ಕಹಿ-ಸಿಹಿ ಎರಡನ್ನೂ ಸಮನಾಗಿ ಸ್ವೀಕರಿಸುವ ಶಕ್ತಿ ನೀಡಲಿ.",
    roman:
      "Bevu-belladante hosa varshavu kahi-sihi eradannu samanagi sweekarisuva shakti needali.",
    english:
      "Like neem and jaggery, may the new year give you the strength to take the bitter and the sweet alike.",
  },
  {
    id: "yg-warm-2",
    occasion: "yugadi",
    tone: "warm",
    native: "ಹೊಸ ವರ್ಷ, ಹೊಸ ಕನಸು, ಹೊಸ ಆರಂಭ. ಯುಗಾದಿ ಶುಭಾಶಯಗಳು!",
    roman: "Hosa varsha, hosa kanasu, hosa aarambha. Yugadi shubhashayagalu!",
    english: "New year, new dream, new beginning. Ugadi greetings!",
  },
  {
    id: "yg-formal-1",
    occasion: "yugadi",
    tone: "formal",
    native:
      "ಯುಗಾದಿ ಹಬ್ಬದ ಸಂದರ್ಭದಲ್ಲಿ ತಮಗೂ ತಮ್ಮ ಕುಟುಂಬಕ್ಕೂ ಹಾರ್ದಿಕ ಶುಭಾಶಯಗಳು. ಹೊಸ ವರ್ಷ ತಮ್ಮ ಉದ್ಯಮಕ್ಕೆ ಏಳಿಗೆ ತರಲಿ.",
    roman:
      "Yugadi habbada sandarbhadalli tamagu tamma kutumbakku hardika shubhashayagalu. Hosa varsha tamma udyamakke elige tarali.",
    english:
      "Warm greetings to you and your family on the occasion of Yugadi. May the new year bring growth to your enterprise.",
  },
  {
    id: "yg-short-1",
    occasion: "yugadi",
    tone: "short",
    native: "ಯುಗಾದಿ ಶುಭಾಶಯಗಳು! 🌿",
    roman: "Yugadi shubhashayagalu! 🌿",
    english: "Ugadi greetings!",
  },
  {
    id: "yg-short-2",
    occasion: "yugadi",
    tone: "short",
    native: "ಹೊಸ ವರ್ಷದ ಶುಭಾಶಯಗಳು!",
    roman: "Hosa varshada shubhashayagalu!",
    english: "New year greetings!",
  },
  {
    id: "yg-poetic-1",
    occasion: "yugadi",
    tone: "poetic",
    native:
      "ಚೈತ್ರದ ಮೊದಲ ಬೆಳಗು ನಿಮ್ಮ ಬಾಳಿಗೆ ಹೊಸ ಬೆಳಕು ತರಲಿ. ಯುಗಾದಿ ಶುಭಾಶಯಗಳು.",
    roman:
      "Chaitrada modala belagu nimma baalige hosa belaku tarali. Yugadi shubhashayagalu.",
    english:
      "May the first dawn of Chaitra bring new light into your life. Ugadi greetings.",
  },
  {
    id: "gr-trad-1",
    occasion: "gregorian",
    tone: "traditional",
    native:
      "ಹೊಸ ವರ್ಷದ ಹಾರ್ದಿಕ ಶುಭಾಶಯಗಳು! ಈ ವರ್ಷ ನಿಮಗೆ ಆರೋಗ್ಯ ಮತ್ತು ಯಶಸ್ಸು ಸಿಗಲಿ.",
    roman:
      "Hosa varshada hardika shubhashayagalu! Ee varsha nimage aarogya mattu yashassu sigali.",
    english: "Hearty new year greetings! May this year bring you health and success.",
  },
  {
    id: "gr-warm-1",
    occasion: "gregorian",
    tone: "warm",
    native:
      "ಹೊಸ ವರ್ಷದಲ್ಲಿ ನಿನ್ನ ಪ್ರತಿ ದಿನವೂ ಸಂತೋಷದಿಂದ ಕಳೆಯಲಿ, ಪ್ರತಿ ಕನಸೂ ನನಸಾಗಲಿ.",
    roman:
      "Hosa varshadalli ninna prati dinavu santoshadinda kaleyali, prati kanasu nanasagali.",
    english:
      "In the new year may each of your days pass in happiness and every dream come true.",
  },
  {
    id: "gr-formal-1",
    occasion: "gregorian",
    tone: "formal",
    native:
      "ಹೊಸ ವರ್ಷದ ಶುಭಾಶಯಗಳು. ಕಳೆದ ವರ್ಷದ ಸಹಕಾರಕ್ಕೆ ಧನ್ಯವಾದಗಳು; ಮುಂದಿನ ವರ್ಷವೂ ಜೊತೆಯಾಗಿ ಕೆಲಸ ಮಾಡುವ ನಿರೀಕ್ಷೆಯಿದೆ.",
    roman:
      "Hosa varshada shubhashayagalu. Kaleda varshada sahakarakke dhanyavadagalu; mundina varshavu joteyagi kelasa maaduva niriksheyide.",
    english:
      "New year greetings. Thank you for your cooperation last year; I look forward to working together in the coming year too.",
  },
  {
    id: "gr-short-1",
    occasion: "gregorian",
    tone: "short",
    native: "ಹೊಸ ವರ್ಷದ ಶುಭಾಶಯಗಳು! ✨",
    roman: "Hosa varshada shubhashayagalu! ✨",
    english: "New year greetings!",
  },
  {
    id: "gr-poetic-1",
    occasion: "gregorian",
    tone: "poetic",
    native:
      "ಕ್ಯಾಲೆಂಡರ್ ಪುಟ ಬದಲಾಯಿತು, ಆದರೆ ನಮ್ಮ ಪ್ರೀತಿ ಹಾಗೆಯೇ ಇರಲಿ. ಹೊಸ ವರ್ಷ ಶುಭವಾಗಲಿ.",
    roman:
      "Calendar puta badalayitu, aadare namma preeti hageye irali. Hosa varsha shubhavagali.",
    english:
      "The calendar page has turned, but may our affection remain the same. May the new year be blessed.",
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
  occasionId = "yugadi",
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
