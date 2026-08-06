import assert from "node:assert/strict";
import { globSync, readFileSync, statSync } from "node:fs";
import { describe, it } from "node:test";

const lucideImportPattern = /import\s*\{([\s\S]*?)\}\s*from\s*["']lucide-react["'];/g;

function findBrowserImageConsumers() {
  return globSync("altftoolweb/src/**/*.{js,jsx,mjs,ts,tsx}")
    .filter((file) => statSync(file).isFile())
    .filter((file) => {
      const source = readFileSync(file, "utf8");
      return source.includes("lucide-react") && /\bnew\s+Image\s*\(/.test(source);
    });
}

describe("browser Image constructor bindings", () => {
  it("does not let a lucide icon shadow new Image()", () => {
    const browserImageConsumers = findBrowserImageConsumers();
    assert.ok(browserImageConsumers.length > 0, "expected at least one browser Image consumer");

    for (const file of browserImageConsumers) {
      const source = readFileSync(file, "utf8");
      const lucideSpecifiers = [...source.matchAll(lucideImportPattern)]
        .flatMap((match) => match[1].split(","))
        .map((specifier) => specifier.trim());

      assert.match(source, /\bnew\s+Image\s*\(/, `${file} must exercise the browser Image API`);
      assert.ok(
        !lucideSpecifiers.includes("Image"),
        `${file} imports lucide Image without an alias and shadows the browser constructor`,
      );
    }
  });
});
