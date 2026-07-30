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
// Every builder below takes a WIDGET ID, not a tool slug — see the widget-id
// section for the grammar. A bare slug still means a /tools/all tool, so the
// markup produced for the widgets that existed at launch is unchanged.
//
// The visible "Widget by AltFTool" credit is part of every HTML variant. It is
// qualified with `nofollow` because publishers did not editorially place that
// backlink; the attribution remains visible without turning a distributed
// widget into a ranking-link programme.

/** Natural iframe box, in CSS pixels. Consumers may shrink it, not grow it. */
export const EMBED_DEFAULT_WIDTH = 600;
export const EMBED_DEFAULT_HEIGHT = 640;
/** Phones need more height: widget layouts wrap from two columns to one. */
export const EMBED_NARROW_HEIGHT = 760;
/** Breakpoint the responsive wrapper switches height at. */
export const EMBED_NARROW_BREAKPOINT = 640;

// ------------------------------------------------------------- widget ids
//
// A widget is addressed by a WIDGET ID, and the id is also its path under
// /embed/widget/.
//
//   "bmi-calculator"            -> /embed/widget/bmi-calculator
//   "transform/json-to-go"      -> /embed/widget/transform/json-to-go
//   "exam-photo/ssc-cgl"        -> /embed/widget/exam-photo/ssc-cgl
//
// A BARE id is always a /tools/all tool. That form is load-bearing: iframes
// pasted into third-party pages since launch point at /embed/widget/<toolSlug>,
// so the bare shape must keep resolving byte-for-byte. Every family added after
// launch is namespaced instead, which also keeps the two families that share a
// slug distinct — `xml-to-json` is both a /tools/all tool and a /transform
// converter, and they are different widgets.

/**
 * Per-source facts: where the public page lives, and the widget's natural box.
 *
 * The heights are the box each widget's own layout wants at 600px wide, not a
 * measurement of anything: /transform is a two-pane workspace with a stats row,
 * and the exam resizer adds a result panel with a preview image under its form.
 * Consumers may always shrink; these are upper bounds, and `tool` keeps the
 * launch numbers exactly so existing snippets are unchanged.
 */
const SOURCE_META = {
  tool: {
    publicBase: "/tools/all",
    height: EMBED_DEFAULT_HEIGHT,
    narrowHeight: EMBED_NARROW_HEIGHT,
  },
  transform: {
    publicBase: "/transform",
    height: 820,
    narrowHeight: 1040,
  },
  "exam-photo": {
    publicBase: "/exam-photo",
    height: 900,
    narrowHeight: 1080,
  },
};

/** Namespace prefixes, i.e. every source except the bare-slug one. */
const SOURCE_PREFIXES = new Set(Object.keys(SOURCE_META).filter((key) => key !== "tool"));

/** One path segment: ASCII slug, exactly what the app's own routes accept. */
const ID_SEGMENT = /^[a-z0-9][a-z0-9-]*$/;

/**
 * Parse a widget id into `{ source, slug }`, or `null` if it is not one.
 *
 * Strict rather than forgiving: this is the gate that decides what may reach an
 * HTML attribute in a snippet we hand to other sites, so an id that is not
 * exactly `<slug>` or `<knownPrefix>/<slug>` is rejected outright instead of
 * being scrubbed into something that looks valid.
 */
export function parseWidgetId(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) return null;

  const parts = raw.split("/");
  if (parts.length === 1) {
    return ID_SEGMENT.test(parts[0]) ? { source: "tool", slug: parts[0] } : null;
  }
  if (parts.length !== 2) return null;

  const [prefix, slug] = parts;
  if (!SOURCE_PREFIXES.has(prefix)) return null;
  return ID_SEGMENT.test(slug) ? { source: prefix, slug } : null;
}

/** `{ source, slug }` back to its canonical id string. */
export function formatWidgetId({ source, slug } = {}) {
  return source && source !== "tool" ? `${source}/${slug}` : String(slug || "");
}

/**
 * Defensive id normaliser. Callers already resolve ids through the registry,
 * but snippet strings are HTML that ships to third-party pages — an id that
 * does not parse becomes the empty string rather than a partially scrubbed
 * value, so nothing caller-shaped can reach an attribute.
 */
function safeWidgetId(value) {
  const parsed = parseWidgetId(value);
  return parsed ? formatWidgetId(parsed) : "";
}

function metaFor(value) {
  const parsed = parseWidgetId(value);
  return SOURCE_META[parsed?.source || "tool"];
}

/**
 * The widget's natural box. `maxwidth`/`maxheight` hints from an oEmbed
 * consumer are clamped against this, and the snippet builders size from it.
 */
export function embedNaturalSize(id) {
  const meta = metaFor(id);
  return {
    width: EMBED_DEFAULT_WIDTH,
    height: meta.height,
    narrowHeight: meta.narrowHeight,
  };
}

