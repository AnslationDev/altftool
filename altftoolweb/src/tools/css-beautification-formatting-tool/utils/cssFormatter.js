"use client";

const DEFAULT_SETTINGS = {
  indent: "2",
  lineSpacing: "compact",
  bracketStyle: "same-line",
  sortProperties: false,
};

const AT_RULES_WITH_BLOCKS = new Set([
  "media",
  "supports",
  "container",
  "document",
  "layer",
  "scope",
  "keyframes",
  "-webkit-keyframes",
]);

export { DEFAULT_SETTINGS };

export function formatCss(source, settings = DEFAULT_SETTINGS) {
  const css = String(source || "").replace(/\r\n/g, "\n");
  const indentUnit =
    settings.indent === "tab" ? "\t" : " ".repeat(Number(settings.indent) || 2);
  const gap = settings.lineSpacing === "spacious" ? "\n\n" : "\n";
  const tokens = tokenizeCss(css);
  if (!css.trim()) {
    return {
      output: "",
      minified: "",
      messages: [{ type: "hint", text: "Paste CSS to start formatting." }],
    };
  }

  if (!hasCssShape(tokens)) {
    const commentOutput = toCssComment(css);
    return {
      output: commentOutput,
      minified: commentOutput,
      messages: [
        {
          type: "warning",
          text: "Plain text detected. Converted it into a CSS-safe comment.",
        },
      ],
    };
  }

  const messages = validateTokens(tokens);
  const result = renderTokens(tokens, {
    indentUnit,
    gap,
    bracketStyle: settings.bracketStyle,
    sortProperties: Boolean(settings.sortProperties),
  });

  return {
    output: result.trim(),
    minified: minifyCss(tokens).trim(),
    messages: [...messages, ...analyzeCss(tokens)],
  };
}

export function getCssStats(input, output, minified) {
  const bytes = (value) => new Blob([value || ""]).size;
  return {
    inputChars: input.length,
    outputChars: output.length,
    minifiedChars: minified.length,
    inputLines: input ? input.split("\n").length : 0,
    outputLines: output ? output.split("\n").length : 0,
    inputBytes: bytes(input),
    outputBytes: bytes(output),
    savings: input ? Math.round(((input.length - minified.length) / input.length) * 100) : 0,
  };
}

function tokenizeCss(css) {
  const tokens = [];
  let buffer = "";
  let quote = "";
  let comment = false;

  for (let i = 0; i < css.length; i += 1) {
    const char = css[i];
    const next = css[i + 1];

    if (comment) {
      buffer += char;
      if (char === "*" && next === "/") {
        buffer += next;
        tokens.push({ type: "comment", value: buffer });
        buffer = "";
        comment = false;
        i += 1;
      }
      continue;
    }

    if (!quote && char === "/" && next === "*") {
      pushText(tokens, buffer);
      buffer = "/*";
      comment = true;
      i += 1;
      continue;
    }

    if ((char === '"' || char === "'") && css[i - 1] !== "\\") {
      quote = quote === char ? "" : quote || char;
      buffer += char;
      continue;
    }

    if (!quote && ["{", "}", ";"].includes(char)) {
      pushText(tokens, buffer);
      tokens.push({ type: char, value: char });
      buffer = "";
      continue;
    }

    buffer += char;
  }

  pushText(tokens, buffer);
  return tokens;
}

function pushText(tokens, value) {
  const trimmed = value.trim();
  if (trimmed) tokens.push({ type: "text", value: trimmed });
}

function renderTokens(tokens, options) {
  const lines = [];
  let level = 0;
  let pending = "";
  let declarations = [];

  const flushDeclarations = () => {
    if (!declarations.length) return;
    const list = options.sortProperties
      ? [...declarations].sort((a, b) => a.property.localeCompare(b.property))
      : declarations;
    list.forEach((item) => lines.push(`${options.indentUnit.repeat(level)}${item.text};`));
    declarations = [];
  };

  const flushPending = () => {
    if (!pending) return;
    if (pending.includes(":") && !isBlockAtRule(pending)) {
      const items = splitDeclarations(pending);
      items.forEach((item) => {
        const [property] = item.split(":");
        declarations.push({ property: property.trim().toLowerCase(), text: normalizeDeclaration(item) });
      });
      flushDeclarations();
    } else {
      lines.push(`${options.indentUnit.repeat(level)}${pending};`);
    }
    pending = "";
  };

  tokens.forEach((token) => {
    if (token.type === "comment") {
      flushDeclarations();
      flushPending();
      lines.push(`${options.indentUnit.repeat(level)}${token.value}`);
      return;
    }

    if (token.type === "text") {
      pending = normalizeStatement(token.value);
      return;
    }

    if (token.type === "{") {
      const opener =
        options.bracketStyle === "new-line"
          ? `${options.indentUnit.repeat(level)}${pending}\n${options.indentUnit.repeat(level)}{`
          : `${options.indentUnit.repeat(level)}${pending} {`;
      lines.push(opener);
      pending = "";
      level += 1;
      return;
    }

    if (token.type === ";") {
      if (!pending) return;
      if (pending.includes(":") && !isBlockAtRule(pending)) {
        splitDeclarations(pending).forEach((item) => {
          const [property] = item.split(":");
          declarations.push({ property: property.trim().toLowerCase(), text: normalizeDeclaration(item) });
        });
      } else {
        flushDeclarations();
        lines.push(`${options.indentUnit.repeat(level)}${pending};`);
      }
      pending = "";
      return;
    }

    if (token.type === "}") {
      flushDeclarations();
      flushPending();
      level = Math.max(0, level - 1);
      lines.push(`${options.indentUnit.repeat(level)}}`);
    }
  });

  flushDeclarations();
  flushPending();
  return lines.filter(Boolean).join(options.gap);
}

