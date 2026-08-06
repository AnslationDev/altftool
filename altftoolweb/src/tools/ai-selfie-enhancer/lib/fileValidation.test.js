import test from "node:test";
import assert from "node:assert/strict";
import {
  ACCEPTED_SELFIE_FILE_TYPES,
  MAX_SELFIE_FILE_BYTES,
  getSelfieFileError,
} from "./fileValidation.js";

test("selfie upload accepts each advertised format at the 5MB boundary", () => {
  for (const type of ACCEPTED_SELFIE_FILE_TYPES) {
    assert.equal(getSelfieFileError({ type, size: MAX_SELFIE_FILE_BYTES }), "");
  }
});

test("selfie upload rejects unadvertised formats and files over 5MB", () => {
  assert.match(
    getSelfieFileError({ type: "image/gif", size: 1024 }),
    /PNG, JPG, or WebP/,
  );
  assert.match(
    getSelfieFileError({ type: "image/jpeg", size: MAX_SELFIE_FILE_BYTES + 1 }),
    /5MB/,
  );
});
