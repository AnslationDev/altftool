/**
 * Household emergency kit generator.
 *
 * Quantities follow the published preparedness baselines rather than a guess:
 *
 *  - Water: FEMA/Ready.gov specifies one US gallon per person per day for
 *    drinking and sanitation, which is 3.785 litres; 4 litres is the rounded
 *    figure used in Canadian and Indian (NDMA) guidance and is what this tool
 *    uses. The same guidance notes that hot conditions, illness, pregnancy
 *    and nursing can push the requirement considerably higher.
 *  - Duration: three days for an evacuation go-bag, two weeks for supplies
 *    kept at home. That is the split used by both Ready.gov and the Red
 *    Cross, on the reasoning that outside help is usually reaching people
 *    within 72 hours but utilities can stay down far longer.
 *  - Food energy: 2,000 kcal a day for an adult and 1,400 for a child, the
 *    standard planning figures for ration sizing. Shelf-stable food averages
 *    roughly 2.5 kcal per gram once you mix cans (about 1.2) with dry staples
 *    and biscuits (about 4), which converts calories into pack weight.
 *  - Rotation: stored tap water is replaced every 6 months, packaged food and
 *    batteries checked every 12, medicines against their own expiry.
 *
 * Everything here is arithmetic on those constants plus a hazard-specific
 * add-on list. It is general preparedness information, not emergency advice
 * for a live incident — follow the instructions of your local authority.
 */

/** Litres of water per person per day (FEMA one gallon = 3.785 L, rounded). */
export const WATER_L_PER_PERSON_DAY = 4;

/**
 * Multiplier applied in hot conditions. Preparedness guidance notes water
 * needs can double in heat; 1.5 is a conservative middle setting.
 */
export const HOT_CLIMATE_WATER_FACTOR = 1.5;

/** Rough daily water allowance per pet, litres. A large dog drinks near an adult's share. */
export const WATER_L_PER_PET_DAY = 2;

/** Planning calories per day. */
export const KCAL_PER_ADULT_DAY = 2000;
export const KCAL_PER_CHILD_DAY = 1400;

/** Mixed shelf-stable rations average about 2.5 kcal per gram. */
export const KCAL_PER_GRAM_FOOD = 2.5;

/** Litres of water weigh a kilogram each. */
export const WATER_KG_PER_L = 1;

/** Rotation intervals, in months. */
export const ROTATION_MONTHS = {
  water: 6,
  food: 12,
  batteries: 12,
  medicines: 6,
  documents: 12,
};

/** The two standard planning horizons. */
export const MODES = [
  {
    id: "evacuate",
    label: "Go-bag (evacuation)",
    defaultDays: 3,
    note: "Carried on your back or thrown in a vehicle. Three days is the standard target, and weight is the binding constraint.",
  },
  {
    id: "shelter",
    label: "Home supplies (shelter in place)",
    defaultDays: 14,
    note: "Stored at home for a utility outage or a road closure. Two weeks is the Red Cross and Ready.gov figure.",
  },
];

/**
 * Core kit. `per` says what the count multiplies by:
 *   person | adult | child | infant | pet | household | personDay
 */
