/**
 * Spanish New Year Wishes — greeting bank plus pure composition helpers.
 * No React, no DOM, no timers. Same input -> same output.
 */

/**
 * GSM 03.38 default 7-bit alphabet. A message made only of these characters is
 * sent as GSM-7; anything else forces the UCS-2 (UTF-16) alphabet.
 * Note that Spanish ñ, é, ü, ¡ and ¿ ARE in this table, but á, í, ó and ú are not.
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

/**
 * Substitutions that keep the Spanish readable while bringing it inside the
 * GSM-7 alphabet. The acute-accented vowels a, i, o and u are missing from
 * GSM 03.38, but ñ, é and ü are present and must never be replaced — writing
 * "ano" instead of "año" changes the meaning of the word.
 */
export const GSM_SAFE_REPLACEMENTS = {
  á: "a",
  í: "i",
  ó: "o",
  ú: "u",
  Á: "A",
  Í: "I",
  Ó: "O",
  Ú: "U",
  "—": "-",
  "–": "-",
  "“": '"',
  "”": '"',
  "‘": "'",
  "’": "'",
  "…": "...",
};

/** Longest name accepted, so a greeting stays readable on one screen. */
export const NAME_MAX_LENGTH = 40;

export const OCCASIONS = [
  {
    id: "ano-nuevo",
    label: "Año Nuevo (1 January)",
    note: "The Gregorian new year, greeted with ¡Feliz Año Nuevo! or ¡Próspero Año Nuevo!",
  },
  {
    id: "nochevieja",
    label: "Nochevieja (New Year's Eve, 31 December)",
    note: "New Year's Eve, when Spanish speakers eat twelve grapes on the twelve strokes of midnight.",
  },
];

export const TONES = [
  { id: "all", label: "All tones" },
  { id: "traditional", label: "Traditional" },
  { id: "warm", label: "Warm and personal (tú)" },
  { id: "formal", label: "Formal / business (usted)" },
  { id: "short", label: "Short status line" },
  { id: "poetic", label: "Poetic" },
];

export const SCRIPTS = [
  { id: "accented", label: "Full Spanish with accents" },
  { id: "gsm7", label: "SMS-safe (á í ó ú simplified)" },
  { id: "both", label: "Both versions" },
];

/**
 * Spanish letter openings. Estimado/a and Distinguido/a are followed by a
 * colon rather than a comma — that is the standard punctuation in a Spanish
 * letter, where a comma is treated as an anglicism.
 */
export const RELATIONSHIPS = [
  { id: "none", label: "No salutation", native: "", english: "" },
  {
    id: "elder",
    label: "Someone you address as usted",
    native: "Estimado/a {name}:",
    english: "Dear {name}: (formal, usted)",
  },
  {
    id: "family",
    label: "Family",
    native: "Querido/a {name},",
    english: "Dear {name},",
  },
  {
    id: "friend",
    label: "Friend",
    native: "{name},",
    english: "{name},",
  },
  {
    id: "colleague",
    label: "Client / official letter",
    native: "Distinguido/a {name}:",
    english: "Distinguished {name}:",
  },
  {
    id: "younger",
    label: "Someone close / younger",
    native: "Mi querido/a {name},",
    english: "My dear {name},",
  },
];

