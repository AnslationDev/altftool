"use client";

import { useEffect, useMemo, useState } from "react";
import { firebaseBuySmartStoreSource } from "@/app/buysmart/service.js/firebaseBuySmartStore";
import Link from "next/link";
import { TrendingSkeleton } from "@/components/ui/skeleton";
import fallbackStores from "@/app/buysmart/data/stores.json";
import useReducedMotion from "@/hooks/useReducedMotion";

const fallbackStoreItems = fallbackStores.map((store) => ({
  ...store,
  image: store.logo,
  link: "#",
  status: "active",
}));

export default function StoreGrid({ filter }) {
  const [stores, setStores] = useState(null);
  const [index, setIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState(3);
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    const update = () => {
      if (window.innerWidth < 640) setVisibleCards(1);      // mobile
      else if (window.innerWidth < 1024) setVisibleCards(2); // tablet
      else setVisibleCards(3);                               // desktop
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    const fallback = setTimeout(() => {
      setStores(fallbackStoreItems);
    }, 1800);

    const unsub = firebaseBuySmartStoreSource.subscribe((data) => {
      clearTimeout(fallback);
      const activeData = (data || []).filter((item) => item?.status === "active");
      setStores(activeData.length ? activeData : fallbackStoreItems);
    });

    return () => {
      clearTimeout(fallback);
      unsub && unsub();
    };
  }, []);

  // console.log("storesd", stores)

  /* ---------------- FILTER LOGIC (A–Z / 0–9) ---------------- */
  const filteredStores = useMemo(() => {
    let activeStores = (stores || []).filter(
      (store) => store.status === "active"
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
        prev >= filteredStores.length - visibleCards ? 0 : prev + 1
      );

    }, 3000);

    return () => clearInterval(id);
  }, [filteredStores, visibleCards, reducedMotion]);


  if (stores === null) {
    return <TrendingSkeleton cards={visibleCards} />;
  }

  if (!filteredStores.length) return null;


  /* ---------------- UI ---------------- */
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
            transform: `translateX(-${index * (100 / visibleCards)}%)`,

          }}>
          {filteredStores.map((store, i) => (
            <Link key={i} href={store.link} className=" w-full sm:w-1/2 lg:w-1/3 flex-shrink-0 px-[8px] sm:px-[10px] lg:px-[12px]">
              <div
                className="
                relative flex-shrink-0
                w-full aspect-[43/24]
                rounded-xl
                overflow-hidden
                shadow-lg 
                animate-scale-in
              "
              >
             <div className="w-full h-full transition-transform duration-500 hover:scale-105 transform-gpu">
                <StoreImageCard key={store.image || store.logo || store.id || store.name} store={store} />
                </div>
                <div className="relative z-10 h-full flex flex-col justify-end px-5 pb-4 text-white">
                  {store.tag && (
                    <span className="text-[11px] font-semibold bg-white/20 px-2 py-[2px] rounded-full w-fit mb-1">
                      {store.tag}
                    </span>
                  )}

                  <h3 className="text-lg sm:text-xl font-semibold leading-tight line-clamp-1">
                    {store.name}
                  </h3>

                  {store.highlight && (
                    <p className="text-sm opacity-90 line-clamp-1">
                      {store.highlight}
                    </p>
                  )}

                  {store.offers && (
                    <p className="text-sm sm:text-base font-semibold mt-0.5">
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
        <img
          key={src}
          src={src}
          alt={store.name || "store"}
          className={`absolute inset-0 h-full w-full object-fill transition-opacity duration-500 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      ) : null}
    </>
  );
}
