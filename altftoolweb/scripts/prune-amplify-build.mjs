import fs from "node:fs";
import path from "node:path";

const isAmplifyBuild = process.env.ALTFT_DEFER_BULK_PRERENDER === "true";

if (!isAmplifyBuild) process.exit(0);

const nextDir = path.resolve(".next");
// AWS's hosted-build ceiling is 220 MiB; 215 keeps ~5 MiB of packaging
// headroom (raised from 205 on 2026-07-28 — the catalogue's fixed platform
// cost had already used up the prior margin, see docs/TOOL_BUILD_PROGRESS.md
// §9). Do not raise this past ~215 without re-measuring the real ceiling:
// beyond that the adapter's packaging metadata can push the upload over 220.
const maxArtifactBytes = Number(
  process.env.ALTFT_AMPLIFY_ARTIFACT_MAX_BYTES || 215 * 1024 * 1024
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

// These files are useful while compiling or debugging a local build, but the
// deployed Next.js server does not read them. Removing them keeps Amplify's
// hosted artifact focused on runtime code, manifests, and public assets.
const buildOnlyArtifacts = ["trace", "trace-build", "types", "diagnostics"]
  .map((name) => path.join(nextDir, name))
  .filter((artifactPath) => fs.existsSync(artifactPath));

for (const artifactPath of buildOnlyArtifacts) {
  fs.rmSync(artifactPath, { force: true, recursive: true });
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
    (removableMedia.length || buildOnlyArtifacts.length
      ? `; pruned ${removableMedia.length} unused WASM asset and ${buildOnlyArtifacts.length} build-only artifact.`
      : ".")
);

if (artifactBytes > maxArtifactBytes) {
  throw new Error(
    `Amplify artifact is ${artifactMiB.toFixed(2)} MiB, above the ${maxArtifactMiB.toFixed(2)} MiB limit.`
  );
}
