const MAX_SCAN_LENGTH = 500_000;
const MAX_FINDINGS = 200;

const SEVERITY_WEIGHT = {
  high: 18,
  medium: 9,
  low: 4,
};

const INVISIBLE_NAMES = new Map([
  ["\u00ad", "SOFT HYPHEN"],
  ["\u034f", "COMBINING GRAPHEME JOINER"],
  ["\u061c", "ARABIC LETTER MARK"],
  ["\u180e", "MONGOLIAN VOWEL SEPARATOR"],
  ["\u200b", "ZERO WIDTH SPACE"],
  ["\u200c", "ZERO WIDTH NON-JOINER"],
  ["\u200d", "ZERO WIDTH JOINER"],
  ["\u2060", "WORD JOINER"],
  ["\ufeff", "ZERO WIDTH NO-BREAK SPACE"],
]);

const BIDI_NAMES = new Map([
  ["\u202a", "LEFT-TO-RIGHT EMBEDDING"],
  ["\u202b", "RIGHT-TO-LEFT EMBEDDING"],
  ["\u202c", "POP DIRECTIONAL FORMATTING"],
  ["\u202d", "LEFT-TO-RIGHT OVERRIDE"],
  ["\u202e", "RIGHT-TO-LEFT OVERRIDE"],
  ["\u2066", "LEFT-TO-RIGHT ISOLATE"],
  ["\u2067", "RIGHT-TO-LEFT ISOLATE"],
  ["\u2068", "FIRST STRONG ISOLATE"],
  ["\u2069", "POP DIRECTIONAL ISOLATE"],
]);

