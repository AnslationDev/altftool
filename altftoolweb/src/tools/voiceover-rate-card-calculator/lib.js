/**
 * Voiceover rate card maths.
 *
 * Voiceover quotes are conventionally built in two parts, the structure used by the
 * published rate guides (GVAA in the US, Gravy for the Brain in the UK) and by union
 * agreements such as SAG-AFTRA and Equity:
 *
 *   1. A SESSION FEE — payment for the performer's time and the recording itself.
 *      It is charged per finished minute of audio with a floor (the minimum session fee),
 *      because a 20-second read still occupies a booked slot.
 *   2. A USAGE FEE (also called a buyout or licence fee) — payment for the right to
 *      broadcast the recording. It scales with WHERE the audio runs (media), WHERE IT IS
 *      SEEN (territory), HOW LONG the licence lasts (term) and whether the performer is
 *      barred from competing work (exclusivity).
 *
 * The multipliers below are planning defaults that reproduce the shape of those published
 * guides — broadcast costs several times a corporate read, worldwide costs more than local,
 * perpetuity costs more than twelve months. They are NOT an official rate card and every
 * value is editable, because real rates differ by market, language, agent and union status.
 */

/** Read pace used to turn a script into finished minutes. Commercial VO sits near 150 wpm. */
export const DEFAULT_WPM = 150;
export const MIN_WPM = 80;
export const MAX_WPM = 260;

/** Media usage multipliers, applied to the session fee to produce the usage fee. */
export const USAGE_TYPES = [
  { id: "internal", label: "Internal / corporate, never public", multiplier: 0 },
  { id: "elearning", label: "e-Learning or training module", multiplier: 0.5 },
  { id: "explainer", label: "Explainer or product video (own channels)", multiplier: 0.5 },
  { id: "ivr", label: "IVR, on-hold and phone prompts", multiplier: 0.75 },
  { id: "podcast", label: "Podcast or streaming audio ad", multiplier: 1.25 },
  { id: "social", label: "Paid social advertising", multiplier: 1.5 },
  { id: "ooh", label: "Out-of-home and in-store", multiplier: 2 },
  { id: "radio", label: "Radio commercial", multiplier: 2.5 },
  { id: "game", label: "Video game character", multiplier: 2.5 },
  { id: "tv", label: "Television commercial", multiplier: 5 },
  { id: "cinema", label: "Cinema commercial", multiplier: 4 },
];

/** Territory multipliers, applied to the usage fee. */
export const TERRITORIES = [
  { id: "local", label: "Single city or station", multiplier: 1 },
  { id: "regional", label: "Region or state", multiplier: 1.25 },
  { id: "national", label: "One country, national", multiplier: 1.5 },
  { id: "multi", label: "Several countries", multiplier: 2.5 },
  { id: "worldwide", label: "Worldwide", multiplier: 3.5 },
];

/** Licence term multipliers, applied to the usage fee. Twelve months is the reference term. */
export const TERMS = [
  { id: "m3", label: "3 months", multiplier: 0.75 },
  { id: "m6", label: "6 months", multiplier: 0.9 },
  { id: "m12", label: "12 months", multiplier: 1 },
  { id: "m24", label: "24 months", multiplier: 1.6 },
  { id: "perpetuity", label: "In perpetuity", multiplier: 2.5 },
];

/** Exclusivity uplift, applied to the usage fee. */
export const EXCLUSIVITY = [
  { id: "none", label: "No exclusivity", uplift: 0 },
  { id: "category", label: "Category exclusive", uplift: 0.25 },
  { id: "full", label: "Full conflict-out", uplift: 0.5 },
];

/** Currencies offered, with the locale used to format them. */
export const CURRENCIES = [
  { code: "INR", locale: "en-IN", label: "Indian rupee" },
  { code: "USD", locale: "en-US", label: "US dollar" },
  { code: "GBP", locale: "en-GB", label: "Pound sterling" },
  { code: "EUR", locale: "en-IE", label: "Euro" },
];

function findById(list, id, fallbackIndex = 0) {
  return list.find((entry) => entry.id === id) || list[fallbackIndex];
}

/**
 * Build a voiceover quote.
 *
 * total = sessionFee + usageFee + rush - discount + agentCommission
 * where sessionFee = max(minimumSessionFee, ratePerFinishedMinute x finishedMinutes)
 * and   usageFee   = sessionFee x mediaMultiplier x territoryMultiplier x termMultiplier
 *                    x (1 + exclusivityUplift)
 *
 * @returns {object} quote or { error }
 */
