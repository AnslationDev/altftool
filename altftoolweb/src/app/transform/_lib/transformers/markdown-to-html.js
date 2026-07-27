import { marked } from "marked";
import { ok, err, isBlank } from "../types.js";

/** @type {import("../types.js").ToolOption[]} */
export const options = [
  { key: "gfm", label: "GitHub-flavored", type: "boolean", default: true },
  { key: "breaks", label: "Convert newlines to <br>", type: "boolean", default: false },
];

export const sample = `# AltFTool

Convert **Markdown** into clean _HTML_.

- Fast
- Private
- [Open source](https://example.com)

\`\`\`js
const x = 1;
\`\`\`

> A blockquote.`;

/** @type {import("../types.js").Transformer} */
export function transform(input, opts = {}) {
  if (isBlank(input)) return err("Paste Markdown to convert.");
  try {
    const html = marked.parse(input, {
      gfm: opts.gfm !== false,
      breaks: Boolean(opts.breaks),
      async: false,
    });
    return ok(String(html).trim() + "\n");
  } catch (e) {
    return err(e);
  }
}

export default transform;
