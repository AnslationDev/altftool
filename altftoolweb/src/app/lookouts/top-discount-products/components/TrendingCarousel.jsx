"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { TrendingUp, Star } from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import { baloo2 } from "../lib/fonts";

export default function TrendingCarousel({ products }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start", dragFree: true }, [
    Autoplay({ delay: 2800, stopOnInteraction: false }),
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback((api) => {
    setSelectedIndex(api.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return undefined;
    onSelect(emblaApi);
    emblaApi.on("select", onSelect);
    return () => emblaApi.off("select", onSelect);
  }, [emblaApi, onSelect]);

  if (!products.length) return null;

  return (
    <section className="relative overflow-hidden border-y-[3px] border-[#171717] bg-[#FFE566] px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[#171717] bg-[#FF5A5F] text-[#ffffff]">
              <TrendingUp size={19} strokeWidth={2.2} />
            </span>
            <div>
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#c02328]">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FF5A5F] opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#FF5A5F]" />
                </span>
                Hot right now
              </p>
              <h2 className={`${baloo2.className} text-xl font-extrabold text-[#171717] sm:text-2xl`}>
                Trending Deals
              </h2>
            </div>
          </div>
        </ScrollReveal>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4">
            {products.map((p, i) => (
              <a
                key={p.id}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer nofollow sponsored"
                className="tdp-neo-card group flex w-60 shrink-0 flex-col overflow-hidden bg-[#ffffff] p-2"
              >
                <div className="relative aspect-square overflow-hidden rounded-[14px] border-2 border-[#171717] bg-[#ffffff]">
                  <span className="absolute left-2.5 top-2.5 z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#171717] bg-[#FF5A5F] text-[11px] font-extrabold text-[#ffffff]">
                    {i + 1}
                  </span>
                  <span className="absolute right-2.5 top-2.5 z-10 rounded-full border-2 border-[#171717] bg-[#171717] px-2 py-0.5 text-[10px] font-bold text-[#ffffff]">
                    {p.discountPercent}% OFF
                  </span>
                  <img
                    src={p.img}
                    alt={p.title}
                    loading="lazy"
                    className="tdp-card-image h-full w-full object-contain p-4"
                  />
                </div>
                <div className="flex flex-1 flex-col px-1.5 pb-1 pt-3">
                  <span className={`${baloo2.className} text-base font-extrabold text-[#171717]`}>
                    ₹{p.price?.toLocaleString("en-IN")}
                  </span>
                  <h3 className="mt-0.5 line-clamp-1 text-sm font-bold text-[#171717]">
                    {p.title.split(" ").slice(0, 4).join(" ")}
                  </h3>
                  {p.rating > 0 && (
                    <span className="mt-1 flex items-center gap-1 text-xs text-[#5b5648]">
                      <Star size={12} className="text-amber-500" fill="currentColor" strokeWidth={0} />
                      {p.rating.toFixed(1)}
                    </span>
                  )}
                </div>
              </a>
            ))}
          </div>
        </div>

        <div className="mt-5 flex justify-center gap-1.5" aria-hidden="true">
          {products.slice(0, 8).map((p, index) => (
            <button
              key={p.id}
              type="button"
              tabIndex={-1}
              onClick={() => emblaApi?.scrollTo(index)}
              className={`h-2 rounded-full border border-[#171717] transition-all duration-300 ${
                index === selectedIndex ? "w-6 bg-[#FF5A5F]" : "w-2 bg-[#ffffff]"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
