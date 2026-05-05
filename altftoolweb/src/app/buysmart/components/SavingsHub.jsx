"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Clock3,
  Coins,
  Gift,
  GraduationCap,
  Search,
  ShieldCheck,
  Sparkles,
  TicketPercent,
  WalletCards,
} from "lucide-react";
import { useBuySmartCategories } from "@/app/buysmart/hooks/useBuySmartLiveData";
import ManagedImage from "@/components/ui/ManagedImage";
import { normalizeBuySmartCategory } from "@altftool/core/buysmart";

const FILTERS = [
  { icon: Sparkles, label: "All", value: "all" },
  { icon: TicketPercent, label: "Codes", value: "coupon" },
  { icon: WalletCards, label: "Cash Back", value: "cashback" },
  { icon: Gift, label: "Rewards", value: "reward" },
  { icon: GraduationCap, label: "Student", value: "student" },
  { icon: ShieldCheck, label: "Verified", value: "verified" },
];

function getCreatedTime(item) {
  if (item.createdAt?.seconds) return item.createdAt.seconds * 1000;
  return new Date(item.createdAt || 0).getTime();
}

function formatExpiry(value) {
  if (!value) return "Live now";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return `Ends ${date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  })}`;
}

export default function SavingsHub() {
  const { isSynced, items: offers } = useBuySmartCategories();
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const normalizedOffers = useMemo(
    () => (offers || []).map(normalizeBuySmartCategory),
    [offers],
  );

  const filteredOffers = useMemo(() => {
    const search = query.trim().toLowerCase();

    return normalizedOffers
      .filter((item) => {
        if (activeFilter === "verified") return item.verified;
        if (activeFilter !== "all") return item.offerType === activeFilter;
        return true;
      })
      .filter((item) => {
        if (!search) return true;
        return [
          item.title,
          item.category,
          item.discount,
          item.cashback,
          item.points,
          item.code,
          item.audience,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(search);
      })
      .sort((a, b) => {
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        if (a.priority !== b.priority) return b.priority - a.priority;
        return getCreatedTime(b) - getCreatedTime(a);
      });
  }, [activeFilter, normalizedOffers, query]);

  const categoryRails = useMemo(() => {
    const counts = normalizedOffers.reduce((acc, item) => {
      const category = item.category || "Popular";
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [normalizedOffers]);

  const stats = useMemo(() => {
    const verified = normalizedOffers.filter((item) => item.verified).length;
    const codes = normalizedOffers.filter((item) => item.code || item.offerType === "coupon").length;
    const rewards = normalizedOffers.filter((item) =>
      ["cashback", "reward", "student"].includes(item.offerType),
    ).length;

    return [
      { icon: ShieldCheck, label: "Verified offers", value: verified || normalizedOffers.length },
      { icon: TicketPercent, label: "Codes and deals", value: codes || filteredOffers.length },
      { icon: Coins, label: "Cashback/reward picks", value: rewards },
      { icon: BadgeCheck, label: "Live categories", value: categoryRails.length },
    ];
  }, [categoryRails.length, filteredOffers.length, normalizedOffers]);

  return (
    <section className="space-y-6 animate-slide-up" data-testid="buysmart-savings-hub">
      <div className="section-header">
        <div className="mx-auto mb-3 inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--muted) px-3 py-1 text-xs font-semibold text-(--muted-foreground)">
          <Sparkles className="h-3.5 w-3.5 text-(--primary)" />
          {isSynced ? "Live savings engine" : "Ready savings engine"}
        </div>
        <h2 className="section-title">AltFTool Savings Hub</h2>
        <p className="section-subtitle">
          Verified codes, cash back, rewards, and student-friendly brand discovery in one clean flow.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card) p-4 shadow-[var(--anslation-ds-shadow-sm)]"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-2xl font-bold text-(--foreground)">{value}</p>
                <p className="mt-1 text-xs font-semibold text-(--muted-foreground)">
                  {label}
                </p>
              </div>
              <span className="grid h-10 w-10 place-items-center rounded-[var(--anslation-ds-radius)] bg-(--muted)">
                <Icon className="h-5 w-5 text-(--primary)" />
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.72fr_1.28fr]">
        <div className="space-y-4">
          <div className="rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card) p-4 shadow-[var(--anslation-ds-shadow-sm)]">
            <label className="text-xs font-semibold uppercase text-(--muted-foreground)">
              Search savings
            </label>
            <div className="mt-3 flex items-center gap-2 rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--background) px-3 py-2">
              <Search className="h-4 w-4 text-(--muted-foreground)" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Brand, category, code, reward..."
                className="min-w-0 flex-1 bg-transparent text-sm text-(--foreground) outline-none placeholder:text-(--input-placeholder)"
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {FILTERS.map(({ icon: Icon, label, value }) => {
                const active = activeFilter === value;

                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setActiveFilter(value)}
                    className={`inline-flex h-9 items-center gap-2 rounded-[var(--anslation-ds-radius)] border px-3 text-xs font-semibold transition ${
                      active
                        ? "border-(--primary) bg-(--primary) text-(--primary-foreground)"
                        : "border-(--border) bg-(--background) text-(--muted-foreground) hover:border-(--primary)"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card) p-4 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-(--foreground)">Popular categories</p>
                <p className="text-xs text-(--muted-foreground)">Quick category discovery</p>
              </div>
              <BadgeCheck className="h-4 w-4 text-(--primary)" />
            </div>

            <div className="mt-4 space-y-2">
              {categoryRails.map(([category, count]) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => {
                    setQuery(category);
                    setActiveFilter("all");
                  }}
                  className="flex w-full items-center justify-between rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--background) px-3 py-2 text-left text-sm transition hover:border-(--primary)"
                >
                  <span className="font-semibold text-(--foreground)">{category}</span>
                  <span className="text-xs text-(--muted-foreground)">{count} offers</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filteredOffers.slice(0, 6).map((offer) => (
            <SavingsOfferCard key={`${offer.id || offer.title}-${offer.link}`} offer={offer} />
          ))}
        </div>
      </div>
    </section>
  );
}

function SavingsOfferCard({ offer }) {
  const href = offer.storePath || "#";
  const savings = offer.discount || offer.cashback || offer.points || "View deal";

  return (
    <Link
      href={href}
      className="group flex min-h-[260px] flex-col rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card) p-4 shadow-[var(--anslation-ds-shadow-sm)] transition hover:-translate-y-0.5 hover:border-(--primary)"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--background)">
          {offer.img ? (
            <ManagedImage
              src={offer.img}
              alt={offer.title}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              className="h-8 w-8 object-contain"
            />
          ) : (
            <Gift className="h-5 w-5 text-(--primary)" />
          )}
        </span>

        <span className="rounded-full border border-(--border) bg-(--muted) px-2.5 py-1 text-[11px] font-semibold capitalize text-(--muted-foreground)">
          {offer.offerType}
        </span>
      </div>

      <div className="mt-4 flex-1 space-y-3">
        <div>
          <h3 className="line-clamp-2 text-lg font-bold leading-snug text-(--foreground)">
            {offer.title}
          </h3>
          <p className="mt-1 text-xs font-semibold text-(--primary)">
            {offer.category}
          </p>
        </div>

        <p className="line-clamp-2 text-sm text-(--muted-foreground)">
          {offer.disc || `${savings}${offer.audience ? ` for ${offer.audience.toLowerCase()}` : ""}.`}
        </p>

        <div className="flex flex-wrap gap-2">
          {offer.verified ? <Chip icon={ShieldCheck} label="Verified" /> : null}
          {offer.exclusive ? <Chip icon={Sparkles} label="Exclusive" /> : null}
          <Chip icon={Clock3} label={formatExpiry(offer.expiresAt)} />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--background) px-3 py-2">
        <div>
          <p className="text-[11px] font-semibold uppercase text-(--muted-foreground)">
            {offer.code ? "Code" : "Saving"}
          </p>
          <p className="max-w-[150px] truncate text-sm font-bold text-(--foreground)">
            {offer.code || savings}
          </p>
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-(--primary) transition group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

function Chip({ icon: Icon, label }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-(--border) bg-(--background) px-2 py-1 text-[11px] font-semibold text-(--muted-foreground)">
      <Icon className="h-3 w-3 text-(--primary)" />
      {label}
    </span>
  );
}
