"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight, Flame, ImageOff } from "lucide-react";
import SmartProductImage from "@/lib/sale/SmartProductImage";

function CardWrapper({ item, children }) {
  const isExternal = item.link?.startsWith("http");

  if (isExternal) {
    return (
      <a href={item.link} target="_blank" rel="noopener noreferrer" className="block h-full">
        {children}
      </a>
    );
  }

  return (
    <Link href={item.link || "#"} className="block h-full">
      {children}
    </Link>
  );
}

/** Extracts a numeric amount from a formatted price string (e.g. "₹1,499" → 1499). */
function parseAmount(value) {
  if (typeof value !== "string") return null;
  const cleaned = value.replace(/[^0-9.]/g, "");
  return cleaned ? Number(cleaned) : null;
}

function DealTile({ item, heightClass, sizes }) {
  const [imgFailed, setImgFailed] = useState(false);

  const price = parseAmount(item.price);
  const oldPrice = parseAmount(item.oldPrice);
  const discountPercent =
    price != null && oldPrice != null && oldPrice > price
      ? Math.round(((oldPrice - price) / oldPrice) * 100)
      : null;

  return (
    <CardWrapper item={item}>
      <div
        className={`relative overflow-hidden rounded-2xl ${heightClass} cursor-pointer group border border-(--border) bg-(--muted) transition-shadow duration-300 hover:shadow-[0_16px_36px_rgba(0,0,0,0.16)]`}
      >
        {!imgFailed ? (
          <>
            {/* Blurred backdrop — the source thumbnails from the shopping
                API are small (~200px), so stretching one copy edge-to-edge
                reads as an intentional soft backdrop instead of a blurry
                mistake, while the sharp copy below stays much closer to
                its native size. */}
            <Image
              src={item.image}
              alt=""
              aria-hidden="true"
              fill
              unoptimized
              sizes={sizes}
              className="object-cover scale-12 blur-2xl "
            />
            {/* Sharp product shot — centered, not stretched to fill the
                whole card, so it stays as crisp as the source allows.
                White studio backgrounds are cut to transparent so the
                product sits on the blurred backdrop instead of a white box. */}
            <div className="absolute inset-6 md:inset-8">
              <SmartProductImage
                src={item.image}
                alt={item.title}
                fill
                className="object-cover"
                onError={() => setImgFailed(true)}
              />
            </div>
          </>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-(--muted-foreground)">
            <ImageOff className="h-6 w-6" />
            <span className="text-xs font-secondary">Image unavailable</span>
          </div>
        )}

        {/* Discount badge — only shown when a real, computable discount exists */}
        {discountPercent != null && discountPercent > 0 && (
          <span className="absolute top-3 left-3 rounded-full bg-rose-500 px-2.5 py-1 text-[11px] font-bold text-white font-secondary shadow-sm">
            {discountPercent}% OFF
          </span>
        )}

        {/* Hover CTA */}
        <span className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-neutral-800 opacity-0 shadow-sm transition-all duration-300 -translate-y-1 group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight className="h-4 w-4" />
        </span>

        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/85 via-black/35 to-transparent p-4 pt-10">
          <p className="text-white font-semibold text-sm md:text-base line-clamp-1">{item.title}</p>
          {item.price && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-white font-bold text-sm md:text-base">{item.price}</span>
              {item.oldPrice && (
                <span className="text-white/60 text-xs line-through">{item.oldPrice}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </CardWrapper>
  );
}

export default function DealOfDay({ dealOfDay = [] }) {
  const topCards = (dealOfDay || []).filter((item) => item.row === "top");
  const bottomCards = (dealOfDay || []).filter((item) => item.row === "bottom");
  const hasDeals = topCards.length > 0 || bottomCards.length > 0;

  return (
    <section className="section bg-(--background)">
      {/* Heading */}
      <div className="mb-6 md:mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="section-title text-left! mb-2">Deal Of The Day</h2>
          <p className="text-(--muted-foreground) text-sm md:text-lg font-secondary">
            Limited-Time Deals On Top Picks. Grab Them Before They&rsquo;re Gone.
          </p>
        </div>

        {hasDeals && (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-(--border) bg-(--muted) px-3 py-1.5 text-xs font-semibold text-(--primary) font-secondary">
            <Flame className="h-3.5 w-3.5" />
            Today&rsquo;s Picks
          </span>
        )}
      </div>

      {!hasDeals ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-(--border) py-16 text-center">
          <p className="font-semibold text-(--foreground) font-primary">No deals available right now</p>
          <p className="text-sm text-(--muted-foreground) font-secondary">Check back soon for today&rsquo;s top picks.</p>
        </div>
      ) : (
        <>
          {/* TOP ROW */}
          {topCards.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
              {topCards.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.35, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className={item.size === "wide" ? "lg:col-span-7" : "lg:col-span-5"}
                >
                  <DealTile
                    item={item}
                    heightClass="h-[255px] md:h-[310px] lg:h-[275px] xl:h-[360px]"
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 58vw, 720px"
                  />
                </motion.div>
              ))}
            </div>
          )}

          {/* BOTTOM ROW */}
          {bottomCards.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {bottomCards.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.35, delay: index * 0.05 }}
                  viewport={{ once: true }}
                >
                  <DealTile
                    item={item}
                    heightClass="h-[235px] md:h-[265px] xl:h-[293px]"
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 420px"
                  />
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
