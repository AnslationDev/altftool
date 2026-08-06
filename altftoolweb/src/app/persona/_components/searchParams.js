/*
 * Next hands `searchParams` to a page as a plain object whose values are either
 * a string or an array of strings. `specFromQuery` wants a URLSearchParams, and
 * doing this conversion on the server is what lets a shared character sheet be
 * server-rendered as the right persona instead of flashing the default and then
 * correcting itself on the client.
 */
export function toSearchParams(raw = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(raw || {})) {
    if (Array.isArray(value)) {
      for (const item of value) params.append(key, item);
    } else if (value !== undefined && value !== null) {
      params.set(key, String(value));
    }
  }
  return params;
}
