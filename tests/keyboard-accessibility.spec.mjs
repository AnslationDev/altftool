import { expect, test } from "@playwright/test";
import { createPageQualityGate } from "./helpers/pageQuality.mjs";

const webUrl = process.env.ALTFT_WEB_URL || "http://localhost:3002";
const adminUrl = process.env.ALTFT_ADMIN_URL || "http://localhost:3001";
const localAdminStorageKey = "ALTFT_LOCAL_ADMIN_SESSION_V1";
const adminServerMode =
  process.env.ALTFT_PLAYWRIGHT_ADMIN_SERVER ||
  process.env.ALTFT_PLAYWRIGHT_SERVER ||
  "dev";

async function seedQuietPublicSession(page) {
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
}

test.describe("keyboard accessibility flows", () => {
  test("public header dropdowns and mobile menu work from keyboard", async ({ page }) => {
    await seedQuietPublicSession(page);
    const quality = createPageQualityGate(page);

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${webUrl}/tools`, { waitUntil: "domcontentloaded" });
    const header = page.locator("#main-header");
    await expect(header).toBeVisible();

    const learnMenu = header.getByRole("link", { name: "Learn", exact: true });
    await learnMenu.focus();
    await expect(header.getByRole("link", { name: "Blog", exact: true })).toBeVisible();
    await page.keyboard.press("Tab");
    await expect(header.getByRole("link", { name: "Academy", exact: true })).toBeFocused();

    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.locator("#main-header")).toHaveAttribute("data-hydrated", "true");

    const openMenu = page.getByRole("button", { name: "Open menu" });
    await openMenu.focus();
    await expect
      .poll(() => page.evaluate(() => document.activeElement?.getAttribute("aria-label")))
      .toBe("Open menu");
    await openMenu.press("Enter");

    const closeMenu = page.getByRole("button", { name: "Close menu" });
    await expect
      .poll(() =>
        page.evaluate(() => {
          const button = document.querySelector('button[aria-label="Close menu"]');
          return button ? Math.round(button.getBoundingClientRect().left) : -999;
        }),
      )
      .toBeGreaterThanOrEqual(0);
    await expect
      .poll(() => page.evaluate(() => document.activeElement?.getAttribute("aria-label")))
      .toBe("Close menu");

    await closeMenu.press("Escape");
    await expect
      .poll(() =>
        page.evaluate(() => {
          const button = document.querySelector('button[aria-label="Close menu"]');
          return button ? Math.round(button.getBoundingClientRect().left) : 0;
        }),
      )
      .toBeLessThan(0);

    await quality.expectClean("public header keyboard");
  });

  test("tools directory filters are operable without a pointer", async ({ page }) => {
    await seedQuietPublicSession(page);
    const quality = createPageQualityGate(page);

    await page.goto(`${webUrl}/tools/all?search=json`, { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("tools-directory")).toHaveAttribute("data-hydrated", "true");
    const searchInput = page.locator('[data-testid="tools-search-input"]:visible');
    await expect(searchInput).toHaveValue("json");

    await searchInput.focus();
    await expect(searchInput).toBeFocused();
    await searchInput.press("Escape");

    await expect(page).toHaveURL(/\/tools\/all$/);
    await expect(searchInput).toHaveValue("");

    await searchInput.focus();
    await page.keyboard.type("jwt decoder");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/tools\/all\/jwt-decoder$/);

    await quality.expectClean("tools directory keyboard");
  });

  test("blog skip link and explorer controls stay keyboard reachable", async ({ page }) => {
    await seedQuietPublicSession(page);
    const quality = createPageQualityGate(page);

    await page.goto(`${webUrl}/blogs`, { waitUntil: "domcontentloaded" });

    const skipLink = page.getByRole("link", { name: "Skip to main content" });
    await page.keyboard.press("Tab");
    await expect(skipLink).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("#main-content")).toBeVisible();

    const searchInput = page.getByRole("textbox", { name: "Search blog articles" });
    await searchInput.focus();
    await page.keyboard.type("pdf");
    await expect(searchInput).toHaveValue("pdf");

    const popularSort = page.getByRole("tab", { name: "Popular" });
    await popularSort.focus();
    await expect(popularSort).toBeFocused();
    await popularSort.press("Enter");
    await expect(popularSort).toHaveAttribute("aria-selected", "true");

    await quality.expectClean("blog keyboard");
  });

  test("admin mobile navigation and theme menu are keyboard reachable", async ({ page }) => {
    test.skip(
      adminServerMode === "production",
      "Local admin session helper is development-only; production admin requires real auth.",
    );

    const quality = createPageQualityGate(page);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${adminUrl}/login`, { waitUntil: "domcontentloaded" });
    await page.evaluate((key) => localStorage.setItem(key, "active"), localAdminStorageKey);
    await page.goto(`${adminUrl}/admin-management`, { waitUntil: "domcontentloaded" });

    const openNavigation = page.getByRole("button", { name: "Open admin navigation" });
    await openNavigation.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("button", { name: "Close admin navigation" })).toBeVisible();
    await page.keyboard.press("Escape");

    const themeButton = page.getByRole("button", { name: "Theme: System default" });
    await themeButton.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("menu", { name: "Theme mode" })).toBeVisible();
    await page.getByRole("menuitemradio", { name: "Light mode" }).focus();
    await page.keyboard.press("Enter");
    await expect
      .poll(() => page.evaluate(() => document.documentElement.getAttribute("data-theme-mode")))
      .toBe("light");

    await quality.expectClean("admin keyboard");
  });
});
