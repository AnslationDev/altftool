import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  buildPerformanceBudgetReport,
  renderPerformanceBudgetMarkdown,
} from "../scripts/check-performance-budgets.mjs";

function writeFixtureFile(rootDir, relativePath, content) {
  const fullPath = path.join(rootDir, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
}

function defaultOptions(rootDir) {
  return {
    appBudgets: [
      {
        name: "web",
        cwd: "altftoolweb",
        maxChunkGzipKiB: 20,
        maxChunkRawKiB: 20,
        maxTotalJsGzipKiB: 30,
        maxTotalCssGzipKiB: 10,
      },
      {
        name: "admin",
        cwd: "altftoolwebadmin",
        maxChunkGzipKiB: 20,
        maxChunkRawKiB: 20,
        maxTotalJsGzipKiB: 30,
        maxTotalCssGzipKiB: 10,
      },
    ],
    criticalAssets: [{ file: "altftoolweb/public/hero.jpg", maxKiB: 10 }],
    forbiddenReferences: [],
    maxPublicImageKiB: 12,
    minDynamicToolImports: 2,
    priorityToolSlugs: ["one", "two"],
    requireBuild: true,
    rootDir,
  };
}

test("performance budget report passes small chunks, media, and lazy tool boundaries", async () => {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "altft-performance-clean-"));

  try {
    writeFixtureFile(rootDir, "altftoolweb/.next/static/chunks/app.js", "console.log('web');");
    writeFixtureFile(rootDir, "altftoolweb/.next/static/css/app.css", "body{color:#111}");
    writeFixtureFile(rootDir, "altftoolwebadmin/.next/static/chunks/app.js", "console.log('admin');");
    writeFixtureFile(rootDir, "altftoolwebadmin/.next/static/css/app.css", "body{color:#111}");
    writeFixtureFile(rootDir, "altftoolwebadmin/src/app/layout.jsx", "export default function Layout(){ return null; }");
    writeFixtureFile(rootDir, "altftoolwebadmin/src/components/admin/CkeditorAssets.jsx", "export default function CkeditorAssets(){ return null; }");
    writeFixtureFile(rootDir, "altftoolweb/public/hero.jpg", Buffer.alloc(1024, 7));
    writeFixtureFile(
      rootDir,
      "altftoolweb/src/platform/registry/toolRuntimeMap.js",
      'export const toolRuntimeMap = { one: () => import("@/tools/one/entry"), two: () => import("@/tools/two/entry") };',
    );
    writeFixtureFile(
      rootDir,
      "altftoolweb/src/app/tools/[category]/[slug]/ToolClient.jsx",
      'const Tool = dynamic(() => loadToolModule(slug), { ssr: false, loading: () => null });',
    );
    writeFixtureFile(rootDir, "altftoolweb/src/app/tools/page.jsx", "export default function Page(){return null;}");

    const report = await buildPerformanceBudgetReport(defaultOptions(rootDir));
    const markdown = renderPerformanceBudgetMarkdown(report);

    assert.equal(report.ok, true);
    assert.equal(report.status, "clean");
    assert.equal(report.totals.failures, 0);
    assert.equal(report.totals.dynamicToolImports, 2);
    assert.equal(report.totals.priorityToolRuntimeCoverage, "2/2");
    assert.equal(report.totals.missingPriorityToolRuntimes, 0);
    assert.equal(report.source.lazyShell.hasDynamicLoader, true);
    assert.equal(report.source.lazyShell.disablesSsr, true);
    assert.equal(report.adminSource.globalEditorCdn, false);
    assert.equal(report.adminSource.lazyEditorAssets, true);
    assert.match(markdown, /Performance Budget Report/);
    assert.doesNotMatch(JSON.stringify(report), /PRIVATE KEY-----/);
  } finally {
    fs.rmSync(rootDir, { recursive: true, force: true });
  }
});

test("performance budget report catches oversized assets and eager tool imports", async () => {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "altft-performance-blocked-"));

  try {
    writeFixtureFile(rootDir, "altftoolweb/.next/static/chunks/large.js", Buffer.alloc(30 * 1024, 1));
    writeFixtureFile(rootDir, "altftoolwebadmin/.next/static/chunks/app.js", "console.log('admin');");
    writeFixtureFile(
      rootDir,
      "altftoolwebadmin/src/app/layout.jsx",
      '<script src="https://cdn.ckeditor.com/ckeditor5/48.0.1/ckeditor5.umd.js"></script>',
    );
    writeFixtureFile(rootDir, "altftoolweb/public/hero.jpg", Buffer.alloc(14 * 1024, 3));
    writeFixtureFile(
      rootDir,
      "altftoolweb/src/platform/registry/toolRuntimeMap.js",
      'export const toolRuntimeMap = { one: () => import("@/tools/one/entry") };',
    );
    writeFixtureFile(
      rootDir,
      "altftoolweb/src/app/tools/[category]/[slug]/ToolClient.jsx",
      "export default function ToolClient(){ return null; }",
    );
    writeFixtureFile(
      rootDir,
      "altftoolweb/src/app/tools/page.jsx",
      'import Demo from "@/tools/demo/entry"; export default Demo;',
    );

    const report = await buildPerformanceBudgetReport(defaultOptions(rootDir));

    assert.equal(report.ok, false);
    assert.ok(report.failures.some((issue) => /largest raw chunk/.test(issue.message)));
    assert.ok(report.failures.some((issue) => /hero\.jpg/.test(issue.message)));
    assert.ok(report.warnings.some((issue) => /imports tool code directly/.test(issue.message)));
    assert.ok(report.warnings.some((issue) => /dynamic imports/.test(issue.message)));
    assert.ok(report.warnings.some((issue) => /missing dynamic runtime imports for priority tools/.test(issue.message)));
    assert.ok(report.warnings.some((issue) => /next\/dynamic and ssr:false/.test(issue.message)));
    assert.ok(report.warnings.some((issue) => /loads CKEditor\/CKBox CDN assets globally/.test(issue.message)));
    assert.equal(report.totals.priorityToolRuntimeCoverage, "1/2");
    assert.equal(report.totals.missingPriorityToolRuntimes, 1);
  } finally {
    fs.rmSync(rootDir, { recursive: true, force: true });
  }
});

test("performance budget report permits shared runtimes but flags dedicated slug mismatches", async () => {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "altft-performance-runtime-map-"));

  try {
    writeFixtureFile(
      rootDir,
      "altftoolweb/src/platform/registry/toolRuntimeMap.js",
      [
        "export const toolRuntimeMap = {",
        '  shared: () => import("@/tools/_shared/newtasks/entry"),',
        '  mismatched: () => import("@/tools/another-tool/entry"),',
        "};",
      ].join("\n"),
    );

    const options = defaultOptions(rootDir);
    options.appBudgets = [];
    options.criticalAssets = [];
    options.priorityToolSlugs = [];
    options.requireBuild = false;

    const report = await buildPerformanceBudgetReport(options);

    assert.deepEqual(report.source.runtimeImportMismatches, [
      { mapKey: "mismatched", importSlug: "another-tool" },
    ]);
    assert.ok(report.warnings.some((issue) => /mismatched imports another-tool/.test(issue.message)));
    assert.ok(report.warnings.every((issue) => !/shared imports _shared\/newtasks/.test(issue.message)));
  } finally {
    fs.rmSync(rootDir, { recursive: true, force: true });
  }
});
