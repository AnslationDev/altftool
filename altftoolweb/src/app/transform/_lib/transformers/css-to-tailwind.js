import { ok, err, isBlank } from "../types.js";

/**
 * Best-effort mapping of common CSS declarations to Tailwind utility classes.
 * Unmapped declarations are reported as warnings and rendered as arbitrary
 * values where possible. This is a heuristic converter, not a full CSS engine.
 */

const spacingToken = (px) => {
  const n = px / 4;
  if (n >= 0 && n <= 96 && Number.isInteger(n * 2)) return String(n);
  return null;
};

function lenToken(prefix, value) {
  const v = value.trim();
  if (v === "0" || v === "0px") return `${prefix}-0`;
  const px = /^(-?\d+(?:\.\d+)?)px$/.exec(v);
  if (px) {
    const tok = spacingToken(parseFloat(px[1]));
    return tok !== null ? `${prefix}-${tok}` : `${prefix}-[${v}]`;
  }
  if (v === "100%") return `${prefix}-full`;
  if (v === "auto") return `${prefix}-auto`;
  return `${prefix}-[${v.replace(/\s+/g, "_")}]`;
}

function shorthand(prefix, value) {
  const parts = value.trim().split(/\s+/);
  if (parts.length === 1) return [lenToken(prefix, parts[0])];
  if (parts.length === 2) return [lenToken(`${prefix}y`, parts[0]), lenToken(`${prefix}x`, parts[1])];
  if (parts.length === 3)
    return [lenToken(`${prefix}t`, parts[0]), lenToken(`${prefix}x`, parts[1]), lenToken(`${prefix}b`, parts[2])];
  return [
    lenToken(`${prefix}t`, parts[0]),
    lenToken(`${prefix}r`, parts[1]),
    lenToken(`${prefix}b`, parts[2]),
    lenToken(`${prefix}l`, parts[3]),
  ];
}

const RADIUS = { "0": "rounded-none", "2px": "rounded-sm", "4px": "rounded", "6px": "rounded-md", "8px": "rounded-lg", "12px": "rounded-xl", "16px": "rounded-2xl", "24px": "rounded-3xl", "9999px": "rounded-full", "50%": "rounded-full" };
const FONT_SIZE = { "12px": "text-xs", "14px": "text-sm", "16px": "text-base", "18px": "text-lg", "20px": "text-xl", "24px": "text-2xl", "30px": "text-3xl", "36px": "text-4xl", "48px": "text-5xl", "60px": "text-6xl" };
const WEIGHT = { "100": "font-thin", "200": "font-extralight", "300": "font-light", "400": "font-normal", normal: "font-normal", "500": "font-medium", "600": "font-semibold", "700": "font-bold", bold: "font-bold", "800": "font-extrabold", "900": "font-black" };
const MAP = {
  display: { flex: "flex", block: "block", "inline-block": "inline-block", inline: "inline", grid: "grid", none: "hidden", "inline-flex": "inline-flex" },
  position: { relative: "relative", absolute: "absolute", fixed: "fixed", sticky: "sticky", static: "static" },
  "flex-direction": { row: "flex-row", column: "flex-col", "row-reverse": "flex-row-reverse", "column-reverse": "flex-col-reverse" },
  "justify-content": { "flex-start": "justify-start", "flex-end": "justify-end", center: "justify-center", "space-between": "justify-between", "space-around": "justify-around", "space-evenly": "justify-evenly" },
  "align-items": { "flex-start": "items-start", "flex-end": "items-end", center: "items-center", baseline: "items-baseline", stretch: "items-stretch" },
  "text-align": { left: "text-left", center: "text-center", right: "text-right", justify: "text-justify" },
  "text-transform": { uppercase: "uppercase", lowercase: "lowercase", capitalize: "capitalize", none: "normal-case" },
  "font-style": { italic: "italic", normal: "not-italic" },
};

