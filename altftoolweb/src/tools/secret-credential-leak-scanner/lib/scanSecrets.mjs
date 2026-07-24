export const MAX_SECRET_SCAN_CHARACTERS = 2_000_000;
export const MAX_SECRET_FINDINGS = 250;

const SECRET_RULES = Object.freeze([
  {
    id: "private-key",
    title: "Private key block",
    category: "Private key",
    severity: "critical",
    pattern:
      /-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY(?: BLOCK)?-----/giu,
    advice:
      "Remove the key from the file and rotate the corresponding credential.",
  },
  {
    id: "aws-access-key",
    title: "AWS access key identifier",
    category: "Cloud credential",
    severity: "high",
    pattern: /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/g,
    advice:
      "Review the key in AWS IAM, revoke it if exposed, and replace it at its source.",
  },
  {
    id: "github-token",
    title: "GitHub token-like value",
    category: "Source control token",
    severity: "high",
    pattern:
      /\b(?:gh[pousr]_[A-Za-z0-9]{30,255}|github_pat_[A-Za-z0-9_]{40,255})\b/g,
    advice:
      "Revoke the token in GitHub and replace it with a least-privilege credential.",
  },
  {
    id: "slack-token",
    title: "Slack token-like value",
    category: "Messaging token",
    severity: "high",
    pattern: /\bxox(?:b|p|a|r|s)-[A-Za-z0-9-]{10,255}\b/g,
    advice: "Revoke the token in the workspace administration settings.",
  },
  {
    id: "stripe-secret",
    title: "Stripe secret-key-like value",
    category: "Payment credential",
    severity: "high",
    pattern: /\bsk_(?:live|test)_[A-Za-z0-9]{16,255}\b/g,
    advice:
      "Roll the key in Stripe and review activity associated with the exposed key.",
  },
  {
    id: "google-api-key",
    title: "Google API key-like value",
    category: "API credential",
    severity: "high",
    pattern: /\bAIza[0-9A-Za-z_-]{35}\b/g,
    advice:
      "Rotate the key and restrict it by API, application, and origin where possible.",
  },
  {
    id: "jwt",
    title: "JSON Web Token-like value",
    category: "Session or identity token",
    severity: "medium",
    pattern: /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/g,
    advice:
      "Treat the token as exposed until its issuer confirms expiry or revocation.",
  },
  {
    id: "credential-url",
    title: "Credential embedded in a URL",
    category: "Connection credential",
    severity: "high",
    pattern:
      /\b(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?|redis|amqps?|https?):\/\/[^/\s:@]{1,128}:[^/\s@]{1,256}@[^/\s]+/giu,
    advice:
      "Remove user information from the URL and rotate the embedded password or token.",
  },
  {
    id: "authorization-header",
    title: "Authorization header value",
    category: "Request credential",
    severity: "high",
    pattern:
      /\bauthorization\s*:\s*(?:bearer|basic|token)\s+[A-Za-z0-9._~+/=-]{8,2048}/giu,
    advice:
      "Remove the header value from logs and rotate the credential if it left a trusted boundary.",
  },
]);

const GENERIC_ASSIGNMENT_RULE = Object.freeze({
  id: "generic-secret-assignment",
  title: "Secret-like assignment",
  category: "Generic credential",
  severity: "medium",
  advice:
    "Confirm whether the assigned value is real. If it is, remove and rotate it.",
});
const SENSITIVE_KEY_SEGMENTS = new Set([
  "credential",
  "passwd",
  "password",
  "secret",
  "token",
]);
const SENSITIVE_KEY_PAIRS = new Set([
  "access:key",
  "access:token",
  "api:key",
  "auth:token",
  "client:secret",
  "private:key",
]);
const MAX_ASSIGNMENT_KEY_CHARACTERS = 160;
const MAX_ASSIGNMENT_VALUE_CHARACTERS = 512;

function normalizeText(value) {
  return typeof value === "string"
    ? value.replace(/\r\n?/g, "\n")
    : String(value ?? "");
}

function locationAt(text, index) {
  const prior = text.slice(0, index);
  const lines = prior.split("\n");
  return { line: lines.length, column: lines.at(-1).length + 1 };
}

