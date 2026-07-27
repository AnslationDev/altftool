import { parse } from "graphql";
import { ok, err, isBlank } from "../types.js";

export const sample = `type Query {
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

/** @type {import("../types.js").Transformer} */
export function transform(input) {
  if (isBlank(input)) return err("Paste GraphQL SDL to convert.");
  try {
    const ast = parse(input, { noLocation: true });
    return ok(JSON.stringify(ast, null, 2));
  } catch (e) {
    return err(`Invalid GraphQL: ${e.message}`);
  }
}

export default transform;
