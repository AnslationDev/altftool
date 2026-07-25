import { expect, test } from "@playwright/test";
import { createPageQualityGate } from "./helpers/pageQuality.mjs";

const webUrl = process.env.ALTFT_WEB_URL || "http://localhost:3002";
const adminUrl = process.env.ALTFT_ADMIN_URL || "http://localhost:3001";

function escapeRegExp(value = "") {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Under `next dev` the first request to a heavy route triggers on-demand
// compilation (the /tools catalog alone can take ~2 min cold on CI), which
// overruns the default per-test navigation deadline. Give tests more room and
// pre-warm the heavy public routes once so the timed navigations below hit
// already-compiled routes and stay fast.
test.describe.configure({ timeout: 120_000 });

const smokeWarmupRoutes = [
  `${webUrl}/tools`,
  `${webUrl}/tools/all/api-stress-estimator`,
  `${webUrl}/tools/developer/api-stress-estimator`,
  `${webUrl}/buysmart`,
  `${adminUrl}/super-admin`,
];

test.beforeAll(async ({ browser }) => {
  test.setTimeout(480_000);
  const page = await browser.newPage();
  for (const url of smokeWarmupRoutes) {
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 120_000 });
    } catch {
      // Non-fatal: a slow/failed warm-up just falls back to on-demand
      // compilation inside the test itself.
    }
  }
  await page.close();
});

test("public web shell loads", async ({ page }) => {
  const quality = createPageQualityGate(page);

  await page.emulateMedia({ colorScheme: "light" });
  await page.goto(`${webUrl}/tools`);

  await expect
    .poll(() =>
      page.evaluate(() => document.documentElement.getAttribute("data-theme")),
    )
    .toBe("light");
  await expect
    .poll(() =>
      page.evaluate(() =>
        document.documentElement.getAttribute("data-theme-mode"),
      ),
    )
    .toBe("system");
  const mainHeader = page.locator("#main-header");
  await expect(mainHeader).toBeVisible();
  await expect(
    mainHeader.getByRole("img", { name: "AltFTool" }),
  ).toBeVisible();
  const signInLink = page.getByRole("link", { name: "Sign in" });
  await expect(signInLink).toBeVisible();
  await expect(signInLink).toHaveAttribute("title", "Sign in");
  await expect(signInLink).toHaveText("");
  await expect(signInLink).toHaveCSS("width", "40px");
  await expect(signInLink).toHaveCSS("height", "40px");
  // The catalog hero search uses an animated typewriter placeholder, so match
  // the input by its stable class instead of a full placeholder string.
  await expect(page.locator("input.tools-search-input")).toBeVisible();
  // Theme selection is explicit so users can follow the system preference or
  // override it. Exercise every mode and leave the test profile on System.
  const themeToggle = page.getByRole("button", { name: /^Theme:/ });
  await expect(themeToggle).toBeVisible();
  await themeToggle.click();
  await expect(page.getByRole("dialog", { name: "Theme mode" })).toBeVisible();
  await page.getByRole("radio", { name: "Dark mode" }).click();
  await expect
    .poll(() =>
      page.evaluate(() => document.documentElement.getAttribute("data-theme")),
    )
    .toBe("dark");
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("appThemeMode")))
    .toBe("dark");

  await themeToggle.click();
  await page.getByRole("radio", { name: "Light mode" }).click();
  await expect
    .poll(() =>
      page.evaluate(() => document.documentElement.getAttribute("data-theme")),
    )
    .toBe("light");
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("appThemeMode")))
    .toBe("light");

  await themeToggle.click();
  await page.getByRole("radio", { name: "System theme" }).click();
  await expect
    .poll(() =>
      page.evaluate(() =>
        document.documentElement.getAttribute("data-theme-mode"),
      ),
    )
    .toBe("system");
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("appThemeMode")))
    .toBe("system");
  await expect
    .poll(() =>
      page.evaluate(() => document.documentElement.getAttribute("data-theme")),
    )
    .toBe("light");
  await expect(
    page.getByRole("link", { name: "Tools", exact: true }).first(),
  ).toHaveAttribute("href", "/tools/all");
  await expect(
    page.getByRole("link", { name: "Blog", exact: true }).first(),
  ).toHaveAttribute("href", "/blogs");
  await quality.expectClean("public web shell");
});

