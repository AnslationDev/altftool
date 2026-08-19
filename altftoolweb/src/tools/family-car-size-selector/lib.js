/**
 * Matching a car body type to the number of people and the amount of luggage a
 * family actually moves.
 *
 * SEATS. Straightforward to count, except for child seats. Almost every car
 * has three rear belts but only two ISOFIX positions, and two bulky child
 * seats plus a third across a standard bench rarely fits. Three across is a
 * property of the car, not of the seats, so it is treated as a capability that
 * only some body types have.
 *
 * LUGGAGE. Boot volumes are published to the VDA method, which measures how
 * many 200 x 100 x 50 mm blocks fit in the space. Real luggage is rigid and
 * awkwardly shaped, so a boot cannot be filled to its VDA figure — a realistic
 * planning assumption is around 80% for wheeled cases and pushchairs:
 *
 *   boot needed = total luggage volume / packing efficiency
 *
 * THE THIRD ROW. The point most often missed when buying a seven-seater: with
 * the third row upright, the boot behind it collapses to roughly the size of a
 * supermini's, typically 150-300 litres. A seven-seater used as a seven-seater
 * is a small-boot car, so the two cases are compared separately.
 *
 * LENGTH. A UK standard parking bay is 4.8 x 2.4 m, so anything longer than
 * 4.8 m overhangs. In India the four-metre rule matters more: passenger cars
 * up to 4.0 m long with a petrol engine up to 1,200 cc or a diesel up to
 * 1,500 cc fall into a lower tax bracket, which is why so many models stop
 * just under that length.
 *
 * RANKING. Among the body types that meet every requirement, the smallest is
 * ranked first. A car that is bigger than the family needs costs more to buy,
 * fuel, park and insure for the rest of its life.
 */

/** Share of the published VDA boot volume that real luggage actually occupies. */
export const PACKING_EFFICIENCY = 0.8;

/** UK standard parking bay, metres. */
export const STANDARD_BAY_LENGTH_M = 4.8;
export const STANDARD_BAY_WIDTH_M = 2.4;

/** Indian small-car tax threshold, metres. */
export const INDIA_SMALL_CAR_LENGTH_M = 4.0;

/** ISOFIX positions fitted to a typical rear bench. */
export const TYPICAL_ISOFIX_POSITIONS = 2;

/** Luggage items and their approximate packed volume in litres. */
export const LUGGAGE_ITEMS = [
  { id: "cabin", label: "Cabin bag / carry-on", litres: 40 },
  { id: "medium-case", label: "Medium check-in suitcase", litres: 70 },
  { id: "large-case", label: "Large suitcase", litres: 100 },
  { id: "holdall", label: "Soft holdall or duffel", litres: 50 },
  { id: "pushchair", label: "Compact folding pushchair", litres: 60 },
  { id: "travel-system", label: "Full travel system pram", litres: 110 },
  { id: "spare-seat", label: "Spare child seat", litres: 40 },
  { id: "dog-crate", label: "Medium dog crate", litres: 120 },
  { id: "golf", label: "Golf bag", litres: 90 },
  { id: "sports-kit", label: "Sports kit bag", litres: 45 },
  { id: "weekly-shop", label: "Weekly grocery shop", litres: 60 },
  { id: "buggy-board", label: "Cool box", litres: 35 },
];

/**
 * Body types with typical published figures. Boot volumes are VDA litres with
 * all fitted seats upright; `bootRearFolded` is with the rearmost row down.
 */
