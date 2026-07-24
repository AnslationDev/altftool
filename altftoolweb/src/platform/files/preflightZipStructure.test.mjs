import assert from "node:assert/strict";
import test from "node:test";

import JSZip from "jszip";

import { preflightZipStructure } from "./preflightZipStructure.mjs";

async function sampleArchive(entryCount = 3) {
  const archive = new JSZip();
  for (let index = 0; index < entryCount; index += 1) {
    archive.file(`part-${index}.xml`, `<w:t>${index}</w:t>`);
  }
  return archive.generateAsync({ type: "uint8array" });
}

function endRecordOffset(bytes) {
  for (let offset = bytes.byteLength - 22; offset >= 0; offset -= 1) {
    if (
      bytes[offset] === 0x50 &&
      bytes[offset + 1] === 0x4b &&
      bytes[offset + 2] === 0x05 &&
      bytes[offset + 3] === 0x06
    ) {
      return offset;
    }
  }
  return -1;
}

test("counts a bounded ordinary ZIP before object expansion", async () => {
  const bytes = await sampleArchive(3);
  const result = preflightZipStructure(bytes, { maximumEntries: 8 });
  assert.equal(result.entries, 3);
  assert.ok(result.centralDirectoryBytes > 0);
  assert.equal(result.zip64, false);
});

test("rejects an entry count above the raw pre-load limit", async () => {
  const bytes = await sampleArchive(4);
  assert.throws(
    () => preflightZipStructure(bytes, { maximumEntries: 3 }),
    /safety bound|entry safety limit/iu,
  );
});

test("detects a forged low end-record count by scanning central records", async () => {
  const bytes = await sampleArchive(4);
  const eocd = endRecordOffset(bytes);
  assert.ok(eocd >= 0);
  bytes[eocd + 8] = 1;
  bytes[eocd + 9] = 0;
  bytes[eocd + 10] = 1;
  bytes[eocd + 11] = 0;
  assert.throws(
    () => preflightZipStructure(bytes, { maximumEntries: 8 }),
    /entry count is inconsistent/iu,
  );
});

test("rejects a central directory whose declared offset leaves the file", async () => {
  const bytes = await sampleArchive(1);
  const eocd = endRecordOffset(bytes);
  assert.ok(eocd >= 0);
  const invalidOffset = eocd + 1;
  bytes[eocd + 16] = invalidOffset & 0xff;
  bytes[eocd + 17] = (invalidOffset >>> 8) & 0xff;
  bytes[eocd + 18] = (invalidOffset >>> 16) & 0xff;
  bytes[eocd + 19] = (invalidOffset >>> 24) & 0xff;
  assert.throws(
    () => preflightZipStructure(bytes, { maximumEntries: 8 }),
    /safety bound/iu,
  );
});
