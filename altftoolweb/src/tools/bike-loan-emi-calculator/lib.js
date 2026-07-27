/**
 * Two-wheeler loan EMI, on a reducing-balance basis.
 *
 * Every retail vehicle loan in India is a reducing-balance loan, so the
 * instalment comes from the standard annuity formula:
 *
 *      EMI = P x r x (1+r)^n / ((1+r)^n - 1)
 *
 * with P the amount financed, n the tenure in months and r the MONTHLY rate,
 * i.e. the annual percentage rate divided by 12 and by 100. At r = 0 the formula
 * is undefined and the instalment is simply P / n, which is the case that
 * matters for the "0% finance" schemes dealers advertise — there the cost has
 * been moved into a higher price or a larger processing fee, not removed.
 *
 * The schedule is built month by month, which is how a lender actually posts it:
 *
 *      interest_m  = balance x r
 *      principal_m = EMI - interest_m
 *      balance     = balance - principal_m
 *
 * The last instalment is trimmed by any rounding residue so the balance closes
 * at exactly zero rather than a few paise either way.
 *
 * WHAT IS FINANCED: two-wheeler lenders lend against the on-road price, which is
 * ex-showroom plus RTO tax and registration plus insurance plus accessories, not
 * against the ex-showroom price in the advertisement. The processing fee can be
 * paid up front or added to the loan; adding it means paying interest on it for
 * the whole tenure, so both routes are costed here.
 */

/** Longest tenure this calculator will model, in months. */
const MAX_MONTHS = 84;
/** Ceiling on the annual rate, to catch a mistyped percentage. */
const MAX_ANNUAL_RATE = 60;
/** Ceiling on the vehicle price. */
const MAX_PRICE = 10_000_000;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * Reducing-balance instalment. Returns P/n when the rate is zero.
 * @param {number} principal amount financed
 * @param {number} annualRate annual percentage rate
 * @param {number} months tenure in months
 */
export function computeEmi(principal, annualRate, months) {
  if (months <= 0) return 0;
  if (annualRate === 0) return principal / months;
  const r = annualRate / 12 / 100;
  const growth = (1 + r) ** months;
  return (principal * r * growth) / (growth - 1);
}

/**
 * @param {object} input
 * @param {number} input.exShowroom       ex-showroom price
 * @param {number} input.rtoAndRegistration RTO tax, registration and road safety cess
 * @param {number} input.insurance        first-year insurance premium
 * @param {number} input.accessories      accessories and extended warranty
 * @param {number} input.downPayment      cash you pay the dealer up front
 * @param {number} input.annualRate       annual interest rate, percent
 * @param {number} input.months           tenure in months
 * @param {number} input.processingFeePct processing fee as a percent of the loan
 * @param {number} input.processingFeeFlat flat documentation charge
 * @param {boolean} input.financeFee      add the fee to the loan instead of paying it up front
 */
