/**
 * Compound growth of a lump sum plus regular monthly contributions, charted against the same
 * money earning simple interest.
 *
 * Formulas
 *  - Effective annual rate for a nominal rate r compounded m times a year:
 *      EAR = (1 + r/m)^m - 1
 *  - The equivalent monthly growth factor is (1 + r/m)^(m/12), so the monthly effective rate is
 *      i = (1 + r/m)^(m/12) - 1
 *    Working month by month lets a monthly contribution sit correctly inside any compounding
 *    frequency, and reduces to the closed forms:
 *      lump sum      A = P (1 + r/m)^(m t)
 *      ordinary SIP  A = PMT [ ((1+i)^n - 1) / i ]
 *  - Simple interest earns on deposits only and never on accrued interest, so each month adds
 *      deposits_so_far x r / 12
 *    That is the textbook A = P (1 + r t) for a lump sum.
 *  - Exact doubling time at the effective annual rate: ln 2 / ln(1 + EAR). The rule of 72
 *    approximation, 72 / rate in per cent, is reported alongside it.
 */

/** Months in a year — the contribution and simple-interest accrual step. */
export const MONTHS_PER_YEAR = 12;

/** The rule of 72 numerator, used for the quick doubling-period estimate. */
export const RULE_OF_72 = 72;

/** Compounding frequencies offered, as compounds per year. */
export const COMPOUNDING_OPTIONS = [
  { value: 1, label: "Annually" },
  { value: 2, label: "Half-yearly" },
  { value: 4, label: "Quarterly" },
  { value: 12, label: "Monthly" },
  { value: 365, label: "Daily" },
];

/** Guard rails so a typo cannot produce a meaningless chart. */
export const MAX_YEARS = 60;
export const MAX_RATE_PCT = 100;

