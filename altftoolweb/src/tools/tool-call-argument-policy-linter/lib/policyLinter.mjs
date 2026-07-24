const PATH_KEYS = new Set([
  "directory",
  "destination",
  "destination path",
  "file",
  "file path",
  "filepath",
  "folder",
  "output path",
  "path",
  "source path",
  "target path",
]);

const DOMAIN_KEYS = new Set([
  "api url",
  "base url",
  "callback url",
  "domain",
  "endpoint",
  "host",
  "hostname",
  "origin",
  "uri",
  "url",
  "webhook url",
]);

const RECIPIENT_KEYS = new Set([
  "bcc",
  "cc",
  "email",
  "email address",
  "recipient",
  "recipients",
  "to",
]);

const DEFAULT_LIMITS = Object.freeze({
  maxCalls: 500,
  maxDepth: 10,
  maxEntriesPerCall: 5_000,
});

export const RULE_LABELS = Object.freeze({
  "arguments-unreadable": "Arguments unreadable",
  "confirmation-required": "Confirmation required",
  "coverage-limit": "Coverage limit",
  "domain-not-allowed": "Domain not allowed",
  "domain-unreadable": "Domain unreadable",
  "numeric-limit": "Numeric limit exceeded",
  "numeric-unreadable": "Numeric value unreadable",
  "path-not-allowed": "Path not allowed",
  "recipient-not-allowed": "Recipient not allowed",
  "tool-denied": "Tool explicitly denied",
  "tool-not-allowed": "Tool not allowed",
  "tool-unnamed": "Tool name missing",
});

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeWords(value) {
  return String(value ?? "")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .toLowerCase();
}

function normalizeName(value) {
  return String(value ?? "").trim().toLowerCase();
}

function stringArray(value, fieldName, errors) {
  if (value === undefined) return [];
  if (!Array.isArray(value)) {
    errors.push(`${fieldName} must be an array of strings.`);
    return [];
  }

  const result = [];
  value.forEach((entry, index) => {
    if (typeof entry !== "string" || !entry.trim()) {
      errors.push(`${fieldName}[${index}] must be a non-empty string.`);
      return;
    }
    result.push(entry.trim());
  });
  return result;
}

function normalizeConfirmation(value, errors) {
  if (value === undefined) {
    return { acceptedFlags: ["confirmed"], requiredForTools: [] };
  }
  if (!isObject(value)) {
    errors.push("confirmation must be an object.");
    return { acceptedFlags: ["confirmed"], requiredForTools: [] };
  }

  const requiredForTools = stringArray(
    value.requiredForTools,
    "confirmation.requiredForTools",
    errors,
  );
  const acceptedFlags =
    value.acceptedFlags === undefined
      ? ["confirmed"]
      : stringArray(value.acceptedFlags, "confirmation.acceptedFlags", errors);

  if (requiredForTools.length && !acceptedFlags.length) {
    errors.push(
      "confirmation.acceptedFlags needs at least one flag when confirmation is required.",
    );
  }

  return { acceptedFlags, requiredForTools };
}

function normalizeNumericLimits(value, errors) {
  if (value === undefined) return {};
  if (!isObject(value)) {
    errors.push("numericLimits must be an object of field names and non-negative limits.");
    return {};
  }

  const limits = {};
  Object.entries(value).forEach(([key, limit]) => {
    if (!key.trim() || typeof limit !== "number" || !Number.isFinite(limit) || limit < 0) {
      errors.push(`numericLimits.${key || "[empty]"} must be a finite non-negative number.`);
      return;
    }
    limits[normalizeWords(key)] = limit;
  });
  return limits;
}

