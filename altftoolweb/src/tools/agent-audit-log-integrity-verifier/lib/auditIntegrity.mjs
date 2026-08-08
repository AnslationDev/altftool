const AUTO_ARRAY_PATHS = ["entries", "events", "logs", "records", "auditLog", "audit_log"];
const MAX_DISCOVERY_DEPTH = 3;

const FIELD_HINTS = {
  idPath: ["id", "eventId", "event_id", "entryId", "entry_id", "recordId", "record_id"],
  sequencePath: ["sequence", "seq", "sequenceNumber", "sequence_number", "index"],
  timestampPath: [
    "timestamp",
    "time",
    "createdAt",
    "created_at",
    "occurredAt",
    "occurred_at",
    "eventTime",
    "event_time",
  ],
  previousHashPath: [
    "previousHash",
    "previous_hash",
    "prevHash",
    "prev_hash",
    "chain.previousHash",
    "chain.previous_hash",
  ],
  hashPath: ["hash", "entryHash", "entry_hash", "eventHash", "event_hash", "digest"],
};

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function normalizeComparableHash(value) {
  return String(value ?? "")
    .trim()
    .replace(/^sha[-_\s]?256\s*[:=]\s*/i, "")
    .toLowerCase();
}

export function splitPath(path) {
  return String(path || "")
    .split(".")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function getPath(value, path) {
  const parts = splitPath(path);
  if (!parts.length) return undefined;
  return parts.reduce(
    (current, part) =>
      current !== null && typeof current === "object" ? current[part] : undefined,
    value,
  );
}

function omitPath(value, path) {
  const parts = splitPath(path);
  if (!parts.length || !isPlainObject(value)) return value;
  const clone = { ...value };
  let current = clone;
  let source = value;

  for (let index = 0; index < parts.length - 1; index += 1) {
    const part = parts[index];
    if (!isPlainObject(source?.[part])) return clone;
    current[part] = { ...source[part] };
    current = current[part];
    source = source[part];
  }
  delete current[parts[parts.length - 1]];
  return clone;
}

function canonicalize(value) {
  if (value === null) return null;
  if (Array.isArray(value)) {
    return value.map((item) =>
      item === undefined || typeof item === "function" || typeof item === "symbol"
        ? null
        : canonicalize(item),
    );
  }
  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .filter((key) => {
          const item = value[key];
          return item !== undefined && typeof item !== "function" && typeof item !== "symbol";
        })
        .map((key) => [key, canonicalize(value[key])]),
    );
  }
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string" || typeof value === "boolean") return value;
  return String(value);
}

export function stableCanonicalStringify(value) {
  return JSON.stringify(canonicalize(value));
}

function addIssue(issueMap, index, issue) {
  const issues = issueMap.get(index) || [];
  if (!issues.includes(issue)) issues.push(issue);
  issueMap.set(index, issues);
}

export function parseAuditLog(source, { arrayPath = "", maxEntries = 25_000 } = {}) {
  const text = String(source ?? "").trim();
  if (!text) {
    return {
      ok: false,
      entries: [],
      errors: ["Audit log is empty."],
      warnings: [],
      format: "unknown",
      sourcePath: "",
    };
  }

  let parsed;
  let format = "json";
  let sourcePath = "root";
  const warnings = [];

  try {
    parsed = JSON.parse(text);
  } catch {
    format = "jsonl";
    const lines = text.split(/\r\n|\n|\r/).filter((line) => line.trim());
    const entries = [];
    const invalidLines = [];
    lines.forEach((line, index) => {
      try {
        entries.push(JSON.parse(line));
      } catch {
        invalidLines.push(index + 1);
      }
    });
    if (invalidLines.length) {
      return {
        ok: false,
        entries: [],
        errors: [
          `${invalidLines.length} JSONL line${invalidLines.length === 1 ? "" : "s"} could not be parsed (first: ${invalidLines
            .slice(0, 5)
            .join(", ")}).`,
        ],
        warnings: [],
        format,
        sourcePath: "JSONL lines",
      };
    }
    parsed = entries;
    sourcePath = "JSONL lines";
  }

  let entries;
  if (format === "jsonl") {
    entries = parsed;
  } else if (arrayPath) {
    entries = getPath(parsed, arrayPath);
    sourcePath = arrayPath;
    if (!Array.isArray(entries)) {
      return {
        ok: false,
        entries: [],
        errors: [`The configured array path "${arrayPath}" does not resolve to an array.`],
        warnings: [],
        format,
        sourcePath,
      };
    }
  } else if (Array.isArray(parsed)) {
    entries = parsed;
  } else if (isPlainObject(parsed)) {
    const detectedPath = AUTO_ARRAY_PATHS.find((path) => Array.isArray(getPath(parsed, path)));
    if (detectedPath) {
      entries = getPath(parsed, detectedPath);
      sourcePath = detectedPath;
      warnings.push(
        `Automatically selected the "${detectedPath}" array. Configure an array path if this is not the audit-entry list.`,
      );
    } else {
      entries = [parsed];
      warnings.push(
        "No recognized audit-entry array was found, so the root object is treated as one entry.",
      );
    }
  } else {
    return {
      ok: false,
      entries: [],
      errors: ["The parsed JSON must be an object, an array of objects, or JSONL objects."],
      warnings: [],
      format,
      sourcePath,
    };
  }

  const invalidEntryIndexes = entries
    .map((entry, index) => (isPlainObject(entry) ? null : index + 1))
    .filter(Boolean);
  if (invalidEntryIndexes.length) {
    return {
      ok: false,
      entries: [],
      errors: [
        `${invalidEntryIndexes.length} parsed entr${invalidEntryIndexes.length === 1 ? "y is" : "ies are"} not JSON objects (first positions: ${invalidEntryIndexes
          .slice(0, 5)
          .join(", ")}).`,
      ],
      warnings,
      format,
      sourcePath,
    };
  }

  const boundedEntries = entries.slice(0, maxEntries);
  if (entries.length > maxEntries) {
    warnings.push(`Only the first ${maxEntries.toLocaleString("en-US")} entries were checked.`);
  }

  return {
    ok: true,
    entries: boundedEntries,
    errors: [],
    warnings,
    format,
    sourcePath,
    totalParsed: entries.length,
  };
}

