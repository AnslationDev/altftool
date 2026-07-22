import fs from "node:fs";
import path from "node:path";

const isAmplifyBuild = process.env.ALTFT_DEFER_BULK_PRERENDER === "true";

if (!isAmplifyBuild) process.exit(0);

const nextDir = path.resolve(".next");
const mediaDir = path.join(nextDir, "static", "media");
const maxArtifactBytes = Number(
  process.env.ALTFT_AMPLIFY_ARTIFACT_MAX_BYTES || 220 * 1024 * 1024
);

if (!fs.existsSync(nextDir)) {
  throw new Error("Amplify artifact check could not find .next.");
}

// @imgly/background-removal supplies explicit CDN-backed WASM paths at
// runtime. Webpack also emits this WebGPU fallback, which none of our callers
// use and which otherwise consumes more than 22 MiB of the Amplify artifact.
const removableMedia = fs.existsSync(mediaDir)
  ? fs
      .readdirSync(mediaDir)
      .filter((name) => /^ort-wasm-simd-threaded\.jsep\.[a-f0-9]+\.wasm$/u.test(name))
  : [];

for (const name of removableMedia) {
  fs.rmSync(path.join(mediaDir, name));
}

function directorySize(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).reduce((total, entry) => {
    if (directory === nextDir && entry.name === "cache") return total;

    const entryPath = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) return total;
    if (entry.isDirectory()) return total + directorySize(entryPath);
    return total + fs.statSync(entryPath).size;
  }, 0);
}

const artifactBytes = directorySize(nextDir);
const artifactMiB = artifactBytes / (1024 * 1024);
const maxArtifactMiB = maxArtifactBytes / (1024 * 1024);

console.log(
  `Amplify artifact gate: ${artifactMiB.toFixed(2)} MiB / ${maxArtifactMiB.toFixed(2)} MiB` +
    (removableMedia.length ? `; pruned ${removableMedia.length} unused WASM asset.` : ".")
);

if (artifactBytes > maxArtifactBytes) {
  throw new Error(
    `Amplify artifact is ${artifactMiB.toFixed(2)} MiB, above the ${maxArtifactMiB.toFixed(2)} MiB limit.`
  );
}
