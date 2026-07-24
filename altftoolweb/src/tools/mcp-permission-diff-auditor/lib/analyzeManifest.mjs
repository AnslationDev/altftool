const RISK_RULES = [
  {
    id: "destructive",
    label: "Destructive action",
    severity: "high",
    patterns: ["delete", "remove", "destroy", "purge", "truncate", "overwrite", "drop table"],
  },
  {
    id: "execution",
    label: "Code or shell execution",
    severity: "high",
    patterns: ["shell", "exec", "command", "terminal", "process", "script", "run code", "subprocess"],
  },
  {
    id: "external-write",
    label: "External write or message",
    severity: "high",
    patterns: ["send email", "send message", "post", "publish", "purchase", "payment", "transfer", "deploy"],
  },
  {
    id: "filesystem-write",
    label: "Filesystem write",
    severity: "medium",
    patterns: ["write file", "edit file", "create file", "rename file", "move file", "filesystem"],
  },
  {
    id: "network",
    label: "Network access",
    severity: "medium",
    patterns: ["network", "http", "url", "fetch", "request", "webhook", "upload", "download", "domain"],
  },
  {
    id: "sensitive-data",
    label: "Sensitive data access",
    severity: "medium",
    patterns: ["secret", "credential", "password", "token", "cookie", "environment", "private key", "oauth"],
  },
  {
    id: "broad-read",
    label: "Broad read access",
    severity: "low",
    patterns: ["read file", "list directory", "search files", "all files", "read resource", "database"],
  },
];

const SEVERITY_WEIGHT = {
  high: 5,
  medium: 3,
  low: 1,
};

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeTool(rawTool, fallbackName = "") {
  const tool = isObject(rawTool) ? rawTool : {};
  const name = String(tool.name || tool.id || tool.title || fallbackName || "Unnamed tool");

  return {
    name,
    description: String(tool.description || tool.summary || ""),
    inputSchema: tool.inputSchema || tool.input_schema || tool.schema || tool.parameters || {},
    annotations: tool.annotations || tool.permissions || tool.capabilities || {},
    raw: tool,
  };
}

function collectToolsFromValue(value, output, path = "manifest", depth = 0) {
  if (depth > 7 || !value) return;

  if (Array.isArray(value)) {
    value.forEach((item, index) => collectToolsFromValue(item, output, `${path}[${index}]`, depth + 1));
    return;
  }

  if (!isObject(value)) return;

  for (const [key, nested] of Object.entries(value)) {
    const nextPath = `${path}.${key}`;
    if (key.toLowerCase() === "tools") {
      if (Array.isArray(nested)) {
        nested.forEach((tool, index) => {
          if (isObject(tool)) output.push(normalizeTool(tool, `${nextPath}[${index}]`));
        });
      } else if (isObject(nested)) {
        for (const [toolName, toolValue] of Object.entries(nested)) {
          output.push(normalizeTool(toolValue, toolName));
        }
      }
    }
    collectToolsFromValue(nested, output, nextPath, depth + 1);
  }
}

function sortValue(value) {
  if (Array.isArray(value)) return value.map(sortValue);
  if (!isObject(value)) return value;

  return Object.fromEntries(
    Object.keys(value)
      .sort((left, right) => left.localeCompare(right))
      .map((key) => [key, sortValue(value[key])]),
  );
}

function stableStringify(value) {
  return JSON.stringify(sortValue(value));
}

function getSchemaFields(schema) {
  if (!isObject(schema)) return [];
  const properties = isObject(schema.properties) ? schema.properties : {};
  return Object.keys(properties).sort((left, right) => left.localeCompare(right));
}

function getRequiredFields(schema) {
  if (!isObject(schema) || !Array.isArray(schema.required)) return [];
  return [...new Set(schema.required.map(String))].sort((left, right) => left.localeCompare(right));
}

export function parseManifest(text) {
  const source = String(text || "").trim();
  if (!source) return { ok: false, error: "Paste a JSON manifest to begin." };

  try {
    const value = JSON.parse(source);
    if (!isObject(value) && !Array.isArray(value)) {
      return { ok: false, error: "Manifest root must be a JSON object or array." };
    }
    return { ok: true, value };
  } catch (error) {
    return { ok: false, error: `Invalid JSON: ${error.message}` };
  }
}

export function extractTools(manifest) {
  const collected = [];
  collectToolsFromValue(manifest, collected);

  const unique = new Map();
  for (const tool of collected) {
    if (!unique.has(tool.name)) unique.set(tool.name, tool);
  }
  return [...unique.values()].sort((left, right) => left.name.localeCompare(right.name));
}

