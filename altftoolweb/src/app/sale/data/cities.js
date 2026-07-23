/**
 * Shared city configuration for Sale Locator
 *
 * India only — provides CITY_OPTIONS for dropdowns, CITY_MAP for
 * normalising city names from GPS / user input, and normaliseCity().
 * Any Indian city not listed here can still be found via the
 * search-any-city geocode fallback (see SaleClient's resolveCityQuery),
 * which is also restricted to India.
 */

// ── City options with centre coordinates (for distance calculation when GPS is unavailable)
const CITY_OPTIONS = [
  { label: "Gurugram", value: "Gurugram", lat: 28.4595, lng: 77.0266 },
  { label: "Delhi", value: "Delhi", lat: 28.6139, lng: 77.209 },
  { label: "Noida", value: "Noida", lat: 28.5355, lng: 77.391 },
  { label: "Ghaziabad", value: "Ghaziabad", lat: 28.6692, lng: 77.4538 },
  { label: "Faridabad", value: "Faridabad", lat: 28.4089, lng: 77.3178 },
  { label: "Chandigarh", value: "Chandigarh", lat: 30.7333, lng: 76.7794 },
  { label: "Amritsar", value: "Amritsar", lat: 31.634, lng: 74.8723 },
  { label: "Ludhiana", value: "Ludhiana", lat: 30.901, lng: 75.8573 },
  { label: "Dehradun", value: "Dehradun", lat: 30.3165, lng: 78.0322 },
  { label: "Shimla", value: "Shimla", lat: 31.1048, lng: 77.1734 },
  { label: "Jaipur", value: "Jaipur", lat: 26.9124, lng: 75.7873 },
  { label: "Lucknow", value: "Lucknow", lat: 26.8467, lng: 80.9462 },
  { label: "Kanpur", value: "Kanpur", lat: 26.4499, lng: 80.3319 },
  { label: "Agra", value: "Agra", lat: 27.1767, lng: 78.0081 },
  { label: "Varanasi", value: "Varanasi", lat: 25.3176, lng: 82.9739 },
  { label: "Patna", value: "Patna", lat: 25.5941, lng: 85.1376 },
  { label: "Ranchi", value: "Ranchi", lat: 23.3441, lng: 85.3096 },
  { label: "Bhopal", value: "Bhopal", lat: 23.2599, lng: 77.4126 },
  { label: "Indore", value: "Indore", lat: 22.7196, lng: 75.8577 },
  { label: "Raipur", value: "Raipur", lat: 21.2514, lng: 81.6296 },
  { label: "Nagpur", value: "Nagpur", lat: 21.1458, lng: 79.0882 },
  { label: "Mumbai", value: "Mumbai", lat: 19.076, lng: 72.8777 },
  { label: "Pune", value: "Pune", lat: 18.5204, lng: 73.8567 },
  { label: "Nashik", value: "Nashik", lat: 19.9975, lng: 73.7898 },
  { label: "Surat", value: "Surat", lat: 21.1702, lng: 72.8311 },
  { label: "Vadodara", value: "Vadodara", lat: 22.3072, lng: 73.1812 },
  { label: "Ahmedabad", value: "Ahmedabad", lat: 23.0225, lng: 72.5714 },
  { label: "Rajkot", value: "Rajkot", lat: 22.3039, lng: 70.8022 },
  { label: "Bhubaneswar", value: "Bhubaneswar", lat: 20.2961, lng: 85.8245 },
  { label: "Kolkata", value: "Kolkata", lat: 22.5726, lng: 88.3639 },
  { label: "Guwahati", value: "Guwahati", lat: 26.1445, lng: 91.7362 },
  { label: "Hyderabad", value: "Hyderabad", lat: 17.385, lng: 78.4867 },
  { label: "Visakhapatnam", value: "Visakhapatnam", lat: 17.6868, lng: 83.2185 },
  { label: "Bengaluru", value: "Bengaluru", lat: 12.9716, lng: 77.5946 },
  { label: "Mysuru", value: "Mysuru", lat: 12.2958, lng: 76.6394 },
  { label: "Chennai", value: "Chennai", lat: 13.0827, lng: 80.2707 },
  { label: "Coimbatore", value: "Coimbatore", lat: 11.0168, lng: 76.9558 },
  { label: "Madurai", value: "Madurai", lat: 9.9252, lng: 78.1198 },
  { label: "Kochi", value: "Kochi", lat: 9.9312, lng: 76.2673 },
  { label: "Thiruvananthapuram", value: "Thiruvananthapuram", lat: 8.5241, lng: 76.9366 },
];

