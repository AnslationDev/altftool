/**
 * GitHub issue form (YAML) generator.
 *
 * Issue forms are YAML files stored in .github/ISSUE_TEMPLATE/ on the default
 * branch, with the extension .yml or .yaml. Schema per GitHub Docs — "Syntax for
 * issue forms": required top-level keys are name, description and body; optional
 * keys include title, labels, assignees and projects. Body items may be of type
 * markdown, textarea, input, dropdown or checkboxes; every non-markdown item
 * needs attributes.label, and validations.required makes a field mandatory.
 */

/** Directory GitHub scans for issue templates (GitHub Docs). */
export const ISSUE_TEMPLATE_DIR = ".github/ISSUE_TEMPLATE/";

/** GitHub caps issue forms at 65,536 characters of YAML (GitHub community docs note the body text limit; keep forms far below it). */
export const MAX_BODY_ITEMS = 25;

export const TEMPLATE_PRESETS = [
  {
    id: "bug",
    label: "Bug report",
    file: "bug_report.yml",
    defaults: {
      name: "Bug report",
      description: "Report something that is broken or not working as documented",
      titlePrefix: "[Bug]: ",
      labels: "bug, triage",
    },
  },
  {
    id: "feature",
    label: "Feature request",
    file: "feature_request.yml",
    defaults: {
      name: "Feature request",
      description: "Suggest a new feature or an improvement to an existing one",
      titlePrefix: "[Feature]: ",
      labels: "enhancement",
    },
  },
  {
    id: "support",
    label: "Support question",
    file: "support_question.yml",
    defaults: {
      name: "Support question",
      description: "Ask a usage question that is not a bug or feature request",
      titlePrefix: "[Question]: ",
      labels: "question",
    },
  },
];

/** Environment dropdown options used by the bug preset. */
export const OS_OPTIONS = ["macOS", "Windows", "Linux", "iOS", "Android", "Other"];

// ---------------------------------------------------------------------------
// Minimal YAML emitter — only what issue forms need (scalars, maps, lists).
// ---------------------------------------------------------------------------

const SAFE_PLAIN = /^[A-Za-z0-9][A-Za-z0-9 _./()-]*$/;

