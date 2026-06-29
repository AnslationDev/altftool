import { expect, test } from "@playwright/test";

const webUrl = process.env.ALTFT_WEB_URL || "http://localhost:3002";

test.describe("blog ads viewport visibility", () => {
  for (const width of [1280, 1440, 1920]) {
    test(`shows blog ad slot at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`${webUrl}/blogs?debug_ads=1`, { waitUntil: "domcontentloaded" });

      const firstBlog = page.locator("a[href^='/blogs/']").first();
      await expect(firstBlog).toBeVisible({ timeout: 20_000 });
      await firstBlog.click();
      await page.waitForLoadState("domcontentloaded");

      const adSlot = page.locator("[data-ad-slot^='blog_detail']").first();
      await expect(adSlot).toBeVisible({ timeout: 20_000 });
      await expect(adSlot).toHaveAttribute("data-ad-visible", "true");
    });
  }
});
