import { promises as fs } from "node:fs";
import path from "node:path";

const SOURCE_EXTENSIONS = new Set([".js", ".jsx", ".mjs", ".ts", ".tsx"]);
const ENTRY_FILES = ["entry.js", "entry.jsx", "entry.ts", "entry.tsx"];
const RESOLVABLE_EXTENSIONS = [
  "",
  ".js",
  ".jsx",
  ".mjs",
  ".ts",
  ".tsx",
  ".json",
];
const IGNORED_DIRECTORIES = new Set([
  "node_modules",
  ".next",
  "dist",
  "coverage",
]);
const STATUS_ORDER = {
  broken: 0,
  partial: 1,
  "api-required": 2,
  working: 3,
};

const PLACEHOLDER_PATTERNS = [
  { key: "coming-soon", pattern: /\bcoming soon\b/i },
  { key: "not-implemented", pattern: /\bnot implemented\b/i },
  { key: "under-construction", pattern: /\bunder construction\b/i },
  { key: "todo", pattern: /\bTODO(?:\s*\(|\s*:)/ },
  {
    key: "not-implemented-error",
    pattern: /throw\s+new\s+Error\s*\(\s*["'`]not implemented/i,
  },
];

const INTERACTION_PATTERN =
  /\b(?:onClick|onChange|onSubmit|onInput|onDrop|onKeyDown|onPointerDown)\s*=|addEventListener\s*\(|\buseState\s*\(|\buseReducer\s*\(|<(?:form|input|textarea|select|button)\b/i;
const OUTPUT_PATTERN =
  /\b(?:clipboard|download|export|result|output|canvas|toDataURL|saveAs|createObjectURL|FileReader|MediaRecorder)\b/i;
const ENV_PATTERNS = [
  /process\.env\.([A-Z][A-Z0-9_]*)/g,
  /process\.env\[\s*["'`]([A-Z][A-Z0-9_]*)["'`]\s*\]/g,
  /\b(NEXT_PUBLIC_[A-Z][A-Z0-9_]*)\b/g,
];
const NETWORK_CALL_PATTERNS = [
  {
    transport: "fetch",
    pattern: /\bfetch\s*\(\s*([^,\n)]+)/g,
  },
  {
    transport: "axios",
    pattern: /\baxios(?:\.[a-z]+)?\s*\(\s*([^,\n)]+)/gi,
  },
  {
    transport: "websocket",
    pattern: /\bnew\s+WebSocket\s*\(\s*([^,\n)]+)/g,
  },
  {
    transport: "event-source",
    pattern: /\bnew\s+EventSource\s*\(\s*([^,\n)]+)/g,
  },
  {
    transport: "xhr",
    pattern: /\bXMLHttpRequest\b/g,
  },
];
const IGNORED_ENV_KEYS = new Set([
  "NODE_ENV",
  "NEXT_RUNTIME",
  "NEXT_PUBLIC_",
]);
const API_ENV_KEY_PATTERN =
  /(?:API|KEY|TOKEN|SECRET|ENDPOINT|URL|HOST|ORIGIN|PROJECT_ID|APP_ID|CLIENT_ID|VAPID)/;
const LOCAL_NETWORK_EXPRESSION_PATTERN =
  /^(?:dataUrl|dataURL|blobUrl|blobURL|objectUrl|objectURL|fileUrl|fileURL|imageDataUrl|imageDataURL)$/;

const PROVIDER_ENV_HINTS = [
  ["GOOGLE_MAPS", "Google Maps"],
  ["PAGESPEED", "Google PageSpeed"],
  ["YOUTUBE", "YouTube"],
  ["GEMINI", "Google Gemini"],
  ["FIREBASE", "Firebase"],
  ["OPENROUTER", "OpenRouter"],
  ["OPENAI", "OpenAI"],
  ["DEEPSEEK", "DeepSeek"],
  ["RAPIDAPI", "RapidAPI"],
  ["ALPHA_VANTAGE", "Alpha Vantage"],
  ["LINKPREVIEW", "LinkPreview"],
  ["REMOVE_BG", "remove.bg"],
  ["PLANT_ID", "Plant.id"],
  ["WHEREGOES", "WhereGoes"],
  ["SEARCH_BACKEND", "AltFTool Search Backend"],
  ["METAL_PRICE", "Metal Price API"],
  ["ADZUNA", "Adzuna"],
  ["GIPHY", "GIPHY"],
  ["GROQ", "Groq"],
];

const PROVIDER_HOST_HINTS = [
  ["googleapis.com", "Google APIs"],
  ["google.com", "Google"],
  ["youtube.com", "YouTube"],
  ["firebaseio.com", "Firebase"],
  ["firebaseapp.com", "Firebase"],
  ["openai.com", "OpenAI"],
  ["openrouter.ai", "OpenRouter"],
  ["rapidapi.com", "RapidAPI"],
  ["alphavantage.co", "Alpha Vantage"],
  ["giphy.com", "GIPHY"],
  ["remove.bg", "remove.bg"],
  ["plant.id", "Plant.id"],
  ["adzuna.com", "Adzuna"],
];

function clampScore(score) {
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(100, Math.round(score)));
}

async function pathIsFile(filePath) {
  try {
    return (await fs.stat(filePath)).isFile();
  } catch {
    return false;
  }
}

async function listSourceFiles(directory) {
  let entries = [];
  try {
    entries = await fs.readdir(directory, { withFileTypes: true });
  } catch {
    return [];
  }

  const files = [];
  for (const entry of entries) {
    if (entry.name.startsWith(".") || IGNORED_DIRECTORIES.has(entry.name))
      continue;
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listSourceFiles(absolutePath)));
      continue;
    }
    if (
      entry.isFile() &&
      SOURCE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())
    ) {
      files.push(absolutePath);
    }
  }
  return files;
}

async function findEntryFile(toolDirectory) {
  for (const filename of ENTRY_FILES) {
    const candidate = path.join(toolDirectory, filename);
    if (await pathIsFile(candidate)) return candidate;
  }
  return null;
}

function getRelativeImports(source = "") {
  const specifiers = [];
  const patterns = [
    /(?:import|export)\s+(?:[\s\S]*?\s+from\s+)?["'`]([^"'`]+)["'`]/g,
    /import\s*\(\s*["'`]([^"'`]+)["'`]\s*\)/g,
  ];

  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      if (match[1]?.startsWith(".")) specifiers.push(match[1]);
    }
  }
  return [...new Set(specifiers)];
}

async function resolveRelativeImport(importerPath, specifier) {
  const basePath = path.resolve(path.dirname(importerPath), specifier);
  for (const extension of RESOLVABLE_EXTENSIONS) {
    const candidate = `${basePath}${extension}`;
    if (await pathIsFile(candidate)) return candidate;
  }
  for (const extension of RESOLVABLE_EXTENSIONS.slice(1)) {
    const candidate = path.join(basePath, `index${extension}`);
    if (await pathIsFile(candidate)) return candidate;
  }
  return null;
}

function collectEnvKeys(source = "") {
  const keys = new Set();
  for (const pattern of ENV_PATTERNS) {
    pattern.lastIndex = 0;
    for (const match of source.matchAll(pattern)) {
      const key = match[1];
      if (key && !IGNORED_ENV_KEYS.has(key) && !key.endsWith("_")) {
        keys.add(key);
      }
    }
  }
  return [...keys].sort();
}

function providerFromEnvKey(envKey = "") {
  for (const [hint, provider] of PROVIDER_ENV_HINTS) {
    if (envKey.includes(hint)) return provider;
  }

  const label = envKey
    .replace(/^NEXT_PUBLIC_/, "")
    .replace(
      /_(?:API|API_KEY|KEY|TOKEN|SECRET|ENDPOINT|URL|HOST|ORIGIN)$/,
      "",
    )
    .replace(/_(?:PROJECT|APP|CLIENT)_ID$/, "")
    .split("_")
    .filter(Boolean)
    .map((part) => `${part[0]}${part.slice(1).toLowerCase()}`)
    .join(" ");
  return label || "External provider";
}

function providerFromHost(hostname = "") {
  const normalized = hostname.toLowerCase().replace(/^www\./, "");
  for (const [hint, provider] of PROVIDER_HOST_HINTS) {
    if (normalized === hint || normalized.endsWith(`.${hint}`)) return provider;
  }
  return normalized || "External provider";
}

function readEnvKeyFromExpression(expression = "") {
  return (
    expression.match(/process\.env\.([A-Z][A-Z0-9_]*)/)?.[1] ||
    expression.match(
      /process\.env\[\s*["'`]([A-Z][A-Z0-9_]*)["'`]\s*\]/,
    )?.[1] ||
    expression.match(/\b(NEXT_PUBLIC_[A-Z][A-Z0-9_]*)\b/)?.[1] ||
    null
  );
}

function literalTargetFromExpression(expression = "") {
  const trimmed = expression.trim();
  const quoted = trimmed.match(/^(["'`])([\s\S]*?)\1$/);
  if (!quoted) return null;

  return quoted[2].replace(/\$\{[^}]+\}/g, ":parameter");
}

function classifyNetworkExpression(expression = "", transport = "fetch") {
  if (transport === "xhr") {
    return {
      transport,
      kind: "dynamic",
      provider: "Runtime-provided endpoint",
      target: "Runtime-provided endpoint",
      envKey: null,
    };
  }

  const envKey = readEnvKeyFromExpression(expression);
  if (envKey && !IGNORED_ENV_KEYS.has(envKey) && !envKey.endsWith("_")) {
    return {
      transport,
      kind: "configured-endpoint",
      provider: providerFromEnvKey(envKey),
      target: `Environment: ${envKey}`,
      envKey,
    };
  }

  const literal = literalTargetFromExpression(expression);
  if (literal) {
    if (/^(?:data|blob):/i.test(literal)) {
      return {
        transport,
        kind: "browser-local",
        provider: "Browser",
        target: literal.split(":", 1)[0].toLowerCase(),
        envKey: null,
      };
    }
    if (literal.startsWith("/") || literal.startsWith("./")) {
      return {
        transport,
        kind: "same-origin",
        provider: "AltFTool API",
        target: literal.split(/[?#]/, 1)[0],
        envKey: null,
      };
    }
    if (/^https?:\/\//i.test(literal) || literal.startsWith("//")) {
      try {
        const parsed = new URL(
          literal.startsWith("//") ? `https:${literal}` : literal,
        );
        return {
          transport,
          kind: "external",
          provider: providerFromHost(parsed.hostname),
          target: `${parsed.hostname}${parsed.pathname}`,
          envKey: null,
        };
      } catch {
        // Keep malformed literals visible as dynamic runtime checks.
      }
    }
  }

  const normalizedExpression = expression
    .trim()
    .replace(/^\(+|\)+$/g, "")
    .trim();
  if (
    LOCAL_NETWORK_EXPRESSION_PATTERN.test(normalizedExpression) ||
    /\b(?:dataUrl|dataURL|blobUrl|blobURL|createObjectURL)\b/.test(expression)
  ) {
    return {
      transport,
      kind: "browser-local",
      provider: "Browser",
      target: "In-memory browser resource",
      envKey: null,
    };
  }

  return {
    transport,
    kind: "dynamic",
    provider: "Runtime-provided endpoint",
    target: "Runtime-provided endpoint",
    envKey: null,
  };
}

function collectNetworkSignals(source = "") {
  const signals = [];
  const seen = new Set();

  for (const { transport, pattern } of NETWORK_CALL_PATTERNS) {
    pattern.lastIndex = 0;
    for (const match of source.matchAll(pattern)) {
      const signal = classifyNetworkExpression(match[1] || "", transport);
      const key = [
        signal.transport,
        signal.kind,
        signal.provider,
        signal.target,
        signal.envKey || "",
      ].join("|");
      if (seen.has(key)) continue;
      seen.add(key);
      signals.push(signal);
    }
  }

  return signals;
}

function buildApiReadiness({
  envKeys,
  networkSignals,
  configuredEnvKeys,
}) {
  const apiEnvKeys = envKeys.filter((key) => API_ENV_KEY_PATTERN.test(key));
  const endpointSignals = networkSignals.filter(
    (signal) => signal.kind !== "browser-local",
  );
  const required = endpointSignals.length > 0 || apiEnvKeys.length > 0;
  const environment = apiEnvKeys.map((name) => ({
    name,
    configured: configuredEnvKeys.has(name),
  }));
  const missingEnvKeys = environment
    .filter((entry) => !entry.configured)
    .map((entry) => entry.name);
  const providerRows = new Map();

  function addProvider(name, kind, envKey = null) {
    if (!providerRows.has(name)) {
      providerRows.set(name, {
        name,
        kinds: new Set(),
        envKeys: new Set(),
      });
    }
    const row = providerRows.get(name);
    row.kinds.add(kind);
    if (envKey) row.envKeys.add(envKey);
  }

  for (const signal of endpointSignals) {
    addProvider(signal.provider, signal.kind, signal.envKey);
  }
  for (const envKey of apiEnvKeys) {
    addProvider(providerFromEnvKey(envKey), "configured-endpoint", envKey);
  }

  const providers = [...providerRows.values()]
    .map((provider) => {
      const requiredEnvKeys = [...provider.envKeys].sort();
      const configured =
        requiredEnvKeys.length > 0
          ? requiredEnvKeys.every((key) => configuredEnvKeys.has(key))
          : null;
      return {
        name: provider.name,
        kinds: [...provider.kinds].sort(),
        requiredEnvKeys,
        configured,
        status:
          configured === true
            ? "configured"
            : configured === false
              ? "missing-config"
              : "runtime-check",
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  let status = "not-required";
  if (required && missingEnvKeys.length) status = "missing-config";
  else if (required && apiEnvKeys.length) status = "configured";
  else if (required) status = "runtime-check";

  return {
    required,
    status,
    providers,
    endpoints: endpointSignals.map(
      ({ transport, kind, provider, target, envKey }) => ({
        transport,
        kind,
        provider,
        target,
        envKey,
      }),
    ),
    environment,
    requiredEnvKeys: apiEnvKeys,
    missingEnvKeys,
    browserLocalOperations: networkSignals.filter(
      (signal) => signal.kind === "browser-local",
    ).length,
  };
}

function collectPlaceholderSignals(source = "") {
  const signals = new Set();
  const actionableContext =
    /\b(?:alert|disabled|feature|onClick|showToast|toast|upgrade)\b|<button\b/i;

  for (const line of source.split(/\r?\n/)) {
    for (const { key, pattern } of PLACEHOLDER_PATTERNS) {
      if (!pattern.test(line)) continue;
      if (
        ["todo", "not-implemented", "not-implemented-error"].includes(key) ||
        actionableContext.test(line)
      ) {
        signals.add(key);
      }
    }
  }
  return [...signals];
}

function hasAutomatedTest({ slug, sourceFiles, functionalSpecSource }) {
  const localTest = sourceFiles.some((file) =>
    /\.(?:test|spec)\.(?:js|jsx|mjs|ts|tsx)$/i.test(file),
  );
  const functionalReference =
    functionalSpecSource.includes(`"${slug}"`) ||
    functionalSpecSource.includes(`'${slug}'`) ||
    functionalSpecSource.includes(`\`${slug}\``);
  return {
    covered: localTest || functionalReference,
    localTest,
    functionalReference,
  };
}

function readinessScore({
  status,
  automatedTest,
  interactionReady,
  outputReady,
}) {
  const baseScores = {
    broken: 20,
    partial: 58,
    "api-required": 78,
    working: 92,
  };
  let score = baseScores[status] ?? 0;
  if (automatedTest) score += 6;
  if (interactionReady && outputReady) score += 2;
  return clampScore(score);
}

function buildRecommendations({
  status,
  missingEntry,
  missingConfig,
  unresolvedImports,
  placeholderSignals,
  automatedTest,
  networkDependent,
  apiReadiness,
}) {
  const recommendations = [];
  if (missingEntry) recommendations.push("Add a routeable entry component.");
  if (missingConfig) recommendations.push("Add a complete tool.config.js.");
  if (unresolvedImports.length) {
    recommendations.push(
      "Repair unresolved relative imports from the entry module.",
    );
  }
  if (placeholderSignals.length) {
    recommendations.push(
      "Replace placeholder or unfinished implementation paths.",
    );
  }
  if (status === "partial" && !placeholderSignals.length) {
    recommendations.push(
      "Add a clear user action and observable result state.",
    );
  }
  if (networkDependent) {
    if (apiReadiness.missingEnvKeys.length) {
      recommendations.push(
        `Configure ${apiReadiness.missingEnvKeys.slice(0, 2).join(", ")} before runtime verification.`,
      );
    } else {
      recommendations.push(
        "Verify provider latency, timeout, fallback, and error states at runtime.",
      );
    }
  }
  if (!automatedTest) {
    recommendations.push(
      "Add one deterministic functional or unit regression test.",
    );
  }
  return recommendations.slice(0, 3);
}

async function analyzeTool({
  slug,
  tool,
  toolsRoot,
  functionalSpecSource,
  prioritySlugs,
  configuredEnvKeys,
}) {
  const toolDirectory = path.join(toolsRoot, slug);
  const [entryFile, hasConfig, sourceFiles] = await Promise.all([
    findEntryFile(toolDirectory),
    pathIsFile(path.join(toolDirectory, "tool.config.js")),
    listSourceFiles(toolDirectory),
  ]);
  const sourceRows = await Promise.all(
    sourceFiles.map(async (file) => ({
      file,
      source: await fs.readFile(file, "utf8").catch(() => ""),
    })),
  );
  const runtimeSourceRows = sourceRows.filter(
    ({ file }) => !/\.(?:test|spec)\.(?:js|jsx|mjs|ts|tsx)$/i.test(file),
  );
  const combinedSource = runtimeSourceRows
    .map(({ source }) => source)
    .join("\n");
  const entrySource = entryFile
    ? await fs.readFile(entryFile, "utf8").catch(() => "")
    : "";
  const unresolvedImports = [];

  if (entryFile) {
    for (const specifier of getRelativeImports(entrySource)) {
      if (!(await resolveRelativeImport(entryFile, specifier))) {
        unresolvedImports.push(specifier);
      }
    }
  }

  const tests = hasAutomatedTest({
    slug,
    sourceFiles,
    functionalSpecSource,
  });
  const envKeys = collectEnvKeys(combinedSource);
  const networkSignals = collectNetworkSignals(combinedSource);
  const apiReadiness = buildApiReadiness({
    envKeys,
    networkSignals,
    configuredEnvKeys,
  });
  const placeholderSignals = collectPlaceholderSignals(combinedSource);
  const interactionReady = INTERACTION_PATTERN.test(combinedSource);
  const outputReady = OUTPUT_PATTERN.test(combinedSource);
  const networkDependent = apiReadiness.endpoints.length > 0;
  const missingEntry = !entryFile;
  const missingConfig = !hasConfig;
  const structuralIssues = [
    ...(missingEntry ? ["Entry component missing"] : []),
    ...(missingConfig ? ["Tool config missing"] : []),
    ...unresolvedImports.map(
      (specifier) => `Unresolved entry import: ${specifier}`,
    ),
  ];

  let status = "working";
  if (structuralIssues.length) {
    status = "broken";
  } else if (placeholderSignals.length || (!interactionReady && !outputReady)) {
    status = "partial";
  } else if (apiReadiness.required) {
    status = "api-required";
  }

  const sourceBytes = runtimeSourceRows.reduce(
    (sum, { source }) => sum + Buffer.byteLength(source),
    0,
  );
  const score = readinessScore({
    status,
    automatedTest: tests.covered,
    interactionReady,
    outputReady,
  });
  const issues = [
    ...structuralIssues,
    ...placeholderSignals.map((signal) => `Unfinished signal: ${signal}`),
    ...(status === "partial" && !placeholderSignals.length
      ? ["No clear interactive input or generated output detected"]
      : []),
  ];

  return {
    slug,
    name: tool?.name || slug,
    category: Array.isArray(tool?.category)
      ? tool.category.join(", ")
      : tool?.category || "Other",
    route: `/tools/all/${slug}`,
    status,
    score,
    priority: prioritySlugs.has(slug),
    evidence: {
      entry: Boolean(entryFile),
      config: hasConfig,
      sourceFiles: sourceFiles.length,
      sourceBytes,
      unresolvedImports,
      interactive: interactionReady,
      output: outputReady,
      automatedTest: tests.covered,
      localTest: tests.localTest,
      functionalTest: tests.functionalReference,
      networkDependent,
      envKeys,
      networkSignals,
      placeholderSignals,
    },
    apiReadiness,
    issues,
    recommendations: buildRecommendations({
      status,
      missingEntry,
      missingConfig,
      unresolvedImports,
      placeholderSignals,
      automatedTest: tests.covered,
      networkDependent,
      apiReadiness,
    }),
  };
}

async function mapWithConcurrency(values, limit, mapper) {
  const results = new Array(values.length);
  let cursor = 0;

  async function worker() {
    while (cursor < values.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await mapper(values[index], index);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(limit, Math.max(values.length, 1)) }, worker),
  );
  return results;
}

function summarizeApiReadiness(items) {
  const apiItems = items.filter((item) => item.apiReadiness?.required);
  const counts = {
    configured: 0,
    "missing-config": 0,
    "runtime-check": 0,
  };
  const requiredEnvKeys = new Set();
  const configuredEnvKeys = new Set();
  const missingEnvKeys = new Set();
  const providerRows = new Map();

  for (const item of apiItems) {
    if (counts[item.apiReadiness.status] !== undefined) {
      counts[item.apiReadiness.status] += 1;
    }
    for (const entry of item.apiReadiness.environment) {
      requiredEnvKeys.add(entry.name);
      if (entry.configured) configuredEnvKeys.add(entry.name);
      else missingEnvKeys.add(entry.name);
    }
    for (const provider of item.apiReadiness.providers) {
      if (!providerRows.has(provider.name)) {
        providerRows.set(provider.name, {
          name: provider.name,
          tools: new Set(),
          requiredEnvKeys: new Set(),
          missingEnvKeys: new Set(),
          statuses: new Set(),
        });
      }
      const row = providerRows.get(provider.name);
      row.tools.add(item.slug);
      row.statuses.add(provider.status);
      for (const key of provider.requiredEnvKeys) {
        row.requiredEnvKeys.add(key);
        if (!configuredEnvKeys.has(key)) row.missingEnvKeys.add(key);
      }
    }
  }

  const providers = [...providerRows.values()]
    .map((provider) => ({
      name: provider.name,
      tools: provider.tools.size,
      requiredEnvKeys: [...provider.requiredEnvKeys].sort(),
      missingEnvKeys: [...provider.missingEnvKeys].sort(),
      statuses: [...provider.statuses].sort(),
    }))
    .sort((a, b) => b.tools - a.tools || a.name.localeCompare(b.name));

  return {
    tools: apiItems.length,
    counts,
    providerCount: providers.length,
    requiredEnvKeys: [...requiredEnvKeys].sort(),
    configuredEnvKeys: [...configuredEnvKeys].sort(),
    missingEnvKeys: [...missingEnvKeys].sort(),
    providers,
  };
}

function summarize(items) {
  const counts = {
    working: 0,
    "api-required": 0,
    partial: 0,
    broken: 0,
  };
  for (const item of items) counts[item.status] += 1;

  const automatedTests = items.filter(
    (item) => item.evidence.automatedTest,
  ).length;
  const priorityItems = items.filter((item) => item.priority);
  const priorityVerified = priorityItems.filter(
    (item) => item.status !== "broken" && item.status !== "partial",
  ).length;
  const score = clampScore(
    items.length
      ? items.reduce((sum, item) => sum + item.score, 0) / items.length
      : 0,
  );

  const topRisks = items
    .filter((item) => item.status !== "working")
    .sort(
      (a, b) =>
        STATUS_ORDER[a.status] - STATUS_ORDER[b.status] ||
        Number(b.priority) - Number(a.priority) ||
        a.score - b.score ||
        a.slug.localeCompare(b.slug),
    )
    .slice(0, 24)
    .map(
      ({
        slug,
        name,
        category,
        route,
        status,
        score: itemScore,
        priority,
        issues,
        recommendations,
        evidence,
        apiReadiness,
      }) => ({
        slug,
        name,
        category,
        route,
        status,
        score: itemScore,
        priority,
        issues,
        recommendations,
        evidence: {
          automatedTest: evidence.automatedTest,
          networkDependent: evidence.networkDependent,
          envKeys: evidence.envKeys,
          unresolvedImports: evidence.unresolvedImports,
        },
        apiReadiness: {
          status: apiReadiness.status,
          providers: apiReadiness.providers.map(
            (provider) => provider.name,
          ),
          missingEnvKeys: apiReadiness.missingEnvKeys,
        },
      }),
    );

  return {
    methodology: "static-readiness-v2",
    description:
      "Build-time evidence grades route structure, entry imports, interaction signals, automated coverage, placeholders, and external API dependencies. It complements browser QA; it does not claim a live third-party API is available.",
    total: items.length,
    score,
    counts,
    automatedTests,
    automatedCoverage: items.length
      ? clampScore((automatedTests / items.length) * 100)
      : 0,
    networkDependent: items.filter((item) => item.evidence.networkDependent)
      .length,
    envDependent: items.filter((item) => item.evidence.envKeys.length).length,
    api: summarizeApiReadiness(items),
    placeholderSignals: items.filter(
      (item) => item.evidence.placeholderSignals.length,
    ).length,
    unresolvedImports: items.filter(
      (item) => item.evidence.unresolvedImports.length,
    ).length,
    priority: {
      total: priorityItems.length,
      verified: priorityVerified,
      needsAttention: priorityItems.length - priorityVerified,
    },
    topRisks,
  };
}

export async function buildToolReadinessReport({
  webRoot,
  toolMetaMap,
  functionalSpecSource = "",
  prioritySlugs = new Set(),
  configuredEnvKeys = new Set(),
  generatedAt = new Date().toISOString(),
  concurrency = 24,
}) {
  const toolsRoot = path.join(webRoot, "src/tools");
  const entries = Object.entries(toolMetaMap).sort(([a], [b]) =>
    a.localeCompare(b),
  );
  const items = await mapWithConcurrency(entries, concurrency, ([slug, tool]) =>
    analyzeTool({
      slug,
      tool,
      toolsRoot,
      functionalSpecSource,
      prioritySlugs,
      configuredEnvKeys,
    }),
  );

  return {
    schemaVersion: 2,
    generatedAt,
    summary: summarize(items),
    items,
  };
}
