import {
  DEFAULT_ENABLED_TYPES,
  redactText,
} from "../../universal-pii-ai-redactor/lib/redact.mjs";

const MAX_SOURCE_CHARACTERS = 8 * 1024 * 1024;
const MAX_RECORDS = 5_000;
const MAX_PRIVACY_CHARACTERS = 500_000;

const MODEL_PATHS = ["model", "model_name", "modelName", "request.model", "response.model"];
const INPUT_TOKEN_PATHS = [
  "usage.input_tokens",
  "usage.inputTokens",
  "usage.prompt_tokens",
  "usage.promptTokens",
  "input_tokens",
  "inputTokens",
  "prompt_tokens",
  "promptTokens",
];
const OUTPUT_TOKEN_PATHS = [
  "usage.output_tokens",
  "usage.outputTokens",
  "usage.completion_tokens",
  "usage.completionTokens",
  "output_tokens",
  "outputTokens",
  "completion_tokens",
  "completionTokens",
];
const TOTAL_TOKEN_PATHS = [
  "usage.total_tokens",
  "usage.totalTokens",
  "total_tokens",
  "totalTokens",
];
const CONTENT_KEYS = new Set([
  "content",
  "input",
  "inputs",
  "message",
  "messages",
  "prompt",
  "prompts",
  "requestbody",
  "responsebody",
  "text",
]);

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getPath(value, path) {
  return path.split(".").reduce((current, key) => current?.[key], value);
}

function firstValue(value, paths) {
  for (const path of paths) {
    const candidate = getPath(value, path);
    if (candidate !== undefined && candidate !== null && candidate !== "") return candidate;
  }
  return undefined;
}

function tokenNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? Math.round(number) : 0;
}

