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
// 181 MiB. Job 109 shipped at 180.59; job 110 added two prerendered pages
// (+1.59 MiB, gate 182.30) and AWS refused it by 0.96 MiB. The ceiling in this
// script's units is therefore in (180.59, 182.30] — much tighter than the
// (184.13, 185.09] bracket read from jobs 104 and 105, because what AWS counts
// is still not identified and its offset from this walk is not stable: 34.92
// MiB on job 105, 38.66 on job 110, 38.55 on job 111.
//
// Two models have now been tried and both were wrong. A constant overhead gave
// 187.69 and job 105 disproved it. A fixed ratio against .next/standalone fit
// jobs 105 and 110 to a third of a percent, so job 111 cut standalone by 24.15
// MiB — and AWS moved 0.11. standalone is not what it weighs either. Set this
// from deploys that actually shipped, and stop extrapolating.
//
//   job 104   gate 184.13  ->  ACCEPTED
//   job 105   gate 185.09  ->  AWS measured 220.01 MiB, refused at 220.00
//
// So the ceiling in this script's units sits in (184.13, 185.09]. 184 is under
// the last figure AWS actually took.
//
// The history here is worth keeping, because each wrong value was wrong for a
// different reason. 205 and 215 measured a quantity AWS does not — the gate
// read 205.68 for output AWS weighed at 237.99. That was fixed. Then 186 came
// from extrapolating a single pair: job 101 showed 32.31 MiB of packaging
// overhead, so 220 - 32.31 = 187.69 looked like the bound. Job 105 gave a
// second pair and the overhead was 34.92, not 32.31. It is not a constant, and
// two points are not enough to model it — so this value is now set by
// observation alone, not by arithmetic on the overhead.
//
// Raise it only when a job whose gate reading was HIGHER than this one is
// accepted by AWS. A failure is the only thing that locates the ceiling, and
// each attempt costs a red main.
const maxArtifactBytes = Number(
  process.env.ALTFT_AMPLIFY_ARTIFACT_MAX_BYTES || 181 * 1024 * 1024
);

if (!fs.existsSync(nextDir)) {
  throw new Error("Amplify artifact check could not find .next.");
}

// @imgly/background-removal supplies explicit CDN-backed WASM paths at
// runtime. Webpack also emits this WebGPU fallback, which none of our callers
// use and which otherwise consumes more than 22 MiB of the Amplify artifact.
const standaloneNext = path.join(nextDir, "standalone", ".next");
const wasmMediaDirectories = [
  path.join(nextDir, "static", "media"),
  path.join(nextDir, "server", "chunks", "static", "media"),
  path.join(standaloneNext, "static", "media"),
  path.join(standaloneNext, "server", "chunks", "static", "media"),
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
// react-loadable-manifest.json is a Pages Router artifact. This app has no
// pages/ directory, and `react-loadable-manifest` appears nowhere in
// next/dist — the build writes 0.75 MiB that nothing ever reads.
const buildOnlyNames = [
  "trace",
  "trace-build",
  "types",
  "diagnostics",
  "react-loadable-manifest.json",
];
const buildOnlyArtifacts = [nextDir, standaloneNext]
  .flatMap((root) => buildOnlyNames.map((name) => path.join(root, name)))
  .filter((artifactPath) => fs.existsSync(artifactPath));

for (const artifactPath of buildOnlyArtifacts) {
  fs.rmSync(artifactPath, { force: true, recursive: true });
}

// Amplify's packaging step READS Next's *.nft.json trace files. Pruning them
// saved 5.48 MiB and the build went green, then job 106 died at upload with
// "Server trace files are not found in .../.next". They are inputs to Amplify's
// own bundling, not just to `next build`, so they have to ship.
//
// Nor can they be shrunk: they are already minified and use paths relative to
// .next, so unlike the RSC manifests they carry no build-root inflation.

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

// What AWS actually weighs. Three jobs pinned it down: the byte count in its
// rejection message was 0.9334 and 0.9307 times the size of .next/standalone
// on jobs 105 and 110 — stable to a third of a percent — while this script's
// own walk moved the other way (185.09 -> 182.30) as AWS's number rose
// (220.01 -> 220.96). standalone is written by `next build` and holds its own
// copy of .next/server, so every post-build saving that skipped it shrank a
// directory AWS never looks at. The compaction and the prunes above now cover
// both trees; this measures the one that decides the deploy.
//
// 233 MiB of standalone predicts ~217 MiB at AWS, against its 220 limit.
const standaloneDir = path.join(nextDir, "standalone");
const hasStandalone = fs.existsSync(standaloneDir);
const AWS_BYTES_PER_STANDALONE_BYTE = 0.932;
const maxStandaloneBytes = Number(
  process.env.ALTFT_AMPLIFY_STANDALONE_MAX_BYTES || 233 * 1024 * 1024
);

function plainDirectorySize(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).reduce((total, entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) return total;
    if (entry.isDirectory()) return total + plainDirectorySize(entryPath);
    return total + fs.statSync(entryPath).size;
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

if (hasStandalone) {
  const standaloneBytes = plainDirectorySize(standaloneDir);
  const standaloneMiB = standaloneBytes / (1024 * 1024);
  const predictedAwsMiB =
    (standaloneBytes * AWS_BYTES_PER_STANDALONE_BYTE) / (1024 * 1024);
  console.log(
    `  standalone: ${standaloneMiB.toFixed(2)} MiB / ${(maxStandaloneBytes / (1024 * 1024)).toFixed(2)} MiB` +
      ` (predicts ~${predictedAwsMiB.toFixed(2)} MiB at AWS, limit 220.00)`
  );
  if (standaloneBytes > maxStandaloneBytes) {
    throw new Error(
      `.next/standalone is ${standaloneMiB.toFixed(2)} MiB, which predicts ` +
        `~${predictedAwsMiB.toFixed(2)} MiB at AWS against its 220.00 MiB limit. ` +
        `This is the measurement that decides the deploy — the .next figure above is not.`
    );
  }
}

if (artifactBytes > maxArtifactBytes) {
  throw new Error(
    `Amplify artifact is ${artifactMiB.toFixed(2)} MiB, above the ${maxArtifactMiB.toFixed(2)} MiB limit.`
  );
}
