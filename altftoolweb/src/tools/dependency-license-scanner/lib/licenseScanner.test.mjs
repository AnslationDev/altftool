import assert from "node:assert/strict";
import test from "node:test";

import {
  analyzeDependencyLicenses,
  buildLicenseReport,
} from "./licenseScanner.mjs";

const inventory = {
  sourceKind: "package-lock",
  project: { license: "MIT" },
  warnings: [],
  components: [
    {
      name: "alpha",
      version: "1.0.0",
      declaredRange: "",
      relationship: "direct",
      scope: "runtime",
      license: "MIT",
    },
    {
      name: "beta",
      version: "2.0.0",
      declaredRange: "",
      relationship: "transitive",
      scope: "runtime",
      license: "AGPL-3.0-only",
    },
    {
      name: "gamma",
      version: "3.0.0",
      declaredRange: "",
      relationship: "transitive",
      scope: "development",
      license: "",
    },
  ],
};

test("separates declared, review-cue, and missing metadata without legal conclusions", () => {
  const result = analyzeDependencyLicenses(inventory);
  assert.deepEqual(result.counts, {
    total: 3,
    declared: 1,
    review: 1,
    unknown: 0,
    missing: 1,
  });
  assert.equal(result.findings[0].status, "declared");
  assert.equal(result.findings[1].cues[0].id, "network-copyleft");
  assert.equal(result.findings[2].status, "missing");
  assert.match(result.limitations.join(" "), /not SPDX validation/iu);
});

test("flags source-available and non-commercial wording only as review cues", () => {
  const result = analyzeDependencyLicenses({
    ...inventory,
    components: [
      { ...inventory.components[0], license: "BUSL-1.1" },
      { ...inventory.components[0], name: "delta", license: "CC-BY-NC-4.0" },
      { ...inventory.components[0], name: "elastic", license: "Elastic-2.0" },
    ],
  });
  assert.equal(result.counts.review, 3);
  assert.match(result.findings[0].cues[0].label, /review cue/iu);
  assert.equal(result.findings[2].cues[0].id, "source-available");
});

test("does not confuse the Boost Software License identifier with BUSL", () => {
  const result = analyzeDependencyLicenses({
    ...inventory,
    components: [
      { ...inventory.components[0], license: "BSL-1.0" },
      { ...inventory.components[0], name: "delta", license: "BUSL-1.1" },
    ],
  });
  assert.equal(result.findings[0].status, "declared");
  assert.equal(result.findings[1].status, "review");
  assert.equal(result.findings[1].cues[0].id, "source-available");
});

test("keeps opaque and non-asserted declarations in a neutral unknown status", () => {
  const licenses = [
    "Proprietary",
    "NOASSERTION",
    "NONE",
    "UNKNOWN",
    "LicenseRef-Company-Internal",
  ];
  const result = analyzeDependencyLicenses({
    ...inventory,
    components: licenses.map((license, index) => ({
      ...inventory.components[0],
      name: `package-${index}`,
      license,
    })),
  });

  assert.equal(result.counts.unknown, licenses.length);
  assert.ok(result.findings.every((finding) => finding.status === "unknown"));
  assert.match(result.limitations.join(" "), /neutral manual review/iu);
});

test("builds a deterministic local report with explicit nulls", () => {
  const report = buildLicenseReport(
    analyzeDependencyLicenses({
      ...inventory,
      warnings: ["Inventory was bounded."],
      truncated: true,
      components: [
        {
          ...inventory.components[0],
          occurrenceCount: 2,
          paths: ["node_modules/alpha", "node_modules/demo/node_modules/alpha"],
        },
        ...inventory.components.slice(1),
      ],
    }),
  );
  assert.equal(
    report.reportType,
    "altftool-dependency-license-declared-metadata-review",
  );
  assert.equal(report.projectLicenseDeclared, true);
  assert.equal(report.findings[2].declaredLicense, null);
  assert.equal(report.incomplete, true);
  assert.deepEqual(report.warnings, ["Inventory was bounded."]);
  assert.equal(report.findings[0].occurrenceCount, 2);
  assert.equal(report.findings[0].paths.length, 2);
  assert.equal("generatedAt" in report, false);
});

test("rejects invalid analysis inputs", () => {
  assert.throws(() => analyzeDependencyLicenses(null), /inventory/iu);
  assert.throws(() => buildLicenseReport({}), /analysis/iu);
});
