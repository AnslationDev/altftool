import fs from "node:fs";
import path from "node:path";

const isAmplifyBuild = process.env.ALTFT_DEFER_BULK_PRERENDER === "true";

if (!isAmplifyBuild) process.exit(0);

const nextDir = path.resolve(".next");
// AWS rejects a build output over 230,686,720 bytes (220.00 MiB). What it
// measures is NOT what this script measures: on job 101 the gate read 205.68
// MiB of .next and AWS then reported 249,551,354 bytes — 237.99 MiB — and
// refused the upload. Amplify's packaging adds 32.31 MiB the gate never sees.
//
// That gap is why the deploy kept dying after a green build: every threshold
// this file has carried (205, then 215) was measuring the wrong quantity, so
// it passed builds AWS was always going to reject. The last upload AWS did
// accept was job 80, which measured 165.88 MiB here.
//
// 185 MiB leaves ~2.7 MiB under the observed 32.31 MiB of packaging overhead.
// Do not raise it on the argument that a build "only just" fails — that is the
// same reasoning that produced 215. Raise it only against a fresh pair of
// numbers: a gate reading and the byte count AWS reports for the same job.
const maxArtifactBytes = Number(
  process.env.ALTFT_AMPLIFY_ARTIFACT_MAX_BYTES || 185 * 1024 * 1024
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

// Next writes the absolute build root into every RSC client-reference manifest,
// once per client module — about 148,000 occurrences across the artifact. The
// raw byte count therefore depends on where the repo happens to sit on disk:
// the same commit measured 214.95 MiB from a 47-character checkout path and
// 215.21 MiB from a 116-character worktree. That difference is not in the
// upload AWS receives, and reading it as real is what kept 81 finished tools
// parked against a ceiling the build was never actually near.
//
// So the gate reports what Amplify will package: bytes with the build root
// normalised to the length of its own. On Amplify the delta is zero and the
// scan is skipped, so this costs nothing where it matters.
const AMPLIFY_ROOT_LENGTH = "/codebuild/output/src621396274/src/knaltftoolweb"
  .length;
const buildRoot = process.cwd();
const rootLengthDelta = buildRoot.length - AMPLIFY_ROOT_LENGTH;

function embeddedRootOccurrences(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).reduce((total, entry) => {
    if (directory === nextDir && (entry.name === "cache" || entry.name === "standalone")) {
      return total;
    }
    const entryPath = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) return total;
    if (entry.isDirectory()) return total + embeddedRootOccurrences(entryPath);
    if (!/\.(js|json)$/.test(entry.name)) return total;

    const contents = fs.readFileSync(entryPath, "utf8");
    let count = 0;
    let at = contents.indexOf(buildRoot);
    while (at !== -1) {
      count += 1;
      at = contents.indexOf(buildRoot, at + buildRoot.length);
    }
    return total + count;
  }, 0);
}

const rawArtifactBytes = directorySize(nextDir);
const pathInflation =
  rootLengthDelta > 0 ? embeddedRootOccurrences(nextDir) * rootLengthDelta : 0;
const artifactBytes = rawArtifactBytes - pathInflation;
const artifactMiB = artifactBytes / (1024 * 1024);
const maxArtifactMiB = maxArtifactBytes / (1024 * 1024);

console.log(
  `Amplify artifact gate: ${artifactMiB.toFixed(2)} MiB / ${maxArtifactMiB.toFixed(2)} MiB` +
    (pathInflation > 0
      ? ` (${(rawArtifactBytes / (1024 * 1024)).toFixed(2)} MiB on disk here, less ${(pathInflation / (1024 * 1024)).toFixed(2)} MiB of build-root path this checkout adds and Amplify's does not)`
      : "") +
    (removableMedia.length || buildOnlyArtifacts.length
      ? `; pruned ${removableMedia.length} unused WASM asset and ${buildOnlyArtifacts.length} build-only artifact.`
      : ".")
);

// What AWS counts is still not pinned down: on job 101 it reported 32.31 MiB
// more than this walk found, and .next/cache (deleted), .next/standalone (never
// produced), the pruned WASM (unlinked above) and public/ (535 MiB, far too
// large to be the difference) are all ruled out. Printing the inventory next to
// the gate reading means the next failure arrives with the evidence attached,
// instead of costing another thirteen-minute build to ask the same question.
const inventory = fs
  .readdirSync(nextDir, { withFileTypes: true })
  .map((entry) => {
    const entryPath = path.join(nextDir, entry.name);
    const size = entry.isDirectory()
      ? directorySize(entryPath)
      : fs.statSync(entryPath).size;
    return { name: entry.name + (entry.isDirectory() ? "/" : ""), size };
  })
  .filter((entry) => entry.size > 256 * 1024)
  .sort((a, b) => b.size - a.size);

console.log(
  "  .next inventory: " +
    inventory
      .map((e) => `${e.name} ${(e.size / (1024 * 1024)).toFixed(1)}`)
      .join(", ") +
    " (MiB)"
);

if (artifactBytes > maxArtifactBytes) {
  throw new Error(
    `Amplify artifact is ${artifactMiB.toFixed(2)} MiB, above the ${maxArtifactMiB.toFixed(2)} MiB limit.`
  );
}
