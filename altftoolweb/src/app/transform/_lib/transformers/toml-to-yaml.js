import TOML from "@iarna/toml";
import yaml from "js-yaml";
import { ok, err, isBlank } from "../types.js";

/** @type {import("../types.js").ToolOption[]} */
export const options = [
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

export const sample = `title = "AltFTool Config"

[owner]
name = "Ada"
since = 2023

[database]
server = "192.168.1.1"
ports = [8001, 8002]
enabled = true`;

/** @type {import("../types.js").Transformer} */
export function transform(input, opts = {}) {
  if (isBlank(input)) return err("Paste TOML to convert.");
  try {
    const data = TOML.parse(input);
    const out = yaml.dump(data, {
      indent: Number(opts.indent) === 4 ? 4 : 2,
      lineWidth: -1,
      noRefs: true,
      sortKeys: false,
    });
    return ok(out);
  } catch (e) {
    return err(`Invalid TOML: ${e && e.message ? e.message : e}`);
  }
}

export default transform;
