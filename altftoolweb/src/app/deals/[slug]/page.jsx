// /deals/[slug] — one job, one honest price comparison.
//
// These pages used to be a rewrite of the tool page with a fake rating, a fake
// star histogram, invented review quotes and a "you save $264/yr" badge, and
// they canonicalised to /tools/all/<slug> because they were duplicates. Both
// of those facts are now gone together, which is the only safe way to change
// either: the canonical override is removed AND sitemap.js submits these URLs,
// because the content is no longer a duplicate of the tool page. A page that
// canonicalises away must never be submitted, and a page that is submitted
// must be self-canonical.
//
// The page answers one question — what would I pay for this elsewhere, and
// what exactly do I give up by using the free one — and every price on it is
// dated and linked to the vendor's own page.
//
// Schema policy: BreadcrumbList always, FAQPage only where a hand-written
// question exists. Never Product, Offer or AggregateRating: we do not sell
// these tools and nobody has rated them.

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ScanSearch, TriangleAlert } from "lucide-react";

import Icon from "@/shared/ui/Icon";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createFaqJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { shouldDeferBulkPrerendering } from "@/lib/buildPrerenderPolicy";
import { getRelatedContentForPreset, RelatedContentSection } from "@/platform/linking";
import VendorLink from "@/app/alternatives/components/VendorLink";

import PriceComparisonTable from "../components/PriceComparisonTable";
import {
  getDeal,
  getDealCheckedOn,
  getDealFaqs,
  getDealPaidProducts,
  getDealToolHref,
  getDeals,
  getLeadPaidProduct,
  getRelatedDeals,
} from "../data/deals";
import { getFreeTierPoints, isFreeProduct } from "../data/paidProducts";

export const dynamic = "force-static";
export const revalidate = 86400;

