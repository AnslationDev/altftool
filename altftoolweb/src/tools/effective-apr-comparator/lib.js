/**
 * Effective APR Comparator — pure calculation layer.
 *
 * WHAT THIS COMPUTES AND WHICH RULE PRODUCES IT
 * ---------------------------------------------
 * RBI circular RBI/2024-25/18, DOR.STR.REC.13/13.03.00/2024-25 dated 15 April 2024,
 * "Key Facts Statement (KFS) for Loans & Advances" (in force for all new retail and MSME
 * term loans sanctioned on or after 1 October 2024). Text read 2026-07-29.
 *
 *   para 3(c): "Annual Percentage Rate (APR) is the annual cost of credit to the borrower
 *               which includes interest rate and all other charges associated with the
 *               credit facility."
 *   para 6:    "APR will include all charges which are levied by the RE."
 *   para 7:    charges recovered from borrowers by the RE on behalf of third-party service
 *               providers on actual basis, "such as insurance charges, legal charges etc.",
 *               shall also form part of the APR.
 *   Annex B row 7:  Net disbursed amount = sanctioned loan amount MINUS all fees/charges
 *               payable (both those payable to the RE and those payable to a third party
 *               routed through the RE).
 *   Annex B footnote 10: the APR is "Computed on net disbursed amount using IRR approach
 *               and reducing balance method".
 *
 * So the headline APR here is: solve for the monthly internal rate of return of the actual
 * cash-flow series (net disbursed amount received at t=0, instalments paid thereafter, plus
 * any foreclosure payoff), then multiply by 12. That nominal annualisation is what reproduces
 * the RBI's own Annex B illustration (20,000 sanctioned, 24 EMIs of 970, 400 of fees,
 * net disbursed 19,600 -> APR 17.10%), and that case is covered by the regression test in
 * lib.test.mjs.
 *
 * The annually-compounded equivalent, ((1 + monthly IRR) ^ 12) - 1, is reported alongside it.
 * That is the form used by EU Directive 2008/48/EC (Consumer Credit Directive) Annex I, whose
 * basic equation is the same IRR identity: the discounted sum of drawdowns equals the
 * discounted sum of repayments and charges.
 *
 * No advice is produced anywhere in this file. It states amounts, rates and rankings only.
 */

/** Monthly instalments per year. */
export const MONTHS_PER_YEAR = 12;

/**
 * GST on fee-based financial services (SAC heading 9971), Notification No. 11/2017-Central
 * Tax (Rate) dated 28 June 2017: 18%. Loan interest itself is exempt, but processing fees,
 * documentation/legal charges and foreclosure/prepayment charges are taxable supplies at 18%.
 * Unchanged by the September 2025 GST rate rationalisation. Checked 2026-07-29.
 */
export const DEFAULT_GST_ON_FEES_PCT = 18;

/**
 * Bisection bracket for the periodic IRR.
 * Lower: -99.99% per month, the practical floor above the -100% pole of (1 + r).
 * Upper: +1000% per month, far above any quoted retail credit product.
 */
export const IRR_LOWER_BOUND = -0.9999;
export const IRR_UPPER_BOUND = 10;

/**
 * Convergence tolerance. Bisection stops when the bracket is narrower than 1e-12 in the
 * MONTHLY rate, i.e. below 1.2e-10 percentage points once annualised — far finer than the
 * two decimal places any lender quotes. 300 iterations is a hard ceiling; plain bisection
 * over the bracket above needs about 44 halvings to reach 1e-12, so the ceiling is never hit
 * in practice and exists only to make non-convergence impossible to hang on.
 */
export const IRR_RATE_TOLERANCE = 1e-12;
export const IRR_MAX_ITERATIONS = 300;

/** Input sanity ceilings. Anything past these is a typo, not a loan. */
export const MAX_OFFERS = 6;
export const MIN_OFFERS = 2;
export const MAX_TENURE_MONTHS = 600;
export const MAX_PRINCIPAL = 1e11;
export const MAX_RATE_PCT = 200;
export const MAX_PROCESSING_FEE_PCT = 15;
export const MAX_FORECLOSURE_PENALTY_PCT = 20;
export const MAX_GST_PCT = 50;

