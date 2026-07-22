import { expect, test } from "@playwright/test";
import { createPageQualityGate } from "./helpers/pageQuality.mjs";

const adminUrl = process.env.ALTFT_ADMIN_URL || "http://localhost:3001";
const localAdminStorageKey = "ALTFT_LOCAL_ADMIN_SESSION_V1";
const knownExistingBlogTitle =
  process.env.ALTFT_EXISTING_BLOG_TITLE || "Ultimate France Travel Guide for First-Time Visitors";

async function loginAsLocalAdmin(page) {
  await page.goto(`${adminUrl}/login`, { waitUntil: "domcontentloaded" });
  await page.evaluate((key) => localStorage.setItem(key, "active"), localAdminStorageKey);

  await page.goto(`${adminUrl}/admin-management`, { waitUntil: "domcontentloaded" });
  await expect(page.getByText("Super Admin").first()).toBeVisible();
}

async function openDraftPreview(page) {
  const saveDraftButton = page.getByRole("button", { name: /^Save Draft$/ });
  const previewHeading = page.getByRole("heading", { name: "Save draft preview" });

  await expect(saveDraftButton).toBeVisible({ timeout: 30_000 });

  for (let attempt = 0; attempt < 18; attempt += 1) {
    await saveDraftButton.click();

    if (await previewHeading.isVisible().catch(() => false)) {
      return;
    }

    await page.waitForTimeout(1_000);
  }

  await expect(previewHeading).toBeVisible({ timeout: 30_000 });
}

test.describe("admin blog authoring UX", () => {
  test.describe.configure({ timeout: 90_000 });

  test.beforeEach(async ({ page }) => {
    await loginAsLocalAdmin(page);
  });

  test("admin shell keeps mobile navigation and theme mode reachable", async ({ page }) => {
    const quality = createPageQualityGate(page);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${adminUrl}/admin-management`, { waitUntil: "domcontentloaded" });

    const openNavigation = page.getByRole("button", { name: "Open admin navigation" });
    await expect(openNavigation).toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(() => {
          const sidebar = document.querySelector("aside");
          if (!sidebar) return null;
          return Math.round(sidebar.getBoundingClientRect().left);
        }),
      )
      .toBeLessThan(0);

    await openNavigation.click();
    await expect(page.getByRole("button", { name: "Close admin navigation" })).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "System modules" }).getByRole("link", { name: "Admin Management" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Close admin navigation" }).click();

    const themeButton = page.getByRole("button", { name: "Theme: System default" });
    await expect(themeButton).toBeVisible();
    await themeButton.click();
    await expect(page.getByRole("menu", { name: "Theme mode" })).toBeVisible();
    await page.getByRole("menuitemradio", { name: "Light mode" }).click();
    await expect.poll(() => page.evaluate(() => document.documentElement.getAttribute("data-theme-mode"))).toBe("light");
    await expect.poll(() => page.evaluate(() => document.documentElement.getAttribute("data-theme"))).toBe("light");

    await page.getByRole("button", { name: "Theme: Light mode" }).click();
    await page.getByRole("menuitemradio", { name: "System default" }).click();
    await expect.poll(() => page.evaluate(() => document.documentElement.getAttribute("data-theme-mode"))).toBe("system");

    await quality.expectClean("admin shell mobile navigation");
  });

  test("save draft preview explains the final gate before writing", async ({ page }) => {
    const quality = createPageQualityGate(page);

    await page.goto(`${adminUrl}/altftool/blogs/add-blogs`, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("button", { name: /^Save Draft$/ })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText("Content Health")).toBeVisible({ timeout: 30_000 });

    await openDraftPreview(page);

    await expect(page.getByRole("heading", { name: "Save draft preview" })).toBeVisible();
    await expect(page.getByText("Final slug", { exact: true })).toBeVisible();
    await expect(page.getByText("Changed fields", { exact: true })).toBeVisible();
    await expect(page.getByText("Publish gate", { exact: true })).toBeVisible();
    await expect(page.getByText("Duplicate guard", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Confirm draft" })).toBeVisible();

    await quality.expectClean("admin blog draft preview");
  });

  test("duplicate guard blocks an existing title before save confirmation", async ({ page }) => {
    const quality = createPageQualityGate(page);

    await page.goto(`${adminUrl}/altftool/blogs/add-blogs`, { waitUntil: "domcontentloaded" });
    const headingInput = page.getByPlaceholder(/compelling blog heading/i);
    await expect(headingInput).toBeVisible({ timeout: 30_000 });
    await headingInput.fill(knownExistingBlogTitle);

    await openDraftPreview(page);

    await expect(page.getByText("Resolve duplicates")).toBeVisible();
    await expect(page.getByText("Duplicate slug:", { exact: true })).toBeVisible();
    await expect(page.getByText("Duplicate title:", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Confirm draft" })).toBeDisabled();

    await quality.expectClean("admin blog duplicate guard");
  });

  test("content health jump highlights the missing editor section", async ({ page }) => {
    const quality = createPageQualityGate(page);

    await page.goto(`${adminUrl}/altftool/blogs/add-blogs`, { waitUntil: "domcontentloaded" });
    await expect(page.getByText("Content Health")).toBeVisible({ timeout: 30_000 });

    const jumpButtons = page.getByRole("button", { name: "Jump" });
    await expect(jumpButtons.first()).toBeVisible();
    await jumpButtons.first().click();

    await expect(page.locator("#blog-section-post-details")).toHaveClass(/ring-primary/);
    await quality.expectClean("admin blog content health jump");
  });

  test("quality center exposes content health bulk controls", async ({ page }) => {
    const quality = createPageQualityGate(page);

    await page.goto(`${adminUrl}/altftool/blogs/quality`, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Quality Center" })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText("Publish guard")).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText("Schema preview")).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText("Public runtime QA")).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText("Content health")).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText("Internal link opportunities")).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText("Blog link health")).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole("button", { name: /Fix top 10 issues|Fix \d+ selected/ })).toBeVisible();
    await expect(page.getByRole("button", { name: "Preview top internal links" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Preview apply" }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Preview schema" }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /Preview all link fixes|Preview \d+ selected link fixes/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Preview safe cleanup|Preview \d+ selected/ })).toBeVisible();
    await expect(page.getByRole("button", { name: "Run runtime QA" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Links" }).first()).toBeVisible();

    for (const label of ["SEO pack", "FAQ", "Sources", "Trust", "Review date"]) {
      await expect(page.getByRole("button", { name: label }).first()).toBeVisible();
    }

    await expect(page.getByText("Top missing fields")).toBeVisible();
    await expect(page.getByText("Safe cleanup queue")).toBeVisible();
    await expect(page.getByText("Weak anchor suggestions")).toBeVisible();
    await expect(page.getByRole("button", { name: "Preview weak anchor fixes" })).toBeVisible();
    await expect(page.getByText("Rollback safety")).toBeVisible();
    await expect(page.getByText("Recent description changes")).toBeVisible();
    await quality.expectClean("admin blog quality center controls");
  });
});
