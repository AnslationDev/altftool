import assert from "node:assert/strict";
import test from "node:test";

import {
  buildInstallScriptReport,
  inspectPackageInstallScripts,
  installScriptInspectorLimits,
} from "./installScriptInspector.mjs";

test("identifies lifecycle scripts and calibrated review cues without executing", () => {
  const result = inspectPackageInstallScripts(
    JSON.stringify({
      name: "demo",
      scripts: {
        preinstall: "node ./check.js",
        install:
          "node-gyp rebuild && curl https://example.invalid/file -o local.bin",
        test: "node --test",
      },
    }),
  );
  assert.equal(result.counts.scripts, 3);
  assert.equal(result.counts.installLifecycle, 2);
  assert.deepEqual(
    result.scripts[1].cues.map((cue) => cue.category),
    ["network", "native-build"],
  );
  assert.match(result.limitations.join(" "), /never executed/iu);
});

test("classifies file, shell, environment, and encoded cues independently", () => {
  const result = inspectPackageInstallScripts(
    JSON.stringify({
      scripts: {
        postinstall:
          'bash -c "echo $TOKEN | base64 --decode > output && chmod 600 output"',
      },
    }),
  );
  const categories = result.scripts[0].cues.map((cue) => cue.category);
  assert.deepEqual(categories, [
    "file",
    "process",
    "environment",
    "encoded-or-dynamic",
  ]);
  assert.equal(result.scripts[0].reviewLevel, "multiple-cues");
});

test("recognizes lowercase and PowerShell environment access", () => {
  const result = inspectPackageInstallScripts(
    JSON.stringify({
      scripts: {
        install:
          'curl -H "Authorization: $npm_token" "$env:NPM_CONFIG_REGISTRY"',
      },
    }),
  );
  assert.deepEqual(
    result.scripts[0].cues.map((cue) => cue.category),
    ["network", "environment"],
  );
});

test("separates install hooks from pack and publish-only hooks", () => {
  const result = inspectPackageInstallScripts(
    JSON.stringify({
      scripts: {
        preprepare: "echo before",
        postprepare: "echo after",
        prepublishOnly: "echo publish",
        postpack: "echo packed",
      },
    }),
  );

  assert.equal(result.counts.installLifecycle, 2);
  assert.equal(result.counts.packPublishLifecycle, 2);
  assert.deepEqual(
    result.scripts.map(({ name, installLifecycle, lifecycleContext }) => ({
      name,
      installLifecycle,
      lifecycleContext,
    })),
    [
      {
        name: "preprepare",
        installLifecycle: true,
        lifecycleContext: "install",
      },
      {
        name: "postprepare",
        installLifecycle: true,
        lifecycleContext: "install",
      },
      {
        name: "prepublishOnly",
        installLifecycle: false,
        lifecycleContext: "pack-publish",
      },
      {
        name: "postpack",
        installLifecycle: false,
        lifecycleContext: "pack-publish",
      },
    ],
  );
});

test("does not call a script safe when no configured cue is found", () => {
  const result = inspectPackageInstallScripts(
    JSON.stringify({ scripts: { prepare: "echo ready" } }),
  );
  assert.equal(result.scripts[0].reviewLevel, "no-pattern-cue");
  assert.match(result.limitations.at(-1), /does not mean no risk/iu);
});

test("refuses to create a partial report when scripts exceed the count cap", () => {
  const scripts = Object.fromEntries(
    Array.from({ length: installScriptInspectorLimits.maxScripts }, (_, index) => [
      `task:${index}`,
      "echo ok",
    ]),
  );
  scripts.postinstall = "curl https://example.invalid/payload";

  assert.throws(
    () => inspectPackageInstallScripts(JSON.stringify({ scripts })),
    /does not create partial reports/iu,
  );
});

test("accepts an extensible package manifest with a custom packages field", () => {
  const result = inspectPackageInstallScripts(
    JSON.stringify({
      name: "desktop-app",
      packages: { desktop: { enabled: true } },
      scripts: { postinstall: "echo ready" },
    }),
  );
  assert.equal(result.counts.scripts, 1);
  assert.equal(result.scripts[0].name, "postinstall");
});

test("rejects lockfiles, malformed scripts, and bounded-input violations", () => {
  assert.throws(
    () => inspectPackageInstallScripts('{"lockfileVersion":3,"packages":{}}'),
    /package\.json/iu,
  );
  assert.throws(
    () => inspectPackageInstallScripts('{"scripts":"install"}'),
    /must be an object/iu,
  );
  assert.throws(
    () => inspectPackageInstallScripts('{"scripts":{"install":42}}'),
    /string command/iu,
  );
  assert.throws(
    () =>
      inspectPackageInstallScripts(
        JSON.stringify({ scripts: { "post\ninstall": "echo no" } }),
      ),
    /control characters/iu,
  );
  assert.throws(
    () =>
      inspectPackageInstallScripts(
        JSON.stringify({
          scripts: {
            install: "x".repeat(
              installScriptInspectorLimits.maxScriptCharacters + 1,
            ),
          },
        }),
      ),
    /per-script limit/iu,
  );
});

test("builds a local report without adding volatile metadata", () => {
  const report = buildInstallScriptReport(
    inspectPackageInstallScripts(
      JSON.stringify({ scripts: { install: "node-gyp rebuild" } }),
    ),
  );
  assert.equal(report.reportType, "altftool-inert-package-script-review");
  assert.equal(report.scripts[0].installLifecycle, true);
  assert.equal(report.scripts[0].lifecycleContext, "install");
  assert.equal(report.complete, true);
  assert.equal(report.truncated, false);
  assert.equal(report.omittedScriptCount, 0);
  assert.equal("generatedAt" in report, false);
});
