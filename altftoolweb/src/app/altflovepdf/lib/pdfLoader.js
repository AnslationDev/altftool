// Lazily load pdf.js (legacy build) on the client only, once, and cache it.
//
// A static top-level `import * as pdfjsLib from "pdfjs-dist/..."` crashes under
// this app's webpack with "Object.defineProperty called on non-object" while the
// module is evaluated. Loading it through a dynamic import (the same way the
// other PDF tools already do) avoids that crash. Every tool should call
// `const pdfjsLib = await getPdfjs();` before using getDocument/OPS/etc.

let _pdfjsPromise;

export function getPdfjs() {
  if (!_pdfjsPromise) {
    _pdfjsPromise = import(/* webpackIgnore: true */ "/altflovepdf/pdf.min.mjs").then((mod) => {
      const lib = mod && mod.getDocument ? mod : mod.default || mod;
      try {
        lib.GlobalWorkerOptions.workerSrc = "/altflovepdf/pdf.worker.min.mjs";
      } catch {
        /* worker may already be configured */
      }
      return lib;
    });
  }
  return _pdfjsPromise;
}
