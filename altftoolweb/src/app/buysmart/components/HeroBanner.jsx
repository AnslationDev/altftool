"use client";

import { useEffect, useMemo, useState } from "react";
import { firebaseBuySmartHeroSource } from "@/app/buysmart/service.js/firebaseBuySmartHero";
import Image from "next/image";
import Link from "next/link";
import { HeroBannerSkeleton, SkeletonBlock } from "@/components/ui/skeleton";

export default function HeroBanner() {
  const [heroes, setHeroes] = useState(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const unsub = firebaseBuySmartHeroSource.subscribe((data) => {
      setHeroes(data || []);
    });
    return () => unsub && unsub();
  }, []);

  const landscapeHeroes = useMemo(() => {
    return (heroes || []).filter((item) => item.status === "active");
  }, [heroes]);

  const activeIndex = landscapeHeroes.length ? index % landscapeHeroes.length : 0;

  useEffect(() => {
    if (!landscapeHeroes.length) return;

    const id = setInterval(() => {
      setIndex((prev) => {
        if (!landscapeHeroes.length) return prev;
        return (prev + 1) % landscapeHeroes.length;
      });
    }, 2500);

    return () => clearInterval(id);
  }, [landscapeHeroes.length]);

  if (heroes === null) {
    return <HeroBannerSkeleton />;
  }

  if (!landscapeHeroes.length) {
    return null;
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
                     : "bg-[#1e3a8a] w-2 opacity-40"
                 }`}
          />
        ))}
      </div>
    </section>
  );
}

function HeroImage({ hero, priority }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <div className="relative h-full w-full">
      {!loaded ? (
        <SkeletonBlock className="h-full w-full rounded-xl sm:rounded-2xl" />
      ) : null}

      {!failed && hero.image ? (
        <Image
          src={hero.image}
          alt={hero.title || "hero banner"}
          fill
          priority={priority}
          className={`rounded-xl object-fill transition-opacity duration-500 sm:rounded-2xl ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      ) : null}
    </div>
  );
}
