/**
 * City table for the AQI Today national board.
 *
 * Why this file exists: the repo's own `geoLocations.js` registry carries no
 * latitude/longitude, and the air-quality API is queried by coordinate. Every
 * pair below is the conventional city-centre coordinate for that city, rounded
 * to 4 decimal places (~11 m), and each city hosts at least one CPCB Continuous
 * Ambient Air Quality Monitoring Station (CAAQMS) under the National Air
 * Quality Monitoring Programme, so the modelled figure has a real-world
 * counterpart a reader can go and check on the CPCB bulletin.
 *
 * IMPORTANT: the coordinate is the city centre, NOT the location of any
 * particular CPCB station. Nothing here is a station identifier.
 *
 * `zone` is used only for grouping in the UI.
 */

/** Grouping labels used by the board's zone filter. */
export const ZONES = ["North", "East", "West", "South", "Central"];

/** ~33 Indian cities, city-centre coordinates, WGS84 decimal degrees. */
export const CITIES = [
  { id: "delhi", name: "Delhi", state: "Delhi (NCT)", zone: "North", lat: 28.6139, lon: 77.209 },
  { id: "ghaziabad", name: "Ghaziabad", state: "Uttar Pradesh", zone: "North", lat: 28.6692, lon: 77.4538 },
  { id: "noida", name: "Noida", state: "Uttar Pradesh", zone: "North", lat: 28.5355, lon: 77.391 },
  { id: "gurugram", name: "Gurugram", state: "Haryana", zone: "North", lat: 28.4595, lon: 77.0266 },
  { id: "faridabad", name: "Faridabad", state: "Haryana", zone: "North", lat: 28.4089, lon: 77.3178 },
  { id: "chandigarh", name: "Chandigarh", state: "Chandigarh (UT)", zone: "North", lat: 30.7333, lon: 76.7794 },
  { id: "ludhiana", name: "Ludhiana", state: "Punjab", zone: "North", lat: 30.901, lon: 75.8573 },
  { id: "amritsar", name: "Amritsar", state: "Punjab", zone: "North", lat: 31.634, lon: 74.8723 },
  { id: "jaipur", name: "Jaipur", state: "Rajasthan", zone: "North", lat: 26.9124, lon: 75.7873 },
  { id: "jodhpur", name: "Jodhpur", state: "Rajasthan", zone: "North", lat: 26.2389, lon: 73.0243 },
  { id: "dehradun", name: "Dehradun", state: "Uttarakhand", zone: "North", lat: 30.3165, lon: 78.0322 },
  { id: "srinagar", name: "Srinagar", state: "Jammu & Kashmir", zone: "North", lat: 34.0837, lon: 74.7973 },
  { id: "lucknow", name: "Lucknow", state: "Uttar Pradesh", zone: "North", lat: 26.8467, lon: 80.9462 },
  { id: "kanpur", name: "Kanpur", state: "Uttar Pradesh", zone: "North", lat: 26.4499, lon: 80.3319 },
  { id: "varanasi", name: "Varanasi", state: "Uttar Pradesh", zone: "North", lat: 25.3176, lon: 82.9739 },
  { id: "patna", name: "Patna", state: "Bihar", zone: "East", lat: 25.5941, lon: 85.1376 },
  { id: "muzaffarpur", name: "Muzaffarpur", state: "Bihar", zone: "East", lat: 26.1197, lon: 85.391 },
  { id: "kolkata", name: "Kolkata", state: "West Bengal", zone: "East", lat: 22.5726, lon: 88.3639 },
  { id: "howrah", name: "Howrah", state: "West Bengal", zone: "East", lat: 22.5958, lon: 88.2636 },
  { id: "guwahati", name: "Guwahati", state: "Assam", zone: "East", lat: 26.1445, lon: 91.7362 },
  { id: "bhubaneswar", name: "Bhubaneswar", state: "Odisha", zone: "East", lat: 20.2961, lon: 85.8245 },
  { id: "ranchi", name: "Ranchi", state: "Jharkhand", zone: "East", lat: 23.3441, lon: 85.3096 },
  { id: "raipur", name: "Raipur", state: "Chhattisgarh", zone: "Central", lat: 21.2514, lon: 81.6296 },
  { id: "bhopal", name: "Bhopal", state: "Madhya Pradesh", zone: "Central", lat: 23.2599, lon: 77.4126 },
  { id: "indore", name: "Indore", state: "Madhya Pradesh", zone: "Central", lat: 22.7196, lon: 75.8577 },
  { id: "ahmedabad", name: "Ahmedabad", state: "Gujarat", zone: "West", lat: 23.0225, lon: 72.5714 },
  { id: "surat", name: "Surat", state: "Gujarat", zone: "West", lat: 21.1702, lon: 72.8311 },
  { id: "mumbai", name: "Mumbai", state: "Maharashtra", zone: "West", lat: 19.076, lon: 72.8777 },
  { id: "pune", name: "Pune", state: "Maharashtra", zone: "West", lat: 18.5204, lon: 73.8567 },
  { id: "nagpur", name: "Nagpur", state: "Maharashtra", zone: "West", lat: 21.1458, lon: 79.0882 },
  { id: "hyderabad", name: "Hyderabad", state: "Telangana", zone: "South", lat: 17.385, lon: 78.4867 },
  { id: "visakhapatnam", name: "Visakhapatnam", state: "Andhra Pradesh", zone: "South", lat: 17.6868, lon: 83.2185 },
  { id: "bengaluru", name: "Bengaluru", state: "Karnataka", zone: "South", lat: 12.9716, lon: 77.5946 },
  { id: "chennai", name: "Chennai", state: "Tamil Nadu", zone: "South", lat: 13.0827, lon: 80.2707 },
  { id: "coimbatore", name: "Coimbatore", state: "Tamil Nadu", zone: "South", lat: 11.0168, lon: 76.9558 },
  { id: "kochi", name: "Kochi", state: "Kerala", zone: "South", lat: 9.9312, lon: 76.2673 },
];

/** Lookup by city id. */
export const CITIES_BY_ID = new Map(CITIES.map((city) => [city.id, city]));
