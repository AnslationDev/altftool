"use client";

/**
 * My ads — everything the visitor has "posted" in this browser.
 *
 * The list comes from the zustand store, which starts empty and only fills in
 * after `useHydrated()` reports that localStorage has been read. Rendering the
 * real list before that would make the first client render disagree with the
 * prerendered HTML, so the neutral placeholder below is not cosmetic.
 */

import Link from "next/link";
import { useId, useState } from "react";
import {
  BadgeCheck,
  Eye,
  HandCoins,
  Heart,
  Info,
  MapPin,
  Pencil,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";

import ManagedImage from "@/components/ui/ManagedImage";

import AdQualityScore from "../components/AdQualityScore";
import { EmptyState, Note } from "../components/primitives";
import { formatPosted, formatPrice, postedParts } from "../data/listings";
import { getMarket } from "../data/market";
import { useBazaarStore, useHydrated } from "../hooks/useBazaarStore";
import { useLocale } from "../i18n/useLocale";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "sold", label: "Sold" },
];

const FIELD =
  "w-full rounded-lg border border-(--border) bg-(--card) px-3 py-2 text-sm text-(--foreground) outline-none focus-visible:border-(--primary) focus-visible:ring-2 focus-visible:ring-(--primary)";

export default function MyAdsClient() {
  const { t } = useLocale();
  const uid = useId();
  const hydrated = useHydrated();
  const myAds = useBazaarStore((s) => s.myAds);
  const updateMyAd = useBazaarStore((s) => s.updateMyAd);
  const removeMyAd = useBazaarStore((s) => s.removeMyAd);
  // Per-ad counters. Both are real client-side facts, not estimates — see the
  // comment above `adStats` for why that distinction decided the whole design
  // of this section.
  const savedIds = useBazaarStore((s) => s.savedIds);
  const offers = useBazaarStore((s) => s.offers);

  const [filter, setFilter] = useState("all");
  const [confirmingId, setConfirmingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editError, setEditError] = useState("");

  // Neutral shell until the persisted store is known.
  if (!hydrated) {
    return (
      <div className="bzr-section" aria-busy="true">
        <p className="text-sm text-(--muted-foreground)">Loading your ads…</p>
      </div>
    );
  }

  const ads = hydrated ? myAds : [];
  const counts = {
    all: ads.length,
    active: ads.filter((ad) => ad.status !== "sold").length,
    sold: ads.filter((ad) => ad.status === "sold").length,
  };
  const visible =
    filter === "all"
      ? ads
      : ads.filter((ad) =>
          filter === "sold" ? ad.status === "sold" : ad.status !== "sold",
        );

  function startEdit(ad) {
    setEditingId(ad.id);
    setEditTitle(ad.title);
    setEditPrice(String(ad.price ?? 0));
    setEditError("");
    setConfirmingId(null);
  }

  function saveEdit(ad) {
    const nextTitle = editTitle.trim();
    const numeric = Number(editPrice);

    if (nextTitle.length < 10) {
      setEditError("Use at least 10 characters in the title.");
      return;
    }
    if (nextTitle.length > 70) {
      setEditError("Titles are limited to 70 characters.");
      return;
    }
    if (!Number.isFinite(numeric) || numeric < 0) {
      setEditError("Enter a price of 0 or more.");
      return;
    }

    const price = Math.round(numeric);
    updateMyAd(ad.id, { title: nextTitle, price, priceLabel: formatPrice(price) });
    setEditingId(null);
    setEditError("");
  }

  /**
   * Per-ad performance, counted rather than invented.
   *
   * This is the one place on the sell side where it would be easy — and
   * tempting — to lie. An ad "posted" here is a localStorage draft: it has no
   * public URL, no crawler ever sees it, and no analytics pipeline exists. A
   * seeded "127 views · 9 saves" would look great in a screenshot and would be
   * pure fiction, and a seller who believed it would draw exactly the wrong
   * conclusion about their price and their photos.
   *
   * So all three numbers are genuine, and two of them are genuinely zero:
   *
   *   Views   Always 0, and the panel says why. A draft has no detail page in
   *           this prototype, so there is nothing that could be counted.
   *   Saves   0 or 1 — whether *you* have saved your own ad, read straight out
   *           of `savedIds`. Real, if unimpressive.
   *   Offers  The count of offers in this browser against this ad id, from the
   *           same store the offer dialog writes to. Real. It stays 0 until
   *           there is a second party, which a single-browser prototype has no
   *           way to produce.
   *
   * No 7-point trend sparkline for the same reason: a trend needs a time
   * series, the store holds no timestamps (deliberately — `Date.now()` in
   * rendered output breaks hydration), and drawing seven plausible-looking bars
   * would be fabricating the shape of data that does not exist.
   */
  function adStats(ad) {
    return [
      {
        key: "views",
        label: "Views",
        icon: Eye,
        value: 0,
        hint: "Not tracked — a demo ad has no public page to be viewed on.",
      },
      {
        key: "saves",
        label: "Saves",
        icon: Heart,
        value: savedIds.includes(ad.id) ? 1 : 0,
        hint: "Counts only saves made in this browser, including your own.",
      },
      {
        key: "offers",
        label: "Offers",
        icon: HandCoins,
        value: offers.filter((offer) => offer.listingId === ad.id).length,
        hint: "Offers made in this browser. Nobody else can reach this ad.",
      },
    ];
  }

  return (
    <div className="bzr-section">
      <Note icon={Info}>
        These ads live in this browser only. Photos are kept as small thumbnails — nothing is
        uploaded anywhere — and clearing site data removes it all.
      </Note>

      <div className="mt-5 flex flex-wrap items-center gap-2" role="group" aria-label="Filter ads">
        {FILTERS.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`bzr-chip${filter === item.key ? " is-active" : ""}`}
            aria-pressed={filter === item.key}
            onClick={() => setFilter(item.key)}
          >
            {item.label} ({counts[item.key]})
          </button>
        ))}
      </div>

      {ads.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title={t("empty.myAds.title")}
            message={t("empty.myAds.message")}
            action={
              <Link href="/bazaar/post" className="bzr-btn">
                {t("empty.myAds.postCta")}
              </Link>
            }
          />
        </div>
      ) : visible.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title={`No ${filter} ads`}
            message={t("empty.myAds.filteredMessage")}
            action={
              <button type="button" className="bzr-btn bzr-btn-secondary" onClick={() => setFilter("all")}>
                {t("empty.myAds.showAll")}
              </button>
            }
          />
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {visible.map((ad) => {
            const sold = ad.status === "sold";
            const cover = ad.images?.[0];
            const editing = editingId === ad.id;

            return (
              <li key={ad.id} className="bzr-panel">
                <div className="flex flex-col gap-4 sm:flex-row">
                  <div className="h-28 w-full shrink-0 overflow-hidden rounded-lg bg-(--bzr-media) sm:h-24 sm:w-32">
                    {cover ? (
                      <ManagedImage
                        src={cover.src}
                        alt={cover.alt || ad.title}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>

                  <div className="min-w-0 flex-1">
                    {editing ? (
                      <div className="flex flex-col gap-3">
                        <div>
                          <label
                            className="block text-xs font-bold uppercase tracking-wide text-(--muted-foreground)"
                            htmlFor={`${uid}-${ad.id}-title`}
                          >
                            Ad title
                          </label>
                          <input
                            id={`${uid}-${ad.id}-title`}
                            type="text"
                            className={`${FIELD} mt-1`}
                            value={editTitle}
                            maxLength={70}
                            onChange={(event) => setEditTitle(event.target.value)}
                          />
                        </div>
                        <div>
                          <label
                            className="block text-xs font-bold uppercase tracking-wide text-(--muted-foreground)"
                            htmlFor={`${uid}-${ad.id}-price`}
                          >
                            Price ({getMarket().currencySymbol})
                          </label>
                          <input
                            id={`${uid}-${ad.id}-price`}
                            type="number"
                            inputMode="numeric"
                            min={0}
                            step={1}
                            className={`${FIELD} mt-1`}
                            value={editPrice}
                            onChange={(event) => setEditPrice(event.target.value)}
                          />
                        </div>
                        {editError ? (
                          <p className="text-xs font-semibold text-(--bzr-urgent)" role="alert">
                            {editError}
                          </p>
                        ) : null}
                        <div className="flex flex-wrap gap-2">
                          <button type="button" className="bzr-btn" onClick={() => saveEdit(ad)}>
                            Save changes
                          </button>
                          <button
                            type="button"
                            className="bzr-btn bzr-btn-secondary"
                            onClick={() => {
                              setEditingId(null);
                              setEditError("");
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`bzr-badge ${sold ? "bzr-badge-verified" : "bzr-badge-free"}`}
                          >
                            {sold ? "Sold" : "Active"}
                          </span>
                          <span className="text-xs text-(--muted-foreground)">
                            {(() => {
                              const parts = postedParts(ad.postedDaysAgo ?? 0);
                              return t(parts.id, formatPosted(ad.postedDaysAgo ?? 0), {
                                count: parts.count,
                              });
                            })()}
                          </span>
                          {ad.categoryName ? (
                            <span className="text-xs text-(--muted-foreground)">
                              {ad.categoryName}
                            </span>
                          ) : null}
                        </div>

                        <p className="mt-1 text-base font-bold text-(--foreground)">
                          {ad.priceLabel || formatPrice(ad.price || 0)}
                        </p>
                        <h2 className="text-sm font-semibold text-(--foreground)">{ad.title}</h2>

                        {ad.locality || ad.cityName ? (
                          <p className="mt-1 text-xs text-(--muted-foreground)">
                            <MapPin className="me-1 inline h-3 w-3" aria-hidden="true" />
                            {[ad.locality, ad.cityName].filter(Boolean).join(", ")}
                          </p>
                        ) : null}

                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            className="bzr-chip"
                            onClick={() => startEdit(ad)}
                          >
                            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                            Edit title &amp; price
                          </button>

                          {sold ? (
                            <button
                              type="button"
                              className="bzr-chip"
                              onClick={() => updateMyAd(ad.id, { status: "active" })}
                            >
                              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                              Mark as active
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="bzr-chip"
                              onClick={() => updateMyAd(ad.id, { status: "sold" })}
                            >
                              <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
                              Mark as sold
                            </button>
                          )}

                          {confirmingId === ad.id ? (
                            <span className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-semibold text-(--foreground)">
                                Delete this ad permanently?
                              </span>
                              <button
                                type="button"
                                className="bzr-chip is-active"
                                onClick={() => {
                                  removeMyAd(ad.id);
                                  setConfirmingId(null);
                                }}
                              >
                                Yes, delete
                              </button>
                              <button
                                type="button"
                                className="bzr-chip"
                                onClick={() => setConfirmingId(null)}
                              >
                                <X className="h-3.5 w-3.5" aria-hidden="true" />
                                Keep it
                              </button>
                            </span>
                          ) : (
                            <button
                              type="button"
                              className="bzr-chip"
                              onClick={() => setConfirmingId(ad.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                              Delete
                            </button>
                          )}
                        </div>

                        {/* ---------------- Performance + quality ---------------- */}
                        <div className="mt-4 grid gap-3 border-t border-(--border) pt-4 sm:grid-cols-2">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-(--muted-foreground)">
                              Performance
                            </p>
                            <dl className="mt-1.5 grid grid-cols-3 gap-2">
                              {adStats(ad).map((stat) => {
                                const StatIcon = stat.icon;
                                return (
                                  <div
                                    key={stat.key}
                                    className="rounded-lg border border-(--border) px-2 py-1.5"
                                    title={stat.hint}
                                  >
                                    <dt className="flex items-center gap-1 text-[0.68rem] text-(--muted-foreground)">
                                      <StatIcon className="h-3 w-3 shrink-0" aria-hidden="true" />
                                      {stat.label}
                                    </dt>
                                    <dd className="text-base font-bold tabular-nums text-(--foreground)">
                                      {stat.value}
                                    </dd>
                                  </div>
                                );
                              })}
                            </dl>
                            <p className="mt-1.5 text-[0.68rem] leading-relaxed text-(--muted-foreground)">
                              Real counts, not estimates. Views stay at 0 because a demo ad has no
                              public page to be viewed on — nothing here is being tracked.
                            </p>
                          </div>

                          <AdQualityScore
                            compact
                            ad={{
                              title: ad.title,
                              description: ad.description,
                              images: ad.images,
                              attributes: ad.attributes,
                              categorySlug: ad.categorySlug,
                              locality: ad.locality,
                              price: ad.price,
                            }}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {ads.length > 0 ? (
        <p className="mt-6 text-sm text-(--muted-foreground)">
          <Link href="/bazaar/post" className="bzr-section-link">
            Post another ad
          </Link>
        </p>
      ) : null}
    </div>
  );
}
