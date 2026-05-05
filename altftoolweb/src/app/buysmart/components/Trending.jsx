"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import useReducedMotion from "@/hooks/useReducedMotion";
import { useBuySmartStores } from "@/app/buysmart/hooks/useBuySmartLiveData";
import ManagedImage from "@/components/ui/ManagedImage";

export default function StoreGrid({ filter }) {
  const { items: stores } = useBuySmartStores();
  const [index, setIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState(3);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const update = () => {
      if (window.innerWidth < 640) setVisibleCards(1);
      else if (window.innerWidth < 1024) setVisibleCards(2);
      else setVisibleCards(3);
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const filteredStores = useMemo(() => {
    let activeStores = (stores || []).filter(
      (store) => store.status === "active",
    );
  
    if (!filter) return activeStores;
  
    return activeStores.filter((store) => {
      const name = store.name?.trim() || "";
  
      if (filter === "0-9") {
        return /^[0-9]/.test(name);
      }
  
      return name.toUpperCase().startsWith(filter.toUpperCase());
    });
  }, [stores, filter]);

  useEffect(() => {
    if (reducedMotion || !filteredStores.length) return;

    const id = setInterval(() => {
      setIndex((prev) =>
        prev >= filteredStores.length - visibleCards ? 0 : prev + 1,
      );
    }, 3000);

    return () => clearInterval(id);
  }, [filteredStores, visibleCards, reducedMotion]);

  if (!filteredStores.length) return null;

  const safeIndex = Math.min(index, Math.max(filteredStores.length - visibleCards, 0));

  return (
    <div className="flex flex-col gap-6 animate-slide-up">
      <div className="section-header">
        <h2 className="section-title">
          What&apos;s <span>Trending Now</span>
        </h2>
        <p className="section-subtitle">
          Don&apos;t miss out, see what the world is loving right now.
        </p>
      </div>

      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{
            transform: `translateX(-${safeIndex * (100 / visibleCards)}%)`,
          }}
        >
          {filteredStores.map((store, i) => (
            <Link
              key={store.id || `${store.name}-${i}`}
              href={store.link}
              className="w-full flex-shrink-0 px-2 sm:w-1/2 sm:px-2.5 lg:w-1/3 lg:px-3"
            >
              <div
                className="
                relative flex-shrink-0
                w-full aspect-[43/24]
                rounded-[var(--anslation-ds-radius)]
                overflow-hidden
                border border-(--border)
                shadow-[var(--anslation-ds-shadow-sm)]
              "
              >
                <div className="h-full w-full transition-transform duration-300 hover:scale-[1.02] motion-reduce:transform-none">
                  <StoreImageCard key={store.image || store.logo || store.id || store.name} store={store} />
                </div>
                <div className="relative z-10 flex h-full flex-col justify-end px-5 pb-4 text-white">
                  {store.tag && (
                    <span className="mb-1 w-fit rounded-full bg-white/20 px-2 py-[2px] text-[11px] font-semibold">
                      {store.tag}
                    </span>
                  )}

                  <h3 className="line-clamp-1 text-lg font-semibold leading-tight sm:text-xl">
                    {store.name}
                  </h3>

                  {store.highlight && (
                    <p className="line-clamp-1 text-sm opacity-90">
                      {store.highlight}
                    </p>
                  )}

                  {store.offers && (
                    <p className="mt-0.5 text-sm font-semibold sm:text-base">
                      {store.offers} Offers
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function StoreImageCard({ store }) {
  const src = store.image || store.logo || "";
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <>
      <div className="absolute inset-0 flex flex-col items-start justify-end gap-2 bg-(--muted) p-5">
        <span className="rounded-full border border-(--border) bg-(--card) px-2.5 py-1 text-xs font-semibold text-(--muted-foreground)">
          Trending
        </span>
        <p className="text-xl font-bold text-(--foreground)">
          {store.name || "Featured store"}
        </p>
        {store.highlight ? (
          <p className="text-sm font-medium text-(--muted-foreground)">
            {store.highlight}
          </p>
        ) : null}
      </div>
      {!failed && src ? (
        <ManagedImage
          key={src}
          src={src}
          alt={store.name || "store"}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      ) : null}
    </>
  );
}