// ── Normalise any city string → canonical city name (India only)
const CITY_MAP = {
  gurugram: "Gurugram",

  delhi: "Delhi",
  "new delhi": "Delhi",
  noida: "Noida",
  ghaziabad: "Ghaziabad",
  faridabad: "Faridabad",
  chandigarh: "Chandigarh",
  amritsar: "Amritsar",
  ludhiana: "Ludhiana",
  dehradun: "Dehradun",
  shimla: "Shimla",
  jaipur: "Jaipur",
  lucknow: "Lucknow",
  kanpur: "Kanpur",
  agra: "Agra",
  varanasi: "Varanasi",
  benares: "Varanasi",
  patna: "Patna",
  ranchi: "Ranchi",
  bhopal: "Bhopal",
  indore: "Indore",
  raipur: "Raipur",
  nagpur: "Nagpur",
  mumbai: "Mumbai",
  bombay: "Mumbai",
  pune: "Pune",
  poona: "Pune",
  nashik: "Nashik",
  surat: "Surat",
  vadodara: "Vadodara",
  baroda: "Vadodara",
  ahmedabad: "Ahmedabad",
  rajkot: "Rajkot",
  bhubaneswar: "Bhubaneswar",
  kolkata: "Kolkata",
  calcutta: "Kolkata",
  guwahati: "Guwahati",
  hyderabad: "Hyderabad",
  secunderabad: "Hyderabad",
  visakhapatnam: "Visakhapatnam",
  vizag: "Visakhapatnam",
  bengaluru: "Bengaluru",
  bangalore: "Bengaluru",
  mysuru: "Mysuru",
  mysore: "Mysuru",
  chennai: "Chennai",
  madras: "Chennai",
  coimbatore: "Coimbatore",
  madurai: "Madurai",
  kochi: "Kochi",
  cochin: "Kochi",
  thiruvananthapuram: "Thiruvananthapuram",
  trivandrum: "Thiruvananthapuram",
};

/**
 * Normalise a raw city string to its canonical name.
 * Returns null if unknown.
 */
function normaliseCity(raw = "") {
  const key = raw.toLowerCase().trim();
  return CITY_MAP[key] ?? null;
}

/**
 * Find a city entry (by value) for a canonical city name.
 * Checks the static CITY_OPTIONS first, then any dynamically
 * geocoded cities passed in (e.g. cities the user typed/searched
 * that weren't in the built-in list).
 * Returns null if not found.
 */
function getCityOption(cityName, extraOptions = []) {
  if (!cityName) return null;
  const merged = extraOptions.length ? [...CITY_OPTIONS, ...extraOptions] : CITY_OPTIONS;
  return merged.find((c) => c.value.toLowerCase() === cityName.toLowerCase());
}

/**
 * Get reference coordinates for distance calculation.
 * Uses GPS coords if available, otherwise falls back to city centre
 * (static or dynamically-added).
 */
function getRefCoords(userCoords, cityName, extraOptions = []) {
  if (userCoords) return userCoords;
  const option = getCityOption(cityName, extraOptions);
  return option ? { lat: option.lat, lng: option.lng } : null;
}

/**
 * Filter a list of city options by a free-text query (label substring match).
 * @param {{label:string,value:string,lat:number,lng:number}[]} options
 * @param {string} query
 */
function searchCityOptions(options, query) {
  const q = query.trim().toLowerCase();
  if (!q) return options;
  return options.filter((c) => c.label.toLowerCase().includes(q));
}

export {
  CITY_OPTIONS,
  CITY_MAP,
  normaliseCity,
  getCityOption,
  getRefCoords,
  searchCityOptions,
};
