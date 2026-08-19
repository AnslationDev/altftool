/**
 * Engine coolant mixing: glycol/water ratio, freeze point, boil point.
 *
 * Freeze and boil points are read from the published glycol/water property
 * curves (the same ASTM D1177 style tables printed on coolant packaging) and
 * linearly interpolated between the tabulated points.
 *
 * Note the shape of the ethylene glycol freeze curve: protection improves down
 * to a eutectic minimum near 68-70% glycol by volume and then gets WORSE again,
 * with pure undiluted glycol freezing at only about -13 °C. Running neat
 * coolant is therefore both worse for freeze protection and worse for heat
 * transfer than a correct mix.
 */

/** Glycol volume % -> freeze point °C, and volume % -> boil point °C at 1 atm. */
const EG_FREEZE = [
  [0, 0],
  [10, -3.4],
  [20, -8.9],
  [30, -15.6],
  [40, -24.4],
  [50, -36.7],
  [60, -51.7],
  [70, -64.4],
  [80, -46.7],
  [90, -29.4],
  [100, -12.8],
];

const EG_BOIL = [
  [0, 100],
  [10, 101],
  [20, 102],
  [30, 104],
  [40, 106],
  [50, 108],
  [60, 111],
  [70, 114],
  [80, 124],
  [90, 141],
  [100, 197],
];

const PG_FREEZE = [
  [0, 0],
  [10, -3.3],
  [20, -7.8],
  [30, -13.3],
  [40, -21.1],
  [50, -32.8],
  [60, -48.3],
];

const PG_BOIL = [
  [0, 100],
  [10, 100.5],
  [20, 101],
  [30, 102],
  [40, 103],
  [50, 104],
  [60, 106],
];

export const COOLANT_TYPES = [
  {
    id: "eg",
    label: "Ethylene glycol (green, red, pink or orange OAT coolant)",
    maxPercent: 100,
    freeze: EG_FREEZE,
    boil: EG_BOIL,
    note: "The normal automotive coolant. Toxic if swallowed — keep it away from pets and children.",
  },
  {
    id: "pg",
    label: "Propylene glycol (low-toxicity coolant)",
    maxPercent: 60,
    freeze: PG_FREEZE,
    boil: PG_BOIL,
    note: "Less toxic, slightly poorer heat transfer; usable to about 60% by volume.",
  },
];

/** What is in the bottle you bought. */
export const PRODUCT_FORMS = [
  { id: "concentrate", label: "Concentrate (undiluted, mix with water)", strength: 100 },
  { id: "premix50", label: "Ready-to-use 50:50 premix", strength: 50 },
];

/** Below this the corrosion-inhibitor package is under-dosed. Typical OEM floor. */
export const RECOMMENDED_MIN_PERCENT = 33;
/** Above this heat transfer starts to fall away noticeably. Typical OEM ceiling. */
export const RECOMMENDED_MAX_PERCENT = 60;
/**
 * Ethylene glycol freeze protection peaks near this concentration, then worsens.
 * Matches the EG_FREEZE table's own minimum (interpolated point at 70%) so the
 * warning never contradicts the freeze point shown for the same input.
 */
export const EG_EUTECTIC_PERCENT = 70;

/* Antoine constants for water, valid 99-374 °C (pressure in mmHg). */
const ANTOINE_A = 8.14019;
const ANTOINE_B = 1810.94;
const ANTOINE_C = 244.485;
const MMHG_PER_BAR = 750.062;
const ATM_BAR = 1.01325;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Linear interpolation over a [x, y] table, clamped to the table's range. */
function interpolate(table, x) {
  if (x <= table[0][0]) return table[0][1];
  const last = table[table.length - 1];
  if (x >= last[0]) return last[1];
  for (let i = 1; i < table.length; i += 1) {
    const [x1, y1] = table[i];
    if (x <= x1) {
      const [x0, y0] = table[i - 1];
      const t = (x - x0) / (x1 - x0);
      return y0 + t * (y1 - y0);
    }
  }
  return last[1];
}

export function getCoolantType(id) {
  return COOLANT_TYPES.find((type) => type.id === id) || null;
}

export function getProductForm(id) {
  return PRODUCT_FORMS.find((form) => form.id === id) || null;
}

/** Freeze point in °C for a glycol concentration given as volume percent. */
export function freezePointC(typeId, percent) {
  const type = getCoolantType(typeId);
  if (!type || !isNum(percent)) return NaN;
  return interpolate(type.freeze, percent);
}

/** Boil point in °C at sea-level atmospheric pressure (no radiator cap). */
export function boilPointAtmC(typeId, percent) {
  const type = getCoolantType(typeId);
  if (!type || !isNum(percent)) return NaN;
  return interpolate(type.boil, percent);
}

/**
 * Extra boiling headroom given by the radiator cap, in °C.
 * Water saturation temperature at the raised absolute pressure, minus 100 °C.
 * At 1.1 bar gauge this returns about 22 °C, matching steam tables.
 */
export function pressureBoilRiseC(gaugeBar) {
  if (!isNum(gaugeBar) || gaugeBar < 0) return NaN;
  return waterSatTempC(ATM_BAR + gaugeBar) - waterSatTempC(ATM_BAR);
}

/** Water saturation temperature in °C at an absolute pressure in bar. */
function waterSatTempC(absoluteBar) {
  const mmHg = absoluteBar * MMHG_PER_BAR;
  return ANTOINE_B / (ANTOINE_A - Math.log10(mmHg)) - ANTOINE_C;
}

