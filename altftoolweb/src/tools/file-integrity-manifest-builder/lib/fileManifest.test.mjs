import assert from "node:assert/strict";
import test from "node:test";

import {
  buildCountsOnlySummary,
  buildManifest,
  compareManifests,
  FILE_LIMITS,
  findDuplicateDigestGroups,
  MANIFEST_SCHEMA,
  parseManifestText,
  prepareFileSelection,
  sha256ArrayBuffer,
} from "./fileManifest.mjs";

const DIGEST_A = "a".repeat(64);
const DIGEST_B = "b".repeat(64);
const DIGEST_C = "c".repeat(64);

function entry(relativeName, sha256, overrides = {}) {
  return {
    relativeName,
    sizeBytes: 10,
    mediaType: "text/plain",
    lastModified: 1_700_000_000_000,
    sha256,
    ...overrides,
  };
}

test("prepares files in deterministic relative-name order", () => {
  const result = prepareFileSelection([
    {
      name: "z.txt",
      webkitRelativePath: "folder/z.txt",
      size: 3,
      type: "text/plain",
      lastModified: 3,
    },
    {
      name: "a.txt",
      webkitRelativePath: "folder/nested/a.txt",
      size: 2,
      type: "text/plain",
      lastModified: 2,
    },
    {
      name: "a.txt",
      webkitRelativePath: "folder/a.txt",
      size: 1,
      type: "text/plain",
      lastModified: 1,
    },
  ]);

  assert.equal(result.ok, true);
  assert.deepEqual(
    result.files.map((file) => file.relativeName),
    ["folder/a.txt", "folder/nested/a.txt", "folder/z.txt"],
  );
});

test("rejects duplicate relative names and bounded-selection violations", () => {
  const duplicate = prepareFileSelection([
    { name: "same.txt", size: 1, type: "", lastModified: 1 },
    { name: "same.txt", size: 1, type: "", lastModified: 1 },
  ]);
  assert.equal(duplicate.ok, false);
  assert.match(duplicate.errors.join(" "), /Duplicate relative name/iu);

  const tooLarge = prepareFileSelection([
    {
      name: "large.bin",
      size: FILE_LIMITS.maxFileBytes + 1,
      type: "",
      lastModified: 1,
    },
  ]);
  assert.equal(tooLarge.ok, false);
  assert.match(tooLarge.errors.join(" "), /per-file/iu);

  const overlongName = prepareFileSelection([
    {
      name: `${"n".repeat(FILE_LIMITS.maxRelativeNameLength + 1)}.txt`,
      size: 1,
      type: "",
      lastModified: 1,
    },
  ]);
  assert.equal(overlongName.ok, false);
  assert.match(overlongName.errors.join(" "), /relative-name length/iu);
});

test("computes a known SHA-256 value", async () => {
  const buffer = new TextEncoder().encode("abc").buffer;
  assert.equal(
    await sha256ArrayBuffer(buffer),
    "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
  );
});

test("builds a sorted manifest with required metadata and cautious limits", () => {
  const manifest = buildManifest(
    [
      entry("z.txt", DIGEST_B),
      entry("a.txt", DIGEST_A, {
        sizeBytes: 4,
        mediaType: "application/json",
        lastModified: 9,
      }),
    ],
    new Date("2026-07-24T12:00:00.000Z"),
  );

  assert.equal(manifest.schema, MANIFEST_SCHEMA);
  assert.deepEqual(
    manifest.files.map((file) => file.relativeName),
    ["a.txt", "z.txt"],
  );
  assert.deepEqual(
    Object.keys(manifest.files[0]),
    ["relativeName", "sizeBytes", "mediaType", "lastModified", "sha256"],
  );
  assert.match(manifest.limitations.join(" "), /does not establish/iu);
  assert.match(manifest.limitations.join(" "), /does not make a file trustworthy/iu);
});

test("finds repeated digests without merging different paths", () => {
  const groups = findDuplicateDigestGroups([
    entry("b-copy.txt", DIGEST_A),
    entry("a.txt", DIGEST_A),
    entry("unique.txt", DIGEST_B),
  ]);

  assert.equal(groups.length, 1);
  assert.equal(groups[0].sha256, DIGEST_A);
  assert.deepEqual(
    groups[0].files.map((file) => file.relativeName),
    ["a.txt", "b-copy.txt"],
  );
});

test("compares by relative name and separates digest from metadata changes", () => {
  const baseline = buildManifest([
    entry("matched.txt", DIGEST_A, { lastModified: 1 }),
    entry("changed.txt", DIGEST_B),
    entry("missing.txt", DIGEST_C),
  ]);
  const current = buildManifest([
    entry("matched.txt", DIGEST_A, { lastModified: 2 }),
    entry("changed.txt", DIGEST_C),
    entry("new.txt", DIGEST_B),
  ]);
  const result = compareManifests(current, baseline);

  assert.deepEqual(result.counts, {
    digestMatches: 1,
    digestDifferences: 1,
    currentOnly: 1,
    baselineOnly: 1,
    metadataDifferences: 1,
  });
  assert.deepEqual(
    result.rows.map((row) => [row.relativeName, row.status]),
    [
      ["changed.txt", "digest-different"],
      ["matched.txt", "digest-match"],
      ["missing.txt", "baseline-only"],
      ["new.txt", "current-only"],
    ],
  );
  assert.deepEqual(
    result.rows.find((row) => row.relativeName === "matched.txt")
      .metadataDifferences,
    ["lastModified"],
  );
});

test("imports only valid, unambiguous manifests", () => {
  const manifest = buildManifest([entry("a.txt", DIGEST_A)]);
  assert.equal(parseManifestText(JSON.stringify(manifest)).ok, true);

  const invalid = {
    ...manifest,
    files: [
      entry("same.txt", DIGEST_A),
      entry("same.txt", DIGEST_B),
    ],
  };
  const parsed = parseManifestText(JSON.stringify(invalid));
  assert.equal(parsed.ok, false);
  assert.match(parsed.errors.join(" "), /Duplicate relative name/iu);

  const oversized = {
    ...manifest,
    files: [
      entry("too-large.bin", DIGEST_A, {
        sizeBytes: FILE_LIMITS.maxFileBytes + 1,
      }),
    ],
  };
  const oversizedResult = parseManifestText(JSON.stringify(oversized));
  assert.equal(oversizedResult.ok, false);
  assert.match(oversizedResult.errors.join(" "), /per-file size limit/iu);
});

test("counts-only summary excludes relative names and digests", () => {
  const manifest = buildManifest([
    entry("PRIVATE-NAME.txt", DIGEST_A),
    entry("PRIVATE-COPY.txt", DIGEST_A),
  ]);
  const comparison = compareManifests(
    manifest,
    buildManifest([entry("PRIVATE-NAME.txt", DIGEST_B)]),
  );
  const summary = buildCountsOnlySummary(
    manifest,
    comparison,
    new Date("2026-07-24T12:00:00.000Z"),
  );
  const serialized = JSON.stringify(summary);

  assert.equal(summary.counts.files, 2);
  assert.equal(summary.counts.duplicateDigestGroups, 1);
  assert.equal(summary.counts.digestDifferences, 1);
  assert.equal(serialized.includes("PRIVATE-NAME.txt"), false);
  assert.equal(serialized.includes(DIGEST_A), false);
  assert.equal(serialized.includes(DIGEST_B), false);
  assert.equal(summary.scope.includesRelativeNames, false);
  assert.equal(summary.scope.includesDigests, false);
});
