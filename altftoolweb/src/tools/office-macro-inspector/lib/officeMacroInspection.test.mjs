import assert from "node:assert/strict";
import test from "node:test";

import JSZip from "jszip";

import {
  OFFICE_MACRO_LIMITS,
  buildOfficeMacroCountsReport,
  inspectOfficeMacroBytes,
  validateOfficeMacroFile,
} from "./officeMacroInspection.mjs";

const CONTENT_TYPES_BASE =
  '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"></Types>';
const ROOT_RELS =
  '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>';

async function ooxmlBytes(entries = {}) {
  const zip = new JSZip();
  zip.file("[Content_Types].xml", CONTENT_TYPES_BASE);
  zip.file("_rels/.rels", ROOT_RELS);
  Object.entries(entries).forEach(([name, value]) => zip.file(name, value));
  return zip.generateAsync({ type: "uint8array" });
}

function utf16Bytes(value, { littleEndian, bom = true }) {
  const text = String(value);
  const bytes = new Uint8Array((bom ? 2 : 0) + text.length * 2);
  let offset = 0;
  if (bom) {
    bytes[0] = littleEndian ? 0xff : 0xfe;
    bytes[1] = littleEndian ? 0xfe : 0xff;
    offset = 2;
  }
  for (let index = 0; index < text.length; index += 1) {
    const valueAtIndex = text.charCodeAt(index);
    bytes[offset] = littleEndian ? valueAtIndex & 0xff : valueAtIndex >>> 8;
    bytes[offset + 1] = littleEndian ? valueAtIndex >>> 8 : valueAtIndex & 0xff;
    offset += 2;
  }
  return bytes;
}

function patchCentralEntry(bytes, targetName, mutate) {
  const copy = new Uint8Array(bytes);
  const view = new DataView(copy.buffer);
  for (let offset = 0; offset <= copy.byteLength - 46; offset += 1) {
    if (view.getUint32(offset, true) !== 0x02014b50) continue;
    const nameLength = view.getUint16(offset + 28, true);
    const name = new TextDecoder().decode(
      copy.subarray(offset + 46, offset + 46 + nameLength),
    );
    if (name !== targetName) continue;
    mutate(view, offset);
    return copy;
  }
  throw new Error(`Central entry not found: ${targetName}`);
}

function replaceAscii(bytes, from, to) {
  assert.equal(from.length, to.length);
  const copy = new Uint8Array(bytes);
  const needle = new TextEncoder().encode(from);
  const replacement = new TextEncoder().encode(to);
  let replacements = 0;
  for (let offset = 0; offset <= copy.byteLength - needle.byteLength; ) {
    const matches = needle.every(
      (value, index) => copy[offset + index] === value,
    );
    if (!matches) {
      offset += 1;
      continue;
    }
    copy.set(replacement, offset);
    replacements += 1;
    offset += needle.byteLength;
  }
  return { bytes: copy, replacements };
}

test("detects VBA path, content-type, and relationship cues in macro-enabled OOXML", async () => {
  const secret = "PRIVATE-MACRO-NAME";
  const bytes = await ooxmlBytes({
    "[Content_Types].xml":
      '<Types><Override PartName="/word/vbaProject.bin" ContentType="application/vnd.ms-office.vbaProject"/><Override PartName="/word/document.xml" ContentType="application/vnd.ms-word.document.macroEnabled.main+xml"/></Types>',
    "word/document.xml": `<w:document><w:t>${secret}</w:t></w:document>`,
    "word/vbaProject.bin": "not-opened",
    "word/_rels/document.xml.rels":
      '<Relationships><Relationship Type="http://schemas.microsoft.com/office/2006/relationships/vbaProject" Target="vbaProject.bin"/></Relationships>',
  });
  const result = await inspectOfficeMacroBytes(bytes, {
    fileName: "sample.docm",
    fileSize: bytes.byteLength,
  });

  assert.equal(result.ok, true);
  assert.equal(result.evidenceLevel, "macro-related-package-cues-observed");
  assert.equal(result.summary.macroPartPaths, 1);
  assert.equal(result.summary.vbaContentTypeCues, 1);
  assert.equal(result.summary.vbaRelationshipCues, 1);
  assert.equal(JSON.stringify(result).includes(secret), false);
});

