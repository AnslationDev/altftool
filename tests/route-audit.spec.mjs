import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { createPageQualityGate } from "./helpers/pageQuality.mjs";

const webUrl = process.env.ALTFT_WEB_URL || "http://localhost:3002";
const adminUrl = process.env.ALTFT_ADMIN_URL || "http://localhost:3001";
const adminModuleAuditTimeoutMs = Number(process.env.ALTFT_ADMIN_MODULE_ROUTE_AUDIT_TIMEOUT_MS || 480_000);
const adminModuleRouteTimeoutMs = Number(process.env.ALTFT_ADMIN_MODULE_ROUTE_TIMEOUT_MS || 60_000);

const staticWebRoutes = [
  "/",
  "/robots.txt",
  "/rss.xml",
  "/rss",
  "/sitemap.xml",
  "/tools",
  "/tools/json-editor",
  "/tools/not-a-category/json-editor",
  "/blogs",
  "/buysmart",
  "/buysmart/redirect?url=https%3A%2F%2Fexample.com",
  "/buysmart/view-all",
  "/desktop",
  "/extensions",
  "/fullscrn",
  "/search-eng",
  "/smartlink",
  "/supportsetting",
  "/top11",
  "/trendingvids",
  "/wattpad",
  "/news",
  "/news/headlines",
  "/news/local",
  "/news/newsletter",
  "/news/topics",
  "/news/topics/los-angeles-fires",
  "/news/topic/los-angeles-fires",
  "/news/trending",
  "/ad-preview",
  "/altpintrest",
  "/ancestory",
  "/ancestory/meaning",
  "/academy",
  "/personality",
  "/sale",
  "/search",
  "/unsubscribe",
  "/brandrating",
  "/exclusivedeals",
  "/exclusivedeals/all-stores",
  "/exclusivedeals/e-blogs/fashion/top-fashion-trends-online-shopping",
  "/exclusivedeals/store",
  "/policypages/about",
  "/policypages/affiliate",
  "/policypages/contact",
  "/policypages/cookie",
  "/policypages/disclaimer",
  "/policypages/privacy",
  "/policypages/termsandconditions",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/deals",
  "/exclusive-deals",
  "/buy-smart",
  "/sales",
  "/trending-videos",
  "/api/health",
  "/blogs/view-all/latest-blogs",
  "/blogs/view-all/tool-guides",
  "/blogs/view-all/trending-articles",
  "/wattpad/category/romance",
  "/wattpad/book/love-beyond-time",
  "/wattpad/read/love-beyond-time/1",
  "/api/blogs?offset=0&limit=5",
];

const adminPublicRoutes = [
  "/login",
  "/access-denied",
  "/access-requested",
  "/admin/profile",
];

const adminRoutes = [
  "/admin/dashboard",
  "/admin-management",
  "/admin-management/audit",
  "/analytics",
  "/health",
  "/notification-broadcast",
  "/tickets",
  "/support",
  "/profile",
  "/altftool",
  "/altftool/ads",
  "/altftool/buysmart",
  "/altftool/blogs",
  "/altftool/blogs/add-blogs",
  "/altftool/blogs/view-blogs",
  "/altftool/deals",
  "/altftool/consumer-rating",
  "/altftool/extensions",
  "/altftool/images",
  "/altftool/academy",
  "/altftool/trending-videos",
  "/altftool/sale-locator",
  "/altftool/dynamic",
  "/leadtree",
  "/leadtree/blogs",
  "/leadtree/blogs/add-blogs",
  "/leadtree/blogs/view-blogs",
  "/leadtree/credit-cards",
  "/leadtree/credit-cards/add-cards",
  "/leadtree/credit-cards/view-cards",
  "/leadtree/expert-videos",
  "/leadtree/expert-videos/add-video",
];

function slugify(value = "") {
  return String(value).trim().toLowerCase().replace(/\s+/g, "-");
}

function getToolCategories(tool) {
  if (!tool?.category) return [];
  return Array.isArray(tool.category) ? tool.category : [tool.category];
}

