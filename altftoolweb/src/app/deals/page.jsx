// /deals — the hub.
//
// This page has one job: be the thing another site can cite. That means real
// numbers, every one of them dated and attributed to the vendor's own page,
// and no number that we made up. There are no ratings, no review counts, no
// "you save $X" badges and no countdown timers on this route any more; none of
// those had a source.
//
// Schema policy: BreadcrumbList + CollectionPage + ItemList only. No Product,
// no Offer and no AggregateRating for our own free tools — we do not sell
// them, nobody has rated them, and a rating we invented would be exactly the
// structured-data spam Google penalises.

import Link from "next/link";
import { ArrowRight, ExternalLink, ScanSearch } from "lucide-react";

import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createFaqJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import RelatedContentSection from "@/platform/linking/RelatedContentSection";
import { getRelatedContentForPreset } from "@/platform/linking/relatedContent";

import SavingsTable from "./components/SavingsTable";
import {
  getCheckedOnRange,
  getComparisonRows,
  getDeals,
  getDealsByCategory,
} from "./data/deals";
import { isFreeProduct } from "./data/paidProducts";

export const dynamic = "force-static";
export const revalidate = 86400;

const HUB_FAQS = [
  {
    q: "Are these prices in USD?",
    a: "Where the vendor served a USD figure, yes, and the table says so. Several vendors — Canva, Coolors, TechSmith, Smallpdf, remove.bg, 123apps — geo-localise their pricing pages and served a non-USD storefront when we checked. Those rows publish the figure in the currency it was actually read in and carry a 'Not a USD price' label. We do not convert currencies, because a converted figure is not a price the vendor quoted.",
  },
  {
    q: "Do the AltFTool tools have a paid tier?",
    a: "No. There is no paid plan, no trial window and no per-file metering on any tool listed here. Ads are what keep them free. That also means there is no support contract, no account and no data-processing agreement — see the limits on each page.",
  },
  {
    q: "Why does the table list products that are already free?",
    a: "Because leaving them out would make the page dishonest. Adobe Color, Zoho Invoice, JSONFormatter and Code Beautify have no paid tier at all, so for those jobs there is nothing to save by switching to us — and you should know that before you switch.",
  },
  {
    q: "How current are these figures?",
    a: "Every row carries the date it was checked, and the vendor's own pricing page is linked. Software pricing drifts, so if a figure here disagrees with the vendor's page, the vendor's page is right and ours is stale.",
  },
];

export async function generateMetadata() {
  const { to } = getCheckedOnRange();
  const count = getComparisonRows().length;
  return createPageMetadata({
    title: "Paid Tool Prices vs Free Alternatives — Checked & Dated",
    description: `What ${count} paid design, PDF, video, data and developer tools charge to start, what their free tiers cap, and the free AltFTool page that covers the same job. Every price dated and sourced, last checked ${to}.`,
    path: "/deals",
    canonical: "/deals",
    keywords: [
      "paid tool prices",
      "free alternatives to paid software",
      "software pricing comparison",
      "free tier limits",
      "free alternative tools",
    ],
  });
}

