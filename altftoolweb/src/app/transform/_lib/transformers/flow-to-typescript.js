import { ok, err, isBlank } from "../types.js";
import { flowToTypeScript, FLOW_SAMPLE } from "./_flowToTs.js";

export const sample = FLOW_SAMPLE;

/** @type {import("../types.js").Transformer} */
export function transform(input) {
  if (isBlank(input)) return err("Paste Flow-typed code to convert.");
  try {
    const out = String(flowToTypeScript(input) || "").trim();
    if (!out) return err("Nothing to convert.");
    return ok(out + "\n");
  } catch (e) {
    return err(e && e.message ? e.message : e);
  }
}

export default transform;
