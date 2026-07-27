/**
 * Indian vehicle registration number validation.
 *
 * Four families are recognised:
 *  1. Standard state series  — SS RR AA NNNN, in use since 1989.
 *  2. Bharat (BH) series     — YY BH NNNN AA, notified by GSR 594(E) of 26 August
 *                              2021 inserting Rule 48 in the Central Motor
 *                              Vehicles Rules, 1989. The two trailing letters run
 *                              from AA to ZZ excluding I and O.
 *  3. Diplomatic plates      — country code followed by CD, CC or UN.
 *  4. Defence plates         — Ministry of Defence series, an upward arrow, the
 *                              two-digit year of procurement, a class letter, a
 *                              six-digit serial and a check letter.
 *
 * Pure string work only — no network lookup, so a syntactically valid number is
 * not proof that the vehicle exists.
 */

/** Two-letter state and union territory codes used on registration plates. */
export const STATE_CODES = {
  AN: { name: "Andaman and Nicobar Islands", status: "current" },
  AP: { name: "Andhra Pradesh", status: "current" },
  AR: { name: "Arunachal Pradesh", status: "current" },
  AS: { name: "Assam", status: "current" },
  BR: { name: "Bihar", status: "current" },
  CG: { name: "Chhattisgarh", status: "current" },
  CH: { name: "Chandigarh", status: "current" },
  DD: { name: "Dadra and Nagar Haveli and Daman and Diu", status: "current" },
  DL: { name: "Delhi", status: "current" },
  DN: { name: "Dadra and Nagar Haveli (pre-2020 series)", status: "legacy" },
  GA: { name: "Goa", status: "current" },
  GJ: { name: "Gujarat", status: "current" },
  HP: { name: "Himachal Pradesh", status: "current" },
  HR: { name: "Haryana", status: "current" },
  JH: { name: "Jharkhand", status: "current" },
  JK: { name: "Jammu and Kashmir", status: "current" },
  KA: { name: "Karnataka", status: "current" },
  KL: { name: "Kerala", status: "current" },
  LA: { name: "Ladakh", status: "current" },
  LD: { name: "Lakshadweep", status: "current" },
  MH: { name: "Maharashtra", status: "current" },
  ML: { name: "Meghalaya", status: "current" },
  MN: { name: "Manipur", status: "current" },
  MP: { name: "Madhya Pradesh", status: "current" },
  MZ: { name: "Mizoram", status: "current" },
  NL: { name: "Nagaland", status: "current" },
  OD: { name: "Odisha", status: "current" },
  OR: { name: "Odisha (series used before the 2011 rename)", status: "legacy" },
  PB: { name: "Punjab", status: "current" },
  PY: { name: "Puducherry", status: "current" },
  RJ: { name: "Rajasthan", status: "current" },
  SK: { name: "Sikkim", status: "current" },
  TG: { name: "Telangana (series adopted from 2024)", status: "current" },
  TN: { name: "Tamil Nadu", status: "current" },
  TR: { name: "Tripura", status: "current" },
  TS: { name: "Telangana", status: "current" },
  UA: { name: "Uttarakhand (series used before the 2007 rename)", status: "legacy" },
  UK: { name: "Uttarakhand", status: "current" },
  UP: { name: "Uttar Pradesh", status: "current" },
  WB: { name: "West Bengal", status: "current" },
};

/** Diplomatic suffixes. */
export const DIPLOMATIC_CODES = {
  CD: "Corps Diplomatique — embassy vehicle",
  CC: "Consular Corps — consulate vehicle",
  UN: "United Nations mission vehicle",
};

/** The BH series was notified in 2021, so an earlier year is a red flag. */
export const BH_SERIES_FIRST_YEAR = 2021;

/** Source patterns, exported so they can be copied into your own validation layer. */
export const PATTERNS = {
  standard: "^([A-Z]{2})(\\d{1,2})([A-Z]{0,3})(\\d{1,4})$",
  bh: "^(\\d{2})BH(\\d{4})([A-HJ-NP-Z]{1,2})$",
  diplomatic: "^(\\d{1,3})(CD|CC|UN)(\\d{1,4})$",
  defence: "^(\\d{2})([A-Z])(\\d{6})([A-Z])$",
};

const RE = {
  standard: new RegExp(PATTERNS.standard),
  bh: new RegExp(PATTERNS.bh),
  diplomatic: new RegExp(PATTERNS.diplomatic),
  defence: new RegExp(PATTERNS.defence),
};

/** Strip spaces, hyphens, dots and the defence arrow; uppercase the rest. */
export function normalise(raw) {
  if (typeof raw !== "string") return "";
  // Anything that is not a letter or a digit goes: spaces, hyphens, dots and the
  // upward arrow that precedes a defence registration.
  return raw.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
}

const pad4 = (digits) => digits.padStart(4, "0");

