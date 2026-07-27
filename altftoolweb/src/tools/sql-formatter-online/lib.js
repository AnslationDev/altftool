/**
 * SQL Formatter — tokenizer and pretty printer.
 *
 * The formatter is lexical, not a parser: it tokenizes the statement according
 * to SQL:2016 lexical rules (single-quoted literals with '' doubling, delimited
 * identifiers in double quotes or backticks, -- line comments, block comments)
 * and then re-emits the tokens with clause-driven line breaks and indentation.
 * Because it never rewrites a token, formatting cannot change what a query does.
 *
 * Pure functions. No DOM, no React.
 */

/** Indent width bounds offered by the UI. */
export const MIN_INDENT = 1;
export const MAX_INDENT = 8;
export const DEFAULT_INDENT = 2;

/** Keyword casing modes. */
export const KEYWORD_CASES = Object.freeze(["upper", "lower", "preserve"]);

/**
 * Clause keywords that start a new line.
 *  - "block": keyword alone on its line, its items indented one level below.
 *  - "inline": keyword starts a line and its arguments stay on the same line.
 *  - "solo": keyword alone on its line, nothing indented under it (set operators).
 * Phrases are matched longest-first, so "GROUP BY" wins over "GROUP".
 */
export const CLAUSE_STYLES = Object.freeze({
  "SELECT DISTINCT": "block",
  SELECT: "block",
  FROM: "block",
  WHERE: "block",
  "GROUP BY": "block",
  HAVING: "block",
  "ORDER BY": "block",
  SET: "block",
  VALUES: "block",
  RETURNING: "block",
  "INSERT INTO": "inline",
  UPDATE: "inline",
  "DELETE FROM": "inline",
  WITH: "inline",
  LIMIT: "inline",
  OFFSET: "inline",
  "CREATE TABLE": "inline",
  "CREATE VIEW": "inline",
  "CREATE INDEX": "inline",
  "ALTER TABLE": "inline",
  "DROP TABLE": "inline",
  "TRUNCATE TABLE": "inline",
  UNION: "solo",
  "UNION ALL": "solo",
  INTERSECT: "solo",
  EXCEPT: "solo",
});

/** JOIN phrases start a new line at the same indent as the FROM items. */
export const JOIN_PHRASES = Object.freeze([
  "LEFT OUTER JOIN",
  "RIGHT OUTER JOIN",
  "FULL OUTER JOIN",
  "NATURAL LEFT JOIN",
  "NATURAL RIGHT JOIN",
  "INNER JOIN",
  "CROSS JOIN",
  "NATURAL JOIN",
  "LEFT JOIN",
  "RIGHT JOIN",
  "FULL JOIN",
  "STRAIGHT_JOIN",
  "JOIN",
]);

/** Reserved words the formatter will re-case. Identifiers are never touched. */
export const SQL_KEYWORDS = new Set([
  "ADD", "ALL", "ALTER", "AND", "ANY", "AS", "ASC", "BEGIN", "BETWEEN", "BY", "CASE", "CAST",
  "CHECK", "COLUMN", "COMMIT", "CONSTRAINT", "CREATE", "CROSS", "CURRENT_DATE", "CURRENT_TIME",
  "CURRENT_TIMESTAMP", "DATABASE", "DEFAULT", "DELETE", "DESC", "DISTINCT", "DROP", "ELSE", "END",
  "EXCEPT", "EXISTS", "FETCH", "FOREIGN", "FROM", "FULL", "GROUP", "HAVING", "IF", "ILIKE", "IN",
  "INDEX", "INNER", "INSERT", "INTERSECT", "INTO", "IS", "JOIN", "KEY", "LEFT", "LIKE", "LIMIT",
  "NATURAL", "NOT", "NULL", "NULLS", "OFFSET", "ON", "OR", "ORDER", "OUTER", "OVER", "PARTITION",
  "PRIMARY", "REFERENCES", "RETURNING", "RIGHT", "ROLLBACK", "ROW", "ROWS", "SELECT", "SET",
  "TABLE", "THEN", "TRUNCATE", "UNION", "UNIQUE", "UPDATE", "USING", "VALUES", "VIEW", "WHEN",
  "WHERE", "WITH",
]);

