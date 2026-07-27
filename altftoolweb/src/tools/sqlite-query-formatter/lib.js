/**
 * SQLite SQL formatter.
 *
 * Tokenizer and quoting rules follow the SQLite language documentation:
 *  - keywords:   https://sqlite.org/lang_keywords.html
 *  - literals:   https://sqlite.org/lang_expr.html ('' escapes a quote inside a string)
 *  - identifiers: "double quotes", `backticks` (MySQL compat) and [brackets]
 *    (SQL Server compat) are all accepted by SQLite.
 * The formatter is purely lexical: it never changes token order, only whitespace
 * and keyword letter-case, so the formatted SQL is semantically identical.
 */

/**
 * Reserved and common keywords from the SQLite keyword list
 * (https://sqlite.org/lang_keywords.html) — used for case folding and for the
 * "no space before ( after a keyword-that-is-not-a-function" rule.
 */
export const SQLITE_KEYWORDS = new Set([
  "ABORT", "ACTION", "ADD", "AFTER", "ALL", "ALTER", "ANALYZE", "AND", "AS", "ASC",
  "ATTACH", "AUTOINCREMENT", "BEFORE", "BEGIN", "BETWEEN", "BY", "CASCADE", "CASE",
  "CAST", "CHECK", "COLLATE", "COLUMN", "COMMIT", "CONFLICT", "CONSTRAINT", "CREATE",
  "CROSS", "CURRENT", "CURRENT_DATE", "CURRENT_TIME", "CURRENT_TIMESTAMP", "DATABASE",
  "DEFAULT", "DEFERRABLE", "DEFERRED", "DELETE", "DESC", "DETACH", "DISTINCT", "DO",
  "DROP", "EACH", "ELSE", "END", "ESCAPE", "EXCEPT", "EXCLUDE", "EXCLUSIVE", "EXISTS",
  "EXPLAIN", "FAIL", "FILTER", "FIRST", "FOLLOWING", "FOR", "FOREIGN", "FROM", "FULL",
  "GENERATED", "GLOB", "GROUP", "GROUPS", "HAVING", "IF", "IGNORE", "IMMEDIATE", "IN",
  "INDEX", "INDEXED", "INITIALLY", "INNER", "INSERT", "INSTEAD", "INTERSECT", "INTO",
  "IS", "ISNULL", "JOIN", "KEY", "LAST", "LEFT", "LIKE", "LIMIT", "MATCH",
  "MATERIALIZED", "NATURAL", "NO", "NOT", "NOTHING", "NOTNULL", "NULL", "NULLS", "OF",
  "OFFSET", "ON", "OR", "ORDER", "OTHERS", "OUTER", "OVER", "PARTITION", "PLAN",
  "PRAGMA", "PRECEDING", "PRIMARY", "QUERY", "RAISE", "RANGE", "RECURSIVE",
  "REFERENCES", "REGEXP", "REINDEX", "RELEASE", "RENAME", "REPLACE", "RESTRICT",
  "RETURNING", "RIGHT", "ROLLBACK", "ROW", "ROWID", "ROWS", "SAVEPOINT", "SELECT",
  "SET", "TABLE", "TEMP", "TEMPORARY", "THEN", "TIES", "TO", "TRANSACTION", "TRIGGER",
  "UNBOUNDED", "UNION", "UNIQUE", "UPDATE", "USING", "VACUUM", "VALUES", "VIEW",
  "VIRTUAL", "WHEN", "WHERE", "WINDOW", "WITH", "WITHOUT",
]);

/**
 * Multi-word clause heads that start a new line at indent level 0.
 * Longest phrases first so "ORDER BY" matches before "ORDER" and "UNION ALL"
 * before "UNION". Includes SQLite-specific statement heads (PRAGMA, ATTACH,
 * VACUUM, EXPLAIN QUERY PLAN).
 */
export const CLAUSE_PHRASES = [
  "EXPLAIN QUERY PLAN", "CREATE UNIQUE INDEX", "INSERT OR REPLACE INTO",
  "INSERT OR IGNORE INTO", "ATTACH DATABASE", "DETACH DATABASE", "CREATE TABLE",
  "CREATE INDEX", "CREATE VIEW", "CREATE TRIGGER", "CREATE VIRTUAL TABLE",
  "DELETE FROM", "INSERT INTO", "REPLACE INTO", "GROUP BY", "ORDER BY",
  "PARTITION BY", "UNION ALL", "ON CONFLICT", "WITH RECURSIVE", "WITH", "SELECT",
  "FROM", "WHERE", "HAVING", "LIMIT", "OFFSET", "UNION", "INTERSECT", "EXCEPT",
  "VALUES", "UPDATE", "SET", "RETURNING", "PRAGMA", "VACUUM", "ANALYZE", "EXPLAIN",
  "BEGIN", "COMMIT", "ROLLBACK", "DROP TABLE", "DROP INDEX", "DROP VIEW",
  "ALTER TABLE",
].map((phrase) => phrase.split(" "));

