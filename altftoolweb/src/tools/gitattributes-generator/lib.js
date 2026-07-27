/**
 * .gitattributes generator.
 *
 * Attribute semantics are taken from the official git documentation
 * (git-scm.com/docs/gitattributes) and the Git LFS docs (git-lfs.com):
 * - `* text=auto`        — git decides which files are text and normalizes them to LF
 *                          in the repository (the setting GitHub's own docs recommend).
 * - `eol=lf` / `eol=crlf`— force the working-tree line ending for matching paths.
 * - `binary`             — built-in macro attribute equivalent to `-text -diff -merge`.
 * - `filter=lfs diff=lfs merge=lfs -text`
 *                        — exactly what `git lfs track` writes for a tracked pattern.
 * - `export-ignore`      — path is omitted from archives made with `git archive`
 *                          (this is how GitHub builds "Download ZIP" and release tarballs).
 * - `diff=<driver>`      — use a custom diff driver configured in git config.
 * - `linguist-generated=true` / `linguist-vendored`
 *                        — GitHub Linguist attributes that hide files from diffs and
 *                          exclude them from language statistics (github/linguist docs).
 */

/** Global line-ending policies. Lines follow git-scm.com/docs/gitattributes examples. */
export const LINE_ENDING_POLICIES = [
  {
    id: "auto",
    label: "Normalize — LF in repo, native line endings on checkout",
    lines: ["* text=auto"],
  },
  {
    id: "lf",
    label: "LF everywhere — LF in repo AND in every working tree",
    lines: ["* text=auto eol=lf"],
  },
  { id: "none", label: "No global rule (repository default behaviour)", lines: [] },
];

/**
 * Windows script files must keep CRLF or cmd.exe can mis-execute them —
 * the standard exception carved out even in LF-everywhere setups.
 */
export const WINDOWS_SCRIPT_LINES = ["*.bat text eol=crlf", "*.cmd text eol=crlf", "*.ps1 text eol=crlf"];

/** Shell scripts must be LF or sh/bash fails with `\r: command not found`. */
export const SHELL_SCRIPT_LINES = ["*.sh text eol=lf"];

/** Common binary formats marked with the `binary` macro so git never mangles or diffs them. */
export const DEFAULT_BINARY_PATTERNS = "*.png, *.jpg, *.gif, *.ico, *.woff2, *.pdf, *.zip";

/** Common large-media formats teams put in LFS. */
export const DEFAULT_LFS_PATTERNS = "*.psd, *.mp4, *.zip";

// A gitattributes pattern cannot contain unescaped whitespace — whitespace
// separates the pattern from its attributes (git-scm.com/docs/gitattributes).
const PATTERN_RE = /^[^\s]+$/;
// Diff driver names become git config keys (diff.<name>.*), keep them word-safe.
const DRIVER_NAME_RE = /^[A-Za-z][A-Za-z0-9_-]*$/;

/** Split a comma/newline separated list into trimmed non-empty entries. */
export function splitPatterns(value) {
  return String(value || "")
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Build the .gitattributes content.
 *
 * @param {object} input
 * @param {string} input.policyId          One of LINE_ENDING_POLICIES ids.
 * @param {boolean} input.windowsScripts   Keep .bat/.cmd/.ps1 as CRLF.
 * @param {boolean} input.shellScripts     Force .sh to LF.
 * @param {string} input.binaryPatterns    Comma/newline separated patterns for `binary`.
 * @param {string} input.lfsPatterns       Comma/newline separated patterns for Git LFS.
 * @param {string} input.exportIgnore      Comma/newline separated paths for `export-ignore`.
 * @param {string} input.generatedPatterns Comma/newline separated patterns for linguist-generated.
 * @param {Array<{pattern:string,driver:string}>} input.diffDrivers
 * @returns {object} { content, lineCount, ruleCount, sections } or { error }.
 */
export function generateGitattributes({
  policyId,
  windowsScripts = false,
  shellScripts = false,
  binaryPatterns = "",
  lfsPatterns = "",
  exportIgnore = "",
  generatedPatterns = "",
  diffDrivers = [],
}) {
  const policy = LINE_ENDING_POLICIES.find((p) => p.id === policyId);
  if (!policy) return { error: "Choose a line-ending policy." };

  const binary = splitPatterns(binaryPatterns);
  const lfs = splitPatterns(lfsPatterns);
  const exported = splitPatterns(exportIgnore);
  const generated = splitPatterns(generatedPatterns);

  const allPatterns = [...binary, ...lfs, ...exported, ...generated];
  const invalid = allPatterns.find((p) => !PATTERN_RE.test(p));
  if (invalid) {
    return {
      error: `"${invalid}" is not a valid pattern — gitattributes patterns cannot contain spaces.`,
    };
  }

  const drivers = diffDrivers
    .map((d) => ({ pattern: String(d.pattern || "").trim(), driver: String(d.driver || "").trim() }))
    .filter((d) => d.pattern !== "" || d.driver !== "");
  for (const d of drivers) {
    if (d.pattern === "" || d.driver === "") {
      return { error: "Every diff-driver row needs both a pattern and a driver name." };
    }
    if (!PATTERN_RE.test(d.pattern)) {
      return { error: `"${d.pattern}" is not a valid pattern — no spaces allowed.` };
    }
    if (!DRIVER_NAME_RE.test(d.driver)) {
      return {
        error: `"${d.driver}" is not a valid diff driver name — use letters, digits, - and _ only.`,
      };
    }
  }

  const sections = [];

  if (policy.lines.length > 0) {
    sections.push({ title: "Line endings", lines: policy.lines });
  }
  const eolExceptions = [
    ...(windowsScripts ? WINDOWS_SCRIPT_LINES : []),
    ...(shellScripts ? SHELL_SCRIPT_LINES : []),
  ];
  if (eolExceptions.length > 0) {
    sections.push({ title: "Line-ending exceptions", lines: eolExceptions });
  }
  if (binary.length > 0) {
    sections.push({ title: "Binary files (never normalize, diff or merge)", lines: binary.map((p) => `${p} binary`) });
  }
  if (lfs.length > 0) {
    sections.push({
      title: "Git LFS tracked files",
      lines: lfs.map((p) => `${p} filter=lfs diff=lfs merge=lfs -text`),
    });
  }
  if (exported.length > 0) {
    sections.push({
      title: "Excluded from git archive exports",
      lines: exported.map((p) => `${p} export-ignore`),
    });
  }
  if (generated.length > 0) {
    sections.push({
      title: "Generated files (collapsed in GitHub diffs, ignored by Linguist)",
      lines: generated.map((p) => `${p} linguist-generated=true`),
    });
  }
  if (drivers.length > 0) {
    sections.push({
      title: "Custom diff drivers (configure diff.<name>.textconv or .command in git config)",
      lines: drivers.map((d) => `${d.pattern} diff=${d.driver}`),
    });
  }

  if (sections.length === 0) {
    return { error: "Nothing selected — enable a policy or add at least one pattern." };
  }

  const content = `${sections
    .map((s) => `# ${s.title}\n${s.lines.join("\n")}`)
    .join("\n\n")}\n`;

  const ruleCount = sections.reduce((sum, s) => sum + s.lines.length, 0);

  return {
    content,
    sections,
    ruleCount,
    lineCount: content.trimEnd().split("\n").length,
    renormalizeHint:
      "After committing .gitattributes to an existing repository, run `git add --renormalize .` so already-tracked files pick up the new line-ending rules.",
  };
}
