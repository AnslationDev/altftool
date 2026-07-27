/**
 * Fire extinguisher selector.
 *
 * Two separate things are worked out here, and they come from different places.
 *
 * 1. WHICH AGENT. Driven by the fire class the risk actually presents. The
 *    class letters differ by standard, so both are given:
 *      A  ordinary combustibles (wood, paper, cloth, most plastics)
 *      B  flammable liquids (petrol, thinners, paint, alcohol)
 *      C  flammable gases in EN 2 / energised electrical equipment in NFPA 10
 *      D  combustible metals (magnesium, sodium, titanium)
 *      F (EN 2) / K (NFPA 10)  cooking oils and fats
 *    An agent is only listed for a risk if it is rated for that class, and the
 *    agents that are actively dangerous on that risk are listed separately.
 *
 * 2. HOW MANY AND HOW BIG. Coverage follows NFPA 10, Standard for Portable
 *    Fire Extinguishers:
 *      - maximum floor area per Class A extinguisher: 11,250 sq ft
 *      - floor area per unit of A rating: 3,000 sq ft (light hazard),
 *        1,500 sq ft (ordinary hazard), 1,000 sq ft (extra hazard)
 *      - minimum rating for a single extinguisher: 2-A, or 4-A for extra hazard
 *      - maximum travel distance to a Class A extinguisher: 75 ft (22.9 m)
 *      - maximum travel distance to a Class B extinguisher: 30 ft (9.1 m),
 *        with minimum ratings of 5-B, 10-B and 40-B for light, ordinary and
 *        extra hazard respectively
 *
 * The physical size ladder (2 kg, 4 kg, 6 kg, 9 kg and so on) is a practical
 * purchasing guide by room size, not a rating claim: printed A and B ratings
 * differ between EN 3 and UL listings for the same weight, so always read the
 * rating on the label of the specific model you buy.
 *
 * Educational information only. Fixed suppression, commercial kitchens and
 * workplaces are governed by local codes and by your fire officer.
 */

/** NFPA 10 coverage constants. */
export const MAX_AREA_PER_EXTINGUISHER_SQFT = 11250;
export const SQFT_PER_A_UNIT = { light: 3000, ordinary: 1500, extra: 1000 };
export const MIN_SINGLE_A_RATING = { light: 2, ordinary: 2, extra: 4 };
export const MIN_B_RATING_AT_30FT = { light: 5, ordinary: 10, extra: 40 };
export const TRAVEL_DISTANCE_A_FT = 75;
export const TRAVEL_DISTANCE_B_FT = 30;
export const FT_TO_M = 0.3048;

export const HAZARD_LEVELS = [
  {
    id: "light",
    label: "Light — homes, offices, classrooms: little that burns fast",
  },
  {
    id: "ordinary",
    label: "Ordinary — shops, workshops, storage: moderate quantities",
  },
  {
    id: "extra",
    label: "Extra — paint, fuel, solvents, woodworking, warehousing",
  },
];

export const FIRE_CLASSES = [
  { id: "A", label: "A — wood, paper, cloth, plastics" },
  { id: "B", label: "B — petrol, thinners, paint, alcohol" },
  { id: "C", label: "C — flammable gases (EN 2)" },
  { id: "D", label: "D — combustible metals" },
  { id: "E", label: "Live electrical equipment" },
  { id: "F", label: "F / K — cooking oils and fats" },
];

