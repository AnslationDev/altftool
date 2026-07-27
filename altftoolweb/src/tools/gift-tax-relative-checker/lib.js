/**
 * Taxability of a gift in the receiver's hands under section 56(2)(x) of the
 * Income-tax Act, 1961.
 *
 * India abolished gift tax on the giver for gifts made after 1 October 1998. What
 * remains taxes the RECEIVER: anything received without consideration, or for
 * inadequate consideration, is income from other sources unless it falls within one
 * of the exclusions in the proviso to clause (x).
 *
 * Rule sources:
 *
 *  - Section 56(2)(x)(a): a sum of money whose AGGREGATE value in the previous year
 *    exceeds ₹50,000. The threshold is a cliff, not an exemption — once the aggregate
 *    crosses it the whole aggregate is taxable, not merely the excess.
 *
 *  - Section 56(2)(x)(b), immovable property: received without consideration where
 *    the stamp duty value exceeds ₹50,000, the whole stamp duty value is taxable.
 *    Received for inadequate consideration, the difference is taxable only where it
 *    exceeds the HIGHER of ₹50,000 and 10% of the consideration. That safe harbour was
 *    5% until the Finance Act 2020 raised it to 10% with effect from assessment year
 *    2021-22.
 *
 *  - Section 56(2)(x)(c), specified movable property — shares and securities,
 *    jewellery, archaeological collections, drawings, paintings, sculptures, any work
 *    of art, bullion, and virtual digital assets added by the Finance Act 2022 with
 *    effect from 1 July 2022. Without consideration, aggregate fair market value above
 *    ₹50,000 is taxable in full; for inadequate consideration the shortfall is taxable
 *    where it exceeds ₹50,000. Ordinary movables such as a car or furniture are not
 *    "specified" property and fall outside the clause entirely.
 *
 *  - Proviso to section 56(2)(x): nothing is taxed where the receipt is from a
 *    relative, on the occasion of the marriage of the individual, under a will or by
 *    way of inheritance, in contemplation of the death of the payer or donor, from a
 *    local authority, from an institution referred to in section 10(23C), or from a
 *    trust registered under section 12A, 12AA or 12AB.
 *
 *  - Definition of "relative", in the Explanation to clause (x) read with clause (e)
 *    of the Explanation to clause (vii). For an INDIVIDUAL:
 *      (A) spouse of the individual;
 *      (B) brother or sister of the individual;
 *      (C) brother or sister of the spouse of the individual;
 *      (D) brother or sister of either of the parents of the individual;
 *      (E) any lineal ascendant or descendant of the individual;
 *      (F) any lineal ascendant or descendant of the spouse of the individual;
 *      (G) spouse of any person referred to in items (B) to (F).
 *    For a HINDU UNDIVIDED FAMILY: any member of the family.
 *
 *    The definition is not symmetric. An uncle is the brother of the receiver's
 *    parent and therefore a relative under item (D), so a gift from uncle to nephew is
 *    exempt. Going the other way, a nephew is not a lineal descendant of his uncle and
 *    is not covered by any item, so a gift from nephew to uncle is taxable. Cousins
 *    are relatives of each other under no item at all.
 *
 *  - Section 269ST with the penalty in section 271DA: receiving ₹2,00,000 or more in
 *    cash from one person in a day, in respect of one transaction, or in respect of
 *    transactions relating to one event or occasion attracts a penalty on the RECEIVER
 *    equal to the whole amount received. This bites on a cash gift from a relative too,
 *    even though the gift itself is exempt from income tax.
 *
 *  - Section 64(1)(iv): income arising from an asset transferred to a spouse without
 *    adequate consideration is clubbed with the transferor's income. Section 64(1A)
 *    clubs a minor child's income with the parent's.
 *
 * Informational only; it is not tax advice.
 */

/** Aggregate money above this figure in a previous year is taxable in full. */
export const MONETARY_THRESHOLD = 50000;

/** Safe harbour on immovable property bought below stamp duty value, from AY 2021-22. */
export const IMMOVABLE_SAFE_HARBOUR_PERCENT = 10;

/** The safe harbour that applied before the Finance Act 2020 raised it. */
export const IMMOVABLE_SAFE_HARBOUR_PERCENT_LEGACY = 5;

/** Section 269ST bars receiving this much or more in cash from one person in a day. */
export const CASH_RECEIPT_LIMIT = 200000;

/** Specified movable property covered by section 56(2)(x)(c). */
export const SPECIFIED_MOVABLE_PROPERTY = [
  "Shares and securities",
  "Jewellery",
  "Bullion",
  "Archaeological collections",
  "Drawings, paintings and sculptures",
  "Any work of art",
  "Virtual digital assets",
];

