/**
 * Source map strategy chooser.
 *
 * A source map is a JSON file (the Source Map Revision 3 format) that maps
 * positions in the built bundle back to positions in your original files. A
 * bundler can produce that map at several levels of fidelity, and each level
 * costs build time. webpack exposes the trade-off through the `devtool`
 * option and documents, for every value, its build speed, rebuild speed,
 * whether it is safe in production, and the quality of the mapping.
 *
 * The table below is that documented matrix, transcribed from webpack's
 * `devtool` configuration reference. The word ratings webpack uses are turned
 * into a 1-5 scale so they can be weighted:
 *
 *   fastest = 5, fast = 4, ok = 3, slow = 2, slowest = 1
 *
 * Quality is scored on how much of the original file a stack trace can reach:
 *
 *   0 bundled output only          (no map at all)
 *   1 generated code               (eval wrappers, per-module)
 *   2 transformed code, lines only (post-loader code, no columns)
 *   3 original source, lines only  ("module" variants, no columns)
 *   4 original positions, no source text ("nosources" variants)
 *   5 original source with content (full source map)
 *
 * Nothing here calls out to a bundler; it is a decision table plus a weighted
 * score, so the same inputs always give the same ranking.
 */

/** webpack's word ratings for build and rebuild speed, as a 1-5 scale. */
export const SPEED_SCALE = {
  5: "fastest",
  4: "fast",
  3: "ok",
  2: "slow",
  1: "slowest",
};

export const QUALITY_SCALE = {
  0: "Bundled output only",
  1: "Generated code",
  2: "Transformed code, lines only",
  3: "Original source, lines only",
  4: "Original positions, source text withheld",
  5: "Original source with content",
};

/**
 * The devtool matrix. `productionSafe` follows webpack's own "production"
 * column: eval-based and inline maps are marked unsuitable for production
 * builds because they ship the map (or eval wrappers) to every visitor.
 *
 * exposesSource  - a visitor who opens devtools can read your original files.
 * emitsFile      - a separate .map file is written next to the bundle.
 * referenced     - the bundle carries a //# sourceMappingURL comment, so the
 *                  browser fetches the map automatically.
 * inline         - the whole map is base64-embedded in the bundle, which
 *                  roughly doubles or triples the shipped bytes.
 */
