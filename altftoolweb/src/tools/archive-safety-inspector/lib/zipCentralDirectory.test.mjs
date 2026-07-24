import assert from "node:assert/strict";
import test from "node:test";

import JSZip from "jszip";

import {
  ZIP_INSPECTION_LIMITS,
  buildArchiveCountsReport,
  inspectArchiveBytes,
  preflightZipCentralDirectory,
  validateArchiveFile,
} from "./zipCentralDirectory.mjs";

async function zipBytes(files, options = {}) {
  const zip = new JSZip();
  Object.entries(files).forEach(([name, value]) =>
    zip.file(name, value, { createFolders: false }),
  );
  return zip.generateAsync({
    type: "uint8array",
    compression: options.compression || "STORE",
    compressionOptions: { level: 9 },
  });
}

function patchFirstCentral(bytes, mutator) {
  const copy = new Uint8Array(bytes);
  const view = new DataView(copy.buffer);
  let offset = -1;
  for (let index = 0; index <= copy.byteLength - 4; index += 1) {
    if (view.getUint32(index, true) === 0x02014b50) {
      offset = index;
      break;
    }
  }
  assert.notEqual(offset, -1);
  mutator(view, offset);
  return copy;
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

function zipWithCentralZip64Extra(extraBytes) {
  const name = new TextEncoder().encode("a.txt");
  const payload = new TextEncoder().encode("x");
  const local = new Uint8Array(30 + name.byteLength + payload.byteLength);
  const localView = new DataView(local.buffer);
  localView.setUint32(0, 0x04034b50, true);
  localView.setUint16(4, 20, true);
  localView.setUint32(18, payload.byteLength, true);
  localView.setUint32(22, payload.byteLength, true);
  localView.setUint16(26, name.byteLength, true);
  local.set(name, 30);
  local.set(payload, 30 + name.byteLength);

  const central = new Uint8Array(
    46 + name.byteLength + extraBytes.byteLength,
  );
  const centralView = new DataView(central.buffer);
  centralView.setUint32(0, 0x02014b50, true);
  centralView.setUint16(4, 20, true);
  centralView.setUint16(6, 20, true);
  centralView.setUint32(20, payload.byteLength, true);
  centralView.setUint32(24, 0xffffffff, true);
  centralView.setUint16(28, name.byteLength, true);
  centralView.setUint16(30, extraBytes.byteLength, true);
  central.set(name, 46);
  central.set(extraBytes, 46 + name.byteLength);

  const eocd = new Uint8Array(22);
  const eocdView = new DataView(eocd.buffer);
  eocdView.setUint32(0, 0x06054b50, true);
  eocdView.setUint16(8, 1, true);
  eocdView.setUint16(10, 1, true);
  eocdView.setUint32(12, central.byteLength, true);
  eocdView.setUint32(16, local.byteLength, true);

  const bytes = new Uint8Array(
    local.byteLength + central.byteLength + eocd.byteLength,
  );
  bytes.set(local);
  bytes.set(central, local.byteLength);
  bytes.set(eocd, local.byteLength + central.byteLength);
  return bytes;
}

test("preflights an ordinary ZIP without extracting entries", async () => {
  const bytes = await zipBytes({
    "docs/readme.txt": "hello",
    "images/pixel.png": "not-an-image",
  });
  const result = preflightZipCentralDirectory(bytes);

  assert.equal(result.ok, true);
  assert.equal(result.summary.fileEntries, 2);
  assert.equal(result.summary.totalDeclaredExpandedBytes, 17);
  assert.equal(result.counts.pathTraversal, 0);
  assert.equal(result.expansionAllowed, true);
});

test("reports traversal, absolute, control-character, and double-extension names", async () => {
  const bytes = await zipBytes({
    "../escape.txt": "x",
    "/root/place.txt": "x",
    "invoice.pdf.exe": "x",
    "odd\u0001name.txt": "x",
  });
  const result = preflightZipCentralDirectory(bytes);

  assert.equal(result.ok, true);
  assert.equal(result.counts.pathTraversal, 1);
  assert.equal(result.counts.absolutePaths, 1);
  assert.equal(result.counts.suspiciousExtensions, 1);
  assert.equal(result.counts.doubleExtensions, 1);
  assert.equal(result.counts.controlCharacterNames, 1);
  assert.equal(result.expansionAllowed, false);
});

test("observes a Unix symlink from portable external attributes", async () => {
  const original = await zipBytes({ link: "target" });
  const bytes = patchFirstCentral(original, (view, offset) => {
    view.setUint16(offset + 4, (3 << 8) | 20, true);
    view.setUint32(offset + 38, 0xa1ff0000, true);
  });
  const result = preflightZipCentralDirectory(bytes);

  assert.equal(result.ok, true);
  assert.equal(result.counts.symlinks, 1);
  assert.equal(result.entries[0].symlink, true);
});

test("reports encrypted and unsupported entry flags before follow-on expansion", async () => {
  const original = await zipBytes({ "payload.bin": "value" });
  const bytes = patchFirstCentral(original, (view, offset) => {
    view.setUint16(offset + 8, 1, true);
    view.setUint16(offset + 10, 93, true);
  });
  const result = preflightZipCentralDirectory(bytes);

  assert.equal(result.ok, true);
  assert.equal(result.counts.encryptedEntries, 1);
  assert.equal(result.counts.unsupportedCompression, 1);
  assert.equal(result.expansionAllowed, false);
});

test("blocks follow-on expansion when a central entry points outside a valid local header", async () => {
  const original = await zipBytes({ "payload.txt": "value" });
  const bytes = patchFirstCentral(original, (view, offset) => {
    view.setUint32(offset + 42, offset, true);
  });
  const result = preflightZipCentralDirectory(bytes);

  assert.equal(result.ok, true);
  assert.equal(result.counts.invalidLocalHeaders, 1);
  assert.equal(result.expansionAllowed, false);
});

test("detects an unsafe local filename that conflicts with a safe central filename", async () => {
  const original = await zipBytes({ "safe.txt": "value" });
  const bytes = new Uint8Array(original);
  bytes.set(new TextEncoder().encode("../a.txt"), 30);
  const result = preflightZipCentralDirectory(bytes);

  assert.equal(result.ok, true);
  assert.equal(result.counts.pathTraversal, 1);
  assert.equal(result.counts.invalidLocalHeaders, 1);
  assert.equal(result.entries[0].localNameMismatch, true);
  assert.equal(result.expansionAllowed, false);
});

test("uses a validated Info-ZIP Unicode path and blocks traversal hidden behind a safe raw name", async () => {
  const zip = new JSZip();
  zip.file("../é.txt", "never-expanded", { createFolders: false });
  const bytes = await zip.generateAsync({
    type: "uint8array",
    encodeFileName: () => new TextEncoder().encode("safe.txt"),
  });
  const result = preflightZipCentralDirectory(bytes);

  assert.equal(result.ok, true);
  assert.equal(result.entries[0].unicodePath, true);
  assert.equal(result.entries[0].name, "../é.txt");
  assert.equal(result.counts.pathTraversal, 1);
  assert.equal(result.expansionAllowed, false);
});

test("blocks duplicate effective entry names before a follow-on ZIP library can collapse them", async () => {
  const original = await zipBytes({ "a.txt": "first", "b.txt": "second" });
  const patched = replaceAscii(original, "b.txt", "a.txt");
  assert.equal(patched.replacements, 2);
  const result = preflightZipCentralDirectory(patched.bytes);

  assert.equal(result.ok, true);
  assert.equal(result.counts.duplicateNames, 1);
  assert.equal(result.entries[1].duplicateName, true);
  assert.equal(result.expansionAllowed, false);
});

test("rejects a ZIP64 extra field shorter than its sentinel values require", () => {
  const malformedZip64Extra = new Uint8Array([
    0x01, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  ]);
  const result = preflightZipCentralDirectory(
    zipWithCentralZip64Extra(malformedZip64Extra),
  );

  assert.equal(result.ok, false);
  assert.match(result.error, /ZIP64 extra field is shorter/iu);
});

test("accepts a ZIP64 extra field containing the required bounded value", () => {
  const validZip64Extra = new Uint8Array([
    0x01, 0x00, 0x08, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  ]);
  const result = preflightZipCentralDirectory(
    zipWithCentralZip64Extra(validZip64Extra),
  );

  assert.equal(result.ok, true);
  assert.equal(result.entries[0].uncompressedSize, 1);
  assert.equal(result.expansionAllowed, true);
});

test("reports extreme declared compression pressure and expansion bounds", async () => {
  const original = await zipBytes({ "large.txt": "x" });
  const bytes = patchFirstCentral(original, (view, offset) => {
    view.setUint32(offset + 20, 1, true);
    view.setUint32(
      offset + 24,
      ZIP_INSPECTION_LIMITS.singleDeclaredExpandedBytes + 1,
      true,
    );
  });
  const result = preflightZipCentralDirectory(bytes);

  assert.equal(result.ok, true);
  assert.equal(result.counts.highCompressionRatio, 1);
  assert.equal(result.counts.oversizedEntries, 1);
  assert.equal(result.expansionAllowed, false);
});

test("blocks follow-on expansion for a high declared ratio even below byte caps", async () => {
  const original = await zipBytes({ "repeated.txt": "x" });
  const bytes = patchFirstCentral(original, (view, offset) => {
    view.setUint32(offset + 20, 1, true);
    view.setUint32(offset + 24, 500, true);
  });
  const result = preflightZipCentralDirectory(bytes);

  assert.equal(result.ok, true);
  assert.equal(result.counts.highCompressionRatio, 1);
  assert.equal(result.counts.oversizedEntries, 0);
  assert.equal(result.expansionAllowed, false);
});

test("rejects missing EOCD, inconsistent directory offsets, and excessive entry claims", async () => {
  const missing = preflightZipCentralDirectory(new Uint8Array([1, 2, 3]));
  assert.equal(missing.ok, false);
  assert.match(missing.error, /end-of-central-directory/iu);

  const original = await zipBytes({ "a.txt": "a" });
  const badOffset = new Uint8Array(original);
  const view = new DataView(badOffset.buffer);
  view.setUint32(badOffset.byteLength - 6, 0xfffffff0, true);
  const inconsistent = preflightZipCentralDirectory(badOffset);
  assert.equal(inconsistent.ok, false);
  assert.match(inconsistent.error, /offset or length/iu);

  const tooMany = new Uint8Array(original);
  const tooManyView = new DataView(tooMany.buffer);
  tooManyView.setUint16(
    tooMany.byteLength - 12,
    ZIP_INSPECTION_LIMITS.entries + 1,
    true,
  );
  tooManyView.setUint16(
    tooMany.byteLength - 14,
    ZIP_INSPECTION_LIMITS.entries + 1,
    true,
  );
  const excessive = preflightZipCentralDirectory(tooMany);
  assert.equal(excessive.ok, false);
  assert.match(excessive.error, /more than/iu);
});

test("validates bounded common ZIP-package file types", () => {
  assert.equal(validateArchiveFile({ name: "sample.zip", size: 1 }).ok, true);
  assert.equal(validateArchiveFile({ name: "sample.jar", size: 1 }).ok, true);
  assert.equal(validateArchiveFile({ name: "sample.rar", size: 1 }).ok, false);
  assert.equal(validateArchiveFile({ name: "empty.zip", size: 0 }).ok, false);
  assert.equal(
    validateArchiveFile({
      name: "huge.zip",
      size: ZIP_INSPECTION_LIMITS.fileBytes + 1,
    }).ok,
    false,
  );
});

test("counts-only export excludes archive entry names and payload values", async () => {
  const secret = "PRIVATE-ARCHIVE-NAME-8675309";
  const bytes = await zipBytes({ [`${secret}.txt`]: secret });
  const result = inspectArchiveBytes(bytes, {
    fileName: "local.zip",
    fileSize: bytes.byteLength,
  });
  const report = buildArchiveCountsReport(result, "2026-07-24T00:00:00.000Z");
  const serialized = JSON.stringify(report);

  assert.equal(report.reportType, "archive-central-directory-counts-only");
  assert.equal(serialized.includes(secret), false);
  assert.equal("entries" in report, false);
});
