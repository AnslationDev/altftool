/**
 * Child safety home checklist.
 *
 * Childproofing is not one job done once. Each new motor skill — rolling,
 * sitting, crawling, pulling to stand, walking, climbing — opens a new set of
 * hazards, so the useful question is "what is dangerous for a child of this
 * age in this home", not "what is dangerous in general".
 *
 * Every item below carries the age in months at which the skill that makes it
 * relevant typically appears, and the published rule or standard behind it.
 * Sources are named on each entry: CPSC (US Consumer Product Safety
 * Commission) regulations in 16 CFR, ASTM and ANSI/WCMA voluntary standards,
 * AAP (American Academy of Pediatrics) guidance, and the NEC wiring code.
 *
 * Informational only. It does not replace paediatric or fire-safety advice.
 */

/** How far ahead the checklist looks, in months, so a parent can prepare. */
export const LOOKAHEAD_MONTHS = 3;

/** Oldest age the checklist covers, in months (6 years). */
export const MAX_AGE_MONTHS = 72;

/** Weight each priority carries in the readiness score. */
export const PRIORITY_WEIGHT = { critical: 3, high: 2, standard: 1 };

/** Developmental stages, with the month each typically starts. */
export const STAGES = [
  {
    id: "newborn",
    label: "Newborn and rolling",
    fromMonths: 0,
    summary:
      "Cannot move away from a hazard. Risk is sleep surface, falls from a height an adult put them on, and anything within reach of the cot.",
  },
  {
    id: "crawling",
    label: "Sitting and crawling",
    fromMonths: 6,
    summary:
      "Everything at floor level and up to about 60 cm is now reachable, and everything reachable goes in the mouth.",
  },
  {
    id: "cruising",
    label: "Pulling up and walking",
    fromMonths: 12,
    summary:
      "Reach extends to worktop height. Furniture becomes something to haul on, so tip-over and hot liquids dominate.",
  },
  {
    id: "climbing",
    label: "Climbing and opening",
    fromMonths: 24,
    summary:
      "Drawers become a staircase, latches get solved, and windows, balconies and locked cupboards become reachable.",
  },
  {
    id: "school",
    label: "Pre-school",
    fromMonths: 48,
    summary:
      "Understands rules but not consequences. Focus shifts from barriers to supervision, water competence and teaching.",
  },
];

/** Rooms the checklist groups by. */
export const ROOMS = [
  { id: "home", label: "Whole home" },
  { id: "nursery", label: "Nursery and bedrooms" },
  { id: "kitchen", label: "Kitchen and dining" },
  { id: "bathroom", label: "Bathroom" },
  { id: "stairs", label: "Stairs and landing" },
  { id: "balcony", label: "Balcony and windows" },
  { id: "outdoor", label: "Outdoor and water" },
];

/**
 * Optional home features. An item that names a feature is only shown when the
 * home actually has it.
 */
export const FEATURES = [
  { id: "stairs", label: "Internal stairs" },
  { id: "balcony", label: "Balcony or upper-floor windows" },
  { id: "pool", label: "Pool or garden pond" },
  { id: "waterStore", label: "Water drums, sump or overhead tank" },
  { id: "garden", label: "Garden, yard or terrace" },
];

/**
 * Third-degree burn times for adult skin in hot tap water, the figures used
 * across burn-prevention guidance. A child's skin is thinner and burns at a
 * lower temperature in less time, so treat every row as an upper bound.
 * Sorted ascending by temperature.
 */
export const SCALD_TIMES = [
  { tempC: 49, tempF: 120, seconds: 300 },
  { tempC: 51, tempF: 124, seconds: 180 },
  { tempC: 53, tempF: 127, seconds: 60 },
  { tempC: 56, tempF: 133, seconds: 15 },
  { tempC: 60, tempF: 140, seconds: 3 },
  { tempC: 64, tempF: 148, seconds: 2 },
  { tempC: 68, tempF: 155, seconds: 1 },
];

/**
 * Maximum hot water temperature recommended for homes with young children:
 * 49 C / 120 F (American Academy of Pediatrics, and the same figure in most
 * national scald-prevention guidance).
 */
