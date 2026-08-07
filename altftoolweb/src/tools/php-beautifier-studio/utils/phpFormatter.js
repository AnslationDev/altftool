// Prettier and the PHP plugin are loaded once in the browser, then reused for
// every live formatting pass.
let formatterPromise;

export const loadPhpFormatter = () => {
  if (!formatterPromise) {
    formatterPromise = Promise.all([
      import("prettier/standalone"),
      import("@prettier/plugin-php/standalone"),
    ]).then(([prettierModule, phpModule]) => ({
      prettier: prettierModule.default || prettierModule,
      plugin: phpModule.default || phpModule,
    }));
  }

  return formatterPromise;
};

export const DEFAULT_SETTINGS = {
  tabWidth: 4,
  useTabs: false,
  printWidth: 80,
  singleQuote: false,
  trailingCommaPHP: true,
  braceStyle: "1tbs",
};

// The only braceStyle values @prettier/plugin-php actually accepts (see its
// src/options.mjs). Anything else throws on every format call.
export const BRACE_STYLES = ["1tbs", "per-cs"];

export const formatPhp = async (code, settings = DEFAULT_SETTINGS) => {
  if (!code || !code.trim()) {
    return { output: "", messages: [] };
  }

  try {
    const { prettier, plugin } = await loadPhpFormatter();

    const formatted = await prettier.format(code, {
      parser: "php",
      plugins: [plugin],
      ...settings,
    });
    return { output: formatted, messages: [] };
  } catch (error) {
    const errorMessage = error.message ? error.message : String(error);
    const fallbackOutput = fallbackFormatPhp(code, settings);

    return {
      output: fallbackOutput,
      messages: [
        {
          type: "error",
          text: `Live fallback formatter used. Prettier PHP could not format this input: ${errorMessage}`,
        },
      ],
    };
  }
};

export const getPhpStats = (input, output) => {
  return {
    originalSize: new Blob([input]).size,
    formattedSize: new Blob([output]).size,
    lines: input.split("\n").length,
  };
};

function fallbackFormatPhp(code, settings = DEFAULT_SETTINGS) {
  const indentText = settings.useTabs ? "\t" : " ".repeat(settings.tabWidth || 4);
  // Only spaces/tabs are stripped around structural characters here, never
  // newlines: a `//`/`#` line comment relies on its trailing newline to know
  // where the comment ends, and every real statement break already gets its
  // own line from pushCurrent() below regardless of source newlines, so
  // keeping them is a no-op for normal code but required for comments.
  const compact = code
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/[ \t]*([{};])[ \t]*/g, "$1")
    .replace(/\s*(<\?php|\?>)\s*/g, "$1 ")
    .trim();

  const lines = [];
  let current = "";
  let depth = 0;
  let inSingle = false;
  let inDouble = false;
  let inLineComment = false;
  let inBlockComment = false;
  let escaped = false;

  const pushCurrent = () => {
    const line = current.trim();
    if (line) {
      lines.push(`${indentText.repeat(Math.max(depth, 0))}${line}`);
    }
    current = "";
  };

  const chars = Array.from(compact);
  for (let i = 0; i < chars.length; i += 1) {
    const char = chars[i];
    const next = chars[i + 1];
    current += char;

    // Comment content is never real PHP structure: braces/semicolons inside
    // `//`, `#` or `/* */` comments must not be treated as code boundaries.
    if (inLineComment) {
      if (char === "\n") {
        inLineComment = false;
        pushCurrent();
      }
      continue;
    }

    if (inBlockComment) {
      if (char === "*" && next === "/") {
        current += next;
        i += 1;
        inBlockComment = false;
        pushCurrent();
      }
      continue;
    }

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === "\\") {
      escaped = true;
      continue;
    }

    if (!inSingle && !inDouble) {
      if (char === "/" && next === "/") {
        inLineComment = true;
        current += next;
        i += 1;
        continue;
      }
      if (char === "#") {
        inLineComment = true;
        continue;
      }
      if (char === "/" && next === "*") {
        inBlockComment = true;
        current += next;
        i += 1;
        continue;
      }
    }

    if (char === "'" && !inDouble) inSingle = !inSingle;
    if (char === '"' && !inSingle) inDouble = !inDouble;
    if (inSingle || inDouble) continue;

    if (char === "{") {
      pushCurrent();
      depth += 1;
    } else if (char === "}") {
      const beforeBrace = current.slice(0, -1).trim();
      if (beforeBrace) {
        current = beforeBrace;
        pushCurrent();
      }
      depth = Math.max(depth - 1, 0);
      current = "}";
      pushCurrent();
    } else if (char === ";") {
      pushCurrent();
    }
  }

  pushCurrent();

  return lines
    .join("\n")
    .replace(/<\?php\s*\n/, "<?php\n")
    .replace(/\n\s*\?>$/, "\n?>");
}