/**
 * Work out how much coolant product and how much water to put in the system.
 *
 * @param {object} input
 * @param {number} input.systemLitres     total cooling-system capacity in litres
 * @param {number} input.targetPercent    desired glycol concentration, volume %
 * @param {string} input.coolantType      COOLANT_TYPES[].id
 * @param {string} input.productForm      PRODUCT_FORMS[].id
 * @param {number} input.capPressureBar   radiator cap rating, bar gauge
 */
export function mixCoolant({
  systemLitres,
  targetPercent,
  coolantType,
  productForm,
  capPressureBar,
}) {
  const type = getCoolantType(coolantType);
  if (!type) return { error: "Choose a coolant chemistry." };
  const form = getProductForm(productForm);
  if (!form) return { error: "Choose whether your coolant is concentrate or ready-to-use premix." };

  if (![systemLitres, targetPercent, capPressureBar].every(isNum)) {
    return { error: "Enter valid numbers for capacity, concentration and cap pressure." };
  }
  if (systemLitres <= 0) return { error: "Cooling system capacity must be greater than zero." };
  if (systemLitres > 100) return { error: "That capacity is far beyond a car cooling system — check the figure." };
  if (targetPercent < 0 || targetPercent > 100) {
    return { error: "Glycol concentration must be between 0% and 100% by volume." };
  }
  if (targetPercent > type.maxPercent) {
    return { error: `This chemistry is only characterised up to ${type.maxPercent}% by volume.` };
  }
  if (targetPercent > form.strength) {
    return {
      error: `A ${form.strength}% product cannot reach ${targetPercent}% — you need concentrate for that.`,
    };
  }
  if (capPressureBar < 0 || capPressureBar > 3) {
    return { error: "Radiator cap pressure should be between 0 and 3 bar." };
  }

  // Volume of product needed so that product volume x strength = target glycol volume.
  const productLitres = (systemLitres * targetPercent) / form.strength;
  const waterLitres = systemLitres - productLitres;

  const freeze = freezePointC(type.id, targetPercent);
  const boilAtm = boilPointAtmC(type.id, targetPercent);
  const capRise = pressureBoilRiseC(capPressureBar);
  const boilWithCap = boilAtm + capRise;

  const warnings = [];
  if (targetPercent < RECOMMENDED_MIN_PERCENT) {
    warnings.push(
      `Below ${RECOMMENDED_MIN_PERCENT}% the corrosion inhibitors are too dilute to protect aluminium and gaskets, whatever the climate.`,
    );
  }
  if (targetPercent > RECOMMENDED_MAX_PERCENT) {
    warnings.push(
      `Above ${RECOMMENDED_MAX_PERCENT}% the mixture carries heat away more slowly, so the engine runs hotter even though it boils later.`,
    );
  }
  if (type.id === "eg" && targetPercent > EG_EUTECTIC_PERCENT) {
    warnings.push(
      `Past about ${EG_EUTECTIC_PERCENT}% glycol the freeze point rises again — neat ethylene glycol freezes at only -12.8 °C.`,
    );
  }
  if (capPressureBar === 0) {
    warnings.push("With no cap pressure the system boils far sooner; a missing or weak cap is a common overheating cause.");
  }

  // Round one side and derive the other by subtraction so the displayed ratio
  // always sums to 100, even when targetPercent lands on an exact .5.
  const glycolRatio = Math.round(targetPercent);

  return {
    coolantLabel: type.label,
    productLabel: form.label,
    productStrength: form.strength,
    systemLitres,
    targetPercent,
    productLitres: Math.round(productLitres * 100) / 100,
    waterLitres: Math.round(waterLitres * 100) / 100,
    ratioText: `${glycolRatio} : ${100 - glycolRatio} glycol to water`,
    freezePointC: Math.round(freeze * 10) / 10,
    boilPointAtmC: Math.round(boilAtm * 10) / 10,
    capRiseC: Math.round(capRise * 10) / 10,
    boilPointWithCapC: Math.round(boilWithCap * 10) / 10,
    withinRecommended:
      targetPercent >= RECOMMENDED_MIN_PERCENT && targetPercent <= RECOMMENDED_MAX_PERCENT,
    warnings,
  };
}

/**
 * How much of the existing mixture to drain and replace to reach a target
 * concentration, without flushing the whole system.
 *
 * Final concentration = (current x (V - x) + strength x x) / V, solved for x.
 */
export function drainAndFillLitres({ systemLitres, currentPercent, targetPercent, productStrength }) {
  if (![systemLitres, currentPercent, targetPercent, productStrength].every(isNum)) {
    return { error: "Enter valid numbers for capacity and both concentrations." };
  }
  if (systemLitres <= 0) return { error: "Cooling system capacity must be greater than zero." };
  if ([currentPercent, targetPercent, productStrength].some((v) => v < 0 || v > 100)) {
    return { error: "Concentrations must be between 0% and 100%." };
  }
  if (Math.abs(targetPercent - currentPercent) < 0.01) {
    return { drainLitres: 0, note: "The system is already at the target concentration." };
  }
  if (targetPercent > currentPercent && productStrength <= currentPercent) {
    return {
      error: "Your product is not stronger than what is already in the system, so topping up cannot raise the concentration.",
    };
  }
  if (targetPercent < currentPercent && productStrength >= currentPercent) {
    return {
      error: "To dilute the system you have to drain and refill with plain distilled water.",
    };
  }

  const drain = (systemLitres * (targetPercent - currentPercent)) / (productStrength - currentPercent);
  if (drain < 0 || drain > systemLitres) {
    return { error: "That target is not reachable with a single drain and fill — flush the system instead." };
  }
  return {
    drainLitres: Math.round(drain * 100) / 100,
    refillLitres: Math.round(drain * 100) / 100,
    note: `Drain ${Math.round(drain * 100) / 100} L of the old mixture and put back the same volume of the new product.`,
  };
}
