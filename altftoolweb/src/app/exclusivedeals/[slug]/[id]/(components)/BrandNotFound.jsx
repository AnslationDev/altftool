"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Tag, ChevronLeft, ChevronRight } from "lucide-react";
import { bestCouponfirebase, brandsfirebase } from "../../../service/firebasebrand";

// ─── Slugify ──────────────────────────────────────────────────────────────────
const slugify = (text) =>
  text?.toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-");

// ─── Pick accent color per card index ────────────────────────────────────────
// Uses the semantic accent/primary/secondary/danger/warning/success tokens so
// each card still reads with distinct hues while staying theme-aware.
const ACCENTS = [
  { header: "var(--danger)", button: "var(--danger)", buttonText: "var(--primary-foreground)" },
  { header: "var(--warning)", button: "var(--warning)", buttonText: "var(--primary-foreground)" },
  { header: "var(--accent)", button: "var(--accent)", buttonText: "var(--primary-foreground)" },
  { header: "var(--success)", button: "var(--success)", buttonText: "var(--primary-foreground)" },
  { header: "var(--primary)", button: "var(--primary)", buttonText: "var(--primary-foreground)" },
  { header: "var(--secondary)", button: "var(--secondary)", buttonText: "var(--secondary-foreground)" },
];

// ─── Single Card ──────────────────────────────────────────────────────────────
function DealCard({ item, index }) {
  const accent = ACCENTS[index % ACCENTS.length];
  const cashback = item.cashback || item.highestDiscount || item.discount;
  const hasUpTo = item.hasUpTo || false;

  return (
    <div
      className="flex-shrink-0 rounded-xl overflow-hidden h-[450px]"
      style={{
        width: "290px",
        border: `2px solid ${accent.header}`,
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        backgroundColor: accent.header,
      }}
    >
      {/* Logo section — white background */}
      <div className=" flex items-center justify-center p-4 pb-0" style={{ height: "170px" }}>
        {item.logo ? (
          <div className="relative w-[500px] h-[150px] bg-(--card) rounded-md flex items-center justify-center">
            <Image
              src={item.logo}
              alt={item.brandName || "Brand"}
              fill
              sizes="(max-width: 640px) 100vw, 500px"
              className="object-contain p-4"
            />
          </div>
        ) : (
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl"
            style={{ background: accent.header, color: accent.buttonText }}
          >
            {item.brandName?.slice(0, 2).toUpperCase() || "??"}
          </div>
        )}
      </div>

<div>     
     {/* Offer title — colored header */}
      <div
        className="px-4 flex items-center justify-center text-center"
        style={{ background: accent.header , minHeight: "100px" }}
      >
        <p
          className="text-lg font-bold leading-snug line-clamp-3"
          style={{ color: accent.buttonText }}
        >
          {item.title || item.description || `${item.brandName} Offer`}
        </p>
      </div></div>

      {/* Cashback + CTA — white */}
      <div className="bg-(--card) flex flex-col items-center justify-center p-4 pb-0 gap-10"
        style={{
            border: `2px solid ${accent.button}`,
          }}>
        <div className="text-center">
          {hasUpTo && (
            <p className="text-sm text-(--muted-foreground) font-medium mb-0.5">Up to</p>
          )}
          {cashback ? (
            <>
              <p
                className="text-4xl font-extrabold leading-none"
                style={{ color: accent.header }}
              >
                {cashback}
                {!String(cashback).includes("%") ? "%" : ""}
              </p>
              <p className="text-2xl text-(--foreground) font-medium mt-2">Cash Back</p>
            </>
          ) : (
            <p className="text-sm text-(--muted-foreground) font-medium">Special Offer</p>
          )}
        </div>

        {/* Button */}
        <button
          className="w-40 py-2.5 rounded-full text-sm font-semibold transition-opacity hover:opacity-90 "
          style={{
            background: "var(--card)",
            color: accent.button,
            border: `2px solid ${accent.button}`,
          }}
        >
          {item.code?.trim() ? "Get Code" : "See Details"}
        </button>
      </div>
    </div>
  );
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div
      className="flex-shrink-0 rounded-2xl overflow-hidden bg-(--card) animate-pulse border border-(--border)"
      style={{ width: "220px" }}
    >
      <div className="bg-(--muted) h-[120px]" />
      <div className="bg-(--surface-soft) h-[72px]" />
      <div className="bg-(--card) px-4 py-5 flex flex-col items-center gap-4">
        <div className="w-16 h-10 bg-(--muted) rounded" />
        <div className="w-full h-9 bg-(--muted) rounded-full" />
      </div>
    </div>
  );
}

// ─── Main BrandNotFound Component ────────────────────────────────────────────
function BrandNotFound({ urlBrand }) {
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState([]);
  const scrollRef = React.useRef(null);

  useEffect(() => {
    let best = [], brandsData = [];
    let bestLoaded = false, brandsLoaded = false;

    const merge = () => {
      if (!bestLoaded || !brandsLoaded) return;

      const allItems = [...best, ...brandsData].flatMap((b) =>
        (b.offers || []).map((offer) => ({
          ...offer,
          brandName: b.name,
          link: b.link,
          logo: b.logo,
          highestDiscount: b.highestDiscount,
          cashback: b.cashback,
          hasUpTo: b.hasUpTo,
        }))
      );

      // Shuffle and take 12
      const shuffled = allItems.sort(() => Math.random() - 0.5).slice(0, 12);
      setCards(shuffled);
      setLoading(false);
    };

    const unsubBest = bestCouponfirebase((data) => { best = data || []; bestLoaded = true; merge(); });
    const unsubBrands = brandsfirebase((data) => { brandsData = data || []; brandsLoaded = true; merge(); });
    return () => { unsubBest?.(); unsubBrands?.(); };
  }, []);

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? -500 : 500, behavior: "smooth" });
  };

  return (
    <div className="section bg-(--dealspage-background) pt-8 pb-16 min-h-screen">

      {/* ── Divider ───────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 mb-6 px-2">
        <div className="flex-1 h-px bg-(--border)" />
        <p className="text-sm font-semibold text-(--muted-foreground) whitespace-nowrap">
          ✨ You might like these
        </p>
        <div className="flex-1 h-px bg-(--border)" />
      </div>

      {/* ── Scrollable Cards Row ───────────────────────────────────────────── */}
      <div className="relative">
        {/* Left arrow */}
        <button
          onClick={() => scroll("left")}
          className="hidden sm:flex absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-(--card) shadow-md border border-(--border) items-center justify-center hover:bg-(--surface-soft) transition"
        >
          <ChevronLeft className="w-5 h-5 text-(--muted-foreground)" />
        </button>

        {/* Scrollable container */}
        <div
          ref={scrollRef}
          className="flex gap-8 overflow-x-auto no-scrollbar px-1 py-3"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : cards.map((item, i) => (
                <div key={i} style={{ scrollSnapAlign: "start" }}>
                  <DealCard item={item} index={i} />
                </div>
              ))
          }
        </div>

        {/* Right arrow */}
        <button
          onClick={() => scroll("right")}
          className="hidden sm:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-(--card) shadow-md border border-(--border) items-center justify-center hover:bg-(--surface-soft) transition"
        >
          <ChevronRight className="w-5 h-5 text-(--muted-foreground)" />
        </button>
      </div>
    </div>
  );
}

export default BrandNotFound;
