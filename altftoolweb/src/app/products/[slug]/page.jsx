import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, ArrowRight, HelpCircle, Info, ListChecks, LockKeyhole, ShieldCheck, XCircle } from "lucide-react";
import {
  PRODUCT_SUITE_CATALOG,
  PRODUCT_SUITE_STATUSES,
  getProductSuiteBySlug,
} from "@altftool/core/product-suites";
import JsonLd from "@/platform/seo/JsonLd";
import {
  absoluteUrl,
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createFaqJsonLd,
  createItemListJsonLd,
  createPageMetadata,
  getSiteUrl,
} from "@/platform/seo/generateMetadata";
import { getRelatedContentForPreset, RelatedContentSection } from "@/platform/linking";
import { getSuiteContent, getSuiteCoverage } from "./suiteContent";

const ProductWorkspace = dynamic(() => import("./ProductWorkspace"), {
  loading: () => <WorkspaceSkeleton />,
});

export const dynamicParams = false;

export function generateStaticParams() {
  // Not gated behind shouldDeferBulkPrerendering(): this route sets
  // dynamicParams = false, so returning [] would 404 all 13 suites. The list is
  // bounded by the catalogue and adds no new routes.
  return PRODUCT_SUITE_CATALOG.map((suite) => ({ slug: suite.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const suite = getProductSuiteBySlug(slug);
  if (!suite) return {};
  const content = getSuiteContent(suite.slug);
  return createPageMetadata({
    // The status is in the title because several suites are beta or gated and
    // a searcher deserves to know that before the click, not after it.
    title: `${suite.name} - ${suite.eyebrow}`,
    // A gated product needs enough context to explain why it is unavailable;
    // its first answer sentence alone is too terse to be useful search copy.
    description:
      suite.status === "gated"
        ? suite.description
        : content?.answer
          ? firstSentence(content.answer)
          : suite.description,
    path: `/products/${suite.slug}`,
    keywords: [suite.name, ...suite.capabilities],
  });
}

function firstSentence(value = "") {
  const match = String(value).match(/^[^.]+\./);
  return match ? match[0] : value;
}

function statusLabel(status) {
  return PRODUCT_SUITE_STATUSES[status] || status;
}

/**
 * SoftwareApplication is only emitted for suites whose page renders a working
 * tool. Directory suites get an ItemList of what they link to, and the gated
 * Vault gets neither - publishing an InStock Offer for software that has not
 * shipped would be a false claim, which is exactly the defect this codebase
 * has already had to remove elsewhere.
 */
function createSuiteApplicationJsonLd(suite, content) {
  if (!content || content.kind !== "app") return null;
  const url = absoluteUrl(`/products/${suite.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": ["SoftwareApplication", "WebApplication"],
    "@id": `${url}#software`,
    name: suite.name,
    alternateName: suite.eyebrow,
    description: content.answer,
    url,
    applicationCategory: content.appCategory || "WebApplication",
    operatingSystem: "Web",
    browserRequirements: "Requires a modern web browser with JavaScript enabled",
    featureList: suite.capabilities,
    isAccessibleForFree: true,
    inLanguage: "en",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    publisher: { "@id": `${getSiteUrl()}/#organization` },
    isPartOf: { "@id": `${getSiteUrl()}/#website` },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };
}

export default async function ProductSuitePage({ params }) {
  const { slug } = await params;
  const suite = getProductSuiteBySlug(slug);
  if (!suite) notFound();
  const path = `/products/${suite.slug}`;
  const content = getSuiteContent(suite.slug);
  const coverage = getSuiteCoverage(suite.slug);
  const statusTone = suite.status === "working" ? "success" : suite.status === "beta" ? "info" : "neutral";
  const moreFromAltftool = getRelatedContentForPreset(
    {
      href: path,
      title: suite.name,
      description: suite.description,
      tags: suite.capabilities,
      section: "products",
    },
    "utility",
  );

  // Every row is either a catalogue field or a count derived from one, so the
  // table cannot drift away from the data the page renders.
  const facts = content
    ? [
        ["Status", statusLabel(suite.status)],
        ["Price", "Free, no sign-in required"],
        ["Where the work happens", content.runsOnShort],
        ["What you provide", content.needs],
        ["Data handling", suite.privacy],
        ["Capabilities listed", `${suite.capabilities.length} (${suite.capabilities.join(", ")})`],
        ["Tools linked from this page", String(suite.relatedTools.length)],
      ]
    : [];

  return (
    <>
      <JsonLd
        id={`altf-product-${suite.slug}-schema`}
        data={[
          createCollectionPageJsonLd({
            path,
            name: suite.name,
            description: content?.answer || suite.description,
          }),
          createSuiteApplicationJsonLd(suite, content),
          content?.kind === "directory"
            ? createItemListJsonLd({
                path,
                name: `Tools in ${suite.name}`,
                items: suite.relatedTools.map(([label, href]) => ({ name: label, path: href })),
              })
            : null,
          // FAQPage only where the questions below are actually rendered.
          content?.faqs?.length ? createFaqJsonLd({ path, questions: content.faqs }) : null,
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Products", path: "/products" },
            { name: suite.name, path },
          ]),
        ]}
      />
      <main className="min-h-screen bg-background text-foreground">
        <section className="border-b border-border bg-card">
          <div className="section mx-auto py-10 sm:py-12">
            <Link href="/products" className="inline-flex min-h-11 items-center gap-2 rounded-md text-sm font-semibold text-muted-foreground outline-none transition-colors duration-150 hover:text-primary focus-visible:ring-[3px] focus-visible:ring-primary/35 motion-reduce:transition-none">
              <ArrowLeft className="h-4 w-4" /> All products
            </Link>
            <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex min-h-6 items-center rounded-full border px-2 text-xs font-semibold ${statusTone === "success" ? "border-[var(--anslation-ds-success)] text-[var(--anslation-ds-success)]" : statusTone === "info" ? "border-[var(--anslation-ds-info)] text-[var(--anslation-ds-info)]" : "border-border text-muted-foreground"}`}>{statusLabel(suite.status)}</span>
                  <span className="text-sm font-medium text-primary">{suite.eyebrow}</span>
                </div>
                <h1 className="mt-4 text-3xl font-bold sm:text-4xl">{suite.name}</h1>
                <span className="mt-3 block h-1 w-12 rounded-full bg-gradient-to-r from-primary to-secondary" aria-hidden="true" />
                {/* Answer-first: the first prose after the H1 names the suite,
                    says exactly what it does and states a real limit, so it can
                    be quoted without the rest of the page. */}
                <p className="mt-4 max-w-2xl text-base leading-7 text-foreground">
                  {content?.answer || suite.description}
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {suite.status === "gated" ? <LockKeyhole className="h-5 w-5 text-primary" /> : <ShieldCheck className="h-5 w-5 text-primary" />}
                {suite.privacy}
              </div>
            </div>
          </div>
        </section>

        <section className="section mx-auto py-8 sm:py-10">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_20rem]">
            <ProductWorkspace suite={suite} />
            <aside className="space-y-4">
              <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
                <h2 className="text-base font-semibold">What this workspace covers</h2>
                <ul className="mt-4 space-y-3">
                  {suite.capabilities.map((capability) => (
                    <li key={capability} className="flex gap-2 text-sm text-muted-foreground">
                      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {capability}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
                <h2 className="text-base font-semibold">Focused tools</h2>
                <div className="mt-3 divide-y divide-border">
                  {suite.relatedTools.map(([label, href]) => (
                    <Link key={href} href={href} className="group flex min-h-12 items-center justify-between gap-3 rounded-md py-3 text-sm font-medium outline-none transition-colors duration-150 hover:text-primary focus-visible:ring-[3px] focus-visible:ring-primary/35 motion-reduce:transition-none">
                      {label}<ArrowRight className="h-4 w-4 shrink-0 text-primary transition-transform duration-150 group-hover:translate-x-0.5 motion-reduce:transform-none motion-reduce:transition-none" />
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </section>

        {content ? (
          <section className="section mx-auto pb-10 sm:pb-12" aria-labelledby="suite-details-heading">
            <h2 id="suite-details-heading" className="sr-only">{suite.name} details</h2>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6">
                <h3 className="flex items-center gap-2 text-lg font-semibold">
                  <Info className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                  {suite.name} at a glance
                </h3>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full border-collapse text-left text-sm">
                    <caption className="sr-only">Key facts about {suite.name}</caption>
                    <tbody>
                      {facts.map(([label, value], index) => (
                        <tr key={label} className={index > 0 ? "border-t border-border" : undefined}>
                          <th scope="row" className="w-40 py-3 pr-4 align-top font-semibold text-foreground">{label}</th>
                          <td className="py-3 align-top text-muted-foreground">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">{content.runsOn}</p>
              </div>

              <div className="rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6">
                <h3 className="flex items-center gap-2 text-lg font-semibold">
                  <XCircle className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                  What does {suite.name} not do?
                </h3>
                <ul className="mt-4 space-y-3">
                  {content.limits.map((limit) => (
                    <li key={limit} className="flex gap-3 text-sm leading-6 text-muted-foreground">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                      {limit}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {coverage ? (
              <div className="mt-6 rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6">
                <h3 className="flex items-center gap-2 text-lg font-semibold">
                  <ListChecks className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                  {coverage.heading}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{coverage.intro}</p>
                <ol className="mt-4 grid gap-2 sm:grid-cols-2">
                  {coverage.items.map((item, index) => (
                    <li key={item} className="flex gap-3 rounded-md border border-border bg-background p-3 text-sm leading-6">
                      <span className="font-semibold tabular-nums text-primary">{index + 1}.</span>
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}

            {content.faqs?.length ? (
              <div className="mt-6 rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6">
                <h3 className="flex items-center gap-2 text-lg font-semibold">
                  <HelpCircle className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                  {suite.name} questions and answers
                </h3>
                <dl className="mt-4 divide-y divide-border">
                  {content.faqs.map((faq) => (
                    <div key={faq.question} className="py-4 first:pt-0 last:pb-0">
                      <dt className="text-base font-semibold text-foreground">{faq.question}</dt>
                      <dd className="mt-2 text-sm leading-6 text-muted-foreground">{faq.answer}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null}
          </section>
        ) : null}

        <RelatedContentSection
          title="More from AltFTool"
          items={moreFromAltftool}
          path={path}
          jsonLdName={`More from AltFTool for ${suite.name}`}
        />
      </main>
    </>
  );
}

function WorkspaceSkeleton() {
  return (
    <div className="min-h-96 animate-pulse rounded-lg border border-border bg-card p-5" aria-label="Loading product workspace">
      <div className="h-6 w-48 rounded-md bg-muted" />
      <div className="mt-4 h-24 rounded-md bg-muted" />
      <div className="mt-4 h-10 w-32 rounded-md bg-muted" />
    </div>
  );
}
