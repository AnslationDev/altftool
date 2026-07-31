import assert from "node:assert/strict";
import test from "node:test";

import {
  PDF_ACTIVE_CONTENT_LIMITS,
  buildPdfActiveContentCountsReport,
  inspectPdfActiveContentBytes,
  validatePdfActiveContentFile,
} from "./pdfActiveContent.mjs";

function pdfBytes(body) {
  return new TextEncoder().encode(`%PDF-1.7\n${body}\n%%EOF`);
}

function group(result, id) {
  return result.groups.find((item) => item.id === id);
}

test("counts selected active-content names outside values", () => {
  const bytes = pdfBytes(`
    1 0 obj
    << /OpenAction 2 0 R /AcroForm 3 0 R /Names << /EmbeddedFiles 4 0 R >> >>
    endobj
    2 0 obj << /S /JavaScript /JS (hidden script) >> endobj
    3 0 obj << /XFA 5 0 R /AA << /K 6 0 R >> >> endobj
    7 0 obj << /S /Launch /F (ignored) >> endobj
    8 0 obj << /S /URI /URI (https://private.example) >> endobj
    9 0 obj << /Subtype /RichMedia /AF [10 0 R] >> endobj
  `);
  const result = inspectPdfActiveContentBytes(bytes, {
    fileName: "sample.pdf",
    fileSize: bytes.byteLength,
  });

  assert.equal(result.ok, true);
  assert.equal(group(result, "javascript").count, 2);
  assert.equal(group(result, "automaticActions").count, 2);
  assert.equal(group(result, "launchActions").count, 1);
  assert.equal(group(result, "externalReferences").count, 2);
  assert.equal(group(result, "attachments").count, 2);
  assert.equal(group(result, "forms").count, 2);
  assert.equal(group(result, "richMedia").count, 1);
});

test("ignores marker-like text in comments, literal strings, hex strings, and streams", () => {
  const bytes = pdfBytes(`
    % /JavaScript /Launch /EmbeddedFile
    1 0 obj << /Title (/JavaScript (/URI) escaped \\( /XFA) /Data <2f4a617661536372697074> /Length 45 >>
    stream
    /JavaScript /OpenAction /RichMedia /Launch
    endstream
    endobj
    2 0 obj << /Type /Catalog >> endobj
  `);
  const result = inspectPdfActiveContentBytes(bytes, {
    fileName: "values.pdf",
    fileSize: bytes.byteLength,
  });

  assert.equal(result.ok, true);
  assert.equal(result.summary.selectedMarkerCount, 0);
  assert.equal(result.summary.commentsSkipped >= 1, true);
  assert.equal(result.summary.literalStringsSkipped, 1);
  assert.equal(result.summary.hexStringsSkipped, 1);
  assert.equal(result.summary.streamsSkipped, 1);
});

test("decodes hexadecimal escapes in PDF name tokens", () => {
  const bytes = pdfBytes(
    "1 0 obj << /S /Java#53cript /Open#41ction 2 0 R >> endobj",
  );
  const result = inspectPdfActiveContentBytes(bytes, {
    fileName: "escaped.pdf",
    fileSize: bytes.byteLength,
  });

  assert.equal(group(result, "javascript").count, 1);
  assert.equal(group(result, "automaticActions").count, 1);
});

test("counts submission, remote navigation, attachment, media, and named-command cues", () => {
  const bytes = pdfBytes(`
    << /S /SubmitForm >>
    << /S /ImportData >>
    << /S /GoToR >>
    << /Type /Filespec /EF << /F 1 0 R >> >>
    << /Type /EmbeddedFile >>
    << /Subtype /Movie >>
    << /Subtype /Sound >>
    << /Subtype /3D >>
    << /S /Named >>
  `);
  const result = inspectPdfActiveContentBytes(bytes, {
    fileName: "groups.pdf",
    fileSize: bytes.byteLength,
  });

  assert.equal(group(result, "submissionActions").count, 2);
  assert.equal(group(result, "externalReferences").count, 1);
  assert.equal(group(result, "attachments").count, 2);
  assert.equal(group(result, "richMedia").count, 3);
  assert.equal(group(result, "namedCommands").count, 1);
});

