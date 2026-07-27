/**
 * Bash script scaffold generator.
 *
 * The generated skeleton follows widely accepted bash safety practice:
 *  - "unofficial strict mode" (set -euo pipefail, tight IFS) as popularised by
 *    Aaron Maxwell's writeup and enforced-in-spirit by ShellCheck;
 *  - -E so ERR traps are inherited by functions and subshells (bash(1), `set` builtin);
 *  - cleanup on EXIT via a single trap, mktemp -d for scratch space (mktemp(1));
 *  - flock(1) self-locking so overlapping runs never stack up;
 *  - `local` + `readonly` and quoted expansions per the Google Shell Style Guide.
 *
 * Pure module: no React, no DOM, no Date.now().
 */

/** bash(1): -e exit on error, -u error on unset vars, -o pipefail fail a pipeline
 *  on any stage, -E make ERR traps fire inside functions and command substitutions. */
export const STRICT_MODE_LINE = "set -Eeuo pipefail";

/** Restricting IFS to newline+tab stops accidental word-splitting on spaces —
 *  the second half of the "unofficial strict mode" recipe. */
export const STRICT_IFS_LINE = "IFS=$'\\n\\t'";

/** POSIX portable filename character set plus a leading letter — keeps the
 *  script name safe to use unquoted in paths, lock names and log lines. */
export const SCRIPT_NAME_PATTERN = /^[A-Za-z][A-Za-z0-9._-]*$/;

/** Conventional exit codes: 0 ok, 1 general error, 2 usage error (BSD sysexits
 *  uses 64, but 2 is what bash's own builtins and getopt tooling emit). */
export const EXIT_USAGE = 2;

export const SHEBANG_OPTIONS = [
  { id: "env", line: "#!/usr/bin/env bash", label: "#!/usr/bin/env bash — portable (finds bash on PATH)" },
  { id: "abs", line: "#!/bin/bash", label: "#!/bin/bash — fixed path (Linux default)" },
];

/** Valid identifier for a required-command check. */
const COMMAND_PATTERN = /^[A-Za-z0-9._+-]+$/;

/**
 * Build the scaffold.
 * @returns {{script:string, lineCount:number, features:string[], warnings:string[]}} or {error}
 */