function collectLeafPaths(value, prefix = "", depth = 0, output = new Set()) {
  if (!isPlainObject(value) || depth > MAX_DISCOVERY_DEPTH) return output;
  Object.entries(value).forEach(([key, item]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (isPlainObject(item) && depth < MAX_DISCOVERY_DEPTH) {
      collectLeafPaths(item, path, depth + 1, output);
    } else if (!Array.isArray(item)) {
      output.add(path);
    }
  });
  return output;
}

export function discoverFieldPaths(entries) {
  const paths = [...entries.slice(0, 50).reduce(
    (output, entry) => collectLeafPaths(entry, "", 0, output),
    new Set(),
  )].sort();
  const lowerToOriginal = new Map(paths.map((path) => [path.toLowerCase(), path]));
  const mapping = {};

  Object.entries(FIELD_HINTS).forEach(([configKey, hints]) => {
    const direct = hints.find((hint) => lowerToOriginal.has(hint.toLowerCase()));
    const suffix = paths.find((path) =>
      hints.some((hint) => path.toLowerCase().endsWith(`.${hint.toLowerCase()}`)),
    );
    mapping[configKey] = direct ? lowerToOriginal.get(direct.toLowerCase()) : suffix || "";
  });
  return { paths, mapping };
}

function resultState({ checkable, issueCount }) {
  if (!checkable) return "not-checkable";
  return issueCount > 0 ? "mismatch" : "verified";
}

