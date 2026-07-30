import { createRequire } from "module";
import { ok, err, isBlank } from "../types.js";

const requireFn = createRequire(import.meta.url);

export const sample = `// @flow
type User = {
  id: number,
  name: string,
};

const greet = (user: User): string => "Hello, " + user.name;

export function double(n: number): number {
  return n * 2;
}`;

/** @type {import("../types.js").Transformer} */
export function transform(input) {
  if (isBlank(input)) return err("Paste Flow-typed JavaScript to convert.");
  try {
    const babel = requireFn("@babel/core");
    // Babel resolves a preset named as a bare string against `cwd`, not against
    // this file, so a workspace-hoisted @babel/preset-flow is invisible to it
    // and transformSync throws "Cannot find module". Resolving to an absolute
    // path here makes it independent of where the server was started.
    const result = babel.transformSync(input, {
      presets: [[requireFn.resolve("@babel/preset-flow")]],
      filename: "input.js",
      babelrc: false,
      configFile: false,
      compact: false,
      retainLines: false,
    });
    const out = (result && result.code ? result.code : "").trim();
    if (!out) return err("Nothing to output after stripping Flow types.");
    return ok(out + "\n");
  } catch (e) {
    return err(e && e.message ? e.message : e);
  }
}

export default transform;
