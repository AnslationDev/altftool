/**
 * npm scripts composition — hooks, parallel/sequential runs, cross-platform checks.
 *
 * Rules encoded here and their sources:
 *  - pre<name>/post<name> hooks run automatically around <name>
 *    (npm docs, "scripts": pre & post scripts).
 *  - Lifecycle script names npm itself calls during install/publish
 *    (npm docs, "scripts": life cycle scripts).
 *  - On Windows, npm runs scripts through cmd.exe by default, where:
 *      VAR=value cmd   -> "'VAR' is not recognized"  (use cross-env)
 *      $VAR            -> not expanded (cmd uses %VAR%)
 *      single quotes   -> not quoting characters at all
 *      rm/cp/mv/ln     -> do not exist                (use rimraf/cpy-cli/shx)
 *      cmd1 & cmd2     -> runs SEQUENTIALLY, not in background
 *    (npm/cmd.exe behaviour; the standard fixes are the cross-env, rimraf,
 *     npm-run-all and concurrently packages.)
 *
 * Pure module — no React, no DOM.
 */

/** Script names npm runs automatically as part of its own lifecycle (npm docs). */
export const LIFECYCLE_NAMES = [
  "preinstall", "install", "postinstall",
  "prepare", "prepack", "postpack",
  "prepublish", "prepublishOnly", "publish", "postpublish",
  "preversion", "version", "postversion",
];

/** Well-known runnable names with dedicated npm commands (npm test / start / stop / restart). */
export const SHORTCUT_NAMES = ["test", "start", "stop", "restart"];

export const RUNNERS = [
  { id: "npm-run-all", label: "npm-run-all (run-s / run-p)" },
  { id: "concurrently", label: "concurrently" },
  { id: "shell", label: "plain shell (&& / &)" },
];

const NAME_PATTERN = /^[A-Za-z0-9:_.-]+$/;

/** Parse "name = command" lines. */
export function parseScriptLines(text) {
  const entries = [];
  const seen = new Set();
  for (const line of String(text ?? "").split("\n")) {
    const trimmed = line.trim();
    if (trimmed === "" || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([^=]+?)\s*=\s*(.+)$/);
    if (!match) return { ok: false, message: `Line "${trimmed}" must look like: name = command` };
    const key = match[1].trim();
    const command = match[2].trim();
    if (!NAME_PATTERN.test(key)) {
      return { ok: false, message: `"${key}" is not a valid script name (letters, digits, : _ . - only).` };
    }
    if (seen.has(key)) return { ok: false, message: `Script "${key}" is defined twice.` };
    seen.add(key);
    entries.push([key, command]);
  }
  return { ok: true, entries };
}

/** Cross-platform hazards in one command; returns [{issue, fix, dep}] */
export function auditCommand(command) {
  const findings = [];
  const cmd = String(command ?? "");
  if (/(^|&&|\|\||;)\s*[A-Z_][A-Z0-9_]*=\S/.test(cmd)) {
    findings.push({
      issue: "Inline VAR=value env assignment fails in cmd.exe",
      fix: "prefix with cross-env",
      dep: "cross-env",
    });
  }
  if (/\brm\s+(-\w+\s+)*/.test(cmd)) {
    findings.push({ issue: "rm does not exist on Windows", fix: "use rimraf", dep: "rimraf" });
  }
  if (/\b(cp|mv|ln)\s/.test(cmd)) {
    findings.push({ issue: "cp/mv/ln do not exist on Windows", fix: "use shx or cpy-cli", dep: "shx" });
  }
  if (/'[^']*'/.test(cmd)) {
    findings.push({
      issue: "Single quotes are not quoting characters in cmd.exe",
      fix: 'use escaped double quotes \\"...\\"',
      dep: null,
    });
  }
  if (/[^&]&[^&]/.test(cmd)) {
    findings.push({
      issue: "A single & does not background in cmd.exe (it runs sequentially)",
      fix: "use npm-run-all or concurrently for parallel",
      dep: "npm-run-all",
    });
  }
  if (/\$[A-Za-z_]/.test(cmd) && !/\$\(/.test(cmd)) {
    findings.push({
      issue: "$VAR expansion is POSIX-only (cmd.exe uses %VAR%)",
      fix: "read env in JS, or use cross-env-shell",
      dep: "cross-env",
    });
  }
  return findings;
}

