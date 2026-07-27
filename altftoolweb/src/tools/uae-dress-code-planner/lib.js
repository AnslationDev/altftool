/**
 * United Arab Emirates dress code and packing model.
 *
 * The UAE poses the opposite problem to most hot destinations: the heat pushes
 * you towards less clothing and the culture and the venue rules push you back
 * towards more. The resolution locals use — loose, light, full-coverage fabric
 * — is both the modest answer and the genuinely cooler one, and that is what
 * this model builds towards.
 *
 * Three things drive the plan:
 *
 *   1. The month and the emirate, through rounded monthly climate normals.
 *      A daily maximum above 40 °C changes what is possible outdoors, not just
 *      what is comfortable.
 *   2. The venues you tick. Mosques, malls, souks, beaches, business and
 *      nightlife each have their own published or enforced expectations, and
 *      Sharjah's are stricter than Dubai's by law.
 *   3. Whether you are travelling during Ramadan, which shifts the whole
 *      baseline a notch more conservative.
 *
 * The packing count is arithmetic, not a guess:
 *
 *   daily-change items = min(tripDays, laundryEveryDays + DRYING_BUFFER_DAYS)
 *   bottoms            = max(MIN_BOTTOMS, ceil(dailyChange / BOTTOM_WEAR_DAYS))
 *
 * Climate figures are rounded long-run monthly averages, not a forecast.
 *
 * Pure functions only: no clock, no network, no DOM.
 */

export const DESTINATION = {
  name: "the UAE",
  headline:
    "In the Emirates, covering up is the cool option as well as the polite one: loose long sleeves and light trousers beat shorts and a vest in 40 °C sun, and they get you into the mall, the mosque and the souk without a second look.",
};

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/**
 * Rounded monthly climate normals per emirate: mean daily temperature, typical
 * daily maximum, and rainfall in millimetres. Long-run averages, not forecasts.
 * The UAE's rain falls almost entirely between November and March.
 */
export const REGIONS = [
  {
    id: "dubai",
    label: "Dubai",
    meanTempC: [19, 20, 23, 27, 31, 33, 35, 36, 33, 29, 25, 21],
    maxTempC: [24, 26, 29, 33, 38, 40, 41, 42, 39, 35, 30, 26],
    rainfallMm: [18, 25, 20, 8, 1, 0, 0, 1, 0, 1, 3, 15],
    humidCoast: true,
    note: "Coastal, so humidity is the real burden from August into September rather than the raw temperature.",
  },
  {
    id: "abu-dhabi",
    label: "Abu Dhabi",
    meanTempC: [18, 19, 23, 27, 31, 33, 35, 35, 32, 29, 24, 20],
    maxTempC: [24, 25, 29, 33, 38, 40, 42, 42, 39, 35, 30, 26],
    rainfallMm: [12, 20, 15, 6, 1, 0, 0, 1, 0, 1, 3, 10],
    humidCoast: true,
    note: "Home of the Sheikh Zayed Grand Mosque, which has the strictest visitor dress rules in the country.",
  },
  {
    id: "sharjah",
    label: "Sharjah and Ajman",
    meanTempC: [18, 19, 22, 26, 31, 33, 35, 36, 33, 29, 24, 20],
    maxTempC: [25, 26, 30, 34, 39, 41, 42, 42, 40, 36, 31, 27],
    rainfallMm: [20, 26, 22, 9, 1, 0, 0, 1, 0, 2, 4, 16],
    humidCoast: true,
    note: "Sharjah enforces a published decency code in public and is dry: no alcohol is sold or served in the emirate.",
  },
  {
    id: "northern",
    label: "Ras Al Khaimah and Fujairah",
    meanTempC: [18, 19, 22, 26, 30, 33, 35, 35, 32, 29, 24, 20],
    maxTempC: [24, 25, 29, 33, 38, 40, 41, 41, 39, 35, 30, 26],
    rainfallMm: [25, 32, 28, 12, 2, 0, 1, 2, 1, 2, 5, 20],
    humidCoast: true,
    note: "Mountains and a wetter winter than the rest of the country, and noticeably cooler at altitude in Jebel Jais.",
  },
  {
    id: "al-ain",
    label: "Al Ain and the desert interior",
    meanTempC: [17, 19, 23, 28, 32, 35, 37, 36, 33, 29, 24, 19],
    maxTempC: [24, 26, 30, 35, 40, 42, 44, 43, 40, 36, 30, 26],
    rainfallMm: [12, 18, 16, 8, 2, 0, 1, 2, 1, 1, 3, 10],
    humidCoast: false,
    note: "Dry heat rather than humid, with a genuine drop after dark — desert nights in winter are cold.",
  },
];

