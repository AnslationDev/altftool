import assert from "node:assert/strict";
import test from "node:test";

import {
  formatSignatureBytes,
  inspectFileSignature,
  SIGNATURE_READ_BYTES,
} from "./fileSignatures.mjs";

test("recognizes PNG and consistent metadata", () => {
  const bytes = Uint8Array.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00,
  ]);
  const result = inspectFileSignature(bytes, {
    fileName: "photo.PNG",
    browserType: "image/png",
  });
  assert.equal(result.detected.id, "png");
  assert.equal(result.extensionMatch, true);
  assert.equal(result.mimeMatch, true);
  assert.equal(result.verdict, "consistent");
});

test("flags a signature and extension mismatch", () => {
  const result = inspectFileSignature(
    Uint8Array.from([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37]),
    { fileName: "invoice.jpg", browserType: "image/jpeg" },
  );
  assert.equal(result.detected.id, "pdf");
  assert.equal(result.extensionMatch, false);
  assert.equal(result.mimeMatch, false);
  assert.equal(result.verdict, "mismatch");
});

test("recognizes compound signatures and unknown content", () => {
  const webp = new Uint8Array(16);
  webp.set([...Buffer.from("RIFF")], 0);
  webp.set([...Buffer.from("WEBP")], 8);
  assert.equal(
    inspectFileSignature(webp, { fileName: "x.webp" }).detected.id,
    "webp",
  );
  assert.equal(inspectFileSignature(new Uint8Array([1, 2, 3])).detected, null);
  assert.equal(
    inspectFileSignature(Uint8Array.from([0xca, 0xfe, 0xba, 0xbe]), {
      fileName: "Example.class",
    }).detected.id,
    "cafebabe-container",
  );
});

test("formats only bounded leading bytes", () => {
  assert.equal(SIGNATURE_READ_BYTES, 64);
  assert.equal(formatSignatureBytes(Uint8Array.from([0, 15, 255])), "00 0F FF");
});

test("treats a generic browser MIME as unavailable instead of a mismatch", () => {
  const result = inspectFileSignature(
    Uint8Array.from([0x25, 0x50, 0x44, 0x46, 0x2d]),
    {
      fileName: "report.pdf",
      browserType: "application/octet-stream",
    },
  );
  assert.equal(result.browserType, "application/octet-stream");
  assert.equal(result.mimeKnown, false);
  assert.equal(result.mimeMatch, null);
  assert.equal(result.verdict, "consistent");
});

test("flags a known extension and MIME when the expected leading signature is absent", () => {
  const result = inspectFileSignature(new TextEncoder().encode("not a png"), {
    fileName: "image.png",
    browserType: "image/png",
  });
  assert.equal(result.detected, null);
  assert.equal(result.extensionKnown, true);
  assert.equal(result.mimeKnown, true);
  assert.equal(result.extensionMatch, false);
  assert.equal(result.mimeMatch, false);
  assert.equal(result.verdict, "mismatch");
});

test("keeps generic or structurally ambiguous extension hints neutral", () => {
  for (const fileName of ["blob.bin", "cache.db", "object.o"]) {
    const result = inspectFileSignature(
      new TextEncoder().encode("plain data"),
      {
        fileName,
      },
    );
    assert.equal(result.detected, null);
    assert.equal(result.extensionKnown, true);
    assert.equal(result.extensionMatch, null);
    assert.equal(result.verdict, "unknown");
  }
});
