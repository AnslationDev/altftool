import { expect, test } from "@playwright/test";
import { createPageQualityGate } from "./helpers/pageQuality.mjs";

const webUrl = process.env.ALTFT_WEB_URL || "http://localhost:3002";
const adminUrl = process.env.ALTFT_ADMIN_URL || "http://localhost:3001";
const retryableNavigationError = /ERR_ABORTED|frame was detached|Timeout|interrupted by another navigation/i;
const warmupRoutes = [`${webUrl}/tools`, `${webUrl}/tools/all/api-stress-estimator`];

async function gotoWithRetry(page, url) {
  let lastError;

  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 150_000 });
      return;
    } catch (error) {
      lastError = error;
      if (!retryableNavigationError.test(error?.message || String(error)) || attempt === 4) {
        throw error;
      }
      await page.waitForTimeout(2000 * attempt);
    }
  }

  throw lastError;
}

async function waitForVisualStability(page) {
  await page.waitForTimeout(1000);
  await page.evaluate(async () => {
    await Promise.race([
      document.fonts?.ready || Promise.resolve(),
      new Promise((resolve) => setTimeout(resolve, 5000)),
    ]);
    document.activeElement?.blur?.();
    window.scrollTo(0, 0);
  });
}

test.describe("visual regression", () => {
  // Increased suite-level timeout to allow for potential dev server compile delays
  test.describe.configure({ timeout: 240_000 });

  test.use({
    colorScheme: "light",
    viewport: { width: 1440, height: 1000 },
  });

  // Pre-warm the compilation of Next.js pages sequentially outside the timed test blocks
  test.beforeAll(async ({ browser }) => {
    test.setTimeout(480_000);
    const context = await browser.newContext();
    const page = await context.newPage();
    for (const route of warmupRoutes) {
      try {
        await gotoWithRetry(page, route);
      } catch (e) {
        console.warn(`Failed to pre-warm ${route}:`, e.message);
      }
    }
    await context.close();
  });

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("COOKIE_CONSENT_V1", JSON.stringify({
        necessary: true,
        analytics: false,
        marketing: false,
        preferences: false,
      }));
    });
  });

  test("public tools catalog first viewport stays stable", async ({ page }) => {
    const quality = createPageQualityGate(page);

    await gotoWithRetry(page, `${webUrl}/tools`);
    await expect(page.locator("#main-header")).toBeVisible();
    await expect(page.getByRole("heading", { name: /tools/i }).first()).toBeVisible();
    await waitForVisualStability(page);

    await expect(page.locator("section").filter({ hasText: "Explore Tools" }).first()).toHaveScreenshot("web-tools-catalog.png");
    await quality.expectClean("visual tools catalog");
  });

  test("tool workspace route first viewport stays stable", async ({ page }) => {
    const quality = createPageQualityGate(page);

    await gotoWithRetry(page, `${webUrl}/tools/all/api-stress-estimator`);
    await expect(page.getByRole("heading", { name: "API Stress Estimator", exact: true })).toBeVisible();
    // The mool itself is a client-only dynamic import; wait for its "Loading..."
    // placeholder to resolve so the screenshot captures the loaded tool (the
    // baseline state) rather than the transient loading shell.
    await expect(page.getByText(/Loading API stress estimator/i)).toBeHidden({ timeout: 30_000 });
    await waitForVisualStability(page);

    await expect(page).toHaveScreenshot("web-tool-workspace.png");
    await quality.expectClean("visual tool workspace");
  });

  test("admin login shell first viewport stays stable", async ({ page }) => {
    const quality = createPageQualityGate(page);

    await gotoWithRetry(page, `${adminUrl}/login`);
    await expect(page.getByRole("heading", { name: /welcome admin/i })).toBeVisible();
    await waitForVisualStability(page);

    await expect(page).toHaveScreenshot("admin-login.png");
    await quality.expectClean("visual admin login");
  });
});
