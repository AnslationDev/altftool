import assert from "node:assert/strict";
import test from "node:test";

import JSZip from "jszip";

import {
  MAX_OFFICE_FILE_BYTES,
  buildCountsOnlyRevisionReport,
  inspectOoxmlArchive,
  inspectOoxmlEntries,
} from "./inspectOoxml.mjs";

const PACKAGE_BASE = {
  "[Content_Types].xml":
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"/>',
  "_rels/.rels":
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>',
};

function counts(result) {
  return Object.fromEntries(
    result.checks.map((check) => [check.id, check.count]),
  );
}

test("counts generic Word revision, comment, metadata, hidden, and active-content evidence", () => {
  const secretAuthor = "Private Person";
  const secretTarget = "https://private.example/review";
  const result = inspectOoxmlEntries(
    {
      ...PACKAGE_BASE,
      "word/document.xml":
        '<w:document><w:ins/><w:del/><w:moveFrom/><w:rPr><w:vanish/><w:webHidden w:val="0"/></w:rPr></w:document>',
      "word/settings.xml": "<w:settings><w:trackRevisions/></w:settings>",
      "word/comments.xml":
        '<w:comments><w:comment w:id="1"/><w:comment w:id="2"/></w:comments>',
      "word/_rels/document.xml.rels": `<Relationships><Relationship TargetMode="External" Target="${secretTarget}"/></Relationships>`,
      "docProps/core.xml": `<cp:coreProperties><dc:title>Draft</dc:title><dc:creator>${secretAuthor}</dc:creator><cp:lastModifiedBy>Other Person</cp:lastModifiedBy></cp:coreProperties>`,
      "docProps/custom.xml": "<Properties><property/><property/></Properties>",
      "word/embeddings/private.xlsx": "",
      "word/vbaProject.bin": "",
      "word/activeX/activeX1.bin": "",
    },
    { fileName: "review.docm" },
  );
  const found = counts(result);

  assert.equal(result.ok, true);
  assert.equal(result.family, "word");
  assert.equal(found.trackedRevisionElements, 3);
  assert.equal(found.trackRevisionsEnabled, 1);
  assert.equal(found.commentsAndNotes, 2);
  assert.equal(found.populatedCoreProperties, 3);
  assert.equal(found.authorProperties, 2);
  assert.equal(found.customProperties, 2);
  assert.equal(found.hiddenTextMarkers, 1);
  assert.equal(found.embeddedFiles, 1);
  assert.equal(found.macroParts, 1);
  assert.equal(found.macroCapableContainer, 1);
  assert.equal(found.activeXParts, 1);
  assert.equal(found.externalRelationships, 1);

  const serialized = JSON.stringify(result);
  assert.equal(serialized.includes(secretAuthor), false);
  assert.equal(serialized.includes(secretTarget), false);
});

test("counts hidden Excel structures, comments, and revision parts", () => {
  const result = inspectOoxmlEntries(
    {
      ...PACKAGE_BASE,
      "xl/workbook.xml":
        '<workbook><sheets><sheet state="hidden"/><sheet state="veryHidden"/><sheet/></sheets></workbook>',
      "xl/worksheets/sheet1.xml":
        '<worksheet><cols><col min="2" max="4" hidden="1"/><col min="4" max="4" hidden="true"/></cols><sheetData><row r="2" hidden="true"/><row r="3" hidden="1"/></sheetData></worksheet>',
      "xl/comments1.xml": "<comments><comment/></comments>",
      "xl/threadedComments/threadedComment1.xml":
        "<threadedComments><threadedComment/></threadedComments>",
      "xl/revisions/revisionLog1.xml": "<revisions/>",
    },
    { fileName: "book.xlsx" },
  );
  const found = counts(result);

  assert.equal(result.ok, true);
  assert.equal(result.family, "spreadsheet");
  assert.equal(found.hiddenSheets, 1);
  assert.equal(found.veryHiddenSheets, 1);
  assert.equal(found.hiddenRows, 2);
  assert.equal(found.hiddenColumns, 3);
  assert.equal(found.commentsAndNotes, 2);
  assert.equal(found.revisionParts, 1);
});

