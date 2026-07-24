import assert from "node:assert/strict";
import test from "node:test";

import {
  analyzeUsageLogs,
  buildUsageReport,
  parseRateTable,
  parseUsageLogs,
} from "./analyzeUsage.mjs";

test("parses wrapped JSON usage records", () => {
  const result = parseUsageLogs(
    JSON.stringify({ data: [{ model: "model-a", usage: { input_tokens: 10 } }] }),
  );
  assert.equal(result.ok, true);
  assert.equal(result.records.length, 1);
  assert.equal(result.format, "json");
});

test("parses JSONL and CSV usage logs", () => {
  const jsonl = parseUsageLogs('{"model":"a"}\n{"model":"b"}');
  assert.equal(jsonl.format, "jsonl");
  const csv = parseUsageLogs("model,input_tokens,output_tokens\na,10,2");
  assert.equal(csv.format, "csv");
  assert.equal(csv.records[0].model, "a");
});

test("validates exact and wildcard user-supplied rates", () => {
  const result = parseRateTable(
    JSON.stringify({
      "model-a": { inputPerMillion: 2, outputPerMillion: 4 },
      "*": { inputPerMillion: 1, outputPerMillion: 1 },
    }),
  );
  assert.equal(result.ok, true);
  assert.equal(result.rates.size, 2);
  assert.equal(parseRateTable('{"model-a":{"input":-1,"output":2}}').ok, false);
});

test("calculates model totals and cost from split token counts", () => {
  const result = analyzeUsageLogs(
    JSON.stringify([
      {
        model: "model-a",
        usage: { input_tokens: 1_000_000, output_tokens: 500_000 },
      },
      {
        model: "model-a",
        usage: { prompt_tokens: 500_000, completion_tokens: 250_000 },
      },
    ]),
    '{"model-a":{"inputPerMillion":2,"outputPerMillion":4}}',
  );
  assert.equal(result.ok, true);
  assert.equal(result.totalTokens, 2_250_000);
  assert.equal(result.estimatedCost, 6);
  assert.equal(result.models[0].requestCount, 2);
});

test("does not estimate cost for total-only token records", () => {
  const result = analyzeUsageLogs(
    '{"model":"model-a","usage":{"total_tokens":1000}}',
    '{"model-a":{"inputPerMillion":2,"outputPerMillion":4}}',
  );
  assert.equal(result.unallocatedTokens, 1000);
  assert.equal(result.pricedRequestCount, 0);
  assert.equal(result.estimatedCost, 0);
});

test("counts privacy signals without retaining prompt or credential values", () => {
  const email = "private.person@example.com";
  const result = analyzeUsageLogs(
    JSON.stringify({
      model: "local",
      prompt: `Contact ${email}`,
      response: { content: "access token: abcdefghijk" },
      usage: { input_tokens: 20, output_tokens: 5 },
    }),
  );
  assert.ok(result.privacySignalCount >= 2);
  assert.equal(JSON.stringify(result).includes(email), false);
  assert.equal(JSON.stringify(result).includes("abcdefghijk"), false);
});

test("counts-only report excludes model names and source content", () => {
  const result = analyzeUsageLogs(
    '{"model":"private-internal-model","prompt":"demo@example.com","input_tokens":10,"output_tokens":2}',
    '{"private-internal-model":{"inputPerMillion":1,"outputPerMillion":1}}',
  );
  const report = buildUsageReport(result);
  const serialized = JSON.stringify(report);
  assert.equal(serialized.includes("private-internal-model"), false);
  assert.equal(serialized.includes("demo@example.com"), false);
  assert.equal(Object.hasOwn(report.modelSummaries[0], "name"), false);
});
