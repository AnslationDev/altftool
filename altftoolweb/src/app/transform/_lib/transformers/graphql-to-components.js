import * as typescriptPlugin from "@graphql-codegen/typescript";
import * as operationsPlugin from "@graphql-codegen/typescript-operations";
import * as apolloPlugin from "@graphql-codegen/typescript-react-apollo";
import { runCodegen } from "./_graphql.js";

export const sample = `type Query {
  user(id: ID!): User
}

type User {
  id: ID!
  name: String!
  email: String
}

query GetUser($id: ID!) {
  user(id: $id) {
    id
    name
    email
  }
}`;

/** @type {import("../types.js").Transformer} */
export function transform(input) {
  return runCodegen(input, {
    plugins: [{ typescript: {} }, { typescriptOperations: {} }, { typescriptReactApollo: { withHooks: true } }],
    pluginMap: {
      typescript: typescriptPlugin,
      typescriptOperations: operationsPlugin,
      typescriptReactApollo: apolloPlugin,
    },
    config: {},
  });
}

export default transform;
