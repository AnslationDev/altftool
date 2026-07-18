/**
 * ALTFTool — GEO location registry (Entity SEO).
 *
 * Single source of truth for every location entity the brand can be
 * associated with. Each entry is a REAL place with an authoritative
 * Wikipedia link (and Wikidata where verified), which is what lets Google's
 * Knowledge Graph connect "AltFTool" with the location entity — the clean,
 * non-spam way to make "AltFTool {place}" style queries resolvable over
 * time, for ANY place in this registry.
 *
 * HOW TO SCALE: append a row to the right table below. Everything geo-aware
 * (Organization areaServed, /locations routes + static params, geo metadata,
 * geo JSON-LD bundles, sitemap entries) picks the new location up
 * automatically — no core code changes. This registry can grow to thousands
 * of rows; pages are statically generated at build time.
 *
 * Row formats (compact on purpose — one line per place):
 *   COUNTRIES: [slug, name, iso, wikiPath, wikidataQid?, alternateName?]
 *   STATES:    [slug, name, containedInSlug, wikiPath, wikidataQid?]
 *   CITIES:    [slug, name, containedInSlug, wikiPath, wikidataQid?]
 *
 * `wikidataQid` is OPTIONAL — only include a QID when it has been verified.
 * Wikipedia alone is a sufficient disambiguation signal; a wrong QID is
 * worse than none.
 */

const WIKI = "https://en.wikipedia.org/wiki/";
const WIKIDATA = "https://www.wikidata.org/wiki/";

/* ------------------------------- countries ------------------------------- */

const COUNTRIES = [
  ["india", "India", "IN", "India", "Q668"],
  ["usa", "United States", "US", "United_States", "Q30", "USA"],
  ["uk", "United Kingdom", "GB", "United_Kingdom", "Q145", "UK"],
  ["canada", "Canada", "CA", "Canada", "Q16"],
  ["australia", "Australia", "AU", "Australia", "Q408"],
  ["germany", "Germany", "DE", "Germany", "Q183"],
  ["france", "France", "FR", "France", "Q142"],
  ["uae", "United Arab Emirates", "AE", "United_Arab_Emirates", "Q878", "UAE"],
  ["singapore", "Singapore", "SG", "Singapore", "Q334"],
  ["japan", "Japan", "JP", "Japan", "Q17"],
  ["brazil", "Brazil", "BR", "Brazil", "Q155"],
  ["mexico", "Mexico", "MX", "Mexico", "Q96"],
  ["italy", "Italy", "IT", "Italy", "Q38"],
  ["spain", "Spain", "ES", "Spain", "Q29"],
  ["netherlands", "Netherlands", "NL", "Netherlands", "Q55"],
  ["china", "China", "CN", "China", "Q148"],
  ["russia", "Russia", "RU", "Russia", "Q159"],
  ["south-korea", "South Korea", "KR", "South_Korea", "Q884"],
  ["indonesia", "Indonesia", "ID", "Indonesia", "Q252"],
  ["pakistan", "Pakistan", "PK", "Pakistan", "Q843"],
  ["bangladesh", "Bangladesh", "BD", "Bangladesh", "Q902"],
  ["sri-lanka", "Sri Lanka", "LK", "Sri_Lanka", "Q854"],
  ["nepal", "Nepal", "NP", "Nepal", "Q837"],
  ["saudi-arabia", "Saudi Arabia", "SA", "Saudi_Arabia", "Q851"],
  ["qatar", "Qatar", "QA", "Qatar", "Q846"],
  ["kuwait", "Kuwait", "KW", "Kuwait", "Q817"],
  ["oman", "Oman", "OM", "Oman", "Q842"],
  ["bahrain", "Bahrain", "BH", "Bahrain", "Q398"],
  ["south-africa", "South Africa", "ZA", "South_Africa", "Q258"],
  ["nigeria", "Nigeria", "NG", "Nigeria", "Q1033"],
  ["egypt", "Egypt", "EG", "Egypt", "Q79"],
  ["turkey", "Turkey", "TR", "Turkey", "Q43"],
  ["philippines", "Philippines", "PH", "Philippines", "Q928"],
  ["vietnam", "Vietnam", "VN", "Vietnam", "Q881"],
  ["thailand", "Thailand", "TH", "Thailand", "Q869"],
  ["malaysia", "Malaysia", "MY", "Malaysia", "Q833"],
  ["new-zealand", "New Zealand", "NZ", "New_Zealand", "Q664"],
  ["ireland", "Ireland", "IE", "Republic_of_Ireland", "Q27"],
  ["poland", "Poland", "PL", "Poland", "Q36"],
  ["sweden", "Sweden", "SE", "Sweden", "Q34"],
  ["norway", "Norway", "NO", "Norway", "Q20"],
  ["denmark", "Denmark", "DK", "Denmark", "Q35"],
  ["switzerland", "Switzerland", "CH", "Switzerland", "Q39"],
  ["austria", "Austria", "AT", "Austria", "Q40"],
  ["belgium", "Belgium", "BE", "Belgium", "Q31"],
  ["portugal", "Portugal", "PT", "Portugal", "Q45"],
  ["argentina", "Argentina", "AR", "Argentina", "Q414"],
  ["israel", "Israel", "IL", "Israel", "Q801"],
];

