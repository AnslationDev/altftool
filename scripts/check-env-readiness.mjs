import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const strict = process.argv.includes("--strict") || process.env.ALTFT_ENV_STRICT === "true";
const requireMonitoring = process.env.ALTFT_ENV_REQUIRE_MONITORING === "true";
const requireOptionalApiKeys = process.env.ALTFT_ENV_REQUIRE_OPTIONAL_API_KEYS === "true";

const envFileNames = [
  ".env",
  ".env.local",
  ".env.production",
  ".env.production.local",
];

const envRoots = [
  root,
  path.join(root, "altftoolweb"),
  path.join(root, "altftoolwebadmin"),
];

function stripOuterQuotes(value) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function parseEnvFile(filePath) {
  const values = {};
  const content = readFileSync(filePath, "utf8");

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const normalized = line.startsWith("export ") ? line.slice("export ".length).trim() : line;
    const separatorIndex = normalized.indexOf("=");
    if (separatorIndex <= 0) continue;

    const key = normalized.slice(0, separatorIndex).trim();
    const rawValue = normalized.slice(separatorIndex + 1);
    if (!/^[A-Z0-9_]+$/i.test(key)) continue;

    let value = stripOuterQuotes(rawValue);
    if (rawValue.trim().startsWith('"')) {
      value = value
        .replace(/\\n/g, "\n")
        .replace(/\\r/g, "\r")
        .replace(/\\t/g, "\t")
        .replace(/\\"/g, '"');
    }

    values[key] = value.trim();
  }

  return values;
}

function loadEnvSnapshot() {
  const filesLoaded = [];
  const values = {};

  for (const envRoot of envRoots) {
    for (const filename of envFileNames) {
      const filePath = path.join(envRoot, filename);
      if (!existsSync(filePath)) continue;

      Object.assign(values, parseEnvFile(filePath));
      filesLoaded.push(path.relative(root, filePath) || filename);
    }
  }

  return {
    filesLoaded,
    values: {
      ...values,
      ...process.env,
    },
  };
}

function envValue(env, name) {
  return typeof env[name] === "string" ? env[name].trim() : "";
}

function normalizePrivateKey(value) {
  return value.replace(/\\n/g, "\n").trim();
}

function parseFirebaseServiceAccount(rawValue = "") {
  const value = rawValue.trim();
  if (!value) return { account: null, error: null };

  try {
    const parsed = JSON.parse(value);
    return {
      account: {
        projectId: parsed.project_id || parsed.projectId || "",
        clientEmail: parsed.client_email || parsed.clientEmail || "",
        privateKey: parsed.private_key || parsed.privateKey || "",
      },
      error: null,
    };
  } catch {
    return {
      account: null,
      error: "must be valid service-account JSON.",
    };
  }
}

function validateUrl(value) {
  if (!value) return null;
  try {
    const parsed = new URL(value);
    if (!["http:", "https:"].includes(parsed.protocol)) return "must be an HTTP(S) URL.";
    return null;
  } catch {
    return "must be a valid URL.";
  }
}

function requiredWhen(mode) {
  if (mode === "always") return true;
  if (mode === "strict") return strict;
  if (mode === "monitoring") return requireMonitoring;
  if (mode === "optional-api") return requireOptionalApiKeys;
  return false;
}

