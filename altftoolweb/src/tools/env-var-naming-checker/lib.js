/**
 * Environment variable NAME checker.
 *
 * Rules and their sources:
 * - POSIX portable name: [A-Za-z_][A-Za-z0-9_]* — IEEE Std 1003.1-2017 §8.1
 *   "Environment Variable Definition". Names outside this set are not portable
 *   across shells, docker --env-file or exec*e() consumers.
 * - Case convention: POSIX §8.1 also notes that names consisting of lowercase
 *   letters are reserved for applications/shell-local use, while the system
 *   reserves uppercase names — practice is UPPER_SNAKE_CASE for exported vars.
 * - Reserved names/prefixes below each cite where the reservation comes from.
 */

/** IEEE Std 1003.1-2017 §8.1 portable environment-variable name. */
export const POSIX_NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

/**
 * Well-known variables owned by the OS, shell or linker. Overwriting them
 * changes system behaviour, so reusing the name for app config is a bug risk.
 */
export const RESERVED_NAMES = [
  { name: "PATH", source: "POSIX — executable search path" },
  { name: "HOME", source: "POSIX — user home directory" },
  { name: "USER", source: "POSIX convention — current user name" },
  { name: "LOGNAME", source: "POSIX — login name" },
  { name: "SHELL", source: "POSIX — login shell path" },
  { name: "PWD", source: "POSIX shell — current working directory" },
  { name: "IFS", source: "POSIX shell — field separator; overriding it is a classic injection vector" },
  { name: "PS1", source: "POSIX shell — primary prompt" },
  { name: "TERM", source: "POSIX — terminal type" },
  { name: "TZ", source: "POSIX — timezone" },
  { name: "LANG", source: "POSIX — default locale" },
  { name: "TMPDIR", source: "POSIX — temp directory location" },
  { name: "HOSTNAME", source: "shell convention — host name" },
  { name: "LD_PRELOAD", source: "glibc dynamic linker — preloaded shared objects" },
  { name: "LD_LIBRARY_PATH", source: "glibc dynamic linker — library search path" },
  { name: "NODE_OPTIONS", source: "Node.js — CLI options injected into every node process" },
  { name: "PYTHONPATH", source: "CPython — module search path" },
];

/**
 * Prefixes that belong to a platform. severity "error" = the platform rejects
 * or overrides user-set values; "warning" = collision-prone.
 */
export const RESERVED_PREFIXES = [
  {
    prefix: "GITHUB_",
    severity: "error",
    note: "GitHub Actions docs: custom variables may not use the GITHUB_ prefix — the runner reserves it.",
  },
  {
    prefix: "RUNNER_",
    severity: "warning",
    note: "Set by the GitHub Actions runner (RUNNER_OS, RUNNER_TEMP…) — your value can be shadowed.",
  },
  {
    prefix: "LC_",
    severity: "warning",
    note: "POSIX locale categories (LC_ALL, LC_CTYPE…) — libc interprets these, not your app.",
  },
  {
    prefix: "LD_",
    severity: "warning",
    note: "Interpreted by the glibc dynamic linker; secure-execution mode strips LD_* variables.",
  },
  {
    prefix: "DYLD_",
    severity: "warning",
    note: "Interpreted by the macOS dynamic linker; SIP strips DYLD_* for protected binaries.",
  },
  {
    prefix: "BASH_",
    severity: "warning",
    note: "Bash internal variables (BASH_VERSION, BASH_SOURCE…).",
  },
  {
    prefix: "npm_",
    severity: "warning",
    note: "npm injects npm_package_* and npm_config_* into script environments — collisions are silent.",
  },
  {
    prefix: "AWS_",
    severity: "warning",
    note: "Read by the AWS CLI/SDKs (AWS_REGION, AWS_ACCESS_KEY_ID…) — only use for their documented meaning.",
  },
  {
    prefix: "KUBERNETES_",
    severity: "warning",
    note: "Injected by Kubernetes into every pod (KUBERNETES_SERVICE_HOST…).",
  },
  {
    prefix: "VERCEL_",
    severity: "warning",
    note: "Populated by Vercel at build and runtime (VERCEL_ENV, VERCEL_URL…).",
  },
  {
    prefix: "HEROKU_",
    severity: "warning",
    note: "Populated by Heroku runtime/dyno metadata.",
  },
];

/**
 * Framework prefixes that EXPOSE the value to the client-side browser bundle.
 * Not reserved — but a secret under one of these prefixes is a leak.
 */
export const PUBLIC_EXPOSURE_PREFIXES = [
  { prefix: "NEXT_PUBLIC_", framework: "Next.js" },
  { prefix: "VITE_", framework: "Vite" },
  { prefix: "REACT_APP_", framework: "Create React App" },
  { prefix: "GATSBY_", framework: "Gatsby" },
  { prefix: "EXPO_PUBLIC_", framework: "Expo" },
  { prefix: "NUXT_PUBLIC_", framework: "Nuxt (runtimeConfig.public)" },
  { prefix: "PUBLIC_", framework: "SvelteKit / Astro" },
];

