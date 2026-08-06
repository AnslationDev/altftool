// Animal Hub categories — the module's taxonomy registry.
//
// Categories are structural data (they define routes, navigation and grouping),
// not animal content. Each entry is plain serialisable data: no imports, no
// functions, no JSX — safe to import from both server (metadata, sitemap) and
// client code. Adding a category here is the ONLY change needed for a new
// /animalhub/<slug> route to exist; the dynamic [category] segment derives
// everything from this array.

export const CATEGORIES = [
  {
    slug: "mammals",
    name: "Mammals",
    description:
      "Warm-blooded vertebrates that nurse their young — from big cats and great apes to whales, bats and rodents.",
    accent: "amber",
    seo: {
      title: "Mammals — Species Guides, Habitat & Behavior",
      description:
        "Explore mammal species profiles: habitat, diet, behavior, taxonomy and conservation status, researched and organized in one place.",
    },
  },
  {
    slug: "birds",
    name: "Birds",
    description:
      "Feathered, egg-laying vertebrates — raptors, songbirds, seabirds and flightless species from every continent.",
    accent: "sky",
    seo: {
      title: "Birds — Species Guides, Habitat & Behavior",
      description:
        "Explore bird species profiles: habitat, diet, migration, taxonomy and conservation status, researched and organized in one place.",
    },
  },
  {
    slug: "reptiles",
    name: "Reptiles",
    description:
      "Cold-blooded, scaled vertebrates — snakes, lizards, turtles and crocodilians ancient and modern.",
    accent: "emerald",
    seo: {
      title: "Reptiles — Species Guides, Habitat & Behavior",
      description:
        "Explore reptile species profiles: habitat, diet, behavior, taxonomy and conservation status, researched and organized in one place.",
    },
  },
  {
    slug: "fish",
    name: "Fish",
    description:
      "Gill-breathing aquatic vertebrates — from reef dwellers and river giants to deep-sea specialists.",
    accent: "cyan",
    seo: {
      title: "Fish — Species Guides, Habitat & Behavior",
      description:
        "Explore fish species profiles: habitat, diet, behavior, taxonomy and conservation status, researched and organized in one place.",
    },
  },
  {
    slug: "amphibians",
    name: "Amphibians",
    description:
      "Dual-life vertebrates that bridge water and land — frogs, toads, salamanders and caecilians.",
    accent: "lime",
    seo: {
      title: "Amphibians — Species Guides, Habitat & Behavior",
      description:
        "Explore amphibian species profiles: habitat, diet, life cycle, taxonomy and conservation status, researched and organized in one place.",
    },
  },
  {
    slug: "insects",
    name: "Insects",
    description:
      "Six-legged invertebrates — the most diverse animal group on Earth, from pollinators to predators.",
    accent: "orange",
    seo: {
      title: "Insects — Species Guides, Habitat & Behavior",
      description:
        "Explore insect species profiles: habitat, diet, life cycle, taxonomy and conservation status, researched and organized in one place.",
    },
  },
];

const BY_SLUG = new Map(CATEGORIES.map((category) => [category.slug, category]));

export function getCategoryDef(slug) {
  return BY_SLUG.get(slug) ?? null;
}
