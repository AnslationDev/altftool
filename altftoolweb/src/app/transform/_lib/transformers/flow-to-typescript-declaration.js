import ts from "typescript";
import { ok, err, isBlank } from "../types.js";
import { flowToTypeScript, FLOW_SAMPLE } from "./_flowToTs.js";

export const sample = FLOW_SAMPLE;

/** @type {import("../types.js").Transformer} */
export function transform(input) {
  if (isBlank(input)) return err("Paste Flow-typed code to convert.");
  try {
    const tsCode = String(flowToTypeScript(input) || "");
    if (!tsCode.trim()) return err("Nothing to convert.");
    if (typeof ts.transpileDeclaration !== "function") {
      return err("The installed TypeScript version cannot emit declarations.");
    }
    const dts = (ts.transpileDeclaration(tsCode, { compilerOptions: { declaration: true } }).outputText || "").trim();
    if (!dts) return err("No declarations were emitted.");
    return ok(dts + "\n");
  } catch (e) {
    return err(e && e.message ? e.message : e);
  }
}

export default transform;
