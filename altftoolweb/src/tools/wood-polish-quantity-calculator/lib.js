/**
 * Wood polish quantity - melamine, 2K PU and NC lacquer.
 *
 * Wood finishes are quoted as a spreading rate for the READY-TO-SPRAY mix, not
 * for the concentrate in the tin, because every one of them is thinned before
 * it reaches the gun. So the calculation runs in that order:
 *
 *   readyLitres = area x coats / spreadingRate x (1 + wastage)
 *
 * and the ready volume is then split back into the tinned components in the
 * mixing ratio the system uses:
 *
 *   componentLitres = readyLitres x part / (base + hardener + thinner parts)
 *
 * Melamine and NC are single-pack (base + thinner). 2K PU adds an isocyanate
 * hardener, conventionally two parts base to one part hardener.
 */

/** Largest surface area accepted, in square feet. */
export const MAX_AREA_SQFT = 50000;

/**
 * The four edges of a shutter add area the face measurement misses. A
 * 6.5 ft x 3 ft door with a 35 mm thick shutter has 39 sq ft of faces and
 * about 2.2 sq ft of edge, so a 5% allowance is close for normal door sizes.
 */
export const DOOR_EDGE_ALLOWANCE = 0.05;

/** The same allowance expressed as a percentage, for display. */
export const DOOR_EDGE_ALLOWANCE_PCT = 5;

/** Bounds on a sensible wastage allowance, as a percentage. */
export const MAX_WASTAGE_PCT = 50;

/**
 * Polish systems.
 *
 * `spreadingRate` is square feet covered by one litre of ready-to-spray
 * material in one coat on prepared wood. Manufacturers quote bands rather than
 * single numbers - a sealer coat always covers less than a topcoat because bare
 * timber drinks it in - and open-grain woods such as teak sit at the low end.
 * `parts` are volume parts of the ready mix. Melamine and NC are commonly
 * thinned about 1:1 and 1:1.5 respectively; 2K PU is mixed 2 base : 1 hardener
 * with thinner added to spraying viscosity.
 */
export const SYSTEMS = [
  {
    id: "melamine",
    label: "Melamine",
    note: "Single-pack melamine sealer and topcoat, thinned about 1:1 with melamine thinner.",
    sealer: { spreadingRate: 90, parts: { base: 1, hardener: 0, thinner: 1 } },
    top: { spreadingRate: 120, parts: { base: 1, hardener: 0, thinner: 1 } },
    defaultSealerCoats: 1,
    defaultTopCoats: 2,
    hasHardener: false,
  },
  {
    id: "pu",
    label: "PU (2K polyurethane)",
    note: "Two-pack PU mixed 2 parts base to 1 part hardener, plus thinner to spraying viscosity.",
    sealer: { spreadingRate: 90, parts: { base: 2, hardener: 1, thinner: 1 } },
    top: { spreadingRate: 110, parts: { base: 2, hardener: 1, thinner: 1 } },
    defaultSealerCoats: 2,
    defaultTopCoats: 2,
    hasHardener: true,
  },
  {
    id: "nc",
    label: "NC lacquer",
    note: "Nitrocellulose lacquer, thinned heavily - roughly 1 part lacquer to 1.5 parts NC thinner.",
    sealer: { spreadingRate: 100, parts: { base: 1, hardener: 0, thinner: 1.5 } },
    top: { spreadingRate: 130, parts: { base: 1, hardener: 0, thinner: 1.5 } },
    defaultSealerCoats: 1,
    defaultTopCoats: 3,
    hasHardener: false,
  },
];

const SYSTEM_BY_ID = new Map(SYSTEMS.map((s) => [s.id, s]));

const isNum = (v) => Number.isFinite(v);

/**
 * Polishable area of a set of flush doors, both faces plus the edge allowance.
 * `sides` is 1 for a shutter polished on one face only, 2 for both.
 */
export function doorArea({ count, heightFt, widthFt, sides = 2 }) {
  const n = Number(count);
  const h = Number(heightFt);
  const w = Number(widthFt);
  const s = Number(sides);
  if (![n, h, w, s].every(isNum)) return 0;
  if (n <= 0 || h <= 0 || w <= 0 || s <= 0) return 0;
  return n * h * w * s * (1 + DOOR_EDGE_ALLOWANCE);
}

/** One layer (sealer or topcoat) of one system. */
export function layerQuantity({ area, coats, spreadingRate, parts, wastagePct }) {
  const totalParts = parts.base + parts.hardener + parts.thinner;
  if (!(coats > 0) || !(spreadingRate > 0) || !(totalParts > 0)) {
    return { readyLitres: 0, base: 0, hardener: 0, thinner: 0 };
  }
  const readyLitres = ((area * coats) / spreadingRate) * (1 + wastagePct / 100);
  return {
    readyLitres,
    base: (readyLitres * parts.base) / totalParts,
    hardener: (readyLitres * parts.hardener) / totalParts,
    thinner: (readyLitres * parts.thinner) / totalParts,
  };
}

