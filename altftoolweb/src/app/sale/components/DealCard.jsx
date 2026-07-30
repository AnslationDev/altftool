"use client";

import { motion } from "framer-motion";
import { Heart, Star } from "lucide-react";
import SmartProductImage from "@/lib/sale/SmartProductImage";

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
      initial={{ y: 20 }}
      animate={{ y: 0 }}
      transition={{ delay: index * 0.04 }}
      whileHover={{ y: -4, boxShadow: "0 14px 32px rgba(0,0,0,0.10)" }}
      className="group/card block bg-(--card) border border-(--border) rounded-2xl overflow-hidden transition-all duration-300 w-full"
    >
      <div className="relative aspect-[4/5] w-full">
        <div className="absolute inset-0 rounded-t-2xl overflow-hidden bg-(--muted)">
          <SmartProductImage
            src={deal.image}
            alt={deal.title}
            fill
            className="object-cover transition-transform duration-500 group-hover/card:scale-105"
          />
        </div>

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

        {/* Wishlist heart */}
        <span className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/95 shadow-sm flex items-center justify-center z-10">
          <Heart className="w-3.5 h-3.5 text-rose-500" />
        </span>

        {/* Rating badge — floats half over the image, half over the content */}
        {hasRating && (
          <div className="absolute -bottom-3.5 left-3 z-10 flex items-center gap-1 bg-white rounded-md shadow-md px-2 py-1">
            {deal.subTitle && (
              <span className="text-[10px] font-bold text-rose-500 pr-1 border-r border-(--border) font-secondary truncate max-w-[70px]">
                {deal.subTitle}
              </span>
            )}
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="text-[11px] font-semibold text-(--muted-foreground)  font-secondary">
              {ratingValue.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-3.5 pt-5 pb-3">
        {/* Title */}
        <h3 className="text-[15px] text-(--card-foreground) font-semibold leading-snug font-secondary line-clamp-1">
          {deal.title}
        </h3>

        {/* Area / city */}
        <p className="text-xs text-(--muted-foreground) font-secondary truncate mt-0.5">
          {deal.area || deal.city}
        </p>

        {/* Offer text */}
        {deal.offerText && (
          <p className="text-xs text-(--muted-foreground) font-secondary truncate mt-1">
            {deal.offerText}
          </p>
        )}

        <div className="border-t border-(--border) mt-2.5 pt-2.5 flex items-end justify-between gap-2">
          {/* Price */}
          <div className="flex flex-col leading-tight">
            {hasPrice ? (
              <>
                {discountPercent != null && (
                  <span className="text-xs text-(--muted-foreground) line-through font-secondary">
                    {deal.currency} {deal.originalPrice}
                  </span>
                )}
                <span className="text-lg font-bold text-emerald-600 font-primary">
                  {deal.currency} {deal.salePrice}
                </span>
              </>
            ) : (
              <span className="text-sm font-semibold text-(--primary) font-primary">
                {deal.offer}
              </span>
            )}
          </div>

          {/* Discount badge */}
          {discountPercent != null && (
            <span className="text-xs font-bold px-2 py-1 rounded-md bg-rose-50 text-rose-500 font-secondary whitespace-nowrap">
              {discountPercent}% OFF
            </span>
          )}
        </div>
      </div>
    </motion.a>
  );
}