export function verifyAuditStructure(entries, config = {}) {
  const issueMap = new Map();

  const idResult = {
    checkedCount: 0,
    missingCount: 0,
    invalidCount: 0,
    duplicateValueCount: 0,
    duplicateEntryCount: 0,
  };
  if (config.idPath) {
    const idIndexes = new Map();
    entries.forEach((entry, index) => {
      const value = getPath(entry, config.idPath);
      if (value === undefined || value === null || String(value).trim() === "") {
        idResult.missingCount += 1;
        addIssue(issueMap, index, "Missing ID");
        return;
      }
      if (!["string", "number", "boolean"].includes(typeof value)) {
        idResult.invalidCount += 1;
        addIssue(issueMap, index, "Non-scalar ID");
        return;
      }
      idResult.checkedCount += 1;
      const key = `${typeof value}:${String(value)}`;
      const indexes = idIndexes.get(key) || [];
      indexes.push(index);
      idIndexes.set(key, indexes);
    });
    idIndexes.forEach((indexes) => {
      if (indexes.length < 2) return;
      idResult.duplicateValueCount += 1;
      idResult.duplicateEntryCount += indexes.length;
      indexes.forEach((index) => addIssue(issueMap, index, "Duplicate ID"));
    });
  }
  const idIssues =
    idResult.missingCount + idResult.invalidCount + idResult.duplicateEntryCount;
  idResult.state = resultState({
    checkable: Boolean(config.idPath) && entries.length > 0,
    issueCount: idIssues,
  });

  const sequenceResult = {
    checkedCount: 0,
    invalidCount: 0,
    gapCount: 0,
    reorderedCount: 0,
  };
  if (config.sequencePath) {
    let previous = null;
    entries.forEach((entry, index) => {
      const raw = getPath(entry, config.sequencePath);
      const sequence = Number(raw);
      if (
        raw === undefined ||
        raw === null ||
        String(raw).trim() === "" ||
        !Number.isSafeInteger(sequence)
      ) {
        sequenceResult.invalidCount += 1;
        addIssue(issueMap, index, "Missing or invalid sequence");
        return;
      }
      sequenceResult.checkedCount += 1;
      if (previous !== null) {
        if (sequence <= previous) {
          sequenceResult.reorderedCount += 1;
          addIssue(issueMap, index, "Sequence reordered or repeated");
        } else if (sequence > previous + 1) {
          sequenceResult.gapCount += 1;
          addIssue(issueMap, index, "Sequence gap before entry");
        }
      }
      previous = sequence;
    });
  }
  const sequenceIssues =
    sequenceResult.invalidCount + sequenceResult.gapCount + sequenceResult.reorderedCount;
  sequenceResult.state = resultState({
    checkable: Boolean(config.sequencePath) && sequenceResult.checkedCount > 0,
    issueCount: sequenceIssues,
  });

  const timestampResult = {
    checkedCount: 0,
    invalidCount: 0,
    regressionCount: 0,
  };
  if (config.timestampPath) {
    let previousTime = null;
    entries.forEach((entry, index) => {
      const raw = getPath(entry, config.timestampPath);
      const time = typeof raw === "number" ? raw : Date.parse(String(raw ?? ""));
      if (!Number.isFinite(time)) {
        timestampResult.invalidCount += 1;
        addIssue(issueMap, index, "Missing or invalid timestamp");
        return;
      }
      timestampResult.checkedCount += 1;
      if (previousTime !== null && time < previousTime) {
        timestampResult.regressionCount += 1;
        addIssue(issueMap, index, "Timestamp regressed");
      }
      previousTime = time;
    });
  }
  const timestampIssues =
    timestampResult.invalidCount + timestampResult.regressionCount;
  timestampResult.state = resultState({
    checkable: Boolean(config.timestampPath) && entries.length > 0,
    issueCount: timestampIssues,
  });

  const previousLinkResult = {
    checkedCount: 0,
    missingCount: 0,
    mismatchCount: 0,
    genesisChecked: Boolean(config.expectedGenesisHash),
  };
  if (config.previousHashPath && config.hashPath && entries.length) {
    if (config.expectedGenesisHash) {
      const firstPrevious = normalizeComparableHash(
        getPath(entries[0], config.previousHashPath),
      );
      previousLinkResult.checkedCount += 1;
      if (!firstPrevious) {
        previousLinkResult.missingCount += 1;
        addIssue(issueMap, 0, "Missing genesis previous hash");
      } else if (
        firstPrevious !== normalizeComparableHash(config.expectedGenesisHash)
      ) {
        previousLinkResult.mismatchCount += 1;
        addIssue(issueMap, 0, "Genesis previous-hash mismatch");
      }
    }

    for (let index = 1; index < entries.length; index += 1) {
      const priorHash = normalizeComparableHash(getPath(entries[index - 1], config.hashPath));
      const currentPrevious = normalizeComparableHash(
        getPath(entries[index], config.previousHashPath),
      );
      previousLinkResult.checkedCount += 1;
      if (!priorHash || !currentPrevious) {
        previousLinkResult.missingCount += 1;
        addIssue(issueMap, index, "Missing previous-hash link value");
      } else if (priorHash !== currentPrevious) {
        previousLinkResult.mismatchCount += 1;
        addIssue(issueMap, index, "Previous-hash link mismatch");
      }
    }
  }
  const linkIssues =
    previousLinkResult.missingCount + previousLinkResult.mismatchCount;
  previousLinkResult.state = resultState({
    checkable:
      Boolean(config.previousHashPath && config.hashPath) &&
      (entries.length > 1 || Boolean(config.expectedGenesisHash)),
    issueCount: linkIssues,
  });

  return {
    entryCount: entries.length,
    checks: {
      ids: idResult,
      sequence: sequenceResult,
      timestamps: timestampResult,
      previousLinks: previousLinkResult,
    },
    issueEntryCount: issueMap.size,
    rowIssues: [...issueMap.entries()]
      .map(([index, issues]) => ({ index, rowNumber: index + 1, issues }))
      .sort((left, right) => left.index - right.index),
  };
}

