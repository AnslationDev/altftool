const ACTION_COLLECTION_KEYS = ["actions", "steps", "tasks", "operations", "plan"];

const READ_ONLY_RULES = [
  { id: "inspect", label: "inspect", pattern: /\b(?:inspect|review|view|read|list|search|query|check)\b/i },
  { id: "analyze", label: "analysis", pattern: /\b(?:analy[sz]e|validate|audit|compare|diff|lint|test)\b/i },
  { id: "preview", label: "preview or dry run", pattern: /\b(?:preview|dry[- ]?run|simulate|estimate|calculate)\b/i },
];

const MUTATION_RULES = [
  { id: "file-change", label: "changes stored data", pattern: /\b(?:create|edit|update|write|replace|rename|move|copy)\b/i },
  { id: "configuration", label: "changes configuration", pattern: /\b(?:configure|install|uninstall|upgrade|migrate|commit)\b/i },
  { id: "access-change", label: "changes access", pattern: /\b(?:grant|revoke|rotate|disable|enable|invite)\b/i },
];

const DESTRUCTIVE_RULES = [
  {
    id: "delete",
    label: "deletes data",
    pattern: /\b(?:delete|remove|erase|destroy|purge)\b/i,
  },
  {
    id: "database-loss",
    label: "can remove database state",
    pattern: /\b(?:drop\s+(?:table|database|schema)|truncate|wipe\s+(?:database|disk|volume|data))\b/i,
  },
  {
    id: "forced-history",
    label: "can rewrite version history",
    pattern: /\b(?:reset\s+--hard|force[- ]?push|push\s+--force|rebase\s+--onto)\b/i,
  },
  {
    id: "overwrite",
    label: "can overwrite existing state",
    pattern: /\b(?:overwrite|replace\s+all|factory\s+reset)\b/i,
  },
];

const EXTERNAL_RULES = [
  {
    id: "communication",
    label: "communicates to people",
    irreversible: true,
    pattern: /\b(?:send|email|message|notify|announce)\b/i,
  },
  {
    id: "publication",
    label: "publishes externally",
    irreversible: true,
    pattern: /\b(?:publish|post|broadcast|make\s+public)\b/i,
  },
  {
    id: "financial",
    label: "moves money",
    irreversible: true,
    pattern: /\b(?:pay|payment|transfer\s+(?:money|funds)|charge|purchase|buy|refund)\b/i,
  },
  {
    id: "remote-write",
    label: "writes to a remote system",
    irreversible: false,
    pattern:
      /\b(?:deploy|push|merge|upload|submit)\b|\brelease\s+(?:version|build|artifact|app|service)\b|\bwebhook\b|\bapi\s+(?:post|put|patch|delete)\b/i,
  },
  {
    id: "account-change",
    label: "changes an external account",
    irreversible: false,
    pattern: /\b(?:create|delete|close|suspend)\s+(?:an?\s+)?(?:account|user|workspace|project|repository)\b/i,
  },
];

const SAFEGUARD_RULES = {
  backup: {
    label: "Backup",
    mention: /\b(?:backup|back[- ]?up|snapshot|database\s+dump|export\s+copy)\b/i,
    detail:
      /\b(?:backup|back[- ]?up|snapshot|database\s+dump|export\s+copy)\b.{0,80}\b(?:to|at|in|as|named|before|location|bucket|file)\b/i,
  },
  checkpoint: {
    label: "Checkpoint",
    mention: /\b(?:checkpoint|savepoint|git\s+(?:commit|tag)|version\s+tag|restore\s+point)\b/i,
    detail:
      /\b(?:checkpoint|savepoint|git\s+(?:commit|tag)|version\s+tag|restore\s+point)\b.{0,80}\b(?:before|named|as|at|with|hash|sha|version)\b/i,
  },
  confirmation: {
    label: "Confirmation",
    mention: /\b(?:confirm|confirmation|approval|approve|ask\s+(?:the\s+)?user|human\s+review|sign[- ]?off)\b/i,
    detail:
      /\b(?:confirm|confirmation|approval|approve|ask\s+(?:the\s+)?user|human\s+review|sign[- ]?off)\b.{0,80}\b(?:with|from|by|before|owner|user|operator|reviewer)\b/i,
  },
  rollback: {
    label: "Rollback",
    mention: /\b(?:rollback|roll\s+back|revert|restore|undo|compensating\s+action)\b/i,
    detail:
      /\b(?:rollback|roll\s+back|revert|restore|undo|compensating\s+action)\b.{0,100}\b(?:by|using|to|from|with|commit|snapshot|version|backup|command)\b/i,
  },
};