/**
 * RBI (Pre-payment Charges on Loans) Directions, 2025, issued 2 July 2025, applicable to all
 * loans sanctioned or renewed on or after 1 January 2026. Read 2026-07-29. Under them a
 * regulated entity may not levy pre-payment or foreclosure charges on a FLOATING rate loan
 * given to an individual for a non-business purpose, irrespective of the amount, whether there
 * is a co-obligant or not, whether the repayment is full or partial and whatever the source of
 * funds; and no minimum lock-in period may be imposed on such loans. Fixed-rate loans remain
 * outside that bar and may carry pre-payment charges under the lender's board-approved policy.
 */
export const FLOATING_RATE_PREPAYMENT_RULE =
  "RBI (Pre-payment Charges on Loans) Directions, 2025 (issued 2 July 2025, applicable to loans sanctioned or renewed on or after 1 January 2026) bar pre-payment and foreclosure charges on floating rate loans to individuals for non-business purposes, and bar any lock-in period on them. This offer is entered as floating rate and still carries a foreclosure penalty.";

const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;
const round6 = (value) => Math.round((value + Number.EPSILON) * 1e6) / 1e6;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

const toNum = (value) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : NaN;
  if (typeof value === "string") {
    const cleaned = value.replace(/[,\s₹]/g, "");
    if (cleaned === "") return NaN;
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : NaN;
  }
  return NaN;
};

/**
 * Net present value of a cash-flow series at a per-period rate.
 * cashFlows[0] is the flow at t=0 and is NOT discounted.
 */
export function netPresentValue(rate, cashFlows) {
  if (!Array.isArray(cashFlows) || cashFlows.length === 0) return NaN;
  if (!isNum(rate) || rate <= -1) return NaN;
  let total = 0;
  let discount = 1;
  for (let t = 0; t < cashFlows.length; t += 1) {
    total += cashFlows[t] / discount;
    discount *= 1 + rate;
  }
  return total;
}

/**
 * Periodic IRR by bisection on a bracketed interval.
 *
 * For a conventional loan the series has exactly one sign change (a single positive inflow at
 * t=0 followed by negative outflows), so by Descartes' rule of signs there is at most one
 * positive real root, and NPV(r) is strictly increasing in r on (-1, inf): it tends to
 * -infinity as r approaches -1 from above and to cashFlows[0] > 0 as r grows. Bisection on
 * that monotone, sign-changing function converges unconditionally — no derivative, no seed
 * guess, no divergence, which is why it is used here in preference to Newton.
 *
 * @returns {number|null} rate per period, or null if the series is not bracketable.
 */
export function solveIrr(cashFlows) {
  if (!Array.isArray(cashFlows) || cashFlows.length < 2) return null;
  if (!cashFlows.every(isNum)) return null;

  const hasPositive = cashFlows.some((flow) => flow > 0);
  const hasNegative = cashFlows.some((flow) => flow < 0);
  if (!hasPositive || !hasNegative) return null;

  let lo = IRR_LOWER_BOUND;
  let hi = IRR_UPPER_BOUND;
  let npvLo = netPresentValue(lo, cashFlows);
  let npvHi = netPresentValue(hi, cashFlows);

  if (!isNum(npvLo) || !isNum(npvHi)) return null;
  if (npvLo === 0) return lo;
  if (npvHi === 0) return hi;
  if (npvLo > 0 === npvHi > 0) return null;

  let mid = lo;
  for (let i = 0; i < IRR_MAX_ITERATIONS; i += 1) {
    mid = (lo + hi) / 2;
    const npvMid = netPresentValue(mid, cashFlows);
    if (!isNum(npvMid)) return null;
    if (npvMid === 0) return mid;
    if (npvMid > 0 === npvLo > 0) {
      lo = mid;
      npvLo = npvMid;
    } else {
      hi = mid;
      npvHi = npvMid;
    }
    if (hi - lo < IRR_RATE_TOLERANCE) break;
  }
  return (lo + hi) / 2;
}

