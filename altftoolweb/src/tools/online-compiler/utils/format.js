import jsBeautify from "js-beautify";

// Beautify using js-beautify. `tabSize` controls indentation.
export function beautifyHtml(code, tabSize = 2) {
  try {
    return jsBeautify.html(code, {
      indent_size: tabSize,
      wrap_line_length: 0,
      preserve_newlines: true,
    });
  } catch {
    return code;
  }
}

export function beautifyCss(code, tabSize = 2) {
  try {
    return jsBeautify.css(code, { indent_size: tabSize });
  } catch {
    return code;
  }
}

export function beautifyJs(code, tabSize = 2) {
  try {
    return jsBeautify.js(code, { indent_size: tabSize });
  } catch {
    return code;
  }
}

// Lightweight minify: strip block/line comments and collapse redundant
// whitespace. Conservative on purpose so it never mangles string contents.
function stripComments(code) {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
}

export function minifyHtml(code) {
  return code
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/>\s+</g, "><")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function minifyCss(code) {
  return stripComments(code)
    .replace(/\s*([{}:;,])\s*/g, "$1")
    .replace(/;}/g, "}")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function minifyJs(code) {
  return stripComments(code)
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length)
    .join("\n");
}
