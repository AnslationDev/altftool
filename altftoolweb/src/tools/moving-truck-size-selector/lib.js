/**
 * Moving vehicle selector.
 *
 * Method
 * ------
 * 1. Sum the packed cube of every item. Packed cube means the rectangular space
 *    the item occupies on the load bed once it is blanket-wrapped and stacked,
 *    which is why a 3-seat sofa is quoted at 45 cu ft rather than its bare
 *    footprint. These are the survey volumes removal firms use on a cube sheet.
 * 2. Estimate weight from volume using the household-goods density the moving
 *    industry has used for decades for constructive weight: 7 lb per cubic foot
 *    (about 112 kg per cubic metre) for furniture, appliances and unlisted
 *    extras. Packed cartons are rated at double that (see CARTON_LB_PER_CUFT)
 *    since boxed books, kitchenware and tools run far denser than bulky,
 *    mostly-air furniture.
 * 3. Compare against each vehicle's *usable* cube, which is the deck cube
 *    multiplied by a stacking efficiency. Household goods are irregular, so a
 *    body never fills to 100%; 85% is the practical ceiling for a professional
 *    crew loading floor-to-roof.
 * 4. Recommend the smallest vehicle that satisfies BOTH volume and payload.
 *
 * Vehicle dimensions are the common Indian goods-carrier load-body sizes that
 * packers and movers quote (mini tempo through 32 ft container). Payloads are
 * the class figures, not a specific registration — always confirm the rated
 * gross vehicle weight on the vehicle's own papers.
 */

/** Household-goods constructive density used by movers: 7 lb per cubic foot. */
export const LB_PER_CUFT = 7;
export const KG_PER_LB = 0.45359237;

/**
 * Packed cartons run denser than the whole-shipment average: books,
 * kitchenware and tools boxed tightly weigh far more per cubic foot than
 * bulky, mostly-air furniture. Movers commonly rate cartons at roughly
 * double the household-wide constructive-weight figure.
 */
export const CARTON_LB_PER_CUFT = LB_PER_CUFT * 2;

/** Cubic feet to cubic metres (1 ft = 0.3048 m). */
export const CUFT_TO_M3 = 0.028316846592;

/** Practical stacking efficiency of an enclosed body loaded with household goods. */
export const STACKING_EFFICIENCY = 0.85;

/** Average packed cube of a mixed carton set (see the Moving Boxes Calculator mix). */
export const AVG_CARTON_CUFT = 3.5;

/**
 * Packed cube per item, in cubic feet. Values are the standard cube-sheet
 * allowances used on removal surveys.
 */
export const ITEMS = [
  { id: "doubleBed", label: "Double / queen bed with mattress", cuft: 60, group: "Bedroom" },
  { id: "singleBed", label: "Single bed with mattress", cuft: 35, group: "Bedroom" },
  { id: "wardrobe", label: "Wardrobe / almirah (3-door)", cuft: 45, group: "Bedroom" },
  { id: "dresser", label: "Chest of drawers or dressing table", cuft: 20, group: "Bedroom" },
  { id: "sofa3", label: "Sofa, 3-seat", cuft: 45, group: "Living" },
  { id: "sofa2", label: "Sofa or loveseat, 2-seat", cuft: 30, group: "Living" },
  { id: "armchair", label: "Armchair or recliner", cuft: 15, group: "Living" },
  { id: "diningSet", label: "Dining table with 4 chairs", cuft: 45, group: "Living" },
  { id: "bookshelf", label: "Bookshelf, cabinet or showcase", cuft: 25, group: "Living" },
  { id: "tv", label: 'Television, 43-65"', cuft: 8, group: "Living" },
  { id: "desk", label: "Study desk with chair", cuft: 20, group: "Living" },
  { id: "fridge", label: "Refrigerator, double door", cuft: 25, group: "Appliances" },
  { id: "fridgeSingle", label: "Refrigerator, single door", cuft: 14, group: "Appliances" },
  { id: "washer", label: "Washing machine", cuft: 12, group: "Appliances" },
  { id: "ac", label: "Split AC (indoor + outdoor unit)", cuft: 12, group: "Appliances" },
  { id: "acWindow", label: "Window AC", cuft: 8, group: "Appliances" },
  { id: "twoWheeler", label: "Scooter or motorcycle", cuft: 45, group: "Other" },
  { id: "mattressExtra", label: "Spare mattress, rolled", cuft: 20, group: "Other" },
  { id: "plants", label: "Large potted plant", cuft: 6, group: "Other" },
];

