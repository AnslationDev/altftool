import { promises as fs } from "node:fs";
import path from "node:path";

const DEFAULT_ENV_FILES = [
  ".env",
  ".env.local",
  ".env.production",
  ".env.production.local",
];

function stripOuterQuotes(value) {
  const trimmed = String(value || "").trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

export function parseEnvironmentSource(content = "") {
  const values = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const normalized = line.startsWith("export ")
      ? line.slice("export ".length).trim()
      : line;
    const separatorIndex = normalized.indexOf("=");
    if (separatorIndex <= 0) continue;

    const key = normalized.slice(0, separatorIndex).trim();
    if (!/^[A-Z0-9_]+$/i.test(key)) continue;

    const rawValue = normalized.slice(separatorIndex + 1);
    let value = stripOuterQuotes(rawValue);
    if (rawValue.trim().startsWith('"')) {
      value = value
        .replace(/\\n/g, "\n")
        .replace(/\\r/g, "\r")
        .replace(/\\t/g, "\t")
        .replace(/\\"/g, '"');
    }
    values[key] = value.trim();
  }

  return values;
}

export function isConfiguredEnvironmentValue(value) {
  const normalized = String(value || "").trim();
  if (!normalized) return false;

  if (
    /^(?:undefined|null|false|changeme|replace[-_ ]?me|your[-_ ].*|<.*>)$/i.test(
      normalized,
    )
  ) {
    return false;
  }

  try {
    const hostname = new URL(normalized).hostname
      .toLowerCase()
      .replace(/\.$/u, "");
    // RFC 2606 reserves `.invalid` for values that must never resolve. CI uses
    // these sentinels to exercise URL parsing without claiming a live provider.
    if (hostname === "invalid" || hostname.endsWith(".invalid")) return false;
  } catch {
    // Non-URL values can still be valid API keys or other configuration.
  }

  return true;
}

export function configuredEnvironmentKeys(values = {}) {
  return new Set(
    Object.entries(values)
      .filter(([, value]) => isConfiguredEnvironmentValue(value))
      .map(([key]) => key),
  );
}

export async function loadEnvironmentSnapshot({
  workspaceRoot,
  roots = [workspaceRoot],
  filenames = DEFAULT_ENV_FILES,
  processEnvironment = process.env,
}) {
  const values = {};
  const filesLoaded = [];

  for (const root of roots) {
    for (const filename of filenames) {
      const filePath = path.join(root, filename);
      let source = "";
      try {
        source = await fs.readFile(filePath, "utf8");
      } catch {
        continue;
      }
      Object.assign(values, parseEnvironmentSource(source));
      filesLoaded.push(path.relative(workspaceRoot, filePath) || filename);
    }
  }

  return {
    filesLoaded,
    values: {
      ...values,
      ...processEnvironment,
    },
  };
}
