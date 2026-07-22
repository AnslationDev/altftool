// Insurance registry — the single source of truth for the Insurance module's
// standalone vertical pages (the Auto Insurance lander is a separate inventory
// import and is listed only in _data/collections.js).
//
// Each vertical is one data file in this folder. Import it below and add it to
// INSURANCE (order = display order in footer and cross-links). The route under
// src/app/business-ops/insurance/<slug>/ and the collections.js listing derive from
// this array, so a new insurance type is: one data file + one line here.

import homeInsurance from "./home-insurance";
import lifeInsurance from "./life-insurance";
import medicare from "./medicare";
import healthInsurance from "./health-insurance";
import finalExpenseInsurance from "./final-expense-insurance";
import rentersInsurance from "./renters-insurance";
import petInsurance from "./pet-insurance";
import motorcycleInsurance from "./motorcycle-insurance";
import commercialInsurance from "./commercial-insurance";
import smallBusinessInsurance from "./small-business-insurance";
import travelInsurance from "./travel-insurance";

export const INSURANCE = [
  homeInsurance,
  lifeInsurance,
  medicare,
  healthInsurance,
  finalExpenseInsurance,
  rentersInsurance,
  petInsurance,
  motorcycleInsurance,
  commercialInsurance,
  smallBusinessInsurance,
  travelInsurance,
];

const BY_SLUG = new Map(INSURANCE.map((item) => [item.slug, item]));

export function getInsurance(slug) {
  return BY_SLUG.get(slug) ?? null;
}
