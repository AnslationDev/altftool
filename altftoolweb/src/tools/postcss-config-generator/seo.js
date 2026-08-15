const seo = {
  title: "PostCSS Config Generator - Plugins in the Right Order",
  metaDescription:
    "Generate postcss.config.mjs, .js or .postcssrc.json with import, nesting, preset-env, autoprefixer and cssnano in order, plus the install command.",
  steps: [
    "Tick the plugins you need - postcss-import, postcss-preset-env, autoprefixer, cssnano - choose a Nesting plugin (W3C postcss-nesting or Sass-style postcss-nested) and an Output format: postcss.config.mjs, postcss.config.js or .postcssrc.json.",
    "Fine-tune with the preset-env stage (0-4), a Browserslist override, and the Minify only when NODE_ENV === \"production\" checkbox so development output stays readable.",
    "Press Copy config to copy the generated file - the panel shows the exact filename, the plugin chain in run order, redundancy warnings, and the npm install command for your selection.",
  ],
  intro:
    "This generator produces a ready-to-use PostCSS configuration file — postcss.config.mjs, postcss.config.js or .postcssrc.json — in the object-plugin syntax read by postcss-load-config, the loader used by Next.js, Vite and the PostCSS CLI. It orders postcss-import, nesting, postcss-preset-env, autoprefixer and cssnano correctly for the pipeline, and can gate minification behind NODE_ENV === \"production\" so development builds stay readable.",
  useCases: [
    "A developer setting up a new Vite or Next.js project who wants autoprefixer and spec-compliant CSS nesting without reading five plugin READMEs",
    "A team debugging why @import rules are not being processed, discovering that postcss-import must be the first plugin in the chain",
    "A build engineer adding cssnano to production builds only, so local development output remains unminified and debuggable",
  ],
  benefits: [
    ["Correct plugin order", "Emits imports first, nesting before prefixing and cssnano last — the order the plugin authors themselves document."],
    ["Redundancy warnings", "Flags that postcss-preset-env already includes autoprefixer and nesting-rules, so you do not run the same transform twice."],
    ["Three output formats", "ESM, CommonJS or JSON, plus the exact npm install command for the plugins you selected."],
  ],
  faqs: [
    [
      "Does the order of PostCSS plugins matter?",
      "Yes — PostCSS runs plugins strictly top to bottom, each receiving the previous plugin's output. postcss-import must run first so later plugins see the inlined files, nesting must be flattened before autoprefixer processes selectors, and cssnano's documentation says to run it last on the final CSS.",
    ],
    [
      "What is the difference between postcss-nesting and postcss-nested?",
      "postcss-nesting implements the W3C CSS Nesting specification — the same syntax browsers now ship natively — while postcss-nested implements Sass-style nesting, which is more permissive about bare selectors. If you want code that can eventually run unprocessed in browsers, choose postcss-nesting.",
    ],
    [
      "Do I need autoprefixer if I already use postcss-preset-env?",
      "No — postcss-preset-env runs autoprefixer internally, so listing both prefixes the same properties twice for no benefit. Use autoprefixer alone if vendor prefixes are all you need, or preset-env alone if you also want future CSS features transpiled by stage (its default is stage 2).",
    ],
    [
      "How do I make cssnano run only in production?",
      "Use a JavaScript config (postcss.config.mjs or .js) and spread cssnano into the plugins object only when process.env.NODE_ENV === \"production\", which is exactly what this generator emits. A JSON config cannot branch on environment variables, so JSON output includes cssnano unconditionally.",
    ],
  ],
};

export default seo;