function normalizeKey(value) {
  return String(value || "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase();
}

function parseDelimitedLine(line, delimiter) {
  const cells = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (quoted) {
      if (character === '"' && line[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        cell += character;
      }
    } else if (character === '"') {
      quoted = true;
    } else if (character === delimiter) {
      cells.push(cell);
      cell = "";
    } else {
      cell += character;
    }
  }
  cells.push(cell);
  return cells;
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return [];
  const delimiter = (lines[0].match(/\t/g) || []).length > (lines[0].match(/,/g) || []).length
    ? "\t"
    : ",";
  const headers = parseDelimitedLine(lines[0], delimiter).map((header) => header.trim());
  return lines.slice(1).map((line) =>
    Object.fromEntries(
      headers.map((header, index) => [
        header,
        parseDelimitedLine(line, delimiter)[index]?.trim() || "",
      ]),
    ),
  );
}

function extractArray(value) {
  if (Array.isArray(value)) return value;
  if (!isObject(value)) return null;
  for (const key of ["data", "events", "items", "logs", "records", "requests", "usage"]) {
    if (Array.isArray(value[key])) return value[key];
  }
  return [value];
}

export function parseUsageLogs(source) {
  const raw = String(source || "");
  const bounded = raw.slice(0, MAX_SOURCE_CHARACTERS);
  const trimmed = bounded.trim();
  if (!trimmed) return { ok: false, error: "Open or paste an AI usage log first." };

  let records = [];
  let format = "json";
  if (/^[{[]/.test(trimmed)) {
    try {
      records = extractArray(JSON.parse(trimmed)) || [];
    } catch {
      const lines = trimmed.split(/\r?\n/).filter(Boolean);
      try {
        records = lines.map((line) => JSON.parse(line));
        format = "jsonl";
      } catch {
        return { ok: false, error: "The log is not valid JSON or JSONL." };
      }
    }
  } else {
    records = parseCsv(trimmed);
    format = "csv";
  }

  const objects = records.filter(isObject).slice(0, MAX_RECORDS);
  if (!objects.length) {
    return { ok: false, error: "No object-shaped usage records were found." };
  }
  return {
    ok: true,
    records: objects,
    format,
    truncated: raw.length > bounded.length || records.length > MAX_RECORDS,
  };
}

function flattenRecord(record) {
  const flat = {};
  function walk(value, path = "", depth = 0) {
    if (depth > 5 || !isObject(value)) return;
    for (const [key, item] of Object.entries(value)) {
      const nextPath = path ? `${path}.${key}` : key;
      if (isObject(item)) walk(item, nextPath, depth + 1);
      else flat[nextPath] = item;
    }
  }
  walk(record);
  return flat;
}

function recordField(record, paths) {
  const direct = firstValue(record, paths);
  if (direct !== undefined) return direct;
  const flat = flattenRecord(record);
  const normalized = new Map(
    Object.entries(flat).map(([key, value]) => [normalizeKey(key), value]),
  );
  for (const path of paths) {
    const found = normalized.get(normalizeKey(path));
    if (found !== undefined) return found;
  }
  return undefined;
}

function collectContentStrings(value, state, key = "", depth = 0) {
  if (state.characters >= MAX_PRIVACY_CHARACTERS || depth > 8) return;
  if (typeof value === "string") {
    if (CONTENT_KEYS.has(normalizeKey(key))) {
      const remaining = MAX_PRIVACY_CHARACTERS - state.characters;
      const bounded = value.slice(0, remaining);
      state.values.push(bounded);
      state.characters += bounded.length;
      if (bounded.length < value.length) state.truncated = true;
    }
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectContentStrings(item, state, key, depth + 1));
    return;
  }
  if (!isObject(value)) return;
  Object.entries(value).forEach(([childKey, item]) =>
    collectContentStrings(item, state, childKey, depth + 1),
  );
}

export function parseRateTable(source) {
  const text = String(source || "").trim();
  if (!text) return { ok: true, rates: new Map(), warnings: ["No token rates supplied."] };
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: "The token-rate table is not valid JSON." };
  }

  const rows = Array.isArray(parsed)
    ? parsed
    : isObject(parsed)
      ? Object.entries(parsed).map(([model, value]) => ({ model, ...value }))
      : [];
  const rates = new Map();
  const errors = [];
  for (const [index, row] of rows.entries()) {
    const model = String(row?.model ?? row?.modelPattern ?? "").trim();
    const inputPerMillion = Number(
      row?.inputPerMillion ?? row?.input_per_million ?? row?.input,
    );
    const outputPerMillion = Number(
      row?.outputPerMillion ?? row?.output_per_million ?? row?.output,
    );
    if (
      !model ||
      !Number.isFinite(inputPerMillion) ||
      inputPerMillion < 0 ||
      !Number.isFinite(outputPerMillion) ||
      outputPerMillion < 0
    ) {
      errors.push(
        `Rate row ${index + 1} needs model, inputPerMillion, and outputPerMillion as non-negative numbers.`,
      );
      continue;
    }
    rates.set(model.toLowerCase(), { model, inputPerMillion, outputPerMillion });
  }
  return errors.length ? { ok: false, error: errors.join(" ") } : { ok: true, rates, warnings: [] };
}

function rateFor(model, rates) {
  return rates.get(model.toLowerCase()) || rates.get("*") || null;
}

