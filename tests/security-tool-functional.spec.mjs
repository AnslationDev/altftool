import { expect, test } from "@playwright/test";
import { createRequire } from "node:module";
import { readFile, writeFile } from "node:fs/promises";

import { createPageQualityGate } from "./helpers/pageQuality.mjs";

const webUrl = process.env.ALTFT_WEB_URL || "http://localhost:3002";
const routeTimeoutMs = Number(
  process.env.ALTFT_TOOL_FUNCTIONAL_ROUTE_TIMEOUT_MS || 60_000,
);
const webRequire = createRequire(
  new URL("../altftoolweb/package.json", import.meta.url),
);
const JSZipModule = webRequire("jszip");
const JSZip = JSZipModule.default || JSZipModule;

async function openSecurityTool(page, slug, title) {
  await page.goto(`${webUrl}/tools/all/${slug}`, {
    waitUntil: "domcontentloaded",
    timeout: routeTimeoutMs,
  });
  await expect(
    page.locator("main").getByRole("heading", { name: title, exact: true }).last(),
  ).toBeVisible({ timeout: routeTimeoutMs });
  await expect(page.getByText("Preparing workspace")).toHaveCount(0, {
    timeout: routeTimeoutMs,
  });
  await expect(page.locator("body")).not.toContainText("Application error");
}

async function runSample(page, sampleButtonName) {
  await page.getByRole("button", { name: sampleButtonName }).click();
  await page.getByRole("button", { name: "Run local inspection" }).click();
}

async function writeZipFixture(testInfo) {
  const zip = new JSZip();
  zip.file("../escape.txt", "bounded fixture");
  zip.file("invoice.pdf.exe", "bounded fixture");
  const fixturePath = testInfo.outputPath("archive-review.zip");
  await writeFile(
    fixturePath,
    await zip.generateAsync({ type: "nodebuffer", compression: "STORE" }),
  );
  return fixturePath;
}

async function writeOfficeFixture(testInfo) {
  const zip = new JSZip();
  zip.file(
    "[Content_Types].xml",
    '<Types><Override PartName="/word/vbaProject.bin" ContentType="application/vnd.ms-office.vbaProject"/></Types>',
  );
  zip.file(
    "_rels/.rels",
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>',
  );
  zip.file("word/document.xml", "<w:document/>");
  zip.file("word/vbaProject.bin", "not-opened");
  zip.file(
    "word/_rels/document.xml.rels",
    '<Relationships><Relationship Type="http://schemas.microsoft.com/office/2006/relationships/vbaProject" Target="vbaProject.bin"/></Relationships>',
  );
  const fixturePath = testInfo.outputPath("macro-review.docm");
  await writeFile(
    fixturePath,
    await zip.generateAsync({ type: "nodebuffer", compression: "STORE" }),
  );
  return fixturePath;
}

async function writePngSignatureFixture(testInfo) {
  const fixturePath = testInfo.outputPath("signature-review.png");
  await writeFile(
    fixturePath,
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  );
  return fixturePath;
}