export const BODY_TYPES = [
  {
    id: "city",
    label: "City car",
    seats: 4,
    boot: 200,
    bootRearFolded: 700,
    thirdRowBoot: null,
    lengthM: 3.6,
    threeAcross: false,
    isofix: 2,
    pros: "Cheapest to run, park and insure. Fits anywhere.",
    cons: "Four seats, a small boot and limited rear legroom behind a tall driver.",
  },
  {
    id: "supermini",
    label: "Supermini hatchback",
    seats: 5,
    boot: 300,
    bootRearFolded: 1000,
    thirdRowBoot: null,
    lengthM: 4.0,
    threeAcross: false,
    isofix: 2,
    pros: "Under the four-metre mark, so easy to park and cheap to tax in India.",
    cons: "One child seat plus an adult in the back is about the limit, and the boot swallows a pushchair or the shopping, not both.",
  },
  {
    id: "hatchback",
    label: "Family hatchback",
    seats: 5,
    boot: 380,
    bootRearFolded: 1250,
    thirdRowBoot: null,
    lengthM: 4.4,
    threeAcross: false,
    isofix: 2,
    pros: "The default family car for a reason — enough space for two children and a week away, with the running costs of a small car.",
    cons: "Two child seats fill the rear, and the boot is tight with a full-size pram plus cases.",
  },
  {
    id: "compact-suv",
    label: "Compact SUV",
    seats: 5,
    boot: 420,
    bootRearFolded: 1350,
    thirdRowBoot: null,
    lengthM: 4.4,
    threeAcross: false,
    isofix: 2,
    pros: "Higher seats make fitting a child seat far easier on your back, and the boot lip is at a sensible height.",
    cons: "Heavier and thirstier than the hatchback it is based on, for very little extra usable space.",
  },
  {
    id: "saloon",
    label: "Saloon",
    seats: 5,
    boot: 480,
    bootRearFolded: 900,
    thirdRowBoot: null,
    lengthM: 4.7,
    threeAcross: false,
    isofix: 2,
    pros: "A big, secure boot and the quietest cabin of the five-seaters.",
    cons: "The letterbox opening is the limit, not the volume. A pushchair that fits an estate may not go through a saloon's aperture.",
  },
  {
    id: "estate",
    label: "Estate",
    seats: 5,
    boot: 580,
    bootRearFolded: 1650,
    thirdRowBoot: null,
    lengthM: 4.8,
    threeAcross: false,
    isofix: 2,
    pros: "The most usable space per litre of fuel. A square opening and a flat floor beat a bigger number in an awkward shape.",
    cons: "Long, so it needs a full-size parking bay, and still only five seats.",
  },
  {
    id: "mid-suv",
    label: "Mid-size SUV",
    seats: 5,
    boot: 550,
    bootRearFolded: 1600,
    thirdRowBoot: null,
    lengthM: 4.7,
    threeAcross: false,
    isofix: 2,
    pros: "Space close to an estate with a higher driving position and an easier boot height.",
    cons: "More expensive to buy and run than the equivalent estate for the same interior space.",
  },
  {
    id: "mpv",
    label: "Seven-seat MPV",
    seats: 7,
    boot: 700,
    bootRearFolded: 1800,
    thirdRowBoot: 250,
    lengthM: 4.7,
    threeAcross: true,
    isofix: 3,
    pros: "The only body type designed around people rather than styling. Sliding doors, a flat floor and often three child seats across the middle row.",
    cons: "With all seven seats up the boot is supermini-sized. Resale is weaker than an SUV.",
  },
  {
    id: "large-suv",
    label: "Seven-seat SUV",
    seats: 7,
    boot: 650,
    bootRearFolded: 1900,
    thirdRowBoot: 200,
    lengthM: 4.9,
    threeAcross: true,
    isofix: 3,
    pros: "Seven seats, high driving position and towing capacity in one car.",
    cons: "Over the 4.8 m standard bay, expensive to run, and the third row is only really for children.",
  },
  {
    id: "van-mpv",
    label: "Van-based people carrier",
    seats: 8,
    boot: 900,
    bootRearFolded: 2500,
    thirdRowBoot: 350,
    lengthM: 5.0,
    threeAcross: true,
    isofix: 3,
    pros: "The only sensible answer above seven people or with a lot of luggage behind a full load of passengers.",
    cons: "Drives like what it is. Height can be a problem in car parks with barriers.",
  },
];

const round = (value, places = 0) => {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
};

const num = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : NaN;
};

/** Total packed volume of a luggage list, in litres. */
export function luggageVolume(counts = {}) {
  let total = 0;
  for (const item of LUGGAGE_ITEMS) {
    const n = Number(counts[item.id]);
    if (!Number.isFinite(n) || n <= 0) continue;
    total += n * item.litres;
  }
  return total;
}

/** Boot volume actually required, allowing for imperfect packing. */
export function bootRequired(luggageLitres, efficiency = PACKING_EFFICIENCY) {
  const litres = num(luggageLitres);
  const eff = num(efficiency);
  if (!Number.isFinite(litres) || litres < 0) return null;
  if (!Number.isFinite(eff) || eff <= 0 || eff > 1) return null;
  return litres / eff;
}

/**
 * Choose a body type.
 *
 * @param {object} input
 * @param {number} input.adults
 * @param {number} input.children
 * @param {number} [input.childSeats]     how many child seats travel in one row
 * @param {object} [input.luggage]        { [itemId]: count }
 * @param {number} [input.maxLengthM]     longest car that fits your space
 * @param {number} [input.packingEfficiency]
 * @returns {object} { error } or the recommendation
 */