export const GIFT_TYPES = [
  { id: "money", label: "A sum of money" },
  { id: "immovable", label: "Immovable property — land, a house or a flat" },
  { id: "movable", label: "Specified movable property — shares, jewellery, art, bullion, VDAs" },
];

export const OCCASIONS = [
  { id: "none", label: "An ordinary gift, no special occasion", exempt: false, clause: "" },
  {
    id: "marriage",
    label: "On the occasion of my own marriage",
    exempt: true,
    clause: "second proviso, clause (II) — the marriage of the individual receiving the gift",
  },
  {
    id: "will",
    label: "Under a will, or by inheritance",
    exempt: true,
    clause: "second proviso, clause (III)",
  },
  {
    id: "contemplationOfDeath",
    label: "In contemplation of the death of the giver",
    exempt: true,
    clause: "second proviso, clause (IV)",
  },
  {
    id: "localAuthority",
    label: "From a local authority",
    exempt: true,
    clause: "second proviso, clause (V)",
  },
  {
    id: "registeredTrust",
    label: "From a section 10(23C) institution or a trust registered under 12A, 12AA or 12AB",
    exempt: true,
    clause: "second proviso, clauses (VI) and (VII)",
  },
];

/**
 * How the giver is related to the RECEIVER, and whether that makes them a relative.
 * `clause` cites the item in the statutory definition.
 */
export const RELATIONSHIPS = [
  { id: "spouse", label: "Spouse (husband or wife)", relative: true, clause: "item (A)", forHuf: false },
  { id: "father", label: "Father", relative: true, clause: "item (E) — lineal ascendant", forHuf: false },
  { id: "mother", label: "Mother", relative: true, clause: "item (E) — lineal ascendant", forHuf: false },
  { id: "grandparent", label: "Grandfather or grandmother", relative: true, clause: "item (E) — lineal ascendant", forHuf: false },
  { id: "greatGrandparent", label: "Great-grandparent", relative: true, clause: "item (E) — lineal ascendant", forHuf: false },
  { id: "son", label: "Son or daughter", relative: true, clause: "item (E) — lineal descendant", forHuf: false },
  { id: "grandchild", label: "Grandson or granddaughter", relative: true, clause: "item (E) — lineal descendant", forHuf: false },
  { id: "sibling", label: "Brother or sister", relative: true, clause: "item (B)", forHuf: false },
  { id: "spouseSibling", label: "Spouse's brother or sister", relative: true, clause: "item (C)", forHuf: false },
  { id: "parentSibling", label: "Uncle or aunt who is a brother or sister of my parent", relative: true, clause: "item (D)", forHuf: false },
  { id: "spouseParent", label: "Father-in-law or mother-in-law", relative: true, clause: "item (F) — lineal ascendant of the spouse", forHuf: false },
  { id: "spouseGrandparent", label: "Spouse's grandfather or grandmother", relative: true, clause: "item (F)", forHuf: false },
  { id: "childSpouse", label: "Son's wife or daughter's husband", relative: true, clause: "item (G) — spouse of a person in item (E)", forHuf: false },
  { id: "siblingSpouse", label: "Brother's wife or sister's husband", relative: true, clause: "item (G) — spouse of a person in item (B)", forHuf: false },
  { id: "parentSiblingSpouse", label: "Spouse of my uncle or aunt", relative: true, clause: "item (G) — spouse of a person in item (D)", forHuf: false },
  { id: "nephewNiece", label: "Nephew or niece", relative: false, clause: "not covered — a nephew is not a lineal descendant of the receiver", forHuf: false },
  { id: "cousin", label: "Cousin", relative: false, clause: "not covered by any item of the definition", forHuf: false },
  { id: "spouseCousin", label: "Spouse's cousin", relative: false, clause: "not covered by any item of the definition", forHuf: false },
  { id: "greatUncle", label: "Great-uncle or great-aunt (sibling of a grandparent)", relative: false, clause: "not covered — item (D) reaches only a sibling of a parent", forHuf: false },
  { id: "hufToMember", label: "The Hindu undivided family I belong to", relative: false, clause: "not covered — an HUF is a relative of its members only when the HUF is the receiver", forHuf: false },
  { id: "friend", label: "Friend, neighbour or colleague", relative: false, clause: "not covered by any item of the definition", forHuf: false },
  { id: "employer", label: "Employer", relative: false, clause: "not a relative, and it may be taxable as salary or a perquisite instead", forHuf: false },
  { id: "stranger", label: "Someone unrelated to me", relative: false, clause: "not covered by any item of the definition", forHuf: false },
  { id: "hufMember", label: "A member of this Hindu undivided family", relative: true, clause: "the HUF limb of the definition — any member of the family", forHuf: true },
  { id: "hufNonMember", label: "Someone who is not a member of this family", relative: false, clause: "not a member, so not a relative of the family", forHuf: true },
];

