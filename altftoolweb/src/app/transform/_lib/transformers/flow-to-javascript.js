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
    const result = babel.transformSync(input, {
      presets: [["@babel/preset-flow"]],
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
