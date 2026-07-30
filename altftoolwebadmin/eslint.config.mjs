import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

// Mirrors altftoolweb/eslint.config.mjs so both apps in this workspace enforce
// the same baseline — this app previously had no lint config or `lint` script
// at all, unlike its sibling.
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
      // Several editor/autosave hooks deliberately mutate a ref during render
      // (e.g. `latestRef.current = value`) so a keyboard-shortcut handler or
      // debounced callback always reads the latest value without waiting a
      // render cycle for an effect to run — moving that into useEffect would
      // reintroduce the exact stale-closure bug the pattern exists to avoid.
      // Downgraded to match this config's existing treatment of the other
      // new/strict react-hooks rules above: informational here, not a
      // blocker, rather than rewriting known-safe editor code under time
      // pressure to satisfy a rule literalism.
      "react-hooks/refs": "warn",
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
    // Generated, not hand-maintained.
    "src/config/toolCatalog.generated.js",
    "src/config/toolSlugs.generated.js",
  ]),
]);

export default eslintConfig;
