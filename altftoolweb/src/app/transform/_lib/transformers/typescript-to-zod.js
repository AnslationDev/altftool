import { generate } from "ts-to-zod";
import { ok, err, isBlank } from "../types.js";
import { TS_SAMPLE } from "./_ts.js";

export const sample = TS_SAMPLE;

/** @type {import("../types.js").Transformer} */
export function transform(input) {
  if (isBlank(input)) return err("Paste TypeScript interfaces or types to convert.");
  try {
    const result = generate({ sourceText: input });
    const errors = Array.isArray(result.errors) ? result.errors.filter(Boolean).map(String) : [];
    const out = result.getZodSchemasFile("./types").trim();
    if (!out) return err("No Zod schemas were generated — provide exported interfaces or types.");
    return ok(out + "\n", errors.length ? errors : undefined);
  } catch (e) {
    return err(e);
  }
}

export default transform;
