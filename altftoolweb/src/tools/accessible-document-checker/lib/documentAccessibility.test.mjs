import assert from "node:assert/strict";
import test from "node:test";

import JSZip from "jszip";

import {
  DOCUMENT_LIMITS,
  buildAccessibilityCountsReport,
  inspectDocumentBytes,
  inspectOoxmlEntries,
  inspectPdfMarkers,
  validateDocumentFile,
} from "./documentAccessibility.mjs";

test("validates only bounded modern document formats", () => {
  assert.deepEqual(validateDocumentFile({ name: "a.PDF", size: 20 }), {
    ok: true,
    extension: "pdf",
    format: "pdf",
    bytes: 20,
  });
  assert.equal(
    validateDocumentFile({ name: "legacy.doc", size: 20 }).ok,
    false,
  );
  assert.equal(validateDocumentFile({ name: "empty.docx", size: 0 }).ok, false);
  assert.equal(
    validateDocumentFile({
      name: "large.pptx",
      size: DOCUMENT_LIMITS.fileBytes + 1,
    }).ok,
    false,
  );
});

test("finds observable PDF structural markers without a conformance claim", () => {
  // /Title only counts as a document-title marker when it is scoped to the
  // Info dictionary the trailer's /Info N G R reference points at (see
  // extractInfoDict in documentAccessibility.mjs) — this keeps an Outline or
  // bookmark /Title entry from being mistaken for the document title. So the
  // fixture needs a real "1 0 obj ... endobj" Info dictionary carrying
  // /Title, plus a trailer /Info reference to it, not just a bare /Title
  // floating in the byte stream.
  const source =
    "%PDF-1.7\n1 0 obj\n<< /Title (Guide) >>\nendobj\n/StructTreeRoot 2 0 R /MarkInfo << /Marked true >> /Lang (en) /Outlines 3 0 R /Subtype /Image /Alt (Chart)\ntrailer\n<< /Info 1 0 R >>";
  const result = inspectPdfMarkers(new TextEncoder().encode(source));
  assert.equal(result.ok, true);
  assert.equal(result.statusCounts.review, 0);
  assert.equal(
    result.checks.find(({ id }) => id === "reading-order").status,
    "manual",
  );
  assert.ok(
    result.limitations.some((value) =>
      value.includes("not document accessibility"),
    ),
  );
});

test("PDF scan reports missing marker cues and encrypted uncertainty", () => {
  const source = "%PDF-1.4\n/Encrypt 4 0 R /Subtype /Image";
  const result = inspectPdfMarkers(new TextEncoder().encode(source));
  assert.ok(result.statusCounts.review >= 3);
  assert.ok(result.warnings.some((value) => value.includes("encryption")));
  assert.equal(
    inspectPdfMarkers(new TextEncoder().encode("not-pdf")).ok,
    false,
  );
});

test("inspects Word heading, language, image, and table cues", () => {
  const result = inspectOoxmlEntries(
    {
      "docProps/core.xml":
        "<cp:coreProperties><dc:title>Guide</dc:title></cp:coreProperties>",
      "word/styles.xml": '<w:styles><w:lang w:val="en-US"/></w:styles>',
      "word/document.xml": `
        <w:document><w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr></w:p>
        <wp:docPr id="1" name="Chart" descr="Quarterly chart"/>
        <wp:docPr id="2" name="Photo"/>
        <w:tbl><w:tr><w:trPr><w:tblHeader/></w:trPr></w:tr></w:tbl></w:document>`,
    },
    "word",
  );
  assert.equal(result.ok, true);
  assert.equal(
    result.checks.find(({ id }) => id === "image-descriptions").observed,
    1,
  );
  assert.equal(
    result.checks.find(({ id }) => id === "heading-structure").status,
    "present",
  );
  assert.equal(
    result.checks.find(({ id }) => id === "table-headers").status,
    "present",
  );
});

test("reports PowerPoint slides without title placeholders", () => {
  const result = inspectOoxmlEntries(
    {
      "docProps/core.xml": "<core><title></title></core>",
      "ppt/slides/slide1.xml":
        '<p:sld><p:sp><p:nvSpPr><p:nvPr><p:ph type="title"/></p:nvPr></p:nvSpPr></p:sp></p:sld>',
      "ppt/slides/slide2.xml": "<p:sld><p:sp/></p:sld>",
    },
    "presentation",
  );
  const titles = result.checks.find(({ id }) => id === "slide-titles");
  assert.equal(titles.observed, 1);
  assert.equal(titles.status, "review");
});

test("screens generic spreadsheet names and header-disabled tables", () => {
  const result = inspectOoxmlEntries(
    {
      "docProps/core.xml":
        "<cp:coreProperties><dc:title>Budget</dc:title></cp:coreProperties>",
      "xl/workbook.xml":
        '<workbook><sheets><sheet name="Sheet1"/><sheet name="Regional totals"/></sheets></workbook>',
      "xl/tables/table1.xml": '<table headerRowCount="0"/>',
    },
    "spreadsheet",
  );
  assert.equal(
    result.checks.find(({ id }) => id === "sheet-names").observed,
    1,
  );
  assert.equal(
    result.checks.find(({ id }) => id === "table-headers").status,
    "review",
  );
});

test("opens a real bounded DOCX-shaped ZIP locally", async () => {
  const zip = new JSZip();
  zip.file(
    "[Content_Types].xml",
    "<Types><Override PartName='/word/document.xml'/></Types>",
  );
  zip.file(
    "docProps/core.xml",
    "<cp:coreProperties><dc:title>Local guide</dc:title></cp:coreProperties>",
  );
  zip.file(
    "word/document.xml",
    '<w:document><w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr></w:p></w:document>',
  );
  zip.file("word/styles.xml", '<w:styles><w:lang w:val="en"/></w:styles>');
  const bytes = await zip.generateAsync({ type: "uint8array" });
  const result = await inspectDocumentBytes(bytes, {
    fileName: "guide.docx",
    fileSize: bytes.byteLength,
  });
  assert.equal(result.ok, true);
  assert.equal(result.format, "word");
  assert.ok(result.inspectedParts >= 3);
});

test("rejects a byte-size mismatch before parsing", async () => {
  const bytes = new TextEncoder().encode("%PDF-1.7");
  const result = await inspectDocumentBytes(bytes, {
    fileName: "test.pdf",
    fileSize: bytes.byteLength + 1,
  });
  assert.equal(result.ok, false);
  assert.ok(result.error.includes("do not match"));
});

test("counts-only report excludes names, XML, and metadata values", () => {
  const result = inspectOoxmlEntries(
    {
      "docProps/core.xml":
        "<cp:coreProperties><dc:title>Secret Project Orion</dc:title></cp:coreProperties>",
      "word/document.xml":
        "<w:document><w:t>Private client text</w:t></w:document>",
    },
    "word",
  );
  const report = buildAccessibilityCountsReport(
    result,
    "2026-07-24T00:00:00.000Z",
  );
  const serialized = JSON.stringify(report);
  assert.equal(report.scope.documentTextIncluded, false);
  assert.equal(report.scope.wcagConformanceEstablished, false);
  assert.ok(!serialized.includes("Project Orion"));
  assert.ok(!serialized.includes("Private client text"));
});
