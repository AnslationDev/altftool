#!/usr/bin/env node
/**
 * Re-encodes Next's per-route RSC client-reference manifests compactly.
 *
 * Next writes one `page_client-reference-manifest.js` per app route. Across
 * this large app they total tens of MiB, and the content is almost entirely
 * repetition: each route's manifest lists hundreds of client modules belonging
 * to otherwise unrelated pages, every value has the shape
 * {id, name, chunks, async}, there are only 6 distinct chunk arrays among the
 * 429 entries, and ssrModuleMapping and rscModuleMapping take just 2 distinct
 * values across all 390 files.
 *
 * The obvious fix — write the shared data once and reference it — is not
 * available. Next reads these files with readFileSync and evaluates them via
 * runInNewContext with a context holding only process.env.NEXT_DEPLOYMENT_ID
 * (see next/dist/esm/server/load-manifest.external.js), so a manifest has no
 * require, no module and no filesystem. Each file must stand alone.
 *
 * It does not have to be verbose to stand alone. Each file keeps its own copy
 * of everything, expressed as tables plus a tiny expander, and evaluates to an
 * object identical to the one Next wrote. Identity is not assumed: every file
 * is evaluated before and after and compared, values and key order both, and a
 * single mismatch aborts the build with the file left untouched.
 *
 * Runs after `next build` and before the artifact gate.
 */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const nextDir = path.resolve(".next");

// Both copies. `next build` writes .next/standalone containing its own
// .next/server/app, and that copy — not this one — is what Amplify packages:
// across jobs 105 and 110 the byte count AWS reported was 0.933 and 0.931
// times the size of .next/standalone, stable to a third of a percent, while
// the walk this repo's gate performs moved in the opposite direction.
// Compacting only .next/server/app therefore shrank a directory AWS never
// weighs.
const appDirs = [
  path.join(nextDir, "server", "app"),
  path.join(nextDir, "standalone", ".next", "server", "app"),
].filter((dir) => fs.existsSync(dir));

if (appDirs.length === 0) {
  console.log("RSC manifest compaction: no .next/server/app, skipping.");
  process.exit(0);
}

const files = [];
for (const appDir of appDirs) {
  (function walk(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(entryPath);
      else if (entry.name.endsWith("_client-reference-manifest.js")) {
        files.push(entryPath);
      }
    }
  })(appDir);
}

if (files.length === 0) {
  console.log("RSC manifest compaction: no manifests found, skipping.");
  process.exit(0);
}

/** Evaluates a manifest exactly as Next's server does. */
function evaluate(source) {
  const context = { process: { env: {} } };
  context.globalThis = context;
  vm.createContext(context);
  vm.runInContext(source, context);
  const store = context.globalThis.__RSC_MANIFEST;
  const route = Object.keys(store)[0];
  return { route, manifest: store[route] };
}

/**
 * Deep equality that also requires the same key order — Next iterates these
 * objects, so "same entries, different order" is not something to wave through.
 */
function identical(a, b, at = "") {
  if (a === b) return null;
  if (typeof a !== typeof b) return `${at}: type ${typeof a} vs ${typeof b}`;
  if (a === null || b === null || typeof a !== "object") {
    return `${at}: ${JSON.stringify(a)} vs ${JSON.stringify(b)}`;
  }
  if (Array.isArray(a) !== Array.isArray(b)) return `${at}: array vs object`;
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  if (ka.length !== kb.length) {
    return `${at}: ${ka.length} keys vs ${kb.length}`;
  }
  for (let i = 0; i < ka.length; i += 1) {
    if (ka[i] !== kb[i]) return `${at}: key ${i} is ${ka[i]} vs ${kb[i]}`;
    const nested = identical(a[ka[i]], b[kb[i]], `${at}.${ka[i]}`);
    if (nested) return nested;
  }
  return null;
}

/**
 * Interns repeated values into tables and emits `{id,name,chunks,async}`
 * records as indices into them. Names, chunk arrays and path prefixes all
 * repeat heavily; ids do not, so they stay inline.
 */
