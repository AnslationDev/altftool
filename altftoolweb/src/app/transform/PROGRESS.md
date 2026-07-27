# Transform Section — Build Progress

**Status:** 64/64 done · 0 blocked · 0 remaining
**Last batch completed:** batch 13
**Resume at:** completed

> Note: this repo is JavaScript (not TypeScript), so the section is built in
> `.jsx`/`.js` with JSDoc typedefs, per Phase 0.1 ("match the project's existing
> conventions"). "Typecheck" is enforced by a Node harness that imports every
> transformer and runs it against its sample (`_lib/__verify.mjs`), plus the
> production `next build`.

## Setup
- [x] 0.1 repo conventions reviewed (Next 16 App Router, JS/JSX, Tailwind v4, `@/*`→`src/*`)
- [x] 0.2 folder skeleton
- [x] 0.3 manifest in place (`_data/transform.manifest.json`, 64 tools, counts verified)
- [x] 0.4 types.js (TransformResult + ok/err helpers)
- [x] 0.5 TransformShell + EditorPane (one shared editor, debounced live convert)
- [x] 0.6 [slug]/page.jsx + generateStaticParams + generateMetadata
- [x] 0.7 index page (grouped by category, counts from manifest)
- [x] 0.8 api/[slug]/route.js (server dispatcher)
- [x] 0.9 PROGRESS.md
- [x] 0.10 harness green + dev server renders /transform (64 cards) and a tool route

## Tools (tick only after Step D passes)

### SVG (2)
- [x] svg-to-jsx
- [x] svg-to-react-native

### HTML (2)
- [x] html-to-jsx
- [x] html-to-pug

### JSON (21)
- [x] json-to-big-query
- [x] json-to-flow
- [x] json-to-go-bson
- [x] json-to-go
- [x] json-to-graphql
- [x] json-to-io-ts
- [x] json-to-java
- [x] json-to-jsdoc
- [x] json-to-json-schema
- [x] json-to-kotlin
- [x] json-to-mobx-state-tree
- [x] json-to-mongoose
- [x] json-to-mysql
- [x] json-to-proptypes
- [x] json-to-rust-serde
- [x] json-to-sarcastic
- [x] json-to-scala-case-class
- [x] json-to-toml
- [x] json-to-typescript
- [x] json-to-yaml
- [x] json-to-zod

### JSON Schema (4)
- [x] json-schema-to-openapi-schema
- [x] json-schema-to-protobuf
- [x] json-schema-to-typescript
- [x] json-schema-to-zod

### CSS (3)
- [x] css-to-js
- [x] css-to-tailwind
- [x] object-styles-to-template-literal

### JavaScript (2)
- [x] js-object-to-json
- [x] js-object-to-typescript

### GraphQL (9)
- [x] graphql-to-components
- [x] graphql-to-flow
- [x] graphql-to-fragment-matcher
- [x] graphql-to-introspection-json
- [x] graphql-to-java
- [x] graphql-to-resolvers-signature
- [x] graphql-to-schema-ast
- [x] graphql-to-typescript
- [x] graphql-to-typescript-mongodb

### JSON-LD (6)
- [x] jsonld-to-compacted
- [x] jsonld-to-expanded
- [x] jsonld-to-flattened
- [x] jsonld-to-framed
- [x] jsonld-to-nquads
- [x] jsonld-to-normalized

### TypeScript (5)
- [x] typescript-to-flow
- [x] typescript-to-json-schema
- [x] typescript-to-javascript
- [x] typescript-to-typescript-declaration
- [x] typescript-to-zod

### Flow (3)
- [x] flow-to-javascript
- [x] flow-to-typescript
- [x] flow-to-typescript-declaration

### Others (7)
- [x] cadence-to-go
- [x] markdown-to-html
- [x] toml-to-json
- [x] toml-to-yaml
- [x] xml-to-json
- [x] yaml-to-json
- [x] yaml-to-toml

## Library substitutions
| slug | planned | used instead | reason |
|---|---|---|---|
| flow-to-javascript | @babel/preset-flow (latest) | @babel/preset-flow@^7 | v8 requires @babel/core@8; repo pins @babel/core@7 |
| flow-to-typescript, flow-to-typescript-declaration | @khanacademy/flow-to-ts (main entry) | import dist/convert.bundle.js directly | published "main" points at a missing dist/convert.js |
| cadence-to-go | (n/a lib) | custom heuristic converter | no maintained Cadence→Go library exists |

## Blocked
| slug | reason |
|---|---|
