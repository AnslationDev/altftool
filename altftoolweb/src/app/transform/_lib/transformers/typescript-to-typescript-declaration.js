import ts from "typescript";
import { ok, err, isBlank } from "../types.js";
import { TS_CODE_SAMPLE } from "./_ts.js";

export const sample = TS_CODE_SAMPLE;

/** @type {import("../types.js").Transformer} */
export function transform(input) {
  if (isBlank(input)) return err("Paste TypeScript to convert.");
  if (typeof ts.transpileDeclaration !== "function") {
    return err("The installed TypeScript version cannot emit declarations from a string.");
  }
  try {
    const result = ts.transpileDeclaration(input, {
      compilerOptions: { declaration: true },
    });
    const out = (result.outputText || "").trim();
    if (!out) return err("No declarations were emitted for this input.");
    return ok(out + "\n");
  } catch (e) {
    return err(e);
  }
}

export default transform;
