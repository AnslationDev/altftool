import jsonld from "jsonld";
import { ok, err, isBlank } from "../types.js";

/** Shared JSON-LD document sample (inline context — no network needed). */
export const SAMPLE = `{
  "@context": {
    "name": "http://schema.org/name",
    "knows": "http://schema.org/knows",
    "Person": "http://schema.org/Person"
  },
  "@type": "Person",
  "@id": "http://example.com/ada",
  "name": "Ada Lovelace",
  "knows": {
    "@type": "Person",
    "@id": "http://example.com/charles",
    "name": "Charles Babbage"
  }
}`;

/**
 * Run a jsonld operation over a parsed document. `produce(jsonld, doc)` returns
 * either an object (serialized as JSON) or a string (returned as-is, e.g. for
 * N-Quads). Never throws.
 * @param {string} input
 * @param {(jsonldLib: any, doc: any) => Promise<any>} produce
 * @returns {Promise<import("../types.js").TransformResult>}
 */
export async function runJsonld(input, produce) {
  if (isBlank(input)) return err("Paste a JSON-LD document to convert.");
  let doc;
  try {
    doc = JSON.parse(input);
  } catch (e) {
    return err(`Invalid JSON: ${e.message}`);
  }
  try {
    const result = await produce(jsonld, doc);
    return ok(typeof result === "string" ? result : JSON.stringify(result, null, 2));
  } catch (e) {
    return err(e && e.message ? e.message : e);
  }
}
