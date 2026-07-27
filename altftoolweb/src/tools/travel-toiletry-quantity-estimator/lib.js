/**
 * Travel toiletry quantity estimator.
 *
 * Converts trip length and habits into millilitres, then millilitres into
 * bottles, then bottles into a verdict against the cabin liquids rule.
 *
 * DOSE FIGURES USED
 * - Shampoo: about 10 ml a wash for short hair, 20 ml for medium and 30 ml for
 *   long — roughly a 10p coin, a 50p coin and two of them.
 * - Shower gel: about 10 ml a shower.
 * - Toothpaste: 1 g a brushing is normal adult usage. Dental guidance is a
 *   pea-sized amount, about 0.25 g for an adult and a smear for under-threes,
 *   so this figure is deliberately generous rather than aspirational.
 * - Moisturiser: dermatology measures topicals in fingertip units, where one
 *   FTU is about 0.5 g and covers two adult palms. A face application is
 *   roughly 1.5 ml; a whole adult body is roughly 20 ml.
 * - Sunscreen: the 2 mg/cm² dose is about 30 ml for a whole adult body and
 *   about 15 ml for face, neck, arms and lower legs, reapplied every 2 hours.
 * - Hand sanitiser: about 3 ml, the amount that keeps hands wet for the 20-30
 *   seconds of rubbing the WHO hand-hygiene method calls for.
 * - Roll-on deodorant about 0.5 ml, shaving gel about 5 ml a shave, contact
 *   lens solution about 10 ml a night.
 *
 * CABIN RULE
 * The ICAO one-bag standard used by TSA, the EU and Indian security (BCAS):
 * every container 100 ml or less, all of them inside one transparent
 * resealable bag of at most 1 litre, one bag per passenger. Crucially the bag
 * is judged on container sizes, not on how much liquid is inside them, so this
 * tool totals the bottles it selects rather than the contents.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

export const LIQUID_CONTAINER_MAX_ML = 100;
export const LIQUID_BAG_MAX_ML = 1000;

/** Travel bottle sizes commonly sold, in millilitres. */
export const TRAVEL_SIZES = [30, 50, 75, 100];

/** Shampoo and conditioner dose per wash by hair length, in millilitres. */
export const HAIR_DOSE_ML = {
  short: { label: "Short", shampoo: 10, conditioner: 5 },
  medium: { label: "Medium", shampoo: 20, conditioner: 12 },
  long: { label: "Long", shampoo: 30, conditioner: 20 },
};

/** Single-use doses, in millilitres unless stated. */
export const DOSES = {
  showerGelMl: 10,
  toothpasteG: 1,
  deodorantMl: 0.5,
  faceMoisturiserMl: 1.5,
  bodyLotionMl: 20,
  sunscreenExposedMl: 15,
  shavingGelMl: 5,
  contactSolutionMl: 10,
  sanitiserMl: 3,
  cleanserMl: 5,
};

export const MIN_DAYS = 1;
export const MAX_DAYS = 90;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const ceil = (value) => Math.ceil(value - 1e-9);
const round1 = (value) => Math.round(value * 10) / 10;

/**
 * Smallest travel container set that holds a given volume.
 * Above 100 ml the cabin rule forces multiple 100 ml bottles.
 *
 * @param {number} ml
 * @returns {{ containerMl:number, count:number, totalContainerMl:number }}
 */
export function chooseContainers(ml) {
  if (!isNum(ml) || ml <= 0) return { containerMl: 0, count: 0, totalContainerMl: 0 };
  const fit = TRAVEL_SIZES.find((size) => ml <= size);
  if (fit) return { containerMl: fit, count: 1, totalContainerMl: fit };
  const count = ceil(ml / LIQUID_CONTAINER_MAX_ML);
  return {
    containerMl: LIQUID_CONTAINER_MAX_ML,
    count,
    totalContainerMl: LIQUID_CONTAINER_MAX_ML * count,
  };
}

/**
 * How many days a bottle you already own will last.
 * @param {number} bottleMl
 * @param {number} mlPerDay
 * @returns {{ days:number } | { error:string }}
 */
export function daysPerBottle(bottleMl, mlPerDay) {
  if (!isNum(bottleMl) || bottleMl <= 0) return { error: "Enter the bottle size in millilitres." };
  if (!isNum(mlPerDay) || mlPerDay <= 0) {
    return { error: "Daily use has to be greater than zero to estimate a run-out date." };
  }
  return { days: round1(bottleMl / mlPerDay) };
}

