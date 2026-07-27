/**
 * JSON flatten / unflatten.
 *
 * Path conventions follow the two styles in common use:
 *  - BRACKET style (lodash get/set): object keys join with ".", array indices are
 *    written as [0] — e.g. users[0].address.city. Unambiguous, because a numeric
 *    object key ("2020": ...) still flattens as .2020 and never as [2020].
 *  - DOT style (the npm "flat" package): every segment joins with "." — e.g.
 *    users.0.address.city. On unflatten a purely numeric segment is rebuilt as an
 *    array index, so an object with the key "0" cannot round-trip in this style.
 *
 * Leaf rule (same as the "flat" package): primitives, empty objects {} and empty
 * arrays [] are leaves — an empty container would otherwise vanish on round-trip.
 *
 * Unflatten conflicts are hard errors, not silent overwrites: "a" = 1 next to
 * "a.b" = 2 cannot both exist in one JSON document.
 */

/** Array indices above this refuse to unflatten — a typo like a[999999999] would allocate gigabytes. */
export const MAX_ARRAY_INDEX = 100000;

export const ARRAY_STYLES = [
  { id: "bracket", label: "Bracket indices — users[0].name" },
  { id: "dot", label: "Dot indices — users.0.name" },
];

export const INDENT_OPTIONS = [
  { id: "2", label: "2 spaces", indent: 2 },
  { id: "4", label: "4 spaces", indent: 4 },
  { id: "min", label: "Minified", indent: 0 },
];

export const DEFAULT_NESTED = `{
  "user": {
    "name": "Ada",
    "address": { "city": "London", "zip": "N1 9GU" },
    "roles": ["admin", "editor"]
  },
  "active": true
}
`;

export const DEFAULT_FLAT = `{
  "user.name": "Ada",
  "user.address.city": "London",
  "user.address.zip": "N1 9GU",
  "user.roles[0]": "admin",
  "user.roles[1]": "editor",
  "active": true
}
`;

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/** A value below which we stop recursing (primitive or empty container). */
function isLeaf(value) {
  if (Array.isArray(value)) return value.length === 0;
  if (isPlainObject(value)) return Object.keys(value).length === 0;
  return true;
}

function joinKey(prefix, key, warnings) {
  if (/[.[\]]/.test(key)) {
    warnings.add(
      `Key "${key}" contains "." or brackets, so the flattened path is ambiguous and may not round-trip.`,
    );
  }
  return prefix === "" ? key : `${prefix}.${key}`;
}

function flattenInto(value, prefix, style, out, warnings) {
  if (isLeaf(value)) {
    // A leaf at the very root (e.g. input "5") keeps an empty-string key.
    out[prefix] = value;
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((entry, index) => {
      const path =
        style === "bracket"
          ? `${prefix}[${index}]`
          : prefix === ""
            ? String(index)
            : `${prefix}.${index}`;
      flattenInto(entry, path, style, out, warnings);
    });
    return;
  }
  for (const [key, entry] of Object.entries(value)) {
    flattenInto(entry, joinKey(prefix, key, warnings), style, out, warnings);
  }
}

/**
 * Flatten nested JSON text into a single-level object of path → leaf value.
 * @returns {object} { json, flat, leaves, depth, warnings } or { error }.
 */
