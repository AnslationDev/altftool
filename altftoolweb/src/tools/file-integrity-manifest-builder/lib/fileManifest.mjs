export const MANIFEST_SCHEMA = "altftool.file-integrity-manifest.v1";
export const SUMMARY_SCHEMA = "altftool.file-integrity-summary.v1";

export const FILE_LIMITS = Object.freeze({
  maxFiles: 200,
  maxFileBytes: 64 * 1024 * 1024,
  maxTotalBytes: 256 * 1024 * 1024,
  maxManifestBytes: 2 * 1024 * 1024,
  maxRelativeNameLength: 1024,
});

export const LIMITATIONS = Object.freeze([
  "SHA-256 compares file bytes with a recorded digest; it does not establish a file’s creator, source, safety, meaning, or trustworthiness.",
  "A matching digest does not make a file trustworthy, and this manifest is not a digital signature.",
  "File names, media types, sizes, and last-modified values are metadata supplied by the browser and file system.",
]);

const SHA256_PATTERN = /^[a-f0-9]{64}$/u;

export function compareRelativeNames(left, right) {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

export function normalizeRelativeName(value) {
  return String(value ?? "")
    .replace(/\\/gu, "/")
    .replace(/^\.\/+/u, "")
    .replace(/^\/+/u, "")
    .replace(/\/{2,}/gu, "/");
}

function normalizedFileDescriptor(file) {
  const relativeName = normalizeRelativeName(file?.webkitRelativePath || file?.name);
  const sizeBytes = Number(file?.size);
  const lastModified = Number(file?.lastModified);
  return {
    file,
    relativeName,
    sizeBytes,
    mediaType: String(file?.type || "application/octet-stream").slice(0, 255),
    lastModified:
      Number.isSafeInteger(lastModified) && lastModified >= 0
        ? lastModified
        : null,
  };
}

function deterministicEntrySort(left, right) {
  const nameOrder = compareRelativeNames(left.relativeName, right.relativeName);
  if (nameOrder) return nameOrder;
  if (left.sizeBytes !== right.sizeBytes) return left.sizeBytes - right.sizeBytes;
  const leftModified = left.lastModified ?? -1;
  const rightModified = right.lastModified ?? -1;
  if (leftModified !== rightModified) return leftModified - rightModified;
  return compareRelativeNames(left.mediaType, right.mediaType);
}

export function prepareFileSelection(files) {
  const source = Array.from(files || []);
  const errors = [];

  if (!source.length) {
    return { ok: false, errors: ["Choose at least one readable file."] };
  }
  if (source.length > FILE_LIMITS.maxFiles) {
    errors.push(`Choose no more than ${FILE_LIMITS.maxFiles} files at once.`);
  }

  const descriptors = source.map(normalizedFileDescriptor);
  const seenNames = new Set();
  let totalBytes = 0;

  for (const descriptor of descriptors) {
    if (!descriptor.relativeName) {
      errors.push("One selected file does not have a usable relative name.");
      continue;
    }
    if (descriptor.relativeName.length > FILE_LIMITS.maxRelativeNameLength) {
      errors.push(
        `${descriptor.relativeName.slice(0, 80)}… exceeds the relative-name length limit.`,
      );
      continue;
    }
    if (
      !Number.isSafeInteger(descriptor.sizeBytes) ||
      descriptor.sizeBytes < 0
    ) {
      errors.push(`${descriptor.relativeName} does not have a valid file size.`);
      continue;
    }
    if (descriptor.sizeBytes > FILE_LIMITS.maxFileBytes) {
      errors.push(
        `${descriptor.relativeName} exceeds the per-file processing limit.`,
      );
    }
    if (seenNames.has(descriptor.relativeName)) {
      errors.push(
        `Duplicate relative name: ${descriptor.relativeName}. Choose a folder to preserve paths or remove one duplicate name.`,
      );
    }
    seenNames.add(descriptor.relativeName);
    totalBytes += descriptor.sizeBytes;
  }

  if (totalBytes > FILE_LIMITS.maxTotalBytes) {
    errors.push("The selected files exceed the total processing limit.");
  }
  if (!Number.isSafeInteger(totalBytes)) {
    errors.push("The combined file size is outside the supported range.");
  }

  if (errors.length) {
    return { ok: false, errors: [...new Set(errors)] };
  }

  return {
    ok: true,
    files: descriptors.sort(deterministicEntrySort),
    counts: {
      files: descriptors.length,
      totalBytes,
    },
  };
}

export function bytesToHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function sha256ArrayBuffer(buffer, subtle = globalThis.crypto?.subtle) {
  if (!subtle) throw new Error("Web Crypto is unavailable in this browser.");
  const digest = await subtle.digest("SHA-256", buffer);
  return bytesToHex(new Uint8Array(digest));
}

export async function hashFileSha256(file) {
  if (!file?.arrayBuffer) throw new TypeError("Choose a readable file.");
  return sha256ArrayBuffer(await file.arrayBuffer());
}

function normalizeDigest(value) {
  return String(value ?? "").trim().toLowerCase();
}

function normalizeManifestEntry(entry, index) {
  const relativeName = normalizeRelativeName(entry?.relativeName);
  const sizeBytes = Number(entry?.sizeBytes);
  const lastModified =
    entry?.lastModified === null ? null : Number(entry?.lastModified);
  const sha256 = normalizeDigest(entry?.sha256);
  const errors = [];

  if (!relativeName) {
    errors.push(`Entry ${index + 1} is missing a relative name.`);
  }
  if (relativeName.length > FILE_LIMITS.maxRelativeNameLength) {
    errors.push(`Entry ${index + 1} has an overlong relative name.`);
  }
  if (!Number.isSafeInteger(sizeBytes) || sizeBytes < 0) {
    errors.push(`Entry ${index + 1} has an invalid byte size.`);
  } else if (sizeBytes > FILE_LIMITS.maxFileBytes) {
    errors.push(`Entry ${index + 1} exceeds the per-file size limit.`);
  }
  if (
    lastModified !== null &&
    (!Number.isSafeInteger(lastModified) || lastModified < 0)
  ) {
    errors.push(`Entry ${index + 1} has an invalid last-modified value.`);
  }
  if (!SHA256_PATTERN.test(sha256)) {
    errors.push(`Entry ${index + 1} does not contain a valid SHA-256 digest.`);
  }

  return {
    ok: errors.length === 0,
    errors,
    entry: {
      relativeName,
      sizeBytes,
      mediaType: String(
        entry?.mediaType || "application/octet-stream",
      ).slice(0, 255),
      lastModified,
      sha256,
    },
  };
}

function normalizeCreatedAt(value) {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

export function buildManifest(hashedEntries, createdAt = new Date()) {
  const source = Array.isArray(hashedEntries) ? hashedEntries : [];
  if (!source.length || source.length > FILE_LIMITS.maxFiles) {
    throw new RangeError(
      `A manifest requires between 1 and ${FILE_LIMITS.maxFiles} files.`,
    );
  }

  const entries = [];
  const errors = [];
  const names = new Set();

  source.forEach((item, index) => {
    const normalized = normalizeManifestEntry(item, index);
    errors.push(...normalized.errors);
    if (normalized.ok) {
      if (names.has(normalized.entry.relativeName)) {
        errors.push(
          `Duplicate relative name: ${normalized.entry.relativeName}.`,
        );
      }
      names.add(normalized.entry.relativeName);
      entries.push(normalized.entry);
    }
  });

  if (errors.length) {
    throw new TypeError(errors.join(" "));
  }

  entries.sort(deterministicEntrySort);
  const totalBytes = entries.reduce((sum, entry) => sum + entry.sizeBytes, 0);
  if (
    !Number.isSafeInteger(totalBytes) ||
    totalBytes > FILE_LIMITS.maxTotalBytes
  ) {
    throw new RangeError("The manifest exceeds the total byte-size limit.");
  }

  return {
    schema: MANIFEST_SCHEMA,
    algorithm: "SHA-256",
    createdAt: normalizeCreatedAt(createdAt),
    limitations: [...LIMITATIONS],
    scope: {
      localOnly: true,
      filesEmbedded: false,
      deterministicOrdering: "relativeName-utf16-ascending",
    },
    counts: {
      files: entries.length,
      totalBytes,
    },
    files: entries,
  };
}

export function parseManifestText(text) {
  const source = String(text ?? "");
  if (!source.trim()) {
    return { ok: false, errors: ["Choose a non-empty JSON manifest."] };
  }
  if (new TextEncoder().encode(source).byteLength > FILE_LIMITS.maxManifestBytes) {
    return { ok: false, errors: ["The manifest exceeds the import size limit."] };
  }

  let parsed;
  try {
    parsed = JSON.parse(source);
  } catch {
    return { ok: false, errors: ["The imported manifest is not valid JSON."] };
  }

  const errors = [];
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { ok: false, errors: ["The imported JSON must be a manifest object."] };
  }
  if (parsed.schema !== MANIFEST_SCHEMA) {
    errors.push(`Expected schema ${MANIFEST_SCHEMA}.`);
  }
  if (parsed.algorithm !== "SHA-256") {
    errors.push("The imported manifest must use SHA-256.");
  }
  if (!Array.isArray(parsed.files) || !parsed.files.length) {
    errors.push("The imported manifest does not contain file entries.");
  } else if (parsed.files.length > FILE_LIMITS.maxFiles) {
    errors.push(
      `The imported manifest contains more than ${FILE_LIMITS.maxFiles} files.`,
    );
  }

  const entries = [];
  const names = new Set();
  if (Array.isArray(parsed.files)) {
    parsed.files.slice(0, FILE_LIMITS.maxFiles).forEach((item, index) => {
      const normalized = normalizeManifestEntry(item, index);
      errors.push(...normalized.errors);
      if (normalized.ok) {
        if (names.has(normalized.entry.relativeName)) {
          errors.push(
            `Duplicate relative name: ${normalized.entry.relativeName}.`,
          );
        }
        names.add(normalized.entry.relativeName);
        entries.push(normalized.entry);
      }
    });
  }

  const totalBytes = entries.reduce((sum, entry) => sum + entry.sizeBytes, 0);
  if (
    !Number.isSafeInteger(totalBytes) ||
    totalBytes > FILE_LIMITS.maxTotalBytes
  ) {
    errors.push("The imported manifest exceeds the total byte-size limit.");
  }

  if (errors.length) {
    return { ok: false, errors: [...new Set(errors)] };
  }

  entries.sort(deterministicEntrySort);
  return {
    ok: true,
    manifest: {
      schema: MANIFEST_SCHEMA,
      algorithm: "SHA-256",
      createdAt:
        typeof parsed.createdAt === "string" ? parsed.createdAt : null,
      limitations: Array.isArray(parsed.limitations)
        ? parsed.limitations.map(String)
        : [],
      scope: parsed.scope && typeof parsed.scope === "object" ? parsed.scope : {},
      counts: {
        files: entries.length,
        totalBytes,
      },
      files: entries,
    },
  };
}

function metadataDifferences(current, baseline) {
  const differences = [];
  if (current.sizeBytes !== baseline.sizeBytes) differences.push("sizeBytes");
  if (current.mediaType !== baseline.mediaType) differences.push("mediaType");
  if (current.lastModified !== baseline.lastModified) {
    differences.push("lastModified");
  }
  return differences;
}

export function compareManifests(currentManifest, baselineManifest) {
  const currentFiles = Array.isArray(currentManifest?.files)
    ? [...currentManifest.files].sort(deterministicEntrySort)
    : [];
  const baselineFiles = Array.isArray(baselineManifest?.files)
    ? [...baselineManifest.files].sort(deterministicEntrySort)
    : [];
  const baselineByName = new Map(
    baselineFiles.map((entry) => [entry.relativeName, entry]),
  );
  const currentNames = new Set(currentFiles.map((entry) => entry.relativeName));
  const rows = [];

  for (const current of currentFiles) {
    const baseline = baselineByName.get(current.relativeName);
    if (!baseline) {
      rows.push({
        relativeName: current.relativeName,
        status: "current-only",
        current,
        baseline: null,
        metadataDifferences: [],
      });
      continue;
    }

    rows.push({
      relativeName: current.relativeName,
      status:
        normalizeDigest(current.sha256) === normalizeDigest(baseline.sha256)
          ? "digest-match"
          : "digest-different",
      current,
      baseline,
      metadataDifferences: metadataDifferences(current, baseline),
    });
  }

  for (const baseline of baselineFiles) {
    if (!currentNames.has(baseline.relativeName)) {
      rows.push({
        relativeName: baseline.relativeName,
        status: "baseline-only",
        current: null,
        baseline,
        metadataDifferences: [],
      });
    }
  }

  rows.sort((left, right) =>
    compareRelativeNames(left.relativeName, right.relativeName),
  );

  const counts = {
    digestMatches: rows.filter((row) => row.status === "digest-match").length,
    digestDifferences: rows.filter(
      (row) => row.status === "digest-different",
    ).length,
    currentOnly: rows.filter((row) => row.status === "current-only").length,
    baselineOnly: rows.filter((row) => row.status === "baseline-only").length,
    metadataDifferences: rows.filter(
      (row) => row.metadataDifferences.length > 0,
    ).length,
  };

  return { rows, counts };
}

export function findDuplicateDigestGroups(entries) {
  const grouped = new Map();
  for (const entry of entries || []) {
    const digest = normalizeDigest(entry?.sha256);
    if (!SHA256_PATTERN.test(digest)) continue;
    const group = grouped.get(digest) || [];
    group.push(entry);
    grouped.set(digest, group);
  }

  return [...grouped.entries()]
    .filter(([, files]) => files.length > 1)
    .map(([sha256, files]) => ({
      sha256,
      files: [...files].sort(deterministicEntrySort),
    }))
    .sort((left, right) => {
      const leftName = left.files[0]?.relativeName || "";
      const rightName = right.files[0]?.relativeName || "";
      return compareRelativeNames(leftName, rightName);
    });
}

export function buildCountsOnlySummary(
  manifest,
  comparison = null,
  createdAt = new Date(),
) {
  const duplicateGroups = findDuplicateDigestGroups(manifest?.files || []);
  const filesInDuplicateGroups = duplicateGroups.reduce(
    (sum, group) => sum + group.files.length,
    0,
  );
  const distinctMediaTypes = new Set(
    (manifest?.files || []).map((entry) => entry.mediaType),
  ).size;

  return {
    schema: SUMMARY_SCHEMA,
    createdAt: normalizeCreatedAt(createdAt),
    algorithm: "SHA-256",
    limitations: [...LIMITATIONS],
    counts: {
      files: Number(manifest?.counts?.files) || 0,
      totalBytes: Number(manifest?.counts?.totalBytes) || 0,
      distinctMediaTypes,
      duplicateDigestGroups: duplicateGroups.length,
      filesInDuplicateDigestGroups: filesInDuplicateGroups,
      comparisonIncluded: Boolean(comparison),
      digestMatches: comparison?.counts?.digestMatches || 0,
      digestDifferences: comparison?.counts?.digestDifferences || 0,
      currentOnly: comparison?.counts?.currentOnly || 0,
      baselineOnly: comparison?.counts?.baselineOnly || 0,
      metadataDifferences: comparison?.counts?.metadataDifferences || 0,
    },
    scope: {
      localOnly: true,
      includesRelativeNames: false,
      includesDigests: false,
      includesMediaTypeLabels: false,
      includesTimestamps: false,
      includesFileContents: false,
    },
  };
}