/** JOIN phrases break onto their own line, aligned with FROM. */
export const JOIN_PHRASES = [
  "LEFT OUTER JOIN", "RIGHT OUTER JOIN", "FULL OUTER JOIN", "NATURAL LEFT JOIN",
  "LEFT JOIN", "RIGHT JOIN", "FULL JOIN", "INNER JOIN", "CROSS JOIN",
  "NATURAL JOIN", "JOIN",
].map((phrase) => phrase.split(" "));

/** AND / OR at parenthesis depth 0 wrap onto an indented new line. */
export const LOGICAL_BREAKERS = new Set(["AND", "OR"]);

/** Tokenize SQLite SQL. Returns { tokens } or { error } for unterminated literals. */
export function tokenizeSql(sql) {
  const tokens = [];
  let i = 0;
  while (i < sql.length) {
    const ch = sql[i];
    if (/\s/.test(ch)) {
      i += 1;
      continue;
    }
    if (ch === "-" && sql[i + 1] === "-") {
      let end = sql.indexOf("\n", i);
      if (end === -1) end = sql.length;
      tokens.push({ type: "comment", value: sql.slice(i, end).trimEnd() });
      i = end;
      continue;
    }
    if (ch === "/" && sql[i + 1] === "*") {
      const end = sql.indexOf("*/", i + 2);
      if (end === -1) return { error: "Unterminated /* block comment." };
      tokens.push({ type: "comment", value: sql.slice(i, end + 2) });
      i = end + 2;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === "`") {
      let j = i + 1;
      let closed = false;
      while (j < sql.length) {
        if (sql[j] === ch) {
          if (sql[j + 1] === ch) {
            j += 2; // doubled quote escapes itself (SQLite expr docs)
            continue;
          }
          j += 1;
          closed = true;
          break;
        }
        j += 1;
      }
      if (!closed) {
        return {
          error: `Unterminated ${ch === "'" ? "string literal" : "quoted identifier"} starting at position ${i + 1}.`,
        };
      }
      tokens.push({ type: ch === "'" ? "string" : "ident", value: sql.slice(i, j) });
      i = j;
      continue;
    }
    if (ch === "[") {
      const end = sql.indexOf("]", i);
      if (end === -1) return { error: "Unterminated [bracket] identifier." };
      tokens.push({ type: "ident", value: sql.slice(i, end + 1) });
      i = end + 1;
      continue;
    }
    if (/[0-9]/.test(ch) || (ch === "." && /[0-9]/.test(sql[i + 1] ?? ""))) {
      const match = /^(?:0[xX][0-9a-fA-F]+|\d+(?:\.\d*)?(?:[eE][+-]?\d+)?|\.\d+(?:[eE][+-]?\d+)?)/.exec(
        sql.slice(i),
      );
      tokens.push({ type: "number", value: match[0] });
      i += match[0].length;
      continue;
    }
    if (/[A-Za-z_]/.test(ch)) {
      const match = /^[A-Za-z_][A-Za-z0-9_$]*/.exec(sql.slice(i));
      tokens.push({ type: "word", value: match[0] });
      i += match[0].length;
      continue;
    }
    // named or positional bind parameters: ?, ?N, :name, @name, $name
    if (ch === "?" || ch === ":" || ch === "@" || ch === "$") {
      const match = /^[?:@$][A-Za-z0-9_]*/.exec(sql.slice(i));
      tokens.push({ type: "param", value: match[0] });
      i += match[0].length;
      continue;
    }
    const two = sql.slice(i, i + 2);
    if (["<>", "<=", ">=", "==", "!=", "||", "<<", ">>", "->"].includes(two)) {
      // ->> json operator: check three chars
      const three = sql.slice(i, i + 3);
      if (three === "->>") {
        tokens.push({ type: "op", value: three });
        i += 3;
      } else {
        tokens.push({ type: "op", value: two });
        i += 2;
      }
      continue;
    }
    tokens.push({ type: ",();.".includes(ch) ? "punct" : "op", value: ch });
    i += 1;
  }
  return { tokens };
}

const matchPhrase = (tokens, index, phrases) => {
  for (const phrase of phrases) {
    if (phrase.length > 0 && index + phrase.length <= tokens.length) {
      let ok = true;
      for (let k = 0; k < phrase.length; k += 1) {
        const token = tokens[index + k];
        if (token.type !== "word" || token.value.toUpperCase() !== phrase[k]) {
          ok = false;
          break;
        }
      }
      if (ok) return phrase;
    }
  }
  return null;
};

