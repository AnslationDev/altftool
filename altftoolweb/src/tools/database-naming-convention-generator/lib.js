/**
 * Database naming convention generator.
 *
 * Identifier length limits are taken from each vendor's documentation:
 *  - PostgreSQL: 63 bytes — NAMEDATALEN (64) minus the terminator
 *    (PostgreSQL docs, "SQL Syntax — Identifiers and Key Words").
 *  - MySQL 8: 64 characters for most identifiers ("Identifier Length Limits").
 *  - SQL Server: 128 characters — the sysname type ("Database Identifiers").
 *  - Oracle 12.2+: 128 bytes (30 bytes before 12.2) ("Database Object Names").
 *  - SQLite: no enforced identifier length limit.
 */

export const DBMS_OPTIONS = [
  { id: "postgres", label: "PostgreSQL", maxIdentifierLength: 63 },
  { id: "mysql", label: "MySQL 8", maxIdentifierLength: 64 },
  { id: "sqlserver", label: "SQL Server", maxIdentifierLength: 128 },
  { id: "oracle", label: "Oracle 12.2+", maxIdentifierLength: 128 },
  { id: "oracle-legacy", label: "Oracle before 12.2", maxIdentifierLength: 30 },
  { id: "sqlite", label: "SQLite", maxIdentifierLength: Infinity },
];

/**
 * Conventional constraint/index prefixes, widely used in the SQL Server and
 * general DBA community (pk/fk/ux/ix/ck/df). PostgreSQL's own default suffixes
 * (_pkey, _key, _idx, _fkey, _check) are offered as the "suffix" style.
 */
export const PREFIX_STYLES = [
  {
    id: "prefix",
    label: "Prefixed (pk_, fk_, ux_, ix_, ck_)",
    pk: (table) => `pk_${table}`,
    fk: (table, refTable) => `fk_${table}_${refTable}`,
    unique: (table, column) => `ux_${table}_${column}`,
    index: (table, column) => `ix_${table}_${column}`,
    check: (table, column) => `ck_${table}_${column}`,
  },
  {
    id: "suffix",
    label: "PostgreSQL default suffixes (_pkey, _fkey, _key, _idx, _check)",
    pk: (table) => `${table}_pkey`,
    fk: (table, refTable) => `${table}_${refTable}_fkey`,
    unique: (table, column) => `${table}_${column}_key`,
    index: (table, column) => `${table}_${column}_idx`,
    check: (table, column) => `${table}_${column}_check`,
  },
];

export const CASE_STYLES = [
  { id: "snake", label: "snake_case (recommended for SQL)" },
  { id: "camel", label: "camelCase" },
  { id: "pascal", label: "PascalCase" },
];

/** Split an input phrase into lowercase words on spaces, -, _ and camel humps. */
export function splitWords(raw) {
  if (typeof raw !== "string") return [];
  return raw
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .split(/[\s_-]+/)
    .map((word) => word.toLowerCase().replace(/[^a-z0-9]/g, ""))
    .filter(Boolean);
}

/** Join words in the chosen case style. */
export function joinWords(words, caseStyle) {
  if (caseStyle === "camel") {
    return words
      .map((word, index) =>
        index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1),
      )
      .join("");
  }
  if (caseStyle === "pascal") {
    return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join("");
  }
  return words.join("_"); // snake
}

/**
 * Basic English pluralisation covering the regular cases:
 * s/x/z/ch/sh -> +es, consonant+y -> ies, otherwise +s.
 */
export function pluralize(word) {
  if (word === "") return word;
  if (/(?:s|x|z|ch|sh)$/.test(word)) return `${word}es`;
  if (/[^aeiou]y$/.test(word)) return `${word.slice(0, -1)}ies`;
  return `${word}s`;
}

const composeName = (parts, caseStyle) =>
  joinWords(
    parts.flatMap((part) => splitWords(part)),
    caseStyle,
  );

/**
 * Generate a full naming convention with worked examples.
 *
 * @param {object} input
 * @param {"snake"|"camel"|"pascal"} input.caseStyle
 * @param {boolean} input.pluralTables       true => customers, false => customer
 * @param {"id"|"table_id"} input.pkColumnStyle  surrogate key column: id vs customer_id
 * @param {"prefix"|"suffix"} input.prefixStyle
 * @param {string} input.dbms                one of DBMS_OPTIONS ids
 * @param {string} input.sampleEntity        e.g. "customer order"
 * @param {string} input.sampleRefEntity     e.g. "customer"
 * @param {string} input.sampleColumn        e.g. "status"
 * @returns {{rules:Array<{object:string,pattern:string,example:string,overLimit:boolean}>, maxLength:number|null, warnings:string[]}|{error:string}}
 */