export const SAFE_WATER_TEMP_C = 49;

/** The checklist itself. fromMonths / untilMonths bound when an item applies. */
export const HAZARDS = [
  // ---- Whole home -------------------------------------------------------
  {
    id: "battery-compartments",
    room: "home",
    priority: "critical",
    fromMonths: 0,
    action: "Screw or tape shut every battery compartment holding a coin cell",
    why: "A swallowed 20 mm lithium coin cell can burn through the wall of the oesophagus in about two hours. The US Reese's Law now requires child-resistant compartments and warning labels on consumer products that use them.",
  },
  {
    id: "blind-cords",
    room: "home",
    priority: "critical",
    fromMonths: 0,
    action: "Remove looped blind and curtain cords, or fit cleats and tension devices",
    why: "Looped cords are a strangulation hazard for a child who can sit or stand. The ANSI/WCMA A100.1 standard has required stock window coverings to be cordless or to have inaccessible cords since 2018.",
  },
  {
    id: "furniture-anchors",
    room: "home",
    priority: "critical",
    fromMonths: 6,
    action: "Anchor every chest, bookcase, wardrobe and television to a wall stud",
    why: "A drawer pulled open turns a chest of drawers into a lever. The US STURDY Act of 2022 made a tip-over stability standard mandatory for clothing storage units precisely because supplied straps so often go unfitted.",
  },
  {
    id: "window-guards",
    room: "home",
    priority: "critical",
    fromMonths: 12,
    action: "Fit window stops or guards so any window opens no more than 10 cm",
    why: "Insect screens are designed to keep insects out, not to hold a child's weight. An opening of about 10 cm (4 in) is enough for a small child to pass through.",
  },
  {
    id: "small-parts",
    room: "home",
    priority: "high",
    fromMonths: 6,
    untilMonths: 47,
    action: "Sweep floor level for anything that fails the small-parts test",
    why: "CPSC 16 CFR 1501 defines a choking hazard for under-threes as anything that fits inside a cylinder 3.17 cm across and 5.71 cm deep. An empty toilet-roll tube is the household version of that gauge.",
  },
  {
    id: "outlets",
    room: "home",
    priority: "high",
    fromMonths: 6,
    action: "Use tamper-resistant sockets or sliding covers, not push-in plugs",
    why: "The US National Electrical Code has required tamper-resistant receptacles in new dwellings since 2008. Loose push-in caps become a choking hazard as soon as a child can prise one out.",
  },
  {
    id: "plastic-bags",
    room: "home",
    priority: "high",
    fromMonths: 6,
    action: "Store plastic bags, cling film and packaging out of reach",
    why: "Thin film clings to the face and blocks the airway silently. Nappy sacks are the size most often involved because they are kept at changing height.",
  },
  {
    id: "smoke-alarms",
    room: "home",
    priority: "high",
    fromMonths: 0,
    action: "Test smoke alarms monthly and fit one outside every sleeping area",
    why: "Working alarms roughly halve the risk of dying in a house fire. Fit them on every level and outside each sleeping area.",
  },
  {
    id: "trailing-cables",
    room: "home",
    priority: "standard",
    fromMonths: 6,
    action: "Shorten or clip back trailing appliance cables and extension leads",
    why: "A pulled cable brings the appliance with it, and a chewed one is both a burn and a shock risk.",
  },
  {
    id: "door-guards",
    room: "home",
    priority: "standard",
    fromMonths: 12,
    action: "Fit finger guards on hinge-side door gaps",
    why: "The hinge side of a door closes with enough force to crush a fingertip, and it is the side a toddler holds while pushing.",
  },
  {
    id: "emergency-numbers",
    room: "home",
    priority: "standard",
    fromMonths: 0,
    action: "Post emergency and poison-centre numbers where any carer can see them",
    why: "Poisoning advice is time-critical and the person on the spot may not be a parent. Keep the numbers on the fridge, not only in a phone.",
  },

  // ---- Nursery and bedrooms --------------------------------------------
  {
    id: "safe-sleep",
    room: "nursery",
    priority: "critical",
    fromMonths: 0,
    untilMonths: 12,
    action: "Bare cot: firm flat mattress, no pillows, bumpers, quilts or toys",
    why: "AAP safe-sleep guidance is a firm, flat, non-inclined surface with nothing else in the sleep space, and the baby placed on the back for every sleep in the first year.",
  },
  {
    id: "cot-slats",
    room: "nursery",
    priority: "critical",
    fromMonths: 0,
    untilMonths: 35,
    action: "Check cot slat gaps are no wider than 6 cm and the mattress leaves no side gap",
    why: "US crib standards 16 CFR 1219 and 1220 cap slat spacing at 2 3/8 in (6 cm), the width at which a body cannot slip through while the head is held. A gap beside the mattress traps limbs the same way.",
  },
  {
    id: "cot-base-height",
    room: "nursery",
    priority: "high",
    fromMonths: 5,
    untilMonths: 35,
    action: "Lower the cot base when the baby sits unaided, and to the lowest notch once standing",
    why: "The rail must sit at chest height or above when the child stands, otherwise the cot becomes something to climb out of.",
  },
  {
    id: "cot-mobiles",
    room: "nursery",
    priority: "high",
    fromMonths: 5,
    untilMonths: 23,
    action: "Take down cot gyms, mobiles and hanging toys",
    why: "CPSC guidance is to remove crib gyms and mobiles at about five months, or as soon as the child can push up on hands and knees, because the strings become a strangulation risk.",
  },
  {
    id: "changing-falls",
    room: "nursery",
    priority: "high",
    fromMonths: 0,
    untilMonths: 23,
    action: "Keep a hand on the baby at the changing table and change on the floor when alone",
    why: "Rolling appears without warning, often before a parent expects it. A changing table strap does not replace a hand.",
  },
  {
    id: "cot-position",
    room: "nursery",
    priority: "high",
    fromMonths: 6,
    action: "Move cots and beds away from windows, blind cords, heaters and shelves",
    why: "Anything within an arm's reach of the cot rail is inside the cot as far as the child is concerned.",
  },
  {
    id: "toy-box-lid",
    room: "nursery",
    priority: "standard",
    fromMonths: 12,
    action: "Remove heavy toy-box lids or fit slow-closing lid supports and air holes",
    why: "A falling lid can trap a head or fingers, and a closed box with no ventilation is a suffocation risk.",
  },

  // ---- Kitchen and dining ----------------------------------------------
  {
    id: "cleaner-storage",
    room: "kitchen",
    priority: "critical",
    fromMonths: 8,
    action: "Move cleaners, bleach and detergent capsules to a locked or high cupboard",
    why: "The under-sink cupboard is the most reachable in the house. Concentrated liquid detergent capsules cause the most severe paediatric chemical eye and airway injuries of any household cleaner.",
  },
  {
    id: "hob-safety",
    room: "kitchen",
    priority: "critical",
    fromMonths: 12,
    action: "Cook on the back burners and turn pan handles inwards",
    why: "A pulled pan is the single commonest cause of serious scalds in toddlers. A hob guard helps, but burner choice does more.",
  },
  {
    id: "hot-drinks",
    room: "kitchen",
    priority: "high",
    fromMonths: 6,
    action: "Keep hot drinks, kettles and their flexes out of reach of laps and highchairs",
    why: "A hot drink can still scald a child fifteen minutes after it was poured, and a coiled kettle flex is within reach from a highchair tray.",
  },
  {
    id: "tablecloth",
    room: "kitchen",
    priority: "high",
    fromMonths: 8,
    action: "Take off tablecloths and table runners a child can pull",
    why: "Everything on the table comes down with the cloth, hot food included.",
  },
  {
    id: "highchair-harness",
    room: "kitchen",
    priority: "high",
    fromMonths: 5,
    untilMonths: 47,
    action: "Use the five-point harness including the crotch strap on every meal",
    why: "The tray does not restrain a child. Without the crotch strap a child can submarine under the waist belt.",
  },
  {
    id: "knives-dishwasher",
    room: "kitchen",
    priority: "high",
    fromMonths: 12,
    action: "Load knives point-down, latch the dishwasher and keep it empty of detergent until it runs",
    why: "An open dishwasher door is a step, an upturned knife is at face height, and undissolved detergent sits in an open dispenser.",
  },
  {
    id: "magnets",
    room: "kitchen",
    priority: "high",
    fromMonths: 6,
    action: "Remove small high-powered magnets from fridge doors and toys",
    why: "Two or more rare-earth magnets swallowed separately attract through the bowel wall and cut off its blood supply — a surgical emergency that looks like a stomach bug at first.",
  },
  {
    id: "oven-appliances",
    room: "kitchen",
    priority: "standard",
    fromMonths: 12,
    action: "Fit an oven door lock and push blenders, irons and toasters back from the edge",
    why: "An oven door reaches burn temperature on the glass, and a trailing appliance flex is a handle.",
  },

  // ---- Bathroom ---------------------------------------------------------
  {
    id: "bath-supervision",
    room: "bathroom",
    priority: "critical",
    fromMonths: 0,
    action: "Never leave a child alone in the bath, not for a moment, not with a sibling",
    why: "A child can drown in 5 cm of water, quickly and without noise. Take the child with you if you must answer the door.",
  },
  {
    id: "water-temperature",
    room: "bathroom",
    priority: "critical",
    fromMonths: 0,
    action: "Set the water heater to 49 C (120 F) or fit thermostatic mixing valves",
    why: "At 49 C a full-thickness burn to adult skin takes about five minutes; at 60 C it takes about three seconds. A child's thinner skin burns faster still.",
  },
  {
    id: "medicine-storage",
    room: "bathroom",
    priority: "critical",
    fromMonths: 8,
    action: "Lock medicines, vitamins and supplements high up — including handbags and bedside tables",
    why: "Iron tablets and paracetamol are the two that most often turn a swallowed handful into a hospital admission. Child-resistant caps slow a child down; they do not stop one.",
  },
  {
    id: "toilet-lock",
    room: "bathroom",
    priority: "high",
    fromMonths: 9,
    action: "Fit a toilet lid lock and keep the bathroom door shut",
    why: "A toddler is top-heavy: once the head is over the rim, they cannot push themselves back out.",
  },
  {
    id: "buckets",
    room: "bathroom",
    priority: "high",
    fromMonths: 6,
    action: "Empty buckets, tubs and mop pails the moment you finish with them",
    why: "A standing bucket is deep, narrow and stable — the shape a child cannot climb back out of.",
  },
  {
    id: "bath-mat",
    room: "bathroom",
    priority: "standard",
    fromMonths: 6,
    action: "Put a non-slip mat in the tub and a tap cover on the spout",
    why: "The spout is at head height for a seated child, and it stays hot after the water is off.",
  },
  {
    id: "razors",
    room: "bathroom",
    priority: "standard",
    fromMonths: 12,
    action: "Store razors, nail scissors and hair straighteners out of reach and unplugged",
    why: "Hair straighteners stay above burn temperature for several minutes after switching off.",
  },

  // ---- Stairs -----------------------------------------------------------
  {
    id: "gate-top",
    room: "stairs",
    feature: "stairs",
    priority: "critical",
    fromMonths: 6,
    untilMonths: 35,
    action: "Fit a hardware-mounted gate at the top of the stairs — never a pressure-fit one",
    why: "A pressure-mounted gate can be pushed out of the frame and taken down the stairs with the child. Gates made to ASTM F1004 state which mounting they are certified for.",
  },
  {
    id: "gate-bottom",
    room: "stairs",
    feature: "stairs",
    priority: "high",
    fromMonths: 6,
    untilMonths: 35,
    action: "Fit a gate at the bottom of the stairs and mount it on the third stair at most",
    why: "Stopping the climb at the bottom is what prevents the fall from the middle.",
  },
  {
    id: "banister-gaps",
    room: "stairs",
    feature: "stairs",
    priority: "high",
    fromMonths: 9,
    action: "Close banister gaps wider than 10 cm with a plastic guard or netting",
    why: "Ten centimetres is the same limit that applies to windows and railings: wide enough for a body to follow a head through.",
  },
  {
    id: "stair-clutter",
    room: "stairs",
    feature: "stairs",
    priority: "standard",
    fromMonths: 6,
    action: "Keep stairs clear, lit, and fix any loose carpet or nosing",
    why: "Most stair falls involving small children happen while being carried by an adult who trips.",
  },

  // ---- Balcony and windows ---------------------------------------------
  {
    id: "balcony-climbables",
    room: "balcony",
    feature: "balcony",
    priority: "critical",
    fromMonths: 12,
    action: "Clear chairs, planters, crates and pots away from the railing",
    why: "Railing heights are designed against a child standing on the floor, not against a child standing on a flowerpot.",
  },
  {
    id: "balcony-gaps",
    room: "balcony",
    feature: "balcony",
    priority: "critical",
    fromMonths: 9,
    action: "Mesh any railing gap wider than 10 cm, including the gap under the bottom rail",
    why: "Horizontal railings are worse than vertical ones because they are a ladder as well as a gap.",
  },
  {
    id: "balcony-door",
    room: "balcony",
    feature: "balcony",
    priority: "high",
    fromMonths: 12,
    action: "Fit a high latch or restrictor on the balcony door",
    why: "Any lock a child can reach is a lock a child will eventually work out.",
  },

  // ---- Outdoor and water ------------------------------------------------
  {
    id: "pool-fence",
    room: "outdoor",
    feature: "pool",
    priority: "critical",
    fromMonths: 6,
    action: "Fence the pool on all four sides, at least 1.2 m high, self-closing and self-latching",
    why: "Four-sided isolation fencing that separates the pool from the house is associated with roughly an 83% lower drowning risk than three-sided property fencing, which leaves the house itself as one wall.",
  },
  {
    id: "water-store",
    room: "outdoor",
    feature: "waterStore",
    priority: "critical",
    fromMonths: 6,
    action: "Cover and latch water drums, sumps, wells and overhead-tank hatches",
    why: "Domestic water storage is the drowning hazard most often missed indoors, and an unlatched sump cover weighs less than a determined toddler.",
  },
  {
    id: "garden-chemicals",
    room: "outdoor",
    feature: "garden",
    priority: "high",
    fromMonths: 12,
    action: "Lock away fertiliser, pesticide, paint and fuel, and never decant into drinks bottles",
    why: "Decanting into a soft-drink bottle removes the child-resistant cap, the warning label and the recognisable shape all at once.",
  },
  {
    id: "garden-gate",
    room: "outdoor",
    feature: "garden",
    priority: "standard",
    fromMonths: 12,
    action: "Fit a self-latching gate and check for gaps under the boundary fence",
    why: "The route out to a road is usually a gap, not a gate.",
  },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** The developmental stage a child of this age is in. */
export function stageForAge(ageMonths) {
  if (!isNum(ageMonths) || ageMonths < 0) return null;
  let found = STAGES[0];
  for (const stage of STAGES) {
    if (ageMonths >= stage.fromMonths) found = stage;
  }
  return found;
}

/**
 * Look up the burn time for a water temperature.
 * Returns the strictest published row at or below the given temperature.
 */
export function scaldRiskAt(tempC) {
  if (!isNum(tempC)) return { error: "Enter the hot water temperature in degrees Celsius." };
  if (tempC < 0 || tempC > 100) {
    return { error: "Water temperature should be between 0 and 100 C." };
  }
  if (tempC <= SAFE_WATER_TEMP_C) {
    return {
      tempC,
      safe: true,
      seconds: null,
      note: `At or below ${SAFE_WATER_TEMP_C} C, the recommended maximum for a home with young children.`,
    };
  }
  let row = SCALD_TIMES[0];
  for (const entry of SCALD_TIMES) {
    if (tempC >= entry.tempC) row = entry;
  }
  return {
    tempC,
    safe: false,
    seconds: row.seconds,
    matchedTempC: row.tempC,
    note: `Adult skin takes a full-thickness burn in about ${row.seconds} second${row.seconds === 1 ? "" : "s"} at ${row.tempC} C. A child's skin burns faster.`,
  };
}

/**
 * Build the checklist.
 *
 * @param {object} input
 * @param {number} input.ageMonths      Child's age in months (0 to 72).
 * @param {object} [input.features]     { stairs, balcony, pool, waterStore, garden } booleans.
 * @param {string[]} [input.doneIds]    Ids of items already handled.
 * @param {number} [input.waterTempC]   Hot water setting, if known.
 */
export function buildSafetyChecklist({ ageMonths, features = {}, doneIds = [], waterTempC } = {}) {
  if (!isNum(ageMonths)) {
    return { error: "Enter the child's age in months." };
  }
  if (ageMonths < 0) {
    return { error: "Age cannot be negative. Use 0 for a newborn." };
  }
  if (ageMonths > MAX_AGE_MONTHS) {
    return {
      error: `This checklist covers children up to ${MAX_AGE_MONTHS} months (6 years). Beyond that, supervision and teaching matter more than barriers.`,
    };
  }
  if (!Array.isArray(doneIds)) {
    return { error: "Completed items must be given as a list of ids." };
  }

  const done = new Set(doneIds);
  const applies = (item) => !item.feature || features[item.feature] === true;
  const active = HAZARDS.filter(applies).filter(
    (item) => !isNum(item.untilMonths) || ageMonths <= item.untilMonths,
  );

  const dueNow = active.filter((item) => ageMonths >= item.fromMonths);
  const upcoming = active
    .filter(
      (item) =>
        ageMonths < item.fromMonths && item.fromMonths - ageMonths <= LOOKAHEAD_MONTHS,
    )
    .sort((a, b) => a.fromMonths - b.fromMonths);

  const priorityRank = { critical: 0, high: 1, standard: 2 };
  const decorate = (item) => ({
    ...item,
    done: done.has(item.id),
    weight: PRIORITY_WEIGHT[item.priority] ?? 1,
    dueInMonths: Math.max(0, item.fromMonths - ageMonths),
  });

  const byRoom = ROOMS.map((room) => {
    const items = dueNow
      .filter((item) => item.room === room.id)
      .map(decorate)
      .sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]);
    return { ...room, items };
  }).filter((room) => room.items.length > 0);

  const totalWeight = dueNow.reduce((sum, item) => sum + (PRIORITY_WEIGHT[item.priority] ?? 1), 0);
  const doneWeight = dueNow
    .filter((item) => done.has(item.id))
    .reduce((sum, item) => sum + (PRIORITY_WEIGHT[item.priority] ?? 1), 0);

  const readinessPct = totalWeight > 0 ? (doneWeight / totalWeight) * 100 : 100;

  const criticalItems = dueNow.filter((item) => item.priority === "critical");
  const criticalOutstanding = criticalItems.filter((item) => !done.has(item.id));

  const outstanding = dueNow
    .filter((item) => !done.has(item.id))
    .map(decorate)
    .sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]);

  let verdict;
  if (dueNow.length === 0) {
    verdict = "Nothing on the list applies yet at this age and with these home features.";
  } else if (criticalOutstanding.length > 0) {
    verdict = `${criticalOutstanding.length} critical item${criticalOutstanding.length === 1 ? " is" : "s are"} still open. Start with those — they cover falls, drowning, strangulation, poisoning and tip-over.`;
  } else if (readinessPct >= 100) {
    verdict = "Every item due at this age is handled. Recheck when the next stage starts.";
  } else {
    verdict = `Critical items are done. ${outstanding.length} lower-priority item${outstanding.length === 1 ? "" : "s"} remain, and they get easier to leave undone than they should be.`;
  }

  const scald = isNum(waterTempC) ? scaldRiskAt(waterTempC) : null;

  return {
    ageMonths,
    stage: stageForAge(ageMonths),
    byRoom,
    upcoming: upcoming.map(decorate),
    totalItems: dueNow.length,
    doneCount: dueNow.filter((item) => done.has(item.id)).length,
    outstandingCount: outstanding.length,
    criticalCount: criticalItems.length,
    criticalOutstanding: criticalOutstanding.length,
    totalWeight,
    doneWeight,
    readinessPct,
    nextActions: outstanding.slice(0, 3),
    scald,
    verdict,
  };
}