function mapDecl(prop, value) {
  const v = value.trim();
  if (MAP[prop]) return MAP[prop][v] ? [MAP[prop][v]] : null;
  switch (prop) {
    case "font-weight":
      return WEIGHT[v] ? [WEIGHT[v]] : [`font-[${v}]`];
    case "font-size":
      return FONT_SIZE[v] ? [FONT_SIZE[v]] : [lenToken("text", v)];
    case "border-radius":
      return [RADIUS[v] || `rounded-[${v}]`];
    case "color":
      return [`text-[${v.replace(/\s+/g, "_")}]`];
    case "background-color":
    case "background":
      return [`bg-[${v.replace(/\s+/g, "_")}]`];
    case "padding":
      return shorthand("p", v);
    case "margin":
      return shorthand("m", v);
    case "padding-top": return [lenToken("pt", v)];
    case "padding-right": return [lenToken("pr", v)];
    case "padding-bottom": return [lenToken("pb", v)];
    case "padding-left": return [lenToken("pl", v)];
    case "margin-top": return [lenToken("mt", v)];
    case "margin-right": return [lenToken("mr", v)];
    case "margin-bottom": return [lenToken("mb", v)];
    case "margin-left": return [lenToken("ml", v)];
    case "gap": return [lenToken("gap", v)];
    case "width": return [lenToken("w", v)];
    case "height": return [lenToken("h", v)];
    case "min-width": return [lenToken("min-w", v)];
    case "max-width": return [lenToken("max-w", v)];
    case "min-height": return [lenToken("min-h", v)];
    case "max-height": return [lenToken("max-h", v)];
    case "opacity": {
      const pct = Math.round(parseFloat(v) * 100);
      return Number.isFinite(pct) ? [`opacity-${pct}`] : [`opacity-[${v}]`];
    }
    case "line-height": return [`leading-[${v}]`];
    case "letter-spacing": return [`tracking-[${v.replace(/\s+/g, "_")}]`];
    case "border":
      return [`border`, ...(/#[0-9a-f]+|rgb|hsl/i.test(v) ? [`border-[${(v.match(/#[0-9a-f]+|rgba?\([^)]*\)/i) || [""])[0].replace(/\s+/g, "_")}]`] : [])];
    case "box-shadow": return [`shadow-[${v.replace(/\s+/g, "_")}]`];
    default:
      return null;
  }
}

function parseDeclarations(block) {
  const decls = [];
  for (const decl of block.split(";")) {
    const idx = decl.indexOf(":");
    if (idx === -1) continue;
    const prop = decl.slice(0, idx).trim().toLowerCase();
    const value = decl.slice(idx + 1).trim();
    if (prop && value) decls.push([prop, value]);
  }
  return decls;
}

function classesFor(block, warnings) {
  const classes = [];
  for (const [prop, value] of parseDeclarations(block)) {
    const mapped = mapDecl(prop, value);
    if (mapped) classes.push(...mapped.filter(Boolean));
    else warnings.push(`${prop}: ${value}`);
  }
  return classes.join(" ");
}

export const sample = `.button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  background-color: #2563eb;
  color: white;
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px;
}`;

/** @type {import("../types.js").Transformer} */
export function transform(input) {
  if (isBlank(input)) return err("Paste CSS to convert.");
  try {
    const warnings = [];
    let out;
    if (input.includes("{")) {
      const rules = [];
      const ruleRe = /([^{}]+)\{([^{}]*)\}/g;
      let m;
      while ((m = ruleRe.exec(input))) {
        const selector = m[1].trim().replace(/\s+/g, " ");
        const cls = classesFor(m[2], warnings);
        if (selector) rules.push(`/* ${selector} */\n${cls}`);
      }
      if (rules.length === 0) return err("No CSS rules found.");
      out = rules.join("\n\n");
    } else {
      out = classesFor(input, warnings);
      if (!out.trim()) return err("No mappable CSS declarations found.");
    }
    const uniqueWarnings = warnings.length
      ? [`No direct Tailwind class for: ${[...new Set(warnings)].join("; ")}`]
      : undefined;
    return ok(out + "\n", uniqueWarnings);
  } catch (e) {
    return err(e);
  }
}

export default transform;
