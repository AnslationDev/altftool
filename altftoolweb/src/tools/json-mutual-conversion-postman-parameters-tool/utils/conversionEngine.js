export const MODES = [
  { id: "json-to-query", label: "JSON to Query Params", input: "json", output: "params" },
  { id: "json-to-form-data", label: "JSON to form-data", input: "json", output: "form-data" },
  { id: "json-to-urlencoded", label: "JSON to x-www-form-urlencoded", input: "json", output: "urlencoded" },
  { id: "params-to-json", label: "Params to JSON", input: "params", output: "json" },
  { id: "raw-json", label: "Raw JSON", input: "json", output: "json" },
];

export const ARRAY_STYLES = [
  { id: "brackets", label: "tags[]" },
  { id: "repeat", label: "tags" },
  { id: "indices", label: "tags[0]" },
];

export const SAMPLE_INPUTS = {
  json: '{\n  "name": "Manoj",\n  "age": 25,\n  "tags": ["go", "react"],\n  "user": {\n    "active": true,\n    "role": "admin"\n  }\n}',
  params: "name=Manoj\nage=25\ntags[]=go\ntags[]=react\nuser.active=true\nuser.role=admin",
};

function stringifyValue(value) {
  if (value === null) return "null";
  if (typeof value === "undefined") return "";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function coerceValue(value) {
  const trimmed = String(value).trim();
  if (trimmed === "") return "";
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (trimmed === "null") return null;
  if (/^-?(0|[1-9]\d*)(\.\d+)?$/.test(trimmed)) return Number(trimmed);
  return value;
}

function appendPair(pairs, key, value) {
  pairs.push({ key, value: stringifyValue(value) });
}

export function parseJsonInput(input) {
  if (!input.trim()) {
    return { ok: false, error: "Input is empty. Paste JSON or upload a file to begin." };
  }
  try {
    return { ok: true, data: JSON.parse(input) };
  } catch (error) {
    return { ok: false, error: error.message || "Invalid JSON." };
  }
}

export function flattenJson(value, options = {}, prefix = "", pairs = []) {
  const arrayStyle = options.arrayStyle || "brackets";
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      const key =
        arrayStyle === "indices" ? `${prefix}[${index}]` : arrayStyle === "repeat" ? prefix : `${prefix}[]`;
      if (item && typeof item === "object") {
        flattenJson(item, options, key, pairs);
      } else {
        appendPair(pairs, key, item);
      }
    });
    if (value.length === 0 && prefix) appendPair(pairs, prefix, "[]");
    return pairs;
  }

  if (value && typeof value === "object") {
    Object.entries(value).forEach(([key, item]) => {
      const nextKey = prefix ? `${prefix}.${key}` : key;
      if (item && typeof item === "object") {
        flattenJson(item, options, nextKey, pairs);
      } else {
        appendPair(pairs, nextKey, item);
      }
    });
    return pairs;
  }

  if (prefix) appendPair(pairs, prefix, value);
  return pairs;
}

function splitParamInput(input) {
  const text = input.trim().replace(/^\?/, "");
  if (!text) return [];
  if (text.includes("&") && !text.includes("\n")) return text.split("&");
  return text.split(/\r?\n|&/).map((line) => line.trim()).filter(Boolean);
}

function decodePart(part) {
  try {
    return decodeURIComponent(String(part).replace(/\+/g, " "));
  } catch {
    return String(part).replace(/\+/g, " ");
  }
}

function parsePath(key) {
  const parts = [];
  key.split(".").forEach((segment) => {
    const matches = segment.matchAll(/([^\[\]]+)|\[(.*?)\]/g);
    for (const match of matches) {
      const token = match[1] ?? match[2] ?? "";
      parts.push(token);
    }
  });
  return parts.length ? parts : [key];
}

function assignPath(target, path, value) {
  let current = target;
  path.forEach((part, index) => {
    const last = index === path.length - 1;
    const nextPart = path[index + 1];
    if (last) {
      if (part === "") {
        if (!Array.isArray(current)) return;
        current.push(value);
        return;
      }
      if (Object.prototype.hasOwnProperty.call(current, part)) {
        current[part] = Array.isArray(current[part]) ? [...current[part], value] : [current[part], value];
      } else {
        current[part] = value;
      }
      return;
    }

    if (part === "") {
      if (!Array.isArray(current)) return;
      const container = /^\d*$/.test(nextPart) || nextPart === "" ? [] : {};
      current.push(container);
      current = container;
      return;
    }

    if (!Object.prototype.hasOwnProperty.call(current, part)) {
      current[part] = /^\d+$/.test(nextPart) || nextPart === "" ? [] : {};
    }
    current = current[part];
  });
}

