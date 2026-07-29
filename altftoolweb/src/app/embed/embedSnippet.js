// Pure snippet builders — client-safe (zero imports). The single source of
// truth for every third-party embed snippet: the server registry
// (embedRegistry.js), the client hub picker (EmbedPicker.jsx), the per-tool
// SEO section, and the oEmbed endpoint (/api/oembed) all render from here, so
// the markup a publisher pastes by hand and the markup an oEmbed consumer
// injects automatically are the same markup.
//
// The inline styles inside the snippet strings are intentional: the snippet
// ships to OTHER sites, where AltFTool tokens don't exist.
//
// ⚠️ The "Widget by AltFTool" credit link is the entire deal of the embed
// programme — it is a link to our own property, not a paid or sponsored
// placement, so it MUST stay a normal followable link. Never add
// rel="nofollow" / rel="sponsored" / rel="ugc" to it, and never build a
// variant that drops it.

/** Natural iframe box, in CSS pixels. Consumers may shrink it, not grow it. */
export const EMBED_DEFAULT_WIDTH = 600;
export const EMBED_DEFAULT_HEIGHT = 640;
/** Phones need more height: widget layouts wrap from two columns to one. */
export const EMBED_NARROW_HEIGHT = 760;
/** Breakpoint the responsive wrapper switches height at. */
export const EMBED_NARROW_BREAKPOINT = 640;

/** Escape a value for use inside a double-quoted HTML attribute. */
function attr(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Defensive slug normaliser. Callers already resolve slugs through the
 * registry, but snippet strings are HTML that ships to third-party pages —
 * nothing that is not `[a-z0-9-]` may ever reach an attribute value.
 */
function safeSlug(slug) {
  return String(slug || "")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "");
}

function safeBase(baseUrl) {
  return String(baseUrl || "").replace(/\/+$/, "");
}

/** Public URL of the iframe document itself — also the paste-to-embed URL. */
export function buildWidgetUrl(baseUrl, slug) {
  return `${safeBase(baseUrl)}/embed/widget/${safeSlug(slug)}`;
}

/** Canonical tool URL the credit link points at (tagged so we can measure it). */
export function buildAttributionUrl(baseUrl, slug) {
  return `${safeBase(baseUrl)}/tools/all/${safeSlug(slug)}?utm_source=embed&utm_medium=widget`;
}

function iframeTitle(name) {
  return `${String(name || "AltFTool widget")} — free AltFTool widget`;
}

/** The credit line. Deliberately has no `rel` — see the file header. */
function creditLine(baseUrl, slug, { margin = "4px 0 0" } = {}) {
  return `<p style="font-size:12px;margin:${margin}">Widget by <a href="${attr(
    buildAttributionUrl(baseUrl, slug),
  )}">AltFTool — free online tools</a></p>`;
}

/** Plain iframe + credit. The default snippet, unchanged since launch. */
export function buildSnippet(baseUrl, slug, name = "AltFTool widget") {
  return [
    `<iframe src="${attr(buildWidgetUrl(baseUrl, slug))}"`,
    `  title="${attr(iframeTitle(name))}"`,
    `  width="100%" height="${EMBED_DEFAULT_HEIGHT}" style="border:0;border-radius:12px;overflow:hidden"`,
    `  loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`,
    creditLine(baseUrl, slug),
  ].join("\n");
}

/**
 * Centred, width-capped wrapper that gives the widget more height on phones,
 * where its layout wraps to a single column. Everything is scoped to
 * `.altftool-embed`, so it cannot leak into the host site's own styles.
 */
export function buildResponsiveSnippet(baseUrl, slug, name = "AltFTool widget") {
  return [
    `<div class="altftool-embed" style="max-width:680px;margin:0 auto">`,
    `  <iframe src="${attr(buildWidgetUrl(baseUrl, slug))}"`,
    `    title="${attr(iframeTitle(name))}"`,
    `    style="display:block;width:100%;height:${EMBED_DEFAULT_HEIGHT}px;border:0;border-radius:12px"`,
    `    loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`,
    `  ${creditLine(baseUrl, slug)}`,
    `</div>`,
    `<style>@media (max-width:${EMBED_NARROW_BREAKPOINT}px){.altftool-embed iframe{height:${EMBED_NARROW_HEIGHT}px}}</style>`,
  ].join("\n");
}

/**
 * A real Gutenberg block. Pasting this into the WordPress block editor's
 * "Code editor" view (⋮ → Code editor) produces a Custom HTML block; the
 * comment delimiters are what WordPress parses block markup from.
 */
export function buildWordPressSnippet(baseUrl, slug, name = "AltFTool widget") {
  return [
    `<!-- wp:html -->`,
    `<iframe src="${attr(buildWidgetUrl(baseUrl, slug))}"`,
    `  title="${attr(iframeTitle(name))}"`,
    `  width="100%" height="${EMBED_DEFAULT_HEIGHT}" style="border:0;border-radius:12px;overflow:hidden"`,
    `  loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`,
    creditLine(baseUrl, slug),
    `<!-- /wp:html -->`,
  ].join("\n");
}

/**
 * Single-blob markup for the oEmbed `html` field. Consumers inject this
 * verbatim, so it carries explicit width/height (oEmbed sizes by number) while
 * still capping at the container width.
 */
export function buildOEmbedHtml(
  baseUrl,
  slug,
  { name = "AltFTool widget", width = EMBED_DEFAULT_WIDTH, height = EMBED_DEFAULT_HEIGHT } = {},
) {
  return [
    `<iframe src="${attr(buildWidgetUrl(baseUrl, slug))}"`,
    ` title="${attr(iframeTitle(name))}"`,
    ` width="${width}" height="${height}"`,
    ` style="border:0;border-radius:12px;max-width:100%"`,
    ` loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`,
    creditLine(baseUrl, slug),
  ].join("");
}

/**
 * The copy affordances offered on /embed, in the order a publisher meets them.
 *
 * `help` copy must stay literally true — every claim here has been checked
 * against how the named platform actually behaves. In particular: there is no
 * AltFTool WordPress plugin, and nothing below implies one.
 */
export const EMBED_SNIPPET_VARIANTS = [
  {
    id: "iframe",
    label: "Iframe",
    language: "HTML",
    help: "Works anywhere raw HTML is allowed — Ghost HTML cards, Webflow and Squarespace code blocks, hand-written pages.",
    build: (baseUrl, slug, name) => buildSnippet(baseUrl, slug, name),
  },
  {
    id: "responsive",
    label: "Responsive wrapper",
    language: "HTML",
    help: "Same iframe inside a centred, width-capped wrapper that grows taller under 640px, where the widget wraps to one column.",
    build: (baseUrl, slug, name) => buildResponsiveSnippet(baseUrl, slug, name),
  },
  {
    id: "wordpress",
    label: "WordPress block",
    language: "Block markup",
    help: "Paste into the block editor's Code editor view (⋮ → Code editor) to get a Custom HTML block. Needs a role that may post unfiltered HTML — administrator or editor on self-hosted WordPress. No plugin: there is no AltFTool WordPress plugin, and none is needed.",
    build: (baseUrl, slug, name) => buildWordPressSnippet(baseUrl, slug, name),
  },
  {
    id: "url",
    label: "Paste-to-embed URL",
    language: "URL",
    help: "Paste this on its own line. Editors that run oEmbed discovery — self-hosted WordPress and Ghost among them — expand it into the live widget. Discourse needs an admin to allowlist altftool.com first; Notion and Squarespace take the same URL in their own embed block.",
    build: (baseUrl, slug) => buildWidgetUrl(baseUrl, slug),
  },
];
