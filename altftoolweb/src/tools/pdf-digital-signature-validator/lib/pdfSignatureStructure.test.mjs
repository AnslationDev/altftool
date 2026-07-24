import assert from "node:assert/strict";
import test from "node:test";

import {
  PDF_SIGNATURE_LIMITS,
  buildSignatureStructureReport,
  inspectPdfSignatureBytes,
  validatePdfSignatureFile,
} from "./pdfSignatureStructure.mjs";

const encoder = new TextEncoder();

function appendSignature(prefix = "%PDF-1.7\n", options = {}) {
  const contents = options.contents ?? "aAbBcCdD";
  const extraEntries = options.extraEntries ?? "";
  const byteRangeKey = options.byteRangeKey ?? "ByteRange";
  const contentsKey = options.contentsKey ?? "Contents";
  const dictionary = [
    "\n1 0 obj\n<< /Type /Sig",
    ` /${byteRangeKey} [0 0000000000 0000000000 0000000000]`,
    ` /${contentsKey} <${contents}>`,
    " /SubFilter /adbe.pkcs7.detached",
    " /Name (Private Signer)",
    " /Reason (Confidential approval)",
    " /Location (Private office)",
    " /M (D:20260724000000Z)",
    extraEntries,
    " >>\nendobj\n%%EOF\n",
  ].join("");
  let source = prefix + dictionary;
  const contentsStart = source.indexOf(`<${contents}>`, prefix.length);
  const contentsEnd = contentsStart + contents.length + 2;
  const revisionEnd = source.length;
  const values = [
    String(contentsStart).padStart(10, "0"),
    String(contentsEnd).padStart(10, "0"),
    String(revisionEnd - contentsEnd).padStart(10, "0"),
  ];
  source = source.replace("0000000000 0000000000 0000000000", values.join(" "));
  return source;
}

async function inspect(source) {
  const bytes = encoder.encode(source);
  return inspectPdfSignatureBytes(bytes, { fileSize: bytes.byteLength });
}

test("validates only non-empty bounded PDF selections", () => {
  assert.deepEqual(validatePdfSignatureFile({ name: "signed.PDF", size: 42 }), {
    ok: true,
    bytes: 42,
  });
  assert.equal(
    validatePdfSignatureFile({ name: "signed.txt", size: 42 }).ok,
    false,
  );
  assert.equal(
    validatePdfSignatureFile({ name: "empty.pdf", size: 0 }).ok,
    false,
  );
  assert.equal(
    validatePdfSignatureFile({
      name: "large.pdf",
      size: PDF_SIGNATURE_LIMITS.fileBytes + 1,
    }).ok,
    false,
  );
});

test("accepts upper- and lowercase Contents hex and hashes exact signed ranges", async () => {
  const result = await inspect(appendSignature());
  assert.equal(result.ok, true);
  assert.equal(result.summary.signatureDictionaries, 1);
  assert.equal(result.summary.structurallyInvalid, 0);
  assert.equal(result.signatures[0].contentsBytes, 4);
  assert.equal(result.signatures[0].byteRange.exactContentsGap, true);
  assert.match(result.signatures[0].signedRangeSha256, /^[a-f0-9]{64}$/u);
  assert.equal(result.verification.cmsSignatureVerified, false);
  assert.equal(result.verification.tamperFreeStatusEstablished, false);
});

test("rejects duplicate, negative, and fractional ByteRange values", async () => {
  const duplicated = await inspect(
    appendSignature("%PDF-1.7\n", {
      extraEntries: " /ByteRange [0 4 8 12]",
    }),
  );
  assert.equal(duplicated.signatures[0].structureStatus, "invalid");
  assert.match(duplicated.signatures[0].issues.join(" "), /duplicated/iu);

  const negativeSource = appendSignature().replace(
    /\/ByteRange \[[^\]]+\]/u,
    "/ByteRange [0 10 -2 5]",
  );
  const negative = await inspect(negativeSource);
  assert.match(
    negative.signatures[0].issues.join(" "),
    /non-negative integers/iu,
  );

  const fractionalSource = appendSignature().replace(
    /\/ByteRange \[[^\]]+\]/u,
    "/ByteRange [0 10 12.5 5]",
  );
  const fractional = await inspect(fractionalSource);
  assert.match(
    fractional.signatures[0].issues.join(" "),
    /non-negative integers/iu,
  );
});

