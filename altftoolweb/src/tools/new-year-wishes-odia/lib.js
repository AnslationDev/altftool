/**
 * Odia New Year Wishes — greeting bank plus pure composition helpers.
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
    id: "pana-sankranti",
    label: "Pana Sankranti (Odia new year, 14 April)",
    note: "Maha Vishuba Sankranti, the first day of Baisakha in the Odia calendar, when sweetened pana is shared.",
  },
  {
    id: "gregorian",
    label: "1 January (Inraji nua barsa)",
    note: "The Gregorian new year, greeted with nua barsara shubhechha.",
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
  { id: "native", label: "Odia script only" },
  { id: "roman", label: "Roman transliteration only" },
  { id: "both", label: "Odia + Roman" },
];

/**
 * Salutations follow ordinary Odia letter usage: sammananiya for a senior,
 * manyabara in formal writing, priya for family, snehara for a younger person,
 * and a bare name between friends.
 */
export const RELATIONSHIPS = [
  { id: "none", label: "No salutation", native: "", roman: "", english: "" },
  {
    id: "elder",
    label: "Elder / teacher",
    native: "ସମ୍ମାନନୀୟ {name},",
    roman: "Sammananiya {name},",
    english: "Respected {name},",
  },
  {
    id: "family",
    label: "Family",
    native: "ପ୍ରିୟ {name},",
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
    native: "ମାନ୍ୟବର {name},",
    roman: "Manyabara {name},",
    english: "Honourable {name},",
  },
  {
    id: "younger",
    label: "Younger relative",
    native: "ସ୍ନେହର {name},",
    roman: "Snehara {name},",
    english: "Dear (younger) {name},",
  },
];

