import JSON5 from "json5";
import { extractLiteral } from "./_js.js";
import { ok, err, isBlank } from "../types.js";

function kebab(key) {
  if (key.startsWith("--")) return key;
  return key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}

function render(obj, depth) {
  const pad = "  ".repeat(depth);
  const lines = [];
  for (const [k, v] of Object.entries(obj)) {
    if (v && typeof v === "object" && !Array.isArray(v)) {
      lines.push(`${pad}${kebab(k)} {`);
      lines.push(render(v, depth + 1));
      lines.push(`${pad}}`);
    } else {
      lines.push(`${pad}${kebab(k)}: ${v};`);
    }
  }
  return lines.join("\n");
}

export const sample = `const styles = {
  backgroundColor: '#2563eb',
  borderRadius: '8px',
  padding: '8px 16px',
  color: 'white',
  '&:hover': {
    backgroundColor: '#1d4ed8',
  },
};`;

/** @type {import("../types.js").Transformer} */
export function transform(input) {
  if (isBlank(input)) return err("Paste a JavaScript style object to convert.");
  let obj;
  try {
    obj = JSON5.parse(extractLiteral(input));
  } catch (e) {
    return err(
      `Could not parse style object: ${e.message}. Provide a plain object of styles ` +
        "(optionally as `const styles = { ... }`).",
    );
  }
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) {
    return err("Provide a JavaScript object of styles.");
  }
  try {
    return ok("`\n" + render(obj, 1) + "\n`\n");
  } catch (e) {
    return err(e);
  }
}

export default transform;
