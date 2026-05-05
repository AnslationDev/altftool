import { expect, test } from "@playwright/test";

const webUrl = process.env.ALTFT_WEB_URL || "http://localhost:3002";
const adminUrl = process.env.ALTFT_ADMIN_URL || "http://localhost:3001";

test("public web shell loads", async ({ page }) => {
  await page.goto(`${webUrl}/tools`);

  await expect(page.locator("#main-header")).toBeVisible();
  await expect(page.getByAltText("AltFTool").first()).toBeVisible();
  await expect(page.getByPlaceholder("Search tools, extensions...")).toBeVisible();
  await expect(page.getByRole("button", { name: "Toggle Theme" })).toBeVisible();
});

test("tool detail routes use the clean workspace flow", async ({ page }) => {
  await page.goto(`${webUrl}/tools/all/api-stress-estimator`);

  await expect(page.getByRole("navigation", { name: "Tool route" })).toContainText("All Tools");
  await expect(page.getByRole("heading", { name: "API Stress Estimator", exact: true })).toBeVisible();
  await expect(page.getByText("Loading tool…")).toHaveCount(0);

  await page.goto(`${webUrl}/tools/developer/api-stress-estimator`);

  await expect(page.getByRole("navigation", { name: "Tool route" })).toContainText("Developer");
  await expect(page.getByRole("heading", { name: "API Stress Estimator", exact: true })).toBeVisible();
});

test("admin login shell loads", async ({ page }) => {
  await page.goto(`${adminUrl}/login`);

  await expect(page.getByRole("heading", { name: /welcome admin/i })).toBeVisible();
  await expect(page.getByPlaceholder("you@company.com")).toBeVisible();
  await expect(page.getByRole("button", { name: /continue with google/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /^sign in$/i })).toBeVisible();
});
