/**
 * Decode a tyre's DOT code into a manufacture date and an age.
 *
 * Every tyre sold for road use carries a US DOT Tire Identification Number on
 * at least one sidewall. The LAST group of the TIN is the date code:
 *   - 4 digits (tyres built from 2000 onwards): WWYY - week then two-digit year.
 *   - 3 digits (tyres built before 2000): WWY - week then the last digit of the
 *     year, with no way to tell the decade from the code alone.
 * Everything before the date code identifies the plant, the size and the
 * manufacturer's optional characters; none of it carries a date.
 */

/** Milliseconds in a day. */
export const MS_PER_DAY = 86400000;

/** Mean Gregorian year, used to convert a day count into years. */
export const DAYS_PER_YEAR = 365.2425;

/** ISO weeks run 1-53; a 53rd week exists in long years. */
export const MAX_WEEK = 53;

/**
 * Many vehicle manufacturers ask for tyres over six years old to be inspected
 * annually, and most tyre manufacturers name ten years from the date of
 * manufacture as the absolute limit whatever the tread depth. Both figures are
 * guidance, not law — the legal test in most countries is tread depth and
 * condition (1.6 mm in India, the EU and the UK for car tyres).
 */
export const INSPECT_FROM_YEARS = 6;
export const REPLACE_BY_YEARS = 10;

/** Retailers generally treat a tyre older than this as shelf stock, not new. */
export const FRESH_STOCK_YEARS = 2;

/** The date-code group is the last 3 or 4 digits of the TIN. */
const DATE_CODE_RE = /(\d{3,4})\s*$/;

const round = (value, places) => {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
};

/** Parse a plain YYYY-MM-DD string into a UTC timestamp. Returns NaN if invalid. */
export function parseIsoDate(iso) {
  if (typeof iso !== "string") return NaN;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!match) return NaN;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return NaN;
  const stamp = Date.UTC(year, month - 1, day);
  const check = new Date(stamp);
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) {
    return NaN;
  }
  return stamp;
}

/** UTC timestamp -> YYYY-MM-DD. */
export function toIsoDate(stamp) {
  if (!Number.isFinite(stamp)) return null;
  return new Date(stamp).toISOString().slice(0, 10);
}

/**
 * First day of a given production week, approximated as
 * 1 January + (week - 1) x 7 days. Manufacturers number production weeks from
 * the start of the calendar year, so this lands within a day or two of the ISO
 * week and is the resolution the code itself carries.
 */
export function weekStartTimestamp(week, year) {
  return Date.UTC(year, 0, 1) + (week - 1) * 7 * MS_PER_DAY;
}

/**
 * Decode a DOT code.
 *
 * @param {string} rawCode full TIN ("DOT U2LL LMLR 5107") or just the date code ("5107")
 * @param {string} asOfIso reference date as YYYY-MM-DD — passed in so the maths stays pure
 */
