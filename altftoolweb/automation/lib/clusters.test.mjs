import assert from "node:assert/strict";
import test from "node:test";

import { buildCluster } from "../clusters.mjs";

const entry = (slug, name, category = ["Developer"]) => ({
  slug,
  name,
  category,
});

test("Basic auth cluster preserves privacy and UTF-8 behavior", () => {
  const built = buildCluster(
    entry("basic-auth-header-generator", "Basic Auth Header Generator"),
  );
  assert.equal(built.clusterId, "basic-auth");
  assert.equal(built.raw.exportResultOnly, true);
  assert.equal(
    built.raw.fields.find((field) => field.key === "password")?.type,
    "password",
  );
  assert.equal(
    built.raw.fields.find((field) => field.key === "password")?.required,
    false,
  );
  assert.equal(
    built.raw.compute({ username: "üser", password: "päss", realm: "" })
      .result,
    "Basic w7xzZXI6cMOkc3M=",
  );
  assert.match(
    built.raw.compute({ username: "bad:name", password: "pass", realm: "" })
      .error,
    /cannot contain a colon/iu,
  );
});

test("Basic auth cluster does not capture unrelated authentication tools", () => {
  for (const name of [
    "Basic Authentication Decoder",
    "Basic Authentication Security Checker",
    "Basic Auth Credential Auditor",
  ]) {
    assert.notEqual(buildCluster(entry(name.toLowerCase().replaceAll(" ", "-"), name))?.clusterId, "basic-auth");
  }
});

test("Base58 cluster round-trips UTF-8 and rejects invalid input", () => {
  const built = buildCluster(entry("base58-encoder", "Base58 Encoder"));
  assert.equal(built.clusterId, "base58");

  const encoded = built.raw.compute({ input: "✓ café 🚀", mode: "encode" });
  assert.equal(encoded.result, "2SJzJ97UfVpxojFLadNP");
  assert.equal(
    built.raw.compute({ input: encoded.result, mode: "decode" }).result,
    "✓ café 🚀",
  );
  assert.match(
    built.raw.compute({ input: "0OIl", mode: "decode" }).error,
    /Invalid Base58 character/u,
  );
});

test("dice cluster publishes and enforces integer bounds", () => {
  const built = buildCluster(
    entry("d-d-dice-roller", "D&D Dice Roller", ["Game"]),
  );
  assert.equal(built.clusterId, "random");
  assert.deepEqual(
    built.raw.fields.map(({ key, min, max, step }) => ({ key, min, max, step })),
    [
      { key: "sides", min: 2, max: 1000, step: 1 },
      { key: "count", min: 1, max: 10, step: 1 },
    ],
  );
  assert.match(
    built.raw.compute({ sides: 6.5, count: 2 }, "", () => 0.5).error,
    /Sides must be a whole number/u,
  );
  assert.equal(
    built.raw.compute({ sides: 6, count: 2 }, "", () => 0.5).result,
    "4 + 4 = 8",
  );
});