function isNum(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function round2(value) {
  return Math.round(value * 100) / 100;
}

/**
 * Build the year-by-year growth series.
 *
 * @param {object} input
 * @param {number} input.principal            Lump sum invested today.
 * @param {number} input.monthlyContribution  Added every month.
 * @param {number} input.annualRatePct        Nominal annual rate, in per cent.
 * @param {number} input.years                Whole years to project, 1 to MAX_YEARS.
 * @param {number} input.compoundsPerYear     One of COMPOUNDING_OPTIONS values.
 * @param {"end"|"start"} input.contributionTiming When in the month the contribution lands.
 */
export function buildGrowthSeries({
  principal = 100000,
  monthlyContribution = 0,
  annualRatePct = 10,
  years = 20,
  compoundsPerYear = 1,
  contributionTiming = "end",
}) {
  if (!isNum(principal) || principal < 0) {
    return { error: "The starting amount must be zero or more." };
  }
  if (!isNum(monthlyContribution) || monthlyContribution < 0) {
    return { error: "The monthly contribution must be zero or more." };
  }
  if (principal === 0 && monthlyContribution === 0) {
    return { error: "Enter a starting amount or a monthly contribution — otherwise there is nothing to grow." };
  }
  if (!isNum(annualRatePct) || annualRatePct < 0 || annualRatePct > MAX_RATE_PCT) {
    return { error: `The annual return must be between 0 and ${MAX_RATE_PCT} per cent.` };
  }
  if (!isNum(years) || !Number.isInteger(years) || years < 1 || years > MAX_YEARS) {
    return { error: `The period must be a whole number of years between 1 and ${MAX_YEARS}.` };
  }
  if (!isNum(compoundsPerYear) || compoundsPerYear < 1) {
    return { error: "Choose a valid compounding frequency." };
  }
  if (contributionTiming !== "end" && contributionTiming !== "start") {
    return { error: "Choose whether the contribution goes in at the start or the end of the month." };
  }

  const r = annualRatePct / 100;
  const effectiveAnnualRate = Math.pow(1 + r / compoundsPerYear, compoundsPerYear) - 1;
  const monthlyRate = Math.pow(1 + r / compoundsPerYear, compoundsPerYear / MONTHS_PER_YEAR) - 1;
  const simpleMonthlyRate = r / MONTHS_PER_YEAR;

  let balance = principal;
  let deposits = principal;
  let simpleInterest = 0;

  const series = [
    {
      year: 0,
      balance: round2(principal),
      contributed: round2(principal),
      interest: 0,
      simpleBalance: round2(principal),
      simpleInterest: 0,
    },
  ];

  for (let year = 1; year <= years; year += 1) {
    for (let month = 0; month < MONTHS_PER_YEAR; month += 1) {
      if (contributionTiming === "start") {
        balance += monthlyContribution;
        deposits += monthlyContribution;
      }
      // Simple interest accrues on deposits only, never on interest already earned.
      simpleInterest += deposits * simpleMonthlyRate;
      balance *= 1 + monthlyRate;
      if (contributionTiming === "end") {
        balance += monthlyContribution;
        deposits += monthlyContribution;
      }
    }
    series.push({
      year,
      balance: round2(balance),
      contributed: round2(deposits),
      interest: round2(balance - deposits),
      simpleBalance: round2(deposits + simpleInterest),
      simpleInterest: round2(simpleInterest),
    });
  }

  const last = series[series.length - 1];
  const doublingYearsExact =
    effectiveAnnualRate > 0 ? Math.log(2) / Math.log(1 + effectiveAnnualRate) : null;
  const doublingYearsRule72 = annualRatePct > 0 ? RULE_OF_72 / annualRatePct : null;

  // Which year does interest earned overtake money paid in?
  const crossoverYear =
    series.find((row) => row.year > 0 && row.interest > row.contributed)?.year ?? null;

  // How much of the final balance is interest earned on interest?
  const interestOnInterest = round2(last.balance - last.simpleBalance);

  return {
    series,
    years,
    finalBalance: last.balance,
    totalContributed: last.contributed,
    totalInterest: last.interest,
    simpleFinalBalance: last.simpleBalance,
    simpleTotalInterest: last.simpleInterest,
    interestOnInterest,
    interestShareOfFinalPct:
      last.balance > 0 ? round2((last.interest / last.balance) * 100) : 0,
    effectiveAnnualRatePct: round2(effectiveAnnualRate * 100),
    nominalRatePct: round2(annualRatePct),
    doublingYearsExact: doublingYearsExact === null ? null : round2(doublingYearsExact),
    doublingYearsRule72: doublingYearsRule72 === null ? null : round2(doublingYearsRule72),
    crossoverYear,
    maxBalance: last.balance,
  };
}

/**
 * Thin a long series down to at most `maxRows` rows for a readable table, always keeping
 * year zero and the final year.
 */
export function sampleSeries(series, maxRows = 13) {
  if (!Array.isArray(series) || series.length === 0) return [];
  if (!Number.isInteger(maxRows) || maxRows < 2) return series;
  if (series.length <= maxRows) return series.slice();
  const lastYear = series[series.length - 1].year;
  const step = Math.ceil(series.length / maxRows);
  return series.filter((row) => row.year === 0 || row.year === lastYear || row.year % step === 0);
}

/**
 * Turn a series into SVG path data. Pure arithmetic, no DOM — the component only prints it.
 *
 * @param {Array} series      Output of buildGrowthSeries().series
 * @param {object} box        { width, height, padLeft, padRight, padTop, padBottom }
 */
export function toChartGeometry(series, box) {
  const { width, height, padLeft, padRight, padTop, padBottom } = box;
  if (!Array.isArray(series) || series.length < 2) {
    return { error: "Need at least two points to draw a chart." };
  }
  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;
  if (!(plotWidth > 0) || !(plotHeight > 0)) {
    return { error: "The chart area is too small to draw." };
  }

  const lastYear = series[series.length - 1].year;
  const peak = series.reduce((max, row) => Math.max(max, row.balance, row.simpleBalance), 0);
  // A flat zero series would divide by zero; fall back to a nominal scale of 1.
  const scaleMax = peak > 0 ? peak : 1;
  const spanYears = lastYear > 0 ? lastYear : 1;

  const x = (year) => padLeft + (year / spanYears) * plotWidth;
  const y = (value) => padTop + plotHeight - (value / scaleMax) * plotHeight;

  const line = (key) =>
    series.map((row, index) => `${index === 0 ? "M" : "L"}${round2(x(row.year))},${round2(y(row[key]))}`).join(" ");

  const compoundLine = line("balance");
  const simpleLine = line("simpleBalance");
  const contributedLine = line("contributed");

  const area =
    `${compoundLine} L${round2(x(lastYear))},${round2(y(0))} L${round2(x(0))},${round2(y(0))} Z`;

  // Four gridlines plus the baseline.
  const gridValues = [0, 0.25, 0.5, 0.75, 1].map((fraction) => round2(scaleMax * fraction));
  const gridLines = gridValues.map((value) => ({ value, y: round2(y(value)) }));

  // Label at most 7 years so the axis stays readable on a 375px screen.
  const step = Math.max(1, Math.ceil(lastYear / 6));
  const xTicks = [];
  for (let year = 0; year <= lastYear; year += step) {
    xTicks.push({ year, x: round2(x(year)) });
  }
  if (xTicks[xTicks.length - 1].year !== lastYear) {
    xTicks.push({ year: lastYear, x: round2(x(lastYear)) });
  }

  return {
    compoundLine,
    simpleLine,
    contributedLine,
    area,
    gridLines,
    xTicks,
    scaleMax: round2(scaleMax),
    points: series.map((row) => ({
      year: row.year,
      x: round2(x(row.year)),
      y: round2(y(row.balance)),
      balance: row.balance,
      simpleBalance: row.simpleBalance,
      contributed: row.contributed,
      interest: row.interest,
    })),
  };
}
