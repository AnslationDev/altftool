import { expect, test } from "@playwright/test";
import { createPageQualityGate } from "./helpers/pageQuality.mjs";

const webUrl = process.env.ALTFT_WEB_URL || "http://localhost:3002";
const contentTimeoutMs = Number(process.env.ALTFT_BLOG_PUBLIC_UX_TIMEOUT_MS || 60_000);

function escapeRegExp(value = "") {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

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

async function getLiveBlogTarget(request) {
  const response = await request.get(`${webUrl}/api/blogs?offset=0&limit=12`, {
    timeout: contentTimeoutMs,
  });
  expect(response.ok(), "blog API response").toBeTruthy();

  const payload = await response.json();
  const target = (payload.posts || []).find((post) => post?.slug && (post.heading || post.title));
  expect(target, "published Firebase blog target").toBeTruthy();

  return {
    slug: target.slug,
    title: target.heading || target.title,
    category: target.category || "",
  };
}

async function openPublicPage(page, route) {
  const response = await page.goto(`${webUrl}${route}`, {
    waitUntil: "domcontentloaded",
    timeout: contentTimeoutMs,
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

async function expectMetaContent(page, selector, matcher) {
  const content = await page.locator(selector).first().getAttribute("content");
  expect(content, selector).toBeTruthy();
  expect(content).toEqual(expect.stringMatching(matcher));
  return content;
}

test.describe("public blog UX and SEO", () => {
  test.describe.configure({ mode: "serial", timeout: 180_000 });

  test("blog index exposes live discovery controls and collection schema", async ({ page, request }) => {
    const quality = createPageQualityGate(page);
    const target = await getLiveBlogTarget(request);

    await openPublicPage(page, "/blogs");

    await expect(page.getByRole("heading", { name: "AltFTool Blog" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Search blog articles" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Pick the most complete guides first" })).toBeVisible();
    await expect(page.getByText("Article library")).toBeVisible();
    await expect(page.getByText(target.title, { exact: false })).toBeVisible({
      timeout: contentTimeoutMs,
    });

    const searchInput = page.getByRole("textbox", { name: "Search blog articles" });
    await searchInput.fill(target.title);
    await expect(searchInput).toHaveValue(target.title);
    await expect(page.getByText(target.title, { exact: false })).toBeVisible({
      timeout: contentTimeoutMs,
    });
    await expect(page.getByRole("button", { name: /Reset/i }).first()).toBeVisible();

    await expectCanonicalPath(page, "/blogs");
    const description = await expectMetaContent(page, 'meta[name="description"]', /AltFTool|guides|tools/i);
    expect(description.length).toBeGreaterThan(70);
    await expectMetaContent(page, 'meta[property="og:title"]', /AltFTool Blog/i);
    await expectMetaContent(page, 'meta[name="twitter:card"]', /summary_large_image/i);

    const schemas = await readJsonLd(page);
    const types = schemas.flatMap(schemaTypeList);
    expect(types).toEqual(expect.arrayContaining(["CollectionPage", "BreadcrumbList", "ItemList"]));

    const collection = findSchema(schemas, "CollectionPage");
    expect(collection?.url).toContain("/blogs");

    await quality.expectClean("public blog index");
  });

  test("blog detail renders the reader flow, rich article sections, and schema", async ({ page, request }) => {
    const quality = createPageQualityGate(page);
    const target = await getLiveBlogTarget(request);

    await openPublicPage(page, `/blogs/${target.slug}`);

    await expect(
      page.getByRole("heading", { name: new RegExp(escapeRegExp(target.title), "i") }).first(),
    ).toBeVisible({ timeout: contentTimeoutMs });
    await expect(page.locator("#article-body")).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Article reading flow" })).toBeVisible();
    await expect(page.locator('aside[aria-label="Table of contents"]').last()).toBeVisible();
    await expect(page.getByRole("heading", { name: "What this guide covers" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Quick answers" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Sources and review notes" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Try these related microtools" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Smart related posts" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Copy article link" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Add Comment" })).toBeVisible();

    const contentLength = await page.locator("#article-body .ckeditor-content").innerText().then((text) => text.length);
    expect(contentLength).toBeGreaterThan(250);
    await expect.poll(() => page.locator(".blog-heading-copy").count()).toBeGreaterThan(0);

    await expectCanonicalPath(page, `/blogs/${target.slug}`);
    const metaDescription = await expectMetaContent(page, 'meta[name="description"]', /.+/);
    expect(metaDescription.length).toBeGreaterThanOrEqual(80);
    expect(metaDescription.length).toBeLessThanOrEqual(190);
    await expectMetaContent(page, 'meta[property="og:type"]', /^article$/i);
    await expectMetaContent(page, 'meta[property="og:title"]', new RegExp(escapeRegExp(target.title), "i"));
    await expectMetaContent(page, 'meta[property="og:url"]', new RegExp(`/blogs/${escapeRegExp(target.slug)}$`));
    await expectMetaContent(page, 'meta[name="twitter:card"]', /summary_large_image/i);

    const schemas = await readJsonLd(page);
    const types = schemas.flatMap(schemaTypeList);
    expect(types).toEqual(
      expect.arrayContaining(["BlogPosting", "BreadcrumbList", "FAQPage", "HowTo", "ItemList"]),
    );

    const article = findSchema(schemas, "BlogPosting");
    expect(article?.headline).toEqual(expect.stringMatching(new RegExp(escapeRegExp(target.title), "i")));
    expect(article?.url).toContain(`/blogs/${target.slug}`);
    expect(article?.mainEntityOfPage?.["@id"]).toContain(`/blogs/${target.slug}`);
    expect(Number(article?.wordCount || 0)).toBeGreaterThan(50);
    expect(article?.datePublished).toBeTruthy();

    const faq = findSchema(schemas, "FAQPage");
    expect(faq?.mainEntity?.length || 0).toBeGreaterThan(0);

    const howTo = findSchema(schemas, "HowTo");
    expect(howTo?.step?.length || 0).toBeGreaterThan(0);

    await quality.expectClean("public blog detail");
  });
});
