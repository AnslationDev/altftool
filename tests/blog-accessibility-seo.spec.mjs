import { expect, test } from "@playwright/test";
import { createPageQualityGate } from "./helpers/pageQuality.mjs";

const webUrl = process.env.ALTFT_WEB_URL || "http://localhost:3002";
const blogSlug = "age-calculator-guide";
const blogTitle = "How to Use an Age Calculator Accurately";

function schemaTypeList(item = {}) {
  const type = item?.["@type"];
  return Array.isArray(type) ? type : [type].filter(Boolean);
}

function flattenJsonLd(value) {
  const items = [];

  const visit = (item) => {
    if (!item) return;
    if (Array.isArray(item)) {
      item.forEach(visit);
      return;
    }
    if (typeof item !== "object") return;

    items.push(item);
    if (item["@graph"]) visit(item["@graph"]);
  };

  visit(value);
  return items;
}

function findSchema(schemas, type) {
  return schemas.find((item) => schemaTypeList(item).includes(type));
}

async function openPublicPage(page, route) {
  const response = await page.goto(`${webUrl}${route}`, {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
  expect(response?.ok(), `${route} response`).toBeTruthy();
  await page.waitForLoadState("networkidle", { timeout: 8_000 }).catch(() => {});
}

async function readJsonLd(page) {
  const rawSchemas = await page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((scripts) => scripts.map((script) => script.textContent || ""));

  return rawSchemas.flatMap((schema) => {
    try {
      return flattenJsonLd(JSON.parse(schema));
    } catch {
      return [];
    }
  });
}

async function expectCanonicalPath(page, path) {
  const href = await page.locator('link[rel="canonical"]').getAttribute("href");
  expect(href, "canonical href").toBeTruthy();
  expect(new URL(href, webUrl).pathname).toBe(path);
}

async function expectNoDuplicateIds(page) {
  const duplicates = await page.evaluate(() => {
    const counts = new Map();
    document.querySelectorAll("[id]").forEach((element) => {
      counts.set(element.id, (counts.get(element.id) || 0) + 1);
    });
    return [...counts.entries()].filter(([, count]) => count > 1);
  });

  expect(duplicates, "duplicate DOM ids").toEqual([]);
}

async function expectImagesHaveAlt(page) {
  const missingAlt = await page.locator("img").evaluateAll((images) =>
    images
      .filter((image) => image.offsetParent !== null)
      .filter((image) => !image.hasAttribute("alt"))
      .map((image) => image.currentSrc || image.getAttribute("src") || image.outerHTML.slice(0, 120)),
  );

  expect(missingAlt, "visible images without an alt attribute").toEqual([]);
}

async function expectButtonsHaveNames(page) {
  const unlabeled = await page.locator("button").evaluateAll((buttons) =>
    buttons
      .filter((button) => button.offsetParent !== null)
      .filter((button) => {
        // `innerText` can be empty for controls inside content-visibility:auto
        // before Chromium paints the deferred subtree. Descendant text still
        // contributes to the accessible name, so audit the DOM text instead.
        const text = (button.textContent || "").replace(/\s+/g, " ").trim();
        const ariaLabel = button.getAttribute("aria-label") || "";
        const labelledBy = button.getAttribute("aria-labelledby") || "";
        const title = button.getAttribute("title") || "";
        return !text && !ariaLabel.trim() && !labelledBy.trim() && !title.trim();
      })
      .map((button) => button.outerHTML.slice(0, 180)),
  );

  expect(unlabeled, "visible buttons without accessible names").toEqual([]);
}

async function expectTrackedInternalLinks(page, currentSlug) {
  const trackedLinks = page.locator("[data-blog-internal-link]");

  await expect.poll(() => trackedLinks.count()).toBeGreaterThanOrEqual(4);

  const audit = await trackedLinks.evaluateAll((links, slug) => {
    const problems = [];
    const kinds = new Set();

    links.forEach((link) => {
      const kind = link.getAttribute("data-blog-internal-link") || "";
      const href = link.getAttribute("href") || "";
      if (kind) kinds.add(kind);
      if (!href) {
        problems.push({ kind, href, reason: "missing href" });
        return;
      }

      const url = new URL(href, window.location.origin);
      if (url.origin !== window.location.origin) {
        problems.push({ kind, href, reason: "external href" });
      }
      if (url.pathname === `/blogs/${slug}`) {
        problems.push({ kind, href, reason: "self link" });
      }
    });

    return {
      kinds: [...kinds],
      problems,
    };
  }, currentSlug);

  expect(audit.problems, "tracked blog internal link issues").toEqual([]);
  expect(audit.kinds).toEqual(expect.arrayContaining(["category"]));
  expect(
    audit.kinds.some((kind) => ["related-post", "read-next", "recommended-next"].includes(kind)),
    `tracked internal link kinds: ${audit.kinds.join(", ")}`,
  ).toBeTruthy();
}

async function expectSkipLinkWorks(page) {
  const skipLink = page.getByRole("link", { name: "Skip to main content" });

  await page.keyboard.press("Tab");
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeVisible();
  expect(new URL(page.url()).hash).toBe("#main-content");
}

function expectUniqueSchemaIds(schemas) {
  const ids = schemas.map((schema) => schema?.["@id"]).filter(Boolean);
  expect(new Set(ids).size, `schema ids: ${ids.join(", ")}`).toBe(ids.length);
}

test.describe("blog accessibility and SEO schema", () => {
  test.describe.configure({ timeout: 180_000 });

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        "COOKIE_CONSENT_V1",
        JSON.stringify({
          necessary: true,
          analytics: false,
          marketing: false,
          preferences: false,
        }),
      );
      localStorage.setItem(
        "NEWSLETTER_SUBSCRIBE_V1",
        JSON.stringify({ status: "dismissed", at: Date.now() }),
      );
    });
  });

  test("blog index exposes keyboard, landmark, and collection metadata basics", async ({ page }) => {
    const quality = createPageQualityGate(page);

    await openPublicPage(page, "/blogs");

    await expectSkipLinkWorks(page);
    await expect(page.locator('main[aria-labelledby="blog-index-title"]')).toBeVisible();
    await expect(page.locator("#blog-index-title")).toHaveText("AltFTool Blog");
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByRole("textbox", { name: "Search blog articles" })).toBeVisible();
    const sortGroup = page.getByRole("tablist", { name: "Sort articles" });
    await expect(sortGroup).toBeVisible();
    await expect(sortGroup.getByRole("tab", { name: "Latest" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(page.getByRole("button", { name: /All Categories/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(page.locator("#blog-explorer button[aria-pressed]").first()).toBeVisible();

    await expectNoDuplicateIds(page);
    await expectImagesHaveAlt(page);
    await expectButtonsHaveNames(page);
    await expectCanonicalPath(page, "/blogs");

    const schemas = await readJsonLd(page);
    expectUniqueSchemaIds(schemas);
    const collection = findSchema(schemas, "CollectionPage");
    expect(collection?.url).toContain("/blogs");
    expect(collection?.inLanguage).toBe("en");
    expect(collection?.isPartOf?.["@id"]).toContain("#website");

    await quality.expectClean("blog index a11y seo");
  });

  test("blog detail exposes accessible reader controls and rich article schema", async ({ page }) => {
    await openPublicPage(page, `/blogs/${blogSlug}`);
    const quality = createPageQualityGate(page);

    await expect(page).toHaveTitle(new RegExp(blogTitle, "i"));
    await expect(page.locator('main[aria-labelledby="blog-article-title"]')).toBeVisible();
    await expect(page.locator('article#article-body[aria-labelledby="blog-article-title"]')).toBeVisible();
    await expect(page.locator("#blog-article-title")).toHaveText(blogTitle);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Article reading flow" })).toBeVisible();

    const likeButton = page.getByRole("button", { name: /Like this guide/i });
    await expect(likeButton).toHaveAttribute("aria-pressed", "false");
    const commentsButton = page.getByRole("button", { name: /Show comments/i });
    await expect(commentsButton).toHaveAttribute("aria-controls", "comments");
    await expect(commentsButton).toHaveAttribute("aria-expanded", "false");

    const toc = page.locator('aside[aria-label="Table of contents"]').last();
    await expect(toc.getByRole("button", { name: /Jump to/i }).first()).toBeVisible();
    await expect(toc.locator('button:not([type="button"])')).toHaveCount(0);

    await page.getByRole("button", { name: "Add Comment" }).click();
    await expect(page.getByRole("textbox", { name: "Comment text" })).toBeVisible();
    await expect(page.locator("#comment-form")).toBeVisible();

    await expect.poll(() => page.locator(".blog-heading-copy").count()).toBeGreaterThan(0);
    await expect(page.locator(".blog-heading-copy").first()).toHaveAttribute("aria-label", /Copy link to/i);
    await expectTrackedInternalLinks(page, blogSlug);

    await expectNoDuplicateIds(page);
    await expectImagesHaveAlt(page);
    await expectButtonsHaveNames(page);
    await expectCanonicalPath(page, `/blogs/${blogSlug}`);

    const schemas = await readJsonLd(page);
    expectUniqueSchemaIds(schemas);
    const article = findSchema(schemas, "BlogPosting");
    expect(article?.headline).toBe(blogTitle);
    expect(article?.url).toContain(`/blogs/${blogSlug}`);
    expect(article?.mainEntityOfPage?.["@id"]).toContain(`/blogs/${blogSlug}`);
    expect(article?.image?.[0]?.url).toEqual(expect.stringMatching(/^https?:\/\//));
    expect(article?.author?.name).toBeTruthy();
    expect(article?.publisher?.["@id"]).toContain("#organization");
    expect(article?.accessibilityFeature).toEqual(expect.arrayContaining(["tableOfContents", "alternativeText"]));
    expect(article?.accessibilityHazard).toBe("none");
    expect(article?.speakable?.cssSelector).toEqual(expect.arrayContaining(["#blog-article-title", "#article-summary"]));
    expect(article?.datePublished).toBeTruthy();
    expect(article?.dateModified).toBeTruthy();

    const faq = findSchema(schemas, "FAQPage");
    expect(faq?.mainEntity?.length || 0).toBeGreaterThan(0);
    const howTo = findSchema(schemas, "HowTo");
    expect(howTo?.step?.length || 0).toBeGreaterThan(0);

    await quality.expectClean("blog detail a11y seo");
  });
});
