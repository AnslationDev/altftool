import { buildSchema, introspectionFromSchema } from "graphql";
import { ok, err, isBlank } from "../types.js";

export const sample = `type Query {
  user(id: ID!): User
  posts: [Post!]!
}

type User {
  id: ID!
  name: String!
  email: String
}

type Post {
  id: ID!
  title: String!
  author: User!
}`;

/** @type {import("../types.js").Transformer} */
export function transform(input) {
  if (isBlank(input)) return err("Paste a GraphQL schema (SDL) to convert.");
  let schema;
  try {
    schema = buildSchema(input);
  } catch (e) {
    return err(`Invalid GraphQL schema: ${e.message}`);
  }
  try {
    const introspection = introspectionFromSchema(schema);
    return ok(JSON.stringify(introspection, null, 2));
  } catch (e) {
    return err(e);
  }
}

export default transform;
