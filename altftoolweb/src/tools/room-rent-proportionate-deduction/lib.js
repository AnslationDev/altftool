/**
 * Room Rent Proportionate Deduction Calculator — pure computation layer.
 *
 * RULE IMPLEMENTED
 * ----------------
 * The two standard definitions reproduced in IRDAI-standardised Indian health
 * policy wordings (Guidelines on Standardisation in Health Insurance,
 * Ref. IRDA/HLT/REG/CIR/146/07/2016 dated 29 July 2016, and the standard
 * definitions carried into current policy wordings):
 *
 *   "Proportionate deduction" — on admission to a room at a rate exceeding the
 *   limit in the Policy Schedule, payment of Associated Medical Expenses is
 *   made in the same proportion as the admissible rate per day bears to the
 *   actual rate per day of room rent. Proportionate deductions are not applied
 *   in respect of hospitals that do not follow differential billing, or for
 *   expenses for which differential billing is not adopted by room category.
 *
 *   "Associated Medical Expenses" — includes room rent, nursing charges,
 *   operation theatre charges and the fees of the medical practitioner /
 *   surgeon / anaesthetist / specialist within the same hospital. It EXCLUDES
 *   the cost of pharmacy and consumables, the cost of implants and medical
 *   devices, and the cost of diagnostics.
 *
 * That exclusion is why this module keeps pharmacy, implants and diagnostics in
 * a separate bucket that the ratio is NOT applied to by default. Older and
 * non-standard wordings sometimes do proportion diagnostics, so the caller can
 * move that one line into the proportioned bucket.
 *
 * This module computes the standard formula on numbers the user supplies. It
 * does not read, interpret or represent any particular insurance contract.
 * Every input is user-entered; nothing here goes stale.
 */

/** Wording/definition text above was read on 2026-07-28. */
export const RULE_AS_OF = "2026-07-28";

/** Human-readable citation shown in the UI next to the result. */
export const RULE_SOURCE =
  'Standard definitions of "Proportionate deduction" and "Associated Medical Expenses", IRDAI Guidelines on Standardisation in Health Insurance (Ref. IRDA/HLT/REG/CIR/146/07/2016, 29 July 2016), as reproduced in standard policy wordings.';

/**
 * Most widely used single-private-room sub-limit in the Indian retail market:
 * 1% of sum insured per day. ICU sub-limits are commonly 2%. This is a market
 * convention seen on policy schedules, NOT a regulatory figure — the operative
 * number is always the one printed on the user's own schedule, which is why it
 * is only a default here and never hard-coded into the maths.
 */
export const DEFAULT_ROOM_CAP_PERCENT = 1;

/** Same convention, ICU/HDU sub-limit. */
export const DEFAULT_ICU_CAP_PERCENT = 2;

/**
 * Upper guard on any rupee input. Rs 100 crore. Beyond this the user has almost
 * certainly typed extra zeros, and reporting a confident number would be worse
 * than refusing.
 */
export const MAX_MONEY = 1_000_000_000;

/** Upper guard on length of stay. One year of continuous hospitalisation. */
export const MAX_DAYS = 365;

/**
 * Sum-insured amounts commonly offered on Indian retail indemnity plans, in
 * rupees. Used only to report the next slab at or above a computed requirement.
 * A list of market slabs, not a recommendation.
 */
export const COMMON_SUM_INSURED_SLABS = [
  300000, 500000, 750000, 1000000, 1500000, 2000000, 2500000, 3000000, 5000000,
  10000000,
];

function parseMoney(value, label) {
  if (value === "" || value === null || value === undefined) return 0;
  const num = typeof value === "number" ? value : Number(String(value).replace(/,/g, "").trim());
  if (!Number.isFinite(num)) return { error: `${label} must be a number.` };
  if (num < 0) return { error: `${label} cannot be negative.` };
  if (num > MAX_MONEY) {
    return { error: `${label} looks unrealistic — keep it at or below Rs 100 crore.` };
  }
  return Math.round(num * 100) / 100;
}

