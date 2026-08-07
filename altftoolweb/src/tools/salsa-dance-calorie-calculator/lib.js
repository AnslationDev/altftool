/**
 * Salsa calorie maths.
 *
 * Social salsa is intermittent: you dance one song, then stand, talk and wait
 * for the next partner. Counting the whole night at dance intensity roughly
 * doubles the true figure, so this module prices songs danced and time off the
 * floor separately.
 *
 * Energy model (ACSM):  kcal/min = MET x 3.5 x kg / 200
 *   1 MET = 3.5 mL O2 per kg per minute, 1 L O2 ~= 5 kcal.
 * MET values come from the dance codes of the Compendium of Physical
 * Activities (Ainsworth et al., 2011); each style names its source below.
 */

export const LB_TO_KG = 0.45359237;
export const O2_ML_PER_KG_PER_MET = 3.5;
export const KCAL_PER_LITRE_O2 = 5;
export const RESTING_MET = 1;
export const KCAL_PER_KG_BODY_FAT = 7700;

/**
 * Off-the-floor time: standing, talking, walking to the bar.
 * Compendium 2011: "standing quietly" 1.3 MET, "standing, light effort" 2.0 MET.
 */
export const OFF_FLOOR_MET = 1.6;

export const MIN_WEIGHT_KG = 25;
export const MAX_WEIGHT_KG = 400;
export const MAX_SONGS = 200;
export const MIN_SONG_MINUTES = 1;
export const MAX_SONG_MINUTES = 15;
export const MAX_TOTAL_MINUTES = 720;

export const SALSA_STYLES = [
  {
    id: "bachata",
    label: "Bachata / slow partner work",
    met: 3.0,
    basis: "Compendium value for slow ballroom dancing such as waltz, foxtrot or tango (3.0 MET).",
  },
  {
    id: "class",
    label: "Beginner class or drills",
    met: 4.5,
    basis: "Compendium value for general ethnic or cultural dancing (4.5 MET).",
  },
  {
    id: "social",
    label: "Social salsa on1 / on2, club tempo",
    met: 5.5,
    basis: "Between cultural dancing (4.5) and fast ballroom dancing (7.8 MET).",
  },
  {
    id: "rueda",
    label: "Rueda de casino / fast salsa, non-stop",
    met: 7.0,
    basis: "Just under the compendium value for fast ballroom and disco dancing (7.8 MET).",
  },
  {
    id: "performance",
    label: "Performance rehearsal — spins, dips, lifts",
    met: 7.8,
    basis: "Compendium value for fast ballroom, disco, folk and square dancing (7.8 MET).",
  },
];

const round = (value, places = 0) => {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
};

export function metToKcalPerMinute(met, weightKg) {
  if (!Number.isFinite(met) || !Number.isFinite(weightKg)) return 0;
  if (met <= 0 || weightKg <= 0) return 0;
  return (met * O2_ML_PER_KG_PER_MET * weightKg * KCAL_PER_LITRE_O2) / 1000;
}

export function getSalsaStyle(id) {
  return SALSA_STYLES.find((item) => item.id === id) || null;
}

/**
 * @param {object} input
 * @param {number} input.weight        body weight in `weightUnit`
 * @param {"kg"|"lb"} input.weightUnit
 * @param {string} input.styleId       one of SALSA_STYLES ids
 * @param {number} input.songs         number of songs actually danced
 * @param {number} input.songMinutes   average length of one song
 * @param {number} input.totalMinutes  total time at the class or social
 */
export function computeSalsaBurn({
  weight,
  weightUnit = "kg",
  styleId,
  songs,
  songMinutes,
  totalMinutes,
}) {
  if (![weight, songs, songMinutes, totalMinutes].every(Number.isFinite)) {
    return { error: "Enter a number in every field." };
  }
  const style = getSalsaStyle(styleId);
  if (!style) return { error: "Pick a salsa style." };

  const weightKg = weightUnit === "lb" ? weight * LB_TO_KG : weight;
  if (weightKg < MIN_WEIGHT_KG || weightKg > MAX_WEIGHT_KG) {
    const [minDisplay, maxDisplay] =
      weightUnit === "lb"
        ? [Math.round(MIN_WEIGHT_KG / LB_TO_KG), Math.round(MAX_WEIGHT_KG / LB_TO_KG)]
        : [MIN_WEIGHT_KG, MAX_WEIGHT_KG];
    const unitLabel = weightUnit === "lb" ? "lb" : "kg";
    return { error: `Body weight should be between ${minDisplay} ${unitLabel} and ${maxDisplay} ${unitLabel}.` };
  }
  if (songs <= 0) return { error: "Enter at least one song danced." };
  if (songs > MAX_SONGS) return { error: `Songs danced should be ${MAX_SONGS} or fewer.` };
  if (songMinutes < MIN_SONG_MINUTES || songMinutes > MAX_SONG_MINUTES) {
    return {
      error: `Average song length should be between ${MIN_SONG_MINUTES} and ${MAX_SONG_MINUTES} minutes.`,
    };
  }
  if (totalMinutes <= 0) return { error: "Total time must be more than zero minutes." };
  if (totalMinutes > MAX_TOTAL_MINUTES) {
    return { error: `Total time should be ${MAX_TOTAL_MINUTES} minutes or less.` };
  }

  const danceMinutes = songs * songMinutes;
  if (danceMinutes > totalMinutes) {
    return {
      error: "Dancing time is longer than the total time — raise the total or lower the song count.",
    };
  }

  const offFloorMinutes = totalMinutes - danceMinutes;
  const danceKcalPerMin = metToKcalPerMinute(style.met, weightKg);
  const offFloorKcalPerMin = metToKcalPerMinute(OFF_FLOOR_MET, weightKg);
  const restingKcalPerMin = metToKcalPerMinute(RESTING_MET, weightKg);

  const danceKcal = danceKcalPerMin * danceMinutes;
  const offFloorKcal = offFloorKcalPerMin * offFloorMinutes;
  const grossKcal = danceKcal + offFloorKcal;
  const restingKcal = restingKcalPerMin * totalMinutes;
  const netKcal = Math.max(0, grossKcal - restingKcal);

  return {
    weightKg: round(weightKg, 1),
    met: style.met,
    styleLabel: style.label,
    basis: style.basis,
    danceMinutes: round(danceMinutes, 1),
    offFloorMinutes: round(offFloorMinutes, 1),
    floorSharePercent: round((danceMinutes / totalMinutes) * 100),
    averageMet: round((style.met * danceMinutes + OFF_FLOOR_MET * offFloorMinutes) / totalMinutes, 2),
    kcalPerMinute: round(danceKcalPerMin, 2),
    kcalPerHour: round(danceKcalPerMin * 60),
    kcalPerSong: round(danceKcalPerMin * songMinutes),
    danceKcal: round(danceKcal),
    offFloorKcal: round(offFloorKcal),
    grossKcal: round(grossKcal),
    restingKcal: round(restingKcal),
    netKcal: round(netKcal),
    fatGramsEquivalent: round((netKcal / KCAL_PER_KG_BODY_FAT) * 1000, 1),
  };
}