export const BASE_ITEMS = [
  // Water and food are computed separately; everything else is here.
  {
    id: "water-container",
    category: "Water and food",
    name: "Sealed water container or bottled water",
    unit: "litres",
    per: "computed-water",
    why: "Drinking and sanitation both come out of the same allowance, which is why the figure is a gallon a day and not two glasses.",
  },
  {
    id: "water-purification",
    category: "Water and food",
    name: "Water purification tablets or an unscented household bleach dropper",
    unit: "pack",
    per: "household",
    count: 1,
    why: "Stored water runs out before an outage does. Chlorine tablets or 2 drops of unscented 5% bleach per litre, left 30 minutes, make questionable water drinkable.",
  },
  {
    id: "food",
    category: "Water and food",
    name: "Non-perishable food needing no cooking",
    unit: "kcal",
    per: "computed-food",
    why: "Anything that needs boiling assumes a working stove. Plan on ready-to-eat first and cooked food as a bonus.",
  },
  {
    id: "can-opener",
    category: "Water and food",
    name: "Manual can opener",
    unit: "each",
    per: "household",
    count: 1,
    why: "The single most forgotten item in a tinned-food kit.",
  },
  {
    id: "mess-kit",
    category: "Water and food",
    name: "Cup, plate and cutlery set",
    unit: "sets",
    per: "person",
    count: 1,
    why: "Reusable beats disposable once the outage passes a day or two, but only if you have water to wash with.",
  },

  {
    id: "torch",
    category: "Light and power",
    name: "LED torch or headlamp",
    unit: "each",
    per: "person",
    count: 1,
    why: "One each, not one per household — people separate. A headlamp leaves both hands free.",
  },
  {
    id: "batteries",
    category: "Light and power",
    name: "Spare batteries for every device in the kit",
    unit: "sets",
    per: "household",
    count: 2,
    why: "Store them outside the device so a leaking cell does not ruin the torch you were relying on.",
  },
  {
    id: "radio",
    category: "Light and power",
    name: "Battery or hand-crank radio",
    unit: "each",
    per: "household",
    count: 1,
    why: "Broadcast radio keeps working when the mobile network is congested or the towers lose power.",
  },
  {
    id: "power-bank",
    category: "Light and power",
    name: "Charged power bank and cables",
    unit: "each",
    per: "household",
    count: 1,
    why: "Charge it to full and top it up whenever you rotate the kit, otherwise it will be flat when you need it.",
  },
  {
    id: "candles-no",
    category: "Light and power",
    name: "Matches or a lighter in a waterproof box",
    unit: "each",
    per: "household",
    count: 1,
    why: "Keep them for a stove, not for lighting — naked flames are the wrong answer after a quake or a gas leak.",
  },

  {
    id: "first-aid",
    category: "Health",
    name: "First aid kit with dressings, tape, antiseptic and gloves",
    unit: "kit",
    per: "household",
    count: 1,
    why: "Minor injuries are what actually happen; the kit exists so a cut does not become an infection while services are stretched.",
  },
  {
    id: "medicines",
    category: "Health",
    name: "Days of prescription medicine per person on regular medication",
    unit: "days",
    per: "computed-days",
    why: "Pharmacies close, and prescriptions cannot be refilled without records. Keep a written list of drug names and doses with the kit.",
  },
  {
    id: "orsandbasics",
    category: "Health",
    name: "Oral rehydration salts, paracetamol and any usual antihistamine",
    unit: "packs",
    per: "person",
    count: 2,
    why: "Dehydration and fever are the two most common problems in a displaced household.",
  },
  {
    id: "sanitation",
    category: "Health",
    name: "Soap, hand sanitiser, wipes and heavy-duty bin bags",
    unit: "sets",
    per: "household",
    count: 1,
    why: "Sanitation failures cause more illness after a disaster than the disaster does. Bin bags double as an emergency toilet liner.",
  },
  {
    id: "masks",
    category: "Health",
    name: "N95 / FFP2 masks",
    unit: "each",
    per: "person",
    count: 2,
    why: "Dust after a collapse, smoke from a fire, and airborne debris during clean-up all need a fitted mask, not a cloth one.",
  },
  {
    id: "spare-glasses",
    category: "Health",
    name: "Spare spectacles, contact solution or hearing-aid batteries",
    unit: "sets",
    per: "person",
    count: 1,
    why: "An old prescription pair is far better than nothing for anyone who cannot function without glasses.",
  },

  {
    id: "documents",
    category: "Documents and money",
    name: "Waterproof pouch of ID, insurance, bank and property copies",
    unit: "pouch",
    per: "household",
    count: 1,
    why: "Claims, relief and re-entry all need paperwork. Keep photographed copies in the cloud as well as paper in the bag.",
  },
  {
    id: "cash",
    category: "Documents and money",
    name: "Cash in small notes",
    unit: "envelope",
    per: "household",
    count: 1,
    why: "Card terminals and ATMs depend on power and network. Small denominations matter because nobody will have change.",
  },
  {
    id: "contacts",
    category: "Documents and money",
    name: "Written emergency contacts and an out-of-area contact",
    unit: "card",
    per: "person",
    count: 1,
    why: "Local lines jam before long-distance ones do, so an out-of-area relative is the better message relay. Written, because phones die.",
  },
  {
    id: "keys",
    category: "Documents and money",
    name: "Spare house and vehicle keys",
    unit: "sets",
    per: "household",
    count: 1,
    why: "The set in the kit is the one you have when the other set is inside the building you just left.",
  },

  {
    id: "clothing",
    category: "Shelter and clothing",
    name: "Complete change of clothing and sturdy closed shoes",
    unit: "sets",
    per: "person",
    count: 1,
    why: "Shoes by the bed, not in a cupboard. Broken glass is the commonest injury after a night-time quake or storm.",
  },
  {
    id: "blanket",
    category: "Shelter and clothing",
    name: "Blanket, sleeping bag or emergency foil blanket",
    unit: "each",
    per: "person",
    count: 1,
    why: "Shock and a wet night both drop core temperature faster than people expect, even in a warm climate.",
  },
  {
    id: "rain",
    category: "Shelter and clothing",
    name: "Rain poncho",
    unit: "each",
    per: "person",
    count: 1,
    why: "Staying dry costs almost no weight and prevents most of the exposure problems that follow.",
  },
  {
    id: "sheeting",
    category: "Shelter and clothing",
    name: "Plastic sheeting and duct tape",
    unit: "roll",
    per: "household",
    count: 1,
    why: "Covers a broken window or a hole in a roof, and improvises a shelter or a groundsheet.",
  },

  {
    id: "whistle",
    category: "Tools and signalling",
    name: "Whistle",
    unit: "each",
    per: "person",
    count: 1,
    why: "A whistle carries much further than a voice and can be blown for hours by someone who is trapped and exhausted.",
  },
  {
    id: "multitool",
    category: "Tools and signalling",
    name: "Multi-tool or a knife and pliers",
    unit: "each",
    per: "household",
    count: 1,
    why: "Cutting, prising and gripping cover most improvised repairs.",
  },
  {
    id: "wrench",
    category: "Tools and signalling",
    name: "Spanner or gas key to shut off utilities",
    unit: "each",
    per: "household",
    count: 1,
    why: "Store it next to the meter or valve it fits, and know in advance which way closes it.",
  },
  {
    id: "rope",
    category: "Tools and signalling",
    name: "Rope or paracord, 10 m",
    unit: "each",
    per: "household",
    count: 1,
    why: "Securing a tarpaulin, hauling a bag, marking a route in poor visibility.",
  },
  {
    id: "map",
    category: "Tools and signalling",
    name: "Printed local map with two evacuation routes marked",
    unit: "each",
    per: "household",
    count: 1,
    why: "Navigation apps need a network and a charged phone. Marking two routes means one blocked road is not a crisis.",
  },
  {
    id: "notebook",
    category: "Tools and signalling",
    name: "Notebook and pencil",
    unit: "each",
    per: "household",
    count: 1,
    why: "For messages left on a door, meter readings, damage notes and claim details.",
  },
];