/** Name fragments that suggest the VALUE is a credential. */
export const SECRET_HINT_PATTERN =
  /(SECRET|TOKEN|PASSWORD|PASSWD|PWD|API_?KEY|PRIVATE|CREDENTIAL|DSN|ACCESS_?KEY|CLIENT_?SECRET)/i;

/** Kubernetes service discovery injects <SERVICE>_SERVICE_HOST/_SERVICE_PORT into pods. */
export const K8S_SERVICE_SUFFIX_PATTERN = /_SERVICE_(HOST|PORT)$/;

/**
 * Extract candidate names from free text: accepts one name per line, comma or
 * space separated names, or full KEY=VALUE .env lines (the part before "=").
 */
export function extractNames(text) {
  const names = [];
  for (const line of String(text ?? "").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed === "" || trimmed.startsWith("#")) continue;
    const beforeEq = trimmed.includes("=") ? trimmed.slice(0, trimmed.indexOf("=")) : trimmed;
    for (const token of beforeEq.replace(/^export\s+/, "").split(/[\s,;]+/)) {
      if (token !== "") names.push(token);
    }
  }
  return names;
}

/**
 * Check a list of environment variable names.
 *
 * @param {string} text Names (one per line / comma separated) or .env lines.
 * @returns {object} { results: [{name, issues:[{severity,message}]}],
 *   summary: { names, errors, warnings, clean } } or { error }.
 */
export function checkEnvVarNames(text) {
  const names = extractNames(text);
  if (names.length === 0) {
    return { error: "Enter at least one variable name (or paste .env lines)." };
  }

  const seen = new Set();
  const results = [];

  for (const name of names) {
    const issues = [];
    const add = (severity, message) => issues.push({ severity, message });

    if (!POSIX_NAME_PATTERN.test(name)) {
      if (/^[0-9]/.test(name)) {
        add("error", "Starts with a digit — POSIX names must begin with a letter or underscore.");
      } else {
        const bad = [...new Set(name.replace(/[A-Za-z0-9_]/g, "").split(""))].join(" ");
        add(
          "error",
          `Contains character(s) not allowed by POSIX ([A-Za-z_][A-Za-z0-9_]*): ${bad || "(whitespace)"}`,
        );
      }
    } else {
      if (/[a-z]/.test(name)) {
        add(
          "warning",
          "Contains lowercase letters — convention (and POSIX §8.1 reservation) is UPPER_SNAKE_CASE for exported variables.",
        );
      }
      if (/^__|__$/.test(name) || /^_$/.test(name)) {
        add("warning", "Leading/trailing double underscore — easy to misread and often used as a nesting delimiter.");
      }
    }

    const upper = name.toUpperCase();

    const reserved = RESERVED_NAMES.find((r) => r.name === upper);
    if (reserved) {
      add("error", `Reserved name: ${reserved.name} is owned by ${reserved.source}. Pick an app-specific name.`);
    }

    for (const { prefix, severity, note } of RESERVED_PREFIXES) {
      if (upper.startsWith(prefix.toUpperCase()) && !reserved) {
        add(severity, `Prefix ${prefix} — ${note}`);
        break;
      }
    }

    const exposure = PUBLIC_EXPOSURE_PREFIXES.find((p) => upper.startsWith(p.prefix));
    if (exposure) {
      if (SECRET_HINT_PATTERN.test(name.slice(exposure.prefix.length))) {
        add(
          "error",
          `${exposure.prefix} inlines the value into the ${exposure.framework} BROWSER bundle, but the name looks like a secret — this would publish the credential.`,
        );
      } else {
        add(
          "warning",
          `${exposure.prefix} makes the value public: ${exposure.framework} inlines it into client-side code.`,
        );
      }
    }

    if (K8S_SERVICE_SUFFIX_PATTERN.test(upper)) {
      add(
        "warning",
        "Ends with _SERVICE_HOST/_SERVICE_PORT — Kubernetes injects these names for service discovery and can shadow your value.",
      );
    }

    if (seen.has(upper)) {
      add("warning", "Duplicate of an earlier name in this list (names are case-insensitively confusable).");
    }
    seen.add(upper);

    results.push({ name, issues });
  }

  const errors = results.reduce((n, r) => n + r.issues.filter((i) => i.severity === "error").length, 0);
  const warnings = results.reduce((n, r) => n + r.issues.filter((i) => i.severity === "warning").length, 0);
  const clean = results.filter((r) => r.issues.length === 0).length;

  return { results, summary: { names: results.length, errors, warnings, clean } };
}

/** Plain-text report for the copy button. */
export function formatNameReport(result) {
  if (!result || result.error) return "";
  const lines = [
    `Env var name check: ${result.summary.names} name(s), ${result.summary.errors} error(s), ${result.summary.warnings} warning(s)`,
  ];
  for (const r of result.results) {
    if (r.issues.length === 0) lines.push(`OK ${r.name}`);
    else for (const i of r.issues) lines.push(`${i.severity.toUpperCase()} ${r.name}: ${i.message}`);
  }
  return lines.join("\n");
}
