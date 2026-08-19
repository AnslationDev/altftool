/**
 * Marathi New Year Wishes — greeting bank plus pure composition helpers.
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
    id: "gudhi-padwa",
    label: "Gudhi Padwa (Marathi new year)",
    note: "Chaitra Shukla Pratipada, the first day of the Hindu lunisolar year, falling in March or April.",
  },
  {
    id: "gregorian",
    label: "1 January (Ingraji navvarsha)",
    note: "The Gregorian new year, called Ingraji navvarsha in Marathi.",
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
  { id: "native", label: "Devanagari only" },
  { id: "roman", label: "Roman transliteration only" },
  { id: "both", label: "Devanagari + Roman" },
];

/**
 * Salutations follow ordinary Marathi letter usage: aadaraniya for a senior,
 * manyavar in formal writing, priya for family, chiranjiv (the "chi." of
 * traditional letters) for a younger person, and a bare name between friends.
 */
export const RELATIONSHIPS = [
  { id: "none", label: "No salutation", native: "", roman: "", english: "" },
  {
    id: "elder",
    label: "Elder / teacher",
    native: "आदरणीय {name},",
    roman: "Aadaraniya {name},",
    english: "Respected {name},",
  },
  {
    id: "family",
    label: "Family",
    native: "प्रिय {name},",
    roman: "Priya {name},",
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
    native: "मान्यवर {name},",
    roman: "Manyavar {name},",
    english: "Esteemed {name},",
  },
  {
    id: "younger",
    label: "Younger relative",
    native: "चिरंजीव {name},",
    roman: "Chiranjiv {name},",
    english: "Dear (younger) {name},",
  },
];