/** Extras that only make sense for particular household members. */
export const DEPENDENT_ITEMS = [
  {
    id: "infant-formula",
    category: "Infants",
    name: "Days of formula, bottles and sterilising tablets",
    unit: "days",
    per: "computed-days",
    requires: "infants",
    why: "Formula needs clean water, so an infant in the household raises the water requirement as well as the food one.",
  },
  {
    id: "nappies",
    category: "Infants",
    name: "Nappies and wipes per infant per day",
    unit: "nappies",
    per: "infantDay",
    count: 6,
    requires: "infants",
    why: "Six a day per infant is a realistic planning figure and one of the bulkiest things in the bag.",
  },
  {
    id: "child-comfort",
    category: "Children",
    name: "A book, small toy or comfort item per child",
    unit: "each",
    per: "child",
    count: 1,
    requires: "children",
    why: "Hours of waiting are the actual experience of most emergencies, and a bored, frightened child makes every other task harder.",
  },
  {
    id: "pet-food",
    category: "Pets",
    name: "Days of pet food, bowl, lead and carrier",
    unit: "days",
    per: "computed-days",
    requires: "pets",
    why: "Many shelters will not take animals, so a carrier and the vaccination record decide whether the pet can come with you.",
  },
];

/** Hazard-specific additions. */
export const HAZARDS = [
  {
    id: "flood",
    label: "Flood or waterlogging",
    items: [
      ["Waterproof dry bag for documents and phone", "Paper records survive a flood only if they were sealed before it."],
      ["Life jackets for non-swimmers and children", "Moving water half a metre deep will take an adult off their feet."],
      ["Gumboots and heavy gloves", "Floodwater carries sewage, glass and sharp debris you cannot see."],
      ["Plan to move valuables and electrics above the expected level", "Height is the only flood defence a household controls."],
    ],
  },
  {
    id: "cyclone",
    label: "Cyclone, hurricane or high wind",
    items: [
      ["Plywood or shutters sized for each window in advance", "Cutting boards to size during a warning is how people run out of time."],
      ["Rope and tie-downs for outdoor items", "Anything loose outside becomes a projectile at storm wind speeds."],
      ["Filled bathtub or drums of non-drinking water", "Municipal supply usually fails before the wind does."],
      ["Full fuel tank and cash withdrawn early", "Both queues get impossible about 24 hours before landfall."],
    ],
  },
  {
    id: "earthquake",
    label: "Earthquake",
    items: [
      ["Sturdy shoes and a torch tied to the bed leg", "The first hazard after a night-time quake is broken glass on the floor."],
      ["Gas shut-off key beside the meter", "Post-quake fires are usually gas fires, and they start in the first hour."],
      ["Heavy furniture, water heater and shelves anchored", "Preparation here is fixing the building, not filling a bag."],
      ["Agreed out-of-area contact and meeting point", "Local networks jam immediately; long-distance ones often survive."],
    ],
  },
  {
    id: "wildfire",
    label: "Wildfire or smoke",
    items: [
      ["N95 masks for everyone, plus spares", "Smoke particles are the health risk long after the flame front has passed."],
      ["Go-bag kept in the car during fire season", "Evacuation notice can be minutes, and driving out early is the whole plan."],
      ["Cleared vegetation and gutters around the building", "Most homes ignite from wind-blown embers, not from the fire front itself."],
      ["Cotton or wool clothing, never synthetics", "Synthetic fabric melts onto skin under radiant heat."],
    ],
  },
  {
    id: "heat",
    label: "Extreme heat",
    items: [
      ["Extra water, at least half as much again", "Sweat losses in extreme heat can double normal fluid requirements."],
      ["Oral rehydration salts and electrolyte sachets", "Water alone does not replace what heavy sweating removes."],
      ["Battery fan and damp cloths", "Evaporative cooling works without mains power."],
      ["An identified cool public building nearby", "Shifting for the hottest hours beats trying to cool a whole home."],
    ],
  },
  {
    id: "cold",
    label: "Extreme cold or snow",
    items: [
      ["Extra blankets, hats and thermal layers", "Most heat is lost from the head and from still air moving over skin."],
      ["Vented heater and its fuel, never an unvented one indoors", "Unvented combustion heaters are a carbon monoxide risk in a sealed room."],
      ["Carbon monoxide alarm", "CO has no smell, and the mercaptan warning in gas does not apply to it."],
      ["Insulate exposed pipework before the freeze", "A burst pipe turns a cold snap into a flood."],
    ],
  },
  {
    id: "outage",
    label: "Long power cut",
    items: [
      ["Ice packs or frozen bottles in the freezer", "A full freezer holds safe temperature for around 48 hours if kept shut."],
      ["Manual override or key for electric gates and shutters", "Powered access is no access when the power is off."],
      ["Charged inverter or UPS, tested under load", "An untested battery is an assumption, not a backup."],
      ["Landline or a second network SIM", "Mobile cell sites have limited battery backup of their own."],
    ],
  },
];

