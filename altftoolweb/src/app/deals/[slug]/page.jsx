import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  ChevronRight,
  Gem,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

import Icon from "@/shared/ui/Icon";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createFaqJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { shouldDeferBulkPrerendering } from "@/lib/buildPrerenderPolicy";

import DealCard from "../components/DealCard";
import GemRating from "../components/GemRating";
import { UrgencyBadge } from "../components/CountdownTimer";
import {
  getDeal,
  getDealFaqs,
  getDealReviewCount,
  getDealToolHref,
  getDeals,
  getRelatedDeals,
} from "../data/deals";
import "../altf-deals.css";

export const revalidate = 3600;

export function generateStaticParams() {
  if (shouldDeferBulkPrerendering()) return [];
  return getDeals().map((deal) => ({ slug: deal.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const deal = getDeal(slug);
  if (!deal) {
    return { title: "Deal Not Found | AltF Deals", robots: { index: false, follow: true } };
  }
  return createPageMetadata({
    title: `${deal.name} — Free Lifetime Deal | AltF Deals`,
    description: `${deal.tagline}. Normally you'd pay ~$${deal.originalPrice}/yr for a tool like this — on AltF Deals it's 100% free, forever. ${deal.priceNote}.`,
    path: `/deals/${slug}`,
    keywords: [deal.name, ...(deal.alternativeTo || []).map((alt) => `free ${alt} alternative`)],
  });
}

const BUYBOX_TRUST = [
  { icon: Zap, text: "Instant access — no signup" },
  { icon: ShieldCheck, text: "No credit card, ever" },
  { icon: BadgeCheck, text: "All features included" },
  { icon: Gem, text: "Free for life" },
];

const DEAL_TERMS = [
  "Lifetime access to the full tool — this is not a trial",
  "100% off forever: there is no paid tier behind this deal",
  "No signup, license keys, or redemption codes needed",
  "Works in any modern browser on desktop and mobile",
  "New features land for everyone at the same price: free",
];

export default async function DealDetailPage({ params }) {
  const { slug } = await params;
  const deal = getDeal(slug);
  if (!deal) notFound();

  const reviewCount = getDealReviewCount(deal);
  const faqs = getDealFaqs(deal);
  const related = getRelatedDeals(deal);
  const toolHref = getDealToolHref(deal);
  const maxGemCount = Math.max(...Object.values(deal.gems || { 0: 1 }), 1);

  return (
    <>
      <JsonLd
        id={`altf-deal-schema-${slug}`}
        data={[
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "AltF Deals", path: "/deals" },
            { name: deal.name, path: `/deals/${slug}` },
          ]),
          createFaqJsonLd({
            path: `/deals/${slug}`,
            questions: faqs.map((faq) => ({ question: faq.q, answer: faq.a })),
          }),
        ]}
      />
      <main className="altf-deals-page">
        <div className="section pt-8 pb-16">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap items-center gap-1 text-sm text-(--muted-foreground)">
              <li>
                <Link href="/" className="hover:text-(--primary)">Home</Link>
              </li>
              <li aria-hidden="true"><ChevronRight className="h-4 w-4" /></li>
              <li>
                <Link href="/deals" className="hover:text-(--primary)">AltF Deals</Link>
              </li>
              <li aria-hidden="true"><ChevronRight className="h-4 w-4" /></li>
              <li aria-current="page" className="font-semibold text-(--foreground)">{deal.name}</li>
            </ol>
          </nav>

          <div className="afd-detail-grid">
            {/* ---------------- Left column ---------------- */}
            <div className="flex flex-col gap-8">
              <header>
                <div className="flex items-start gap-4">
                  <span className="afd-icon-tile h-16 w-16">
                    <Icon name={deal.icon ?? "sparkles"} className={`h-8 w-8 ${deal.iconColor ?? "text-(--primary)"}`} />
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-3xl font-extrabold text-(--foreground)">{deal.name}</h1>
                      {deal.shelves?.includes("justLaunched") ? (
                        <span className="afd-badge afd-badge-new">Just launched</span>
                      ) : null}
                      {deal.shelves?.includes("endingSoon") ? <UrgencyBadge /> : null}
                    </div>
                    <p className="mt-2 text-lg text-(--muted-foreground)">{deal.tagline}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <GemRating rating={deal.rating} showValue />
                      <span className="text-sm text-(--muted-foreground)">{reviewCount} reviews</span>
                      <span className="afd-pill">{deal.category}</span>
                    </div>
                  </div>
                </div>
              </header>

              <section aria-labelledby="tldr-heading" className="afd-card">
                <div className="afd-card-body">
                  <h2 id="tldr-heading" className="text-sm font-bold uppercase tracking-wider text-(--primary)">
                    TL;DR
                  </h2>
                  <ul className="flex flex-col gap-2.5">
                    {deal.tldr.map((point) => (
                      <li key={point} className="flex items-start gap-2.5 text-sm text-(--foreground)">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-(--primary)" aria-hidden="true" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              <section aria-labelledby="glance-heading" className="afd-card">
                <div className="afd-card-body">
                  <h2 id="glance-heading" className="text-sm font-bold uppercase tracking-wider text-(--muted-foreground)">
                    At-a-glance
                  </h2>
                  <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <dt className="text-xs font-semibold text-(--muted-foreground)">Alternative to</dt>
                      <dd className="mt-1.5 flex flex-wrap gap-1.5">
                        {deal.alternativeTo.map((alt) => (
                          <span key={alt} className="afd-pill">{alt}</span>
                        ))}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold text-(--muted-foreground)">Works with</dt>
                      <dd className="mt-1.5 flex flex-wrap gap-1.5">
                        {deal.worksWith.map((item) => (
                          <span key={item} className="afd-pill">{item}</span>
                        ))}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold text-(--muted-foreground)">Best for</dt>
                      <dd className="mt-1.5 flex flex-wrap gap-1.5">
                        {deal.bestFor.map((item) => (
                          <span key={item} className="afd-pill">{item}</span>
                        ))}
                      </dd>
                    </div>
                  </dl>
                </div>
              </section>

              {deal.overview.map((section) => (
                <section key={section.heading} aria-label={section.heading}>
                  <h2 className="text-xl font-bold text-(--foreground)">{section.heading}</h2>
                  <ul className="mt-3 flex flex-col gap-2.5">
                    {section.points.map((point) => (
                      <li key={point} className="flex items-start gap-2.5 text-sm text-(--muted-foreground)">
                        <Sparkles className="mt-0.5 h-4 w-4 flex-none text-(--secondary,#22d3ee)" aria-hidden="true" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </section>
              ))}

              <section aria-labelledby="plan-heading">
                <h2 id="plan-heading" className="text-xl font-bold text-(--foreground)">
                  One plan. It&apos;s free.
                </h2>
                <p className="mt-1 text-sm text-(--muted-foreground)">
                  What the paid alternatives meter, cap, or watermark — included here at $0.
                </p>
                <div className="afd-plan-table mt-4">
                  <div className="afd-plan-row bg-(--primary)/6">
                    <span className="font-bold text-(--foreground)">Free Forever plan</span>
                    <span className="afd-price-free text-lg">$0</span>
                  </div>
                  <div className="afd-plan-row">
                    <span className="text-(--muted-foreground)">Usage limits</span>
                    <span className="font-semibold text-(--foreground)">Unlimited</span>
                  </div>
                  <div className="afd-plan-row">
                    <span className="text-(--muted-foreground)">Watermarks</span>
                    <span className="font-semibold text-(--foreground)">Never</span>
                  </div>
                  <div className="afd-plan-row">
                    <span className="text-(--muted-foreground)">Account required</span>
                    <span className="font-semibold text-(--foreground)">No</span>
                  </div>
                  <div className="afd-plan-row">
                    <span className="text-(--muted-foreground)">Typical paid alternative</span>
                    <span className="afd-price-original">${deal.originalPrice}/yr</span>
                  </div>
                  <div className="afd-plan-row">
                    <span className="text-(--muted-foreground)">You save</span>
                    <span className="font-bold text-(--primary)">${deal.originalPrice} every year</span>
                  </div>
                </div>
                <p className="mt-2 text-xs text-(--muted-foreground)">{deal.priceNote} — comparison based on typical published pricing.</p>
              </section>

              <section aria-labelledby="terms-heading" className="afd-card">
                <div className="afd-card-body">
                  <h2 id="terms-heading" className="text-sm font-bold uppercase tracking-wider text-(--muted-foreground)">
                    Deal terms
                  </h2>
                  <ul className="flex flex-col gap-2">
                    {DEAL_TERMS.map((term) => (
                      <li key={term} className="flex items-start gap-2.5 text-sm text-(--foreground)">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-(--primary)" aria-hidden="true" />
                        {term}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              <section aria-labelledby="company-heading" className="afd-card">
                <div className="afd-card-body sm:flex-row sm:items-center sm:gap-4">
                  <span className="afd-icon-tile">
                    <Building2 className="h-6 w-6 text-(--primary)" aria-hidden="true" />
                  </span>
                  <div>
                    <h2 id="company-heading" className="text-base font-bold text-(--foreground)">
                      Built by ALTFTool
                    </h2>
                    <p className="mt-1 text-sm text-(--muted-foreground)">
                      {deal.name} is part of the ALTFTool platform — 599+ free browser tools built as
                      alternatives to paid software. No trials, no tiers, no tricks: free tools,
                      maintained and improved continuously.
                    </p>
                    <Link
                      href="/tools/all"
                      className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-(--primary) hover:underline"
                    >
                      Explore the full platform
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </section>

              <section aria-labelledby="reviews-heading">
                <h2 id="reviews-heading" className="text-xl font-bold text-(--foreground)">
                  Questions &amp; reviews
                </h2>

                <div className="afd-card mt-4">
                  <div className="afd-card-body">
                    <p className="text-sm leading-relaxed text-(--foreground)">{deal.aiSummary}</p>
                    <p className="text-xs font-semibold text-(--muted-foreground)">
                      <Sparkles className="mr-1 inline h-3.5 w-3.5 text-(--primary)" aria-hidden="true" />
                      AI-powered summary of user reviews
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
                  <div className="afd-card">
                    <div className="afd-card-body">
                      <p className="text-3xl font-extrabold text-(--foreground)">{deal.rating.toFixed(1)}</p>
                      <GemRating rating={deal.rating} />
                      <p className="text-xs text-(--muted-foreground)">{reviewCount} gem ratings</p>
                      <div className="mt-2 flex flex-col gap-1.5">
                        {[5, 4, 3, 2, 1].map((level) => (
                          <div key={level} className="flex items-center gap-2">
                            <span className="w-12 text-xs text-(--muted-foreground)">{level} gem{level > 1 ? "s" : ""}</span>
                            <div className="afd-gem-bar flex-1">
                              <div
                                className="afd-gem-bar-fill"
                                style={{ width: `${((deal.gems?.[level] || 0) / maxGemCount) * 100}%` }}
                              />
                            </div>
                            <span className="w-8 text-right text-xs text-(--muted-foreground)">{deal.gems?.[level] || 0}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    {deal.reviews.map((review) => (
                      <article key={`${review.author}-${review.title}`} className="afd-card">
                        <div className="afd-card-body">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="afd-badge afd-badge-free">
                                <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
                                Verified user
                              </span>
                              <span className="text-sm font-bold text-(--foreground)">{review.author}</span>
                              <span className="text-xs text-(--muted-foreground)">· {review.role}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <GemRating rating={review.rating} size="h-3.5 w-3.5" />
                              <span className="text-xs text-(--muted-foreground)">{review.date}</span>
                            </div>
                          </div>
                          <h3 className="text-sm font-bold text-(--foreground)">{review.title}</h3>
                          <p className="text-sm leading-relaxed text-(--muted-foreground)">{review.text}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </section>

              <section aria-labelledby="faq-heading">
                <h2 id="faq-heading" className="text-xl font-bold text-(--foreground)">
                  Frequently asked questions
                </h2>
                <div className="mt-4 flex flex-col gap-3">
                  {faqs.map((faq) => (
                    <details key={faq.q} className="afd-card group/faq">
                      <summary className="cursor-pointer list-none px-5 py-4 text-sm font-semibold text-(--foreground) transition-colors hover:text-(--primary) [&::-webkit-details-marker]:hidden">
                        <span className="flex items-center justify-between gap-3">
                          {faq.q}
                          <ChevronRight
                            className="h-4 w-4 flex-none transition-transform group-open/faq:rotate-90"
                            aria-hidden="true"
                          />
                        </span>
                      </summary>
                      <p className="border-t border-(--border) px-5 py-4 text-sm leading-relaxed text-(--muted-foreground)">
                        {faq.a}
                      </p>
                    </details>
                  ))}
                </div>
              </section>
            </div>

            {/* ---------------- Right column: buy box ---------------- */}
            <aside aria-label={`Get ${deal.name}`}>
              <div className="afd-buybox afd-sticky-box">
                <div className="flex items-center justify-between gap-2">
                  <span className="afd-badge afd-badge-free">-100% off</span>
                  <span className="text-xs font-semibold text-(--muted-foreground)">Lifetime deal</span>
                </div>
                <div className="mt-4 flex items-baseline gap-2.5">
                  <span className="afd-price-free text-4xl">FREE</span>
                  <span className="afd-price-original text-lg">${deal.originalPrice}/yr</span>
                </div>
                <p className="mt-1 text-xs text-(--muted-foreground)">{deal.priceNote}</p>

                <a href={toolHref} className="afd-cta mt-5" data-testid="deal-cta">
                  Get deal — open the tool
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
                <Link href="/deals" className="afd-cta-secondary mt-2.5 w-full">
                  Browse more free deals
                </Link>

                <ul className="mt-5 flex flex-col gap-2.5 border-t border-(--border) pt-4">
                  {BUYBOX_TRUST.map((item) => (
                    <li key={item.text} className="flex items-center gap-2.5 text-sm text-(--muted-foreground)">
                      <item.icon className="h-4 w-4 flex-none text-(--primary)" aria-hidden="true" />
                      {item.text}
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>

          {related.length ? (
            <section aria-labelledby="related-heading" className="mt-14">
              <h2 id="related-heading" className="section-title text-left! mb-5">
                You might also like
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {related.map((item) => (
                  <DealCard key={item.slug} deal={item} />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </main>
    </>
  );
}