function isErr(value) {
  return typeof value === "object" && value !== null && "error" in value;
}

/**
 * FORWARD MODE — take a whole hospital bill and produce the rupee out-of-pocket.
 *
 * @param {object} input
 * @param {number|string} input.sumInsured            Policy sum insured, rupees.
 * @param {"percent"|"amount"} input.capMode          Room cap expressed as % of SI/day, or a flat Rs/day.
 * @param {number|string} input.capPercent            Used when capMode === "percent".
 * @param {number|string} input.capAmount             Used when capMode === "amount".
 * @param {number|string} input.actualRoomRentPerDay  Hospital's tariff for the room actually occupied.
 * @param {number|string} input.days                  Nights billed at that tariff.
 * @param {number|string} [input.roomChargesBilled]   Room + board on the bill. Defaults to tariff x days.
 * @param {number|string} input.nursingCharges        Proportioned bucket.
 * @param {number|string} input.otCharges             Proportioned bucket.
 * @param {number|string} input.surgeonFees           Proportioned bucket.
 * @param {number|string} input.consultationFees      Proportioned bucket.
 * @param {number|string} input.pharmacy              Not proportioned (standard definition).
 * @param {number|string} input.implants              Not proportioned (standard definition).
 * @param {number|string} input.diagnostics           Not proportioned unless proportionDiagnostics is true.
 * @param {number|string} input.nonPayables           IRDAI non-medical / non-payable items. Never reimbursed.
 * @param {number|string} input.copayPercent          Copay on the admissible amount, 0-100.
 * @param {boolean} [input.differentialBilling]       Does the hospital bill differently by room category?
 * @param {boolean} [input.proportionDiagnostics]     Move diagnostics into the proportioned bucket.
 * @returns {object} result, or { error } if the inputs cannot produce a real answer.
 */
