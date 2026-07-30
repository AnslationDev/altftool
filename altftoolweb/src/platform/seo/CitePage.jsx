// "Cite this page" — the collapsed reference block for the three families whose
// value is verified, dated research: /exam-photo/[exam], /deals/[slug] and
// /alternatives/[incumbent].
//
// WHY THIS EXISTS. A journalist, teacher or blogger citing a figure from one of
// these pages needs four things: the canonical URL, the date the data carries,
// who to credit, and the document the figure was originally read from. When
// those have to be assembled by hand, most writers skip the reference — and a
// citation is a link. So the block hands over APA, MLA and BibTeX ready to copy,
// and nothing else. It is not a call to action, has no share buttons and no
// badge to embed.
//
// WHAT IT NEVER DOES.
//
//   It never dates a page with today. `asOf` is the date on the page's own
//   record (SPECS_READ_ON, or `checkedOn`), passed in by the page. A page whose
//   record carries no date simply has no date row, and APA prints "n.d.".
//
//   It never names an author. There is no writer credited on these pages, so
//   the author and publisher is the organisation and stops there.
//
//   It emits no JSON-LD. A Dataset or ScholarlyArticle node here would describe
//   properties the page does not render, and every structured-data claim on this
//   site has to correspond to visible text.
//
// NOT TO BE CONFUSED WITH src/app/alternatives/components/CitationBlock.jsx,
// which is the /alternatives and /deals *hub* provenance block: one attribution
// line plus the corpus-wide check window. This one is the per-page reference in
// three standard formats. They answer different questions and both are wanted.
//
// Server component. The only thing that reaches the client bundle is the shared
// copy button (src/app/embed/EmbedCodeCopy.jsx), which is already a client
// component elsewhere — the citation strings are built here, on the server, and
// travel to it as plain text.

import { ChevronDown, Quote } from "lucide-react";

import EmbedCodeCopy from "@/app/embed/EmbedCodeCopy";

import { absoluteUrl } from "./generateMetadata";
import {
  CITATION_PUBLISHER,
  buildCitations,
  formatCitationDay,
  parseIsoDate,
} from "./citationFormats";

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35";

const LINK =
  `break-all underline underline-offset-2 hover:text-(--primary-text) ${FOCUS_RING}`;

/** Same rel as every other outbound source link in these families: evidence, not endorsement. */
const SOURCE_LINK_REL = "nofollow noopener";

