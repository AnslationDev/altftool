/**
 * Living-room cooling load by the component heat-gain method.
 *
 * Unlike the per-square-foot rule of thumb, this adds up the individual gains
 * that dominate a large open living room — glazing, an exposed roof, a high
 * ceiling full of air, and a room full of people:
 *
 *   Q_wall  = U_wall  x A_wall_net x (dT + wall sol-air uplift)
 *   Q_roof  = U_roof  x A_floor    x (dT + roof sol-air uplift)
 *   Q_glass = U_glass x A_glass    x dT   +   A_glass x SHGF x SC
 *   Q_people = N x 130 W
 *   Q_lights + Q_equipment = installed watts
 *   Q_air   = ACH x Volume x 0.335 W/(m3.K) x dT x latent allowance
 *   Total   = (sum) x 1.10 design margin
 *
 * Everything is computed in watts, then converted: 1 ton of refrigeration is
 * 3516.85 W, and 1 W is 3.412142 BTU/hr.
 */

/** ASHRAE: one ton of refrigeration = 3516.85 W = 12,000 BTU/hr. */
export const WATTS_PER_TON = 3516.85;
export const WATT_TO_BTU_PER_HOUR = 3.412142;

/** Unit conversions (exact). */
export const FT_TO_M = 0.3048;
export const SQFT_TO_SQM = 0.09290304;

/**
 * Overall heat transfer coefficients, W/(m2.K). Uninsulated values are typical
 * of Indian construction (230 mm burnt-clay brick wall with plaster, 150 mm RCC
 * slab); insulated values are representative of an ECBC-compliant envelope.
 */
/**
 * `solAir: true` marks a wall type that is actually an exterior, sunlit wall
 * and so should carry the sol-air uplift below. "thin" is explicitly an
 * interior partition to an unconditioned room — it cannot be sunlit, so it
 * must not get the same solar penalty as a real exterior wall.
 */
export const WALL_TYPES = [
  { id: "brick", label: "230 mm brick, plastered, no insulation", u: 2.0, solAir: true },
  { id: "thin", label: "115 mm brick or block partition to an unconditioned room", u: 2.6, solAir: false },
  { id: "insulated", label: "Insulated / cavity wall (ECBC style)", u: 0.8, solAir: true },
];

export const ROOF_TYPES = [
  { id: "exposed", label: "Top floor - RCC roof exposed to the sun", u: 3.0, solAir: true },
  { id: "shaded", label: "Top floor but shaded, china mosaic or roof garden", u: 3.0, solAir: false },
  { id: "insulated", label: "Top floor with roof insulation (dark, uncoated)", u: 1.0, solAir: true },
  { id: "cool_coating", label: "Top floor with white or cool roof coating (reflective)", u: 1.0, solAir: false },
  { id: "none", label: "Another floor above - no roof gain", u: 0, solAir: false },
];

/** Single 5 mm clear glass and a typical double-glazed unit, W/(m2.K). */
export const GLASS_TYPES = [
  { id: "single", label: "Single clear glass", u: 5.8 },
  { id: "double", label: "Double glazed unit (DGU)", u: 2.8 },
];

/**
 * Peak solar heat gain through unshaded single clear glass, W/m2, for Indian
 * latitudes (roughly 8-32 N) in summer. West and south-west glass peaks in the
 * late afternoon, which is exactly when a living room is in use.
 */
export const ORIENTATIONS = [
  { id: "north", label: "North facing", shgf: 110 },
  { id: "east", label: "East facing", shgf: 430 },
  { id: "south", label: "South facing", shgf: 250 },
  { id: "west", label: "West facing", shgf: 480 },
  { id: "mixed", label: "Glass on more than one side", shgf: 300 },
];

/** Shading coefficients relative to unshaded clear glass. */
export const SHADING_OPTIONS = [
  { id: "none", label: "No shading", sc: 1.0 },
  { id: "sheer", label: "Sheer or light curtains", sc: 0.75 },
  { id: "curtains", label: "Heavy curtains or venetian blinds", sc: 0.55 },
  { id: "film", label: "Solar-control film, tinted or low-e glass", sc: 0.4 },
];

/** Infiltration air changes per hour for a room in use. */
export const INFILTRATION_LEVELS = [
  { id: "tight", label: "Tight - sealed uPVC windows, door rarely opened", ach: 0.5 },
  { id: "average", label: "Average - normal windows, door used now and then", ach: 1.0 },
  { id: "leaky", label: "Leaky - old frames or a door opened constantly", ach: 1.5 },
];

