import yaml from "js-yaml";
import TOML from "@iarna/toml";
import { ok, err, isBlank } from "../types.js";

// TOML has no null. Drop null/undefined values (recording that we did so).
function sanitize(value, state) {
  if (Array.isArray(value)) {
    return value.map((v) => sanitize(v, state)).filter((v) => v !== undefined);
  }
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      if (v === null || v === undefined) {
        state.dropped += 1;
        continue;
      }
      out[k] = sanitize(v, state);
    }
    return out;
  }
  return value;
}

export const sample = `title: AltFTool Config
owner:
  name: Ada
  since: 2023
database:
  server: 192.168.1.1
  ports:
    - 8001
    - 8002
  enabled: true`;

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
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return err("TOML documents must have a top-level object (table).");
  }
  try {
    const state = { dropped: 0 };
    const clean = sanitize(data, state);
    const out = TOML.stringify(clean);
    const warnings = state.dropped ? [`Dropped ${state.dropped} null value(s) — TOML has no null type.`] : undefined;
    return ok(out, warnings);
  } catch (e) {
    return err(e);
  }
}

export default transform;
