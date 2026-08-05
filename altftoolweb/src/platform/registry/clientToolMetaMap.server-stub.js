// Server-compilation stand-in for clientToolMetaMap.js. Client interactions
// never execute during SSR, so emitting a second 1.1 MB server copy of the
// catalogue only wastes deployment space. The client compilation keeps the
// real wrapper and therefore preserves every search/assistant result.
export const toolMetaMap = {};

export default toolMetaMap;