function encodeGeneral(manifest, route) {
  const names = [];
  const nameIndex = new Map();
  const chunkGroups = [];
  const chunkIndex = new Map();

  const intern = (list, index, value) => {
    const key = typeof value === "string" ? `s${value}` : JSON.stringify(value);
    if (!index.has(key)) {
      index.set(key, list.length);
      list.push(value);
    }
    return index.get(key);
  };

  // A client-module record: id kept verbatim (it is a number in clientModules
  // and a string in the ssr/rsc mappings, and that difference must survive).
  // Names and chunk arrays take only a handful of distinct values, so most
  // records are [id,0,0,0]; trailing zeros are dropped and restored on read.
  const record = (value) => {
    const fields = [
      value.id,
      intern(names, nameIndex, value.name),
      intern(chunkGroups, chunkIndex, value.chunks),
      value.async ? 1 : 0,
    ];
    while (fields.length > 1 && fields[fields.length - 1] === 0) fields.pop();
    return fields;
  };

  // clientModules is keyed by absolute module path, so each file repeats the
  // build root hundreds of times and directories like node_modules/next/dist/esm/
  // client/components dozens more. Interning the directory and keeping only
  // the basename per row is where most of the remaining bytes are.
  const directories = [];
  const directoryIndex = new Map();
  const clientModules = Object.entries(manifest.clientModules || {}).map(
    ([key, value]) => {
      const cut = key.lastIndexOf("/");
      const directory = cut === -1 ? "" : key.slice(0, cut + 1);
      const basename = cut === -1 ? key : key.slice(cut + 1);
      return [
        intern(directories, directoryIndex, directory),
        basename,
        ...record(value),
      ];
    },
  );

  // Every emitted client-module path is rooted in this checkout. Keep that
  // root once per manifest instead of once per distinct directory. This is a
  // real hosted-artifact reduction too: Amplify's own checkout prefix is
  // otherwise repeated hundreds of times in every route manifest.
  const candidateDirectoryPrefix = `${process.cwd().replaceAll("\\", "/")}/`;
  const directoryPrefix = directories.every((directory) =>
    directory.startsWith(candidateDirectoryPrefix),
  )
    ? candidateDirectoryPrefix
    : "";
  const encodedDirectories = directories.map((directory) =>
    directory.slice(directoryPrefix.length),
  );
  const directoryGroupPrefixes = [
    "",
    "node_modules/next/dist/esm/client/components/",
    "node_modules/next/dist/client/components/",
    "node_modules/next/dist/esm/",
    "node_modules/next/dist/",
    "node_modules/",
    "src/app/",
    "src/components/",
    "src/",
    "packages/",
  ].filter(
    (prefix, index) =>
      index === 0 || encodedDirectories.some((directory) => directory.startsWith(prefix)),
  );
  const encodedDirectoryRows = encodedDirectories.map((directory) => {
    let prefixIndex = 0;
    for (let index = 1; index < directoryGroupPrefixes.length; index += 1) {
      if (
        directory.startsWith(directoryGroupPrefixes[index]) &&
        directoryGroupPrefixes[index].length >
          directoryGroupPrefixes[prefixIndex].length
      ) {
        prefixIndex = index;
      }
    }
    return [
      prefixIndex,
      directory.slice(directoryGroupPrefixes[prefixIndex].length),
    ];
  });

  const mapping = (source) =>
    Object.entries(source || {}).map(([moduleId, byExport]) => {
      const exports = Object.entries(byExport);

      // Next's webpack mappings overwhelmingly contain one `*` export whose
      // record has the default name/chunks/async values. Encoding that common
      // shape as [moduleId,id] removes the repeated [["*",...]] wrapper from
      // hundreds of records in every route while the general representation
      // remains available for every other shape.
      if (exports.length === 1 && exports[0][0] === "*") {
        const compactRecord = record(exports[0][1]);
        if (compactRecord.length === 1) return [moduleId, compactRecord[0]];
      }

      return [
        moduleId,
        exports.map(([exportName, value]) => [exportName, ...record(value)]),
      ];
    });

  const ssr = mapping(manifest.ssrModuleMapping);
  const rsc = mapping(manifest.rscModuleMapping);
  const edgeSsr = mapping(manifest.edgeSSRModuleMapping);
  const edgeRsc = mapping(manifest.edgeRscModuleMapping);

  const j = JSON.stringify;
  return `globalThis.__RSC_MANIFEST=(globalThis.__RSC_MANIFEST||{});(function(){
var N=${j(names)},C=${j(chunkGroups)},P=${j(directoryPrefix)},Q=${j(directoryGroupPrefixes)},D=${j(encodedDirectoryRows)};
function r(v){return {id:v[0],name:N[v[1]||0],chunks:C[v[2]||0],async:!!v[3]}}
function o(rows){var t={};for(var i=0;i<rows.length;i++){var d=D[rows[i][0]];t[P+Q[d[0]]+d[1]+rows[i][1]]=r(rows[i].slice(2))}return t}
function m(rows){var t={};for(var i=0;i<rows.length;i++){var e={},x=rows[i][1];
if(typeof x!=="object"){e["*"]=r([x])}else for(var k=0;k<x.length;k++){e[x[k][0]]=r(x[k].slice(1))}t[rows[i][0]]=e}return t}
globalThis.__RSC_MANIFEST[${j(route)}]={moduleLoading:${j(manifest.moduleLoading)},ssrModuleMapping:m(${j(ssr)}),edgeSSRModuleMapping:m(${j(edgeSsr)}),clientModules:o(${j(clientModules)}),entryCSSFiles:${j(manifest.entryCSSFiles)},rscModuleMapping:m(${j(rsc)}),edgeRscModuleMapping:m(${j(edgeRsc)})};
})();
`;
}

