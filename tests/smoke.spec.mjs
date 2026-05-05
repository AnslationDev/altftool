import { expect, test } from "@playwright/test";

const webUrl = process.env.ALTFT_WEB_URL || "http://localhost:3002";
const adminUrl = process.env.ALTFT_ADMIN_URL || "http://localhost:3001";

test("public web shell loads", async ({ page }) => {
  await page.goto(`${webUrl}/tools`);

  await expect(page.locator("#main-header")).toBeVisible();
  await expect(page.getByAltText("Logo").first()).toBeVisible();
  await expect(page.getByPlaceholder("Search tools, extensions...")).toBeVisible();
  await expect(page.getByRole("button", { name: "Toggle Theme" })).toBeVisible();
});

test("admin login shell loads", async ({ page }) => {
  await page.goto(`${adminUrl}/login`);

  await expect(page.getByRole("heading", { name: /welcome admin/i })).toBeVisible();
  await expect(page.getByPlaceholder("you@company.com")).toBeVisible();
  await expect(page.getByRole("button", { name: /continue with google/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /^sign in$/i })).toBeVisible();
});
