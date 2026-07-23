// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "glob-pattern-tester",
  "title": "Glob Pattern Tester",
  "description": "Test whether a glob pattern (with * and ?) matches a string, and see the regex it compiles to.",
  "badge": "Developer",
  "category": [
    "Developer"
  ],
  "icon": "regex",
  "iconColor": "text-emerald-600",
  "fields": [
    {
      "key": "pattern",
      "label": "Glob pattern",
      "type": "text",
      "default": "*.js"
    },
    {
      "key": "input_string",
      "label": "Test string",
      "type": "text",
      "default": "app.js"
    },
    {
      "key": "case_insensitive",
      "label": "Case-insensitive",
      "type": "toggle",
      "default": false,
      "required": false,
      "checkboxLabel": "Ignore case"
    }
  ],
  "presets": [
    {
      "label": "*.js vs app.js",
      "values": {
        "pattern": "*.js",
        "input_string": "app.js"
      }
    },
    {
      "label": "src/**/*.ts",
      "values": {
        "pattern": "src/*/*.ts",
        "input_string": "src/lib/index.ts"
      }
    }
  ],
  "note": "Supports * (any run of characters) and ? (single character)."
},
  compute: (values) => { const num=(v)=>typeof v==="number"?v:Number(v); const money=(n)=>Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:2}):"—";
      const pat = String(values.pattern || "");
      if (!pat) return { result: "—", caption: "Enter a glob pattern" };
      const re = new RegExp("^" + pat.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, ".") + "$", values.case_insensitive ? "i" : "");
      const match = re.test(String(values.input_string || ""));
      return { result: match ? "✓ Match" : "✗ No match", caption: match ? "the string matches the pattern" : "no match", rows: [["Matches", match ? "yes" : "no"], ["Compiled regex", re.source]] };
    },
};

export default spec;
