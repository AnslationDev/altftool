import assert from "node:assert/strict";
import test from "node:test";

import { missingRequired, summarize } from "../_shared/toolkit/runtimeHelpers.js";
import spec from "./spec.js";

test("generates known ASCII and UTF-8 Basic auth vectors", () => {
  assert.equal(
    spec.compute({ username: "user", password: "pass", realm: "" }).result,
    "Basic dXNlcjpwYXNz",
  );
  assert.equal(
    spec.compute({ username: "üser", password: "päss", realm: "" }).result,
    "Basic w7xzZXI6cMOkc3M=",
  );
});

test("rejects an ambiguous colon in the username", () => {
  const result = spec.compute({
    username: "wrong:name",
    password: "pass",
    realm: "Example",
  });

  assert.equal(result.result, "");
  assert.match(result.error, /cannot contain a colon/iu);
});

test("realm is optional and export contains only the finished header", () => {
  const raw = { username: "user", password: "plain-secret", realm: "" };
  const result = spec.compute(raw);
  const exported = summarize(spec, raw, result, "");

  assert.equal(result.result, "Basic dXNlcjpwbGFpbi1zZWNyZXQ=");
  assert.equal(exported, result.result);
  assert.doesNotMatch(exported, /plain-secret|Password|Username/u);
});

test("the runtime accepts an empty Basic-auth password", () => {
  const raw = { username: "user", password: "", realm: "" };

  assert.deepEqual(missingRequired(spec.fields, raw, ""), []);
  assert.equal(spec.compute(raw).result, "Basic dXNlcjo=");
});
