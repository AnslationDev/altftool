import assert from "node:assert/strict";
import test from "node:test";

import { normalizePrivateRecordRows } from "./privateRecordRows.js";

const fields = ["Title", "Notes"];

function ids(...values) {
  let index = 0;
  return () => values[index++] ?? `generated-${index}`;
}

test("rejects null, objects, and malformed array entries", () => {
  for (const value of [null, {}, "records", [null], [[]], ["bad"]]) {
    assert.throws(() => normalizePrivateRecordRows(value, fields, ids("id")));
  }
});

test("normalizes visible fields and regenerates missing or duplicate IDs", () => {
  const rows = normalizePrivateRecordRows(
    [
      { id: "same", Title: "One", Notes: 7, hidden: "drop me" },
      { id: "same", Title: "Two" },
      { Title: "Three" },
    ],
    fields,
    ids("replacement", "generated"),
  );

  assert.deepEqual(rows, [
    { id: "same", Title: "One", Notes: "7" },
    { id: "replacement", Title: "Two", Notes: "" },
    { id: "generated", Title: "Three", Notes: "" },
  ]);
  assert.equal(new Set(rows.map((row) => row.id)).size, rows.length);
});

test("accepts an empty array as an explicit empty replacement", () => {
  assert.deepEqual(normalizePrivateRecordRows([], fields, ids("unused")), []);
});