// Deferred on Amplify like every other family — 16 URLs is small, but the
// artifact sits close to the 205 MiB gate and ISR caches these on first hit.
export function generateStaticParams() {
  if (shouldDeferBulkPrerendering()) return [];
  return getDeals().map((deal) => ({ slug: deal.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const deal = getDeal(slug);
  if (!deal) {
    return { title: "Not found | AltFTool", robots: { index: false, follow: true } };
  }

  const lead = getLeadPaidProduct(deal);
  const checkedOn = getDealCheckedOn(deal);
  const allFree = getDealPaidProducts(deal).every(isFreeProduct);

  // The description must not imply a USD figure the vendor never quoted, so a
  // geo-localised price is described rather than stated.
  let priceLine = "The closest alternatives are free too, and this page says so.";
  if (lead && !isFreeProduct(lead)) {
    priceLine =
      lead.price.status === "regional"
        ? `${lead.name} has no USD price we could verify; its storefront served ${lead.price.headline}.`
        : `${lead.name} charges ${lead.price.headline}.`;
  }

  return createPageMetadata({
    title: allFree
      ? `${deal.name}: what the alternatives cost`
      : `${deal.name}: what the paid alternative costs`,
    description: `${deal.job} is free here. ${priceLine} Verified entry prices, free-tier limits, and what the other tools still do better. Checked ${checkedOn}.`,
    path: `/deals/${slug}`,
    canonical: `/deals/${slug}`,
    keywords: [
      `free ${deal.name.toLowerCase()}`,
      ...getDealPaidProducts(deal).map((product) => `${product.name} price`),
      ...getDealPaidProducts(deal).map((product) => `free ${product.name} alternative`),
    ],
  });
}

export default async function DealDetailPage({ params }) {
  const { slug } = await params;
  const deal = getDeal(slug);
  if (!deal) notFound();

  const path = `/deals/${slug}`;
  const products = getDealPaidProducts(deal);
  const faqs = getDealFaqs(deal);
  const related = getRelatedDeals(deal);
  const toolHref = getDealToolHref(deal);
  const checkedOn = getDealCheckedOn(deal);
  const caveats = products.filter((product) => product.price?.caveat);
  // json-editor and color-palette-from-image compare against products with no
  // paid tier at all. The headings must not promise a price that isn't there.
  const allProductsFree = products.length > 0 && products.every(isFreeProduct);

  const moreFromAltftool = getRelatedContentForPreset(
    {
      href: path,
      title: deal.name,
      description: deal.job,
      tags: [deal.category, deal.job, ...products.map((product) => product.name)],
      section: "deals",
    },
    "utility",
    { excludeHrefs: [toolHref] },
  );

  return (
    <main className="bg-(--page) text-(--foreground)">
      <JsonLd
        id={`altf-deal-schema-${slug}`}
        data={[
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Paid tool prices", path: "/deals" },
            { name: deal.name, path },
          ]),
          faqs.length
            ? createFaqJsonLd({
                path,
                questions: faqs.map((faq) => ({ question: faq.q, answer: faq.a })),
              })
            : null,
        ]}
      />

      <div className="mx-auto w-full max-w-[1100px] px-4 py-10 sm:px-5 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-(--muted-foreground)">
          <Link
            href="/deals"
            className="underline underline-offset-2 hover:text-(--primary-text) focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35"
          >
            Paid tool prices
          </Link>
          <span aria-hidden="true"> / </span>
          <span aria-current="page">{deal.name}</span>
        </nav>

        <header className="max-w-3xl">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-12 w-12 flex-none items-center justify-center rounded-[8px] border border-(--border) bg-(--surface)">
              <Icon name={deal.icon ?? "sparkles"} className="h-6 w-6 text-(--primary)" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-(--muted-foreground)">
                {deal.category}
              </p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
                {`${deal.name}: what you'd pay elsewhere`}
              </h1>
            </div>
          </div>
          <p className="mt-5 text-base leading-7 text-(--foreground)">{deal.answer}</p>
          <p className="mt-4 inline-flex items-center gap-2 rounded-[8px] border border-(--border) bg-(--surface) px-3 py-2 text-xs font-semibold text-(--foreground)">
            <ScanSearch className="h-4 w-4 text-(--primary)" aria-hidden="true" />
            Prices checked <time dateTime={checkedOn}>{checkedOn}</time>
          </p>
          <p className="mt-5">
            <Link
              href={toolHref}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-[8px] bg-(--primary) px-5 text-sm font-semibold text-(--primary-foreground) transition hover:bg-(--primary-hover) focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35 motion-reduce:transition-none"
            >
              {`Open the free ${deal.name}`}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </p>
        </header>

        <section aria-labelledby="price-heading" className="mt-12 scroll-mt-24">
          <h2 id="price-heading" className="text-xl font-semibold tracking-tight sm:text-2xl">
            {allProductsFree
              ? `${deal.job} — what the alternatives cost`
              : `${deal.job} — what the paid tools charge`}
          </h2>
          <div className="mt-5">
            <PriceComparisonTable
              toolName={deal.name}
              products={products}
              caption={`Entry prices and free-tier limits for the ${
                allProductsFree ? "other tools" : "paid products"
              } that do this job, each read from the vendor's own pricing page on the date shown. Scroll the table sideways on a narrow screen.`}
            />
          </div>

          {caveats.length ? (
            <ul className="mt-4 grid list-none gap-2 p-0">
              {caveats.map((product) => (
                <li
                  key={product.key}
                  className="flex gap-2.5 rounded-[8px] border border-(--border) bg-(--surface) px-4 py-3 text-sm leading-6 text-(--muted-foreground)"
                >
                  <TriangleAlert
                    className="mt-1 h-4 w-4 flex-none text-(--warning)"
                    aria-hidden="true"
                  />
                  <span>
                    <span className="font-semibold text-(--foreground)">{product.name}: </span>
                    {product.price.caveat}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}

          {/* The new-tab cue is announced once for the whole list rather than
              repeated on each of the source links, which is why these pass
              newTabHint={false}. */}
          <p className="mt-4 text-xs leading-5 text-(--muted-foreground)">
            Sources <span className="sr-only">(each opens in a new tab)</span>:{" "}
            {products.map((product, productIndex) => (
              <span key={product.key}>
                {productIndex > 0 ? " · " : ""}
                {product.name} —{" "}
                {product.sources.map((source, sourceIndex) => (
                  <span key={source}>
                    {sourceIndex > 0 ? ", " : ""}
                    <VendorLink
                      href={source}
                      showIcon={false}
                      newTabHint={false}
                      className="underline underline-offset-2 hover:text-(--primary-text) focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35"
                    >
                      {source.replace(/^https?:\/\//, "")}
                    </VendorLink>
                  </span>
                ))}
              </span>
            ))}
            . Software pricing drifts. If a figure here disagrees with the vendor&apos;s page, trust
            theirs.
          </p>
        </section>

        <section aria-labelledby="free-tier-heading" className="mt-12 scroll-mt-24">
          <h2 id="free-tier-heading" className="text-xl font-semibold tracking-tight sm:text-2xl">
            What each free tier actually allows
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-(--muted-foreground)">
            {allProductsFree
              ? "None of these charges anything, so the only thing worth comparing is where each one stops. Here they are in the vendor's own terms."
              : "Most of these products have a free plan, and whether you need to pay at all depends entirely on where its ceiling sits. Here is each one in the vendor's own terms."}
          </p>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {products.map((product) => (
              <section
                key={product.key}
                aria-label={`${product.name} free tier`}
                className="rounded-[12px] border border-(--border) bg-(--surface) p-4"
              >
                <h3 className="text-sm font-semibold text-(--foreground)">
                  <VendorLink
                    href={product.homepage}
                    className="inline-flex items-start gap-1.5 underline underline-offset-2 hover:text-(--primary-text) focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35"
                  >
                    {product.name}
                  </VendorLink>
                </h3>
                <ul className="mt-3 grid list-none gap-2 p-0">
                  {getFreeTierPoints(product).map((point) => (
                    <li
                      key={point}
                      className="rounded-[8px] bg-(--muted) px-3 py-2 text-sm leading-6 text-(--muted-foreground)"
                    >
                      {point}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </section>

        {/* Never omitted. A comparison that cannot name what the paid product
            does better is an advert, not a comparison. */}
        <section aria-labelledby="better-heading" className="mt-12 scroll-mt-24">
          <h2 id="better-heading" className="text-xl font-semibold tracking-tight sm:text-2xl">
            {allProductsFree
              ? "What the other tools still do better"
              : "What the paid tools still do better"}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-(--muted-foreground)">
            {allProductsFree
              ? "Price is not the reason to choose between these, so here is what each of them does that this tool does not."
              : "Plenty of people should keep paying for these, and these are the reasons why."}
          </p>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {products.map((product) => (
              <section
                key={product.key}
                aria-label={`What ${product.name} does better`}
                className="rounded-[12px] border border-(--border) bg-(--surface) p-4"
              >
                <h3 className="text-sm font-semibold text-(--foreground)">{product.name}</h3>
                <ul className="mt-3 grid list-none gap-2 p-0">
                  {product.notReplaced.map((point) => (
                    <li key={point} className="text-sm leading-6 text-(--muted-foreground)">
                      {point}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <h3 className="mt-8 text-base font-semibold tracking-tight">
            {`And what the free ${deal.name} does not do`}
          </h3>
          <ul className="mt-3 grid list-none gap-2 p-0">
            {deal.limits.map((limit) => (
              <li
                key={limit}
                className="rounded-[8px] border border-(--border) bg-(--surface) px-4 py-3 text-sm leading-6 text-(--muted-foreground)"
              >
                {limit}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="tool-heading" className="mt-12 scroll-mt-24">
          <h2 id="tool-heading" className="text-xl font-semibold tracking-tight sm:text-2xl">
            {`What the free ${deal.name} does`}
          </h2>
          <ul className="mt-4 grid list-none gap-2 p-0 sm:grid-cols-3">
            {deal.does.map((point) => (
              <li
                key={point}
                className="rounded-[12px] border border-(--border) bg-(--surface) p-4 text-sm leading-6 text-(--muted-foreground)"
              >
                {point}
              </li>
            ))}
          </ul>
          <p className="mt-5">
            <Link
              href={toolHref}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-[8px] border border-(--border) bg-(--surface) px-5 text-sm font-semibold text-(--primary-text) transition hover:border-(--primary) focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35 motion-reduce:transition-none"
            >
              {`Open ${deal.name} — it is the real tool, not a demo`}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </p>
        </section>

        {faqs.length ? (
          <section aria-labelledby="faq-heading" className="mt-12 scroll-mt-24">
            <h2 id="faq-heading" className="text-xl font-semibold tracking-tight sm:text-2xl">
              Questions people actually ask
            </h2>
            <dl className="mt-4 grid list-none gap-3 p-0">
              {faqs.map((faq) => (
                <div
                  key={faq.q}
                  className="rounded-[12px] border border-(--border) bg-(--surface) p-4"
                >
                  <dt className="text-sm font-semibold text-(--foreground)">{faq.q}</dt>
                  <dd className="mt-2 text-sm leading-6 text-(--muted-foreground)">{faq.a}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        {related.length ? (
          <section aria-labelledby="related-deals-heading" className="mt-12 scroll-mt-24">
            <h2
              id="related-deals-heading"
              className="text-xl font-semibold tracking-tight sm:text-2xl"
            >
              Other price comparisons
            </h2>
            <ul className="mt-4 grid list-none gap-3 p-0 sm:grid-cols-3">
              {related.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/deals/${item.slug}`}
                    className="group flex h-full flex-col rounded-[12px] border border-(--border) bg-(--surface) p-4 transition hover:-translate-y-0.5 hover:border-(--primary) focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35 motion-reduce:transform-none motion-reduce:transition-none"
                  >
                    <span className="text-sm font-semibold text-(--foreground)">{item.name}</span>
                    <span className="mt-1.5 text-xs leading-5 text-(--muted-foreground)">
                      {item.job}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>

      <RelatedContentSection
        eyebrow="Keep exploring"
        title="More from AltFTool"
        items={moreFromAltftool}
        path={path}
        jsonLdName={`Related to the ${deal.name} price comparison`}
        id={`deals-${slug}-related-heading`}
      />
    </main>
  );
}
