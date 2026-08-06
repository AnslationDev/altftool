#!/usr/bin/env node
/**
 * Fails the build when a file calls a React or framer-motion hook it never imported.
 *
 * This exists because /brandrating shipped broken twice in one day. Removing
 * invented ratings also pruned four icons and two hooks from its import lists
 * while their call sites survived, and nothing caught it:
 *
 *   - eslint's react/jsx-no-undef only inspects JSX ELEMENTS. `icon: FlaskConical`
 *     inside a module-level array is a plain identifier, and `useRef(null)` is a
 *     call — neither is JSX, so both passed a clean lint.
 *   - no-undef is not enabled here (eslint-config-next leaves it off and the
 *     config sets no globals, so turning it on would flag window/document).
 *   - The failure is client-side. The server render succeeds and returns 200
 *     with a full page; React throws at hydration and the error boundary
 *     replaces the content in the browser. curl sees a healthy 270 KB response
 *     for a route that is broken for every real visitor, so status-code checks
 *     and grep-for-a-missing-string checks both report success.
 *
 * Deliberately narrow. It matches only what it can be sure of, because a guard
 * with false positives gets disabled. Two traps found while writing it: import
 * quotes may be single OR double, and `{ icon: Icon }` in a destructuring
 * pattern is a local binding, not a reference to an import.
 */
import fs from "node:fs";
import path from "node:path";

const ROOTS = ["src/app", "src/tools", "src/platform", "src/components"];
/**
 * Hooks checked per source module. framer-motion is here because /brandrating
 * broke a THIRD time on `useInView is not defined` after the React hooks were
 * restored — the same pruning had cut it from the framer-motion import, and a
 * React-only guard could not see it. Any module whose hooks are called bare is
 * a candidate for this list.
 */
const HOOKS_BY_MODULE = {
  react: [
    "useRef", "useState", "useEffect", "useMemo", "useCallback", "useId",
    "useReducer", "useContext", "useLayoutEffect", "useTransition",
  ],
  "framer-motion": [
    "useInView", "useScroll", "useTransform", "useAnimation", "useMotionValue",
    "useSpring", "useAnimationControls", "useMotionTemplate", "useReducedMotion",
    "useDragControls", "useAnimate", "useVelocity",
  ],
};

const ALL_HOOKS = Object.values(HOOKS_BY_MODULE).flat();

/** Named bindings of `import ... { a, b as c } from "<mod>"`, either quote style. */
function namedImports(source, mod) {
  const re = new RegExp(
    String.raw`import\s+(?:[A-Za-z0-9_$]+\s*,\s*)?\{([^}]*)\}\s*from\s*['"]${mod}['"]`,
    "g",
  );
  const out = new Set();
  for (const m of source.matchAll(re)) {
    for (const part of m[1].split(",")) {
      const name = part.trim().split(/\s+as\s+/).pop()?.trim();
      if (name) out.add(name);
    }
  }
  return out;
}

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!/node_modules|\.next/.test(full)) walk(full, files);
    } else if (/\.jsx?$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

const offenders = [];
let scanned = 0;

for (const root of ROOTS) {
  for (const file of walk(root)) {
    scanned += 1;
    const source = fs.readFileSync(file, "utf8");
    // Strip comments before looking for call sites. The first version flagged
    // bazaar/BrowseView.jsx for useId, which appears only inside a comment
    // explaining why a constant is used INSTEAD of useId().
    const code = source
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/(^|[^:])\/\/[^\n]*/g, "$1");
    const missing = [];

    // Names bound by ANY import in this file. Checking only `from "react"` or
    // only `from "framer-motion"` was wrong twice over: several files re-export
    // useReducedMotion from a local lib/motion, and flagging those called eight
    // working files broken. What matters is whether the identifier is bound at
    // all, not which module it came from.
    const bound = new Set();
    for (const m of code.matchAll(/import\s+([^;]*?)\s+from\s*['"][^'"]+['"]/g)) {
      for (const part of m[1].replace(/[{}]/g, ",").split(",")) {
        const name = part.trim().split(/\s+as\s+/).pop()?.trim();
        if (name && /^[A-Za-z_$][\w$]*$/.test(name)) bound.add(name);
      }
    }

    for (const hook of ALL_HOOKS) {
      // A bare call only — `React.useRef(...)` is fine with a default import.
      if (!new RegExp(String.raw`(?<![.\w])${hook}\s*\(`).test(code)) continue;
      if (bound.has(hook)) continue;
      // A local `function useThing()` or `const { useThing } = X` also counts.
      if (new RegExp(String.raw`(?:const|let|var|function)\s+${hook}\b`).test(code)) continue;
      if (new RegExp(String.raw`(?:const|let|var)\s*\{[^}]*\b${hook}\b[^}]*\}\s*=`).test(code)) continue;
      missing.push(hook);
    }

    // An icon check lived here and was removed. `icon:` is followed by a
    // component in most files but by Math, React, STEP or PRODUCT in others, and
    // every attempt to separate them kept flagging working code. A guard that
    // cries wolf gets switched off, so this one checks only what it can be sure
    // of. The lucide half of the /brandrating break is covered in practice by
    // react/jsx-no-undef wherever the icon is also used as an element.

    if (missing.length) offenders.push({ file, missing: [...new Set(missing)] });
  }
}

if (offenders.length === 0) {
  console.log(`Pruned import guard: OK (${scanned} files).`);
  process.exit(0);
}

console.error(
  `Pruned import guard: ${offenders.length} file(s) use something they never imported.\n`,
);
for (const { file, missing } of offenders) {
  console.error(`  ${file}\n    ${missing.join(", ")}\n`);
}
console.error(
  "These do not fail the server render. The page returns 200 with full HTML and\n" +
    "then throws at hydration, so the error boundary replaces it in the browser\n" +
    "while curl reports success. Add the identifier to the file's import list.",
);
process.exit(1);
