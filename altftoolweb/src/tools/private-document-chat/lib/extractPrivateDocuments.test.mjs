import assert from "node:assert/strict";
import test from "node:test";

import JSZip from "jszip";

import {
  extractPrivateDocument,
  preflightDocxArchive,
} from "./extractPrivateDocuments.js";

test("preflights a recognizable bounded DOCX package", async () => {
  const zip = new JSZip();
  zip.file("[Content_Types].xml", "<Types/>");
  zip.file("word/document.xml", "<w:document/>");
  const bytes = await zip.generateAsync({ type: "arraybuffer" });
  const result = await preflightDocxArchive(bytes);
  assert.equal(result.entries, 2);
  assert.ok(result.expandedBytes > 0);
});

test("rejects a ZIP that is not a DOCX package", async () => {
  const zip = new JSZip();
  zip.file("notes.txt", "not a Word document");
  const bytes = await zip.generateAsync({ type: "arraybuffer" });
  await assert.rejects(
    () => preflightDocxArchive(bytes),
    /not a recognizable DOCX/u,
  );
});

test("extracts bounded DOCX text without handing the package to a second parser", async () => {
  const zip = new JSZip();
  zip.file("[Content_Types].xml", "<Types/>");
  zip.file(
    "word/document.xml",
    [
      "<w:document><w:body>",
      "<w:p><w:r><w:t>Local &amp; private</w:t></w:r></w:p>",
      "<w:p><w:r><w:t>Second line</w:t></w:r></w:p>",
      "</w:body></w:document>",
    ].join(""),
  );
  const bytes = await zip.generateAsync({ type: "arraybuffer" });
  const result = await extractPrivateDocument(
    {
      name: "notes.docx",
      size: bytes.byteLength,
      arrayBuffer: async () => bytes,
    },
    {
      remainingCharacters: 10_000,
      shouldContinue: () => true,
    },
  );
  assert.equal(result.format, "DOCX");
  assert.equal(result.sections[0].text, "Local & private\nSecond line");
});
