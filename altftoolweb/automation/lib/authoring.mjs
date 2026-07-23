// Shared authoring helpers used by clusters, memory, and the cascade.
// A "raw spec" carries compute as a REAL function; we serialize it self-contained
// (no module-scope deps) and validate it in the sandbox before emit.
import { validateRawSpec } from "../generator/validate.mjs";

// Injected as the first statements of every compute body so functions stand
// alone in the sandbox AND the browser.
const PREAMBLE =
  ' const num=(v)=>typeof v==="number"?v:Number(v);' +
  ' const money=(n)=>Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:2}):"—";';

export function selfContained(fn) {
  const src = String(fn);
  if (src.includes("const num=") && src.includes("const money=")) return src; // already injected (idempotent)
  return src.replace(/=>\s*\{/, "=> {" + PREAMBLE);
}

// Turn a raw spec whose `compute` is a function OR source string into a
// validated ToolSpec. selfContained() injects the num/money preamble for both.
export async function buildAndValidate(entry, rawSpec) {
  const raw = { ...rawSpec, compute: selfContained(rawSpec.compute) };
  return validateRawSpec({ slug: entry.slug, name: rawSpec.title || entry.name, category: rawSpec.category || entry.category }, raw);
}

export const titleCase = (s) => String(s).replace(/\b\w/g, (c) => c.toUpperCase());
