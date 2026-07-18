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
  phpVersion: "8.2",
};

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
          type: "info",
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
  const compact = code
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\s*([{};])\s*/g, "$1")
    .replace(/\s*(<\?php|\?>)\s*/g, "$1 ")
    .trim();

  const lines = [];
  let current = "";
  let depth = 0;
  let inSingle = false;
  let inDouble = false;
  let escaped = false;

  const pushCurrent = () => {
    const line = current.trim();
    if (line) {
      lines.push(`${indentText.repeat(Math.max(depth, 0))}${line}`);
    }
    current = "";
  };

  for (const char of compact) {
    current += char;

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === "\\") {
      escaped = true;
      continue;
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
