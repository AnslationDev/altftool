/**
 * Japan dress code and packing model.
 *
 * Two separate problems get solved together here, because travellers face them
 * together:
 *
 *   1. What the weather requires. Japan runs from subarctic Hokkaido to
 *      subtropical Okinawa, and the same month means a fleece in Sapporo and a
 *      linen shirt in Naha. The model uses monthly climate normals per region.
 *   2. What the venue requires. Japan has very few religious dress rules but a
 *      great many shoes-off, tattoo and smart-casual ones, and those are what
 *      actually catch visitors out.
 *
 * The packing count is arithmetic, not a guess:
 *
 *   daily-change items = min(tripDays, laundryEveryDays + DRYING_BUFFER_DAYS)
 *   bottoms            = max(MIN_BOTTOMS, ceil(dailyChange / BOTTOM_WEAR_DAYS))
 *
 * In other words you carry enough to cover one laundry cycle plus a spare set
 * while a wash dries, and never more than the length of the trip.
 *
 * Climate figures are rounded monthly normals for a representative station in
 * each region. They describe a typical month, not a forecast, and any given
 * week can sit well outside them.
 *
 * Pure functions only: no clock, no network, no DOM.
 */

export const DESTINATION = {
  name: "Japan",
  headline:
    "Japan has almost no religious dress code and an enormous number of shoes-off moments. Plan for the floor, the weather and the tattoo policy, in that order.",
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
 * Monthly climate normals, rounded, for a representative station in each
 * region: mean daily temperature in degrees Celsius and total rainfall in
 * millimetres. These are long-run averages, not a forecast.
 */
export const REGIONS = [
  {
    id: "hokkaido",
    label: "Hokkaido — Sapporo, Hakodate, Niseko",
    station: "Sapporo",
    meanTempC: [-3, -3, 1, 7, 13, 17, 21, 22, 19, 12, 5, -1],
    rainfallMm: [110, 90, 80, 55, 55, 60, 90, 125, 140, 110, 115, 115],
    note: "Genuine winter with heavy snow from December to March, and a short, comfortable summer.",
  },
  {
    id: "kanto",
    label: "Kanto — Tokyo, Yokohama, Nikko",
    station: "Tokyo",
    meanTempC: [5, 6, 9, 14, 19, 22, 26, 27, 23, 18, 13, 8],
    rainfallMm: [60, 55, 115, 135, 140, 170, 155, 155, 225, 235, 95, 60],
    note: "Cold dry winters, a wet June, and an August that is hot and very humid.",
  },
  {
    id: "kansai",
    label: "Kansai — Kyoto, Osaka, Nara",
    station: "Osaka",
    meanTempC: [6, 7, 10, 15, 20, 24, 28, 29, 25, 20, 14, 9],
    rainfallMm: [45, 60, 105, 100, 110, 185, 175, 100, 160, 110, 70, 55],
    note: "Kyoto sits in a basin, which makes its summers hotter and stiller than Tokyo's and its winters sharper.",
  },
  {
    id: "kyushu",
    label: "Kyushu — Fukuoka, Nagasaki, Kagoshima",
    station: "Fukuoka",
    meanTempC: [7, 8, 11, 15, 20, 23, 27, 28, 25, 20, 14, 9],
    rainfallMm: [75, 70, 110, 125, 150, 250, 300, 210, 175, 80, 85, 60],
    note: "The wettest of the main regions in June and July, and the first to feel a typhoon.",
  },
  {
    id: "okinawa",
    label: "Okinawa — Naha, Ishigaki",
    station: "Naha",
    meanTempC: [17, 18, 19, 22, 25, 27, 29, 29, 28, 25, 22, 19],
    rainfallMm: [100, 115, 145, 160, 245, 285, 190, 240, 275, 180, 120, 110],
    note: "Subtropical. Its rainy season runs a month earlier than the mainland's, and its typhoon risk is the highest in Japan.",
  },
];

/** Layering bands by mean daily temperature, in degrees Celsius. */
export const LAYER_BANDS = [
  {
    id: "deep-winter",
    maxTempC: 0,
    label: "Deep winter",
    advice:
      "Insulated coat over a thermal base and a knit mid-layer, plus hat, gloves and a scarf. Indoor heating is strong, so everything has to come off easily.",
  },
  {
    id: "cold",
    maxTempC: 9,
    label: "Cold",
    advice:
      "A proper winter coat, a knit mid-layer and long sleeves. Trains and shops are heated hard, so layers you can shed matter more than one thick coat.",
  },
  {
    id: "cool",
    maxTempC: 17,
    label: "Cool",
    advice:
      "Long sleeves with a light jacket or trench. Mornings and evenings run several degrees below the daily mean.",
  },
  {
    id: "mild",
    maxTempC: 23,
    label: "Mild",
    advice:
      "Short or long sleeves with one light layer for the evening. The best walking weather in Japan.",
  },
  {
    id: "warm",
    maxTempC: 28,
    label: "Warm",
    advice:
      "Breathable short sleeves, a sun hat and a light layer for over-air-conditioned trains and shops.",
  },
  {
    id: "hot",
    maxTempC: 99,
    label: "Hot and humid",
    advice:
      "The lightest breathable fabrics you own, a sun hat, a hand towel and a plan to change mid-day. Japanese summer humidity is the part visitors underestimate.",
  },
];

/**
 * Venue rules. `shoesOff` is the one that drives packing more than anything
 * else in Japan, because it puts your socks on display several times a day.
 */
export const VENUES = [
  {
    id: "temples",
    label: "Temples and shrines",
    shoulders: false,
    knees: false,
    headCover: false,
    shoesOff: true,
    strictness: "Respectful rather than enforced",
    rule: "No formal dress code, but shoes come off in temple halls and hats come off at the worship hall. Shoulders covered is the respectful default.",
  },
  {
    id: "ryokan",
    label: "Ryokan and traditional inns",
    shoulders: false,
    knees: false,
    headCover: false,
    shoesOff: true,
    strictness: "Enforced by the building",
    rule: "Shoes come off at the genkan and stay off. A yukata and a haori are provided and can be worn to dinner and around the inn, but not outside in most towns.",
  },
  {
    id: "onsen",
    label: "Onsen and public baths",
    shoulders: false,
    knees: false,
    headCover: false,
    shoesOff: true,
    strictness: "Strictly enforced",
    rule: "Nothing is worn in the water — no swimwear, and the small towel never touches the bath. Many baths still refuse visible tattoos, so check the policy or book a private bath.",
  },
  {
    id: "tatami-restaurants",
    label: "Tatami restaurants and izakaya",
    shoulders: false,
    knees: false,
    headCover: false,
    shoesOff: true,
    strictness: "Enforced by the building",
    rule: "Any raised floor means shoes off. Slip-on shoes save several minutes a day and a great deal of fumbling at the step.",
  },
  {
    id: "fine-dining",
    label: "Fine dining and kaiseki",
    shoulders: true,
    knees: true,
    headCover: false,
    shoesOff: true,
    strictness: "Smart casual, occasionally enforced",
    rule: "Smart casual is the floor: no shorts, no vests, no beach sandals. A small number of hotel restaurants ask men for a jacket, and some counters ask you not to wear strong scent.",
  },
  {
    id: "business",
    label: "Offices and business meetings",
    shoulders: true,
    knees: true,
    headCover: false,
    shoesOff: false,
    strictness: "Enforced by convention",
    rule: "Dark suit, white shirt, conservative tie, polished shoes. Cool Biz, the government energy-saving campaign that runs roughly from May to September, drops the jacket and tie in many offices — confirm with your host rather than assuming.",
  },
  {
    id: "nightlife",
    label: "Bars and clubs",
    shoulders: false,
    knees: false,
    headCover: false,
    shoesOff: false,
    strictness: "Venue by venue",
    rule: "Tokyo clubs and some hotel bars refuse shorts, vests and open sandals, and a few members' bars refuse visible tattoos. Carry photo ID; entry checks are routine.",
  },
  {
    id: "walking",
    label: "Long sightseeing days",
    shoulders: false,
    knees: false,
    headCover: false,
    shoesOff: false,
    strictness: "Practical",
    rule: "Expect 15,000 to 25,000 steps a day with a lot of stairs in stations. Comfortable, already broken-in shoes matter more than anything else you pack.",
  },
  {
    id: "snow",
    label: "Snow country and winter sports",
    shoulders: false,
    knees: false,
    headCover: false,
    shoesOff: true,
    strictness: "Practical",
    rule: "Waterproof boots with grip, because pavements in Hokkaido and the Japan Sea side are compacted ice for months. Ski gear is easy to hire; boots in large sizes are not.",
  },
];

/** Packing arithmetic constants. */
export const DRYING_BUFFER_DAYS = 2; // a spare set while a wash dries
export const BOTTOM_WEAR_DAYS = 2.5; // how many days one pair of trousers lasts
export const MIN_BOTTOMS = 2;
export const SOCK_BONUS_SHOES_OFF = 2; // extra pairs when shoes come off daily
export const HOT_TOP_MULTIPLIER = 1.5; // changing tops mid-day in Japanese summer
export const HOT_THRESHOLD_C = 27; // mean temperature at which that kicks in
export const RAIN_THRESHOLD_MM = 120; // monthly rainfall that justifies rain gear
export const HEAVY_RAIN_MM = 200; // monthly rainfall that justifies proper waterproofs

export const MIN_TRIP_DAYS = 1;
export const MAX_TRIP_DAYS = 120;
export const MIN_LAUNDRY_DAYS = 1;
export const MAX_LAUNDRY_DAYS = 30;

/** Months, zero-indexed, in which the mainland rainy season normally falls. */
export const TSUYU_MONTHS = [5, 6]; // June and July
export const TYPHOON_MONTHS = [7, 8, 9]; // August to October

const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);
const isWholeNumber = (value) => isFiniteNumber(value) && Number.isInteger(value);