function compactText(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function stringifyAction(value, index) {
  if (typeof value === "string" || typeof value === "number") {
    const text = compactText(value);
    return text ? { title: text, text } : null;
  }

  if (!value || typeof value !== "object" || Array.isArray(value)) return null;

  const title = compactText(
    value.title ??
      value.name ??
      value.action ??
      value.step ??
      value.description ??
      value.command ??
      `Action ${index + 1}`,
  );

  const detailValues = Object.entries(value)
    .filter(([, item]) => item !== null && item !== undefined && typeof item !== "object")
    .map(([key, item]) => `${key}: ${compactText(item)}`)
    .filter(Boolean);
  const text = compactText(detailValues.join(". ") || title);

  return title || text ? { title: title || `Action ${index + 1}`, text: text || title } : null;
}

function findActionCollection(value) {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return null;

  for (const key of ACTION_COLLECTION_KEYS) {
    if (Array.isArray(value[key])) return value[key];
    if (key === "plan" && typeof value[key] === "string") {
      return parseLines(value[key]);
    }
  }

  return [value];
}

function parseLines(input) {
  return String(input)
    .split(/\r?\n/)
    .map((line) =>
      line
        .replace(/^\s*(?:[-*+]\s+|\d+[.)]\s+|\[[ xX]\]\s*)/, "")
        .replace(/^#{1,6}\s+/, "")
        .trim(),
    )
    .filter((line) => line && line !== "```" && !/^```(?:json|text|markdown)?$/i.test(line));
}

export function inspectSafeguards(text) {
  return Object.fromEntries(
    Object.entries(SAFEGUARD_RULES).map(([key, rule]) => {
      const mentioned = rule.mention.test(text);
      const detailed = mentioned && rule.detail.test(text);
      return [key, { key, label: rule.label, mentioned, detailed }];
    }),
  );
}

export function parsePlan(input) {
  const raw = String(input ?? "").trim();
  if (!raw) {
    return {
      ok: false,
      error: "Paste at least one proposed action.",
      actions: [],
      format: null,
      raw,
    };
  }

  let collection;
  let format = "lines";

  try {
    const parsed = JSON.parse(raw);
    collection = findActionCollection(parsed);
    format = "json";
  } catch {
    collection = parseLines(raw);
  }

  const actions = (collection || [])
    .map((item, index) => stringifyAction(item, index))
    .filter(Boolean)
    .map((action, index) => ({ ...action, index: index + 1 }));

  if (!actions.length) {
    return {
      ok: false,
      error: "No readable actions were found. Use a JSON action array or one action per line.",
      actions: [],
      format,
      raw,
    };
  }

  return {
    ok: true,
    error: "",
    actions,
    format,
    raw,
    safeguards: inspectSafeguards(raw),
  };
}

function findRules(text, rules) {
  return rules.filter((rule) => rule.pattern.test(text));
}

function requiredSafeguards({ destructive, external, mutation }) {
  const required = new Set();
  if (mutation) {
    required.add("checkpoint");
    required.add("rollback");
  }
  if (destructive) {
    required.add("backup");
    required.add("checkpoint");
    required.add("confirmation");
    required.add("rollback");
  }
  if (external) {
    required.add("confirmation");
    required.add("rollback");
  }
  return [...required];
}

function classifyAction(action, planSafeguards) {
  const text = action.text;
  const readOnlyMatches = findRules(text, READ_ONLY_RULES);
  const mutationMatches = findRules(text, MUTATION_RULES);
  const destructiveMatches = findRules(text, DESTRUCTIVE_RULES);
  const externalMatches = findRules(text, EXTERNAL_RULES);
  const actionSafeguards = inspectSafeguards(text);

  const destructive = destructiveMatches.length > 0;
  const external = externalMatches.length > 0;
  const mutation = mutationMatches.length > 0 || destructive || external;
  const irreversibleExternal = externalMatches.some((match) => match.irreversible);
  const recoverableDestruction =
    destructive &&
    (planSafeguards.backup.detailed || planSafeguards.checkpoint.detailed) &&
    planSafeguards.rollback.detailed;
  const explicitUndo =
    actionSafeguards.rollback.detailed ||
    (planSafeguards.rollback.detailed && mutation && !destructive && !irreversibleExternal);

  let classification = "reversible";
  let reason = "No state-changing phrase was detected; this appears read-only or locally evaluative.";

  if (irreversibleExternal) {
    classification = "irreversible";
    reason = "The action appears to communicate, publish, or move money externally; an undo cannot retract every consequence.";
  } else if (destructive && !recoverableDestruction) {
    classification = "irreversible";
    reason = "The action contains a destructive phrase without a detailed backup/checkpoint and restoration path.";
  } else if (destructive && recoverableDestruction) {
    classification = "recoverable";
    reason = "The destructive step has a described recovery path, but restoration may still be incomplete or fail.";
  } else if (mutation && explicitUndo) {
    classification = "reversible";
    reason = "The action changes state and the plan describes a rollback path; verify that path before execution.";
  } else if (mutation) {
    classification = "recoverable";
    reason = "The action changes state and may be recoverable, but the plan does not prove a complete undo.";
  } else if (!readOnlyMatches.length) {
    reason = "No recognized state-changing phrase was found. The wording is ambiguous, so review the action manually.";
  }

  const required = requiredSafeguards({ destructive, external, mutation });
  const missingSafeguards = required
    .map((key) => {
      const coverage = planSafeguards[key];
      if (!coverage.mentioned) {
        return {
          key,
          label: SAFEGUARD_RULES[key].label,
          status: "missing",
          message: `${SAFEGUARD_RULES[key].label} is not mentioned in the plan.`,
        };
      }
      if (!coverage.detailed) {
        return {
          key,
          label: SAFEGUARD_RULES[key].label,
          status: "vague",
          message: `${SAFEGUARD_RULES[key].label} is mentioned, but the plan does not say how, where, or by whom.`,
        };
      }
      return null;
    })
    .filter(Boolean);

  const evidence = [
    ...destructiveMatches.map((match) => ({
      type: "destructive",
      label: match.label,
      matched: text.match(match.pattern)?.[0] || match.label,
    })),
    ...externalMatches.map((match) => ({
      type: "external",
      label: match.label,
      matched: text.match(match.pattern)?.[0] || match.label,
    })),
    ...mutationMatches.map((match) => ({
      type: "mutation",
      label: match.label,
      matched: text.match(match.pattern)?.[0] || match.label,
    })),
    ...(!mutation && readOnlyMatches.length
      ? readOnlyMatches.map((match) => ({
          type: "read-only",
          label: match.label,
          matched: text.match(match.pattern)?.[0] || match.label,
        }))
      : []),
  ];

  const confidence =
    evidence.length > 1 || destructiveMatches.length || externalMatches.length
      ? "high"
      : evidence.length === 1
        ? "medium"
        : "low";
  const risk =
    classification === "irreversible" || destructive
      ? "high"
      : external || missingSafeguards.length
        ? "medium"
        : "low";

  return {
    ...action,
    classification,
    confidence,
    risk,
    reason,
    evidence,
    sideEffects: [
      ...(destructive ? ["Destructive change"] : []),
      ...(external ? ["External side effect"] : []),
      ...(mutation ? ["State change"] : []),
    ],
    missingSafeguards,
  };
}

export function analyzePlan(input) {
  const parsed = typeof input === "string" ? parsePlan(input) : input;
  if (!parsed?.ok) return parsed;

  const actions = parsed.actions.map((action) => classifyAction(action, parsed.safeguards));
  const counts = actions.reduce(
    (summary, action) => {
      summary[action.classification] += 1;
      if (action.sideEffects.includes("Destructive change")) summary.destructive += 1;
      if (action.sideEffects.includes("External side effect")) summary.external += 1;
      summary.missingSafeguards += action.missingSafeguards.length;
      return summary;
    },
    {
      reversible: 0,
      recoverable: 0,
      irreversible: 0,
      destructive: 0,
      external: 0,
      missingSafeguards: 0,
    },
  );

  const overallRisk =
    counts.irreversible || counts.destructive
      ? "high"
      : counts.external || counts.missingSafeguards
        ? "medium"
        : "low";

  return {
    ...parsed,
    actions,
    counts,
    overallRisk,
    limitations: [
      "This is keyword-based static analysis; it does not understand runtime behavior or hidden agent instructions.",
      "A reversible label means a rollback path appears plausible, not that recovery is guaranteed.",
      "The validator never executes actions, contacts services, or verifies that backups and approvals really exist.",
    ],
  };
}

export function buildValidationReport(result) {
  if (!result?.ok) return "";

  const lines = [
    "Agent Undo Plan Validator Report",
    `Input format: ${result.format}`,
    `Overall review level: ${result.overallRisk}`,
    `Actions: ${result.actions.length}`,
    `Reversible: ${result.counts.reversible}`,
    `Recoverable: ${result.counts.recoverable}`,
    `Irreversible: ${result.counts.irreversible}`,
    `Destructive signals: ${result.counts.destructive}`,
    `External side effects: ${result.counts.external}`,
    "",
    "Plan safeguards",
    ...Object.values(result.safeguards).map(
      (item) =>
        `- ${item.label}: ${item.detailed ? "detailed" : item.mentioned ? "mentioned but vague" : "not found"}`,
    ),
    "",
    "Action review",
  ];

  result.actions.forEach((action) => {
    lines.push(
      "",
      `${action.index}. ${action.title}`,
      `Classification: ${action.classification} (${action.confidence} confidence)`,
      `Review level: ${action.risk}`,
      `Reason: ${action.reason}`,
      `Evidence: ${
        action.evidence.length
          ? action.evidence.map((item) => `"${item.matched}" → ${item.label}`).join("; ")
          : "No recognized phrase; manual review needed"
      }`,
      `Missing safeguards: ${
        action.missingSafeguards.length
          ? action.missingSafeguards.map((item) => item.message).join(" ")
          : "None detected for this action"
      }`,
    );
  });

  lines.push(
    "",
    "Limits",
    ...result.limitations.map((item) => `- ${item}`),
    "",
    "No action was executed. Analysis ran locally in the browser.",
  );

  return lines.join("\n");
}
