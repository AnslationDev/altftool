/**
 * .gitignore builder by stack.
 *
 * Pattern syntax follows the gitignore format documented in git (man gitignore):
 * one glob per line, trailing "/" matches directories only, "#" starts a comment,
 * "!" re-includes. The pattern sets below track the well-known community
 * templates maintained at github.com/github/gitignore (the same sets GitHub
 * offers when creating a repository), trimmed to their high-signal entries.
 */

export const TEMPLATE_GROUPS = ["Language", "Framework", "IDE / Editor", "Operating system"];

export const TEMPLATES = [
  // Languages
  {
    id: "node",
    label: "Node.js",
    group: "Language",
    patterns: [
      "node_modules/",
      "npm-debug.log*",
      "yarn-debug.log*",
      "yarn-error.log*",
      "pnpm-debug.log*",
      ".npm/",
      ".yarn/cache/",
      ".pnp.*",
      "dist/",
      "coverage/",
      ".env",
      ".env.local",
      ".env.*.local",
      "*.tgz",
    ],
  },
  {
    id: "python",
    label: "Python",
    group: "Language",
    patterns: [
      "__pycache__/",
      "*.py[cod]",
      "*.egg-info/",
      ".eggs/",
      "build/",
      "dist/",
      ".venv/",
      "venv/",
      ".mypy_cache/",
      ".pytest_cache/",
      ".ruff_cache/",
      ".coverage",
      "htmlcov/",
    ],
  },
  {
    id: "java",
    label: "Java",
    group: "Language",
    patterns: ["*.class", "*.jar", "*.war", "*.ear", "target/", ".gradle/", "build/", "out/", "hs_err_pid*"],
  },
  {
    id: "go",
    label: "Go",
    group: "Language",
    patterns: ["*.exe", "*.test", "*.out", "bin/", "go.work.sum"],
  },
  {
    id: "rust",
    label: "Rust",
    group: "Language",
    patterns: ["target/", "**/*.rs.bk", "*.pdb"],
  },
  {
    id: "ruby",
    label: "Ruby",
    group: "Language",
    patterns: ["*.gem", ".bundle/", "vendor/bundle/", "log/", "tmp/", ".byebug_history"],
  },
  {
    id: "php",
    label: "PHP",
    group: "Language",
    patterns: ["vendor/", "composer.phar", "*.log", ".phpunit.result.cache"],
  },
  {
    id: "dotnet",
    label: ".NET / C#",
    group: "Language",
    patterns: ["bin/", "obj/", "*.user", "*.suo", "TestResults/", "artifacts/"],
  },
  {
    id: "cpp",
    label: "C / C++",
    group: "Language",
    patterns: ["*.o", "*.obj", "*.so", "*.dylib", "*.dll", "*.a", "*.lib", "*.exe", "*.out", "cmake-build-*/"],
  },
  // Frameworks
  {
    id: "nextjs",
    label: "Next.js",
    group: "Framework",
    patterns: [".next/", "out/", "next-env.d.ts", ".vercel/"],
  },
  {
    id: "vite",
    label: "Vite / React SPA",
    group: "Framework",
    patterns: ["dist/", "dist-ssr/", "*.local"],
  },
  {
    id: "django",
    label: "Django",
    group: "Framework",
    patterns: ["*.sqlite3", "media/", "staticfiles/", "local_settings.py"],
  },
  {
    id: "rails",
    label: "Ruby on Rails",
    group: "Framework",
    patterns: ["/log/*", "/tmp/*", "/storage/*", "/public/assets/", "config/master.key"],
  },
  {
    id: "terraform",
    label: "Terraform",
    group: "Framework",
    patterns: [".terraform/", "*.tfstate", "*.tfstate.*", "crash.log", "*.tfvars", "override.tf", "override.tf.json"],
  },
  // IDEs
  {
    id: "vscode",
    label: "VS Code",
    group: "IDE / Editor",
    patterns: [".vscode/", "*.code-workspace"],
  },
  {
    id: "jetbrains",
    label: "JetBrains (IntelliJ, WebStorm, PyCharm)",
    group: "IDE / Editor",
    patterns: [".idea/", "*.iml", "out/"],
  },
  {
    id: "vim",
    label: "Vim",
    group: "IDE / Editor",
    patterns: ["*.swp", "*.swo", "*~", ".netrwhist"],
  },
  {
    id: "sublime",
    label: "Sublime Text",
    group: "IDE / Editor",
    patterns: ["*.sublime-workspace"],
  },
  // Operating systems
  {
    id: "macos",
    label: "macOS",
    group: "Operating system",
    patterns: [".DS_Store", ".AppleDouble", ".LSOverride", "._*", ".Spotlight-V100", ".Trashes"],
  },
  {
    id: "windows",
    label: "Windows",
    group: "Operating system",
    patterns: ["Thumbs.db", "ehthumbs.db", "Desktop.ini", "$RECYCLE.BIN/"],
  },
  {
    id: "linux",
    label: "Linux",
    group: "Operating system",
    patterns: ["*~", ".directory", ".Trash-*", ".nfs*"],
  },
];

/**
 * Combine the selected templates into one .gitignore.
 * Duplicate patterns across templates are emitted once (first template wins);
 * a comment notes where a duplicate was skipped from.
 *
 * @param {object} input
 * @param {string[]} input.selectedIds  Template ids in TEMPLATES.
 * @param {string}  [input.extraPatterns]  Free-form extra lines appended in their own section.
 * @returns {{content:string, patternCount:number, duplicatesRemoved:number, sections:number, lineCount:number}|{error:string}}
 */
export function buildGitignore({ selectedIds, extraPatterns = "" }) {
  const ids = Array.isArray(selectedIds) ? selectedIds : [];
  const chosen = TEMPLATES.filter((template) => ids.includes(template.id));
  const extras = String(extraPatterns)
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");

  if (chosen.length === 0 && extras.length === 0) {
    return { error: "Pick at least one template (or add custom patterns)." };
  }

  const seen = new Set();
  const lines = ["# Generated .gitignore — combined stack templates", ""];
  let patternCount = 0;
  let duplicatesRemoved = 0;
  let sections = 0;

  for (const template of chosen) {
    sections += 1;
    lines.push(`# --- ${template.label} ---`);
    for (const pattern of template.patterns) {
      if (seen.has(pattern)) {
        duplicatesRemoved += 1;
        continue;
      }
      seen.add(pattern);
      lines.push(pattern);
      patternCount += 1;
    }
    lines.push("");
  }

  if (extras.length > 0) {
    sections += 1;
    lines.push("# --- Custom ---");
    for (const pattern of extras) {
      if (seen.has(pattern)) {
        duplicatesRemoved += 1;
        continue;
      }
      seen.add(pattern);
      lines.push(pattern);
      patternCount += 1;
    }
    lines.push("");
  }

  const content = lines.join("\n").trimEnd() + "\n";
  return {
    content,
    patternCount,
    duplicatesRemoved,
    sections,
    lineCount: content.split("\n").length - 1,
  };
}