/** Extinguishing agents and the classes each is rated for. */
export const AGENTS = {
  water: {
    id: "water",
    name: "Water / water mist",
    classes: ["A"],
    sizes: ["6 L", "9 L"],
    note: "Cheapest agent for ordinary combustibles. Water mist units are additionally tested for use near live electrics; a plain water jet is not.",
    danger: "A water jet on burning oil or on live equipment is dangerous — it spreads the fire or conducts.",
  },
  foam: {
    id: "foam",
    name: "Foam (AFFF)",
    classes: ["A", "B"],
    sizes: ["6 L", "9 L"],
    note: "Blankets a liquid spill and stops re-ignition, which powder does not.",
    danger: "Not for live electrical equipment or for cooking oil.",
  },
  abcPowder: {
    id: "abcPowder",
    name: "ABC dry powder (mono-ammonium phosphate)",
    classes: ["A", "B", "C", "E"],
    sizes: ["1 kg", "2 kg", "4 kg", "6 kg", "9 kg"],
    note: "The broadest single answer, and safe on live equipment. Discharge is blinding and the residue is corrosive to electronics, so it is a poor choice indoors where a cleaner agent will do.",
    danger: "Does not reliably stop a deep-fat fire re-igniting, and should not be the kitchen's primary answer.",
  },
  bcPowder: {
    id: "bcPowder",
    name: "BC dry powder (sodium bicarbonate)",
    classes: ["B", "C", "E"],
    sizes: ["2 kg", "4 kg", "6 kg"],
    note: "Used where the risk is gas or liquid rather than solids.",
    danger: "No Class A rating — it will not put out a smouldering solid.",
  },
  co2: {
    id: "co2",
    name: "Carbon dioxide (CO2)",
    classes: ["B", "E"],
    sizes: ["2 kg", "3 kg", "4.5 kg", "6.8 kg"],
    note: "Leaves no residue, so it is the standard answer near electronics and switchgear.",
    danger: "No Class A rating, asphyxiation risk in a small closed room, and the horn gets cold enough to cause frost burns. Never on cooking oil — the blast splashes it.",
  },
  wetChemical: {
    id: "wetChemical",
    name: "Wet chemical (potassium salt)",
    classes: ["A", "F"],
    sizes: ["2 L", "3 L", "6 L"],
    note: "Saponifies hot cooking oil into a soap crust that seals the surface, which is the only reliable portable answer to a deep-fat fire.",
    danger: "Apply gently through the lance — a hard jet into hot oil throws it out of the pan.",
  },
  cleanAgent: {
    id: "cleanAgent",
    name: "Clean agent (HFC-227ea, FK-5-1-12)",
    classes: ["A", "B", "E"],
    sizes: ["2 kg", "4 kg", "6 kg"],
    note: "No residue and non-conductive, so it is used around servers, labs and archives where powder would cause more loss than the fire.",
    danger: "Expensive, and needs a reasonably enclosed space to reach concentration.",
  },
  classD: {
    id: "classD",
    name: "Class D special powder",
    classes: ["D"],
    sizes: ["9 kg", "12 kg"],
    note: "Graphite or sodium-chloride based powders applied gently to smother burning magnesium, sodium, titanium or potassium.",
    danger: "Nothing else works on a metal fire, and water makes it violently worse. Class D powder is NOT the answer to a lithium-ion battery.",
  },
  blanket: {
    id: "blanket",
    name: "Fire blanket",
    classes: ["F"],
    sizes: ["1.0 x 1.0 m", "1.2 x 1.2 m", "1.8 x 1.8 m"],
    note: "The fastest response to a pan fire or to clothing alight. Mount it beside the kitchen door, never above the hob.",
    danger: "Leave the pan covered until completely cold; lifting it early re-ignites the vapour.",
  },
};

/**
 * Risk areas, each mapped to the classes it presents and the agents to use.
 * `primary` is the first thing to buy; `also` is a useful second unit.
 */
export const RISK_AREAS = [
  {
    id: "homeKitchen",
    name: "Home kitchen",
    classes: ["A", "F", "E"],
    primary: "blanket",
    also: ["wetChemical"],
    avoid: ["water", "co2", "foam"],
    guidance:
      "A blanket handles the pan fire that is the common case. Add a small wet chemical unit if you deep fry.",
  },
  {
    id: "commercialKitchen",
    name: "Commercial kitchen or canteen",
    classes: ["A", "F", "E"],
    primary: "wetChemical",
    also: ["co2", "blanket"],
    avoid: ["water", "foam", "abcPowder"],
    guidance:
      "A 6 L wet chemical unit within reach of the fryer, plus CO2 for the electrical side. Fixed suppression over the cooking line is a separate requirement in most codes.",
  },
  {
    id: "livingArea",
    name: "Living room, bedroom or hallway",
    classes: ["A", "E"],
    primary: "abcPowder",
    also: ["water"],
    avoid: [],
    guidance:
      "Mostly Class A with live electrics in the mix. ABC powder covers both; water is fine if you can be sure the power is off.",
  },
  {
    id: "office",
    name: "Office, study or home lab",
    classes: ["A", "E"],
    primary: "cleanAgent",
    also: ["co2", "abcPowder"],
    avoid: ["water"],
    guidance:
      "Clean agent or CO2 protects the electronics that powder would write off. Keep at least one Class A unit for paper and furniture.",
  },
  {
    id: "serverRoom",
    name: "Server room or electrical panel",
    classes: ["E", "B"],
    primary: "co2",
    also: ["cleanAgent"],
    avoid: ["water", "foam"],
    guidance:
      "CO2 leaves nothing behind. Isolate the supply first if you safely can — an energised fault will simply re-ignite.",
  },
  {
    id: "garage",
    name: "Garage or workshop with fuel and paint",
    classes: ["A", "B", "E"],
    primary: "abcPowder",
    also: ["foam"],
    avoid: ["water"],
    guidance:
      "Petrol, thinners and paint make this a Class B space. Foam is better at stopping a spill re-igniting; powder is more versatile.",
  },
  {
    id: "vehicle",
    name: "Car, van or camper",
    classes: ["A", "B", "E"],
    primary: "abcPowder",
    also: [],
    avoid: ["water"],
    guidance:
      "Mount a 1-2 kg unit within the driver's reach, not in the boot. Open the bonnet only a crack — a rush of air feeds the fire.",
  },
  {
    id: "lpgArea",
    name: "LPG cylinder or gas appliance area",
    classes: ["B", "C", "E"],
    primary: "bcPowder",
    also: ["abcPowder"],
    avoid: ["water"],
    guidance:
      "Do not extinguish a burning gas jet unless you can shut the valve first — unburnt gas collecting in a room is far more dangerous than a controlled flame.",
  },
  {
    id: "metalShop",
    name: "Metal workshop (magnesium, sodium, titanium)",
    classes: ["D"],
    primary: "classD",
    also: [],
    avoid: ["water", "foam", "co2", "abcPowder"],
    guidance:
      "Only a Class D powder applied gently will work. Water, foam and CO2 all react with burning metal.",
  },
  {
    id: "batteryCharging",
    name: "Lithium-ion battery charging area (e-bike, EV, power tools)",
    classes: ["A", "B", "E"],
    primary: "abcPowder",
    also: ["water"],
    avoid: ["classD"],
    guidance:
      "No portable extinguisher reliably stops a cell already in thermal runaway; the answer is large volumes of water to cool the surrounding cells, and evacuation. Charge on a hard surface away from the escape route, and never overnight in a hallway.",
  },
];

