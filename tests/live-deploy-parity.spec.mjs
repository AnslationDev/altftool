import { expect, test } from "@playwright/test";

const webUrl = process.env.ALTFT_WEB_URL || "https://altftool.com";
const expectedCommit = process.env.ALTFT_EXPECTED_COMMIT || "";
const requireCommit = process.env.ALTFT_PARITY_REQUIRE_COMMIT !== "false";
const blogSlug = "age-calculator-guide";

async function openLivePage(page, route) {
  const response = await page.goto(`${webUrl}${route}`, {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });

  expect(response?.ok(), `${route} response`).toBeTruthy();
}

async function expectNoHorizontalOverflow(page, label) {
  const overflow = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    maxScrollWidth: Math.max(
      document.documentElement.scrollWidth,
      document.body?.scrollWidth || 0,
    ),
  }));

  expect(overflow.maxScrollWidth, label).toBeLessThanOrEqual(overflow.innerWidth + 2);
}

test.describe("live deploy parity", () => {
  test("health API matches the expected deployed commit", async ({ request }) => {
    const response = await request.get(`${webUrl}/api/health`, {
      timeout: 30_000,
    });
    expect(response.ok(), "health response").toBeTruthy();

    const payload = await response.json();
    expect(payload?.service).toBe("altftool-web");
    expect(payload?.overall?.status).toBe("healthy");
    expect(Number(payload?.tools?.priorityRegistered)).toBeGreaterThanOrEqual(40);

    if (requireCommit && expectedCommit) {
      const liveCommit = String(payload?.release?.commitSha || "").slice(0, 8);
      expect(liveCommit, "live release commit").toBe(expectedCommit.slice(0, 8));
    }
  });

  test("deferred route families render successfully after deployment", async ({ request }) => {
    const routes = [
      "/blogs/age-calculator-guide",
      "/altfgame/2048",
      "/wattpad/book/love-beyond-time",
      "/top11/management",
      "/apps/chatgpt",
      "/n8n/category/ai",
      "/homeserv/services/plumbing",
    ];

    for (const route of routes) {
      const response = await request.get(`${webUrl}${route}`, {
        timeout: 60_000,
      });
      expect(response.ok(), `${route} response`).toBeTruthy();
    }
  });

  test("blog index exposes the current accessibility contract", async ({ page }) => {
    await openLivePage(page, "/blogs");

    const skipLink = page.getByRole("link", { name: "Skip to main content" });
    await page.keyboard.press("Tab");
    await expect(skipLink).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("#main-content")).toBeVisible();

    const blogMain = page.getByRole("main", { name: "AltFTool Blog" });
    await expect(blogMain).toBeVisible();
    await expect(
      blogMain.getByRole("heading", { name: "AltFTool Blog", level: 1 }),
    ).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Search blog articles" })).toBeVisible();
    const sortGroup = page.getByRole("tablist", { name: "Sort articles" });
    await expect(sortGroup).toBeVisible();
    await expect(sortGroup.getByRole("tab", { name: "Latest" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  test("blog detail exposes the current reader contract", async ({ page }) => {
    await openLivePage(page, `/blogs/${blogSlug}`);

    await expect(page.locator('main[aria-labelledby="blog-article-title"]')).toBeVisible();
    await expect(page.locator('article#article-body[aria-labelledby="blog-article-title"]')).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Article reading flow" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Like this guide/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Show comments/i })).toBeVisible();
  });

  test("mobile tools page exposes the compact search launcher contract", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openLivePage(page, "/tools/all?search=json");
    await expectNoHorizontalOverflow(page, "live mobile tools filtered route");

    const launcher = page.getByRole("link", {
      name: "Search AltFTool",
    });
    await expect(launcher).toBeVisible();

    const box = await launcher.boundingBox();
    expect(box, "chat launcher bounding box").toBeTruthy();
    expect(box.width, "mobile search launcher width").toBeLessThanOrEqual(56);
    expect(box.height, "mobile search launcher height").toBeLessThanOrEqual(56);
    expect(box.x + box.width, "mobile search launcher right edge").toBeLessThanOrEqual(390);
    expect(box.y + box.height, "mobile search launcher bottom edge").toBeLessThanOrEqual(844);
  });
});
