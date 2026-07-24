const MAX_SOURCE_CHARACTERS = 1_000_000;
const MAX_ENTRIES = 10_000;
const MAX_VALUE_CHARACTERS = 10_000;

const SIGNAL_RULES = Object.freeze([
  {
    id: "instruction-override",
    label: "Instruction override language",
    severity: "high",
    pattern:
      /\b(?:ignore|disregard|forget|override|bypass)\b.{0,48}\b(?:previous|earlier|system|developer|instruction|policy|rule|safety|restriction)s?\b|\b(?:system|developer)\s+(?:prompt|message)\b/giu,
  },
  {
    id: "hidden-control",
    label: "Invisible or directional Unicode",
    severity: "high",
    pattern: /[\u200B-\u200F\u202A-\u202E\u2060\u2066-\u2069\uFEFF]/gu,
  },
  {
    id: "identity-change",
    label: "Identity or role change",
    severity: "medium",
    pathPattern: /(?:^|[.[\]_-])(?:identity|persona|profile|role|user.?name|display.?name)(?:$|[.[\]_-])/iu,
    pattern:
      /\b(?:you are now|act as|new identity|my (?:name|identity) is|call me|pretend to be|role is)\b/giu,
  },
  {
    id: "permission-expansion",
    label: "Permission or authority expansion",
    severity: "medium",
    pathPattern:
      /(?:^|[.[\]_-])(?:permissions?|privileges?|allowlist|access|scopes?|capabilit(?:y|ies))(?:$|[.[\]_-])/iu,
    pattern:
      /\b(?:grant|allow|enable|authorize|approve|unrestricted|administrator|admin)\b.{0,42}\b(?:shell|filesystem|file|network|email|message|payment|delete|write|access|permission|tool)s?\b/giu,
  },
  {
    id: "secrecy-persistence",
    label: "Secrecy or forced persistence cue",
    severity: "medium",
    pattern:
      /\b(?:never forget|remember (?:forever|permanently|always)|do not (?:tell|reveal|mention)|keep (?:this|it) secret|hide (?:this|it) from)\b/giu,
  },
  {
    id: "external-instruction",
    label: "External instruction source",
    severity: "low",
    pattern:
      /\bhttps?:\/\/[^\s<>"']+|\b(?:download|fetch|open|visit|follow)\b.{0,30}\bhttps?:\/\//giu,
  },
]);

function displayScalar(value) {
  if (value === null) return "null";
  if (typeof value === "string") return value.slice(0, MAX_VALUE_CHARACTERS);
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
}

function pathSegment(key, parentPath) {
  if (typeof key === "number") return `${parentPath}[${key}]`;
  const clean = String(key);
  if (!parentPath) return clean;
  return /^[A-Za-z_$][\w$]*$/.test(clean)
    ? `${parentPath}.${clean}`
    : `${parentPath}[${JSON.stringify(clean)}]`;
}

function flattenJson(value, path = "", entries = []) {
  if (entries.length >= MAX_ENTRIES) return entries;

  if (Array.isArray(value)) {
    if (!value.length) entries.push({ path: path || "$", value: "[]" });
    value.forEach((item, index) => {
      if (entries.length < MAX_ENTRIES) {
        flattenJson(item, pathSegment(index, path || "$"), entries);
      }
    });
    return entries;
  }

  if (value && typeof value === "object") {
    const pairs = Object.entries(value);
    if (!pairs.length) entries.push({ path: path || "$", value: "{}" });
    pairs.forEach(([key, item]) => {
      if (entries.length < MAX_ENTRIES) {
        flattenJson(item, pathSegment(key, path), entries);
      }
    });
    return entries;
  }

  entries.push({ path: path || "$", value: displayScalar(value) });
  return entries;
}

export function parseMemorySnapshot(source) {
  const raw = String(source || "");
  const bounded = raw.slice(0, MAX_SOURCE_CHARACTERS);
  const trimmed = bounded.trim();
  if (!trimmed) {
    return {
      ok: true,
      format: "empty",
      entries: [],
      truncated: raw.length > bounded.length,
    };
  }

  if (/^[{[]/.test(trimmed)) {
    try {
      const parsed = JSON.parse(trimmed);
      const entries = flattenJson(parsed);
      return {
        ok: true,
        format: "json",
        entries,
        truncated: raw.length > bounded.length || entries.length >= MAX_ENTRIES,
      };
    } catch {
      return {
        ok: false,
        error: "This snapshot looks like JSON, but it could not be parsed.",
        entries: [],
      };
    }
  }

  const entries = trimmed
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, MAX_ENTRIES)
    .map((value, index) => ({ path: `line[${index + 1}]`, value }));

  return {
    ok: true,
    format: "text",
    entries,
    truncated:
      raw.length > bounded.length ||
      trimmed.split(/\r?\n/).filter((line) => line.trim()).length > entries.length,
  };
}

function detectSignals(path, value) {
  return SIGNAL_RULES.filter((rule) => {
    rule.pattern.lastIndex = 0;
    const valueMatch = rule.pattern.test(value);
    rule.pattern.lastIndex = 0;
    return valueMatch || Boolean(rule.pathPattern?.test(path));
  }).map(({ id, label, severity }) => ({ id, label, severity }));
}

function severityFor(signals) {
  if (signals.some((signal) => signal.severity === "high")) return "high";
  if (signals.some((signal) => signal.severity === "medium")) return "medium";
  if (signals.length) return "low";
  return "none";
}

function countBy(items, key, expected) {
  return items.filter((item) => item[key] === expected).length;
}

export function inspectMemoryChanges(beforeSource, afterSource) {
  const before = parseMemorySnapshot(beforeSource);
  const after = parseMemorySnapshot(afterSource);
  if (!before.ok || !after.ok) {
    return {
      ok: false,
      error: before.error || after.error,
      before,
      after,
    };
  }

  const beforeMap = new Map(before.entries.map((entry) => [entry.path, entry.value]));
  const afterMap = new Map(after.entries.map((entry) => [entry.path, entry.value]));
  const paths = [...new Set([...beforeMap.keys(), ...afterMap.keys()])].sort();

  const changes = paths.flatMap((path) => {
    const hadBefore = beforeMap.has(path);
    const hasAfter = afterMap.has(path);
    const beforeValue = beforeMap.get(path) ?? "";
    const afterValue = afterMap.get(path) ?? "";
    if (hadBefore && hasAfter && beforeValue === afterValue) return [];

    const changeType = !hadBefore ? "added" : !hasAfter ? "removed" : "modified";
    const signals = changeType === "removed" ? [] : detectSignals(path, afterValue);
    return [
      {
        path,
        changeType,
        beforeValue,
        afterValue,
        signals,
        severity: severityFor(signals),
      },
    ];
  });

  const flagged = changes.filter((change) => change.signals.length);
  const signalTotals = SIGNAL_RULES.map((rule) => ({
    id: rule.id,
    label: rule.label,
    severity: rule.severity,
    count: flagged.filter((change) =>
      change.signals.some((signal) => signal.id === rule.id),
    ).length,
  })).filter((item) => item.count);

  return {
    ok: true,
    beforeFormat: before.format,
    afterFormat: after.format,
    beforeEntryCount: before.entries.length,
    afterEntryCount: after.entries.length,
    truncated: before.truncated || after.truncated,
    changes,
    flagged,
    signalTotals,
    summary: {
      added: countBy(changes, "changeType", "added"),
      modified: countBy(changes, "changeType", "modified"),
      removed: countBy(changes, "changeType", "removed"),
      high: countBy(flagged, "severity", "high"),
      medium: countBy(flagged, "severity", "medium"),
      low: countBy(flagged, "severity", "low"),
    },
  };
}

export function buildMemoryAuditReport(result) {
  if (!result?.ok) return null;
  return {
    generatedAt: new Date().toISOString(),
    formats: {
      before: result.beforeFormat,
      after: result.afterFormat,
    },
    entryCounts: {
      before: result.beforeEntryCount,
      after: result.afterEntryCount,
    },
    changeCounts: result.summary,
    signalTotals: result.signalTotals,
    flaggedFindings: result.flagged.map((finding, index) => ({
      finding: index + 1,
      changeType: finding.changeType,
      severity: finding.severity,
      signals: finding.signals.map((signal) => signal.id),
    })),
    truncated: result.truncated,
    note:
      "Pattern matches are review cues, not proof of poisoning. This report excludes memory values and paths.",
  };
}