/**
 * Build the scripts block.
 * @returns {{scripts:object, json:string, hookNotes:string[], warnings:string[], suggestedDevDeps:string[]}} or {error}
 */
export function buildNpmScripts(options = {}) {
  const {
    scriptsText = "",
    combinedName = "",
    combinedMembers = "",
    combinedMode = "sequential", // sequential | parallel
    runner = "npm-run-all",
  } = options;

  const parsed = parseScriptLines(scriptsText);
  if (!parsed.ok) return { error: parsed.message };
  if (parsed.entries.length === 0) return { error: "Add at least one script line, e.g. build = tsc." };

  const scripts = Object.fromEntries(parsed.entries);
  const names = parsed.entries.map(([name]) => name);
  const warnings = [];
  const hookNotes = [];
  const suggestedDevDeps = new Set();

  // pre/post hook detection (npm runs prex/postx automatically around x).
  for (const name of names) {
    for (const prefix of ["pre", "post"]) {
      if (name.startsWith(prefix)) {
        const base = name.slice(prefix.length);
        if (base && names.includes(base)) {
          hookNotes.push(
            `"${name}" runs automatically ${prefix === "pre" ? "before" : "after"} every "npm run ${base}".`,
          );
        } else if (base && !LIFECYCLE_NAMES.includes(name)) {
          warnings.push(
            `"${name}" looks like a ${prefix}-hook but there is no "${base}" script — it will only run when called explicitly.`,
          );
        }
      }
    }
    if (LIFECYCLE_NAMES.includes(name)) {
      warnings.push(
        `"${name}" is an npm lifecycle script — npm runs it automatically during install/publish, not just via npm run.`,
      );
    }
  }

  // Cross-platform audit of every command.
  for (const [name, command] of parsed.entries) {
    for (const finding of auditCommand(command)) {
      warnings.push(`"${name}": ${finding.issue} — ${finding.fix}.`);
      if (finding.dep) suggestedDevDeps.add(finding.dep);
    }
  }

  // Combined script.
  const combined = String(combinedName ?? "").trim();
  if (combined) {
    if (!NAME_PATTERN.test(combined)) {
      return { error: `"${combined}" is not a valid script name for the combined script.` };
    }
    if (scripts[combined]) return { error: `"${combined}" already exists — pick another name for the combined script.` };
    const members = String(combinedMembers ?? "")
      .split(/[\s,]+/)
      .map((m) => m.trim())
      .filter(Boolean);
    if (members.length < 2) return { error: "A combined script needs at least two member scripts." };
    for (const member of members) {
      if (!scripts[member]) return { error: `Combined script references "${member}", which is not defined above.` };
    }

    if (runner === "npm-run-all") {
      scripts[combined] = `${combinedMode === "parallel" ? "run-p" : "run-s"} ${members.join(" ")}`;
      suggestedDevDeps.add("npm-run-all");
    } else if (runner === "concurrently") {
      if (combinedMode === "parallel") {
        scripts[combined] = `concurrently ${members.map((m) => `"npm:${m}"`).join(" ")}`;
        suggestedDevDeps.add("concurrently");
      } else {
        // concurrently is a parallel tool; sequential falls back to &&.
        scripts[combined] = members.map((m) => `npm run ${m}`).join(" && ");
        warnings.push("concurrently only runs things in parallel — the sequential combo uses && instead.");
      }
    } else {
      scripts[combined] =
        combinedMode === "parallel"
          ? members.map((m) => `npm run ${m}`).join(" & ")
          : members.map((m) => `npm run ${m}`).join(" && ");
      if (combinedMode === "parallel") {
        warnings.push(
          "Plain & backgrounding is NOT cross-platform: cmd.exe runs the commands one after another. Use npm-run-all or concurrently.",
        );
        suggestedDevDeps.add("npm-run-all");
      }
    }
  }

  const json = JSON.stringify({ scripts }, null, 2);

  return {
    scripts,
    json,
    scriptCount: Object.keys(scripts).length,
    hookNotes,
    warnings,
    suggestedDevDeps: [...suggestedDevDeps],
    installHint:
      [...suggestedDevDeps].length > 0 ? `npm i -D ${[...suggestedDevDeps].join(" ")}` : "",
  };
}
