import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import test from "node:test";

import {
  DOCS_AUTOMATION_LINKS,
  DOCS_BUSINESS_LINKS,
  DOCS_FAQS,
  DOCS_QUICK_LINKS,
  DOCS_REQUIRED_SECTION_IDS,
  DOCS_SECTIONS,
} from "../altftoolweb/src/app/docs/docsContent.js";
import {
  FOOTER_ROUTE_GROUPS,
  PUBLIC_NAV_ITEMS,
  SITE_ROUTES,
} from "../altftoolweb/src/platform/navigation/siteRoutes.js";

function navigationPaths() {
  return new Set([
    ...PUBLIC_NAV_ITEMS.flatMap((item) => [
      item.href,
      ...(item.options || []).map((option) => option.href),
    ]),
    ...FOOTER_ROUTE_GROUPS.flatMap((group) =>
      group.links.map((link) => link.href),
    ),
  ]);
}

test("public documentation has a stable, complete information architecture", () => {
  const sectionIds = DOCS_SECTIONS.map((section) => section.id);

  assert.deepEqual(sectionIds, DOCS_REQUIRED_SECTION_IDS);
  assert.equal(new Set(sectionIds).size, sectionIds.length);

  for (const section of DOCS_SECTIONS) {
    assert.ok(section.label, `${section.id} needs a label`);
    assert.ok(section.description, `${section.id} needs a description`);
  }
});

test("public documentation links stay internal and unique", () => {
  for (const links of [
    DOCS_QUICK_LINKS,
    DOCS_AUTOMATION_LINKS,
    DOCS_BUSINESS_LINKS,
  ]) {
    const paths = links.map((link) => link.href);
    assert.equal(new Set(paths).size, paths.length);

    for (const link of links) {
      assert.ok(link.title, `${link.href} needs a title`);
      assert.ok(link.description, `${link.href} needs a description`);
      assert.match(
        link.href,
        /^\/(?!\/)/,
        `${link.href} must be an internal path`,
      );
    }
  }
});

test("documentation is public, routeable, and globally discoverable", () => {
  assert.equal(SITE_ROUTES.docs.href, "/docs");
  assert.ok(existsSync("altftoolweb/src/app/docs/page.jsx"));
  assert.ok(navigationPaths().has(SITE_ROUTES.docs.href));
});

test("documentation FAQ is useful and eligible for structured data", () => {
  assert.ok(DOCS_FAQS.length >= 6);
  assert.equal(
    new Set(DOCS_FAQS.map((item) => item.question)).size,
    DOCS_FAQS.length,
  );

  for (const item of DOCS_FAQS) {
    assert.ok(
      item.question.endsWith("?"),
      `${item.question} must be a question`,
    );
    assert.ok(
      item.answer.length >= 80,
      `${item.question} needs a useful answer`,
    );
  }
});