test("decodes UTF-16LE and UTF-16BE OOXML metadata before inspecting cues", async () => {
  const zip = new JSZip();
  zip.file(
    "[Content_Types].xml",
    utf16Bytes(
      '<?xml version="1.0" encoding="UTF-16"?><Types><Override PartName="/word/vbaProject.bin" ContentType="application/vnd.ms-office.vbaProject"/></Types>',
      { littleEndian: true },
    ),
  );
  zip.file(
    "_rels/.rels",
    utf16Bytes(
      '<?xml version="1.0" encoding="UTF-16BE"?><Relationships><Relationship Type="http://schemas.microsoft.com/office/2006/relationships/vbaProject" Target="word/vbaProject.bin"/></Relationships>',
      { littleEndian: false },
    ),
  );
  zip.file("word/payload.bin", "not-opened");
  const bytes = await zip.generateAsync({ type: "uint8array" });
  const result = await inspectOfficeMacroBytes(bytes, {
    fileName: "encoded.docx",
    fileSize: bytes.byteLength,
  });

  assert.equal(result.ok, true);
  assert.equal(result.summary.vbaContentTypeCues, 1);
  assert.equal(result.summary.vbaRelationshipCues, 1);
  assert.equal(result.evidenceLevel, "macro-related-package-cues-observed");
  assert.equal(result.warnings.length, 1);
  assert.match(result.warnings[0], /conflict/iu);
});

test("marks conflicting OOXML XML encodings as an incomplete selected-part read", async () => {
  const bytes = await ooxmlBytes({
    "[Content_Types].xml":
      '<?xml version="1.0" encoding="UTF-16"?><Types><Override ContentType="application/vnd.ms-office.vbaProject"/></Types>',
  });
  const result = await inspectOfficeMacroBytes(bytes, {
    fileName: "conflicting.docx",
    fileSize: bytes.byteLength,
  });

  assert.equal(result.ok, true);
  assert.equal(result.summary.vbaContentTypeCues, 0);
  assert.equal(
    result.warnings.some((item) => /selected XML metadata part/iu.test(item)),
    true,
  );
});

test("distinguishes a macro-capable extension from direct macro evidence", async () => {
  const bytes = await ooxmlBytes({
    "word/document.xml": "<w:document/>",
  });
  const result = await inspectOfficeMacroBytes(bytes, {
    fileName: "empty.docm",
    fileSize: bytes.byteLength,
  });

  assert.equal(result.ok, true);
  assert.equal(result.extensionMacroCapable, true);
  assert.equal(result.evidenceLevel, "macro-capable-container-cues-only");
  assert.equal(result.summary.macroPartPaths, 0);
  assert.equal(
    result.observations.some((item) => /macro-capable/iu.test(item)),
    true,
  );
});

test("reports no selected cue cautiously for an ordinary OOXML package", async () => {
  const bytes = await ooxmlBytes({
    "xl/workbook.xml": "<workbook/>",
  });
  const result = await inspectOfficeMacroBytes(bytes, {
    fileName: "book.xlsx",
    fileSize: bytes.byteLength,
  });

  assert.equal(result.ok, true);
  assert.equal(result.evidenceLevel, "no-selected-macro-cues-observed");
  assert.match(result.observations[0], /No selected/iu);
  assert.equal(
    result.limitations.some((item) => /does not prove/iu.test(item)),
    true,
  );
});

test("flags macro cues that conflict with a macro-free filename extension", async () => {
  const bytes = await ooxmlBytes({
    "xl/workbook.xml": "<workbook/>",
    "xl/vbaProject.bin": "not-opened",
  });
  const result = await inspectOfficeMacroBytes(bytes, {
    fileName: "book.xlsx",
    fileSize: bytes.byteLength,
  });

  assert.equal(result.ok, true);
  assert.equal(result.summary.macroPartPaths, 1);
  assert.equal(
    result.warnings.some((item) => /conflict/iu.test(item)),
    true,
  );
});

