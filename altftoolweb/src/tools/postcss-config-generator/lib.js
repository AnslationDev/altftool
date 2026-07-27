/**
 * PostCSS config generator.
 *
 * Emits a config in the object-plugin syntax understood by postcss-load-config
 * (the loader used by Next.js, Vite and the PostCSS CLI): a `plugins` object
 * whose keys are package names and whose values are option objects.
 *
 * Plugin ORDER is load-bearing in PostCSS — plugins run top to bottom:
 *  - postcss-import must run first so later plugins see the inlined @import
 *    files (stated in the postcss-import README).
 *  - Nesting must be flattened before autoprefixer / preset-env process the
 *    resulting selectors.
 *  - cssnano's own docs say to run it last, on the final CSS.
 * The ORDER constants below encode exactly that.
 */

/** Sort keys: lower runs earlier in the PostCSS pipeline. */
export const ORDER_IMPORT = 10; // postcss-import README: "must be first"
export const ORDER_NESTING = 20; // flatten nesting before vendor prefixing
export const ORDER_PRESET_ENV = 30; // transpiles modern CSS, includes autoprefixer
export const ORDER_AUTOPREFIXER = 40; // prefixes the final flattened selectors
export const ORDER_MINIFY = 50; // cssnano docs: run last

/** postcss-preset-env stages 0-4; its documented default is stage 2. */
export const PRESET_ENV_STAGE_MIN = 0;
export const PRESET_ENV_STAGE_MAX = 4;
export const PRESET_ENV_STAGE_DEFAULT = 2;

/** The two nesting flavours in common use. */
export const NESTING_OPTIONS = [
  { id: "none", label: "No nesting plugin" },
  {
    id: "postcss-nesting",
    label: "postcss-nesting — W3C CSS Nesting spec",
  },
  {
    id: "postcss-nested",
    label: "postcss-nested — Sass-style nesting",
  },
];

export const FORMATS = [
  { id: "esm", label: "postcss.config.mjs (ESM)", filename: "postcss.config.mjs" },
  { id: "cjs", label: "postcss.config.js (CommonJS)", filename: "postcss.config.js" },
  { id: "json", label: ".postcssrc.json (JSON)", filename: ".postcssrc.json" },
];

/** Package-name keys that are valid bare JS identifiers can go unquoted in JS output. */
const BARE_KEY = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

function jsKey(name) {
  return BARE_KEY.test(name) ? name : `"${name}"`;
}

/** Serialise a flat options object ({stage: 2, overrideBrowserslist: [...]}) as a JS literal. */
function jsValue(value) {
  if (Array.isArray(value)) return `[${value.map(jsValue).join(", ")}]`;
  if (typeof value === "string") return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  return String(value);
}

function jsOptions(options) {
  const keys = Object.keys(options);
  if (keys.length === 0) return "{}";
  return `{ ${keys.map((key) => `${jsKey(key)}: ${jsValue(options[key])}`).join(", ")} }`;
}

/**
 * Build the ordered plugin list from the user's selections.
 * Returns [{ name, options, order }] sorted by pipeline order.
 */
export function resolvePlugins({
  useImport = false,
  nesting = "none",
  usePresetEnv = false,
  presetEnvStage = PRESET_ENV_STAGE_DEFAULT,
  useAutoprefixer = false,
  browsers = "",
  useMinify = false,
} = {}) {
  const plugins = [];
  if (useImport) plugins.push({ name: "postcss-import", options: {}, order: ORDER_IMPORT });
  if (nesting === "postcss-nesting" || nesting === "postcss-nested") {
    plugins.push({ name: nesting, options: {}, order: ORDER_NESTING });
  }
  if (usePresetEnv) {
    plugins.push({
      name: "postcss-preset-env",
      options: { stage: presetEnvStage },
      order: ORDER_PRESET_ENV,
    });
  }
  if (useAutoprefixer) {
    const options = {};
    const list = String(browsers)
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
    if (list.length > 0) options.overrideBrowserslist = list;
    plugins.push({ name: "autoprefixer", options, order: ORDER_AUTOPREFIXER });
  }
  if (useMinify) {
    plugins.push({
      name: "cssnano",
      options: { preset: "default" },
      order: ORDER_MINIFY,
    });
  }
  return plugins.sort((a, b) => a.order - b.order);
}