export function decodeDotCode(rawCode, asOfIso) {
  if (typeof rawCode !== "string" || rawCode.trim() === "") {
    return { error: "Enter the DOT code from the tyre sidewall, for example DOT U2LL LMLR 5107." };
  }
  const asOf = parseIsoDate(asOfIso);
  if (!Number.isFinite(asOf)) {
    return { error: "Reference date must be a valid date in YYYY-MM-DD form." };
  }

  const normalised = rawCode.toUpperCase().replace(/\s+/g, " ").trim();
  const stripped = normalised.replace(/^DOT\s*/, "").trim();
  const match = DATE_CODE_RE.exec(stripped);
  if (!match) {
    return {
      error:
        "No date code found. The date is the last 3 or 4 digits of the DOT number, usually inside an oval on one sidewall.",
    };
  }

  const dateCode = match[1];
  const identifier = stripped.slice(0, stripped.length - match[0].length).trim();
  const asOfYear = new Date(asOf).getUTCFullYear();

  let week;
  let year;
  let isPre2000 = false;
  const warnings = [];

  if (dateCode.length === 4) {
    week = Number(dateCode.slice(0, 2));
    const yy = Number(dateCode.slice(2));
    year = 2000 + yy;
  } else {
    isPre2000 = true;
    week = Number(dateCode.slice(0, 2));
    const digit = Number(dateCode.slice(2));
    // A 3-digit code can only be from the 1990s or earlier; assume the 1990s,
    // which is the newest decade a 3-digit code can belong to.
    year = 1990 + digit;
    warnings.push(
      "This is a three-digit code, so the tyre was built before 2000. The code cannot tell you the decade — the 1990s is assumed, and the tyre is far past any service life either way.",
    );
  }

  if (!(week >= 1 && week <= MAX_WEEK)) {
    return { error: `Week ${dateCode.slice(0, 2)} is not valid — production weeks run from 01 to ${MAX_WEEK}.` };
  }

  const manufactureStamp = weekStartTimestamp(week, year);
  if (manufactureStamp > asOf) {
    return {
      error: `Week ${week} of ${year} is in the future relative to ${asOfIso}. Re-read the code, or check the reference date.`,
    };
  }

  const ageDays = Math.floor((asOf - manufactureStamp) / MS_PER_DAY);
  const ageYears = ageDays / DAYS_PER_YEAR;
  const ageWholeYears = Math.floor(ageYears);
  const ageMonths = Math.floor((ageYears - ageWholeYears) * 12);

  const yearsToInspect = INSPECT_FROM_YEARS - ageYears;
  const yearsToReplace = REPLACE_BY_YEARS - ageYears;

  let status;
  let statusLabel;
  let statusDetail;
  if (ageYears >= REPLACE_BY_YEARS) {
    status = "replace";
    statusLabel = "Past the 10-year limit";
    statusDetail = `At ${round(ageYears, 1)} years this tyre is beyond the ten-year maximum most tyre manufacturers publish. Replace it regardless of how much tread is left.`;
  } else if (ageYears >= INSPECT_FROM_YEARS) {
    status = "inspect";
    statusLabel = "Over 6 years — inspect annually";
    statusDetail = `At ${round(ageYears, 1)} years this tyre should be inspected by a professional every year, and replaced by ${round(yearsToReplace, 1)} years from now at the latest.`;
  } else if (ageYears >= FRESH_STOCK_YEARS) {
    status = "in-service";
    statusLabel = "In normal service life";
    statusDetail = `At ${round(ageYears, 1)} years this tyre is well inside its service life. Annual inspection becomes advisable in ${round(yearsToInspect, 1)} years.`;
  } else {
    status = "fresh";
    statusLabel = "Recent production";
    statusDetail = `At ${round(ageYears, 1)} years this is recent stock — the usual test for a tyre sold as new is under ${FRESH_STOCK_YEARS} years from manufacture.`;
  }

  if (status === "fresh" && ageYears >= 1) {
    warnings.push("Over a year of shelf age. That is normal and harmless if the tyre was stored properly, but it is fair to ask for a discount or a fresher date code.");
  }

  return {
    input: normalised,
    dateCode,
    identifier: identifier || null,
    plantCode: identifier ? identifier.replace(/\s/g, "").slice(0, 2) : null,
    sizeCode: identifier && identifier.replace(/\s/g, "").length >= 4 ? identifier.replace(/\s/g, "").slice(2, 4) : null,
    week,
    year,
    isPre2000,
    manufactureDateIso: toIsoDate(manufactureStamp),
    inspectDueIso: toIsoDate(manufactureStamp + INSPECT_FROM_YEARS * DAYS_PER_YEAR * MS_PER_DAY),
    replaceByIso: toIsoDate(manufactureStamp + REPLACE_BY_YEARS * DAYS_PER_YEAR * MS_PER_DAY),
    asOfIso,
    ageDays,
    ageYears: round(ageYears, 2),
    ageWholeYears,
    ageMonths,
    yearsToInspect: round(yearsToInspect, 2),
    yearsToReplace: round(yearsToReplace, 2),
    status,
    statusLabel,
    statusDetail,
    inspectFromYears: INSPECT_FROM_YEARS,
    replaceByYears: REPLACE_BY_YEARS,
    warnings,
  };
}
