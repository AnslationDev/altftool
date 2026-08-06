import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

const eslintConfig = defineConfig([
  ...nextVitals,
  {
    plugins: {
      react,
      "react-hooks": reactHooks,
    },
    rules: {
      "react/no-unescaped-entities": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/static-components": "warn",
    },
  },
  {
    // Business Ops contains imported, image-heavy microsites that mix remote,
    // bundled, and clipped comparison media. Keep every other quality rule
    // active while those pages are migrated to next/image one surface at a time.
    files: ["src/app/bops/**/*.{js,jsx,ts,tsx}"],
    rules: {
      "@next/next/no-img-element": "off",
    },
  },
  {
    // Top3 is hard-404 quarantined while its mock rankings are replaced with
    // sourced content. Keep structural linting active, but do not require an
    // image/text migration for code that cannot be served. Remove this block
    // together with the quarantine before reactivating the product family.
    files: ["src/app/top3/**/*.{js,jsx,ts,tsx}"],
    rules: {
      "@next/next/no-img-element": "off",
      "react/no-unescaped-entities": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "**/__MACOSX/**",
    "**/._*",
    "next-env.d.ts",
    // Leftover Claude Code agent worktrees (gitignored, but not excluded by
    // default) — without this, lint recurses into whatever sibling repo copy
    // happens to be checked out inside them.
    ".claude/**",
  ]),
]);

export default eslintConfig;
