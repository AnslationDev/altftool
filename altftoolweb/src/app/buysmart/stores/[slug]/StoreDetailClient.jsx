"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Globe2,
  HelpCircle,
  Info,
  ShieldCheck,
  Sparkles,
  TicketPercent,
  WalletCards,
} from "lucide-react";
import CouponReveal from "@/app/buysmart/components/CouponReveal";
import OfferFeedback from "@/app/buysmart/components/OfferFeedback";
import TrustSignalBadges from "@/app/buysmart/components/TrustSignalBadges";
import JsonLd from "@/platform/seo/JsonLd";
import {
  fallbackBuySmartCategoryItems,
  useBuySmartAnalytics,
  useBuySmartCategories,
} from "@/app/buysmart/hooks/useBuySmartLiveData";
import ManagedImage from "@/components/ui/ManagedImage";
import { LoadingBone } from "@/components/ui/route-loading";
import {
  getBuySmartBrandSlug,
  getBuySmartQualitySummary,
  getBuySmartStorePath,
  getBuySmartTrustSignals,
  getDomainFromUrl,
  getPrimarySavingsText,
  isExternalMerchantUrl,
  normalizeBuySmartCategory,
  slugifyBuySmartBrand,
  sortBuySmartByTrust,
} from "@altftool/core/buysmart";
import {
  absoluteUrl,
  createBreadcrumbJsonLd,
  createFaqJsonLd,
  createHowToJsonLd,
} from "@/platform/seo/generateMetadata";

const verificationLabels = {
  draft: "Draft",
  pending: "Pending QA",
  verified: "Verified",
  expired: "Expired",
  rejected: "Rejected",
};

