// Animal Hub structured data — page-scoped JSON-LD built on the platform's
// schema factories.
//
// The site-wide Organization and WebSite nodes are emitted once in the root
// layout, so these builders only add entities that belong to the page itself.
// Every factory returns null when its required data is missing, so the arrays
// below can be passed straight to <JsonLd> without guards.
//
// The FAQ markup is generated from the same `faqs` array the page renders,
// and the FAQ answers stay in the DOM when collapsed — so the structured data
// is always backed by content a visitor can actually see.

import {
  createArticleJsonLd,
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createFaqJsonLd,
  createItemListJsonLd,
} from "@/platform/seo/generateMetadata";

const BASE = "/animalhub";

export function buildHubJsonLd({ categories = [] }) {
  return [
    createCollectionPageJsonLd({
      path: BASE,
      name: "Animal Hub",
      description:
        "A research-driven animal encyclopedia: species profiles with habitat, diet, behaviour, taxonomy and conservation status.",
    }),
    createBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Animal Hub", path: BASE },
    ]),
    createItemListJsonLd({
      path: BASE,
      name: "Animal groups",
      items: categories.map((category) => ({
        name: category.name,
        path: `${BASE}/${category.slug}`,
      })),
    }),
  ];
}

export function buildCategoryJsonLd({ category, animals = [] }) {
  const path = `${BASE}/${category.slug}`;
  return [
    createCollectionPageJsonLd({
      path,
      name: category.name,
      description: category.description,
    }),
    createBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Animal Hub", path: BASE },
      { name: category.name, path },
    ]),
    createItemListJsonLd({
      path,
      name: `${category.name} species`,
      items: animals.map((animal) => ({ name: animal.name, path: animal.href })),
    }),
  ];
}

export function buildAnimalJsonLd({ animal, categoryName, related = [] }) {
  const path = `${BASE}/${animal.category}/${animal.slug}`;
  return [
    createArticleJsonLd({
      path,
      headline: animal.seo?.title || animal.name,
      description: animal.seo?.description || animal.summary,
      image: animal.heroImage?.src,
      datePublished: animal.updatedAt,
      dateModified: animal.updatedAt,
      type: "Article",
    }),
    createFaqJsonLd({
      path,
      questions: (animal.faqs || []).map((faq) => ({
        question: faq.q,
        answer: faq.a,
      })),
    }),
    createBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Animal Hub", path: BASE },
      { name: categoryName || animal.category, path: `${BASE}/${animal.category}` },
      { name: animal.name, path },
    ]),
    related.length
      ? createItemListJsonLd({
          path,
          name: `Animals related to the ${animal.name.toLowerCase()}`,
          items: related.map((entry) => ({ name: entry.name, path: entry.href })),
        })
      : null,
  ];
}
