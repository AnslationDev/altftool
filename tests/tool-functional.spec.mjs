import { expect, test } from "@playwright/test";
import { writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { deflateSync } from "node:zlib";
import { createPageQualityGate } from "./helpers/pageQuality.mjs";

const webUrl = process.env.ALTFT_WEB_URL || "http://localhost:3002";
const webOrigin = new URL(webUrl).origin;
const toolRouteTimeoutMs = Number(process.env.ALTFT_TOOL_FUNCTIONAL_ROUTE_TIMEOUT_MS || 60_000);
const webRequire = createRequire(new URL("../altftoolweb/package.json", import.meta.url));
const { PDFDocument, StandardFonts, rgb } = webRequire("pdf-lib");

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  const output = Buffer.alloc(4);
  output.writeUInt32BE((crc ^ 0xffffffff) >>> 0);
  return output;
}

function pngChunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  return Buffer.concat([length, typeBuffer, data, crc32(Buffer.concat([typeBuffer, data]))]);
}

function createPngBuffer(width = 64, height = 48) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 6;

  const rows = [];
  for (let y = 0; y < height; y += 1) {
    const row = Buffer.alloc(1 + width * 4);
    for (let x = 0; x < width; x += 1) {
      const offset = 1 + x * 4;
      row[offset] = Math.round((x / width) * 220);
      row[offset + 1] = Math.round((y / height) * 180);
      row[offset + 2] = 120;
      row[offset + 3] = 255;
    }
    rows.push(row);
  }

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk("IHDR", header),
    pngChunk("IDAT", deflateSync(Buffer.concat(rows))),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

async function writePngFixture(testInfo, filename = "sample.png") {
  const fixturePath = testInfo.outputPath(filename);
  await writeFile(fixturePath, createPngBuffer());
  return fixturePath;
}

async function createPdfBytes(pageCount) {
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

  return Buffer.from(await pdf.save());
}

async function writePdfFixture(testInfo, filename, pageCount) {
  const fixturePath = testInfo.outputPath(filename);
  await writeFile(fixturePath, await createPdfBytes(pageCount));
  return fixturePath;
}

async function openToolShell(page, slug, heading) {
  await page.goto(`${webUrl}/tools/all/${slug}`, {
    waitUntil: "domcontentloaded",
    timeout: toolRouteTimeoutMs,
  });
  await expect(page.getByRole("heading", { name: heading, exact: true })).toBeVisible({
    timeout: toolRouteTimeoutMs,
  });
  await expect(page.getByText("Preparing workspace")).toHaveCount(0, {
    timeout: toolRouteTimeoutMs,
  });
  await expect(page.locator("body")).not.toContainText("Application error");
  await expect(page.locator("body")).not.toContainText("This page could not be found");
}

