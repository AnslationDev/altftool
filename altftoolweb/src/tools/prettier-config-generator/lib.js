/**
 * Prettier configuration generator.
 *
 * Option names, allowed values and defaults are taken from the Prettier 3.x
 * options reference: https://prettier.io/docs/options
 * Notably, `trailingComma` defaults to "all" since Prettier 3.0 (it was "es5"
 * in 2.x), and `endOfLine` defaults to "lf" since 2.0.
 */

/** Prettier 3.x defaults, one entry per core option. */
export const OPTION_DEFS = [
  { key: "printWidth", label: "Print width", type: "int", default: 80, min: 20, max: 400 },
  { key: "tabWidth", label: "Tab width", type: "int", default: 2, min: 0, max: 16 },
  { key: "useTabs", label: "Indent with tabs", type: "bool", default: false },
  { key: "semi", label: "Semicolons", type: "bool", default: true },
  { key: "singleQuote", label: "Single quotes", type: "bool", default: false },
  {
    key: "quoteProps",
    label: "Quote object props",
    type: "enum",
    default: "as-needed",
    values: ["as-needed", "consistent", "preserve"],
  },
  { key: "jsxSingleQuote", label: "Single quotes in JSX", type: "bool", default: false },
  {
    key: "trailingComma",
    label: "Trailing commas",
    type: "enum",
    default: "all",
    values: ["all", "es5", "none"],
  },
  { key: "bracketSpacing", label: "Spaces inside object braces", type: "bool", default: true },
  { key: "bracketSameLine", label: "JSX > on the last line", type: "bool", default: false },
  {
    key: "arrowParens",
    label: "Arrow function parens",
    type: "enum",
    default: "always",
    values: ["always", "avoid"],
  },
  {
    key: "proseWrap",
    label: "Prose wrap (markdown)",
    type: "enum",
    default: "preserve",
    values: ["preserve", "always", "never"],
  },
  {
    key: "endOfLine",
    label: "Line endings",
    type: "enum",
    default: "lf",
    values: ["lf", "crlf", "cr", "auto"],
  },
  { key: "singleAttributePerLine", label: "One HTML/JSX attribute per line", type: "bool", default: false },
];

export const DEFAULTS = Object.fromEntries(OPTION_DEFS.map((def) => [def.key, def.default]));

/** Common override targets teams add to .prettierrc. */
export const OVERRIDE_PRESETS = [
  { id: "md-wrap", files: "*.md", options: { proseWrap: "always" }, label: "Wrap markdown prose" },
  { id: "json-width", files: "*.json", options: { printWidth: 120 }, label: "Wider JSON lines" },
  { id: "yaml-2", files: "*.{yml,yaml}", options: { tabWidth: 2, singleQuote: false }, label: "YAML two-space, double quotes" },
];

function validateOption(def, value) {
  if (def.type === "int") {
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < def.min || parsed > def.max) {
      return `${def.label} must be a whole number between ${def.min} and ${def.max}.`;
    }
  }
  if (def.type === "enum" && !def.values.includes(value)) {
    return `${def.label} must be one of ${def.values.join(", ")}.`;
  }
  if (def.type === "bool" && typeof value !== "boolean") {
    return `${def.label} must be on or off.`;
  }
  return null;
}

/**
 * Build the .prettierrc JSON text.
 *
 * @param {object} input
 * @param {object} input.options    map of option key -> value
 * @param {boolean} [input.emitAll] include options equal to the default too
 * @param {Array<{files:string, options:object}>} [input.overrides]
 * @returns {{json:string, changed:string[], changedCount:number}|{error:string}}
 */
export function buildPrettierConfig({ options = {}, emitAll = false, overrides = [] } = {}) {
  const config = {};
  const changed = [];

  for (const def of OPTION_DEFS) {
    const raw = options[def.key];
    const value = raw === undefined ? def.default : def.type === "int" ? Number(raw) : raw;
    const problem = validateOption(def, value);
    if (problem) return { error: problem };
    const isChanged = value !== def.default;
    if (isChanged) changed.push(def.key);
    if (emitAll || isChanged) config[def.key] = value;
  }

  const cleanOverrides = [];
  for (let index = 0; index < overrides.length; index += 1) {
    const override = overrides[index];
    const files = String(override.files ?? "").trim();
    if (files === "") return { error: `Override ${index + 1}: enter a file glob such as *.md.` };
    if (!override.options || Object.keys(override.options).length === 0) {
      return { error: `Override ${index + 1}: set at least one option for ${files}.` };
    }
    for (const [key, value] of Object.entries(override.options)) {
      const def = OPTION_DEFS.find((entry) => entry.key === key);
      if (!def) return { error: `Override ${index + 1}: unknown option "${key}".` };
      const problem = validateOption(def, def.type === "int" ? Number(value) : value);
      if (problem) return { error: `Override ${index + 1}: ${problem}` };
    }
    cleanOverrides.push({ files, options: { ...override.options } });
  }

  if (cleanOverrides.length > 0) {
    config.overrides = cleanOverrides.map((override) => ({
      files: override.files,
      options: override.options,
    }));
  }

  return {
    json: `${JSON.stringify(config, null, 2)}\n`,
    changed,
    changedCount: changed.length,
  };
}

/**
 * A deterministic sample snippet showing what the chosen options do.
 * This is a rendered illustration of the option semantics, not a run of
 * Prettier itself — indentation, quotes, semicolons, trailing commas,
 * arrow parens and bracket spacing all follow the selected values.
 */
export function samplePreview(options = {}) {
  const merged = { ...DEFAULTS, ...options };
  const tabWidth = Number(merged.tabWidth);
  const indent = merged.useTabs ? "\t" : " ".repeat(Number.isInteger(tabWidth) ? Math.min(Math.max(tabWidth, 0), 16) : 2);
  const q = merged.singleQuote ? "'" : '"';
  const semi = merged.semi ? ";" : "";
  // "all" adds commas after the last item of multiline objects and arguments;
  // "es5" does so for objects/arrays but not function arguments; "none" never.
  const objComma = merged.trailingComma === "none" ? "" : ",";
  const openBrace = merged.bracketSpacing ? "{ " : "{";
  const closeBrace = merged.bracketSpacing ? " }" : "}";
  const arrowParam = merged.arrowParens === "avoid" ? "user" : "(user)";

  return [
    `const greeting = ${q}hello${q}${semi}`,
    "",
    `const config = {`,
    `${indent}retries: 3,`,
    `${indent}verbose: true${objComma}`,
    `}${semi}`,
    "",
    `const getName = ${arrowParam} => user.name${semi}`,
    "",
    `export ${openBrace}greeting, config, getName${closeBrace}${semi}`,
  ].join("\n");
}
