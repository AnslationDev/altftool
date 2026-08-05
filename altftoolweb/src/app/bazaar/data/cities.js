/**
 * AltF Bazaar — city + locality registry.
 *
 * City slugs are NOT redefined here. They are borrowed from the site-wide GEO
 * registry (`src/platform/seo/geoLocations.js`) so a Bazaar city page and a
 * `/locations/<slug>` page always describe the same place, and so the
 * Organization `areaServed` graph stays consistent.
 *
 * What this module adds on top of the GEO registry is marketplace-specific:
 * localities (the neighbourhood filter), and a `demand` weight that drives how
 * many mock listings the generator assigns to each city.
 *
 * Server-safe and synchronously importable.
 */

import { getGeoLocation, getAllGeoLocations } from "@/platform/seo/geoLocations";

/**
 * Marketplace demand weight per city, roughly tracking real classifieds
 * volume. Used only to shape the mock corpus so metro pages feel busy and
 * tier-2 pages feel plausible rather than empty.
 */
const DEMAND = {
  mumbai: 10,
  bangalore: 10,
  delhi: 10,
  hyderabad: 9,
  pune: 9,
  chennai: 8,
  kolkata: 8,
  ahmedabad: 7,
  gurugram: 7,
  noida: 7,
  jaipur: 6,
  lucknow: 6,
  surat: 6,
  indore: 6,
  chandigarh: 5,
  nagpur: 5,
  bhopal: 5,
  coimbatore: 5,
  kochi: 5,
  visakhapatnam: 5,
  ghaziabad: 5,
  faridabad: 5,
  vadodara: 4,
  nashik: 4,
  patna: 4,
  ludhiana: 4,
  rajkot: 4,
  bhubaneswar: 4,
  ranchi: 3,
  raipur: 3,
  guwahati: 3,
  dehradun: 3,
  mysuru: 3,
  madurai: 3,
  vijayawada: 3,
  thiruvananthapuram: 3,
  amritsar: 3,
  varanasi: 3,
  agra: 3,
  meerut: 3,
  kanpur: 3,
  prayagraj: 2,
  jodhpur: 2,
  udaipur: 2,
  kota: 2,
  gwalior: 2,
  jabalpur: 2,
  ujjain: 2,
  mangaluru: 2,
  shimla: 2,
};


/**
 * Approximate city-centre coordinates, [lat, lng].
 *
 * Used to place listings on a map. These are real coordinates for real
 * places — the *listings* are mock, the geography is not, because a map that
 * puts Mumbai in the Bay of Bengal is worse than no map.
 */
const COORDS = {
  mumbai: [19.076, 72.877],
  bangalore: [12.972, 77.594],
  delhi: [28.614, 77.209],
  hyderabad: [17.385, 78.487],
  pune: [18.52, 73.857],
  chennai: [13.083, 80.27],
  kolkata: [22.573, 88.364],
  ahmedabad: [23.023, 72.571],
  gurugram: [28.46, 77.027],
  noida: [28.535, 77.391],
  jaipur: [26.912, 75.787],
  lucknow: [26.847, 80.947],
  surat: [21.17, 72.831],
  indore: [22.72, 75.858],
  chandigarh: [30.733, 76.78],
  nagpur: [21.146, 79.088],
  bhopal: [23.26, 77.413],
  coimbatore: [11.017, 76.956],
  kochi: [9.932, 76.267],
  visakhapatnam: [17.687, 83.219],
  ghaziabad: [28.669, 77.454],
  faridabad: [28.408, 77.317],
  vadodara: [22.307, 73.181],
  nashik: [19.997, 73.79],
  patna: [25.594, 85.138],
  ludhiana: [30.901, 75.857],
  rajkot: [22.303, 70.802],
  bhubaneswar: [20.296, 85.825],
  ranchi: [23.344, 85.31],
  raipur: [21.251, 81.63],
  guwahati: [26.145, 91.736],
  dehradun: [30.317, 78.032],
  mysuru: [12.295, 76.639],
  madurai: [9.925, 78.12],
  vijayawada: [16.507, 80.648],
  thiruvananthapuram: [8.524, 76.937],
  amritsar: [31.634, 74.872],
  varanasi: [25.318, 82.973],
  agra: [27.177, 78.008],
  meerut: [28.984, 77.706],
  kanpur: [26.45, 80.332],
  prayagraj: [25.436, 81.846],
  jodhpur: [26.238, 73.024],
  udaipur: [24.585, 73.712],
  kota: [25.213, 75.865],
  gwalior: [26.218, 78.183],
  jabalpur: [23.181, 79.986],
  ujjain: [23.179, 75.785],
  mangaluru: [12.914, 74.856],
  shimla: [31.104, 77.173],
};

