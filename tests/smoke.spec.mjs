import { expect, test } from "@playwright/test";

const webUrl = process.env.ALTFT_WEB_URL || "http://localhost:3002";
const adminUrl = process.env.ALTFT_ADMIN_URL || "http://localhost:3001";

test("public web shell loads", async ({ page }) => {
  await page.goto(`${webUrl}/tools`);

  await expect(page.locator("#main-header")).toBeVisible();
  await expect(page.getByAltText("AltFTool").first()).toBeVisible();
  await expect(page.getByPlaceholder("Search tools, extensions...")).toBeVisible();
  await expect(page.getByRole("button", { name: "Toggle Theme" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Tools", exact: true }).first()).toHaveAttribute("href", "/tools/all");
  await expect(page.getByRole("link", { name: "Blog", exact: true }).first()).toHaveAttribute("href", "/blogs");
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

test("buysmart A-Z category cards load brand images", async ({ page }) => {
  await page.goto(`${webUrl}/buysmart`, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("load");
  await expect(page.getByRole("heading", { name: "Discover better brands before you buy." })).toBeVisible();

  const newsletterDismiss = page.getByRole("button", { name: "Not now" });
  if (await newsletterDismiss.count()) {
    await newsletterDismiss.click();
  }

  const cookieAccept = page.getByRole("button", { name: "Accept" });
  if (await cookieAccept.count()) {
    await cookieAccept.click();
  }

  for (let i = 0; i < 6; i += 1) {
    if (await page.getByTestId("buysmart-savings-hub").count()) break;
    await page.mouse.wheel(0, 650);
    await page.waitForTimeout(600);
  }

  await expect(page.getByTestId("buysmart-savings-hub")).toBeVisible();
  await expect(page.getByRole("heading", { name: "AltFTool Savings Hub" })).toBeVisible();

  for (let i = 0; i < 12; i += 1) {
    if (await page.getByText("Choose Your Brand A-Z").count()) break;
    await page.mouse.wheel(0, 750);
    await page.waitForTimeout(700);
  }

  await expect(page.getByRole("heading", { name: "Choose Your Brand A-Z" })).toBeVisible();

  const firstCard = page.getByTestId("buysmart-category-card").first();
  await firstCard.scrollIntoViewIfNeeded();
  await expect(firstCard).toBeVisible();

  await page.waitForFunction(() =>
    [...document.querySelectorAll('[data-testid="buysmart-category-image"]')].some(
      (img) => img.complete && img.naturalWidth > 0,
    ),
  );

  const brokenImages = await page
    .getByTestId("buysmart-category-image")
    .evaluateAll((images) =>
      images
        .filter((img) => img.complete && img.naturalWidth === 0)
        .map((img) => img.getAttribute("src")),
    );

  expect(brokenImages).toEqual([]);

  const detailLink = page.locator('a[href^="/buysmart/stores/"]').first();
  await expect(detailLink).toBeVisible();
  await detailLink.click();

  await expect(page).toHaveURL(/\/buysmart\/stores\//);
  await expect(page.getByTestId("buysmart-store-detail")).toBeVisible();
  await expect(page.getByTestId("buysmart-reveal-button")).toBeVisible();

  await page.getByTestId("buysmart-reveal-button").click();
  await expect(page.getByTestId("buysmart-reveal-modal")).toBeVisible();
});

test("admin login shell loads", async ({ page }) => {
  await page.goto(`${adminUrl}/login`);

  await expect(page.getByRole("heading", { name: /welcome admin/i })).toBeVisible();
  await expect(page.getByPlaceholder("you@company.com")).toBeVisible();
  await expect(page.getByRole("button", { name: /continue with google/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /^sign in$/i })).toBeVisible();

  const localAdminButton = page.getByTestId("local-admin-login");
  if (await localAdminButton.count()) {
    await localAdminButton.click();
    await expect(page).toHaveURL(/\/admin-management/);
    await expect(page.getByText("Super Admin").first()).toBeVisible();
  }
});

test("legacy route names redirect to canonical routes", async ({ request }) => {
  const blogRedirect = await request.get(`${webUrl}/blog`, { maxRedirects: 0 });
  expect(blogRedirect.status()).toBe(308);
  expect(blogRedirect.headers().location).toBe("/blogs");

  const categoryRedirect = await request.get(`${webUrl}/categories/all?search=api`, {
    maxRedirects: 0,
  });
  expect(categoryRedirect.status()).toBe(308);
  expect(categoryRedirect.headers().location).toBe("/tools/all?search=api");

  const adminRedirect = await request.get(`${adminUrl}/leadtree/creditcard/add-cards`, {
    maxRedirects: 0,
  });
  expect(adminRedirect.status()).toBe(308);
  expect(adminRedirect.headers().location).toBe("/leadtree/credit-cards/add-cards");
});
