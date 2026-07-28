import { parse } from "graphql";
import { err, isBlank, ok } from "../types.js";
import { SCHEMA_SAMPLE } from "./_graphql.js";

export const sample = SCHEMA_SAMPLE;

const BUILTIN_SCALARS = {
  ID: "string",
  String: "string",
  Int: "number",
  Float: "number",
  Boolean: "boolean",
};

function typeName(typeNode) {
  if (!typeNode) return "any";
  if (typeNode.kind === "NonNullType") return typeName(typeNode.type);
  if (typeNode.kind === "ListType") return `$ReadOnlyArray<${typeName(typeNode.type)}>`;
  if (typeNode.kind === "NamedType") return BUILTIN_SCALARS[typeNode.name.value] || typeNode.name.value;
  return "any";
}

function maybeType(typeNode) {
  const rendered = typeName(typeNode);
  return typeNode?.kind === "NonNullType" ? rendered : `?${rendered}`;
}

function renderField(field) {
  const nullable = field.type?.kind !== "NonNullType";
  const suffix = nullable ? "?" : "";
  return `  ${field.name.value}${suffix}: ${maybeType(field.type)},`;
}

function renderObjectType(def) {
  const fields = Array.isArray(def.fields) ? def.fields : [];
  if (fields.length === 0) return `export type ${def.name.value} = {||};`;
  return [`export type ${def.name.value} = {|`, ...fields.map(renderField), "|};"].join("\n");
}

function renderEnum(def) {
  const values = (def.values || []).map((value) => `  | ${JSON.stringify(value.name.value)}`);
  return [`export type ${def.name.value} =`, ...(values.length ? values : ["  | empty"]), ";"].join("\n");
}

function renderUnion(def) {
  const types = (def.types || []).map((type) => type.name.value);
  return `export type ${def.name.value} = ${types.length ? types.join(" | ") : "empty"};`;
}

function renderScalar(def) {
  const mapped = BUILTIN_SCALARS[def.name.value];
  if (mapped) return `// Built-in scalar ${def.name.value} maps to ${mapped}.`;
  return `export type ${def.name.value} = any;`;
}

function renderDefinition(def) {
  switch (def.kind) {
    case "ObjectTypeDefinition":
    case "InputObjectTypeDefinition":
    case "InterfaceTypeDefinition":
      return renderObjectType(def);
    case "EnumTypeDefinition":
      return renderEnum(def);
    case "UnionTypeDefinition":
      return renderUnion(def);
    case "ScalarTypeDefinition":
      return renderScalar(def);
    default:
      return "";
  }
}

/** @type {import("../types.js").Transformer} */
export function transform(input) {
  if (isBlank(input)) return err("Paste a GraphQL schema to convert.");
  try {
    const doc = parse(input);
    const output = doc.definitions.map(renderDefinition).filter(Boolean).join("\n\n");
    if (!output.trim()) return err("No Flow types were generated — provide GraphQL schema definitions.");
    return ok(`${output.trim()}\n`);
  } catch (e) {
    return err(`Invalid GraphQL: ${e.message}`);
  }
}

export default transform;
