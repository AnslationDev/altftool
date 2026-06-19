/* In-memory file handoff between homepage hero and tool pages.
   Lives only for the session/tab; never persisted, never uploaded. */

let _files = null;

export function setHandoffFiles(files) {
  _files = files && files.length ? files : null;
}

export function takeHandoffFiles() {
  const f = _files;
  _files = null;
  return f;
}
