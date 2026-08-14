export function isPlainRecord(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

export function normalizePrivateRecordRows(value, fields, createId) {
  if (!Array.isArray(value)) {
    throw new TypeError("Private records must be a JSON array.");
  }
  if (!Array.isArray(fields) || fields.some((field) => typeof field !== "string")) {
    throw new TypeError("Private record fields are invalid.");
  }
  if (typeof createId !== "function") {
    throw new TypeError("A record ID generator is required.");
  }

  const seenIds = new Set();
  return value.map((row, rowIndex) => {
    if (!isPlainRecord(row)) {
      throw new TypeError(`Record ${rowIndex + 1} must be a plain JSON object.`);
    }
    let id = typeof row.id === "string" ? row.id.trim() : "";
    if (!id || seenIds.has(id)) {
      let attempts = 0;
      do {
        id = String(createId()).trim();
        attempts += 1;
      } while ((!id || seenIds.has(id)) && attempts < 100);
      if (!id || seenIds.has(id)) {
        throw new Error("Could not generate a unique record ID.");
      }
    }
    seenIds.add(id);
    return {
      ...Object.fromEntries(
        fields.map((field) => [field, String(row[field] ?? "")]),
      ),
      id,
    };
  });
}
