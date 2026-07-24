import assert from "node:assert/strict";
import test from "node:test";

import {
  npmInventoryLimits,
  parseNpmSupplyChainInventory,
} from "./npmSupplyChainInventory.mjs";

test("parses package.json dependency groups without inventing versions or licenses", () => {
  const inventory = parseNpmSupplyChainInventory(
    JSON.stringify({
      name: "demo",
      version: "1.0.0",
      license: "MIT",
      dependencies: { react: "^19.0.0" },
      devDependencies: { eslint: "^9.0.0" },
    }),
    { fileName: "package.json" },
  );

  assert.equal(inventory.sourceKind, "package-json");
  assert.equal(inventory.project.license, "MIT");
  assert.deepEqual(
    inventory.components.map(({ name, version, license, scope }) => ({
      name,
      version,
      license,
      scope,
    })),
    [
      { name: "eslint", version: "", license: "", scope: "development" },
      { name: "react", version: "", license: "", scope: "runtime" },
    ],
  );
  assert.match(inventory.warnings[0], /does not contain resolved/iu);
});

test("parses package-lock v3 package records and direct relationships", () => {
  const inventory = parseNpmSupplyChainInventory(
    JSON.stringify({
      name: "demo",
      lockfileVersion: 3,
      packages: {
        "": { name: "demo", version: "1.0.0", dependencies: { alpha: "^2" } },
        "node_modules/alpha": {
          version: "2.1.0",
          license: "Apache-2.0",
          integrity: "sha512-example",
        },
        "node_modules/alpha/node_modules/beta": {
          version: "3.0.0",
          license: "MIT",
        },
      },
    }),
    { fileName: "package-lock.json" },
  );

  assert.equal(inventory.lockfileVersion, 3);
  assert.equal(inventory.directCount, 1);
  assert.equal(inventory.transitiveCount, 1);
  assert.deepEqual(
    inventory.components.map(({ name, relationship, license }) => ({
      name,
      relationship,
      license,
    })),
    [
      { name: "alpha", relationship: "direct", license: "Apache-2.0" },
      { name: "beta", relationship: "transitive", license: "MIT" },
    ],
  );
});

test("supports scoped package names in package-lock paths", () => {
  const inventory = parseNpmSupplyChainInventory(
    JSON.stringify({
      lockfileVersion: 3,
      packages: {
        "": { dependencies: { "@scope/pkg": "1.2.3" } },
        "node_modules/@scope/pkg": { version: "1.2.3" },
      },
    }),
  );
  assert.equal(inventory.components[0].name, "@scope/pkg");
  assert.equal(inventory.components[0].relationship, "direct");
});

test("marks legacy lockfile root relationships unknown instead of inventing direct edges", () => {
  const inventory = parseNpmSupplyChainInventory(
    JSON.stringify({
      lockfileVersion: 1,
      dependencies: {
        alpha: {
          version: "1.0.0",
          dependencies: { beta: { version: "2.0.0" } },
        },
      },
    }),
  );
  assert.deepEqual(
    inventory.components.map(({ name, relationship }) => ({
      name,
      relationship,
    })),
    [
      { name: "alpha", relationship: "unknown" },
      { name: "beta", relationship: "transitive" },
    ],
  );
  assert.equal(inventory.directCount, 0);
  assert.equal(inventory.unknownCount, 1);
  assert.match(inventory.warnings.join(" "), /marked unknown/iu);
});

test("resolves npm aliases by install path while preserving the target identity", () => {
  const inventory = parseNpmSupplyChainInventory(
    JSON.stringify({
      lockfileVersion: 3,
      packages: {
        "": {
          dependencies: { xlsx: "npm:@e965/xlsx@^0.20.3" },
        },
        "node_modules/xlsx": {
          name: "@e965/xlsx",
          version: "0.20.3",
          license: "Apache-2.0",
        },
      },
    }),
    { fileName: "package-lock.json" },
  );

  assert.equal(inventory.components[0].name, "@e965/xlsx");
  assert.equal(inventory.components[0].installName, "xlsx");
  assert.deepEqual(inventory.components[0].aliases, ["xlsx"]);
  assert.equal(inventory.components[0].relationship, "direct");
  assert.equal(
    inventory.components[0].declaredRange,
    "npm:@e965/xlsx@^0.20.3",
  );
});

test("deduplicates physical installs and resolves workspace link targets", () => {
  const inventory = parseNpmSupplyChainInventory(
    JSON.stringify({
      lockfileVersion: 3,
      packages: {
        "": { dependencies: { "@demo/core": "workspace:*" } },
        "node_modules/@demo/core": {
          resolved: "packages/core",
          link: true,
        },
        "packages/core": {
          name: "@demo/core",
          version: "1.2.3",
          license: "MIT",
        },
        "node_modules/consumer/node_modules/@demo/core": {
          name: "@demo/core",
          version: "1.2.3",
          license: "MIT",
        },
      },
    }),
  );

  assert.equal(inventory.components.length, 1);
  assert.equal(inventory.components[0].name, "@demo/core");
  assert.equal(inventory.components[0].relationship, "direct");
  assert.equal(inventory.components[0].occurrenceCount, 3);
  assert.deepEqual(inventory.components[0].paths, [
    "node_modules/@demo/core",
    "packages/core",
    "node_modules/consumer/node_modules/@demo/core",
  ]);
});

test("applies optionalDependencies override semantics once", () => {
  const inventory = parseNpmSupplyChainInventory(
    JSON.stringify({
      dependencies: { alpha: "^1.0.0" },
      optionalDependencies: { alpha: "^2.0.0" },
    }),
    { fileName: "package.json" },
  );

  assert.equal(inventory.components.length, 1);
  assert.equal(inventory.components[0].scope, "optional");
  assert.equal(inventory.components[0].declaredRange, "^2.0.0");
  assert.match(inventory.warnings.join(" "), /overrides dependencies/iu);
});

test("honors explicit package.json and does not treat a custom packages field as a lock", () => {
  const inventory = parseNpmSupplyChainInventory(
    JSON.stringify({
      name: "valid-package",
      packages: { desktop: { enabled: true } },
      dependencies: { lodash: "^4.17.21" },
    }),
    { fileName: "package.json" },
  );

  assert.equal(inventory.sourceKind, "package-json");
  assert.deepEqual(
    inventory.components.map(({ name, declaredRange }) => ({
      name,
      declaredRange,
    })),
    [{ name: "lodash", declaredRange: "^4.17.21" }],
  );
});

test("rejects control-character identity mutation and non-string versions", () => {
  assert.throws(
    () =>
      parseNpmSupplyChainInventory(
        JSON.stringify({ dependencies: { "left\npad": "^1.0.0" } }),
        { fileName: "package.json" },
      ),
    /control characters/iu,
  );
  assert.throws(
    () =>
      parseNpmSupplyChainInventory(
        JSON.stringify({
          lockfileVersion: 3,
          packages: {
            "": { dependencies: { alpha: "^1" } },
            "node_modules/alpha": { version: 1 },
          },
        }),
      ),
    /versions must be strings/iu,
  );
});

test("rejects empty, invalid, non-object, and oversized inputs", () => {
  assert.throws(() => parseNpmSupplyChainInventory(""), /empty/iu);
  assert.throws(() => parseNpmSupplyChainInventory("{"), /valid JSON/iu);
  assert.throws(() => parseNpmSupplyChainInventory("[]"), /top-level/iu);
  assert.throws(
    () =>
      parseNpmSupplyChainInventory(
        " ".repeat(npmInventoryLimits.maxSourceCharacters + 1),
      ),
    /exceeds/iu,
  );
});
