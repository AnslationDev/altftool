/**
 * Gemfile generator.
 *
 * Rules implemented from the Bundler Gemfile manual (bundler.io/man/gemfile.5)
 * and the RubyGems version specifier documentation:
 *  - A Gemfile must declare at least one source; the canonical one is
 *    https://rubygems.org.
 *  - The pessimistic operator "~>" allows the last declared digit to grow:
 *    ~> 1.2   means >= 1.2,   < 2.0
 *    ~> 1.2.3 means >= 1.2.3, < 1.3.0
 *    i.e. drop the final segment and increment the one before it.
 *  - Gems can be grouped; :development and :test are the conventional groups
 *    and `bundle install --without production` style deployment skips them.
 *  - A gem taken from git/github or a local path is unpinned by version, so
 *    Bundler resolves it from the ref you name instead of RubyGems.
 *  - `require: false` loads the gem for Bundler but not on Bundler.require.
 */

/** The canonical public gem host. */
export const DEFAULT_SOURCE = "https://rubygems.org";

/** Groups Bundler and Rails treat as conventional. */
export const COMMON_GROUPS = ["default", "development", "test", "production", "assets"];

/** Ruby releases commonly pinned at the top of a Gemfile. */
export const RUBY_VERSIONS = ["3.4.1", "3.3.6", "3.3.0", "3.2.6", "3.1.6", "3.0.7"];

/** Gem names are letters, digits, dashes, underscores and dots. */
const GEM_NAME_RE = /^[A-Za-z0-9][A-Za-z0-9_.-]*$/;

/** One RubyGems requirement, e.g. ">= 1.0", "~> 2.1.3", "!= 3.0". */
const REQUIREMENT_RE = /^(>=|<=|~>|!=|>|<|=)?\s*\d+(\.\d+)*(\.[A-Za-z][A-Za-z0-9]*)?$/;

/** Ruby version literal: 3.3.6, optionally with a pre-release suffix. */
const RUBY_VERSION_RE = /^\d+\.\d+(\.\d+)?(-?(preview|rc)\d*)?$/;

/**
 * Expand a pessimistic constraint into the explicit range RubyGems uses.
 * @param {string} raw e.g. "~> 1.2.3"
 * @returns {{ ok: boolean, reason?: string, lower?: string, upper?: string, text?: string }}
 */
export function expandPessimistic(raw) {
  const value = String(raw ?? "").trim();
  const match = /^~>\s*(\d+(?:\.\d+)*)$/.exec(value);
  if (!match) return { ok: false, reason: "Not a pessimistic (~>) constraint." };

  const parts = match[1].split(".").map(Number);
  if (parts.some((part) => !Number.isFinite(part))) {
    return { ok: false, reason: "Version segments must be numbers." };
  }

  // Drop the final segment, increment the segment that becomes last, then pad
  // back to the original width with zeros: ~> 1.2 -> < 2.0, ~> 1.2.3 -> < 1.3.0.
  const upperParts = parts.length === 1 ? [parts[0] + 1] : parts.slice(0, -1);
  if (parts.length > 1) upperParts[upperParts.length - 1] += 1;
  while (upperParts.length < parts.length) upperParts.push(0);

  const lower = parts.join(".");
  const upper = upperParts.join(".");
  return { ok: true, lower, upper, text: `>= ${lower}, < ${upper}` };
}

/** Validate a comma-separated RubyGems requirement string. */
export function validateRequirement(raw) {
  const value = String(raw ?? "").trim();
  if (!value) return { ok: true, empty: true }; // no constraint is legal
  for (const part of value.split(",")) {
    const token = part.trim();
    if (!token) return { ok: false, reason: `"${value}" has an empty requirement between commas.` };
    if (!REQUIREMENT_RE.test(token)) {
      return { ok: false, reason: `"${token}" is not a valid RubyGems requirement.` };
    }
  }
  return { ok: true, empty: false };
}

/** Validate a gem name. */
export function validateGemName(raw) {
  const value = String(raw ?? "").trim();
  if (!value) return { ok: false, reason: "Gem name is required." };
  if (!GEM_NAME_RE.test(value)) {
    return { ok: false, reason: `"${value}" is not a valid gem name.` };
  }
  return { ok: true };
}

