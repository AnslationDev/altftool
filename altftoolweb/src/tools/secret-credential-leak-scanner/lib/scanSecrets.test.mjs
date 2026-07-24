import assert from "node:assert/strict";
import test from "node:test";

import {
  buildSecretScanReport,
  MAX_SECRET_FINDINGS,
  MAX_SECRET_SCAN_CHARACTERS,
  mergeSecretScanResults,
  scanSecrets,
} from "./scanSecrets.mjs";

test("detects provider, generic, and private-key patterns without returning values", () => {
  const aws = `AKIA${"A".repeat(16)}`;
  const password = "correct-horse-battery-staple";
  const result = scanSecrets(
    `AWS=${aws}\npassword="${password}"\n-----BEGIN PRIVATE KEY-----`,
    { sourceName: "config.env" },
  );

  assert.equal(result.ok, true);
  assert.deepEqual(
    new Set(result.findings.map((finding) => finding.ruleId)),
    new Set(["aws-access-key", "generic-secret-assignment", "private-key"]),
  );
  assert.equal(JSON.stringify(result).includes(aws), false);
  assert.equal(JSON.stringify(result).includes(password), false);
  assert.match(result.findings[0].evidence, /^\[REDACTED/);
});

test("reports line and column for a credential", () => {
  const result = scanSecrets(`safe\nxoxb-${"A".repeat(24)}`);
  assert.equal(result.findings[0].line, 2);
  assert.equal(result.findings[0].column, 1);
});

test("rejects over-limit input", () => {
  const result = scanSecrets("a".repeat(MAX_SECRET_SCAN_CHARACTERS + 1));
  assert.equal(result.ok, false);
  assert.match(result.error, /scan limit/);
});

test("merges sources and exports a value-free report", () => {
  const secret = `sk_live_${"z".repeat(24)}`;
  const merged = mergeSecretScanResults([
    scanSecrets(secret, { sourceName: "one.txt" }),
    scanSecrets("ordinary text", { sourceName: "two.txt" }),
  ]);
  const report = buildSecretScanReport(merged);
  assert.equal(merged.scannedSources, 2);
  assert.equal(merged.findings.length, 1);
  assert.equal(report.includes(secret), false);
  assert.match(report, /Values are intentionally omitted/);
});

test("propagates an invalid source instead of returning a false clear", () => {
  const merged = mergeSecretScanResults([
    scanSecrets("ordinary text"),
    scanSecrets("a".repeat(MAX_SECRET_SCAN_CHARACTERS + 1)),
  ]);
  assert.equal(merged.ok, false);
  assert.equal(merged.level, "invalid");
  assert.equal(merged.scannedSources, 0);
  assert.match(buildSecretScanReport(merged), /No clear or safety conclusion/);
});

test("counts all matches and retains a later high-severity credential after the display cap", () => {
  const jwt = `eyJ${"a".repeat(8)}.${"b".repeat(8)}.${"c".repeat(8)}`;
  const source = `${Array.from(
    { length: MAX_SECRET_FINDINGS + 50 },
    () => jwt,
  ).join("\n")}\nhttps://user:supersecretpassword@example.com/`;
  const result = scanSecrets(source);

  assert.equal(result.counts.medium, MAX_SECRET_FINDINGS + 50);
  assert.equal(result.counts.high, 1);
  assert.equal(result.level, "high");
  assert.equal(result.findings.length, MAX_SECRET_FINDINGS);
  assert.equal(
    result.findings.some((finding) => finding.ruleId === "credential-url"),
    true,
  );
  assert.equal(result.truncated, true);
});

test("detects prefixed real-world environment credential keys without exposing values", () => {
  const values = [
    "DATABASE_PASSWORD=supersecret123",
    "OPENAI_API_KEY=sk-proj-abcdefghijklmnopqrstuvwxyz",
    "STRIPE_SECRET_KEY=abcdefghijklmnopqrstuvwxyz",
  ];
  const result = scanSecrets(values.join("\n"));
  assert.equal(
    result.findings.filter(
      (finding) => finding.ruleId === "generic-secret-assignment",
    ).length,
    3,
  );
  for (const value of values) {
    assert.equal(JSON.stringify(result).includes(value), false);
  }
});

test("detects quoted and camelCase credential keys", () => {
  const result = scanSecrets(
    [
      '{"password":"supersecret123"}',
      '"DATABASE_PASSWORD": "anothersecret456"',
      "'API_KEY': 'thirdsecret789'",
      'const clientSecret = "client-secret-value";',
      'const accessToken = "access-token-value";',
      'const privateKey = "private-key-value";',
      'const databasePassword = "database-password-value";',
      'const refreshToken = "refresh-token-value";',
    ].join("\n"),
  );
  assert.equal(result.ok, true);
  assert.ok(result.counts.medium >= 8);
});

test("detects common token, private-key, and credential assignment families", () => {
  const source = [
    "NPM_TOKEN=abcdefghijklmnop",
    "REFRESH_TOKEN=abcdefghijklmnop",
    "SESSION_TOKEN=abcdefghijklmnop",
    "PRIVATE_KEY=abcdefghijklmnop",
    "SERVICE_CREDENTIAL=abcdefghijklmnop",
  ].join("\n");
  const result = scanSecrets(source);
  assert.equal(
    result.findings.filter(
      (finding) => finding.ruleId === "generic-secret-assignment",
    ).length,
    5,
  );
  assert.equal(JSON.stringify(result).includes("abcdefghijklmnop"), false);
});

test("keeps near-limit underscore-heavy identifiers linear", () => {
  const source = "AAAA_".repeat(Math.floor(MAX_SECRET_SCAN_CHARACTERS / 5));
  const started = performance.now();
  const result = scanSecrets(source);
  const elapsed = performance.now() - started;
  assert.equal(result.findings.length, 0);
  assert.ok(elapsed < 1_500, `scan took ${elapsed.toFixed(0)} ms`);
});