/* ----------------------------- states (India) ----------------------------- */

const STATES = [
  ["madhya-pradesh", "Madhya Pradesh", "india", "Madhya_Pradesh", "Q1188"],
  ["uttar-pradesh", "Uttar Pradesh", "india", "Uttar_Pradesh", "Q1498"],
  ["bihar", "Bihar", "india", "Bihar", "Q1165"],
  ["maharashtra", "Maharashtra", "india", "Maharashtra", "Q1191"],
  ["karnataka", "Karnataka", "india", "Karnataka", "Q1185"],
  ["telangana", "Telangana", "india", "Telangana", "Q677037"],
  ["rajasthan", "Rajasthan", "india", "Rajasthan", "Q1437"],
  ["gujarat", "Gujarat", "india", "Gujarat", "Q1061"],
  ["tamil-nadu", "Tamil Nadu", "india", "Tamil_Nadu", "Q1445"],
  ["west-bengal", "West Bengal", "india", "West_Bengal", "Q1356"],
  ["kerala", "Kerala", "india", "Kerala", "Q1186"],
  ["punjab", "Punjab", "india", "Punjab,_India", "Q22424"],
  ["haryana", "Haryana", "india", "Haryana", "Q1174"],
  ["andhra-pradesh", "Andhra Pradesh", "india", "Andhra_Pradesh", "Q1159"],
  ["odisha", "Odisha", "india", "Odisha", "Q22048"],
  ["jharkhand", "Jharkhand", "india", "Jharkhand", "Q1184"],
  ["chhattisgarh", "Chhattisgarh", "india", "Chhattisgarh", "Q1168"],
  ["assam", "Assam", "india", "Assam", "Q1164"],
  ["uttarakhand", "Uttarakhand", "india", "Uttarakhand", "Q1499"],
  ["himachal-pradesh", "Himachal Pradesh", "india", "Himachal_Pradesh", "Q1177"],
  ["goa", "Goa", "india", "Goa", "Q1171"],
  ["jammu-and-kashmir", "Jammu and Kashmir", "india", "Jammu_and_Kashmir_(union_territory)"],
  ["sikkim", "Sikkim", "india", "Sikkim", "Q1505"],
  ["tripura", "Tripura", "india", "Tripura", "Q1363"],
];

/* ----------------------------- cities (India) ----------------------------- */

