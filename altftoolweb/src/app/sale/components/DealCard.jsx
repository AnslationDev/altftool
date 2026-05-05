"use client";

import { motion } from "framer-motion";
import { MapPin, ArrowUpRight } from "lucide-react";
import Image from "next/image";

export default function DealCard({ deal, index, isGPS }) {
  return (
    <motion.div
      key={deal.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      whileHover={{
        y: -6,
        boxShadow: "0 18px 44px rgba(0,0,0,0.13)",
      }}
      className="bg-(--background) border border-(--border) rounded-[20px] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.08)] transition-all duration-300 group/card w-full flex flex-col"
    >
      {/* Image */}
      <div className="relative overflow-hidden h-52 shrink-0 rounded-t-[20px]">
        <Image
          src={deal.image}
          alt={deal.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 380px"
          className="object-cover transition-transform duration-500 group-hover/card:scale-[1.06]"
        />

        {/* Shimmer */}
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover/card:translate-x-full transition-transform duration-700 ease-in-out pointer-events-none" />
      </div>

      {/* Content */}
      <div className="px-4 pt-3.5 pb-4 flex flex-col flex-1">
        {/* Title */}
        <h3 className="font-bold text-(--card-foreground) text-[17px] leading-snug font-primary">
          {deal.title}
        </h3>

        {/* Subtitle */}
        <p className="text-[13.5px] text-(--muted-foreground) font-secondary mt-1 mb-2 line-clamp-1">
          {deal.subTitle}
        </p>

        <div className="h-px bg-(--border) mb-3" />

        {/* Location */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 text-[12.5px] text-(--muted-foreground) font-secondary min-w-0">
            <MapPin className="w-3.5 h-3.5 shrink-0 opacity-70" />
            <span className="truncate">
              {deal.area} • {deal.city}
            </span>
          </div>

          {deal.computedDistance != null && deal.type === "nearby" && (
            <div
              className={`flex items-center gap-1 text-[11px] font-semibold shrink-0 px-2.5 py-1 rounded-full
                ${
                  isGPS
                    ? "bg-blue-50 border border-blue-200 text-blue-700"
                    : "bg-(--muted)/10 text-(--muted-foreground)"
                }`}
            >
              {deal.computedDistance} km away
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-col leading-tight">
            <span className="text-2xl font-bold text-blue-600 font-primary mb-1">
              {deal.offer}
            </span>
            <span className="text-[12.5px] text-(--muted-foreground) font-secondary line-clamp-1">
              {deal.offerText}
            </span>
          </div>

          {/* CTA */}
          <a
            href={deal.ctaLink}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Claim deal: ${deal.title}`}
            className="ml-auto group/cta relative inline-flex items-center justify-center
              w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12
              rounded-full bg-(--primary) text-white overflow-hidden transition-all duration-200"
          >
            <span className="relative w-5 h-5 sm:w-6 sm:h-6 overflow-hidden">
              <ArrowUpRight className="absolute inset-0 w-full h-full transition-all duration-300 group-hover/cta:translate-x-1.5 group-hover/cta:-translate-y-1.5 group-hover/cta:opacity-0" />
              <ArrowUpRight className="absolute inset-0 w-full h-full -translate-x-1.5 translate-y-1.5 opacity-0 transition-all duration-300 group-hover/cta:translate-x-0 group-hover/cta:translate-y-0 group-hover/cta:opacity-100" />
            </span>
          </a>
        </div>
      </div>
    </motion.div>
  );
}