export const DEVTOOL_OPTIONS = [
  {
    id: "none",
    devtool: "false",
    label: "No source map",
    buildSpeed: 5,
    rebuildSpeed: 5,
    quality: 0,
    inline: false,
    emitsFile: false,
    referenced: false,
    exposesSource: false,
    productionSafe: true,
    evalBased: false,
    note: "Fastest possible build. Stack traces point at minified bundle positions only.",
  },
  {
    id: "eval",
    devtool: "eval",
    label: "eval",
    buildSpeed: 4,
    rebuildSpeed: 5,
    quality: 1,
    inline: true,
    emitsFile: false,
    referenced: false,
    exposesSource: true,
    productionSafe: false,
    evalBased: true,
    note: "Each module is wrapped in eval() with a //# sourceURL. Cheapest dev feedback loop.",
  },
  {
    id: "eval-cheap-source-map",
    devtool: "eval-cheap-source-map",
    label: "eval-cheap-source-map",
    buildSpeed: 3,
    rebuildSpeed: 4,
    quality: 2,
    inline: true,
    emitsFile: false,
    referenced: false,
    exposesSource: true,
    productionSafe: false,
    evalBased: true,
    note: "Line-level map of the loader output. Column numbers and pre-loader source are lost.",
  },
  {
    id: "eval-cheap-module-source-map",
    devtool: "eval-cheap-module-source-map",
    label: "eval-cheap-module-source-map",
    buildSpeed: 2,
    rebuildSpeed: 4,
    quality: 3,
    inline: true,
    emitsFile: false,
    referenced: false,
    exposesSource: true,
    productionSafe: false,
    evalBased: true,
    note: "The usual dev default: original files, line accuracy, fast rebuilds.",
  },
  {
    id: "eval-source-map",
    devtool: "eval-source-map",
    label: "eval-source-map",
    buildSpeed: 1,
    rebuildSpeed: 3,
    quality: 5,
    inline: true,
    emitsFile: false,
    referenced: false,
    exposesSource: true,
    productionSafe: false,
    evalBased: true,
    note: "Full column-accurate map per module. Slow first build, acceptable rebuilds.",
  },
  {
    id: "cheap-source-map",
    devtool: "cheap-source-map",
    label: "cheap-source-map",
    buildSpeed: 3,
    rebuildSpeed: 2,
    quality: 2,
    inline: false,
    emitsFile: true,
    referenced: true,
    exposesSource: true,
    productionSafe: false,
    evalBased: false,
    note: "Line-only map of transformed code, written to a .map file.",
  },
  {
    id: "cheap-module-source-map",
    devtool: "cheap-module-source-map",
    label: "cheap-module-source-map",
    buildSpeed: 3,
    rebuildSpeed: 2,
    quality: 3,
    inline: false,
    emitsFile: true,
    referenced: true,
    exposesSource: true,
    productionSafe: false,
    evalBased: false,
    note: "Original files, line accuracy, no eval wrappers. Good for non-HMR dev servers.",
  },
  {
    id: "inline-cheap-module-source-map",
    devtool: "inline-cheap-module-source-map",
    label: "inline-cheap-module-source-map",
    buildSpeed: 3,
    rebuildSpeed: 2,
    quality: 3,
    inline: true,
    emitsFile: false,
    referenced: false,
    exposesSource: true,
    productionSafe: false,
    evalBased: false,
    note: "Same fidelity, base64-embedded. Useful when the map file cannot be served.",
  },
  {
    id: "source-map",
    devtool: "source-map",
    label: "source-map",
    buildSpeed: 1,
    rebuildSpeed: 1,
    quality: 5,
    inline: false,
    emitsFile: true,
    referenced: true,
    exposesSource: true,
    productionSafe: true,
    evalBased: false,
    note: "Full-fidelity separate map, referenced from the bundle. Anyone can fetch it.",
  },
  {
    id: "inline-source-map",
    devtool: "inline-source-map",
    label: "inline-source-map",
    buildSpeed: 1,
    rebuildSpeed: 1,
    quality: 5,
    inline: true,
    emitsFile: false,
    referenced: false,
    exposesSource: true,
    productionSafe: false,
    evalBased: false,
    note: "Full map base64-embedded in every bundle. Large download for real users.",
  },
  {
    id: "hidden-source-map",
    devtool: "hidden-source-map",
    label: "hidden-source-map",
    buildSpeed: 1,
    rebuildSpeed: 1,
    quality: 5,
    inline: false,
    emitsFile: true,
    referenced: false,
    exposesSource: false,
    productionSafe: true,
    evalBased: false,
    note: "Full map is written but no sourceMappingURL comment is added. Upload it to your error tracker and do not deploy it.",
  },
  {
    id: "nosources-source-map",
    devtool: "nosources-source-map",
    label: "nosources-source-map",
    buildSpeed: 1,
    rebuildSpeed: 1,
    quality: 4,
    inline: false,
    emitsFile: true,
    referenced: true,
    exposesSource: false,
    productionSafe: true,
    evalBased: false,
    note: "Maps positions to original file names and lines but omits sourcesContent, so no code is exposed.",
  },
  {
    id: "hidden-nosources-source-map",
    devtool: "hidden-nosources-source-map",
    label: "hidden-nosources-source-map",
    buildSpeed: 1,
    rebuildSpeed: 1,
    quality: 4,
    inline: false,
    emitsFile: true,
    referenced: false,
    exposesSource: false,
    productionSafe: true,
    evalBased: false,
    note: "Positions only, and not referenced from the bundle. The most conservative map you can still symbolicate with.",
  },
];

/** Quality level of the "nosources" family: positions mapped, source text dropped. */
export const QUALITY_WITHOUT_SOURCES = 4;

export const ENVIRONMENTS = [
  { id: "development", label: "Development / local dev server" },
  { id: "production", label: "Production build" },
];

/**
 * Weight sets. Each set sums to 1 so the base score lands in 0-100.
 * In a production build there is no watch-mode rebuild, so the rebuild weight
 * is folded into the build weight instead of being wasted.
 */
export const PRIORITIES = [
  {
    id: "rebuild-speed",
    label: "Fast feedback loop",
    weights: { build: 0.15, rebuild: 0.6, quality: 0.25 },
  },
  {
    id: "balanced",
    label: "Balanced",
    weights: { build: 0.3, rebuild: 0.3, quality: 0.4 },
  },
  {
    id: "debug-accuracy",
    label: "Most accurate stack traces",
    weights: { build: 0.1, rebuild: 0.15, quality: 0.75 },
  },
];

/** Bonus applied when the option is exactly the "upload to Sentry" shape. */
const ERROR_TRACKER_BONUS = 8;
/** Penalty for base64-inlining a map when download size matters. */
const INLINE_SIZE_PENALTY = 15;
/** Penalty for shipping a browser-fetchable map with full source in production. */
const PUBLIC_SOURCE_PENALTY = 25;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function findById(list, id) {
  return list.find((item) => item.id === id) || null;
}

/**
 * Rank every devtool value for one situation.
 *
 * @param {object} input
 * @param {"development"|"production"} input.environment
 * @param {"rebuild-speed"|"balanced"|"debug-accuracy"} input.priority
 * @param {boolean} input.allowPublicSource  may anyone with devtools read your source?
 * @param {boolean} input.useErrorTracker    do you upload maps to Sentry/Rollbar/Bugsnag?
 * @param {boolean} input.sizeSensitive      does shipped bundle size matter?
 * @returns {{error:string}|{recommended:object, ranked:object[], excluded:object[], weights:object}}
 */
