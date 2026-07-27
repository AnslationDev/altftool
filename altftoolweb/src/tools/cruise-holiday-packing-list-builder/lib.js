/**
 * Cruise holiday packing list engine.
 *
 * A cruise is packed by the evening dress code and the port/sea split, not by
 * a flat day count. Four rules drive the list.
 *
 * 1. FORMAL NIGHT SCHEDULE — mainstream cruise lines schedule roughly one
 *    formal, gala or "dress to impress" evening for every three to four
 *    nights: two on a seven-night sailing, one on a three or four-night one,
 *    four on a fortnight. formalNights = round(nights / 3.5), floored at one.
 *    Every other night is smart casual.
 *
 * 2. OUTFIT REUSE — a formal outfit can serve two formal nights and a smart
 *    casual outfit two casual nights, because different people are at your
 *    table each evening. Day wear follows the port/sea split: a fresh set for
 *    each port day, one per two sea days.
 *
 * 3. NO CHEAP LAUNDRY — ship laundry is charged per garment unless you buy a
 *    package, so the wardrobe is sized for the whole sailing by default.
 *
 * 4. CABIN RULES — surge-protected power strips, extension cords, irons,
 *    steamers, candles and hotplates are confiscated at embarkation on
 *    essentially every major line, because a cabin fire at sea has nowhere to
 *    go. Non-surge, cruise-approved strips and USB cubes are the workaround.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** Nights per scheduled formal evening on mainstream lines. */
export const NIGHTS_PER_FORMAL_NIGHT = 3.5;

/** How many evenings one outfit of each type can cover. */
export const NIGHTS_PER_FORMAL_OUTFIT = 2;
export const NIGHTS_PER_CASUAL_OUTFIT = 2;

/** One day outfit per port day, and one per this many sea days. */
export const SEA_DAYS_PER_DAY_OUTFIT = 2;

/** Ceiling on formal outfits — beyond this you are packing a wardrobe. */
export const MAX_FORMAL_OUTFITS = 3;

/** Typical checked allowances for the flight to the port, in kilograms. */
export const CHECKED_ALLOWANCE_KG = { domestic: 15, international: 23 };

/** Items confiscated at embarkation on essentially every major cruise line. */
export const PROHIBITED_ITEMS = [
  "Surge-protected power strips and extension cords",
  "Irons, garment steamers and travel kettles",
  "Candles, incense and anything with a naked flame",
  "Hotplates, hot water heaters and coffee makers",
  "Drones",
  "Any knife or blade beyond a small nail file",
];

export const MIN_NIGHTS = 1;
export const MAX_NIGHTS = 60;
export const MAX_TRAVELLERS = 8;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const ceil = (value) => Math.ceil(value - 1e-9);
const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
const round1 = (value) => Math.round(value * 10) / 10;

/**
 * Formal nights scheduled on a sailing of a given length.
 * @param {number} nights
 * @returns {number}
 */
export function scheduledFormalNights(nights) {
  if (!isNum(nights) || nights < 1) return 0;
  return Math.max(1, Math.round(nights / NIGHTS_PER_FORMAL_NIGHT));
}

/**
 * Evening and day outfit counts from the itinerary.
 * @param {{ nights:number, portDays:number, formalNights:number }} input
 * @returns {object | { error:string }}
 */
export function outfitSchedule({ nights, portDays, formalNights }) {
  if (!isNum(nights) || nights < 1) return { error: "Enter the number of nights on board." };
  if (!isNum(portDays) || portDays < 0) return { error: "Enter the number of port days." };
  if (portDays > nights) return { error: "Port days cannot exceed the nights on board." };
  if (!isNum(formalNights) || formalNights < 0) return { error: "Enter the number of formal nights." };
  if (formalNights > nights) return { error: "Formal nights cannot exceed the nights on board." };

  const casualNights = nights - formalNights;
  const seaDays = nights - portDays;

  return {
    nights,
    portDays,
    seaDays,
    formalNights,
    casualNights,
    formalOutfits:
      formalNights === 0 ? 0 : clamp(ceil(formalNights / NIGHTS_PER_FORMAL_OUTFIT), 1, MAX_FORMAL_OUTFITS),
    casualOutfits: casualNights === 0 ? 0 : ceil(casualNights / NIGHTS_PER_CASUAL_OUTFIT),
    dayOutfits: portDays + ceil(seaDays / SEA_DAYS_PER_DAY_OUTFIT),
  };
}

