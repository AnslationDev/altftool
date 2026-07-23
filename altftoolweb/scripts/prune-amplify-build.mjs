import fs from "node:fs";
import path from "node:path";

const isAmplifyBuild = process.env.ALTFT_DEFER_BULK_PRERENDER === "true";

if (!isAmplifyBuild) process.exit(0);

const nextDir = path.resolve(".next");
const maxArtifactBytes = Number(
  process.env.ALTFT_AMPLIFY_ARTIFACT_MAX_BYTES || 205 * 1024 * 1024
);

if (!fs.existsSync(nextDir)) {
  throw new Error("Amplify artifact check could not find .next.");
}

// @imgly/background-removal supplies explicit CDN-backed WASM paths at
// runtime. Webpack also emits this WebGPU fallback, which none of our callers
// use and which otherwise consumes more than 22 MiB of the Amplify artifact.
const wasmMediaDirectories = [
  path.join(nextDir, "static", "media"),
  path.join(nextDir, "server", "chunks", "static", "media"),
];
const removableMedia = wasmMediaDirectories.flatMap((directory) =>
  fs.existsSync(directory)
    ? fs
        .readdirSync(directory)
        .filter((name) => /^ort-wasm-simd-threaded\.jsep\.[a-f0-9]+\.wasm$/u.test(name))
        .map((name) => path.join(directory, name))
    : []
);

for (const filePath of removableMedia) {
  fs.rmSync(filePath);
}

function directorySize(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).reduce((total, entry) => {
    // Amplify strips the cache and normalizes Next's duplicate standalone
    // staging tree before enforcing the hosted build-output limit. Keep this
    // gate below AWS's 220 MiB ceiling because the adapter adds packaging
    // metadata after the application build completes.
    if (
      directory === nextDir &&
      (entry.name === "cache" || entry.name === "standalone")
    ) {
      return total;
    }

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
