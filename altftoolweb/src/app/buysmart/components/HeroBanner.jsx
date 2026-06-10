"use client";

import { useEffect, useMemo, useState } from "react";
import { firebaseBuySmartHeroSource } from "@/app/buysmart/service.js/firebaseBuySmartHero";
import Image from "next/image";
import Link from "next/link";
import { HeroBannerSkeleton, SkeletonBlock } from "@/components/ui/skeleton";
import {
  ArrowRight,
  BadgeCheck,
  Clock3,
  Search,
  ShieldCheck,
  Sparkles,
  TicketPercent,
} from "lucide-react";
import useReducedMotion from "@/hooks/useReducedMotion";

const FALLBACK_HERO_WAIT_MS = 320;

export default function HeroBanner() {
  const [heroes, setHeroes] = useState(null);
  const [index, setIndex] = useState(0);
  const [showFallback, setShowFallback] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const unsub = firebaseBuySmartHeroSource.subscribe((data) => {
      setHeroes(data || []);
    });
    return () => unsub && unsub();
  }, []);

  useEffect(() => {
    if (heroes !== null) return;
    const id = setTimeout(() => setShowFallback(true), FALLBACK_HERO_WAIT_MS);
    return () => clearTimeout(id);
  }, [heroes]);

  const landscapeHeroes = useMemo(() => {
    return (heroes || []).filter((item) => item.status === "active");
  }, [heroes]);

  const activeIndex = landscapeHeroes.length ? index % landscapeHeroes.length : 0;

  useEffect(() => {
    if (reducedMotion || !landscapeHeroes.length) return;

    const id = setInterval(() => {
      setIndex((prev) => {
        if (!landscapeHeroes.length) return prev;
        return (prev + 1) % landscapeHeroes.length;
      });
    }, 5000);

    return () => clearInterval(id);
  }, [landscapeHeroes.length, reducedMotion]);

  if (heroes === null && !showFallback) {
    return <HeroBannerSkeleton />;
  }

  if (!landscapeHeroes.length) {
    return <StaticBuySmartHero />;
  }

  const activeHero = landscapeHeroes[activeIndex] || {};

  return (
    <section className="relative isolate overflow-hidden rounded-[var(--anslation-ds-radius-lg)] border border-(--border) bg-[#0b1220] text-white shadow-[var(--anslation-ds-shadow-lg)] animate-slide-up">
      <div className="absolute inset-0">
        <div
          className="flex h-full transition-transform duration-700 ease-in-out"
          style={{ transform: `translate3d(-${activeIndex * 100}%,0,0)`, }}
        >
          {landscapeHeroes.map((hero, i) => (
            <div
              key={i}
              className="min-w-full w-full shrink-0"
            >
              <div className="relative h-full min-h-[450px] w-full sm:min-h-[470px] lg:min-h-[500px]">
                <HeroImage key={hero.image || i} hero={hero} priority={i === 0} />
              </div>
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,13,24,0.94)_0%,rgba(7,13,24,0.82)_43%,rgba(7,13,24,0.34)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(0deg,rgba(7,13,24,0.88),transparent)]" />
      </div>

      <div className="relative z-10 grid min-h-[450px] items-end gap-8 p-5 sm:min-h-[470px] sm:p-8 lg:min-h-[500px] lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center lg:p-8">
        <div className="max-w-2xl pb-10 lg:pb-0">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white/82 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-[#67e8f9]" />
            BuySmart by AltFTool
          </div>
          <h1 className="mt-4 text-3xl font-bold leading-tight tracking-normal text-white sm:text-4xl lg:text-4xl 2xl:text-5xl">
            Decide faster with verified stores, deals, and brand checks.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-white/76 sm:text-base">
            Search brands, compare savings signals, and open trusted store pages from one calmer shopping workflow.
          </p>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <Link
              href="#buysmart-savings"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[var(--anslation-ds-radius)] bg-[#f8fafc] px-4 text-sm font-bold text-[#07111f] shadow-[0_10px_24px_rgba(0,0,0,0.18)] transition hover:bg-[#dbeafe]"
            >
              Explore savings
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/buysmart/view-all"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[var(--anslation-ds-radius)] border border-white/20 bg-white/10 px-4 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20"
            >
              View all stores
            </Link>
          </div>

          <div className="mt-7 grid max-w-xl grid-cols-3 gap-2">
            {[
              ["100+", "brand routes"],
              ["live", "Firebase sync"],
              ["A-Z", "store browsing"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-[var(--anslation-ds-radius)] border border-white/12 bg-white/10 p-3 backdrop-blur">
                <p className="text-lg font-bold text-white sm:text-2xl">{value}</p>
                <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-white/62">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden rounded-[var(--anslation-ds-radius-lg)] border border-white/12 bg-white/10 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur lg:block">
          <p className="text-xs font-bold uppercase tracking-wide text-white/62">Decision stack</p>
          <h2 className="mt-1 text-xl font-bold text-white">Open the right deal with less guesswork.</h2>
          <div className="mt-4 space-y-2">
            {[
              { icon: ShieldCheck, label: "Verified status", value: "Check if the offer is usable" },
              { icon: TicketPercent, label: "Savings type", value: "Coupon, cashback, reward, student" },
              { icon: Clock3, label: "Freshness", value: activeHero.title || "Recently updated store picks" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 rounded-[var(--anslation-ds-radius)] border border-white/10 bg-[#0b1220]/48 p-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[var(--anslation-ds-radius)] bg-white/10 text-[#93c5fd]">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-white">{label}</span>
                  <span className="line-clamp-1 block text-xs text-white/62">{value}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-5 left-5 z-20 flex items-center gap-2 sm:left-auto sm:right-8">
        {landscapeHeroes.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Show BuySmart hero ${i + 1}`}
            className={`h-2 rounded-full transition-all duration-500 ease-in-out ${
                   index === i
                     ? "w-8 bg-white opacity-100"
                     : "w-2 bg-white/55 opacity-80 hover:bg-white"
                 }`}
          />
        ))}
      </div>
    </section>
  );
}

function StaticBuySmartHero() {
  const stats = [
    { icon: BadgeCheck, label: "Verified stores", value: "100+" },
    { icon: Search, label: "Fast brand lookup", value: "A-Z" },
    { icon: Sparkles, label: "Curated savings", value: "Live" },
  ];

  return (
    <section className="overflow-hidden rounded-[var(--anslation-ds-radius-lg)] border border-(--border) bg-(--card) shadow-[var(--anslation-ds-shadow-md)]">
      <div className="grid min-h-[420px] items-center gap-8 p-6 sm:p-8 lg:grid-cols-[1.05fr_0.95fr] lg:p-12">
        <div className="max-w-2xl space-y-5">
          <div className="inline-flex items-center rounded-full border border-(--border) bg-(--muted) px-3 py-1 text-xs font-semibold text-(--muted-foreground)">
            BuySmart by AltFTool
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-bold leading-tight tracking-normal text-(--foreground) sm:text-4xl lg:text-5xl">
              Discover better brands before you buy.
            </h1>
            <p className="max-w-xl text-sm leading-6 text-(--muted-foreground) sm:text-base">
              Compare trusted stores, offers, and categories from one clean place.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {stats.map(({ icon: Icon, label, value }) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--background) px-3 py-2 text-sm font-medium text-(--muted-foreground)"
              >
                <Icon className="h-4 w-4 text-(--primary)" />
                <span className="font-bold text-(--foreground)">{value}</span>
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {["Find", "Verify", "Compare", "Open"].map((step, index) => (
            <div
              key={step}
              className="rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--background) p-4"
            >
              <p className="text-xs font-semibold text-(--muted-foreground)">
                Step {index + 1}
              </p>
              <p className="mt-2 text-lg font-bold text-(--foreground)">
                {step}
              </p>
              <p className="mt-1 text-sm text-(--muted-foreground)">
                {index % 2 === 0 ? "Shortlist better deals" : "Check signals before you click"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HeroImage({ hero, priority }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <div className="relative h-full w-full">
      {!loaded && !failed ? (
        <SkeletonBlock className="h-full w-full rounded-xl sm:rounded-2xl" />
      ) : null}

      {!failed && hero.image ? (
        <Image
          src={hero.image}
          alt={hero.title || "hero banner"}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1160px"
          className={`object-cover transition-opacity duration-500 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      ) : null}
      {failed ? (
        <div className="flex h-full w-full flex-col justify-center rounded-xl border border-(--border) bg-(--muted) p-6 text-(--foreground) sm:rounded-2xl">
          <p className="text-xs font-semibold text-(--muted-foreground)">BuySmart by AltFTool</p>
          <p className="mt-2 max-w-xl text-2xl font-bold leading-tight sm:text-4xl">
            Discover better brands before you buy.
          </p>
        </div>
      ) : null}
    </div>
  );
}
