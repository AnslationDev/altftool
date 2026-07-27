import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createGenerator } from "ts-json-schema-generator";
import { ok, err, isBlank } from "../types.js";
import { TS_SAMPLE } from "./_ts.js";

export const sample = TS_SAMPLE;

// ts-json-schema-generator reads from a file, so the input is written to a
// short-lived temp file (server-side only) and removed immediately after.
/** @type {import("../types.js").Transformer} */
export function transform(input) {
  if (isBlank(input)) return err("Paste TypeScript to convert.");
  const tmp = path.join(os.tmpdir(), `altft-tsjs-${process.pid}-${Date.now()}.ts`);
  try {
    fs.writeFileSync(tmp, input, "utf8");
    const schema = createGenerator({
      path: tmp,
      type: "*",
      skipTypeCheck: true,
      expose: "all",
      additionalProperties: false,
    }).createSchema("*");
    return ok(JSON.stringify(schema, null, 2));
  } catch (e) {
    return err(e && e.message ? e.message : e);
  } finally {
    try {
      fs.rmSync(tmp, { force: true });
    } catch {
      /* best effort */
    }
  }
}

export default transform;
