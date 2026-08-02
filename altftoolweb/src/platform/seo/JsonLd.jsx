const SCHEMA_CONTEXT = "https://schema.org";

// Callers hand this component an array of independent nodes, and every builder
// in generateMetadata.js stamps its own `"@context":"https://schema.org",` —
// 32 bytes per node. A tool page carries five nodes in one script, and the RSC
// flight payload serialises the whole script a second time (with each quote
// escaped again), so every repeat is paid roughly twice per document.
//
// A single @graph declares the context once. It is also the more accurate
// statement: these nodes describe ONE page and already reference each other by
// @id (SoftwareApplication → publisher → Organization), which a top-level array
// leaves as N unrelated documents that happen to share a script tag.
//
// Bail out untouched on anything unexpected — a node that is not a plain object,
// or one carrying a different/expanded @context — so this can never reshape
// markup it does not fully understand.
function toSchemaGraph(nodes) {
  const canGraph =
    nodes.length > 1 &&
    nodes.every(
      (node) =>
        node &&
        typeof node === "object" &&
        !Array.isArray(node) &&
        (node["@context"] === undefined || node["@context"] === SCHEMA_CONTEXT),
    );

  if (!canGraph) return nodes;

  return {
    "@context": SCHEMA_CONTEXT,
    "@graph": nodes.map(({ "@context": _context, ...node }) => node),
  };
}

export default function JsonLd({ data, id }) {
  const payload = Array.isArray(data) ? data.filter(Boolean) : data;

  if (!payload || (Array.isArray(payload) && payload.length === 0)) return null;

  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(
          Array.isArray(payload) ? toSchemaGraph(payload) : payload,
        ).replace(/</g, "\\u003c"),
      }}
    />
  );
}