const CATALOG = [
  // --- Evening wear -------------------------------------------------------
  {
    id: "formal-outfit",
    group: "Evening wear",
    name: "Formal / gala night outfit",
    gramsEach: 900,
    perTraveller: true,
    include: (c) => c.formalOutfits > 0,
    qty: (c) => c.formalOutfits,
    note: (c) =>
      `${c.formalNights} formal nights — one outfit covers two, since the room is different each evening`,
  },
  {
    id: "formal-shoes",
    group: "Evening wear",
    name: "Formal shoes",
    gramsEach: 700,
    perTraveller: true,
    include: (c) => c.formalOutfits > 0,
    qty: () => 1,
  },
  {
    id: "casual-outfit",
    group: "Evening wear",
    name: "Smart casual dinner outfit",
    gramsEach: 500,
    perTraveller: true,
    include: (c) => c.casualOutfits > 0,
    qty: (c) => c.casualOutfits,
    note: (c) => `${c.casualNights} smart casual evenings — most lines ban shorts in the main dining room`,
  },
  {
    id: "wrap",
    group: "Evening wear",
    name: "Wrap, shawl or light jacket",
    gramsEach: 300,
    perTraveller: true,
    qty: () => 1,
    note: () => "Dining rooms and theatres are air-conditioned hard, whatever the latitude",
  },

  // --- Day wear -----------------------------------------------------------
  {
    id: "day-outfit",
    group: "Day wear",
    name: "Day outfits",
    gramsEach: 400,
    perTraveller: true,
    qty: (c) => c.dayOutfits,
    note: (c) => `${c.portDays} port days plus ${c.seaDays} sea days`,
  },
  {
    id: "swimwear",
    group: "Day wear",
    name: "Swimwear",
    gramsEach: 150,
    perTraveller: true,
    qty: (c) => (c.nights <= 2 ? 1 : 2),
    note: () => "Two, so one is dry — pool deck towels are supplied on board",
  },
  {
    id: "cover-up",
    group: "Day wear",
    name: "Cover-up for the walk to the pool",
    gramsEach: 220,
    perTraveller: true,
    qty: () => 1,
    note: () => "Swimwear alone is not allowed in the buffet on most lines",
  },
  {
    id: "underwear",
    group: "Day wear",
    name: "Underwear",
    gramsEach: 40,
    perTraveller: true,
    qty: (c) => c.wearDays + 1,
  },
  {
    id: "socks",
    group: "Day wear",
    name: "Socks",
    gramsEach: 50,
    perTraveller: true,
    qty: (c) => clamp(ceil(c.wearDays / 2) + 1, 2, 8),
  },
  {
    id: "sleepwear",
    group: "Day wear",
    name: "Sleepwear",
    gramsEach: 240,
    perTraveller: true,
    qty: (c) => (c.nights > 5 ? 2 : 1),
  },
  {
    id: "walking-shoes",
    group: "Day wear",
    name: "Comfortable walking shoes for shore days",
    gramsEach: 700,
    perTraveller: true,
    include: (c) => c.portDays > 0,
    qty: () => 1,
  },
  {
    id: "deck-shoes",
    group: "Day wear",
    name: "Flip-flops or deck shoes",
    gramsEach: 300,
    perTraveller: true,
    qty: () => 1,
    note: () => "Wet pool decks and polished stairwells are the ship's main injury source",
  },

  // --- Day one bag --------------------------------------------------------
  {
    id: "carry-on-kit",
    group: "Day-one carry-on",
    name: "Carry-on with swimwear, medication and a change of clothes",
    gramsEach: 900,
    perTraveller: true,
    qty: () => 1,
    note: () => "Checked bags are delivered to cabins over several hours after boarding",
  },
  {
    id: "documents",
    group: "Day-one carry-on",
    name: "Passport, visas, boarding pass and insurance",
    gramsEach: 80,
    perTraveller: true,
    qty: () => 1,
    note: () => "Some itineraries need a visa even if you never leave the ship in that port",
  },
  {
    id: "lanyard",
    group: "Day-one carry-on",
    name: "Lanyard for the cabin keycard",
    gramsEach: 20,
    perTraveller: true,
    qty: () => 1,
    note: () => "The card is your room key, ID and payment card — losing it stops all three",
  },
  {
    id: "cash",
    group: "Day-one carry-on",
    name: "Small notes for port taxis, markets and tips",
    gramsEach: 30,
    perTraveller: false,
    qty: () => 1,
  },

  // --- Cabin & tech -------------------------------------------------------
  {
    id: "power-strip",
    group: "Cabin & tech",
    name: "Non-surge power strip or USB cube (cruise-approved)",
    gramsEach: 200,
    perTraveller: false,
    qty: () => 1,
    note: () => "Surge protectors and extension cords are confiscated at embarkation",
  },
  {
    id: "chargers",
    group: "Cabin & tech",
    name: "Chargers and cables",
    gramsEach: 120,
    perTraveller: true,
    qty: () => 1,
  },
  {
    id: "adapter",
    group: "Cabin & tech",
    name: "Travel plug adapter",
    gramsEach: 90,
    perTraveller: false,
    include: (c) => c.international,
    qty: () => 1,
    note: () => "Ships often carry both US and European sockets, but not always in every cabin",
  },
  {
    id: "magnetic-hooks",
    group: "Cabin & tech",
    name: "Magnetic hooks",
    gramsEach: 60,
    perTraveller: false,
    qty: () => 4,
    note: () => "Cabin walls are steel and storage is the one thing cabins do not have",
  },
  {
    id: "over-door-organiser",
    group: "Cabin & tech",
    name: "Over-the-door organiser",
    gramsEach: 350,
    perTraveller: false,
    include: (c) => c.travellers >= 3,
    qty: () => 1,
  },
  {
    id: "wrinkle-spray",
    group: "Cabin & tech",
    name: "Wrinkle-release spray (no iron or steamer allowed)",
    gramsEach: 150,
    perTraveller: false,
    qty: () => 1,
  },

  // --- Health -------------------------------------------------------------
  {
    id: "motion-sickness",
    group: "Health",
    name: "Motion-sickness tablets or bands",
    gramsEach: 30,
    perTraveller: true,
    qty: () => 1,
    note: () => "Take them before you feel unwell — most work poorly once symptoms start",
  },
  {
    id: "medication",
    group: "Health",
    name: "Prescription medication in original packaging, plus spares",
    gramsEach: 200,
    perTraveller: true,
    qty: () => 1,
    note: () => "Ship shops do not dispense prescriptions and the medical centre bills privately",
  },
  {
    id: "sunscreen",
    group: "Health",
    name: "Sunscreen SPF 50+ (200 ml)",
    gramsEach: 215,
    perTraveller: false,
    qty: (c) => clamp(ceil((c.nights * c.travellers) / 7), 1, 6),
    note: () => "Sea glare doubles the exposure, and on-board bottles are priced accordingly",
  },
  {
    id: "hand-sanitiser",
    group: "Health",
    name: "Hand sanitiser",
    gramsEach: 90,
    perTraveller: true,
    qty: () => 1,
    note: () => "Norovirus outbreaks on ships spread by hand contact more than by food",
  },
  {
    id: "first-aid",
    group: "Health",
    name: "Plasters, painkillers and antacid",
    gramsEach: 200,
    perTraveller: false,
    qty: () => 1,
  },
];