test("warns when encryption and object streams can hide cues", () => {
  const bytes = pdfBytes(
    "trailer << /Encrypt 2 0 R >> 3 0 obj << /Type /ObjStm >> endobj",
  );
  const result = inspectPdfActiveContentBytes(bytes, {
    fileName: "opaque.pdf",
    fileSize: bytes.byteLength,
  });

  assert.equal(result.summary.encryptedCues, 1);
  assert.equal(result.summary.objectStreamCues, 1);
  assert.equal(
    result.warnings.some((item) => /Encrypt/iu.test(item)),
    true,
  );
  assert.equal(
    result.warnings.some((item) => /Object-stream/iu.test(item)),
    true,
  );
});

test("keeps scanning past an unterminated stream instead of aborting the file", () => {
  // Regression test: an unterminated "stream" token must not silently
  // truncate the scan. Real active-content markers placed after a
  // malformed/never-closed stream have to still be found.
  const bytes = pdfBytes(
    "1 0 obj << /Length 999999 >> stream\nBINARYJUNKNOTERMINATOR\n2 0 obj << /OpenAction 3 0 R >> endobj\n3 0 obj << /S /JavaScript /JS (evil()) >> endobj\n4 0 obj << /Type /Filespec /F (payload.exe) >> endobj",
  );
  const result = inspectPdfActiveContentBytes(bytes, {
    fileName: "broken.pdf",
    fileSize: bytes.byteLength,
  });

  assert.equal(result.ok, true);
  assert.equal(group(result, "javascript").count, 2);
  assert.equal(group(result, "automaticActions").count, 1);
  assert.equal(group(result, "attachments").count, 1);
  assert.equal(result.summary.selectedMarkerCount, 4);
  assert.equal(
    result.warnings.some((item) => /had no bounded endstream marker/iu.test(item)),
    true,
  );
});

test("rejects renamed input, empty input, missing PDF header, and oversize metadata", () => {
  assert.equal(
    validatePdfActiveContentFile({ name: "sample.txt", size: 1 }).ok,
    false,
  );
  assert.equal(
    validatePdfActiveContentFile({ name: "sample.pdf", size: 0 }).ok,
    false,
  );
  assert.equal(
    validatePdfActiveContentFile({
      name: "sample.pdf",
      size: PDF_ACTIVE_CONTENT_LIMITS.fileBytes + 1,
    }).ok,
    false,
  );
  const bytes = new TextEncoder().encode("not a pdf");
  const result = inspectPdfActiveContentBytes(bytes, {
    fileName: "renamed.pdf",
    fileSize: bytes.byteLength,
  });
  assert.equal(result.ok, false);
  assert.match(result.error, /header/iu);
});

test("counts-only export excludes scripts, URLs, strings, and source filename", () => {
  const secret = "PRIVATE-PDF-8675309";
  const bytes = pdfBytes(
    `1 0 obj << /S /JavaScript /JS (${secret}) /URI (https://${secret}.example) >> endobj`,
  );
  const result = inspectPdfActiveContentBytes(bytes, {
    fileName: `${secret}.pdf`,
    fileSize: bytes.byteLength,
  });
  const report = buildPdfActiveContentCountsReport(
    result,
    "2026-07-24T00:00:00.000Z",
  );
  const serialized = JSON.stringify(report);

  assert.equal(report.reportType, "pdf-active-content-cue-counts-only");
  assert.equal(serialized.includes(secret), false);
  assert.equal("findings" in report, false);
});

test("no-marker result retains explicit non-verdict limitations", () => {
  const bytes = pdfBytes("1 0 obj << /Type /Catalog >> endobj");
  const result = inspectPdfActiveContentBytes(bytes, {
    fileName: "plain.pdf",
    fileSize: bytes.byteLength,
  });

  assert.equal(result.ok, true);
  assert.equal(result.summary.selectedMarkerCount, 0);
  assert.equal(
    result.limitations.some((item) => /does not prove/iu.test(item)),
    true,
  );
  assert.equal(
    result.limitations.some((item) => /malware-free/iu.test(item)),
    true,
  );
});
