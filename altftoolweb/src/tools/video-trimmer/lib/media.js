const VIDEO_MIME_TYPES = Object.freeze({
  avi: "video/x-msvideo",
  m4v: "video/x-m4v",
  mkv: "video/x-matroska",
  mov: "video/quicktime",
  mp4: "video/mp4",
  webm: "video/webm",
});

/** Preserve the actual container type for stream-copied "Original" output. */
export function getVideoMimeType(extension) {
  return VIDEO_MIME_TYPES[String(extension || "").toLowerCase()] || "application/octet-stream";
}
