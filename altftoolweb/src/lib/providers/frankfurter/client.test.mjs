import assert from "node:assert/strict";
import test from "node:test";

import { buildFrankfurterV1Url } from "./client.js";

test("builds a direct versioned Frankfurter historical-rate URL", () => {
  assert.equal(
    buildFrankfurterV1Url("2024-01-02", { base: "usd", quote: "eur" }).href,
    "https://api.frankfurter.dev/v1/2024-01-02?base=USD&symbols=EUR",
  );
});

test("supports the latest and bounded time-series v1 endpoints", () => {
  assert.equal(
    buildFrankfurterV1Url("latest", { base: "GBP", quote: "JPY" }).pathname,
    "/v1/latest",
  );
  assert.equal(
    buildFrankfurterV1Url("2024-01-01..2024-01-31", { base: "USD", quote: "INR" }).pathname,
    "/v1/2024-01-01..2024-01-31",
  );
});

test("rejects unsupported paths and malformed currency codes", () => {
  assert.throws(
    () => buildFrankfurterV1Url("https://example.com", { base: "USD", quote: "EUR" }),
    /Invalid Frankfurter endpoint/,
  );
  assert.throws(
    () => buildFrankfurterV1Url("latest", { base: "US", quote: "EUR" }),
    /Invalid currency code/,
  );
});
