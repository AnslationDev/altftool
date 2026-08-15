const seo = {
  title: "JSON Relationship Mapper: Paths and Inferred",
  steps: [
    "Paste a document into the JSON input box, or press Load sample for the built-in project, teams and tasks payload.",
    "The mapper walks the parsed tree, addressing every node as $.teams[1].id and indexing each field named id by its value.",
    "Read the Paths, ID-like fields and Links counters, the Inferred relationships list of from-path to to-path, and the Structure paths table.",
  ],
  intro:
    "The JSON Relationship Mapper walks a document, lists every node as a `$.path[0].like.this` address with its type, and then infers the foreign keys: any scalar field whose name ends in `id` is collected, and a field such as `projectId` or `ownerId` is linked to the `id` field that holds the same value. You get three counts — total paths, ID-like fields and resolved links — plus the from-path and to-path for each link, which is what turns a flat export into a picture of how its records reference each other. The whole walk runs in your browser on the JSON you paste.",
  useCases: [
    "You inherited an undocumented API response and need to work out which array of records points at which, before writing code that joins them",
    "A seed or fixture file has an `ownerId` that no longer matches any record, and you want to see which references actually resolve and which do not",
    "You are writing a schema or a TypeScript type from a sample payload and need the exact path of every field, including ones buried inside arrays of objects",
  ],
  benefits: [
    ["Every node gets an addressable path", "Objects, arrays and scalars are all listed with a JSONPath-style address, so you can quote the exact location of a field rather than describe it."],
    ["Foreign keys are matched by value", "A `*Id` field only counts as a link when its value equals an actual `id` in the document, so the connections shown are real, not guessed from naming alone."],
    ["Broken references are visible by subtraction", "The ID-like field count against the resolved link count tells you at a glance how many references point at nothing."],
  ],
  faqs: [
    [
      "How does it decide two records are related?",
      "By exact value match on ID-like names. It indexes every field named exactly `id` by its value, then links any other field whose name ends in `id` — `projectId`, `owner_id`, `parentID` — when its value appears in that index. Matching is case-insensitive on the field name and exact on the value.",
    ],
    [
      "Why is one of my references not showing as a link?",
      "Either the target `id` does not exist in the same document, or the two values are not identical — `\"p-100\"` and `\"P-100\"`, or a numeric `100` against a string `\"100\"`, will not match. Foreign keys named without an `id` suffix, such as `owner` or `parent`, are not considered at all.",
    ],
    [
      "What path syntax does it use?",
      "JSONPath-style: `$` for the root, a dot for object keys and square brackets for array indexes, so the second team's id in a nested payload reads `$.teams[1].id`. Container rows show a child count rather than a value.",
    ],
    [
      "Does it draw a graph or export the relationships?",
      "It presents the analysis as tables — the path list, the ID-like fields and the resolved from/to links — rather than a rendered node diagram. That keeps large documents readable and makes the output easy to copy into an issue or a design note.",
    ],
  ],
};

export default seo;
