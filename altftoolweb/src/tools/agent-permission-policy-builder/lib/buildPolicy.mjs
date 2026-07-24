const MAX_LIST_ITEMS = 200;
const MAX_ITEM_CHARACTERS = 500;

function unique(values) {
  const seen = new Set();
  return values.filter((value) => {
    const key = value.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function parseList(value) {
  const source = Array.isArray(value) ? value.join("\n") : String(value || "");
  return unique(
    source
      .split(/[\r\n,]+/)
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, MAX_LIST_ITEMS)
      .map((item) => item.slice(0, MAX_ITEM_CHARACTERS)),
  );
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
    return wildcard ? `*.${hostname}` : hostname;
  } catch {
    return null;
  }
}

export function parseDomainRules(value) {
  const accepted = [];
  const invalid = [];
  for (const item of parseList(value)) {
    const normalized = normalizeDomainRule(item);
    if (normalized) accepted.push(normalized);
    else invalid.push(item);
  }
  return { accepted: unique(accepted), invalid };
}

export function parseNumericLimits(value) {
  const source = Array.isArray(value) ? value.join("\n") : String(value || "");
  const limits = {};
  const errors = [];
  const warnings = [];

  source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, MAX_LIST_ITEMS)
    .forEach((line, index) => {
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
  const allowedTools = parseList(input.allowedTools);
  const deniedTools = parseList(input.deniedTools);
  const allowedPathPrefixes = parseList(input.allowedPathPrefixes);
  const allowedRecipients = parseList(input.allowedRecipients);
  const requiredForTools = parseList(input.requiredConfirmationTools);
  const acceptedFlags = parseList(input.acceptedConfirmationFlags);
  const domains = parseDomainRules(input.allowedDomains);
  const numeric = parseNumericLimits(input.numericLimits);
  const errors = [...numeric.errors];
  const warnings = [...numeric.warnings];

  if (domains.invalid.length) {
    errors.push(
      `${domains.invalid.length} domain rule${domains.invalid.length === 1 ? "" : "s"} must contain only a hostname, such as example.com or *.example.com.`,
    );
  }
  if (requiredForTools.length && !acceptedFlags.length) {
    errors.push("Add at least one accepted confirmation flag when confirmation is required.");
  }

  const overlaps = exactOverlap(allowedTools, deniedTools);
  if (overlaps.length) {
    warnings.push(
      `${overlaps.length} exact tool pattern${overlaps.length === 1 ? "" : "s"} appear in both lists; deny rules take precedence.`,
    );
  }
  if (
    !allowedTools.length &&
    !deniedTools.length &&
    !allowedPathPrefixes.length &&
    !domains.accepted.length &&
    !allowedRecipients.length &&
    !Object.keys(numeric.limits).length &&
    !requiredForTools.length
  ) {
    warnings.push("This draft has no enforceable rule yet.");
  }
  if (
    allowedPathPrefixes.some(
      (path) => !path.startsWith("/") && !/^[A-Za-z]:[\\/]/u.test(path),
    )
  ) {
    warnings.push(
      "Relative path prefixes depend on the linter’s working context; absolute prefixes are clearer.",
    );
  }

  const policy = {
    allowedTools,
    deniedTools,
    allowedPathPrefixes,
    allowedDomains: domains.accepted,
    allowedRecipients,
    numericLimits: numeric.limits,
    confirmation: {
      requiredForTools,
      acceptedFlags,
    },
  };

  return {
    ok: errors.length === 0,
    policy,
    errors,
    warnings,
    summary: {
      allowedToolRules: allowedTools.length,
      deniedToolRules: deniedTools.length,
      pathRules: allowedPathPrefixes.length,
      domainRules: domains.accepted.length,
      recipientRules: allowedRecipients.length,
      numericLimitRules: Object.keys(numeric.limits).length,
      confirmationToolRules: requiredForTools.length,
      confirmationFlags: acceptedFlags.length,
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