function standardResult(compact) {
  const match = RE.standard.exec(compact);
  if (!match) return null;
  const [, state, rto, series, number] = match;
  const known = STATE_CODES[state];
  const notes = [];
  if (!known) {
    return {
      valid: false,
      format: "standard",
      formatLabel: "Standard state series",
      reason: `"${state}" is not a recognised state or union territory code.`,
      parts: { state, rto, series, number },
    };
  }
  if (known.status === "legacy") {
    notes.push(`${state} is a legacy code — ${known.name}.`);
  }
  if (number.length < 4) {
    notes.push(`The serial is normally printed as four digits, so ${number} appears as ${pad4(number)}.`);
  }
  if (series.length === 0) {
    notes.push("No letter series — that is an early plate from before the series letters were introduced.");
  }
  if (series.length === 3) {
    notes.push(
      "Three letters usually mean the first one is a vehicle class code, as Delhi does in DL 8C AF 5010.",
    );
  }
  return {
    valid: true,
    format: "standard",
    formatLabel: "Standard state series",
    stateName: known.name,
    parts: { state, rto, series, number: pad4(number) },
    canonical: [state, rto, series, pad4(number)].filter(Boolean).join(" "),
    compact: `${state}${rto}${series}${pad4(number)}`,
    explain: `${state} is ${known.name}, ${rto} is the registering RTO office code, ${
      series || "no"
    } series, serial ${pad4(number)}.`,
    notes,
  };
}

/** Same shape as the BH series but with any letters, used to give a precise error. */
const RE_BH_LOOSE = /^(\d{2})BH(\d{4})([A-Z]{1,2})$/;

function bhResult(compact) {
  const match = RE.bh.exec(compact);
  if (!match) {
    if (RE_BH_LOOSE.test(compact)) {
      return {
        valid: false,
        format: "bh",
        formatLabel: "Bharat (BH) series",
        reason:
          "The BH series letter block runs from AA to ZZ but leaves out I and O, so they cannot appear here.",
      };
    }
    return null;
  }
  const [, yy, number, series] = match;
  const year = 2000 + Number(yy);
  const notes = [];
  if (year < BH_SERIES_FIRST_YEAR) {
    notes.push(
      `The BH series was notified in ${BH_SERIES_FIRST_YEAR}, so a year of ${year} cannot be right.`,
    );
  }
  notes.push("The letters I and O are not used in the BH series, to avoid confusion with 1 and 0.");
  return {
    valid: true,
    format: "bh",
    formatLabel: "Bharat (BH) series",
    parts: { year: String(year), number, series },
    canonical: `${yy} BH ${number} ${series}`,
    compact: `${yy}BH${number}${series}`,
    explain: `Registered in ${year} under the Bharat series, serial ${number}, letter series ${series}. A BH number moves with the owner across states without re-registration.`,
    notes,
  };
}

function diplomaticResult(compact) {
  const match = RE.diplomatic.exec(compact);
  if (!match) return null;
  const [, country, code, number] = match;
  return {
    valid: true,
    format: "diplomatic",
    formatLabel: "Diplomatic plate",
    parts: { country, code, number },
    canonical: `${country} ${code} ${number}`,
    compact: `${country}${code}${number}`,
    explain: `${DIPLOMATIC_CODES[code]}. ${country} is the country code allotted by the Ministry of External Affairs and ${number} is the vehicle serial.`,
    notes: ["Diplomatic plates are issued centrally, so there is no state code."],
  };
}

function defenceResult(compact) {
  const match = RE.defence.exec(compact);
  if (!match) return null;
  const [, year, klass, serial, check] = match;
  return {
    valid: true,
    format: "defence",
    formatLabel: "Ministry of Defence series",
    parts: { year: `20${year}`, class: klass, serial, check },
    canonical: `↑${year}${klass} ${serial}${check}`,
    compact: `${year}${klass}${serial}${check}`,
    explain: `Defence registration: ${year} is the year of procurement, ${klass} is the class of vehicle, ${serial} is the serial and ${check} is the check letter. The plate carries an upward arrow before the number.`,
    notes: ["Defence plates are registered by the Ministry of Defence, not by a state RTO."],
  };
}

/**
 * Validate one registration number.
 * @param {string} raw as typed, with or without spaces
 */
export function validatePlate(raw) {
  if (typeof raw !== "string" || raw.trim() === "") {
    return { valid: false, input: "", reason: "Enter a registration number to check." };
  }
  const compact = normalise(raw);
  if (compact.length === 0) {
    return { valid: false, input: raw, reason: "Nothing left after removing punctuation." };
  }
  if (compact.length > 12) {
    return {
      valid: false,
      input: raw,
      compact,
      reason: "No Indian registration format is longer than 11 characters.",
    };
  }

  const outcome =
    bhResult(compact) ||
    diplomaticResult(compact) ||
    defenceResult(compact) ||
    standardResult(compact);

  if (!outcome) {
    return {
      valid: false,
      input: raw,
      compact,
      reason:
        "Does not match the standard state series, the BH series, a diplomatic plate or a defence plate.",
    };
  }
  return { input: raw, compact, ...outcome };
}

/**
 * Validate a list of numbers, one per line.
 * @param {string} text
 * @returns {{results: Array, total: number, validCount: number, invalidCount: number}|{error: string}}
 */
export function validatePlates(text) {
  if (typeof text !== "string") return { error: "Paste one registration number per line." };
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  if (lines.length === 0) return { error: "Paste one registration number per line." };
  if (lines.length > 500) return { error: "Check up to 500 numbers at a time." };

  const results = lines.map((line, index) => ({ index, ...validatePlate(line) }));
  const validCount = results.filter((row) => row.valid).length;
  return {
    results,
    total: results.length,
    validCount,
    invalidCount: results.length - validCount,
  };
}
