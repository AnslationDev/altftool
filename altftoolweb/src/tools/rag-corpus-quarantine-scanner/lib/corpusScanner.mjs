import {
  MAX_SCAN_LENGTH,
  scanContent,
  visualizeInvisible,
} from "../../indirect-prompt-injection-scanner/lib/scanContent.mjs";

const SEVERITY_RANK = {
  high: 3,
  medium: 2,
  low: 1,
};

const SUPPORTED_EXTENSIONS = new Set([
  "txt",
  "md",
  "markdown",
  "html",
  "htm",
  "csv",
  "json",
]);

const SHORTENER_HOSTS = new Set([
  "bit.ly",
  "buff.ly",
  "cutt.ly",
  "is.gd",
  "ow.ly",
  "rebrand.ly",
  "shorturl.at",
  "t.co",
  "tiny.cc",
  "tinyurl.com",
]);

const LINK_PATTERN =
  /\b(?:https?:\/\/|javascript\s*:|data\s*:\s*text\/html|file\s*:\/\/)[^\s<>"'`)\]}]*/giu;

const HIDDEN_HTML_RULES = [
  {
    id: "html-active-content",
    category: "Hidden or active HTML",
    severity: "high",
    title: "Active or embedded HTML element",
    pattern: /<(?:script|iframe|object|embed)\b[^>]*>/giu,
  },
  {
    id: "html-hidden-container",
    category: "Hidden or active HTML",
    severity: "medium",
    title: "Non-visible HTML container",
    pattern: /<(?:template|noscript)\b[^>]*>/giu,
  },
  {
    id: "html-comment",
    category: "Hidden or active HTML",
    severity: "low",
    title: "HTML comment content",
    pattern: /<!--[\s\S]{1,3000}?-->/giu,
  },
  {
    id: "html-aria-hidden",
    category: "Hidden or active HTML",
    severity: "low",
    title: "ARIA-hidden HTML",
    pattern: /<[^>\r\n]{0,700}\baria-hidden\s*=\s*(?:"true"|'true'|true)[^>\r\n]*>/giu,
  },
];

function normalizeText(value) {
  return typeof value === "string" ? value.replace(/\r\n?/g, "\n") : String(value ?? "");
}

function extensionFromName(name) {
  const match = String(name || "").toLowerCase().match(/\.([a-z0-9]+)$/u);
  return match?.[1] || "";
}

export function detectCorpusFormat(name, text = "") {
  const extension = extensionFromName(name);
  if (extension === "md" || extension === "markdown") return "markdown";
  if (extension === "html" || extension === "htm") return "html";
  if (extension === "csv") return "csv";
  if (extension === "json") return "json";
  if (extension === "txt") return "text";

  const trimmed = normalizeText(text).trim();
  if (/^[{[]/u.test(trimmed)) {
    try {
      JSON.parse(trimmed);
      return "json";
    } catch {
      // Continue with inert text format detection below.
    }
  }
  if (/<(?:!doctype|html|head|body|div|span|p|a|table)\b[^>]*>/iu.test(trimmed)) {
    return "html";
  }
  if (/^(?:#{1,6}\s|>\s|[-*+]\s|\d+\.\s|```)/mu.test(trimmed)) {
    return "markdown";
  }
  return "text";
}

export function isSupportedCorpusFile(name) {
  return SUPPORTED_EXTENSIONS.has(extensionFromName(name));
}

export function safeDisplayFilename(name) {
  return visualizeInvisible(String(name || "Unnamed file"))
    .replace(/[\r\n\t]+/gu, " ")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/gu, "�");
}

export function normalizeForDuplicate(value) {
  return normalizeText(value)
    .normalize("NFKC")
    .replace(/[\u00ad\u034f\u061c\u180e\u200b-\u200d\u202a-\u202e\u2060\u2066-\u2069\ufeff]/gu, "")
    .replace(/<[^>]{0,2000}>/gu, " ")
    .replace(/&(?:nbsp|ensp|emsp);/giu, " ")
    .replace(/&amp;/giu, "&")
    .replace(/\s+/gu, " ")
    .trim()
    .toLocaleLowerCase("en-US");
}

function addSignal(signals, signal) {
  const existing = signals.get(signal.ruleId);
  if (existing) {
    existing.count += signal.count || 1;
    if (SEVERITY_RANK[signal.severity] > SEVERITY_RANK[existing.severity]) {
      existing.severity = signal.severity;
    }
    return;
  }
  signals.set(signal.ruleId, {
    ruleId: signal.ruleId,
    category: signal.category,
    severity: signal.severity,
    title: signal.title,
    count: signal.count || 1,
  });
}

function collectPatternSignals(text, rules, signals) {
  for (const rule of rules) {
    rule.pattern.lastIndex = 0;
    let count = 0;
    while (rule.pattern.exec(text) && count < 50) {
      count += 1;
      if (rule.pattern.lastIndex === 0) rule.pattern.lastIndex += 1;
    }
    if (count) addSignal(signals, { ...rule, ruleId: rule.id, count });
  }
}

function isPrivateIpv4(hostname) {
  if (!/^\d{1,3}(?:\.\d{1,3}){3}$/u.test(hostname)) return false;
  const parts = hostname.split(".").map(Number);
  if (parts.some((part) => part > 255)) return false;
  return (
    parts[0] === 10 ||
    parts[0] === 127 ||
    parts[0] === 0 ||
    (parts[0] === 169 && parts[1] === 254) ||
    (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
    (parts[0] === 192 && parts[1] === 168)
  );
}

function inspectHttpUrl(rawUrl, signals) {
  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    addSignal(signals, {
      ruleId: "malformed-url",
      category: "Suspicious link",
      severity: "low",
      title: "Malformed URL-like text",
    });
    return;
  }

  const hostname = parsed.hostname.toLowerCase().replace(/\.$/u, "");
  if (parsed.username || parsed.password) {
    addSignal(signals, {
      ruleId: "url-embedded-credentials",
      category: "Suspicious link",
      severity: "high",
      title: "URL contains embedded credentials",
    });
  }
  if (parsed.protocol === "http:") {
    addSignal(signals, {
      ruleId: "insecure-http-link",
      category: "Suspicious link",
      severity: "low",
      title: "Unencrypted HTTP link",
    });
  }
  if (
    hostname === "localhost" ||
    hostname === "::1" ||
    hostname.endsWith(".localhost") ||
    isPrivateIpv4(hostname)
  ) {
    addSignal(signals, {
      ruleId: "local-network-link",
      category: "Suspicious link",
      severity: "medium",
      title: "Local or private-network link",
    });
  } else if (/^\d{1,3}(?:\.\d{1,3}){3}$/u.test(hostname)) {
    addSignal(signals, {
      ruleId: "ip-address-link",
      category: "Suspicious link",
      severity: "medium",
      title: "IP-address URL",
    });
  }
  if (hostname.includes("xn--")) {
    addSignal(signals, {
      ruleId: "punycode-link",
      category: "Suspicious link",
      severity: "medium",
      title: "Punycode hostname",
    });
  }
  if (SHORTENER_HOSTS.has(hostname)) {
    addSignal(signals, {
      ruleId: "shortened-link",
      category: "Suspicious link",
      severity: "low",
      title: "URL-shortener link",
    });
  }
  if (/\.(?:apk|bat|cmd|com|dmg|exe|iso|jar|msi|ps1|scr)(?:$|[?#])/iu.test(parsed.pathname)) {
    addSignal(signals, {
      ruleId: "executable-link",
      category: "Suspicious link",
      severity: "medium",
      title: "Link targets an executable file type",
    });
  }

  for (const key of parsed.searchParams.keys()) {
    if (/^(?:access[_-]?token|token|api[_-]?key|auth|credential|password|secret|session)$/iu.test(key)) {
      addSignal(signals, {
        ruleId: "sensitive-url-parameter",
        category: "Suspicious link",
        severity: "medium",
        title: "Sensitive-looking URL parameter",
      });
      break;
    }
  }
}

export function scanSuspiciousLinks(value) {
  const text = normalizeText(value).slice(0, MAX_SCAN_LENGTH);
  const signals = new Map();
  LINK_PATTERN.lastIndex = 0;
  let match;
  let inspected = 0;

  while ((match = LINK_PATTERN.exec(text)) && inspected < 100) {
    const rawUrl = match[0].replace(/[.,;:!?]+$/u, "");
    const compactScheme = rawUrl.replace(/\s+/gu, "").toLowerCase();
    inspected += 1;
    if (
      compactScheme.startsWith("javascript:") ||
      compactScheme.startsWith("data:text/html") ||
      compactScheme.startsWith("file://")
    ) {
      addSignal(signals, {
        ruleId: "active-or-local-scheme",
        category: "Suspicious link",
        severity: "high",
        title: "Active or local URL scheme",
      });
    } else {
      inspectHttpUrl(rawUrl, signals);
    }
  }

  return {
    inspected,
    signals: [...signals.values()],
    capped: inspected >= 100,
  };
}

function classificationForSignals(signals) {
  if (signals.some((signal) => signal.severity === "high")) {
    return {
      id: "quarantine",
      label: "Quarantine suggested",
      description:
        "At least one high-priority deterministic signal needs human review before indexing.",
    };
  }
  if (signals.length) {
    return {
      id: "review",
      label: "Review suggested",
      description:
        "One or more ambiguous, quality, or context-dependent signals were detected.",
    };
  }
  return {
    id: "clear",
    label: "No configured signals",
    description:
      "No configured rule matched. This does not prove that the file is safe to index.",
  };
}

function analyzeFile(entry, index) {
  const rawText = typeof entry.text === "string" ? entry.text : String(entry.text ?? "");
  const text = normalizeText(rawText);
  const format = detectCorpusFormat(entry.name, text);
  const scannerResult = scanContent(
    text,
    format === "json" ? "text" : format,
  );
  const signals = new Map();

  for (const finding of scannerResult.findings) {
    addSignal(signals, {
      ruleId: finding.ruleId,
      category: finding.category,
      severity: finding.severity,
      title: finding.title,
    });
  }
  for (const linkSignal of scanSuspiciousLinks(text).signals) {
    addSignal(signals, linkSignal);
  }
  if (format === "html") collectPatternSignals(text.slice(0, MAX_SCAN_LENGTH), HIDDEN_HTML_RULES, signals);

  if (format === "json" && text.trim()) {
    try {
      JSON.parse(text);
    } catch {
      addSignal(signals, {
        ruleId: "invalid-json",
        category: "Indexing quality",
        severity: "medium",
        title: "Invalid JSON structure",
      });
    }
  }
  if (!text.trim()) {
    addSignal(signals, {
      ruleId: "empty-file",
      category: "Indexing quality",
      severity: "medium",
      title: "Empty file",
    });
  }
  if (scannerResult.truncated) {
    addSignal(signals, {
      ruleId: "scan-truncated",
      category: "Scan coverage",
      severity: "medium",
      title: "File exceeded the per-file scan limit",
    });
  }

  const compactSignals = [...signals.values()].sort(
    (left, right) =>
      SEVERITY_RANK[right.severity] - SEVERITY_RANK[left.severity] ||
      left.title.localeCompare(right.title),
  );

  return {
    id: String(entry.id ?? `file-${index + 1}`),
    name: String(entry.name || `File ${index + 1}`),
    size: Number.isFinite(Number(entry.size)) ? Number(entry.size) : text.length,
    format,
    characterCount: rawText.length,
    scannedCharacters: scannerResult.scannedCharacters,
    lineCount: text ? text.split("\n").length : 0,
    truncated: scannerResult.truncated,
    signals: compactSignals,
    classification: classificationForSignals(compactSignals),
    duplicateKinds: [],
    _exactKey: rawText,
    _normalizedKey: normalizeForDuplicate(text),
  };
}

function duplicateGroups(files, keyName) {
  const buckets = new Map();
  files.forEach((file) => {
    const key = file[keyName];
    if (!key) return;
    const members = buckets.get(key) || [];
    members.push(file.id);
    buckets.set(key, members);
  });

  return [...buckets.entries()]
    .filter(([, members]) => members.length > 1)
    .map(([, memberIds], index) => ({
      id: `${keyName === "_exactKey" ? "exact" : "normalized"}-${index + 1}`,
      memberIds,
    }));
}

function duplicateMemberIds(groups) {
  return new Set(groups.flatMap((group) => group.memberIds));
}

function summarize(files, exactDuplicateGroups, normalizedDuplicateGroups) {
  const classifications = { quarantine: 0, review: 0, clear: 0 };
  const severities = { high: 0, medium: 0, low: 0 };
  const categories = {};
  let totalSignals = 0;

  for (const file of files) {
    classifications[file.classification.id] += 1;
    for (const signal of file.signals) {
      totalSignals += signal.count;
      severities[signal.severity] += signal.count;
      categories[signal.category] = (categories[signal.category] || 0) + signal.count;
    }
  }

  return {
    fileCount: files.length,
    totalCharacters: files.reduce((total, file) => total + file.characterCount, 0),
    totalSignals,
    classifications,
    severities,
    categories,
    exactDuplicateGroupCount: exactDuplicateGroups.length,
    exactDuplicateMemberCount: exactDuplicateGroups.reduce(
      (total, group) => total + group.memberIds.length,
      0,
    ),
    normalizedDuplicateGroupCount: normalizedDuplicateGroups.length,
    normalizedDuplicateMemberCount: normalizedDuplicateGroups.reduce(
      (total, group) => total + group.memberIds.length,
      0,
    ),
  };
}

export function analyzeCorpusFiles(entries = []) {
  const files = (Array.isArray(entries) ? entries : []).map(analyzeFile);
  const exactDuplicateGroups = duplicateGroups(files, "_exactKey");
  const normalizedDuplicateGroups = duplicateGroups(files, "_normalizedKey").filter(
    (group) => {
      const exactKeys = new Set(
        group.memberIds.map(
          (memberId) => files.find((file) => file.id === memberId)?._exactKey,
        ),
      );
      return exactKeys.size > 1;
    },
  );
  const exactMembers = duplicateMemberIds(exactDuplicateGroups);
  const normalizedMembers = duplicateMemberIds(normalizedDuplicateGroups);

  const publicFiles = files.map((file) => {
    const duplicateKinds = [];
    if (exactMembers.has(file.id)) duplicateKinds.push("exact");
    if (normalizedMembers.has(file.id)) duplicateKinds.push("normalized");
    const signals = [...file.signals];
    if (duplicateKinds.includes("exact")) {
      signals.push({
        ruleId: "exact-duplicate",
        category: "Duplicate content",
        severity: "low",
        title: "Exact duplicate",
        count: 1,
      });
    }
    if (duplicateKinds.includes("normalized")) {
      signals.push({
        ruleId: "normalized-duplicate",
        category: "Duplicate content",
        severity: "low",
        title: "Normalized duplicate",
        count: 1,
      });
    }
    const classification = classificationForSignals(signals);
    const { _exactKey, _normalizedKey, ...safeFile } = file;
    return {
      ...safeFile,
      duplicateKinds,
      signals,
      classification,
    };
  });

  return {
    files: publicFiles,
    exactDuplicateGroups,
    normalizedDuplicateGroups,
    summary: summarize(publicFiles, exactDuplicateGroups, normalizedDuplicateGroups),
    limits: {
      perFileScanCharacters: MAX_SCAN_LENGTH,
    },
  };
}

export function buildCountsOnlyReport(result) {
  const summary = result?.summary || {
    fileCount: 0,
    totalCharacters: 0,
    totalSignals: 0,
    classifications: { quarantine: 0, review: 0, clear: 0 },
    severities: { high: 0, medium: 0, low: 0 },
    categories: {},
    exactDuplicateGroupCount: 0,
    exactDuplicateMemberCount: 0,
    normalizedDuplicateGroupCount: 0,
    normalizedDuplicateMemberCount: 0,
  };
  const lines = [
    "RAG Corpus Quarantine Scan — Counts-Only Report",
    "================================================",
    `Files reviewed: ${summary.fileCount}`,
    `Characters represented: ${summary.totalCharacters}`,
    `Files with quarantine suggested: ${summary.classifications.quarantine}`,
    `Files with review suggested: ${summary.classifications.review}`,
    `Files with no configured signals: ${summary.classifications.clear}`,
    "",
    `Signals: ${summary.totalSignals}`,
    `High-priority signals: ${summary.severities.high}`,
    `Medium-priority signals: ${summary.severities.medium}`,
    `Low-priority signals: ${summary.severities.low}`,
    "",
    `Exact duplicate groups: ${summary.exactDuplicateGroupCount} (${summary.exactDuplicateMemberCount} members)`,
    `Normalized duplicate groups: ${summary.normalizedDuplicateGroupCount} (${summary.normalizedDuplicateMemberCount} members)`,
    "",
    "Signal categories",
  ];

  const categoryEntries = Object.entries(summary.categories).sort(([left], [right]) =>
    left.localeCompare(right),
  );
  if (!categoryEntries.length) lines.push("- None");
  categoryEntries.forEach(([category, count]) => lines.push(`- ${category}: ${count}`));

  lines.push(
    "",
    "Important: These are deterministic review signals, not proof that a file is malicious or safe.",
    "Privacy: This report contains counts only. It excludes filenames, corpus text, matched snippets, and URLs.",
    "Processing: Files were read as inert text locally. The scanner did not render HTML, follow links, fetch resources, upload content, or persist the corpus.",
  );
  return lines.join("\n");
}

export { MAX_SCAN_LENGTH, SUPPORTED_EXTENSIONS };