/** Layering bands by mean daily temperature, in degrees Celsius. */
export const LAYER_BANDS = [
  {
    id: "mild",
    maxTempC: 22,
    label: "Mild winter",
    advice:
      "Long sleeves and light trousers by day, with a jacket or jumper for the evening. Desert nights and air-conditioned interiors both run cold.",
  },
  {
    id: "warm",
    maxTempC: 27,
    label: "Warm",
    advice:
      "The best months to be outdoors. Light long sleeves, a sun hat and one layer for over-cooled malls and restaurants.",
  },
  {
    id: "hot",
    maxTempC: 32,
    label: "Hot",
    advice:
      "Loose cotton or linen with full coverage, not less fabric. Outdoor plans work early and after sunset, with the middle of the day spent inside.",
  },
  {
    id: "very-hot",
    maxTempC: 35,
    label: "Very hot",
    advice:
      "Loose, light, pale, full-length clothing, a wide hat and sunglasses. Treat the hours from about 11:00 to 16:00 as indoor time and drink far more than you think you need.",
  },
  {
    id: "extreme",
    maxTempC: 99,
    label: "Extreme",
    advice:
      "Outdoors is an early morning and after-dark activity only. Everything else happens between air-conditioned buildings, which is why an indoor layer is not optional.",
  },
];

/**
 * Venue rules. `headCover` is the one that separates the Grand Mosque from
 * everywhere else in the country.
 */
export const VENUES = [
  {
    id: "grand-mosque",
    label: "Sheikh Zayed Grand Mosque, Abu Dhabi",
    shoulders: true,
    knees: true,
    ankles: true,
    wrists: true,
    headCover: true,
    shoesOff: true,
    strictness: "Strictly enforced at the entrance",
    rule: "Women must cover hair, wrists and ankles in loose, non-transparent clothing; men need long trousers and sleeves, with no shorts. Bring your own abaya or a long loose outfit and a scarf — visitors are no longer routinely issued one. Shoes come off before the prayer hall.",
  },
  {
    id: "mosques",
    label: "Other mosques open to visitors",
    shoulders: true,
    knees: true,
    ankles: true,
    wrists: false,
    headCover: true,
    shoesOff: true,
    strictness: "Enforced",
    rule: "Jumeirah Mosque in Dubai and similar visitor-friendly mosques ask for covered arms and legs and a headscarf for women, and provide cover-ups on organised tours. Shoes come off at the door.",
  },
  {
    id: "malls",
    label: "Malls and shopping centres",
    shoulders: true,
    knees: true,
    ankles: false,
    wrists: false,
    headCover: false,
    shoesOff: false,
    strictness: "Signposted, occasionally enforced",
    rule: "Dubai Mall, Mall of the Emirates and most others post a dress code at the entrance asking for shoulders and knees to be covered. Security do ask people to cover up, and it is more strictly applied in Sharjah than in Dubai.",
  },
  {
    id: "souks",
    label: "Souks and old quarters",
    shoulders: true,
    knees: true,
    ankles: false,
    wrists: false,
    headCover: false,
    shoesOff: false,
    strictness: "Expected",
    rule: "Deira, Bur Dubai, the Sharjah souks and the historic districts are far more conservative than the hotel strips. Covered shoulders and knees, and a scarf in a bag, save a lot of unwanted attention.",
  },
  {
    id: "beach",
    label: "Beaches, pools and water parks",
    shoulders: false,
    knees: false,
    ankles: false,
    wrists: false,
    headCover: false,
    shoesOff: false,
    strictness: "Boundary strictly enforced",
    rule: "Swimwear is fine on the beach, at the pool and in a water park, and nowhere else. Cover up the moment you step off the sand — walking into a shop or a taxi in swimwear is an offence. Topless sunbathing is not permitted anywhere in the UAE.",
  },
  {
    id: "restaurants",
    label: "Hotel restaurants and fine dining",
    shoulders: true,
    knees: true,
    ankles: false,
    wrists: false,
    headCover: false,
    shoesOff: false,
    strictness: "Smart casual, enforced at the door",
    rule: "Evening service at hotel restaurants generally means no shorts, no beachwear and closed shoes for men. A few venues at the top end ask for a jacket.",
  },
  {
    id: "nightlife",
    label: "Bars and clubs",
    shoulders: false,
    knees: false,
    ankles: false,
    wrists: false,
    headCover: false,
    shoesOff: false,
    strictness: "Door policy",
    rule: "Smart dress, and many venues refuse men in shorts, vests or open sandals. Licensed venues sit inside hotels almost everywhere, and there are none at all in Sharjah.",
  },
  {
    id: "business",
    label: "Business meetings and government offices",
    shoulders: true,
    knees: true,
    ankles: false,
    wrists: false,
    headCover: false,
    shoesOff: false,
    strictness: "Enforced by convention, and by rule in government buildings",
    rule: "Conservative and formal: a suit or long-sleeved shirt and trousers for men, covered shoulders and knees for women. Government offices post their own modest dress requirement at the door.",
  },
  {
    id: "desert",
    label: "Desert safari and dune camps",
    shoulders: true,
    knees: true,
    ankles: false,
    wrists: false,
    headCover: false,
    shoesOff: true,
    strictness: "Practical",
    rule: "Covered light clothing against sun and sand, closed shoes you can empty, and a warm layer for after sunset — the desert loses its heat fast once the sun is down. Shoes come off on the carpets at most camps.",
  },
];

