import { createRequire } from "module";
import { ok, err, isBlank } from "../types.js";
import { TS_SAMPLE } from "./_ts.js";

const requireFn = createRequire(import.meta.url);

export const sample = TS_SAMPLE;

/** @type {import("../types.js").Transformer} */
export function transform(input) {
  if (isBlank(input)) return err("Paste TypeScript type declarations to convert.");
  try {
    const flowgen = requireFn("flowgen");
    const { compiler, beautify } = flowgen;
    const raw = compiler.compileDefinitionString(input, { interfaceRecordType: true });
    const flow = (typeof beautify === "function" ? beautify(raw) : raw).trim();
    if (!flow) return err("Nothing to convert — provide TypeScript interfaces or type aliases.");
    return ok(flow + "\n");
  } catch (e) {
    return err(e);
  }
}

export default transform;
