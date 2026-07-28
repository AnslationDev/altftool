/**
 * Open water swim pre-swim safety scoring.
 *
 * Informational only — it does not replace a lifeguard, a venue risk assessment
 * or medical advice.
 *
 * Rules encoded here:
 *  - World Aquatics (formerly FINA) open water competition water-temperature
 *    limits: races run between 16 °C and 31 °C; wetsuits are compulsory below
 *    18 °C, optional from 18 °C up to and including 20 °C, and not permitted
 *    above 20 °C.
 *  - The "1-10-1 principle" for sudden cold water immersion (Giesbrecht):
 *    roughly 1 minute to get breathing under control, about 10 minutes of
 *    meaningful movement, and roughly 1 hour before loss of consciousness from
 *    hypothermia in cold water.
 *  - The open water club rule of thumb for unacclimatised skin swimmers:
 *    keep the first swim of the season to about as many minutes as the water
 *    temperature reads in degrees Celsius.
 */

/** World Aquatics open water competition temperature limits, in °C. */
export const COMPETITION_MIN_WATER_C = 16;
export const COMPETITION_MAX_WATER_C = 31;
export const WETSUIT_COMPULSORY_BELOW_C = 18;
export const WETSUIT_BANNED_ABOVE_C = 20;

/** Physical bounds for a plausible open water reading, in °C. */
export const MIN_PLAUSIBLE_WATER_C = -2;
export const MAX_PLAUSIBLE_WATER_C = 45;

/** Descriptive temperature bands used by open water swimming communities. */
export const TEMPERATURE_BANDS = [
  {
    id: "ice",
    max: 5,
    label: "Ice swimming",
    tone: "danger",
    summary:
      "Ice swimming territory. Only for acclimatised swimmers with supervision, a warm change area and someone watching the whole time.",
  },
  {
    id: "veryCold",
    max: 11,
    label: "Very cold",
    tone: "danger",
    summary:
      "Cold shock is severe and grip and stroke fail quickly. Keep swims very short and stay within standing depth or close to shore.",
  },
  {
    id: "cold",
    max: 15,
    label: "Cold",
    tone: "warning",
    summary:
      "Cold shock is still significant. A wetsuit, neoprene cap, gloves and socks make a large difference to safe swim time.",
  },
  {
    id: "cool",
    max: 19,
    label: "Cool",
    tone: "warning",
    summary:
      "Manageable for most swimmers after a controlled entry. Below 18 °C a wetsuit is compulsory in World Aquatics competition.",
  },
  {
    id: "comfortable",
    max: 24,
    label: "Comfortable",
    tone: "ok",
    summary:
      "Comfortable skin-swimming range for most people. Above 20 °C wetsuits are not permitted in World Aquatics competition.",
  },
  {
    id: "warm",
    max: 31,
    label: "Warm",
    tone: "warning",
    summary:
      "Warm enough that overheating, not cooling, is the risk. Drink to thirst and avoid a full wetsuit on long efforts.",
  },
  {
    id: "tooWarm",
    max: Infinity,
    label: "Above competition limit",
    tone: "danger",
    summary:
      "Above the 31 °C upper limit used for open water competition. Heat illness risk rises sharply on long swims.",
  },
];

