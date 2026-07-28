/**
 * SQL WHERE Builder — turn a list of conditions into a valid WHERE clause.
 *
 * Rules implemented (ISO/IEC 9075 SQL plus per-engine deviations):
 *  - String literals are delimited by single quotes and an embedded single
 *    quote is escaped by doubling it ('' ), per SQL:2016 section 5.3.
 *  - MySQL additionally treats backslash as an escape character inside string
 *    literals unless NO_BACKSLASH_ESCAPES is enabled, so backslashes are
 *    doubled for the MySQL dialect only.
 *  - Identifier quoting differs by engine:
 *      MySQL / MariaDB   `name`   (backtick doubled to escape)
 *      PostgreSQL/SQLite "name"   (double quote doubled to escape)
 *      SQL Server        [name]   (] doubled to escape)
 *      Oracle            "name"   (double quote doubled; identifiers fold to
 *                                  upper case when unquoted)
 *  - SQL Server and Oracle have no BOOLEAN literal usable in a predicate, so a
 *    boolean value is emitted as 1 / 0 there and TRUE / FALSE elsewhere.
 *  - NULL is never compared with = ; IS NULL / IS NOT NULL are used instead,
 *    because = NULL evaluates to UNKNOWN in three-valued logic.
 *  - Placeholder style for the parameterised output:
 *      MySQL / SQLite  ?      PostgreSQL  $1,$2      SQL Server  @p1,@p2
 *      Oracle          :1,:2
 */

export const DIALECTS = [
  {
    id: "mysql",
    label: "MySQL / MariaDB",
    quoteOpen: "`",
    quoteClose: "`",
    escapeBackslash: true,
    booleanAsNumber: false,
    placeholder: () => "?",
  },
  {
    id: "postgres",
    label: "PostgreSQL",
    quoteOpen: '"',
    quoteClose: '"',
    escapeBackslash: false,
    booleanAsNumber: false,
    placeholder: (n) => `$${n}`,
  },
  {
    id: "sqlserver",
    label: "SQL Server (T-SQL)",
    quoteOpen: "[",
    quoteClose: "]",
    escapeBackslash: false,
    booleanAsNumber: true,
    placeholder: (n) => `@p${n}`,
  },
  {
    id: "sqlite",
    label: "SQLite",
    quoteOpen: '"',
    quoteClose: '"',
    escapeBackslash: false,
    booleanAsNumber: false,
    placeholder: () => "?",
  },
  {
    id: "oracle",
    label: "Oracle",
    quoteOpen: '"',
    quoteClose: '"',
    escapeBackslash: false,
    booleanAsNumber: true,
    placeholder: (n) => `:${n}`,
  },
];

/** Operators, with how many value inputs each one needs. */
export const OPERATORS = [
  { id: "eq", label: "=", sql: "=", arity: 1 },
  { id: "ne", label: "<>  (not equal)", sql: "<>", arity: 1 },
  { id: "gt", label: ">", sql: ">", arity: 1 },
  { id: "gte", label: ">=", sql: ">=", arity: 1 },
  { id: "lt", label: "<", sql: "<", arity: 1 },
  { id: "lte", label: "<=", sql: "<=", arity: 1 },
  { id: "like", label: "LIKE", sql: "LIKE", arity: 1 },
  { id: "notlike", label: "NOT LIKE", sql: "NOT LIKE", arity: 1 },
  { id: "startswith", label: "starts with", sql: "LIKE", arity: 1, pattern: "prefix" },
  { id: "contains", label: "contains", sql: "LIKE", arity: 1, pattern: "contains" },
  { id: "in", label: "IN (list)", sql: "IN", arity: "list" },
  { id: "notin", label: "NOT IN (list)", sql: "NOT IN", arity: "list" },
  { id: "between", label: "BETWEEN", sql: "BETWEEN", arity: 2 },
  { id: "isnull", label: "IS NULL", sql: "IS NULL", arity: 0 },
  { id: "isnotnull", label: "IS NOT NULL", sql: "IS NOT NULL", arity: 0 },
];