export function computeBikeLoan({
  exShowroom,
  rtoAndRegistration = 0,
  insurance = 0,
  accessories = 0,
  downPayment = 0,
  annualRate,
  months,
  processingFeePct = 0,
  processingFeeFlat = 0,
  financeFee = false,
}) {
  const values = [
    exShowroom,
    rtoAndRegistration,
    insurance,
    accessories,
    downPayment,
    annualRate,
    months,
    processingFeePct,
    processingFeeFlat,
  ];
  if (!values.every(isNum)) return { error: "Enter a valid number in every field." };
  if (exShowroom <= 0) return { error: "Enter the ex-showroom price of the two-wheeler." };
  if (exShowroom > MAX_PRICE)
    return { error: `Enter an ex-showroom price of ${MAX_PRICE.toLocaleString("en-IN")} or less.` };
  if ([rtoAndRegistration, insurance, accessories, downPayment, processingFeePct, processingFeeFlat].some((value) => value < 0))
    return { error: "Costs, the down payment and the fees cannot be negative." };
  if (annualRate < 0) return { error: "The interest rate cannot be negative." };
  if (annualRate > MAX_ANNUAL_RATE)
    return { error: `An annual rate above ${MAX_ANNUAL_RATE}% is not a two-wheeler loan — check the figure.` };
  if (!Number.isInteger(months) || months <= 0)
    return { error: "Tenure must be a whole number of months, at least one." };
  if (months > MAX_MONTHS)
    return { error: `Two-wheeler loans do not run past ${MAX_MONTHS} months — shorten the tenure.` };
  if (processingFeePct > 100) return { error: "The processing fee percentage cannot exceed 100." };

  const onRoadPrice = exShowroom + rtoAndRegistration + insurance + accessories;
  if (downPayment >= onRoadPrice)
    return {
      error: "Your down payment already covers the on-road price — there is nothing left to finance.",
    };

  const baseLoan = onRoadPrice - downPayment;
  const processingFee = (baseLoan * processingFeePct) / 100 + processingFeeFlat;
  const amountFinanced = financeFee ? baseLoan + processingFee : baseLoan;
  const feePaidUpfront = financeFee ? 0 : processingFee;

  const emi = computeEmi(amountFinanced, annualRate, months);
  const monthlyRate = annualRate / 12 / 100;

  // --- month-by-month schedule, aggregated into years ---
  let balance = amountFinanced;
  let totalInterest = 0;
  const monthly = [];
  for (let m = 1; m <= months; m += 1) {
    const interest = balance * monthlyRate;
    let principalPaid = emi - interest;
    let payment = emi;
    if (m === months || principalPaid > balance) {
      // Close the loan exactly on the final instalment.
      principalPaid = balance;
      payment = balance + interest;
    }
    balance -= principalPaid;
    totalInterest += interest;
    monthly.push({ month: m, payment, interest, principalPaid, balance: Math.max(0, balance) });
    if (balance <= 0) break;
  }

  const years = [];
  for (let start = 0; start < monthly.length; start += 12) {
    const chunk = monthly.slice(start, start + 12);
    years.push({
      year: years.length + 1,
      months: chunk.length,
      principalPaid: chunk.reduce((sum, row) => sum + row.principalPaid, 0),
      interestPaid: chunk.reduce((sum, row) => sum + row.interest, 0),
      totalPaid: chunk.reduce((sum, row) => sum + row.payment, 0),
      closingBalance: chunk[chunk.length - 1].balance,
    });
  }

  const totalRepayment = monthly.reduce((sum, row) => sum + row.payment, 0);
  const totalOutgo = downPayment + feePaidUpfront + totalRepayment;
  const costOverOnRoad = totalOutgo - onRoadPrice;
  const interestAsPctOfLoan = amountFinanced > 0 ? (totalInterest / amountFinanced) * 100 : 0;
  const ltvPct = (baseLoan / onRoadPrice) * 100;
  const downPaymentPct = (downPayment / onRoadPrice) * 100;

  // Same loan with the fee paid up front instead of financed, for comparison.
  const altFinanced = financeFee ? baseLoan : baseLoan + processingFee;
  const altEmi = computeEmi(altFinanced, annualRate, months);
  const altTotal = altEmi * months + (financeFee ? processingFee : 0);
  const feeFinancingDifference = altTotal - (totalRepayment + feePaidUpfront);

  const notes = [];
  if (annualRate === 0) {
    notes.push(
      "At 0% the instalment is simply the amount financed divided by the tenure. Check what the same bike costs on a cash deal — a zero-rate scheme usually recovers the interest in the price, the processing fee or a compulsory accessory pack.",
    );
  }
  if (processingFee > 0) {
    notes.push(
      feeFinancingDifference > 1
        ? `Paying the ${Math.round(processingFee).toLocaleString("en-IN")} rupee fee up front instead of financing it saves about ${Math.round(Math.abs(feeFinancingDifference)).toLocaleString("en-IN")} rupees over the tenure.`
        : `Financing the ${Math.round(processingFee).toLocaleString("en-IN")} rupee fee costs about ${Math.round(Math.abs(feeFinancingDifference)).toLocaleString("en-IN")} rupees more than paying it up front.`,
    );
  }
  if (ltvPct > 85) {
    notes.push(
      `You are financing ${ltvPct.toFixed(0)}% of the on-road price. A higher down payment cuts both the instalment and the total interest, and usually earns a better rate.`,
    );
  }
  notes.push(
    `Interest adds ${interestAsPctOfLoan.toFixed(1)}% to the amount financed over ${months} months. Shortening the tenure raises the EMI but cuts that figure sharply.`,
  );

  return {
    onRoadPrice,
    baseLoan,
    processingFee,
    amountFinanced,
    feePaidUpfront,
    emi,
    monthlyRate,
    totalInterest,
    totalRepayment,
    totalOutgo,
    costOverOnRoad,
    interestAsPctOfLoan,
    ltvPct,
    downPaymentPct,
    years,
    monthly,
    altEmi,
    feeFinancingDifference,
    notes,
  };
}
