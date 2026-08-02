import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const webRoot = path.resolve(import.meta.dirname, "../../../..");

async function readPdfjsVersion(relativePath) {
  const source = await readFile(path.join(webRoot, relativePath), "utf8");
  const match = source.match(/pdfjsVersion\s*=\s*([0-9]+\.[0-9]+\.[0-9]+)/);
  assert.ok(match, `${relativePath} must declare its pdf.js version`);
  return match[1];
}

test("the browser PDF API, worker, and dependency use one exact version", async () => {
  const packageJson = JSON.parse(
    await readFile(path.join(webRoot, "package.json"), "utf8"),
  );
  const dependencyVersion = packageJson.dependencies?.["pdfjs-dist"];
  const [apiVersion, workerVersion] = await Promise.all([
    readPdfjsVersion("public/altflovepdf/pdf.min.mjs"),
    readPdfjsVersion("public/altflovepdf/pdf.worker.min.mjs"),
  ]);

  assert.match(
    dependencyVersion || "",
    /^\d+\.\d+\.\d+$/,
    "pdfjs-dist must be pinned so public assets cannot drift after install",
  );
  assert.equal(apiVersion, dependencyVersion);
  assert.equal(workerVersion, dependencyVersion);
});
