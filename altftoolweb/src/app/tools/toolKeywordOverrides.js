// Demand-mined keyword variants per tool slug, layered ahead of the derived
// phrases in buildToolKeywords. Every phrase here is a real query observed in
// Google's autocomplete for the tool's own head term, and is added only after
// checking the tool's source actually supports what the query asks for — a
// query like "image compressor to 20kb" only belongs on a tool that can
// target an output size. The invariants of toolKeywords.js apply unchanged:
// no privacy claims, no capability the tool does not ship.
//
// Generated with verification; edit by hand only with the same source check.
const toolKeywordOverrides = {};

export default toolKeywordOverrides;
