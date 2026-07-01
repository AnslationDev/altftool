// Server component: renders admin-authored custom code (raw HTML/scripts) as
// part of the initial SSR HTML. Scripts present in the initial document parse
// execute normally (no client effect needed). `display:contents` keeps the
// wrapper layout-neutral. Inert (renders nothing) when there is no code.

export default function InjectedCode({ html, id }) {
  if (!html || typeof html !== "string" || !html.trim()) return null;
  return (
    <div
      data-altft-code={id || "custom"}
      suppressHydrationWarning
      style={{ display: "contents" }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
