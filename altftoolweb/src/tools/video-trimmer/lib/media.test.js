import assert from "node:assert/strict";
import test from "node:test";

import { getVideoMimeType } from "./media.js";

test("stream-copied original containers keep their real MIME type", () => {
  assert.equal(getVideoMimeType("mkv"), "video/x-matroska");
  assert.equal(getVideoMimeType("avi"), "video/x-msvideo");
  assert.equal(getVideoMimeType("m4v"), "video/x-m4v");
  assert.equal(getVideoMimeType("mov"), "video/quicktime");
  assert.equal(getVideoMimeType("webm"), "video/webm");
  assert.equal(getVideoMimeType("mp4"), "video/mp4");
});

test("an unknown container is not mislabeled as MP4", () => {
  assert.equal(getVideoMimeType("unknown"), "application/octet-stream");
});
