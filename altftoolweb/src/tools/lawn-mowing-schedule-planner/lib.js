/**
 * Lawn mowing schedule planner.
 *
 * Core rule: the "one-third rule" taught by turfgrass extension services — never
 * remove more than one third of the leaf blade in a single cut. If the cutting
 * height is H, the grass may be allowed to reach 1.5 x H before mowing, so the
 * growth allowance between cuts is H / 2.
 *
 *   mow-at height = cutting height x 1.5
 *   interval (days) = (cutting height / 2) / daily growth
 *
 * Daily growth is the grass type's peak weekly growth scaled by season, by how
 * hard the lawn is fed and watered, and by shade.
 */

export const CM_PER_INCH = 2.54;
export const M_PER_FT = 0.3048;
export const SQM_PER_SQFT = M_PER_FT * M_PER_FT;
export const KMH_PER_MPH = 1.609344;

/** The one-third rule: a cut may remove at most 1/3 of the standing blade. */
export const MAX_REMOVAL_FRACTION = 1 / 3;

/**
 * Grass types with the mowing height ranges published by turfgrass extension
 * programmes, plus a peak vertical growth rate in cm per week under good
 * conditions. "cool" grasses peak in spring and autumn; "warm" grasses peak in
 * summer heat and go dormant in cold weather.
 */
export const GRASS_TYPES = [
  { id: "kentucky-bluegrass", label: "Kentucky bluegrass", season: "cool", minCm: 3.8, maxCm: 7.6, peakCmPerWeek: 3.5 },
  { id: "perennial-rye", label: "Perennial ryegrass", season: "cool", minCm: 3.8, maxCm: 6.4, peakCmPerWeek: 4 },
  { id: "tall-fescue", label: "Tall fescue", season: "cool", minCm: 5, maxCm: 10, peakCmPerWeek: 4 },
  { id: "fine-fescue", label: "Fine fescue", season: "cool", minCm: 4, maxCm: 7.5, peakCmPerWeek: 2.5 },
  { id: "bermuda", label: "Bermuda / doob grass", season: "warm", minCm: 1.3, maxCm: 3.8, peakCmPerWeek: 3.5 },
  { id: "zoysia", label: "Zoysia / Korean grass", season: "warm", minCm: 1.3, maxCm: 5, peakCmPerWeek: 2 },
  { id: "st-augustine", label: "St. Augustine", season: "warm", minCm: 6.4, maxCm: 10, peakCmPerWeek: 3.5 },
  { id: "centipede", label: "Centipede grass", season: "warm", minCm: 2.5, maxCm: 5, peakCmPerWeek: 2 },
  { id: "buffalo", label: "Buffalo grass", season: "warm", minCm: 5, maxCm: 8, peakCmPerWeek: 2 },
];

export const SEASONS = [
  { id: "spring", label: "Spring" },
  { id: "summer", label: "Summer" },
  { id: "autumn", label: "Autumn / monsoon" },
  { id: "winter", label: "Winter" },
];

/** Share of peak growth reached in each season. */
export const SEASON_GROWTH = {
  cool: { spring: 1, summer: 0.45, autumn: 0.8, winter: 0.1 },
  warm: { spring: 0.6, summer: 1, autumn: 0.5, winter: 0.05 },
};

/**
 * Where in the type's height range to cut, as a 0-1 position between min and max.
 * Cool-season grass is cut at its highest through summer heat so the canopy
 * shades the soil; the last cuts before winter go lower to reduce matting.
 */
export const SEASON_HEIGHT_POSITION = {
  cool: { spring: 0.5, summer: 1, autumn: 0.5, winter: 0.25 },
  warm: { spring: 0.4, summer: 0.5, autumn: 0.7, winter: 0.25 },
};

export const CARE_LEVELS = [
  { id: "low", label: "No feed, no watering", factor: 0.7 },
  { id: "normal", label: "Occasional feed and water", factor: 1 },
  { id: "high", label: "Fed and irrigated", factor: 1.35 },
];

export const SHADE_LEVELS = [
  { id: "sun", label: "Full sun", factor: 1, heightBonusCm: 0 },
  { id: "part", label: "Part shade", factor: 0.8, heightBonusCm: 0.5 },
  { id: "heavy", label: "Heavy shade", factor: 0.6, heightBonusCm: 1.5 },
];

/** Common mower cutting widths in centimetres. */
export const MOWER_PRESETS = [
  { id: "push", label: "Push mower 40 cm", widthCm: 40 },
  { id: "selfprop", label: "Self-propelled 51 cm", widthCm: 51 },
  { id: "wide", label: "Wide walk-behind 60 cm", widthCm: 60 },
  { id: "ride", label: "Ride-on 107 cm", widthCm: 107 },
];

/** Overlap, turns and emptying the collection box eat about 20% of theoretical output. */
export const MOWING_EFFICIENCY = 0.8;

/** Beyond this the lawn is effectively dormant rather than on a schedule. */
export const DORMANT_INTERVAL_DAYS = 45;
export const MIN_INTERVAL_DAYS = 2;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const byId = (list, id) => list.find((item) => item.id === id);

/**
 * @returns {{error:string}|object}
 */
