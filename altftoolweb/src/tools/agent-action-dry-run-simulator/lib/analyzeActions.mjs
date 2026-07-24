export const EFFECT_META = {
  write: {
    label: "Write or mutation",
    reportLabel: "write or modify data",
  },
  deletion: {
    label: "Deletion",
    reportLabel: "delete or revoke data",
  },
  message: {
    label: "Message",
    reportLabel: "send a message or notification",
  },
  money: {
    label: "Money movement",
    reportLabel: "move or charge money",
  },
  external: {
    label: "External side effect",
    reportLabel: "affect an external system",
  },
  execution: {
    label: "Code execution",
    reportLabel: "run code or a command",
  },
  read: {
    label: "Read-only signal",
    reportLabel: "read or inspect data",
  },
};

const EFFECT_ORDER = [
  "write",
  "deletion",
  "message",
  "money",
  "external",
  "execution",
  "read",
];

const ACTION_PATTERNS = {
  write: [
    "write",
    "update",
    "edit",
    "create",
    "modify",
    "patch",
    "upload",
    "publish",
    "deploy",
    "rename",
    "move file",
    "commit",
    "apply change",
    "set value",
  ],
  deletion: [
    "delete",
    "remove",
    "purge",
    "truncate",
    "destroy",
    "drop table",
    "erase",
    "revoke",
  ],
  message: [
    "send email",
    "send message",
    "send sms",
    "notify",
    "notification",
    "post message",
    "reply",
    "email user",
    "slack message",
  ],
  money: [
    "transfer funds",
    "transfer money",
    "send money",
    "make payment",
    "pay invoice",
    "payment",
    "purchase",
    "charge card",
    "charge customer",
    "withdraw",
    "refund",
    "place order",
  ],
  external: [
    "webhook",
    "api request",
    "http request",
    "deploy",
    "publish",
    "upload",
    "send email",
    "send message",
    "send sms",
    "notify",
    "post message",
    "payment",
    "purchase",
    "transfer funds",
    "transfer money",
    "send money",
    "charge customer",
    "place order",
  ],
  execution: [
    "run command",
    "execute",
    "shell",
    "terminal",
    "subprocess",
    "run script",
    "eval code",
    "execute code",
  ],
  read: [
    "read",
    "get",
    "list",
    "search",
    "inspect",
    "preview",
    "fetch",
    "download",
    "lookup",
    "query",
  ],
};

const TARGET_KEYS = new Set([
  "to",
  "recipient",
  "recipients",
  "destination",
  "target",
  "targets",
  "path",
  "filepath",
  "filename",
  "file",
  "directory",
  "url",
  "uri",
  "endpoint",
  "host",
  "hostname",
  "domain",
  "channel",
  "repository",
  "repo",
  "branch",
  "table",
  "database",
  "bucket",
  "account",
  "service",
  "deployment",
  "resource",
]);

const SECRET_KEYS = [
  "password",
  "passcode",
  "secret",
  "token",
  "api key",
  "private key",
  "credential",
  "authorization",
];

const SAFEGUARDS = {
  confirmation: "Explicit approval or confirmation",
  preview: "Dry-run, simulation, or preview flag",
  recovery: "Backup, snapshot, rollback, or undo",
  idempotency: "Idempotency key",
  scope: "Narrow scope, allowlist, sandbox, or limit",
};

