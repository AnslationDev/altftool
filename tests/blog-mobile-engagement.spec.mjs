import { expect, test } from "@playwright/test";
import { createPageQualityGate } from "./helpers/pageQuality.mjs";

const webUrl = process.env.ALTFT_WEB_URL || "http://localhost:3002";
const webOrigin = new URL(webUrl).origin;
const blogSlug = "age-calculator-guide";
const blogTitle = "How to Use an Age Calculator Accurately";

async function openPublicPage(page, route) {
  const response = await page.goto(`${webUrl}${route}`, {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
  expect(response?.ok(), `${route} response`).toBeTruthy();
  await page.waitForLoadState("networkidle", { timeout: 8_000 }).catch(() => {});
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
          className: typeof element.className === "string" ? element.className : "",
          text: (element.textContent || "").replace(/\s+/g, " ").trim().slice(0, 80),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
        };
      })
      .filter(({ left, right }) => right > window.innerWidth + 2 || (left < -2 && right > 2))
      .slice(0, 8);

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

async function dismissOverlays(page) {
  for (let index = 0; index < 2; index += 1) {
    await page.keyboard.press("Escape").catch(() => {});
    await page.waitForTimeout(100);
  }

  const closeMenu = page.getByRole("button", { name: "Close menu" });
  if (await closeMenu.isVisible().catch(() => false)) {
    await closeMenu.click({ force: true, timeout: 1_000 }).catch(() => {});
  }
}

test.describe("mobile blog UX and engagement", () => {
  test.describe.configure({ timeout: 180_000 });

  test.use({
    viewport: { width: 390, height: 844 },
    isMobile: true,
  });

  test.beforeEach(async ({ page }) => {
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
  });

  test("blog index remains usable on a phone viewport", async ({ page }) => {
    const quality = createPageQualityGate(page);

    await openPublicPage(page, "/blogs");

    await expect(page.getByRole("heading", { name: "AltFTool Blog" })).toBeVisible();
    const featuredArticle = page.getByRole("region", { name: "Featured articles" });
    const featuredTitle = (await featuredArticle.getByRole("heading").textContent())?.trim() || "";
    const searchTerm = featuredTitle
      .split(/\s+/)
      .filter((word) => word.length > 3)
      .slice(0, 2)
      .join(" ");

    expect(searchTerm).not.toBe("");
    await expect(featuredArticle.getByRole("link", { name: /Read Article/i })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Search blog articles" })).toBeVisible();
    await expect(page.getByRole("region", { name: "Blog categories" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Featured Picks" })).toBeVisible();

    const searchInput = page.getByRole("textbox", { name: "Search blog articles" });
    await searchInput.fill(searchTerm);
    await expect(page.getByRole("link", { name: new RegExp(featuredTitle, "i") }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Clear blog search" })).toBeVisible();

    await expectNoHorizontalOverflow(page, "mobile /blogs");
    await quality.expectClean("mobile blog index");
  });

  test("blog detail mobile reading controls fit and open the article map", async ({ page }) => {
    await openPublicPage(page, `/blogs/${blogSlug}`);
    const quality = createPageQualityGate(page);

    await expect(page.getByRole("heading", { name: blogTitle })).toBeVisible();
    const flowNav = page.getByRole("navigation", { name: "Article reading flow" });
    await expect(flowNav).toBeVisible();
    await expect(flowNav.locator('a[href="#article-summary"]')).toBeVisible();
    const readLink = flowNav.locator('a[href="#article-body"]');
    await expect(readLink).toBeVisible();
    await expect(flowNav.locator('a[href="#related-tools"], a[href="#faq"], a[href="#article-body"]').first()).toBeVisible();

    const mobileToc = page.locator('aside[aria-label="Table of contents"]').first();
    await expect(mobileToc).toBeVisible();
    await expect(mobileToc.getByRole("button", { name: /On This Page/i })).toBeVisible();
    await mobileToc.getByRole("button", { name: /On This Page/i }).click();
    await expect(mobileToc.locator("nav")).toBeVisible();

    await readLink.click();
    await expect(page.locator("#article-body")).toBeVisible();
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight * 0.55, behavior: "instant" }));
    await expect(page.getByRole("button", { name: "Back to top" })).toBeVisible();

    await expectNoHorizontalOverflow(page, `mobile /blogs/${blogSlug}`);
    await quality.expectClean("mobile blog detail");
  });

  test("share, like, and comment controls work without a Firebase write", async ({ page }) => {
    await page.context().grantPermissions(["clipboard-read", "clipboard-write"], {
      origin: webOrigin,
    });
    await page.addInitScript(() => {
      window.__altfCopiedText = "";
      Object.defineProperty(navigator, "clipboard", {
        value: {
          writeText: async (text) => {
            window.__altfCopiedText = String(text || "");
          },
          readText: async () => window.__altfCopiedText || "",
        },
        configurable: true,
      });
      Object.defineProperty(navigator, "share", {
        value: undefined,
        configurable: true,
      });
    });

    await openPublicPage(page, `/blogs/${blogSlug}`);
    const quality = createPageQualityGate(page);
    await page.evaluate(() => {
      Object.defineProperty(navigator, "share", {
        value: undefined,
        configurable: true,
      });
    });
    await expect.poll(() => page.evaluate(() => typeof navigator.share)).toBe("undefined");

    const shareButton = page.getByRole("button", { name: "Share", exact: true });
    await expect(shareButton).toBeVisible();
    await shareButton.click();
    await expect(page.getByRole("button", { name: "Copied", exact: true })).toBeVisible();
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain(`/blogs/${blogSlug}`);

    const copyArticleButton = page.getByRole("button", { name: "Copy article link" });
    await expect(copyArticleButton).toBeVisible();
    await copyArticleButton.click();
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain(`/blogs/${blogSlug}`);

    const likeButton = page.locator('button[aria-pressed]').first();
    await expect(likeButton).toBeVisible();
    await expect(likeButton).toHaveAttribute("aria-pressed", "false");
    await likeButton.click();
    await expect(likeButton).toHaveAttribute("aria-pressed", "true");

    await dismissOverlays(page);
    const commentText = "AltFTool mobile QA comment";
    await page.getByRole("button", { name: "Add Comment" }).scrollIntoViewIfNeeded();
    await page.getByRole("button", { name: "Add Comment" }).click();
    await expect(page.getByPlaceholder("Share your thoughts...")).toBeVisible();
    await page.getByPlaceholder("Share your thoughts...").fill(commentText);
    await page.getByRole("button", { name: "Post" }).click();

    await expect(page.getByText("Saved locally for this session.")).toBeVisible();
    await expect(page.getByText(commentText)).toBeVisible();

    await expect.poll(() => page.locator(".blog-heading-copy").count()).toBeGreaterThan(0);
    await page.locator(".blog-heading-copy").first().click({ force: true });
    await expect(page.getByText("Section link copied")).toBeVisible();

    await expectNoHorizontalOverflow(page, "mobile blog engagement");
    await quality.expectClean("mobile blog engagement");
  });
});
