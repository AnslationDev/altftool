// Approximate country centroids [lat, lng] for the ISO codes used in
// data/festivals.js. Lets the location map render immediately without
// depending on the REST Countries API (which now requires a registered key
// — see lib/upstream.js#fetchCountryInfo) purely for coordinates; that API
// call is still used for the richer facts (capital, currency, languages).

export const COUNTRY_CENTROIDS = {
  IN: [22.0, 79.0],
  NP: [28.2, 84.1],
  BD: [23.7, 90.4],
  SA: [24.0, 45.0],
  ID: [-2.5, 118.0],
  PK: [30.4, 69.3],
  EG: [26.8, 30.8],
  TR: [39.0, 35.0],
  IR: [32.4, 53.7],
  IQ: [33.2, 43.7],
  AF: [33.9, 67.7],
  AZ: [40.1, 47.6],
  US: [39.8, -98.6],
  GB: [54.0, -2.0],
  DE: [51.2, 10.5],
  FR: [46.6, 2.2],
  IT: [42.8, 12.6],
  ES: [40.5, -3.7],
  MX: [23.6, -102.5],
  BR: [-14.2, -51.9],
  JP: [36.2, 138.3],
  CN: [35.9, 104.2],
  TW: [23.7, 121.0],
  HK: [22.3, 114.2],
  SG: [1.35, 103.8],
  MY: [4.2, 101.9],
  VN: [14.1, 108.3],
  KR: [36.5, 127.8],
  TH: [15.9, 100.99],
  IL: [31.0, 34.8],
  AU: [-25.3, 133.8],
  CA: [56.1, -106.3],
  GR: [39.1, 21.8],
  PL: [51.9, 19.1],
  LK: [7.9, 80.8],
  PH: [12.9, 121.8],
};

export function getCountryCentroid(code) {
  return COUNTRY_CENTROIDS[(code || "").toUpperCase()] || null;
}