export function parsePolicy(source) {
  let parsed;
  try {
    parsed = JSON.parse(String(source ?? ""));
  } catch {
    return {
      errors: ["Policy is not valid JSON."],
      ok: false,
      warnings: [],
    };
  }

  if (!isObject(parsed)) {
    return {
      errors: ["Policy root must be a JSON object."],
      ok: false,
      warnings: [],
    };
  }

  const errors = [];
  const warnings = [];
  const knownKeys = new Set([
    "allowedDomains",
    "allowedPathPrefixes",
    "allowedRecipients",
    "allowedTools",
    "confirmation",
    "deniedTools",
    "numericLimits",
  ]);
  const unknownKeys = Object.keys(parsed).filter((key) => !knownKeys.has(key));
  if (unknownKeys.length) {
    warnings.push(
      `${unknownKeys.length} unknown top-level polic${unknownKeys.length === 1 ? "y key was" : "y keys were"} ignored.`,
    );
  }
  const allowedTools = stringArray(parsed.allowedTools, "allowedTools", errors);
  const deniedTools = stringArray(parsed.deniedTools, "deniedTools", errors);
  const allowedPathPrefixes = stringArray(
    parsed.allowedPathPrefixes,
    "allowedPathPrefixes",
    errors,
  );
  const allowedDomains = stringArray(
    parsed.allowedDomains,
    "allowedDomains",
    errors,
  );
  const allowedRecipients = stringArray(
    parsed.allowedRecipients,
    "allowedRecipients",
    errors,
  );
  const confirmation = normalizeConfirmation(parsed.confirmation, errors);
  const numericLimits = normalizeNumericLimits(parsed.numericLimits, errors);

  if (
    !allowedTools.length &&
    !deniedTools.length &&
    !allowedPathPrefixes.length &&
    !allowedDomains.length &&
    !allowedRecipients.length &&
    !Object.keys(numericLimits).length &&
    !confirmation.requiredForTools.length
  ) {
    warnings.push("Policy has no enforceable rules; every parsed call will pass.");
  }

  return {
    errors,
    ok: errors.length === 0,
    policy: {
      allowedDomains: allowedDomains.map(normalizeName),
      allowedPathPrefixes,
      allowedRecipients: allowedRecipients.map(normalizeName),
      allowedTools: allowedTools.map(normalizeName),
      confirmation: {
        acceptedFlags: confirmation.acceptedFlags.map(normalizeWords),
        requiredForTools: confirmation.requiredForTools.map(normalizeName),
      },
      deniedTools: deniedTools.map(normalizeName),
      numericLimits,
    },
    warnings,
  };
}

function parseArgumentValue(value) {
  if (typeof value !== "string") return { arguments: value };
  const trimmed = value.trim();
  if (!trimmed) return { arguments: {} };
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) {
    return { arguments: {}, argumentWarning: true };
  }
  try {
    return { arguments: JSON.parse(trimmed) };
  } catch {
    return { arguments: {}, argumentWarning: true };
  }
}

function directArguments(raw) {
  const ignored = new Set([
    "action",
    "args",
    "arguments",
    "callId",
    "command",
    "function",
    "id",
    "input",
    "name",
    "operation",
    "parameters",
    "tool",
    "toolName",
    "type",
  ]);
  return Object.fromEntries(
    Object.entries(raw).filter(([key]) => !ignored.has(key)),
  );
}

function normalizeCall(raw, index) {
  const call = isObject(raw) ? raw : {};
  const functionBlock = isObject(call.function) ? call.function : {};
  const name =
    functionBlock.name ??
    call.tool ??
    call.toolName ??
    call.name ??
    call.action ??
    call.operation ??
    call.command ??
    "";
  const rawArguments =
    functionBlock.arguments ??
    call.arguments ??
    call.args ??
    call.input ??
    call.parameters ??
    (isObject(raw) ? directArguments(raw) : {});
  const parsedArguments = parseArgumentValue(rawArguments);

  return {
    argumentWarning: Boolean(parsedArguments.argumentWarning),
    arguments: parsedArguments.arguments,
    index,
    name: String(name).trim(),
  };
}

function extractRawCalls(parsed) {
  if (Array.isArray(parsed)) return parsed;
  if (!isObject(parsed)) return null;
  const nested =
    parsed.calls ??
    parsed.toolCalls ??
    parsed.tool_calls ??
    parsed.actions ??
    parsed.entries;
  return Array.isArray(nested) ? nested : [parsed];
}

