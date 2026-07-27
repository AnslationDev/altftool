/**
 * Server-side transformer barrel.
 *
 * `serverLoaders` maps every tool slug to a lazy dynamic import of its
 * transformer module. Lazy loaders keep heavy, Node-only libraries
 * (quicktype-core, @graphql-codegen, jsonld, the TypeScript compiler, svgr,
 * babel) out of every request except the one that needs them.
 *
 * This file is imported ONLY on the server (the API dispatcher and the Node
 * test harness). It must never be imported by a client component — several of
 * the modules it references pull in Node-only packages. Browser tools have a
 * separate, client-safe map in ../registry.client.js.
 *
 * Each transformer module exports:
 *   - `transform(input, options)` → TransformResult (default export or named)
 *   - `sample`  → a realistic string input for the "Load sample" button
 *   - `options` → optional ToolOption[] describing UI controls
 *
 * One line is added here per tool as it is implemented in Phase 1.
 */

/** @type {Record<string, () => Promise<any>>} */
export const serverLoaders = {
  // --- Phase 1 tools are registered below, in manifest order ---
  // Batch 1
  "svg-to-jsx": () => import("./svg-to-jsx.js"),
  "svg-to-react-native": () => import("./svg-to-react-native.js"),
  "html-to-jsx": () => import("./html-to-jsx.js"),
  "html-to-pug": () => import("./html-to-pug.js"),
  "json-to-big-query": () => import("./json-to-big-query.js"),
  // Batch 2
  "json-to-flow": () => import("./json-to-flow.js"),
  "json-to-go-bson": () => import("./json-to-go-bson.js"),
  "json-to-go": () => import("./json-to-go.js"),
  "json-to-graphql": () => import("./json-to-graphql.js"),
  "json-to-io-ts": () => import("./json-to-io-ts.js"),
  // Batch 3
  "json-to-java": () => import("./json-to-java.js"),
  "json-to-jsdoc": () => import("./json-to-jsdoc.js"),
  "json-to-json-schema": () => import("./json-to-json-schema.js"),
  "json-to-kotlin": () => import("./json-to-kotlin.js"),
  "json-to-mobx-state-tree": () => import("./json-to-mobx-state-tree.js"),
  // Batch 4
  "json-to-mongoose": () => import("./json-to-mongoose.js"),
  "json-to-mysql": () => import("./json-to-mysql.js"),
  "json-to-proptypes": () => import("./json-to-proptypes.js"),
  "json-to-rust-serde": () => import("./json-to-rust-serde.js"),
  "json-to-sarcastic": () => import("./json-to-sarcastic.js"),
  // Batch 5
  "json-to-scala-case-class": () => import("./json-to-scala-case-class.js"),
  "json-to-toml": () => import("./json-to-toml.js"),
  "json-to-typescript": () => import("./json-to-typescript.js"),
  "json-to-yaml": () => import("./json-to-yaml.js"),
  "json-to-zod": () => import("./json-to-zod.js"),
  // Batch 6
  "json-schema-to-openapi-schema": () => import("./json-schema-to-openapi-schema.js"),
  "json-schema-to-protobuf": () => import("./json-schema-to-protobuf.js"),
  "json-schema-to-typescript": () => import("./json-schema-to-typescript.js"),
  "json-schema-to-zod": () => import("./json-schema-to-zod.js"),
  "css-to-js": () => import("./css-to-js.js"),
  // Batch 7
  "css-to-tailwind": () => import("./css-to-tailwind.js"),
  "object-styles-to-template-literal": () => import("./object-styles-to-template-literal.js"),
  "js-object-to-json": () => import("./js-object-to-json.js"),
  "js-object-to-typescript": () => import("./js-object-to-typescript.js"),
  "graphql-to-components": () => import("./graphql-to-components.js"),
  // Batch 8
  "graphql-to-flow": () => import("./graphql-to-flow.js"),
  "graphql-to-fragment-matcher": () => import("./graphql-to-fragment-matcher.js"),
  "graphql-to-introspection-json": () => import("./graphql-to-introspection-json.js"),
  "graphql-to-java": () => import("./graphql-to-java.js"),
  "graphql-to-resolvers-signature": () => import("./graphql-to-resolvers-signature.js"),
  // Batch 9
  "graphql-to-schema-ast": () => import("./graphql-to-schema-ast.js"),
  "graphql-to-typescript": () => import("./graphql-to-typescript.js"),
  "graphql-to-typescript-mongodb": () => import("./graphql-to-typescript-mongodb.js"),
  "jsonld-to-compacted": () => import("./jsonld-to-compacted.js"),
  "jsonld-to-expanded": () => import("./jsonld-to-expanded.js"),
  // Batch 10
  "jsonld-to-flattened": () => import("./jsonld-to-flattened.js"),
  "jsonld-to-framed": () => import("./jsonld-to-framed.js"),
  "jsonld-to-nquads": () => import("./jsonld-to-nquads.js"),
  "jsonld-to-normalized": () => import("./jsonld-to-normalized.js"),
  "typescript-to-flow": () => import("./typescript-to-flow.js"),
  // Batch 11
  "typescript-to-json-schema": () => import("./typescript-to-json-schema.js"),
  "typescript-to-javascript": () => import("./typescript-to-javascript.js"),
  "typescript-to-typescript-declaration": () => import("./typescript-to-typescript-declaration.js"),
  "typescript-to-zod": () => import("./typescript-to-zod.js"),
  "flow-to-javascript": () => import("./flow-to-javascript.js"),
  // Batch 12
  "flow-to-typescript": () => import("./flow-to-typescript.js"),
  "flow-to-typescript-declaration": () => import("./flow-to-typescript-declaration.js"),
  "cadence-to-go": () => import("./cadence-to-go.js"),
  "markdown-to-html": () => import("./markdown-to-html.js"),
  "toml-to-json": () => import("./toml-to-json.js"),
  "toml-to-yaml": () => import("./toml-to-yaml.js"),
  "xml-to-json": () => import("./xml-to-json.js"),
  "yaml-to-json": () => import("./yaml-to-json.js"),
  "yaml-to-toml": () => import("./yaml-to-toml.js"),
};

/**
 * @param {string} slug
 * @returns {boolean}
 */
export function hasServerLoader(slug) {
  return Object.prototype.hasOwnProperty.call(serverLoaders, slug);
}