/** Multi-character operators recognised before single characters. */
const MULTI_CHAR_OPERATORS = ["<=>", "<>", "!=", ">=", "<=", "||", "::", "->>", "->"];

const NO_SPACE_BEFORE = new Set([",", ")", ";", "."]);

/**
 * Tokenize a SQL string.
 * @returns {{ tokens: Array }|{ error: string }}
 */
export function tokenizeSql(sql) {
  const src = String(sql == null ? "" : sql);
  const tokens = [];
  let i = 0;
  /** Whether whitespace was skipped immediately before the next token. */
  let spaceBefore = false;
  const push = (token) => {
    tokens.push({ ...token, spaceBefore });
    spaceBefore = false;
  };

  while (i < src.length) {
    const ch = src[i];

    if (ch === " " || ch === "\t" || ch === "\n" || ch === "\r") {
      spaceBefore = true;
      i += 1;
      continue;
    }

    if (ch === "-" && src[i + 1] === "-") {
      const nl = src.indexOf("\n", i);
      const stop = nl === -1 ? src.length : nl;
      push({ type: "lineComment", value: src.slice(i, stop).trimEnd() });
      i = stop;
      continue;
    }

    if (ch === "/" && src[i + 1] === "*") {
      const close = src.indexOf("*/", i + 2);
      if (close === -1) return { error: "Unterminated block comment — a /* has no matching */." };
      push({ type: "blockComment", value: src.slice(i, close + 2) });
      i = close + 2;
      continue;
    }

    if (ch === "'") {
      let j = i + 1;
      while (j < src.length) {
        if (src[j] === "'") {
          if (src[j + 1] === "'") {
            j += 2;
            continue;
          }
          break;
        }
        j += 1;
      }
      if (j >= src.length) return { error: "Unterminated string literal — a quote is not closed." };
      push({ type: "string", value: src.slice(i, j + 1) });
      i = j + 1;
      continue;
    }

    if (ch === '"' || ch === "`" || ch === "[") {
      const closer = ch === "[" ? "]" : ch;
      const close = src.indexOf(closer, i + 1);
      if (close === -1) return { error: "Unterminated quoted identifier." };
      push({ type: "identifier", value: src.slice(i, close + 1) });
      i = close + 1;
      continue;
    }

    if (/[0-9]/.test(ch) || (ch === "." && /[0-9]/.test(src[i + 1] || ""))) {
      let j = i;
      while (j < src.length && /[0-9.eE]/.test(src[j])) {
        if ((src[j] === "e" || src[j] === "E") && /[+-]/.test(src[j + 1] || "")) j += 1;
        j += 1;
      }
      push({ type: "number", value: src.slice(i, j) });
      i = j;
      continue;
    }

    if (/[A-Za-z_@#$]/.test(ch)) {
      let j = i;
      while (j < src.length && /[A-Za-z0-9_@#$.]/.test(src[j])) j += 1;
      const value = src.slice(i, j);
      push({ type: "word", value, upper: value.toUpperCase() });
      i = j;
      continue;
    }

    const multi = MULTI_CHAR_OPERATORS.find((op) => src.startsWith(op, i));
    if (multi) {
      push({ type: "operator", value: multi });
      i += multi.length;
      continue;
    }

    push({ type: "punct", value: ch });
    i += 1;
  }

  return { tokens };
}

function matchPhrase(tokens, index, phrases) {
  for (const phrase of phrases) {
    const parts = phrase.split(" ");
    let ok = true;
    for (let k = 0; k < parts.length; k += 1) {
      const token = tokens[index + k];
      if (!token || token.type !== "word" || token.upper !== parts[k]) {
        ok = false;
        break;
      }
    }
    if (ok) return { phrase, length: parts.length };
  }
  return null;
}

const CLAUSE_PHRASES = Object.keys(CLAUSE_STYLES).sort(
  (a, b) => b.split(" ").length - a.split(" ").length || b.length - a.length,
);

function applyCase(value, keywordCase) {
  if (keywordCase === "lower") return value.toLowerCase();
  if (keywordCase === "preserve") return value;
  return value.toUpperCase();
}

/**
 * Format a SQL statement.
 *
 * @param {string} sql
 * @param {{ indentWidth?: number, keywordCase?: "upper"|"lower"|"preserve" }} options
 * @returns {{ formatted: string, lineCount: number, statementCount: number,
 *   tokenCount: number, longestLine: number, inputLines: number }|{ error: string }}
 */
export function formatSql(sql, options = {}) {
  const raw = String(sql == null ? "" : sql);
  if (raw.trim() === "") return { error: "Paste a SQL query to format." };

  const indentWidth = Number(options.indentWidth ?? DEFAULT_INDENT);
  if (!Number.isFinite(indentWidth) || indentWidth < MIN_INDENT || indentWidth > MAX_INDENT) {
    return { error: `Indent width must be between ${MIN_INDENT} and ${MAX_INDENT} spaces.` };
  }
  const keywordCase = KEYWORD_CASES.includes(options.keywordCase)
    ? options.keywordCase
    : "upper";

  const lexed = tokenizeSql(raw);
  if (lexed.error) return { error: lexed.error };
  const tokens = lexed.tokens;
  if (tokens.length === 0) return { error: "Nothing to format — the input is only whitespace or comments." };

  let openParens = 0;
  for (const token of tokens) {
    if (token.value === "(") openParens += 1;
    if (token.value === ")") {
      openParens -= 1;
      if (openParens < 0) return { error: "Unbalanced parentheses — a ) appears before its (." };
    }
  }
  if (openParens > 0) return { error: "Unbalanced parentheses — a ( is never closed." };

  const pad = (level) => " ".repeat(indentWidth * Math.max(0, level));
  const lines = [];
  let current = "";

  const flush = () => {
    const trimmed = current.replace(/\s+$/, "");
    if (trimmed.trim() !== "") lines.push(trimmed);
    current = "";
  };
  const startLine = (level) => {
    flush();
    current = pad(level);
  };
  const append = (value, forceGlue = false) => {
    const glue =
      forceGlue || NO_SPACE_BEFORE.has(value) || current.endsWith("(") || current.endsWith(".");
    if (current.trim() === "" || glue) current += value;
    else current += ` ${value}`;
  };

  let baseLevel = 0;
  let itemLevel = 1;
  let listMode = false;
  let localParen = 0;
  let betweenOpen = false;
  const frames = [];

  let index = 0;

  while (index < tokens.length) {
    const token = tokens[index];

    if (token.type === "lineComment" || token.type === "blockComment") {
      startLine(listMode ? itemLevel : baseLevel);
      append(token.value);
      flush();
      index += 1;
      continue;
    }

    if (token.type === "word" && localParen === 0) {
      const clause = matchPhrase(tokens, index, CLAUSE_PHRASES);
      if (clause) {
        const style = CLAUSE_STYLES[clause.phrase];
        startLine(baseLevel);
        append(applyCase(clause.phrase, keywordCase));
        if (style === "block") {
          listMode = true;
          startLine(itemLevel);
        } else if (style === "solo") {
          listMode = false;
          flush();
        } else {
          listMode = false;
        }
        betweenOpen = false;
        index += clause.length;
        continue;
      }

      const join = matchPhrase(tokens, index, JOIN_PHRASES);
      if (join) {
        startLine(itemLevel);
        append(applyCase(join.phrase, keywordCase));
        listMode = true;
        betweenOpen = false;
        index += join.length;
        continue;
      }

      if (token.upper === "AND" || token.upper === "OR") {
        if (betweenOpen && token.upper === "AND") {
          betweenOpen = false;
          append(applyCase(token.value, keywordCase));
        } else if (listMode) {
          startLine(itemLevel);
          append(applyCase(token.value, keywordCase));
        } else {
          append(applyCase(token.value, keywordCase));
        }
        index += 1;
        continue;
      }
    }

    if (token.type === "word") {
      if (token.upper === "BETWEEN") betweenOpen = true;
      const isKeyword = SQL_KEYWORDS.has(token.upper) && !token.value.includes(".");
      append(isKeyword ? applyCase(token.value, keywordCase) : token.value);
      index += 1;
      continue;
    }

    if (token.value === "(") {
      const next = tokens[index + 1];
      const previous = tokens[index - 1];
      const opensSubquery =
        next && next.type === "word" && (next.upper === "SELECT" || next.upper === "WITH");
      /**
       * `sum(` written without a space is a function call and stays glued;
       * `IN (`, `VALUES (` and `t (a, b)` keep the space the author typed.
       */
      const isFunctionCall =
        Boolean(previous) &&
        !token.spaceBefore &&
        (previous.type === "word" || previous.type === "identifier") &&
        !SQL_KEYWORDS.has(previous.upper);
      append("(", isFunctionCall);
      if (opensSubquery) {
        frames.push({ baseLevel, itemLevel, listMode, localParen });
        baseLevel = itemLevel + 1;
        itemLevel = baseLevel + 1;
        listMode = false;
        localParen = 0;
        startLine(baseLevel);
      } else {
        localParen += 1;
      }
      index += 1;
      continue;
    }

    if (token.value === ")") {
      if (localParen === 0 && frames.length > 0) {
        const frame = frames.pop();
        startLine(baseLevel - 1);
        append(")");
        baseLevel = frame.baseLevel;
        itemLevel = frame.itemLevel;
        listMode = frame.listMode;
        localParen = frame.localParen;
      } else {
        if (localParen > 0) localParen -= 1;
        append(")");
      }
      index += 1;
      continue;
    }

    if (token.value === ",") {
      append(",");
      if (listMode && localParen === 0) startLine(itemLevel);
      index += 1;
      continue;
    }

    if (token.value === ";") {
      append(";");
      flush();
      lines.push("");
      baseLevel = 0;
      itemLevel = 1;
      listMode = false;
      localParen = 0;
      betweenOpen = false;
      frames.length = 0;
      index += 1;
      continue;
    }

    append(token.value);
    index += 1;
  }

  flush();

  while (lines.length > 0 && lines[lines.length - 1] === "") lines.pop();

  const formatted = lines.join("\n");
  const longestLine = lines.reduce((max, line) => Math.max(max, line.length), 0);

  /** One statement per semicolon, plus one more if the text does not end on a semicolon. */
  const semicolons = tokens.filter((item) => item.value === ";").length;
  const endsOnSemicolon = tokens[tokens.length - 1].value === ";";
  const statementCount = Math.max(1, semicolons + (endsOnSemicolon ? 0 : 1));
  const selectCount = tokens.filter(
    (item) => item.type === "word" && item.upper === "SELECT",
  ).length;

  return {
    formatted,
    lineCount: lines.filter((line) => line !== "").length,
    statementCount,
    selectCount,
    tokenCount: tokens.length,
    longestLine,
    inputLines: raw.split("\n").length,
    keywordCase,
    indentWidth,
  };
}

/** Collapse a formatted query back to a single line — useful for logs and ORMs. */
export function minifySql(sql) {
  const lexed = tokenizeSql(sql);
  if (lexed.error) return { error: lexed.error };
  const kept = lexed.tokens.filter(
    (token) => token.type !== "lineComment" && token.type !== "blockComment",
  );
  if (kept.length === 0) return { error: "Nothing to minify — the input has no SQL tokens." };
  let out = "";
  kept.forEach((token, position) => {
    const previous = kept[position - 1];
    const isFunctionCall =
      token.value === "(" &&
      Boolean(previous) &&
      !token.spaceBefore &&
      (previous.type === "word" || previous.type === "identifier") &&
      !SQL_KEYWORDS.has(previous.upper);
    const glue =
      isFunctionCall || NO_SPACE_BEFORE.has(token.value) || out.endsWith("(") || out.endsWith(".");
    out += out === "" || glue ? token.value : ` ${token.value}`;
  });
  return { minified: out.trim(), characters: out.trim().length };
}
