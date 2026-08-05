/**
 * Module-resolution hooks that let the Bazaar data layer run under plain
 * `node --test`.
 *
 * The data modules are written for the Next bundler: they use extensionless
 * relative imports (`import ... from "./categories"`) and the `@/` alias
 * (`cities.js` imports `@/platform/seo/geoLocations`). Node's ESM resolver
 * accepts neither, and the modules themselves must not change to accommodate
 * tests — so the tests adapt instead.
 *
 * Each *.test.mjs self-registers this file FIRST and then imports the data
 * modules dynamically:
 *
 *   import { register } from "node:module";
 *   register(new URL("./test-helpers/aliasLoader.mjs", import.meta.url));
 *   const listings = await import("./listings.js");
 *
 * (The dynamic import matters: static imports are hoisted above `register()`
 * and would miss the hook.) The unit-test runner executes every test file in
 * its own process, so per-file registration composes cleanly and leaks into
 * nothing else. This helper is not named *.test.* / *.spec.*, so the runner's
 * discovery pattern never picks it up as a suite.
 *
 * Two behaviours, both scoped as narrowly as possible:
 *   1. `@/...` maps onto `src/...`, derived from this file's own location
 *      (src/app/bazaar/data/test-helpers → four levels up), never hardcoded.
 *   2. A relative or alias specifier that fails to resolve is retried with
 *      `.js`, `.jsx`, `.mjs`, then `/index.js` — the same candidates the
 *      bundler tries. Bare package specifiers are never rewritten.
 */

/** file:///.../src/ — this file sits at src/app/bazaar/data/test-helpers/. */
const SRC_ROOT = new URL("../../../../", import.meta.url);

const RETRY_SUFFIXES = [".js", ".jsx", ".mjs", "/index.js"];

/** Resolution failures worth retrying; anything else is a real error. */
const RETRYABLE_CODES = new Set([
  "ERR_MODULE_NOT_FOUND",
  "ERR_UNSUPPORTED_DIR_IMPORT",
]);

function isRetryable(error) {
  return RETRYABLE_CODES.has(error?.code);
}

async function resolveWithSuffixes(specifier, context, nextResolve, originalError) {
  for (const suffix of RETRY_SUFFIXES) {
    try {
      return await nextResolve(specifier + suffix, context);
    } catch {
      // Fall through to the next candidate.
    }
  }
  throw originalError;
}

export async function resolve(specifier, context, nextResolve) {
  // `@/x/y` → file:///.../src/x/y (still extensionless; retried below).
  const target = specifier.startsWith("@/")
    ? new URL(specifier.slice(2), SRC_ROOT).href
    : specifier;

  try {
    return await nextResolve(target, context);
  } catch (error) {
    const wasAliased = target !== specifier;
    const isRelative =
      specifier.startsWith("./") || specifier.startsWith("../");
    if ((wasAliased || isRelative) && isRetryable(error)) {
      return resolveWithSuffixes(target, context, nextResolve, error);
    }
    throw error;
  }
}
