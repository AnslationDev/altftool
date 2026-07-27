import { parse } from "graphql";
import { codegen } from "@graphql-codegen/core";
import { ok, err, isBlank } from "../types.js";

/**
 * Shared @graphql-codegen adapter. Server-only (codegen is Node-only).
 * A single input string may contain both schema type definitions and
 * operations/fragments; this splits them so any plugin combination works.
 */

/** A shared schema sample reused by the schema-based GraphQL tools. */
export const SCHEMA_SAMPLE = `type Query {
  user(id: ID!): User
  posts: [Post!]!
}

type User {
  id: ID!
  name: String!
  email: String
  posts: [Post!]!
}

type Post {
  id: ID!
  title: String!
  author: User!
}

interface Node {
  id: ID!
}`;

const OP_KINDS = new Set(["OperationDefinition", "FragmentDefinition"]);

function splitDocument(sdl) {
  const doc = parse(sdl);
  const schemaDefs = doc.definitions.filter((d) => !OP_KINDS.has(d.kind));
  const opDefs = doc.definitions.filter((d) => OP_KINDS.has(d.kind));
  return {
    schemaAst: { kind: "Document", definitions: schemaDefs },
    opsAst: { kind: "Document", definitions: opDefs },
    hasSchema: schemaDefs.length > 0,
    hasOps: opDefs.length > 0,
  };
}

/**
 * @param {string} sdl
 * @param {{ plugins: any[], pluginMap: Record<string, any>, config?: object }} cfg
 * @returns {Promise<import("../types.js").TransformResult>}
 */
export async function runCodegen(sdl, { plugins, pluginMap, config = {} }) {
  if (isBlank(sdl)) return err("Paste a GraphQL schema to convert.");
  let split;
  try {
    split = splitDocument(sdl);
  } catch (e) {
    return err(`Invalid GraphQL: ${e.message}`);
  }
  if (!split.hasSchema) split.schemaAst = parse("type Query { _empty: String }");
  try {
    const output = await codegen({
      filename: "generated.ts",
      schema: split.schemaAst,
      documents: split.hasOps ? [{ location: "operations.graphql", document: split.opsAst }] : [],
      config,
      plugins,
      pluginMap,
    });
    if (!output || !output.trim()) return err("Code generation produced no output.");
    return ok(output.trim() + "\n");
  } catch (e) {
    return err(e);
  }
}
