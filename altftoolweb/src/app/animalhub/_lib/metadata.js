// Animal Hub metadata builders — the module's single bridge to the platform
// SEO helper (createPageMetadata: canonical, OpenGraph, Twitter, hreflang,
// robots). Route files call these from generateMetadata and never assemble
// metadata by hand. Data access goes through the service layer, keeping the
// backend-migration seam intact.
//
// Titles in animal/category data files exclude branding — the module layout's
// "%s | Animal Hub" template appends it. The hub page pins an absolute title
// so the template does not double it.

import { createPageMetadata } from "@/platform/seo/generateMetadata";
import { getAnimal, getCategory } from "./services";

export const ANIMALHUB_BASE = "/animalhub";

const HUB_TITLE = "Animal Hub — Animal Encyclopedia & Species Guides";
const HUB_DESCRIPTION =
  "A research-driven animal encyclopedia: species profiles with habitat, diet, behavior, taxonomy and conservation status across mammals, birds, reptiles, fish, amphibians and insects.";

export async function buildHubMetadata() {
  const metadata = await createPageMetadata({
    title: HUB_TITLE,
    description: HUB_DESCRIPTION,
    path: ANIMALHUB_BASE,
    keywords: ["animal encyclopedia", "animal facts", "species guides", "wildlife"],
    pageType: "animal-hub",
  });
  // Pin the absolute title so the layout's "%s | Animal Hub" template does
  // not produce "Animal Hub — … | Animal Hub" on the hub page itself.
  return { ...metadata, title: { absolute: HUB_TITLE } };
}

/**
 * Returns metadata for a category, or null when the slug is unknown — the
 * route's generateMetadata turns null into notFound(). Throwing there (not
 * in the page body) matters: generateMetadata runs before the loading.jsx
 * shell streams, so the response is a real HTTP 404 instead of a 200 stream
 * that dead-ends on a skeleton.
 */
export async function buildCategoryMetadata(categorySlug) {
  const category = await getCategory(categorySlug);
  const path = `${ANIMALHUB_BASE}/${categorySlug}`;

  if (!category) return null;

  return createPageMetadata({
    title: category.seo.title,
    description: category.seo.description,
    path,
    keywords: [category.name.toLowerCase(), "animal facts", "species guides"],
    pageType: "animal-hub",
  });
}

/**
 * Returns metadata for an animal, or null when unknown — see
 * buildCategoryMetadata for why the route (not this builder) calls
 * notFound(). An animal is only canonical under its own category: a valid
 * slug under the wrong category is treated as not found, matching the page
 * guard.
 */
export async function buildAnimalMetadata(categorySlug, animalSlug) {
  const animal = await getAnimal(animalSlug);
  const path = `${ANIMALHUB_BASE}/${categorySlug}/${animalSlug}`;

  if (!animal || animal.category !== categorySlug) return null;

  return createPageMetadata({
    title: animal.seo.title,
    description: animal.seo.description,
    path,
    image: animal.heroImage?.src,
    type: "article",
    keywords: [animal.name, animal.scientificName, `${animal.name} facts`].filter(Boolean),
    pageType: "animal-hub",
  });
}
