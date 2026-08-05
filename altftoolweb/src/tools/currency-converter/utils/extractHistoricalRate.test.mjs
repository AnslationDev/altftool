import assert from "node:assert/strict";
import test from "node:test";

import { extractHistoricalRate } from "./extractHistoricalRate.js";

test("reads the flat response used for one historical day", () => {
  assert.equal(
    extractHistoricalRate({ rates: { EUR: 0.91274 } }, "2024-01-02", "EUR"),
    0.91274,
  );
});

test("reads the nested response used for a historical time series", () => {
  assert.equal(
    extractHistoricalRate(
      { rates: { "2024-01-02": { EUR: 0.91274 } } },
      "2024-01-02",
      "EUR",
    ),
    0.91274,
  );
});

test("rejects missing, non-numeric, and non-positive rates", () => {
  assert.equal(extractHistoricalRate({}, "2024-01-02", "EUR"), null);
  assert.equal(extractHistoricalRate({ rates: { EUR: "unknown" } }, "2024-01-02", "EUR"), null);
  assert.equal(extractHistoricalRate({ rates: { EUR: 0 } }, "2024-01-02", "EUR"), null);
});
