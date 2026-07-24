// Registry of every HousingNeeds vertical.
//
// Order here drives nav order, footer order and the hub grid.
import roofing from "./roofing";
import siding from "./siding";
import gutters from "./gutters";
import windows from "./windows";
import solar from "./solar";
import plumbing from "./plumbing";
import interiors from "./interiors";
import pestcontrol from "./pestcontrol";
import landscaping from "./landscaping";
import cleaning from "./cleaning";
import electrical from "./electrical";
import flooring from "./flooring";
import garageDriveway from "./garage-driveway";
import restoration from "./restoration";

export const VERTICALS = [
  roofing,
  siding,
  gutters,
  windows,
  solar,
  plumbing,
  interiors,
  pestcontrol,
  landscaping,
  cleaning,
  electrical,
  flooring,
  garageDriveway,
  restoration,
];

export const VERTICAL_MAP = Object.fromEntries(
  VERTICALS.map((vertical) => [vertical.slug, vertical]),
);

export const VERTICAL_SLUGS = VERTICALS.map((vertical) => vertical.slug);

export function getVertical(slug) {
  return VERTICAL_MAP[slug] ?? null;
}