const TEXT_RULES = [
  {
    id: "instruction-override",
    category: "Instruction override",
    severity: "high",
    title: "Instruction override phrase",
    explanation:
      "The text asks a model to ignore, replace, or override instructions from a higher-priority source.",
    pattern:
      /\b(?:ignore|disregard|forget|override|bypass)\s+(?:all\s+)?(?:the\s+)?(?:previous|prior|above|earlier|system|developer)\s+(?:instructions?|messages?|rules?|prompts?)\b/giu,
  },
  {
    id: "instruction-supersede",
    category: "Instruction override",
    severity: "high",
    title: "Claimed replacement instruction",
    explanation:
      "The content presents itself as a new system or developer instruction, which untrusted content should not do.",
    pattern:
      /\b(?:new|updated|replacement|real)\s+(?:system|developer|administrator)\s+(?:message|instruction|prompt|policy)\b/giu,
  },
  {
    id: "instruction-obey",
    category: "Instruction override",
    severity: "medium",
    title: "Command-following request",
    explanation:
      "The text directly asks an agent to obey or execute embedded commands.",
    pattern:
      /\b(?:follow|obey|execute|perform)\s+(?:only\s+)?(?:these|my|the\s+following|the\s+hidden)\s+(?:instructions?|commands?|steps?|tasks?)\b/giu,
  },
  {
    id: "conceal-behavior",
    category: "Instruction override",
    severity: "medium",
    title: "Concealment request",
    explanation:
      "The text asks the model to hide an action or avoid telling the user about it.",
    pattern:
      /\b(?:do\s+not|don['’]t|never)\s+(?:mention|reveal|tell|show|disclose|acknowledge)\b/giu,
  },
  {
    id: "role-marker",
    category: "Role impersonation",
    severity: "medium",
    title: "Suspicious role marker",
    explanation:
      "The content contains a system, developer, assistant, or tool role marker that may try to impersonate trusted context.",
    pattern:
      /(?:^|[\r\n])\s*(?:#{1,6}\s*)?(?:system|developer|assistant|tool)\s*(?:message)?\s*:/gimu,
  },
  {
    id: "special-role-token",
    category: "Role impersonation",
    severity: "high",
    title: "Model control token",
    explanation:
      "The content includes a model-style role token that should not normally appear in untrusted source data.",
    pattern:
      /(?:<\|(?:system|developer|assistant|tool)(?:_start|_end)?\|>|\[(?:system|developer|assistant|tool)\])/giu,
  },
  {
    id: "secret-disclosure",
    category: "Data exfiltration",
    severity: "high",
    title: "Sensitive-data disclosure request",
    explanation:
      "The text asks for hidden prompts, credentials, secrets, tokens, cookies, or private data to be revealed.",
    pattern:
      /\b(?:reveal|print|return|show|expose|leak|disclose|extract)\b[\s\S]{0,80}\b(?:system\s+prompt|developer\s+message|api[\s_-]*keys?|credentials?|passwords?|secrets?|access\s+tokens?|cookies?|environment\s+variables?|private\s+data)\b/giu,
  },
  {
    id: "secret-transmission",
    category: "Data exfiltration",
    severity: "high",
    title: "Sensitive-data transmission request",
    explanation:
      "The text asks for potentially sensitive information to be sent, uploaded, posted, or forwarded elsewhere.",
    pattern:
      /\b(?:send|upload|post|transmit|forward|exfiltrate)\b[\s\S]{0,100}\b(?:secrets?|tokens?|credentials?|passwords?|api[\s_-]*keys?|cookies?|conversation|chat\s+history|system\s+prompt|private\s+data|environment\s+variables?)\b/giu,
  },
  {
    id: "tool-activation",
    category: "Tool activation",
    severity: "medium",
    title: "Tool-use request",
    explanation:
      "The content asks an agent to call a tool, execute a command, browse, or make a network request.",
    pattern:
      /\b(?:call|invoke|use|run|execute|launch)\b[\s\S]{0,48}\b(?:tool|function|plugin|shell|terminal|command|browser|http\s+request|curl|wget)\b/giu,
  },
  {
    id: "external-action",
    category: "Tool activation",
    severity: "medium",
    title: "External action request",
    explanation:
      "The text tells an agent to contact an external destination or make a state-changing request.",
    pattern:
      /\b(?:open|visit|fetch|download|submit|publish|delete|purchase)\b[\s\S]{0,56}\b(?:https?:\/\/|url|website|endpoint|server|file|record|account)\b/giu,
  },
];

const HIDDEN_MARKUP_RULES = [
  {
    id: "html-hidden-style",
    severity: "high",
    title: "CSS-hidden HTML",
    explanation:
      "An HTML tag uses styling that can conceal text from a reader while leaving it available to an automated parser.",
    pattern:
      /<[^>\r\n]{0,700}\bstyle\s*=\s*(?:"[^"]*(?:display\s*:\s*none|visibility\s*:\s*hidden|opacity\s*:\s*0(?![.\d])|font-size\s*:\s*0|color\s*:\s*transparent|text-indent\s*:\s*-\d)[^"]*"|'[^']*(?:display\s*:\s*none|visibility\s*:\s*hidden|opacity\s*:\s*0(?![.\d])|font-size\s*:\s*0|color\s*:\s*transparent|text-indent\s*:\s*-\d)[^']*')[^>\r\n]{0,700}>/giu,
  },
  {
    id: "html-hidden-attribute",
    severity: "medium",
    title: "Hidden HTML element",
    explanation:
      "An HTML element uses the hidden attribute. Hidden content deserves review when it is supplied to an AI system.",
    pattern: /<[^>\r\n]{0,700}\shidden(?:\s|=|\/?>)[^>\r\n]{0,700}>/giu,
  },
  {
    id: "html-visually-hidden-class",
    severity: "low",
    title: "Visually hidden CSS class",
    explanation:
      "An element uses a class commonly intended to visually hide content; this is often legitimate accessibility markup.",
    pattern:
      /<[^>\r\n]{0,700}\bclass\s*=\s*(?:"[^"]*\b(?:sr-only|visually-hidden|screen-reader-only)\b[^"]*"|'[^']*\b(?:sr-only|visually-hidden|screen-reader-only)\b[^']*')[^>\r\n]{0,700}>/giu,
  },
];

function normalizeInput(value) {
  return typeof value === "string" ? value.replace(/\r\n?/g, "\n") : String(value ?? "");
}

function indexToLocation(text, index) {
  const before = text.slice(0, index);
  const lines = before.split("\n");
  return {
    line: lines.length,
    column: lines.at(-1).length + 1,
  };
}

function escapeCodePoint(character) {
  const codePoint = character.codePointAt(0).toString(16).toUpperCase().padStart(4, "0");
  const name = INVISIBLE_NAMES.get(character) || BIDI_NAMES.get(character) || "CONTROL";
  return `[U+${codePoint} ${name}]`;
}

export function visualizeInvisible(value) {
  return normalizeInput(value)
    .replace(/[\u00ad\u034f\u061c\u180e\u200b-\u200d\u2060\ufeff]/gu, escapeCodePoint)
    .replace(/[\u202a-\u202e\u2066-\u2069]/gu, escapeCodePoint)
    .replace(/\t/gu, "⇥");
}

function evidenceAround(text, index, length) {
  const radius = 70;
  const start = Math.max(0, index - radius);
  const end = Math.min(text.length, index + Math.max(length, 1) + radius);
  const prefix = start > 0 ? "…" : "";
  const suffix = end < text.length ? "…" : "";
  return `${prefix}${visualizeInvisible(text.slice(start, end)).replace(/\n/g, " ↵ ")}${suffix}`;
}

function makeFinding({ rule, text, index, length, match }) {
  const location = indexToLocation(text, index);
  return {
    id: `${rule.id}-${index}`,
    ruleId: rule.id,
    category: rule.category || "Hidden markup",
    severity: rule.severity,
    title: rule.title,
    explanation: rule.explanation,
    line: location.line,
    column: location.column,
    matchLength: length,
    evidence: evidenceAround(text, index, length),
    matchedText: visualizeInvisible(match).slice(0, 180),
  };
}

function collectRuleMatches(text, rule, findings) {
  rule.pattern.lastIndex = 0;
  let match;

  while ((match = rule.pattern.exec(text)) && findings.length < MAX_FINDINGS) {
    findings.push(
      makeFinding({
        rule,
        text,
        index: match.index,
        length: match[0].length,
        match: match[0],
      }),
    );

    if (match[0].length === 0) rule.pattern.lastIndex += 1;
  }
}

function hiddenCommentHasInstruction(comment) {
  const lowered = comment.toLowerCase();
  return [
    "ignore ",
    "disregard ",
    "system:",
    "developer:",
    "assistant:",
    "reveal ",
    "send ",
    "upload ",
    "execute ",
    "call ",
    "invoke ",
    "secret",
    "credential",
    "system prompt",
  ].some((needle) => lowered.includes(needle));
}

function collectHiddenComments(text, findings) {
  const commentRules = [
    {
      id: "html-instruction-comment",
      pattern: /<!--([\s\S]{0,3000}?)-->/giu,
      severity: "high",
      title: "Instruction-like HTML comment",
      explanation:
        "An HTML comment contains instruction or sensitive-data language hidden from the rendered page.",
    },
    {
      id: "markdown-instruction-comment",
      pattern: /^\s*\[\/\/\]:\s*#\s*\((.{0,2000})\)\s*$/gimu,
      severity: "high",
      title: "Instruction-like Markdown comment",
      explanation:
        "A Markdown comment contains instruction or sensitive-data language hidden from normal rendered output.",
    },
  ];

  for (const rule of commentRules) {
    rule.pattern.lastIndex = 0;
    let match;
    while ((match = rule.pattern.exec(text)) && findings.length < MAX_FINDINGS) {
      if (!hiddenCommentHasInstruction(match[1] || "")) continue;
      findings.push(
        makeFinding({
          rule: { ...rule, category: "Hidden markup" },
          text,
          index: match.index,
          length: match[0].length,
          match: match[0],
        }),
      );
      if (match[0].length === 0) rule.pattern.lastIndex += 1;
    }
  }
}

function collectInvisibleCharacters(text, findings) {
  const grouped = [
    {
      id: "zero-width-character",
      category: "Hidden Unicode",
      severity: "medium",
      title: "Invisible Unicode character",
      explanation:
        "Zero-width or formatting characters can conceal or split instruction keywords. Some languages use these legitimately.",
      pattern: /[\u00ad\u034f\u061c\u180e\u200b-\u200d\u2060\ufeff]/gu,
    },
    {
      id: "bidi-control",
      category: "Hidden Unicode",
      severity: "high",
      title: "Bidirectional text control",
      explanation:
        "A bidirectional control can change visual text order and make source text differ from what a reader sees.",
      pattern: /[\u202a-\u202e\u2066-\u2069]/gu,
    },
  ];

  for (const rule of grouped) {
    rule.pattern.lastIndex = 0;
    let match;
    const firstByCharacter = new Set();
    while ((match = rule.pattern.exec(text)) && findings.length < MAX_FINDINGS) {
      if (firstByCharacter.has(match[0])) continue;
      firstByCharacter.add(match[0]);
      findings.push(
        makeFinding({
          rule,
          text,
          index: match.index,
          length: match[0].length,
          match: match[0],
        }),
      );
    }
  }
}

export function detectFormat(value) {
  const text = normalizeInput(value).trim();
  if (!text) return "text";
  if (/<(?:!doctype|html|head|body|div|span|p|a|table|script|style)\b[^>]*>/iu.test(text)) {
    return "html";
  }
  if (
    /^(?:#{1,6}\s|>\s|[-*+]\s|\d+\.\s|```)/mu.test(text) ||
    /\[[^\]\n]+\]\([^)]+\)/u.test(text)
  ) {
    return "markdown";
  }

  const nonEmptyLines = text.split("\n").filter(Boolean).slice(0, 8);
  if (nonEmptyLines.length >= 2) {
    const commaCounts = nonEmptyLines.map((line) => (line.match(/,/g) || []).length);
    if (commaCounts[0] > 0 && commaCounts.every((count) => count === commaCounts[0])) {
      return "csv";
    }
  }

  return "text";
}

function dedupeOverlappingFindings(findings) {
  const sorted = [...findings].sort(
    (left, right) =>
      left.line - right.line ||
      left.column - right.column ||
      SEVERITY_WEIGHT[right.severity] - SEVERITY_WEIGHT[left.severity],
  );
  const seen = new Set();
  return sorted.filter((finding) => {
    const key = `${finding.ruleId}:${finding.line}:${finding.column}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function riskLevel(score, severityCounts, categoryCount) {
  if (severityCounts.high >= 2 || (severityCounts.high >= 1 && categoryCount >= 3) || score >= 45) {
    return {
      id: "elevated",
      label: "Elevated review priority",
      description:
        "Multiple or high-impact signals appear together. Isolate this content and review it before giving it to a tool-using AI.",
    };
  }
  if (severityCounts.high >= 1 || severityCounts.medium >= 2 || score >= 18) {
    return {
      id: "review",
      label: "Review recommended",
      description:
        "One or more patterns deserve human review before this content is included in an AI context.",
    };
  }
  if (score > 0) {
    return {
      id: "low",
      label: "Limited signals",
      description:
        "A small number of weak or ambiguous patterns were found. Check their surrounding context.",
    };
  }
  return {
    id: "none",
    label: "No configured signals found",
    description:
      "The scanner did not match its configured rules. This does not prove that the content is safe.",
  };
}

export function scanContent(value, selectedFormat = "auto") {
  const originalText = normalizeInput(value);
  const truncated = originalText.length > MAX_SCAN_LENGTH;
  const text = originalText.slice(0, MAX_SCAN_LENGTH);
  const findings = [];

  for (const rule of TEXT_RULES) collectRuleMatches(text, rule, findings);
  for (const rule of HIDDEN_MARKUP_RULES) collectRuleMatches(text, rule, findings);
  collectHiddenComments(text, findings);
  collectInvisibleCharacters(text, findings);

  const uniqueFindings = dedupeOverlappingFindings(findings).slice(0, MAX_FINDINGS);
  const severityCounts = { high: 0, medium: 0, low: 0 };
  const categoryCounts = {};

  for (const finding of uniqueFindings) {
    severityCounts[finding.severity] += 1;
    categoryCounts[finding.category] = (categoryCounts[finding.category] || 0) + 1;
  }

  const rawScore = uniqueFindings.reduce(
    (total, finding) => total + SEVERITY_WEIGHT[finding.severity],
    0,
  );
  const score = Math.min(100, rawScore);
  const level = riskLevel(score, severityCounts, Object.keys(categoryCounts).length);

  return {
    format: selectedFormat === "auto" ? detectFormat(text) : selectedFormat,
    selectedFormat,
    scannedCharacters: text.length,
    originalCharacters: originalText.length,
    lineCount: text ? text.split("\n").length : 0,
    truncated,
    capped: findings.length >= MAX_FINDINGS,
    findings: uniqueFindings,
    severityCounts,
    categoryCounts,
    score,
    level,
  };
}

export function buildScanReport(result) {
  const lines = [
    "Indirect Prompt Injection Scan",
    "================================",
    `Format: ${result.format.toUpperCase()}`,
    `Scanned: ${result.scannedCharacters.toLocaleString("en-US")} characters across ${result.lineCount.toLocaleString("en-US")} lines`,
    `Review level: ${result.level.label}`,
    `Heuristic score: ${result.score}/100`,
    `Signals: ${result.findings.length} (${result.severityCounts.high} high, ${result.severityCounts.medium} medium, ${result.severityCounts.low} low)`,
    "",
    "Important: Matches are review signals, not proof that content is malicious or safe.",
    "",
  ];

  if (result.truncated) {
    lines.push(
      `Note: The input was longer than ${MAX_SCAN_LENGTH.toLocaleString("en-US")} characters; only the first portion was scanned.`,
      "",
    );
  }

  if (!result.findings.length) {
    lines.push("No configured signals were found.");
  } else {
    result.findings.forEach((finding, index) => {
      lines.push(
        `${index + 1}. [${finding.severity.toUpperCase()}] ${finding.title}`,
        `   Category: ${finding.category}`,
        `   Location: line ${finding.line}, column ${finding.column}`,
        `   Why review: ${finding.explanation}`,
        `   Evidence: ${finding.evidence}`,
        "",
      );
    });
  }

  lines.push(
    "Suggested review steps",
    "- Treat source content as data, not instructions.",
    "- Remove or neutralize hidden markup and control characters.",
    "- Restrict tool, network, filesystem, and secret access before testing.",
    "- Confirm findings in the original source and its trusted rendering.",
    "",
    "Privacy: This report was generated locally from pasted text. The scanner does not fetch, execute, upload, persist, or share the content.",
  );

  return lines.join("\n");
}

export { MAX_FINDINGS, MAX_SCAN_LENGTH };