/** The layer band for a mean temperature. */
export function bandForTemp(meanTempC) {
  if (!isFiniteNumber(meanTempC)) return null;
  return LAYER_BANDS.find((band) => meanTempC <= band.maxTempC) || LAYER_BANDS[LAYER_BANDS.length - 1];
}

/**
 * How many of a daily-change item to pack.
 * One laundry cycle plus a drying buffer, capped at the length of the trip.
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
 * @returns {object} the plan, or { error }
 */
export function planDressCode({
  monthIndex = 3,
  regionId = "kanto",
  tripDays = 10,
  laundryEveryDays = 5,
  venueIds = [],
} = {}) {
  if (!isWholeNumber(monthIndex) || monthIndex < 0 || monthIndex > 11) {
    return { error: "Choose a month of the year." };
  }
  const region = REGIONS.find((entry) => entry.id === regionId);
  if (!region) return { error: "Choose the part of Japan you are visiting." };
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
  const rainfallMm = region.rainfallMm[monthIndex];
  const band = bandForTemp(meanTempC);

  const anyShoesOff = venues.some((venue) => venue.shoesOff);
  const needsShoulders = venues.some((venue) => venue.shoulders);
  const needsKnees = venues.some((venue) => venue.knees);
  const isHot = meanTempC >= HOT_THRESHOLD_C;

  // --- Counts ---
  const base = dailyChangeCount(tripDays, laundryEveryDays);
  const tops = isHot ? Math.ceil(base * HOT_TOP_MULTIPLIER) : base;
  const underwear = base;
  const socks = anyShoesOff ? base + SOCK_BONUS_SHOES_OFF : base;
  const bottoms = Math.max(MIN_BOTTOMS, Math.ceil(base / BOTTOM_WEAR_DAYS));

  const packingList = [
    {
      id: "tops",
      label: isHot ? "Tops (breathable — you will change mid-day)" : "Tops",
      quantity: tops,
      reason: isHot
        ? `One laundry cycle plus a spare, then half again for the humidity above ${HOT_THRESHOLD_C} °C.`
        : "One laundry cycle plus a spare while a wash dries.",
    },
    {
      id: "bottoms",
      label: "Trousers or skirts",
      quantity: bottoms,
      reason: `One pair covers about ${BOTTOM_WEAR_DAYS} days of wear.`,
    },
    { id: "underwear", label: "Underwear", quantity: underwear, reason: "One per day of the cycle." },
    {
      id: "socks",
      label: anyShoesOff ? "Socks — the good ones, no holes" : "Socks",
      quantity: socks,
      reason: anyShoesOff
        ? `An extra ${SOCK_BONUS_SHOES_OFF} pairs because your shoes come off at temples, ryokan and tatami restaurants.`
        : "One per day of the cycle.",
    },
    { id: "shoes", label: "Comfortable walking shoes, slip-on if possible", quantity: 1, reason: "Broken in before you fly." },
  ];

  if (band.id === "deep-winter" || band.id === "cold") {
    packingList.push({
      id: "coat",
      label: band.id === "deep-winter" ? "Insulated winter coat" : "Winter coat",
      quantity: 1,
      reason: `Mean temperature ${meanTempC} °C in ${MONTHS[monthIndex]}.`,
    });
    packingList.push({
      id: "midlayer",
      label: "Knit or fleece mid-layer",
      quantity: 2,
      reason: "Indoor heating is aggressive, so you will take it off constantly.",
    });
    packingList.push({
      id: "accessories",
      label: "Hat, gloves and scarf",
      quantity: 1,
      reason: "One set. Cheap and excellent versions are in every convenience store.",
    });
  }
  if (band.id === "deep-winter") {
    packingList.push({
      id: "thermals",
      label: "Thermal base layers",
      quantity: 2,
      reason: "Heattech-style base layers are the standard local solution and are sold everywhere.",
    });
  }
  if (band.id === "cool") {
    packingList.push({
      id: "jacket",
      label: "Light jacket or trench",
      quantity: 1,
      reason: `Mornings and evenings sit below the ${meanTempC} °C daily mean.`,
    });
  }
  if (band.id === "mild" || band.id === "warm" || band.id === "hot") {
    packingList.push({
      id: "layer",
      label: "Light layer for air conditioning",
      quantity: 1,
      reason: "Trains, shops and restaurants are cooled hard in summer.",
    });
  }
  if (band.id === "warm" || band.id === "hot") {
    packingList.push({
      id: "sun",
      label: "Sun hat and a small hand towel",
      quantity: 1,
      reason: "The hand towel is what everyone carries; many public toilets have no dryer.",
    });
  }
  if (rainfallMm >= HEAVY_RAIN_MM) {
    packingList.push({
      id: "waterproof",
      label: "Proper waterproof jacket and quick-drying shoes",
      quantity: 1,
      reason: `About ${rainfallMm} mm of rain falls in an average ${MONTHS[monthIndex]} here.`,
    });
  } else if (rainfallMm >= RAIN_THRESHOLD_MM) {
    packingList.push({
      id: "rain",
      label: "Packable rain layer",
      quantity: 1,
      reason: `About ${rainfallMm} mm of rain in an average ${MONTHS[monthIndex]}. Umbrellas are cheap in every convenience store, so do not pack one.`,
    });
  }
  if (needsShoulders || needsKnees) {
    packingList.push({
      id: "smart",
      label: "One smart outfit — covered shoulders and knees, closed shoes",
      quantity: 1,
      reason: "For the venues you ticked that expect smart casual or business dress.",
    });
  }
  if (venues.some((venue) => venue.id === "business")) {
    packingList.push({
      id: "suit",
      label: "Dark suit and conservative shirts",
      quantity: 1,
      reason:
        monthIndex >= 4 && monthIndex <= 8
          ? "Cool Biz runs roughly May to September and may drop the jacket and tie — confirm with your host."
          : "Dark suit, white shirt and polished shoes are the default outside the Cool Biz months.",
    });
  }
  if (venues.some((venue) => venue.id === "snow")) {
    packingList.push({
      id: "boots",
      label: "Waterproof boots with winter grip",
      quantity: 1,
      reason: "Pavements in snow country are compacted ice for months, and large sizes are hard to hire.",
    });
  }

  const totalItems = packingList.reduce((sum, item) => sum + item.quantity, 0);

  // --- Requirements table, only for the venues ticked ---
  const requirements = venues.map((venue) => ({
    id: venue.id,
    label: venue.label,
    strictness: venue.strictness,
    rule: venue.rule,
    shoesOff: venue.shoesOff,
    shoulders: venue.shoulders,
    knees: venue.knees,
  }));

  const warnings = [];
  if (anyShoesOff) {
    warnings.push(
      "Your shoes will come off several times a day. Slip-on shoes and socks without holes are the two changes that make the biggest practical difference in Japan.",
    );
  }
  if (venues.some((venue) => venue.id === "onsen")) {
    warnings.push(
      "Many onsen and public baths still refuse visible tattoos. Check the policy before you book, or reserve a private family bath, and remember that swimwear is never worn in the water.",
    );
  }
  if (TSUYU_MONTHS.includes(monthIndex) && region.id !== "hokkaido") {
    warnings.push(
      "This falls in tsuyu, the mainland rainy season, which typically runs from early June to mid-July. Expect humidity as much as rain, and pack fabrics that dry.",
    );
  }
  if (TYPHOON_MONTHS.includes(monthIndex)) {
    warnings.push(
      "Typhoon season peaks from August to October, most strongly in Okinawa and Kyushu. Umbrellas are useless in one; a hooded waterproof is not.",
    );
  }
  if (region.id === "hokkaido" && (monthIndex <= 2 || monthIndex >= 11)) {
    warnings.push(
      "Hokkaido pavements are compacted ice through the winter. Boots with real grip, or the clip-on studs sold locally, prevent the single most common visitor injury.",
    );
  }
  if (isHot) {
    warnings.push(
      `A mean of ${meanTempC} °C in ${MONTHS[monthIndex]} understates it: Japanese summer humidity is what exhausts people. Plan an indoor stop in the early afternoon.`,
    );
  }
  if (venues.some((venue) => venue.id === "business") && monthIndex >= 4 && monthIndex <= 8) {
    warnings.push(
      "Cool Biz, the government's summer energy-saving campaign, runs roughly from May to September and relaxes jackets and ties in many offices. It is not universal, so ask your host what they are doing.",
    );
  }
  if (venues.some((venue) => venue.id === "nightlife")) {
    warnings.push(
      "Tokyo clubs and some hotel bars refuse shorts, vests and open sandals, and a few refuse visible tattoos. Carry photo ID as well — entry checks are routine.",
    );
  }

  return {
    month: MONTHS[monthIndex],
    monthIndex,
    region,
    meanTempC,
    rainfallMm,
    band,
    tripDays,
    laundryEveryDays,
    cycleDays: base,
    anyShoesOff,
    needsShoulders,
    needsKnees,
    isHot,
    packingList,
    totalItems,
    requirements,
    warnings,
  };
}