export function buildBashScaffold(options = {}) {
  const {
    scriptName = "my-script",
    description = "One line describing what this script does.",
    shebang = "env",
    strictMode = true,
    errTrap = true,
    cleanupTrap = true,
    logging = true,
    lock = false,
    requireRoot = false,
    dependencies = "",
    verboseFlag = true,
    dryRunFlag = false,
  } = options;

  const name = String(scriptName ?? "").trim();
  if (!name) return { error: "Give the script a file name, e.g. backup.sh." };
  if (!SCRIPT_NAME_PATTERN.test(name)) {
    return {
      error:
        "Script name must start with a letter and use only letters, digits, dot, underscore or hyphen — no spaces.",
    };
  }
  if (name.length > 255) return { error: "A file name longer than 255 characters will not fit in most filesystems." };

  const shebangOption = SHEBANG_OPTIONS.find((item) => item.id === shebang) ?? SHEBANG_OPTIONS[0];

  const deps = String(dependencies ?? "")
    .split(/[\s,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
  for (const dep of deps) {
    if (!COMMAND_PATTERN.test(dep)) {
      return { error: `"${dep}" is not a valid command name for the dependency check.` };
    }
  }

  const desc = String(description ?? "").trim().replace(/\n+/g, " ") || "One line describing what this script does.";

  const features = [];
  const warnings = [];
  const lines = [];

  lines.push(shebangOption.line);
  lines.push("#");
  lines.push(`# ${name} — ${desc}`);
  lines.push("#");
  lines.push(`# Usage: ${name} [-h] [-v]${dryRunFlag ? " [-n]" : ""} <args...>`);
  lines.push("");

  if (strictMode) {
    lines.push("# Strict mode: exit on error (-e), unset vars are errors (-u),");
    lines.push("# pipelines fail on any stage (pipefail), ERR trap is inherited (-E).");
    lines.push(STRICT_MODE_LINE);
    lines.push(STRICT_IFS_LINE);
    lines.push("");
    features.push("strict mode");
  } else {
    warnings.push(
      "Without strict mode a failing command is silently ignored and typos in variable names expand to empty strings.",
    );
  }

  lines.push('readonly SCRIPT_NAME="$(basename "${BASH_SOURCE[0]}")"');
  lines.push('readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"');
  lines.push("");

  if (verboseFlag) lines.push("VERBOSE=0");
  if (dryRunFlag) lines.push("DRY_RUN=0");
  if (verboseFlag || dryRunFlag) lines.push("");

  if (logging) {
    lines.push("log() {");
    lines.push("  # ISO-8601 timestamped line to stderr so stdout stays clean for data.");
    lines.push("  printf '%s [%s] %s\\n' \"$(date '+%Y-%m-%dT%H:%M:%S%z')\" \"${SCRIPT_NAME}\" \"$*\" >&2");
    lines.push("}");
    lines.push("");
    if (verboseFlag) {
      lines.push("debug() {");
      lines.push('  [[ "${VERBOSE}" -eq 1 ]] && log "DEBUG: $*" || true');
      lines.push("}");
      lines.push("");
    }
    lines.push("die() {");
    lines.push('  log "ERROR: $*"');
    lines.push("  exit 1");
    lines.push("}");
    lines.push("");
    features.push("logging helpers");
  }

  lines.push("usage() {");
  lines.push("  cat <<EOF");
  lines.push(`${name} — ${desc}`);
  lines.push("");
  lines.push(`Usage: ${name} [OPTIONS] <args...>`);
  lines.push("");
  lines.push("Options:");
  lines.push("  -h    Show this help and exit");
  if (verboseFlag) lines.push("  -v    Verbose output");
  if (dryRunFlag) lines.push("  -n    Dry run — print what would happen, change nothing");
  lines.push("EOF");
  lines.push("}");
  lines.push("");
  features.push("usage()");

  if (errTrap) {
    lines.push("on_error() {");
    lines.push("  local exit_code=$1 line_no=$2");
    if (logging) {
      lines.push('  log "ERROR: command failed with exit ${exit_code} at line ${line_no}"');
    } else {
      lines.push('  printf \'%s: command failed with exit %s at line %s\\n\' "${SCRIPT_NAME}" "${exit_code}" "${line_no}" >&2');
    }
    lines.push("}");
    lines.push("trap 'on_error $? ${LINENO}' ERR");
    lines.push("");
    features.push("ERR trap");
    if (!strictMode) {
      warnings.push("An ERR trap without set -E is not inherited by functions — enable strict mode too.");
    }
  }

  if (cleanupTrap) {
    lines.push('TMP_DIR="$(mktemp -d)"');
    lines.push("cleanup() {");
    lines.push("  # Runs exactly once on any exit path — normal, error or signal.");
    lines.push('  rm -rf -- "${TMP_DIR}"');
    lines.push("}");
    lines.push("trap cleanup EXIT");
    lines.push("");
    features.push("EXIT cleanup + mktemp");
  }

  if (lock) {
    lines.push("# Self-locking: re-exec under flock so overlapping runs exit immediately.");
    lines.push('readonly LOCK_FILE="/tmp/${SCRIPT_NAME}.lock"');
    lines.push('if [[ "${FLOCKER:-}" != "${LOCK_FILE}" ]]; then');
    lines.push('  exec env FLOCKER="${LOCK_FILE}" flock -en "${LOCK_FILE}" "$0" "$@" || {');
    lines.push(`    echo "\${SCRIPT_NAME}: another instance is already running" >&2; exit ${EXIT_USAGE};`);
    lines.push("  }");
    lines.push("fi");
    lines.push("");
    features.push("flock guard");
  }

  if (requireRoot) {
    lines.push('if [[ "${EUID}" -ne 0 ]]; then');
    if (logging) {
      lines.push('  die "this script must be run as root (try sudo)"');
    } else {
      lines.push('  echo "${SCRIPT_NAME}: must be run as root" >&2');
      lines.push("  exit 1");
    }
    lines.push("fi");
    lines.push("");
    features.push("root check");
  }

  if (deps.length > 0) {
    lines.push("need_cmd() {");
    lines.push('  command -v "$1" >/dev/null 2>&1 || {');
    if (logging) {
      lines.push('    die "required command not found: $1"');
    } else {
      lines.push('    echo "${SCRIPT_NAME}: required command not found: $1" >&2; exit 1;');
    }
    lines.push("  }");
    lines.push("}");
    lines.push(deps.map((dep) => `need_cmd ${dep}`).join("\n"));
    lines.push("");
    features.push(`dependency check (${deps.length})`);
  }

  // Option parsing with getopts — bash builtin, no external getopt needed.
  const optString = ["h", verboseFlag ? "v" : "", dryRunFlag ? "n" : ""].join("");
  lines.push("main() {");
  lines.push("  local opt");
  lines.push(`  while getopts ':${optString}' opt; do`);
  lines.push('    case "${opt}" in');
  lines.push("      h) usage; exit 0 ;;");
  if (verboseFlag) lines.push("      v) VERBOSE=1 ;;");
  if (dryRunFlag) lines.push("      n) DRY_RUN=1 ;;");
  lines.push(`      \\?) usage >&2; exit ${EXIT_USAGE} ;;`);
  lines.push("    esac");
  lines.push("  done");
  lines.push("  shift $((OPTIND - 1))");
  lines.push("");
  if (logging) {
    lines.push('  log "starting"');
  }
  lines.push("  # ------------------------------------------------------------------");
  lines.push("  # Your script logic goes here. Positional args are in \"$@\".");
  lines.push("  # ------------------------------------------------------------------");
  if (logging) {
    lines.push('  log "done"');
  }
  lines.push("}");
  lines.push("");
  lines.push('main "$@"');

  const script = lines.join("\n");
  if (!lock) {
    warnings.push("No flock guard: if a run can outlast its schedule interval, instances will overlap.");
  }
  warnings.push("Run the result through ShellCheck (shellcheck.net) after adding your own logic.");

  return {
    script,
    lineCount: lines.length,
    features,
    warnings,
    charCount: script.length,
  };
}