const round2 = (value) => Math.round(value * 100) / 100;

/**
 * Relationships selectable for a given receiver.
 * @param {"individual"|"huf"} recipientType
 */
export function relationshipsFor(recipientType) {
  return RELATIONSHIPS.filter((entry) =>
    recipientType === "huf" ? entry.forHuf : !entry.forHuf,
  );
}

/**
 * Taxable amount on a sum of money. The threshold is a cliff on the aggregate.
 * @returns {{ taxable:number, basis:string }}
 */
export function taxableOnMoney(aggregate) {
  const amount = Number(aggregate) || 0;
  if (amount > MONETARY_THRESHOLD) {
    return {
      taxable: round2(amount),
      basis: `The aggregate exceeds ${MONETARY_THRESHOLD}, so the whole aggregate is taxable — not just the excess.`,
    };
  }
  return {
    taxable: 0,
    basis: `The aggregate for the year is ${MONETARY_THRESHOLD} or less, so nothing is taxable. Crossing it by one rupee would make the entire amount taxable.`,
  };
}

/**
 * Taxable amount on immovable property, applying the 10% safe harbour.
 * @returns {{ taxable:number, difference:number, threshold:number, basis:string }}
 */
export function taxableOnImmovable(stampDutyValue, consideration, safeHarbourPercent) {
  const sdv = Number(stampDutyValue) || 0;
  const paid = Number(consideration) || 0;
  const percent = Number.isFinite(Number(safeHarbourPercent))
    ? Number(safeHarbourPercent)
    : IMMOVABLE_SAFE_HARBOUR_PERCENT;

  if (paid <= 0) {
    const taxable = sdv > MONETARY_THRESHOLD ? round2(sdv) : 0;
    return {
      taxable,
      difference: round2(sdv),
      threshold: MONETARY_THRESHOLD,
      basis:
        taxable > 0
          ? `Received without consideration and the stamp duty value exceeds ${MONETARY_THRESHOLD}, so the whole stamp duty value is taxable.`
          : `The stamp duty value is within ${MONETARY_THRESHOLD}, so nothing is taxable.`,
    };
  }

  const difference = round2(sdv - paid);
  const threshold = round2(Math.max(MONETARY_THRESHOLD, (paid * percent) / 100));
  if (difference > threshold) {
    return {
      taxable: difference,
      difference,
      threshold,
      basis: `The stamp duty value exceeds the price by ${difference}, which is more than the safe harbour of ${threshold} — the higher of ${MONETARY_THRESHOLD} and ${percent}% of the price. The whole difference is taxable.`,
    };
  }
  return {
    taxable: 0,
    difference: Math.max(0, difference),
    threshold,
    basis:
      difference <= 0
        ? "The price paid is at or above the stamp duty value, so nothing is taxable."
        : `The gap of ${difference} is inside the safe harbour of ${threshold} — the higher of ${MONETARY_THRESHOLD} and ${percent}% of the price — so nothing is taxable.`,
  };
}

/**
 * Taxable amount on specified movable property.
 * @returns {{ taxable:number, difference:number, threshold:number, basis:string }}
 */
export function taxableOnMovable(fairMarketValue, consideration) {
  const fmv = Number(fairMarketValue) || 0;
  const paid = Number(consideration) || 0;

  if (paid <= 0) {
    const taxable = fmv > MONETARY_THRESHOLD ? round2(fmv) : 0;
    return {
      taxable,
      difference: round2(fmv),
      threshold: MONETARY_THRESHOLD,
      basis:
        taxable > 0
          ? `Received without consideration and the aggregate fair market value exceeds ${MONETARY_THRESHOLD}, so the whole value is taxable.`
          : `The fair market value is within ${MONETARY_THRESHOLD}, so nothing is taxable.`,
    };
  }

  const difference = round2(fmv - paid);
  if (difference > MONETARY_THRESHOLD) {
    return {
      taxable: difference,
      difference,
      threshold: MONETARY_THRESHOLD,
      basis: `The fair market value exceeds what you paid by ${difference}, which is more than ${MONETARY_THRESHOLD}, so that difference is taxable. There is no percentage safe harbour for movable property.`,
    };
  }
  return {
    taxable: 0,
    difference: Math.max(0, difference),
    threshold: MONETARY_THRESHOLD,
    basis:
      difference <= 0
        ? "You paid at or above the fair market value, so nothing is taxable."
        : `The shortfall of ${difference} does not exceed ${MONETARY_THRESHOLD}, so nothing is taxable.`,
  };
}

/**
 * Assess a gift end to end.
 *
 * @returns {object} result object, or { error } for input that cannot be used.
 */