/**
 * Reducing-balance EMI. Standard annuity formula
 *   EMI = P * i * (1+i)^n / ((1+i)^n - 1),  i = annual nominal rate / 12.
 * At i = 0 the annuity formula is 0/0, so the limit P/n is used.
 */
export function emiForReducingRate(principal, annualRatePct, tenureMonths) {
  if (!isNum(principal) || !isNum(annualRatePct) || !isNum(tenureMonths)) return NaN;
  if (principal <= 0 || tenureMonths <= 0) return NaN;
  const i = annualRatePct / 100 / MONTHS_PER_YEAR;
  if (i === 0) return principal / tenureMonths;
  const growth = Math.pow(1 + i, tenureMonths);
  const denominator = growth - 1;
  if (denominator === 0) return principal / tenureMonths;
  return (principal * i * growth) / denominator;
}

/**
 * Flat-rate total interest and EMI, in one place. Interest is charged on the ORIGINAL principal
 * for the whole tenure and never reduces as the loan is repaid:
 *   total interest = P * flat rate * (months / 12);  EMI = (P + total interest) / months.
 *
 * This is the single source of truth for that formula: emiForFlatRate, buildSchedule (for
 * rateType "flat") and flatToReducing all derive their EMI and total-interest figures from it,
 * rather than each re-deriving the arithmetic inline.
 */
function flatRateInterestAndEmi(principal, annualFlatRatePct, tenureMonths) {
  const totalInterest = (principal * annualFlatRatePct * tenureMonths) / (100 * MONTHS_PER_YEAR);
  const emi = (principal + totalInterest) / tenureMonths;
  return { totalInterest, emi };
}

export function emiForFlatRate(principal, annualFlatRatePct, tenureMonths) {
  if (!isNum(principal) || !isNum(annualFlatRatePct) || !isNum(tenureMonths)) return NaN;
  if (principal <= 0 || tenureMonths <= 0) return NaN;
  return flatRateInterestAndEmi(principal, annualFlatRatePct, tenureMonths).emi;
}

/**
 * The flat-versus-reducing gap, stated exactly.
 *
 * The reducing-balance equivalent is the rate r for which the reducing-balance annuity on the
 * same principal and tenure produces the same instalment as the flat quote. That is the IRR of
 * (principal in, EMI out x n), annualised by x12 — fees excluded, so this isolates the rate
 * restatement alone.
 *
 * Also returned is the classical closed-form approximation, flat x 2n/(n+1). Its derivation:
 * under straight-line amortisation the balance outstanding at the start of instalment k is
 * P(n-k+1)/n, so the average balance over the n instalments is P(n+1)/(2n). Charging flat
 * interest of P*f*(n/12) against that average balance for n/12 years gives an effective rate of
 * f * 2n/(n+1). It overstates the true IRR because it ignores the timing of the payments; the
 * IRR figure is the one to use.
 */
export function flatToReducing(principal, annualFlatRatePct, tenureMonths) {
  if (!isNum(principal) || principal <= 0) return { error: "Loan amount must be greater than zero." };
  if (!isNum(annualFlatRatePct) || annualFlatRatePct < 0) {
    return { error: "Flat rate must be zero or more." };
  }
  if (!isNum(tenureMonths) || tenureMonths < 1) return { error: "Tenure must be at least one month." };

  const n = Math.round(tenureMonths);
  const { totalInterest, emi } = flatRateInterestAndEmi(principal, annualFlatRatePct, n);
  const flows = [principal];
  for (let k = 0; k < n; k += 1) flows.push(-emi);
  const monthlyIrr = solveIrr(flows);
  if (monthlyIrr === null) {
    return { error: "Those flat-rate terms do not produce a solvable repayment series." };
  }
  const reducingNominalAnnualPct = monthlyIrr * MONTHS_PER_YEAR * 100;
  return {
    emi: round2(emi),
    totalInterest: round2(totalInterest),
    reducingNominalAnnualPct: round6(reducingNominalAnnualPct),
    reducingEffectiveAnnualPct: round6((Math.pow(1 + monthlyIrr, MONTHS_PER_YEAR) - 1) * 100),
    multiple: annualFlatRatePct > 0 ? round6(reducingNominalAnnualPct / annualFlatRatePct) : null,
    ruleOfThumbMultiple: round6((2 * n) / (n + 1)),
  };
}

