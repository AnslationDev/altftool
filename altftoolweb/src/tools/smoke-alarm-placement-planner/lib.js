/**
 * Smoke and carbon monoxide alarm planner.
 *
 * COUNT — the coverage rule for dwellings in NFPA 72, National Fire Alarm and
 * Signaling Code, and the fire-service guidance built on it:
 *
 *   - a smoke alarm inside every sleeping room
 *   - a smoke alarm outside each separate sleeping area, in the immediate
 *     vicinity of the bedrooms it serves
 *   - a smoke alarm on every level of the dwelling, including the basement
 *
 * A level that already has a sleeping-area alarm satisfies the third rule, so
 * only levels without one add to the count. That is why this planner asks how
 * many levels actually contain bedrooms.
 *
 * Carbon monoxide alarms follow the same shape where any fuel-burning
 * appliance or attached garage exists: outside each separate sleeping area and
 * on every level.
 *
 * PLACEMENT — the mounting distances are the ones NFPA 72 states, converted to
 * metric here for convenience:
 *
 *   - ceiling mount: at least 4 in (100 mm) away from any sidewall
 *   - wall mount: the top of the alarm 4-12 in (100-300 mm) below the ceiling
 *   - peaked or cathedral ceiling: within 3 ft (0.9 m) horizontally of the
 *     peak, but not inside the top 4 in (100 mm) of the apex, where a dead-air
 *     pocket forms
 *   - not within 3 ft (0.9 m) of a bathroom door with a shower, a forced-air
 *     supply register, or the tip of a ceiling fan blade
 *   - not within 10 ft (3 m) of a stationary cooking appliance; between 10 and
 *     20 ft (3-6 m) use a photoelectric alarm or one with an alarm-silencing
 *     button, to cut nuisance alarms
 *
 * LIFE — an alarm is replaced 10 years after the manufacture date printed on
 * the back of the unit, not 10 years after installation, because the sensing
 * chamber degrades regardless of the battery.
 *
 * Educational information. Building regulations differ by country and state,
 * and new construction usually adds interconnection and mains-power
 * requirements — check the code that applies where you are.
 */

/** Replace a smoke alarm this many years after its date of manufacture. */
export const ALARM_LIFE_YEARS = 10;

export const IN_TO_MM = 25.4;
export const FT_TO_M = 0.3048;

/** Mounting distances as stated in NFPA 72, with metric conversions. */
export const PLACEMENT_RULES = [
  {
    id: "ceiling",
    title: "Ceiling mount",
    rule: "Keep the alarm at least 4 in (100 mm) away from any sidewall.",
    why: "Air stagnates in the corner where wall meets ceiling, so smoke reaches that spot last.",
  },
  {
    id: "wall",
    title: "Wall mount",
    rule: "The top of the alarm goes 4-12 in (100-300 mm) below the ceiling.",
    why: "Higher than 4 in is dead air; lower than 12 in and the smoke layer may not reach it early enough.",
  },
  {
    id: "peak",
    title: "Peaked or cathedral ceiling",
    rule: "Mount within 3 ft (0.9 m) horizontally of the peak, but not inside the top 4 in (100 mm) of the apex.",
    why: "The apex itself holds a dead-air pocket; just below it is the first place smoke collects.",
  },
  {
    id: "wet",
    title: "Away from steam and draughts",
    rule: "Keep at least 3 ft (0.9 m) from a bathroom door with a shower, an air supply register, and the tip of a ceiling fan blade.",
    why: "Steam and moving air are the two most common causes of an alarm being taken down.",
  },
  {
    id: "kitchen",
    title: "Away from cooking",
    rule: "Never within 10 ft (3 m) of a stationary cooking appliance. Between 10 and 20 ft (3-6 m), fit a photoelectric alarm or one with an alarm-silencing button.",
    why: "Cooking is the leading cause of nuisance alarms, and a disabled alarm protects nobody.",
  },
  {
    id: "basement",
    title: "Basement",
    rule: "Put the basement alarm on the ceiling at the bottom of the stairs.",
    why: "That is where smoke rising from the basement will pass on its way to the rest of the house.",
  },
  {
    id: "interconnect",
    title: "Interconnection",
    rule: "Interconnect the alarms — wired or wireless — so any one sounding sets off all of them.",
    why: "A fire starting far from the bedrooms is the one that gives the least warning.",
  },
  {
    id: "avoid",
    title: "Where not to bother",
    rule: "Do not fit standard alarms in an unheated attic, garage or unventilated crawl space.",
    why: "Most residential alarms are only listed for roughly 4-38 degrees Celsius; outside that they misbehave or fail.",
  },
];

const isCount = (value) => Number.isFinite(value) && value >= 0;

/**
 * Plan the alarms for a dwelling.
 *
 * @param {object} input
 * @param {number} input.bedrooms          Sleeping rooms (0-20).
 * @param {number} input.sleepingAreas     Separate sleeping areas / bedroom hallways (0-10).
 * @param {number} input.bedroomLevels     How many levels contain bedrooms (0-11).
 * @param {number} input.levelsAboveGround Levels at or above ground (1-10).
 * @param {boolean} input.hasBasement      There is a basement or cellar.
 * @param {boolean} input.hasFuelBurning   Any fuel-burning appliance or attached garage.
 * @param {number} input.unitPrice         Price per alarm, for the budget line (0-100000).
 * @param {number} input.manufactureYear   Year printed on the existing alarms (or 0 to skip).
 * @param {number} input.currentYear       Reference year — pass it in, so the maths stays pure.
 * @returns {object} plan, or { error }.
 */