export function assessGift({
  recipientType = "individual",
  relationshipId = "friend",
  occasionId = "none",
  giftType = "money",
  moneyAmount = 0,
  stampDutyValue = 0,
  fairMarketValue = 0,
  consideration = 0,
  receivedInCash = false,
  safeHarbourPercent = IMMOVABLE_SAFE_HARBOUR_PERCENT,
} = {}) {
  if (recipientType !== "individual" && recipientType !== "huf") {
    return { error: "Choose whether the receiver is an individual or a Hindu undivided family." };
  }

  const relationship = relationshipsFor(recipientType).find((entry) => entry.id === relationshipId);
  if (!relationship) {
    return { error: "Choose how the giver is related to the receiver." };
  }

  const occasion = OCCASIONS.find((entry) => entry.id === occasionId);
  if (!occasion) return { error: "Choose the occasion of the gift." };

  const type = GIFT_TYPES.find((entry) => entry.id === giftType);
  if (!type) return { error: "Choose what was received." };

  const values = {
    moneyAmount: Number(moneyAmount),
    stampDutyValue: Number(stampDutyValue),
    fairMarketValue: Number(fairMarketValue),
    consideration: Number(consideration),
    safeHarbourPercent: Number(safeHarbourPercent),
  };
  if (!Object.values(values).every((value) => Number.isFinite(value))) {
    return { error: "Enter valid numbers for the amounts — use 0 where a field does not apply." };
  }
  if (Object.values(values).some((value) => value < 0)) {
    return { error: "Amounts cannot be negative." };
  }
  if (values.safeHarbourPercent > 100) {
    return { error: "The safe harbour percentage cannot exceed 100%." };
  }
  if ([values.moneyAmount, values.stampDutyValue, values.fairMarketValue, values.consideration].some((value) => value > 1e12)) {
    return { error: "That amount is outside the range of this checker." };
  }

  // Gross value of what was received, used for the section 269ST test and for display.
  const grossValue =
    giftType === "money"
      ? values.moneyAmount
      : giftType === "immovable"
        ? values.stampDutyValue
        : values.fairMarketValue;

  let computation;
  if (giftType === "money") {
    computation = { ...taxableOnMoney(values.moneyAmount), difference: round2(values.moneyAmount), threshold: MONETARY_THRESHOLD };
  } else if (giftType === "immovable") {
    computation = taxableOnImmovable(values.stampDutyValue, values.consideration, values.safeHarbourPercent);
  } else {
    computation = taxableOnMovable(values.fairMarketValue, values.consideration);
  }

  const exemptions = [];
  if (relationship.relative) {
    exemptions.push({
      id: "relative",
      title: "The giver is a relative",
      detail: `${relationship.label} falls within ${relationship.clause} of the definition of "relative", so the gift is outside section 56(2)(x) whatever its size.`,
    });
  }
  if (occasion.exempt) {
    exemptions.push({
      id: occasion.id,
      title: occasion.label,
      detail: `Excluded by the ${occasion.clause}. Note the marriage exclusion covers the marriage of the person receiving the gift, not the marriage of a child or sibling.`,
    });
  }

  const exempt = exemptions.length > 0;
  const taxable = exempt ? 0 : computation.taxable;

  const cashBreach = Boolean(receivedInCash) && grossValue >= CASH_RECEIPT_LIMIT;
  const clubbingApplies = relationshipId === "spouse" || relationshipId === "son";

  let verdict;
  if (exempt) {
    verdict = `Not taxable — ${exemptions[0].title.toLowerCase()}.`;
  } else if (taxable > 0) {
    verdict = `Taxable as income from other sources: ${taxable}.`;
  } else {
    verdict = "Not taxable — the amount stays within the threshold in section 56(2)(x).";
  }

  return {
    recipientType,
    relationship,
    occasion,
    giftType: type,
    grossValue: round2(grossValue),
    consideration: round2(values.consideration),
    computation,
    exemptions,
    exempt,
    taxable: round2(taxable),
    isRelative: relationship.relative,
    cashBreach,
    cashBreachNote: cashBreach
      ? `Section 269ST bars receiving ${CASH_RECEIPT_LIMIT} or more in cash from one person in a day or for one occasion, and section 271DA penalises the receiver by the whole amount received. This applies even when the gift itself is exempt — take it by bank transfer instead.`
      : "",
    clubbingApplies,
    clubbingNote: clubbingApplies
      ? relationshipId === "spouse"
        ? "The gift itself is exempt, but section 64(1)(iv) clubs the income arising from an asset transferred to a spouse back with the transferor. The exemption covers the capital, not the income it earns."
        : "Where the receiver is a minor child, section 64(1A) clubs that child's income with the parent's."
      : "",
    verdict,
  };
}

export default assessGift;