function uniqueRoutes(entries) {
  const seen = new Set();
  return entries.filter((entry) => {
    if (seen.has(entry.route)) return false;
    seen.add(entry.route);
    return true;
  });
}

async function mapWithConcurrency(items, limit, handler) {
  const results = [];
  let index = 0;

  await Promise.all(
    Array.from({ length: limit }, async () => {
      while (index < items.length) {
        const currentIndex = index;
        index += 1;
        results[currentIndex] = await handler(items[currentIndex], currentIndex);
      }
    }),
  );

  return results;
}

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function readToolMetaMap() {
  const source = await readFile("altftoolweb/src/platform/registry/toolMetaMap.js", "utf8");
  const match = source.match(/export const toolMetaMap = (\{[\s\S]*\});?\s*$/);

  if (!match) {
    throw new Error("Unable to parse toolMetaMap.js");
  }

  return JSON.parse(match[1]);
}

async function buildWebRoutes() {
  const toolMetaMap = await readToolMetaMap();
  const blogData = await readJson("altftoolweb/src/app/blogs/data/blogs.json");
  const buySmartStores = await readJson("altftoolweb/src/app/buysmart/data/stores.json");
  const dealData = await readJson("altftoolweb/src/app/exclusivedeals/(data)/db.json");
  const newsData = await readJson("altftoolweb/public/data/newsdata.json");

  const routes = staticWebRoutes.map((route) => ({ group: "static", route }));

  const toolEntries = Object.entries(toolMetaMap);
  const toolCategories = new Set(["all"]);

  for (const [, tool] of toolEntries) {
    for (const category of getToolCategories(tool)) {
      toolCategories.add(slugify(category));
    }
  }

  for (const category of [...toolCategories].sort()) {
    routes.push({ group: "tool categories", route: `/tools/${category}` });
  }

  for (const [slug, tool] of toolEntries) {
    routes.push({ group: "tool details", route: `/tools/all/${slug}` });

    const primaryCategory = slugify(getToolCategories(tool)[0] || "all");
    if (primaryCategory !== "all") {
      routes.push({ group: "tool details", route: `/tools/${primaryCategory}/${slug}` });
    }
  }

  const blogSamples = [
    ...(blogData.blogs || []).slice(0, 8),
    ...(blogData.blogs || []).slice(-2),
  ];

  for (const blog of blogSamples) {
    if (blog?.slug) routes.push({ group: "blogs", route: `/blogs/${blog.slug}` });
  }

  for (const store of buySmartStores) {
    if (store?.slug) routes.push({ group: "buysmart", route: `/buysmart/stores/${store.slug}` });
  }

  for (const category of dealData.categories || []) {
    if (category?.slug) {
      routes.push({ group: "exclusive deals", route: `/exclusivedeals/${category.slug}` });
    }
  }

  const firstDealCategory = dealData.categories?.find((category) => category?.slug && category?.brands?.length);
  const firstDealBrand = firstDealCategory?.brands?.find((brand) => brand?.id);
  if (firstDealCategory && firstDealBrand) {
    routes.push({
      group: "exclusive deals",
      route: `/exclusivedeals/${firstDealCategory.slug}/${firstDealBrand.id}`,
    });
    routes.push({
      group: "exclusive deals",
      route: `/exclusivedeals/store/${firstDealCategory.slug}/${firstDealBrand.id}`,
    });
  }

  routes.push(
    { group: "top11", route: "/top11/management" },
    { group: "top11", route: "/top11/web-hosting" },
    { group: "skill seo", route: "/skill/react/united-states" },
  );

  for (const article of (newsData.news || []).slice(0, 5)) {
    if (article?.slug) routes.push({ group: "news", route: `/news/${article.slug}` });
  }

  return uniqueRoutes(routes);
}

function summarizeByGroup(routes) {
  return routes.reduce((summary, route) => {
    summary[route.group] = (summary[route.group] || 0) + 1;
    return summary;
  }, {});
}