export function parseToolCallLog(source, options = {}) {
  const limits = { ...DEFAULT_LIMITS, ...options };
  const text = String(source ?? "").trim();
  if (!text) {
    return { calls: [], errors: ["Tool-call log is empty."], ok: false, warnings: [] };
  }

  let rawCalls;
  try {
    rawCalls = extractRawCalls(JSON.parse(text));
  } catch {
    const lines = text.split(/\r\n|\n|\r/).filter((line) => line.trim());
    const parsedLines = [];
    const invalidLines = [];
    lines.forEach((line, index) => {
      try {
        parsedLines.push(JSON.parse(line));
      } catch {
        invalidLines.push(index + 1);
      }
    });

    if (invalidLines.length) {
      return {
        calls: [],
        errors: [
          `Tool-call log is neither valid JSON nor valid JSONL; ${invalidLines.length} line${invalidLines.length === 1 ? "" : "s"} could not be parsed.`,
        ],
        ok: false,
        warnings: [],
      };
    }
    rawCalls = parsedLines;
  }

  if (!rawCalls) {
    return {
      calls: [],
      errors: ["Tool-call log must contain an object, array or recognized calls array."],
      ok: false,
      warnings: [],
    };
  }

  const warnings = [];
  const boundedCalls = rawCalls.slice(0, limits.maxCalls);
  if (rawCalls.length > limits.maxCalls) {
    warnings.push(
      `Only the first ${limits.maxCalls.toLocaleString("en-US")} calls were analyzed.`,
    );
  }

  return {
    calls: boundedCalls.map(normalizeCall),
    errors: [],
    ok: true,
    warnings,
  };
}

function wildcardMatch(value, pattern) {
  const normalizedValue = normalizeName(value);
  const normalizedPattern = normalizeName(pattern);
  if (normalizedPattern === "*") return true;
  const escaped = normalizedPattern
    .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, ".*");
  return new RegExp(`^${escaped}$`).test(normalizedValue);
}

function matchesAny(value, patterns) {
  return patterns.some((pattern) => wildcardMatch(value, pattern));
}

function canonicalizePath(value) {
  const raw = String(value ?? "").trim().replace(/\\/g, "/");
  const driveMatch = raw.match(/^([a-zA-Z]:)(?:\/|$)/);
  const drive = driveMatch?.[1] ?? "";
  const absolute = raw.startsWith("/") || Boolean(drive);
  const withoutDrive = drive ? raw.slice(drive.length) : raw;
  const segments = [];

  withoutDrive.split("/").forEach((segment) => {
    if (!segment || segment === ".") return;
    if (segment === "..") {
      if (segments.length && segments.at(-1) !== "..") segments.pop();
      else if (!absolute) segments.push("..");
      return;
    }
    segments.push(segment);
  });

  const prefix = drive ? `${drive}/` : absolute ? "/" : "";
  return `${prefix}${segments.join("/")}` || (absolute ? prefix : ".");
}

function pathWithinPrefix(pathValue, prefixValue) {
  const path = canonicalizePath(pathValue);
  const prefix = canonicalizePath(prefixValue).replace(/\/+$/, "");
  if (path === prefix) return true;
  return path.startsWith(`${prefix}/`);
}

function extractDomain(value) {
  const candidate = String(value ?? "").trim();
  if (!candidate || /\s/.test(candidate)) return "";
  try {
    const url = new URL(
      /^[a-z][a-z0-9+.-]*:\/\//i.test(candidate)
        ? candidate
        : `https://${candidate}`,
    );
    return url.hostname.toLowerCase().replace(/\.$/, "");
  } catch {
    return "";
  }
}

function domainAllowed(domain, allowedDomains) {
  return allowedDomains.some((rule) => {
    const normalizedRule = rule.replace(/\.$/, "");
    if (normalizedRule.startsWith("*.")) {
      const suffix = normalizedRule.slice(2);
      return domain.length > suffix.length && domain.endsWith(`.${suffix}`);
    }
    return domain === normalizedRule;
  });
}

function recipientAllowed(recipient, allowedRecipients) {
  const normalized = normalizeName(recipient);
  return allowedRecipients.some((rule) => {
    if (rule.startsWith("@")) return normalized.endsWith(rule);
    return wildcardMatch(normalized, rule);
  });
}

function isConfirmationEnabled(value) {
  if (value === true || value === 1) return true;
  if (typeof value !== "string") return false;
  return ["approved", "confirmed", "true", "yes"].includes(normalizeWords(value));
}

