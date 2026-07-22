import assert from "node:assert/strict";
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  EXPERIENCE_CATALOG,
  EXPERIENCE_GROUPS,
} from "@altftool/core/experiences";
import { PRODUCT_SUITE_CATALOG } from "@altftool/core/product-suites";
import { CANONICAL_CATEGORIES } from "../altftoolweb/src/platform/registry/categoryTaxonomy.js";
import {
  FOOTER_ROUTE_GROUPS,
  LEGAL_ROUTE_LINKS,
  PUBLIC_NAV_ITEMS,
  SITE_ROUTES,
  TOOL_CATEGORY_ROUTE_OPTIONS,
} from "../altftoolweb/src/platform/navigation/siteRoutes.js";

const APP_DIR = path.resolve("altftoolweb/src/app");
const PAGE_EXTENSIONS = ["js", "jsx", "ts", "tsx"];

function hasStaticPage(route) {
  const routeDirectory = path.join(APP_DIR, ...route.replace(/^\/+/, "").split("/"));
  return PAGE_EXTENSIONS.some((extension) =>
    existsSync(path.join(routeDirectory, `page.${extension}`)),
  );
}

function hasRoutablePage(route) {
  const segments = route.replace(/^\/+/, "").split("/").filter(Boolean);
  let candidateDirectories = [APP_DIR];

  for (const segment of segments) {
    candidateDirectories = candidateDirectories.flatMap((directory) =>
      readdirSync(directory, { withFileTypes: true })
        .filter(
          (entry) =>
            entry.isDirectory() &&
            (entry.name === segment || /^\[.*\]$/.test(entry.name)),
        )
        .map((entry) => path.join(directory, entry.name)),
    );
  }

  return candidateDirectories.some((directory) =>
    PAGE_EXTENSIONS.some((extension) =>
      existsSync(path.join(directory, `page.${extension}`)),
    ),
  );
}

function collectNavigationHrefs() {
  return new Set([
    ...PUBLIC_NAV_ITEMS.flatMap((item) => [
      item.href,
      ...(item.options || []).map((option) => option.href),
    ]),
    ...FOOTER_ROUTE_GROUPS.flatMap((group) => group.links.map((link) => link.href)),
    ...LEGAL_ROUTE_LINKS.map((link) => link.href),
  ]);
}

test("experience catalog has unique, valid, routeable entries", () => {
  assert.equal(EXPERIENCE_CATALOG.length, 24);
  assert.equal(
    new Set(EXPERIENCE_CATALOG.map((experience) => experience.slug)).size,
    EXPERIENCE_CATALOG.length,
  );
  assert.equal(
    new Set(EXPERIENCE_CATALOG.map((experience) => experience.href)).size,
    EXPERIENCE_CATALOG.length,
  );

  for (const experience of EXPERIENCE_CATALOG) {
    assert.ok(EXPERIENCE_GROUPS[experience.group], `${experience.slug} has an unknown group`);
    assert.ok(hasStaticPage(experience.href), `${experience.href} is missing a static page route`);
  }
});

test("header exposes every product suite and Labs experience", () => {
  const productsMenu = PUBLIC_NAV_ITEMS.find((item) => item.label === "Products");
  const labsMenu = PUBLIC_NAV_ITEMS.find((item) => item.label === "Labs");
  assert.ok(productsMenu, "Products menu is missing");
  assert.ok(labsMenu, "Labs menu is missing");

  const productHrefs = new Set(productsMenu.options.map((option) => option.href));
  const labsHrefs = new Set(labsMenu.options.map((option) => option.href));

  for (const suite of PRODUCT_SUITE_CATALOG) {
    assert.ok(productHrefs.has(`/products/${suite.slug}`), `${suite.slug} is missing from Products`);
  }

  for (const experience of EXPERIENCE_CATALOG) {
    assert.ok(labsHrefs.has(experience.href), `${experience.slug} is missing from Labs`);
  }
});

test("Tools menu exposes every canonical tool category", () => {
  const toolsMenu = PUBLIC_NAV_ITEMS.find((item) => item.label === "Tools");
  assert.ok(toolsMenu, "Tools menu is missing");
  assert.equal(TOOL_CATEGORY_ROUTE_OPTIONS.length, CANONICAL_CATEGORIES.length);

  const toolHrefs = new Set(toolsMenu.options.map((option) => option.href));
  for (const category of CANONICAL_CATEGORIES) {
    assert.ok(
      toolHrefs.has(`/tools/${category.slug}`),
      `${category.label} is missing from Tools`,
    );
  }
});

test("navigation groups stay routeable, unique, and scannable", () => {
  for (const item of PUBLIC_NAV_ITEMS) {
    assert.ok(item.href, `${item.label} needs a working top-level route`);
    assert.ok(hasRoutablePage(item.href), `${item.href} has no matching page`);

    const groups = new Map();
    const hrefs = new Set();
    for (const option of item.options || []) {
      assert.ok(option.group, `${item.label} > ${option.label} is not grouped`);
      assert.ok(hasRoutablePage(option.href), `${option.href} has no matching page`);
      assert.ok(!hrefs.has(option.href), `${item.label} repeats ${option.href}`);
      hrefs.add(option.href);
      groups.set(option.group, (groups.get(option.group) || 0) + 1);
    }

    for (const [group, count] of groups) {
      assert.ok(count <= 12, `${item.label} > ${group} is too dense (${count} links)`);
    }
  }
});

test("primary public hubs are discoverable from global navigation", () => {
  const navigationHrefs = collectNavigationHrefs();
  const primaryRoutes = [
    SITE_ROUTES.products,
    SITE_ROUTES.signals,
    SITE_ROUTES.tools,
    SITE_ROUTES.apps,
    SITE_ROUTES.calculators,
    SITE_ROUTES.imageTools,
    SITE_ROUTES.pdfTools,
    SITE_ROUTES.extensions,
    SITE_ROUTES.desktop,
    SITE_ROUTES.promptStudio,
    SITE_ROUTES.automationLibrary,
    SITE_ROUTES.businessOps,
    SITE_ROUTES.homeServices,
    SITE_ROUTES.housingNeeds,
    SITE_ROUTES.tripFindBox,
    SITE_ROUTES.altfDeals,
    SITE_ROUTES.exclusiveDeals,
    SITE_ROUTES.buySmart,
    SITE_ROUTES.brandRatings,
    SITE_ROUTES.academy,
    SITE_ROUTES.blogs,
    SITE_ROUTES.news,
    SITE_ROUTES.locations,
    SITE_ROUTES.labs,
    SITE_ROUTES.games,
    SITE_ROUTES.support,
    SITE_ROUTES.siteMap,
  ];

  for (const route of primaryRoutes) {
    assert.ok(navigationHrefs.has(route.href), `${route.href} is missing from navigation`);
  }
});
