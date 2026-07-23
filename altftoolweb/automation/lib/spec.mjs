// ToolSpec contract: normalization, validation, and file emission.
// A ToolSpec is the ONLY thing a generator must produce. Everything about how
// a tool looks/behaves is derived from it generically — no per-tool code.
import fs from "node:fs";
import path from "node:path";
import { normalizeComputeSource } from "./sandbox.mjs";

const FIELD_TYPES = new Set(["number", "text", "textarea", "select", "date", "range", "toggle", "file"]);
const J = (v) => JSON.stringify(v);

const cleanText = (v) => String(v ?? "").replace(/\s+/g, " ").trim();
const kebab = (v) => cleanText(v).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const IDENT = /^[a-zA-Z_$][\w$]*$/;

// Keep a valid identifier key exactly as the model wrote it (so it matches
// compute); otherwise derive a snake_case key from key/label.
function safeKey(key, label, i) {
  const k = typeof key === "string" ? key.trim() : "";
  if (IDENT.test(k)) return k;
  const derived = kebab(k || label || "field-" + i).replace(/-/g, "_");
  return IDENT.test(derived) ? derived : "field_" + i;
}

const ICON_BY_CATEGORY = {
  finance: "coins", calculator: "calculator", converter: "arrow-left-right", math: "sigma",
  text: "type", developer: "code", web: "globe", design: "palette", health: "heart-pulse",
  fitness: "dumbbell", fun: "sparkles", game: "gamepad-2", productivity: "check-square",
  business: "briefcase", marketing: "megaphone", education: "graduation-cap", image: "image",
  utility: "wrench", security: "shield", data: "database",
};
const COLORS = ["text-indigo-600", "text-teal-600", "text-blue-600", "text-emerald-600", "text-violet-600", "text-amber-600", "text-rose-600", "text-cyan-600"];

function pickIcon(categories) {
  for (const c of categories) {
    const key = String(c).toLowerCase();
    if (ICON_BY_CATEGORY[key]) return ICON_BY_CATEGORY[key];
  }
  return "wrench";
}

/**
 * Normalize a raw generator output + manifest entry into a canonical ToolSpec.
 * `entry` = { slug, name, category }. `raw` = whatever the generator returned.
 */
export function normalizeSpec(entry, raw = {}) {
  const slug = entry.slug || kebab(raw.title || entry.name);
  const categories = Array.isArray(entry.category) ? entry.category : [entry.category].filter(Boolean);
  const badge = cleanText(raw.badge || categories[0] || "Tool");

  const fields = (Array.isArray(raw.fields) ? raw.fields : []).map((f, i) => ({
    // Preserve the model's key VERBATIM when it is a valid JS identifier, so it
    // stays in sync with whatever compute() reads (values.initialAmount etc.).
    // Only sanitize when the key is missing or not a legal identifier.
    key: safeKey(f.key, f.label, i),
    label: cleanText(f.label || f.key || "Field " + (i + 1)),
    type: FIELD_TYPES.has(f.type) ? f.type : "text",
    default: f.default !== undefined ? f.default : "",
    ...(f.choices ? { choices: normalizeChoices(f.choices) } : {}),
    ...(f.min !== undefined ? { min: f.min } : {}),
    ...(f.max !== undefined ? { max: f.max } : {}),
    ...(f.step !== undefined ? { step: f.step } : {}),
    ...(f.suffix ? { suffix: cleanText(f.suffix) } : {}),
    ...(f.placeholder ? { placeholder: cleanText(f.placeholder) } : {}),
    ...(f.hint ? { hint: cleanText(f.hint) } : {}),
    ...(f.mode ? { mode: f.mode } : {}),
    ...(f.required === false ? { required: false } : {}),
    ...(f.checkboxLabel ? { checkboxLabel: cleanText(f.checkboxLabel) } : {}),
  }));

  const modes = Array.isArray(raw.modes)
    ? raw.modes.filter((m) => m && (m.id || m.label)).map((m) => ({ id: kebab(m.id || m.label), label: cleanText(m.label || m.id) }))
    : [];

  const presets = Array.isArray(raw.presets)
    ? raw.presets.filter((p) => p && p.values && typeof p.values === "object").map((p) => ({ label: cleanText(p.label || "Example"), values: p.values, ...(p.mode ? { mode: kebab(p.mode) } : {}) }))
    : [];

  return {
    slug,
    title: cleanText(raw.title || entry.name),
    description: cleanText(raw.description || entry.description || ""),
    badge,
    category: categories.length ? categories : ["Utility"],
    icon: cleanText(raw.icon) && /^[a-z0-9-]+$/.test(cleanText(raw.icon)) ? cleanText(raw.icon) : pickIcon(categories),
    iconColor: cleanText(raw.iconColor) || COLORS[slug.length % COLORS.length],
    ...(modes.length ? { modes } : {}),
    fields,
    ...(presets.length ? { presets } : {}),
    ...(raw.regenerate ? { regenerate: true } : {}),
    ...(raw.outputLabel ? { outputLabel: cleanText(raw.outputLabel) } : {}),
    ...(raw.note ? { note: cleanText(raw.note) } : {}),
    compute: normalizeComputeSource(raw.compute),
    // SEO/content payload (fed into toolContentOverrides.js)
    intro: cleanText(raw.intro || ""),
    useCases: Array.isArray(raw.useCases) ? raw.useCases.map(cleanText).filter(Boolean).slice(0, 6) : [],
    benefits: Array.isArray(raw.benefits) ? raw.benefits.map((b) => Array.isArray(b) ? [cleanText(b[0]), cleanText(b[1])] : [cleanText(b.title), cleanText(b.body)]).filter((b) => b[0]).slice(0, 6) : [],
    faqs: Array.isArray(raw.faqs) ? raw.faqs.map((f) => Array.isArray(f) ? [cleanText(f[0]), cleanText(f[1])] : [cleanText(f.q || f.question), cleanText(f.a || f.answer)]).filter((f) => f[0] && f[1]).slice(0, 6) : [],
  };
}

