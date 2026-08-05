// Display names for the ISO codes actually referenced in data/festivals.js.
// Kept as a small static map (rather than a live REST Countries call) so
// search/filter UI can render instantly without a network round trip;
// lib/upstream.js#fetchCountryInfo supplies the richer live facts shown on
// country list/detail pages.

export const COUNTRY_NAMES = {
  IN: "India",
  NP: "Nepal",
  BD: "Bangladesh",
  SA: "Saudi Arabia",
  ID: "Indonesia",
  PK: "Pakistan",
  EG: "Egypt",
  TR: "Turkey",
  IR: "Iran",
  IQ: "Iraq",
  AF: "Afghanistan",
  AZ: "Azerbaijan",
  US: "United States",
  GB: "United Kingdom",
  DE: "Germany",
  FR: "France",
  IT: "Italy",
  ES: "Spain",
  MX: "Mexico",
  BR: "Brazil",
  JP: "Japan",
  CN: "China",
  TW: "Taiwan",
  HK: "Hong Kong",
  SG: "Singapore",
  MY: "Malaysia",
  VN: "Vietnam",
  KR: "South Korea",
  TH: "Thailand",
  IL: "Israel",
  AU: "Australia",
  CA: "Canada",
  GR: "Greece",
  PL: "Poland",
  LK: "Sri Lanka",
  PH: "Philippines",
};

export function getCountryName(code) {
  return COUNTRY_NAMES[(code || "").toUpperCase()] || code;
}
