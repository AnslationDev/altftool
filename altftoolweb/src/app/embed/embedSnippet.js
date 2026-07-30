// Pure snippet builder — client-safe (zero imports). The single source of
// truth for the third-party embed snippet, shared by the server registry
// (embedRegistry.js) and the client hub picker (EmbedPicker.jsx).
//
// The inline styles inside the snippet string are intentional: the snippet
// ships to OTHER sites, where AltFTool tokens don't exist.

export const EMBED_IFRAME_HEIGHT = 640;

export function buildSnippet(baseUrl, slug, name = "AltFTool widget") {
  const title = String(name).replace(/"/g, "'");
  return [
    `<iframe src="${baseUrl}/embed/widget/${slug}"`,
    `  title="${title} — free AltFTool widget"`,
    `  width="100%" height="${EMBED_IFRAME_HEIGHT}" style="border:0;border-radius:12px"`,
    `  loading="lazy" scrolling="yes" referrerpolicy="no-referrer-when-downgrade"></iframe>`,
    `<p style="font-size:12px;margin:4px 0 0">Widget by <a href="${baseUrl}/tools/all/${slug}?utm_source=embed&utm_medium=widget">AltFTool — free online tools</a></p>`,
  ].join("\n");
}