/**
 * Multiplier applied to the infiltration load to cover the latent (moisture)
 * heat of dehumidifying outdoor air down to indoor conditions. Coastal air at
 * 75-85% RH carries far more moisture than desert air at 20-30% RH.
 */
export const HUMIDITY_LEVELS = [
  { id: "dry", label: "Dry - inland north-west India in peak summer", latent: 1.15 },
  { id: "composite", label: "Composite - Delhi, Bengaluru, Pune", latent: 1.25 },
  { id: "humid", label: "Humid - Mumbai, Chennai, Kolkata, Kochi", latent: 1.45 },
];

/**
 * Sol-air uplift, K. A dark horizontal roof under peak sun behaves as if the
 * outdoor air were about 15 K hotter; a sunlit vertical wall about 5 K hotter.
 */
export const ROOF_SOL_AIR_UPLIFT_K = 15;
export const WALL_SOL_AIR_UPLIFT_K = 5;

/** ASHRAE Fundamentals, seated / very light activity: about 130 W total per adult. */
export const OCCUPANT_LOAD_W = 130;

/** Air volumetric heat capacity: 1.2 kg/m3 x 1005 J/(kg.K) / 3600 s = 0.335 W/(m3.K). */
export const AIR_HEAT_CAPACITY_W_PER_M3_K = 0.335;

/** Standard 10% design margin on the computed load. */
export const DESIGN_MARGIN = 1.1;

/** Capacities commonly available for a living room, in tons. */
export const STANDARD_TONNAGES = [1.0, 1.5, 2.0, 2.5, 3.0];

export const MAX_DELTA_T = 30;
export const MIN_DELTA_T = 1;

function lookup(list, id) {
  return list.find((item) => item.id === id) || null;
}

/** Smallest catalogue size that meets the load; null when it exceeds the largest. */
export function recommendTonnage(tons) {
  if (!Number.isFinite(tons) || tons <= 0) return null;
  return STANDARD_TONNAGES.find((size) => size >= tons - 1e-9) ?? null;
}

/**
 * @param {object} input  Room in feet, temperatures in degrees Celsius, loads in watts.
 * @returns {object} component breakdown or { error }.
 */
