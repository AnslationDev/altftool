/**
 * Travel Itinerary Prompt Builder — pure logic.
 *
 * Two pieces of arithmetic that decide whether a trip plan is honest:
 *  1. computeCapacity() — how many main activities the trip can actually hold.
 *     Every change of base costs roughly half a day to pack, travel and check
 *     in, so effective sightseeing days are fewer than calendar days. Multiply
 *     what is left by the number of main activities your chosen pace allows.
 *  2. computeBudget() — the per-person, per-day figure your total implies, and
 *     a split across the conventional trip cost categories using the
 *     largest-remainder method so the parts always add back to the total.
 *
 * Estimates for planning. No React, no DOM, no Date.now().
 */

/**
 * Half a day per change of base. Packing, checkout, the journey itself,
 * check-in and finding your feet in a new place reliably eats a morning or an
 * afternoon even on a short hop.
 */
export const MOVE_DAY_COST = 0.5;

/** Main activities per day at each pace. A "main activity" is anything that
 *  occupies two hours or more once travel to it is counted. */
export const PACES = [
  { key: "slow", label: "Slow — one main thing a day", perDay: 1, note: "Leaves whole afternoons free." },
  { key: "moderate", label: "Moderate — two main things a day", perDay: 2, note: "The usual comfortable pace." },
  { key: "full", label: "Full — three main things a day", perDay: 3, note: "Little slack; one delay knocks the day over." },
  { key: "packed", label: "Packed — four, with early starts", perDay: 4, note: "Only sustainable for a few days." },
];

/**
 * Conventional split of an on-the-ground trip budget. Weights sum to 1.
 * International flights are deliberately excluded — they are usually booked
 * separately and would swamp the daily figures.
 */
export const BUDGET_SPLIT = [
  { key: "stay", label: "Accommodation", weight: 0.35 },
  { key: "food", label: "Food and drink", weight: 0.25 },
  { key: "activities", label: "Activities and entry tickets", weight: 0.15 },
  { key: "local", label: "Local transport", weight: 0.1 },
  { key: "intercity", label: "Intercity travel within the trip", weight: 0.1 },
  { key: "buffer", label: "Buffer for the unexpected", weight: 0.05 },
];

export const SEASONS = [
  "Peak season",
  "Shoulder season",
  "Off season",
  "Monsoon / rainy",
  "Winter / snow",
  "Summer / hot",
];

export const TRIP_STYLES = [
  "Sightseeing and landmarks",
  "Food and markets",
  "Nature and hiking",
  "Beach and slow days",
  "History and museums",
  "Family with young children",
  "Photography",
  "Road trip",
  "Pilgrimage",
  "Nightlife and live music",
];

export const STAY_TYPES = [
  "Budget hostel or guesthouse",
  "Mid-range hotel",
  "Boutique or heritage stay",
  "Serviced apartment",
  "Homestay",
  "Camping",
];

export const CURRENCIES = [
  { key: "INR", label: "₹ Indian rupee", locale: "en-IN" },
  { key: "USD", label: "$ US dollar", locale: "en-US" },
  { key: "GBP", label: "£ Pound sterling", locale: "en-GB" },
  { key: "EUR", label: "€ Euro", locale: "en-IE" },
  { key: "JPY", label: "¥ Japanese yen", locale: "ja-JP" },
  { key: "AED", label: "AED Dirham", locale: "en-AE" },
];

export const DAYS_MIN = 1;
export const DAYS_MAX = 60;
export const CITIES_MAX = 12;
export const TRAVELLERS_MAX = 20;

/** Split a textarea into a clean list of lines. */
export function parseLines(raw, max = 30) {
  if (typeof raw !== "string") return [];
  const out = [];
  for (const line of raw.split(/[\n,]+/)) {
    const item = line
      .replace(/^\s+/, "")
      .replace(/^\d+[.)]\s+/, "")
      .replace(/^[-*•–]\s*/, "")
      .trim();
    if (!item) continue;
    out.push(item);
    if (out.length >= max) break;
  }
  return out;
}

/**
 * How many main activities the trip can hold.
 * Returns { error } for an impossible plan; never NaN or negative slots.
 */
