/**
 * Shared Leaflet/OpenStreetMap configuration + helpers for the Nearby Sale
 * Search feature — kept out of the component so no map setup logic gets
 * duplicated across future map views.
 */

// CARTO Voyager — a free, keyless tile style built on the same real OSM data,
// but with a clean light basemap + labeled roads that reads much closer to
// Google Maps' default look than the stock OSM tiles above. Attribution for
// both OSM (the data) and CARTO (the style) is required and always rendered.
export const GOOGLE_LIKE_TILE_URL = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
export const GOOGLE_LIKE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

export const DEFAULT_MAP_ZOOM = 13;
export const SELECTED_MAP_ZOOM = 16;

/**
 * Compute a Leaflet-compatible center point for a set of results, falling
 * back to the user's own location when there are no results yet.
 *
 * @param {{ lat: number, lng: number } | null} origin
 * @param {Array<{ lat: number, lng: number }>} results
 * @returns {[number, number]}
 */
export function getMapCenter(origin, results = []) {
  const first = results.find((r) => Number.isFinite(r.lat) && Number.isFinite(r.lng));
  if (first) return [first.lat, first.lng];
  if (origin && Number.isFinite(origin.lat) && Number.isFinite(origin.lng)) {
    return [origin.lat, origin.lng];
  }
  return [20.5937, 78.9629]; // geographic center of India — sane default
}

/**
 * Build the best available "open this place" link for a result: prefer the
 * business's own website; fall back to opening the real Google Maps listing
 * for its coordinates (free deep link — no API key involved) when there's
 * no website.
 *
 * @param {{ website?: string|null, lat: number, lng: number, name?: string }} result
 * @returns {string}
 */
export function getResultExternalLink(result) {
  if (result?.website) return result.website;
  if (Number.isFinite(result?.lat) && Number.isFinite(result?.lng)) {
    return `https://www.google.com/maps/search/?api=1&query=${result.lat},${result.lng}`;
  }
  return "#";
}

/**
 * Build a real, working turn-by-turn directions link (opens the actual
 * Google Maps app/site with a live route) from an origin to a destination.
 * This is a plain deep link — no Google Maps API key needed — which is why
 * it actually renders a real-time route, unlike a bare OSM page with no
 * origin set.
 *
 * @param {{ lat: number, lng: number } | null} origin
 * @param {{ lat: number, lng: number }} destination
 * @returns {string}
 */
export function getDirectionsUrl(origin, destination) {
  if (!destination || !Number.isFinite(destination.lat) || !Number.isFinite(destination.lng)) return "#";
  const destParam = `${destination.lat},${destination.lng}`;
  const originParam = origin && Number.isFinite(origin.lat) && Number.isFinite(origin.lng)
    ? `&origin=${origin.lat},${origin.lng}`
    : "";
  return `https://www.google.com/maps/dir/?api=1${originParam}&destination=${destParam}&travelmode=driving`;
}