test.describe("local security tool workflows", () => {
  test.describe.configure({ mode: "serial", timeout: 120_000 });

  test("IAM, Dockerfile, and Git diff analyzers return calibrated results", async ({
    page,
  }) => {
    const quality = createPageQualityGate(page);

    await openSecurityTool(
      page,
      "aws-iam-policy-validator",
      "AWS IAM Policy Validator",
    );
    await runSample(page, "Load policy sample");
    await expect(page.getByText("No configured risk cue observed")).toBeVisible();

    await openSecurityTool(
      page,
      "dockerfile-security-linter",
      "Dockerfile Security Linter",
    );
    await runSample(page, "Load hardened sample");
    await expect(page.getByText("No configured lint cue observed")).toBeVisible();

    await openSecurityTool(
      page,
      "git-diff-exposure-checker",
      "Git Diff Exposure Checker",
    );
    await runSample(page, "Load diff sample");
    await expect(page.getByText("Potential personal-data cues found")).toBeVisible();

    await quality.expectClean("text security analyzer workflows");
  });

  test("Unicode and secret scanners redact findings and export a report", async ({
    page,
  }) => {
    const quality = createPageQualityGate(page);

    await openSecurityTool(
      page,
      "trojan-source-detector",
      "Trojan Source Detector",
    );
    await runSample(page, "Load Unicode sample");
    await expect(
      page.getByText("High-priority Unicode cues found"),
    ).toBeVisible();
    await expect(
      page
        .getByRole("heading", { name: "Mixed-script identifier", exact: true })
        .first(),
    ).toBeVisible();

    await openSecurityTool(
      page,
      "secret-credential-leak-scanner",
      "Secret & Credential Leak Scanner",
    );
    const syntheticAwsKey = `AKIA${"ABCDEFGHIJKLMNOP"}`;
    await page
      .locator("#local-audit-source")
      .fill(`DEPLOYMENT_KEY=${syntheticAwsKey}`);
    await page.getByRole("button", { name: "Run local inspection" }).click();
    await expect(
      page.getByText("High-priority credential cues found"),
    ).toBeVisible();
    const finding = page
      .getByRole("listitem")
      .filter({ hasText: "AWS access key identifier" });
    await expect(finding).not.toContainText(syntheticAwsKey);

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Download report" }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe(
      "secret-scan-redacted-report.txt",
    );
    const reportPath = test.info().outputPath("secret-scan-report.txt");
    await download.saveAs(reportPath);
    expect(await readFile(reportPath, "utf8")).not.toContain(syntheticAwsKey);

    await quality.expectClean("Unicode and secret scanner workflows");
  });

  test("HAR sanitizer produces a sanitized downloadable copy", async ({
    page,
  }) => {
    const quality = createPageQualityGate(page);
    await openSecurityTool(
      page,
      "har-privacy-sanitizer",
      "HAR Privacy Sanitizer",
    );
    await runSample(page, "Load HAR sample");
    await expect(page.getByText("Sanitized copy is ready")).toBeVisible();
    await expect(page.getByText("Sanitized HAR preview")).toBeVisible();
    await expect(page.locator("pre")).not.toContainText("sample-secret");

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Download report" }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("sanitized-network-log.har");

    await quality.expectClean("HAR sanitizer workflow");
  });

  test("archive and Office inspectors handle real bounded packages", async ({
    page,
  }, testInfo) => {
    const quality = createPageQualityGate(page);
    const archiveFixture = await writeZipFixture(testInfo);
    const officeFixture = await writeOfficeFixture(testInfo);

    await openSecurityTool(
      page,
      "archive-safety-inspector",
      "Archive Safety Inspector",
    );
    await page.locator('input[type="file"]').last().setInputFiles(archiveFixture);
    await page.getByRole("button", { name: "Run local inspection" }).click();
    await expect(
      page.getByText("Follow-on expansion should remain blocked"),
    ).toBeVisible();
    await expect(page.getByText("Path traversal names")).toBeVisible();

    await openSecurityTool(
      page,
      "office-macro-inspector",
      "Office Macro Inspector",
    );
    await page.locator('input[type="file"]').last().setInputFiles(officeFixture);
    await page.getByRole("button", { name: "Run local inspection" }).click();
    await expect(
      page.getByText("Macro-related package cues observed"),
    ).toBeVisible();

    await quality.expectClean("archive and Office package workflows");
  });

  test("file signature verifier compares real leading bytes", async ({
    page,
  }, testInfo) => {
    const quality = createPageQualityGate(page);
    const fixture = await writePngSignatureFixture(testInfo);

    await openSecurityTool(
      page,
      "file-signature-verifier",
      "File Signature Verifier",
    );
    await page.locator('input[type="file"]').last().setInputFiles(fixture);
    await page.getByRole("button", { name: "Run local inspection" }).click();
    await expect(page.getByText("Metadata is consistent")).toBeVisible();
    await expect(page.getByText("PNG image", { exact: true })).toBeVisible();

    await quality.expectClean("file signature verifier workflow");
  });
});