function stableFindingKey(rule, index, length) {
  return `${rule.id}:${index}:${length}`;
}

function maskedEvidence(length) {
  return `[REDACTED · ${Number(length).toLocaleString("en-US")} characters]`;
}

function isAssignmentKeyCharacter(character) {
  return Boolean(character && /[A-Za-z0-9_-]/u.test(character));
}

function isAssignmentValueCharacter(character) {
  return Boolean(character && /[A-Za-z0-9_./+~!@#$%^&*=-]/u.test(character));
}

function sensitiveAssignmentKey(key) {
  const segments = String(key || "")
    .replace(/([a-z0-9])([A-Z])/gu, "$1_$2")
    .replace(/([A-Z]+)([A-Z][a-z])/gu, "$1_$2")
    .toLowerCase()
    .split(/[_-]+/u)
    .filter(Boolean);
  if (segments.some((segment) => SENSITIVE_KEY_SEGMENTS.has(segment))) {
    return true;
  }
  for (let index = 0; index < segments.length - 1; index += 1) {
    if (SENSITIVE_KEY_PAIRS.has(`${segments[index]}:${segments[index + 1]}`)) {
      return true;
    }
  }
  return false;
}

function genericAssignmentMatches(text) {
  const matches = [];
  const delimiters = /=>|[:=]/gu;
  for (const delimiter of text.matchAll(delimiters)) {
    let keyEnd = delimiter.index ?? 0;
    while (keyEnd > 0 && /[ \t]/u.test(text[keyEnd - 1])) keyEnd -= 1;
    const keyQuote = /["'`]/u.test(text[keyEnd - 1]) ? text[keyEnd - 1] : "";
    if (keyQuote) keyEnd -= 1;
    let keyStart = keyEnd;
    while (
      keyStart > 0 &&
      keyEnd - keyStart < MAX_ASSIGNMENT_KEY_CHARACTERS &&
      isAssignmentKeyCharacter(text[keyStart - 1])
    ) {
      keyStart -= 1;
    }
    if (
      keyStart === keyEnd ||
      isAssignmentKeyCharacter(text[keyStart - 1]) ||
      (keyQuote && text[keyStart - 1] !== keyQuote) ||
      !sensitiveAssignmentKey(text.slice(keyStart, keyEnd))
    ) {
      continue;
    }

    let valueStart = (delimiter.index ?? 0) + delimiter[0].length;
    while (/[ \t]/u.test(text[valueStart])) valueStart += 1;
    const quote = /["'`]/u.test(text[valueStart]) ? text[valueStart] : "";
    if (quote) valueStart += 1;
    let valueEnd = valueStart;
    while (
      valueEnd - valueStart < MAX_ASSIGNMENT_VALUE_CHARACTERS &&
      isAssignmentValueCharacter(text[valueEnd])
    ) {
      valueEnd += 1;
    }
    const valueLength = valueEnd - valueStart;
    if (valueLength < 12) continue;
    matches.push({
      index: keyStart,
      length: valueEnd - keyStart + (quote && text[valueEnd] === quote ? 1 : 0),
    });
  }
  return matches;
}

export function scanSecrets(value, { sourceName = "Pasted text" } = {}) {
  const text = normalizeText(value);
  if (text.length > MAX_SECRET_SCAN_CHARACTERS) {
    return {
      ok: false,
      error: `Input exceeds the ${MAX_SECRET_SCAN_CHARACTERS.toLocaleString("en-US")}-character scan limit.`,
      sourceName,
      characterCount: text.length,
      findings: [],
      counts: { critical: 0, high: 0, medium: 0 },
      truncated: false,
    };
  }

  const findings = [];
  const seen = new Set();
  const counts = { critical: 0, high: 0, medium: 0 };
  let truncated = false;
  const priority = { medium: 1, high: 2, critical: 3 };
  const record = (rule, index, matchLength) => {
    const key = stableFindingKey(rule, index, matchLength);
    if (seen.has(key)) return;
    seen.add(key);
    counts[rule.severity] += 1;
    const buildFinding = () => ({
      ruleId: rule.id,
      title: rule.title,
      category: rule.category,
      severity: rule.severity,
      ...locationAt(text, index),
      length: matchLength,
      evidence: maskedEvidence(matchLength),
      advice: rule.advice,
    });
    if (findings.length < MAX_SECRET_FINDINGS) {
      findings.push(buildFinding());
      return;
    }
    truncated = true;
    const replaceIndex = findings.findIndex(
      (finding) => priority[finding.severity] < priority[rule.severity],
    );
    if (replaceIndex >= 0) findings[replaceIndex] = buildFinding();
  };

  for (const rule of SECRET_RULES) {
    rule.pattern.lastIndex = 0;
    for (const match of text.matchAll(rule.pattern)) {
      const matchText = match[0] || "";
      const index = match.index ?? 0;
      record(rule, index, matchText.length);
    }
  }
  for (const match of genericAssignmentMatches(text)) {
    record(GENERIC_ASSIGNMENT_RULE, match.index, match.length);
  }

  findings.sort(
    (left, right) =>
      left.line - right.line ||
      left.column - right.column ||
      left.ruleId.localeCompare(right.ruleId),
  );
  return {
    ok: true,
    sourceName,
    characterCount: text.length,
    findings,
    counts,
    truncated,
    level:
      counts.critical > 0
        ? "critical"
        : counts.high > 0
          ? "high"
          : counts.medium > 0
            ? "review"
            : "none",
  };
}

export function mergeSecretScanResults(results) {
  const supplied = Array.isArray(results) ? results : [];
  const invalid = supplied.find((result) => !result?.ok);
  if (invalid) {
    return {
      ok: false,
      error:
        invalid.error ||
        "One selected source could not be inspected within the local limits.",
      scannedSources: 0,
      scannedCharacters: 0,
      findings: [],
      counts: { critical: 0, high: 0, medium: 0 },
      truncated: false,
      level: "invalid",
    };
  }
  const valid = supplied;
  const findings = valid.flatMap((result) =>
    result.findings.map((finding) => ({
      ...finding,
      sourceName: result.sourceName,
    })),
  );
  const counts = valid.reduce(
    (summary, result) => {
      summary.critical += result.counts.critical;
      summary.high += result.counts.high;
      summary.medium += result.counts.medium;
      return summary;
    },
    { critical: 0, high: 0, medium: 0 },
  );
  return {
    ok: true,
    scannedSources: valid.length,
    scannedCharacters: valid.reduce(
      (total, result) => total + result.characterCount,
      0,
    ),
    findings,
    counts,
    truncated: valid.some((result) => result.truncated),
    level:
      counts.critical > 0
        ? "critical"
        : counts.high > 0
          ? "high"
          : counts.medium > 0
            ? "review"
            : "none",
  };
}

export function buildSecretScanReport(result) {
  if (!result?.ok) {
    return [
      "Secret & Credential Leak Scan",
      "Result: incomplete",
      result?.error || "The selected source could not be scanned.",
      "",
      "No clear or safety conclusion was produced.",
    ].join("\n");
  }
  const totalFindings =
    result.counts.critical + result.counts.high + result.counts.medium;
  const lines = [
    "Secret & Credential Leak Scan",
    `Sources scanned: ${result.scannedSources}`,
    `Characters scanned: ${result.scannedCharacters}`,
    `Findings observed: ${totalFindings}`,
    `Findings retained for review: ${result.findings.length}`,
    `Critical: ${result.counts.critical}`,
    `High: ${result.counts.high}`,
    `Review: ${result.counts.medium}`,
    "",
    "Values are intentionally omitted from this report.",
  ];
  for (const [index, finding] of result.findings.entries()) {
    lines.push(
      "",
      `${index + 1}. ${finding.title} (${finding.severity})`,
      `Source: ${finding.sourceName}`,
      `Location: line ${finding.line}, column ${finding.column}`,
      `Match length: ${finding.length} characters`,
      `Action: ${finding.advice}`,
    );
  }
  if (result.truncated) {
    lines.push(
      "",
      "Some findings were omitted after a per-source safety limit was reached.",
    );
  }
  lines.push(
    "",
    "Heuristic matches can be false positives. No finding does not prove that a source is secret-free.",
  );
  return lines.join("\n");
}
