export const GIT_DIFF_LIMITS = Object.freeze({
  maxCharacters: 300_000,
  maxLines: 20_000,
  maxFiles: 500,
  maxAddedLines: 15_000,
  maxFindings: 800,
});

export const GIT_DIFF_LIMITATIONS = Object.freeze([
  "This checker reads pasted unified-diff text only. It never opens a repository, runs Git, follows paths, executes code, validates credentials, or contacts a provider.",
  "Pattern matches can be test data or public examples, and unrecognized or encoded secrets can be missed. Treat findings as review cues, not proof of exposure or safety.",
  "Only added lines and observed destination filenames are inspected. Unchanged context, removed lines, binary patches, history, ignored files, and remote state are outside scope.",
]);

const SENSITIVE_PATH_PATTERNS = [
  /(?:^|\/)\.env(?:\.|$)/i,
  /(?:^|\/)(?:id_(?:rsa|dsa|ecdsa|ed25519)|authorized_keys|known_hosts)$/i,
  /(?:^|\/)(?:credentials?|secrets?|private[-_.]?keys?)(?:\.|\/|$)/i,
  /\.(?:pem|p12|pfx|key|keystore|jks)$/i,
  /(?:^|\/)\.aws\/credentials$/i,
  /(?:^|\/)\.npmrc$/i,
  /(?:^|\/)\.pypirc$/i,
];

const LINE_DETECTORS = [
  {
    code: "private-key-material",
    severity: "high",
    label: "Private-key material marker",
    pattern: /-----BEGIN (?:[A-Z0-9 ]+ )?PRIVATE KEY-----/,
  },
  {
    code: "aws-access-key-id",
    severity: "high",
    label: "AWS access-key identifier pattern",
    pattern: /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/,
  },
  {
    code: "github-token",
    severity: "high",
    label: "GitHub token pattern",
    pattern: /\bgh(?:p|o|u|s|r)_[A-Za-z0-9]{30,255}\b/,
  },
  {
    code: "slack-token",
    severity: "high",
    label: "Slack token pattern",
    pattern: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/,
  },
  {
    code: "jwt-like-token",
    severity: "high",
    label: "JWT-like bearer token",
    pattern: /\beyJ[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}\b/,
  },
  {
    code: "authorization-bearer",
    severity: "high",
    label: "Authorization bearer value",
    pattern: /\bauthorization\s*[:=]\s*["']?bearer\s+[^\s"',;]{8,}/i,
  },
  {
    code: "email-address",
    severity: "medium",
    label: "Email-address pattern",
    pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,24}\b/i,
  },
  {
    code: "phone-number",
    severity: "medium",
    label: "Phone-number pattern",
    pattern:
      /(?:^|[^\d])(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{2,4}\)?[-.\s]?){2,3}\d{3,4}(?:$|[^\d])/,
  },
];

const SENSITIVE_ASSIGNMENT_SEGMENTS = new Set([
  "credential",
  "passwd",
  "password",
  "secret",
  "token",
]);
const SENSITIVE_ASSIGNMENT_PAIRS = new Set([
  "access:key",
  "access:token",
  "api:key",
  "auth:token",
  "client:secret",
  "private:key",
]);
const ASSIGNMENT_PLACEHOLDER =
  /^(?:example|sample|placeholder|changeme|redacted|<[^>]+>|process\.env|\$\{?[\w.-]+\}?)/iu;

function isAssignmentKeyCharacter(character) {
  return Boolean(character && /[A-Za-z0-9_-]/u.test(character));
}

function sensitiveAssignmentKey(key) {
  const segments = String(key || "")
    .replace(/([a-z0-9])([A-Z])/gu, "$1_$2")
    .replace(/([A-Z]+)([A-Z][a-z])/gu, "$1_$2")
    .toLowerCase()
    .split(/[_-]+/u)
    .filter(Boolean);
  if (
    segments.some((segment) => SENSITIVE_ASSIGNMENT_SEGMENTS.has(segment))
  ) {
    return true;
  }
  for (let index = 0; index < segments.length - 1; index += 1) {
    if (
      SENSITIVE_ASSIGNMENT_PAIRS.has(
        `${segments[index]}:${segments[index + 1]}`,
      )
    ) {
      return true;
    }
  }
  return false;
}

