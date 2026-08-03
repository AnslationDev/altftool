import assert from "node:assert/strict";
import test from "node:test";

import {
  computeIndexSize,
  IVF_CENTROID_BYTES_PER_DIM,
  IVF_ID_BYTES,
  IVF_NLIST_MULTIPLIER,
} from "./lib.js";

test("uses the documented conservative IVF nlist multiplier", () => {
  const result = computeIndexSize({
    vectorCount: 1_000_000,
    dimensions: 768,
    dataTypeId: "float32",
    indexTypeId: "ivf",
  });

  const expectedNlist = IVF_NLIST_MULTIPLIER * 1_000;
  assert.equal(result.error, undefined);
  assert.equal(result.nlist, expectedNlist);
  assert.equal(
    result.indexOverheadBytes,
    1_000_000 * IVF_ID_BYTES + expectedNlist * 768 * IVF_CENTROID_BYTES_PER_DIM,
  );
});

test("rejects fractional vector counts and HNSW M values", () => {
  assert.match(
    computeIndexSize({
      vectorCount: 10.5,
      dimensions: 768,
      dataTypeId: "float32",
      indexTypeId: "flat",
    }).error,
    /whole number/i,
  );

  assert.match(
    computeIndexSize({
      vectorCount: 10,
      dimensions: 768,
      dataTypeId: "float32",
      indexTypeId: "hnsw",
      hnswM: 16.5,
    }).error,
    /whole number/i,
  );
});
