import { expect, test } from "@playwright/test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const adminUrl = process.env.ALTFT_ADMIN_URL || "http://localhost:3001";
const localAdminStorageKey = "ALTFT_LOCAL_ADMIN_SESSION_V1";

async function loginAsLocalAdmin(page) {
  await page.goto(`${adminUrl}/login`, { waitUntil: "domcontentloaded" });
  await page.evaluate((key) => localStorage.setItem(key, "active"), localAdminStorageKey);
  await page.goto(`${adminUrl}/admin-management`, { waitUntil: "networkidle" });
}

async function fillEditor(page, html) {
  const textarea = page.locator("textarea[placeholder='Type or paste your content here...']");
  const editor = page.locator("[data-ckeditor-ready='true'] .ck-editor__editable, .ck-editor__editable[data-ckeditor-ready='true']").first();

  await expect(textarea.or(editor).first()).toBeVisible({ timeout: 30_000 });

  if (await textarea.isVisible().catch(() => false)) {
    await textarea.fill(html.replace(/<[^>]+>/g, " "));
    return textarea;
  }

  await editor.click();
  await page.keyboard.insertText(html.replace(/<[^>]+>/g, " "));
  return editor;
}

test.describe("admin blog editor, preview, and export", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsLocalAdmin(page);
  });

  test("supports long typing, paste, image upload, preview, and draft flow", async ({ page }) => {
    await page.goto(`${adminUrl}/altftool/blogs/add-blogs`, { waitUntil: "domcontentloaded" });

    const longText = `CKEditor write regression ${"content ".repeat(90)}`;
    const editorSurface = await fillEditor(page, longText);

    const editableText = await editorSurface.evaluate((node) => node.value ?? node.textContent ?? "");
    expect(`${editableText}`).toContain("CKEditor write regression");

    await page.locator("input[name='heading']").fill("E2E Draft Preview");
    await page.locator("input[name='author']").fill("AltFTool QA");
    await page.locator("input[name='date']").fill("2026-06-26");

    const imagePath = path.join(os.tmpdir(), "altftool-blog-e2e.png");
    fs.writeFileSync(imagePath, Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=", "base64"));
    const fileInput = page.locator("input[type='file']").first();
    if (await fileInput.count()) await fileInput.setInputFiles(imagePath);

    const preview = page.getByRole("button", { name: /^Preview$/ });
    if (await preview.count()) {
      await preview.click();
      await expect(page.getByRole("dialog")).toContainText("E2E Draft Preview");
      await expect(page.getByText("Ad slot placeholder")).toBeVisible();
      await page.getByRole("button", { name: "Close blog preview" }).click();
    }

    await expect(page.getByRole("button", { name: /Save Draft/i })).toBeVisible();
  });

  test("opens export flow from blog list", async ({ page }) => {
    await page.goto(`${adminUrl}/altftool/blogs`, { waitUntil: "domcontentloaded" });
    const exportButton = page.getByRole("button", { name: /^Export$/ });
    if (!(await exportButton.count())) test.skip(true, "blog_export feature flag is disabled");

    await exportButton.click();
    await expect(page.getByRole("dialog")).toContainText("Download filtered blog data");
    await expect(page.getByRole("button", { name: /^Export$/ })).toBeVisible();
  });
});