// Structural validation (does NOT run compute — sandbox does that separately).
export function validateSpecShape(spec) {
  const errors = [];
  if (!spec.title) errors.push("missing title");
  if (!spec.compute || typeof spec.compute !== "string") errors.push("missing compute");
  if (!Array.isArray(spec.fields)) errors.push("fields must be an array");
  const needsFields = !spec.regenerate;
  if (needsFields && spec.fields.length === 0) errors.push("no input fields");
  const keys = new Set();
  for (const f of spec.fields) {
    if (!f.key) errors.push("field missing key");
    if (keys.has(f.key)) errors.push("duplicate field key: " + f.key);
    keys.add(f.key);
    if (f.type === "select" && (!f.choices || !f.choices.length)) errors.push("select field '" + f.key + "' has no choices");
  }
  if (spec.modes) for (const m of spec.modes) if (!m.id) errors.push("mode missing id");
  return { ok: errors.length === 0, errors };
}

function normalizeChoices(choices) {
  return (Array.isArray(choices) ? choices : []).map((c) =>
    typeof c === "object" ? { value: c.value ?? c.label, label: cleanText(c.label ?? c.value) } : { value: c, label: cleanText(c) },
  );
}

// --- serialize the ToolSpec into a spec.js module (compute stays real code) ---
function serializeSpec(spec) {
  const compute = spec.compute;
  const { compute: _omit, intro, useCases, benefits, faqs, ...decl } = spec;
  const declJson = JSON.stringify(decl, null, 2);
  // Inject compute as a live function property.
  return `// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...${declJson},
  compute: ${compute},
};

export default spec;
`;
}

const configSource = (spec) => `const toolConfig = {
  slug: ${J(spec.slug)},
  name: ${J(spec.title)},
  category: ${J(spec.category)},
  description: ${J(spec.description)},
  icon: ${J(spec.icon)},
  iconColor: ${J(spec.iconColor)},
};

export default toolConfig;
`;

const entrySource = `"use client";

import Page from "./pages";

export default function ToolEntry() {
  return <Page />;
}
`;

const pagesSource = `"use client";

import ToolRuntime from "@/tools/_shared/toolkit/ToolRuntime";
import { spec } from "../spec";

export default function Page() {
  return <ToolRuntime spec={spec} />;
}
`;

// Write all four files for a tool. Returns the tool dir.
export function emitTool(spec, toolsDir) {
  const dir = path.join(toolsDir, spec.slug);
  fs.mkdirSync(path.join(dir, "pages"), { recursive: true });
  fs.writeFileSync(path.join(dir, "tool.config.js"), configSource(spec));
  fs.writeFileSync(path.join(dir, "entry.jsx"), entrySource);
  fs.writeFileSync(path.join(dir, "spec.js"), serializeSpec(spec));
  fs.writeFileSync(path.join(dir, "pages", "index.jsx"), pagesSource);
  return dir;
}

export { kebab, cleanText };