const ITEM_BY_ID = Object.fromEntries(ITEMS.map((item) => [item.id, item]));

/**
 * Goods vehicles commonly quoted for household moves in India.
 * deckCuft is length x width x height of the load body.
 */
export const VEHICLES = [
  {
    id: "ace",
    name: "Mini tempo (Tata Ace class)",
    deck: '7 x 4.5 x 4.5 ft',
    deckCuft: 7 * 4.5 * 4.5,
    payloadKg: 750,
    note: "Single-room moves, hostel and PG shifts",
  },
  {
    id: "dost",
    name: "Pickup / LCV (Dost, Supro class)",
    deck: '8.5 x 4.75 x 5 ft',
    deckCuft: 8.5 * 4.75 * 5,
    payloadKg: 1250,
    note: "1 RK or a lightly furnished 1 BHK",
  },
  {
    id: "t407",
    name: "Tata 407 class tempo",
    deck: '9.5 x 5.5 x 5.5 ft',
    deckCuft: 9.5 * 5.5 * 5.5,
    payloadKg: 2500,
    note: "A furnished 1 BHK",
  },
  {
    id: "t14",
    name: "14 ft truck",
    deck: '14 x 6 x 6 ft',
    deckCuft: 14 * 6 * 6,
    payloadKg: 4000,
    note: "Typical 2 BHK",
  },
  {
    id: "t17",
    name: "17 ft truck",
    deck: '17 x 6 x 7 ft',
    deckCuft: 17 * 6 * 7,
    payloadKg: 5000,
    note: "Large 2 BHK or a compact 3 BHK",
  },
  {
    id: "t19",
    name: "19-20 ft truck",
    deck: '19 x 7 x 7 ft',
    deckCuft: 19 * 7 * 7,
    payloadKg: 7000,
    note: "Full 3 BHK",
  },
  {
    id: "t22",
    name: "22 ft truck",
    deck: '22 x 7.5 x 7 ft',
    deckCuft: 22 * 7.5 * 7,
    payloadKg: 9000,
    note: "4 BHK or a 3 BHK with a vehicle on board",
  },
  {
    id: "t32",
    name: "32 ft single-axle container",
    deck: '32 x 8 x 8 ft',
    deckCuft: 32 * 8 * 8,
    payloadKg: 7000,
    note: "Villa or bulky-but-light loads; cube-limited, not weight-limited",
  },
].map((vehicle) => ({
  ...vehicle,
  usableCuft: Math.round(vehicle.deckCuft * STACKING_EFFICIENCY),
}));

/** Convert a packed cube in cubic feet to an estimated weight in kilograms. */
export function estimateWeightKg(cuft) {
  if (!Number.isFinite(cuft) || cuft <= 0) return 0;
  return cuft * LB_PER_CUFT * KG_PER_LB;
}

/**
 * Choose the smallest vehicle that carries the load.
 *
 * @param {object} input
 * @param {Record<string, number>} input.counts  Item id -> quantity (0-99 each).
 * @param {number} input.cartons                 Number of packing cartons (0-999).
 * @param {number} input.extraCuft               Anything not listed, in cubic feet (0-5000).
 * @returns {object} recommendation, or { error }.
 */