test("rejects ByteRange overlap, reversed order, gaps, and out-of-bounds coverage", async () => {
  for (const replacement of [
    "/ByteRange [0 20 10 10]",
    "/ByteRange [0 10 10 10]",
    "/ByteRange [0 5 10 5 20 5]",
    "/ByteRange [0 10 999999 10]",
  ]) {
    const result = await inspect(
      appendSignature().replace(/\/ByteRange \[[^\]]+\]/u, replacement),
    );
    assert.equal(result.signatures[0].structureStatus, "invalid");
  }

  const wrongGap = await inspect(
    appendSignature().replace(
      /\/ByteRange \[[^\]]+\]/u,
      "/ByteRange [0 5 20 10]",
    ),
  );
  assert.match(wrongGap.signatures[0].issues.join(" "), /Contents string/iu);
});

test("rejects malformed direct ByteRange syntax and decodes legal PDF name escapes", async () => {
  const malformed = await inspect(
    appendSignature().replace(
      /\/ByteRange \[[^\]]+\]/u,
      "/ByteRange (0 10 20 10)",
    ),
  );
  assert.match(malformed.signatures[0].issues.join(" "), /direct array/iu);

  const escapedNames = appendSignature("%PDF-1.7\n", {
    byteRangeKey: "Byte#52ange",
    contentsKey: "Cont#65nts",
  });
  const escaped = await inspect(escapedNames);
  assert.equal(escaped.summary.signatureDictionaries, 1);
  assert.equal(escaped.summary.structurallyInvalid, 0);

  const unclosed = await inspect(
    "%PDF-1.7\n1 0 obj\n<< /Type /Sig /ByteRange [0 4 8 4] /Contents <aabb>",
  );
  assert.equal(unclosed.summary.signatureDictionaries, 1);
  assert.equal(unclosed.signatures[0].structureStatus, "invalid");
  assert.equal(unclosed.scan.unclosedDictionaryCount, 1);
});

test("distinguishes a prior signed revision from the current file end", async () => {
  const firstRevision = appendSignature();
  const secondRevision = appendSignature(firstRevision);
  const result = await inspect(secondRevision);
  assert.equal(result.summary.signatureDictionaries, 2);
  assert.equal(result.summary.priorRevisionCoverage, 1);
  assert.equal(result.summary.fullFileCoverage, 1);
  assert.equal(result.signatures[0].byteRange.trailingBytes > 0, true);
  assert.equal(result.signatures[1].byteRange.reachesCurrentFileEnd, true);
});

test("rejects odd, non-hexadecimal, and oversized Contents safely", async () => {
  const odd = await inspect(appendSignature("%PDF-1.7\n", { contents: "aBc" }));
  assert.match(odd.signatures[0].issues.join(" "), /odd number/iu);

  const invalid = await inspect(
    appendSignature("%PDF-1.7\n", { contents: "aag0" }),
  );
  assert.match(invalid.signatures[0].issues.join(" "), /non-hexadecimal/iu);

  const oversized = await inspect(
    appendSignature("%PDF-1.7\n", {
      contents: "aa".repeat(PDF_SIGNATURE_LIMITS.contentsHexDigits / 2 + 1),
    }),
  );
  assert.match(oversized.signatures[0].issues.join(" "), /inspection limit/iu);
});

test("ignores fake signature markers inside a recognizable stream", async () => {
  const fake = [
    "%PDF-1.7\n2 0 obj\n<< /Length 120 >>\nstream\n",
    "<< /Type /Sig /ByteRange [0 10 20 10] /Contents <aabb> >>",
    "\nendstream\nendobj\n",
  ].join("");
  const result = await inspect(appendSignature(fake));
  assert.equal(result.summary.signatureDictionaries, 1);
  assert.equal(result.scan.skippedRecognizableStreams, 1);
  assert.ok(
    result.limitations.some((value) => value.includes("malformed streams")),
  );
});

test("privacy report contains metadata presence counts but no private values or bytes", async () => {
  const result = await inspect(appendSignature());
  const report = buildSignatureStructureReport(
    result,
    "2026-07-24T00:00:00.000Z",
  );
  const serialized = JSON.stringify(report);
  assert.equal(report.scope.filenameIncluded, false);
  assert.equal(report.scope.rawContentsIncluded, false);
  assert.equal(report.scope.metadataValuesIncluded, false);
  assert.equal(report.summary.metadataPresenceCounts.name, 1);
  assert.ok(!serialized.includes("Private Signer"));
  assert.ok(!serialized.includes("Confidential approval"));
  assert.ok(!serialized.includes("Private office"));
  assert.ok(!serialized.includes("aAbBcCdD"));
});

test("rejects non-PDF bytes and declared-size mismatches before scanning", async () => {
  const plain = encoder.encode("not a PDF");
  assert.equal((await inspectPdfSignatureBytes(plain)).ok, false);

  const pdf = encoder.encode("%PDF-1.7\n");
  const mismatch = await inspectPdfSignatureBytes(pdf, {
    fileSize: pdf.byteLength + 1,
  });
  assert.equal(mismatch.ok, false);
  assert.match(mismatch.error, /do not match/iu);
});
