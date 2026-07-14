// Server component: renders admin-authored custom code (raw HTML/scripts) as
// part of the initial SSR HTML. Scripts present in the initial document parse
// execute normally (no client effect needed). `display:contents` keeps the
// wrapper layout-neutral. Inert (renders nothing) when there is no code.

// These slots inject raw HTML/script markup (meta, link, script, noscript,
// pixels). Any text OUTSIDE the tags — before the first "<" or after the last
// ">" — is never valid here: it is a mis-paste (e.g. a verification token
// dropped in beside a <meta> tag, or on its own) that renders as stray visible
// text on every page. Keep only the markup span and drop the stray edge text;
// script/style bodies are untouched because they live between their own tags.
// Content with no tag at all becomes inert.
export function sanitizeInjectedMarkup(html) {
  if (typeof html !== "string") return "";
  const first = html.indexOf("<");
  const last = html.lastIndexOf(">");
  if (first === -1 || last === -1 || last < first) return "";
  return html.slice(first, last + 1);
}

export default function InjectedCode({ html, id }) {
  const markup = sanitizeInjectedMarkup(html);
  if (!markup.trim()) return null;
  return (
    <div
      data-altft-code={id || "custom"}
      suppressHydrationWarning
      style={{ display: "contents" }}
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
}
