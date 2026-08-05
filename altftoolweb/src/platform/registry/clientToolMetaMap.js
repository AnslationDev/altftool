// Client-only access point for the full generated catalogue.
//
// Client components load this module on demand for directory search, global
// search and the home assistant. The server build aliases this wrapper to an
// empty stub because those interactions cannot run during SSR; the real map
// remains available to server pages through toolMetaMap.js itself.
export { toolMetaMap } from "./toolMetaMap";