function rubyString(value) {
  return `"${String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function gemLine(gem) {
  const parts = [`gem ${rubyString(gem.name)}`];

  const requirement = String(gem.requirement ?? "").trim();
  if (requirement) {
    for (const token of requirement.split(",")) parts.push(rubyString(token.trim()));
  }

  if (gem.github) parts.push(`github: ${rubyString(gem.github)}`);
  else if (gem.git) parts.push(`git: ${rubyString(gem.git)}`);
  if (gem.path) parts.push(`path: ${rubyString(gem.path)}`);
  if (gem.branch) parts.push(`branch: ${rubyString(gem.branch)}`);
  if (gem.tag) parts.push(`tag: ${rubyString(gem.tag)}`);
  if (gem.requireFalse) parts.push("require: false");

  return parts.join(", ");
}

/**
 * Build a Gemfile.
 *
 * @param {object} input
 * @param {string} [input.source]
 * @param {string} [input.rubyVersion]
 * @param {boolean} [input.useRubyFile]  emit `ruby file: ".ruby-version"`
 * @param {boolean} [input.useGemspec]   emit the `gemspec` directive
 * @param {Array<object>} [input.gems]
 * @returns {{content:string,warnings:string[],gemCount:number,groupCount:number,expansions:Array,lineCount:number}|{error:string}}
 */
export function buildGemfile(input = {}) {
  const {
    source = DEFAULT_SOURCE,
    rubyVersion = "",
    useRubyFile = false,
    useGemspec = false,
    gems = [],
  } = input;

  const src = String(source).trim();
  if (!src) return { error: "A Gemfile needs a source — https://rubygems.org for public gems." };
  if (!/^https?:\/\/\S+$/.test(src)) {
    return { error: "Source must be a full http:// or https:// URL." };
  }

  const warnings = [];
  if (src.startsWith("http://")) {
    warnings.push("An http:// gem source is not authenticated — prefer https:// so gems cannot be tampered with in transit.");
  }

  const ruby = String(rubyVersion).trim();
  if (!useRubyFile && ruby && !RUBY_VERSION_RE.test(ruby)) {
    return { error: `"${ruby}" is not a Ruby version literal — use something like 3.3.6.` };
  }

  const seen = new Set();
  const grouped = new Map();
  const ungrouped = [];
  const expansions = [];

  for (const raw of gems) {
    const name = String(raw?.name ?? "").trim();
    if (!name) continue;

    const nameCheck = validateGemName(name);
    if (!nameCheck.ok) return { error: nameCheck.reason };
    if (seen.has(name)) return { error: `"${name}" is listed more than once — Bundler rejects duplicate gems.` };
    seen.add(name);

    const requirement = String(raw?.requirement ?? "").trim();
    const requirementCheck = validateRequirement(requirement);
    if (!requirementCheck.ok) return { error: `Gem "${name}": ${requirementCheck.reason}` };

    const github = String(raw?.github ?? "").trim();
    const git = String(raw?.git ?? "").trim();
    const path = String(raw?.path ?? "").trim();
    const branch = String(raw?.branch ?? "").trim();
    const tag = String(raw?.tag ?? "").trim();

    if (github && !/^[\w.-]+\/[\w.-]+$/.test(github)) {
      return { error: `Gem "${name}": github: expects owner/repo, not "${github}".` };
    }
    if (github && git) {
      return { error: `Gem "${name}": use either github: or git:, not both.` };
    }
    if (path && (github || git)) {
      return { error: `Gem "${name}": a path: gem cannot also come from git.` };
    }
    if ((branch || tag) && !(github || git)) {
      return { error: `Gem "${name}": branch:/tag: only apply to a git or github source.` };
    }
    if (branch && tag) {
      return { error: `Gem "${name}": set branch: or tag:, not both.` };
    }
    if (requirement && (github || git || path)) {
      warnings.push(`"${name}" has both a version requirement and a git/path source — Bundler checks the version but still installs the ref you named.`);
    }

    const expansion = expandPessimistic(requirement);
    if (expansion.ok) expansions.push({ name, constraint: requirement, range: expansion.text });

    const gem = { name, requirement, github, git, path, branch, tag, requireFalse: Boolean(raw?.requireFalse) };
    const group = String(raw?.group ?? "").trim();

    if (!group || group === "default") ungrouped.push(gem);
    else {
      if (!grouped.has(group)) grouped.set(group, []);
      grouped.get(group).push(gem);
    }
  }

  if (seen.size === 0 && !useGemspec) {
    return { error: "Add at least one gem, or turn on the gemspec directive." };
  }

  const lines = [`source ${rubyString(src)}`];

  if (useRubyFile) lines.push("", 'ruby file: ".ruby-version"');
  else if (ruby) lines.push("", `ruby ${rubyString(ruby)}`);

  if (useGemspec) lines.push("", "gemspec");

  if (ungrouped.length > 0) {
    lines.push("");
    for (const gem of ungrouped) lines.push(gemLine(gem));
  }

  // Merge :development and :test into one block when they hold the same gems
  // is not safe in general, so each group gets its own block, in a stable order.
  const groupOrder = [...grouped.keys()].sort((a, b) => {
    const rank = (name) => {
      const index = COMMON_GROUPS.indexOf(name);
      return index === -1 ? COMMON_GROUPS.length : index;
    };
    return rank(a) - rank(b) || a.localeCompare(b);
  });

  for (const group of groupOrder) {
    lines.push("", `group :${group} do`);
    for (const gem of grouped.get(group)) lines.push(`  ${gemLine(gem)}`);
    lines.push("end");
  }

  const noConstraint = [...ungrouped, ...grouped.values()]
    .flat()
    .filter((gem) => !gem.requirement && !gem.git && !gem.github && !gem.path);
  if (noConstraint.length > 0) {
    warnings.push(
      `${noConstraint.length} gem(s) have no version requirement, so bundle update can jump a major version — Gemfile.lock is your only guard.`,
    );
  }

  const content = `${lines.join("\n")}\n`;

  return {
    content,
    warnings,
    gemCount: seen.size,
    groupCount: groupOrder.length,
    expansions,
    lineCount: content.split("\n").length - 1,
  };
}