/**
 * Amortisation schedule.
 *
 * Reducing balance: interest = opening balance x monthly rate; principal = EMI - interest.
 * The final instalment is trued up so the closing balance is exactly zero.
 *
 * Flat rate: a flat-rate contract has no true reducing balance, so the payoff on early closure
 * is whatever the contract says it is. Two conventions are supported, because the choice moves
 * the effective rate by whole percentage points:
 *
 *   "straight-line" — each instalment retires principal/n of principal and totalInterest/n of
 *     interest, so principal outstanding after k instalments is P(n-k)/n and interest for the
 *     unexpired months is simply not charged. This is what a plain flat-rate statement shows.
 *
 *   "rule-of-78" — the sum-of-the-digits rebate, named for 1+2+...+12 = 78 in a 12-month loan.
 *     Interest is earned in proportion to the months remaining, so instalment j carries
 *     interest of totalInterest * 2(n-j+1) / (n(n+1)), and the unearned interest rebated on
 *     closing after k instalments is totalInterest * (n-k)(n-k+1) / (n(n+1)). The payoff is
 *     then EMI*(n-k) minus that rebate, which is identically P - sum of principal repaid, and
 *     is HIGHER than the straight-line payoff at every point before the final instalment
 *     because interest is front-loaded.
 */
export function buildSchedule({
  financedPrincipal,
  rateType,
  nominalRatePct,
  tenureMonths,
  flatPayoffBasis = "straight-line",
}) {
  const n = Math.round(tenureMonths);
  const rows = [];

  if (rateType === "flat") {
    const { totalInterest, emi } = flatRateInterestAndEmi(financedPrincipal, nominalRatePct, n);
    const digitSum = (n * (n + 1)) / 2;
    let balance = financedPrincipal;
    for (let month = 1; month <= n; month += 1) {
      const interest =
        flatPayoffBasis === "rule-of-78"
          ? (totalInterest * (n - month + 1)) / digitSum
          : totalInterest / n;
      const principalPaid = month === n ? balance : emi - interest;
      const closing = month === n ? 0 : balance - principalPaid;
      rows.push({
        month,
        openingBalance: balance,
        interest,
        principal: principalPaid,
        instalment: month === n ? principalPaid + interest : emi,
        closingBalance: closing < 1e-8 ? 0 : closing,
      });
      balance = closing < 1e-8 ? 0 : closing;
    }
    return rows;
  }

  const i = nominalRatePct / 100 / MONTHS_PER_YEAR;
  const emi = emiForReducingRate(financedPrincipal, nominalRatePct, n);
  let balance = financedPrincipal;
  for (let month = 1; month <= n; month += 1) {
    const interest = balance * i;
    let principalPaid = emi - interest;
    let instalment = emi;
    if (month === n || principalPaid >= balance) {
      principalPaid = balance;
      instalment = balance + interest;
    }
    const closing = balance - principalPaid;
    rows.push({
      month,
      openingBalance: balance,
      interest,
      principal: principalPaid,
      instalment,
      closingBalance: closing < 1e-8 ? 0 : closing,
    });
    balance = closing < 1e-8 ? 0 : closing;
  }
  return rows;
}