export function analyzeUsageLogs(logSource, rateSource = "") {
  const parsed = parseUsageLogs(logSource);
  if (!parsed.ok) return parsed;
  const parsedRates = parseRateTable(rateSource);
  if (!parsedRates.ok) return parsedRates;

  const privacyState = { values: [], characters: 0, truncated: false };
  const records = parsed.records.map((record, index) => {
    const model = String(recordField(record, MODEL_PATHS) || "Unknown model").slice(0, 200);
    const inputTokens = tokenNumber(recordField(record, INPUT_TOKEN_PATHS));
    const outputTokens = tokenNumber(recordField(record, OUTPUT_TOKEN_PATHS));
    const declaredTotal = tokenNumber(recordField(record, TOTAL_TOKEN_PATHS));
    const totalTokens = Math.max(declaredTotal, inputTokens + outputTokens);
    const unallocatedTokens = Math.max(0, totalTokens - inputTokens - outputTokens);
    const rate = rateFor(model, parsedRates.rates);
    const priceable = Boolean(rate) && unallocatedTokens === 0;
    const estimatedCost = priceable
      ? (inputTokens / 1_000_000) * rate.inputPerMillion +
        (outputTokens / 1_000_000) * rate.outputPerMillion
      : null;
    collectContentStrings(record, privacyState);
    return {
      index: index + 1,
      model,
      inputTokens,
      outputTokens,
      totalTokens,
      unallocatedTokens,
      estimatedCost,
      rateMatched: Boolean(rate),
      priceable,
    };
  });

  const privacyTotals = new Map();
  for (const text of privacyState.values) {
    const scan = redactText(text, {
      enabledTypes: DEFAULT_ENABLED_TYPES,
      mode: "label",
    });
    for (const item of scan.summary) {
      const current = privacyTotals.get(item.type) || {
        type: item.type,
        label: item.label,
        count: 0,
      };
      current.count += item.count;
      privacyTotals.set(item.type, current);
    }
  }

  const modelMap = new Map();
  for (const record of records) {
    const current = modelMap.get(record.model) || {
      model: record.model,
      requestCount: 0,
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      unallocatedTokens: 0,
      estimatedCost: 0,
      pricedRequestCount: 0,
    };
    current.requestCount += 1;
    current.inputTokens += record.inputTokens;
    current.outputTokens += record.outputTokens;
    current.totalTokens += record.totalTokens;
    current.unallocatedTokens += record.unallocatedTokens;
    current.estimatedCost += record.estimatedCost || 0;
    current.pricedRequestCount += Number(record.priceable);
    modelMap.set(record.model, current);
  }

  const models = [...modelMap.values()].sort(
    (left, right) => right.totalTokens - left.totalTokens || left.model.localeCompare(right.model),
  );
  return {
    ok: true,
    format: parsed.format,
    records,
    models,
    requestCount: records.length,
    modelCount: models.length,
    inputTokens: records.reduce((sum, record) => sum + record.inputTokens, 0),
    outputTokens: records.reduce((sum, record) => sum + record.outputTokens, 0),
    totalTokens: records.reduce((sum, record) => sum + record.totalTokens, 0),
    unallocatedTokens: records.reduce((sum, record) => sum + record.unallocatedTokens, 0),
    estimatedCost: records.reduce((sum, record) => sum + (record.estimatedCost || 0), 0),
    pricedRequestCount: records.filter((record) => record.priceable).length,
    unmatchedRateRequestCount: records.filter((record) => !record.rateMatched).length,
    privacySignals: [...privacyTotals.values()].sort((left, right) => right.count - left.count),
    privacySignalCount: [...privacyTotals.values()].reduce(
      (sum, item) => sum + item.count,
      0,
    ),
    scannedContentCharacters: privacyState.characters,
    truncated: parsed.truncated || privacyState.truncated,
    rateWarningCount: parsedRates.warnings.length,
  };
}

export function buildUsageReport(result) {
  if (!result?.ok) return null;
  return {
    generatedAt: new Date().toISOString(),
    format: result.format,
    requestCount: result.requestCount,
    modelCount: result.modelCount,
    inputTokens: result.inputTokens,
    outputTokens: result.outputTokens,
    totalTokens: result.totalTokens,
    unallocatedTokens: result.unallocatedTokens,
    estimatedCost: result.estimatedCost,
    pricedRequestCount: result.pricedRequestCount,
    unmatchedRateRequestCount: result.unmatchedRateRequestCount,
    privacySignalCount: result.privacySignalCount,
    privacySignals: result.privacySignals,
    modelSummaries: result.models.map((model, index) => ({
      model: index + 1,
      requestCount: model.requestCount,
      inputTokens: model.inputTokens,
      outputTokens: model.outputTokens,
      totalTokens: model.totalTokens,
      unallocatedTokens: model.unallocatedTokens,
      estimatedCost: model.estimatedCost,
      pricedRequestCount: model.pricedRequestCount,
    })),
    truncated: result.truncated,
    note:
      "Costs use only user-supplied rates and recorded token counts. Privacy signals are pattern matches, not proof that all sensitive data was found. This report excludes model names and log content.",
  };
}