export function selectFamilyCar({
  adults = 2,
  children = 2,
  childSeats = 1,
  luggage = {},
  maxLengthM = STANDARD_BAY_LENGTH_M,
  packingEfficiency = PACKING_EFFICIENCY,
} = {}) {
  const a = num(adults);
  const c = num(children);
  const seats = num(childSeats);
  if (!Number.isFinite(a) || a < 0 || !Number.isFinite(c) || c < 0) {
    return { error: "Adults and children both have to be zero or more." };
  }
  const people = Math.round(a + c);
  if (people < 1) {
    return { error: "Someone has to be in the car — enter at least one person." };
  }
  if (people > 9) {
    return { error: "Above nine people you are looking at a minibus rather than a car, and a different licence category may apply." };
  }
  if (!Number.isFinite(seats) || seats < 0 || seats > c) {
    return { error: "The number of child seats cannot be more than the number of children." };
  }

  const maxLength = num(maxLengthM);
  if (!Number.isFinite(maxLength) || maxLength < 2.5 || maxLength > 8) {
    return { error: "The length limit should be between 2.5 and 8 metres. Measure the bay or garage rather than guessing." };
  }

  const efficiency = num(packingEfficiency);
  if (!Number.isFinite(efficiency) || efficiency < 0.2 || efficiency > 1) {
    return { error: "Packing efficiency has to be between 0.2 and 1. Around 0.8 is realistic for wheeled cases." };
  }

  const litres = luggageVolume(luggage);
  const needBoot = bootRequired(litres, efficiency);
  const needThreeAcross = seats >= 3;

  const candidates = BODY_TYPES.map((body) => {
    // With more than five people the third row is in use, so the boot behind
    // it is the number that matters, not the seats-up figure.
    const usingThirdRow = people > 5 && body.seats > 5;
    const usableBoot = usingThirdRow && body.thirdRowBoot !== null ? body.thirdRowBoot : body.boot;

    const seatsOk = body.seats >= people;
    const bootOk = usableBoot >= needBoot;
    const lengthOk = body.lengthM <= maxLength;
    const threeAcrossOk = !needThreeAcross || body.threeAcross;
    const fits = seatsOk && bootOk && lengthOk && threeAcrossOk;

    const reasons = [];
    if (!seatsOk) reasons.push(`only ${body.seats} seats for ${people} people`);
    if (!bootOk) reasons.push(`${usableBoot} L of boot against the ${round(needBoot)} L you need${usingThirdRow ? " with the third row up" : ""}`);
    if (!lengthOk) reasons.push(`${body.lengthM} m long against your ${maxLength} m limit`);
    if (!threeAcrossOk) reasons.push(`no three-across child seat capability`);

    return {
      id: body.id,
      label: body.label,
      seats: body.seats,
      boot: body.boot,
      bootRearFolded: body.bootRearFolded,
      thirdRowBoot: body.thirdRowBoot,
      usableBoot,
      usingThirdRow,
      lengthM: body.lengthM,
      isofix: body.isofix,
      threeAcross: body.threeAcross,
      pros: body.pros,
      cons: body.cons,
      seatsOk,
      bootOk,
      lengthOk,
      threeAcrossOk,
      fits,
      reasons,
      spareSeats: body.seats - people,
      spareBoot: round(usableBoot - needBoot),
      overFourMetres: body.lengthM > INDIA_SMALL_CAR_LENGTH_M,
      overStandardBay: body.lengthM > STANDARD_BAY_LENGTH_M,
    };
  });

  // Smallest adequate first: shortest car, then least surplus boot.
  const matches = candidates
    .filter((c2) => c2.fits)
    .sort((x, y) => x.lengthM - y.lengthM || x.spareBoot - y.spareBoot);

  const best = matches[0] || null;

  // Nearest miss, for when nothing fits: fewest failed constraints.
  const nearest = candidates
    .filter((c2) => !c2.fits)
    .sort((x, y) => x.reasons.length - y.reasons.length || x.lengthM - y.lengthM)[0] || null;

  const warnings = [];
  if (!best) {
    warnings.push(
      `Nothing on the list clears every requirement. The nearest is the ${nearest ? nearest.label.toLowerCase() : "largest option"}, which falls short on ${nearest ? nearest.reasons.join(" and ") : "space"}. Either raise the length limit, or plan to use a roof box or a towed trailer for the luggage.`,
    );
  }
  if (needThreeAcross) {
    warnings.push(
      `Three child seats in one row rules out most cars. A typical rear bench has three belts but only ${TYPICAL_ISOFIX_POSITIONS} ISOFIX positions, and two bulky seats leave no room for a third. Try the actual seats in the actual car before buying either.`,
    );
  }
  if (people > 5) {
    warnings.push(
      `With ${people} people the third row is in use, so the boot behind it is what you get — typically 150 to 300 litres, about the size of a supermini's. Seven seats and a week's luggage at the same time usually means a van-based people carrier or a roof box.`,
    );
  }
  if (best && best.overStandardBay) {
    warnings.push(
      `At ${best.lengthM} m this is longer than the ${STANDARD_BAY_LENGTH_M} m standard parking bay, so it will overhang in a marked space and be awkward in multi-storey car parks.`,
    );
  }
  if (best && best.overFourMetres) {
    warnings.push(
      `Cars over ${INDIA_SMALL_CAR_LENGTH_M} m fall outside India's small-car tax bracket, which is why so many models stop just under that length.`,
    );
  }

  return {
    people,
    adults: Math.round(a),
    children: Math.round(c),
    childSeats: Math.round(seats),
    needThreeAcross,
    luggageLitres: round(litres),
    bootNeeded: round(needBoot),
    packingEfficiency: round(efficiency, 2),
    maxLengthM: round(maxLength, 2),
    candidates,
    matches,
    best,
    nearest,
    warnings,
  };
}