/**
 * Next's webpack manifests currently have a much narrower shape than the
 * general encoder has to support:
 *
 * - every client record is `{ id: number, name: "*", chunks, async: false }`;
 * - every SSR/RSC record is the sole `*` export with empty chunks;
 * - SSR module ids are a subset of the RSC module ids; and
 * - edge SSR is empty, while edge RSC (when present) has the same narrow
 *   record shape and is a subset of the normal RSC map.
 *
 * Encoding that shape directly removes the remaining repeated object wrappers
 * and stores each shared SSR/RSC module id only once. Client paths use a
 * component trie plus a basename table, and fixed-width records are emitted as
 * flat arrays. The caller still evaluates and deep-compares the result, so a
 * Next change can never silently alter a deployed manifest. If any invariant
 * is absent, return null and use the fully general encoder above.
 */
function encodeCommonWebpackShape(manifest, route) {
  const clientEntries = Object.entries(manifest.clientModules || {});
  const ssr = manifest.ssrModuleMapping || {};
  const rsc = manifest.rscModuleMapping || {};
  const edgeRsc = manifest.edgeRscModuleMapping || {};

  const hasCommonClientShape = clientEntries.every(
    ([, value]) =>
      typeof value.id === "number" &&
      value.name === "*" &&
      Array.isArray(value.chunks) &&
      value.async === false,
  );

  const isCanonicalNumericId = (value) =>
    typeof value === "string" &&
    /^(0|[1-9][0-9]*)$/u.test(value) &&
    Number.isSafeInteger(Number(value));

  const hasCommonMappingShape = (source) =>
    Object.entries(source).every(([moduleId, byExport]) => {
      const exports = Object.entries(byExport);
      if (
        !isCanonicalNumericId(moduleId) ||
        exports.length !== 1 ||
        exports[0][0] !== "*"
      ) {
        return false;
      }

      const value = exports[0][1];
      return (
        isCanonicalNumericId(value.id) &&
        value.name === "*" &&
        Array.isArray(value.chunks) &&
        value.chunks.length === 0 &&
        value.async === false
      );
    });

  if (
    !hasCommonClientShape ||
    !hasCommonMappingShape(ssr) ||
    !hasCommonMappingShape(rsc) ||
    !hasCommonMappingShape(edgeRsc) ||
    Object.keys(ssr).some((moduleId) => !(moduleId in rsc)) ||
    Object.keys(edgeRsc).some((moduleId) => !(moduleId in rsc)) ||
    Object.keys(manifest.edgeSSRModuleMapping || {}).length > 0
  ) {
    return null;
  }

  const checkoutPrefix = `${process.cwd().replaceAll("\\", "/")}/`;
  let pathPrefix = checkoutPrefix;

  // A workspace build can resolve hoisted dependencies from the monorepo root
  // while resolving application modules from this package. In that case cwd
  // is not a prefix of every module, so derive the shared directory prefix
  // across all client paths. This also keeps the encoder testable against a
  // copied build artifact.
  if (!clientEntries.every(([key]) => key.startsWith(pathPrefix))) {
    const keys = clientEntries.map(([key]) => key);
    let commonLength = keys[0]?.length || 0;
    for (let index = 1; index < keys.length && commonLength > 0; index += 1) {
      let cursor = 0;
      while (
        cursor < commonLength &&
        cursor < keys[index].length &&
        keys[0][cursor] === keys[index][cursor]
      ) {
        cursor += 1;
      }
      commonLength = cursor;
    }
    const commonPrefix = (keys[0] || "").slice(0, commonLength);
    const lastDirectorySeparator = commonPrefix.lastIndexOf("/");
    pathPrefix =
      lastDirectorySeparator === -1
        ? ""
        : commonPrefix.slice(0, lastDirectorySeparator + 1);
  }

  if (
    pathPrefix.length === 0 ||
    !clientEntries.every(([key]) => key.startsWith(pathPrefix))
  ) {
    return null;
  }

  // C[0] must be the empty chunk list used by SSR/RSC mapping records.
  const chunkGroups = [[]];
  const chunkIndex = new Map([["[]", 0]]);
  const basenames = [];
  const basenameIndex = new Map();
  const segments = [];
  const segmentIndex = new Map();
  const directoryNodeIndex = new Map([["", 0]]);
  const directoryNodes = [];
  const clientRows = [];

  const intern = (list, index, value) => {
    const key = typeof value === "string" ? `s${value}` : JSON.stringify(value);
    if (!index.has(key)) {
      index.set(key, list.length);
      list.push(value);
    }
    return index.get(key);
  };

  for (const [key, value] of clientEntries) {
    const relativeKey = key.slice(pathPrefix.length);
    const cut = relativeKey.lastIndexOf("/");
    const directory = cut === -1 ? "" : relativeKey.slice(0, cut + 1);
    const basename = cut === -1 ? relativeKey : relativeKey.slice(cut + 1);
    let parentNode = 0;
    let accumulatedDirectory = "";

    for (const segment of directory.split("/").filter(Boolean)) {
      accumulatedDirectory += `${segment}/`;
      if (!directoryNodeIndex.has(accumulatedDirectory)) {
        const node = directoryNodes.length / 2 + 1;
        directoryNodeIndex.set(accumulatedDirectory, node);
        directoryNodes.push(
          parentNode,
          intern(segments, segmentIndex, segment),
        );
      }
      parentNode = directoryNodeIndex.get(accumulatedDirectory);
    }

    clientRows.push(
      parentNode,
      intern(basenames, basenameIndex, basename),
      value.id,
      intern(chunkGroups, chunkIndex, value.chunks),
    );
  }

  // RSC is the superset, so each row carries the delta from the previous
  // module id, its RSC target id, and its SSR/edge-RSC target ids (-1 when
  // absent).
  // Numeric object keys enumerate in ascending order, making the delta both
  // deterministic and materially smaller than repeating six-digit ids.
  const mappingRows = [];
  let previousModuleId = 0;
  for (const [moduleId, byExport] of Object.entries(rsc)) {
    const numericModuleId = Number(moduleId);
    mappingRows.push(
      numericModuleId - previousModuleId,
      Number(byExport["*"].id),
      ssr[moduleId] ? Number(ssr[moduleId]["*"].id) : -1,
      edgeRsc[moduleId] ? Number(edgeRsc[moduleId]["*"].id) : -1,
    );
    previousModuleId = numericModuleId;
  }

  // The three large numeric tables contain only integers >= -1. A printable
  // base-32 VLQ keeps small trie/index values to one or two bytes, six-digit
  // webpack ids to four, and the -1 sentinel to one. It is considerably
  // smaller than JSON's commas and decimal digits while remaining plain JS
  // that Next can evaluate in its deliberately sparse VM context.
  const vlqAlphabet =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_";
  const packIntegers = (values) => {
    let packed = "";
    for (const value of values) {
      if (!Number.isSafeInteger(value) || value < -1) return null;
      let remaining = value + 1;
      do {
        let digit = remaining % 32;
        remaining = Math.floor(remaining / 32);
        if (remaining > 0) digit += 32;
        packed += vlqAlphabet[digit];
      } while (remaining > 0);
    }
    return packed;
  };

  const packedDirectoryNodes = packIntegers(directoryNodes);
  const packedClientRows = packIntegers(clientRows);
  const packedMappingRows = packIntegers(mappingRows);
  if (
    packedDirectoryNodes === null ||
    packedClientRows === null ||
    packedMappingRows === null
  ) {
    return null;
  }

  // Quotes and commas cost two bytes per string in JSON arrays. These tables
  // are safe to join with a one-byte delimiter selected per manifest; the
  // fallback preserves unusual future strings that contain every candidate.
  const joinedStringTable = (values) => {
    if (values.length === 0) return "[]";
    const separator = ["|", "~", "^", "`"].find((candidate) =>
      values.every((value) => !value.includes(candidate)),
    );
    return separator
      ? `${JSON.stringify(values.join(separator))}.split(${JSON.stringify(separator)})`
      : JSON.stringify(values);
  };

  const j = JSON.stringify;
  return `globalThis.__RSC_MANIFEST=(globalThis.__RSC_MANIFEST||{});(function(){
var C=${j(chunkGroups)},P=${j(pathPrefix)},S=${joinedStringTable(segments)},B=${joinedStringTable(basenames)},K=${j(vlqAlphabet)},D=[""];
function u(s){var a=[],n=0,p=1,x;for(var i=0;i<s.length;i++){x=K.indexOf(s[i]);n+=(x&31)*p;if(x&32)p*=32;else{a.push(n-1);n=0;p=1}}return a}
var T=u(${j(packedDirectoryNodes)});
for(var i=0;i<T.length;i+=2)D.push(D[T[i]]+S[T[i+1]]+"/");
function q(i,c){return {id:i,name:"*",chunks:C[c],async:false}}
function o(v){var t={};for(var i=0;i<v.length;i+=4)t[P+D[v[i]]+B[v[i+1]]]=q(v[i+2],v[i+3]);return t}
function m(v){var a={},b={},e={},k=0;for(var i=0;i<v.length;i+=4){k+=v[i];b[k]={"*":q(String(v[i+1]),0)};if(v[i+2]>=0)a[k]={"*":q(String(v[i+2]),0)};if(v[i+3]>=0)e[k]={"*":q(String(v[i+3]),0)}}return [a,b,e]}
var X=m(u(${j(packedMappingRows)}));
globalThis.__RSC_MANIFEST[${j(route)}]={moduleLoading:${j(manifest.moduleLoading)},ssrModuleMapping:X[0],edgeSSRModuleMapping:{},clientModules:o(u(${j(packedClientRows)})),entryCSSFiles:${j(manifest.entryCSSFiles)},rscModuleMapping:X[1],edgeRscModuleMapping:X[2]};
})();
`;
}

