/**
 * Mattress sizing, thickness and firmness selection.
 *
 * Everything here is published bedding-industry guidance, not a legal standard.
 * The numbers are stated as named constants so they can be checked and changed.
 */

/** Exact international inch. */
export const CM_PER_INCH = 2.54;

/**
 * Length rule: a mattress should be longer than the tallest sleeper so the
 * heels and head never reach the edge. The commonly published allowance is
 * 10 cm minimum, 15 cm for comfort.
 */
export const LENGTH_HEADROOM_MIN_CM = 10;
export const LENGTH_HEADROOM_COMFORT_CM = 15;

/**
 * Width rule per adult. 75 cm is what a 152 cm queen gives each of two adults.
 * 90 cm per adult is the "a full single each" benchmark used by sleep councils.
 */
export const WIDTH_PER_ADULT_MIN_CM = 75;
export const WIDTH_PER_ADULT_COMFORT_CM = 90;
/** A co-sleeping child needs roughly half an adult's width. */
export const WIDTH_PER_CHILD_CM = 45;
/** A medium dog or a cat that sleeps on the bed. */
export const WIDTH_PER_PET_CM = 30;

/** Walking clearance assumed on each side when checking against a room width. */
export const SIDE_CLEARANCE_CM = 45;

export const MAX_SLEEPERS = 2;

/**
 * Standard mattress sizes sold in India, stored in whole inches because that is
 * how brands quote them. Width x length.
 */
export const MATTRESS_SIZES = [
  { id: "single", label: "Single", widthIn: 36, lengthIn: 72 },
  { id: "single-long", label: "Single XL", widthIn: 36, lengthIn: 78 },
  { id: "double", label: "Double", widthIn: 48, lengthIn: 72 },
  { id: "double-long", label: "Double XL", widthIn: 48, lengthIn: 78 },
  { id: "queen", label: "Queen", widthIn: 60, lengthIn: 78 },
  { id: "queen-long", label: "Queen XL", widthIn: 60, lengthIn: 84 },
  { id: "king", label: "King", widthIn: 72, lengthIn: 78 },
  { id: "king-long", label: "King XL", widthIn: 72, lengthIn: 84 },
];

/**
 * Thickness guidance by body weight. Brands publish these bands because the
 * comfort layer has to be deep enough for the heaviest sleeper's hips to be
 * cradled without bottoming out on the support core.
 */
export const THICKNESS_BANDS = [
  { maxKg: 60, minCm: 15, maxCm: 20, note: "A 15-20 cm mattress supports a light sleeper fully." },
  { maxKg: 90, minCm: 20, maxCm: 25, note: "20-25 cm is the mainstream band for most adults." },
  { maxKg: 110, minCm: 25, maxCm: 30, note: "25-30 cm keeps hips off the support core at higher body weight." },
  { maxKg: Infinity, minCm: 30, maxCm: 35, note: "30 cm or more, with a reinforced high-density support core." },
];

/**
 * Firmness base score on a 1 (softest) to 10 (firmest) scale, by sleeping
 * position. Side sleepers need the shoulder and hip to sink so the spine stays
 * level; stomach sleepers need a firm surface so the lower back does not hollow.
 */
export const POSITION_BASE_FIRMNESS = {
  side: { score: 4, label: "Side", why: "The shoulder and hip must sink in so the spine stays level." },
  back: { score: 6.5, label: "Back", why: "The lumbar curve needs support without the hips dropping." },
  stomach: { score: 7.5, label: "Stomach", why: "A firm surface stops the lower back from hollowing." },
  combination: { score: 5.5, label: "Combination", why: "Enough give to turn on, enough support when you land on your back." },
};

/** Body weight shifts the firmness you actually feel: heavier bodies compress more. */
export const WEIGHT_FIRMNESS_ADJUSTMENT = [
  { maxKg: 60, delta: -1 },
  { maxKg: 90, delta: 0 },
  { maxKg: 110, delta: 1 },
  { maxKg: Infinity, delta: 2 },
];

/** Score-to-label bands on the same 1-10 scale. */
export const FIRMNESS_BANDS = [
  { maxScore: 3.5, label: "Soft" },
  { maxScore: 5, label: "Medium-soft" },
  { maxScore: 6.4, label: "Medium" },
  { maxScore: 8, label: "Medium-firm" },
  { maxScore: 10, label: "Firm" },
];

const round = (value, dp) => {
  const factor = 10 ** dp;
  return Math.round(value * factor) / factor;
};

const inToCm = (inches) => inches * CM_PER_INCH;

const sizeWithCm = (size) => ({
  ...size,
  widthCm: round(inToCm(size.widthIn), 1),
  lengthCm: round(inToCm(size.lengthIn), 1),
  areaSqCm: inToCm(size.widthIn) * inToCm(size.lengthIn),
});

export function allSizesWithCm() {
  return MATTRESS_SIZES.map(sizeWithCm);
}

export function thicknessFor(weightKg) {
  return THICKNESS_BANDS.find((band) => weightKg <= band.maxKg) || THICKNESS_BANDS[THICKNESS_BANDS.length - 1];
}

export function firmnessLabel(score) {
  const band = FIRMNESS_BANDS.find((item) => score <= item.maxScore);
  return band ? band.label : FIRMNESS_BANDS[FIRMNESS_BANDS.length - 1].label;
}

