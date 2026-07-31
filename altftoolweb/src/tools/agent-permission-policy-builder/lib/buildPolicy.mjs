const MAX_LIST_ITEMS = 200;
const MAX_ITEM_CHARACTERS = 500;
const DNS_LABEL_RE = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;

function unique(values) {
  const seen = new Set();
  return values.filter((value) => {
    const key = value.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function splitEntries(value) {
  const source = Array.isArray(value) ? value.join("\n") : String(value || "");
  return source
    .split(/[\r\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

// Returns { items, warnings }. Entries beyond MAX_LIST_ITEMS are dropped and
// entries longer than MAX_ITEM_CHARACTERS are truncated, but neither happens
// silently: both are reported back as warnings so a caller can surface them
// instead of shipping a policy that under-enforces what the user typed.
export function parseList(value, label = "This field") {
  const entries = splitEntries(value);
  const warnings = [];

  const overflow = entries.length - MAX_LIST_ITEMS;
  if (overflow > 0) {
    warnings.push(
      `${label}: ${overflow} ${overflow === 1 ? "entry" : "entries"} beyond the ${MAX_LIST_ITEMS}-entry limit ${
        overflow === 1 ? "was" : "were"
      } dropped.`,
    );
  }

  const limited = entries.slice(0, MAX_LIST_ITEMS);
  const overLength = limited.filter((item) => item.length > MAX_ITEM_CHARACTERS).length;
  if (overLength > 0) {
    warnings.push(
      `${label}: ${overLength} ${overLength === 1 ? "entry" : "entries"} longer than ${MAX_ITEM_CHARACTERS} characters ${
        overLength === 1 ? "was" : "were"
      } truncated.`,
    );
  }

  const items = unique(limited.map((item) => item.slice(0, MAX_ITEM_CHARACTERS)));
  return { items, warnings };
}

function isValidHostname(hostname) {
  if (!hostname || hostname.length > 253) return false;
  return hostname.split(".").every((label) => DNS_LABEL_RE.test(label));
}

function normalizeDomainRule(value) {
  const source = String(value || "").trim().toLowerCase().replace(/\.$/, "");
  const wildcard = source.startsWith("*.");
  const candidate = wildcard ? source.slice(2) : source;
  if (
    !candidate ||
    candidate.includes("/") ||
    candidate.includes(":") ||
    /\s/.test(candidate)
  ) {
    return null;
  }
  try {
    const hostname = new URL(`https://${candidate}`).hostname.toLowerCase().replace(/\.$/, "");
    if (hostname !== candidate) return null;
    if (!isValidHostname(hostname)) return null;
    return wildcard ? `*.${hostname}` : hostname;
  } catch {
    return null;
  }
}

export function parseDomainRules(value, label = "Allowed domains") {
  const parsed = parseList(value, label);
  const accepted = [];
  const invalid = [];
  for (const item of parsed.items) {
    const normalized = normalizeDomainRule(item);
    if (normalized) accepted.push(normalized);
    else invalid.push(item);
  }
  return { accepted: unique(accepted), invalid, warnings: parsed.warnings };
}

export function parseNumericLimits(value) {
  const source = Array.isArray(value) ? value.join("\n") : String(value || "");
  const limits = {};
  const errors = [];
  const warnings = [];

  const lines = source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const overflow = lines.length - MAX_LIST_ITEMS;
  if (overflow > 0) {
    warnings.push(
      `Numeric ceilings: ${overflow} ${overflow === 1 ? "line" : "lines"} beyond the ${MAX_LIST_ITEMS}-entry limit ${
        overflow === 1 ? "was" : "were"
      } dropped.`,
    );
  }

  lines.slice(0, MAX_LIST_ITEMS).forEach((line, index) => {
    const match = line.match(/^([^=:]{1,160})\s*(?:=|:)\s*(.+)$/u);
    if (!match) {
      errors.push(`Numeric limit line ${index + 1} needs field = maximum.`);
      return;
    }
    const key = match[1].trim();
    const amount = Number(match[2].trim());
    if (!key || !Number.isFinite(amount) || amount < 0) {
      errors.push(`Numeric limit line ${index + 1} needs a non-negative number.`);
      return;
    }
    if (Object.hasOwn(limits, key)) {
      warnings.push(`Numeric limit “${key}” appeared more than once; the last value is used.`);
    }
    limits[key] = amount;
  });

  return { limits, errors, warnings };
}

function exactOverlap(left, right) {
  const rightSet = new Set(right.map((item) => item.toLowerCase()));
  return left.filter((item) => rightSet.has(item.toLowerCase()));
}

export function buildPermissionPolicy(input = {}) {
  const allowedTools = parseList(input.allowedTools, "Allowed tool patterns");
  const deniedTools = parseList(input.deniedTools, "Denied tool patterns");
  const allowedPathPrefixes = parseList(input.allowedPathPrefixes, "Allowed path prefixes");
  const allowedRecipients = parseList(input.allowedRecipients, "Allowed recipients");
  const requiredForTools = parseList(
    input.requiredConfirmationTools,
    "Tools requiring confirmation",
  );
  const acceptedFlags = parseList(
    input.acceptedConfirmationFlags,
    "Accepted confirmation flags",
  );
  const domains = parseDomainRules(input.allowedDomains, "Allowed domains");
  const numeric = parseNumericLimits(input.numericLimits);
  const errors = [...numeric.errors];
  const warnings = [
    ...numeric.warnings,
    ...allowedTools.warnings,
    ...deniedTools.warnings,
    ...allowedPathPrefixes.warnings,
    ...allowedRecipients.warnings,
    ...requiredForTools.warnings,
    ...acceptedFlags.warnings,
    ...domains.warnings,
  ];

  if (domains.invalid.length) {
    errors.push(
      `${domains.invalid.length} domain rule${domains.invalid.length === 1 ? "" : "s"} must contain only a hostname, such as example.com or *.example.com.`,
    );
  }
  if (requiredForTools.items.length && !acceptedFlags.items.length) {
    errors.push("Add at least one accepted confirmation flag when confirmation is required.");
  }

  const overlaps = exactOverlap(allowedTools.items, deniedTools.items);
  if (overlaps.length) {
    warnings.push(
      `${overlaps.length} exact tool pattern${overlaps.length === 1 ? "" : "s"} appear in both lists; deny rules take precedence.`,
    );
  }
  if (
    !allowedTools.items.length &&
    !deniedTools.items.length &&
    !allowedPathPrefixes.items.length &&
    !domains.accepted.length &&
    !allowedRecipients.items.length &&
    !Object.keys(numeric.limits).length &&
    !requiredForTools.items.length
  ) {
    warnings.push("This draft has no enforceable rule yet.");
  }
  if (
    allowedPathPrefixes.items.some(
      (path) => !path.startsWith("/") && !/^[A-Za-z]:[\\/]/u.test(path),
    )
  ) {
    warnings.push(
      "Relative path prefixes depend on the linter’s working context; absolute prefixes are clearer.",
    );
  }

  const policy = {
    allowedTools: allowedTools.items,
    deniedTools: deniedTools.items,
    allowedPathPrefixes: allowedPathPrefixes.items,
    allowedDomains: domains.accepted,
    allowedRecipients: allowedRecipients.items,
    numericLimits: numeric.limits,
    confirmation: {
      requiredForTools: requiredForTools.items,
      acceptedFlags: acceptedFlags.items,
    },
  };

  return {
    ok: errors.length === 0,
    policy,
    errors,
    warnings,
    summary: {
      allowedToolRules: allowedTools.items.length,
      deniedToolRules: deniedTools.items.length,
      pathRules: allowedPathPrefixes.items.length,
      domainRules: domains.accepted.length,
      recipientRules: allowedRecipients.items.length,
      numericLimitRules: Object.keys(numeric.limits).length,
      confirmationToolRules: requiredForTools.items.length,
      confirmationFlags: acceptedFlags.items.length,
    },
  };
}

export function serializePermissionPolicy(result) {
  if (!result?.ok) return "";
  return `${JSON.stringify(result.policy, null, 2)}\n`;
}

export function buildPolicySummaryReport(result) {
  if (!result?.ok) return null;
  return {
    generatedAt: new Date().toISOString(),
    ruleCounts: result.summary,
    warningCount: result.warnings.length,
    note:
      "This counts-only report does not include policy values. A policy only constrains checks that the consuming linter or agent actually enforces.",
  };
}
