const MAX_SOURCE_CHARACTERS = 500_000;
const MAX_SCRIPTS = 100;
const MAX_SCRIPT_CHARACTERS = 10_000;
const MAX_TOTAL_SCRIPT_CHARACTERS = 100_000;
const CONTROL_CHARACTERS_PATTERN = /[\u0000-\u001f\u007f]/u;

const INSTALL_LIFECYCLE_EVENTS = new Set([
  "preinstall",
  "install",
  "postinstall",
  "prepublish",
  "preprepare",
  "prepare",
  "postprepare",
  "dependencies",
]);

const PACK_PUBLISH_LIFECYCLE_EVENTS = new Set([
  "prepublishOnly",
  "prepack",
  "postpack",
  "publish",
  "postpublish",
]);

const CUE_RULES = [
  {
    category: "network",
    label: "Network or remote-source cue",
    pattern:
      /\b(?:curl|wget|Invoke-WebRequest|iwr|git\s+clone|npx|npm\s+(?:install|i|exec)|pnpm\s+(?:add|dlx)|yarn\s+(?:add|dlx))\b|https?:\/\//giu,
  },
  {
    category: "file",
    label: "File write, move, permission, or removal cue",
    pattern:
      /\b(?:rm|rmdir|del|erase|cp|copy|mv|move|mkdir|chmod|chown|tee)\b|(?:^|\s)(?:>>?|2>>?)\s*\S/giu,
  },
  {
    category: "process",
    label: "Runtime, shell, or dynamic-process cue",
    pattern:
      /\b(?:node(?!-gyp)|python3?|java|ruby|perl|sh|bash|zsh|cmd(?:\.exe)?|powershell|pwsh)\b|\beval\b/giu,
  },
  {
    category: "native-build",
    label: "Native build toolchain cue",
    pattern:
      /\b(?:node-gyp|node-pre-gyp|prebuild-install|cmake-js|cmake|make|g\+\+|gcc|clang|cargo|rustc)\b|\bpython(?:3)?\s+setup\.py\b/giu,
  },
  {
    category: "environment",
    label: "Environment-variable access cue",
    pattern:
      /\bprocess\.env\b|%[A-Z_][A-Z0-9_]*%|\$env:[A-Z_][A-Z0-9_]*|\$(?:\{[A-Z_][A-Z0-9_]*\}|[A-Z_][A-Z0-9_]*)/giu,
  },
  {
    category: "encoded-or-dynamic",
    label: "Encoded or dynamic-evaluation cue",
    pattern:
      /\bbase64\b\s+(?:-d|--decode)|\bfromCharCode\b|\bBuffer\.from\s*\([^)]*,\s*["']base64["']|\beval\s*\(/giu,
  },
];

export const installScriptInspectorLimits = Object.freeze({
  maxSourceCharacters: MAX_SOURCE_CHARACTERS,
  maxFileBytes: MAX_SOURCE_CHARACTERS,
  maxScripts: MAX_SCRIPTS,
  maxScriptCharacters: MAX_SCRIPT_CHARACTERS,
  maxTotalScriptCharacters: MAX_TOTAL_SCRIPT_CHARACTERS,
});

function evidenceAround(command, index, length) {
  const start = Math.max(0, index - 60);
  const end = Math.min(command.length, index + length + 80);
  const prefix = start > 0 ? "…" : "";
  const suffix = end < command.length ? "…" : "";
  return `${prefix}${command.slice(start, end).replace(/\s+/gu, " ").trim()}${suffix}`;
}

function findCues(command) {
  const cues = [];
  for (const rule of CUE_RULES) {
    rule.pattern.lastIndex = 0;
    const match = rule.pattern.exec(command);
    if (!match) continue;
    cues.push({
      category: rule.category,
      label: rule.label,
      evidence: evidenceAround(command, match.index, match[0].length),
    });
  }
  return cues;
}

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeScriptName(value) {
  if (
    typeof value !== "string" ||
    !value ||
    value !== value.trim() ||
    value.length > 160
  ) {
    throw new Error("Script names must be non-empty strings of 160 characters or fewer.");
  }
  if (CONTROL_CHARACTERS_PATTERN.test(value)) {
    throw new Error("Script names must not contain control characters.");
  }
  return value;
}

function normalizePackageName(value) {
  if (value === undefined) return "local-package";
  if (
    typeof value !== "string" ||
    !value ||
    value !== value.trim() ||
    value.length > 214
  ) {
    throw new Error("The package name must be a non-empty string of 214 characters or fewer.");
  }
  if (CONTROL_CHARACTERS_PATTERN.test(value)) {
    throw new Error("The package name must not contain control characters.");
  }
  return value;
}

function lifecycleContext(name) {
  if (INSTALL_LIFECYCLE_EVENTS.has(name)) return "install";
  if (PACK_PUBLISH_LIFECYCLE_EVENTS.has(name)) return "pack-publish";
  return "other";
}

export function inspectPackageInstallScripts(source) {
  if (typeof source !== "string") {
    throw new TypeError("Paste a package.json JSON document.");
  }
  if (source.length > MAX_SOURCE_CHARACTERS) {
    throw new Error(
      `Input exceeds the ${MAX_SOURCE_CHARACTERS.toLocaleString("en-US")}-character limit.`,
    );
  }
  if (!source.trim()) throw new Error("The package.json input is empty.");

  let data;
  try {
    data = JSON.parse(source);
  } catch {
    throw new Error("The input is not valid JSON.");
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("The top-level JSON value must be an object.");
  }
  const looksLikeLockfile =
    Number.isInteger(data.lockfileVersion) &&
    (isRecord(data.packages) || isRecord(data.dependencies));
  if (looksLikeLockfile) {
    throw new Error(
      "Use the package's package.json; lockfiles generally do not contain script command text.",
    );
  }
  if (
    data.scripts !== undefined &&
    (!data.scripts ||
      typeof data.scripts !== "object" ||
      Array.isArray(data.scripts))
  ) {
    throw new Error('The package.json "scripts" field must be an object.');
  }

  const scriptEntries = Object.entries(data.scripts || {}).map(
    ([rawName, rawCommand]) => {
      const name = normalizeScriptName(rawName);
      if (typeof rawCommand !== "string") {
        throw new Error(`Script "${name}" must contain a string command.`);
      }
      return [name, rawCommand];
    },
  );
  if (scriptEntries.length > MAX_SCRIPTS) {
    throw new Error(
      `The scripts object contains ${scriptEntries.length.toLocaleString("en-US")} commands; the inspector accepts at most ${MAX_SCRIPTS.toLocaleString("en-US")} and does not create partial reports.`,
    );
  }

  const scripts = [];
  let totalCharacters = 0;
  for (const [name, rawCommand] of scriptEntries) {
    if (rawCommand.length > MAX_SCRIPT_CHARACTERS) {
      throw new Error(
        `Script "${name}" exceeds the ${MAX_SCRIPT_CHARACTERS.toLocaleString("en-US")}-character per-script limit.`,
      );
    }
    totalCharacters += rawCommand.length;
    if (totalCharacters > MAX_TOTAL_SCRIPT_CHARACTERS) {
      throw new Error(
        `Combined script text exceeds the ${MAX_TOTAL_SCRIPT_CHARACTERS.toLocaleString("en-US")}-character limit.`,
      );
    }
    const cues = findCues(rawCommand);
    const context = lifecycleContext(name);
    scripts.push({
      name,
      command: rawCommand,
      lifecycleContext: context,
      installLifecycle: context === "install",
      cues,
      reviewLevel:
        cues.length >= 3
          ? "multiple-cues"
          : cues.length
            ? "cue"
            : "no-pattern-cue",
    });
  }

  const installScripts = scripts.filter((script) => script.installLifecycle);
  const packPublishScripts = scripts.filter(
    (script) => script.lifecycleContext === "pack-publish",
  );
  const categoryCounts = Object.fromEntries(
    CUE_RULES.map((rule) => [
      rule.category,
      scripts.filter((script) =>
        script.cues.some((cue) => cue.category === rule.category),
      ).length,
    ]),
  );

  return {
    packageName: normalizePackageName(data.name),
    scripts,
    installScripts,
    counts: {
      scripts: scripts.length,
      installLifecycle: installScripts.length,
      packPublishLifecycle: packPublishScripts.length,
      scriptsWithCues: scripts.filter((script) => script.cues.length).length,
      scriptsWithoutPatternCues: scripts.filter((script) => !script.cues.length)
        .length,
    },
    categoryCounts,
    complete: true,
    truncated: false,
    omittedScriptCount: 0,
    limitations: [
      "Commands are parsed as inert text and are never executed.",
      "Pattern cues are review prompts, not proof that a script is harmful or safe.",
      "Install-lifecycle names follow npm's install and npm ci ordering; pack and publish-only hooks are reported separately.",
      "Shell aliases, referenced files, platform-specific expansion, and runtime behavior are not resolved.",
      "No pattern cue does not mean no risk; inspect the package source and installation context.",
    ],
  };
}

export function buildInstallScriptReport(result) {
  if (!result?.counts || !Array.isArray(result.scripts)) {
    throw new TypeError("An install-script inspection result is required.");
  }
  return {
    reportType: "altftool-inert-package-script-review",
    packageName: result.packageName,
    complete: result.complete !== false && !result.truncated,
    truncated: Boolean(result.truncated),
    omittedScriptCount: Number(result.omittedScriptCount) || 0,
    counts: { ...result.counts },
    categoryCounts: { ...result.categoryCounts },
    scripts: result.scripts.map((script) => ({
      name: script.name,
      command: script.command,
      lifecycleContext: script.lifecycleContext,
      installLifecycle: script.installLifecycle,
      reviewLevel: script.reviewLevel,
      cues: script.cues.map((cue) => ({ ...cue })),
    })),
    limitations: [...result.limitations],
  };
}
