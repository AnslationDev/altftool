"use client";

import { useState } from "react";
import { Heart, Share2, Star, Truck, ShoppingBag, Check } from "lucide-react";
import { baloo2 } from "../lib/fonts";

function StarRating({ rating }) {
  const pct = Math.max(0, Math.min(5, rating)) / 5 * 100;
  return (
    <span className="relative inline-flex shrink-0" aria-hidden="true">
      <span className="flex gap-0.5 text-[#e2ded0]">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={13} fill="currentColor" strokeWidth={0} />
        ))}
      </span>
      <span
        className="absolute inset-0 flex gap-0.5 overflow-hidden text-amber-400"
        style={{ width: `${pct}%` }}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={13} fill="currentColor" strokeWidth={0} />
        ))}
      </span>
    </span>
  );
}

export default function ProductCard({ product, saved, onToggleWishlist }) {
  const [shareState, setShareState] = useState("idle"); // idle | copied

  async function handleShare(e) {
    e.preventDefault();
    e.stopPropagation();
    const shareData = { title: product.title, url: product.url };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
    } catch {
      // user cancelled or share failed — fall through to clipboard
    }
    try {
      await navigator.clipboard.writeText(product.url);
      setShareState("copied");
      setTimeout(() => setShareState("idle"), 1600);
    } catch {
      // clipboard unavailable — nothing more we can do silently
    }
  }

  function handleWishlist(e) {
    e.preventDefault();
    e.stopPropagation();
    onToggleWishlist(product.id);
  }

  return (
    <a
      href={product.url}
      target="_blank"
      rel="noopener noreferrer nofollow sponsored"
      className="tdp-neo-card group relative flex h-full flex-col overflow-hidden bg-[#ffffff] p-2.5"
    >
      {/* image — always plain white background, per spec */}
      <div className="tdp-card-image-wrap relative aspect-square overflow-hidden rounded-[14px] border-2 border-[#171717] bg-[#ffffff]">
        {product.discountPercent > 0 && (
          <span className="absolute left-2.5 top-2.5 z-10 rounded-full border-2 border-[#171717] bg-[#FF5A5F] px-2.5 py-1 text-[11px] font-extrabold text-[#ffffff]">
            {product.discountPercent}% OFF
          </span>
        )}

        <button
          type="button"
          onClick={handleWishlist}
          aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={saved}
          className={`absolute right-2.5 top-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#171717] bg-[#ffffff] shadow-[2px_2px_0_#171717] transition-transform duration-200 hover:scale-110 ${
            saved ? "text-[#FF5A5F]" : "text-[#171717]"
          }`}
        >
          <Heart size={14} fill={saved ? "currentColor" : "none"} strokeWidth={2} />
        </button>

        <img
          src={product.img}
          alt={product.title}
          loading="lazy"
          className="tdp-card-image h-full w-full object-contain p-5"
        />
      </div>

      <div className="flex flex-1 flex-col px-1 pb-1 pt-3.5">
        {/* price + MRP (cut) + discount highlight */}
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          {product.price != null && (
            <span className={`${baloo2.className} text-xl font-extrabold text-[#171717]`}>
              ₹{product.price.toLocaleString("en-IN")}
            </span>
          )}
          {product.mrp != null && product.mrp > product.price && (
            <span className="text-xs text-[#8a8578] line-through decoration-2">
              M.R.P: ₹{product.mrp.toLocaleString("en-IN")}
            </span>
          )}
          {product.discountLabel && (
            <span className="rounded-md bg-[#e9f9ee] px-1.5 py-0.5 text-xs font-bold text-emerald-700">
              {product.discountLabel}
            </span>
          )}
        </div>

        <h3 className="mt-1.5 line-clamp-1 text-[15px] font-bold text-[#171717]">
          {product.title.split(" ").slice(0, 4).join(" ")}
        </h3>

        {/* rating stars, sized to the actual rating value */}
        {product.rating > 0 && (
          <div className="mt-1.5 flex items-center gap-1.5">
            <StarRating rating={product.rating} />
            <span className="text-xs font-semibold text-[#171717]">{product.rating.toFixed(1)}</span>
            {product.ratingLabel && (
              <span className="text-xs text-[#8a8578]">{product.ratingLabel}</span>
            )}
          </div>
        )}

        {/* delivery + last-month-bought */}
        <div className="mt-1.5 space-y-1">
          {product.deliveryDate && (
            <p className="flex items-center gap-1.5 text-xs text-[#5b5648]">
              <Truck size={12} strokeWidth={2.2} />
              Delivery by {product.deliveryDate}
            </p>
          )}
          {product.boughtLabel && (
            <p className="flex items-center gap-1.5 text-xs text-[#5b5648]">
              <ShoppingBag size={12} strokeWidth={2.2} />
              {product.boughtLabel}
            </p>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between pt-3">
          <button
            type="button"
            onClick={handleShare}
            aria-label="Share product"
            className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#171717] bg-[#ffffff] text-[#171717] transition-transform duration-200 hover:scale-110"
          >
            {shareState === "copied" ? <Check size={13} /> : <Share2 size={13} />}
          </button>

          <span className="tdp-neo-chip flex items-center gap-1 bg-[#4CC9F0] px-3 py-1.5 text-xs text-[#171717]">
            View Deal
          </span>
        </div>
      </div>
    </a>
  );
}
