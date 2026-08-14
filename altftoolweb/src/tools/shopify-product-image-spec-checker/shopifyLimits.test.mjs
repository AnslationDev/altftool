import assert from "node:assert/strict";
import test from "node:test";

import { checkShopifyImage } from "./lib.js";

const byId = (result, id) => result.checks.find((check) => check.id === id);

test("Shopify's smaller-than-20-MB rule rejects the exact boundary", () => {
  const atLimit = checkShopifyImage({
    width: 2048,
    height: 2048,
    fileSizeMB: 20,
    format: "png",
  });
  const belowLimit = checkShopifyImage({
    width: 2048,
    height: 2048,
    fileSizeMB: 19.99,
    format: "png",
  });

  assert.equal(byId(atLimit, "filesize").status, "fail");
  assert.equal(byId(belowLimit, "filesize").status, "pass");
});

test("25 MP and 5000 px are inclusive, while a longer side fails", () => {
  const boundary = checkShopifyImage({
    width: 5000,
    height: 5000,
    fileSizeMB: 19,
    format: "psd",
  });
  const tooLong = checkShopifyImage({
    width: 5001,
    height: 1000,
    fileSizeMB: 1,
    format: "psd",
  });

  assert.equal(byId(boundary, "megapixels").status, "pass");
  assert.equal(byId(boundary, "maxside").status, "pass");
  assert.equal(byId(boundary, "format").status, "pass");
  assert.equal(byId(tooLong, "maxside").status, "fail");
});