/** Packing arithmetic constants. */
export const DRYING_BUFFER_DAYS = 2;
export const BOTTOM_WEAR_DAYS = 2.5;
export const MIN_BOTTOMS = 2;
export const HOT_TOP_MULTIPLIER = 1.5; // you will change tops in Gulf summer
export const HOT_THRESHOLD_C = 30;
export const RAIN_THRESHOLD_MM = 15; // enough to justify a light rain layer here

export const MIN_TRIP_DAYS = 1;
export const MAX_TRIP_DAYS = 120;
export const MIN_LAUNDRY_DAYS = 1;
export const MAX_LAUNDRY_DAYS = 30;

/** Daily maximum above which the middle of the day is effectively indoors. */
export const INDOOR_DAY_MAX_C = 40;

const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);
const isWholeNumber = (value) => isFiniteNumber(value) && Number.isInteger(value);

/** The layer band for a mean temperature. */
export function bandForTemp(meanTempC) {
  if (!isFiniteNumber(meanTempC)) return null;
  return (
    LAYER_BANDS.find((band) => meanTempC <= band.maxTempC) || LAYER_BANDS[LAYER_BANDS.length - 1]
  );
}

/**
 * How many of a daily-change item to pack: one laundry cycle plus a drying
 * buffer, capped at the length of the trip.
 */
export function dailyChangeCount(tripDays, laundryEveryDays) {
  if (!(tripDays > 0) || !(laundryEveryDays > 0)) return 0;
  return Math.min(Math.ceil(tripDays), Math.ceil(laundryEveryDays) + DRYING_BUFFER_DAYS);
}

/**
 * Build the dress and packing plan.
 *
 * @param {object} input
 * @param {number} input.monthIndex 0 for January through 11 for December
 * @param {string} input.regionId a REGIONS id
 * @param {number} input.tripDays whole days
 * @param {number} input.laundryEveryDays how often you will wash clothes
 * @param {string[]} input.venueIds VENUES ids you will actually visit
 * @param {boolean} input.duringRamadan whether the trip falls in Ramadan
 * @returns {object} the plan, or { error }
 */
