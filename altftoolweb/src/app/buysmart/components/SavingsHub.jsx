"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Clock3,
  Coins,
  Gift,
  Search,
  ShieldCheck,
  Sparkles,
  TicketPercent,
} from "lucide-react";
import { useBuySmartCategories } from "@/app/buysmart/hooks/useBuySmartLiveData";
import ManagedImage from "@/components/ui/ManagedImage";
import { normalizeBuySmartCategory } from "@altftool/core/buysmart";

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
  const { items: offers } = useBuySmartCategories();
  const [query, setQuery] = useState("");

  const normalizedOffers = useMemo(
    () => (offers || []).map(normalizeBuySmartCategory),
    [offers],
  );

  const filteredOffers = useMemo(() => {
    const search = query.trim().toLowerCase();

    return normalizedOffers
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
  }, [normalizedOffers, query]);

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
      <div className="section-header buy-smart-section-header-plain">
        <h2 className="section-title">AltFTool Savings <span>Hub</span></h2>
        <p className="section-subtitle">
          Verified codes, cash back, rewards, and student-friendly brand discovery in one clean flow.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {stats.map(({ icon: Icon, label }) => (
          <span
            key={label}
            className="buy-smart-trust-badge inline-flex h-10 items-center gap-2 rounded-full border px-4 text-xs font-bold sm:text-sm"
          >
            <Icon className="h-4 w-4" />
            {label}
          </span>
        ))}
      </div>

      <div className="grid items-stretch gap-4 lg:grid-cols-[0.72fr_1.28fr]">
        <div className="h-full">
          <div className="buy-smart-themed-panel flex h-full flex-col rounded-[var(--anslation-ds-radius)] border p-4 shadow-[var(--anslation-ds-shadow-sm)] transition">
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

            <div className="mt-5 flex min-h-0 flex-1 flex-col border-t border-(--border) pt-4">
              <div>
                <p className="text-sm font-bold text-(--foreground)">Popular categories</p>
                <p className="text-xs text-(--muted-foreground)">Quick category discovery</p>
              </div>

              <div className="mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                {categoryRails.map(([category, count]) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => {
                      setQuery(category);
                    }}
                    className="flex w-full items-center justify-between rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--background) px-3 py-2 text-left text-sm transition hover:border-(--primary)"
                  >
                    <span className="buy-smart-trust-badge inline-flex h-7 max-w-[68%] items-center rounded-full border px-3 text-xs font-bold">
                      <span className="truncate">{category}</span>
                    </span>
                    <span className="text-xs text-(--muted-foreground)">{count} offers</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid content-start gap-3 sm:grid-cols-2 xl:grid-cols-3">
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
      className="buy-smart-themed-card group flex min-h-[260px] flex-col rounded-[var(--anslation-ds-radius)] border p-4 shadow-[var(--anslation-ds-shadow-sm)] transition hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="buy-smart-icon-surface grid h-12 w-12 shrink-0 place-items-center rounded-[var(--anslation-ds-radius)]">
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

        <span className="buy-smart-chip rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize">
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

      <div className="buy-smart-cta-surface mt-4 flex items-center justify-between gap-3 rounded-[var(--anslation-ds-radius)] border px-3 py-2">
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
    <span className="buy-smart-chip-secondary inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-semibold">
      <Icon className="h-3 w-3 text-(--primary)" />
      {label}
    </span>
  );
}
