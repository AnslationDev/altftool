import html2pug from "html2pug";
import { ok, err, isBlank } from "../types.js";

/** @type {import("../types.js").ToolOption[]} */
export const options = [
  { key: "fragment", label: "Fragment (no html/body wrapper)", type: "boolean", default: true },
  { key: "tabs", label: "Indent with tabs", type: "boolean", default: false },
];

export const sample = `<section class="hero">
  <h1 id="title">Hello world</h1>
  <p>Convert <a href="https://example.com">HTML</a> into <b>Pug</b>.</p>
  <ul>
    <li>First</li>
    <li>Second</li>
  </ul>
</section>`;

/** @type {import("../types.js").Transformer} */
export function transform(input, opts = {}) {
  if (isBlank(input)) return err("Paste HTML to convert.");
  try {
    const fn = typeof html2pug === "function" ? html2pug : html2pug.default;
    const pug = fn(input, {
      tabs: Boolean(opts.tabs),
      fragment: opts.fragment !== false,
    });
    if (!pug || !pug.trim()) return err("Could not convert this HTML to Pug.");
    return ok(pug.trim());
  } catch (e) {
    return err(e);
  }
}

export default transform;