/** Checklist items. weight 2 = safety-critical, 1 = strongly recommended. */
export const CHECKLIST_ITEMS = [
  {
    id: "buddy",
    group: "People",
    weight: 2,
    label: "Swimming with a buddy, or at a lifeguarded venue",
    why: "Almost every open water fatality report involves someone swimming alone or out of sight of help.",
  },
  {
    id: "toldSomeone",
    group: "People",
    weight: 2,
    label: "Someone on shore knows my route and my return time",
    why: "It sets the clock for raising the alarm if you do not come back.",
  },
  {
    id: "kayakOrObserver",
    group: "People",
    weight: 1,
    label: "An observer, kayak or paddleboard is escorting longer swims",
    why: "A support craft is the fastest way to get a tiring swimmer out of the water.",
  },
  {
    id: "towFloat",
    group: "Kit",
    weight: 2,
    label: "Bright tow float attached",
    why: "It makes you visible to boats and gives you something to hold if you need to stop.",
  },
  {
    id: "brightCap",
    group: "Kit",
    weight: 1,
    label: "High-visibility swim cap on",
    why: "A dark head in chop is nearly invisible from a boat or from the bank.",
  },
  {
    id: "thermalKit",
    group: "Kit",
    weight: 1,
    label: "Thermal kit matched to the water temperature",
    why: "Neoprene cap, gloves and socks cut heat loss from the parts that chill first.",
  },
  {
    id: "warmChange",
    group: "Kit",
    weight: 1,
    label: "Dry warm clothes and a hot drink ready at the exit",
    why: "Core temperature keeps falling after you get out — this is 'afterdrop'.",
  },
  {
    id: "phone",
    group: "Kit",
    weight: 1,
    label: "Charged phone in a dry bag at the exit point",
    why: "You cannot call for help from a locker on the other side of the lake.",
  },
  {
    id: "conditions",
    group: "Conditions",
    weight: 2,
    label: "Checked water temperature, wind, tide or current and forecast",
    why: "Offshore wind, an outgoing tide or a river flow can turn an easy swim into a one-way trip.",
  },
  {
    id: "waterQuality",
    group: "Conditions",
    weight: 1,
    label: "Checked water quality, algal blooms and recent heavy rain",
    why: "Storm runoff and blue-green algae are the usual cause of post-swim illness.",
  },
  {
    id: "boatTraffic",
    group: "Conditions",
    weight: 1,
    label: "Know where boats, jet skis and fishing lines will be",
    why: "Powered craft rarely see swimmers until they are very close.",
  },
  {
    id: "entryExit",
    group: "Exit plan",
    weight: 2,
    label: "Entry and exit points identified from the water, not just the bank",
    why: "Steep banks, weed and slipways look completely different at eye level.",
  },
  {
    id: "turnaround",
    group: "Exit plan",
    weight: 2,
    label: "A turnaround rule agreed — time, distance or how I feel",
    why: "Deciding to turn back before you are cold is much easier than deciding once you are.",
  },
  {
    id: "acclimatise",
    group: "Exit plan",
    weight: 1,
    label: "Will enter slowly and get breathing under control before swimming off",
    why: "The cold shock gasp response peaks in the first minute — the '1' of 1-10-1.",
  },
  {
    id: "noAlcohol",
    group: "Exit plan",
    weight: 1,
    label: "No alcohol before the swim and I am not swimming ill or exhausted",
    why: "Alcohol and fatigue both blunt the judgement you rely on to turn back in time.",
  },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * Classify a water temperature and return the competition and acclimatisation rules.
 * @param {number} waterTempC
 * @returns {object} assessment or { error }
 */
export function assessWaterTemperature(waterTempC) {
  if (!isNum(waterTempC)) {
    return { error: "Enter the water temperature as a number in degrees Celsius." };
  }
  if (waterTempC < MIN_PLAUSIBLE_WATER_C || waterTempC > MAX_PLAUSIBLE_WATER_C) {
    return {
      error: `Water temperature should be between ${MIN_PLAUSIBLE_WATER_C} °C and ${MAX_PLAUSIBLE_WATER_C} °C — check the reading.`,
    };
  }

  const band = TEMPERATURE_BANDS.find((item) => waterTempC <= item.max);

  let wetsuitRule;
  if (waterTempC < WETSUIT_COMPULSORY_BELOW_C) {
    wetsuitRule = `Below ${WETSUIT_COMPULSORY_BELOW_C} °C a wetsuit is compulsory in World Aquatics open water competition.`;
  } else if (waterTempC <= WETSUIT_BANNED_ABOVE_C) {
    wetsuitRule = `Between ${WETSUIT_COMPULSORY_BELOW_C} °C and ${WETSUIT_BANNED_ABOVE_C} °C a wetsuit is optional in competition — your call.`;
  } else {
    wetsuitRule = `Above ${WETSUIT_BANNED_ABOVE_C} °C wetsuits are not permitted in World Aquatics open water competition.`;
  }

  const withinCompetitionRange =
    waterTempC >= COMPETITION_MIN_WATER_C && waterTempC <= COMPETITION_MAX_WATER_C;

  // Club rule of thumb for unacclimatised skin swimmers: minutes ~= water °C.
  const novicePlainSwimMinutes = Math.max(1, Math.round(Math.min(30, Math.max(0, waterTempC))));

  return {
    waterTempC,
    waterTempF: waterTempC * 1.8 + 32,
    bandId: band.id,
    bandLabel: band.label,
    bandTone: band.tone,
    bandSummary: band.summary,
    wetsuitRule,
    withinCompetitionRange,
    coldShockRisk: waterTempC < 15,
    novicePlainSwimMinutes,
  };
}

/**
 * Score the checklist and flag any missing safety-critical item.
 *
 * @param {object} input
 * @param {string[]} input.checkedIds       Ids of ticked items.
 * @param {number} input.waterTempC         Water temperature in °C.
 * @param {number} input.plannedMinutes     Planned time in the water.
 * @param {boolean} [input.wearingWetsuit]  Whether a wetsuit will be worn.
 * @param {boolean} [input.acclimatised]    Regular cold water swimmer this season.
 * @returns {object} assessment or { error }
 */
export function assessReadiness({
  checkedIds = [],
  waterTempC,
  plannedMinutes,
  wearingWetsuit = false,
  acclimatised = false,
} = {}) {
  if (!Array.isArray(checkedIds)) {
    return { error: "Checked items must be supplied as a list." };
  }
  if (!isNum(plannedMinutes) || plannedMinutes <= 0) {
    return { error: "Planned swim time must be a number of minutes greater than zero." };
  }
  if (plannedMinutes > 720) {
    return { error: "Planned swim time above 12 hours is outside what this checklist covers." };
  }

  const temperature = assessWaterTemperature(waterTempC);
  if (temperature.error) return { error: temperature.error };

  const ticked = new Set(checkedIds);
  const criticalItems = CHECKLIST_ITEMS.filter((item) => item.weight === 2);
  const recommendedItems = CHECKLIST_ITEMS.filter((item) => item.weight === 1);

  const missingCritical = criticalItems.filter((item) => !ticked.has(item.id));
  const missingRecommended = recommendedItems.filter((item) => !ticked.has(item.id));

  const earned = CHECKLIST_ITEMS.reduce(
    (sum, item) => (ticked.has(item.id) ? sum + item.weight : sum),
    0,
  );
  const possible = CHECKLIST_ITEMS.reduce((sum, item) => sum + item.weight, 0);
  const score = possible > 0 ? (earned / possible) * 100 : 0;

  const warnings = [];
  if (!temperature.withinCompetitionRange) {
    warnings.push(
      `${temperature.waterTempC} °C sits outside the ${COMPETITION_MIN_WATER_C}–${COMPETITION_MAX_WATER_C} °C range used for open water competition.`,
    );
  }
  if (temperature.coldShockRisk) {
    warnings.push(
      "Below 15 °C the cold shock gasp response is strong. Enter slowly, keep your face out until your breathing settles, and remember 1-10-1.",
    );
  }
  if (!wearingWetsuit && !acclimatised && plannedMinutes > temperature.novicePlainSwimMinutes) {
    warnings.push(
      `Without a wetsuit and without recent cold acclimatisation, ${plannedMinutes} minutes is longer than the club rule of thumb of about ${temperature.novicePlainSwimMinutes} minutes at ${temperature.waterTempC} °C.`,
    );
  }
  if (wearingWetsuit && temperature.waterTempC > WETSUIT_BANNED_ABOVE_C && plannedMinutes > 45) {
    warnings.push(
      `A full wetsuit above ${WETSUIT_BANNED_ABOVE_C} °C for ${plannedMinutes} minutes raises overheating risk — consider a sleeveless suit or skins.`,
    );
  }
  if (plannedMinutes > 60 && !ticked.has("kayakOrObserver")) {
    warnings.push("Swims over an hour are much safer with a kayak, paddleboard or shore observer.");
  }

  let verdict;
  let verdictTone;
  if (missingCritical.length > 0) {
    verdict = "Not ready — safety-critical checks are missing";
    verdictTone = "danger";
  } else if (score >= 90) {
    verdict = "Good to swim";
    verdictTone = "ok";
  } else if (score >= 75) {
    verdict = "Nearly there — close the gaps first";
    verdictTone = "warning";
  } else {
    verdict = "Needs work before you get in";
    verdictTone = "warning";
  }

  return {
    score,
    earned,
    possible,
    tickedCount: CHECKLIST_ITEMS.filter((item) => ticked.has(item.id)).length,
    totalCount: CHECKLIST_ITEMS.length,
    missingCritical,
    missingRecommended,
    warnings,
    verdict,
    verdictTone,
    temperature,
    plannedMinutes,
  };
}

/** Groups in display order, derived from the item list. */
export function checklistGroups() {
  const seen = [];
  CHECKLIST_ITEMS.forEach((item) => {
    if (!seen.includes(item.group)) seen.push(item.group);
  });
  return seen.map((group) => ({
    group,
    items: CHECKLIST_ITEMS.filter((item) => item.group === group),
  }));
}