/**
 * Main recommendation.
 *
 * @param {object} input
 * @param {number} input.sleepers        1 or 2 adults
 * @param {number} input.tallestHeightCm height of the tallest adult
 * @param {number} input.heaviestWeightKg weight of the heaviest adult
 * @param {string} input.position        side | back | stomach | combination
 * @param {number} input.children        co-sleeping children (0-2)
 * @param {boolean} input.pet            a pet sleeps on the bed
 * @param {number} [input.roomWidthCm]   optional room width for a clearance check
 */
export function recommendMattress({
  sleepers,
  tallestHeightCm,
  heaviestWeightKg,
  position,
  children = 0,
  pet = false,
  roomWidthCm = null,
}) {
  const people = Number(sleepers);
  const height = Number(tallestHeightCm);
  const weight = Number(heaviestWeightKg);
  const kids = Number(children);

  if (![people, height, weight, kids].every((value) => Number.isFinite(value))) {
    return { error: "Enter valid numbers for sleepers, height and weight." };
  }
  if (!Number.isInteger(people) || people < 1 || people > MAX_SLEEPERS) {
    return { error: "This selector covers one or two adult sleepers." };
  }
  if (height < 50 || height > 250) {
    return { error: "Enter a sleeper height between 50 cm and 250 cm." };
  }
  if (weight < 20 || weight > 250) {
    return { error: "Enter a body weight between 20 kg and 250 kg." };
  }
  if (!Number.isInteger(kids) || kids < 0 || kids > 2) {
    return { error: "Co-sleeping children must be 0, 1 or 2." };
  }
  if (!POSITION_BASE_FIRMNESS[position]) {
    return { error: "Choose a sleeping position: side, back, stomach or combination." };
  }

  const extraWidthCm = kids * WIDTH_PER_CHILD_CM + (pet ? WIDTH_PER_PET_CM : 0);
  const minWidthCm = round(people * WIDTH_PER_ADULT_MIN_CM + extraWidthCm, 1);
  const comfortWidthCm = round(people * WIDTH_PER_ADULT_COMFORT_CM + extraWidthCm, 1);
  const minLengthCm = round(height + LENGTH_HEADROOM_MIN_CM, 1);
  const comfortLengthCm = round(height + LENGTH_HEADROOM_COMFORT_CM, 1);

  const catalogue = allSizesWithCm().sort((a, b) => a.areaSqCm - b.areaSqCm);
  const fitsComfort = (size) => size.widthCm >= comfortWidthCm && size.lengthCm >= minLengthCm;
  const fitsMinimum = (size) => size.widthCm >= minWidthCm && size.lengthCm >= minLengthCm;

  const recommended = catalogue.find(fitsComfort) || null;
  const minimumViable = catalogue.find(fitsMinimum) || null;

  const thickness = thicknessFor(weight);
  const base = POSITION_BASE_FIRMNESS[position];
  const weightBand =
    WEIGHT_FIRMNESS_ADJUSTMENT.find((item) => weight <= item.maxKg) ||
    WEIGHT_FIRMNESS_ADJUSTMENT[WEIGHT_FIRMNESS_ADJUSTMENT.length - 1];
  const firmnessScore = round(Math.min(10, Math.max(1, base.score + weightBand.delta)), 1);

  const chosen = recommended || minimumViable;
  const perSleeperWidthCm = chosen ? round(chosen.widthCm / people, 1) : null;
  const legroomCm = chosen ? round(chosen.lengthCm - height, 1) : null;

  const notes = [];
  if (!recommended && minimumViable) {
    notes.push(
      `No standard size reaches the comfortable ${round(comfortWidthCm, 0)} cm width, so the largest usable standard size is shown instead.`,
    );
  }
  if (!minimumViable) {
    notes.push(
      `Your requirement of ${round(minWidthCm, 0)} cm x ${round(minLengthCm, 0)} cm is beyond every standard size — this needs a custom-made mattress.`,
    );
  }
  if (kids > 0) {
    notes.push(`${kids} co-sleeping ${kids === 1 ? "child adds" : "children add"} ${kids * WIDTH_PER_CHILD_CM} cm of width.`);
  }
  if (pet) notes.push(`A pet on the bed adds ${WIDTH_PER_PET_CM} cm of width.`);

  let roomCheck = null;
  const room = roomWidthCm === null || roomWidthCm === "" ? null : Number(roomWidthCm);
  if (room !== null) {
    if (!Number.isFinite(room) || room <= 0) {
      roomCheck = { error: "Room width must be a positive number of centimetres." };
    } else if (chosen) {
      const spare = round(room - chosen.widthCm, 1);
      const eachSide = round(spare / 2, 1);
      roomCheck = {
        roomWidthCm: round(room, 1),
        spareCm: spare,
        eachSideCm: eachSide,
        fits: spare >= 0,
        hasWalkway: eachSide >= SIDE_CLEARANCE_CM,
      };
    }
  }

  return {
    minWidthCm,
    comfortWidthCm,
    minLengthCm,
    comfortLengthCm,
    recommended,
    minimumViable,
    chosen,
    perSleeperWidthCm,
    legroomCm,
    thicknessMinCm: thickness.minCm,
    thicknessMaxCm: thickness.maxCm,
    thicknessNote: thickness.note,
    firmnessScore,
    firmnessLabel: firmnessLabel(firmnessScore),
    positionLabel: base.label,
    positionWhy: base.why,
    weightAdjustment: weightBand.delta,
    notes,
    roomCheck,
  };
}
