import convert from "xml-js";
import { ok, err, isBlank } from "../types.js";

/** @type {import("../types.js").ToolOption[]} */
export const options = [
  {
    key: "compact",
    label: "Compact JSON",
    type: "boolean",
    default: true,
  },
  {
    key: "indent",
    label: "Indent",
    type: "select",
    default: "2",
    choices: [
      { value: "2", label: "2 spaces" },
      { value: "4", label: "4 spaces" },
    ],
  },
];

export const sample = `<?xml version="1.0" encoding="utf-8"?>
<note importance="high" logged="true">
  <title>Happy</title>
  <todo>Work</todo>
  <todo>Play</todo>
</note>`;

/** @type {import("../types.js").Transformer} */
export function transform(input, opts = {}) {
  if (isBlank(input)) return err("Paste XML to convert.");
  try {
    const compact = opts.compact !== false;
    const spaces = Number(opts.indent) === 4 ? 4 : 2;
    const json = convert.xml2json(input, { compact, spaces });
    return ok(json);
  } catch (e) {
    return err(`Invalid XML: ${e && e.message ? e.message : e}`);
  }
}

export default transform;
