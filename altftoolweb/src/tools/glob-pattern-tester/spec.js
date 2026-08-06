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
        "pattern": "src/**/*.ts",
        "input_string": "src/lib/index.ts"
      }
    }
  ],
  "note": "Supports * within one path segment, ** across directories, and ? for one non-slash character."
},
  compilePattern: (pattern) => {
      const pat = String(pattern || "");
      let source = "^";
      for (let index = 0; index < pat.length; index += 1) {
        const char = pat[index];
        if (char === "*") {
          let starCount = 1;
          while (pat[index + 1] === "*") {
            starCount += 1;
            index += 1;
          }
          if (starCount > 1 && pat[index + 1] === "/") {
            source += "(?:[^/]+/)*";
            index += 1;
          } else {
            source += starCount > 1 ? ".*" : "[^/]*";
          }
        } else if (char === "?") {
          source += "[^/]";
        } else {
          source += /[.+^${}()|[\]\\]/.test(char) ? `\\${char}` : char;
        }
      }
      return `${source}$`;
    },
  compute: (values) => {
      const pat = String(values.pattern || "");
      if (!pat) return { result: "—", caption: "Enter a glob pattern" };
      const re = new RegExp(spec.compilePattern(pat), values.case_insensitive ? "i" : "");
      const match = re.test(String(values.input_string || ""));
      return { result: match ? "✓ Match" : "✗ No match", caption: match ? "the string matches the pattern" : "no match", rows: [["Matches", match ? "yes" : "no"], ["Compiled regex", re.source]] };
    },
};

export default spec;
