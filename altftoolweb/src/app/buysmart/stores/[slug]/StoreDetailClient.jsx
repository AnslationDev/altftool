"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  Clock3,
  ExternalLink,
  Globe2,
  ShieldCheck,
  Sparkles,
  TicketPercent,
  WalletCards,
} from "lucide-react";
import CouponReveal from "@/app/buysmart/components/CouponReveal";
import {
  fallbackBuySmartCategoryItems,
  useBuySmartCategories,
} from "@/app/buysmart/hooks/useBuySmartLiveData";
import ManagedImage from "@/components/ui/ManagedImage";
import { LoadingBone } from "@/components/ui/route-loading";
import {
  getBuySmartBrandSlug,
  getBuySmartStorePath,
  getDomainFromUrl,
  getPrimarySavingsText,
  normalizeBuySmartCategory,
  slugifyBuySmartBrand,
} from "@altftool/core/buysmart";

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

function formatRate(value) {
  const rate = Number(value);
  if (!Number.isFinite(rate)) return "0%";
  return `${Math.round(rate)}%`;
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

export default function StoreDetailClient({ slug }) {
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
    return normalizedOffers
      .filter((item) => getBuySmartBrandSlug(item) !== getBuySmartBrandSlug(offer))
      .filter((item) => item.category === offer.category || item.offerType === offer.offerType)
      .slice(0, 4);
  }, [normalizedOffers, offer]);

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
  const verificationLabel = verificationLabels[offer.verificationStatus] || "Pending QA";

  return (
    <main className="bg-(--background) text-(--foreground)" data-testid="buysmart-store-detail">
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

                <div className="mt-5 flex flex-wrap gap-3">
                  <CouponReveal offer={offer} />
                  {offer.link && offer.link !== "#" ? (
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
                <Metric label="Success rate" value={formatRate(offer.successRate)} />
                <Metric label="Working votes" value={String(offer.workingVotes || 0)} />
                <Metric label="Failed votes" value={String(offer.failedVotes || 0)} />
                <Metric label="Last checked" value={formatDate(offer.lastVerifiedAt, "Not checked yet")} />
              </div>

              {offer.reviewNote ? (
                <p className="mt-4 rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--background) p-3 text-sm text-(--muted-foreground)">
                  {offer.reviewNote}
                </p>
              ) : null}
            </div>

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
                <SimilarOfferCard key={`${item.id || item.title}-${item.storePath}`} offer={item} />
              ))}
            </div>
          </section>
        ) : null}
      </section>
    </main>
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

function SimilarOfferCard({ offer }) {
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
        </div>
      </div>
      <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-(--primary)">
        View details
        <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
      </span>
    </Link>
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