function hasSensitiveAssignment(line) {
  const delimiters = /=>|[:=]/gu;
  for (const delimiter of line.matchAll(delimiters)) {
    let keyEnd = delimiter.index ?? 0;
    while (keyEnd > 0 && /[ \t"'`]/u.test(line[keyEnd - 1])) keyEnd -= 1;
    let keyStart = keyEnd;
    while (
      keyStart > 0 &&
      keyEnd - keyStart < 160 &&
      isAssignmentKeyCharacter(line[keyStart - 1])
    ) {
      keyStart -= 1;
    }
    if (
      keyStart === keyEnd ||
      isAssignmentKeyCharacter(line[keyStart - 1]) ||
      !sensitiveAssignmentKey(line.slice(keyStart, keyEnd))
    ) {
      continue;
    }
    let valueStart = (delimiter.index ?? 0) + delimiter[0].length;
    while (/\s/u.test(line[valueStart])) valueStart += 1;
    if (/["'`]/u.test(line[valueStart])) valueStart += 1;
    const value = line.slice(valueStart);
    if (
      value.length >= 6 &&
      !ASSIGNMENT_PLACEHOLDER.test(value) &&
      /^[^"'\s,;}{]{6,}/u.test(value)
    ) {
      return true;
    }
  }
  return false;
}

function unquotePath(rawPath) {
  const path = rawPath.trim().split("\t")[0];
  if (path === "/dev/null") return null;
  const unquoted =
    path.startsWith('"') && path.endsWith('"') ? path.slice(1, -1) : path;
  return unquoted.replace(/^[ab]\//, "");
}

function sensitivePath(path) {
  return Boolean(
    path && SENSITIVE_PATH_PATTERNS.some((pattern) => pattern.test(path)),
  );
}

function assess(counts, diffRecognized) {
  if (!diffRecognized) {
    return {
      level: "invalid",
      label: "No unified diff was recognized",
      description:
        "Paste output containing diff headers or unified file markers so added lines can be distinguished safely.",
    };
  }
  if (counts.high > 0) {
    return {
      level: "action",
      label: "High-priority exposure cues found",
      description:
        "An added line or destination filename triggered a credential, private-key, or sensitive-file cue. Revoke or rotate any real exposed credential through the appropriate provider workflow.",
    };
  }
  if (counts.medium > 0) {
    return {
      level: "review",
      label: "Potential personal-data cues found",
      description:
        "Contact-data or sensitive-file patterns deserve review before the diff is shared or committed.",
    };
  }
  if (counts.review > 0) {
    return {
      level: "review",
      label: "Diff structure needs review",
      description:
        "The parser found unsupported or bounded content that should be inspected separately.",
    };
  }
  return {
    level: "clear",
    label: "No configured exposure cue observed",
    description:
      "The limited patterns did not flag the added lines. This does not prove that the change contains no secrets or personal data.",
  };
}

export function inspectUnifiedDiff(input) {
  if (typeof input !== "string") {
    throw new TypeError("Git diff input must be text.");
  }
  if (input.length > GIT_DIFF_LIMITS.maxCharacters) {
    throw new RangeError(
      `Diff exceeds the ${GIT_DIFF_LIMITS.maxCharacters.toLocaleString("en-US")}-character local limit.`,
    );
  }
  const lines = input.replace(/\r\n?/g, "\n").split("\n");
  if (lines.length > GIT_DIFF_LIMITS.maxLines) {
    throw new RangeError(
      `Diff exceeds the ${GIT_DIFF_LIMITS.maxLines.toLocaleString("en-US")}-line local limit.`,
    );
  }

  const findings = [];
  const observedCounts = { high: 0, medium: 0, review: 0 };
  const findingCodeCounts = {};
  let truncated = false;
  const priority = { review: 1, medium: 2, high: 3 };
  const add = (finding) => {
    observedCounts[finding.severity] += 1;
    findingCodeCounts[finding.code] =
      (findingCodeCounts[finding.code] || 0) + 1;
    if (findings.length < GIT_DIFF_LIMITS.maxFindings) {
      findings.push(finding);
      return;
    }
    truncated = true;
    const replacementIndex = findings.findIndex(
      (stored) => priority[stored.severity] < priority[finding.severity],
    );
    if (replacementIndex >= 0) findings[replacementIndex] = finding;
  };
  let fileCount = 0;
  let currentFile = 0;
  let currentPath = null;
  let currentNewLine = null;
  let oldLinesRemaining = 0;
  let newLinesRemaining = 0;
  let addedLines = 0;
  let binaryFiles = 0;
  let diffRecognized = false;
  const pathFindingFiles = new Set();

  const startFile = () => {
    fileCount += 1;
    if (fileCount > GIT_DIFF_LIMITS.maxFiles) {
      throw new RangeError(
        `Diff exceeds the ${GIT_DIFF_LIMITS.maxFiles}-file local limit.`,
      );
    }
    currentFile = fileCount;
    currentPath = null;
    currentNewLine = null;
  };

  lines.forEach((line) => {
    if (currentNewLine !== null) {
      if (line.startsWith("+")) {
        addedLines += 1;
        if (addedLines > GIT_DIFF_LIMITS.maxAddedLines) {
          throw new RangeError(
            `Diff exceeds the ${GIT_DIFF_LIMITS.maxAddedLines.toLocaleString("en-US")}-added-line local limit.`,
          );
        }
        const addedContent = line.slice(1);
        LINE_DETECTORS.forEach((detector) => {
          if (detector.pattern.test(addedContent)) {
            add({
              severity: detector.severity,
              code: detector.code,
              file: currentFile || null,
              line: currentNewLine,
              label: detector.label,
              evidence: `[redacted: ${detector.label.toLowerCase()}]`,
            });
          }
        });
        if (hasSensitiveAssignment(addedContent)) {
          add({
            severity: "high",
            code: "generic-credential-assignment",
            file: currentFile || null,
            line: currentNewLine,
            label: "Secret-like variable assignment",
            evidence: "[redacted: secret-like variable assignment]",
          });
        }
        currentNewLine += 1;
        newLinesRemaining -= 1;
      } else if (line.startsWith("-")) {
        oldLinesRemaining -= 1;
      } else if (line.startsWith(" ")) {
        currentNewLine += 1;
        oldLinesRemaining -= 1;
        newLinesRemaining -= 1;
      } else if (line !== "\\ No newline at end of file") {
        currentNewLine = null;
      }
      if (oldLinesRemaining <= 0 && newLinesRemaining <= 0) {
        currentNewLine = null;
      }
      return;
    }

    if (line.startsWith("diff --git ")) {
      diffRecognized = true;
      startFile();
      return;
    }
    if (line.startsWith("--- ")) return;
    if (line.startsWith("+++ ")) {
      diffRecognized = true;
      if (currentFile === 0 || currentPath !== null) startFile();
      currentPath = unquotePath(line.slice(4));
      if (sensitivePath(currentPath) && !pathFindingFiles.has(currentFile)) {
        pathFindingFiles.add(currentFile);
        add({
          severity: "high",
          code: "sensitive-destination-filename",
          file: currentFile,
          line: null,
          label: "Sensitive destination filename",
          evidence: "[redacted filename]",
        });
      }
      return;
    }
    const hunk = line.match(
      /^@@ -\d+(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/,
    );
    if (hunk) {
      diffRecognized = true;
      oldLinesRemaining = hunk[1] === undefined ? 1 : Number(hunk[1]);
      currentNewLine = Number(hunk[2]);
      newLinesRemaining = hunk[3] === undefined ? 1 : Number(hunk[3]);
      return;
    }
    if (/^(?:Binary files .* differ|GIT binary patch)$/.test(line)) {
      binaryFiles += 1;
      add({
        severity: "review",
        code: "binary-patch-not-inspected",
        file: currentFile || null,
        line: null,
        label: "Binary patch not inspected",
        evidence: "[binary content omitted]",
      });
      return;
    }
  });

  const counts = observedCounts;

  return {
    findings,
    counts,
    stats: {
      charactersInspected: input.length,
      linesInspected: lines.length,
      filesInspected: fileCount,
      addedLinesInspected: addedLines,
      binaryFilesSkipped: binaryFiles,
    },
    assessment: assess(counts, diffRecognized),
    recognized: diffRecognized,
    truncated,
    findingCodeCounts,
    limitations: [...GIT_DIFF_LIMITATIONS],
  };
}

export function buildGitDiffExposureReport(result) {
  return {
    tool: "Git Diff Exposure Checker",
    scope: "Counts-only redacted local pattern review",
    assessment: result.assessment.level,
    counts: { ...result.counts },
    stats: { ...result.stats },
    findingCodes:
      result.findingCodeCounts ||
      result.findings.reduce((accumulator, finding) => {
        accumulator[finding.code] = (accumulator[finding.code] || 0) + 1;
        return accumulator;
      }, {}),
    truncated: Boolean(result.truncated),
    limitations: [...GIT_DIFF_LIMITATIONS],
  };
}
