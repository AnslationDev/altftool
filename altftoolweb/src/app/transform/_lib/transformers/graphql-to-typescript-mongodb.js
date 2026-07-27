import * as typescriptPlugin from "@graphql-codegen/typescript";
import * as mongodbPlugin from "@graphql-codegen/typescript-mongodb";
import { runCodegen } from "./_graphql.js";

// The mongodb plugin keys off @entity / @id / @column / @embedded directives.
export const sample = `type User @entity {
  id: ID! @id
  username: String! @column
  email: String @column
  profile: Profile! @embedded
}

type Profile @entity(embedded: true) {
  bio: String @column
  age: Int @column
}`;

/** @type {import("../types.js").Transformer} */
export function transform(input) {
  return runCodegen(input, {
    plugins: [{ typescript: {} }, { typescriptMongodb: {} }],
    pluginMap: { typescript: typescriptPlugin, typescriptMongodb: mongodbPlugin },
    config: {},
  });
}

export default transform;