export const WISHES = [
  {
    id: "gp-trad-1",
    occasion: "gudhi-padwa",
    tone: "traditional",
    native:
      "गुढीपाडव्याच्या हार्दिक शुभेच्छा! नववर्ष आपणास सुख, समृद्धी आणि आरोग्य देवो.",
    roman:
      "Gudhipadavyachya hardik shubhechha! Navvarsha aapnas sukh, samruddhi aani aarogya devo.",
    english:
      "Warm wishes on Gudhi Padwa! May the new year give you happiness, prosperity and good health.",
  },
  {
    id: "gp-trad-2",
    occasion: "gudhi-padwa",
    tone: "traditional",
    native:
      "नववर्षाच्या हार्दिक शुभेच्छा! गुढी उभारून नव्या वर्षाची सुरुवात मंगलमय होवो.",
    roman:
      "Navvarshachya hardik shubhechha! Gudhi ubharun navya varshachi suruvat mangalmay hovo.",
    english:
      "Hearty new year wishes! May the year begin auspiciously with the raising of the gudhi.",
  },
  {
    id: "gp-warm-1",
    occasion: "gudhi-padwa",
    tone: "warm",
    native:
      "कडुनिंबाच्या कडवटपणासोबत गुळाचा गोडवाही येवो — तुझं नवं वर्ष संतुलित आणि सुंदर जावो.",
    roman:
      "Kadunimbachya kadvatpanasobat gulacha godvahi yevo — tujha nava varsha santulit aani sundar javo.",
    english:
      "May sweetness arrive alongside the bitterness of neem — may your new year be balanced and beautiful.",
  },
  {
    id: "gp-warm-2",
    occasion: "gudhi-padwa",
    tone: "warm",
    native:
      "नवीन वर्ष, नवीन उमेद, नवीन सुरुवात. गुढीपाडव्याच्या खूप खूप शुभेच्छा!",
    roman:
      "Navin varsha, navin umed, navin suruvat. Gudhipadavyachya khup khup shubhechha!",
    english: "New year, new hope, new beginning. Many warm wishes on Gudhi Padwa!",
  },
  {
    id: "gp-formal-1",
    occasion: "gudhi-padwa",
    tone: "formal",
    native:
      "गुढीपाडव्यानिमित्त आपणास व आपल्या कुटुंबियांना हार्दिक शुभेच्छा. नवीन वर्ष आपल्या व्यवसायास भरभराटीचे जावो.",
    roman:
      "Gudhipadavyanimitta aapnas va aaplya kutumbiyanna hardik shubhechha. Navin varsha aaplya vyavasayas bharbharaticha javo.",
    english:
      "Warm wishes to you and your family on Gudhi Padwa. May the new year bring your business prosperity.",
  },
  {
    id: "gp-formal-2",
    occasion: "gudhi-padwa",
    tone: "formal",
    native:
      "नववर्षाच्या शुभेच्छा. मागील वर्षातील सहकार्याबद्दल आभार; येत्या वर्षातही आपली साथ लाभावी ही अपेक्षा.",
    roman:
      "Navvarshachya shubhechha. Magil varshatil sahakaryabaddal aabhar; yetya varshatahi aapli saath labhavi hi apeksha.",
    english:
      "New year greetings. Thank you for your support last year; I hope for your company in the year ahead as well.",
  },
  {
    id: "gp-short-1",
    occasion: "gudhi-padwa",
    tone: "short",
    native: "गुढीपाडव्याच्या हार्दिक शुभेच्छा! 🌿",
    roman: "Gudhipadavyachya hardik shubhechha! 🌿",
    english: "Warm wishes on Gudhi Padwa!",
  },
  {
    id: "gp-short-2",
    occasion: "gudhi-padwa",
    tone: "short",
    native: "नववर्ष अभिनंदन!",
    roman: "Navvarsha abhinandan!",
    english: "New year congratulations!",
  },
  {
    id: "gp-poetic-1",
    occasion: "gudhi-padwa",
    tone: "poetic",
    native:
      "चैत्राची पहिली किरणे तुझ्या अंगणात आनंद घेऊन येवोत. गुढीपाडव्याच्या शुभेच्छा.",
    roman:
      "Chaitrachi pahili kirane tujhya anganat aanand gheun yevot. Gudhipadavyachya shubhechha.",
    english:
      "May the first rays of Chaitra bring joy into your courtyard. Wishes on Gudhi Padwa.",
  },
  {
    id: "gr-trad-1",
    occasion: "gregorian",
    tone: "traditional",
    native:
      "इंग्रजी नववर्षाच्या हार्दिक शुभेच्छा! हे वर्ष आपणास आरोग्य आणि यश देवो.",
    roman:
      "Ingraji navvarshachya hardik shubhechha! He varsha aapnas aarogya aani yash devo.",
    english:
      "Hearty greetings for the January new year! May this year give you health and success.",
  },
  {
    id: "gr-warm-1",
    occasion: "gregorian",
    tone: "warm",
    native:
      "नव्या वर्षात तुझा प्रत्येक दिवस आनंदाचा जावो आणि प्रत्येक स्वप्न पूर्ण होवो.",
    roman:
      "Navya varshat tujha pratyek divas aanandacha javo aani pratyek swapna purna hovo.",
    english:
      "In the new year may each of your days be joyful and every dream of yours come true.",
  },
  {
    id: "gr-formal-1",
    occasion: "gregorian",
    tone: "formal",
    native:
      "नववर्षाच्या शुभेच्छा. येत्या वर्षात आपल्या संस्थेस उत्तरोत्तर प्रगती लाभो.",
    roman:
      "Navvarshachya shubhechha. Yetya varshat aaplya sansthes uttarottar pragati labho.",
    english:
      "New year greetings. May your organisation gain steadily greater progress in the coming year.",
  },
  {
    id: "gr-short-1",
    occasion: "gregorian",
    tone: "short",
    native: "नववर्षाच्या शुभेच्छा! ✨",
    roman: "Navvarshachya shubhechha! ✨",
    english: "New year wishes!",
  },
  {
    id: "gr-poetic-1",
    occasion: "gregorian",
    tone: "poetic",
    native:
      "कॅलेंडरचं पान बदललं, पण आपली माया तशीच राहो. नवीन वर्ष सुखाचं जावो.",
    roman:
      "Calendarcha paan badlala, pan aapli maya tashich raho. Navin varsha sukhacha javo.",
    english:
      "The calendar page has turned, but may our affection stay the same. May the new year be a happy one.",
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
  occasionId = "gudhi-padwa",
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
  const signature = from ? `- ${from}` : "";

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