export const VALUE_TYPES = [
  { id: "string", label: "Text" },
  { id: "number", label: "Number" },
  { id: "boolean", label: "Boolean" },
  { id: "date", label: "Date / timestamp" },
  { id: "column", label: "Another column" },
];

export const CONNECTORS = ["AND", "OR"];

/** Unquoted SQL identifiers: letter or underscore, then letters/digits/underscore/$. */
const SAFE_IDENTIFIER = /^[A-Za-z_][A-Za-z0-9_$]*$/;

/**
 * Quote an identifier for a dialect. Dotted names (schema.table.column) are
 * quoted part by part so the dots stay as separators.
 */
export function quoteIdentifier(name, dialect) {
  const d = typeof dialect === "string" ? DIALECTS.find((x) => x.id === dialect) : dialect;
  const spec = d ?? DIALECTS[0];
  return String(name ?? "")
    .split(".")
    .map((part) => {
      const trimmed = part.trim();
      if (trimmed === "") return "";
      const escaped = trimmed.split(spec.quoteClose).join(spec.quoteClose + spec.quoteClose);
      return `${spec.quoteOpen}${escaped}${spec.quoteClose}`;
    })
    .filter((part) => part !== "")
    .join(".");
}

/**
 * Render a value as a SQL literal for a dialect.
 * @returns {string}
 */
export function quoteLiteral(value, type, dialect) {
  const d = typeof dialect === "string" ? DIALECTS.find((x) => x.id === dialect) : dialect;
  const spec = d ?? DIALECTS[0];
  const raw = String(value ?? "");

  if (type === "number") {
    const n = Number(raw.trim());
    if (raw.trim() === "" || !Number.isFinite(n)) return null;
    return String(n);
  }
  if (type === "boolean") {
    const t = raw.trim().toLowerCase();
    const truthy = t === "true" || t === "1" || t === "yes";
    if (spec.booleanAsNumber) return truthy ? "1" : "0";
    return truthy ? "TRUE" : "FALSE";
  }
  if (type === "column") {
    return quoteIdentifier(raw, spec);
  }
  // string and date are both single-quoted character literals
  let escaped = raw.split("'").join("''");
  if (spec.escapeBackslash) escaped = escaped.split("\\").join("\\\\");
  return `'${escaped}'`;
}

/** Split a comma-separated list, honouring quoted items. */
export function splitList(text) {
  return String(text ?? "")
    .split(",")
    .map((item) => item.trim().replace(/^'(.*)'$/s, "$1"))
    .filter((item) => item !== "");
}

function applyPattern(value, patternKind) {
  if (patternKind === "prefix") return `${value}%`;
  if (patternKind === "contains") return `%${value}%`;
  return value;
}

/**
 * Build a WHERE clause from conditions.
 *
 * @param {object} input
 * @param {Array} input.conditions  [{ column, operatorId, valueType, value, value2, connector, negate }]
 * @param {string} [input.dialectId]
 * @param {string} [input.table]     Table name for the sample SELECT.
 * @param {boolean} [input.parameterise] Also produce a placeholder version.
 * @returns {{whereClause: string, sql: string, parameterisedClause: string, params: Array, conditionCount: number}|{error: string}}
 */