export function computeProportionateDeduction(input = {}) {
  const {
    capMode = "percent",
    differentialBilling = true,
    proportionDiagnostics = false,
  } = input;

  if (capMode !== "percent" && capMode !== "amount") {
    return { error: 'Room rent cap must be either a percent of sum insured or a rupee amount per day.' };
  }

  const sumInsured = parseMoney(input.sumInsured, "Sum insured");
  if (isErr(sumInsured)) return sumInsured;
  if (sumInsured <= 0) return { error: "Enter a sum insured greater than zero." };

  const actualRoomRentPerDay = parseMoney(input.actualRoomRentPerDay, "Actual room tariff per day");
  if (isErr(actualRoomRentPerDay)) return actualRoomRentPerDay;
  if (actualRoomRentPerDay <= 0) {
    return { error: "Enter the hospital's room tariff per day — it must be greater than zero." };
  }

  const days = Number(input.days);
  if (!Number.isFinite(days) || days <= 0) return { error: "Enter at least 1 day of stay." };
  if (days > MAX_DAYS) return { error: `Stay cannot exceed ${MAX_DAYS} days in one calculation.` };

  let capPerDay;
  let capPercentUsed = null;
  if (capMode === "percent") {
    const capPercent = Number(input.capPercent);
    if (!Number.isFinite(capPercent) || capPercent <= 0) {
      return { error: "Room rent cap percent must be greater than zero (commonly 1% of sum insured per day)." };
    }
    if (capPercent > 100) return { error: "Room rent cap percent cannot exceed 100% of the sum insured per day." };
    capPercentUsed = capPercent;
    capPerDay = (sumInsured * capPercent) / 100;
  } else {
    const capAmount = parseMoney(input.capAmount, "Room rent cap per day");
    if (isErr(capAmount)) return capAmount;
    if (capAmount <= 0) return { error: "Room rent cap per day must be greater than zero." };
    capPerDay = capAmount;
  }

  const copayPercent = Number(input.copayPercent ?? 0);
  if (!Number.isFinite(copayPercent) || copayPercent < 0) return { error: "Copay percent cannot be negative." };
  if (copayPercent > 100) return { error: "Copay percent cannot exceed 100." };

  const lineNames = [
    ["nursingCharges", "Nursing charges"],
    ["otCharges", "Operation theatre charges"],
    ["surgeonFees", "Surgeon / anaesthetist fees"],
    ["consultationFees", "Consultation and doctor visits"],
    ["pharmacy", "Pharmacy and consumables"],
    ["implants", "Implants and medical devices"],
    ["diagnostics", "Diagnostics and investigations"],
    ["nonPayables", "Non-payable items"],
  ];
  const lines = {};
  for (const [key, label] of lineNames) {
    const parsed = parseMoney(input[key], label);
    if (isErr(parsed)) return parsed;
    lines[key] = parsed;
  }

  let roomChargesBilled;
  if (input.roomChargesBilled === "" || input.roomChargesBilled === null || input.roomChargesBilled === undefined) {
    roomChargesBilled = actualRoomRentPerDay * days;
  } else {
    const parsed = parseMoney(input.roomChargesBilled, "Room and board charges billed");
    if (isErr(parsed)) return parsed;
    roomChargesBilled = parsed;
  }

  // ---- Step 1: eligibility ratio -----------------------------------------
  // Eligible rate per day can never exceed what the hospital actually charged.
  const eligibleRentPerDay = Math.min(capPerDay, actualRoomRentPerDay);
  const ratio = eligibleRentPerDay / actualRoomRentPerDay; // 0 < ratio <= 1
  const capExceeded = actualRoomRentPerDay > capPerDay;

  // ---- Step 2: buckets ----------------------------------------------------
  const associatedBase =
    lines.nursingCharges + lines.otCharges + lines.surgeonFees + lines.consultationFees;
  const associated = associatedBase + (proportionDiagnostics ? lines.diagnostics : 0);
  const nonProportionate =
    lines.pharmacy + lines.implants + (proportionDiagnostics ? 0 : lines.diagnostics);

  // ---- Step 3: apply the rule, in whole rupees so every line reconciles ---
  const roomBilledR = Math.round(roomChargesBilled);
  const associatedR = Math.round(associated);
  const nonProportionateR = Math.round(nonProportionate);
  const nonPayablesR = Math.round(lines.nonPayables);

  const roomAllowed = Math.min(roomBilledR, Math.round(eligibleRentPerDay * days));
  const roomDeduction = roomBilledR - roomAllowed;

  // The differential-billing carve-out: if the hospital does not price by room
  // category, the standard definition says the proportion is not applied.
  const proportionApplies = capExceeded && differentialBilling;
  const associatedAllowed = proportionApplies ? Math.round(associatedR * ratio) : associatedR;
  const associatedDeduction = associatedR - associatedAllowed;

  const nonProportionateAllowed = nonProportionateR;

  const admissible = roomAllowed + associatedAllowed + nonProportionateAllowed;
  const payableAfterSumInsured = Math.min(admissible, Math.round(sumInsured));
  const sumInsuredShortfall = admissible - payableAfterSumInsured;

  const copayAmount = Math.round((payableAfterSumInsured * copayPercent) / 100);
  const insurerPays = payableAfterSumInsured - copayAmount;

  const totalBill = roomBilledR + associatedR + nonProportionateR + nonPayablesR;
  const outOfPocket = totalBill - insurerPays;

  return {
    // headline
    outOfPocket,
    insurerPays,
    totalBill,
    // ratio
    ratio,
    ratioPercent: ratio * 100,
    capExceeded,
    proportionApplies,
    eligibleRentPerDay: Math.round(eligibleRentPerDay * 100) / 100,
    capPerDay: Math.round(capPerDay * 100) / 100,
    capPercentUsed,
    excessPerDay: Math.round(Math.max(0, actualRoomRentPerDay - capPerDay) * 100) / 100,
    days,
    // buckets as billed
    roomChargesBilled: roomBilledR,
    associatedCharges: associatedR,
    nonProportionateCharges: nonProportionateR,
    nonPayables: nonPayablesR,
    // what survives
    roomAllowed,
    associatedAllowed,
    nonProportionateAllowed,
    admissible,
    payableAfterSumInsured,
    // the five things that make up out-of-pocket; they sum exactly to it
    roomDeduction,
    associatedDeduction,
    sumInsuredShortfall,
    copayAmount,
    copayPercent,
    // derived
    totalProportionateDeduction: roomDeduction + associatedDeduction,
    totalDeducted: totalBill - admissible,
    reimbursementPercent: totalBill > 0 ? (insurerPays / totalBill) * 100 : 0,
    diagnosticsProportioned: Boolean(proportionDiagnostics),
    differentialBilling: Boolean(differentialBilling),
  };
}