export function chooseSourceMapStrategy({
  environment = "development",
  priority = "balanced",
  allowPublicSource = false,
  useErrorTracker = false,
  sizeSensitive = true,
} = {}) {
  const env = findById(ENVIRONMENTS, environment);
  if (!env) return { error: "Pick either a development or a production build." };

  const prio = findById(PRIORITIES, priority);
  if (!prio) return { error: "Pick one of the three priorities." };

  const isProd = env.id === "production";
  const base = prio.weights;
  const weights = isProd
    ? { build: base.build + base.rebuild, rebuild: 0, quality: base.quality }
    : base;

  const ranked = [];
  const excluded = [];

  for (const option of DEVTOOL_OPTIONS) {
    const reasons = [];
    let blocked = null;

    if (isProd && !option.productionSafe) {
      blocked =
        option.evalBased
          ? "eval-based maps are not production safe: every module ships wrapped in eval()"
          : "inlines the full map into the bundle every visitor downloads";
    } else if (isProd && !allowPublicSource && option.exposesSource) {
      blocked = "would let any visitor read your original source in devtools";
    } else if (useErrorTracker && option.quality < 4) {
      blocked = "too low fidelity to symbolicate uploaded stack traces";
    } else if (useErrorTracker && !option.emitsFile) {
      blocked = "produces no separate .map file to upload to the error tracker";
    }

    if (blocked) {
      excluded.push({ ...option, blocked });
      continue;
    }

    const buildPart = weights.build * (option.buildSpeed / 5);
    const rebuildPart = weights.rebuild * (option.rebuildSpeed / 5);
    const qualityPart = weights.quality * (option.quality / 5);
    let score = 100 * (buildPart + rebuildPart + qualityPart);

    if (useErrorTracker && option.emitsFile && !option.referenced) {
      score += ERROR_TRACKER_BONUS;
      reasons.push("Separate map that browsers never fetch — exactly what an error tracker wants.");
    }
    // Inlining only costs real users bytes in a production build; in dev the
    // bundle never leaves localhost, so the penalty does not apply there.
    if (sizeSensitive && isProd && option.inline) {
      score -= INLINE_SIZE_PENALTY;
      reasons.push("Map is base64-embedded, so the shipped bundle grows a lot.");
    }
    if (isProd && option.exposesSource && option.referenced) {
      score -= PUBLIC_SOURCE_PENALTY;
      reasons.push("Bundle references a map containing your source; anyone can fetch it.");
    }
    if (option.quality >= 4) {
      reasons.push(QUALITY_SCALE[option.quality] + ".");
    }
    if (!isProd && option.rebuildSpeed >= 4) {
      reasons.push("Rebuilds stay " + SPEED_SCALE[option.rebuildSpeed] + " in watch mode.");
    }

    ranked.push({
      ...option,
      score: clamp(Math.round(score * 10) / 10, 0, 100),
      reasons,
    });
  }

  if (ranked.length === 0) {
    return {
      error:
        "No devtool value satisfies those constraints together. Uploading maps to an error tracker needs a separate high-fidelity map, so allow a hidden or nosources map.",
    };
  }

  ranked.sort((a, b) => b.score - a.score || b.quality - a.quality);

  return {
    recommended: ranked[0],
    ranked,
    excluded,
    weights,
  };
}

/**
 * Equivalent settings in the other common bundlers.
 * Vite/Rollup expose `build.sourcemap: true | false | 'inline' | 'hidden'`;
 * esbuild exposes `sourcemap` plus `sourcesContent` for the nosources case.
 */
export function toBundlerConfig(option) {
  if (!option) return { error: "Pick a devtool value first." };

  let vite = "build: { sourcemap: false }";
  if (option.inline) vite = "build: { sourcemap: 'inline' }";
  else if (option.emitsFile && !option.referenced) vite = "build: { sourcemap: 'hidden' }";
  else if (option.emitsFile) vite = "build: { sourcemap: true }";

  let esbuild = "sourcemap: false";
  if (option.inline) esbuild = "sourcemap: 'inline'";
  else if (option.emitsFile && !option.referenced) esbuild = "sourcemap: 'external'";
  else if (option.emitsFile) esbuild = "sourcemap: 'linked'";
  // Quality level 4 is exactly the "nosources" family: positions are mapped but
  // the sourcesContent array is dropped. hidden-source-map still carries the
  // source text, it is simply never referenced from the bundle.
  if (option.quality === QUALITY_WITHOUT_SOURCES) esbuild += ",\nsourcesContent: false";

  let nextjs = "productionBrowserSourceMaps: false";
  if (option.emitsFile && option.referenced && option.quality >= 5) {
    nextjs = "productionBrowserSourceMaps: true";
  }

  return {
    webpack: "module.exports = {\n  devtool: " + (option.devtool === "false" ? "false" : "'" + option.devtool + "'") + ",\n};",
    vite: "export default defineConfig({\n  " + vite + ",\n});",
    esbuild: "await esbuild.build({\n  " + esbuild.split("\n").join("\n  ") + ",\n});",
    nextjs: "module.exports = {\n  " + nextjs + ",\n};",
  };
}
