import test from "node:test";
import assert from "node:assert/strict";
import { getFaceDetectionError } from "./faceDetectionState.js";

test("face matching proceeds only when both photos contain a detected face", () => {
  assert.equal(getFaceDetectionError({}, {}), "");
});

test("face matching identifies which photo has no detected face", () => {
  assert.match(getFaceDetectionError(null, {}), /Photo 1/);
  assert.match(getFaceDetectionError({}, null), /Photo 2/);
  assert.match(getFaceDetectionError(null, null), /either photo/);
});
