/**
 * Guest room checklist generator.
 *
 * Everything below is a quantity rule, not a mood board. The quantities come
 * from ordinary hospitality housekeeping practice:
 *
 *   towels        = guests x ceil(nights / 3)      (linen changed every third day)
 *   bed linen     = beds x ceil(nights / 4)        (sheets changed every fourth day)
 *   toilet rolls  = ceil(guests x nights / 4)      (one roll lasts one person ~4 days)
 *   drinking water= guests x nights x 2.5 litres   (typical daily drinking need)
 *
 * Beds follow from who is coming: adults pair up in double beds, children get a
 * bed each. Everything else is switched on by a condition — season, a shared
 * bathroom, an infant, an elderly guest, a work trip — so the list you get is
 * the list for these guests rather than a generic one.
 */

/** Housekeeping change intervals, in nights. */
export const TOWEL_CHANGE_NIGHTS = 3;
export const LINEN_CHANGE_NIGHTS = 4;
/** One toilet roll lasts roughly one person four days. */
export const NIGHTS_PER_TOILET_ROLL = 4;
/** Drinking water to keep in the room, litres per person per day. */
export const WATER_LITRES_PER_PERSON_DAY = 2.5;
/** Hangers per guest — more when they will unpack for a longer stay. */
export const HANGERS_SHORT_STAY = 3;
export const HANGERS_LONG_STAY = 5;
export const LONG_STAY_NIGHTS = 3;

export const SEASONS = [
  { id: "summer", label: "Summer" },
  { id: "monsoon", label: "Monsoon" },
  { id: "winter", label: "Winter" },
  { id: "mild", label: "Mild / neither" },
];

const MAX_GUESTS = 20;
const MAX_NIGHTS = 90;

/**
 * @returns {{error:string}|{sections:{title:string, items:{label:string, qty:number|null, unit:string, note:string}[]}[], summary:object}}
 */
