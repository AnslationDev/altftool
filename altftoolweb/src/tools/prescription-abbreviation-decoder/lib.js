/**
 * Prescription abbreviation decoder.
 *
 * Pure module — no React, no DOM, no clock reads.
 * Informational only. It explains standard prescribing shorthand; it never tells
 * anyone what to take. The dispensing label and the prescriber always win.
 */

/* UK and Indian prescriptions write duration as a fraction with the unit on the
   bottom: 5/7 is five days, 2/52 is two weeks, 3/12 is three months. */
export const DURATION_DENOMINATORS = { 7: 1, 52: 7, 12: 30 };

/* A course longer than ten years is a typing error, not a prescription. */
export const MAX_DURATION_DAYS = 3650;

export const CATEGORIES = ["Frequency", "Timing", "Route", "Form", "Quantity and instruction"];

/**
 * Abbreviation table. `timesPerDay` is filled in only where the abbreviation
 * fixes a number of doses. `risk` marks abbreviations that appear on the ISMP
 * list of error-prone abbreviations, or that mean different things in different
 * countries.
 */
export const ABBREVIATIONS = [
  // Frequency
  { abbr: "OD", aliases: ["od", "qd", "qday", "daily", "omnidie"], latin: "omni die / quaque die", meaning: "Once a day (daily)", category: "Frequency", timesPerDay: 1, risk: "‘OD’ also means oculus dexter (right eye) in eye prescribing, and ‘QD’ is on the ISMP error-prone list because it is misread as QID (four times a day). Safer written out as “once daily”." },
  { abbr: "BD", aliases: ["bd", "bid", "bds", "bisindie"], latin: "bis in die", meaning: "Twice a day", category: "Frequency", timesPerDay: 2, risk: null },
  { abbr: "TDS", aliases: ["tds", "tid", "ter"], latin: "ter die sumendum / ter in die", meaning: "Three times a day", category: "Frequency", timesPerDay: 3, risk: null },
  { abbr: "QDS", aliases: ["qds", "qid"], latin: "quater die sumendum", meaning: "Four times a day", category: "Frequency", timesPerDay: 4, risk: null },
  { abbr: "q4h", aliases: ["q4h", "q4hr", "4hrly"], latin: "quaque quarta hora", meaning: "Every 4 hours", category: "Frequency", timesPerDay: 6, risk: null },
  { abbr: "q6h", aliases: ["q6h", "q6hr", "6hrly"], latin: "quaque sexta hora", meaning: "Every 6 hours", category: "Frequency", timesPerDay: 4, risk: null },
  { abbr: "q8h", aliases: ["q8h", "q8hr", "8hrly"], latin: "quaque octava hora", meaning: "Every 8 hours", category: "Frequency", timesPerDay: 3, risk: null },
  { abbr: "q12h", aliases: ["q12h", "q12hr", "12hrly"], latin: "quaque duodecima hora", meaning: "Every 12 hours", category: "Frequency", timesPerDay: 2, risk: null },
  { abbr: "QOD", aliases: ["qod", "eod"], latin: "quaque altera die", meaning: "Every other day", category: "Frequency", timesPerDay: 0.5, risk: "On the ISMP error-prone list — misread as QD (daily) or QID (four times daily). Write “every other day”." },
  { abbr: "OW", aliases: ["ow", "qwk", "weekly"], latin: "omni septimana", meaning: "Once a week", category: "Frequency", timesPerDay: 1 / 7, risk: null },
  { abbr: "PRN", aliases: ["prn"], latin: "pro re nata", meaning: "As needed, up to the stated maximum", category: "Frequency", timesPerDay: null, risk: "A PRN item must always carry a maximum dose in 24 hours and a reason (‘for pain’). Without both, ask the prescriber." },
  { abbr: "SOS", aliases: ["sos"], latin: "si opus sit", meaning: "If necessary — a single dose only", category: "Frequency", timesPerDay: null, risk: null },
  { abbr: "STAT", aliases: ["stat"], latin: "statim", meaning: "Immediately, one dose now", category: "Frequency", timesPerDay: null, risk: null },

  // Timing
  { abbr: "OM", aliases: ["om", "qam", "mane"], latin: "omni mane", meaning: "Every morning", category: "Timing", timesPerDay: 1, risk: null },
  { abbr: "ON", aliases: ["on", "qpm", "nocte", "qhs"], latin: "omni nocte", meaning: "Every night", category: "Timing", timesPerDay: 1, risk: null },
  { abbr: "HS", aliases: ["hs"], latin: "hora somni", meaning: "At bedtime", category: "Timing", timesPerDay: 1, risk: "‘HS’ is also read as ‘half strength’. ISMP recommends writing “at bedtime” in full." },
  { abbr: "AC", aliases: ["ac"], latin: "ante cibum", meaning: "Before food", category: "Timing", timesPerDay: null, risk: null },
  { abbr: "PC", aliases: ["pc"], latin: "post cibum", meaning: "After food", category: "Timing", timesPerDay: null, risk: null },
  { abbr: "CC", aliases: ["cumcibo"], latin: "cum cibo", meaning: "With food", category: "Timing", timesPerDay: null, risk: null },
  { abbr: "ad lib", aliases: ["adlib"], latin: "ad libitum", meaning: "As much as desired", category: "Timing", timesPerDay: null, risk: null },

  // Route
  { abbr: "PO", aliases: ["po", "peros"], latin: "per os", meaning: "By mouth", category: "Route", timesPerDay: null, risk: null },
  { abbr: "IV", aliases: ["iv"], latin: "intra venam", meaning: "Into a vein (intravenous)", category: "Route", timesPerDay: null, risk: null },
  { abbr: "IM", aliases: ["im"], latin: "intra musculum", meaning: "Into a muscle (intramuscular)", category: "Route", timesPerDay: null, risk: null },
  { abbr: "SC", aliases: ["sc", "sq", "subq", "subcut"], latin: "sub cutem", meaning: "Under the skin (subcutaneous)", category: "Route", timesPerDay: null, risk: "‘SC’, ‘SQ’ and ‘sub q’ are on the ISMP error-prone list — ‘SQ’ has been read as ‘5 every’. Write “subcutaneous” or “subcut”." },
  { abbr: "SL", aliases: ["sl", "subling"], latin: "sub lingua", meaning: "Under the tongue (sublingual)", category: "Route", timesPerDay: null, risk: null },
  { abbr: "PR", aliases: ["pr"], latin: "per rectum", meaning: "Into the rectum", category: "Route", timesPerDay: null, risk: null },
  { abbr: "PV", aliases: ["pv"], latin: "per vaginam", meaning: "Into the vagina", category: "Route", timesPerDay: null, risk: null },
  { abbr: "TOP", aliases: ["top", "topically"], latin: "—", meaning: "Applied to the skin (topical)", category: "Route", timesPerDay: null, risk: null },
  { abbr: "INH", aliases: ["inh", "inhal"], latin: "—", meaning: "Inhaled", category: "Route", timesPerDay: null, risk: null },
  { abbr: "NEB", aliases: ["neb", "nebs"], latin: "—", meaning: "Given by nebuliser", category: "Route", timesPerDay: null, risk: null },
  { abbr: "NG", aliases: ["ng"], latin: "—", meaning: "Down a nasogastric tube", category: "Route", timesPerDay: null, risk: null },
  { abbr: "ID", aliases: ["intraderm"], latin: "intra dermam", meaning: "Into the skin (intradermal)", category: "Route", timesPerDay: null, risk: null },
  { abbr: "OU", aliases: ["ou"], latin: "oculus uterque", meaning: "Both eyes", category: "Route", timesPerDay: null, risk: "Eye and ear abbreviations (OU, OD, OS, AU, AD, AS) are on the ISMP error-prone list because they are swapped for each other. Write “both eyes”, “right ear” and so on." },
  { abbr: "OS", aliases: ["os"], latin: "oculus sinister", meaning: "Left eye", category: "Route", timesPerDay: null, risk: "Confused with ‘OD’ and with ‘per os’. Write “left eye”." },
  { abbr: "AD", aliases: ["ad"], latin: "auris dextra", meaning: "Right ear", category: "Route", timesPerDay: null, risk: "Confused with ‘OD’ (right eye). Write “right ear”." },
  { abbr: "AS", aliases: ["as"], latin: "auris sinistra", meaning: "Left ear", category: "Route", timesPerDay: null, risk: "Confused with ‘OS’ (left eye). Write “left ear”." },
  { abbr: "AU", aliases: ["au"], latin: "auris utraque", meaning: "Both ears", category: "Route", timesPerDay: null, risk: "Confused with ‘OU’ (both eyes). Write “both ears”." },

  // Form
  { abbr: "tab", aliases: ["tab", "tabs", "t"], latin: "tabella", meaning: "Tablet", category: "Form", timesPerDay: null, risk: null },
  { abbr: "cap", aliases: ["cap", "caps"], latin: "capsula", meaning: "Capsule", category: "Form", timesPerDay: null, risk: null },
  { abbr: "syr", aliases: ["syr", "syrup"], latin: "syrupus", meaning: "Syrup", category: "Form", timesPerDay: null, risk: null },
  { abbr: "susp", aliases: ["susp"], latin: "suspensio", meaning: "Suspension — shake before use", category: "Form", timesPerDay: null, risk: null },
  { abbr: "inj", aliases: ["inj"], latin: "injectio", meaning: "Injection", category: "Form", timesPerDay: null, risk: null },
  { abbr: "gtt", aliases: ["gtt", "gtts"], latin: "guttae", meaning: "Drops", category: "Form", timesPerDay: null, risk: null },
  { abbr: "ung", aliases: ["ung", "oint"], latin: "unguentum", meaning: "Ointment", category: "Form", timesPerDay: null, risk: null },
  { abbr: "cr", aliases: ["cr", "cream"], latin: "cremor", meaning: "Cream", category: "Form", timesPerDay: null, risk: null },
  { abbr: "supp", aliases: ["supp"], latin: "suppositorium", meaning: "Suppository", category: "Form", timesPerDay: null, risk: null },
  { abbr: "MDI", aliases: ["mdi"], latin: "—", meaning: "Metered dose inhaler (a puff)", category: "Form", timesPerDay: null, risk: null },
  { abbr: "SR", aliases: ["sr", "mr", "xl", "cr-release"], latin: "—", meaning: "Sustained or modified release — swallow whole, do not crush", category: "Form", timesPerDay: null, risk: null },
  { abbr: "EC", aliases: ["ec"], latin: "—", meaning: "Enteric coated — do not crush or chew", category: "Form", timesPerDay: null, risk: null },

  // Quantity and instruction
  { abbr: "Rx", aliases: ["rx"], latin: "recipe", meaning: "Take (the prescription itself)", category: "Quantity and instruction", timesPerDay: null, risk: null },
  { abbr: "Sig", aliases: ["sig", "signa"], latin: "signa", meaning: "Label the medicine with these directions", category: "Quantity and instruction", timesPerDay: null, risk: null },
  { abbr: "disp", aliases: ["disp"], latin: "dispensa", meaning: "Dispense this quantity", category: "Quantity and instruction", timesPerDay: null, risk: null },
  { abbr: "qs", aliases: ["qs"], latin: "quantum sufficit", meaning: "Enough to make up the stated amount", category: "Quantity and instruction", timesPerDay: null, risk: null },
  { abbr: "mcg", aliases: ["mcg", "µg", "ug"], latin: "—", meaning: "Microgram (one thousandth of a milligram)", category: "Quantity and instruction", timesPerDay: null, risk: "Write ‘mcg’. The symbol ‘µg’ is on the ISMP error-prone list because handwritten it is read as ‘mg’ — a 1000-fold overdose." },
  { abbr: "U", aliases: ["u"], latin: "—", meaning: "Unit (usually insulin or heparin)", category: "Quantity and instruction", timesPerDay: null, risk: "On the ISMP error-prone list: a handwritten ‘U’ is read as 0 or 4, so 4U becomes 40. Always write “unit”." },
  { abbr: "IU", aliases: ["iu"], latin: "—", meaning: "International unit", category: "Quantity and instruction", timesPerDay: null, risk: "On the ISMP error-prone list — read as ‘IV’ or as the number 10. Write “international unit”." },
  { abbr: "cc", aliases: ["cc"], latin: "—", meaning: "Cubic centimetre, the same volume as 1 mL", category: "Quantity and instruction", timesPerDay: null, risk: "On the ISMP error-prone list — handwritten ‘cc’ is read as ‘U’. Write “mL”." },
  { abbr: "NPO", aliases: ["npo", "nbm"], latin: "nil per os", meaning: "Nothing by mouth", category: "Quantity and instruction", timesPerDay: null, risk: null },
  { abbr: "D/C", aliases: ["dc"], latin: "—", meaning: "Discontinue — or discharge", category: "Quantity and instruction", timesPerDay: null, risk: "Genuinely ambiguous: ‘D/C’ has caused medicines to be stopped when the note meant ‘discharge’. Ask which was meant." },
  { abbr: "NKDA", aliases: ["nkda"], latin: "—", meaning: "No known drug allergies", category: "Quantity and instruction", timesPerDay: null, risk: null },
];