/**
 * Full polish schedule for one job.
 *
 * @param {object} input
 * @param {number} input.furnitureArea    Directly measured area, sq ft.
 * @param {object} input.doors            { count, heightFt, widthFt, sides }
 * @param {string} input.systemId         "melamine" | "pu" | "nc"
 * @param {number} input.sealerCoats
 * @param {number} input.topCoats
 * @param {number} input.wastagePct
 * @param {number} input.sealerPricePerLitre
 * @param {number} input.topPricePerLitre
 * @param {number} input.hardenerPricePerLitre
 * @param {number} input.thinnerPricePerLitre
 * @returns {object} quantities and costs, or { error }.
 */
export function computeWoodPolish({
  furnitureArea = 0,
  doors = {},
  systemId = "melamine",
  sealerCoats,
  topCoats,
  wastagePct = 10,
  sealerPricePerLitre = 0,
  topPricePerLitre = 0,
  hardenerPricePerLitre = 0,
  thinnerPricePerLitre = 0,
}) {
  const system = SYSTEM_BY_ID.get(systemId);
  if (!system) return { error: "Pick a polish system." };

  const furniture = Number(furnitureArea);
  const sCoats = Number(sealerCoats ?? system.defaultSealerCoats);
  const tCoats = Number(topCoats ?? system.defaultTopCoats);
  const waste = Number(wastagePct);
  const sealerPrice = Number(sealerPricePerLitre);
  const topPrice = Number(topPricePerLitre);
  const hardenerPrice = Number(hardenerPricePerLitre);
  const thinnerPrice = Number(thinnerPricePerLitre);

  if (![furniture, sCoats, tCoats, waste, sealerPrice, topPrice, hardenerPrice, thinnerPrice].every(isNum)) {
    return { error: "Enter valid numbers in every field." };
  }
  if (furniture < 0) return { error: "Furniture area cannot be negative." };
  if (sCoats < 0 || sCoats > 5) return { error: "Sealer coats should be between 0 and 5." };
  if (tCoats < 1 || tCoats > 6) return { error: "Topcoats should be between 1 and 6." };
  if (waste < 0 || waste > MAX_WASTAGE_PCT) {
    return { error: `Wastage should be between 0% and ${MAX_WASTAGE_PCT}%.` };
  }
  if ([sealerPrice, topPrice, hardenerPrice, thinnerPrice].some((p) => p < 0 || p > 20000)) {
    return { error: "Prices should be between 0 and 20,000 per litre." };
  }

  const doorsArea = doorArea(doors);
  const area = furniture + doorsArea;
  if (!(area > 0)) {
    return { error: "Enter a furniture area or at least one door to polish." };
  }
  if (area > MAX_AREA_SQFT) {
    return { error: `Total area above ${MAX_AREA_SQFT.toLocaleString("en-IN")} sq ft is out of range.` };
  }

  const sealer =
    sCoats > 0
      ? layerQuantity({
          area,
          coats: sCoats,
          spreadingRate: system.sealer.spreadingRate,
          parts: system.sealer.parts,
          wastagePct: waste,
        })
      : { readyLitres: 0, base: 0, hardener: 0, thinner: 0 };

  const top = layerQuantity({
    area,
    coats: tCoats,
    spreadingRate: system.top.spreadingRate,
    parts: system.top.parts,
    wastagePct: waste,
  });

  const hardenerLitres = sealer.hardener + top.hardener;
  const thinnerLitres = sealer.thinner + top.thinner;
  const readyLitres = sealer.readyLitres + top.readyLitres;

  const sealerCost = sealer.base * sealerPrice;
  const topCost = top.base * topPrice;
  const hardenerCost = hardenerLitres * hardenerPrice;
  const thinnerCost = thinnerLitres * thinnerPrice;
  const totalCost = sealerCost + topCost + hardenerCost + thinnerCost;

  return {
    system,
    area,
    doorsArea,
    furnitureArea: furniture,
    sealerCoats: sCoats,
    topCoats: tCoats,
    wastagePct: waste,
    sealer,
    top,
    sealerBaseLitres: sealer.base,
    topBaseLitres: top.base,
    hardenerLitres,
    thinnerLitres,
    readyLitres,
    concentrateLitres: sealer.base + top.base + hardenerLitres,
    sealerCost,
    topCost,
    hardenerCost,
    thinnerCost,
    totalCost,
    costPerSqft: totalCost / area,
    totalCoats: sCoats + tCoats,
  };
}
