/**
 * Malayalam New Year Wishes — greeting bank plus pure composition helpers.
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
    id: "vishu",
    label: "Vishu (Medam 1, 14 or 15 April)",
    note: "The astronomical new year in Kerala, marked by the Vishukkani display and the Vishukkaineettam handsel.",
  },
  {
    id: "chingam",
    label: "Chingam 1 (Kollavarsham new year)",
    note: "First day of Chingam, the start of the Malayalam Kollam era year, around 16 or 17 August, also kept as Karshaka Dinam.",
  },
  {
    id: "gregorian",
    label: "1 January (Puthuvatsaram)",
    note: "The Gregorian new year, greeted with puthuvatsaraashamsakal.",
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
  { id: "native", label: "Malayalam script only" },
  { id: "roman", label: "Roman transliteration only" },
  { id: "both", label: "Malayalam + Roman" },
];

/**
 * Salutations follow ordinary Malayalam letter usage: bahumanappetta for a
 * senior, manya in formal writing, priyappetta for family, priya for a younger
 * person, and a bare name between friends.
 */
export const RELATIONSHIPS = [
  { id: "none", label: "No salutation", native: "", roman: "", english: "" },
  {
    id: "elder",
    label: "Elder / teacher",
    native: "ബഹുമാനപ്പെട്ട {name},",
    roman: "Bahumanappetta {name},",
    english: "Respected {name},",
  },
  {
    id: "family",
    label: "Family",
    native: "പ്രിയപ്പെട്ട {name},",
    roman: "Priyappetta {name},",
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
    native: "മാന്യ {name},",
    roman: "Manya {name},",
    english: "Esteemed {name},",
  },
  {
    id: "younger",
    label: "Younger relative",
    native: "പ്രിയ {name},",
    roman: "Priya {name},",
    english: "Dear (younger) {name},",
  },
];

