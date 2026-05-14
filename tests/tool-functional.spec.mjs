import { expect, test } from "@playwright/test";
import { createPageQualityGate } from "./helpers/pageQuality.mjs";

const webUrl = process.env.ALTFT_WEB_URL || "http://localhost:3002";

async function openTool(page, slug, heading) {
  await page.goto(`${webUrl}/tools/all/${slug}`, { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: heading, exact: true })).toBeVisible();
  await expect(page.getByTestId("tool-output")).toBeVisible();
}

test.describe("microtool functional flows", () => {
  test("text conversion output survives a shared state link", async ({ page }) => {
    const quality = createPageQualityGate(page);

    await openTool(page, "text-to-base64", "Text to Base64");

    await page.getByTestId("tool-input").fill("hello world");
    await expect(page.getByTestId("tool-output")).toContainText("aGVsbG8gd29ybGQ=");

    await page.getByRole("button", { name: "Text -> Hex", exact: true }).click();
    await expect(page.getByTestId("tool-output")).toContainText("68656c6c6f20776f726c64");

    await page.getByTestId("share-tool-state").click();
    await expect(page).toHaveURL(/state=/);

    const sharedUrl = page.url();
    await page.goto("about:blank");
    await page.goto(sharedUrl, { waitUntil: "domcontentloaded" });

    await expect(page.getByTestId("tool-input")).toHaveValue("hello world");
    await expect(page.getByTestId("tool-output")).toContainText("68656c6c6f20776f726c64");
    await quality.expectClean("text conversion shared state");
  });

  test("code and data utilities produce expected transformed output", async ({ page }) => {
    const quality = createPageQualityGate(page);

    await openTool(page, "json-editor", "JSON Editor");
    await page.getByRole("button", { name: "JSON list", exact: true }).click();
    await expect(page.getByTestId("tool-output")).toContainText("name,role");
    await expect(page.getByTestId("tool-output")).toContainText("Ada");

    await openTool(page, "csv-converter", "CSV Converter");
    await page.getByRole("button", { name: "Users CSV", exact: true }).click();
    await expect(page.getByTestId("tool-output")).toContainText("ada@example.com");
    await page.getByRole("button", { name: "CSV -> SQL", exact: true }).click();
    await expect(page.getByTestId("tool-output")).toContainText("INSERT INTO table_name");

    await openTool(page, "yaml-formatter", "YAML Formatter");
    await page.getByRole("button", { name: "Flat YAML", exact: true }).click();
    await expect(page.getByTestId("tool-output")).toContainText('"status": "ready"');

    await openTool(page, "crontab-evaluator", "Crontab Evaluator");
    await page.getByRole("button", { name: "Daily 9 AM", exact: true }).click();
    await expect(page.getByTestId("tool-output")).toContainText(/\d/);
    await expect(page.getByTestId("tool-output")).not.toContainText("Error:");

    await quality.expectClean("code and data utilities");
  });
});
