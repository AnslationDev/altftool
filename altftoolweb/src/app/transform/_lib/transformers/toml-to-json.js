import TOML from "@iarna/toml";
import { ok, err, isBlank } from "../types.js";

export const sample = `title = "AltFTool Config"

[owner]
name = "Ada"
since = 2023

[database]
server = "192.168.1.1"
ports = [8001, 8002]
enabled = true`;

/** @type {import("../types.js").Transformer} */
export function transform(input) {
  if (isBlank(input)) return err("Paste TOML to convert.");
  try {
    const data = TOML.parse(input);
    return ok(JSON.stringify(data, null, 2));
  } catch (e) {
    return err(`Invalid TOML: ${e && e.message ? e.message : e}`);
  }
}

export default transform;
