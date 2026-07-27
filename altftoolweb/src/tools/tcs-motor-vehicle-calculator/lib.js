/**
 * Section 206C(1F) of the Income-tax Act, 1961 — tax collected at source on the
 * sale of a motor vehicle, and of other notified goods, above Rs 10,00,000.
 *
 * The provision reads that a seller who receives consideration for the sale of
 * a motor vehicle of the value exceeding ten lakh rupees shall collect from the
 * buyer a sum equal to one per cent of the SALE CONSIDERATION. Two consequences
 * follow and are implemented here:
 *  - The Rs 10,00,000 figure is a trigger, not an exemption slab: once the value
 *    exceeds it, 1% applies to the entire consideration, not just the excess.
 *  - The test is per sale, not on a yearly aggregate, so two cars of Rs 8 lakh
 *    each attract nothing while one car of Rs 11 lakh attracts Rs 11,000.
 *
 * The Finance (No. 2) Act 2024 extended the same 1% collection to any other
 * goods of value exceeding Rs 10,00,000 as the Central Government notifies. The
 * CBDT notified a list of luxury goods with effect from 22 April 2025.
 *
 * CBDT Circular 22/2016 clarifies that the collection applies to retail sales,
 * so a manufacturer selling to a dealer or distributor does not collect under
 * this sub-section.
 *
 * Section 206CC: where the buyer furnishes no PAN, tax is collected at twice
 * the specified rate or 5%, whichever is higher — which works out to 5% here.
 */

/** Value that the sale consideration must EXCEED for the collection to apply. */
export const THRESHOLD = 1000000;

/** Statutory rate in section 206C(1F). */
export const RATE = 1;

/** Section 206CC: twice the rate or 5%, whichever is higher. */
export const NO_PAN_MULTIPLIER = 2;
export const NO_PAN_FLOOR_RATE = 5;

/** Goods within section 206C(1F). */
export const GOODS_TYPES = [
  {
    id: "motor-vehicle",
    label: "Motor vehicle (car, SUV, two-wheeler, commercial vehicle)",
    note: "Covered since 1 June 2016. The retail sale is what counts.",
    allowsDealerCarveOut: true,
  },
  {
    id: "luxury-goods",
    label: "Notified luxury good",
    note: "Wrist watches, art, collectibles, yachts, handbags, footwear, sportswear, home theatre systems and horses, notified with effect from 22 April 2025.",
    allowsDealerCarveOut: false,
  },
];

/** Buyers excluded from the definition of "buyer" for section 206C(1F). */
export const EXEMPT_BUYERS = [
  "Central Government or a State Government",
  "An embassy, High Commission, legation, consulate or trade representation of a foreign State",
  "A local authority as defined in the Explanation to section 10(20)",
  "A public sector company engaged in the business of carrying passengers",
];

export function getGoodsType(id) {
  return GOODS_TYPES.find((item) => item.id === id) || GOODS_TYPES[0];
}

const round2 = (value) => Math.round(value * 100) / 100;
const inr = (value) => `Rs ${Number(value).toLocaleString("en-IN")}`;

/**
 * Compute TCS under section 206C(1F) on one sale.
 *
 * @param {object} input
 * @param {number} input.saleConsideration    Invoice value of the sale (Rs).
 * @param {string} input.goodsType            One of GOODS_TYPES[].id
 * @param {boolean} input.panFurnished        Whether the buyer gave a PAN.
 * @param {boolean} input.buyerExempt         Whether the buyer is in the exempt list.
 * @param {boolean} input.manufacturerToDealer Sale by a manufacturer to a dealer or distributor.
 * @returns {object} result, or { error } when the input is unusable.
 */
export function computeTcsMotorVehicle({
  saleConsideration,
  goodsType = "motor-vehicle",
  panFurnished = true,
  buyerExempt = false,
  manufacturerToDealer = false,
} = {}) {
  if (!Number.isFinite(saleConsideration)) {
    return { error: "Enter the sale consideration as a number." };
  }
  if (saleConsideration < 0) {
    return { error: "Sale consideration cannot be negative." };
  }
  if (saleConsideration === 0) {
    return { error: "Enter a sale consideration greater than zero." };
  }
  if (saleConsideration > 1e11) {
    return { error: "That sale value is unrealistically large — check the figure you entered." };
  }

  const goods = getGoodsType(goodsType);
  const rate = panFurnished ? RATE : Math.max(RATE * NO_PAN_MULTIPLIER, NO_PAN_FLOOR_RATE);
  const value = round2(saleConsideration);
  const thresholdCrossed = value > THRESHOLD;

  const shared = {
    saleConsideration: value,
    goodsLabel: goods.label,
    goodsNote: goods.note,
    threshold: THRESHOLD,
    statutoryRate: RATE,
    thresholdCrossed,
    panFurnished,
  };

  const nil = (reason) => ({
    ...shared,
    appliedRate: 0,
    collectionRequired: false,
    tcs: 0,
    totalPayable: value,
    headroom: round2(Math.max(0, THRESHOLD - value)),
    reason,
  });

  if (buyerExempt) {
    return nil(
      "No tax is collected. Governments, foreign missions, local authorities and public sector companies carrying passengers are outside the definition of buyer for section 206C(1F).",
    );
  }

  if (manufacturerToDealer && goods.allowsDealerCarveOut) {
    return nil(
      "No tax is collected. CBDT Circular 22/2016 confirms that section 206C(1F) applies to retail sales, so a manufacturer selling to a dealer or distributor does not collect under this sub-section.",
    );
  }

  if (!thresholdCrossed) {
    return nil(
      `The sale value of ${inr(value)} does not exceed ${inr(THRESHOLD)}, so no tax is collected. The test is per sale, so a second purchase in the same year is judged on its own value.`,
    );
  }

  const tcs = round2((value * rate) / 100);

  let reason = `The sale value of ${inr(value)} exceeds ${inr(THRESHOLD)}, so ${rate}% is collected on the whole consideration, not just on the amount above the limit.`;
  if (!panFurnished) {
    reason += ` No PAN was furnished, so section 206CC applies the higher of twice the ${RATE}% rate and ${NO_PAN_FLOOR_RATE}%.`;
  }

  return {
    ...shared,
    appliedRate: rate,
    collectionRequired: tcs > 0,
    tcs,
    totalPayable: round2(value + tcs),
    headroom: 0,
    reason,
  };
}

/**
 * Smallest sale value that would attract the collection — useful when a buyer is
 * negotiating around the limit.
 */
export function firstTaxableValue() {
  return THRESHOLD + 1;
}