export const WISHES = [
  {
    id: "an-trad-1",
    occasion: "ano-nuevo",
    tone: "traditional",
    native: "¡Feliz Año Nuevo! Le deseo salud, trabajo y mucha paz en este año que empieza.",
    english:
      "Happy New Year! I wish you health, work and a great deal of peace in the year now beginning.",
  },
  {
    id: "an-trad-2",
    occasion: "ano-nuevo",
    tone: "traditional",
    native: "¡Próspero Año Nuevo! Que se cumplan todos sus proyectos.",
    english: "A prosperous New Year! May all your plans come true.",
  },
  {
    id: "an-warm-1",
    occasion: "ano-nuevo",
    tone: "warm",
    native:
      "Que este año nuevo te traiga días buenos, gente buena y muchas ganas de vivir.",
    english:
      "May this new year bring you good days, good people and plenty of appetite for life.",
  },
  {
    id: "an-warm-2",
    occasion: "ano-nuevo",
    tone: "warm",
    native: "¡Feliz Año! Gracias por estar ahí en el que se va; nos vemos en el que llega.",
    english:
      "Happy New Year! Thank you for being there in the year that is ending; see you in the one arriving.",
  },
  {
    id: "an-formal-1",
    occasion: "ano-nuevo",
    tone: "formal",
    native:
      "Le deseamos un feliz y próspero año nuevo. Agradecemos su confianza durante este año y esperamos seguir trabajando juntos.",
    english:
      "We wish you a happy and prosperous new year. We are grateful for your trust this year and hope to keep working together.",
  },
  {
    id: "an-short-1",
    occasion: "ano-nuevo",
    tone: "short",
    native: "¡Feliz Año Nuevo! ✨",
    english: "Happy New Year!",
  },
  {
    id: "an-short-2",
    occasion: "ano-nuevo",
    tone: "short",
    native: "¡Próspero Año Nuevo!",
    english: "A prosperous New Year!",
  },
  {
    id: "an-poetic-1",
    occasion: "ano-nuevo",
    tone: "poetic",
    native: "Se cierra una página y empieza otra en blanco. Que la escribas bonito.",
    english:
      "One page closes and another begins blank. May you write it beautifully.",
  },
  {
    id: "nv-trad-1",
    occasion: "nochevieja",
    tone: "traditional",
    native: "¡Feliz Nochevieja! Que las doce uvas te traigan doce meses de suerte.",
    english:
      "Happy New Year's Eve! May the twelve grapes bring you twelve months of luck.",
  },
  {
    id: "nv-warm-1",
    occasion: "nochevieja",
    tone: "warm",
    native: "Esta noche brindamos por lo vivido y por lo que viene. ¡Feliz Nochevieja!",
    english:
      "Tonight we raise a glass to what we have lived and to what is coming. Happy New Year's Eve!",
  },
  {
    id: "nv-formal-1",
    occasion: "nochevieja",
    tone: "formal",
    native: "Reciba nuestros mejores deseos en esta Nochevieja y en el año que comienza.",
    english:
      "Please accept our best wishes on this New Year's Eve and for the year that begins.",
  },
  {
    id: "nv-short-1",
    occasion: "nochevieja",
    tone: "short",
    native: "¡Feliz Nochevieja! 🍇",
    english: "Happy New Year's Eve!",
  },
  {
    id: "nv-poetic-1",
    occasion: "nochevieja",
    tone: "poetic",
    native: "Doce campanadas, doce deseos. Que todos se te cumplan.",
    english: "Twelve chimes, twelve wishes. May every one of them come true for you.",
  },
];

/**
 * Rewrite text so every character survives the GSM-7 alphabet: apply the
 * substitution table, keep anything already in GSM 03.38, and drop the rest
 * (emoji, for instance). Line-trailing spaces left by a dropped character are
 * removed so the result does not gain invisible padding.
 */
export function toGsmSafe(text) {
  const value = typeof text === "string" ? text : "";
  let out = "";

  for (const ch of value) {
    const replacement = GSM_SAFE_REPLACEMENTS[ch];
    if (replacement !== undefined) {
      out += replacement;
    } else if (GSM7_BASIC.indexOf(ch) !== -1 || GSM7_EXTENDED.indexOf(ch) !== -1) {
      out += ch;
    }
  }

  return out
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/, ""))
    .join("\n");
}

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
  occasionId = "ano-nuevo",
  toneId = "all",
  relationshipId = "family",
  script = "accented",
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
  if (!scriptOption) return { error: "Pick one of the listed output options." };

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
  const englishSalutation = useSalutation ? applyName(relationship.english, to) : "";
  // A hyphen rather than an em dash, so the sign-off itself stays GSM-7 safe.
  const signature = from ? `- ${from}` : "";

  const items = matches.map((wish) => {
    const nativeBlock = joinLines([nativeSalutation, wish.native, signature]);
    const plainBlock = toGsmSafe(nativeBlock);
    const englishBlock = joinLines([englishSalutation, wish.english, signature]);

    let message = nativeBlock;
    if (script === "gsm7") message = plainBlock;
    if (script === "both") message = `${nativeBlock}\n\n${plainBlock}`;

    return {
      id: wish.id,
      tone: wish.tone,
      toneLabel: (TONES.find((item) => item.id === wish.tone) || {}).label || wish.tone,
      native: nativeBlock,
      plain: plainBlock,
      // Alias kept so callers can read the simplified form under a stable name.
      roman: plainBlock,
      english: englishBlock,
      message,
      characters: message.length,
      words: countWords(message),
      sms: measureSms(message),
      smsAccented: measureSms(nativeBlock),
      smsPlain: measureSms(plainBlock),
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