const isPositive = (value) => Number.isFinite(value) && value > 0;

/**
 * Work out agent, size and coverage for one risk area.
 *
 * @param {object} input
 * @param {string} input.areaId          A RISK_AREAS id.
 * @param {number} input.floorAreaSqFt   Floor area to protect, 1-200000 sq ft.
 * @param {string} input.hazard          A HAZARD_LEVELS id.
 * @param {boolean} input.hasFlammableLiquids Whether a Class B minimum applies.
 * @returns {object} recommendation, or { error }.
 */
export function selectExtinguisher({
  areaId,
  floorAreaSqFt,
  hazard = "light",
  hasFlammableLiquids = false,
} = {}) {
  const area = RISK_AREAS.find((entry) => entry.id === areaId);
  if (!area) return { error: "Choose the area or risk you are protecting." };

  const level = HAZARD_LEVELS.find((entry) => entry.id === hazard);
  if (!level) return { error: "Choose a hazard level for the space." };

  const sqft = Number(floorAreaSqFt);
  if (!isPositive(sqft)) return { error: "Enter a floor area greater than zero." };
  if (sqft > 200000) {
    return { error: "Above 200,000 sq ft this needs a designed scheme, not a calculator." };
  }

  // NFPA 10 Class A coverage.
  const countByArea = Math.ceil(sqft / MAX_AREA_PER_EXTINGUISHER_SQFT);
  const extinguisherCount = Math.max(1, countByArea);
  const aRatingNeeded = Math.max(
    MIN_SINGLE_A_RATING[level.id],
    Math.ceil(sqft / SQFT_PER_A_UNIT[level.id]),
  );

  // Size ladder by protected area — a purchasing guide, not a rating.
  const pickSize = (agent) => {
    if (!agent) return null;
    const ladder = agent.sizes;
    let index;
    if (sqft <= 250) index = 0;
    else if (sqft <= 1000) index = 1;
    else if (sqft <= 3000) index = 2;
    else index = ladder.length - 1;
    return ladder[Math.min(index, ladder.length - 1)];
  };

  const primaryAgent = AGENTS[area.primary];
  const primary = {
    ...primaryAgent,
    recommendedSize: pickSize(primaryAgent),
  };
  const also = area.also
    .map((id) => AGENTS[id])
    .filter(Boolean)
    .map((agent) => ({ ...agent, recommendedSize: pickSize(agent) }));
  const avoid = area.avoid.map((id) => AGENTS[id]).filter(Boolean);

  const classBApplies = hasFlammableLiquids || area.classes.includes("B");
  // A Class D-only space has no Class A rating requirement, so the NFPA 10
  // Class A coverage figures are not reported for it.
  const classAApplies = area.classes.includes("A");

  return {
    area,
    hazard: level,
    primary,
    also,
    avoid,
    classes: area.classes.map((id) => FIRE_CLASSES.find((entry) => entry.id === id)).filter(Boolean),
    classAApplies,
    extinguisherCount: classAApplies ? extinguisherCount : 1,
    aRatingNeeded: classAApplies ? aRatingNeeded : null,
    sqftPerAUnit: classAApplies ? SQFT_PER_A_UNIT[level.id] : null,
    classBApplies,
    bRatingNeeded: classBApplies ? MIN_B_RATING_AT_30FT[level.id] : null,
    travelA: {
      feet: TRAVEL_DISTANCE_A_FT,
      metres: Math.round(TRAVEL_DISTANCE_A_FT * FT_TO_M * 10) / 10,
    },
    travelB: {
      feet: TRAVEL_DISTANCE_B_FT,
      metres: Math.round(TRAVEL_DISTANCE_B_FT * FT_TO_M * 10) / 10,
    },
    floorAreaSqFt: Math.round(sqft),
    areaPerExtinguisher: classAApplies ? Math.round(sqft / extinguisherCount) : null,
    guidance: area.guidance,
  };
}