function encode(manifest, route) {
  return (
    encodeCommonWebpackShape(manifest, route) || encodeGeneral(manifest, route)
  );
}

let before = 0;
let after = 0;
let rewritten = 0;

for (const file of files) {
  const source = fs.readFileSync(file, "utf8");

  // Next evaluates these with process.env.NEXT_DEPLOYMENT_ID in scope. No
  // manifest reads it today, but one that did would have that value frozen
  // into the re-encoded literal at build time instead of resolved at load.
  // Leave any such file exactly as Next wrote it.
  if (source.includes("process.env")) continue;

  const { route, manifest } = evaluate(source);

  // Key order is Next's own; encode() must reproduce it. If Next ever emits a
  // different set of top-level keys, the comparison below catches it.
  const compacted = encode(manifest, route);
  const check = evaluate(compacted);

  const mismatch =
    check.route !== route
      ? `route ${check.route} vs ${route}`
      : identical(manifest, check.manifest);
  if (mismatch) {
    throw new Error(
      `RSC manifest compaction changed ${path.relative(nextDir, file)} (${mismatch}). ` +
        `No file was modified; the build is stopped rather than shipping a manifest ` +
        `whose meaning may differ from Next's.`,
    );
  }

  before += Buffer.byteLength(source);
  after += Buffer.byteLength(compacted);
  if (compacted.length < source.length) {
    fs.writeFileSync(file, compacted);
    rewritten += 1;
  } else {
    after += Buffer.byteLength(source) - Buffer.byteLength(compacted);
  }
}

const MiB = (bytes) => (bytes / (1024 * 1024)).toFixed(2);
console.log(
  `RSC manifest compaction: ${rewritten}/${files.length} manifests rewritten, ` +
    `${MiB(before)} -> ${MiB(after)} MiB (saved ${MiB(before - after)} MiB); ` +
    `every file verified to evaluate identically.`,
);