function hasRouteErrorMarkup(text) {
  return /Application error|NEXT_HTTP_ERROR_FALLBACK|This page could not be found/i.test(text);
}

async function fetchRouteWithRetry(request, route, group) {
  let lastError;

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const response = await request.get(`${webUrl}${route}`, { timeout: 45_000 });
      const text = await response.text();

      return {
        group,
        route,
        status: response.status(),
        ok: response.status() < 400 && !hasRouteErrorMarkup(text),
      };
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return {
    group,
    route,
    status: "request failed",
    ok: false,
    error: lastError?.message,
  };
}

test("public web route surface resolves", async ({ request }) => {
  test.setTimeout(300_000);

  const routes = await buildWebRoutes();
  console.info("Public route audit:", summarizeByGroup(routes));

  const results = await mapWithConcurrency(routes, 4, async ({ route, group }) =>
    fetchRouteWithRetry(request, route, group)
  );

  const failures = results
    .filter((result) => !result.ok)
    .map((result) => {
      const error = result.error ? ` (${result.error.split("\n")[0]})` : "";
      return `${result.group} ${result.route} -> ${result.status}${error}`;
    });

  expect(failures).toEqual([]);
});

test("admin public and fallback routes resolve", async ({ page }) => {
  const quality = createPageQualityGate(page);
  const failures = [];

  for (const route of adminPublicRoutes) {
    try {
      await page.goto("about:blank");
      const response = await page.goto(`${adminUrl}${route}`, {
        waitUntil: "domcontentloaded",
        timeout: 30_000,
      });
      await page.waitForLoadState("networkidle", { timeout: 5_000 }).catch(() => {});

      const bodyText = await page.locator("body").innerText({ timeout: 10_000 }).catch(() => "");
      const status = response?.status() ?? 0;

      if (status >= 400) {
        failures.push(`${route} -> HTTP ${status}`);
        failures.push(...await quality.collect(route));
        continue;
      }

      if (!bodyText.trim()) {
        failures.push(`${route} -> empty body`);
        failures.push(...await quality.collect(route));
        continue;
      }

      if (hasRouteErrorMarkup(bodyText)) {
        failures.push(`${route} -> rendered route error`);
      }

      failures.push(...await quality.collect(route));
    } catch (error) {
      failures.push(`${route} -> ${error.message}`);
    }
  }

  expect(failures).toEqual([]);
});

test("admin module route surface resolves for local super admin", async ({ page }) => {
  test.setTimeout(adminModuleAuditTimeoutMs);
  const quality = createPageQualityGate(page);
  const failures = [];

  await page.goto(`${adminUrl}/login`, { waitUntil: "domcontentloaded" });

  const localAdminButton = page.getByTestId("local-admin-login");
  await expect(localAdminButton).toBeVisible();
  await localAdminButton.click();

  await expect(page).toHaveURL(/\/admin-management/);
  await expect(page.getByText("Super Admin").first()).toBeVisible();
  failures.push(...await quality.collect("admin login"));

  for (const route of adminRoutes) {
    try {
      const response = await page.goto(`${adminUrl}${route}`, {
        waitUntil: "domcontentloaded",
        timeout: adminModuleRouteTimeoutMs,
      });
      await page.waitForLoadState("networkidle", { timeout: 5_000 }).catch(() => {});
      await page.waitForFunction(() => document.body?.innerText?.trim().length > 0, null, { timeout: 10_000 }).catch(() => {});

      const pathname = new URL(page.url()).pathname;
      const bodyText = await page.locator("body").innerText({ timeout: 10_000 }).catch(() => "");
      const status = response?.status() ?? 0;

      if (status >= 400) {
        failures.push(`${route} -> HTTP ${status}`);
        failures.push(...await quality.collect(route));
        continue;
      }

      if (["/login", "/access-denied", "/access-requested"].includes(pathname)) {
        failures.push(`${route} -> redirected to ${pathname}`);
        failures.push(...await quality.collect(route));
        continue;
      }

      if (!bodyText.trim()) {
        failures.push(`${route} -> empty body`);
        failures.push(...await quality.collect(route));
        continue;
      }

      if (hasRouteErrorMarkup(bodyText)) {
        failures.push(`${route} -> rendered route error`);
      }

      failures.push(...await quality.collect(route));
    } catch (error) {
      failures.push(`${route} -> ${error.message}`);
    }
  }

  expect(failures).toEqual([]);
});

