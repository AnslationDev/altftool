import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import path from "node:path";
import test from "node:test";

const webRoot = path.resolve(import.meta.dirname, "..");
const toolsRoot = path.join(webRoot, "src/tools");
const generatedSpecBanner =
  "// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.";
const specDescriptionPattern =
  /^\s*"description":\s*("(?:\\.|[^"\\])*")/mu;
const configDescriptionPattern =
  /^\s*description:\s*("(?:\\.|[^"\\])*")/mu;

function parseDescription(source, pattern, filePath) {
  const literal = source.match(pattern)?.[1];
  assert.ok(literal, `Expected a generated description in ${filePath}`);
  return JSON.parse(literal);
}

test("generated runtime descriptions match their authoritative tool configs", async () => {
  const entries = await fs.readdir(toolsRoot, { withFileTypes: true });
  const generatedTools = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const specPath = path.join(toolsRoot, entry.name, "spec.js");
    let specSource;
    try {
      specSource = await fs.readFile(specPath, "utf8");
    } catch (error) {
      if (error?.code === "ENOENT") continue;
      throw error;
    }

    // Hand-built specs can intentionally use different runtime copy. The
    // generator banner identifies only pairs emitted from one description.
    if (!specSource.startsWith(generatedSpecBanner)) continue;

    const configPath = path.join(toolsRoot, entry.name, "tool.config.js");
    const configSource = await fs.readFile(configPath, "utf8");
    generatedTools.push({
      slug: entry.name,
      specDescription: parseDescription(
        specSource,
        specDescriptionPattern,
        specPath,
      ),
      configDescription: parseDescription(
        configSource,
        configDescriptionPattern,
        configPath,
      ),
    });
  }

  assert.ok(generatedTools.length > 0, "Expected generated tool specs to exist");
  assert.deepEqual(
    generatedTools
      .filter(
        ({ specDescription, configDescription }) =>
          specDescription !== configDescription,
      )
      .map(({ slug, specDescription, configDescription }) => ({
        slug,
        specDescription,
        configDescription,
      })),
    [],
  );
});