export default function DealsPage() {
  const rows = getComparisonRows();
  const deals = getDeals();
  const groups = getDealsByCategory();
  const { from, to } = getCheckedOnRange();
  // Counted, never asserted: if a vendor introduces a paid tier and the record
  // is updated, this sentence corrects itself instead of going stale.
  const freeProductCount = rows.filter(({ product }) => isFreeProduct(product)).length;

  const related = getRelatedContentForPreset(
    {
      href: "/deals",
      title: "Paid tool prices vs free alternatives",
      description:
        "What the paid alternative costs, what its free tier caps, and the free AltFTool page that covers the same job.",
      tags: ["pricing", "alternatives", "comparison", "free tools"],
      section: "deals",
    },
    "utility",
  );

  return (
    <main className="bg-(--page) text-(--foreground)">
      <JsonLd
        id="altf-deals-schema"
        data={[
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Paid tool prices vs free alternatives", path: "/deals" },
          ]),
          createCollectionPageJsonLd({
            path: "/deals",
            name: "Paid tool prices vs free alternatives",
            description:
              "Verified entry prices and free-tier limits for the paid tools people buy, each mapped to the free AltFTool page that does the same job.",
          }),
          createItemListJsonLd({
            path: "/deals",
            name: "Free AltFTool pages and the paid products they compare against",
            items: deals.map((deal) => ({ name: deal.name, path: `/deals/${deal.slug}` })),
          }),
          createFaqJsonLd({
            path: "/deals",
            questions: HUB_FAQS.map((faq) => ({ question: faq.q, answer: faq.a })),
          }),
        ]}
      />

      <div className="mx-auto w-full max-w-[1180px] px-4 py-10 sm:px-5 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-(--muted-foreground)">
          <Link
            href="/"
            className="underline underline-offset-2 hover:text-(--primary-text) focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35"
          >
            Home
          </Link>
          <span aria-hidden="true"> / </span>
          <span aria-current="page">Paid tool prices</span>
        </nav>

        <header className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-(--primary-text)">
            Pricing research
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            What the paid alternative costs, and what the free one gives up
          </h1>
          <p className="mt-4 text-base leading-7 text-(--muted-foreground)">
            {`${rows.length} paid products, read off the vendor's own pricing page and dated. For each one: what it charges to start, what its free tier actually caps, and the free AltFTool page that does the same job. ${freeProductCount} of them turn out to have no paid tier at all, so those rows say plainly that there is nothing to save.`}
          </p>
          <p className="mt-4 inline-flex items-center gap-2 rounded-[8px] border border-(--border) bg-(--surface) px-3 py-2 text-xs font-semibold text-(--foreground)">
            <ScanSearch className="h-4 w-4 text-(--primary)" aria-hidden="true" />
            {from === to ? (
              <>
                Prices checked <time dateTime={to}>{to}</time>
              </>
            ) : (
              <>
                Prices checked <time dateTime={from}>{from}</time> to{" "}
                <time dateTime={to}>{to}</time>
              </>
            )}
          </p>
        </header>

        <section aria-labelledby="method-heading" className="mt-10">
          <h2 id="method-heading" className="text-xl font-semibold tracking-tight sm:text-2xl">
            How to read this table
          </h2>
          <ul className="mt-4 grid list-none gap-3 p-0 sm:grid-cols-3">
            <li className="rounded-[12px] border border-(--border) bg-(--surface) p-4 text-sm leading-6 text-(--muted-foreground)">
              <span className="block font-semibold text-(--foreground)">Every price is dated</span>
              Each figure carries the day it was read and links to the vendor&apos;s own page. If a
              vendor has since changed their plans, their page is right and this one is stale.
            </li>
            <li className="rounded-[12px] border border-(--border) bg-(--surface) p-4 text-sm leading-6 text-(--muted-foreground)">
              <span className="block font-semibold text-(--foreground)">
                Currencies are never converted
              </span>
              Several vendors geo-localise pricing. Where a non-USD storefront was served, the
              figure is published as read and labelled &ldquo;Not a USD price&rdquo; rather than
              converted into one we were never quoted.
            </li>
            <li className="rounded-[12px] border border-(--border) bg-(--surface) p-4 text-sm leading-6 text-(--muted-foreground)">
              <span className="block font-semibold text-(--foreground)">
                No savings total is claimed
              </span>
              Adding up subscriptions you were never going to buy is not a saving. There are no
              ratings or review counts on these pages either — nobody has rated these tools, so
              there is nothing to report.
            </li>
          </ul>
        </section>

        <section aria-labelledby="table-heading" className="mt-12">
          <h2 id="table-heading" className="text-xl font-semibold tracking-tight sm:text-2xl">
            Every verified product, its entry price, and the free page that covers the job
          </h2>
          <div className="mt-5">
            <SavingsTable
              rows={rows}
              caption={`Entry prices and free-tier limits for ${rows.length} paid products, each read from the vendor's own pricing page on the date shown, mapped to the free AltFTool page that does the same job. Scroll the table sideways on a narrow screen.`}
            />
          </div>
        </section>

        <section aria-labelledby="jobs-heading" className="mt-12">
          <h2 id="jobs-heading" className="text-xl font-semibold tracking-tight sm:text-2xl">
            {`The ${deals.length} jobs, by category`}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-(--muted-foreground)">
            Each page answers one question: what would this cost elsewhere, and what exactly do you
            give up by using the free one.
          </p>
          <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => (
              <section key={group.category} aria-label={group.category}>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-(--muted-foreground)">
                  {group.category}
                </h3>
                <ul className="mt-3 grid list-none gap-2 p-0">
                  {group.deals.map((deal) => (
                    <li key={deal.slug}>
                      <Link
                        href={`/deals/${deal.slug}`}
                        className="group flex h-full flex-col rounded-[12px] border border-(--border) bg-(--surface) p-4 transition hover:-translate-y-0.5 hover:border-(--primary) focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35 motion-reduce:transform-none motion-reduce:transition-none"
                      >
                        <span className="text-sm font-semibold text-(--foreground)">
                          {deal.name}
                        </span>
                        <span className="mt-1.5 text-xs leading-5 text-(--muted-foreground)">
                          {deal.job}
                        </span>
                        <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-(--primary-text)">
                          See the price comparison
                          <ArrowRight
                            className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 motion-reduce:transform-none motion-reduce:transition-none"
                            aria-hidden="true"
                          />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </section>

        <section aria-labelledby="hub-faq-heading" className="mt-12">
          <h2 id="hub-faq-heading" className="text-xl font-semibold tracking-tight sm:text-2xl">
            Questions about this page
          </h2>
          <dl className="mt-4 grid list-none gap-3 p-0">
            {HUB_FAQS.map((faq) => (
              <div key={faq.q} className="rounded-[12px] border border-(--border) bg-(--surface) p-4">
                <dt className="text-sm font-semibold text-(--foreground)">{faq.q}</dt>
                <dd className="mt-2 text-sm leading-6 text-(--muted-foreground)">{faq.a}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-5 text-sm leading-6 text-(--muted-foreground)">
            Looking for a deeper head-to-head with a specific hosted service?{" "}
            <Link
              href="/alternatives"
              className="inline-flex items-center gap-1.5 font-semibold text-(--primary-text) underline underline-offset-2 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35"
            >
              The alternatives guides
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>{" "}
            cover free-tier limits, upload behaviour and migration paths in full.
          </p>
        </section>
      </div>

      <RelatedContentSection
        eyebrow="Keep exploring"
        title="Related guides and tools"
        items={related}
        path="/deals"
        jsonLdName="Related to the paid tool pricing hub"
        id="deals-hub-related-heading"
      />
    </main>
  );
}