export function computeCapacity({ days, cities = 1, pace = "moderate" } = {}) {
  const totalDays = Math.round(Number(days));
  const stops = Math.round(Number(cities));

  if (!Number.isFinite(totalDays) || !Number.isFinite(stops)) {
    return { error: "Trip length and number of places must both be numbers." };
  }
  if (totalDays < DAYS_MIN || totalDays > DAYS_MAX) {
    return { error: `Trip length must be between ${DAYS_MIN} and ${DAYS_MAX} days.` };
  }
  if (stops < 1 || stops > CITIES_MAX) {
    return { error: `Number of places to stay must be between 1 and ${CITIES_MAX}.` };
  }

  const paceEntry = PACES.find((entry) => entry.key === pace) || PACES[1];
  const moveDays = (stops - 1) * MOVE_DAY_COST;
  const effectiveDays = totalDays - moveDays;

  if (effectiveDays <= 0) {
    return {
      error: `${stops} bases in ${totalDays} day${totalDays === 1 ? "" : "s"} leaves no time to see anything — each move costs about half a day. Cut the number of places or add days.`,
    };
  }

  const slots = Math.floor(effectiveDays * paceEntry.perDay);
  const nightsPerBase = stops > 0 ? totalDays / stops : 0;

  return {
    days: totalDays,
    cities: stops,
    pace: paceEntry,
    moveDays,
    effectiveDays,
    slots,
    nightsPerBase,
    rushed: nightsPerBase < 2 && stops > 1,
  };
}

/**
 * Per-person-per-day budget and a split across the standard categories.
 * Returns { error } for impossible input; never divides by zero.
 */
export function computeBudget({ total, days, travellers = 1 } = {}) {
  const amount = Number(total);
  const totalDays = Math.round(Number(days));
  const heads = Math.round(Number(travellers));

  if (![amount, totalDays, heads].every(Number.isFinite)) {
    return { error: "Budget, trip length and number of travellers must all be numbers." };
  }
  if (amount < 0) return { error: "Budget cannot be negative." };
  if (totalDays < DAYS_MIN || totalDays > DAYS_MAX) {
    return { error: `Trip length must be between ${DAYS_MIN} and ${DAYS_MAX} days.` };
  }
  if (heads < 1 || heads > TRAVELLERS_MAX) {
    return { error: `Number of travellers must be between 1 and ${TRAVELLERS_MAX}.` };
  }

  const personDays = heads * totalDays;
  const perPersonPerDay = personDays > 0 ? amount / personDays : 0;
  const perDay = totalDays > 0 ? amount / totalDays : 0;

  // Largest-remainder split in whole currency units, so the parts sum to the
  // rounded total exactly.
  const rounded = Math.round(amount);
  const exact = BUDGET_SPLIT.map((row) => rounded * row.weight);
  const floors = exact.map((value) => Math.floor(value));
  let remainder = rounded - floors.reduce((sum, value) => sum + value, 0);
  const order = exact
    .map((value, index) => ({ index, frac: value - floors[index] }))
    .sort((a, b) => b.frac - a.frac || a.index - b.index);
  for (let i = 0; remainder > 0 && i < order.length; i += 1) {
    floors[order[i].index] += 1;
    remainder -= 1;
  }

  const allocation = BUDGET_SPLIT.map((row, index) => ({
    key: row.key,
    label: row.label,
    weight: row.weight,
    amount: floors[index],
    perDay: totalDays > 0 ? floors[index] / totalDays : 0,
  }));

  return {
    total: amount,
    rounded,
    days: totalDays,
    travellers: heads,
    personDays,
    perPersonPerDay,
    perDay,
    allocation,
    allocationTotal: allocation.reduce((sum, row) => sum + row.amount, 0),
    unbudgeted: amount === 0,
  };
}

