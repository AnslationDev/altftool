import { promises as fs } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const minimumVersions = {
  postcss: [8, 5, 18],
  sharp: [0, 35, 0],
};

function versionParts(version) {
  return String(version)
    .split(".")
    .slice(0, 3)
    .map((part) => Number.parseInt(part, 10) || 0);
}

function isAtLeast(version, minimum) {
  const current = versionParts(version);
  for (let index = 0; index < minimum.length; index += 1) {
    if (current[index] !== minimum[index]) return current[index] > minimum[index];
  }
  return true;
}

async function resolvePackage(dependency) {
  let current = path.dirname(require.resolve(dependency));
  while (current !== path.dirname(current)) {
    const packagePath = path.join(current, "package.json");
    const packageSource = await fs.readFile(packagePath, "utf8").catch(() => null);
    if (packageSource) {
      const packageJson = JSON.parse(packageSource);
      if (packageJson.name === dependency) return { packageJson, packagePath };
    }
    current = path.dirname(current);
  }
  throw new Error(`Unable to resolve ${dependency} package metadata.`);
}

const nextRoot = path.dirname(require.resolve("next/package.json"));

for (const [dependency, minimum] of Object.entries(minimumVersions)) {
  const { packageJson: replacement } = await resolvePackage(dependency);

  if (!isAtLeast(replacement.version, minimum)) {
    throw new Error(
      `${dependency} ${replacement.version} is below the required patched version ${minimum.join(".")}.`,
    );
  }

  const nestedPath = path.join(nextRoot, "node_modules", dependency);
  const nestedStat = await fs.stat(nestedPath).catch(() => null);
  if (nestedStat?.isDirectory()) {
    await fs.rm(nestedPath, { force: true, recursive: true });
    console.log(`Using patched ${dependency} ${replacement.version} for Next.js.`);
  }
}