export function planAlarms({
  bedrooms = 0,
  sleepingAreas = 1,
  bedroomLevels = 1,
  levelsAboveGround = 1,
  hasBasement = false,
  hasFuelBurning = false,
  unitPrice = 0,
  manufactureYear = 0,
  currentYear = 2026,
} = {}) {
  const beds = Number(bedrooms);
  const areas = Number(sleepingAreas);
  const bedLevels = Number(bedroomLevels);
  const above = Number(levelsAboveGround);
  const price = Number(unitPrice);

  if (![beds, areas, bedLevels, above, price].every(isCount)) {
    return { error: "Every number here must be zero or more." };
  }
  if (beds > 20) return { error: "Enter up to 20 bedrooms." };
  if (areas > 10) return { error: "Enter up to 10 separate sleeping areas." };
  if (above < 1) return { error: "A home has at least one level above ground." };
  if (above > 10) return { error: "Enter up to 10 levels above ground." };
  if (price > 100000) return { error: "Enter a price per alarm of up to 1,00,000." };

  const wholeBeds = Math.floor(beds);
  const wholeAreas = Math.floor(areas);
  const wholeAbove = Math.floor(above);
  const totalLevels = wholeAbove + (hasBasement ? 1 : 0);
  const wholeBedLevels = Math.floor(bedLevels);

  if (wholeBeds > 0 && wholeAreas < 1) {
    return { error: "With bedrooms in the home there is at least one sleeping area to cover." };
  }
  if (wholeAreas > wholeBeds && wholeBeds > 0) {
    return { error: "There cannot be more separate sleeping areas than bedrooms." };
  }
  if (wholeBedLevels > totalLevels) {
    return { error: "More levels have bedrooms than the home has levels." };
  }
  if (wholeBeds > 0 && wholeBedLevels < 1) {
    return { error: "If the home has bedrooms, at least one level contains them." };
  }

  const levelsWithoutSleeping = Math.max(0, totalLevels - wholeBedLevels);

  const smokeByLocation = [
    {
      id: "bedrooms",
      location: "Inside each sleeping room",
      count: wholeBeds,
      note: "Required so a sleeper behind a closed door is woken by their own alarm.",
    },
    {
      id: "hallways",
      location: "Outside each separate sleeping area",
      count: wholeAreas,
      note: "In the hallway or landing immediately serving the bedrooms.",
    },
    {
      id: "otherLevels",
      location: "Levels with no sleeping area",
      count: levelsWithoutSleeping,
      note: hasBasement
        ? "Including the basement — mount that one on the ceiling at the bottom of the stairs."
        : "One per level, so no floor of the home is uncovered.",
    },
  ].filter((row) => row.count > 0);

  const smokeAlarms = smokeByLocation.reduce((sum, row) => sum + row.count, 0);

  const coByLocation = hasFuelBurning
    ? [
        {
          id: "coHallways",
          location: "Outside each separate sleeping area",
          count: wholeAreas,
          note: "CO is colourless and odourless — an alarm is the only warning a sleeper gets.",
        },
        {
          id: "coLevels",
          location: "Levels with no sleeping area",
          count: levelsWithoutSleeping,
          note: "Including any level with a boiler, geyser, generator or attached garage.",
        },
      ].filter((row) => row.count > 0)
    : [];

  const coAlarms = coByLocation.reduce((sum, row) => sum + row.count, 0);

  const totalAlarms = smokeAlarms + coAlarms;
  const totalCost = price > 0 ? Math.round(totalAlarms * price) : null;

  let replacement = null;
  const madeYear = Number(manufactureYear);
  const nowYear = Number(currentYear);
  if (Number.isFinite(madeYear) && madeYear > 0) {
    if (!Number.isFinite(nowYear) || nowYear < 1980 || nowYear > 2200) {
      return { error: "Enter a sensible current year." };
    }
    if (madeYear < 1980 || madeYear > nowYear + 1) {
      return { error: `Enter a manufacture year between 1980 and ${nowYear + 1}.` };
    }
    const dueYear = madeYear + ALARM_LIFE_YEARS;
    const yearsLeft = dueYear - nowYear;
    replacement = {
      madeYear,
      dueYear,
      yearsLeft,
      overdue: yearsLeft <= 0,
      message:
        yearsLeft <= 0
          ? `These alarms were due for replacement in ${dueYear} — replace them now.`
          : `Replace by ${dueYear}, which is ${yearsLeft} year${yearsLeft === 1 ? "" : "s"} away.`,
    };
  }

  return {
    smokeAlarms,
    coAlarms,
    totalAlarms,
    smokeByLocation,
    coByLocation,
    totalLevels,
    levelsWithoutSleeping,
    sleepingAreas: wholeAreas,
    bedrooms: wholeBeds,
    totalCost,
    unitPrice: price,
    replacement,
    placementRules: PLACEMENT_RULES,
  };
}
