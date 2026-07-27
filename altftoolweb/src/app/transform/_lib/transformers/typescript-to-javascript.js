import ts from "typescript";
import { ok, err, isBlank } from "../types.js";
import { TS_CODE_SAMPLE } from "./_ts.js";

/** @type {import("../types.js").ToolOption[]} */
export const options = [
  {
    key: "target",
    label: "Target",
    type: "select",
    default: "ES2020",
    choices: [
      { value: "ESNext", label: "ESNext" },
      { value: "ES2020", label: "ES2020" },
      { value: "ES2017", label: "ES2017" },
      { value: "ES5", label: "ES5" },
    ],
  },
];

export const sample = TS_CODE_SAMPLE;

const TARGETS = {
  ES5: ts.ScriptTarget.ES5,
  ES2017: ts.ScriptTarget.ES2017,
  ES2020: ts.ScriptTarget.ES2020,
  ESNext: ts.ScriptTarget.ESNext,
};

/** @type {import("../types.js").Transformer} */
export function transform(input, opts = {}) {
  if (isBlank(input)) return err("Paste TypeScript to convert.");
  try {
    const result = ts.transpileModule(input, {
      compilerOptions: {
        target: TARGETS[opts.target] || ts.ScriptTarget.ES2020,
        module: ts.ModuleKind.ESNext,
        jsx: ts.JsxEmit.Preserve,
        removeComments: false,
      },
    });
    const out = (result.outputText || "").trim();
    if (!out) return err("Nothing to emit — the input had only type-level code.");
    return ok(out + "\n");
  } catch (e) {
    return err(e);
  }
}

export default transform;
