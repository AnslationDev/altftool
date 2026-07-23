import { expect, test } from "@playwright/test";
import { createPageQualityGate } from "./helpers/pageQuality.mjs";

const webUrl = process.env.ALTFT_WEB_URL || "http://localhost:3002";

const canonicalRoutes = [
  "/",
  "/products",
  "/site-map",
  "/business-ops",
  "/housingneeds",
  "/housingneeds/roofing",
  "/housingneeds/plumbing",
  "/housingneeds/windows",
  "/bops/housingneeds/cleaning",
  "/bops/housingneeds/electrical",
  "/bops/housingneeds/flooring",
  "/bops/housingneeds/garage-driveway",
  "/bops/housingneeds/landscaping",
  "/bops/housingneeds/restoration",
  "/bops/housing-services",
  "/tradeon",
  "/tradeon/dashboard",
  "/tradeon/workspace",
  "/tradeon/asset/EUR-USD",
  "/tradeon/chart/EUR-USD",
  "/free-ai-tool",
  "/sale",
  "/tools/all/api-endpoint-usage-mapper",
  "/tools/all/api-tester",
  "/tools/all/base64-to-file",
  "/tools/all/text-shadow-generator",
  "/tools/all/video-to-audio-converter",
];

const servicePreviewRoutes = [
  "/housingneeds/roofing/roofers",
  "/housingneeds/siding/siding-pros",
  "/housingneeds/windows/window-replacement",
  "/housingneeds/solar/helios-solar",
  "/housingneeds/plumbing/plumber",
  "/housingneeds/bathroom/bathroom-remodeling",
  "/housingneeds/hvac/climatech",
  "/housingneeds/hvac/climatech/blog/ac-repair-guide",
  "/housingneeds/pest-control/pest-control",
  "/housingneeds/pest-control/pest-killer",
  "/housingneeds/pest-control/kairos",
  "/housingneeds/pest-control/kairos/termites-pest-control",
];

const servicePreviewAliases = new Map([
  ["/housingneeds/roofing/roofers", "/bops/housing-services/roofers"],
  ["/housingneeds/siding/siding-pros", "/bops/housing-services/siding-pros"],
  ["/housingneeds/windows/window-replacement", "/bops/housing-services/window-replacement"],
  ["/housingneeds/solar/helios-solar", "/bops/housing-services/helios-solar"],
  ["/housingneeds/plumbing/plumber", "/bops/housing-services/plumber"],
  ["/housingneeds/bathroom/bathroom-remodeling", "/bops/housing-services/bathroom-remodeling"],
  ["/housingneeds/hvac/climatech", "/bops/housing-services/climatech"],
  ["/housingneeds/hvac/climatech/blog/ac-repair-guide", "/bops/housing-services/climatech/blog/ac-repair-guide"],
  ["/housingneeds/pest-control/pest-control", "/bops/housing-services/pest-control"],
  ["/housingneeds/pest-control/pest-killer", "/bops/housing-services/pest-killer"],
  ["/housingneeds/pest-control/kairos", "/bops/housing-services/kairos"],
  [
    "/housingneeds/pest-control/kairos/termites-pest-control",
    "/bops/housing-services/kairos/termites-pest-control",
  ],
]);

const mobileRoutes = [
  "/products",
  "/site-map",
  "/housingneeds",
  "/bops/housing-services",
  "/bops/housingneeds/restoration",
  "/housingneeds/roofing/roofers",
  "/housingneeds/windows/window-replacement",
  "/free-ai-tool",
  "/sale",
  "/tradeon/dashboard",
  "/tradeon/chart/EUR-USD",
];

async function expectHealthyRoute(
  page,
  route,
  { checkImages = true, expectedPath = route } = {},
) {
  const quality = createPageQualityGate(page);
  const response = await page.goto(`${webUrl}${route}`, {
    waitUntil: "domcontentloaded",
    timeout: 45_000,
  });

  expect(response, `${route} should return a document response`).not.toBeNull();
  expect(response.status(), `${route} should return a successful status`).toBeLessThan(400);
  if (expectedPath !== route) {
    await expect(page).toHaveURL(`${webUrl}${expectedPath}`);
    await page.waitForLoadState("domcontentloaded");
  }
  await expect(page.locator("body")).not.toContainText(/application error|internal server error/i);
  await expect(page.locator("body")).not.toHaveText("");

  if (checkImages) {
    await page
      .waitForFunction(() => [...document.images].every((image) => image.complete), null, {
        timeout: 8_000,
      })
      .catch(() => {});
  }

  const horizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(horizontalOverflow, `${route} should not overflow horizontally`).toBeLessThanOrEqual(2);
  await quality.expectClean(route);
}

test.describe("branch-integrated route coverage", () => {
  test.describe.configure({ timeout: 360_000 });

  test("canonical product, business, market, and tool routes are healthy", async ({ page }) => {
    for (const route of canonicalRoutes) {
      await expectHealthyRoute(page, route);
    }
  });

  test("HousingNeeds service previews render safely", async ({ page }) => {
    for (const route of servicePreviewRoutes) {
      await expectHealthyRoute(page, route, {
        expectedPath: servicePreviewAliases.get(route) || route,
      });
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/i);
    }
  });
});

test.describe("branch-integrated mobile coverage", () => {
  test.describe.configure({ timeout: 240_000 });
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true });

  test("key routes remain usable without horizontal overflow", async ({ page }) => {
    for (const route of mobileRoutes) {
      await expectHealthyRoute(page, route);
    }
  });
});
