import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { buildToolReadinessReport } from "../scripts/lib/tool-readiness.mjs";

async function writeTool(webRoot, slug, files) {
  const directory = path.join(webRoot, "src/tools", slug);
  await mkdir(directory, { recursive: true });
  await Promise.all(
    Object.entries(files).map(([filename, content]) =>
      writeFile(path.join(directory, filename), content, "utf8"),
    ),
  );
}

test("tool readiness separates working, API-required, partial, and broken tools", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "altftool-readiness-"));
  const webRoot = path.join(root, "web");

  try {
    await writeTool(webRoot, "working-tool", {
      "entry.jsx": 'export { default } from "./App";\n',
      "tool.config.js": 'export default { slug: "working-tool" };\n',
      "App.jsx":
        'export default function App(){ return <button onClick={() => navigator.clipboard.writeText("done")}>Copy</button>; }\n',
      "App.test.mjs": "export const covered = true;\n",
    });
    await writeTool(webRoot, "api-tool", {
      "entry.jsx": 'export { default } from "./App";\n',
      "tool.config.js": 'export default { slug: "api-tool" };\n',
      "App.jsx":
        "export default function App(){ async function run(){ return fetch(process.env.NEXT_PUBLIC_SAMPLE_API); } return <button onClick={run}>Run</button>; }\n",
    });
    await writeTool(webRoot, "partial-tool", {
      "entry.jsx": 'export { default } from "./App";\n',
      "tool.config.js": 'export default { slug: "partial-tool" };\n',
      "App.jsx":
        'export default function App(){ return <button onClick={() => alert("Feature coming soon")}>Try feature</button>; }\n',
    });
    await writeTool(webRoot, "broken-tool", {
      "entry.jsx": 'export { default } from "./Missing";\n',
    });

    const toolMetaMap = Object.fromEntries(
      ["working-tool", "api-tool", "partial-tool", "broken-tool"].map(
        (slug) => [
          slug,
          {
            name: slug,
            category: "Developer",
          },
        ],
      ),
    );
    const report = await buildToolReadinessReport({
      webRoot,
      toolMetaMap,
      prioritySlugs: new Set(["working-tool", "partial-tool"]),
      configuredEnvKeys: new Set(["NEXT_PUBLIC_SAMPLE_API"]),
      generatedAt: "2026-07-24T00:00:00.000Z",
      concurrency: 2,
    });
    const bySlug = new Map(report.items.map((item) => [item.slug, item]));

    assert.equal(bySlug.get("working-tool").status, "working");
    assert.equal(bySlug.get("working-tool").evidence.automatedTest, true);
    assert.equal(bySlug.get("api-tool").status, "api-required");
    assert.deepEqual(bySlug.get("api-tool").evidence.envKeys, [
      "NEXT_PUBLIC_SAMPLE_API",
    ]);
    assert.equal(bySlug.get("api-tool").apiReadiness.status, "configured");
    assert.deepEqual(bySlug.get("api-tool").apiReadiness.missingEnvKeys, []);
    assert.equal(
      bySlug.get("api-tool").apiReadiness.providers[0].name,
      "Sample",
    );
    assert.equal(bySlug.get("partial-tool").status, "partial");
    assert.equal(bySlug.get("broken-tool").status, "broken");
    assert.deepEqual(bySlug.get("broken-tool").evidence.unresolvedImports, [
      "./Missing",
    ]);
    assert.deepEqual(report.summary.counts, {
      working: 1,
      "api-required": 1,
      partial: 1,
      broken: 1,
    });
    assert.equal(report.summary.total, 4);
    assert.equal(report.summary.priority.total, 2);
    assert.equal(report.summary.priority.needsAttention, 1);
    assert.deepEqual(report.summary.api.counts, {
      configured: 1,
      "missing-config": 0,
      "runtime-check": 0,
    });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("tool API readiness excludes browser-local fetches and never serializes env values", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "altftool-api-readiness-"));
  const webRoot = path.join(root, "web");

  try {
    await writeTool(webRoot, "browser-local-tool", {
      "entry.jsx": 'export { default } from "./App";\n',
      "tool.config.js": 'export default { slug: "browser-local-tool" };\n',
      "App.jsx":
        'export default function App(){ async function run(){ const dataUrl = "data:text/plain,ready"; const result = await fetch(dataUrl); return navigator.clipboard.writeText(await result.text()); } return <button onClick={run}>Run</button>; }\n',
    });
    await writeTool(webRoot, "missing-provider-tool", {
      "entry.jsx": 'export { default } from "./App";\n',
      "tool.config.js": 'export default { slug: "missing-provider-tool" };\n',
      "App.jsx":
        "export default function App(){ async function run(){ const result = await fetch(process.env.NEXT_PUBLIC_PRIVATE_API_KEY); return result.json(); } return <button onClick={run}>Run</button>; }\n",
    });

    const report = await buildToolReadinessReport({
      webRoot,
      toolMetaMap: {
        "browser-local-tool": {
          name: "Browser local tool",
          category: "Developer",
        },
        "missing-provider-tool": {
          name: "Missing provider tool",
          category: "Developer",
        },
      },
      configuredEnvKeys: new Set(),
      generatedAt: "2026-07-24T00:00:00.000Z",
    });
    const bySlug = new Map(report.items.map((item) => [item.slug, item]));

    assert.equal(bySlug.get("browser-local-tool").status, "working");
    assert.equal(
      bySlug.get("browser-local-tool").apiReadiness.status,
      "not-required",
    );
    assert.equal(
      bySlug.get("browser-local-tool").apiReadiness.browserLocalOperations,
      1,
    );
    assert.equal(
      bySlug.get("missing-provider-tool").apiReadiness.status,
      "missing-config",
    );
    assert.deepEqual(
      bySlug.get("missing-provider-tool").apiReadiness.missingEnvKeys,
      ["NEXT_PUBLIC_PRIVATE_API_KEY"],
    );
    assert.equal(JSON.stringify(report).includes("super-secret-value"), false);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
