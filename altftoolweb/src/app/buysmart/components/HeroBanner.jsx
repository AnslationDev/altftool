"use client";

import { useEffect, useMemo, useState } from "react";
import { firebaseBuySmartHeroSource } from "@/app/buysmart/service.js/firebaseBuySmartHero";
import Image from "next/image";
import Link from "next/link";
import { HeroBannerSkeleton, SkeletonBlock } from "@/components/ui/skeleton";
import { BadgeCheck, Search, Sparkles } from "lucide-react";
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
    }, 2500);

    return () => clearInterval(id);
  }, [landscapeHeroes.length, reducedMotion]);

  if (heroes === null && !showFallback) {
    return <HeroBannerSkeleton />;
  }

  if (!landscapeHeroes.length) {
    return <StaticBuySmartHero />;
  }

  return (
    <section className="">
      <div className="overflow-hidden rounded-xl sm:rounded-2xl animate-slide-up">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translate3d(-${activeIndex * 100}%,0,0)`, }}
        >
          {landscapeHeroes.map((hero, i) => (
            <div
              key={i}
              className="min-w-full w-full shrink-0"
            >
              <div className="relative w-full h-[180px] sm:h-[260px] md:h-[320px] lg:h-[420px] xl:h-[520px] ">
                <Link href={hero.link || "#"}>
                  <HeroImage key={hero.image || i} hero={hero} priority={i === 0} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>


      {/* Dots Navigation */}
      <div className="flex justify-center gap-4 mt-6">
        {landscapeHeroes.map((_, i) => (
          <div
            key={i}
            onClick={() => setIndex(i)}
            className={`h-2 rounded-full cursor-pointer
                 transition-all duration-500 ease-in-out
                 ${
                   index === i
                     ? "bg-(--primary) w-8 opacity-100"
                     : "bg-(--primary-active) w-2 opacity-40"
                 }`}
          />
        ))}
      </div>
    </section>
  );
}

function StaticBuySmartHero() {
  const stats = [
    { icon: BadgeCheck, label: "Verified stores" },
    { icon: Search, label: "Fast brand lookup" },
    { icon: Sparkles, label: "Curated savings" },
  ];

  return (
    <section className="overflow-hidden rounded-[var(--anslation-ds-radius-lg)] border border-(--border) bg-(--card) shadow-[var(--anslation-ds-shadow-sm)]">
      <div className="grid min-h-[360px] items-center gap-8 p-6 sm:p-8 lg:grid-cols-[1.05fr_0.95fr] lg:p-12">
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
            {stats.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--background) px-3 py-2 text-sm font-medium text-(--muted-foreground)"
              >
                <Icon className="h-4 w-4 text-(--primary)" />
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {["Amazon", "Ajio", "Myntra", "Booking"].map((brand, index) => (
            <div
              key={brand}
              className="rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--background) p-4"
            >
              <p className="text-xs font-semibold text-(--muted-foreground)">
                Featured
              </p>
              <p className="mt-2 text-lg font-bold text-(--foreground)">
                {brand}
              </p>
              <p className="mt-1 text-sm text-(--muted-foreground)">
                {index % 2 === 0 ? "Popular deals and offers" : "Trusted brand picks"}
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
          className={`rounded-xl object-cover transition-opacity duration-500 sm:rounded-2xl ${
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
