/**
 * Rupee amounts moved between years using India's consumer price index.
 *
 * Data
 *  - The figures below are the annual average all-India Consumer Price Index (Combined) inflation
 *    rates published by the Ministry of Statistics and Programme Implementation and reproduced in
 *    the RBI Annual Report, stated per financial year (April to March) and rounded to one decimal.
 *  - The CPI (Combined) series on base 2012 = 100 is the first single consistent all-India index
 *    covering both rural and urban households, which is why the series here starts at FY 2011-12
 *    and not earlier. For years before that, only CPI-IW, CPI-AL or the GDP deflator exist, and
 *    they are not directly comparable, so this tool asks for an assumed rate instead of splicing
 *    incompatible indices.
 *  - MoSPI revises figures, so a published rate can move by about a tenth of a percentage point.
 *
 * Method
 *  - An index is chained from a base of 100 at the start of FY 2011-12:
 *      index(y) = index(y-1) x (1 + inflation(y))
 *  - Converting an amount from year a to year b is index(b) / index(a) x amount. Running it the
 *    other way round deflates instead, which is exactly the same arithmetic.
 *  - The average annual rate over the span is the compound rate, (index(b)/index(a))^(1/n) - 1,
 *    not the arithmetic mean of the yearly rates.
 */

/** Base year of the chained index — the start of FY 2011-12, set to 100. */
export const BASE_FY = 2011;

/**
 * Annual average CPI (Combined) inflation, per cent, keyed by the financial year's START year.
 * 2012 means FY 2012-13.
 */
export const CPI_INFLATION_PCT = {
  2012: 10.2,
  2013: 9.4,
  2014: 5.9,
  2015: 4.9,
  2016: 4.5,
  2017: 3.6,
  2018: 3.4,
  2019: 4.8,
  2020: 6.2,
  2021: 5.5,
  2022: 6.7,
  2023: 5.4,
  2024: 4.6,
};

/** Last financial year covered by the official series above. */
export const SERIES_END_FY = 2024;

/** How far past the official series a projection is allowed to run. */
export const MAX_PROJECTION_YEARS = 30;

/** RBI's flexible inflation targeting mandate under section 45ZA of the RBI Act. */
export const RBI_TARGET_PCT = 4;
export const RBI_TOLERANCE_PCT = 2;

/** Label a financial year from its start year: 2019 becomes "2019-20". */
export function fyLabel(startYear) {
  if (!Number.isInteger(startYear)) return "";
  const end = String((startYear + 1) % 100).padStart(2, "0");
  return `${startYear}-${end}`;
}

/** Every financial year the official series covers, oldest first. */
export function officialYears() {
  const years = [BASE_FY];
  for (let year = BASE_FY + 1; year <= SERIES_END_FY; year += 1) years.push(year);
  return years;
}

function isNum(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function round2(value) {
  return Math.round(value * 100) / 100;
}

/**
 * Chain the index out to `untilYear`. Years past SERIES_END_FY use `assumedRatePct`.
 * Returns a Map-like object keyed by financial year start.
 */
export function buildIndex(untilYear, assumedRatePct) {
  const index = { [BASE_FY]: 100 };
  const limit = Math.max(SERIES_END_FY, untilYear);
  for (let year = BASE_FY + 1; year <= limit; year += 1) {
    const rate =
      year <= SERIES_END_FY ? CPI_INFLATION_PCT[year] : assumedRatePct;
    index[year] = index[year - 1] * (1 + rate / 100);
  }
  return index;
}

/**
 * Move an amount from one financial year to another.
 *
 * @param {object} input
 * @param {number} input.amount           Rupee amount in `fromYear` money.
 * @param {number} input.fromYear         Financial year start, e.g. 2014 for FY 2014-15.
 * @param {number} input.toYear           Financial year start to convert into.
 * @param {number} input.assumedRatePct   Rate applied to any year past the official series.
 */
export function adjustForInflation({
  amount = 1000,
  fromYear = BASE_FY,
  toYear = SERIES_END_FY,
  assumedRatePct = RBI_TARGET_PCT,
}) {
  if (!isNum(amount) || amount <= 0) {
    return { error: "Enter a rupee amount greater than zero." };
  }
  if (!Number.isInteger(fromYear) || !Number.isInteger(toYear)) {
    return { error: "Both years must be whole financial years." };
  }
  const maxYear = SERIES_END_FY + MAX_PROJECTION_YEARS;
  if (fromYear < BASE_FY || toYear < BASE_FY) {
    return {
      error: `The official CPI (Combined) series starts at FY ${fyLabel(BASE_FY)}. Earlier years used a different index that cannot be spliced on.`,
    };
  }
  if (fromYear > maxYear || toYear > maxYear) {
    return { error: `Projections stop at FY ${fyLabel(maxYear)}.` };
  }

  const needsAssumption = Math.max(fromYear, toYear) > SERIES_END_FY;
  if (needsAssumption && (!isNum(assumedRatePct) || assumedRatePct < 0 || assumedRatePct > 50)) {
    return {
      error: "Years past the published series need an assumed inflation rate between 0 and 50 per cent.",
    };
  }

  const index = buildIndex(Math.max(fromYear, toYear), assumedRatePct);
  const fromIndex = index[fromYear];
  const toIndex = index[toYear];
  const ratio = toIndex / fromIndex;
  const adjusted = amount * ratio;

  const span = toYear - fromYear;

  // Walk the years that were actually crossed, for the table.
  const first = Math.min(fromYear, toYear);
  const last = Math.max(fromYear, toYear);

  // Inflation between the two years is a property of the years, not of the direction of travel,
  // so it is always measured from the earlier year to the later one.
  const forwardRatio = index[last] / index[first];
  const averageAnnualPct =
    span === 0 ? 0 : (Math.pow(forwardRatio, 1 / Math.abs(span)) - 1) * 100;

  const walk = [];
  for (let year = first; year <= last; year += 1) {
    const rate =
      year === BASE_FY
        ? null
        : year <= SERIES_END_FY
          ? CPI_INFLATION_PCT[year]
          : assumedRatePct;
    walk.push({
      year,
      label: fyLabel(year),
      inflationPct: rate === null ? null : round2(rate),
      projected: year > SERIES_END_FY,
      value: round2(amount * (index[year] / fromIndex)),
      index: round2(index[year]),
    });
  }

  return {
    amount: round2(amount),
    fromYear,
    toYear,
    fromLabel: fyLabel(fromYear),
    toLabel: fyLabel(toYear),
    adjustedAmount: round2(adjusted),
    ratio: Math.round(ratio * 10000) / 10000,
    totalInflationPct: round2((forwardRatio - 1) * 100),
    averageAnnualPct: round2(averageAnnualPct),
    years: Math.abs(span),
    direction: span > 0 ? "forward" : span < 0 ? "backward" : "same",
    earlierLabel: fyLabel(first),
    laterLabel: fyLabel(last),
    // What one rupee of the EARLIER year buys once restated in later-year money.
    purchasingPowerOfOneRupee: Math.round((1 / forwardRatio) * 10000) / 10000,
    purchasingPowerLostPct: round2((1 - 1 / forwardRatio) * 100),
    usesProjection: needsAssumption,
    assumedRatePct: needsAssumption ? round2(assumedRatePct) : null,
    fromIndex: round2(fromIndex),
    toIndex: round2(toIndex),
    walk,
  };
}
