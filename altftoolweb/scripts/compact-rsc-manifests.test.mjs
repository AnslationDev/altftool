import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";

const scriptPath = path.join(
  import.meta.dirname,
  "compact-rsc-manifests.mjs",
);

function moduleRecord(id, chunks = []) {
  return { id, name: "*", chunks, async: false };
}

function mappingRecord(id) {
  return { "*": moduleRecord(String(id)) };
}

function createManifest() {
  const clientModules = {};
  const ssrModuleMapping = {};
  const rscModuleMapping = {};
  const edgeRscModuleMapping = {};

  for (let index = 0; index < 80; index += 1) {
    const sourceRoot =
      index % 2 === 0
        ? "/fixture/root/node_modules/example-package/"
        : "/fixture/root/altftoolweb/src/components/";
    clientModules[`${sourceRoot}module-${index}.js`] = moduleRecord(
      1000 + index,
      [`static/chunks/group-${index % 3}.js`],
    );

    const moduleId = String(10000 + index);
    rscModuleMapping[moduleId] = mappingRecord(20000 + index);
    ssrModuleMapping[moduleId] = mappingRecord(30000 + index);
    if (index % 8 === 0) {
      edgeRscModuleMapping[moduleId] = mappingRecord(40000 + index);
    }
  }

  return {
    moduleLoading: { prefix: "", crossOrigin: null },
    ssrModuleMapping,
    edgeSSRModuleMapping: {},
    clientModules,
    entryCSSFiles: {},
    rscModuleMapping,
    edgeRscModuleMapping,
  };
}

function sourceFor(manifest) {
  return (
    "globalThis.__RSC_MANIFEST=(globalThis.__RSC_MANIFEST||{});" +
    `globalThis.__RSC_MANIFEST["/fixture/page"]=${JSON.stringify(manifest)};`
  );
}

function evaluate(source) {
  const context = { process: { env: {} } };
  context.globalThis = context;
  vm.createContext(context);
  vm.runInContext(source, context);
  return JSON.parse(JSON.stringify(context.__RSC_MANIFEST["/fixture/page"]));
}

async function compactFixture(t, mutate = () => {}) {
  const temporaryRoot = await fs.mkdtemp(
    path.join(os.tmpdir(), "altft-rsc-compaction-"),
  );
  t.after(() => fs.rm(temporaryRoot, { force: true, recursive: true }));

  const manifest = createManifest();
  mutate(manifest);
  const original = sourceFor(manifest);
  const manifestDirectory = path.join(
    temporaryRoot,
    ".next/server/app/fixture",
  );
  const manifestPath = path.join(
    manifestDirectory,
    "page_client-reference-manifest.js",
  );
  await fs.mkdir(manifestDirectory, { recursive: true });
  await fs.writeFile(manifestPath, original);

  const result = spawnSync(process.execPath, [scriptPath], {
    cwd: temporaryRoot,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);

  const compacted = await fs.readFile(manifestPath, "utf8");
  assert.ok(compacted.length < original.length);
  assert.deepEqual(evaluate(compacted), manifest);
  return { compacted, stdout: result.stdout };
}

test("compact encoder preserves hoisted paths and narrow edge RSC maps", async (t) => {
  const { compacted, stdout } = await compactFixture(t);
  assert.match(stdout, /1\/1 manifests rewritten/u);
  assert.doesNotMatch(compacted, /var N=/u);
  assert.match(compacted, /edgeRscModuleMapping:X\[2\]/u);
});

test("edge RSC entries outside the normal RSC map use the general encoder", async (t) => {
  const { compacted } = await compactFixture(t, (manifest) => {
    manifest.edgeRscModuleMapping["999999"] = mappingRecord(50000);
  });
  assert.match(compacted, /var N=/u);
});

test("nonempty edge SSR maps use the general encoder", async (t) => {
  const { compacted } = await compactFixture(t, (manifest) => {
    manifest.edgeSSRModuleMapping["10000"] = mappingRecord(60000);
  });
  assert.match(compacted, /var N=/u);
});