function normaliseOffer(raw, index) {
  const label = typeof raw?.label === "string" && raw.label.trim() ? raw.label.trim() : `Offer ${index + 1}`;

  const principal = toNum(raw?.principal);
  if (Number.isNaN(principal)) return { error: `${label}: enter the loan amount.` };
  if (principal <= 0) return { error: `${label}: loan amount must be greater than zero.` };
  if (principal > MAX_PRINCIPAL) {
    return { error: `${label}: loan amount above ${MAX_PRINCIPAL.toExponential()} is out of range.` };
  }

  const tenureMonthsRaw = toNum(raw?.tenureMonths);
  if (Number.isNaN(tenureMonthsRaw)) return { error: `${label}: enter the tenure in months.` };
  const tenureMonths = Math.round(tenureMonthsRaw);
  if (tenureMonths < 1) return { error: `${label}: tenure must be at least one month.` };
  if (tenureMonths > MAX_TENURE_MONTHS) {
    return { error: `${label}: tenure above ${MAX_TENURE_MONTHS} months (50 years) is out of range.` };
  }

  const nominalRatePct = toNum(raw?.nominalRatePct);
  if (Number.isNaN(nominalRatePct)) return { error: `${label}: enter the quoted interest rate.` };
  if (nominalRatePct < 0) return { error: `${label}: interest rate cannot be negative.` };
  if (nominalRatePct > MAX_RATE_PCT) {
    return { error: `${label}: an interest rate above ${MAX_RATE_PCT}% a year is out of range.` };
  }

  const rateType = raw?.rateType === "flat" ? "flat" : "reducing";
  const rateBasis = raw?.rateBasis === "floating" ? "floating" : "fixed";

  const processingFeeMode = raw?.processingFeeMode === "amount" ? "amount" : "percent";
  const processingFeeValue = toNum(raw?.processingFeeValue ?? 0);
  if (Number.isNaN(processingFeeValue) || processingFeeValue < 0) {
    return { error: `${label}: processing fee cannot be negative.` };
  }
  if (processingFeeMode === "percent" && processingFeeValue > MAX_PROCESSING_FEE_PCT) {
    return { error: `${label}: a processing fee above ${MAX_PROCESSING_FEE_PCT}% of the loan is out of range.` };
  }

  const otherChargesAmount = toNum(raw?.otherChargesAmount ?? 0);
  if (Number.isNaN(otherChargesAmount) || otherChargesAmount < 0) {
    return { error: `${label}: documentation and legal charges cannot be negative.` };
  }

  const insuranceAmount = toNum(raw?.insuranceAmount ?? 0);
  if (Number.isNaN(insuranceAmount) || insuranceAmount < 0) {
    return { error: `${label}: insurance premium cannot be negative.` };
  }

  const gstOnFeesPct = toNum(raw?.gstOnFeesPct ?? DEFAULT_GST_ON_FEES_PCT);
  if (Number.isNaN(gstOnFeesPct) || gstOnFeesPct < 0 || gstOnFeesPct > MAX_GST_PCT) {
    return { error: `${label}: GST on fees must be between 0% and ${MAX_GST_PCT}%.` };
  }

  const foreclosurePenaltyPct = toNum(raw?.foreclosurePenaltyPct ?? 0);
  if (Number.isNaN(foreclosurePenaltyPct) || foreclosurePenaltyPct < 0) {
    return { error: `${label}: foreclosure penalty cannot be negative.` };
  }
  if (foreclosurePenaltyPct > MAX_FORECLOSURE_PENALTY_PCT) {
    return { error: `${label}: a foreclosure penalty above ${MAX_FORECLOSURE_PENALTY_PCT}% is out of range.` };
  }

  return {
    label,
    principal,
    tenureMonths,
    nominalRatePct,
    rateType,
    rateBasis,
    flatPayoffBasis: raw?.flatPayoffBasis === "rule-of-78" ? "rule-of-78" : "straight-line",
    processingFeeMode,
    processingFeeValue,
    otherChargesAmount,
    insuranceAmount,
    insuranceFinanced: raw?.insuranceFinanced !== false,
    gstOnFeesPct,
    foreclosurePenaltyPct,
  };
}

/**
 * Full analysis of one offer, at full term and at the repayment horizon.
 *
 * @param {object} rawOffer   see normaliseOffer
 * @param {object} options    { horizonMonths, includeInsuranceInApr }
 */
