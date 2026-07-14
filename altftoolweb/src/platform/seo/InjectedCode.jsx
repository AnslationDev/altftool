// Server component: renders admin-authored custom code (raw HTML/scripts) as
// part of the initial SSR HTML. Scripts present in the initial document parse
// execute normally (no client effect needed). `display:contents` keeps the
// wrapper layout-neutral. Inert (renders nothing) when there is no code.

// These slots inject raw HTML/script markup (meta, link, script, noscript,
// pixels). Content with no HTML tag at all is never valid here — it can only be
// a mis-pasted bare value (e.g. a site-verification token dropped into the
// custom-code field instead of the verification field) that would render as
// stray visible text on every page. Treat such non-markup content as inert.
function isRenderableMarkup(html) {
  return (
    typeof html === "string" && html.trim() !== "" && /<[^>]+>/.test(html)
  );
}

export default function InjectedCode({ html, id }) {
  if (!isRenderableMarkup(html)) return null;
  return (
    <div
      data-altft-code={id || "custom"}
      suppressHydrationWarning
      style={{ display: "contents" }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