function flattenEntries(value, limits) {
  const entries = [];
  let truncated = false;

  function walk(nested, path, depth) {
    if (truncated) return;
    if (depth > limits.maxDepth || entries.length >= limits.maxEntriesPerCall) {
      truncated = true;
      return;
    }

    if (Array.isArray(nested)) {
      nested.forEach((item, index) => walk(item, `${path}[${index}]`, depth + 1));
      return;
    }
    if (!isObject(nested)) return;

    Object.entries(nested).forEach(([key, entryValue]) => {
      if (truncated) return;
      const entryPath = `${path}.${key}`;
      entries.push({
        key,
        normalizedKey: normalizeWords(key),
        path: entryPath,
        value: entryValue,
      });
      if (Array.isArray(entryValue) || isObject(entryValue)) {
        walk(entryValue, entryPath, depth + 1);
      }
    });
  }

  walk(value, "arguments", 0);
  return { entries, truncated };
}

function scalarValues(value) {
  if (Array.isArray(value)) return value.flatMap(scalarValues);
  if (value === null || value === undefined || isObject(value)) return [];
  return [value];
}

function createFinding(call, level, rule, message, argumentPath) {
  return {
    argumentPath,
    callIndex: call.index,
    level,
    message,
    rule,
    toolName: call.name || "Unnamed tool",
  };
}

