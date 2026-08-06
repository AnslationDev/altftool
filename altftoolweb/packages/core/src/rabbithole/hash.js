/**
 * FNV-1a, in its own module so client components can import it without
 * dragging the whole 300-entry catalog into the browser bundle.
 *
 * Used anywhere a page needs a stable pseudo-random choice: featured
 * rotations, generated site marks, shuffle order. A build has to produce
 * identical HTML every time, so Math.random is never an option here.
 */
export function hashString(value = "") {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}