export function flattenJson({ jsonText, arrayStyle = "bracket", indentId = "2" }) {
  const source = String(jsonText ?? "");
  if (source.trim() === "") return { error: "Paste some JSON to flatten." };
  if (!ARRAY_STYLES.some((entry) => entry.id === arrayStyle)) {
    return { error: "Choose an array index style." };
  }
  const option = INDENT_OPTIONS.find((entry) => entry.id === indentId) ?? INDENT_OPTIONS[0];

  let data;
  try {
    data = JSON.parse(source);
  } catch (caught) {
    return { error: `Invalid JSON: ${caught.message}` };
  }
  if (isLeaf(data)) {
    return { error: "The JSON is a single value or empty container — there is nothing to flatten." };
  }

  const warnings = new Set();
  const flat = {};
  flattenInto(data, "", arrayStyle, flat, warnings);

  const depth = Object.keys(flat).reduce((max, key) => {
    const segments = key.split(".").length + (key.match(/\[/g) || []).length;
    return Math.max(max, segments);
  }, 0);

  const json = option.indent === 0 ? JSON.stringify(flat) : JSON.stringify(flat, null, option.indent);
  return {
    json,
    leaves: Object.keys(flat).length,
    depth,
    inputChars: source.length,
    outputChars: json.length,
    warnings: [...warnings],
  };
}

/** Parse "a.b[0].c" (bracket) or "a.b.0.c" (dot) into path segments. */
function parsePath(key, style) {
  const segments = [];
  if (style === "bracket") {
    // Split on dots first, then peel [n] suffixes off each piece.
    for (const piece of key.split(".")) {
      const bracketStart = piece.indexOf("[");
      const head = bracketStart === -1 ? piece : piece.slice(0, bracketStart);
      if (head !== "") segments.push({ key: head, isIndex: false });
      if (bracketStart !== -1) {
        const rest = piece.slice(bracketStart);
        const matches = rest.match(/\[(\d+)\]/g);
        const joined = (matches || []).join("");
        if (joined !== rest || head === "" && bracketStart !== 0) {
          return { error: `Malformed path "${key}" — brackets must look like [0].` };
        }
        for (const match of matches) {
          segments.push({ key: Number(match.slice(1, -1)), isIndex: true });
        }
      }
    }
  } else {
    for (const piece of key.split(".")) {
      if (piece === "") return { error: `Malformed path "${key}" — empty segment.` };
      if (/^\d+$/.test(piece)) segments.push({ key: Number(piece), isIndex: true });
      else segments.push({ key: piece, isIndex: false });
    }
  }
  if (segments.length === 0) return { error: `Malformed path "${key}".` };
  for (const segment of segments) {
    if (segment.isIndex && segment.key > MAX_ARRAY_INDEX) {
      return {
        error: `Path "${key}" uses index ${segment.key}, above the ${MAX_ARRAY_INDEX} limit — that array would be pathologically sparse.`,
      };
    }
  }
  return { segments };
}

/**
 * Rebuild nested JSON from a flat path → value object.
 * @returns {object} { json, keys, filledNulls, warnings } or { error }.
 */
export function unflattenJson({ jsonText, arrayStyle = "bracket", indentId = "2" }) {
  const source = String(jsonText ?? "");
  if (source.trim() === "") return { error: "Paste a flat JSON object to unflatten." };
  if (!ARRAY_STYLES.some((entry) => entry.id === arrayStyle)) {
    return { error: "Choose an array index style." };
  }
  const option = INDENT_OPTIONS.find((entry) => entry.id === indentId) ?? INDENT_OPTIONS[0];

  let flat;
  try {
    flat = JSON.parse(source);
  } catch (caught) {
    return { error: `Invalid JSON: ${caught.message}` };
  }
  if (!isPlainObject(flat)) {
    return { error: "The input must be a JSON object whose keys are flattened paths." };
  }
  const entries = Object.entries(flat);
  if (entries.length === 0) return { error: "The object is empty — nothing to unflatten." };

  // Root container type is decided by the first segment of the first key.
  const first = parsePath(entries[0][0], arrayStyle);
  if (first.error) return { error: first.error };
  const root = first.segments[0].isIndex ? [] : {};

  for (const [key, value] of entries) {
    const parsed = parsePath(key, arrayStyle);
    if (parsed.error) return { error: parsed.error };
    const { segments } = parsed;

    let cursor = root;
    for (let i = 0; i < segments.length; i += 1) {
      const segment = segments[i];
      const container = segment.isIndex ? Array : Object;
      if (Array.isArray(cursor) !== segment.isIndex) {
        return {
          error: `Path conflict at "${key}": one path treats this level as an ${
            Array.isArray(cursor) ? "array" : "object"
          } and another as an ${container === Array ? "array" : "object"}.`,
        };
      }
      const isLast = i === segments.length - 1;
      if (isLast) {
        if (cursor[segment.key] !== undefined) {
          return { error: `Path conflict: "${key}" would overwrite a value another path already set.` };
        }
        cursor[segment.key] = value;
      } else {
        const nextIsIndex = segments[i + 1].isIndex;
        if (cursor[segment.key] === undefined) {
          cursor[segment.key] = nextIsIndex ? [] : {};
        } else if (
          typeof cursor[segment.key] !== "object" ||
          cursor[segment.key] === null ||
          Array.isArray(cursor[segment.key]) !== nextIsIndex
        ) {
          return {
            error: `Path conflict at "${key}": "${String(segment.key)}" is already a ${
              Array.isArray(cursor[segment.key]) ? "array" : typeof cursor[segment.key]
            } from another path.`,
          };
        }
        cursor = cursor[segment.key];
      }
    }
  }

  // JSON has no holes: missing indices in sparse arrays become null, and we count them.
  let filledNulls = 0;
  const fillHoles = (value) => {
    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i += 1) {
        if (value[i] === undefined) {
          value[i] = null;
          filledNulls += 1;
        } else {
          fillHoles(value[i]);
        }
      }
    } else if (isPlainObject(value)) {
      for (const entry of Object.values(value)) fillHoles(entry);
    }
  };
  fillHoles(root);

  const warnings = [];
  if (filledNulls > 0) {
    warnings.push(`${filledNulls} missing array index(es) were filled with null — JSON arrays cannot have holes.`);
  }

  const json = option.indent === 0 ? JSON.stringify(root) : JSON.stringify(root, null, option.indent);
  return {
    json,
    keys: entries.length,
    filledNulls,
    inputChars: source.length,
    outputChars: json.length,
    warnings,
  };
}
