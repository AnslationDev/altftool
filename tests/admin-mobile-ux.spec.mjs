import { expect, test } from "@playwright/test";
import { createPageQualityGate } from "./helpers/pageQuality.mjs";

const adminUrl = process.env.ALTFT_ADMIN_URL || "http://localhost:3001";
const localAdminStorageKey = "ALTFT_LOCAL_ADMIN_SESSION_V1";

const mobileRoutes = [
  { path: "/admin-management", heading: "Admin Management" },
  { path: "/analytics", headingPattern: /Analytics|Analytics unavailable/i },
  { path: "/health", heading: "Health Overview" },
  { path: "/support", heading: "Support" },
  { path: "/tickets", heading: "Support Management" },
  { path: "/altftool/blogs", heading: "Blog Management" },
  { path: "/altftool/blogs/add-blogs", text: "Save Draft" },
  { path: "/altftool/blogs/quality", heading: "Quality Center" },
];

async function loginAsLocalAdmin(page) {
  await page.goto(`${adminUrl}/login`, { waitUntil: "domcontentloaded" });
  await page.evaluate((key) => localStorage.setItem(key, "active"), localAdminStorageKey);
  await page.goto(`${adminUrl}/admin-management`, { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Admin Management" })).toBeVisible();
}

async function openAdminRoute(page, path) {
  await page.goto(`${adminUrl}${path}`, { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("button", { name: "Open admin navigation" })).toBeVisible({
    timeout: 30_000,
  });
  await expect(page.locator("body")).not.toContainText("Application error");
  await expect(page.locator("body")).not.toContainText("This page could not be found");
}

async function expectRouteMarker(page, route) {
  if (route.heading) {
    await expect(page.getByRole("heading", { name: route.heading })).toBeVisible({
      timeout: 30_000,
    });
    return;
  }

  if (route.headingPattern) {
    await expect(page.getByRole("heading", { name: route.headingPattern }).first()).toBeVisible({
      timeout: 30_000,
    });
    return;
  }

  await expect(page.getByText(route.text, { exact: false }).first()).toBeVisible({
    timeout: 30_000,
  });
}

async function expectNoHorizontalOverflow(page, label) {
  const overflow = await page.evaluate(() => {
    const maxScrollWidth = Math.max(
      document.documentElement.scrollWidth,
      document.body?.scrollWidth || 0,
    );
    const offenders = Array.from(document.body.querySelectorAll("*"))
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          tag: element.tagName.toLowerCase(),
          role: element.getAttribute("role") || "",
          ariaLabel: element.getAttribute("aria-label") || "",
          className: typeof element.className === "string" ? element.className : "",
          text: (element.textContent || "").replace(/\s+/g, " ").trim().slice(0, 80),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
        };
      })
      .filter(({ left, right }) => right > window.innerWidth + 2 || (left < -2 && right > 2))
      .slice(0, 10);

    return {
      innerWidth: window.innerWidth,
      maxScrollWidth,
      offenders,
    };
  });

  expect(
    overflow.maxScrollWidth,
    `${label}\n${JSON.stringify(overflow.offenders, null, 2)}`,
  ).toBeLessThanOrEqual(overflow.innerWidth + 2);
}

test.describe("admin mobile UX release guard", () => {
  test.describe.configure({ timeout: 120_000 });
  test.use({
    viewport: { width: 390, height: 844 },
    isMobile: true,
  });

  test.beforeEach(async ({ page }) => {
    await loginAsLocalAdmin(page);
  });

  for (const route of mobileRoutes) {
    test(`${route.path} fits the mobile admin shell`, async ({ page }) => {
      const quality = createPageQualityGate(page);

      await openAdminRoute(page, route.path);
      await expectRouteMarker(page, route);
      await expectNoHorizontalOverflow(page, `admin mobile ${route.path}`);
      await quality.expectClean(`admin mobile ${route.path}`);
    });
  }

  test("mobile sidebar and theme controls remain keyboard reachable", async ({ page }) => {
    const quality = createPageQualityGate(page);

    await openAdminRoute(page, "/admin-management");

    const openNavigation = page.getByRole("button", { name: "Open admin navigation" });
    await openNavigation.focus();
    await expect(openNavigation).toBeFocused();
    await openNavigation.press("Enter");

    const closeNavigation = page.getByRole("button", { name: "Close admin navigation" });
    await expect(closeNavigation).toBeVisible();
    await expect(closeNavigation).toBeFocused();
    await closeNavigation.press("Escape");

    await expect
      .poll(() =>
        page.evaluate(() => {
          const sidebar = document.querySelector("aside");
          return sidebar ? Math.round(sidebar.getBoundingClientRect().left) : 0;
        }),
      )
      .toBeLessThan(0);

    const themeButton = page.getByRole("button", { name: "Theme: System default" });
    await themeButton.focus();
    await themeButton.press("Enter");
    await expect(page.getByRole("menu", { name: "Theme mode" })).toBeVisible();
    await page.getByRole("menuitemradio", { name: "Light mode" }).focus();
    await page.keyboard.press("Enter");
    await expect
      .poll(() => page.evaluate(() => document.documentElement.getAttribute("data-theme-mode")))
      .toBe("light");

    await quality.expectClean("admin mobile keyboard controls");
  });

  test("support forms expose touch-friendly controls on mobile", async ({ page }) => {
    const quality = createPageQualityGate(page);

    await openAdminRoute(page, "/support");
    await expect(page.getByPlaceholder("Brief summary of your issue")).toBeVisible();
    await expect(page.getByPlaceholder(/Describe your issue in detail/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Submit Ticket" })).toBeVisible();
    await expectNoHorizontalOverflow(page, "admin support form mobile controls");

    await quality.expectClean("admin support mobile controls");
  });
});
