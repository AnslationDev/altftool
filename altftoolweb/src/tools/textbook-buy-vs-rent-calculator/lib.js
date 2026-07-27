/**
 * Textbook Buy vs Rent calculator.
 *
 * Net-cost model:
 *   buyNetCost  = purchase price − expected resale value
 *   rentNetCost = rent per term × terms of use + non-refundable rental fees
 * Refundable rental deposits are reported as locked-up cash, not cost.
 *
 * Break-even terms = buyNetCost / rentPerTerm — the number of terms of use at
 * which renting stops being cheaper. Use the book for more terms than the
 * break-even and buying wins.
 */

/**
 * @param {object} input
 * @param {number} input.buyPrice        Price to buy the book (INR).
 * @param {number} [input.expectedResale] Expected resale value after the course (INR).
 * @param {number} input.rentPerTerm     Rent per term/semester (INR).
 * @param {number} input.terms           Terms/semesters the book is needed.
 * @param {number} [input.rentalFees]    Non-refundable rental fees over the whole
 *                                        period — delivery, damage waiver (INR).
 * @param {number} [input.rentalDeposit] Refundable rental deposit (INR) — reported,
 *                                        not added to cost.
 * @returns {object} comparison, or { error }.
 */
export function compareBuyVsRent({
  buyPrice,
  expectedResale = 0,
  rentPerTerm,
  terms,
  rentalFees = 0,
  rentalDeposit = 0,
}) {
  const price = Number(buyPrice);
  const resale = Number(expectedResale);
  const rent = Number(rentPerTerm);
  const termCount = Number(terms);
  const fees = Number(rentalFees);
  const deposit = Number(rentalDeposit);

  if (!Number.isFinite(price) || price < 0) {
    return { error: "Purchase price must be zero or a positive number." };
  }
  if (!Number.isFinite(resale) || resale < 0) {
    return { error: "Expected resale value must be zero or a positive number." };
  }
  if (resale > price) {
    return { error: "Expected resale value cannot exceed the purchase price." };
  }
  if (!Number.isFinite(rent) || rent < 0) {
    return { error: "Rent per term must be zero or a positive number." };
  }
  if (!Number.isFinite(termCount) || termCount <= 0 || !Number.isInteger(termCount)) {
    return { error: "Terms of use must be a whole number of at least 1." };
  }
  if (termCount > 24) {
    return { error: "Terms of use looks too long — enter 24 terms or fewer." };
  }
  if (!Number.isFinite(fees) || fees < 0) {
    return { error: "Rental fees must be zero or a positive number." };
  }
  if (!Number.isFinite(deposit) || deposit < 0) {
    return { error: "Rental deposit must be zero or a positive number." };
  }

  const buyNetCost = price - resale;
  const rentNetCost = rent * termCount + fees;

  const difference = rentNetCost - buyNetCost; // positive => renting costs more
  const cheaper = difference > 0 ? "buy" : difference < 0 ? "rent" : "equal";

  // Terms of use at which the cumulative rent equals the net cost of buying.
  // null when renting is free (buying can never catch up unless it is free too).
  const breakEvenTerms = rent > 0 ? buyNetCost / rent : null;

  return {
    buyNetCost,
    buyGross: price,
    resale,
    rentNetCost,
    rentPerTerm: rent,
    terms: termCount,
    rentalFees: fees,
    rentalDeposit: deposit,
    difference: Math.abs(difference),
    cheaper,
    breakEvenTerms,
  };
}
