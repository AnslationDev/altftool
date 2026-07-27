/**
 * Road-trip packing and car-prep checklist generation.
 *
 * Quantities are derived, not guessed:
 *  - Drinking water uses the WHO planning figure of 2.5 to 3 litres per person
 *    per day for drinking and food preparation; 3 litres is used here, with an
 *    uplift in hot conditions.
 *  - Documents follow what has to be produced on demand in India: driving
 *    licence, registration certificate, insurance and PUC. A Ministry of Road
 *    Transport and Highways advisory of 2018 confirms that copies held in
 *    DigiLocker or mParivahan are accepted in place of the originals.
 *  - FASTag has been required on four-wheelers at national highway fee plazas
 *    since 15 February 2021.
 *  - A first-aid box is required in every transport vehicle under Rule 138(3) of
 *    the Central Motor Vehicles Rules, 1989. It is not compulsory in a private
 *    car, but it belongs in one.
 *
 * Pure data in, plain object out.
 */

/** WHO emergency planning figure for drinking and food preparation. */
export const WATER_LITRES_PER_PERSON_PER_DAY = 3;

/** Hot-weather uplift on the drinking-water figure. */
export const HOT_WEATHER_WATER_FACTOR = 1.5;

/** One spare set of clothes beyond a change a day. */
export const SPARE_OUTFITS = 1;

export const SEASONS = [
  { id: "summer", label: "Summer", hot: true },
  { id: "monsoon", label: "Monsoon", hot: false },
  { id: "winter", label: "Winter", hot: false },
];

export const TERRAINS = [
  { id: "plains", label: "Plains and highways", hot: false },
  { id: "hills", label: "Hills and ghats", hot: false },
  { id: "desert", label: "Desert or arid", hot: true },
  { id: "coastal", label: "Coastal", hot: false },
];

const seasonById = new Map(SEASONS.map((item) => [item.id, item]));
const terrainById = new Map(TERRAINS.map((item) => [item.id, item]));

const item = (label, qty, note) => ({ label, qty: qty ?? null, note: note || "" });

/**
 * Build the checklist.
 *
 * @param {object} input
 * @param {number} input.days       nights plus travel days
 * @param {number} input.adults
 * @param {number} input.children   travellers who need a car seat or booster
 * @param {string} input.season     key from SEASONS
 * @param {string} input.terrain    key from TERRAINS
 * @param {boolean} input.pets
 * @param {boolean} input.nightDriving
 * @param {boolean} input.camping
 */