/**
 * REVERSE MODE — "I want a room costing Rs X/day with no proportionate
 * deduction. What sum insured does a percent-of-SI cap have to be?"
 *
 * Inverts eligibleRentPerDay = sumInsured x capPercent / 100.
 *
 * @param {object} input
 * @param {number|string} input.desiredRoomRentPerDay Target room tariff, rupees per day.
 * @param {number|string} input.capPercent            The policy's room cap as % of SI per day.
 * @param {number|string} [input.currentSumInsured]   Current SI, to report today's ceiling and the gap.
 * @returns {object} result, or { error }.
 */
export function computeRequiredSumInsured(input = {}) {
  const desiredRoomRentPerDay = parseMoney(input.desiredRoomRentPerDay, "Target room tariff per day");
  if (isErr(desiredRoomRentPerDay)) return desiredRoomRentPerDay;
  if (desiredRoomRentPerDay <= 0) {
    return { error: "Enter the room tariff per day you want covered — it must be greater than zero." };
  }

  const capPercent = Number(input.capPercent);
  if (!Number.isFinite(capPercent) || capPercent <= 0) {
    return { error: "Room rent cap percent must be greater than zero (commonly 1% of sum insured per day)." };
  }
  if (capPercent > 100) return { error: "Room rent cap percent cannot exceed 100% of the sum insured per day." };

  const currentSumInsured = parseMoney(input.currentSumInsured, "Current sum insured");
  if (isErr(currentSumInsured)) return currentSumInsured;

  const requiredSumInsured = Math.ceil((desiredRoomRentPerDay * 100) / capPercent);
  const nextCommonSlab =
    COMMON_SUM_INSURED_SLABS.find((slab) => slab >= requiredSumInsured) ?? null;

  const currentCeiling = currentSumInsured > 0 ? (currentSumInsured * capPercent) / 100 : 0;
  const gap = Math.max(0, requiredSumInsured - Math.round(currentSumInsured));
  const covered = currentSumInsured > 0 && currentCeiling >= desiredRoomRentPerDay;
  const ratioAtCurrentSi =
    currentSumInsured > 0 ? Math.min(1, currentCeiling / desiredRoomRentPerDay) : null;

  return {
    requiredSumInsured,
    nextCommonSlab,
    slabIsAboveRequirement: nextCommonSlab !== null && nextCommonSlab > requiredSumInsured,
    desiredRoomRentPerDay,
    capPercent,
    currentSumInsured: Math.round(currentSumInsured),
    currentCeiling: Math.round(currentCeiling * 100) / 100,
    gap,
    covered,
    ratioAtCurrentSi,
    ratioPercentAtCurrentSi: ratioAtCurrentSi === null ? null : ratioAtCurrentSi * 100,
    // Every rupee of associated expense would lose this share at today's SI.
    lossSharePercentAtCurrentSi: ratioAtCurrentSi === null ? null : (1 - ratioAtCurrentSi) * 100,
  };
}