const INDIA_CITIES = [
  ["delhi", "Delhi", "india", "Delhi", "Q1353"],
  ["mumbai", "Mumbai", "maharashtra", "Mumbai", "Q1156"],
  ["bangalore", "Bengaluru", "karnataka", "Bangalore", "Q1355"],
  ["hyderabad", "Hyderabad", "telangana", "Hyderabad", "Q1361"],
  ["chennai", "Chennai", "tamil-nadu", "Chennai", "Q1352"],
  ["kolkata", "Kolkata", "west-bengal", "Kolkata", "Q1348"],
  ["pune", "Pune", "maharashtra", "Pune", "Q1538"],
  ["ahmedabad", "Ahmedabad", "gujarat", "Ahmedabad", "Q1070"],
  ["bhopal", "Bhopal", "madhya-pradesh", "Bhopal", "Q1585"],
  ["indore", "Indore", "madhya-pradesh", "Indore", "Q1645"],
  ["lucknow", "Lucknow", "uttar-pradesh", "Lucknow", "Q47916"],
  ["jaipur", "Jaipur", "rajasthan", "Jaipur"],
  ["surat", "Surat", "gujarat", "Surat"],
  ["kanpur", "Kanpur", "uttar-pradesh", "Kanpur"],
  ["nagpur", "Nagpur", "maharashtra", "Nagpur"],
  ["patna", "Patna", "bihar", "Patna"],
  ["gwalior", "Gwalior", "madhya-pradesh", "Gwalior"],
  ["jabalpur", "Jabalpur", "madhya-pradesh", "Jabalpur"],
  ["ujjain", "Ujjain", "madhya-pradesh", "Ujjain"],
  ["varanasi", "Varanasi", "uttar-pradesh", "Varanasi"],
  ["agra", "Agra", "uttar-pradesh", "Agra"],
  ["prayagraj", "Prayagraj", "uttar-pradesh", "Prayagraj"],
  ["meerut", "Meerut", "uttar-pradesh", "Meerut"],
  ["noida", "Noida", "uttar-pradesh", "Noida"],
  ["ghaziabad", "Ghaziabad", "uttar-pradesh", "Ghaziabad"],
  ["gurugram", "Gurugram", "haryana", "Gurgaon"],
  ["faridabad", "Faridabad", "haryana", "Faridabad"],
  ["chandigarh", "Chandigarh", "india", "Chandigarh"],
  ["amritsar", "Amritsar", "punjab", "Amritsar"],
  ["ludhiana", "Ludhiana", "punjab", "Ludhiana"],
  ["coimbatore", "Coimbatore", "tamil-nadu", "Coimbatore"],
  ["madurai", "Madurai", "tamil-nadu", "Madurai"],
  ["kochi", "Kochi", "kerala", "Kochi"],
  ["thiruvananthapuram", "Thiruvananthapuram", "kerala", "Thiruvananthapuram"],
  ["visakhapatnam", "Visakhapatnam", "andhra-pradesh", "Visakhapatnam"],
  ["vijayawada", "Vijayawada", "andhra-pradesh", "Vijayawada"],
  ["ranchi", "Ranchi", "jharkhand", "Ranchi"],
  ["raipur", "Raipur", "chhattisgarh", "Raipur"],
  ["bhubaneswar", "Bhubaneswar", "odisha", "Bhubaneswar"],
  ["guwahati", "Guwahati", "assam", "Guwahati"],
  ["dehradun", "Dehradun", "uttarakhand", "Dehradun"],
  ["shimla", "Shimla", "himachal-pradesh", "Shimla"],
  ["nashik", "Nashik", "maharashtra", "Nashik"],
  ["rajkot", "Rajkot", "gujarat", "Rajkot"],
  ["vadodara", "Vadodara", "gujarat", "Vadodara"],
  ["jodhpur", "Jodhpur", "rajasthan", "Jodhpur"],
  ["udaipur", "Udaipur", "rajasthan", "Udaipur"],
  ["kota", "Kota", "rajasthan", "Kota,_Rajasthan"],
  ["mysuru", "Mysuru", "karnataka", "Mysore"],
  ["mangaluru", "Mangaluru", "karnataka", "Mangalore"],
];

/* ----------------------------- cities (world) ----------------------------- */

