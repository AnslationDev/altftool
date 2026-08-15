const seo = {
  title: "Prettier Config Generator: .prettierrc with Live Preview",
  metaDescription:
    "Set all 14 core Prettier 3 options with a live code sample, add per-file overrides for md/json/yaml, and copy a .prettierrc listing only what changed.",
  steps: [
    "Set the Options — Print width, Tab width, Trailing commas, Arrow function parens, Semicolons, Single quotes and the rest of the 14 core Prettier 3 settings, each labelled with its default.",
    "Tick \"Per-file overrides\" presets — Wrap markdown prose (*.md), Wider JSON lines (*.json) or the YAML preset — or \"Write every option explicitly, including defaults\".",
    "Compare the generated .prettierrc JSON with the \"Sample with these options\" preview, then click \"Copy JSON\" and save it as .prettierrc in your project root.",
  ],
  intro:
    "This generator produces a ready-to-commit .prettierrc covering all fourteen core Prettier 3 options — print width, tabs, semicolons, quotes, trailing commas, arrow parens and more — with a live sample showing what each choice does to real code. It emits only the options you changed from the documented Prettier 3 defaults (or all of them if you prefer explicit config), plus optional per-file overrides for markdown, JSON and YAML.",
  useCases: [
    "A team standardising formatting on a new repository and wanting a minimal .prettierrc that records only deliberate deviations from defaults",
    "A developer migrating from Prettier 2 to 3 checking which options changed meaning, such as trailingComma moving from es5 to all",
    "A maintainer adding a per-file override so markdown prose wraps at the print width while code files keep their settings",
  ],
  benefits: [
    ["Minimal diff-friendly output", "Only options that differ from Prettier 3 defaults are written, so the config documents intent rather than noise."],
    ["Live sample preview", "Quotes, semicolons, indentation, trailing commas and arrow parens are shown applied to a code snippet as you toggle them."],
    ["Override presets", "One-click overrides blocks for *.md prose wrapping, wider *.json lines and YAML conventions."],
  ],
  faqs: [
    [
      "What are the default Prettier settings?",
      "Prettier 3 defaults to printWidth 80, tabWidth 2, spaces (not tabs), semicolons on, double quotes, trailingComma \"all\", bracketSpacing on, arrowParens \"always\", proseWrap \"preserve\" and endOfLine \"lf\". An empty {} config file gives you exactly these values, which is why this tool omits anything you leave at its default.",
    ],
    [
      "What changed between Prettier 2 and Prettier 3 defaults?",
      "The headline change is trailingComma: it defaults to \"all\" in 3.0, where 2.x used \"es5\", so function call arguments now get trailing commas too. If your team pinned \"es5\" behaviour, set trailingComma explicitly rather than relying on the default.",
    ],
    [
      "Where do I put the .prettierrc file?",
      "In your project root, next to package.json. Prettier also accepts .prettierrc.json, .prettierrc.yml, prettier.config.js and a \"prettier\" key inside package.json — the JSON this tool generates works for the .prettierrc and .prettierrc.json forms directly.",
    ],
    [
      "How do Prettier overrides work for specific file types?",
      "An overrides array entry pairs a files glob with an options object, and those options apply only to matching files — for example files \"*.md\" with proseWrap \"always\" wraps markdown paragraphs at the print width while leaving code untouched. Later entries win when several globs match the same file.",
    ],
  ],
};

export default seo;