export function buildWhereClause({
  conditions,
  dialectId = "mysql",
  table = "users",
  parameterise = true,
}) {
  const spec = DIALECTS.find((d) => d.id === dialectId);
  if (!spec) return { error: "Choose a SQL dialect." };

  const list = Array.isArray(conditions) ? conditions : [];
  const active = list.filter((c) => c && String(c.column ?? "").trim() !== "");
  if (active.length === 0) {
    return { error: "Add at least one condition with a column name." };
  }

  const literalParts = [];
  const paramParts = [];
  const params = [];
  let placeholderIndex = 0;
  const nextPlaceholder = () => {
    placeholderIndex += 1;
    return spec.placeholder(placeholderIndex);
  };

  for (let i = 0; i < active.length; i += 1) {
    const cond = active[i];
    const op = OPERATORS.find((o) => o.id === cond.operatorId) ?? OPERATORS[0];
    const column = quoteIdentifier(cond.column, spec);
    if (column === "") return { error: `Condition ${i + 1} needs a column name.` };

    const type = cond.valueType ?? "string";
    let literal;
    let parameterised;

    if (op.arity === 0) {
      literal = `${column} ${op.sql}`;
      parameterised = literal;
    } else if (op.arity === "list") {
      const items = splitList(cond.value);
      if (items.length === 0) {
        return { error: `Condition ${i + 1} (${op.sql}) needs a comma-separated list of values.` };
      }
      const rendered = items.map((item) => quoteLiteral(item, type, spec));
      if (rendered.some((r) => r === null)) {
        return { error: `Condition ${i + 1} (${op.sql}) has a value that is not a valid number.` };
      }
      literal = `${column} ${op.sql} (${rendered.join(", ")})`;
      parameterised = `${column} ${op.sql} (${items.map(() => nextPlaceholder()).join(", ")})`;
      items.forEach((item) => params.push(type === "number" ? Number(item) : item));
    } else if (op.arity === 2) {
      const lo = quoteLiteral(cond.value, type, spec);
      const hi = quoteLiteral(cond.value2, type, spec);
      if (lo === null || hi === null) {
        return { error: `Condition ${i + 1} (BETWEEN) needs two valid numeric bounds.` };
      }
      if (String(cond.value ?? "").trim() === "" || String(cond.value2 ?? "").trim() === "") {
        return { error: `Condition ${i + 1} (BETWEEN) needs both a lower and an upper value.` };
      }
      literal = `${column} BETWEEN ${lo} AND ${hi}`;
      const a = nextPlaceholder();
      const b = nextPlaceholder();
      parameterised = `${column} BETWEEN ${a} AND ${b}`;
      params.push(type === "number" ? Number(cond.value) : cond.value);
      params.push(type === "number" ? Number(cond.value2) : cond.value2);
    } else {
      const rawValue = String(cond.value ?? "");
      if (rawValue.trim() === "") {
        return { error: `Condition ${i + 1} (${op.label}) needs a value.` };
      }
      const patterned = op.pattern ? applyPattern(rawValue, op.pattern) : rawValue;
      const rendered = quoteLiteral(patterned, type, spec);
      if (rendered === null) {
        return { error: `Condition ${i + 1} has a value that is not a valid number.` };
      }
      literal = `${column} ${op.sql} ${rendered}`;
      if (type === "column") {
        parameterised = literal;
      } else {
        parameterised = `${column} ${op.sql} ${nextPlaceholder()}`;
        params.push(type === "number" ? Number(patterned) : patterned);
      }
    }

    if (cond.negate) {
      literal = `NOT (${literal})`;
      parameterised = `NOT (${parameterised})`;
    }

    if (i > 0) {
      const connector = CONNECTORS.includes(cond.connector) ? cond.connector : "AND";
      literalParts.push(connector);
      paramParts.push(connector);
    }
    literalParts.push(literal);
    paramParts.push(parameterised);
  }

  const mixesConnectors =
    active.slice(1).some((c) => c.connector === "OR") &&
    active.slice(1).some((c) => (c.connector ?? "AND") === "AND");

  const whereClause = literalParts.join(" ");
  const parameterisedClause = paramParts.join(" ");
  const tableName = String(table ?? "").trim() === "" ? "your_table" : table;
  const sql = `SELECT *\nFROM ${quoteIdentifier(tableName, spec)}\nWHERE ${whereClause};`;

  return {
    dialect: spec,
    whereClause,
    parameterisedClause: parameterise ? parameterisedClause : "",
    params,
    sql,
    conditionCount: active.length,
    mixesConnectors,
    note: mixesConnectors
      ? "AND binds tighter than OR in SQL. This clause mixes both, so add parentheses if you meant the OR to apply first."
      : "",
  };
}