const RISK_WEIGHT = {
  write: 3,
  deletion: 5,
  message: 4,
  money: 6,
  external: 2,
  execution: 5,
};

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeWords(value) {
  return String(value ?? "")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function includesPhrase(text, patterns) {
  const padded = ` ${normalizeWords(text)} `;
  return patterns.some((pattern) => padded.includes(` ${normalizeWords(pattern)} `));
}

function valueIsEnabled(value) {
  if (value === true) return true;
  if (typeof value === "number") return value > 0;
  if (typeof value !== "string") return false;
  return ["true", "yes", "required", "enabled", "approved", "confirmed"].includes(
    normalizeWords(value),
  );
}

function valueIsPresent(value) {
  if (value === null || value === undefined || value === false || value === "") return false;
  if (Array.isArray(value)) return value.length > 0;
  if (isObject(value)) return Object.keys(value).length > 0;
  return true;
}

function flattenEntries(value, path = "arguments", depth = 0, output = []) {
  if (depth > 6 || value === null || value === undefined) return output;

  if (Array.isArray(value)) {
    value.forEach((entry, index) => flattenEntries(entry, `${path}[${index}]`, depth + 1, output));
    return output;
  }

  if (!isObject(value)) return output;

  for (const [key, nested] of Object.entries(value)) {
    const entryPath = `${path}.${key}`;
    output.push({ key, normalizedKey: normalizeWords(key), path: entryPath, value: nested });
    if (Array.isArray(nested) || isObject(nested)) {
      flattenEntries(nested, entryPath, depth + 1, output);
    }
  }
  return output;
}

function parseArgumentValue(value) {
  if (typeof value !== "string") return value;
  const source = value.trim();
  if (!source || (!source.startsWith("{") && !source.startsWith("["))) {
    return { value };
  }
  try {
    return JSON.parse(source);
  } catch {
    return { rawArguments: value };
  }
}

function directArguments(raw) {
  const ignored = new Set([
    "name",
    "tool",
    "toolName",
    "action",
    "operation",
    "command",
    "function",
    "arguments",
    "args",
    "input",
    "parameters",
    "payload",
    "type",
    "id",
  ]);

  return Object.fromEntries(Object.entries(raw).filter(([key]) => !ignored.has(key)));
}

function normalizeCall(raw, index) {
  const functionBlock = isObject(raw.function) ? raw.function : {};
  const name =
    functionBlock.name ||
    raw.name ||
    raw.tool ||
    raw.toolName ||
    raw.action ||
    raw.operation ||
    raw.command ||
    `Unnamed action ${index + 1}`;

  const wrappedArguments =
    functionBlock.arguments ??
    raw.arguments ??
    raw.args ??
    raw.input ??
    raw.parameters ??
    raw.payload;
  const argumentsValue =
    wrappedArguments === undefined ? directArguments(raw) : parseArgumentValue(wrappedArguments);

  return {
    index,
    name: String(name),
    arguments: argumentsValue,
    raw,
  };
}

function selectCallList(parsed) {
  if (Array.isArray(parsed)) return parsed;
  if (!isObject(parsed)) return null;

  for (const key of ["calls", "toolCalls", "tool_calls", "actions"]) {
    if (Array.isArray(parsed[key])) return parsed[key];
  }
  return [parsed];
}

export function parseActionCalls(text) {
  const source = String(text ?? "").trim();
  if (!source) {
    return { ok: false, error: "Paste one tool-call object or an array of tool calls." };
  }

  let parsed;
  try {
    parsed = JSON.parse(source);
  } catch (error) {
    return { ok: false, error: `Invalid JSON: ${error.message}` };
  }

  const calls = selectCallList(parsed);
  if (!calls) {
    return { ok: false, error: "The JSON root must be an object or an array." };
  }
  if (!calls.length) {
    return { ok: false, error: "The tool-call array is empty." };
  }
  if (calls.length > 200) {
    return { ok: false, error: "Analyze at most 200 tool calls at a time." };
  }

  const invalidIndex = calls.findIndex((call) => !isObject(call));
  if (invalidIndex >= 0) {
    return {
      ok: false,
      error: `Tool call ${invalidIndex + 1} must be a JSON object.`,
    };
  }

  return {
    ok: true,
    value: calls.map(normalizeCall),
  };
}

function findMethod(entries) {
  const methodEntry = entries.find(({ normalizedKey }) =>
    ["method", "http method", "request method"].includes(normalizedKey),
  );
  return normalizeWords(methodEntry?.value);
}

function detectEffects(action, entries) {
  const name = normalizeWords(action.name);
  const keyText = entries.map(({ normalizedKey }) => normalizedKey).join(" ");
  const method = findMethod(entries);
  const hasMessageShape =
    entries.some(({ normalizedKey }) =>
      ["to", "recipient", "recipients", "channel"].includes(normalizedKey),
    ) &&
    entries.some(({ normalizedKey }) =>
      ["message", "body", "subject", "text"].includes(normalizedKey),
    );
  const hasExternalTarget = entries.some(({ normalizedKey }) =>
    ["url", "uri", "endpoint", "host", "hostname", "domain", "webhook"].includes(normalizedKey),
  );

  const effects = {
    write:
      includesPhrase(name, ACTION_PATTERNS.write) ||
      ["post", "put", "patch"].includes(method) ||
      (includesPhrase(keyText, ["content", "new value", "changes"]) &&
        !includesPhrase(name, ACTION_PATTERNS.read)),
    deletion: includesPhrase(name, ACTION_PATTERNS.deletion) || method === "delete",
    message: includesPhrase(name, ACTION_PATTERNS.message) || hasMessageShape,
    money: includesPhrase(name, ACTION_PATTERNS.money),
    external:
      includesPhrase(name, ACTION_PATTERNS.external) ||
      hasExternalTarget ||
      ["get", "post", "put", "patch", "delete"].includes(method),
    execution: includesPhrase(name, ACTION_PATTERNS.execution),
    read: includesPhrase(name, ACTION_PATTERNS.read) || method === "get",
  };

  if (effects.deletion) effects.write = false;
  if (effects.message || effects.money) effects.external = true;
  return effects;
}

function summarizeTargetValue(value) {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    const rendered = String(value);
    return rendered.length > 120 ? `${rendered.slice(0, 117)}…` : rendered;
  }
  if (Array.isArray(value)) {
    const rendered = value
      .slice(0, 4)
      .map((item) => summarizeTargetValue(item))
      .join(", ");
    return value.length > 4 ? `${rendered}, …` : rendered || "Empty list";
  }
  if (isObject(value)) {
    const keys = Object.keys(value);
    return keys.length ? `Object with: ${keys.slice(0, 5).join(", ")}${keys.length > 5 ? ", …" : ""}` : "Empty object";
  }
  return String(value);
}