function firebaseAdminCredentialResults(env) {
  const serviceAccountRaw = envValue(env, "FIREBASE_SERVICE_ACCOUNT");
  const { account: serviceAccount, error: serviceAccountError } =
    parseFirebaseServiceAccount(serviceAccountRaw);
  const rawValues = {
    FIREBASE_PROJECT_ID: envValue(env, "FIREBASE_PROJECT_ID"),
    FIREBASE_CLIENT_EMAIL: envValue(env, "FIREBASE_CLIENT_EMAIL"),
    FIREBASE_PRIVATE_KEY: envValue(env, "FIREBASE_PRIVATE_KEY"),
  };
  const effectiveValues = {
    FIREBASE_PROJECT_ID: rawValues.FIREBASE_PROJECT_ID || serviceAccount?.projectId || "",
    FIREBASE_CLIENT_EMAIL: rawValues.FIREBASE_CLIENT_EMAIL || serviceAccount?.clientEmail || "",
    FIREBASE_PRIVATE_KEY: rawValues.FIREBASE_PRIVATE_KEY || serviceAccount?.privateKey || "",
  };
  const entries = [
    {
      name: "FIREBASE_PROJECT_ID",
    },
    {
      name: "FIREBASE_CLIENT_EMAIL",
      validate: (value) => (value && !value.includes("@") ? "must be a service-account email." : null),
    },
    {
      name: "FIREBASE_PRIVATE_KEY",
      validate: (value) => {
        const normalized = normalizePrivateKey(value);
        if (!value) return null;
        if (
          !normalized.includes("-----BEGIN PRIVATE KEY-----") ||
          !normalized.includes("-----END PRIVATE KEY-----")
        ) {
          return "must be the full PEM private key.";
        }
        return null;
      },
    },
  ];
  const results = serviceAccountRaw
    ? [{
        group: "Admin service-account config",
        name: "FIREBASE_SERVICE_ACCOUNT",
        level: serviceAccountError ? "fail" : "pass",
        message: serviceAccountError || "configured",
      }]
    : [];

  for (const entry of entries) {
    const value = effectiveValues[entry.name];
    const rawValue = rawValues[entry.name];
    const missing = !value;
    const validationError = value && entry.validate ? entry.validate(value) : null;
    const level = missing && strict ? "fail" : missing ? "warn" : validationError ? "fail" : "pass";

    results.push({
      group: "Admin service-account config",
      name: entry.name,
      level,
      message: missing
        ? strict
          ? "required but missing"
          : "not configured"
        : validationError ||
          (rawValue ? "configured" : "configured via FIREBASE_SERVICE_ACCOUNT"),
    });
  }

  return results;
}

const checks = [
  {
    name: "Public Firebase web config",
    entries: [
      { name: "NEXT_PUBLIC_FIREBASE_API_KEY", required: "strict" },
      { name: "NEXT_PUBLIC_FIREBASE_PROJECT_ID", required: "strict" },
      { name: "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET", required: "strict" },
      { name: "NEXT_PUBLIC_FIREBASE_APP_ID", required: "strict" },
    ],
  },
  {
    name: "Admin service-account config",
    evaluate: firebaseAdminCredentialResults,
  },
  {
    name: "Production monitoring",
    entries: [
      { name: "ALTFT_MONITOR_WEB_URL", required: "monitoring", validate: validateUrl },
      { name: "ALTFT_MONITOR_ADMIN_URL", required: "monitoring", validate: validateUrl },
      {
        name: "ALTFT_MONITOR_ADMIN_TOKEN",
        required: "monitoring",
        validate: (value) => (value && value.length < 12 ? "looks too short for an admin health token." : null),
      },
    ],
  },
  {
    name: "Optional AI and map integrations",
    entries: [
      { name: "GROQ_API_KEY", required: "optional-api" },
      { name: "OPENROUTER_API_KEY", required: "optional-api" },
      { name: "NEXT_PUBLIC_DEEPSEEK_API_KEY", required: "optional-api" },
      { name: "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY", required: "optional-api" },
      { name: "NEXT_PUBLIC_FIREBASE_VAPID_KEY", required: "optional-api" },
    ],
  },
];

const snapshot = loadEnvSnapshot();
const results = [];

for (const group of checks) {
  if (typeof group.evaluate === "function") {
    results.push(...group.evaluate(snapshot.values));
    continue;
  }

  for (const entry of group.entries) {
    const value = envValue(snapshot.values, entry.name);
    const isRequired = requiredWhen(entry.required);
    const missing = !value;
    const validationError = value && entry.validate ? entry.validate(value) : null;
    const level = missing && isRequired ? "fail" : missing ? "warn" : validationError ? "fail" : "pass";

    results.push({
      group: group.name,
      name: entry.name,
      level,
      message: missing
        ? isRequired
          ? "required but missing"
          : "not configured"
        : validationError || "configured",
    });
  }
}

const failures = results.filter((result) => result.level === "fail");
const warnings = results.filter((result) => result.level === "warn");

console.log(`Environment readiness: ${strict ? "strict" : "advisory"}`);
console.log(`Loaded env files: ${snapshot.filesLoaded.length ? snapshot.filesLoaded.join(", ") : "none"}`);

let currentGroup = "";
for (const result of results) {
  if (result.group !== currentGroup) {
    currentGroup = result.group;
    console.log(`\n${currentGroup}`);
  }
  console.log(`  ${result.level.toUpperCase()} ${result.name}: ${result.message}`);
}

console.log("\nSummary");
console.log(JSON.stringify({
  ok: failures.length === 0,
  strict,
  requireMonitoring,
  requireOptionalApiKeys,
  failures: failures.map(({ group, name, message }) => ({ group, name, message })),
  warnings: warnings.map(({ group, name, message }) => ({ group, name, message })),
}, null, 2));

if (failures.length > 0) process.exit(1);