export function planMowing({
  grassTypeId = "kentucky-bluegrass",
  season = "spring",
  careId = "normal",
  shadeId = "sun",
  unit = "metric",
  cutHeight = 0,
  lawnArea = 200,
  mowerWidth = 40,
  mowSpeed = 3,
  seasonWeeks = 12,
} = {}) {
  if (unit !== "metric" && unit !== "imperial") {
    return { error: "Choose either metric or imperial units." };
  }
  const grass = byId(GRASS_TYPES, grassTypeId);
  if (!grass) return { error: "Pick a grass type from the list." };
  if (!SEASONS.some((item) => item.id === season)) return { error: "Pick a season." };
  const care = byId(CARE_LEVELS, careId);
  if (!care) return { error: "Pick how the lawn is fed and watered." };
  const shade = byId(SHADE_LEVELS, shadeId);
  if (!shade) return { error: "Pick a light level for the lawn." };

  if (![cutHeight, lawnArea, mowerWidth, mowSpeed, seasonWeeks].every(isNum)) {
    return { error: "Enter a valid number in every field." };
  }
  if (!(lawnArea > 0)) return { error: "Lawn area must be greater than zero." };
  if (!(mowerWidth > 0)) return { error: "Mower cutting width must be greater than zero." };
  if (!(mowSpeed > 0)) return { error: "Mowing speed must be greater than zero." };
  if (!(seasonWeeks > 0) || seasonWeeks > 52) {
    return { error: "Season length should be between 1 and 52 weeks." };
  }

  const isMetric = unit === "metric";

  // Recommended height from the grass type's range, adjusted for shade.
  const position = SEASON_HEIGHT_POSITION[grass.season][season];
  const recommendedCm = grass.minCm + (grass.maxCm - grass.minCm) * position + shade.heightBonusCm;

  let heightCm = recommendedCm;
  let heightIsCustom = false;
  if (cutHeight > 0) {
    heightCm = isMetric ? cutHeight : cutHeight * CM_PER_INCH;
    heightIsCustom = true;
    if (heightCm > 20) return { error: "A cutting height above 20 cm (8 in) is meadow, not lawn." };
    if (heightCm < 0.5) return { error: "A cutting height below 0.5 cm (0.2 in) will scalp the lawn." };
  }

  const belowRange = heightCm < grass.minCm - 0.01;
  const aboveRange = heightCm > grass.maxCm + shade.heightBonusCm + 0.01;

  const areaM2 = isMetric ? lawnArea : lawnArea * SQM_PER_SQFT;
  const widthM = isMetric ? mowerWidth / 100 : (mowerWidth * CM_PER_INCH) / 100;
  const speedMPerHour = isMetric ? mowSpeed * 1000 : mowSpeed * KMH_PER_MPH * 1000;
  const productivityM2PerHour = widthM * speedMPerHour * MOWING_EFFICIENCY;

  const timePerMowHours = productivityM2PerHour > 0 ? areaM2 / productivityM2PerHour : 0;

  const growthFactor = SEASON_GROWTH[grass.season][season] * care.factor * shade.factor;
  const weeklyGrowthCm = grass.peakCmPerWeek * growthFactor;
  const dailyGrowthCm = weeklyGrowthCm / 7;

  const mowAtCm = heightCm / (1 - MAX_REMOVAL_FRACTION); // = height x 1.5
  const allowanceCm = mowAtCm - heightCm;

  let intervalDays;
  let dormant = false;
  if (!(dailyGrowthCm > 0)) {
    intervalDays = DORMANT_INTERVAL_DAYS;
    dormant = true;
  } else {
    intervalDays = allowanceCm / dailyGrowthCm;
    if (intervalDays > DORMANT_INTERVAL_DAYS) {
      intervalDays = DORMANT_INTERVAL_DAYS;
      dormant = true;
    }
    if (intervalDays < MIN_INTERVAL_DAYS) intervalDays = MIN_INTERVAL_DAYS;
  }

  const seasonDays = seasonWeeks * 7;
  const mowsInSeason = dormant ? 0 : Math.max(1, Math.round(seasonDays / intervalDays));
  const mowsPerMonth = dormant ? 0 : 30 / intervalDays;
  const seasonHours = mowsInSeason * timePerMowHours;

  const toHeight = (cm) => (isMetric ? cm : cm / CM_PER_INCH);
  const heightUnit = isMetric ? "cm" : "in";

  return {
    grassLabel: grass.label,
    grassSeasonType: grass.season,
    heightUnit,
    areaUnit: isMetric ? "m²" : "sq ft",
    cutHeight: toHeight(heightCm),
    cutHeightCm: heightCm,
    recommendedHeight: toHeight(recommendedCm),
    rangeMin: toHeight(grass.minCm),
    rangeMax: toHeight(grass.maxCm),
    mowAtHeight: toHeight(mowAtCm),
    allowance: toHeight(allowanceCm),
    weeklyGrowth: toHeight(weeklyGrowthCm),
    dailyGrowth: toHeight(dailyGrowthCm),
    intervalDays,
    mowsPerMonth,
    mowsInSeason,
    timePerMowMinutes: timePerMowHours * 60,
    seasonHours,
    productivityM2PerHour,
    dormant,
    heightIsCustom,
    belowRange,
    aboveRange,
  };
}
