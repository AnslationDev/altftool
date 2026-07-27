/**
 * .dockerignore generation.
 *
 * Pattern semantics follow the Docker build docs: patterns are matched
 * against paths relative to the context root using Go's filepath.Match
 * rules extended with "**" (any number of directories) and "!" negation;
 * lines starting with "#" are comments.
 *
 * The ignore lists themselves mirror the caches/artifacts each toolchain
 * documents as machine-local (node_modules, __pycache__, Rust target/,
 * Maven/Gradle build dirs, .NET bin/obj, etc.).
 */

/** Cross-stack groups. */
export const COMMON_GROUPS = [
  {
    id: "vcs",
    label: "Version control",
    patterns: [".git", ".gitignore", ".gitattributes", ".github"],
  },
  {
    id: "docker",
    label: "Docker files themselves",
    patterns: ["Dockerfile*", "docker-compose*.yml", "compose*.yaml", ".dockerignore"],
  },
  {
    id: "env",
    label: "Secrets & env files",
    patterns: [".env", ".env.*", "*.pem", "*.key"],
  },
  {
    id: "editor",
    label: "Editor & OS clutter",
    patterns: [".vscode", ".idea", "*.swp", ".DS_Store", "Thumbs.db"],
  },
  {
    id: "ci",
    label: "CI configs",
    patterns: [".gitlab-ci.yml", ".circleci", ".travis.yml", "Jenkinsfile"],
  },
  {
    id: "docs",
    label: "Docs & meta",
    patterns: ["README.md", "CHANGELOG.md", "LICENSE", "docs"],
  },
  {
    id: "logs",
    label: "Logs & coverage",
    patterns: ["*.log", "logs", "coverage", ".nyc_output"],
  },
];

/** Per-toolchain ignore sets. */
export const STACK_PRESETS = [
  {
    id: "node",
    label: "Node.js",
    patterns: ["node_modules", "npm-debug.log*", "yarn-error.log", ".npm", ".next", ".nuxt", ".turbo"],
  },
  {
    id: "python",
    label: "Python",
    patterns: ["__pycache__", "*.pyc", "*.pyo", ".venv", "venv", ".pytest_cache", ".mypy_cache", "*.egg-info", ".tox"],
  },
  {
    id: "go",
    label: "Go",
    patterns: ["bin", "*.test", "*.out"],
  },
  {
    id: "rust",
    label: "Rust",
    patterns: ["target"],
  },
  {
    id: "java",
    label: "Java (Maven/Gradle)",
    patterns: ["target", "build", ".gradle", "*.class"],
  },
  {
    id: "dotnet",
    label: ".NET",
    patterns: ["bin", "obj", "*.user"],
  },
  {
    id: "php",
    label: "PHP (Composer)",
    patterns: ["vendor"],
  },
  {
    id: "ruby",
    label: "Ruby (Bundler)",
    patterns: ["vendor/bundle", ".bundle", "tmp"],
  },
];

/** Valid .dockerignore line: no leading/trailing whitespace kept, no newlines. */
const CUSTOM_PATTERN_RE = /^[!#]?[^\s][^\r\n]*$/;

/**
 * Build the .dockerignore content.
 *
 * @param {object} input
 * @param {string[]} input.stackIds  ids from STACK_PRESETS.
 * @param {string[]} input.groupIds  ids from COMMON_GROUPS.
 * @param {string}   input.custom    extra patterns, one per line.
 * @returns {{content: string, patternCount: number, notes: string[]} | {error: string}}
 */
export function buildDockerignore({ stackIds, groupIds, custom = "" }) {
  if (!Array.isArray(stackIds) || !Array.isArray(groupIds)) {
    return { error: "Choose the stacks and file groups to ignore." };
  }

  const customLines = String(custom)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line !== "");
  for (const line of customLines) {
    if (!CUSTOM_PATTERN_RE.test(line)) {
      return { error: `"${line}" is not a valid .dockerignore pattern.` };
    }
  }

  const selectedGroups = COMMON_GROUPS.filter((group) => groupIds.includes(group.id));
  const selectedStacks = STACK_PRESETS.filter((stack) => stackIds.includes(stack.id));
  if (selectedGroups.length === 0 && selectedStacks.length === 0 && customLines.length === 0) {
    return { error: "Select at least one stack, file group or custom pattern." };
  }

  const seen = new Set();
  const sections = [];
  let patternCount = 0;

  const addSection = (title, patterns) => {
    const fresh = patterns.filter((pattern) => {
      if (seen.has(pattern)) return false;
      seen.add(pattern);
      return true;
    });
    if (fresh.length === 0) return;
    patternCount += fresh.length;
    sections.push([`# ${title}`, ...fresh].join("\n"));
  };

  for (const group of selectedGroups) addSection(group.label, group.patterns);
  for (const stack of selectedStacks) addSection(stack.label, stack.patterns);
  if (customLines.length > 0) addSection("Custom", customLines);

  const notes = [];
  if (groupIds.includes("docker")) {
    notes.push(
      "Ignoring Dockerfile* only shrinks the context — BuildKit still reads the Dockerfile itself directly.",
    );
  }
  if (groupIds.includes("env")) {
    notes.push(
      "Keeping .env and key files out of the context prevents secrets from being baked into image layers.",
    );
  }
  if (stackIds.includes("node")) {
    notes.push(
      "node_modules is excluded so dependencies install inside the image — do not exclude it if your Dockerfile COPYs a prebuilt bundle.",
    );
  }
  notes.push(
    "Patterns are relative to the build-context root and use Go filepath.Match syntax plus ** and ! negation.",
  );

  return { content: sections.join("\n\n") + "\n", patternCount, notes };
}