/** Real neighbourhood names for the cities that carry the most traffic. */
const LOCALITIES = {
  mumbai: ["Andheri West", "Bandra", "Powai", "Thane West", "Navi Mumbai", "Borivali", "Dadar", "Malad"],
  bangalore: ["Koramangala", "Indiranagar", "Whitefield", "HSR Layout", "Jayanagar", "Electronic City", "Marathahalli", "Hebbal"],
  delhi: ["Dwarka", "Rohini", "Saket", "Lajpat Nagar", "Karol Bagh", "Janakpuri", "Vasant Kunj", "Pitampura"],
  hyderabad: ["Gachibowli", "Madhapur", "Kukatpally", "Banjara Hills", "Secunderabad", "Miyapur", "Kondapur"],
  pune: ["Hinjewadi", "Kothrud", "Baner", "Viman Nagar", "Wakad", "Hadapsar", "Aundh"],
  chennai: ["Adyar", "Velachery", "Anna Nagar", "T. Nagar", "OMR", "Porur", "Tambaram"],
  kolkata: ["Salt Lake", "New Town", "Behala", "Howrah", "Ballygunge", "Dum Dum", "Garia"],
  ahmedabad: ["Satellite", "Bopal", "Maninagar", "Prahlad Nagar", "Chandkheda", "Vastrapur"],
  gurugram: ["DLF Phase 3", "Sohna Road", "Sector 56", "Golf Course Road", "Manesar", "Sushant Lok"],
  noida: ["Sector 62", "Sector 137", "Greater Noida West", "Sector 18", "Sector 76", "Noida Extension"],
  jaipur: ["Malviya Nagar", "Vaishali Nagar", "Mansarovar", "C-Scheme", "Jagatpura", "Tonk Road"],
  lucknow: ["Gomti Nagar", "Hazratganj", "Indira Nagar", "Aliganj", "Alambagh", "Jankipuram"],
  surat: ["Adajan", "Vesu", "Katargam", "Varachha", "Piplod"],
  indore: ["Vijay Nagar", "Palasia", "Rau", "Bhawarkuan", "Sudama Nagar"],
  nagpur: ["Dharampeth", "Manish Nagar", "Wardha Road", "Sadar", "Pratap Nagar"],
  bhopal: ["Arera Colony", "MP Nagar", "Kolar Road", "Shahpura", "Bairagarh"],
  coimbatore: ["RS Puram", "Peelamedu", "Saibaba Colony", "Gandhipuram", "Singanallur"],
  kochi: ["Kakkanad", "Edappally", "Panampilly Nagar", "Fort Kochi", "Vyttila"],
  visakhapatnam: ["MVP Colony", "Gajuwaka", "Madhurawada", "Dwaraka Nagar", "Seethammadhara"],
  ghaziabad: ["Indirapuram", "Vaishali", "Raj Nagar Extension", "Kaushambi", "Crossings Republik"],
  faridabad: ["Sector 15", "Neharpar", "NIT", "Sector 21C", "Ballabgarh"],
};

/** Used where we do not carry hand-written neighbourhood data. */
const GENERIC_LOCALITIES = [
  "City Centre",
  "Civil Lines",
  "Station Road",
  "Main Market",
  "Industrial Area",
  "Ring Road",
];

/**
 * Cities Bazaar operates in, in demand order. Anything present in `DEMAND` and
 * resolvable in the GEO registry is included; unresolvable slugs are dropped
 * rather than faked, so a city page never renders a place the site does not
 * otherwise recognise.
 */
export const CITIES = Object.keys(DEMAND)
  .map((slug) => {
    const geo = getGeoLocation(slug);
    if (!geo) return null;
    // Delhi and Chandigarh sit directly under India in the GEO registry
    // (NCT / union territory, not states), so only adopt the parent as a
    // state when it actually is one.
    const parent = geo.containedIn ? getGeoLocation(geo.containedIn) : null;
    const state = parent?.type === "State" ? parent : null;
    return {
      slug,
      name: geo.name,
      stateSlug: state?.slug || null,
      stateName: state?.name || null,
      demand: DEMAND[slug],
      localities: LOCALITIES[slug] || GENERIC_LOCALITIES,
      // null rather than a guessed coordinate: a map should omit a pin it
      // cannot place, not invent one.
      coords: COORDS[slug] || null,
    };
  })
  .filter(Boolean)
  .sort((a, b) => b.demand - a.demand || a.name.localeCompare(b.name));

const CITY_BY_SLUG = new Map(CITIES.map((c) => [c.slug, c]));

/** @returns {object|null} */
export function getCity(slug) {
  return CITY_BY_SLUG.get(String(slug || "").toLowerCase()) || null;
}

export function getAllCities() {
  return CITIES;
}

export function getCitySlugs() {
  return CITIES.map((c) => c.slug);
}

/** The metros shown in the home-page location picker's shortlist. */
export function getPopularCities(limit = 12) {
  return CITIES.slice(0, limit);
}

/** Cities grouped by state, for the city-directory page. */
export function getCitiesByState() {
  const groups = new Map();
  for (const city of CITIES) {
    const key = city.stateName || "Union Territories & NCT";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(city);
  }
  return [...groups.entries()]
    .map(([state, cities]) => ({ state, cities }))
    .sort((a, b) => a.state.localeCompare(b.state));
}

/**
 * Any GEO slug Bazaar does not operate in still resolves to a real place, so
 * `/bazaar/in/<slug>` can render an honest "not live here yet" surface instead
 * of a 404 for a legitimate Indian city.
 */
export function isServedCity(slug) {
  return CITY_BY_SLUG.has(String(slug || "").toLowerCase());
}

export function getGeoCityCandidates() {
  return getAllGeoLocations().filter((l) => l.type === "City");
}

export const CITY_COUNT = CITIES.length;