export const GROUP_ORDER = [
  "Evening wear",
  "Day wear",
  "Day-one carry-on",
  "Cabin & tech",
  "Health",
];

/**
 * @param {object} input
 * @returns {object | { error:string }}
 */
export function buildCruisePackingList(input) {
  const {
    nights,
    travellers,
    portDays = 0,
    formalNights,
    international = true,
    laundryPackage = false,
    bagPlan = "international",
  } = input || {};

  if (!isNum(nights)) return { error: "Enter the number of nights on board as a number." };
  if (nights < MIN_NIGHTS) return { error: "A cruise is at least one night." };
  if (nights > MAX_NIGHTS) return { error: `Keep the sailing under ${MAX_NIGHTS} nights.` };
  if (!isNum(travellers) || travellers < 1) return { error: "Enter at least one traveller." };
  if (travellers > MAX_TRAVELLERS) {
    return { error: `This list is sized for up to ${MAX_TRAVELLERS} travellers.` };
  }

  const wholeNights = Math.round(nights);
  const people = Math.round(travellers);
  const formals = isNum(formalNights) ? Math.round(formalNights) : scheduledFormalNights(wholeNights);

  const schedule = outfitSchedule({
    nights: wholeNights,
    portDays: isNum(portDays) ? Math.round(portDays) : NaN,
    formalNights: formals,
  });
  if (schedule.error) return { error: schedule.error };

  // A laundry package resets the wardrobe roughly halfway through the sailing.
  const wearDays = laundryPackage ? Math.min(wholeNights, Math.ceil(wholeNights / 2) + 1) : wholeNights;

  const ctx = {
    ...schedule,
    travellers: people,
    wearDays,
    international,
    laundryPackage,
  };

  const byGroup = new Map(GROUP_ORDER.map((name) => [name, []]));
  let totalItems = 0;
  let totalGrams = 0;

  for (const item of CATALOG) {
    if (item.include && !item.include(ctx)) continue;
    const base = Math.max(0, Math.round(item.qty(ctx)));
    if (base === 0) continue;
    const qty = item.perTraveller ? base * people : base;
    const grams = item.gramsEach * qty;
    totalItems += qty;
    totalGrams += grams;
    byGroup.get(item.group).push({
      id: item.id,
      name: item.name,
      qty,
      grams,
      note: item.note ? item.note(ctx) : "",
    });
  }

  const groups = GROUP_ORDER.map((name) => ({ name, items: byGroup.get(name) })).filter(
    (group) => group.items.length > 0,
  );

  const allowanceKg =
    bagPlan === "domestic" ? CHECKED_ALLOWANCE_KG.domestic : CHECKED_ALLOWANCE_KG.international;
  const allowanceForParty = allowanceKg * people;

  return {
    groups,
    prohibited: PROHIBITED_ITEMS,
    totalItems,
    totalGrams,
    totalKg: round1(totalGrams / 1000),
    nights: wholeNights,
    travellers: people,
    portDays: schedule.portDays,
    seaDays: schedule.seaDays,
    formalNights: schedule.formalNights,
    casualNights: schedule.casualNights,
    formalOutfits: schedule.formalOutfits,
    casualOutfits: schedule.casualOutfits,
    dayOutfits: schedule.dayOutfits,
    suggestedFormalNights: scheduledFormalNights(wholeNights),
    wearDays,
    allowanceKg,
    allowanceForParty,
    withinAllowance: totalGrams / 1000 <= allowanceForParty,
    spareKg: round1(allowanceForParty - totalGrams / 1000),
  };
}