/** Quote a scalar unless it is plainly safe in YAML (booleans, nulls and number-like strings always get quotes). */
export function yamlScalar(value) {
  const s = String(value);
  if (s === "") return '""';
  if (SAFE_PLAIN.test(s) && !/^(true|false|yes|no|null|on|off)$/i.test(s) && !/^[\d-]/.test(s)) {
    return s;
  }
  return `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

/** Emit a possibly multi-line string as a YAML value at the given indent. */
function yamlValue(value, indent) {
  const s = String(value);
  if (s.includes("\n")) {
    const pad = " ".repeat(indent + 2);
    return `|\n${s
      .split("\n")
      .map((line) => (line.length ? pad + line : ""))
      .join("\n")}`;
  }
  return yamlScalar(s);
}

function emitBodyItem(item) {
  const lines = [];
  const at = (n) => " ".repeat(n);
  lines.push(`${at(2)}- type: ${item.type}`);
  if (item.id) lines.push(`${at(4)}id: ${yamlScalar(item.id)}`);
  if (item.attributes) {
    lines.push(`${at(4)}attributes:`);
    for (const [key, value] of Object.entries(item.attributes)) {
      if (value === undefined || value === null || value === "") continue;
      if (Array.isArray(value)) {
        lines.push(`${at(6)}${key}:`);
        for (const opt of value) {
          if (typeof opt === "object") {
            lines.push(`${at(8)}- label: ${yamlValue(opt.label, 8)}`);
            if (opt.required) lines.push(`${at(10)}required: true`);
          } else {
            lines.push(`${at(8)}- ${yamlValue(opt, 8)}`);
          }
        }
      } else if (typeof value === "boolean") {
        lines.push(`${at(6)}${key}: ${value}`);
      } else {
        lines.push(`${at(6)}${key}: ${yamlValue(value, 6)}`);
      }
    }
  }
  if (item.required) {
    lines.push(`${at(4)}validations:`);
    lines.push(`${at(6)}required: true`);
  }
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Body builders per preset
// ---------------------------------------------------------------------------

function bugBody({ includeVersion, includeEnvironment, includeLogs, requireSearch }) {
  const items = [
    {
      type: "markdown",
      attributes: {
        value: "Thanks for taking the time to fill out this bug report!",
      },
    },
  ];
  if (requireSearch) {
    items.push({
      type: "checkboxes",
      id: "search",
      attributes: {
        label: "Existing issues",
        options: [
          { label: "I have searched the existing issues and this is not a duplicate", required: true },
        ],
      },
    });
  }
  items.push(
    {
      type: "textarea",
      id: "what-happened",
      attributes: {
        label: "What happened?",
        description: "A clear description of the bug, with what you expected instead.",
        placeholder: "Tell us what you see!",
      },
      required: true,
    },
    {
      type: "textarea",
      id: "reproduction",
      attributes: {
        label: "Steps to reproduce",
        description: "Minimal steps so a maintainer can reproduce the problem.",
        placeholder: "1. Go to...\n2. Click on...\n3. See error",
      },
      required: true,
    },
  );
  if (includeVersion) {
    items.push({
      type: "input",
      id: "version",
      attributes: {
        label: "Version",
        description: "The release or commit where the bug occurs.",
        placeholder: "v1.2.3",
      },
      required: true,
    });
  }
  if (includeEnvironment) {
    items.push({
      type: "dropdown",
      id: "os",
      attributes: {
        label: "Operating system",
        multiple: true,
        options: OS_OPTIONS,
      },
      required: false,
    });
  }
  if (includeLogs) {
    items.push({
      type: "textarea",
      id: "logs",
      attributes: {
        label: "Relevant log output",
        description: "Paste any relevant logs. This is formatted as code automatically.",
        render: "shell",
      },
    });
  }
  return items;
}

function featureBody({ requireSearch }) {
  const items = [];
  if (requireSearch) {
    items.push({
      type: "checkboxes",
      id: "search",
      attributes: {
        label: "Existing requests",
        options: [
          { label: "I have searched existing issues and discussions for this idea", required: true },
        ],
      },
    });
  }
  items.push(
    {
      type: "textarea",
      id: "problem",
      attributes: {
        label: "What problem does this solve?",
        description: "Describe the problem or friction, not the solution, first.",
      },
      required: true,
    },
    {
      type: "textarea",
      id: "solution",
      attributes: {
        label: "Proposed solution",
        description: "What you would like to happen.",
      },
      required: true,
    },
    {
      type: "textarea",
      id: "alternatives",
      attributes: {
        label: "Alternatives considered",
        description: "Other approaches or workarounds you have tried.",
      },
    },
  );
  return items;
}

function supportBody() {
  return [
    {
      type: "markdown",
      attributes: {
        value:
          "Before asking, please check the documentation and existing discussions.",
      },
    },
    {
      type: "textarea",
      id: "question",
      attributes: {
        label: "Your question",
        description: "What are you trying to do, and where are you stuck?",
      },
      required: true,
    },
    {
      type: "textarea",
      id: "context",
      attributes: {
        label: "What have you tried?",
        description: "Commands, config or docs you already followed.",
      },
    },
  ];
}

/**
 * Build the issue form YAML.
 *
 * @param {object} input
 * @param {string} input.preset      One of TEMPLATE_PRESETS ids.
 * @param {string} input.name        Template name shown in the chooser (required by schema).
 * @param {string} input.description Template description (required by schema).
 * @param {string} [input.titlePrefix] Default issue title.
 * @param {string} [input.labels]      Comma-separated labels.
 * @param {string} [input.assignees]   Comma-separated GitHub usernames.
 * @param {object} [input.options]     Preset-specific toggles.
 * @returns {{yaml: string, path: string, fieldCount: number, requiredCount: number} | {error: string}}
 */
export function buildIssueForm({
  preset,
  name,
  description,
  titlePrefix = "",
  labels = "",
  assignees = "",
  options = {},
}) {
  const def = TEMPLATE_PRESETS.find((p) => p.id === preset);
  if (!def) return { error: "Choose a template type." };

  const cleanName = String(name ?? "").trim();
  const cleanDesc = String(description ?? "").trim();
  if (!cleanName) return { error: "The template needs a name — GitHub requires the top-level name key." };
  if (!cleanDesc) return { error: "The template needs a description — GitHub requires the top-level description key." };

  const labelList = String(labels)
    .split(",")
    .map((l) => l.trim())
    .filter(Boolean);
  const assigneeList = String(assignees)
    .split(",")
    .map((a) => a.trim().replace(/^@/, ""))
    .filter(Boolean);

  let body;
  if (def.id === "bug") body = bugBody(options);
  else if (def.id === "feature") body = featureBody(options);
  else body = supportBody();

  if (body.length === 0 || body.length > MAX_BODY_ITEMS) {
    return { error: "The form body must have between 1 and 25 items." };
  }

  const lines = [];
  lines.push(`name: ${yamlValue(cleanName, 0)}`);
  lines.push(`description: ${yamlValue(cleanDesc, 0)}`);
  if (titlePrefix.trim()) lines.push(`title: ${yamlValue(titlePrefix, 0)}`);
  if (labelList.length) {
    lines.push(`labels: [${labelList.map(yamlScalar).join(", ")}]`);
  }
  if (assigneeList.length) {
    lines.push(`assignees: [${assigneeList.map(yamlScalar).join(", ")}]`);
  }
  lines.push("body:");
  for (const item of body) lines.push(emitBodyItem(item));

  const yaml = `${lines.join("\n")}\n`;
  const interactive = body.filter((b) => b.type !== "markdown");

  return {
    yaml,
    path: `${ISSUE_TEMPLATE_DIR}${def.file}`,
    fieldCount: interactive.length,
    requiredCount:
      interactive.filter((b) => b.required).length +
      body.filter(
        (b) =>
          b.type === "checkboxes" &&
          (b.attributes?.options ?? []).some((o) => o.required),
      ).length,
  };
}
