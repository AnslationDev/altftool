/**
 * Pillion load checker.
 *
 * Two independent limits decide whether a two-wheeler is legally and safely
 * loaded:
 *   1. Payload  = Gross Vehicle Weight (GVW) - kerb (unladen) weight. Both
 *      figures appear on the Indian registration certificate and in the owner's
 *      manual.
 *   2. Rear tyre capacity = the tyre's load index, read off the ISO/ETRTO load
 *      index table. On a motorcycle the rear tyre alone carries the whole rear
 *      axle load, so the axle figure is compared directly against it.
 * Axle split is estimated from where each mass sits relative to the wheels.
 */

/**
 * Motor Vehicles Act 1988, section 128 and Central Motor Vehicles Rules 1989,
 * rule 123: a two-wheeler may carry only one person in addition to the driver.
 */
export const MAX_PILLION_COUNT = 1;

/**
 * MoRTH notification GSR 175(E) of 2021 on two-wheeler pillion safety: a
 * light-weight rear container may be fitted with a maximum load of 30 kg, and
 * if it is mounted behind the driver's seat the vehicle counts as a one-seater
 * with no pillion permitted.
 */
export const MAX_REAR_CONTAINER_KG = 30;

/** ISO/ETRTO tyre load index to maximum load in kilograms. */
export const LOAD_INDEX_KG = {
  20: 80, 21: 82.5, 22: 85, 23: 87.5, 24: 90, 25: 92.5, 26: 95, 27: 97.5,
  28: 100, 29: 103, 30: 106, 31: 109, 32: 112, 33: 115, 34: 118, 35: 121,
  36: 125, 37: 128, 38: 132, 39: 136, 40: 140, 41: 145, 42: 150, 43: 155,
  44: 160, 45: 165, 46: 170, 47: 175, 48: 180, 49: 185, 50: 190, 51: 195,
  52: 200, 53: 206, 54: 212, 55: 218, 56: 224, 57: 230, 58: 236, 59: 243,
  60: 250, 61: 257, 62: 265, 63: 272, 64: 280, 65: 290, 66: 300, 67: 307,
  68: 315, 69: 325, 70: 335, 71: 345, 72: 355, 73: 365, 74: 375, 75: 387,
  76: 400, 77: 412, 78: 425, 79: 437, 80: 450,
};

/**
 * Share of each mass that lands on the FRONT wheel. Kerb split is the bike's
 * own static distribution (adjustable); the rest are engineering approximations
 * based on where the mass sits along the wheelbase — a rider sits just ahead of
 * the rear axle, a pillion almost over it, and rack or top-box luggage behind it.
 */
export const FRONT_SHARE = {
  rider: 0.3,
  pillion: 0.1,
  luggage: 0,
};

/** Default static front-wheel share of kerb weight for a typical motorcycle. */
export const DEFAULT_FRONT_KERB_SHARE = 0.48;

/**
 * Below this front-wheel share the steering goes light and the front tyre loses
 * grip on the entry to a corner. 30% is the widely used practical warning line.
 */
export const MIN_FRONT_SHARE = 0.3;

/** Warn once payload use passes this share, well before the hard limit. */
export const PAYLOAD_WARN_SHARE = 0.9;

const MAX_KERB_KG = 1000;
const MAX_PERSON_KG = 250;
const MAX_LUGGAGE_KG = 200;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const nonNeg = (value) => (isNum(value) && value >= 0 ? value : 0);

/** Maximum load in kg for a tyre load index, or null if not in the table. */
export function loadIndexToKg(index) {
  if (!isNum(index)) return null;
  return LOAD_INDEX_KG[Math.round(index)] ?? null;
}