export function buildGuestChecklist({
  adults = 2,
  children = 0,
  nights = 2,
  season = "mild",
  privateBathroom = true,
  hasInfant = false,
  hasElderlyGuest = false,
  workingGuest = false,
  internationalGuest = false,
  bringingPet = false,
}) {
  const numbers = [adults, children, nights];
  if (numbers.some((n) => typeof n !== "number" || !Number.isFinite(n))) {
    return { error: "Enter a valid number of adults, children and nights." };
  }
  if (!Number.isInteger(adults) || !Number.isInteger(children) || !Number.isInteger(nights)) {
    return { error: "Adults, children and nights must be whole numbers." };
  }
  if (adults < 0 || children < 0) return { error: "Guest counts cannot be negative." };
  const guests = adults + children;
  if (guests < 1) return { error: "Add at least one guest." };
  if (guests > MAX_GUESTS) return { error: `This checklist handles up to ${MAX_GUESTS} guests.` };
  if (nights < 1) return { error: "A stay must be at least one night." };
  if (nights > MAX_NIGHTS) return { error: `This checklist handles stays up to ${MAX_NIGHTS} nights.` };
  if (!SEASONS.some((entry) => entry.id === season)) {
    return { error: "Choose a season so the bedding and comfort items are right." };
  }

  const doubleBeds = Math.floor(adults / 2);
  const singleBeds = (adults % 2) + children;
  const beds = doubleBeds + singleBeds;
  const towelChanges = Math.ceil(nights / TOWEL_CHANGE_NIGHTS);
  const linenChanges = Math.ceil(nights / LINEN_CHANGE_NIGHTS);
  const longStay = nights >= LONG_STAY_NIGHTS;

  const bathTowels = guests * towelChanges;
  const handTowels = guests * towelChanges;
  const linenSets = beds * linenChanges;
  const pillows = adults * 2 + children;
  const toiletRolls = Math.ceil((guests * nights) / NIGHTS_PER_TOILET_ROLL);
  const waterLitres = guests * nights * WATER_LITRES_PER_PERSON_DAY;
  const hangers = guests * (longStay ? HANGERS_LONG_STAY : HANGERS_SHORT_STAY);

  const item = (label, qty, unit = "", note = "") => ({ label, qty, unit, note });

  const bedding = [
    item("Double bed made up", doubleBeds, doubleBeds === 1 ? "bed" : "beds", "Two adults per double"),
    item("Single bed or mattress", singleBeds, singleBeds === 1 ? "bed" : "beds", "One per child or unpaired adult"),
    item("Bed linen sets", linenSets, "sets", `Changed every ${LINEN_CHANGE_NIGHTS} nights`),
    item("Pillows", pillows, "", "Two per adult, one per child"),
    item("Spare pillow, firm and soft", 1, "", "So a guest can swap without asking"),
    item("Mattress protector", beds, "", "Especially with children in the room"),
  ];
  if (season === "winter") {
    bedding.push(item("Warm quilt or duvet", beds, "", "Plus a folded blanket at the foot of the bed"));
  } else if (season === "summer") {
    bedding.push(item("Light cotton dohar or sheet blanket", beds, "", "Air conditioning makes even summer nights cool"));
  } else {
    bedding.push(item("Light blanket", beds, "", ""));
  }

  const bathroom = [
    item("Bath towels", bathTowels, "", `Changed every ${TOWEL_CHANGE_NIGHTS} nights`),
    item("Hand towels", handTowels, "", ""),
    item("Fresh soap", guests, "bars", ""),
    item("Shampoo and conditioner", Math.max(1, Math.ceil((guests * nights) / 2)), "sachets or a bottle", ""),
    item("Toilet rolls", toiletRolls, "rolls", "One roll lasts roughly one person four days"),
    item("Spare toothbrush and toothpaste", 1, "set", "For the guest who forgot theirs"),
    item("Bath mat", 1, "", "Dry, non-slip"),
    item("Small bin with a liner", 1, "", ""),
  ];
  if (!privateBathroom) {
    bathroom.push(item("Robe or wrap", guests, "", "A shared bathroom means a walk down the corridor"));
    bathroom.push(item("Toiletry basket or pouch", guests, "", "So guests can carry their things to the bathroom"));
  }
  if (hasElderlyGuest) {
    bathroom.push(item("Non-slip mat inside the shower", 1, "", "The single most useful safety item in the room"));
    bathroom.push(item("Stool or chair in the bathroom", 1, "", ""));
  }

  const comfort = [
    item("Drinking water", Math.ceil(waterLitres), "litres", `${WATER_LITRES_PER_PERSON_DAY} litres per person per day`),
    item("Water glasses or bottles at the bedside", guests, "", ""),
    item("Hangers in the wardrobe", hangers, "", longStay ? "Longer stay — guests will unpack" : "Short stay"),
    item("Empty shelf or drawer space", 1, "", "Somewhere to put a suitcase down and open it"),
    item("Luggage rack or bench", beds, "", ""),
    item("Charging point free at the bedside", guests + 1, "", "One per guest plus a spare"),
    item("Bedside lamp with a reachable switch", beds, "", ""),
    item("Reading light or lamp", 1, "", ""),
    item("Mirror", 1, "", "Full length if there is wall space"),
  ];
  if (season === "summer") {
    comfort.push(item("Fan or air conditioning checked and remote working", 1, "", "Test it the day before, not the day of"));
    comfort.push(item("Extra drinking water in the room", guests, "litres", "Hot weather raises intake well above the base figure"));
  }
  if (season === "monsoon") {
    comfort.push(item("Umbrella by the door", Math.max(1, Math.ceil(guests / 2)), "", ""));
    comfort.push(item("Space to dry wet clothes", 1, "", "A rack beats a chair back"));
    comfort.push(item("Mosquito repellent or plug-in", 1, "", ""));
  }
  if (season === "winter") {
    comfort.push(item("Hot water checked in the bathroom", 1, "", "Run the geyser once before they arrive"));
    comfort.push(item("Room heater with clear space around it", 1, "", "Never leave one running overnight unattended"));
  }

  const practical = [
    item("Wi-Fi name and password written down", 1, "card", "Leave it on the bedside table"),
    item("House keys or entry instructions", Math.max(1, Math.ceil(guests / 2)), "sets", ""),
    item("Spare blanket and pillow findable without asking", 1, "", "Point them out on arrival"),
    item("Night light or corridor light on the way to the bathroom", 1, "", ""),
    item("Room aired and dusted, windows opened", 1, "", "Do this the morning of arrival"),
    item("Curtains that actually close", 1, "", ""),
    item("Emergency contact and address written down", 1, "card", "Useful if a guest needs a cab or a doctor"),
  ];
  if (workingGuest) {
    practical.push(item("Desk or table with a chair", 1, "", "A dining chair at a console table works"));
    practical.push(item("Extension board at the desk", 1, "", ""));
    practical.push(item("Quiet hours agreed with the household", 1, "", "Calls and meetings need a predictable window"));
  }
  if (internationalGuest) {
    practical.push(item("Universal power adapter", guests, "", "Indian sockets take Type C, D and M plugs"));
    practical.push(item("Local SIM or eSIM information", 1, "", ""));
    practical.push(item("Written address in the local language", 1, "card", "For showing a driver"));
  }
  if (hasInfant) {
    practical.push(item("Cot or floor mattress away from the wall socket", 1, "", ""));
    practical.push(item("Changing surface with a washable cover", 1, "", ""));
    practical.push(item("Dim night light left on", 1, "", ""));
    practical.push(item("Covers on reachable power sockets", 2, "", ""));
  }
  if (bringingPet) {
    practical.push(item("Food and water bowls", 2, "", ""));
    practical.push(item("Washable mat or old sheet for the floor", 1, "", ""));
    practical.push(item("Rugs and cables moved out of reach", 1, "", ""));
  }

  const sections = [
    { title: "Bed and bedding", items: bedding },
    { title: "Bathroom", items: bathroom },
    { title: "Comfort in the room", items: comfort },
    { title: "Practical and safety", items: practical },
  ].map((section) => ({
    title: section.title,
    items: section.items.filter((entry) => entry.qty === null || entry.qty > 0),
  }));

  const totalLines = sections.reduce((sum, section) => sum + section.items.length, 0);

  return {
    sections,
    summary: {
      guests,
      adults,
      children,
      nights,
      beds,
      doubleBeds,
      singleBeds,
      bathTowels,
      handTowels,
      linenSets,
      pillows,
      toiletRolls,
      waterLitres,
      hangers,
      towelChanges,
      linenChanges,
      totalLines,
      longStay,
    },
  };
}
