// Server-compilation stand-in for src/platform/registry/toolRuntimeMap.js.
//
// The real map holds ~1,450 `() => import("@/tools/<slug>/entry")` thunks. Its
// only consumer is src/app/tools/toolLoaderResolver.js, and every caller of
// that module is a "use client" component that reaches it either behind a
// `next/dynamic(..., { ssr: false })` boundary (ToolClient.jsx,
// EmbedToolClient.jsx) or from a mouseenter handler (ToolsClient.jsx). None of
// those code paths can run during SSR/RSC, so webpack's server compilation was
// emitting ~1,300 unreachable async chunks (~36 MiB of .next/server/chunks)
// purely to satisfy an edge that is never traversed.
//
// Swapping the map for this empty object on the server severs that edge. The
// client compilation keeps the real module, so tools still load in the
// browser. scripts/assert-no-server-tool-loader.mjs fails the build if a
// server component or route handler ever starts importing the resolver, which
// is the one change that would make this substitution incorrect.
export const toolRuntimeMap = {};

export default toolRuntimeMap;
