import assert from "node:assert/strict";
import test from "node:test";

import JSZip from "jszip";

import { readBoundedZipText } from "./readBoundedZipText.mjs";

async function loadedEntry(name, value) {
  const archive = new JSZip();
  archive.file(name, value);
  const bytes = await archive.generateAsync({
    type: "uint8array",
    compression: "DEFLATE",
  });
  const loaded = await JSZip.loadAsync(bytes, {
    checkCRC32: false,
    createFolders: false,
  });
  return loaded.file(name);
}

test("streams a ZIP entry within its actual expanded-byte limit", async () => {
  const entry = await loadedEntry("word/document.xml", "<w:t>Hello</w:t>");
  const result = await readBoundedZipText(entry, {
    maximumBytes: 1_024,
    label: entry.name,
  });
  assert.equal(result.text, "<w:t>Hello</w:t>");
  assert.equal(result.inflatedBytes, 16);
});

test("stops decompression when actual output exceeds the runtime limit", async () => {
  const entry = await loadedEntry("word/document.xml", "A".repeat(512_000));
  await assert.rejects(
    () =>
      readBoundedZipText(entry, {
        maximumBytes: 32_000,
        label: entry.name,
      }),
    /expanded-content limit/iu,
  );
});

test("honors cancellation while streaming", async () => {
  const entry = await loadedEntry("word/document.xml", "A".repeat(64_000));
  await assert.rejects(
    () =>
      readBoundedZipText(entry, {
        maximumBytes: 128_000,
        shouldContinue: () => false,
        label: entry.name,
      }),
    /cancelled/iu,
  );
});
