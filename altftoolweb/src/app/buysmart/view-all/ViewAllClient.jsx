"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  ExternalLink,
  Grid3X3,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
  TicketPercent,
  WalletCards,
  X,
} from "lucide-react";
import ManagedImage from "@/components/ui/ManagedImage";
import TrustSignalBadges from "@/app/buysmart/components/TrustSignalBadges";
import {
  useBuySmartAnalytics,
  useBuySmartCategories,
  useBuySmartStores,
} from "@/app/buysmart/hooks/useBuySmartLiveData";
import {
  getBuySmartTrustSignals,
  getBuySmartStorePath,
  getPrimarySavingsText,
  isExternalMerchantUrl,
  normalizeBuySmartCategory,
  sortBuySmartByTrust,
} from "@altftool/core/buysmart";

const LETTERS = ["All", "0-9", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")];

const OFFER_FILTERS = [
  { value: "all", label: "All", icon: Grid3X3 },
  { value: "coupon", label: "Codes", icon: TicketPercent },
  { value: "cashback", label: "Cashback", icon: WalletCards },
  { value: "reward", label: "Rewards", icon: Sparkles },
  { value: "student", label: "Student", icon: BadgeCheck },
  { value: "verified", label: "Verified", icon: ShieldCheck },
];

function toDirectoryOfferFromStore(store, index) {
  return normalizeBuySmartCategory({
    audience: "All shoppers",
    category: store.category || store.tag || "Trending",
    discount: store.highlight || (store.offers ? `${store.offers} live offers` : "View store"),
    featured: index < 4,
    image: store.image || store.logo,
    link: store.url || store.link || (store.slug ? `/buysmart/stores/${store.slug}` : "#"),
    offerType: "deal",
    priority: Number(store.offers) || Math.max(0, 30 - index),
    status: store.status || "active",
    title: store.name,
    verified: true,
    workingVotes: Number(store.offers) || Math.max(3, 18 - index),
  });
}

function buildDirectoryItems(offers = [], stores = [], counters = {}) {
  const normalizedOffers = offers.map(normalizeBuySmartCategory);
  const normalizedStores = stores.map(toDirectoryOfferFromStore);

  const items = [...normalizedOffers, ...normalizedStores]
    .filter((item) => item.status === "active")
    .filter((item, index, items) => (
      items.findIndex((candidate) => candidate.storeSlug === item.storeSlug) === index
    ));

  return sortBuySmartByTrust(items, counters);
}

function matchesLetter(item, letter) {
  if (letter === "All") return true;
  const firstChar = item.title?.[0]?.toUpperCase() || "";
  if (letter === "0-9") return /^[0-9]/.test(firstChar);
  return firstChar === letter;
}

export default function ViewAllClient() {
  const { counters } = useBuySmartAnalytics();
  const { isFallback: offersFallback, isSynced: offersSynced, items: offers } = useBuySmartCategories();
  const { isSynced: storesSynced, items: stores } = useBuySmartStores();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeOfferType, setActiveOfferType] = useState("all");
  const [activeLetter, setActiveLetter] = useState("All");

  const directoryItems = useMemo(
    () => buildDirectoryItems(offers, stores, counters),
    [counters, offers, stores],
  );

  const categories = useMemo(() => {
    const counts = directoryItems.reduce((acc, item) => {
      const category = item.category || "Popular";
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12);
  }, [directoryItems]);

  const stats = useMemo(() => {
    const verified = directoryItems.filter((item) => item.verified).length;
    const coupons = directoryItems.filter((item) => item.code || item.offerType === "coupon").length;
    const rewards = directoryItems.filter((item) =>
      ["cashback", "reward", "student"].includes(item.offerType),
    ).length;
    const liveSignals = directoryItems.filter((item) => getBuySmartTrustSignals(item, counters).hasLiveActivity).length;

    return [
      { label: "Stores", value: directoryItems.length, icon: Store },
      { label: "Verified", value: verified, icon: ShieldCheck },
      { label: "Codes", value: coupons, icon: TicketPercent },
      { label: liveSignals ? "Live Signals" : "Rewards", value: liveSignals || rewards, icon: WalletCards },
    ];
  }, [counters, directoryItems]);

  const filteredItems = useMemo(() => {
    const search = query.trim().toLowerCase();

    return directoryItems.filter((item) => {
      if (activeCategory !== "All" && item.category !== activeCategory) return false;
      if (activeOfferType === "verified" && !item.verified) return false;
      if (activeOfferType !== "all" && activeOfferType !== "verified" && item.offerType !== activeOfferType) return false;
      if (!matchesLetter(item, activeLetter)) return false;
      if (!search) return true;

      return [
        item.title,
        item.category,
        item.discount,
        item.cashback,
        item.points,
        item.code,
        item.audience,
        item.offerType,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(search);
    });
  }, [activeCategory, activeLetter, activeOfferType, directoryItems, query]);

  const featuredItems = filteredItems.filter((item) => item.featured || item.verified).slice(0, 3);
  const isLiveSynced = offersSynced || storesSynced;
  const activeFilters = [
    query ? "Search" : "",
    activeCategory !== "All" ? activeCategory : "",
    activeOfferType !== "all" ? OFFER_FILTERS.find((item) => item.value === activeOfferType)?.label : "",
    activeLetter !== "All" ? activeLetter : "",
  ].filter(Boolean);

  function resetFilters() {
    setQuery("");
    setActiveCategory("All");
    setActiveOfferType("all");
    setActiveLetter("All");
  }

  return (
    <main className="bg-(--background) text-(--foreground)" data-testid="buysmart-view-all">
      <section className="section !py-5 sm:!py-7">
        <div className="mb-4">
          <Link
            href="/buysmart"
            className="inline-flex items-center gap-2 text-sm font-semibold text-(--muted-foreground) transition hover:text-(--primary)"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to BuySmart
          </Link>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.12fr)_360px] lg:items-stretch">
          <div className="rounded-[var(--anslation-ds-radius-lg)] border border-(--border) bg-(--card) p-5 shadow-[var(--anslation-ds-shadow-sm)] sm:p-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--muted) px-3 py-1 text-xs font-semibold text-(--muted-foreground)">
              <Store className="h-3.5 w-3.5 text-(--primary)" />
              {isLiveSynced ? "Live directory synced" : offersFallback ? "Fallback directory ready" : "Directory ready"}
            </div>

            <h1 className="mt-4 max-w-3xl text-3xl font-bold leading-tight tracking-normal text-(--foreground) sm:text-5xl">
              Browse every BuySmart store from one clean directory.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-(--muted-foreground) sm:text-base">
              Search brands, filter by category or saving type, then open a focused store page with deal details and trust signals.
            </p>

            <div className="mt-6 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--background) p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-2xl font-bold text-(--foreground)">{value}</p>
                      <p className="mt-0.5 text-[11px] font-bold uppercase tracking-wide text-(--muted-foreground)">
                        {label}
                      </p>
                    </div>
                    <Icon className="h-4 w-4 text-(--primary)" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-[var(--anslation-ds-radius-lg)] border border-(--border) bg-(--card) p-4 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-(--muted-foreground)">
                  Featured matches
                </p>
                <h2 className="mt-1 text-lg font-bold">Start here</h2>
              </div>
              <Sparkles className="h-5 w-5 text-(--primary)" />
            </div>
            <div className="mt-4 space-y-2">
              {(featuredItems.length ? featuredItems : directoryItems.slice(0, 3)).map((item) => {
                const trustSignals = getBuySmartTrustSignals(item, counters);
                return (
                <Link
                  key={`${item.storeSlug}-${item.title}`}
                  href={getBuySmartStorePath(item)}
                  className="group flex items-center gap-3 rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--background) p-3 transition hover:border-(--primary)"
                >
                  <BrandLogo item={item} className="h-10 w-10" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-(--foreground)">
                      {item.title}
                    </span>
                    <span className="block truncate text-xs text-(--muted-foreground)">
                      {getPrimarySavingsText(item)}
                    </span>
                    <span className="mt-1 block">
                      <TrustSignalBadges signals={trustSignals} compact />
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-(--primary) transition group-hover:translate-x-0.5" />
                </Link>
                );
              })}
            </div>
          </aside>
        </div>
      </section>

      <section className="section !pt-0">
        <div className="space-y-4">
          <div className="rounded-[var(--anslation-ds-radius-lg)] border border-(--border) bg-(--card) p-3 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="grid gap-2 lg:grid-cols-[minmax(260px,1fr)_auto] lg:items-center">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--muted-foreground)" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search store, category, code, cashback..."
                  className="h-10 w-full rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--background) px-9 text-sm text-(--foreground) outline-none transition placeholder:text-(--input-placeholder) focus:border-(--primary) focus:ring-2 focus:ring-(--primary)"
                  aria-label="Search all BuySmart stores"
                />
                {query ? (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-(--muted-foreground) transition hover:bg-(--muted) hover:text-(--foreground)"
                    aria-label="Clear store search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-2">
                {OFFER_FILTERS.map(({ icon: Icon, label, value }) => {
                  const active = activeOfferType === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setActiveOfferType(value)}
                      aria-pressed={active}
                      className={`inline-flex h-10 items-center gap-2 rounded-[var(--anslation-ds-radius)] border px-3 text-xs font-bold transition ${
                        active
                          ? "border-(--primary) bg-(--primary) text-(--primary-foreground)"
                          : "border-(--border) bg-(--background) text-(--muted-foreground) hover:border-(--primary) hover:text-(--foreground)"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-3 flex snap-x gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setActiveCategory("All")}
                aria-pressed={activeCategory === "All"}
                className={`inline-flex h-9 shrink-0 snap-start items-center rounded-[var(--anslation-ds-radius-xs)] border px-3 text-xs font-bold transition ${
                  activeCategory === "All"
                    ? "border-(--primary) bg-(--primary) text-(--primary-foreground)"
                    : "border-(--border) bg-(--background) text-(--muted-foreground) hover:border-(--primary)"
                }`}
              >
                All categories
              </button>
              {categories.map(([category, count]) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  aria-pressed={activeCategory === category}
                  className={`inline-flex h-9 shrink-0 snap-start items-center gap-1.5 rounded-[var(--anslation-ds-radius-xs)] border px-3 text-xs font-bold transition ${
                    activeCategory === category
                      ? "border-(--primary) bg-(--primary) text-(--primary-foreground)"
                      : "border-(--border) bg-(--background) text-(--muted-foreground) hover:border-(--primary)"
                  }`}
                >
                  {category}
                  <span className="rounded-full bg-(--muted) px-1.5 py-0.5 text-[10px] text-(--muted-foreground)">
                    {count}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-3 flex snap-x gap-1.5 overflow-x-auto rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--background) p-1.5">
              {LETTERS.map((letter) => {
                const active = activeLetter === letter;
                return (
                  <button
                    key={letter}
                    type="button"
                    onClick={() => setActiveLetter(letter)}
                    aria-pressed={active}
                    className={`grid h-8 min-w-8 shrink-0 snap-start place-items-center rounded-[var(--anslation-ds-radius-xs)] px-2 text-xs font-bold transition ${
                      active
                        ? "bg-(--primary) text-(--primary-foreground)"
                        : "text-(--muted-foreground) hover:bg-(--muted) hover:text-(--foreground)"
                    }`}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
              <p className="font-semibold text-(--muted-foreground)">
                Showing <span className="text-(--foreground)">{filteredItems.length}</span> of {directoryItems.length} stores
              </p>
              {activeFilters.length ? (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex h-8 items-center gap-1.5 rounded-[var(--anslation-ds-radius-xs)] border border-(--border) bg-(--background) px-2.5 text-xs font-bold text-(--muted-foreground) transition hover:border-(--primary) hover:text-(--foreground)"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear filters
                </button>
              ) : null}
            </div>
          </div>

          {filteredItems.length ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {filteredItems.map((item) => (
                <StoreDirectoryCard key={`${item.storeSlug}-${item.title}`} item={item} counters={counters} />
              ))}
            </div>
          ) : (
            <div className="rounded-[var(--anslation-ds-radius-lg)] border border-(--border) bg-(--card) p-8 text-center shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-[var(--anslation-ds-radius)] bg-(--muted)">
                <Search className="h-5 w-5 text-(--primary)" />
              </div>
              <h2 className="mt-4 text-xl font-bold">No matching stores</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-(--muted-foreground)">
                Try a broader keyword, choose another category, or clear the current filters.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-5 inline-flex h-10 items-center justify-center rounded-[var(--anslation-ds-radius)] bg-(--primary) px-4 text-sm font-bold text-(--primary-foreground)"
              >
                Reset directory
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function BrandLogo({ item, className = "h-12 w-12" }) {
  return (
    <span className={`grid shrink-0 place-items-center rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--background) p-2 ${className}`}>
      {item.img ? (
        <ManagedImage
          src={item.img}
          alt={item.title}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className="h-full w-full object-contain"
        />
      ) : (
        <Store className="h-5 w-5 text-(--primary)" />
      )}
    </span>
  );
}

function StoreDirectoryCard({ item, counters = {} }) {
  const savings = getPrimarySavingsText(item);
  const storeHref = getBuySmartStorePath(item);
  const hasExternal = isExternalMerchantUrl(item.link);
  const trustSignals = getBuySmartTrustSignals(item, counters);

  return (
    <article className="group flex min-h-[236px] flex-col rounded-[var(--anslation-ds-radius-lg)] border border-(--border) bg-(--card) p-4 shadow-[var(--anslation-ds-shadow-sm)] transition hover:-translate-y-0.5 hover:border-(--primary) hover:shadow-[var(--anslation-ds-shadow-md)] motion-reduce:transform-none">
      <div className="flex items-start gap-3">
        <BrandLogo item={item} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-1.5">
            <TrustSignalBadges signals={trustSignals} compact />
            {item.verified ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-(--primary) bg-(--primary) px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-(--primary-foreground)">
                <ShieldCheck className="h-3 w-3" />
                Verified
              </span>
            ) : null}
            {item.exclusive ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-(--border) bg-(--muted) px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-(--muted-foreground)">
                Exclusive
              </span>
            ) : null}
          </div>
          <h2 className="mt-2 line-clamp-2 text-base font-bold leading-snug text-(--foreground)">
            {item.title}
          </h2>
          <p className="mt-1 text-xs font-semibold capitalize text-(--primary)">
            {item.category}
          </p>
        </div>
      </div>

      <p className="mt-4 line-clamp-2 text-sm leading-6 text-(--muted-foreground)">
        {item.disc || `${savings}${item.audience ? ` for ${item.audience.toLowerCase()}` : ""}.`}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--background) p-2">
          <p className="font-bold uppercase tracking-wide text-(--muted-foreground)">
            Saving
          </p>
          <p className="mt-1 truncate font-bold text-(--foreground)">{item.code || savings}</p>
        </div>
        <div className="rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--background) p-2">
          <p className="font-bold uppercase tracking-wide text-(--muted-foreground)">
            Type
          </p>
          <p className="mt-1 truncate font-bold capitalize text-(--foreground)">{item.offerType}</p>
        </div>
      </div>

      <div className="mt-auto flex items-center gap-2 pt-4">
        <Link
          href={storeHref}
          className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-[var(--anslation-ds-radius)] bg-(--primary) px-3 text-sm font-bold text-(--primary-foreground) transition hover:bg-(--primary-hover)"
        >
          View details
          <ArrowRight className="h-4 w-4" />
        </Link>
        {hasExternal ? (
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--background) text-(--muted-foreground) transition hover:border-(--primary) hover:text-(--foreground)"
            aria-label={`Open ${item.title} store`}
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        ) : null}
      </div>
    </article>
  );
}