const caseWord = (value, keywordCase) => {
  if (!SQLITE_KEYWORDS.has(value.toUpperCase())) return value;
  if (keywordCase === "upper") return value.toUpperCase();
  if (keywordCase === "lower") return value.toLowerCase();
  return value;
};

/**
 * Format SQLite SQL.
 *
 * @param {object} input
 * @param {string} input.sql
 * @param {"upper"|"lower"|"preserve"} [input.keywordCase]
 * @param {number} [input.indentWidth]  Spaces per indent level (1–8).
 * @returns {{formatted:string, statementCount:number, tokenCount:number}|{error:string}}
 */
export function formatSqlite({ sql, keywordCase = "upper", indentWidth = 2 }) {
  if (typeof sql !== "string" || sql.trim() === "") {
    return { error: "Paste some SQL to format." };
  }
  const width = Number(indentWidth);
  if (!Number.isInteger(width) || width < 1 || width > 8) {
    return { error: "Indent width must be a whole number between 1 and 8." };
  }
  const tokenized = tokenizeSql(sql);
  if (tokenized.error) return { error: tokenized.error };
  const { tokens } = tokenized;
  if (tokens.length === 0) return { error: "Paste some SQL to format." };

  const indentUnit = " ".repeat(width);
  const lines = [];
  let line = "";
  let lineIndent = 0;
  let depth = 0;
  let statementCount = 0;
  let sawContent = false;

  const flush = () => {
    if (line.trim() !== "") lines.push(indentUnit.repeat(lineIndent) + line.trim());
    line = "";
  };
  const newline = (indent) => {
    flush();
    lineIndent = indent;
  };

  const needSpace = (prev, token) => {
    if (!prev) return false;
    if (token.value === "," || token.value === ";" || token.value === ")") return false;
    if (prev.value === "(" || token.value === "." || prev.value === ".") return false;
    if (token.value === "(") {
      // count(  users(  — no space after a plain identifier (function/table),
      // but keep the space after keywords: WHERE (a OR b), IN (…), VALUES (…)
      if (prev.type === "ident" || prev.value === ")") return false;
      if (prev.type === "word" && !SQLITE_KEYWORDS.has(prev.value.toUpperCase())) return false;
    }
    return true;
  };

  let prevToken = null;
  let i = 0;
  while (i < tokens.length) {
    const token = tokens[i];

    if (token.type === "comment") {
      newline(depth > 0 ? lineIndent : line.trim() === "" ? lineIndent : 1);
      lines.push(indentUnit.repeat(lineIndent) + token.value);
      prevToken = null;
      i += 1;
      continue;
    }

    if (token.type === "word" && depth === 0) {
      const clause = matchPhrase(tokens, i, CLAUSE_PHRASES);
      if (clause) {
        newline(0);
        line = clause.map((word) => caseWord(word, keywordCase)).join(" ");
        // keyword-cased via caseWord; phrase source is already upper
        if (keywordCase === "lower") line = line.toLowerCase();
        prevToken = tokens[i + clause.length - 1];
        i += clause.length;
        sawContent = true;
        continue;
      }
      const join = matchPhrase(tokens, i, JOIN_PHRASES);
      if (join) {
        newline(0);
        line = join.map((word) => caseWord(word, keywordCase)).join(" ");
        if (keywordCase === "lower") line = line.toLowerCase();
        prevToken = tokens[i + join.length - 1];
        i += join.length;
        continue;
      }
      if (LOGICAL_BREAKERS.has(token.value.toUpperCase()) && line.trim() !== "") {
        newline(1);
        line = caseWord(token.value, keywordCase);
        prevToken = token;
        i += 1;
        continue;
      }
    }

    let text = token.value;
    if (token.type === "word") text = caseWord(text, keywordCase);

    if (text === "(") depth += 1;
    if (text === ")") depth = Math.max(0, depth - 1);

    if (line !== "" && needSpace(prevToken, token)) line += " ";
    line += text;

    if (text === ";") {
      statementCount += 1;
      newline(0);
      lines.push("");
      prevToken = null;
      i += 1;
      continue;
    }

    if (text === "," && depth === 0) {
      newline(1);
      prevToken = null;
      i += 1;
      continue;
    }

    prevToken = token;
    i += 1;
  }
  flush();

  if (!sawContent && statementCount === 0) {
    // e.g. input was only comments/punctuation — still return it formatted
    statementCount = 0;
  }
  if (statementCount === 0) statementCount = 1;

  // drop trailing blank lines
  while (lines.length > 0 && lines[lines.length - 1] === "") lines.pop();

  return {
    formatted: lines.join("\n"),
    statementCount,
    tokenCount: tokens.length,
  };
}