export function generateNamingConvention({
  caseStyle = "snake",
  pluralTables = true,
  pkColumnStyle = "id",
  prefixStyle = "prefix",
  dbms = "postgres",
  sampleEntity = "customer order",
  sampleRefEntity = "customer",
  sampleColumn = "status",
}) {
  if (!CASE_STYLES.some((style) => style.id === caseStyle)) {
    return { error: "Choose a case style." };
  }
  const dbmsOption = DBMS_OPTIONS.find((option) => option.id === dbms);
  if (!dbmsOption) return { error: "Choose a database system." };
  const style = PREFIX_STYLES.find((option) => option.id === prefixStyle);
  if (!style) return { error: "Choose a constraint naming style." };

  const entityWords = splitWords(sampleEntity);
  if (entityWords.length === 0) {
    return { error: "Enter a sample entity name using letters (for example: customer order)." };
  }
  const refWords = splitWords(sampleRefEntity);
  if (refWords.length === 0) {
    return { error: "Enter a sample referenced entity (for example: customer)." };
  }
  const columnWords = splitWords(sampleColumn);
  if (columnWords.length === 0) {
    return { error: "Enter a sample column name (for example: status)." };
  }

  const tableWords = pluralTables
    ? [...entityWords.slice(0, -1), pluralize(entityWords[entityWords.length - 1])]
    : entityWords;
  const refTableWords = pluralTables
    ? [...refWords.slice(0, -1), pluralize(refWords[refWords.length - 1])]
    : refWords;

  const table = joinWords(tableWords, caseStyle);
  const refTable = joinWords(refTableWords, caseStyle);
  const column = joinWords(columnWords, caseStyle);

  const pkColumn =
    pkColumnStyle === "table_id" ? composeName([sampleEntity, "id"], caseStyle) : joinWords(["id"], caseStyle);
  const fkColumn = composeName([sampleRefEntity, "id"], caseStyle);
  const timestampExample = composeName(["created", "at"], caseStyle);

  const tablePattern = pluralTables ? "<entity, plural>" : "<entity, singular>";

  const rules = [
    { object: "Table", pattern: tablePattern, example: table },
    {
      object: "Primary key column",
      pattern: pkColumnStyle === "table_id" ? "<entity>_id" : "id",
      example: pkColumn,
    },
    { object: "Regular column", pattern: "<descriptive name>", example: column },
    { object: "Timestamp column", pattern: "<verb>_at", example: timestampExample },
    { object: "Foreign key column", pattern: "<referenced entity, singular>_id", example: fkColumn },
    { object: "Primary key constraint", pattern: patternOf(style.pk, "<table>"), example: style.pk(table) },
    {
      object: "Foreign key constraint",
      pattern: patternOf(style.fk, "<table>", "<ref table>"),
      example: style.fk(table, refTable),
    },
    {
      object: "Unique constraint",
      pattern: patternOf(style.unique, "<table>", "<column>"),
      example: style.unique(table, column),
    },
    {
      object: "Index",
      pattern: patternOf(style.index, "<table>", "<column>"),
      example: style.index(table, fkColumn),
    },
    {
      object: "Check constraint",
      pattern: patternOf(style.check, "<table>", "<column>"),
      example: style.check(table, column),
    },
  ].map((rule) => ({
    ...rule,
    overLimit: rule.example.length > dbmsOption.maxIdentifierLength,
  }));

  const warnings = [];
  for (const rule of rules) {
    if (rule.overLimit) {
      warnings.push(
        `${rule.object} example "${rule.example}" is ${rule.example.length} characters — over the ${dbmsOption.label} limit of ${dbmsOption.maxIdentifierLength}.`,
      );
    }
  }
  if (caseStyle !== "snake" && (dbms === "postgres" || dbms === "oracle" || dbms === "oracle-legacy")) {
    warnings.push(
      `${dbmsOption.label} folds unquoted identifiers to ${dbms === "postgres" ? "lower" : "upper"} case, so ${caseStyle === "camel" ? "camelCase" : "PascalCase"} names must be double-quoted everywhere they are used. snake_case avoids this.`,
    );
  }

  return {
    rules,
    maxLength: Number.isFinite(dbmsOption.maxIdentifierLength)
      ? dbmsOption.maxIdentifierLength
      : null,
    dbmsLabel: dbmsOption.label,
    warnings,
  };
}

/** Render a naming function as a documentation pattern string. */
function patternOf(fn, ...placeholders) {
  return fn(...placeholders);
}