export function analyzeToolRisk(tool) {
  const searchable = ` ${stableStringify({
    name: tool.name,
    description: tool.description,
    inputSchema: tool.inputSchema,
    annotations: tool.annotations,
  })
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()} `;

  const signals = RISK_RULES.filter((rule) =>
    rule.patterns.some((pattern) => searchable.includes(` ${pattern} `)),
  );
  const score = signals.reduce((total, signal) => total + SEVERITY_WEIGHT[signal.severity], 0);
  const level = signals.some((signal) => signal.severity === "high")
    ? "high"
    : signals.some((signal) => signal.severity === "medium")
      ? "medium"
      : signals.length
        ? "low"
        : "none";

  return { level, score, signals };
}

function describeChange(previous, next) {
  const changes = [];
  if (previous.description !== next.description) changes.push("Description changed");

  const previousFields = getSchemaFields(previous.inputSchema);
  const nextFields = getSchemaFields(next.inputSchema);
  const addedFields = nextFields.filter((field) => !previousFields.includes(field));
  const removedFields = previousFields.filter((field) => !nextFields.includes(field));
  if (addedFields.length) changes.push(`Inputs added: ${addedFields.join(", ")}`);
  if (removedFields.length) changes.push(`Inputs removed: ${removedFields.join(", ")}`);

  const previousRequired = getRequiredFields(previous.inputSchema);
  const nextRequired = getRequiredFields(next.inputSchema);
  const newRequired = nextRequired.filter((field) => !previousRequired.includes(field));
  if (newRequired.length) changes.push(`New required inputs: ${newRequired.join(", ")}`);

  if (stableStringify(previous.annotations) !== stableStringify(next.annotations)) {
    changes.push("Annotations or permissions changed");
  }
  if (!changes.length) changes.push("Schema details changed");
  return changes;
}

export function compareManifests(previousManifest, nextManifest) {
  const previousTools = extractTools(previousManifest);
  const nextTools = extractTools(nextManifest);
  const previousMap = new Map(previousTools.map((tool) => [tool.name, tool]));
  const nextMap = new Map(nextTools.map((tool) => [tool.name, tool]));

  const added = nextTools
    .filter((tool) => !previousMap.has(tool.name))
    .map((tool) => ({ ...tool, risk: analyzeToolRisk(tool) }));
  const removed = previousTools
    .filter((tool) => !nextMap.has(tool.name))
    .map((tool) => ({ ...tool, risk: analyzeToolRisk(tool) }));
  const changed = nextTools
    .filter((tool) => {
      const previous = previousMap.get(tool.name);
      return previous && stableStringify(previous.raw) !== stableStringify(tool.raw);
    })
    .map((tool) => {
      const previous = previousMap.get(tool.name);
      return {
        ...tool,
        previous,
        changes: describeChange(previous, tool),
        previousRisk: analyzeToolRisk(previous),
        risk: analyzeToolRisk(tool),
      };
    });

  const highRisk = [...added, ...changed].filter((tool) => tool.risk.level === "high");
  const mediumRisk = [...added, ...changed].filter((tool) => tool.risk.level === "medium");

  return {
    previousTools,
    nextTools,
    added,
    removed,
    changed,
    highRisk,
    mediumRisk,
    unchangedCount: nextTools.length - added.length - changed.length,
  };
}

export function buildAuditReport(result) {
  const lines = [
    "MCP Permission Diff Audit",
    "Local static analysis only — no tool was connected or executed.",
    "",
    `Previous tools: ${result.previousTools.length}`,
    `New tools: ${result.nextTools.length}`,
    `Added: ${result.added.length}`,
    `Removed: ${result.removed.length}`,
    `Changed: ${result.changed.length}`,
    `High-risk additions/changes: ${result.highRisk.length}`,
    `Medium-risk additions/changes: ${result.mediumRisk.length}`,
  ];

  const appendTools = (heading, tools, getDetails) => {
    if (!tools.length) return;
    lines.push("", heading);
    for (const tool of tools) {
      lines.push(`- ${tool.name}${getDetails ? ` — ${getDetails(tool)}` : ""}`);
    }
  };

  appendTools("Added tools", result.added, (tool) =>
    tool.risk.signals.length ? tool.risk.signals.map((signal) => signal.label).join(", ") : "No keyword risk signal",
  );
  appendTools("Changed tools", result.changed, (tool) => tool.changes.join("; "));
  appendTools("Removed tools", result.removed);
  lines.push("", "Review findings manually before trusting or installing an MCP server.");

  return lines.join("\n");
}