/** Assemble the prompt. Returns { error } for unusable input. */
export function buildItineraryPrompt(input = {}) {
  const {
    destination = "",
    days = 7,
    cities = 2,
    travellers = 2,
    pace = "moderate",
    season = "Shoulder season",
    style = "Sightseeing and landmarks",
    stayType = "Mid-range hotel",
    totalBudget = 0,
    currency = "INR",
    mustSeeRaw = "",
    avoidRaw = "",
    mobilityRaw = "",
    arrivalNote = "",
    includeRestDay = true,
  } = input;

  const place = String(destination).trim();
  if (!place) return { error: "Enter where you are going." };

  const capacity = computeCapacity({ days, cities, pace });
  if (capacity.error) return { error: capacity.error };

  const budget = computeBudget({ total: totalBudget, days, travellers });
  if (budget.error) return { error: budget.error };

  const mustSee = parseLines(mustSeeRaw);
  const avoid = parseLines(avoidRaw);
  const mobility = parseLines(mobilityRaw);
  const currencyEntry = CURRENCIES.find((entry) => entry.key === currency) || CURRENCIES[0];

  const overbooked = Math.max(0, mustSee.length - capacity.slots);
  const spare = Math.max(0, capacity.slots - mustSee.length);

  const numbered = (items) => items.map((item, i) => `${i + 1}. ${item}`).join("\n");

  const lines = [];
  lines.push(
    `Plan a ${capacity.days}-day trip to ${place} for ${budget.travellers} ${budget.travellers === 1 ? "traveller" : "travellers"}, based in ${capacity.cities} ${capacity.cities === 1 ? "place" : "places"}.`,
  );
  lines.push("");
  lines.push("REALITY CHECK — DO NOT IGNORE");
  lines.push(
    `- ${capacity.cities} base${capacity.cities === 1 ? "" : "s"} means about ${capacity.moveDays} day${capacity.moveDays === 1 ? "" : "s"} lost to packing, travelling and checking in. That leaves roughly ${capacity.effectiveDays} usable days.`,
  );
  lines.push(
    `- At a ${capacity.pace.label.toLowerCase()} pace that is about ${capacity.slots} main activities for the whole trip. Do not schedule more than that.`,
  );
  if (capacity.rushed) {
    lines.push(
      `- Averaging under two nights per base is a packing-and-moving holiday. Say so, and offer a version with fewer stops.`,
    );
  }
  if (overbooked > 0) {
    lines.push(
      `- My must-see list has ${mustSee.length} items but only ${capacity.slots} fit. Cut ${overbooked}, tell me which and why, and put them in a "next time" list.`,
    );
  } else if (spare > 0) {
    lines.push(
      `- My must-see list has ${mustSee.length} items and ${spare} slot${spare === 1 ? "" : "s"} are spare. Suggest options for those, do not force them full.`,
    );
  }
  lines.push("");
  lines.push("TRIP FACTS");
  lines.push(`- Season: ${season}. Plan around what is actually open and what the weather allows.`);
  lines.push(`- Style: ${style}`);
  lines.push(`- Accommodation: ${stayType}`);
  if (String(arrivalNote).trim()) lines.push(`- Arrival and departure: ${String(arrivalNote).trim()}`);
  if (mobility.length) {
    lines.push(
      `- Access needs: ${mobility.join(", ")}. Check step-free access and walking distances for every suggestion, and say when you cannot verify it.`,
    );
  }
  if (avoid.length) lines.push(`- Do not include: ${avoid.join(", ")}`);
  lines.push("");
  lines.push(
    mustSee.length
      ? `MUST-SEE ANCHORS (${mustSee.length})\n${numbered(mustSee)}`
      : "MUST-SEE ANCHORS\nNone given. Propose the anchors yourself and say why each earns a slot.",
  );
  lines.push("");
  if (budget.unbudgeted) {
    lines.push("BUDGET\nNo budget set. Give a mid-range plan and put an indicative cost against each day.");
  } else {
    lines.push("BUDGET (on the ground; international flights excluded)");
    lines.push(
      `- Total: ${currencyEntry.key} ${budget.rounded} — about ${currencyEntry.key} ${Math.round(budget.perPersonPerDay)} per person per day.`,
    );
    for (const row of budget.allocation) {
      lines.push(`- ${row.label}: ${currencyEntry.key} ${row.amount}`);
    }
    lines.push(
      "- Treat these as ceilings. If a suggestion cannot be done inside them, say so rather than pretending.",
    );
  }
  lines.push("");
  lines.push("RULES");
  lines.push(
    "1. Give each day as: morning, afternoon, evening, plus where we sleep that night and roughly how long the day's walking or travel takes.",
  );
  lines.push(
    "2. Group activities by neighbourhood so no day zig-zags across the city. Say the travel time between consecutive stops.",
  );
  lines.push(
    "3. Flag anything that needs booking ahead, and anything with a fixed closing day, so I can check it myself.",
  );
  if (includeRestDay) {
    lines.push("4. Build in at least one deliberately unstructured half day and say where it falls.");
  }
  lines.push(
    "5. Opening hours, prices, visa rules and transport timetables change constantly. Do not state them as fact — mark every one [VERIFY] with the official source I should check.",
  );
  lines.push(
    "6. Invent no restaurants, hotels or attractions. If you are unsure a place still exists, say so instead of naming it.",
  );
  lines.push(
    "7. Give a plain-language safety and etiquette note for the destination, without stereotyping the people who live there.",
  );
  lines.push("");
  lines.push("OUTPUT");
  lines.push(
    "A day-by-day plan, then a packing note tied to the season, then a list of everything marked [VERIFY] with where to check it, then the \"next time\" list of anything cut.",
  );

  const prompt = lines.join("\n");

  return {
    prompt,
    capacity,
    budget,
    mustSee,
    avoid,
    mobility,
    overbooked,
    spare,
    currency: currencyEntry,
    charCount: prompt.length,
  };
}