export function lintToolCalls(policy, calls, options = {}) {
  const limits = { ...DEFAULT_LIMITS, ...options };
  const callResults = calls.map((call) => {
    const findings = [];
    const toolName = normalizeName(call.name);

    if (!toolName) {
      findings.push(
        createFinding(
          call,
          "warning",
          "tool-unnamed",
          "No tool name was found, so name-based rules could not be evaluated.",
        ),
      );
    } else if (matchesAny(toolName, policy.deniedTools)) {
      findings.push(
        createFinding(
          call,
          "violation",
          "tool-denied",
          "The tool name matches an explicit deny rule.",
        ),
      );
    } else if (
      policy.allowedTools.length &&
      !matchesAny(toolName, policy.allowedTools)
    ) {
      findings.push(
        createFinding(
          call,
          "violation",
          "tool-not-allowed",
          "The tool name is not included in the configured allowlist.",
        ),
      );
    }

    if (call.argumentWarning) {
      findings.push(
        createFinding(
          call,
          "warning",
          "arguments-unreadable",
          "String arguments were not valid JSON, so argument rules could not be evaluated.",
        ),
      );
    }

    const { entries, truncated } = flattenEntries(call.arguments, limits);
    if (truncated) {
      findings.push(
        createFinding(
          call,
          "warning",
          "coverage-limit",
          "Argument traversal reached a safe depth or entry limit; coverage is partial.",
        ),
      );
    }

    if (policy.allowedPathPrefixes.length) {
      entries
        .filter((entry) => PATH_KEYS.has(entry.normalizedKey))
        .forEach((entry) => {
          scalarValues(entry.value).forEach((value) => {
            if (
              typeof value !== "string" ||
              !policy.allowedPathPrefixes.some((prefix) =>
                pathWithinPrefix(value, prefix),
              )
            ) {
              findings.push(
                createFinding(
                  call,
                  "violation",
                  "path-not-allowed",
                  `Path at ${entry.path} is outside the configured prefixes.`,
                  entry.path,
                ),
              );
            }
          });
        });
    }

    if (policy.allowedDomains.length) {
      entries
        .filter((entry) => DOMAIN_KEYS.has(entry.normalizedKey))
        .forEach((entry) => {
          scalarValues(entry.value).forEach((value) => {
            const domain = extractDomain(value);
            findings.push(
              !domain
                ? createFinding(
                    call,
                    "violation",
                    "domain-unreadable",
                    `Domain at ${entry.path} could not be parsed and was not allowlisted.`,
                    entry.path,
                  )
                : !domainAllowed(domain, policy.allowedDomains)
                  ? createFinding(
                      call,
                      "violation",
                      "domain-not-allowed",
                      `Domain at ${entry.path} is not included in the configured allowlist.`,
                      entry.path,
                    )
                  : null,
            );
          });
        });
    }

    if (policy.allowedRecipients.length) {
      entries
        .filter((entry) => RECIPIENT_KEYS.has(entry.normalizedKey))
        .forEach((entry) => {
          scalarValues(entry.value).forEach((value) => {
            if (
              typeof value !== "string" ||
              !recipientAllowed(value, policy.allowedRecipients)
            ) {
              findings.push(
                createFinding(
                  call,
                  "violation",
                  "recipient-not-allowed",
                  `Recipient at ${entry.path} is not included in the configured allowlist.`,
                  entry.path,
                ),
              );
            }
          });
        });
    }

    entries.forEach((entry) => {
      if (!(entry.normalizedKey in policy.numericLimits)) return;
      const limit = policy.numericLimits[entry.normalizedKey];
      scalarValues(entry.value).forEach((value) => {
        const numericValue =
          typeof value === "number"
            ? value
            : typeof value === "string" && value.trim()
              ? Number(value)
              : Number.NaN;
        if (!Number.isFinite(numericValue)) {
          findings.push(
            createFinding(
              call,
              "warning",
              "numeric-unreadable",
              `Numeric field at ${entry.path} could not be verified against its limit.`,
              entry.path,
            ),
          );
        } else if (Math.abs(numericValue) > limit) {
          findings.push(
            createFinding(
              call,
              "violation",
              "numeric-limit",
              `Absolute numeric value at ${entry.path} exceeds the configured maximum.`,
              entry.path,
            ),
          );
        }
      });
    });

    if (
      toolName &&
      matchesAny(toolName, policy.confirmation.requiredForTools)
    ) {
      const confirmed = entries.some(
        (entry) =>
          policy.confirmation.acceptedFlags.includes(entry.normalizedKey) &&
          isConfirmationEnabled(entry.value),
      );
      if (!confirmed) {
        findings.push(
          createFinding(
            call,
            "violation",
            "confirmation-required",
            "No accepted confirmation flag was set to an affirmative value.",
          ),
        );
      }
    }

    const filteredFindings = findings.filter(Boolean);
    const violationCount = filteredFindings.filter(
      (finding) => finding.level === "violation",
    ).length;
    const warningCount = filteredFindings.length - violationCount;

    return {
      findings: filteredFindings,
      index: call.index,
      outcome: violationCount ? "violation" : warningCount ? "warning" : "pass",
      toolName: call.name || "Unnamed tool",
      violationCount,
      warningCount,
    };
  });

  const findings = callResults.flatMap((call) => call.findings);
  const countRules = (level) =>
    Object.fromEntries(
      [...new Set(findings.filter((item) => item.level === level).map((item) => item.rule))]
        .sort()
        .map((rule) => [
          rule,
          findings.filter((item) => item.level === level && item.rule === rule).length,
        ]),
    );

  return {
    callResults,
    policyCoverage: {
      allowedDomainRules: policy.allowedDomains.length,
      allowedPathPrefixRules: policy.allowedPathPrefixes.length,
      allowedRecipientRules: policy.allowedRecipients.length,
      allowedToolRules: policy.allowedTools.length,
      confirmationToolRules: policy.confirmation.requiredForTools.length,
      deniedToolRules: policy.deniedTools.length,
      numericLimitRules: Object.keys(policy.numericLimits).length,
    },
    summary: {
      calls: callResults.length,
      passedCalls: callResults.filter((call) => call.outcome === "pass").length,
      callsWithViolations: callResults.filter(
        (call) => call.outcome === "violation",
      ).length,
      callsWithWarnings: callResults.filter((call) => call.outcome === "warning")
        .length,
      violations: findings.filter((finding) => finding.level === "violation").length,
      warnings: findings.filter((finding) => finding.level === "warning").length,
    },
    violationCountsByRule: countRules("violation"),
    warningCountsByRule: countRules("warning"),
  };
}

export function buildCountsOnlyReport(result, generatedAt = new Date().toISOString()) {
  return JSON.stringify(
    {
      reportType: "ALTFTool tool-call argument policy lint summary",
      generatedAt,
      privacyNotice:
        "Counts only: source policies, tool names, arguments, recipients, paths, domains and finding paths are excluded.",
      summary: result.summary,
      policyCoverage: result.policyCoverage,
      violationCountsByRule: result.violationCountsByRule,
      warningCountsByRule: result.warningCountsByRule,
      limitations: [
        "This is deterministic static linting; it does not execute tools or prove runtime enforcement.",
        "Rules apply only to recognized tool names and argument keys in the supplied log.",
        "Path checks are lexical and do not resolve symlinks, environment variables, aliases or filesystem permissions.",
        "Domain checks do not follow redirects or inspect DNS, IP ownership or network behavior.",
        "Numeric limits use the absolute parsed value and do not convert currencies or units.",
        "Nested inputs beyond safe traversal limits are only partially covered.",
      ],
    },
    null,
    2,
  );
}