/** Escape a value for use inside a double-quoted HTML attribute. */
function attr(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function safeBase(baseUrl) {
  return String(baseUrl || "").replace(/\/+$/, "");
}

/** Public URL of the iframe document itself — also the paste-to-embed URL. */
export function buildWidgetUrl(baseUrl, id) {
  return `${safeBase(baseUrl)}/embed/widget/${safeWidgetId(id)}`;
}

/** The public page this widget belongs to, untagged. */
export function buildPublicUrl(baseUrl, id) {
  const parsed = parseWidgetId(id);
  const meta = SOURCE_META[parsed?.source || "tool"];
  return `${safeBase(baseUrl)}${meta.publicBase}/${parsed?.slug || ""}`;
}

/** Same page, tagged, for the credit link — so the programme is measurable. */
export function buildAttributionUrl(baseUrl, id) {
  return `${buildPublicUrl(baseUrl, id)}?utm_source=embed&utm_medium=widget`;
}

function iframeTitle(name) {
  return `${String(name || "AltFTool widget")} — free AltFTool widget`;
}

/** Visible, qualified attribution rendered on the publisher's own page. */
function creditLine(baseUrl, slug, { margin = "4px 0 0" } = {}) {
  return `<p style="font-size:12px;margin:${margin}">Widget by <a href="${attr(
    buildAttributionUrl(baseUrl, slug),
  )}" rel="nofollow">AltFTool — free online tools</a></p>`;
}

/**
 * Permission the host page has to delegate for the widget's Copy buttons to
 * work. `clipboard-write` is not in the site's Permissions-Policy header, so it
 * keeps its spec default of `self` — which, inside a third-party iframe, means
 * the async clipboard API is unavailable and every Copy button fails. The
 * widgets do fail visibly rather than silently ("Clipboard access was blocked")
 * and Download still works, but a converter whose Copy button does not copy is
 * a poor advertisement for the tool it is advertising.
 *
 * Snippets already pasted on other sites keep whatever HTML they were pasted
 * with; this only affects newly copied ones.
 */
const IFRAME_ALLOW = 'allow="clipboard-write"';

/**
 * Plain iframe + credit. The default snippet; unchanged for tool widgets since
 * launch, and the only thing a namespaced widget changes is the natural height.
 */
export function buildSnippet(baseUrl, slug, name = "AltFTool widget") {
  return [
    `<iframe src="${attr(buildWidgetUrl(baseUrl, slug))}"`,
    `  title="${attr(iframeTitle(name))}"`,
    `  width="100%" height="${embedNaturalSize(slug).height}" style="border:0;border-radius:12px"`,
    `  loading="lazy" scrolling="yes" referrerpolicy="no-referrer-when-downgrade" ${IFRAME_ALLOW}></iframe>`,
    creditLine(baseUrl, slug),
  ].join("\n");
}

/**
 * Centred, width-capped wrapper that gives the widget more height on phones,
 * where its layout wraps to a single column. Everything is scoped to
 * `.altftool-embed`, so it cannot leak into the host site's own styles.
 */
export function buildResponsiveSnippet(baseUrl, slug, name = "AltFTool widget") {
  const { height, narrowHeight } = embedNaturalSize(slug);
  return [
    `<div class="altftool-embed" style="max-width:680px;margin:0 auto">`,
    `  <iframe src="${attr(buildWidgetUrl(baseUrl, slug))}"`,
    `    title="${attr(iframeTitle(name))}"`,
    `    style="display:block;width:100%;height:${height}px;border:0;border-radius:12px"`,
    `    loading="lazy" scrolling="yes" referrerpolicy="no-referrer-when-downgrade" ${IFRAME_ALLOW}></iframe>`,
    `  ${creditLine(baseUrl, slug)}`,
    `</div>`,
    `<style>@media (max-width:${EMBED_NARROW_BREAKPOINT}px){.altftool-embed iframe{height:${narrowHeight}px}}</style>`,
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
    `  width="100%" height="${embedNaturalSize(slug).height}" style="border:0;border-radius:12px"`,
    `  loading="lazy" scrolling="yes" referrerpolicy="no-referrer-when-downgrade" ${IFRAME_ALLOW}></iframe>`,
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
  {
    name = "AltFTool widget",
    width = EMBED_DEFAULT_WIDTH,
    height = embedNaturalSize(slug).height,
  } = {},
) {
  return [
    `<iframe src="${attr(buildWidgetUrl(baseUrl, slug))}"`,
    ` title="${attr(iframeTitle(name))}"`,
    ` width="${width}" height="${height}"`,
    ` style="border:0;border-radius:12px;max-width:100%"`,
    ` loading="lazy" scrolling="yes" referrerpolicy="no-referrer-when-downgrade" ${IFRAME_ALLOW}></iframe>`,
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