/**
 * Build the PostCSS config file text.
 *
 * @param {object} input
 * @param {"esm"|"cjs"|"json"} input.format
 * @param {boolean} input.useImport
 * @param {"none"|"postcss-nesting"|"postcss-nested"} input.nesting
 * @param {boolean} input.usePresetEnv
 * @param {number|string} input.presetEnvStage    0-4
 * @param {boolean} input.useAutoprefixer
 * @param {string} input.browsers                 comma-separated browserslist queries
 * @param {boolean} input.useMinify
 * @param {boolean} input.minifyProdOnly          gate cssnano behind NODE_ENV === "production"
 * @returns {{text:string, filename:string, warnings:string[], installCommand:string, pluginNames:string[]}|{error:string}}
 */
export function buildPostcssConfig(input = {}) {
  const {
    format = "esm",
    nesting = "none",
    usePresetEnv = false,
    useAutoprefixer = false,
    useMinify = false,
    minifyProdOnly = true,
  } = input;

  const formatDef = FORMATS.find((entry) => entry.id === format);
  if (!formatDef) return { error: "Choose an output format: ESM, CommonJS or JSON." };

  if (!NESTING_OPTIONS.some((option) => option.id === nesting)) {
    return { error: "Choose a nesting plugin: none, postcss-nesting or postcss-nested." };
  }

  const stage =
    input.presetEnvStage === undefined || String(input.presetEnvStage).trim() === ""
      ? NaN
      : Number(input.presetEnvStage);
  if (usePresetEnv) {
    if (!Number.isInteger(stage) || stage < PRESET_ENV_STAGE_MIN || stage > PRESET_ENV_STAGE_MAX) {
      return {
        error: `postcss-preset-env stage must be a whole number from ${PRESET_ENV_STAGE_MIN} to ${PRESET_ENV_STAGE_MAX}.`,
      };
    }
  }

  const plugins = resolvePlugins({ ...input, presetEnvStage: stage });
  if (plugins.length === 0) {
    return { error: "Select at least one plugin — an empty config does nothing." };
  }

  const warnings = [];
  if (usePresetEnv && useAutoprefixer) {
    warnings.push(
      "postcss-preset-env already runs autoprefixer internally — listing autoprefixer separately prefixes twice for no benefit. Consider unticking one.",
    );
  }
  if (usePresetEnv && nesting === "postcss-nesting") {
    warnings.push(
      "postcss-preset-env includes the nesting-rules feature (the same transform as postcss-nesting), so the separate plugin is usually redundant.",
    );
  }

  const gateMinify = useMinify && minifyProdOnly;
  if (gateMinify && format === "json") {
    warnings.push(
      ".postcssrc.json cannot read NODE_ENV, so cssnano is included unconditionally. Use the ESM or CommonJS format for production-only minification.",
    );
  }

  let text;
  if (format === "json") {
    const pluginsObject = {};
    for (const plugin of plugins) pluginsObject[plugin.name] = plugin.options;
    text = `${JSON.stringify({ plugins: pluginsObject }, null, 2)}\n`;
  } else {
    const conditional = gateMinify;
    const bodyLines = [];
    for (const plugin of plugins) {
      if (conditional && plugin.name === "cssnano") continue;
      bodyLines.push(`    ${jsKey(plugin.name)}: ${jsOptions(plugin.options)},`);
    }
    if (conditional) {
      const cssnano = plugins.find((plugin) => plugin.name === "cssnano");
      bodyLines.push(`    ...(isProduction ? { cssnano: ${jsOptions(cssnano.options)} } : {}),`);
    }
    const lines = [];
    lines.push("/** Generated PostCSS config — plugins run top to bottom. */");
    if (conditional) {
      lines.push('const isProduction = process.env.NODE_ENV === "production";');
      lines.push("");
    }
    lines.push("const config = {");
    lines.push("  plugins: {");
    lines.push(...bodyLines);
    lines.push("  },");
    lines.push("};");
    lines.push("");
    lines.push(format === "esm" ? "export default config;" : "module.exports = config;");
    text = `${lines.join("\n")}\n`;
  }

  const pluginNames = plugins.map((plugin) => plugin.name);
  return {
    text,
    filename: formatDef.filename,
    warnings,
    pluginNames,
    installCommand: `npm install --save-dev postcss ${pluginNames.join(" ")}`,
  };
}
