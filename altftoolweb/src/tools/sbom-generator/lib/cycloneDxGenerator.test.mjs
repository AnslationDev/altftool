import assert from "node:assert/strict";
import test from "node:test";

import { parseNpmSupplyChainInventory } from "../../_shared/npmSupplyChainInventory.mjs";
import { generateCycloneDxSbom } from "./cycloneDxGenerator.mjs";

const inventory = {
  sourceKind: "package-lock",
  truncated: false,
  project: { name: "demo", version: "1.0.0", license: "MIT" },
  components: [
    {
      name: "@scope/alpha",
      version: "2.0.0",
      declaredRange: "^2",
      license: "Apache-2.0",
      scope: "runtime",
      relationship: "direct",
    },
    {
      name: "beta",
      version: "",
      declaredRange: "^3",
      license: "",
      scope: "development",
      relationship: "direct",
    },
    {
      name: "gamma",
      version: "4.0.0",
      declaredRange: "",
      license: "MIT",
      scope: "runtime",
      relationship: "transitive",
    },
  ],
};

test("generates deterministic CycloneDX 1.7 JSON and marks composition incomplete", () => {
  const first = generateCycloneDxSbom(inventory);
  const second = generateCycloneDxSbom(inventory);
  assert.deepEqual(first, second);
  assert.equal(first.bom.bomFormat, "CycloneDX");
  assert.equal(first.bom.specVersion, "1.7");
  assert.equal(first.bom.compositions[0].aggregate, "incomplete");
  assert.equal(first.bom.metadata.component.licenses[0].license.name, "MIT");
  assert.deepEqual(
    first.bom.metadata.properties.find(
      (property) => property.name === "altftool:signatureStatus",
    ),
    { name: "altftool:signatureStatus", value: "not signed or attested" },
  );
  assert.equal("timestamp" in first.bom.metadata, false);
  assert.equal("serialNumber" in first.bom, false);
});

test("emits purls only for resolved versions and records ranges as properties", () => {
  const { bom } = generateCycloneDxSbom(inventory);
  assert.equal(bom.components[0].purl, "pkg:npm/%40scope/alpha@2.0.0");
  assert.equal("purl" in bom.components[1], false);
  assert.deepEqual(
    bom.components[1].properties.find(
      (property) => property.name === "altftool:npm:declaredRange",
    ),
    { name: "altftool:npm:declaredRange", value: "^3" },
  );
});

test("represents only known root-to-direct dependency edges", () => {
  const { bom, summary } = generateCycloneDxSbom(inventory);
  assert.equal(bom.dependencies.length, 1);
  assert.equal(bom.dependencies[0].dependsOn.length, 2);
  assert.equal(summary.directRelationships, 2);
  assert.equal(summary.unresolvedVersions, 1);
});

test("does not fabricate root edges for legacy lockfile relationships", () => {
  const legacyInventory = parseNpmSupplyChainInventory(
    JSON.stringify({
      lockfileVersion: 1,
      dependencies: {
        alpha: { version: "1.0.0" },
        beta: { version: "2.0.0" },
      },
    }),
    { fileName: "package-lock.json" },
  );
  const { bom, summary } = generateCycloneDxSbom(legacyInventory);

  assert.deepEqual(bom.dependencies[0].dependsOn, []);
  assert.equal(summary.directRelationships, 0);
  assert.equal(summary.unknownRelationships, 2);
  assert.ok(
    bom.metadata.properties.some(
      (property) =>
        property.name === "altftool:inventoryWarning" &&
        /marked unknown/iu.test(property.value),
    ),
  );
});

test("records bounded occurrence and alias evidence on a logical component", () => {
  const occurrenceInventory = {
    ...inventory,
    components: [
      {
        ...inventory.components[0],
        occurrenceCount: 2,
        aliases: ["alpha-alias"],
        paths: [
          "node_modules/alpha-alias",
          "node_modules/demo/node_modules/alpha-alias",
        ],
      },
    ],
  };
  const { bom } = generateCycloneDxSbom(occurrenceInventory);
  const properties = bom.components[0].properties;

  assert.ok(
    properties.some(
      (property) =>
        property.name === "altftool:npm:occurrenceCount" &&
        property.value === "2",
    ),
  );
  assert.ok(
    properties.some(
      (property) =>
        property.name === "altftool:npm:installAlias" &&
        property.value === "alpha-alias",
    ),
  );
  assert.equal(
    properties.filter(
      (property) => property.name === "altftool:npm:installPath",
    ).length,
    2,
  );
});

test("includes volatile metadata only under the explicit provided policy", () => {
  const timestamp = "2026-07-24T10:00:00.000Z";
  const serialNumber = "urn:uuid:123e4567-e89b-42d3-a456-426614174000";
  const { bom } = generateCycloneDxSbom(inventory, {
    metadataPolicy: "provided",
    timestamp,
    serialNumber,
  });
  assert.equal(bom.serialNumber, serialNumber);
  assert.equal(bom.metadata.timestamp, timestamp);
});

test("rejects invalid inputs and volatile metadata", () => {
  assert.throws(() => generateCycloneDxSbom(null), /inventory/iu);
  assert.throws(
    () => generateCycloneDxSbom(inventory, { metadataPolicy: "random" }),
    /policy/iu,
  );
  assert.throws(
    () =>
      generateCycloneDxSbom(inventory, {
        metadataPolicy: "provided",
        serialNumber: "bad",
        timestamp: "bad",
      }),
    /UUID/iu,
  );
});
