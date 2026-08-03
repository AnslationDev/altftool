import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const browserImageConsumers = [
  "altftoolweb/src/tools/logo-similarity-checker/components/UploadZone.jsx",
  "altftoolweb/src/tools/twin-finder/components/DownloadDialog.jsx",
];

const lucideImportPattern = /import\s*\{([\s\S]*?)\}\s*from\s*["']lucide-react["'];/g;

describe("browser Image constructor bindings", () => {
  it("does not let a lucide icon shadow new Image()", () => {
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