export function checkPillionLoad({
  kerbWeightKg,
  grossVehicleWeightKg,
  riderKg,
  pillionKg = 0,
  luggageKg = 0,
  topBoxKg = 0,
  rearTyreLoadIndex,
  frontKerbShare = DEFAULT_FRONT_KERB_SHARE,
} = {}) {
  if (!isNum(kerbWeightKg) || !isNum(grossVehicleWeightKg) || !isNum(riderKg)) {
    return { error: "Enter kerb weight, gross vehicle weight and rider weight as numbers." };
  }
  if (kerbWeightKg <= 0 || kerbWeightKg > MAX_KERB_KG) {
    return { error: `Kerb weight must be between 1 and ${MAX_KERB_KG} kg.` };
  }
  if (grossVehicleWeightKg <= kerbWeightKg) {
    return { error: "Gross vehicle weight must be more than kerb weight — check the figures on your RC." };
  }
  if (riderKg <= 0 || riderKg > MAX_PERSON_KG) {
    return { error: `Rider weight must be between 1 and ${MAX_PERSON_KG} kg.` };
  }
  const pillion = nonNeg(pillionKg);
  const luggage = nonNeg(luggageKg);
  const topBox = nonNeg(topBoxKg);
  if (pillion > MAX_PERSON_KG) return { error: `Pillion weight must be under ${MAX_PERSON_KG} kg.` };
  if (luggage > MAX_LUGGAGE_KG || topBox > MAX_LUGGAGE_KG) {
    return { error: `Luggage entries must each be under ${MAX_LUGGAGE_KG} kg.` };
  }
  const kerbShare =
    isNum(frontKerbShare) && frontKerbShare > 0.2 && frontKerbShare < 0.8
      ? frontKerbShare
      : DEFAULT_FRONT_KERB_SHARE;

  const payloadCapacity = grossVehicleWeightKg - kerbWeightKg;
  const rearLuggage = luggage + topBox;
  const payloadUsed = riderKg + pillion + rearLuggage;
  const totalLaden = kerbWeightKg + payloadUsed;
  const payloadUtil = (payloadUsed / payloadCapacity) * 100;
  const payloadRemaining = payloadCapacity - payloadUsed;

  const frontAxle =
    kerbWeightKg * kerbShare +
    riderKg * FRONT_SHARE.rider +
    pillion * FRONT_SHARE.pillion +
    rearLuggage * FRONT_SHARE.luggage;
  const rearAxle = totalLaden - frontAxle;
  const frontShare = frontAxle / totalLaden;

  const rearTyreCapacityKg = loadIndexToKg(rearTyreLoadIndex);
  const rearTyreUtil = rearTyreCapacityKg ? (rearAxle / rearTyreCapacityKg) * 100 : null;

  const warnings = [];
  if (payloadUsed > payloadCapacity) {
    warnings.push({
      level: "danger",
      text: `Over the payload limit by ${(payloadUsed - payloadCapacity).toFixed(1)} kg. Braking distance, suspension travel and tyre temperature all suffer.`,
    });
  } else if (payloadUtil >= PAYLOAD_WARN_SHARE * 100) {
    warnings.push({
      level: "warning",
      text: `Using ${payloadUtil.toFixed(0)}% of the payload. Raise the rear tyre pressure and preload to the two-up setting in the manual.`,
    });
  }
  if (rearTyreCapacityKg && rearAxle > rearTyreCapacityKg) {
    warnings.push({
      level: "danger",
      text: `Rear axle load of ${rearAxle.toFixed(1)} kg exceeds the ${rearTyreCapacityKg} kg rated for load index ${Math.round(rearTyreLoadIndex)}.`,
    });
  }
  if (frontShare < MIN_FRONT_SHARE) {
    warnings.push({
      level: "warning",
      text: `Only ${(frontShare * 100).toFixed(0)}% of the weight is on the front wheel. Steering will feel light and the front will wash out easily — move luggage forward.`,
    });
  }
  if (topBox > MAX_REAR_CONTAINER_KG) {
    warnings.push({
      level: "danger",
      text: `A rear container is limited to ${MAX_REAR_CONTAINER_KG} kg under MoRTH notification GSR 175(E).`,
    });
  }
  if (pillion > 0 && topBox > 0) {
    warnings.push({
      level: "info",
      text: "If the container is mounted behind the driver's seat, GSR 175(E) treats the two-wheeler as a one-seater and no pillion is allowed.",
    });
  }

  let status = "ok";
  if (warnings.some((warning) => warning.level === "danger")) status = "danger";
  else if (warnings.some((warning) => warning.level === "warning")) status = "warning";

  return {
    payloadCapacity,
    payloadUsed,
    payloadRemaining,
    payloadUtil,
    totalLaden,
    grossVehicleWeightKg,
    frontAxle,
    rearAxle,
    frontShare,
    rearTyreCapacityKg,
    rearTyreUtil,
    warnings,
    status,
  };
}