function extractTargets(entries) {
  const seen = new Set();
  const targets = [];

  for (const entry of entries) {
    const normalizedKey = entry.normalizedKey;
    if (SECRET_KEYS.some((secret) => normalizedKey.includes(secret))) continue;
    const compactKey = normalizedKey.replaceAll(" ", "");
    if (!TARGET_KEYS.has(normalizedKey) && !TARGET_KEYS.has(compactKey)) continue;
    if (!valueIsPresent(entry.value)) continue;

    const key = `${entry.path}:${JSON.stringify(entry.value)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    targets.push({
      key: entry.key,
      path: entry.path,
      value: summarizeTargetValue(entry.value),
    });
  }

  return targets.slice(0, 12);
}

function detectSafeguards(entries) {
  const present = new Set();

  for (const { normalizedKey, value } of entries) {
    if (
      includesPhrase(normalizedKey, [
        "confirm",
        "confirmed",
        "confirmation",
        "require confirmation",
        "approved",
        "approval",
      ]) &&
      valueIsEnabled(value)
    ) {
      present.add("confirmation");
    }
    if (
      includesPhrase(normalizedKey, [
        "dry run",
        "simulate",
        "simulation",
        "preview",
        "preview only",
        "no op",
      ]) &&
      valueIsEnabled(value)
    ) {
      present.add("preview");
    }
    if (
      includesPhrase(normalizedKey, [
        "backup",
        "snapshot",
        "rollback",
        "undo",
        "reversible",
        "restore point",
      ]) &&
      valueIsPresent(value)
    ) {
      present.add("recovery");
    }
    if (includesPhrase(normalizedKey, ["idempotency", "idempotency key"]) && valueIsPresent(value)) {
      present.add("idempotency");
    }
    if (
      includesPhrase(normalizedKey, [
        "scope",
        "allowlist",
        "allowed path",
        "allowed paths",
        "allowed recipient",
        "allowed recipients",
        "sandbox",
        "maximum amount",
        "max amount",
        "spending limit",
      ]) &&
      valueIsPresent(value)
    ) {
      present.add("scope");
    }
  }

  return [...present].map((id) => ({ id, label: SAFEGUARDS[id] }));
}

function buildMissingSafeguards(effects, targets, presentSafeguards) {
  const present = new Set(presentSafeguards.map(({ id }) => id));
  const missing = [];
  const hasSideEffect = ["write", "deletion", "message", "money", "external", "execution"].some(
    (key) => effects[key],
  );

  if (!hasSideEffect) return missing;
  if (!present.has("confirmation")) {
    missing.push({ id: "confirmation", label: SAFEGUARDS.confirmation });
  }
  if ((effects.write || effects.deletion || effects.execution) && !present.has("preview")) {
    missing.push({ id: "preview", label: SAFEGUARDS.preview });
  }
  if ((effects.write || effects.deletion) && !present.has("recovery")) {
    missing.push({ id: "recovery", label: SAFEGUARDS.recovery });
  }
  if (effects.money && !present.has("idempotency")) {
    missing.push({ id: "idempotency", label: SAFEGUARDS.idempotency });
  }
  if ((effects.money || effects.external) && !present.has("scope")) {
    missing.push({ id: "scope", label: SAFEGUARDS.scope });
  }
  if (!targets.length) {
    missing.push({ id: "target", label: "Explicit, reviewable target" });
  }
  return missing;
}

function assessReversibility(effects, presentSafeguards) {
  const present = new Set(presentSafeguards.map(({ id }) => id));
  const hasSideEffect = ["write", "deletion", "message", "money", "external", "execution"].some(
    (key) => effects[key],
  );

  if (!hasSideEffect) {
    return {
      level: "not-applicable",
      label: "No mutation detected",
      detail: "The heuristic found only read-only or unknown behavior.",
    };
  }
  if (effects.message || effects.money) {
    return {
      level: "likely-irreversible",
      label: "Likely irreversible",
      detail: "Messages and money movements cannot be reliably recalled by this JSON.",
    };
  }
  if (effects.deletion || effects.execution) {
    return present.has("recovery")
      ? {
          level: "potentially-reversible",
          label: "Potentially reversible",
          detail: "A recovery signal is present, but its effectiveness cannot be verified.",
        }
      : {
          level: "likely-irreversible",
          label: "Likely irreversible",
          detail: "No backup, snapshot, rollback, or undo signal was found.",
        };
  }
  if (effects.write) {
    return present.has("recovery")
      ? {
          level: "potentially-reversible",
          label: "Potentially reversible",
          detail: "A recovery signal is present, but the simulator cannot test it.",
        }
      : {
          level: "unknown",
          label: "Reversibility unknown",
          detail: "The call appears to mutate data without a detectable recovery signal.",
        };
  }
  return {
    level: "unknown",
    label: "Reversibility unknown",
    detail: "The external system's undo behavior is not present in this JSON.",
  };
}

function assessRisk(effects, targets, missingSafeguards) {
  let score = Object.entries(RISK_WEIGHT).reduce(
    (total, [key, weight]) => total + (effects[key] ? weight : 0),
    0,
  );
  if (missingSafeguards.some(({ id }) => id === "confirmation")) score += 2;
  if (missingSafeguards.some(({ id }) => id === "target")) score += 1;
  if (
    effects.deletion &&
    missingSafeguards.some(({ id }) => id === "recovery")
  ) {
    score += 1;
  }

  const level =
    score >= 10 ? "critical" : score >= 7 ? "high" : score >= 4 ? "medium" : "low";
  const label =
    level === "critical"
      ? "Critical review"
      : level === "high"
        ? "High review"
        : level === "medium"
          ? "Moderate review"
          : "Low signal";

  return { score, level, label };
}

function buildPreview(action, effects, targets) {
  const effectLabels = EFFECT_ORDER.filter((key) => effects[key] && key !== "read").map(
    (key) => EFFECT_META[key].reportLabel,
  );
  if (!effectLabels.length && effects.read) effectLabels.push(EFFECT_META.read.reportLabel);
  if (!effectLabels.length) effectLabels.push("perform an unclassified action");

  const targetText = targets.length
    ? ` Targets found: ${targets
        .slice(0, 3)
        .map(({ value }) => value)
        .join("; ")}${targets.length > 3 ? "; …" : ""}.`
    : " No explicit target was identified.";

  return `${action.name} would likely ${effectLabels.join(", ")}.${targetText}`;
}

export function analyzeActions(calls) {
  const actions = calls.map((call) => {
    const entries = flattenEntries(call.arguments);
    const effects = detectEffects(call, entries);
    const targets = extractTargets(entries);
    const presentSafeguards = detectSafeguards(entries);
    const missingSafeguards = buildMissingSafeguards(
      effects,
      targets,
      presentSafeguards,
    );
    const reversibility = assessReversibility(effects, presentSafeguards);
    const risk = assessRisk(effects, targets, missingSafeguards);

    return {
      ...call,
      effects,
      effectKeys: EFFECT_ORDER.filter((key) => effects[key]),
      targets,
      safeguards: {
        present: presentSafeguards,
        missing: missingSafeguards,
      },
      reversibility,
      risk,
      preview: buildPreview(call, effects, targets),
    };
  });

  const counts = Object.fromEntries(
    EFFECT_ORDER.map((key) => [key, actions.filter((action) => action.effects[key]).length]),
  );
  const highestRisk = actions.reduce(
    (highest, action) => (action.risk.score > highest.score ? action.risk : highest),
    { score: 0, level: "low", label: "Low signal" },
  );

  return {
    actions,
    counts,
    highestRisk,
    sideEffectCount: actions.filter((action) =>
      ["write", "deletion", "message", "money", "external", "execution"].some(
        (key) => action.effects[key],
      ),
    ).length,
    missingSafeguardCount: actions.reduce(
      (total, action) => total + action.safeguards.missing.length,
      0,
    ),
  };
}

export function buildDryRunReport(result) {
  const lines = [
    "Agent Action Dry-Run Report",
    "Static local heuristic only — no tool call was connected, sent, saved, or executed.",
    "",
    `Calls analyzed: ${result.actions.length}`,
    `Calls with likely side effects: ${result.sideEffectCount}`,
    `Highest review level: ${result.highestRisk.label} (score ${result.highestRisk.score})`,
    `Missing safeguard prompts: ${result.missingSafeguardCount}`,
  ];

  for (const action of result.actions) {
    lines.push(
      "",
      `${action.index + 1}. ${action.name}`,
      `Risk: ${action.risk.label} (score ${action.risk.score})`,
      `Preview: ${action.preview}`,
      `Effects: ${
        action.effectKeys.length
          ? action.effectKeys.map((key) => EFFECT_META[key].label).join(", ")
          : "Unclassified"
      }`,
      `Reversibility: ${action.reversibility.label}`,
      `Targets: ${
        action.targets.length
          ? action.targets.map(({ key, value }) => `${key}=${value}`).join("; ")
          : "None detected"
      }`,
      `Safeguards detected: ${
        action.safeguards.present.length
          ? action.safeguards.present.map(({ label }) => label).join(", ")
          : "None"
      }`,
      `Safeguards to review: ${
        action.safeguards.missing.length
          ? action.safeguards.missing.map(({ label }) => label).join(", ")
          : "None detected"
      }`,
    );
  }

  lines.push(
    "",
    "Limitations",
    "- Classification is deterministic pattern matching, not semantic execution analysis.",
    "- Tool names and argument keys can be misleading, incomplete, or custom.",
    "- A low score does not prove safety; verify permissions, runtime policy, and human approval separately.",
  );
  return lines.join("\n");
}