function shortenUrl(url) {
  return String(url || "").replace(/^https?:\/\//i, "");
}

/**
 * One citation form: the string, and a button that copies it verbatim.
 *
 * @param {{label: string, value: string}} props
 */
function CitationForm({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-(--muted-foreground)">
        {label}
      </p>
      <div className="mt-1.5">
        <EmbedCodeCopy
          snippet={value}
          label={`Copy ${label}`}
          containerClassName="rounded-[8px] border border-(--border) bg-(--muted)"
          preClassName="overflow-x-auto p-3 text-xs leading-6 whitespace-pre-wrap break-words text-(--foreground)"
          dividerClassName="border-t border-(--border) p-2"
          buttonClassName={`inline-flex min-h-[40px] items-center gap-2 rounded-[8px] border border-(--border) bg-(--surface) px-4 text-sm font-semibold text-(--primary-text) transition hover:border-(--primary) motion-reduce:transition-none ${FOCUS_RING}`}
        />
      </div>
    </div>
  );
}

/**
 * @typedef {object} CitePageSource
 * @property {string} title Document name, exactly as the page names it.
 * @property {string[]} [urls] Where it lives. The first is the primary link.
 * @property {string} [issued] ISO date printed on the document itself.
 * @property {string} [checked] ISO date the document was read.
 */

/**
 * @param {object} props
 * @param {string} props.path Site-relative canonical path, e.g. "/deals/bg-remover".
 * @param {string} props.title Page title as it should be cited — pass the same
 *   expression the H1 renders, so the two can never drift apart.
 * @param {string} [props.asOf] ISO date carried by the page's own data. Omit it
 *   when the record has none; never substitute the build date.
 * @param {string} [props.asOfLabel] What that date means on this family, e.g.
 *   "Notification read on" or "Prices checked".
 * @param {CitePageSource[]} [props.sources] Documents the figures were read from.
 * @param {string} [props.sourcesLabel] Row label, used verbatim — pass one that
 *   fits the number of sources the family actually has.
 * @param {React.ReactNode} [props.note] Short caveat, rendered last.
 * @param {string} [props.id] Anchor, so a citing article can link straight here.
 */
export default function CitePage({
  path,
  title,
  asOf = "",
  asOfLabel = "Data as of",
  sources = [],
  sourcesLabel = "Underlying source",
  note,
  id = "cite-this",
}) {
  if (!path || !title) return null;

  const url = absoluteUrl(path);
  const dated = Boolean(parseIsoDate(asOf));
  const citations = buildCitations({ title, url, asOf, asOfLabel, sources });
  const entries = (Array.isArray(sources) ? sources : []).filter(
    (source) => source && source.title,
  );

  return (
    <details
      id={id}
      className="group mt-12 scroll-mt-24 rounded-[12px] border border-(--border) bg-(--surface) p-4 sm:p-5"
    >
      <summary
        className={`flex cursor-pointer list-none items-center gap-2 rounded-[8px] text-(--foreground) [&::-webkit-details-marker]:hidden ${FOCUS_RING}`}
      >
        <Quote className="h-4 w-4 flex-none text-(--primary)" aria-hidden="true" />
        <h2 className="text-base font-semibold tracking-tight">Cite this page</h2>
        <span className="ml-auto text-xs font-medium text-(--muted-foreground)">
          APA, MLA, BibTeX
        </span>
        <ChevronDown
          className="h-4 w-4 flex-none text-(--muted-foreground) transition group-open:rotate-180 motion-reduce:transition-none"
          aria-hidden="true"
        />
      </summary>

      <p className="mt-4 text-sm leading-6 text-(--muted-foreground)">
        {dated
          ? "Quote anything on this page with a credit. The date below is the date this page's data was read, not the date you are reading it — cite it alongside any figure you take from here, because these numbers move."
          : "Quote anything on this page with a credit. Here is the reference, ready to paste."}
      </p>

      <dl className="mt-4 grid gap-x-6 gap-y-1.5 text-sm leading-6 sm:grid-cols-[max-content_1fr]">
        <dt className="font-semibold text-(--foreground)">Canonical URL</dt>
        <dd className="text-(--muted-foreground)">
          <a href={url} className={LINK}>
            {url}
          </a>
        </dd>

        <dt className="font-semibold text-(--foreground)">Author and publisher</dt>
        <dd className="text-(--muted-foreground)">
          {CITATION_PUBLISHER} — no individual author is credited on this page.
        </dd>

        {dated ? (
          <>
            <dt className="font-semibold text-(--foreground)">{asOfLabel}</dt>
            <dd className="text-(--muted-foreground)">
              <time dateTime={asOf}>{formatCitationDay(asOf)}</time>
            </dd>
          </>
        ) : null}

        {entries.length ? (
          <>
            <dt className="font-semibold text-(--foreground)">{sourcesLabel}</dt>
            <dd className="text-(--muted-foreground)">
              <ul className="grid list-none gap-2 p-0">
                {entries.map((source) => {
                  const issuedDay = formatCitationDay(source.issued);
                  const checkedDay =
                    source.checked && source.checked !== asOf
                      ? formatCitationDay(source.checked)
                      : "";
                  const urls = (source.urls || []).filter(Boolean);
                  // The primary document only, which is the one the copied
                  // citation names. A record can carry several supporting pages
                  // — the page lists all of them in full further up, and a
                  // reference block is not the place to repeat that list.
                  const rest = Math.max(urls.length - 1, 0);
                  return (
                    <li key={source.title}>
                      <span className="text-(--foreground)">{source.title}</span>
                      {issuedDay ? (
                        <>
                          {" — issued "}
                          <time dateTime={source.issued}>{issuedDay}</time>
                        </>
                      ) : null}
                      {checkedDay ? (
                        <>
                          {" — read "}
                          <time dateTime={source.checked}>{checkedDay}</time>
                        </>
                      ) : null}
                      {urls.length ? (
                        <span className="mt-0.5 block">
                          <a href={urls[0]} rel={SOURCE_LINK_REL} className={LINK}>
                            {shortenUrl(urls[0])}
                          </a>
                          {rest
                            ? ` (+${rest} more page${rest === 1 ? "" : "s"} from the same source, listed in full above)`
                            : ""}
                        </span>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </dd>
          </>
        ) : null}
      </dl>

      <div className="mt-5 grid gap-3">
        <CitationForm label="APA" value={citations.apa} />
        <CitationForm label="MLA" value={citations.mla} />
        <CitationForm label="BibTeX" value={citations.bibtex} />
      </div>

      {note ? (
        <p className="mt-4 text-xs leading-5 text-(--muted-foreground)">{note}</p>
      ) : null}
    </details>
  );
}
