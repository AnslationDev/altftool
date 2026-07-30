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
// 184 MiB, bracketed by two real deploys rather than a model.
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
const standaloneDir = path.join(nextDir, "standalone");
const standaloneNext = path.join(standaloneDir, ".next");
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

// Amplify SSR runs on Amazon Linux (glibc, x64). Sharp's optional dependency
// resolver makes Next's standalone tracer copy the mutually exclusive musl
// binaries too, even though that runtime can never load them. Keep the glibc
// packages and remove only their Linux-musl counterparts from the staging tree.
const incompatibleStandalonePackages = [
  path.join(
    standaloneDir,
    "node_modules",
    "@img",
    "sharp-libvips-linuxmusl-x64",
  ),
  path.join(
    standaloneDir,
    "node_modules",
    "@img",
    "sharp-linuxmusl-x64",
  ),
].filter((packagePath) => fs.existsSync(packagePath));

for (const packagePath of incompatibleStandalonePackages) {
  fs.rmSync(packagePath, { force: true, recursive: true });
}

const incompatibleTraceFragments = [
  "sharp-libvips-linuxmusl-x64",
  "sharp-linuxmusl-x64",
];

function findIncompatibleTraceFiles(directory) {
  const matches = [];
  const pending = [directory];

  while (pending.length > 0) {
    const current = pending.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const entryPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        pending.push(entryPath);
      } else if (
        entry.name.endsWith(".nft.json") &&
        incompatibleTraceFragments.some((fragment) =>
          fs.readFileSync(entryPath, "utf8").includes(fragment),
        )
      ) {
        matches.push(path.relative(nextDir, entryPath));
      }
    }
  }

  return matches;
}

const incompatibleTraceFiles = findIncompatibleTraceFiles(nextDir);
if (incompatibleTraceFiles.length > 0) {
  throw new Error(
    "Amplify-incompatible Sharp musl packages remain in Next trace files: " +
      incompatibleTraceFiles.slice(0, 8).join(", ") +
      (incompatibleTraceFiles.length > 8
        ? ` (+${incompatibleTraceFiles.length - 8} more)`
        : ""),
  );
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
    // staging tree before enforcing the hosted build-output limit.
    //
    // `dev` is excluded because it is the dev server's output, never part of a
    // production upload — and it is easy to acquire by accident. A `next dev`
    // run in a build tree left 190 MiB there and the gate read 369.90 MiB for
    // an artifact that was really 180, which reads as a catastrophic
    // regression rather than as stale local state.
    if (
      directory === nextDir &&
      (entry.name === "cache" || entry.name === "standalone" || entry.name === "dev")
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
    if (directory === nextDir && (entry.name === "cache" || entry.name === "standalone" || entry.name === "dev")) {
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

// Amplify rebuilds compute/default from Next's NFT traces rather than uploading
// .next/standalone literally. The standalone tree is still a useful correlated
// pre-package signal, but not a stable multiplier: job 124 accepted alongside
// a 209.51 MiB tree, while job 125 paired a 226.52 MiB tree with a 245,501,745
// byte (234.13 MiB) compute bundle and rejected it against the 220 MiB cap.
//
// Keep a deterministic 12 MiB reserve instead of attempting another fitted
// ratio. The default is deliberately below the largest known accepted tree;
// raise it only after a larger standalone tree is accepted by Amplify.
const hasStandalone = fs.existsSync(standaloneDir);
const maxStandaloneBytes = Number(
  process.env.ALTFT_AMPLIFY_STANDALONE_MAX_BYTES || 208 * 1024 * 1024
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
    (removableMedia.length ||
    incompatibleStandalonePackages.length ||
    buildOnlyArtifacts.length
      ? `; pruned ${removableMedia.length} unused WASM asset, ` +
        `${incompatibleStandalonePackages.length} incompatible native package, and ` +
        `${buildOnlyArtifacts.length} build-only artifact.`
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
  console.log(
    `  standalone: ${standaloneMiB.toFixed(2)} MiB / ${(maxStandaloneBytes / (1024 * 1024)).toFixed(2)} MiB` +
      " (conservative pre-packaging cap; AWS hard limit 220.00 MiB)"
  );
  if (standaloneBytes > maxStandaloneBytes) {
    throw new Error(
      `.next/standalone is ${standaloneMiB.toFixed(2)} MiB, above the conservative ` +
        `${(maxStandaloneBytes / (1024 * 1024)).toFixed(2)} MiB pre-packaging cap. ` +
        "Amplify adds opaque packaging overhead before enforcing its 220.00 MiB hard limit."
    );
  }
}

if (artifactBytes > maxArtifactBytes) {
  throw new Error(
    `Amplify artifact is ${artifactMiB.toFixed(2)} MiB, above the ${maxArtifactMiB.toFixed(2)} MiB limit.`
  );
}
