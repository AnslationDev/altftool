// Animal registry — the single source of truth for Animal Hub content.
//
// Every animal is ONE data file inside its category folder (mammals/lion.js,
// reptiles/king-cobra.js, …), registered with one import line in that
// category's index.js. This aggregator only composes the category registries;
// it never changes when animals are added.
//
// The record contract, the card/search projections and the validation rules
// all live in _lib/animalModel.js — read that before writing a data file.
//
// Scale note: the registries are keyed Maps, so slug lookups stay O(1) as the
// catalogue grows. What does grow linearly is the bundle, since every record
// is imported statically — which is exactly the pressure the async service
// layer is designed to relieve when this moves to Firestore.

import { CATEGORIES } from "../categories";
import { assertAnimalRegistry } from "../../_lib/animalModel";
import { MAMMALS } from "./mammals";
import { BIRDS } from "./birds";
import { REPTILES } from "./reptiles";
import { FISH } from "./fish";
import { AMPHIBIANS } from "./amphibians";
import { INSECTS } from "./insects";

// Category slug → registry. Key order mirrors ../categories.js.
const REGISTRIES = new Map([
  ["mammals", MAMMALS],
  ["birds", BIRDS],
  ["reptiles", REPTILES],
  ["fish", FISH],
  ["amphibians", AMPHIBIANS],
  ["insects", INSECTS],
]);

// Contract gate: catches missing fields, malformed sections, unknown or
// mismatched categories, unknown IUCN codes, duplicate fact keys, dangling
// highlight keys and duplicate slugs at import time, reporting every problem
// at once. Runs before ANIMALS is derived, and takes the registry map so each
// record is checked against the folder it is registered in.
assertAnimalRegistry(REGISTRIES, {
  knownCategories: CATEGORIES.map((category) => category.slug),
});

export const ANIMALS = [...REGISTRIES.values()].flat();

const BY_SLUG = new Map(ANIMALS.map((animal) => [animal.slug, animal]));

export function getAnimalRecord(slug) {
  return BY_SLUG.get(slug) ?? null;
}

export function getAnimalsForCategory(categorySlug) {
  return REGISTRIES.get(categorySlug) ?? [];
}

export function countAnimalsForCategory(categorySlug) {
  return REGISTRIES.get(categorySlug)?.length ?? 0;
}
