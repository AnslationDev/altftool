import assert from "node:assert/strict";
import test from "node:test";

import spec from "./spec.js";

function encode(input) {
  return spec.compute({ input, mode: "encode" });
}

function decode(input) {
  return spec.compute({ input, mode: "decode" });
}

test("encodes known ASCII and UTF-8 Base58 vectors", () => {
  assert.equal(encode("Hello").result, "9Ajdvzr");
  assert.equal(encode("é").result, "Ftc");

  const unicode = encode("✓ café 🚀");
  assert.equal(unicode.result, "2SJzJ97UfVpxojFLadNP");
  assert.deepEqual(unicode.rows[0], ["Input bytes", 14]);
  assert.equal(decode(unicode.result).result, "✓ café 🚀");
});

test("preserves leading zero bytes", () => {
  const encoded = encode("\0A");
  assert.equal(encoded.result, "128");
  assert.equal(decode(encoded.result).result, "\0A");
});

test("rejects invalid alphabet characters and non-UTF-8 bytes", () => {
  assert.match(decode("0OIl").error, /Invalid Base58 character/u);
  assert.match(decode("5Q").error, /not valid UTF-8/u);
});