const WORLD_CITIES = [
  ["new-york", "New York City", "usa", "New_York_City", "Q60"],
  ["los-angeles", "Los Angeles", "usa", "Los_Angeles", "Q65"],
  ["chicago", "Chicago", "usa", "Chicago", "Q1297"],
  ["san-francisco", "San Francisco", "usa", "San_Francisco", "Q62"],
  ["houston", "Houston", "usa", "Houston", "Q16555"],
  ["seattle", "Seattle", "usa", "Seattle", "Q5083"],
  ["boston", "Boston", "usa", "Boston", "Q100"],
  ["london", "London", "uk", "London", "Q84"],
  ["manchester", "Manchester", "uk", "Manchester"],
  ["toronto", "Toronto", "canada", "Toronto", "Q172"],
  ["vancouver", "Vancouver", "canada", "Vancouver", "Q24639"],
  ["sydney", "Sydney", "australia", "Sydney", "Q3130"],
  ["melbourne", "Melbourne", "australia", "Melbourne", "Q3141"],
  ["berlin", "Berlin", "germany", "Berlin", "Q64"],
  ["paris", "Paris", "france", "Paris", "Q90"],
  ["dubai", "Dubai", "uae", "Dubai", "Q612"],
  ["abu-dhabi", "Abu Dhabi", "uae", "Abu_Dhabi", "Q1218"],
  ["tokyo", "Tokyo", "japan", "Tokyo", "Q1490"],
  ["toronto-gta", "Greater Toronto Area", "canada", "Greater_Toronto_Area"],
];

/* ------------------------------ registry build ----------------------------- */

function buildEntry({ slug, name, type, iso, containedIn, wikiPath, qid, alternateName }) {
  const entry = {
    slug,
    name,
    type,
    wikipedia: `${WIKI}${wikiPath}`,
  };
  if (iso) entry.iso = iso;
  if (containedIn) entry.containedIn = containedIn;
  if (qid) entry.wikidata = `${WIKIDATA}${qid}`;
  if (alternateName) entry.alternateName = alternateName;
  return entry;
}

export const GEO_LOCATIONS = Object.fromEntries([
  ...COUNTRIES.map(([slug, name, iso, wikiPath, qid, alternateName]) => [
    slug,
    buildEntry({ slug, name, type: "Country", iso, wikiPath, qid, alternateName }),
  ]),
  ...STATES.map(([slug, name, containedIn, wikiPath, qid]) => [
    slug,
    buildEntry({ slug, name, type: "State", containedIn, wikiPath, qid }),
  ]),
  ...INDIA_CITIES.map(([slug, name, containedIn, wikiPath, qid]) => [
    slug,
    buildEntry({ slug, name, type: "City", containedIn, wikiPath, qid }),
  ]),
  ...WORLD_CITIES.map(([slug, name, containedIn, wikiPath, qid]) => [
    slug,
    buildEntry({ slug, name, type: "City", containedIn, wikiPath, qid }),
  ]),
]);

/* --------------------------------- helpers -------------------------------- */

export function getGeoLocation(slug = "") {
  return GEO_LOCATIONS[String(slug).trim().toLowerCase()] || null;
}

export function getAllGeoLocations() {
  return Object.values(GEO_LOCATIONS);
}

export function getAllGeoSlugs() {
  return Object.keys(GEO_LOCATIONS);
}

export function getGeoCountries() {
  return getAllGeoLocations().filter((location) => location.type === "Country");
}

/**
 * Full containment chain for a location, self first:
 * bhopal → [Bhopal, Madhya Pradesh, India]
 */
export function getGeoChain(slug) {
  const chain = [];
  let current = getGeoLocation(slug);
  while (current) {
    chain.push(current);
    current = current.containedIn ? getGeoLocation(current.containedIn) : null;
  }
  return chain;
}

/** Direct children (states of a country, cities of a state/country). */
export function getGeoChildren(slug) {
  return getAllGeoLocations().filter((location) => location.containedIn === slug);
}

/** Locations sharing the same parent (for related-location internal links). */
export function getGeoSiblings(slug) {
  const location = getGeoLocation(slug);
  if (!location) return [];
  if (!location.containedIn) {
    return getGeoCountries().filter((entry) => entry.slug !== slug);
  }
  return getGeoChildren(location.containedIn).filter((entry) => entry.slug !== slug);
}