export function planDressCode({
  monthIndex = 10,
  regionId = "dubai",
  tripDays = 7,
  laundryEveryDays = 4,
  venueIds = [],
  duringRamadan = false,
} = {}) {
  if (!isWholeNumber(monthIndex) || monthIndex < 0 || monthIndex > 11) {
    return { error: "Choose a month of the year." };
  }
  const region = REGIONS.find((entry) => entry.id === regionId);
  if (!region) return { error: "Choose which emirate you are visiting." };
  if (!isWholeNumber(tripDays) || tripDays < MIN_TRIP_DAYS || tripDays > MAX_TRIP_DAYS) {
    return { error: `Enter a trip length between ${MIN_TRIP_DAYS} and ${MAX_TRIP_DAYS} whole days.` };
  }
  if (
    !isWholeNumber(laundryEveryDays) ||
    laundryEveryDays < MIN_LAUNDRY_DAYS ||
    laundryEveryDays > MAX_LAUNDRY_DAYS
  ) {
    return {
      error: `Enter how often you will do laundry, between every ${MIN_LAUNDRY_DAYS} and every ${MAX_LAUNDRY_DAYS} days.`,
    };
  }
  if (!Array.isArray(venueIds)) return { error: "Choose the places you will be going." };
  const venues = venueIds
    .map((id) => VENUES.find((entry) => entry.id === id))
    .filter((entry) => Boolean(entry));
  if (venues.length === 0) {
    return { error: "Tick at least one place you will be going, so the dress rules can be applied." };
  }

  const meanTempC = region.meanTempC[monthIndex];
  const maxTempC = region.maxTempC[monthIndex];
  const rainfallMm = region.rainfallMm[monthIndex];
  const band = bandForTemp(meanTempC);

  const needsHeadCover = venues.some((venue) => venue.headCover);
  const needsAnkles = venues.some((venue) => venue.ankles);
  const needsShoulders = venues.some((venue) => venue.shoulders);
  const needsKnees = venues.some((venue) => venue.knees);
  const anyShoesOff = venues.some((venue) => venue.shoesOff);
  const isHot = meanTempC >= HOT_THRESHOLD_C;
  const indoorMiddayNeeded = maxTempC >= INDOOR_DAY_MAX_C;

  // --- Counts ---
  const base = dailyChangeCount(tripDays, laundryEveryDays);
  const tops = isHot ? Math.ceil(base * HOT_TOP_MULTIPLIER) : base;
  const underwear = base;
  const socks = base;
  const bottoms = Math.max(MIN_BOTTOMS, Math.ceil(base / BOTTOM_WEAR_DAYS));

  const packingList = [
    {
      id: "tops",
      label:
        needsShoulders || isHot
          ? "Loose long-sleeved tops in light cotton or linen"
          : "Tops",
      quantity: tops,
      reason: isHot
        ? `One laundry cycle plus a spare, then half again because you will change at ${meanTempC} °C.`
        : "One laundry cycle plus a spare while a wash dries.",
    },
    {
      id: "bottoms",
      label: needsKnees ? "Trousers or below-the-knee skirts" : "Trousers or skirts",
      quantity: bottoms,
      reason: `One pair covers about ${BOTTOM_WEAR_DAYS} days of wear.`,
    },
    { id: "underwear", label: "Underwear", quantity: underwear, reason: "One per day of the cycle." },
    { id: "socks", label: "Socks", quantity: socks, reason: "One per day of the cycle." },
    {
      id: "shoes",
      label: "Comfortable shoes you can slip on and off",
      quantity: 1,
      reason: anyShoesOff
        ? "Shoes come off at the mosque and at most desert camps."
        : "Malls and pavements involve more walking than the taxi culture suggests.",
    },
  ];

  if (needsHeadCover) {
    packingList.push({
      id: "scarf",
      label: "Large light scarf or shawl",
      quantity: 1,
      reason:
        "For covering the hair at a mosque. It doubles as a shoulder cover in a souk and a layer against air conditioning.",
    });
  }
  if (needsAnkles) {
    packingList.push({
      id: "abaya",
      label: "Loose full-length outfit — abaya, maxi dress or long tunic and trousers",
      quantity: 1,
      reason:
        "The Grand Mosque requires wrists and ankles covered in non-transparent fabric, and cover-ups are no longer routinely handed out.",
    });
  }
  if (band.id !== "mild") {
    packingList.push({
      id: "ac-layer",
      label: "Light layer for air conditioning",
      quantity: 1,
      reason:
        "Interiors are cooled to around 20 °C. The temperature swing walking into a mall is what makes people ill, not the heat.",
    });
  }
  if (band.id === "mild") {
    packingList.push({
      id: "evening-layer",
      label: "Jacket or jumper for the evening",
      quantity: 1,
      reason: `A ${meanTempC} °C mean in ${MONTHS[monthIndex]} means genuinely cool evenings, and colder still in the desert.`,
    });
  }
  if (meanTempC >= 27) {
    packingList.push({
      id: "sun",
      label: "Wide-brimmed hat and sunglasses",
      quantity: 1,
      reason: `Typical daily maximum around ${maxTempC} °C. Shade is scarce away from the malls.`,
    });
  }
  if (venues.some((venue) => venue.id === "beach")) {
    packingList.push({
      id: "swim",
      label: "Swimwear",
      quantity: 2,
      reason: "One drying while the other is worn.",
    });
    packingList.push({
      id: "coverup",
      label: "Beach cover-up — kaftan, shirt and shorts",
      quantity: 1,
      reason:
        "Swimwear is confined to the beach, the pool and the water park. You need something to put on before you leave any of them.",
    });
  }
  if (
    venues.some((venue) => venue.id === "restaurants") ||
    venues.some((venue) => venue.id === "nightlife") ||
    venues.some((venue) => venue.id === "business")
  ) {
    packingList.push({
      id: "smart",
      label: "One smart outfit with closed shoes",
      quantity: 1,
      reason: "Hotel restaurants, bars and offices all turn people away for shorts and sandals.",
    });
  }
  if (venues.some((venue) => venue.id === "desert")) {
    packingList.push({
      id: "desert-kit",
      label: "Closed shoes you can empty, plus a warm layer for after sunset",
      quantity: 1,
      reason: "The desert loses its heat quickly once the sun goes down, in any month.",
    });
  }
  if (rainfallMm >= RAIN_THRESHOLD_MM) {
    packingList.push({
      id: "rain",
      label: "Packable rain layer",
      quantity: 1,
      reason: `About ${rainfallMm} mm falls in an average ${MONTHS[monthIndex]}. It is not much, but UAE rain arrives all at once and the drainage struggles.`,
    });
  }

  const totalItems = packingList.reduce((sum, item) => sum + item.quantity, 0);

  const requirements = venues.map((venue) => ({
    id: venue.id,
    label: venue.label,
    strictness: venue.strictness,
    rule: venue.rule,
    shoulders: venue.shoulders,
    knees: venue.knees,
    headCover: venue.headCover,
    shoesOff: venue.shoesOff,
  }));

  const warnings = [];
  if (needsShoulders || needsKnees) {
    warnings.push(
      "The baseline in public across the UAE is shoulders and knees covered. Malls post it at the entrance and security do ask people to cover up.",
    );
  }
  if (region.id === "sharjah") {
    warnings.push(
      "Sharjah applies a published decency code in public and is a dry emirate: no alcohol is sold or served anywhere in it, including hotels. Dress a full notch more conservatively than in Dubai.",
    );
  }
  if (needsHeadCover) {
    warnings.push(
      "Take your own scarf and a loose long outfit for the Grand Mosque. Visitors are no longer routinely issued an abaya, and being turned back at the entrance after the queue is a wasted morning.",
    );
  }
  if (venues.some((venue) => venue.id === "beach")) {
    warnings.push(
      "Swimwear is legal on the beach, at the pool and in a water park, and nowhere else. Walking into a shop, a taxi or a hotel lobby in it is an offence, and topless sunbathing is not permitted anywhere in the country.",
    );
  }
  if (indoorMiddayNeeded) {
    warnings.push(
      `Typical daily maxima around ${maxTempC} °C in ${MONTHS[monthIndex]} make the middle of the day an indoor activity. Plan outdoor sightseeing before 10:00 or after sunset.`,
    );
  }
  if (region.humidCoast && (monthIndex === 7 || monthIndex === 8)) {
    warnings.push(
      "August and September bring the worst of the coastal humidity, which is what makes the Gulf summer unbearable rather than the temperature alone. Fabrics that dry are worth more than fabrics that are thin.",
    );
  }
  if (duringRamadan) {
    warnings.push(
      "During Ramadan, dress a notch more conservatively than usual and do not eat, drink or smoke in public during daylight hours. Restaurants and screening rules have relaxed in recent years, but the courtesy has not changed. Working hours shorten and the evenings, after iftar, are when the country comes alive.",
    );
  }
  if (venues.some((venue) => venue.id === "nightlife")) {
    warnings.push(
      "Alcohol is served in licensed venues, almost all inside hotels. Drinking in public and being drunk in public are offences, and there are no licensed venues at all in Sharjah.",
    );
  }
  warnings.push(
    "Photographing people, especially women and families, without permission is an offence under UAE law, and government, military and palace buildings should not be photographed at all.",
  );

  return {
    month: MONTHS[monthIndex],
    monthIndex,
    region,
    meanTempC,
    maxTempC,
    rainfallMm,
    band,
    tripDays,
    laundryEveryDays,
    cycleDays: base,
    duringRamadan,
    needsHeadCover,
    needsAnkles,
    needsShoulders,
    needsKnees,
    anyShoesOff,
    isHot,
    indoorMiddayNeeded,
    packingList,
    totalItems,
    requirements,
    warnings,
  };
}
