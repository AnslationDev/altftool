import yaml from "js-yaml";
import { ok, err, isBlank } from "../types.js";

export const sample = `name: altftool
version: 1.0.0
private: true
keywords:
  - tools
  - converter
scripts:
  build: next build
  dev: next dev`;

/** @type {import("../types.js").Transformer} */
export function transform(input) {
  if (isBlank(input)) return err("Paste YAML to convert.");
  let data;
  try {
    data = yaml.load(input);
  } catch (e) {
    return err(`Invalid YAML: ${e && e.reason ? e.reason : e.message}`);
  }
  if (data === undefined) return err("The YAML document is empty.");
  try {
    return ok(JSON.stringify(data, null, 2));
  } catch (e) {
    return err(e);
  }
}

export default transform;