export function analyseOffer(rawOffer, options = {}) {
  const offer = normaliseOffer(rawOffer, options.index ?? 0);
  if (offer.error) return { error: offer.error };

  const includeInsuranceInApr = options.includeInsuranceInApr !== false;

  // Sanctioned amount. A premium bundled into the loan is financed, so interest runs on it too.
  const financedPrincipal = offer.principal + (offer.insuranceFinanced ? offer.insuranceAmount : 0);

  const processingFee =
    offer.processingFeeMode === "percent"
      ? (financedPrincipal * offer.processingFeeValue) / 100
      : offer.processingFeeValue;

  // GST at 18% (see DEFAULT_GST_ON_FEES_PCT) applies to the processing fee and to
  // documentation/legal charges. Interest is exempt and is never grossed up here.
  const gstOnUpfrontFees = ((processingFee + offer.otherChargesAmount) * offer.gstOnFeesPct) / 100;

  // RBI KFS Annex B row 7: net disbursed = sanctioned amount less all fees and charges payable,
  // including third-party charges routed through the lender (para 7 names insurance explicitly).
  const insuranceAsCost = includeInsuranceInApr ? offer.insuranceAmount : 0;
  const upfrontCharges = processingFee + gstOnUpfrontFees + offer.otherChargesAmount + insuranceAsCost;
  const netDisbursed = financedPrincipal - upfrontCharges;

  if (netDisbursed <= 0) {
    return {
      error: `${offer.label}: upfront charges of ${Math.round(upfrontCharges)} are at or above the sanctioned amount, so nothing is actually disbursed.`,
    };
  }

  const schedule = buildSchedule({
    financedPrincipal,
    rateType: offer.rateType,
    nominalRatePct: offer.nominalRatePct,
    tenureMonths: offer.tenureMonths,
    flatPayoffBasis: offer.flatPayoffBasis,
  });
  if (!schedule.length) return { error: `${offer.label}: the repayment schedule is empty.` };

  const emi = schedule[0].instalment;
  const totalInterestFullTerm = schedule.reduce((sum, row) => sum + row.interest, 0);

  const horizonRaw = toNum(options.horizonMonths);
  const horizonMonths =
    Number.isNaN(horizonRaw) || horizonRaw < 1
      ? offer.tenureMonths
      : Math.min(Math.round(horizonRaw), offer.tenureMonths);

  const buildOutcome = (months, applyForeclosure) => {
    const rows = schedule.slice(0, months);
    const payoffBalance = applyForeclosure ? rows[rows.length - 1].closingBalance : 0;
    const foreclosurePenalty = (payoffBalance * offer.foreclosurePenaltyPct) / 100;
    // Foreclosure/pre-payment charges are a taxable supply under SAC 9971, not interest.
    const gstOnPenalty = (foreclosurePenalty * offer.gstOnFeesPct) / 100;
    const payoff = payoffBalance + foreclosurePenalty + gstOnPenalty;

    const flows = [netDisbursed];
    rows.forEach((row) => flows.push(-row.instalment));
    flows[flows.length - 1] -= payoff;

    const monthlyIrr = solveIrr(flows);
    if (monthlyIrr === null) {
      return { error: `${offer.label}: those terms do not produce a solvable cash-flow series.` };
    }

    const instalmentsPaid = rows.reduce((sum, row) => sum + row.instalment, 0);
    const interestPaid = rows.reduce((sum, row) => sum + row.interest, 0);
    const totalPaid = instalmentsPaid + payoff;
    const totalCost = totalPaid - netDisbursed;

    return {
      months,
      payoffBalance: round2(payoffBalance),
      foreclosurePenalty: round2(foreclosurePenalty),
      gstOnPenalty: round2(gstOnPenalty),
      penaltyWithGst: round2(foreclosurePenalty + gstOnPenalty),
      payoff: round2(payoff),
      instalmentsPaid: round2(instalmentsPaid),
      interestPaid: round2(interestPaid),
      totalPaid: round2(totalPaid),
      totalCost: round2(totalCost),
      costPerRupeeDisbursed: round6(totalCost / netDisbursed),
      monthlyIrr,
      aprNominalPct: round6(monthlyIrr * MONTHS_PER_YEAR * 100),
      aprEffectivePct: round6((Math.pow(1 + monthlyIrr, MONTHS_PER_YEAR) - 1) * 100),
    };
  };

  const fullTerm = buildOutcome(offer.tenureMonths, false);
  if (fullTerm.error) return { error: fullTerm.error };

  const forecloses = horizonMonths < offer.tenureMonths;
  const horizon = forecloses ? buildOutcome(horizonMonths, true) : fullTerm;
  if (horizon.error) return { error: horizon.error };

  // Flat-versus-reducing restatement, ignoring fees so it isolates the rate itself.
  const flatGap =
    offer.rateType === "flat" ? flatToReducing(financedPrincipal, offer.nominalRatePct, offer.tenureMonths) : null;

  const notes = [];
  if (offer.rateBasis === "floating" && offer.foreclosurePenaltyPct > 0) {
    notes.push(FLOATING_RATE_PREPAYMENT_RULE);
  }
  if (offer.rateType === "flat") {
    notes.push(
      offer.flatPayoffBasis === "rule-of-78"
        ? "Quoted on a flat basis, so interest is charged on the whole original amount for the whole tenure. The early-closure payoff uses the Rule of 78 sum-of-digits rebate, which front-loads interest and so leaves more principal outstanding than a straight-line payoff would."
        : "Quoted on a flat basis, so interest is charged on the whole original amount for the whole tenure. The early-closure payoff uses the straight-line convention: principal outstanding is the original amount times remaining months over total months, and interest for the unexpired months is not charged. A Rule of 78 contract gives a higher payoff than this at every point before the last instalment.",
    );
  }

  return {
    label: offer.label,
    rateType: offer.rateType,
    rateBasis: offer.rateBasis,
    flatPayoffBasis: offer.flatPayoffBasis,
    quotedRatePct: round6(offer.nominalRatePct),
    tenureMonths: offer.tenureMonths,
    principal: round2(offer.principal),
    financedPrincipal: round2(financedPrincipal),
    processingFee: round2(processingFee),
    gstOnUpfrontFees: round2(gstOnUpfrontFees),
    otherChargesAmount: round2(offer.otherChargesAmount),
    insuranceAmount: round2(offer.insuranceAmount),
    insuranceFinanced: offer.insuranceFinanced,
    insuranceCountedInApr: includeInsuranceInApr,
    upfrontCharges: round2(upfrontCharges),
    netDisbursed: round2(netDisbursed),
    emi: round2(emi),
    totalInterestFullTerm: round2(totalInterestFullTerm),
    foreclosurePenaltyPct: round6(offer.foreclosurePenaltyPct),
    forecloses,
    horizonMonths,
    fullTerm,
    horizon,
    flatGap,
    notes,
    schedule: schedule.map((row) => ({
      month: row.month,
      openingBalance: round2(row.openingBalance),
      interest: round2(row.interest),
      principal: round2(row.principal),
      instalment: round2(row.instalment),
      closingBalance: round2(row.closingBalance),
    })),
  };
}