export function parseParamsInput(input) {
  const rows = splitParamInput(input);
  if (!rows.length) {
    return { ok: false, error: "Input is empty. Paste query params, key=value rows, or form-data rows." };
  }

  const pairs = [];
  for (const row of rows) {
    const separator = row.indexOf("=");
    if (separator < 0) return { ok: false, error: `Broken key-value pair: "${row}"` };
    const rawKey = row.slice(0, separator).trim();
    const rawValue = row.slice(separator + 1);
    if (!rawKey) return { ok: false, error: `Missing key in row: "${row}"` };
    pairs.push({ key: decodePart(rawKey), value: coerceValue(decodePart(rawValue)) });
  }

  const output = {};
  pairs.forEach(({ key, value }) => assignPath(output, parsePath(key), value));
  return { ok: true, data: output, pairs };
}

export function buildOutput(input, mode, options = {}) {
  const selectedMode = MODES.find((item) => item.id === mode) || MODES[0];
  const parsed = selectedMode.input === "json" ? parseJsonInput(input) : parseParamsInput(input);
  if (!parsed.ok) return { ok: false, error: parsed.error, output: "", pairs: [], data: null };

  const data = parsed.data;
  const pairs = selectedMode.input === "json" ? flattenJson(data, options) : parsed.pairs || flattenJson(data, options);
  let output = "";

  if (mode === "params-to-json" || mode === "raw-json") {
    output = options.minifyJson ? JSON.stringify(data) : JSON.stringify(data, null, 2);
  } else if (mode === "json-to-query" || mode === "json-to-urlencoded") {
    output = pairs.map(({ key, value }) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join("&");
  } else {
    output = pairs.map(({ key, value }) => `${key}=${value}`).join("\n");
  }

  return { ok: true, error: "", output, pairs, data };
}

export function buildHeaders(mode) {
  if (mode === "json-to-form-data") return [{ key: "Content-Type", value: "multipart/form-data" }];
  if (mode === "json-to-urlencoded") return [{ key: "Content-Type", value: "application/x-www-form-urlencoded" }];
  if (mode === "raw-json" || mode === "params-to-json") return [{ key: "Content-Type", value: "application/json" }];
  return [{ key: "Accept", value: "application/json" }];
}

export function buildCurl({ mode, output, headers, endpoint = "https://api.example.com/request" }) {
  const headerFlags = headers.map((header) => `  -H "${header.key}: ${header.value}"`).join(" \\\n");
  if (mode === "json-to-query") {
    const joiner = endpoint.includes("?") ? "&" : "?";
    return `curl -X GET "${endpoint}${output ? joiner + output : ""}"${headerFlags ? ` \\\n${headerFlags}` : ""}`;
  }
  return `curl -X POST "${endpoint}"${headerFlags ? ` \\\n${headerFlags}` : ""}${output ? ` \\\n  --data '${output.replace(/'/g, "'\\''")}'` : ""}`;
}

export function calculateStats(input, output, pairs, data) {
  const walk = (value, depth = 0) => {
    if (Array.isArray(value)) {
      return value.reduce(
        (acc, item) => {
          const next = walk(item, depth + 1);
          return {
            keys: acc.keys + next.keys,
            arrays: acc.arrays + next.arrays,
            depth: Math.max(acc.depth, next.depth),
          };
        },
        { keys: 0, arrays: 1, depth }
      );
    }
    if (value && typeof value === "object") {
      return Object.entries(value).reduce(
        (acc, [, item]) => {
          const next = walk(item, depth + 1);
          return {
            keys: acc.keys + 1 + next.keys,
            arrays: acc.arrays + next.arrays,
            depth: Math.max(acc.depth, next.depth),
          };
        },
        { keys: 0, arrays: 0, depth }
      );
    }
    return { keys: 0, arrays: 0, depth };
  };
  const structural = data ? walk(data) : { keys: 0, arrays: 0, depth: 0 };
  return {
    inputBytes: new Blob([input]).size,
    outputBytes: new Blob([output]).size,
    keyCount: pairs.length || structural.keys,
    arrayCount: structural.arrays,
    nestingDepth: structural.depth,
  };
}
