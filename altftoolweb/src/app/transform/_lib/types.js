/**
 * Shared result contract for every transformer in the Transform section.
 *
 * This is a JavaScript project (no TypeScript), so the contract is documented
 * with JSDoc typedefs and enforced by convention through the two factory
 * helpers below. Every transformer returns one of these shapes and must never
 * throw — parsing errors are caught and returned as `{ ok: false, error }`.
 *
 * @typedef {{ ok: true, output: string, warnings?: string[] }} TransformOk
 * @typedef {{ ok: false, error: string }} TransformErr
 * @typedef {TransformOk | TransformErr} TransformResult
 *
 * @callback Transformer
 * @param {string} input
 * @param {Record<string, unknown>} [options]
 * @returns {TransformResult | Promise<TransformResult>}
 *
 * A tool may also export an `options` array describing the controls the shell
 * should render:
 * @typedef {Object} ToolOption
 * @property {string} key
 * @property {string} label
 * @property {"boolean"|"select"|"text"} type
 * @property {unknown} [default]
 * @property {{ value: unknown, label: string }[]} [choices]
 */

/**
 * Build a successful result.
 * @param {string} output
 * @param {string[]} [warnings]
 * @returns {TransformOk}
 */
export function ok(output, warnings) {
  const out = typeof output === "string" ? output : String(output ?? "");
  return warnings && warnings.length ? { ok: true, output: out, warnings } : { ok: true, output: out };
}

/**
 * Build a failed result from an error or message. Never throws.
 * @param {unknown} error
 * @returns {TransformErr}
 */
export function err(error) {
  let message = "Conversion failed.";
  if (typeof error === "string") message = error;
  else if (error && typeof error === "object" && "message" in error) message = String(error.message);
  else if (error != null) message = String(error);
  return { ok: false, error: message };
}

/**
 * Guard for empty input — most transformers want to short-circuit on blank
 * input rather than emit a confusing parser error.
 * @param {string} input
 * @returns {boolean}
 */
export function isBlank(input) {
  return !input || !String(input).trim();
}
