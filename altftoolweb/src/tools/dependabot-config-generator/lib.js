/**
 * Dependabot configuration generator.
 *
 * Emits a `.github/dependabot.yml` file following the schema documented at
 * https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/configuration-options-for-the-dependabot.yml-file
 *
 * Rules encoded from that schema:
 *  - `version: 2` is the only supported schema version.
 *  - Every `updates` entry requires `package-ecosystem`, `directory` and
 *    `schedule.interval`.
 *  - `schedule.interval` is one of daily | weekly | monthly (plus cron on
 *    Enterprise, which this tool does not target).
 *  - `schedule.day` applies only to weekly and defaults to monday.
 *  - `schedule.time` is 24-hour "HH:MM" and defaults to 05:00 UTC.
 *  - `open-pull-requests-limit` defaults to 5 when omitted; 0 disables
 *    version updates while keeping security updates.
 *  - `groups.<name>.update-types` accepts minor and patch groupings.
 *  - `ignore.update-types` uses the "version-update:semver-major" form.
 */

/** package-ecosystem values from the GitHub docs (public GitHub set). */
export const ECOSYSTEMS = [
  { id: "npm", label: "npm / yarn / pnpm" },
  { id: "github-actions", label: "GitHub Actions" },
  { id: "pip", label: "pip / Poetry / pipenv" },
  { id: "docker", label: "Docker" },
  { id: "gomod", label: "Go modules" },
  { id: "maven", label: "Maven" },
  { id: "gradle", label: "Gradle" },
  { id: "bundler", label: "Bundler (Ruby)" },
  { id: "cargo", label: "Cargo (Rust)" },
  { id: "composer", label: "Composer (PHP)" },
  { id: "nuget", label: "NuGet (.NET)" },
  { id: "mix", label: "Mix / Hex (Elixir)" },
  { id: "pub", label: "Pub (Dart / Flutter)" },
  { id: "terraform", label: "Terraform" },
  { id: "swift", label: "Swift Package Manager" },
  { id: "elm", label: "Elm" },
  { id: "gitsubmodule", label: "Git submodules" },
  { id: "devcontainers", label: "Dev containers" },
];

/** schedule.interval values (public GitHub; cron is Enterprise-only). */
export const INTERVALS = ["daily", "weekly", "monthly"];

/** schedule.day values, weekly only. Dependabot defaults to monday. */
export const WEEK_DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

/** Dependabot's documented default when open-pull-requests-limit is omitted. */
export const DEFAULT_OPEN_PR_LIMIT = 5;

/** The only schema version Dependabot accepts. */
export const SCHEMA_VERSION = 2;

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

const ECOSYSTEM_IDS = new Set(ECOSYSTEMS.map((entry) => entry.id));

/**
 * Quote a YAML scalar only when needed, so output stays idiomatic.
 * Timestamps like 05:00 must be quoted or YAML parses them as sexagesimal ints.
 */
function yamlScalar(value) {
  const text = String(value);
  if (/^[A-Za-z0-9/_.-]+$/.test(text) && !/^\d+$/.test(text)) return text;
  return `"${text.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

/**
 * Validate one update entry and return a plain-language error, or null.
 * @param {object} update
 * @param {number} index 0-based position, used in messages
 */
export function validateUpdate(update, index) {
  const position = `Entry ${index + 1}`;
  if (!ECOSYSTEM_IDS.has(update.ecosystem)) {
    return `${position}: choose a package ecosystem from the list.`;
  }
  const directory = String(update.directory ?? "").trim();
  if (directory === "" || !directory.startsWith("/")) {
    return `${position}: directory must start with "/" — use "/" for the repository root.`;
  }
  if (!INTERVALS.includes(update.interval)) {
    return `${position}: schedule interval must be daily, weekly or monthly.`;
  }
  if (update.interval === "weekly" && update.day && !WEEK_DAYS.includes(update.day)) {
    return `${position}: the schedule day must be a weekday name like monday.`;
  }
  if (update.time && !TIME_PATTERN.test(update.time)) {
    return `${position}: schedule time must be 24-hour HH:MM, e.g. 05:00.`;
  }
  const limit = Number(update.openPrLimit);
  if (update.openPrLimit !== "" && update.openPrLimit != null) {
    if (!Number.isInteger(limit) || limit < 0 || limit > 99) {
      return `${position}: open PR limit must be a whole number from 0 to 99 (0 disables version updates).`;
    }
  }
  return null;
}

/**
 * Build the dependabot.yml text.
 *
 * @param {object} input
 * @param {Array<object>} input.updates  entries of shape
 *   { ecosystem, directory, interval, day, time, timezone,
 *     openPrLimit, groupMinorPatch, ignoreMajor }
 * @returns {{yaml: string, updateCount: number}|{error: string}}
 */
export function buildDependabotConfig({ updates } = {}) {
  if (!Array.isArray(updates) || updates.length === 0) {
    return { error: "Add at least one package ecosystem to update." };
  }

  const seen = new Set();
  for (let index = 0; index < updates.length; index += 1) {
    const problem = validateUpdate(updates[index], index);
    if (problem) return { error: problem };
    const key = `${updates[index].ecosystem}|${String(updates[index].directory).trim()}`;
    if (seen.has(key)) {
      return {
        error: `Entry ${index + 1} duplicates an earlier ecosystem + directory pair — Dependabot rejects duplicates.`,
      };
    }
    seen.add(key);
  }

  const lines = [
    "# Generated dependabot.yml — place at .github/dependabot.yml",
    `version: ${SCHEMA_VERSION}`,
    "updates:",
  ];

  for (const update of updates) {
    const directory = String(update.directory).trim();
    lines.push(`  - package-ecosystem: ${yamlScalar(update.ecosystem)}`);
    lines.push(`    directory: ${yamlScalar(directory)}`);
    lines.push("    schedule:");
    lines.push(`      interval: ${update.interval}`);
    if (update.interval === "weekly" && update.day) {
      lines.push(`      day: ${update.day}`);
    }
    if (update.time) {
      lines.push(`      time: ${yamlScalar(update.time)}`);
    }
    if (update.timezone && String(update.timezone).trim() !== "") {
      lines.push(`      timezone: ${yamlScalar(String(update.timezone).trim())}`);
    }
    if (update.openPrLimit !== "" && update.openPrLimit != null) {
      const limit = Number(update.openPrLimit);
      if (limit !== DEFAULT_OPEN_PR_LIMIT) {
        lines.push(`    open-pull-requests-limit: ${limit}`);
      }
    }
    if (update.groupMinorPatch) {
      lines.push("    groups:");
      lines.push("      minor-and-patch:");
      lines.push("        update-types:");
      lines.push('          - "minor"');
      lines.push('          - "patch"');
    }
    if (update.ignoreMajor) {
      lines.push("    ignore:");
      lines.push('      - dependency-name: "*"');
      lines.push("        update-types:");
      lines.push('          - "version-update:semver-major"');
    }
  }

  return { yaml: `${lines.join("\n")}\n`, updateCount: updates.length };
}
