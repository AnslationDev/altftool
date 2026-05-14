import { expect, test } from "@playwright/test";
import { writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { createPageQualityGate } from "./helpers/pageQuality.mjs";

const webUrl = process.env.ALTFT_WEB_URL || "http://localhost:3002";
const toolRouteTimeoutMs = Number(process.env.ALTFT_TOOL_FUNCTIONAL_ROUTE_TIMEOUT_MS || 60_000);
const webRequire = createRequire(new URL("../altftoolweb/package.json", import.meta.url));
const { PDFDocument, StandardFonts, rgb } = webRequire("pdf-lib");
const tinyPngBase64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR42mP8z8BQDwAFgwJ/lM1p7wAAAABJRU5ErkJggg==";

async function writePngFixture(testInfo, filename = "sample.png") {
  const fixturePath = testInfo.outputPath(filename);
  await writeFile(fixturePath, Buffer.from(tinyPngBase64, "base64"));
  return fixturePath;
}

async function writePdfFixture(testInfo, filename, pageCount) {
  const fixturePath = testInfo.outputPath(filename);
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);

  for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
    const page = pdf.addPage([360, 240]);
    page.drawText(`AltFTool fixture ${pageNumber}`, {
      x: 36,
      y: 130,
      size: 18,
      font,
      color: rgb(0.12, 0.13, 0.16),
    });
  }

  await writeFile(fixturePath, Buffer.from(await pdf.save()));
  return fixturePath;
}

async function openTool(page, slug, heading) {
  await page.goto(`${webUrl}/tools/all/${slug}`, {
    waitUntil: "domcontentloaded",
    timeout: toolRouteTimeoutMs,
  });
  await expect(page.getByRole("heading", { name: heading, exact: true })).toBeVisible({
    timeout: toolRouteTimeoutMs,
  });
  await expect(page.getByTestId("tool-output")).toBeVisible({
    timeout: toolRouteTimeoutMs,
  });
}

test.describe("microtool functional flows", () => {
  test.describe.configure({ mode: "serial", timeout: 120_000 });

  test("tools directory search and filters stay shareable", async ({ page }) => {
    const quality = createPageQualityGate(page);

    await page.goto(`${webUrl}/tools/all?search=json`, { waitUntil: "domcontentloaded" });

    await expect(page.getByTestId("tools-search-input")).toHaveValue("json");
    await expect(page.getByTestId("tool-search-suggestions")).toContainText("JSON Editor");

    await page.getByRole("link", { name: /^Developer$/ }).first().click();
    await expect(page).toHaveURL(/\/tools\/developer\?search=json/);
    await expect(page.getByRole("heading", { name: "Explore Tools" })).toBeVisible();

    await page.getByTestId("tool-category-search").fill("pdf");
    await expect(page.getByRole("link", { name: /PDF/ }).first()).toBeVisible();

    await page.getByTestId("clear-tool-filters").click();
    await expect(page).toHaveURL(/\/tools\/all$/);
    await expect(page.getByTestId("tools-search-input")).toHaveValue("");
    await quality.expectClean("tools directory search filters");
  });

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

  test("image tools process real uploaded image files", async ({ page }, testInfo) => {
    const quality = createPageQualityGate(page);
    const imagePath = await writePngFixture(testInfo);

    await openTool(page, "image-compressor", "Image Size Reducer");
    await page.getByTestId("image-compressor-file-input").setInputFiles(imagePath);
    await expect(page.getByTestId("tool-output")).toContainText("Ready:");
    await page.getByRole("button", { name: "Compress Image", exact: true }).click();
    await expect(page.getByTestId("tool-output")).toContainText("Compressed image ready", {
      timeout: 15_000,
    });
    await expect(page.getByTestId("tool-output")).toContainText("Output:");

    await openTool(page, "image-resizer", "Image Resizer");
    await page.getByTestId("image-resizer-file-input").setInputFiles(imagePath);
    await expect(page.getByText("1 image added.")).toBeVisible({ timeout: 15_000 });
    await page.getByRole("button", { name: "Preview", exact: true }).click();
    await expect(page.getByTestId("tool-output")).toContainText("Output", {
      timeout: 15_000,
    });
    await expect(page.getByTestId("tool-output")).toContainText("1080 x 1080");

    await quality.expectClean("image utility uploads");
  });

  test("pdf tools merge and split real uploaded PDF files", async ({ page }, testInfo) => {
    const quality = createPageQualityGate(page);
    const onePagePdf = await writePdfFixture(testInfo, "one-page.pdf", 1);
    const twoPagePdf = await writePdfFixture(testInfo, "two-page.pdf", 2);

    await openTool(page, "pdf-merger", "PDF Merger");
    await page.getByTestId("pdf-merger-file-input").setInputFiles([onePagePdf, twoPagePdf]);
    await expect(page.getByTestId("tool-output")).toContainText("Files: 2", {
      timeout: 15_000,
    });
    await expect(page.getByTestId("tool-output")).toContainText("Pages: 3");
    await page.getByRole("button", { name: "Merge Files", exact: true }).click();
    await expect(page.getByTestId("tool-output")).toContainText("Merged PDF ready", {
      timeout: 15_000,
    });
    await expect(page.getByTestId("tool-output")).toContainText("Pages: 3");

    await openTool(page, "pdf-split-tool", "PDF Split Tool");
    await page.getByTestId("pdf-split-file-input").setInputFiles(twoPagePdf);
    await expect(page.getByTestId("tool-output")).toContainText("Page 1", {
      timeout: 15_000,
    });
    await page.getByRole("button", { name: /Extract Pages/ }).click();
    await page.getByTestId("pdf-split-page-range").fill("1");
    await expect(page.getByTestId("tool-output")).toContainText("Extracted pages");
    await page.getByRole("button", { name: "Split PDF", exact: true }).click();
    await expect(page.getByText("PDF exported successfully.")).toBeVisible({
      timeout: 15_000,
    });

    await quality.expectClean("pdf utility uploads");
  });
});
