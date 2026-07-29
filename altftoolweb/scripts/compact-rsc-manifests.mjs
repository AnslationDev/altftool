#!/usr/bin/env node
/**
 * Re-encodes Next's per-route RSC client-reference manifests compactly.
 *
 * Next writes one `page_client-reference-manifest.js` per app route. Across 390
 * routes here they total 51 MiB, and the content is almost entirely repetition:
 * every route's manifest lists the same 429 client modules (a page under
 * /altfgame carries 115 modules belonging to /bops), every value has the shape
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
function encode(manifest, route) {
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
  // build root ~429 times and directories like node_modules/next/dist/esm/
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

  const mapping = (source) =>
    Object.entries(source || {}).map(([moduleId, byExport]) => [
      moduleId,
      Object.entries(byExport).map(([exportName, value]) => [
        exportName,
        ...record(value),
      ]),
    ]);

  const ssr = mapping(manifest.ssrModuleMapping);
  const rsc = mapping(manifest.rscModuleMapping);
  const edgeSsr = mapping(manifest.edgeSSRModuleMapping);
  const edgeRsc = mapping(manifest.edgeRscModuleMapping);

  const j = JSON.stringify;
  return `globalThis.__RSC_MANIFEST=(globalThis.__RSC_MANIFEST||{});(function(){
var N=${j(names)},C=${j(chunkGroups)},D=${j(directories)};
function r(v){return {id:v[0],name:N[v[1]||0],chunks:C[v[2]||0],async:!!v[3]}}
function o(rows){var t={};for(var i=0;i<rows.length;i++){t[D[rows[i][0]]+rows[i][1]]=r(rows[i].slice(2))}return t}
function m(rows){var t={};for(var i=0;i<rows.length;i++){var e={},x=rows[i][1];
for(var k=0;k<x.length;k++){e[x[k][0]]=r(x[k].slice(1))}t[rows[i][0]]=e}return t}
globalThis.__RSC_MANIFEST[${j(route)}]={moduleLoading:${j(manifest.moduleLoading)},ssrModuleMapping:m(${j(ssr)}),edgeSSRModuleMapping:m(${j(edgeSsr)}),clientModules:o(${j(clientModules)}),entryCSSFiles:${j(manifest.entryCSSFiles)},rscModuleMapping:m(${j(rsc)}),edgeRscModuleMapping:m(${j(edgeRsc)})};
})();
`;
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
