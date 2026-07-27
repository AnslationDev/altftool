// @khanacademy/flow-to-ts ships a broken "main" (points at dist/convert.js,
// which isn't published) — the real, self-contained entry is
// dist/convert.bundle.js. Import it directly.
import pkg from "@khanacademy/flow-to-ts/dist/convert.bundle.js";

const convert = pkg && typeof pkg.convert === "function" ? pkg.convert : pkg;

/** Convert Flow-typed source into TypeScript. */
export function flowToTypeScript(code) {
  return convert(code, { prettier: false });
}

export const FLOW_SAMPLE = `type User = {
  id: number,
  name: string,
  email: ?string,
  roles: Array<string>,
};

export function greet(user: User): string {
  return "Hello, " + user.name;
}`;
