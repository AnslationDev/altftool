const DEFAULT_BREAK_KEYWORDS = [
  "SELECT",
  "FROM",
  "WHERE",
  "GROUP BY",
  "ORDER BY",
  "HAVING",
  "LIMIT",
  "OFFSET",
  "VALUES",
  "SET",
  "JOIN",
  "LEFT JOIN",
  "RIGHT JOIN",
  "INNER JOIN",
  "OUTER JOIN",
  "FULL JOIN",
  "CROSS JOIN",
  "UNION",
  "UNION ALL",
  "INSERT INTO",
  "UPDATE",
  "DELETE FROM",
  "CREATE TABLE",
  "ALTER TABLE",
  "DROP TABLE",
];

const INLINE_KEYWORDS = [
  "AS",
  "AND",
  "OR",
  "ON",
  "IN",
  "IS",
  "NOT",
  "NULL",
  "LIKE",
  "BETWEEN",
  "CASE",
  "WHEN",
  "THEN",
  "ELSE",
  "END",
];

const SAMPLE_SQL = `select u.id, u.email, count(o.id) as orders_count, sum(o.total) as lifetime_value from users u left join orders o on o.user_id = u.id where u.created_at >= '2026-01-01' and u.status = 'active' group by u.id, u.email having count(o.id) > 2 order by lifetime_value desc limit 50;`;

export function getSampleSql() {
  return SAMPLE_SQL;
}

export function formatSql(input, options = {}) {
  const indentSize = options.indentSize || 2;
  const uppercaseKeywords = options.uppercaseKeywords !== false;
  const normalized = normalizeSql(input);
  if (!normalized) return "";

  const protectedSql = protectStringsAndComments(normalized);
  let sql = protectedSql.text;

  sql = applyKeywordCase(sql, uppercaseKeywords);
  sql = normalizeOperators(sql);
  sql = addBreaks(sql);
  sql = sql.replace(/\s*,\s*/g, ",\n");
  sql = sql.replace(/\s*;\s*/g, ";\n");
  sql = sql.replace(/\(\s*/g, "(\n");
  sql = sql.replace(/\s*\)/g, "\n)");

  const lines = sql
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  let indent = 0;
  const formatted = lines.map((line) => {
    const upper = line.toUpperCase();
    if (upper.startsWith(")") || upper.startsWith("END")) indent = Math.max(0, indent - 1);

    const shouldDedent = DEFAULT_BREAK_KEYWORDS.some((keyword) => upper.startsWith(keyword));
    const lineIndent = shouldDedent ? Math.max(0, indent - 1) : indent;
    const output = `${" ".repeat(lineIndent * indentSize)}${line}`;

    if (line.endsWith("(") || upper.startsWith("CASE")) indent += 1;
    if (upper.startsWith("SELECT") || upper.startsWith("FROM") || upper.includes(" JOIN")) indent = Math.max(indent, 1);
    if (line.endsWith(";")) indent = 0;

    return output;
  });

  return restoreProtected(formatted.join("\n"), protectedSql.values).trim();
}

export function compressSql(input) {
  const protectedSql = protectStringsAndComments(input || "");
  const compressed = protectedSql.text
    .replace(/\s+/g, " ")
    .replace(/\s*([(),;=<>+\-*/])\s*/g, "$1")
    .replace(/\s+(AND|OR|ON|AS|FROM|WHERE|GROUP|ORDER|HAVING|LIMIT|JOIN)\s+/gi, " $1 ")
    .trim();

  return restoreProtected(compressed, protectedSql.values);
}

export function escapeSqlString(input) {
  return compressSql(input).replace(/\\/g, "\\\\").replace(/'/g, "''");
}

export function analyzeSql(input) {
  const sql = input || "";
  const statements = sql.split(";").map((statement) => statement.trim()).filter(Boolean).length;
  const keywords = [...DEFAULT_BREAK_KEYWORDS, ...INLINE_KEYWORDS].filter((keyword) =>
    new RegExp(`\\b${keyword.replace(/\s+/g, "\\s+")}\\b`, "i").test(sql)
  );

  return {
    characters: sql.length,
    lines: sql ? sql.split(/\n/).length : 0,
    statements,
    keywords: keywords.length,
  };
}

function normalizeSql(input) {
  return (input || "").replace(/\r\n/g, "\n").replace(/\t/g, " ").replace(/[ ]+/g, " ").trim();
}

function applyKeywordCase(sql, uppercaseKeywords) {
  const allKeywords = [...DEFAULT_BREAK_KEYWORDS, ...INLINE_KEYWORDS].sort((a, b) => b.length - a.length);

  return allKeywords.reduce((current, keyword) => {
    const target = uppercaseKeywords ? keyword : keyword.toLowerCase();
    return current.replace(new RegExp(`\\b${keyword.replace(/\s+/g, "\\s+")}\\b`, "gi"), target);
  }, sql);
}

function addBreaks(sql) {
  return DEFAULT_BREAK_KEYWORDS
    .sort((a, b) => b.length - a.length)
    .reduce((current, keyword) => {
      const pattern = new RegExp(`\\s+(${keyword.replace(/\s+/g, "\\s+")})\\b`, "gi");
      return current.replace(pattern, "\n$1");
    }, sql);
}

function normalizeOperators(sql) {
  return sql
    .replace(/\s*([=<>!]+)\s*/g, " $1 ")
    .replace(/\s+([(),;])/g, "$1")
    .replace(/([(),;])\s+/g, "$1 ");
}

function protectStringsAndComments(input) {
  const values = [];
  const text = input.replace(/'([^']|'')*'|"([^"]|"")*"|`([^`]|``)*`|--.*?$|\/\*[\s\S]*?\*\//gm, (match) => {
    const token = `__SQL_TOKEN_${values.length}__`;
    values.push(match);
    return token;
  });

  return { text, values };
}

function restoreProtected(input, values) {
  return values.reduce((current, value, index) => current.replaceAll(`__SQL_TOKEN_${index}__`, value), input);
}