export const WISHES = [
  {
    id: "ps-trad-1",
    occasion: "pana-sankranti",
    tone: "traditional",
    native:
      "ନୂଆ ବର୍ଷର ହାର୍ଦ୍ଦିକ ଶୁଭେଚ୍ଛା! ପଣା ସଂକ୍ରାନ୍ତି ଆପଣଙ୍କ ଜୀବନରେ ସୁଖ ଓ ସମୃଦ୍ଧି ଆଣୁ।",
    roman:
      "Nua barsara harddika shubhechha! Pana Sankranti apananka jibanare sukha o samruddhi anu.",
    english:
      "Hearty new year greetings! May Pana Sankranti bring happiness and prosperity into your life.",
  },
  {
    id: "ps-trad-2",
    occasion: "pana-sankranti",
    tone: "traditional",
    native: "ମହା ବିଷୁବ ସଂକ୍ରାନ୍ତିର ଶୁଭେଚ୍ଛା। ନୂଆ ବର୍ଷ ମଙ୍ଗଳମୟ ହେଉ।",
    roman: "Maha Bishuba Sankrantira shubhechha. Nua barsa mangalamaya heu.",
    english:
      "Greetings on Maha Vishuba Sankranti. May the new year be an auspicious one.",
  },
  {
    id: "ps-warm-1",
    occasion: "pana-sankranti",
    tone: "warm",
    native: "ଏକ ଗ୍ଲାସ ଥଣ୍ଡା ପଣା ପରି ନୂଆ ବର୍ଷ ତୁମ ପାଇଁ ଶୀତଳ ଓ ମିଠା ହେଉ।",
    roman: "Eka glasa thanda pana pari nua barsa tuma pain shitala o mitha heu.",
    english:
      "Like a glass of cool pana, may the new year be cool and sweet for you.",
  },
  {
    id: "ps-formal-1",
    occasion: "pana-sankranti",
    tone: "formal",
    native:
      "ପଣା ସଂକ୍ରାନ୍ତି ଅବସରରେ ଆପଣଙ୍କୁ ଓ ଆପଣଙ୍କ ପରିବାରକୁ ହାର୍ଦ୍ଦିକ ଶୁଭେଚ୍ଛା। ନୂଆ ବର୍ଷ ଆପଣଙ୍କ ବ୍ୟବସାୟରେ ଉନ୍ନତି ଆଣୁ।",
    roman:
      "Pana Sankranti abasarare apananku o apananka paribaraku harddika shubhechha. Nua barsa apananka byabasayare unnati anu.",
    english:
      "Hearty greetings to you and your family on the occasion of Pana Sankranti. May the new year bring progress to your business.",
  },
  {
    id: "ps-short-1",
    occasion: "pana-sankranti",
    tone: "short",
    native: "ନୂଆ ବର୍ଷର ଶୁଭେଚ୍ଛା! 🌿",
    roman: "Nua barsara shubhechha! 🌿",
    english: "New year greetings!",
  },
  {
    id: "ps-poetic-1",
    occasion: "pana-sankranti",
    tone: "poetic",
    native: "ବୈଶାଖର ପ୍ରଥମ ଦିନ ନୂଆ ଆଲୋକ ଆଣୁ, ମନର ସବୁ ଅନ୍ଧାର ଦୂର ହେଉ।",
    roman: "Baisakhara prathama dina nua aloka anu, manara sabu andhara dura heu.",
    english:
      "May the first day of Baisakha bring new light and clear away every shadow of the mind.",
  },
  {
    id: "gr-trad-1",
    occasion: "gregorian",
    tone: "traditional",
    native:
      "ଇଂରାଜୀ ନୂଆ ବର୍ଷର ହାର୍ଦ୍ଦିକ ଶୁଭେଚ୍ଛା! ଏହି ବର୍ଷ ଆପଣଙ୍କୁ ସୁସ୍ଥତା ଓ ସଫଳତା ଦେଉ।",
    roman:
      "Inraji nua barsara harddika shubhechha! Ehi barsa apananku susthata o saphalata deu.",
    english:
      "Hearty greetings for the January new year! May this year give you health and success.",
  },
  {
    id: "gr-warm-1",
    occasion: "gregorian",
    tone: "warm",
    native: "ନୂଆ ବର୍ଷରେ ତୁମର ପ୍ରତ୍ୟେକ ଦିନ ଆନନ୍ଦରେ କଟୁ, ପ୍ରତ୍ୟେକ ସ୍ୱପ୍ନ ପୂରଣ ହେଉ।",
    roman:
      "Nua barsare tumara pratyeka dina anandare katu, pratyeka swapna purana heu.",
    english:
      "In the new year may each of your days pass in joy and every dream be fulfilled.",
  },
  {
    id: "gr-formal-1",
    occasion: "gregorian",
    tone: "formal",
    native:
      "ନୂଆ ବର୍ଷର ଶୁଭେଚ୍ଛା। ଗତ ବର୍ଷର ସହଯୋଗ ପାଇଁ ଧନ୍ୟବାଦ; ଆଗାମୀ ବର୍ଷରେ ମଧ୍ୟ ଏକାଠି କାମ କରିବାକୁ ଅପେକ୍ଷା ରହିଲି।",
    roman:
      "Nua barsara shubhechha. Gata barsara sahajoga pain dhanyabada; agami barsare madhya ekathi kama karibaku apekhya rahili.",
    english:
      "New year greetings. Thank you for your cooperation last year; I look forward to working together in the coming year too.",
  },
  {
    id: "gr-short-1",
    occasion: "gregorian",
    tone: "short",
    native: "ନୂଆ ବର୍ଷ ଶୁଭ ହେଉ! ✨",
    roman: "Nua barsa shubha heu! ✨",
    english: "May the new year be a good one!",
  },
  {
    id: "gr-poetic-1",
    occasion: "gregorian",
    tone: "poetic",
    native:
      "କ୍ୟାଲେଣ୍ଡରର ପୃଷ୍ଠା ବଦଳିଲା, ହେଲେ ଆମର ସ୍ନେହ ସେମିତି ରହୁ। ନୂଆ ବର୍ଷର ଶୁଭେଚ୍ଛା।",
    roman:
      "Calendarara prushtha badalila, hele amara sneha semiti rahu. Nua barsara shubhechha.",
    english:
      "The calendar page has turned, but may our affection stay as it is. New year greetings.",
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
  occasionId = "pana-sankranti",
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