async function openTool(page, slug, heading) {
  await openToolShell(page, slug, heading);
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

    await page.goto(`${webUrl}/tools/all/json-editor`, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("navigation", { name: "Tool route" })).toContainText("JSON Editor");
    await page.goto(`${webUrl}/tools/all?view=recent`, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("link", { name: /JSON Editor/ }).first()).toBeVisible();

    await quality.expectClean("tools directory search filters");
  });

  test("text conversion output survives a shared state link", async ({ page }) => {
    const quality = createPageQualityGate(page);

    await page.context().grantPermissions(["clipboard-read", "clipboard-write"], {
      origin: webOrigin,
    });
    await openTool(page, "text-to-base64", "Text to Base64");

    await expect(page.getByTestId("tool-action-bar")).toBeVisible();
    await expect(page.getByTestId("priority-tool-badge")).toContainText("Top 40 verified");
    await expect(page.getByTestId("copy-tool-link")).toBeVisible();
    await expect(page.getByTestId("share-tool-link")).toBeVisible();
    await expect(page.getByTestId("reset-tool-workspace")).toBeVisible();

    await page.getByTestId("copy-tool-link").click();
    await expect(page.getByTestId("copy-tool-link")).toContainText("Copied");
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain("/tools/all/text-to-base64");

    await page.getByTestId("share-tool-link").click();
    await expect(page.getByTestId("share-tool-link")).toContainText("Shared");
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain("/tools/all/text-to-base64");

    await page.getByTestId("tool-input").fill("hello world");
    await expect(page.getByTestId("tool-output")).toContainText("aGVsbG8gd29ybGQ=");

    await page.getByTestId("reset-tool-workspace").click();
    await expect(page.getByTestId("tool-input")).toHaveValue("AltFTool microtools are fast.");

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

  test("priority text and encoding utilities transform deterministic input", async ({ page }) => {
    const quality = createPageQualityGate(page);

    await openToolShell(page, "csv-to-json", "CSV to JSON");
    await page
      .getByPlaceholder("name,age,city\nJohn,25,Delhi\nJane,30,Mumbai")
      .fill("name,email\nAda,ada@example.com\nGrace,grace@example.com");
    await page.getByRole("button", { name: "Convert to JSON", exact: true }).click();
    await expect(page.locator("pre")).toContainText('"email": "ada@example.com"');

    await openToolShell(page, "text-case-converter", "Text Case Converter");
    await page.locator("textarea").fill("Hello AltFTool QA");
    await expect(page.locator("body")).toContainText("HELLO ALTFTOOL QA");
    await expect(page.locator("body")).toContainText("hello_altftool_qa");

    await openToolShell(page, "word-character-counter", "Word & Character Counter");
    await page.getByPlaceholder("Paste or type your text...").fill("One two three.\n\nFour five six!");
    await expect(page.locator("body")).toContainText("Words");
    await expect(page.locator("body")).toContainText("6");

    await openToolShell(page, "url-encoder-decoder", "URL Encoder Decoder");
    await page.locator("textarea").first().fill("https://altftool.com/search?q=hello world&tag=dev tools");
    await page.getByRole("button", { name: "Encode", exact: true }).click();
    await expect(page.locator("textarea").nth(1)).toHaveValue(/hello%20world/);

    await openTool(page, "base64-to-text", "Base64 to Text");
    await page.getByTestId("tool-input").fill("SGVsbG8gQWx0RlRvb2w=");
    await page.getByRole("button", { name: "Base64 -> Text", exact: true }).click();
    await expect(page.getByTestId("tool-output")).toContainText("Hello AltFTool");

    await quality.expectClean("priority text and encoding utilities");
  });

  test("priority developer utilities decode, compare, and render content", async ({ page }) => {
    const quality = createPageQualityGate(page);

    await openToolShell(page, "api-stress-estimator", "API Stress Estimator");
    await expect(page.locator("body")).toContainText("Estimated Response Time");
    await expect(page.locator("body")).toContainText("Safe Traffic Limit");

    await openToolShell(page, "regex-tester", "Regex Tester");
    await expect(page.locator("body")).toContainText("2");
    await page.getByRole("button", { name: "Result", exact: true }).click();
    await expect(page.locator("body")).toContainText("support@example.com");

    await openToolShell(page, "jwt-decoder", "JWT Decoder");
    await expect(page.locator("body")).toContainText("Decoded");
    await expect(page.locator("body")).toContainText("altftool-user");

    await openToolShell(page, "diff-checker", "Diff Checker.");
    await page.getByPlaceholder("Paste original content here...").fill("alpha\nbeta\ngamma");
    await page.getByPlaceholder("Paste modified content here...").fill("alpha\nbeta changed\ngamma\ndelta");
    await expect(page.locator("body")).toContainText("Lines Added");
    await expect(page.locator("body")).toContainText("Lines Deleted");
    await expect(page.locator("body")).toContainText("delta");

    await openToolShell(page, "markdown-preview", "Markdown Previewer");
    await page.getByPlaceholder("Enter your markdown here...").fill("# QA Ready\n\n**AltFTool** ships checks.");
    await expect(page.getByRole("heading", { name: "QA Ready", exact: true })).toBeVisible();
    await expect(page.locator("strong")).toContainText("AltFTool");

    await openTool(page, "markdown-html-converter", "Markdown / HTML Converter");
    await page.getByRole("button", { name: "Feature list", exact: true }).click();
    await expect(page.getByTestId("tool-output")).toContainText("<h1>AltFTool</h1>");

    await openToolShell(page, "html-to-markdown-converter", "HTML to Markdown Converter");
    await page.getByRole("button", { name: "Convert Now", exact: true }).click();
    await expect(page.locator("body")).toContainText("# Product Launch Notes");
    await expect(page.locator("body")).toContainText("HTML converted to Markdown.");

    await quality.expectClean("priority developer utilities");
  });

  test("priority generator utilities render usable artifacts", async ({ page }) => {
    const quality = createPageQualityGate(page);

    await openToolShell(page, "qr-generator", "QR Studio PRO");
    await page.getByPlaceholder("https://google.com").fill("https://altftool.com/tools/all");
    await expect(page.locator("#qr-code")).toBeVisible({ timeout: 15_000 });

    await openToolShell(page, "barcode-generator", "Barcode Generator");
    await page.getByRole("main").locator('input[type="text"]').fill("ALTFT-12345");
    await expect(page.locator("canvas")).toBeVisible({ timeout: 15_000 });
    await expect(page.locator("body")).not.toContainText("Error generating barcode");

    await openToolShell(page, "password-generator", "Password Generator");
    await expect(page.locator("body")).toContainText("Generated password");
    await expect(page.locator("body")).toContainText("Strength: Strong");

    await openToolShell(page, "uuid-generator", "Generate Unique UUIDs Instantly");
    await page.getByRole("button", { name: "Generate UUIDs", exact: true }).click();
    await expect(page.locator("code")).toHaveText(/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i);

    await openToolShell(page, "color-contrast-checker", "Color Contrast Checker");
    await page.getByRole("main").locator('input:not([type="color"])').first().fill("#000000");
    await expect(page.locator("body")).toContainText("21.00:1");
    await expect(page.locator("body")).toContainText("AAA normal");

    await openToolShell(page, "gradient-generator", "Gradient Generator");
    await expect(page.locator("pre").first()).toContainText("linear-gradient");
    await page.getByRole("button", { name: /Radial/ }).click();
    await expect(page.locator("pre").first()).toContainText("radial-gradient");

    await quality.expectClean("priority generator utilities");
  });

  test("priority calculator utilities produce deterministic results", async ({ page }) => {
    const quality = createPageQualityGate(page);

    await openToolShell(page, "unix-timestamp-converter", "Unix Timestamp Converter");
    await page.getByRole("main").locator("input").first().fill("0");
    await expect(page.locator("body")).toContainText("1970-01-01T00:00:00.000Z");

    await openToolShell(page, "unit-converter", "Unit Converter");
    await page.locator('input[type="number"]').fill("1000");
    await expect(page.locator("body")).toContainText("1000 m");
    await expect(page.locator("body")).toContainText("1 km");

    await openToolShell(page, "percentage-calculator", "Percentage Calculator");
    await page.locator('input[type="number"]').nth(0).fill("25");
    await page.locator('input[type="number"]').nth(1).fill("200");
    await expect(page.locator("body")).toContainText("25% of 200");
    await expect(page.locator("body")).toContainText("50");

    await openToolShell(page, "gst-calculator", "GST Calculator");
    await expect(page.locator("body")).toContainText("Total amount");
    await expect(page.locator("body")).toContainText("GST amount");
    await expect(page.locator("body")).toContainText("₹11,800");

    await openToolShell(page, "loan-emi-calculator", "Loan EMI Calculator");
    await expect(page.locator("body")).toContainText("Monthly EMI");
    await expect(page.locator("body")).toContainText("EMI/Income Ratio");

    await openToolShell(page, "sip-calculator", "SIP Calculator");
    await expect(page.locator("body")).toContainText("Estimated maturity");
    await expect(page.locator("body")).toContainText("Maturity amount");

    await openToolShell(page, "bmi-calculator", "BMI Health Calculator");
    await page.getByPlaceholder("175").fill("175");
    await page.getByPlaceholder("70").fill("70");
    await page.getByPlaceholder("Age").fill("30");
    await page.locator("select").selectOption("male");
    await page.getByRole("button", { name: "Calculate Now", exact: true }).click();
    await expect(page.locator("body")).toContainText("Your BMI is 22.86");
    await expect(page.locator("body")).toContainText("Normal");

    await quality.expectClean("priority calculator utilities");
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

    await openToolShell(page, "image-to-base64", "Image to Base64");
    await page.getByTestId("image-to-base64-file-input").setInputFiles(imagePath);
    await expect(page.locator('textarea[data-testid="tool-output"]')).toHaveValue(/data:image\/png;base64/, {
      timeout: 15_000,
    });

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

  test("media conversion utilities create real previews", async ({ page }, testInfo) => {
    const quality = createPageQualityGate(page);
    const imagePath = await writePngFixture(testInfo, "conversion.png");
    const pdfPath = await writePdfFixture(testInfo, "conversion.pdf", 1);
    const pngDataUrl = `data:image/png;base64,${createPngBuffer().toString("base64")}`;
    const pdfDataUrl = `data:application/pdf;base64,${(await createPdfBytes(1)).toString("base64")}`;

    await openTool(page, "file-to-base64", "File to Base64");
    await page.getByTestId("file-to-base64-input").setInputFiles(imagePath);
    await expect(page.getByTestId("tool-output")).toContainText("data:image/png;base64", {
      timeout: 15_000,
    });

    await openTool(page, "pdf-to-base64", "PDF to Base64");
    await page.getByTestId("file-to-base64-input").setInputFiles(pdfPath);
    await expect(page.getByTestId("tool-output")).toContainText("data:application/pdf;base64", {
      timeout: 15_000,
    });

    await openTool(page, "base64-to-image", "Base64 to Image");
    await page.getByTestId("tool-input").fill(pngDataUrl);
    await page.getByRole("button", { name: "Preview", exact: true }).click();
    await expect(page.getByTestId("tool-output")).toContainText("Decoded image/png ready", {
      timeout: 15_000,
    });

    await openTool(page, "base64-to-pdf", "Base64 to PDF");
    await page.getByTestId("tool-input").fill(pdfDataUrl);
    await page.getByRole("button", { name: "Preview", exact: true }).click();
    await expect(page.getByTestId("tool-output")).toContainText("Decoded application/pdf ready", {
      timeout: 15_000,
    });

    await openTool(page, "svg-to-image", "SVG to Image");
    await page.getByRole("button", { name: "Render PNG", exact: true }).click();
    await expect(page.getByTestId("tool-output")).toContainText("Rendered PNG ready", {
      timeout: 15_000,
    });

    await quality.expectClean("media conversion previews");
  });

  test("advanced image and PDF render tools produce output previews", async ({ page }, testInfo) => {
    const quality = createPageQualityGate(page);
    const imagePath = await writePngFixture(testInfo, "cropper.png");
    const pdfPath = await writePdfFixture(testInfo, "render.pdf", 1);

    await openTool(page, "image-cropper", "Image Cropper");
    await page.getByTestId("image-cropper-file-input").setInputFiles(imagePath);
    await expect(page.getByTestId("tool-output")).toContainText("Image loaded", {
      timeout: 15_000,
    });
    await page.getByTestId("image-cropper-crop-button").click();
    await expect(page.getByTestId("tool-output")).toContainText("Cropped image ready", {
      timeout: 15_000,
    });

    await openTool(page, "pdf-to-image-converter", "PDF to Image Converter");
    await page.getByTestId("pdf-to-image-file-input").setInputFiles(pdfPath);
    await expect(page.getByTestId("pdf-to-image-page-range")).toBeEnabled({
      timeout: 15_000,
    });
    await page.getByTestId("pdf-to-image-page-range").fill("1");
    await page.getByRole("button", { name: "Convert Pages", exact: true }).click();
    await expect(page.getByTestId("pdf-to-image-output-page")).toContainText("Page 1", {
      timeout: 30_000,
    });
    await expect(page.getByTestId("tool-output")).toContainText("Ready");
    await expect(page.getByTestId("tool-output")).toContainText("1");

    await quality.expectClean("advanced media render outputs");
  });
});