export async function sha256Hex(text, cryptoProvider = globalThis.crypto) {
  if (!cryptoProvider?.subtle) {
    throw new Error("Web Crypto SHA-256 is unavailable in this browser.");
  }
  const bytes = new TextEncoder().encode(String(text));
  const digest = await cryptoProvider.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

export function buildCanonicalHashInput(entry, config) {
  if (config.hashRecipe === "canonical-entry") {
    return stableCanonicalStringify(omitPath(entry, config.hashPath));
  }
  if (config.hashRecipe === "previous-plus-entry") {
    const previous = getPath(entry, config.previousHashPath);
    const withoutHash = omitPath(entry, config.hashPath);
    const payload = omitPath(withoutHash, config.previousHashPath);
    return `${String(previous ?? "")}\n${stableCanonicalStringify(payload)}`;
  }
  throw new TypeError("Choose a documented SHA-256 hash recipe.");
}

export async function verifySha256Chain(
  entries,
  config,
  digest = (input) => sha256Hex(input),
) {
  if (
    !config.hashRecipe ||
    !config.hashPath ||
    (config.hashRecipe === "previous-plus-entry" && !config.previousHashPath) ||
    !entries.length
  ) {
    return {
      state: "not-checkable",
      checkedCount: 0,
      verifiedCount: 0,
      mismatchCount: 0,
      notCheckableCount: entries.length,
      rowResults: [],
      reason:
        "Choose a recipe and configure both the stored-hash and previous-hash field paths.",
    };
  }

  const rowResults = [];
  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index];
    const storedHash = normalizeComparableHash(getPath(entry, config.hashPath));
    const previousHash = getPath(entry, config.previousHashPath);
    const previousRequired = config.hashRecipe === "previous-plus-entry";
    const invalidPreviousType =
      config.hashRecipe === "previous-plus-entry" && typeof previousHash !== "string";

    if (
      !/^[a-f0-9]{64}$/.test(storedHash) ||
      (previousRequired && previousHash == null) ||
      invalidPreviousType
    ) {
      rowResults.push({
        index,
        rowNumber: index + 1,
        state: "not-checkable",
        reason:
          !/^[a-f0-9]{64}$/.test(storedHash)
            ? "Stored hash is missing or is not 64 hexadecimal SHA-256 characters."
            : invalidPreviousType
              ? "Previous-hash value is not a string required by the selected recipe."
              : "Previous-hash value is missing for the selected recipe.",
      });
      continue;
    }

    const actualHash = await digest(buildCanonicalHashInput(entry, config));
    rowResults.push({
      index,
      rowNumber: index + 1,
      state: actualHash === storedHash ? "verified" : "mismatch",
      reason:
        actualHash === storedHash
          ? "Stored hash matches the selected canonical recipe."
          : "Stored hash does not match the selected canonical recipe.",
    });
  }

  const verifiedCount = rowResults.filter((result) => result.state === "verified").length;
  const mismatchCount = rowResults.filter((result) => result.state === "mismatch").length;
  const notCheckableCount = rowResults.filter(
    (result) => result.state === "not-checkable",
  ).length;
  const state =
    mismatchCount > 0
      ? "mismatch"
      : notCheckableCount > 0
        ? "not-checkable"
        : "verified";

  return {
    state,
    checkedCount: verifiedCount + mismatchCount,
    verifiedCount,
    mismatchCount,
    notCheckableCount,
    rowResults,
    reason:
      state === "verified"
        ? "Every stored hash matched the explicitly selected recipe."
        : state === "mismatch"
          ? "At least one recomputed hash did not match its stored value."
          : "One or more entries lacked the fields required for the selected recipe.",
  };
}

export function buildCountsOnlyReport(parseResult, structure, hashResult) {
  const rows = [
    ["Section", "Check", "State", "Checked", "Findings"],
    [
      "Input",
      "Parsed entries",
      parseResult.ok ? "parsed" : "not-parsed",
      parseResult.entries.length,
      parseResult.warnings.length,
    ],
    [
      "Structure",
      "IDs",
      structure.checks.ids.state,
      structure.checks.ids.checkedCount,
      structure.checks.ids.missingCount +
        structure.checks.ids.invalidCount +
        structure.checks.ids.duplicateEntryCount,
    ],
    [
      "Structure",
      "Sequence",
      structure.checks.sequence.state,
      structure.checks.sequence.checkedCount,
      structure.checks.sequence.invalidCount +
        structure.checks.sequence.gapCount +
        structure.checks.sequence.reorderedCount,
    ],
    [
      "Structure",
      "Timestamps",
      structure.checks.timestamps.state,
      structure.checks.timestamps.checkedCount,
      structure.checks.timestamps.invalidCount +
        structure.checks.timestamps.regressionCount,
    ],
    [
      "Structure",
      "Previous-hash links",
      structure.checks.previousLinks.state,
      structure.checks.previousLinks.checkedCount,
      structure.checks.previousLinks.missingCount +
        structure.checks.previousLinks.mismatchCount,
    ],
    [
      "SHA-256",
      "Canonical hash recomputation",
      hashResult.state,
      hashResult.checkedCount,
      hashResult.mismatchCount + hashResult.notCheckableCount,
    ],
  ];
  return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
}