const rankBy = (results, pick) => {
  const order = results
    .map((result, index) => ({ index, value: pick(result) }))
    .sort((a, b) => a.value - b.value || a.index - b.index);
  const ranks = new Array(results.length).fill(0);
  order.forEach((entry, position) => {
    ranks[entry.index] = position + 1;
  });
  return ranks;
};

/**
 * Compare two or more offers at full term and at a chosen repayment horizon.
 *
 * The ranking can invert between the two: an offer with the lower quoted rate but a foreclosure
 * penalty, or with a large upfront fee spread over a tenure the borrower does not intend to run,
 * can be the cheaper one over 60 months and the dearer one over 36. Both orders are returned,
 * together with the pairs that actually swapped.
 *
 * @param {object} input { offers: [], horizonMonths, includeInsuranceInApr }
 */
export function compareOffers(input = {}) {
  const rawOffers = Array.isArray(input.offers) ? input.offers : [];
  if (rawOffers.length < MIN_OFFERS) {
    return { error: `Enter at least ${MIN_OFFERS} offers to compare.` };
  }
  if (rawOffers.length > MAX_OFFERS) {
    return { error: `This compares up to ${MAX_OFFERS} offers at a time.` };
  }

  const horizonRaw = toNum(input.horizonMonths);
  if (Number.isNaN(horizonRaw)) return { error: "Enter the month in which you expect to clear the loan." };
  if (horizonRaw < 1) return { error: "The repayment horizon must be at least one month." };
  if (horizonRaw > MAX_TENURE_MONTHS) {
    return { error: `The repayment horizon must be ${MAX_TENURE_MONTHS} months or less.` };
  }
  const horizonMonths = Math.round(horizonRaw);

  const results = [];
  for (let index = 0; index < rawOffers.length; index += 1) {
    const analysed = analyseOffer(rawOffers[index], {
      horizonMonths,
      includeInsuranceInApr: input.includeInsuranceInApr,
      index,
    });
    if (analysed.error) return { error: analysed.error };
    results.push(analysed);
  }

  const fullTermRanks = rankBy(results, (r) => r.fullTerm.aprNominalPct);
  const horizonRanks = rankBy(results, (r) => r.horizon.aprNominalPct);
  const horizonCostRanks = rankBy(results, (r) => r.horizon.totalCost);

  const ranked = results.map((result, index) => ({
    ...result,
    fullTermRank: fullTermRanks[index],
    horizonRank: horizonRanks[index],
    horizonCostRank: horizonCostRanks[index],
    rankChange: fullTermRanks[index] - horizonRanks[index],
  }));

  const flips = [];
  for (let a = 0; a < ranked.length; a += 1) {
    for (let b = a + 1; b < ranked.length; b += 1) {
      const fullTermAheadA = ranked[a].fullTermRank < ranked[b].fullTermRank;
      const horizonAheadA = ranked[a].horizonRank < ranked[b].horizonRank;
      if (fullTermAheadA !== horizonAheadA) {
        const winnerFull = fullTermAheadA ? ranked[a] : ranked[b];
        const winnerHorizon = horizonAheadA ? ranked[a] : ranked[b];
        flips.push({
          pair: [ranked[a].label, ranked[b].label],
          fullTermLower: winnerFull.label,
          fullTermLowerAprPct: winnerFull.fullTerm.aprNominalPct,
          horizonLower: winnerHorizon.label,
          horizonLowerAprPct: winnerHorizon.horizon.aprNominalPct,
        });
      }
    }
  }

  const lowestFullTerm = ranked.find((r) => r.fullTermRank === 1);
  const lowestAtHorizon = ranked.find((r) => r.horizonRank === 1);
  const lowestCostAtHorizon = ranked.find((r) => r.horizonCostRank === 1);
  const anyForecloses = ranked.some((r) => r.forecloses);

  const aprSpreadAtHorizon = round6(
    Math.max(...ranked.map((r) => r.horizon.aprNominalPct)) -
      Math.min(...ranked.map((r) => r.horizon.aprNominalPct)),
  );

  // A horizon beyond the longest tenure is simply "run every offer to term"; report the
  // longest tenure rather than the raw entry so the figure shown is a real month.
  const longestTenure = Math.max(...ranked.map((r) => r.tenureMonths));

  return {
    horizonMonths: Math.min(horizonMonths, longestTenure),
    longestTenureMonths: longestTenure,
    anyForecloses,
    offers: ranked,
    rankingFlipped: flips.length > 0,
    flips,
    lowestFullTermAprLabel: lowestFullTerm?.label ?? null,
    lowestFullTermAprPct: lowestFullTerm?.fullTerm.aprNominalPct ?? null,
    lowestHorizonAprLabel: lowestAtHorizon?.label ?? null,
    lowestHorizonAprPct: lowestAtHorizon?.horizon.aprNominalPct ?? null,
    lowestHorizonCostLabel: lowestCostAtHorizon?.label ?? null,
    lowestHorizonCost: lowestCostAtHorizon?.horizon.totalCost ?? null,
    aprSpreadAtHorizon,
  };
}
