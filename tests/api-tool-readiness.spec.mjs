import { expect, test } from "@playwright/test";
import { fileURLToPath } from "node:url";
import { createPageQualityGate } from "./helpers/pageQuality.mjs";

const portraitFixturePath = fileURLToPath(
  new URL("../altftoolweb/public/images/beautymakee.jpg", import.meta.url),
);

test.setTimeout(120_000);

test("IP checker uses the HTTPS provider and renders a keyless map fallback", async ({
  page,
}) => {
  const quality = createPageQualityGate(page);
  let lookupRequests = 0;

  await page.route("https://ipwho.is/8.8.8.8", async (route) => {
    lookupRequests += 1;
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        ip: "8.8.8.8",
        success: true,
        type: "IPv4",
        city: "Mountain View",
        region: "California",
        country: "United States",
        country_code: "US",
        latitude: 37.4056,
        longitude: -122.0775,
        postal: "94043",
        calling_code: "1",
        connection: {
          asn: 15169,
          isp: "Google LLC",
          domain: "google.com",
        },
        timezone: { id: "America/Los_Angeles" },
        currency: { code: "USD" },
      }),
    });
  });
  await page.route("https://www.openstreetmap.org/**", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: "<!doctype html><title>Map fixture</title>",
    }),
  );

  await page.goto("/tools/all/ip-address-checker", {
    waitUntil: "domcontentloaded",
  });
  await page.getByPlaceholder("Example: 8.8.8.8").fill("8.8.8.8");
  await page.getByRole("button", { name: "Check IP" }).click();

  await expect(page.getByText("Mountain View", { exact: true })).toBeVisible();
  await expect(page.getByText("Google LLC", { exact: true })).toBeVisible();
  await expect(
    page.getByTitle("Approximate location for 8.8.8.8"),
  ).toBeVisible();
  expect(lookupRequests).toBe(1);
  await quality.expectClean("IP address checker");
});

test("Plant Scanner disables uploads when its provider is unavailable", async ({
  page,
}) => {
  const quality = createPageQualityGate(page);

  await page.route("**/api/tools/plant-identify", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ available: false }),
    });
  });

  await page.goto("/tools/all/plant-scanner", {
    waitUntil: "domcontentloaded",
  });

  await expect(
    page.getByText("Plant identification is temporarily unavailable"),
  ).toBeVisible();
  const uploads = page.locator('input[type="file"]');
  await expect(uploads.first()).toBeDisabled();
  await expect(uploads.last()).toBeDisabled();
  await quality.expectClean("Plant Scanner unavailable state");
});

test("Plant Scanner sends images through the first-party API and renders results", async ({
  page,
}) => {
  const quality = createPageQualityGate(page);
  let postPayload = null;

  await page.route("**/api/tools/plant-identify", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ available: true }),
      });
      return;
    }

    postPayload = route.request().postDataJSON();
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        result: {
          is_plant: { binary: true },
          classification: {
            suggestions: [
              {
                name: "Monstera deliciosa",
                probability: 0.92,
                details: {
                  common_names: ["Swiss cheese plant"],
                  taxonomy: {
                    family: "Araceae",
                    genus: "Monstera",
                    order: "Alismatales",
                  },
                },
              },
            ],
          },
        },
      }),
    });
  });

  await page.goto("/tools/all/plant-scanner", {
    waitUntil: "domcontentloaded",
  });
  await expect(
    page.getByText("Checking plant identification availability..."),
  ).toBeHidden();
  await page.locator('input[type="file"]').last().setInputFiles(portraitFixturePath);
  await page.getByRole("button", { name: "Identify Plant" }).click();

  await expect(page.getByText("Monstera deliciosa", { exact: true })).toBeVisible();
  await expect(page.getByText("92% Match", { exact: true })).toBeVisible();
  expect(postPayload?.image?.length).toBeGreaterThan(100);
  await quality.expectClean("Plant Scanner identification");
});
