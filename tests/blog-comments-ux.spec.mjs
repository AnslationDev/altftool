import { expect, test } from "@playwright/test";
import { createPageQualityGate } from "./helpers/pageQuality.mjs";

const webUrl = process.env.ALTFT_WEB_URL || "http://localhost:3002";
const blogSlug = "age-calculator-guide";
const draftKey = `blog-comment-draft:${blogSlug}`;

async function openPublicPage(page, route) {
  const response = await page.goto(`${webUrl}${route}`, {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
  expect(response?.ok(), `${route} response`).toBeTruthy();
  await page.waitForLoadState("networkidle", { timeout: 8_000 }).catch(() => {});
}

test.describe("blog comments UX", () => {
  test.describe.configure({ timeout: 180_000 });

  test.beforeEach(async ({ page }) => {
    await page.addInitScript((key) => {
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
      localStorage.removeItem(key);
    }, draftKey);
  });

  test("drafts autosave, validation blocks short notes, and local fallback preserves comments", async ({ page }) => {
    await openPublicPage(page, `/blogs/${blogSlug}`);
    const quality = createPageQualityGate(page);

    await page.getByRole("button", { name: "Add Comment" }).click();
    const commentBox = page.getByRole("textbox", { name: "Comment text" });
    const postButton = page.getByRole("button", { name: "Post" });

    await expect(commentBox).toBeVisible();
    await expect(postButton).toBeDisabled();

    await commentBox.fill("ok");
    await expect(page.getByText("Add at least 3 characters.")).toBeVisible();
    await expect(postButton).toBeDisabled();

    const draftText = "Autosaved draft from QA";
    await commentBox.fill(draftText);
    await expect(page.getByText("Draft autosaved locally.")).toBeVisible();
    await expect(page.getByText(`${draftText.length}/800`)).toBeVisible();
    await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), draftKey)).toBe(draftText);

    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByRole("button", { name: "Resume draft" })).toBeVisible();
    await page.getByRole("button", { name: "Resume draft" }).click();
    await expect(commentBox).toHaveValue(draftText);

    const finalComment = "AltFTool comments UX test note";
    await commentBox.fill(finalComment);
    await postButton.click();

    await expect(page.getByRole("status").filter({ hasText: "Saved locally for this session." })).toBeVisible();
    await expect(page.getByText(finalComment)).toBeVisible();
    await expect(page.getByRole("button", { name: "Add Comment" })).toBeVisible();
    await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), draftKey)).toBeNull();

    await quality.expectClean("blog comments ux");
  });
});