/**
 * Full toiletry estimate.
 *
 * @param {object} input
 * @param {number} input.days
 * @param {"short"|"medium"|"long"} input.hairLength
 * @param {number} input.washesPerWeek
 * @param {number} input.showersPerDay
 * @param {number} input.brushingsPerDay
 * @param {number} input.sunscreenAppsPerDay
 * @param {number} input.shavesPerWeek
 * @param {number} input.sanitiserUsesPerDay
 * @param {boolean} input.usesConditioner
 * @param {boolean} input.usesBodyLotion
 * @param {boolean} input.usesFaceMoisturiser
 * @param {boolean} input.usesCleanser
 * @param {boolean} input.wearsContactLenses
 * @param {boolean} input.usesDeodorant
 * @returns {object | { error:string }}
 */
export function estimateToiletries(input) {
  const {
    days,
    hairLength = "medium",
    washesPerWeek = 4,
    showersPerDay = 1,
    brushingsPerDay = 2,
    sunscreenAppsPerDay = 2,
    shavesPerWeek = 3,
    sanitiserUsesPerDay = 4,
    usesConditioner = true,
    usesBodyLotion = false,
    usesFaceMoisturiser = true,
    usesCleanser = true,
    wearsContactLenses = false,
    usesDeodorant = true,
  } = input || {};

  const hair = HAIR_DOSE_ML[hairLength];
  if (!hair) return { error: "Pick a hair length." };
  if (!isNum(days)) return { error: "Enter the trip length in days as a number." };
  if (days < MIN_DAYS) return { error: "A trip has to be at least one day long." };
  if (days > MAX_DAYS) return { error: `Keep the trip under ${MAX_DAYS} days.` };
  if (!isNum(washesPerWeek) || washesPerWeek < 0 || washesPerWeek > 21) {
    return { error: "Enter between 0 and 21 hair washes a week." };
  }
  if (!isNum(showersPerDay) || showersPerDay < 0 || showersPerDay > 4) {
    return { error: "Enter between 0 and 4 showers a day." };
  }
  if (!isNum(brushingsPerDay) || brushingsPerDay < 0 || brushingsPerDay > 6) {
    return { error: "Enter between 0 and 6 brushings a day." };
  }
  if (!isNum(sunscreenAppsPerDay) || sunscreenAppsPerDay < 0 || sunscreenAppsPerDay > 8) {
    return { error: "Enter between 0 and 8 sunscreen applications a day." };
  }
  if (!isNum(shavesPerWeek) || shavesPerWeek < 0 || shavesPerWeek > 21) {
    return { error: "Enter between 0 and 21 shaves a week." };
  }
  if (!isNum(sanitiserUsesPerDay) || sanitiserUsesPerDay < 0 || sanitiserUsesPerDay > 30) {
    return { error: "Enter between 0 and 30 uses of hand sanitiser a day." };
  }

  const wholeDays = Math.round(days);
  const washes = ceil((washesPerWeek * wholeDays) / 7);
  const shaves = ceil((shavesPerWeek * wholeDays) / 7);
  const showers = ceil(showersPerDay * wholeDays);
  const brushings = ceil(brushingsPerDay * wholeDays);

  const rows = [
    {
      id: "shampoo",
      name: "Shampoo",
      uses: washes,
      unitLabel: "wash",
      perUseMl: hair.shampoo,
      solidSwap: "Solid shampoo bar",
    },
    {
      id: "conditioner",
      name: "Conditioner",
      uses: usesConditioner ? washes : 0,
      unitLabel: "wash",
      perUseMl: hair.conditioner,
      solidSwap: "Conditioner bar",
    },
    {
      id: "shower-gel",
      name: "Shower gel",
      uses: showers,
      unitLabel: "shower",
      perUseMl: DOSES.showerGelMl,
      solidSwap: "Bar soap",
    },
    {
      id: "toothpaste",
      name: "Toothpaste",
      uses: brushings,
      unitLabel: "brushing",
      perUseMl: DOSES.toothpasteG,
      solidSwap: "Toothpaste tablets",
      note: "1 g a brushing; dental guidance is a pea-sized 0.25 g for an adult",
    },
    {
      id: "deodorant",
      name: "Roll-on deodorant",
      uses: usesDeodorant ? wholeDays : 0,
      unitLabel: "day",
      perUseMl: DOSES.deodorantMl,
      solidSwap: "Solid deodorant stick",
    },
    {
      id: "face-moisturiser",
      name: "Face moisturiser",
      uses: usesFaceMoisturiser ? wholeDays * 2 : 0,
      unitLabel: "application",
      perUseMl: DOSES.faceMoisturiserMl,
      solidSwap: "Solid moisturiser stick",
      note: "Two applications a day at roughly three fingertip units each",
    },
    {
      id: "body-lotion",
      name: "Body lotion",
      uses: usesBodyLotion ? wholeDays : 0,
      unitLabel: "day",
      perUseMl: DOSES.bodyLotionMl,
      solidSwap: "Solid body butter bar",
      note: "A whole adult body takes about 20 ml, measured in fingertip units",
    },
    {
      id: "cleanser",
      name: "Face cleanser or micellar water",
      uses: usesCleanser ? wholeDays : 0,
      unitLabel: "day",
      perUseMl: DOSES.cleanserMl,
      solidSwap: "Cleansing bar",
    },
    {
      id: "sunscreen",
      name: "Sunscreen SPF 50+",
      uses: ceil(sunscreenAppsPerDay * wholeDays),
      unitLabel: "application",
      perUseMl: DOSES.sunscreenExposedMl,
      solidSwap: "Stick sunscreen",
      note: "15 ml covers face, neck, arms and lower legs at the 2 mg/cm² dose",
    },
    {
      id: "shaving-gel",
      name: "Shaving gel",
      uses: shaves,
      unitLabel: "shave",
      perUseMl: DOSES.shavingGelMl,
      solidSwap: "Shaving soap",
    },
    {
      id: "contact-solution",
      name: "Contact lens solution",
      uses: wearsContactLenses ? wholeDays : 0,
      unitLabel: "night",
      perUseMl: DOSES.contactSolutionMl,
      solidSwap: null,
    },
    {
      id: "sanitiser",
      name: "Hand sanitiser",
      uses: ceil(sanitiserUsesPerDay * wholeDays),
      unitLabel: "use",
      perUseMl: DOSES.sanitiserMl,
      solidSwap: "Sanitising wipes",
    },
  ];

  const items = [];
  let totalNeededMl = 0;
  let totalContainerMl = 0;
  let solidSwapSavingMl = 0;

  for (const row of rows) {
    if (row.uses <= 0 || row.perUseMl <= 0) continue;
    const neededMl = round1(row.uses * row.perUseMl);
    const containers = chooseContainers(neededMl);
    totalNeededMl += neededMl;
    totalContainerMl += containers.totalContainerMl;
    if (row.solidSwap) solidSwapSavingMl += containers.totalContainerMl;
    items.push({
      id: row.id,
      name: row.name,
      uses: row.uses,
      unitLabel: row.unitLabel,
      perUseMl: row.perUseMl,
      neededMl,
      containerMl: containers.containerMl,
      containerCount: containers.count,
      containerTotalMl: containers.totalContainerMl,
      solidSwap: row.solidSwap,
      note: row.note || "",
      overSingleContainer: neededMl > LIQUID_CONTAINER_MAX_ML,
    });
  }

  const mlPerDay = wholeDays > 0 ? round1(totalNeededMl / wholeDays) : 0;
  const overflowMl = totalContainerMl - LIQUID_BAG_MAX_ML;

  return {
    items,
    days: wholeDays,
    hairLabel: hair.label,
    washes,
    showers,
    brushings,
    totalNeededMl: round1(totalNeededMl),
    totalContainerMl,
    bagCapacityMl: LIQUID_BAG_MAX_ML,
    fitsCabinBag: totalContainerMl <= LIQUID_BAG_MAX_ML,
    overflowMl: overflowMl > 0 ? overflowMl : 0,
    remainingMl: overflowMl > 0 ? 0 : LIQUID_BAG_MAX_ML - totalContainerMl,
    solidSwapSavingMl,
    mlPerDay,
    fitsAfterSolidSwaps: totalContainerMl - solidSwapSavingMl <= LIQUID_BAG_MAX_ML,
  };
}
