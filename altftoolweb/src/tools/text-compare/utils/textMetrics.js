export function countWords(text) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

export function getTextMetrics(text) {
  return {
    characters: text.length,
    words: countWords(text),
    lines: text ? text.split(/\r?\n/).length : 0,
  };
}

export function normalizeLine(line, options) {
  let value = line;
  if (options.ignoreWhitespace) value = value.replace(/\s+/g, " ").trim();
  if (options.ignoreCase) value = value.toLowerCase();
  return value;
}