test("counts hidden PowerPoint slides, comments, and speaker-note parts", () => {
  const result = inspectOoxmlEntries(
    {
      ...PACKAGE_BASE,
      "ppt/presentation.xml":
        '<p:presentation><p:sldIdLst><p:sldId show="0"/><p:sldId/></p:sldIdLst></p:presentation>',
      "ppt/slides/slide1.xml": '<p:sld show="0"/>',
      "ppt/slides/slide2.xml": "<p:sld/>",
      "ppt/notesSlides/notesSlide1.xml": "<p:notes/>",
      "ppt/notesSlides/notesSlide2.xml": "<p:notes/>",
      "ppt/comments/comment1.xml": "<p:cmLst><p:cm/><p:cm/></p:cmLst>",
    },
    { fileName: "deck.pptx" },
  );
  const found = counts(result);

  assert.equal(result.ok, true);
  assert.equal(result.family, "presentation");
  assert.equal(found.hiddenSlides, 1);
  assert.equal(found.speakerNotesParts, 2);
  assert.equal(found.commentsAndNotes, 2);
});

test("loads a real JSZip archive without exposing XML contents", async () => {
  const zip = new JSZip();
  zip.file("[Content_Types].xml", PACKAGE_BASE["[Content_Types].xml"]);
  zip.file("_rels/.rels", PACKAGE_BASE["_rels/.rels"]);
  zip.file("word/document.xml", "<w:document><w:ins/></w:document>");
  const bytes = await zip.generateAsync({ type: "uint8array" });

  const result = await inspectOoxmlArchive(bytes, {
    fileName: "local.docx",
    fileSize: bytes.byteLength,
  });

  assert.equal(result.ok, true);
  assert.equal(result.family, "word");
  assert.equal(counts(result).trackedRevisionElements, 1);
});

test("rejects unsupported extensions, oversized input, and incomplete OOXML ZIPs", async () => {
  const unsupported = await inspectOoxmlArchive(new Uint8Array([1]), {
    fileName: "legacy.doc",
  });
  assert.equal(unsupported.ok, false);
  assert.match(unsupported.error, /DOCX/iu);

  const oversized = await inspectOoxmlArchive(new Uint8Array([1]), {
    fileName: "large.docx",
    fileSize: MAX_OFFICE_FILE_BYTES + 1,
  });
  assert.equal(oversized.ok, false);
  assert.match(oversized.error, /20 MB/iu);

  const incomplete = inspectOoxmlEntries(
    { "word/document.xml": "<w:document/>" },
    { fileName: "incomplete.docx" },
  );
  assert.equal(incomplete.ok, false);
  assert.match(incomplete.error, /complete OOXML/iu);
});

test("counts-only export excludes source values, targets, package paths, and file names", () => {
  const secret = "CONFIDENTIAL-8675309";
  const result = inspectOoxmlEntries(
    {
      ...PACKAGE_BASE,
      "word/document.xml": `<w:document><w:t>${secret}</w:t></w:document>`,
      "docProps/core.xml": `<cp:coreProperties><dc:creator>${secret}</dc:creator></cp:coreProperties>`,
      "word/_rels/document.xml.rels": `<Relationships><Relationship TargetMode="External" Target="https://${secret}.example"/></Relationships>`,
    },
    { fileName: `${secret}.docx` },
  );
  const report = buildCountsOnlyRevisionReport(
    result,
    "2026-07-24T00:00:00.000Z",
  );
  const serialized = JSON.stringify(report);

  assert.equal(report.reportType, "hidden-revision-inspection-counts-only");
  assert.equal(serialized.includes(secret), false);
  assert.equal(serialized.includes("word/document.xml"), false);
  assert.equal("checks" in report, false);
});