/** Units a dose can be counted in, used to pull "1 tab" or "5 mL" out of a sig. */
export const DOSE_UNITS = [
  "tab", "tabs", "tablet", "tablets",
  "cap", "caps", "capsule", "capsules",
  "ml", "mls", "puff", "puffs",
  "drop", "drops", "gtt", "gtts",
  "spray", "sprays", "unit", "units",
  "sachet", "sachets", "supp", "supps",
];

/** Normalise a token for lookup: lower case, no dots, slashes or trailing punctuation. */
export function normaliseToken(token) {
  return String(token || "")
    .toLowerCase()
    .replace(/[.,;:()]/g, "")
    .replace(/\//g, "")
    .trim();
}

const LOOKUP = (() => {
  const map = new Map();
  ABBREVIATIONS.forEach((entry) => {
    const keys = [entry.abbr, ...entry.aliases];
    keys.forEach((key) => {
      const normalised = normaliseToken(key);
      if (normalised && !map.has(normalised)) map.set(normalised, entry);
    });
  });
  return map;
})();

/** Look up a single abbreviation. Returns the entry or null. */
export function lookupAbbreviation(token) {
  return LOOKUP.get(normaliseToken(token)) || null;
}

/** Free-text search across abbreviation, Latin and meaning. */
export function searchAbbreviations(query) {
  const needle = String(query || "").trim().toLowerCase();
  if (!needle) return ABBREVIATIONS;
  return ABBREVIATIONS.filter((entry) => {
    const haystack = [entry.abbr, entry.latin, entry.meaning, ...entry.aliases].join(" ").toLowerCase();
    return haystack.includes(needle);
  });
}

/** Parse a duration written as 5/7 (days), 2/52 (weeks) or 3/12 (months). */
export function parseDurationToken(token) {
  const match = /^(\d{1,4})\/(7|52|12)$/.exec(String(token || "").trim());
  if (!match) return null;
  const count = Number(match[1]);
  const multiplier = DURATION_DENOMINATORS[Number(match[2])];
  if (!Number.isFinite(count) || count <= 0 || !multiplier) return null;
  return count * multiplier;
}

/**
 * Decode a whole sig line.
 * @param {string} sig e.g. "T. Amoxicillin 500mg 1 tab PO TDS 5/7 PC"
 * @returns {{error: string}|object}
 */
export function decodeSig(sig) {
  const text = String(sig || "").trim();
  if (!text) return { error: "Paste or type the directions from the prescription first." };
  if (text.length > 500) return { error: "That is longer than a sig line. Decode one medicine at a time (500 characters max)." };

  const rawTokens = text.split(/\s+/).filter(Boolean);
  const tokens = rawTokens.map((raw) => {
    const durationDays = parseDurationToken(raw.replace(/[.,;]$/, ""));
    const match = durationDays === null ? lookupAbbreviation(raw) : null;
    return {
      raw,
      normalised: normaliseToken(raw),
      match,
      durationDays,
      isNumber: /^\d+(\.\d+)?$/.test(raw),
    };
  });

  const matched = tokens.filter((token) => token.match);
  const decoded = [];
  const seen = new Set();
  matched.forEach((token) => {
    if (seen.has(token.match.abbr)) return;
    seen.add(token.match.abbr);
    decoded.push({ raw: token.raw, ...token.match });
  });

  const frequencyEntry = matched.map((t) => t.match).find((entry) => entry.timesPerDay !== null && entry.category === "Frequency");
  const timingEntry = matched.map((t) => t.match).find((entry) => entry.category === "Timing" && entry.timesPerDay !== null);
  const routeEntry = matched.map((t) => t.match).find((entry) => entry.category === "Route");
  const formEntry = matched.map((t) => t.match).find((entry) => entry.category === "Form");

  const dosesPerDay = frequencyEntry
    ? frequencyEntry.timesPerDay
    : timingEntry
      ? timingEntry.timesPerDay
      : null;

  // Duration: a x/7 style token, or "for 5 days" / "x 5 days".
  let durationDays = null;
  const fractionToken = tokens.find((token) => token.durationDays !== null);
  if (fractionToken) {
    durationDays = fractionToken.durationDays;
  } else {
    const plain = /(?:for|x)\s*(\d{1,4})\s*(day|days|week|weeks|month|months)/i.exec(text);
    if (plain) {
      const count = Number(plain[1]);
      const unit = plain[2].toLowerCase();
      const factor = unit.startsWith("day") ? 1 : unit.startsWith("week") ? 7 : 30;
      if (Number.isFinite(count) && count > 0) durationDays = count * factor;
    }
  }
  if (durationDays !== null && durationDays > MAX_DURATION_DAYS) {
    return { error: `A course of ${durationDays} days is longer than ${MAX_DURATION_DAYS} days. Re-check the duration.` };
  }

  // Amount per dose: the first "<number> <unit>" pair using a countable unit.
  let unitsPerDose = null;
  let doseUnit = null;
  const doseMatch = new RegExp(`(\\d+(?:\\.\\d+)?)\\s*(${DOSE_UNITS.join("|")})\\b`, "i").exec(text);
  if (doseMatch) {
    const amount = Number(doseMatch[1]);
    if (Number.isFinite(amount) && amount > 0) {
      unitsPerDose = amount;
      doseUnit = doseMatch[2].toLowerCase();
    }
  }

  const totalDoses =
    dosesPerDay !== null && durationDays !== null && dosesPerDay > 0
      ? Math.ceil(dosesPerDay * durationDays)
      : null;
  const totalUnits = totalDoses !== null && unitsPerDose !== null ? totalDoses * unitsPerDose : null;
  const hoursBetweenDoses = dosesPerDay !== null && dosesPerDay > 0 ? 24 / dosesPerDay : null;

  // A token like "500mg" or "20 mL" is a strength, not an undecoded abbreviation.
  const STRENGTH = /^\d+(\.\d+)?\s*(mg|mcg|ug|g|kg|ml|l|iu|u|%)$/i;
  const unknownTokens = tokens
    .filter(
      (token) =>
        !token.match &&
        token.durationDays === null &&
        !token.isNumber &&
        !STRENGTH.test(token.raw.replace(/[.,;]$/, "")) &&
        /[a-z]/i.test(token.raw),
    )
    .map((token) => token.raw);

  const safetyFlags = decoded.filter((entry) => entry.risk).map((entry) => ({ abbr: entry.abbr, risk: entry.risk }));

  // "4U" written without a space is the classic insulin ten-fold error.
  if (/\b\d+(\.\d+)?\s?U\b/.test(text)) {
    safetyFlags.push({
      abbr: "U",
      risk: "On the ISMP error-prone list: a handwritten ‘U’ is read as 0 or 4, so 4U becomes 40. Always write “unit”.",
    });
  }

  // Written-number hazards that do not depend on the abbreviation table.
  if (/\b\d+\.0\b/.test(text)) {
    safetyFlags.push({
      abbr: "Trailing zero",
      risk: "A trailing zero (‘1.0 mg’) is on the ISMP error-prone list — the decimal point is missed and the dose becomes ten times too big. Write ‘1 mg’.",
    });
  }
  if (/(^|\s)\.\d/.test(text)) {
    safetyFlags.push({
      abbr: "Naked decimal",
      risk: "A decimal with no leading zero (‘.5 mg’) is on the ISMP error-prone list. Write ‘0.5 mg’.",
    });
  }
  if (text.includes("@")) {
    safetyFlags.push({ abbr: "@", risk: "The ‘@’ symbol is on the ISMP error-prone list — it is read as the number 2. Write ‘at’." });
  }

  const uniqueFlags = [];
  const flagSeen = new Set();
  safetyFlags.forEach((flag) => {
    if (flagSeen.has(flag.abbr)) return;
    flagSeen.add(flag.abbr);
    uniqueFlags.push(flag);
  });

  const notes = [];
  if (matched.some((token) => token.match.abbr === "PRN")) {
    notes.push("This is a when-needed (PRN) item, so the totals below are the maximum if every dose is taken.");
  }
  if (dosesPerDay === null) {
    notes.push("No frequency abbreviation was recognised, so doses per day and totals cannot be worked out.");
  }
  if (durationDays === null) {
    notes.push("No course length was recognised. Add ‘5/7’ for five days, or ‘for 5 days’.");
  }

  return {
    input: text,
    tokens,
    decoded,
    matchedCount: decoded.length,
    unknownTokens,
    frequency: frequencyEntry || null,
    timing: timingEntry || null,
    route: routeEntry || null,
    form: formEntry || null,
    dosesPerDay,
    hoursBetweenDoses,
    durationDays,
    unitsPerDose,
    doseUnit,
    totalDoses,
    totalUnits,
    safetyFlags: uniqueFlags,
    notes,
  };
}
