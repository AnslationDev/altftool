// Pure, framework-free helpers shared by the generic ToolRuntime.
// No React, no DOM assumptions (safe to import anywhere).

export function fieldsForMode(fields, mode) {
  if (!Array.isArray(fields)) return [];
  return fields.filter((f) => !f.mode || !mode || f.mode === mode);
}

// Coerce raw string form values into the types compute() expects.
export function coerceValues(fields, raw) {
  const out = {};
  for (const f of fields || []) {
    const v = raw[f.key];
    if (f.type === "number" || f.type === "range") {
      out[f.key] = v === "" || v === undefined || v === null ? "" : Number(v);
    } else if (f.type === "toggle") {
      out[f.key] = !!v;
    } else {
      out[f.key] = v ?? "";
    }
  }
  return out;
}

// Which required fields are still empty (used for the empty-state prompt).
export function missingRequired(fields, raw, mode) {
  const active = fieldsForMode(fields, mode);
  return active
    .filter((f) => f.required !== false && (f.type === "number" || f.type === "range" || f.type === "text" || f.type === "textarea" || f.type === "date"))
    .filter((f) => {
      const v = raw[f.key];
      return v === "" || v === undefined || v === null;
    })
    .map((f) => f.label || f.key);
}

export function defaultValues(fields) {
  const out = {};
  for (const f of fields || []) {
    out[f.key] = f.default !== undefined ? f.default : f.type === "toggle" ? false : "";
  }
  return out;
}

// Seed state from defaults, overlaid with the last saved session (client-only).
export function loadInitial(spec, storageKey, hasModes) {
  const raw = defaultValues(spec.fields);
  let mode = hasModes ? spec.modes[0].id : "";
  if (typeof window !== "undefined") {
    try {
      const saved = JSON.parse(window.localStorage.getItem(storageKey) || "null");
      if (saved && saved.raw) Object.assign(raw, saved.raw);
      if (saved && saved.mode && hasModes && spec.modes.some((m) => m.id === saved.mode)) mode = saved.mode;
    } catch {
      /* ignore corrupt storage */
    }
  }
  return { raw, mode };
}

// Normalise whatever compute() returns into a stable shape for rendering.
export function normalizeResult(r) {
  if (r === null || r === undefined) return { result: "", caption: "", rows: [], list: [], table: null, error: "" };
  if (typeof r === "string" || typeof r === "number") return { result: String(r), caption: "", rows: [], list: [], table: null, error: "" };
  return {
    result: r.result !== undefined ? String(r.result) : "",
    caption: r.caption ? String(r.caption) : "",
    rows: Array.isArray(r.rows) ? r.rows : [],
    list: Array.isArray(r.list) ? r.list : [],
    table: r.table && Array.isArray(r.table.headers) && Array.isArray(r.table.rows) ? r.table : null,
    error: r.error ? String(r.error) : "",
  };
}

// Build a plain-text summary for copy / download.
export function summarize(spec, raw, result, mode) {
  const lines = [spec.title];
  if (mode && spec.modes?.length) {
    const m = spec.modes.find((x) => x.id === mode);
    if (m) lines.push("Mode: " + m.label);
  }
  for (const f of fieldsForMode(spec.fields, mode)) {
    if (raw[f.key] !== "" && raw[f.key] !== undefined) lines.push((f.label || f.key) + ": " + raw[f.key]);
  }
  lines.push("");
  if (result.result) lines.push("Result: " + result.result);
  if (result.caption) lines.push(result.caption);
  for (const [l, v] of result.rows) lines.push(l + ": " + v);
  for (const item of result.list) lines.push("• " + item);
  if (result.table) {
    lines.push(result.table.headers.join("\t"));
    for (const row of result.table.rows) lines.push(row.join("\t"));
  }
  return lines.join("\n");
}
