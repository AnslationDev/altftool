import "server-only";

import {
  getEmbedCanonicalPath,
  getEmbedToolName,
  getOEmbedEndpointUrl,
  isEmbeddable,
} from "../embedRegistry";

/**
 * Metadata for a widget iframe document, identical for every widget family.
 *
 * Two properties are load-bearing and must not drift between families:
 *
 *  - `robots: index false, follow true`. An iframe shell must never compete in
 *    search with the page it embeds; `follow` keeps the outbound links live.
 *  - `alternates.canonical` points at the PUBLIC page, not at this document,
 *    and overrides the root layout's canonical (which points at the homepage).
 *
 * The oEmbed discovery link is advertised only for ids that really are
 * embeddable, so a consumer never finds an endpoint that answers 404. This is
 * the page that has to carry it: the widget URL is what the /embed hub tells
 * publishers to paste, and a consumer (WordPress, Ghost, Discourse) fetches
 * exactly that URL looking for this link before it will expand the paste.
 *
 * @param {string} id widget id — see embedSnippet.js for the grammar
 */
export function buildWidgetMetadata(id) {
  const embeddable = isEmbeddable(id);
  const name = embeddable ? getEmbedToolName(id) : null;
  const title = name ? `${name} — AltFTool widget` : "AltFTool widget";

  return {
    // `absolute` bypasses the layout's "| AltFTool" title template.
    title: { absolute: title },
    robots: { index: false, follow: true },
    ...(embeddable
      ? {
          alternates: {
            canonical: getEmbedCanonicalPath(id),
            types: {
              "application/json+oembed": [
                { url: getOEmbedEndpointUrl(id), title },
              ],
            },
          },
        }
      : {}),
  };
}