test("seo endpoints and structured data render", async ({ page, request }) => {
  test.setTimeout(120_000);
  const quality = createPageQualityGate(page);

  const sitemap = await request.get(`${webUrl}/sitemap.xml`);
  expect(sitemap.ok()).toBeTruthy();

  const sitemapText = await sitemap.text();
  expect(sitemapText).toContain("/tools/all/api-stress-estimator");
  expect(sitemapText).toContain("/blogs/age-calculator-guide");
  expect(sitemapText).toContain("/exclusivedeals/most-popular");
  expect(sitemapText).toContain("/extensions/");

  const robots = await request.get(`${webUrl}/robots.txt`);
  expect(robots.ok()).toBeTruthy();
  const robotsText = await robots.text();
  expect(robotsText).toContain("Sitemap:");

  const rss = await request.get(`${webUrl}/rss.xml`);
  expect(rss.ok()).toBeTruthy();
  expect(await rss.text()).toContain("<rss");

  const health = await request.get(`${webUrl}/api/health`);
  expect(health.ok()).toBeTruthy();
  await expect(health.json()).resolves.toEqual(
    expect.objectContaining({
      service: "altftool-web",
      overall: expect.objectContaining({
        status: expect.any(String),
        score: expect.any(Number),
      }),
      release: expect.objectContaining({
        environment: expect.any(String),
      }),
      firebase: expect.objectContaining({
        checks: expect.any(Array),
      }),
      tools: expect.objectContaining({
        total: expect.any(Number),
        priorityRegistered: 40,
      }),
    }),
  );

  await page.goto(`${webUrl}/tools/all/api-stress-estimator`, { waitUntil: "domcontentloaded" });
  const toolSchemas = await page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((scripts) => scripts.map((script) => script.textContent || ""));
  expect(toolSchemas.some((schema) => schema.includes("SoftwareApplication"))).toBeTruthy();
  expect(toolSchemas.some((schema) => schema.includes("FAQPage"))).toBeTruthy();
  expect(toolSchemas.some((schema) => schema.includes("HowTo"))).toBeTruthy();
  await expect(page.getByRole("heading", { name: /workflows/i })).toBeVisible();
  await quality.expectClean("tool structured data route");

  await page.goto(`${webUrl}/blogs/age-calculator-guide`, { waitUntil: "domcontentloaded" });
  const blogSchemas = await page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((scripts) => scripts.map((script) => script.textContent || ""));
  expect(blogSchemas.some((schema) => schema.includes("BlogPosting"))).toBeTruthy();
  await quality.expectClean("blog structured data route");

  const hubRoutes = [
    { route: "/academy", heading: /Build skills with the rest of AltFTool/i },
    { route: "/extensions", heading: /Pair extensions with tools and guides/i },
    { route: "/brandrating", heading: /Compare brands, tools, and deals/i },
    { route: "/buysmart", heading: /Turn product research into faster decisions/i },
    { route: "/blogs", heading: /Keep reading with useful next steps/i },
    { route: "/trendingvids", heading: /Use videos as a launch point/i },
  ];

  for (const { route, heading } of hubRoutes) {
    const response = await request.get(`${webUrl}${route}`, { timeout: 45_000 });
    expect(response.ok()).toBeTruthy();

    const html = await response.text();
    expect(html).toContain("CollectionPage");
    expect(html).toContain("BreadcrumbList");
    expect(html).toContain("ItemList");
    expect(html).toMatch(heading);
  }
});