test("does not confuse VBA signature suffixes or XML comments with exact VBA project cues", async () => {
  const bytes = await ooxmlBytes({
    "[Content_Types].xml":
      '<Types><!-- ContentType="application/vnd.ms-office.vbaProject" --><Override PartName="/word/vbaProjectSignature.bin" ContentType="application/vnd.ms-office.vbaProjectSignature"/></Types>',
    "word/document.xml": "<w:document/>",
    "word/_rels/document.xml.rels":
      '<Relationships><Relationship Type="http://schemas.microsoft.com/office/2006/relationships/vbaProjectSignature" Target="vbaProjectSignature.bin"/></Relationships>',
  });
  const result = await inspectOfficeMacroBytes(bytes, {
    fileName: "signed.docx",
    fileSize: bytes.byteLength,
  });

  assert.equal(result.ok, true);
  assert.equal(result.summary.vbaContentTypeCues, 0);
  assert.equal(result.summary.vbaRelationshipCues, 0);
  assert.equal(result.evidenceLevel, "no-selected-macro-cues-observed");
});

test("counts macro sheets, VBA supplemental data, ActiveX, and external relationships", async () => {
  const bytes = await ooxmlBytes({
    "xl/workbook.xml": "<workbook/>",
    "xl/macrosheets/sheet1.bin": "not-opened",
    "xl/vbaData.xml": "<data/>",
    "xl/activeX/activeX1.bin": "not-opened",
    "xl/_rels/workbook.xml.rels":
      '<Relationships><Relationship TargetMode="External" Target="https://private.example"/></Relationships>',
  });
  const result = await inspectOfficeMacroBytes(bytes, {
    fileName: "book.xlsm",
    fileSize: bytes.byteLength,
  });

  assert.equal(result.ok, true);
  assert.equal(result.summary.macroSheetParts, 1);
  assert.equal(result.summary.vbaDataParts, 1);
  assert.equal(result.summary.activeXParts, 1);
  assert.equal(result.summary.externalRelationships, 1);
  assert.equal(JSON.stringify(result).includes("private.example"), false);
});

test("handles legacy OLE as signature and bounded strings only", async () => {
  const signature = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];
  const tail = new TextEncoder().encode("noise VBAProject more");
  const bytes = new Uint8Array(signature.length + tail.length);
  bytes.set(signature);
  bytes.set(tail, signature.length);
  const result = await inspectOfficeMacroBytes(bytes, {
    fileName: "legacy.doc",
    fileSize: bytes.byteLength,
  });

  assert.equal(result.ok, true);
  assert.equal(result.format, "legacy-ole");
  assert.equal(result.evidenceLevel, "legacy-signature-and-strings-only");
  assert.equal(result.summary.legacyStringCues > 0, true);
  assert.equal(
    result.warnings.some((item) => /not parsed/iu.test(item)),
    true,
  );
});

test("rejects renamed non-Office bytes and incomplete OOXML packages", async () => {
  const invalid = await inspectOfficeMacroBytes(
    new TextEncoder().encode("not office"),
    { fileName: "renamed.docm", fileSize: 10 },
  );
  assert.equal(invalid.ok, false);
  assert.match(invalid.error, /signature/iu);

  const zip = new JSZip();
  zip.file("word/document.xml", "<w:document/>");
  const incompleteBytes = await zip.generateAsync({ type: "uint8array" });
  const incomplete = await inspectOfficeMacroBytes(incompleteBytes, {
    fileName: "incomplete.docm",
    fileSize: incompleteBytes.byteLength,
  });
  assert.equal(incomplete.ok, false);
  assert.match(incomplete.error, /required root OOXML/iu);
});

test("rejects unsafe OOXML paths before JSZip metadata expansion", async () => {
  const zip = new JSZip();
  zip.file("[Content_Types].xml", CONTENT_TYPES_BASE, {
    createFolders: false,
  });
  zip.file("_rels/.rels", ROOT_RELS, { createFolders: false });
  zip.file("../word/vbaProject.bin", "never-opened", {
    createFolders: false,
  });
  const bytes = await zip.generateAsync({ type: "uint8array" });
  const result = await inspectOfficeMacroBytes(bytes, {
    fileName: "unsafe.docm",
    fileSize: bytes.byteLength,
  });

  assert.equal(result.ok, false);
  assert.match(result.error, /unsafe path/iu);
});

