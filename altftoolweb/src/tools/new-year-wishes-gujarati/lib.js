/**
 * Gujarati New Year Wishes — greeting bank plus pure composition helpers.
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
    id: "bestu-varas",
    label: "Bestu Varas (Gujarati new year)",
    note: "Kartak Sud Ekam, the day after Diwali, when Gujaratis say Nutan Varshabhinandan and Saal Mubarak.",
  },
  {
    id: "gregorian",
    label: "1 January (Angreji navu varsh)",
    note: "The Gregorian new year, called Angreji navu varsh in Gujarati.",
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
  { id: "native", label: "Gujarati script only" },
  { id: "roman", label: "Roman transliteration only" },
  { id: "both", label: "Gujarati + Roman" },
];

/**
 * Salutations follow ordinary Gujarati letter usage: aadarniya for a senior,
 * mananiya in formal writing, priya for family, vahala for a younger person,
 * and a bare name between friends.
 */
export const RELATIONSHIPS = [
  { id: "none", label: "No salutation", native: "", roman: "", english: "" },
  {
    id: "elder",
    label: "Elder / teacher",
    native: "આદરણીય {name},",
    roman: "Aadarniya {name},",
    english: "Respected {name},",
  },
  {
    id: "family",
    label: "Family",
    native: "પ્રિય {name},",
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
    native: "માનનીય {name},",
    roman: "Mananiya {name},",
    english: "Honourable {name},",
  },
  {
    id: "younger",
    label: "Younger relative",
    native: "વહાલા {name},",
    roman: "Vahala {name},",
    english: "Dear (younger) {name},",
  },
];

export const WISHES = [
  {
    id: "bv-trad-1",
    occasion: "bestu-varas",
    tone: "traditional",
    native: "નૂતન વર્ષાભિનંદન! નવું વર્ષ આપને સુખ, શાંતિ અને સમૃદ્ધિ આપે.",
    roman:
      "Nutan Varshabhinandan! Navu varsh aapne sukh, shanti ane samruddhi aape.",
    english:
      "New year congratulations! May the new year give you happiness, peace and prosperity.",
  },
  {
    id: "bv-trad-2",
    occasion: "bestu-varas",
    tone: "traditional",
    native: "સાલ મુબારક! નવા વર્ષે આપના ઘરમાં આનંદ અને લક્ષ્મીનો વાસ રહે.",
    roman: "Saal Mubarak! Nava varshe aapna gharma anand ane Lakshmino vaas rahe.",
    english:
      "Happy new year! May joy and Lakshmi dwell in your home through the new year.",
  },
  {
    id: "bv-warm-1",
    occasion: "bestu-varas",
    tone: "warm",
    native: "જૂનું બધું ભૂલી જઈએ, નવા વર્ષે નવી શરૂઆત કરીએ. નૂતન વર્ષાભિનંદન!",
    roman:
      "Junu badhu bhuli jaiye, nava varshe navi sharuaat kariye. Nutan Varshabhinandan!",
    english:
      "Let us forget everything old and make a fresh start in the new year. New year congratulations!",
  },
  {
    id: "bv-warm-2",
    occasion: "bestu-varas",
    tone: "warm",
    native: "મીઠાઈ, ફટાકડા અને પરિવાર — નવું વર્ષ આ જ ખુશીથી ભરેલું રહે. સાલ મુબારક!",
    roman:
      "Mithai, fatakda ane parivar — navu varsh aa ja khushithi bharelu rahe. Saal Mubarak!",
    english:
      "Sweets, firecrackers and family — may the new year stay full of exactly this joy. Happy new year!",
  },
  {
    id: "bv-formal-1",
    occasion: "bestu-varas",
    tone: "formal",
    native:
      "નૂતન વર્ષાભિનંદન. નવા વર્ષે આપના વ્યવસાયમાં પ્રગતિ અને શ્રીવૃદ્ધિ થાય એવી શુભેચ્છા.",
    roman:
      "Nutan Varshabhinandan. Nava varshe aapna vyavsayma pragati ane shrivruddhi thay evi shubhechha.",
    english:
      "New year congratulations. My wish is that your business sees progress and prosperity in the new year.",
  },
  {
    id: "bv-formal-2",
    occasion: "bestu-varas",
    tone: "formal",
    native: "ચોપડા પૂજનના શુભ અવસરે આપને અને આપની પેઢીને હાર્દિક શુભકામનાઓ.",
    roman: "Chopda pujanna shubh avsare aapne ane aapni pedhine hardik shubhkamnao.",
    english:
      "Heartfelt wishes to you and your firm on the auspicious occasion of Chopda Pujan, the worship of the account books.",
  },
  {
    id: "bv-short-1",
    occasion: "bestu-varas",
    tone: "short",
    native: "સાલ મુબારક! 🪔",
    roman: "Saal Mubarak! 🪔",
    english: "Happy new year!",
  },
  {
    id: "bv-short-2",
    occasion: "bestu-varas",
    tone: "short",
    native: "નૂતન વર્ષાભિનંદન!",
    roman: "Nutan Varshabhinandan!",
    english: "New year congratulations!",
  },
  {
    id: "bv-poetic-1",
    occasion: "bestu-varas",
    tone: "poetic",
    native: "દીવાની જ્યોત જેમ તમારું નવું વર્ષ પણ ઝળહળતું રહે.",
    roman: "Deevani jyot jem tamaru navu varsh pan zalhaltu rahe.",
    english: "May your new year shine as bright as the flame of a lamp.",
  },
  {
    id: "gr-trad-1",
    occasion: "gregorian",
    tone: "traditional",
    native:
      "અંગ્રેજી નવા વર્ષની હાર્દિક શુભકામનાઓ! આ વર્ષ આપને આરોગ્ય અને સફળતા આપે.",
    roman:
      "Angreji nava varshni hardik shubhkamnao! Aa varsh aapne aarogya ane safalta aape.",
    english:
      "Hearty wishes for the January new year! May this year give you health and success.",
  },
  {
    id: "gr-warm-1",
    occasion: "gregorian",
    tone: "warm",
    native: "નવા વર્ષે તારો દરેક દિવસ સારો જાય અને દરેક સપનું પૂરું થાય.",
    roman: "Nava varshe taro darek divas saro jaay ane darek sapnu puru thay.",
    english:
      "In the new year may each of your days go well and every dream of yours come true.",
  },
  {
    id: "gr-formal-1",
    occasion: "gregorian",
    tone: "formal",
    native:
      "નવા વર્ષની શુભકામનાઓ. ગત વર્ષના સહકાર બદલ આભાર, આવતા વર્ષે પણ સાથે કામ કરવાની અપેક્ષા.",
    roman:
      "Nava varshni shubhkamnao. Gat varshna sahkar badal aabhar, aavta varshe pan sathe kaam karvani apeksha.",
    english:
      "New year wishes. Thank you for your cooperation last year; I look forward to working together in the coming year too.",
  },
  {
    id: "gr-short-1",
    occasion: "gregorian",
    tone: "short",
    native: "નવા વર્ષની શુભકામનાઓ! ✨",
    roman: "Nava varshni shubhkamnao! ✨",
    english: "New year wishes!",
  },
  {
    id: "gr-poetic-1",
    occasion: "gregorian",
    tone: "poetic",
    native: "કેલેન્ડરનું પાનું બદલાયું, પણ આપણો સ્નેહ એવો જ રહે. નવું વર્ષ શુભ રહે.",
    roman:
      "Calendarnu paanu badlayu, pan aapno sneh evo ja rahe. Navu varsh shubh rahe.",
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
  occasionId = "bestu-varas",
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