export const WISHES = [
  {
    id: "vs-trad-1",
    occasion: "vishu",
    tone: "traditional",
    native: "വിഷു ആശംസകൾ! പുതുവർഷം നിങ്ങൾക്ക് ഐശ്വര്യവും സമൃദ്ധിയും നൽകട്ടെ.",
    roman:
      "Vishu aashamsakal! Puthuvarsham ningalkku aishwaryavum samruddhiyum nalkatte.",
    english: "Vishu greetings! May the new year give you prosperity and abundance.",
  },
  {
    id: "vs-trad-2",
    occasion: "vishu",
    tone: "traditional",
    native:
      "വിഷുക്കണി കണ്ട് തുടങ്ങുന്ന ഈ പുതുവർഷം നന്മ നിറഞ്ഞതാകട്ടെ. വിഷു ആശംസകൾ.",
    roman:
      "Vishukkani kandu thudangunna ee puthuvarsham nanma niranjathakatte. Vishu aashamsakal.",
    english:
      "May this new year, begun with the sight of the Vishukkani, be full of goodness. Vishu greetings.",
  },
  {
    id: "vs-warm-1",
    occasion: "vishu",
    tone: "warm",
    native:
      "വിഷുക്കൈനീട്ടവും കണിക്കൊന്നയും പോലെ നിന്റെ വർഷവും സന്തോഷം നിറഞ്ഞതാകട്ടെ.",
    roman:
      "Vishukkaineettavum kanikkonnayum pole ninte varshavum santhosham niranjathakatte.",
    english:
      "Like the Vishu handsel and the golden kanikkonna blossom, may your year be full of joy too.",
  },
  {
    id: "vs-formal-1",
    occasion: "vishu",
    tone: "formal",
    native:
      "വിഷു ആശംസകൾ. പുതിയ വർഷം താങ്കൾക്കും സ്ഥാപനത്തിനും അഭിവൃദ്ധി നൽകട്ടെ.",
    roman:
      "Vishu aashamsakal. Puthiya varsham thankalkkum sthapanathinum abhivruddhi nalkatte.",
    english:
      "Vishu greetings. May the new year bring growth to you and to your organisation.",
  },
  {
    id: "vs-short-1",
    occasion: "vishu",
    tone: "short",
    native: "വിഷു ആശംസകൾ! 🌼",
    roman: "Vishu aashamsakal! 🌼",
    english: "Vishu greetings!",
  },
  {
    id: "vs-poetic-1",
    occasion: "vishu",
    tone: "poetic",
    native: "കണിക്കൊന്ന പൂത്തു, പുതുവർഷം വന്നു. നന്മകൾ നേരുന്നു.",
    roman: "Kanikkonna poothu, puthuvarsham vannu. Nanmakal nerunnu.",
    english:
      "The kanikkonna has blossomed and the new year has arrived. Wishing you every good thing.",
  },
  {
    id: "ch-trad-1",
    occasion: "chingam",
    tone: "traditional",
    native:
      "പുതിയ കൊല്ലവർഷത്തിന്റെ ആശംസകൾ! ചിങ്ങം ഒന്ന് എല്ലാവർക്കും ഐശ്വര്യം നൽകട്ടെ.",
    roman:
      "Puthiya Kollavarshathinte aashamsakal! Chingam onnu ellavarkkum aishwaryam nalkatte.",
    english:
      "Greetings for the new Kollam era year! May the first of Chingam bring prosperity to all.",
  },
  {
    id: "ch-formal-1",
    occasion: "chingam",
    tone: "formal",
    native: "ചിങ്ങം ഒന്നിന്റെ ആശംസകൾ. കർഷകദിനത്തിൽ എല്ലാ നന്മകളും നേരുന്നു.",
    roman: "Chingam onninte aashamsakal. Karshakadinathil ella nanmakalum nerunnu.",
    english:
      "Greetings on the first of Chingam. Every good wish to you on Farmers' Day.",
  },
  {
    id: "ch-short-1",
    occasion: "chingam",
    tone: "short",
    native: "പുതുവർഷാശംസകൾ!",
    roman: "Puthuvarshaashamsakal!",
    english: "New year greetings!",
  },
  {
    id: "gr-trad-1",
    occasion: "gregorian",
    tone: "traditional",
    native: "പുതുവത്സരാശംസകൾ! ഈ വർഷം നിങ്ങൾക്ക് ആരോഗ്യവും വിജയവും നൽകട്ടെ.",
    roman:
      "Puthuvatsaraashamsakal! Ee varsham ningalkku aarogyavum vijayavum nalkatte.",
    english: "New year greetings! May this year give you health and success.",
  },
  {
    id: "gr-warm-1",
    occasion: "gregorian",
    tone: "warm",
    native:
      "പുതുവർഷത്തിൽ നിന്റെ ഓരോ ദിവസവും സന്തോഷമായിരിക്കട്ടെ, ഓരോ സ്വപ്നവും സഫലമാകട്ടെ.",
    roman:
      "Puthuvarshathil ninte oro divasavum santhoshamayirikkatte, oro swapnavum saphalamakatte.",
    english:
      "In the new year may each of your days be happy and every dream be fulfilled.",
  },
  {
    id: "gr-formal-1",
    occasion: "gregorian",
    tone: "formal",
    native:
      "പുതുവത്സരാശംസകൾ. കഴിഞ്ഞ വർഷത്തെ സഹകരണത്തിന് നന്ദി; വരും വർഷത്തിലും ഒരുമിച്ച് പ്രവർത്തിക്കാൻ കാത്തിരിക്കുന്നു.",
    roman:
      "Puthuvatsaraashamsakal. Kazhinja varshathe sahakaranathinu nandi; varum varshathilum orumichu pravarthikkan kathirikkunnu.",
    english:
      "New year greetings. Thank you for your cooperation last year; I look forward to working together in the coming year too.",
  },
  {
    id: "gr-short-1",
    occasion: "gregorian",
    tone: "short",
    native: "പുതുവത്സരാശംസകൾ! ✨",
    roman: "Puthuvatsaraashamsakal! ✨",
    english: "New year greetings!",
  },
  {
    id: "gr-poetic-1",
    occasion: "gregorian",
    tone: "poetic",
    native:
      "കലണ്ടറിലെ താൾ മാറി, പക്ഷേ നമ്മുടെ സ്നേഹം അതുപോലെ നിൽക്കട്ടെ. പുതുവർഷാശംസകൾ.",
    roman:
      "Calendarile thaal maari, pakshe nammude sneham athupole nilkkatte. Puthuvarshaashamsakal.",
    english:
      "The calendar page has turned, but may our affection stand as it is. New year greetings.",
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
  occasionId = "vishu",
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
