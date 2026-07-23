"use client";

import { motion } from "framer-motion";
import { MapPin, Star } from "lucide-react";
import Image from "next/image";

/**
 * Google Merchant / Google Shopping promotion-style product card —
 * square product image, seller line, 2-line title, star rating, price
 * with strikethrough original + a "-X%" badge. The whole card is the
 * click target, opening the real product/store link.
 *
 * All content is real per-deal data from the live shopping APIs
 * (SerpAPI / RapidAPI / Amazon) — nothing here is hardcoded/mock.
 */
export default function DealCard({ deal, index, isGPS }) {
  const hasPrice =
    typeof deal.salePrice === "number" && typeof deal.originalPrice === "number";
  const discountPercent =
    hasPrice && deal.originalPrice > deal.salePrice
      ? Math.round(((deal.originalPrice - deal.salePrice) / deal.originalPrice) * 100)
      : null;

  const ratingValue = Number(deal.rating);
  const hasRating = Number.isFinite(ratingValue) && ratingValue > 0;

  return (
    <motion.a
      href={deal.ctaLink}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`View deal: ${deal.title}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      whileHover={{ y: -4, boxShadow: "0 14px 32px rgba(0,0,0,0.10)" }}
      className="group/card block bg-(--card) border border-(--border) rounded-xl overflow-hidden transition-all duration-300 w-full"
    >
      {/* Product image — square, contained, light backdrop (Merchant-card style) */}
      <div className="relative aspect-square w-full bg-(--muted) overflow-hidden">
        <Image
          src={deal.image}
          alt={deal.title}
          fill
          unoptimized
          sizes="(max-width: 768px) 50vw, (max-width: 1280px) 25vw, 280px"
          className="object-contain p-4 transition-transform duration-500 group-hover/card:scale-105"
        />

        {deal.computedDistance != null && deal.type === "nearby" && (
          <span
            className={`absolute top-2 left-2 text-[11px] font-semibold px-2 py-0.5 rounded-full font-secondary
              ${
                isGPS
                  ? "bg-(--anslation-ds-info-soft) text-(--anslation-ds-info)"
                  : "bg-(--card)/90 text-(--muted-foreground)"
              }`}
          >
            {deal.computedDistance} km
          </span>
        )}

        {discountPercent != null && (
          <span className="absolute top-2 right-2 text-[11px] font-bold px-2 py-0.5 rounded bg-red-600 text-white font-secondary">
            -{discountPercent}%
          </span>
        )}
      </div>

      {/* Content */}
      <div className="px-3 py-2.5">
        {/* Seller / store */}
        <p className="text-[11px] text-(--muted-foreground) font-secondary truncate mb-0.5">
          {deal.subTitle}
        </p>

        {/* Title — clamps to 2 lines, ellipsis beyond that */}
        <h3 className="text-sm text-(--card-foreground) font-medium leading-snug font-secondary line-clamp-2 min-h-9">
          {deal.title}
        </h3>

        {/* Rating — only when the source actually provided one */}
        {hasRating && (
          <div className="flex items-center gap-1 mt-1">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.round(ratingValue)
                      ? "fill-amber-400 text-amber-400"
                      : "fill-(--border) text-(--border)"
                  }`}
                />
              ))}
            </div>
            {deal.reviews ? (
              <span className="text-[11px] text-(--muted-foreground) font-secondary">
                ({deal.reviews})
              </span>
            ) : null}
          </div>
        )}

        {/* Price row */}
        <div className="flex items-baseline gap-1.5 mt-1.5 flex-wrap">
          {hasPrice ? (
            <>
              <span className="text-base font-bold text-(--card-foreground) font-primary">
                {deal.currency} {deal.salePrice}
              </span>
              {discountPercent != null && (
                <span className="text-xs text-(--muted-foreground) line-through font-secondary">
                  {deal.currency} {deal.originalPrice}
                </span>
              )}
            </>
          ) : (
            <span className="text-sm font-semibold text-(--primary) font-primary">
              {deal.offer}
            </span>
          )}
        </div>

        {/* Area / city */}
        <div className="flex items-center gap-1 mt-1.5 text-[11px] text-(--muted-foreground) font-secondary min-w-0">
          <MapPin className="w-3 h-3 shrink-0 opacity-70" />
          <span className="truncate">
            {deal.area} • {deal.city}
          </span>
        </div>
      </div>
    </motion.a>
  );
}
