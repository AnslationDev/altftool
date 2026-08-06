import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import JsonLd from "@/platform/seo/JsonLd";
import {
  absoluteUrl,
  createBreadcrumbJsonLd,
  createFaqJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import lostSites, {
  LOST_STATUSES,
  countLostByStatus,
} from "@altftool/core/rabbithole/lost";
import { REVIEWED_ON } from "@altftool/core/rabbithole/taxonomy";
import PageHeader from "../_components/PageHeader";
import SectionHeading from "../_components/SectionHeading";

const description =
  "Websites that were worth listing and are not there any more — what they were, what happened to them, and what to use instead. Link rot, recorded rather than quietly deleted.";

const FAQS = [
  {
    question: "Why keep a page of dead websites?",
    answer:
      "Because deleting them quietly makes a directory look like nothing ever changes. Recording what went missing is the honest version, and it is often the only place left that explains what a site actually did.",
  },
  {
    question: "Can I still see these sites?",
    answer:
      "Sometimes. Where a Wayback Machine snapshot exists we link it, and where somebody has rebuilt or replaced the idea we name that instead. A snapshot of an interactive site rarely works properly, though — archives preserve pages far better than they preserve things you could play with.",
  },
  {
    question: "How do you decide something is really gone?",
    answer:
      "A site that refuses an automated request is not dead — plenty of healthy sites block anything that is not a browser. Nothing lands on this page until the failure has been confirmed more than one way, and anything ambiguous stays out.",
  },
];

export async function generateMetadata() {
  return createPageMetadata({
    title: "Sites we lost — good websites that are gone",
    description,
    path: "/rabbithole/sites-we-lost",
    keywords: [
      "dead websites",
      "websites that shut down",
      "link rot",
      "old internet",
      "what happened to",
    ],
  });
}

export default function SitesWeLostPage() {
  const path = "/rabbithole/sites-we-lost";
  const crumbs = [
    { name: "Rabbithole", path: "/rabbithole" },
    { name: "Sites we lost", path },
  ];

  const counts = countLostByStatus();
  const groups = LOST_STATUSES.map((status) => ({
    status,
    entries: lostSites.filter((entry) => entry.status === status.id),
  })).filter((group) => group.entries.length > 0);

  const pageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${absoluteUrl(path)}#webpage`,
    url: absoluteUrl(path),
    name: "Sites we lost",
    description,
    dateModified: REVIEWED_ON.iso,
    isPartOf: {
      "@type": "CollectionPage",
      "@id": `${absoluteUrl("/rabbithole")}#collection`,
    },
  };

  return (
    <div className="bg-background">
      <JsonLd
        id="rabbithole-sites-we-lost"
        data={[
          createBreadcrumbJsonLd([{ name: "Home", path: "/" }, ...crumbs]),
          pageJsonLd,
          createFaqJsonLd({ path, questions: FAQS }),
        ]}
      />

      <PageHeader
        crumbs={crumbs}
        eyebrow="The graveyard"
        title={
          lostSites.length
            ? `${lostSites.length} sites we lost`
            : "Sites we lost"
        }
        lede={`${description} Checked alongside the rest of the catalog on ${REVIEWED_ON.label}.`}
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        {groups.length === 0 ? (
          <div className="rounded-[var(--anslation-ds-radius-xl)] border border-dashed border-border p-10 text-center">
            <p className="text-base font-medium text-foreground">
              Nothing recorded here yet.
            </p>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Entries land on this page only once a failure has been confirmed
              more than one way. Candidates that simply refused an automated
              request are not listed, because that is not evidence of anything.
            </p>
            <Link
              href="/rabbithole/browse"
              className="mt-5 inline-flex h-10 items-center gap-2 rounded-[var(--anslation-ds-radius-pill)] bg-primary px-4 text-sm font-medium text-primary-foreground"
            >
              Browse what is still alive
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        ) : (
          groups.map(({ status, entries }) => (
            <section key={status.id} className="mb-14 last:mb-0">
              <SectionHeading
                eyebrow={`${counts[status.id]} ${counts[status.id] === 1 ? "site" : "sites"}`}
                title={status.label}
                description={status.note}
              />

              <ul className="divide-y divide-border border-y border-border">
                {entries.map((entry) => (
                  <li key={entry.domain} className="py-5">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <h3 className="text-base font-semibold text-foreground">
                        {entry.name}
                      </h3>
                      <span className="font-mono text-xs text-muted-foreground">
                        {entry.domain}
                      </span>
                      {entry.diedAround ? (
                        <span className="font-mono text-xs text-muted-foreground">
                          · last seen {entry.diedAround}
                        </span>
                      ) : null}
                    </div>

                    <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                      {entry.note}
                    </p>

                    <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
                      {/* A successor may be a live entry in our own catalog or
                          a site elsewhere. Internal ones route rather than
                          opening a tab. */}
                      {entry.successor ? (
                        entry.successor.url.startsWith("/") ? (
                          <Link
                            href={entry.successor.url}
                            className="inline-flex items-center gap-1 font-medium text-primary underline-offset-4 hover:underline"
                          >
                            Try {entry.successor.name} instead
                            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                          </Link>
                        ) : (
                          <a
                            href={entry.successor.url}
                            target="_blank"
                            rel="noopener"
                            className="inline-flex items-center gap-1 font-medium text-primary underline-offset-4 hover:underline"
                          >
                            Try {entry.successor.name} instead
                            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                          </a>
                        )
                      ) : null}
                      {entry.archive ? (
                        <a
                          href={entry.archive}
                          target="_blank"
                          rel="noopener"
                          className="inline-flex items-center gap-1 text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                        >
                          See it in the archive
                          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </a>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}

        <section className="mt-16 border-t border-border pt-10">
          <h2 className="text-lg font-semibold text-foreground">
            Common questions
          </h2>
          <dl className="mt-3 divide-y divide-border border-y border-border">
            {FAQS.map((faq) => (
              <div key={faq.question} className="py-4">
                <dt className="text-sm font-semibold text-foreground">
                  {faq.question}
                </dt>
                <dd className="mt-1.5 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                  {faq.answer}
                </dd>
              </div>
            ))}
          </dl>

          <Link
            href="/rabbithole/how-we-pick"
            className="mt-8 inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            How entries are chosen and removed
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </section>
      </div>
    </div>
  );
}