const isInt = (value) => typeof value === "number" && Number.isFinite(value) && value >= 0;

const MAX_PEOPLE = 20;
const MAX_PETS = 10;
const MAX_DAYS = 60;

/** Add whole months to an ISO date string, returning a new ISO date string. */
export function addMonthsIso(isoDate, months) {
  if (typeof isoDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return null;
  if (!Number.isFinite(months)) return null;
  const [year, month, day] = isoDate.split("-").map(Number);
  const base = new Date(Date.UTC(year, month - 1, day));
  if (Number.isNaN(base.getTime())) return null;
  const targetMonth = base.getUTCMonth() + Math.round(months);
  const shifted = new Date(Date.UTC(base.getUTCFullYear(), targetMonth, 1));
  const daysInTarget = new Date(
    Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth() + 1, 0),
  ).getUTCDate();
  shifted.setUTCDate(Math.min(day, daysInTarget));
  return shifted.toISOString().slice(0, 10);
}

/**
 * Build the kit.
 *
 * @param {object} input
 * @param {number} input.adults
 * @param {number} input.children     Aged roughly 4 to 12.
 * @param {number} input.infants      Under 2, formula and nappies.
 * @param {number} input.pets
 * @param {number} input.days         Days of cover.
 * @param {"evacuate"|"shelter"} input.mode
 * @param {boolean} [input.hotClimate]
 * @param {string[]} [input.hazards]  Hazard ids.
 * @param {string} [input.packDateIso] Date the kit was packed, YYYY-MM-DD.
 */
