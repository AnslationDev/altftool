const MAX_SOURCE_CHARACTERS = 2_000_000;
const MAX_COMPONENTS = 12_000;
const MAX_DEPENDENCY_DEPTH = 40;
const MAX_FIELD_LENGTH = 256;
const MAX_OCCURRENCE_PATHS = 100;
const CONTROL_CHARACTERS_PATTERN = /[\u0000-\u001f\u007f]/u;

export const npmInventoryLimits = Object.freeze({
  maxSourceCharacters: MAX_SOURCE_CHARACTERS,
  maxFileBytes: 2_000_000,
  maxComponents: MAX_COMPONENTS,
  maxDependencyDepth: MAX_DEPENDENCY_DEPTH,
});

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function boundedText(value, maximum = MAX_FIELD_LENGTH) {
  if (typeof value !== "string" && typeof value !== "number") return "";
  return String(value)
    .replace(/[\u0000-\u001f\u007f]/gu, "")
    .trim()
    .slice(0, maximum);
}

function normalizePackageName(value) {
  if (value === undefined || value === null || value === "") return "";
  if (typeof value !== "string") {
    throw new Error("Package names must be strings.");
  }
  if (CONTROL_CHARACTERS_PATTERN.test(value)) {
    throw new Error("Package names must not contain control characters.");
  }
  const name = value.trim();
  if (name !== value || name.length > 214) return "";
  if (!name || /\s|[\\?#]/u.test(name)) return "";
  if (name.startsWith("@")) {
    const parts = name.split("/");
    return parts.length === 2 && parts.every(Boolean) ? name : "";
  }
  return name.includes("/") ? "" : name;
}

function normalizeVersion(value) {
  if (value === undefined || value === null || value === "") return "";
  if (typeof value !== "string") {
    throw new Error("Package versions must be strings.");
  }
  if (CONTROL_CHARACTERS_PATTERN.test(value)) {
    throw new Error("Package versions must not contain control characters.");
  }
  const version = value.trim();
  return version === value && version.length <= MAX_FIELD_LENGTH ? version : "";
}

function normalizeDeclaredRange(value) {
  if (value === undefined || value === null || value === "") return "";
  if (typeof value !== "string") {
    throw new Error("Declared dependency ranges must be strings.");
  }
  if (CONTROL_CHARACTERS_PATTERN.test(value)) {
    throw new Error(
      "Declared dependency ranges must not contain control characters.",
    );
  }
  return value.trim().slice(0, MAX_FIELD_LENGTH);
}

function normalizeLicense(value) {
  if (typeof value === "string") return boundedText(value, 500);
  if (Array.isArray(value)) {
    const choices = value
      .slice(0, 12)
      .map((entry) =>
        typeof entry === "string"
          ? boundedText(entry, 120)
          : boundedText(entry?.type, 120),
      )
      .filter(Boolean);
    return choices.join(" OR ").slice(0, 500);
  }
  if (isRecord(value)) return boundedText(value.type, 500);
  return "";
}

function addDependencySection(dependencies, values, scope, options = {}) {
  if (!isRecord(values)) return;
  for (const [rawName, rawRange] of Object.entries(values)) {
    const name = normalizePackageName(rawName);
    if (!name || (!options.override && dependencies.has(name))) continue;
    dependencies.set(name, {
      name,
      declaredRange: normalizeDeclaredRange(rawRange),
      scope,
    });
  }
}

function directDependencyMap(record, state) {
  const dependencies = new Map();

  addDependencySection(dependencies, record?.dependencies, "runtime");
  addDependencySection(dependencies, record?.devDependencies, "development");
  addDependencySection(dependencies, record?.peerDependencies, "peer");

  if (isRecord(record?.optionalDependencies)) {
    for (const [rawName, rawRange] of Object.entries(
      record.optionalDependencies,
    )) {
      const name = normalizePackageName(rawName);
      if (!name) continue;
      const declaredRange = normalizeDeclaredRange(rawRange);
      const previous = dependencies.get(name);
      if (
        previous?.scope === "runtime" &&
        previous.declaredRange &&
        declaredRange &&
        previous.declaredRange !== declaredRange
      ) {
        state?.warnings.add(
          `optionalDependencies overrides dependencies for "${name}" (${previous.declaredRange} → ${declaredRange}).`,
        );
      }
      dependencies.set(name, {
        name,
        declaredRange,
        scope: "optional",
      });
    }
  }

  return dependencies;
}

function packageNameFromLockPath(value) {
  if (typeof value !== "string") return "";
  if (CONTROL_CHARACTERS_PATTERN.test(value)) {
    throw new Error("Lockfile package paths must not contain control characters.");
  }
  const path = value.replace(/^\.?\//u, "");
  const marker = "node_modules/";
  const markerIndex = path.lastIndexOf(marker);
  if (markerIndex < 0) return "";
  const remainder = path.slice(markerIndex + marker.length);
  if (!remainder) return "";
  if (remainder.startsWith("@")) {
    return normalizePackageName(remainder.split("/").slice(0, 2).join("/"));
  }
  return normalizePackageName(remainder.split("/")[0]);
}

function directLockPath(name) {
  return `node_modules/${name}`;
}

function pushComponent(components, component, state) {
  if (state.truncated) return;
  if (components.length >= MAX_COMPONENTS) {
    state.truncated = true;
    return;
  }
  if (!component.name) return;
  const path = boundedText(component.path, 1_000);
  const installName = normalizePackageName(component.installName);
  const relationship = ["direct", "transitive", "unknown"].includes(
    component.relationship,
  )
    ? component.relationship
    : "unknown";
  components.push({
    name: component.name,
    version: normalizeVersion(component.version),
    declaredRange: normalizeDeclaredRange(component.declaredRange),
    declaredRanges: component.declaredRange
      ? [normalizeDeclaredRange(component.declaredRange)]
      : [],
    license: normalizeLicense(component.license),
    scope: component.scope || "unknown",
    relationship,
    installName,
    aliases:
      installName && installName !== component.name ? [installName] : [],
    path,
    paths: path ? [path] : [],
    occurrenceCount: 1,
    resolved: boundedText(component.resolved, 1_000),
    integrity: boundedText(component.integrity, 1_000),
  });
}

function linkedPackageRecord(packages, record) {
  if (record.link !== true || typeof record.resolved !== "string") return null;
  const candidates = [
    record.resolved,
    record.resolved.replace(/^file:/u, ""),
    record.resolved.replace(/^\.?\//u, ""),
  ];
  for (const candidate of candidates) {
    if (isRecord(packages[candidate])) return packages[candidate];
  }
  return null;
}

function parsePackagesTable(data, rootRecord, components, state) {
  const direct = directDependencyMap(rootRecord, state);
  const entries = Object.entries(data.packages);
  for (const [path, record] of entries) {
    if (!path || !isRecord(record)) continue;
    const installName = packageNameFromLockPath(path);
    const linkedRecord = linkedPackageRecord(data.packages, record);
    const effectiveRecord = linkedRecord || record;
    const name =
      normalizePackageName(effectiveRecord.name) ||
      normalizePackageName(record.name) ||
      installName;
    if (!name) continue;
    const directMetadata = direct.get(installName);
    const relationship =
      directMetadata && path === directLockPath(installName)
        ? "direct"
        : "transitive";
    pushComponent(
      components,
      {
        name,
        version: effectiveRecord.version ?? record.version,
        declaredRange: directMetadata?.declaredRange,
        license: effectiveRecord.license ?? record.license,
        scope:
          directMetadata?.scope ||
          (effectiveRecord.dev || record.dev
            ? "development"
            : effectiveRecord.optional || record.optional
              ? "optional"
              : "runtime"),
        relationship,
        installName,
        path,
        resolved: record.resolved,
        integrity: effectiveRecord.integrity ?? record.integrity,
      },
      state,
    );
    if (state.truncated) break;
  }
}

function parseLegacyDependencies(
  dependencies,
  components,
  state,
  depth = 0,
  parentPath = "",
) {
  if (!isRecord(dependencies) || state.truncated) return;
  if (depth > MAX_DEPENDENCY_DEPTH) {
    state.depthLimited = true;
    return;
  }
  for (const [rawName, record] of Object.entries(dependencies)) {
    if (!isRecord(record)) continue;
    const name = normalizePackageName(rawName);
    if (!name) continue;
    const path = `${parentPath}${parentPath ? "/node_modules/" : "node_modules/"}${name}`;
    pushComponent(
      components,
      {
        name,
        version: record.version,
        license: record.license,
        scope: record.dev
          ? "development"
          : record.optional
            ? "optional"
            : "runtime",
        relationship: depth === 0 ? "unknown" : "transitive",
        installName: name,
        path,
        resolved: record.resolved,
        integrity: record.integrity,
      },
      state,
    );
    parseLegacyDependencies(
      record.dependencies,
      components,
      state,
      depth + 1,
      path,
    );
    if (state.truncated) break;
  }
}

function parseManifestDependencies(data, components, state) {
  for (const dependency of directDependencyMap(data, state).values()) {
    pushComponent(
      components,
      {
        name: dependency.name,
        installName: dependency.name,
        declaredRange: dependency.declaredRange,
        scope: dependency.scope,
        relationship: "direct",
      },
      state,
    );
    if (state.truncated) return;
  }
}

function relationshipRank(value) {
  if (value === "direct") return 3;
  if (value === "unknown") return 2;
  return 1;
}

function logicalComponentKey(component) {
  if (component.version) {
    return [component.name, component.version].join("\u0000");
  }
  return [
    component.name,
    "unresolved",
    component.declaredRange,
    component.resolved,
  ].join("\u0000");
}

function appendUnique(target, values, maximum = MAX_OCCURRENCE_PATHS) {
  for (const value of values) {
    if (!value || target.includes(value) || target.length >= maximum) continue;
    target.push(value);
  }
}

function mergeComponent(existing, component, state) {
  existing.occurrenceCount += component.occurrenceCount;
  appendUnique(existing.paths, component.paths);
  appendUnique(existing.aliases, component.aliases);
  appendUnique(existing.declaredRanges, component.declaredRanges, 20);

  if (
    relationshipRank(component.relationship) >
    relationshipRank(existing.relationship)
  ) {
    existing.relationship = component.relationship;
    existing.scope = component.scope;
    existing.path = component.path || existing.path;
    existing.installName = component.installName || existing.installName;
  }
  if (!existing.declaredRange && component.declaredRange) {
    existing.declaredRange = component.declaredRange;
  }
  if (!existing.license && component.license) {
    existing.license = component.license;
  } else if (
    existing.license &&
    component.license &&
    existing.license !== component.license
  ) {
    state.warnings.add(
      `Conflicting declared license strings were present for ${component.name}@${component.version || "unresolved"}; the first value is shown.`,
    );
  }
  if (!existing.resolved && component.resolved) {
    existing.resolved = component.resolved;
  }
  if (!existing.integrity && component.integrity) {
    existing.integrity = component.integrity;
  }
}

function deduplicateComponents(components, state) {
  const unique = new Map();
  for (const component of components) {
    const key = logicalComponentKey(component);
    const existing = unique.get(key);
    if (existing) {
      mergeComponent(existing, component, state);
    } else {
      unique.set(key, {
        ...component,
        aliases: [...component.aliases],
        declaredRanges: [...component.declaredRanges],
        paths: [...component.paths],
      });
    }
  }
  return [...unique.values()].sort(
    (a, b) =>
      a.name.localeCompare(b.name) ||
      a.version.localeCompare(b.version) ||
      a.path.localeCompare(b.path),
  );
}

export function parseNpmSupplyChainInventory(source, options = {}) {
  if (typeof source !== "string") {
    throw new TypeError(
      "Paste a package.json or package-lock.json JSON document.",
    );
  }
  if (source.length > MAX_SOURCE_CHARACTERS) {
    throw new Error(
      `Input exceeds the ${MAX_SOURCE_CHARACTERS.toLocaleString("en-US")}-character limit.`,
    );
  }
  if (!source.trim()) throw new Error("The JSON input is empty.");

  let data;
  try {
    data = JSON.parse(source);
  } catch {
    throw new Error("The input is not valid JSON.");
  }
  if (!isRecord(data))
    throw new Error("The top-level JSON value must be an object.");

  const fileName = boundedText(options.fileName, 200).toLowerCase();
  const explicitlyManifest = fileName.endsWith("package.json");
  const explicitlyLock =
    fileName.endsWith("package-lock.json") ||
    fileName.endsWith("npm-shrinkwrap.json");
  const hasLockSignature =
    Number.isInteger(data.lockfileVersion) &&
    (isRecord(data.packages) || isRecord(data.dependencies));
  const looksLikeLock =
    explicitlyLock || (!explicitlyManifest && hasLockSignature);
  const sourceKind = looksLikeLock ? "package-lock" : "package-json";
  const rootRecord =
    sourceKind === "package-lock" && isRecord(data.packages?.[""])
      ? data.packages[""]
      : data;
  const project = {
    name: normalizePackageName(rootRecord.name || data.name) || "local-project",
    version: normalizeVersion(rootRecord.version || data.version),
    license: normalizeLicense(rootRecord.license || data.license),
    private: rootRecord.private === true || data.private === true,
  };

  const state = {
    truncated: false,
    depthLimited: false,
    warnings: new Set(),
  };
  const components = [];
  if (sourceKind === "package-lock" && isRecord(data.packages)) {
    parsePackagesTable(data, rootRecord, components, state);
  } else if (sourceKind === "package-lock" && isRecord(data.dependencies)) {
    parseLegacyDependencies(data.dependencies, components, state);
  } else {
    parseManifestDependencies(data, components, state);
  }

  const deduplicated = deduplicateComponents(components, state);
  const warnings = [...state.warnings];
  if (sourceKind === "package-json" && deduplicated.length) {
    warnings.push(
      "package.json declares dependency ranges but does not contain resolved dependency versions or their license metadata.",
    );
  }
  if (state.truncated) {
    warnings.push(
      `Inventory stopped at the ${MAX_COMPONENTS.toLocaleString("en-US")}-component limit.`,
    );
  }
  if (state.depthLimited) {
    warnings.push(
      `Nested dependency traversal stopped after ${MAX_DEPENDENCY_DEPTH} levels.`,
    );
  }
  if (
    sourceKind === "package-lock" &&
    !isRecord(data.packages) &&
    isRecord(data.dependencies)
  ) {
    warnings.push(
      "Legacy lockfile dependency records do not identify root declarations; top-level relationships are marked unknown and are not emitted as root dependency edges.",
    );
  }

  return {
    sourceKind,
    lockfileVersion:
      sourceKind === "package-lock" && Number.isInteger(data.lockfileVersion)
        ? data.lockfileVersion
        : null,
    project,
    components: deduplicated,
    directCount: deduplicated.filter((item) => item.relationship === "direct")
      .length,
    transitiveCount: deduplicated.filter(
      (item) => item.relationship === "transitive",
    ).length,
    unknownCount: deduplicated.filter(
      (item) => item.relationship === "unknown",
    ).length,
    truncated: state.truncated || state.depthLimited,
    warnings,
  };
}
