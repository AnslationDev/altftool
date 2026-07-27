/**
 * Great-circle distance helpers — single source of truth so nothing
 * (API routes, components) reimplements Haversine separately.
 */

const EARTH_RADIUS_KM = 6371;

/**
 * Distance in kilometres between two lat/lng points (Haversine formula).
 * @param {number} lat1
 * @param {number} lng1
 * @param {number} lat2
 * @param {number} lng2n
 * @returns {number} kilometres
 */
export function haversineKm(lat1, lng1, lat2, lng2) {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Round to 1 decimal place — matches the display precision used across the app. */
export function roundKm(km) {
  return Math.round(km * 10) / 10;
}

/**
 * Annotate a list of items (each with `lat`/`lng` or `latitude`/`longitude`)
 * with a `distance` (km, 1dp) from a reference point, then sort nearest-first.
 *
 * @param {Array<object>} items
 * @param {{ lat: number, lng: number }} origin
 * @returns {Array<object>} new array, sorted by distance ascending
 */
export function sortByDistance(items, origin) {
  if (!origin || !Number.isFinite(origin.lat) || !Number.isFinite(origin.lng)) {
    return [...items];
  }

  return items
    .map((item) => {
      const lat = item.lat ?? item.latitude;
      const lng = item.lng ?? item.longitude;
      const distance =
        Number.isFinite(lat) && Number.isFinite(lng)
          ? roundKm(haversineKm(origin.lat, origin.lng, lat, lng))
          : null;
      return { ...item, distance };
    })
    .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
}
