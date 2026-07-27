import { ok, err, isBlank } from "../types.js";

/**
 * Best-effort conversion of Cadence (Flow blockchain) struct / resource
 * definitions into Go struct scaffolding. It maps field declarations and their
 * types; function bodies and logic are not translated. A heuristic converter.
 */

const pascal = (s) => s.replace(/^./, (c) => c.toUpperCase());

const SCALAR = {
  Int: "int64", Int8: "int8", Int16: "int16", Int32: "int32", Int64: "int64", Int128: "int64", Int256: "int64",
  UInt: "uint64", UInt8: "uint8", UInt16: "uint16", UInt32: "uint32", UInt64: "uint64", UInt128: "uint64", UInt256: "uint64",
  Word8: "uint8", Word16: "uint16", Word32: "uint32", Word64: "uint64",
  Fix64: "float64", UFix64: "float64",
  String: "string", Character: "string", Bool: "bool", Address: "string",
  AnyStruct: "interface{}", AnyResource: "interface{}", Void: "struct{}",
};

function goType(cadence) {
  let t = cadence.trim();
  let optional = false;
  if (t.endsWith("?")) {
    optional = true;
    t = t.slice(0, -1).trim();
  }
  let go;
  if (t.startsWith("[") && t.endsWith("]")) {
    go = "[]" + goType(t.slice(1, -1));
  } else if (t.startsWith("{") && t.endsWith("}")) {
    const inner = t.slice(1, -1);
    const idx = inner.indexOf(":");
    if (idx !== -1) {
      go = `map[${goType(inner.slice(0, idx))}]${goType(inner.slice(idx + 1))}`;
    } else {
      go = "map[string]interface{}";
    }
  } else {
    go = SCALAR[t] || pascal(t);
  }
  return optional ? `*${go}` : go;
}

function extractBlocks(src) {
  const blocks = [];
  const re = /(?:access\s*\([^)]*\)\s*|pub\s+|priv\s+)*(struct|resource)\b(?:\s+interface)?\s+(\w+)/g;
  let m;
  while ((m = re.exec(src))) {
    const name = m[2];
    const open = src.indexOf("{", re.lastIndex);
    if (open === -1) continue;
    let depth = 0;
    let close = open;
    for (; close < src.length; close++) {
      if (src[close] === "{") depth++;
      else if (src[close] === "}") {
        depth--;
        if (depth === 0) break;
      }
    }
    blocks.push({ name, body: src.slice(open + 1, close) });
    re.lastIndex = close + 1;
  }
  return blocks;
}

function extractFields(body) {
  const fields = [];
  const re = /(?:access\s*\([^)]*\)\s*|pub\s+|priv\s+)*(?:let|var)\s+(\w+)\s*:\s*([A-Za-z0-9_[\]{}:\s?.]+?)(?:\n|$|=)/g;
  let m;
  while ((m = re.exec(body))) {
    fields.push({ name: m[1], type: m[2].trim().replace(/\s+/g, " ") });
  }
  return fields;
}

export const sample = `access(all) struct Person {
  access(all) let id: Int
  access(all) var name: String
  access(all) let wallet: Address
  access(all) let balance: UFix64
  access(all) let tags: [String]
  access(all) let nickname: String?

  init(id: Int, name: String) {
    self.id = id
    self.name = name
  }
}`;

/** @type {import("../types.js").Transformer} */
export function transform(input) {
  if (isBlank(input)) return err("Paste Cadence struct or resource definitions to convert.");
  try {
    const blocks = extractBlocks(input);
    if (blocks.length === 0) {
      return err("No Cadence struct or resource definitions found.");
    }
    const out = blocks
      .map(({ name, body }) => {
        const fields = extractFields(body);
        const lines = fields.map((f) => `\t${pascal(f.name)} ${goType(f.type)}`);
        if (lines.length === 0) return `type ${pascal(name)} struct {\n}`;
        return `type ${pascal(name)} struct {\n${lines.join("\n")}\n}`;
      })
      .join("\n\n");
    return ok(out + "\n", ["Cadence → Go is a best-effort field mapping; logic and functions are not translated."]);
  } catch (e) {
    return err(e);
  }
}

export default transform;