export function buildEmergencyKit({
  adults = 2,
  children = 0,
  infants = 0,
  pets = 0,
  days = 3,
  mode = "evacuate",
  hotClimate = false,
  hazards = [],
  packDateIso = null,
} = {}) {
  if (![adults, children, infants, pets, days].every(isInt)) {
    return { error: "Household counts and days must be whole numbers of zero or more." };
  }
  const people = adults + children + infants;
  if (people === 0) {
    return { error: "Add at least one person to the household." };
  }
  if (people > MAX_PEOPLE) {
    return { error: `This sizes a household kit, up to ${MAX_PEOPLE} people. Larger groups need an institutional plan.` };
  }
  if (pets > MAX_PETS) {
    return { error: `Pets should be ${MAX_PETS} or fewer.` };
  }
  if (days < 1 || days > MAX_DAYS) {
    return { error: `Days of cover should be between 1 and ${MAX_DAYS}.` };
  }
  if (!MODES.some((m) => m.id === mode)) {
    return { error: "Choose a go-bag or home-supplies kit." };
  }

  const waterFactor = hotClimate ? HOT_CLIMATE_WATER_FACTOR : 1;
  const peopleWaterL = people * days * WATER_L_PER_PERSON_DAY * waterFactor;
  const petWaterL = pets * days * WATER_L_PER_PET_DAY * waterFactor;
  const waterL = peopleWaterL + petWaterL;

  const kcalPerDay = adults * KCAL_PER_ADULT_DAY + children * KCAL_PER_CHILD_DAY;
  const totalKcal = kcalPerDay * days;
  const foodKg = totalKcal / KCAL_PER_GRAM_FOOD / 1000;

  const waterKg = waterL * WATER_KG_PER_L;
  // Everything that is not water or food: gear, clothing, documents, first aid.
  const gearKg = 2 + people * 1.5 + pets * 0.5;
  const totalKg = waterKg + foodKg + gearKg;
  const perPersonKg = totalKg / people;

  // Both singular (used by `per`) and plural (used by `requires`) keys, so the
  // item table can read naturally in either position.
  const counts = {
    person: people,
    people,
    adult: adults,
    adults,
    child: children,
    children,
    infant: infants,
    infants,
    pet: pets,
    pets,
    household: 1,
    infantDay: infants * days,
  };

  const quantityFor = (item) => {
    if (item.per === "computed-water") {
      return { amount: waterL, text: `${waterL.toFixed(1)} litres` };
    }
    if (item.per === "computed-food") {
      return { amount: totalKcal, text: `${Math.round(totalKcal).toLocaleString("en-IN")} kcal (~${foodKg.toFixed(1)} kg)` };
    }
    if (item.per === "computed-days") {
      return { amount: days, text: `${days} days` };
    }
    const multiplier = counts[item.per] ?? 1;
    const amount = (item.count ?? 1) * multiplier;
    return { amount, text: `${amount} ${item.unit}` };
  };

  const included = [
    ...BASE_ITEMS,
    ...DEPENDENT_ITEMS.filter((item) => (counts[item.requires] ?? 0) > 0),
  ];

  const byCategory = [];
  for (const item of included) {
    const quantity = quantityFor(item);
    if (quantity.amount <= 0) continue;
    let group = byCategory.find((entry) => entry.category === item.category);
    if (!group) {
      group = { category: item.category, items: [] };
      byCategory.push(group);
    }
    group.items.push({ ...item, quantity: quantity.text, amount: quantity.amount });
  }

  const chosenHazards = HAZARDS.filter((hazard) => hazards.includes(hazard.id));

  const rotations = packDateIso
    ? Object.entries(ROTATION_MONTHS)
        .map(([key, months]) => ({
          item: key,
          months,
          dueIso: addMonthsIso(packDateIso, months),
        }))
        .filter((entry) => entry.dueIso !== null)
    : [];

  const itemCount = byCategory.reduce((sum, group) => sum + group.items.length, 0);

  let verdict;
  if (mode === "evacuate" && perPersonKg > 12) {
    verdict = `At ${perPersonKg.toFixed(1)} kg a head this is more than most people can carry any distance, and ${((waterKg / totalKg) * 100).toFixed(0)}% of it is water. Keep a day of water in the bag and the rest in the vehicle or cached where you are heading.`;
  } else if (mode === "evacuate") {
    verdict = `About ${perPersonKg.toFixed(1)} kg a head — carryable. Pack water at the bottom and documents where you can reach them without unpacking.`;
  } else {
    verdict = `${waterL.toFixed(0)} litres of water is the bulk of this kit: roughly ${Math.ceil(waterL / 20)} twenty-litre containers. Store them away from direct sun and rotate every ${ROTATION_MONTHS.water} months.`;
  }

  return {
    mode,
    days,
    people,
    adults,
    children,
    infants,
    pets,
    hotClimate,
    waterL,
    peopleWaterL,
    petWaterL,
    waterKg,
    kcalPerDay,
    totalKcal,
    foodKg,
    gearKg,
    totalKg,
    perPersonKg,
    waterSharePct: totalKg > 0 ? (waterKg / totalKg) * 100 : 0,
    byCategory,
    itemCount,
    hazardKits: chosenHazards,
    rotations,
    verdict,
  };
}
