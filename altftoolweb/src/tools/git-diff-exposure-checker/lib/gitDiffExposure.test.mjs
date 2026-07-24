import assert from "node:assert/strict";
import test from "node:test";

import {
  GIT_DIFF_LIMITATIONS,
  GIT_DIFF_LIMITS,
  buildGitDiffExposureReport,
  inspectUnifiedDiff,
} from "./gitDiffExposure.mjs";

function makeDiff(path, addedLines) {
  return `diff --git a/${path} b/${path}
index 1111111..2222222 100644
--- a/${path}
+++ b/${path}
@@ -1,1 +1,${addedLines.length} @@
-old
${addedLines.map((line) => `+${line}`).join("\n")}`;
}

function codes(result) {
  return new Set(result.findings.map((finding) => finding.code));
}

test("inspects only added lines, not removed or context lines", () => {
  const result = inspectUnifiedDiff(`diff --git a/app.js b/app.js
--- a/app.js
+++ b/app.js
@@ -1,3 +1,3 @@
-const password = "removed-real-secret";
 const token = "unchanged-real-secret";
+const mode = "safe";
`);
  assert.equal(result.stats.addedLinesInspected, 1);
  assert.equal(result.counts.high, 0);
});

test("detects generic credentials and always redacts the value", () => {
  const secret = "highly-private-production-value";
  const result = inspectUnifiedDiff(
    makeDiff("config.js", [`const client_secret = "${secret}";`]),
  );
  assert.ok(codes(result).has("generic-credential-assignment"));
  assert.doesNotMatch(JSON.stringify(result), new RegExp(secret));
  assert.match(result.findings[0].evidence, /^\[redacted:/);
});

test("detects provider-token, JWT, bearer, and private-key markers", () => {
  const result = inspectUnifiedDiff(
    makeDiff("fixtures.txt", [
      `AKIA${"ABCDEFGHIJKLMNOP"}`,
      `ghp_${"abcdefghijklmnopqrstuvwxyz"}1234567890`,
      "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.abcdefghijk",
      "Authorization: Bearer abcdefghijklmnop",
      "-----BEGIN PRIVATE KEY-----",
    ]),
  );
  const observed = codes(result);
  assert.ok(observed.has("aws-access-key-id"));
  assert.ok(observed.has("github-token"));
  assert.ok(observed.has("jwt-like-token"));
  assert.ok(observed.has("authorization-bearer"));
  assert.ok(observed.has("private-key-material"));
});

test("detects email and phone PII patterns as medium review cues", () => {
  const result = inspectUnifiedDiff(
    makeDiff("contacts.csv", [
      "person@example.com",
      "Support: +91 98765 43210",
    ]),
  );
  const observed = codes(result);
  assert.ok(observed.has("email-address"));
  assert.ok(observed.has("phone-number"));
  assert.equal(result.counts.medium, 2);
});

test("flags sensitive destination filenames without retaining the path", () => {
  const privatePath = ".env.production";
  const result = inspectUnifiedDiff(makeDiff(privatePath, ["MODE=production"]));
  assert.ok(codes(result).has("sensitive-destination-filename"));
  assert.doesNotMatch(JSON.stringify(result), /\.env\.production/);
  assert.equal(result.findings[0].evidence, "[redacted filename]");
});

test("tracks new-file line numbers across context and removals", () => {
  const result = inspectUnifiedDiff(`diff --git a/a.txt b/a.txt
--- a/a.txt
+++ b/a.txt
@@ -10,3 +20,4 @@
 context
-removed
+safe
+mail@example.com
`);
  const emailFinding = result.findings.find(
    (finding) => finding.code === "email-address",
  );
  assert.equal(emailFinding.line, 22);
});

test("recognizes a plain unified diff without a diff --git header", () => {
  const result = inspectUnifiedDiff(`--- old.txt
+++ new.txt
@@ -1 +1 @@
-old
+new`);
  assert.equal(result.recognized, true);
  assert.equal(result.stats.filesInspected, 1);
});

test("reports binary patches as uninspected", () => {
  const result = inspectUnifiedDiff(`diff --git a/image.png b/image.png
GIT binary patch
literal 10
abcdefghij`);
  assert.equal(result.stats.binaryFilesSkipped, 1);
  assert.ok(codes(result).has("binary-patch-not-inspected"));
});

test("does not promote obvious placeholders to generic credentials", () => {
  const result = inspectUnifiedDiff(
    makeDiff(".env.example", [
      "API_KEY=placeholder",
      "PASSWORD=<your-password>",
      "TOKEN=process.env.TOKEN",
    ]),
  );
  assert.equal(codes(result).has("generic-credential-assignment"), false);
  assert.ok(codes(result).has("sensitive-destination-filename"));
});

test("detects quoted JSON credential keys", () => {
  const result = inspectUnifiedDiff(
    [
      "--- a/config.json",
      "+++ b/config.json",
      "@@ -0,0 +1 @@",
      '+{"password":"real-secret-value"}',
    ].join("\n"),
  );
  assert.ok(
    result.findings.some(
      (finding) => finding.code === "generic-credential-assignment",
    ),
  );
});

test("counts each file in a plain multi-file unified diff", () => {
  const result = inspectUnifiedDiff(
    [
      "--- a/one.txt",
      "+++ b/one.txt",
      "@@ -0,0 +1 @@",
      "+safe",
      "--- a/two.txt",
      "+++ b/.env",
      "@@ -0,0 +1 @@",
      "+safe",
    ].join("\n"),
  );
  assert.equal(result.stats.filesInspected, 2);
  assert.equal(
    result.findings.filter(
      (finding) => finding.code === "sensitive-destination-filename",
    ).length,
    1,
  );
});

test("later high cues survive earlier medium findings at the display cap", () => {
  const added = Array.from(
    { length: GIT_DIFF_LIMITS.maxFindings },
    (_, index) => `+person${index}@example.com`,
  );
  added.push(`+AWS_KEY=AKIA${"A".repeat(16)}`);
  const result = inspectUnifiedDiff(
    [
      "--- a/log.txt",
      "+++ b/log.txt",
      `@@ -0,0 +1,${added.length} @@`,
      ...added,
    ].join("\n"),
  );
  assert.ok(result.counts.high > 0);
  assert.equal(result.assessment.level, "action");
  assert.ok(
    result.findings.some((finding) => finding.code === "aws-access-key-id"),
  );
  assert.equal(result.truncated, true);
});

test("detects prefixed environment credential keys in added lines", () => {
  const result = inspectUnifiedDiff(
    [
      "--- a/.env",
      "+++ b/.env",
      "@@ -0,0 +1,3 @@",
      "+DATABASE_PASSWORD=supersecret123",
      "+OPENAI_API_KEY=sk-proj-abcdefghijklmnopqrstuvwxyz",
      "+STRIPE_SECRET_KEY=abcdefghijklmnopqrstuvwxyz",
    ].join("\n"),
  );
  assert.equal(
    result.findingCodeCounts["generic-credential-assignment"],
    3,
  );
  assert.equal(result.assessment.level, "action");
  assert.equal(JSON.stringify(result).includes("supersecret123"), false);
});

test("detects quoted and camelCase credential keys in added lines", () => {
  const result = inspectUnifiedDiff(`diff --git a/config.js b/config.js
--- a/config.js
+++ b/config.js
@@ -0,0 +1,6 @@
+const apiKey = "real-api-key-value";
+const clientSecret = "real-client-secret";
+const accessToken = "real-access-token";
+const privateKey = "real-private-value";
+const databasePassword = "real-database-password";
+{"refreshToken":"real-refresh-token"}`);
  assert.equal(result.counts.high, 6);
});

test("keeps a near-limit underscore-heavy added line linear", () => {
  const filler = "AAAA_".repeat(
    Math.floor((GIT_DIFF_LIMITS.maxCharacters - 64) / 5),
  );
  const started = performance.now();
  const result = inspectUnifiedDiff(
    `--- a/file\n+++ b/file\n@@ -0,0 +1,1 @@\n+${filler}`,
  );
  const elapsed = performance.now() - started;
  assert.equal(
    result.findingCodeCounts["generic-credential-assignment"],
    undefined,
  );
  assert.ok(elapsed < 1_000, `scan took ${elapsed.toFixed(0)} ms`);
});

test("returns an invalid assessment for non-diff text", () => {
  const result = inspectUnifiedDiff("const token = 'not-a-diff';");
  assert.equal(result.recognized, false);
  assert.equal(result.assessment.level, "invalid");
  assert.equal(result.counts.high, 0);
});

test("enforces character, line, file, and added-line limits", () => {
  assert.throws(
    () => inspectUnifiedDiff("x".repeat(GIT_DIFF_LIMITS.maxCharacters + 1)),
    RangeError,
  );
  assert.throws(
    () =>
      inspectUnifiedDiff(
        Array.from({ length: GIT_DIFF_LIMITS.maxLines + 1 }, () => "x").join(
          "\n",
        ),
      ),
    RangeError,
  );
  assert.throws(
    () =>
      inspectUnifiedDiff(
        Array.from(
          { length: GIT_DIFF_LIMITS.maxFiles + 1 },
          (_, index) => `diff --git a/${index} b/${index}`,
        ).join("\n"),
      ),
    RangeError,
  );
  const additions = Array.from(
    { length: GIT_DIFF_LIMITS.maxAddedLines + 1 },
    () => "+safe",
  ).join("\n");
  assert.throws(
    () =>
      inspectUnifiedDiff(
        `--- a/file\n+++ b/file\n@@ -0,0 +1,${GIT_DIFF_LIMITS.maxAddedLines + 1} @@\n${additions}`,
      ),
    RangeError,
  );
});

test("builds a privacy-safe counts-only export", () => {
  const privateEmail = "private-person@example.com";
  const result = inspectUnifiedDiff(makeDiff("safe.txt", [privateEmail]));
  const report = buildGitDiffExposureReport(result);
  assert.equal(report.tool, "Git Diff Exposure Checker");
  assert.deepEqual(report.limitations, [...GIT_DIFF_LIMITATIONS]);
  assert.equal(report.findingCodes["email-address"], 1);
  assert.doesNotMatch(JSON.stringify(report), /private-person/);
});

test("rejects non-text input", () => {
  assert.throws(() => inspectUnifiedDiff(null), TypeError);
});
