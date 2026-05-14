import { expect, test } from "@playwright/test";

const mobileRoutes = [
  "/tools/all",
  "/extensions",
  "/academy",
];

test.describe("mobile layout", () => {
  test.use({
    viewport: { width: 390, height: 844 },
    isMobile: true,
  });

  for (const route of mobileRoutes) {
    test(`${route} has no horizontal document overflow`, async ({ page }) => {
      await page.goto(route, { waitUntil: "domcontentloaded" });

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
              className: typeof element.className === "string" ? element.className : "",
              left: Math.round(rect.left),
              right: Math.round(rect.right),
              width: Math.round(rect.width),
            };
          })
          .filter(({ left, right }) => left < -2 || right > window.innerWidth + 2)
          .slice(0, 6);

        return {
          innerWidth: window.innerWidth,
          maxScrollWidth,
          offenders,
        };
      });

      expect(
        overflow.maxScrollWidth,
        JSON.stringify(overflow.offenders, null, 2),
      ).toBeLessThanOrEqual(overflow.innerWidth + 2);
    });
  }
});
