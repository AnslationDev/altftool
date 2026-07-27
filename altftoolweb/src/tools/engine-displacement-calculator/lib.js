/**
 * Engine displacement (swept volume) from bore, stroke and cylinder count.
 *
 * A piston sweeps a cylinder of diameter = bore and height = stroke, so
 *
 *   swept volume per cylinder = (pi / 4) * bore^2 * stroke
 *   total displacement        = swept volume per cylinder * number of cylinders
 *
 * With bore and stroke in millimetres the result is in mm^3; 1000 mm^3 = 1 cm^3 = 1 cc.
 *
 * If a compression ratio is supplied, the clearance volume follows from its
 * definition CR = (swept + clearance) / clearance, so clearance = swept / (CR - 1).
 */

/** 1 inch = 25.4 mm exactly (international inch, 1959 agreement). */
export const MM_PER_INCH = 25.4;

/** 1 cubic inch = 25.4^3 mm^3 = 16.387064 cm^3, exact. */
export const CC_PER_CUBIC_INCH = MM_PER_INCH ** 3 / 1000;

export const LENGTH_UNITS = [
  { id: "mm", label: "Millimetres", short: "mm", toMm: 1 },
  { id: "in", label: "Inches", short: "in", toMm: MM_PER_INCH },
];

const MAX_CYLINDERS = 16;
const MAX_BORE_MM = 500; // far beyond any road or racing engine
const MAX_STROKE_MM = 700;

/**
 * Third-party motor insurance in India is priced in engine-capacity slabs.
 * IRDAI's two-wheeler slabs are: up to 75 cc, above 75 and up to 150 cc,
 * above 150 and up to 350 cc, and above 350 cc.
 */
export const TWO_WHEELER_SLABS = [
  { max: 75, label: "Up to 75 cc" },
  { max: 150, label: "Above 75 cc and up to 150 cc" },
  { max: 350, label: "Above 150 cc and up to 350 cc" },
  { max: Infinity, label: "Above 350 cc" },
];

/**
 * IRDAI private car third-party slabs: up to 1000 cc, above 1000 and up to
 * 1500 cc, and above 1500 cc.
 */
export const CAR_SLABS = [
  { max: 1000, label: "Up to 1000 cc" },
  { max: 1500, label: "Above 1000 cc and up to 1500 cc" },
  { max: Infinity, label: "Above 1500 cc" },
];

/**
 * GST "small car" engine limits used for the lower compensation-cess band:
 * petrol/CNG/LPG up to 1200 cc, diesel up to 1500 cc, with length up to 4000 mm.
 */
export const SMALL_CAR_PETROL_CC = 1200;
export const SMALL_CAR_DIESEL_CC = 1500;
export const SMALL_CAR_MAX_LENGTH_MM = 4000;

function slabLabel(slabs, cc) {
  for (const slab of slabs) {
    if (cc <= slab.max) return slab.label;
  }
  return slabs[slabs.length - 1].label;
}

/** "Oversquare" when bore exceeds stroke, "undersquare" when stroke exceeds bore. */
export function boreStrokeCharacter(ratio) {
  if (ratio > 1.02) return "Oversquare (short stroke) — revs freely, favours peak power";
  if (ratio < 0.98) return "Undersquare (long stroke) — favours low-end torque";
  return "Square — bore and stroke are practically equal";
}

/**
 * @returns {{error:string}|object} displacement in several units plus derived figures
 */
export function computeDisplacement({
  bore,
  stroke,
  cylinders,
  unit = "mm",
  compressionRatio = 0,
}) {
  const chosen = LENGTH_UNITS.find((u) => u.id === unit);
  if (!chosen) return { error: "Choose millimetres or inches for bore and stroke." };

  const numbers = [bore, stroke, cylinders, compressionRatio];
  if (numbers.some((n) => typeof n !== "number" || !Number.isFinite(n))) {
    return { error: "Enter a valid number for bore, stroke and cylinder count." };
  }
  if (bore <= 0 || stroke <= 0) {
    return { error: "Bore and stroke must both be greater than zero." };
  }

  const boreMm = bore * chosen.toMm;
  const strokeMm = stroke * chosen.toMm;
  if (boreMm > MAX_BORE_MM || strokeMm > MAX_STROKE_MM) {
    return { error: "Bore and stroke look far too large — check the unit you selected." };
  }
  if (!Number.isInteger(cylinders) || cylinders < 1) {
    return { error: "Cylinder count must be a whole number of at least 1." };
  }
  if (cylinders > MAX_CYLINDERS) {
    return { error: `This calculator handles up to ${MAX_CYLINDERS} cylinders.` };
  }
  if (compressionRatio !== 0 && compressionRatio <= 1) {
    return { error: "Compression ratio must be greater than 1 (leave it at 0 to skip)." };
  }
  if (compressionRatio > 30) {
    return { error: "Compression ratio above 30:1 is outside the range of piston engines." };
  }

  const perCylinderMm3 = (Math.PI / 4) * boreMm * boreMm * strokeMm;
  const perCylinderCc = perCylinderMm3 / 1000;
  const totalCc = perCylinderCc * cylinders;
  const ratio = boreMm / strokeMm;

  const clearanceCcPerCylinder =
    compressionRatio > 1 ? perCylinderCc / (compressionRatio - 1) : null;

  return {
    boreMm,
    strokeMm,
    perCylinderCc,
    totalCc,
    litres: totalCc / 1000,
    cubicInches: totalCc / CC_PER_CUBIC_INCH,
    boreStrokeRatio: ratio,
    boreStrokeCharacter: boreStrokeCharacter(ratio),
    clearanceCcPerCylinder,
    totalChamberCc:
      clearanceCcPerCylinder === null ? null : (perCylinderCc + clearanceCcPerCylinder) * cylinders,
    twoWheelerSlab: slabLabel(TWO_WHEELER_SLABS, totalCc),
    carSlab: slabLabel(CAR_SLABS, totalCc),
    smallCarPetrol: totalCc <= SMALL_CAR_PETROL_CC,
    smallCarDiesel: totalCc <= SMALL_CAR_DIESEL_CC,
  };
}