export function computeLivingRoomLoad({
  lengthFt,
  widthFt,
  ceilingFt,
  exposedWalls = 2,
  glassSqft = 0,
  orientation = "west",
  shading = "curtains",
  glassType = "single",
  wallType = "brick",
  roofType = "none",
  occupants = 4,
  lightingWatts = 0,
  applianceWatts = 0,
  infiltration = "average",
  humidity = "composite",
  outdoorTempC = 43,
  indoorTempC = 25,
}) {
  const L = Number(lengthFt);
  const W = Number(widthFt);
  const H = Number(ceilingFt);
  const walls = Number(exposedWalls);
  const glassArea = Number(glassSqft);
  const people = Number(occupants);
  const lights = Number(lightingWatts);
  const equip = Number(applianceWatts);
  const outdoor = Number(outdoorTempC);
  const indoor = Number(indoorTempC);

  const numbers = [L, W, H, walls, glassArea, people, lights, equip, outdoor, indoor];
  if (!numbers.every((v) => Number.isFinite(v))) {
    return { error: "Enter valid numbers in every field." };
  }
  if (L < 5 || W < 5 || L > 100 || W > 100) {
    return { error: "Room length and width should each be between 5 and 100 ft." };
  }
  if (H < 7 || H > 30) return { error: "Ceiling height should be between 7 and 30 ft." };
  if (walls < 0 || walls > 4) return { error: "Exposed walls must be between 0 and 4." };
  if (glassArea < 0) return { error: "Glass area cannot be negative." };
  if (people < 0 || people > 60) return { error: "Occupants should be between 0 and 60." };
  if (lights < 0 || equip < 0) return { error: "Lighting and appliance watts cannot be negative." };

  const deltaT = outdoor - indoor;
  if (deltaT < MIN_DELTA_T) {
    return { error: "Outdoor design temperature must be at least 1 C above the indoor setpoint." };
  }
  if (deltaT > MAX_DELTA_T) {
    return { error: `A temperature difference above ${MAX_DELTA_T} C is outside residential design range.` };
  }

  const wall = lookup(WALL_TYPES, wallType);
  const roof = lookup(ROOF_TYPES, roofType);
  const glass = lookup(GLASS_TYPES, glassType);
  const orient = lookup(ORIENTATIONS, orientation);
  const shade = lookup(SHADING_OPTIONS, shading);
  const air = lookup(INFILTRATION_LEVELS, infiltration);
  const humid = lookup(HUMIDITY_LEVELS, humidity);
  if (!wall || !roof || !glass || !orient || !shade || !air || !humid) {
    return { error: "Choose a valid option in every dropdown." };
  }

  const floorAreaSqft = L * W;
  const floorAreaM2 = floorAreaSqft * SQFT_TO_SQM;
  const ceilingM = H * FT_TO_M;
  const volumeM3 = floorAreaM2 * ceilingM;
  const perimeterM = 2 * (L + W) * FT_TO_M;
  const grossWallM2 = perimeterM * ceilingM;
  const exposedWallM2 = grossWallM2 * (walls / 4);
  const glassM2 = glassArea * SQFT_TO_SQM;

  if (glassM2 > exposedWallM2) {
    return { error: "Glass area is larger than the exposed wall area — check the window size or the number of exposed walls." };
  }

  const netWallM2 = exposedWallM2 - glassM2;

  const wallDeltaT = wall.solAir ? deltaT + WALL_SOL_AIR_UPLIFT_K : deltaT;
  const wallLoad = wall.u * netWallM2 * wallDeltaT;
  const roofDeltaT = roof.solAir ? deltaT + ROOF_SOL_AIR_UPLIFT_K : deltaT;
  const roofLoad = roof.u * floorAreaM2 * roofDeltaT;
  const glassConduction = glass.u * glassM2 * deltaT;
  const glassSolar = glassM2 * orient.shgf * shade.sc;
  const peopleLoad = Math.round(people) * OCCUPANT_LOAD_W;
  const lightingLoad = lights;
  const equipmentLoad = equip;
  const airLoad =
    air.ach * volumeM3 * AIR_HEAT_CAPACITY_W_PER_M3_K * deltaT * humid.latent;

  const subtotalW =
    wallLoad +
    roofLoad +
    glassConduction +
    glassSolar +
    peopleLoad +
    lightingLoad +
    equipmentLoad +
    airLoad;
  const totalW = subtotalW * DESIGN_MARGIN;
  const totalBtu = totalW * WATT_TO_BTU_PER_HOUR;
  const exactTons = totalW / WATTS_PER_TON;
  const recommended = recommendTonnage(exactTons);
  const largest = STANDARD_TONNAGES[STANDARD_TONNAGES.length - 1];

  const rawComponents = [
    { id: "wall", label: "Walls (conduction + sunlit wall)", watts: wallLoad },
    { id: "roof", label: "Roof / ceiling", watts: roofLoad },
    { id: "glassCond", label: "Glass conduction", watts: glassConduction },
    { id: "glassSolar", label: "Solar gain through glass", watts: glassSolar },
    { id: "people", label: `Occupants (${Math.round(people)} x ${OCCUPANT_LOAD_W} W)`, watts: peopleLoad },
    { id: "lights", label: "Lighting", watts: lightingLoad },
    { id: "equipment", label: "TV and other equipment", watts: equipmentLoad },
    { id: "air", label: "Fresh air and infiltration (incl. moisture)", watts: airLoad },
  ];
  const components = rawComponents.map((c) => ({
    ...c,
    sharePct: subtotalW > 0 ? (c.watts / subtotalW) * 100 : 0,
  }));
  const biggest = components.reduce((a, b) => (b.watts > a.watts ? b : a), components[0]);

  return {
    floorAreaSqft,
    floorAreaM2,
    volumeM3,
    exposedWallM2,
    netWallM2,
    glassM2,
    glassSharePct: exposedWallM2 > 0 ? (glassM2 / exposedWallM2) * 100 : 0,
    deltaT,
    components,
    biggestComponent: biggest,
    subtotalW,
    marginW: totalW - subtotalW,
    totalW,
    totalBtu,
    exactTons,
    recommendedTons: recommended,
    unitsNeeded: recommended ? 1 : Math.ceil(exactTons / largest),
    wattsPerSqft: totalW / floorAreaSqft,
  };
}
