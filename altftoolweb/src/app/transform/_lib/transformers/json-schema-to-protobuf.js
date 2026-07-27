import { ok, err, isBlank } from "../types.js";

const pascal = (s) =>
  String(s)
    .replace(/(^|[_\-\s]+)([a-zA-Z0-9])/g, (_, __, c) => c.toUpperCase())
    .replace(/[^A-Za-z0-9]/g, "") || "Message";
const singular = (s) => (/[^s]s$/.test(s) ? s.replace(/s$/, "") : s);

const SCALAR = { integer: "int64", number: "double", boolean: "bool", string: "string" };

function typeName(schema) {
  if (!schema || typeof schema !== "object") return "string";
  const t = Array.isArray(schema.type) ? schema.type.find((x) => x !== "null") : schema.type;
  return t;
}

function fieldType(name, schema, messages) {
  const t = typeName(schema);
  if (t === "object" || schema.properties) {
    const msg = pascal(name);
    buildMessage(msg, schema, messages);
    return msg;
  }
  return SCALAR[t] || "string";
}

function buildMessage(name, schema, messages) {
  if (messages.has(name)) return;
  messages.set(name, null); // reserve to avoid infinite recursion
  const props = schema.properties || {};
  const lines = [];
  let n = 1;
  for (const key of Object.keys(props)) {
    const prop = props[key];
    const t = typeName(prop);
    if (t === "array") {
      const itemType = fieldType(singular(key), prop.items || {}, messages);
      lines.push(`  repeated ${itemType} ${key} = ${n};`);
    } else {
      lines.push(`  ${fieldType(key, prop, messages)} ${key} = ${n};`);
    }
    n += 1;
  }
  messages.set(name, `message ${name} {\n${lines.join("\n")}\n}`);
}

export const sample = `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "User",
  "type": "object",
  "properties": {
    "id": { "type": "integer" },
    "name": { "type": "string" },
    "score": { "type": "number" },
    "active": { "type": "boolean" },
    "roles": { "type": "array", "items": { "type": "string" } },
    "address": {
      "type": "object",
      "properties": { "city": { "type": "string" }, "zip": { "type": "string" } }
    }
  }
}`;

/** @type {import("../types.js").Transformer} */
export function transform(input) {
  if (isBlank(input)) return err("Paste a JSON Schema to convert.");
  let schema;
  try {
    schema = JSON.parse(input);
  } catch (e) {
    return err(`Invalid JSON: ${e.message}`);
  }
  if (typeName(schema) !== "object" && !schema.properties) {
    return err("Protobuf messages are generated from an object-typed JSON Schema.");
  }
  try {
    const messages = new Map();
    const rootName = typeof schema.title === "string" && schema.title.trim() ? pascal(schema.title) : "Root";
    buildMessage(rootName, schema, messages);
    const entries = [...messages.entries()].filter(([, def]) => def);
    const rootDef = entries.find(([n]) => n === rootName);
    const rest = entries.filter(([n]) => n !== rootName);
    const body = [rootDef, ...rest].map(([, def]) => def).join("\n\n");
    return ok(`syntax = "proto3";\n\n${body}\n`);
  } catch (e) {
    return err(e);
  }
}

export default transform;