export function computeVoiceoverQuote({
  wordCount,
  wordsPerMinute = DEFAULT_WPM,
  ratePerFinishedMinute,
  minimumSessionFee = 0,
  usageId = "radio",
  territoryId = "national",
  termId = "m12",
  exclusivityId = "none",
  rushPercent = 0,
  agentPercent = 0,
  discountPercent = 0,
} = {}) {
  const words = Number(wordCount);
  const wpm = Number(wordsPerMinute);
  const rate = Number(ratePerFinishedMinute);
  const minimum = Number(minimumSessionFee);

  if (!Number.isFinite(words)) return { error: "Enter the script word count." };
  if (words <= 0) return { error: "Script word count must be greater than zero." };
  if (words > 500000) return { error: "That word count is too large for a single voiceover job." };

  if (!Number.isFinite(wpm) || wpm < MIN_WPM || wpm > MAX_WPM) {
    return { error: `Read pace should be between ${MIN_WPM} and ${MAX_WPM} words per minute.` };
  }
  if (!Number.isFinite(rate) || rate < 0) {
    return { error: "Enter a per-finished-minute rate of zero or more." };
  }
  if (!Number.isFinite(minimum) || minimum < 0) {
    return { error: "Enter a minimum session fee of zero or more." };
  }
  if (rate === 0 && minimum === 0) {
    return { error: "Set either a per-minute rate or a minimum session fee — both are zero." };
  }

  const rush = Number(rushPercent);
  const agent = Number(agentPercent);
  const discount = Number(discountPercent);
  if (!Number.isFinite(rush) || rush < 0 || rush > 300) {
    return { error: "Rush surcharge must be between 0% and 300%." };
  }
  if (!Number.isFinite(agent) || agent < 0 || agent > 50) {
    return { error: "Agent commission must be between 0% and 50%." };
  }
  if (!Number.isFinite(discount) || discount < 0 || discount > 90) {
    return { error: "Discount must be between 0% and 90%." };
  }

  const usage = findById(USAGE_TYPES, usageId, 0);
  const territory = findById(TERRITORIES, territoryId, 0);
  const term = findById(TERMS, termId, 2);
  const exclusivity = findById(EXCLUSIVITY, exclusivityId, 0);

  const finishedMinutes = words / wpm;
  const timeFee = rate * finishedMinutes;
  const sessionFee = Math.max(minimum, timeFee);
  const minimumApplied = minimum > timeFee;

  const usageFactor =
    usage.multiplier * territory.multiplier * term.multiplier * (1 + exclusivity.uplift);
  const usageFee = sessionFee * usageFactor;

  const subtotal = sessionFee + usageFee;
  const rushFee = subtotal * (rush / 100);
  const discountValue = (subtotal + rushFee) * (discount / 100);
  const netBeforeAgent = subtotal + rushFee - discountValue;
  const agentFee = netBeforeAgent * (agent / 100);
  const total = netBeforeAgent + agentFee;

  return {
    words,
    wordsPerMinute: wpm,
    finishedMinutes,
    finishedSeconds: finishedMinutes * 60,
    sessionFee,
    minimumApplied,
    usageLabel: usage.label,
    usageMultiplier: usage.multiplier,
    territoryLabel: territory.label,
    territoryMultiplier: territory.multiplier,
    termLabel: term.label,
    termMultiplier: term.multiplier,
    exclusivityLabel: exclusivity.label,
    exclusivityUplift: exclusivity.uplift,
    usageFactor,
    usageFee,
    subtotal,
    rushFee,
    discountValue,
    agentFee,
    total,
    perFinishedMinute: finishedMinutes > 0 ? total / finishedMinutes : 0,
    perWord: words > 0 ? total / words : 0,
    performerNet: total - agentFee,
  };
}

/** Currency formatter for a supported currency code. */
export function formatMoney(value, currencyCode = "INR") {
  const entry = CURRENCIES.find((item) => item.code === currencyCode) || CURRENCIES[0];
  const safe = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat(entry.locale, {
    style: "currency",
    currency: entry.code,
    maximumFractionDigits: 0,
  }).format(safe);
}

/** Compare the same job across every licence term, to show what the term is worth. */
export function compareTerms(input) {
  return TERMS.map((term) => {
    const quote = computeVoiceoverQuote({ ...input, termId: term.id });
    return {
      id: term.id,
      label: term.label,
      total: quote.error ? null : quote.total,
      error: quote.error || null,
    };
  });
}
