import { quicktype, InputData, jsonInputForTargetLanguage } from "quicktype-core";
import { ok, err, isBlank } from "../types.js";

/**
 * Shared quicktype-core adapter. One place to turn a JSON sample into any
 * target language, reused by every quicktype-backed converter (Go, Java,
 * Kotlin, Rust, Scala, TypeScript, Flow, …). Server-only (quicktype is
 * Node-only). Never throws — returns a TransformResult.
 *
 * @param {string} input raw JSON text
 * @param {{ lang: string, topLevel?: string, rendererOptions?: Record<string,string>, post?: (s: string) => string }} config
 * @returns {Promise<import("../types.js").TransformResult>}
 */
export async function jsonToLanguage(input, { lang, topLevel = "Root", rendererOptions = {}, post } = {}) {
  if (isBlank(input)) return err("Paste JSON to convert.");
  try {
    JSON.parse(input);
  } catch (e) {
    return err(`Invalid JSON: ${e.message}`);
  }
  try {
    const jsonInput = jsonInputForTargetLanguage(lang);
    await jsonInput.addSource({ name: topLevel, samples: [input] });
    const inputData = new InputData();
    inputData.addInput(jsonInput);
    const { lines } = await quicktype({ inputData, lang, rendererOptions });
    let out = lines.join("\n");
    if (typeof post === "function") out = post(out);
    out = out.replace(/\s+$/, "") + "\n";
    if (!out.trim()) return err("quicktype produced no output for this input.");
    return ok(out);
  } catch (e) {
    return err(e);
  }
}

/** A shared, realistic JSON sample most quicktype tools can reuse. */
export const JSON_SAMPLE = `{
  "id": 101,
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "active": true,
  "score": 98.6,
  "roles": ["admin", "editor"],
  "address": {
    "city": "London",
    "postcode": "SW1A 1AA"
  }
}`;
