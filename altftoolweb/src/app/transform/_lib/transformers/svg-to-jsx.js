import { transform as svgr } from "@svgr/core";
import { createRequire } from "module";
import { ok, err, isBlank } from "../types.js";

const requireFn = createRequire(import.meta.url);

/** @type {import("../types.js").ToolOption[]} */
export const options = [
  { key: "componentName", label: "Component name", type: "text", default: "SvgIcon" },
  { key: "typescript", label: "TypeScript", type: "boolean", default: false },
];

export const sample = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 2 2 7l10 5 10-5-10-5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
  <path d="m2 17 10 5 10-5M2 12l10 5 10-5" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
</svg>`;

/** @type {import("../types.js").Transformer} */
export async function transform(input, opts = {}) {
  if (isBlank(input)) return err("Paste SVG markup to convert.");
  const componentName = String(opts.componentName || "SvgIcon").replace(/[^A-Za-z0-9_]/g, "") || "SvgIcon";
  try {
    const svgrPluginJsx = requireFn("@svgr/plugin-jsx");
    const svgrPluginPrettier = requireFn("@svgr/plugin-prettier");
    const code = await svgr(
      input,
      {
        plugins: [svgrPluginJsx, svgrPluginPrettier],
        svgo: false,
        prettier: true,
        typescript: Boolean(opts.typescript),
        exportType: "default",
        jsxRuntime: "classic",
      },
      { componentName }
    );
    return ok(code);
  } catch (e) {
    return err(e);
  }
}

export default transform;