export function buildChecklist({
  days,
  adults,
  children = 0,
  season = "summer",
  terrain = "plains",
  pets = false,
  nightDriving = false,
  camping = false,
} = {}) {
  for (const value of [days, adults, children]) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      return { error: "Enter a valid number of days and travellers." };
    }
  }
  const seasonInfo = seasonById.get(season);
  const terrainInfo = terrainById.get(terrain);
  if (!seasonInfo) return { error: "Choose a season from the list." };
  if (!terrainInfo) return { error: "Choose a terrain from the list." };
  if (!(days >= 1)) return { error: "A trip has to be at least one day long." };
  if (days > 90) return { error: "Plan trips of up to 90 days with this checklist." };
  if (!(adults >= 1)) return { error: "There has to be at least one adult in the car." };
  if (adults > 8 || children < 0 || children > 8) {
    return { error: "Check the number of travellers — a car seats up to eight." };
  }

  const tripDays = Math.ceil(days);
  const adultCount = Math.trunc(adults);
  const childCount = Math.trunc(children);
  const people = adultCount + childCount;

  const hot = seasonInfo.hot || terrainInfo.hot;
  const waterLitres = Math.ceil(
    people * tripDays * WATER_LITRES_PER_PERSON_PER_DAY * (hot ? HOT_WEATHER_WATER_FACTOR : 1),
  );
  const outfits = (tripDays + SPARE_OUTFITS) * people;

  const groups = [];

  groups.push({
    id: "documents",
    title: "Documents and money",
    note: "These have to be produced on demand. Digital copies in DigiLocker or mParivahan are accepted.",
    items: [
      item("Driving licence of every driver", adultCount),
      item("Registration certificate (RC)", 1),
      item("Valid insurance policy", 1, "Third-party cover is compulsory under s.146 of the Motor Vehicles Act."),
      item("PUC certificate", 1, "Six months' validity for most vehicles."),
      item("FASTag fitted and topped up", 1, "Required at national highway fee plazas since February 2021."),
      item("Photo ID for every traveller", people, "Hotels ask for it at check-in."),
      item("Emergency cash", 1, "Some rural pumps and dhabas still take only cash."),
      item("Roadside assistance number saved", 1),
    ],
  });

  groups.push({
    id: "car",
    title: "Before you leave — car checks",
    note: "Do these the day before, not on the morning of departure.",
    items: [
      item("Tyre pressure including the spare", 5, "Check cold, to the pressure on the door-jamb sticker."),
      item("Tyre tread depth", 1, "Replace below 1.6 mm, the legal minimum tread depth."),
      item("Engine oil and coolant level", 1),
      item("Brake fluid and brake feel", 1),
      item("All lights, indicators and horn", 1),
      item("Wiper blades and washer fluid", 1),
      item("Jack, wheel spanner and wheel lock key", 1, "Confirm the lock key is actually in the car."),
      item("Battery terminals and age", 1, "A battery past four years is the usual cause of a no-start."),
      item("Full tank before you leave the city", 1),
    ],
  });

  groups.push({
    id: "emergency",
    title: "Emergency kit",
    note: "A first-aid box is compulsory in transport vehicles under CMVR Rule 138(3) and sensible in any car.",
    items: [
      item("First-aid box", 1, "Antiseptic, gauze, tape, painkillers, any prescription medicines."),
      item("Reflective warning triangle", 1),
      item("Torch with spare batteries", 1),
      item("Jumper cables", 1),
      item("Tow rope", 1),
      item("Tyre puncture repair kit or inflator", 1),
      item("Basic tool kit", 1),
      item("Fire extinguisher", 1, "Compulsory in buses and vehicles carrying dangerous goods; optional in a car."),
      item("Power bank", Math.max(1, Math.ceil(people / 2))),
      item("Printed emergency contacts", 1, "A phone with a dead battery is not a contact list."),
    ],
  });

  groups.push({
    id: "food",
    title: "Food and water",
    items: [
      item(
        "Drinking water (litres)",
        waterLitres,
        hot
          ? "Three litres per person per day with a hot-weather uplift — restock en route rather than carrying it all."
          : "Three litres per person per day, the WHO planning figure. Restock en route.",
      ),
      item("Reusable bottles", people),
      item("Dry snacks", tripDays * people),
      item("Rehydration salts", Math.max(2, people)),
      item("Wet wipes and hand sanitiser", 1),
      item("Rubbish bags", tripDays),
    ],
  });

  groups.push({
    id: "clothing",
    title: "Clothing and personal",
    items: [
      item("Sets of clothes", outfits, `${tripDays} days plus ${SPARE_OUTFITS} spare set per person.`),
      item("Comfortable driving footwear", adultCount),
      item("Toiletries bag", 1),
      item("Sunglasses", adultCount, "Glare is a real fatigue factor on long drives."),
      item("Prescription medicines with the prescription", 1),
    ],
  });

  groups.push({
    id: "tech",
    title: "Navigation and devices",
    items: [
      item("Phone mount", 1),
      item("Car charger with enough ports", Math.max(1, Math.ceil(people / 2))),
      item("Offline maps downloaded", 1, "Signal drops out on ghat and desert stretches."),
      item("Music or podcasts downloaded", 1),
      item("Dashcam and a spare memory card", 1),
    ],
  });

  if (seasonInfo.id === "summer") {
    groups.push({
      id: "summer",
      title: "Summer additions",
      items: [
        item("Windscreen sunshade", 1),
        item("Sunscreen", 1),
        item("Caps or hats", people),
        item("Coolant topped up and radiator checked", 1, "Overheating is the classic summer breakdown."),
        item("Cool box or insulated bag", 1),
      ],
    });
  }

  if (seasonInfo.id === "monsoon") {
    groups.push({
      id: "monsoon",
      title: "Monsoon additions",
      items: [
        item("Fresh wiper blades", 2, "Streaking blades at 80 km/h in rain are a safety problem."),
        item("Waterproof bags or dry sacks", Math.max(1, Math.ceil(people / 2))),
        item("Raincoats or umbrellas", people),
        item("Microfibre cloth for the inside of the windscreen", 2),
        item("Extra towels", people),
        item("Anti-fog treatment or working defogger", 1),
      ],
    });
  }

  if (seasonInfo.id === "winter") {
    groups.push({
      id: "winter",
      title: "Winter additions",
      items: [
        item("Blankets", people),
        item("Warm layers and gloves", people),
        item("Fog lamps checked", 1),
        item("Flask for hot drinks", 1),
        item("Ice scraper", 1, "Only if you are heading above about 2,000 m."),
      ],
    });
  }

  if (terrainInfo.id === "hills") {
    groups.push({
      id: "hills",
      title: "Hills and ghats",
      items: [
        item("Motion sickness tablets", Math.max(2, people)),
        item("Wheel chocks", 2, "For a parking brake you do not fully trust on a slope."),
        item("Brake fluid checked and brakes bedded in", 1, "Use engine braking on descents rather than riding the pedal."),
        item("Extra coolant", 1),
        item("Warm layer even in summer", people, "Temperature drops sharply with altitude."),
        item("Offline map plus a paper route note", 1),
      ],
    });
  }

  if (terrainInfo.id === "desert") {
    groups.push({
      id: "desert",
      title: "Desert and arid stretches",
      items: [
        item("Extra drinking water beyond the figure above", 1, "Distances between refills are long."),
        item("Radiator coolant and a spare hose clip", 1),
        item("Dust masks or scarves", people),
        item("Sunshade and window shades", 1),
        item("Fuel planned plaza to plaza", 1, "Carrying loose petrol in cans is restricted and many pumps refuse to fill them."),
      ],
    });
  }

  if (terrainInfo.id === "coastal") {
    groups.push({
      id: "coastal",
      title: "Coastal additions",
      items: [
        item("Mosquito repellent", 1),
        item("Quick-dry towels", people),
        item("Zip bags for wet or sandy things", Math.max(2, people)),
        item("Underbody wash after the trip", 1, "Salt air accelerates corrosion."),
      ],
    });
  }

  if (childCount > 0) {
    groups.push({
      id: "kids",
      title: `Travelling with ${childCount} child${childCount === 1 ? "" : "ren"}`,
      items: [
        item("Child seat or booster, correctly fitted", childCount),
        item("Motion sickness remedy suitable for children", 1, "Ask a paediatrician before giving anything new."),
        item("Changes of clothes beyond the count above", childCount),
        item("Snacks and a spill-proof bottle", childCount),
        item("Entertainment loaded offline", 1),
        item("Wet wipes and a nappy bag", 1),
        item("Window sunshades", 2),
      ],
    });
  }

  if (pets) {
    groups.push({
      id: "pets",
      title: "Travelling with a pet",
      items: [
        item("Carrier or harness restraint", 1, "An unrestrained animal is a projectile in a crash."),
        item("Water bowl and travel water", 1),
        item("Food for the whole trip", tripDays),
        item("Vaccination card", 1, "Many hotels and some state borders ask for it."),
        item("Waste bags", tripDays * 2),
        item("Pet-friendly stays confirmed in writing", 1),
      ],
    });
  }

  if (nightDriving) {
    groups.push({
      id: "night",
      title: "Night driving",
      items: [
        item("Headlights aimed and cleaned", 1),
        item("Windscreen cleaned inside and out", 1, "Interior film is what causes oncoming-light glare."),
        item("Reflective jacket", Math.max(1, adultCount), "Wear it before you step out on a highway shoulder."),
        item("Planned halt before fatigue sets in", 1, "The hours between 2 am and 6 am carry the highest crash risk."),
      ],
    });
  }

  if (camping) {
    groups.push({
      id: "camping",
      title: "Camping or self-catering",
      items: [
        item("Tent and ground sheet", 1),
        item("Sleeping bags or bedrolls", people),
        item("Camp stove and fuel", 1),
        item("Head torches", people),
        item("Cook set and utensils", 1),
        item("Permission or booking for the site", 1, "Wild camping is not allowed in most protected areas."),
      ],
    });
  }

  const totalItems = groups.reduce((sum, group) => sum + group.items.length, 0);

  return {
    tripDays,
    adults: adultCount,
    children: childCount,
    people,
    hot,
    seasonLabel: seasonInfo.label,
    terrainLabel: terrainInfo.label,
    waterLitres,
    outfits,
    groups,
    totalItems,
    totalGroups: groups.length,
  };
}

/** Flatten the checklist to plain text lines, for copying or printing. */
export function checklistToText(result) {
  if (!result || result.error) return "";
  const lines = [
    `Road trip checklist — ${result.tripDays} days, ${result.people} travellers, ${result.seasonLabel.toLowerCase()}, ${result.terrainLabel.toLowerCase()}`,
    `Drinking water: ${result.waterLitres} litres · clothing: ${result.outfits} sets · ${result.totalItems} items in ${result.totalGroups} groups`,
    "",
  ];
  for (const group of result.groups) {
    lines.push(`${group.title}`);
    for (const entry of group.items) {
      lines.push(`  [ ] ${entry.label}${entry.qty !== null ? ` × ${entry.qty}` : ""}`);
    }
    lines.push("");
  }
  return lines.join("\n").trim();
}