function minifyCss(tokens) {
  let output = "";
  let level = 0;
  tokens.forEach((token) => {
    if (token.type === "comment") return;
    if (token.type === "text") {
      if (token.value.includes(":") && !isBlockAtRule(token.value)) {
        output += splitDeclarations(token.value)
          .map((item) => normalizeDeclaration(item).replace(/\s*:\s*/g, ":"))
          .join(";");
      } else {
        output += normalizeStatement(token.value).replace(/\s*([:,>+~])\s*/g, "$1");
      }
    }
    if (token.type === "{") {
      level += 1;
      output += "{";
    }
    if (token.type === "}") {
      level = Math.max(0, level - 1);
      output = output.replace(/;$/, "") + "}";
    }
    if (token.type === ";") output += ";";
  });
  return output.replace(/\s+/g, " ").replace(/\s*([{};])\s*/g, "$1");
}

function validateTokens(tokens) {
  const messages = [];
  let depth = 0;
  let hasDeclaration = false;
  let hasBlock = false;
  let hasBlockDeclaration = false;

  tokens.forEach((token, index) => {
    if (token.type === "{") {
      depth += 1;
      hasBlock = true;
    }
    if (token.type === "}") {
      depth -= 1;
      if (depth < 0) {
        messages.push({ type: "error", text: `Unexpected closing brace near token ${index + 1}.` });
        depth = 0;
      }
    }
    if (token.type === "text" && looksLikeDeclarationText(token.value)) {
      hasDeclaration = true;
      if (depth > 0) hasBlockDeclaration = true;
      const next = tokens[index + 1]?.type;
      if (depth > 0 && next && next !== ";" && next !== "}") {
        messages.push({ type: "warning", text: `Missing semicolon after "${token.value.slice(0, 48)}".` });
      }
    }
  });

  if (depth > 0) messages.push({ type: "error", text: "Missing closing brace." });
  if (!hasDeclaration) messages.push({ type: "error", text: "No CSS declarations found." });
  if (hasDeclaration && !hasBlock) {
    messages.push({ type: "hint", text: "Formatting CSS declarations as a reusable snippet." });
  }
  if (hasBlock && !hasBlockDeclaration) {
    messages.push({ type: "error", text: "No CSS declarations found inside a selector block." });
  }
  if (!messages.length) messages.push({ type: "success", text: "CSS syntax looks valid." });
  return messages;
}

function analyzeCss(tokens) {
  const messages = [];
  const seen = new Map();
  let inBlock = false;

  tokens.forEach((token) => {
    if (token.type === "{") {
      inBlock = true;
      seen.clear();
    }
    if (token.type === "}") inBlock = false;
    if (inBlock && token.type === "text" && token.value.includes(":")) {
      const property = token.value.split(":")[0].trim().toLowerCase();
      if (seen.has(property)) {
        messages.push({ type: "hint", text: `Duplicate property detected: ${property}.` });
      }
      seen.set(property, true);
    }
  });

  return messages;
}

function normalizeStatement(value) {
  return value.replace(/\s+/g, " ").replace(/\s*([,{})])\s*/g, "$1 ").trim();
}

function normalizeDeclaration(value) {
  const index = value.indexOf(":");
  if (index === -1) return normalizeStatement(value);
  return `${value.slice(0, index).trim()}: ${value.slice(index + 1).trim()}`;
}

function splitDeclarations(value) {
  const text = normalizeStatement(value);
  const matches = [...text.matchAll(/(?:^|\s)(--[-\w]+|-?[a-zA-Z][-\w]*)\s*:/g)];
  if (matches.length <= 1) return [text];

  return matches
    .map((match, index) => {
      const start = match.index + (match[0].startsWith(" ") ? 1 : 0);
      const end = matches[index + 1]
        ? matches[index + 1].index + (matches[index + 1][0].startsWith(" ") ? 1 : 0)
        : text.length;
      return text.slice(start, end).trim().replace(/;$/, "");
    })
    .filter(Boolean);
}

function isBlockAtRule(value) {
  const match = value.trim().match(/^@([-\w]+)/);
  return match ? AT_RULES_WITH_BLOCKS.has(match[1].toLowerCase()) : false;
}

function hasCssShape(tokens) {
  let depth = 0;
  let hasDeclaration = false;

  tokens.forEach((token) => {
    if (token.type === "{") {
      depth += 1;
    } else if (token.type === "}") {
      depth = Math.max(0, depth - 1);
    } else if (token.type === "text" && looksLikeDeclarationText(token.value)) {
      hasDeclaration = true;
    }
  });

  return hasDeclaration;
}

function looksLikeDeclarationText(value) {
  return /(?:^|\s)(--[-\w]+|-?[a-zA-Z][-\w]*)\s*:/.test(value);
}

function toCssComment(value) {
  const safeText = value
    .trim()
    .replace(/\*\//g, "* /")
    .split("\n")
    .map((line) => ` * ${line.trim()}`)
    .join("\n");

  return `/*\n${safeText}\n */`;
}