test("rejects duplicate OOXML metadata parts before JSZip can collapse macro evidence", async () => {
  const zip = new JSZip();
  zip.file(
    "[Content_Types].xml",
    '<Types><Override PartName="/word/vbaProject.bin" ContentType="application/vnd.ms-office.vbaProject"/></Types>',
  );
  zip.file("[Content_Types].xm1", CONTENT_TYPES_BASE);
  zip.file("_rels/.rels", ROOT_RELS);
  const original = await zip.generateAsync({ type: "uint8array" });
  const patched = replaceAscii(
    original,
    "[Content_Types].xm1",
    "[Content_Types].xml",
  );
  assert.equal(patched.replacements, 2);

  const result = await inspectOfficeMacroBytes(patched.bytes, {
    fileName: "ambiguous.docm",
    fileSize: patched.bytes.byteLength,
  });
  assert.equal(result.ok, false);
  assert.match(result.error, /metadata|expanded/iu);
  assert.equal(result.preflightCounts.duplicateNames, 1);
});

test("stops selected XML expansion at the measured byte cap even when headers under-declare it", async () => {
  const zip = new JSZip();
  zip.file(
    "[Content_Types].xml",
    `<Types>${" ".repeat(OFFICE_MACRO_LIMITS.selectedXmlPartBytes + 32_768)}</Types>`,
    { createFolders: false },
  );
  zip.file("_rels/.rels", ROOT_RELS, { createFolders: false });
  const generated = await zip.generateAsync({
    type: "uint8array",
    compression: "DEFLATE",
    compressionOptions: { level: 9 },
  });
  const bytes = patchCentralEntry(
    generated,
    "[Content_Types].xml",
    (view, offset) => {
      view.setUint32(offset + 24, 1, true);
    },
  );
  const result = await inspectOfficeMacroBytes(bytes, {
    fileName: "bounded.docx",
    fileSize: bytes.byteLength,
  });

  assert.equal(result.ok, true);
  assert.equal(result.summary.selectedXmlParts, 1);
  assert.equal(
    result.warnings.some((item) => /selected XML metadata part/iu.test(item)),
    true,
  );
});

test("rejects unsupported extensions, empty files, and oversized selections", () => {
  assert.equal(
    validateOfficeMacroFile({ name: "sample.docm", size: 1 }).ok,
    true,
  );
  assert.equal(
    validateOfficeMacroFile({ name: "sample.xlam", size: 1 }).ok,
    true,
  );
  assert.equal(
    validateOfficeMacroFile({ name: "sample.txt", size: 1 }).ok,
    false,
  );
  assert.equal(
    validateOfficeMacroFile({ name: "empty.xlsm", size: 0 }).ok,
    false,
  );
  assert.equal(
    validateOfficeMacroFile({
      name: "large.pptm",
      size: OFFICE_MACRO_LIMITS.fileBytes + 1,
    }).ok,
    false,
  );
});

test("counts-only export excludes filenames, XML values, targets, and observations", async () => {
  const secret = "CONFIDENTIAL-OFFICE-8675309";
  const bytes = await ooxmlBytes({
    "word/document.xml": `<w:document>${secret}</w:document>`,
    "word/_rels/document.xml.rels": `<Relationships><Relationship TargetMode="External" Target="https://${secret}.example"/></Relationships>`,
  });
  const result = await inspectOfficeMacroBytes(bytes, {
    fileName: `${secret}.docx`,
    fileSize: bytes.byteLength,
  });
  const report = buildOfficeMacroCountsReport(
    result,
    "2026-07-24T00:00:00.000Z",
  );
  const serialized = JSON.stringify(report);

  assert.equal(report.reportType, "office-macro-cue-counts-only");
  assert.equal(serialized.includes(secret), false);
  assert.equal("observations" in report, false);
  assert.equal("legacyCueCounts" in report, false);
});
