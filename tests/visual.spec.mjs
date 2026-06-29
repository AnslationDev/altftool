import { expect, test } from "@playwright/test";
import { createPageQualityGate } from "./helpers/pageQuality.mjs";

const webUrl = process.env.ALTFT_WEB_URL || "http://localhost:3002";
const adminUrl = process.env.ALTFT_ADMIN_URL || "http://localhost:3001";
const retryableNavigationError = /ERR_ABORTED|frame was detached|Timeout/i;

async function gotoWithRetry(page, url) {
  let lastError;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45_000 });
      return;
    } catch (error) {
      lastError = error;
      if (!retryableNavigationError.test(error?.message || String(error)) || attempt === 3) {
        throw error;
      }
      await page.waitForTimeout(1500 * attempt);
    }
  }

  throw lastError;
}

async function waitForVisualStability(page) {
  await page.waitForTimeout(600);
  await page.evaluate(async () => {
    await Promise.race([
      document.fonts?.ready || Promise.resolve(),
      new Promise((resolve) => setTimeout(resolve, 3000)),
    ]);
    document.activeElement?.blur?.();
    window.scrollTo(0, 0);
  });
}

test.describe("visual regression", () => {
  test.describe.configure({ timeout: 120_000 });

  test.use({
    colorScheme: "light",
    viewport: { width: 1440, height: 1000 },
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
