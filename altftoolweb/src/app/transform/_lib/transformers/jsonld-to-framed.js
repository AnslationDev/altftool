import { runJsonld, SAMPLE } from "./_jsonld.js";

export const sample = SAMPLE;

/** @type {import("../types.js").Transformer} */
export function transform(input) {
  return runJsonld(input, (jsonld, doc) => {
    const frame = { "@context": doc && doc["@context"] ? doc["@context"] : {} };
    if (doc && doc["@type"]) frame["@type"] = doc["@type"];
    return jsonld.frame(doc, frame);
  });
}

export default transform;
