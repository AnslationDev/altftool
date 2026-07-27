/**
 * Enum constraint builder.
 *
 * Takes one list of allowed values and emits every artefact that should agree
 * with it: the LLM prompt rule, a JSON Schema enum (draft 2020-12 keyword
 * semantics — enum comparison is exact and case-sensitive), a TypeScript string
 * union, a Zod enum, a Python typing.Literal, and a SQL CHECK constraint.
 *
 * Pure module — no React, no DOM, no clock.
 */

/** An enum needs at least two members to constrain anything. */
export const MIN_VALUES = 2;

/**
 * Past a few hundred members an enum stops being a classification and becomes a
 * lookup table that belongs in data, not in a schema.
 */
export const MAX_VALUES = 500;

/** Members longer than this suggest sentences are being stuffed into an enum. */
export const LONG_VALUE_CHARS = 60;

/**
 * Identifier rule shared by TypeScript type names, Python names and unquoted SQL
 * column names: letter or underscore first, then letters, digits, underscores.
 */
export const IDENTIFIER_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

const clean = (value) => String(value ?? "").trim();

/** Escape a value for a single-quoted SQL string literal: double every quote (SQL standard). */
export function sqlQuote(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

/**
 * Parse a raw comma- or newline-separated list into ordered distinct values.
 * Keeps first-seen order. Reports duplicates (after trimming, and after case
 * folding when caseInsensitive) so the user sees what was collapsed.
 */
export function parseEnumValues(raw, { caseInsensitive = false } = {}) {
  const entries = String(raw ?? "")
    .split(/[\n,]/)
    .map(clean)
    .filter((entry) => entry.length > 0);

  const seen = new Map();
  const duplicates = [];
  for (const entry of entries) {
    const key = caseInsensitive ? entry.toLowerCase() : entry;
    if (seen.has(key)) {
      duplicates.push(entry);
    } else {
      seen.set(key, entry);
    }
  }
  return { values: Array.from(seen.values()), duplicates, rawCount: entries.length };
}

/**
 * Build every constraint artefact from one list of allowed values.
 *
 * @param {object} input
 * @param {string} input.fieldName        Property / column name, e.g. "status".
 * @param {string} input.rawValues        Comma- or newline-separated allowed values.
 * @param {boolean} [input.caseInsensitive] Collapse values that differ only by case.
 * @param {string} [input.fallback]       Value the model must output when unsure ("" = refuse instead).
 * @param {string} [input.description]    What the field means, for the schema description.
 */
export function buildEnumConstraint({
  fieldName = "",
  rawValues = "",
  caseInsensitive = false,
  fallback = "",
  description = "",
} = {}) {
  const field = clean(fieldName);
  if (!field) return { error: "Enter a field name — every artefact hangs off it." };
  if (!IDENTIFIER_PATTERN.test(field)) {
    return {
      error:
        "Field name must be a plain identifier (letters, digits, underscores, not starting with a digit) so it works in TypeScript, Python and SQL alike.",
    };
  }

  const { values, duplicates, rawCount } = parseEnumValues(rawValues, { caseInsensitive });
  if (rawCount === 0) return { error: "Enter at least two allowed values, separated by commas or new lines." };
  if (values.length < MIN_VALUES) {
    return { error: `An enum needs at least ${MIN_VALUES} distinct values; only ${values.length} remained after de-duplication.` };
  }
  if (values.length > MAX_VALUES) {
    return { error: `${values.length} values is past the ${MAX_VALUES}-member limit — a list that long belongs in a database table, not an enum.` };
  }

  const fallbackValue = clean(fallback);
  const matchesCase = (candidate) =>
    values.some((v) => (caseInsensitive ? v.toLowerCase() === candidate.toLowerCase() : v === candidate));
  if (fallbackValue && !matchesCase(fallbackValue)) {
    return {
      error: `The fallback "${fallbackValue}" is not one of the allowed values — a fallback outside the enum defeats the constraint.`,
    };
  }

  const desc = clean(description);

  // ---- LLM prompt rule -------------------------------------------------------
  const quotedList = values.map((v) => `"${v}"`).join(", ");
  const promptLines = [
    `For the field "${field}", answer with exactly one of the following values and nothing else: ${quotedList}.`,
    "Copy the value verbatim — same spelling, same case, no punctuation, no explanation, no quotes around your answer.",
    fallbackValue
      ? `If none of the values fits or you are unsure, answer "${fallbackValue}".`
      : `If none of the values fits, answer with the single word ERROR so the caller can detect it — do not invent a new value.`,
  ];
  if (desc) promptLines.unshift(`Field meaning: ${desc}`);
  const prompt = promptLines.join("\n");

  // ---- JSON Schema (draft 2020-12: "enum" matches exactly, case-sensitively) --
  const schemaObject = {
    type: "string",
    ...(desc ? { description: desc } : {}),
    enum: values,
  };
  const jsonSchema = JSON.stringify({ [field]: schemaObject }, null, 2);

  // ---- Language artefacts ----------------------------------------------------
  const pascal = field
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
  const tsUnion = `type ${pascal} = ${values.map((v) => JSON.stringify(v)).join(" | ")};`;
  const zodEnum = `const ${field}Schema = z.enum([${values.map((v) => JSON.stringify(v)).join(", ")}]);`;
  const pydantic = `${field}: Literal[${values.map((v) => JSON.stringify(v)).join(", ")}]`;
  const sqlCheck = `CHECK (${field} IN (${values.map(sqlQuote).join(", ")}))`;

  // ---- Warnings --------------------------------------------------------------
  const warnings = [];
  if (duplicates.length > 0) {
    warnings.push(
      `Removed ${duplicates.length} duplicate${duplicates.length === 1 ? "" : "s"}: ${duplicates.map((d) => `"${d}"`).join(", ")}.`
    );
  }
  const caseTwins = new Set();
  const lowerSeen = new Map();
  for (const v of values) {
    const key = v.toLowerCase();
    if (lowerSeen.has(key)) {
      caseTwins.add(`"${lowerSeen.get(key)}" / "${v}"`);
    } else {
      lowerSeen.set(key, v);
    }
  }
  if (!caseInsensitive && caseTwins.size > 0) {
    warnings.push(
      `Values differing only by case survive as separate members (${Array.from(caseTwins).join("; ")}) — JSON Schema enum matching is case-sensitive, so models will trip on this. Enable case-insensitive de-duplication unless the difference is intentional.`
    );
  }
  const longValues = values.filter((v) => v.length > LONG_VALUE_CHARS);
  if (longValues.length > 0) {
    warnings.push(
      `${longValues.length} value${longValues.length === 1 ? " is" : "s are"} longer than ${LONG_VALUE_CHARS} characters — enums should hold labels, not sentences.`
    );
  }
  if (values.some((v) => /\s/.test(v))) {
    warnings.push(
      "Some values contain spaces. That is legal everywhere shown here, but snake_case or kebab-case values are less likely to be paraphrased by a model."
    );
  }
  if (!fallbackValue) {
    warnings.push(
      'No fallback value set — the prompt tells the model to answer ERROR when nothing fits. Consider adding an explicit "unknown" or "other" member instead.'
    );
  }

  return {
    field,
    values,
    count: values.length,
    duplicatesRemoved: duplicates.length,
    fallback: fallbackValue || null,
    prompt,
    jsonSchema,
    tsUnion,
    zodEnum,
    pydantic,
    sqlCheck,
    warnings,
  };
}
