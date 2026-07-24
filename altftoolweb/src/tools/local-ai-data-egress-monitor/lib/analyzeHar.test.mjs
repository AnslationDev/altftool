import assert from "node:assert/strict";
import test from "node:test";

import {
  analyzeHar,
  buildEgressReport,
  parseExpectedHosts,
} from "./analyzeHar.mjs";

function har(entries) {
  return JSON.stringify({ log: { entries } });
}

function entry(url, options = {}) {
  return {
    request: {
      method: options.method || "GET",
      url,
      headers: options.headers || [],
      bodySize: options.bodySize ?? -1,
      postData: options.postData,
    },
    response: {
      status: options.status ?? 200,
      bodySize: options.responseBytes ?? 0,
      content: { size: options.responseBytes ?? 0 },
    },
  };
}

test("parses exact and wildcard expected host rules", () => {
  const result = parseExpectedHosts("api.example.com\n*.trusted.test\nhttps://bad.test/x");
  assert.deepEqual(result.valid, ["api.example.com", "*.trusted.test"]);
  assert.deepEqual(result.invalid, ["https://bad.test/x"]);
});

test("separates loopback, expected, and unlisted requests", () => {
  const result = analyzeHar(
    har([
      entry("http://127.0.0.1:8080/infer"),
      entry("https://api.example.com/models"),
      entry("https://telemetry.vendor.test/event"),
    ]),
    "api.example.com",
  );
  assert.equal(result.ok, true);
  assert.equal(result.loopbackRequestCount, 1);
  assert.equal(result.expectedRequestCount, 1);
  assert.equal(result.unlistedRequestCount, 1);
});

test("counts outbound bodies and credential/query cues without retaining values", () => {
  const secret = "private prompt content";
  const result = analyzeHar(
    har([
      entry("https://outside.test/upload?prompt=hidden&ordinary=1", {
        method: "POST",
        headers: [
          { name: "Authorization", value: "Bearer secret-token" },
          { name: "Content-Type", value: "application/json" },
        ],
        postData: { text: secret },
      }),
    ]),
  );
  assert.equal(result.unlistedBodyRequestCount, 1);
  assert.equal(result.credentialHeaderRequestCount, 1);
  assert.equal(result.sensitiveQueryRequestCount, 1);
  assert.equal(JSON.stringify(result).includes(secret), false);
  assert.equal(JSON.stringify(result).includes("secret-token"), false);
});

test("aggregates hosts, methods, byte counts, and failed responses", () => {
  const result = analyzeHar(
    har([
      entry("https://api.example.test/a", {
        method: "POST",
        bodySize: 12,
        responseBytes: 30,
      }),
      entry("https://api.example.test/b", {
        status: 503,
        responseBytes: 4,
      }),
    ]),
  );
  assert.equal(result.hostCount, 1);
  assert.deepEqual(result.hosts[0].methods, ["GET", "POST"]);
  assert.equal(result.hosts[0].requestBodyBytes, 12);
  assert.equal(result.hosts[0].responseBytes, 34);
  assert.equal(result.hosts[0].failedRequestCount, 1);
});

test("rejects invalid JSON and non-HAR shapes", () => {
  assert.equal(analyzeHar("{").ok, false);
  assert.match(analyzeHar('{"requests":[]}').error, /entries/i);
});

test("counts-only report excludes domains and trace values", () => {
  const result = analyzeHar(
    har([entry("https://private-domain.example/path?token=secret")]),
  );
  const report = buildEgressReport(result);
  const serialized = JSON.stringify(report);
  assert.equal(serialized.includes("private-domain.example"), false);
  assert.equal(serialized.includes("secret"), false);
  assert.equal(Object.hasOwn(report.hostSummaries[0], "hostname"), false);
});