function formatDate(value, fallback = "Live now") {
  if (!value) return fallback;

  const date = value?.seconds ? new Date(value.seconds * 1000) : new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getDealScore(offer) {
  let score = 48;
  if (offer.verified) score += 22;
  if (offer.code) score += 8;
  if (offer.exclusive) score += 7;
  if (offer.featured) score += 5;
  if (offer.successRate) score += Math.min(10, Math.round(Number(offer.successRate) / 12));
  if (offer.failedVotes > offer.workingVotes) score -= 12;
  return Math.max(0, Math.min(100, score));
}

function getPathSlug(value) {
  if (!value || typeof value !== "string") return "";
  return value.split("?")[0].split("#")[0].split("/").filter(Boolean).pop() || "";
}

function getOfferSlugCandidates(item) {
  return [
    getBuySmartBrandSlug(item),
    item.storeSlug,
    item.brandSlug,
    item.slug,
    getPathSlug(item.storePath),
    getPathSlug(getBuySmartStorePath(item)),
  ]
    .filter(Boolean)
    .map(slugifyBuySmartBrand);
}

function getStoreFaqs(offer, savings) {
  return [
    {
      question: `How do I use the ${offer.title} BuySmart deal?`,
      answer: offer.code
        ? `Reveal and copy the ${offer.title} code on AltFTool, open the store, then paste the code during checkout before payment.`
        : `Open the ${offer.title} store from AltFTool and confirm the ${savings} saving is visible before completing checkout.`,
    },
    {
      question: `Is the ${offer.title} offer verified?`,
      answer: offer.verified
        ? "AltFTool has a positive verification signal for this offer, but merchant checkout rules can still change."
        : "This offer is pending verification, so confirm terms, region limits, and checkout availability on the merchant site.",
    },
    {
      question: "What should I check before buying?",
      answer:
        "Check the expiry, eligible audience, category, merchant terms, and whether the discount appears before final payment.",
    },
  ];
}

function getHowToSteps(offer) {
  if (offer.code) {
    return [
      `Reveal the ${offer.title} coupon code on AltFTool.`,
      "Copy the code and open the merchant store in a new tab.",
      "Paste the code at checkout and confirm the discount before payment.",
    ];
  }

  return [
    `Open the ${offer.title} store from the BuySmart page.`,
    "Review the listed saving, expiry, audience, and merchant terms.",
    "Confirm the saving appears on the merchant checkout page before payment.",
  ];
}

function createBuySmartOfferJsonLd({ offer, path, savings, domain }) {
  return {
    "@context": "https://schema.org",
    "@type": "Offer",
    "@id": `${absoluteUrl(path)}#offer`,
    name: `${offer.title} ${offer.code ? "coupon code" : "deal"}`,
    description: offer.disc || `${savings} for ${offer.audience?.toLowerCase?.() || "shoppers"}.`,
    url: absoluteUrl(path),
    availability: "https://schema.org/InStock",
    category: offer.category,
    validThrough: offer.expiresAt || undefined,
    seller: {
      "@type": "Organization",
      name: offer.title,
      url: offer.link && offer.link !== "#" ? offer.link : undefined,
    },
    offeredBy: {
      "@type": "Organization",
      name: "AltFTool",
      url: absoluteUrl("/"),
    },
    eligibleCustomerType: offer.audience,
    identifier: offer.code || offer.storeSlug,
    areaServed: "Worldwide",
    image: offer.img || undefined,
    sameAs: domain ? `https://${domain}` : undefined,
  };
}

export default function StoreDetailClient({ slug }) {
  const { counters } = useBuySmartAnalytics();
  const { isFallback, items: offers } = useBuySmartCategories();
  const routeSlug = slugifyBuySmartBrand(slug);

  const normalizedOffers = useMemo(
    () =>
      [...offers, ...fallbackBuySmartCategoryItems]
        .map(normalizeBuySmartCategory)
        .filter(
          (item, index, items) =>
            items.findIndex((candidate) => candidate.storeSlug === item.storeSlug) === index,
        ),
    [offers],
  );

  const offer = useMemo(() => {
    return normalizedOffers.find((item) => getOfferSlugCandidates(item).includes(routeSlug));
  }, [normalizedOffers, routeSlug]);

  const similarOffers = useMemo(() => {
    if (!offer) return [];
    const matches = normalizedOffers
      .filter((item) => getBuySmartBrandSlug(item) !== getBuySmartBrandSlug(offer))
      .filter((item) => item.category === offer.category || item.offerType === offer.offerType)
    return sortBuySmartByTrust(matches, counters).slice(0, 4);
  }, [counters, normalizedOffers, offer]);

  if (isFallback && !offer) {
    return <StoreDetailSkeleton />;
  }

  if (!offer) {
    return (
      <main className="bg-(--background) text-(--foreground)">
        <section className="section">
          <Link
            href="/buysmart"
            className="inline-flex items-center gap-2 text-sm font-semibold text-(--muted-foreground) transition hover:text-(--primary)"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to BuySmart
          </Link>

          <div className="mt-6 rounded-[var(--anslation-ds-radius-lg)] border border-(--border) bg-(--card) p-8 text-center shadow-[var(--anslation-ds-shadow-sm)]">
            <h1 className="text-2xl font-bold">Store not found</h1>
            <p className="mx-auto mt-2 max-w-md text-sm text-(--muted-foreground)">
              This BuySmart store may have moved, expired, or is not published yet.
            </p>
            <Link
              href="/buysmart"
              className="mt-5 inline-flex h-10 items-center justify-center rounded-[var(--anslation-ds-radius)] bg-(--primary) px-4 text-sm font-semibold text-(--primary-foreground)"
            >
              Explore offers
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const savings = getPrimarySavingsText(offer);
  const domain = getDomainFromUrl(offer.link);
  const hasStoreLink = isExternalMerchantUrl(offer.link);
  const verificationLabel = verificationLabels[offer.verificationStatus] || "Pending QA";
  const trustSignals = getBuySmartTrustSignals(offer, counters);
  const dealScore = getDealScore(offer);
  const quality = getBuySmartQualitySummary(offer, normalizedOffers);
  const storePath = getBuySmartStorePath(offer);
  const faqItems = getStoreFaqs(offer, savings);
  const howToSteps = getHowToSteps(offer);
  const checkoutSteps = [
    {
      icon: ShieldCheck,
      title: offer.verified ? "Verification checked" : "Confirm merchant terms",
      text: offer.verified
        ? "AltFTool has a positive verification signal for this offer."
        : "This offer is still pending QA, so confirm it on the merchant checkout page.",
    },
    {
      icon: TicketPercent,
      title: offer.code ? "Copy or reveal the code" : "Open the live deal",
      text: offer.code
        ? "Use the reveal button, copy the code, then apply it at checkout."
        : "Open the store and check that the saving appears before payment.",
    },
    {
      icon: Clock3,
      title: "Check timing",
      text: offer.expiresAt
        ? `This offer expiry is listed as ${formatDate(offer.expiresAt)}.`
        : "No fixed expiry is listed, so treat the offer as live but time-sensitive.",
    },
  ];
  const jsonLd = [
    createBuySmartOfferJsonLd({
      offer: { ...offer, link: hasStoreLink ? offer.link : "" },
      path: storePath,
      savings,
      domain,
    }),
    createBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "BuySmart", path: "/buysmart" },
      { name: "All stores", path: "/buysmart/view-all" },
      { name: offer.title, path: storePath },
    ]),
    createFaqJsonLd({
      path: storePath,
      questions: faqItems,
    }),
    createHowToJsonLd({
      path: storePath,
      name: `How to use the ${offer.title} BuySmart offer`,
      description: `Steps to use the current ${offer.title} BuySmart saving safely.`,
      steps: howToSteps,
    }),
  ];

  return (
    <>
    <JsonLd id="buysmart-store-schema" data={jsonLd} />
    <main className="bg-(--background) pb-20 text-(--foreground) lg:pb-0" data-testid="buysmart-store-detail">
      <section className="section space-y-5">
        <Link
          href="/buysmart"
          className="inline-flex items-center gap-2 text-sm font-semibold text-(--muted-foreground) transition hover:text-(--primary)"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to BuySmart
        </Link>

        <div className="grid gap-5 lg:grid-cols-[1.04fr_0.96fr] lg:items-start">
          <article className="rounded-[var(--anslation-ds-radius-lg)] border border-(--border) bg-(--card) p-5 shadow-[var(--anslation-ds-shadow-sm)] sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="grid h-20 w-20 shrink-0 place-items-center rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--background) p-3">
                {offer.img ? (
                  <ManagedImage
                    src={offer.img}
                    alt={offer.title}
                    className="h-full w-full object-contain"
                    loading="eager"
                    decoding="async"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <TicketPercent className="h-8 w-8 text-(--primary)" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap gap-2">
                  <Chip icon={ShieldCheck} label={verificationLabel} tone={offer.verified ? "strong" : "soft"} />
                  {offer.exclusive ? <Chip icon={Sparkles} label="Exclusive" /> : null}
                  {offer.featured ? <Chip icon={BadgeCheck} label="Featured" /> : null}
                </div>

                <h1 className="mt-4 text-3xl font-bold leading-tight tracking-normal text-(--foreground) sm:text-4xl">
                  {offer.title}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-(--muted-foreground) sm:text-base">
                  {offer.disc || `${savings}${offer.audience ? ` for ${offer.audience.toLowerCase()}` : ""} on BuySmart.`}
                </p>
                <div className="mt-3">
                  <TrustSignalBadges signals={trustSignals} />
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <CouponReveal offer={offer} />
                  {hasStoreLink ? (
                    <a
                      href={offer.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--background) px-4 text-sm font-semibold text-(--foreground) transition hover:border-(--primary)"
                    >
                      Visit store
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Fact icon={TicketPercent} label={offer.code ? "Coupon code" : "Saving"} value={offer.code || savings} />
              <Fact icon={WalletCards} label="Offer type" value={offer.offerType} />
              <Fact icon={Clock3} label="Expires" value={formatDate(offer.expiresAt, "Live now")} />
              <Fact icon={Globe2} label="Store" value={domain || "Merchant"} />
            </div>

            <div className="mt-5 rounded-[var(--anslation-ds-radius-lg)] border border-(--border) bg-(--background) p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-(--muted-foreground)">
                    BuySmart decision score
                  </p>
                  <h2 className="mt-1 text-lg font-bold text-(--foreground)">
                    {dealScore}/100 confidence before checkout
                  </h2>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-(--muted) sm:w-48">
                  <div
                    className="h-full rounded-full bg-(--primary)"
                    style={{ width: `${dealScore}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {checkoutSteps.map(({ icon: Icon, title, text }) => (
                  <div key={title} className="rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card) p-3">
                    <div className="flex items-center gap-2">
                      <span className="grid h-8 w-8 place-items-center rounded-[var(--anslation-ds-radius-xs)] bg-(--muted)">
                        <Icon className="h-4 w-4 text-(--primary)" />
                      </span>
                      <h3 className="text-sm font-bold text-(--foreground)">{title}</h3>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-(--muted-foreground)">
                      {text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </article>

          <aside className="space-y-4">
            <div className="rounded-[var(--anslation-ds-radius-lg)] border border-(--border) bg-(--card) p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase text-(--muted-foreground)">
                    Verification health
                  </p>
                  <h2 className="mt-1 text-lg font-bold">Offer quality</h2>
                </div>
                <ShieldCheck className="h-5 w-5 text-(--primary)" />
              </div>

              <div className="mt-5 grid gap-3">
                <Metric label="Worked rate" value={trustSignals.workedRateLabel} />
                <Metric label="Shoppers used" value={String(trustSignals.shopperUsed || 0)} />
                <Metric label="Working votes" value={String(trustSignals.workingVotes || 0)} />
                <Metric label="Failed votes" value={String(trustSignals.failedVotes || 0)} />
                <Metric label="Last checked" value={formatDate(offer.lastVerifiedAt, "Not checked yet")} />
              </div>

              {offer.reviewNote ? (
                <p className="mt-4 rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--background) p-3 text-sm text-(--muted-foreground)">
                  {offer.reviewNote}
                </p>
              ) : null}

              {quality.issues.length ? (
                <div className="mt-4 rounded-[var(--anslation-ds-radius)] border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  <div className="flex items-center gap-2 font-bold">
                    <Info className="h-4 w-4" />
                    Quality watchlist
                  </div>
                  <ul className="mt-2 space-y-1">
                    {quality.issues.slice(0, 3).map((issue) => (
                      <li key={issue.key}>{issue.label}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>

            <OfferFeedback offer={offer} />

            <div className="rounded-[var(--anslation-ds-radius-lg)] border border-(--border) bg-(--card) p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-(--primary)" />
                <h2 className="text-base font-bold">Terms and audience</h2>
              </div>
              <dl className="mt-4 space-y-3 text-sm">
                <InfoRow label="Audience" value={offer.audience} />
                <InfoRow label="Category" value={offer.category} />
                <InfoRow label="Terms" value={offer.terms || "Merchant terms may apply at checkout."} />
              </dl>
            </div>
          </aside>
        </div>

        {similarOffers.length ? (
          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-bold">Similar BuySmart offers</h2>
              <p className="mt-1 text-sm text-(--muted-foreground)">
                More verified options from the same category or offer type.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {similarOffers.map((item) => (
                <SimilarOfferCard key={`${item.id || item.title}-${item.storePath}`} offer={item} counters={counters} />
              ))}
            </div>
          </section>
        ) : null}

        <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[var(--anslation-ds-radius-lg)] border border-(--border) bg-(--card) p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-(--primary)" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-(--muted-foreground)">
                  How to use
                </p>
                <h2 className="mt-1 text-xl font-bold">
                  Use this offer safely
                </h2>
              </div>
            </div>
            <ol className="mt-5 space-y-3">
              {howToSteps.map((step, index) => (
                <li key={step} className="flex gap-3 rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--background) p-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-(--primary) text-xs font-bold text-(--primary-foreground)">
                    {index + 1}
                  </span>
                  <span className="text-sm leading-6 text-(--muted-foreground)">
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-[var(--anslation-ds-radius-lg)] border border-(--border) bg-(--card) p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-(--primary)" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-(--muted-foreground)">
                  FAQ
                </p>
                <h2 className="mt-1 text-xl font-bold">
                  Quick answers
                </h2>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {faqItems.map((item) => (
                <details
                  key={item.question}
                  className="rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--background) p-3"
                >
                  <summary className="cursor-pointer text-sm font-bold text-(--foreground)">
                    {item.question}
                  </summary>
                  <p className="mt-2 text-sm leading-6 text-(--muted-foreground)">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </section>
      <MobileStoreActionBar offer={offer} />
    </main>
    </>
  );
}

function Chip({ icon: Icon, label, tone = "soft" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${
        tone === "strong"
          ? "border-(--primary) bg-(--primary) text-(--primary-foreground)"
          : "border-(--border) bg-(--muted) text-(--muted-foreground)"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}

function Fact({ icon: Icon, label, value }) {
  return (
    <div className="rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--background) p-3">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase text-(--muted-foreground)">
        <Icon className="h-3.5 w-3.5 text-(--primary)" />
        {label}
      </div>
      <p className="mt-2 truncate text-sm font-bold capitalize text-(--foreground)">{value}</p>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--background) px-3 py-2">
      <span className="text-sm text-(--muted-foreground)">{label}</span>
      <span className="text-sm font-bold text-(--foreground)">{value}</span>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="grid gap-1">
      <dt className="text-xs font-semibold uppercase text-(--muted-foreground)">{label}</dt>
      <dd className="text-sm font-medium text-(--foreground)">{value}</dd>
    </div>
  );
}

function SimilarOfferCard({ offer, counters = {} }) {
  const trustSignals = getBuySmartTrustSignals(offer, counters);

  return (
    <Link
      href={getBuySmartStorePath(offer)}
      className="group rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card) p-4 shadow-[var(--anslation-ds-shadow-sm)] transition hover:-translate-y-0.5 hover:border-(--primary)"
    >
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--background) p-2">
          {offer.img ? (
            <ManagedImage
              src={offer.img}
              alt={offer.title}
              className="h-full w-full object-contain"
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
            />
          ) : (
            <TicketPercent className="h-4 w-4 text-(--primary)" />
          )}
        </span>
        <div className="min-w-0">
          <h3 className="truncate text-sm font-bold text-(--foreground)">{offer.title}</h3>
          <p className="mt-1 truncate text-xs text-(--muted-foreground)">
            {getPrimarySavingsText(offer)}
          </p>
          <div className="mt-2">
            <TrustSignalBadges signals={trustSignals} compact />
          </div>
        </div>
      </div>
      <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-(--primary)">
        View details
        <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

function MobileStoreActionBar({ offer }) {
  const hasStoreLink = isExternalMerchantUrl(offer.link);

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-(--border) bg-(--card)/95 p-3 shadow-[0_-12px_30px_rgba(15,23,42,0.12)] backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-xl items-center gap-2">
        <CouponReveal
          offer={offer}
          className="flex-1"
          buttonTestId="buysmart-mobile-reveal-button"
          modalTestId="buysmart-mobile-reveal-modal"
        />
        {hasStoreLink ? (
          <a
            href={offer.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--background) px-3 text-sm font-bold text-(--foreground)"
          >
            Visit
            <ExternalLink className="h-4 w-4" />
          </a>
        ) : (
          <Link
            href="/buysmart/view-all"
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--background) px-3 text-sm font-bold text-(--foreground)"
          >
            Stores
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  );
}

function StoreDetailSkeleton() {
  return (
    <main className="bg-(--background) text-(--foreground)">
      <section className="section space-y-5">
        <LoadingBone className="h-5 w-40 rounded-full" />
        <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <LoadingBone className="h-[360px] rounded-[var(--anslation-ds-radius-lg)]" />
          <LoadingBone className="h-[360px] rounded-[var(--anslation-ds-radius-lg)]" />
        </div>
      </section>
    </main>
  );
}