test("tool detail routes use the clean workspace flow", async ({ page }) => {
  const quality = createPageQualityGate(page);

  await page.goto(`${webUrl}/tools/all/api-stress-estimator`, {
    waitUntil: "domcontentloaded",
  });

  await expect(
    page.getByRole("navigation", { name: "Tool route" }),
  ).toContainText("All Tools");
  await expect(
    page.getByRole("heading", { name: "API Stress Estimator", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Loading tool…")).toHaveCount(0);

  await page.goto(`${webUrl}/tools/developer/api-stress-estimator`, {
    waitUntil: "domcontentloaded",
  });

  await expect(
    page.getByRole("navigation", { name: "Tool route" }),
  ).toContainText("Developer");
  await expect(
    page.getByRole("heading", { name: "API Stress Estimator", exact: true }),
  ).toBeVisible();
  await quality.expectClean("tool detail routes");
});

test("buysmart featured brand cards and detail flow work", async ({ page }) => {
  const quality = createPageQualityGate(page);

  await page.goto(`${webUrl}/buysmart`, { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("buysmart-page")).toBeVisible();
  await expect(page.getByTestId("buysmart-hero-section")).toBeVisible();

  const newsletterDismiss = page.getByRole("button", { name: "Not now" });
  if (await newsletterDismiss.count()) {
    await newsletterDismiss.click();
  }

  const cookieAccept = page.getByRole("button", { name: "Accept" });
  if (await cookieAccept.count()) {
    await cookieAccept.click();
  }

  for (let i = 0; i < 6; i += 1) {
    if (await page.getByTestId("buysmart-savings-hub").count()) break;
    await page.mouse.wheel(0, 650);
    await page.waitForTimeout(600);
  }

  await expect(page.getByTestId("buysmart-savings-hub")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "AltFTool Savings Hub" }),
  ).toBeVisible();

  // The old "Choose Your Brand A-Z" section (with buysmart-category-image
  // brand logos) was redesigned into letter-badge store cards under the
  // "Top Featured Brands" section, so anchor on the current UI instead.
  for (let i = 0; i < 12; i += 1) {
    if (await page.getByTestId("buysmart-category-card").count()) break;
    await page.mouse.wheel(0, 750);
    await page.waitForTimeout(700);
  }

  await expect(
    page.getByRole("heading", { name: "Top Featured Brands" }),
  ).toBeVisible();

  const firstCard = page.getByTestId("buysmart-category-card").first();
  await firstCard.scrollIntoViewIfNeeded();
  await expect(firstCard).toBeVisible();

  const detailLink = page.locator('a[href^="/buysmart/stores/"]').first();
  await expect(detailLink).toBeVisible();
  const detailHref = await detailLink.getAttribute("href");
  expect(detailHref).toMatch(/^\/buysmart\/stores\//);

  await page.goto(`${webUrl}${detailHref}`, { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/buysmart\/stores\//);
  // React streaming can briefly retain a duplicate route segment inside a
  // hidden `S:*` container. Scope actions to the single user-visible surface.
  const storeDetail = page.locator(
    '[data-testid="buysmart-store-detail"]:visible',
  );
  const revealButton = storeDetail.getByTestId("buysmart-reveal-button");

  await expect(storeDetail).toHaveCount(1);
  await expect(storeDetail).toBeVisible();
  await expect(revealButton).toBeEnabled();
  await page.waitForTimeout(500);

  await revealButton.click();
  await expect(
    page.locator('[data-testid="buysmart-reveal-modal"]:visible'),
  ).toBeVisible();
  await quality.expectClean("buysmart flow");
});

test("blog catalog and detail render complete content", async ({
  page,
  request,
}) => {
  const quality = createPageQualityGate(page);

  const firstChunk = await request.get(`${webUrl}/api/blogs?offset=0&limit=5`);

  expect(firstChunk.ok()).toBeTruthy();

  const firstPayload = await firstChunk.json();
  expect(firstPayload.posts.length).toBeGreaterThan(0);
  expect(firstPayload.hasMore).toBeTruthy();

  const targetPost = firstPayload.posts.find((post) => post.slug);
  expect(targetPost).toBeTruthy();

  let offset = 0;
  let discoveredPosts = 0;
  let lastPayload = null;

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const chunk = await request.get(
      `${webUrl}/api/blogs?offset=${offset}&limit=72`,
    );
    expect(chunk.ok()).toBeTruthy();

    lastPayload = await chunk.json();
    expect(lastPayload.nextOffset).toBe(offset + lastPayload.posts.length);
    discoveredPosts += lastPayload.posts.length;

    if (!lastPayload.hasMore) break;
    expect(lastPayload.nextOffset).toBeGreaterThan(offset);
    offset = lastPayload.nextOffset;
  }

  expect(discoveredPosts).toBeGreaterThan(0);
  expect(lastPayload.hasMore).toBeFalsy();

  await page.goto(`${webUrl}/blogs`, { waitUntil: "domcontentloaded" });
  await expect(
    page.getByRole("heading", { name: "AltFTool Blog" }),
  ).toBeVisible();
  const targetTitle = targetPost.heading || targetPost.title;
  const targetTitlePattern = new RegExp(escapeRegExp(targetTitle), "i");
  await expect(page.locator('a[href^="/blogs/"]').first()).toBeVisible();

  await page.goto(`${webUrl}/blogs/${targetPost.slug}`, {
    waitUntil: "domcontentloaded",
  });
  await expect(
    page.getByRole("heading", { name: targetTitlePattern }),
  ).toBeVisible();

  const contentLength = await page
    .locator(".ckeditor-content")
    .first()
    .innerText()
    .then((text) => text.length);
  expect(contentLength).toBeGreaterThan(100);
  await quality.expectClean("blog catalog and detail");
});

test("admin login shell loads", async ({ page }) => {
  const quality = createPageQualityGate(page);

  await page.goto(`${adminUrl}/login`);

  await expect(
    page.getByRole("heading", { name: "Welcome to AltFTool Admin" }),
  ).toBeVisible();
  await expect(page.getByPlaceholder("you@company.com")).toBeVisible();
  await expect(
    page.getByRole("button", { name: /continue with google/i }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /^sign in$/i })).toBeVisible();

  const localAdminButton = page.getByTestId("local-admin-login");
  if (await localAdminButton.count()) {
    await localAdminButton.click();
    await expect(page).toHaveURL(/\/(?:admin-management|super-admin)/, {
      timeout: 45_000,
    });
    await expect(page.getByText("Super Admin").first()).toBeVisible({
      timeout: 45_000,
    });
  }

  await quality.expectClean("admin login shell");
});

test("legacy route names redirect to canonical routes", async ({ request }) => {
  const blogRedirect = await request.get(`${webUrl}/blog`, { maxRedirects: 0 });
  expect(blogRedirect.status()).toBe(308);
  expect(blogRedirect.headers().location).toBe("/blogs");

  const categoryRedirect = await request.get(
    `${webUrl}/categories/all?search=api`,
    {
      maxRedirects: 0,
    },
  );
  expect(categoryRedirect.status()).toBe(308);
  expect(categoryRedirect.headers().location).toBe("/tools/all?search=api");

  const adminRedirect = await request.get(
    `${adminUrl}/leadtree/creditcard/add-cards`,
    {
      maxRedirects: 0,
    },
  );
  expect(adminRedirect.status()).toBe(308);
  expect(adminRedirect.headers().location).toBe(
    "/leadtree/credit-cards/add-cards",
  );
});
