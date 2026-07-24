import assert from "node:assert/strict";
import test from "node:test";

import {
  bytesToHex,
  compareChecksums,
  inferAlgorithm,
  normalizeChecksum,
  validateExpectedChecksum,
} from "./checksum.mjs";

const SHA256 = "a".repeat(64);
const SHA384 = "b".repeat(96);
const SHA512 = "c".repeat(128);

test("normalizes common labels, case, and whitespace", () => {
  assert.equal(normalizeChecksum(`SHA-256: AA BB\nCC`), "aabbcc");
});

test("infers SHA-2 algorithms by hexadecimal length", () => {
  assert.equal(inferAlgorithm(SHA256), "SHA-256");
  assert.equal(inferAlgorithm(SHA384), "SHA-384");
  assert.equal(inferAlgorithm(SHA512), "SHA-512");
});

test("rejects malformed or mismatched checksums", () => {
  assert.match(validateExpectedChecksum("not-a-hash").error, /hexadecimal/i);
  assert.match(validateExpectedChecksum(SHA256, "SHA-512").error, /128/i);
});

test("compares normalized values", () => {
  assert.equal(compareChecksums(SHA256.toUpperCase(), `sha-256: ${SHA256}`), true);
  assert.equal(compareChecksums(SHA256, `${"a".repeat(63)}b`), false);
});

test("encodes bytes as zero-padded hexadecimal", () => {
  assert.equal(bytesToHex(Uint8Array.from([0, 1, 15, 16, 255])), "00010f10ff");
});