export function selectVehicle({ counts = {}, cartons = 0, extraCuft = 0 } = {}) {
  const cartonCount = Number(cartons);
  const extra = Number(extraCuft);

  if (!Number.isFinite(cartonCount) || cartonCount < 0) {
    return { error: "Enter 0 or more cartons." };
  }
  if (cartonCount > 999) {
    return { error: "Enter up to 999 cartons — beyond that, plan the move in sections." };
  }
  if (!Number.isFinite(extra) || extra < 0) {
    return { error: "Extra volume cannot be negative." };
  }
  if (extra > 5000) {
    return { error: "Enter up to 5,000 cu ft of extra volume." };
  }

  const lines = [];
  let itemCuft = 0;
  let itemCount = 0;
  for (const [id, rawQty] of Object.entries(counts)) {
    const item = ITEM_BY_ID[id];
    if (!item) continue;
    const qty = Number(rawQty);
    if (!Number.isFinite(qty) || qty < 0) {
      return { error: `Enter 0 or more for "${item.label}".` };
    }
    if (qty > 99) {
      return { error: `Enter up to 99 of "${item.label}".` };
    }
    const whole = Math.floor(qty);
    if (whole <= 0) continue;
    const cuft = whole * item.cuft;
    itemCuft += cuft;
    itemCount += whole;
    lines.push({ id, label: item.label, qty: whole, cuft });
  }

  const cartonCuft = Math.floor(cartonCount) * AVG_CARTON_CUFT;
  const totalCuft = itemCuft + cartonCuft + extra;

  if (totalCuft <= 0) {
    return { error: "Add at least one item, carton or extra volume to size a vehicle." };
  }

  // Cartons are weighted on their own, denser rate (see CARTON_LB_PER_CUFT) —
  // items and unlisted extras use the whole-shipment average.
  const weightKg =
    estimateWeightKg(itemCuft) +
    cartonCuft * CARTON_LB_PER_CUFT * KG_PER_LB +
    estimateWeightKg(extra);

  const fits = (vehicle) => vehicle.usableCuft >= totalCuft && vehicle.payloadKg >= weightKg;
  const recommended = VEHICLES.find(fits) ?? null;

  // Nothing in the fleet holds it in one go: quote trips in the largest body.
  const largest = VEHICLES[VEHICLES.length - 1];
  // Over-size loads need enough trips to satisfy cube AND payload.
  const trips = recommended
    ? 1
    : Math.max(
        Math.ceil(totalCuft / largest.usableCuft),
        Math.ceil(weightKg / largest.payloadKg),
      );
  const chosen = recommended ?? largest;

  const fillPercent = Math.round((totalCuft / (chosen.usableCuft * trips)) * 100);
  const spareCuft = Math.round(chosen.usableCuft * trips - totalCuft);

  // How much cube would have to go to drop one size — a real lever, since the
  // next size down is usually a meaningfully cheaper quote.
  const index = VEHICLES.findIndex((vehicle) => vehicle.id === chosen.id);
  const smaller = index > 0 && trips === 1 ? VEHICLES[index - 1] : null;
  const shedCuft = smaller ? Math.max(0, Math.round(totalCuft - smaller.usableCuft)) : 0;
  // Use this load's own blended density (its actual mix of items, cartons and
  // extras), not a generic flat rate, so the check reflects what is really
  // being moved rather than a hypothetical average shipment.
  const loadDensityKgPerCuft = weightKg / totalCuft;
  const shedBlockedByWeight = Boolean(
    smaller && smaller.payloadKg < loadDensityKgPerCuft * smaller.usableCuft
  );

  return {
    totalCuft: Math.round(totalCuft * 10) / 10,
    itemCuft: Math.round(itemCuft * 10) / 10,
    cartonCuft: Math.round(cartonCuft * 10) / 10,
    extraCuft: Math.round(extra * 10) / 10,
    totalM3: Math.round(totalCuft * CUFT_TO_M3 * 100) / 100,
    weightKg: Math.round(weightKg),
    itemCount,
    lines: lines.sort((a, b) => b.cuft - a.cuft),
    recommended: chosen,
    fitsInOne: Boolean(recommended),
    trips,
    fillPercent,
    spareCuft,
    smaller,
    shedCuft,
    shedBlockedByWeight,
  };
}
