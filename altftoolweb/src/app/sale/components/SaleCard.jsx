"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function SaleCard({ item, index }) {
  return (
    <motion.a
      key={item.id}
      href={item.ctaLink}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      viewport={{ once: true }}
      className="
        shrink-0
        w-46.5 md:w-51.5 h-90
        rounded-[14px]
        overflow-hidden
        border border-(--border)
        flex flex-col cursor-pointer group
      "
    >
      {/* TOP */}
      <div className="bg-[#f9f9f9] p-3 relative overflow-hidden">
        <span className="text-[11px] bg-[#2563EB] text-white px-3 py-1.5 rounded-full inline-block">
          {item.discount}
        </span>

        <div className="relative w-full h-45 mt-3">
          <Image
            src={item.image}
            alt={item.title}
            fill
            sizes="(max-width: 768px) 100vw, 320px"
            className="object-contain transition-transform duration-500 group-hover:scale-105"
          />

          {/* shimmer */}
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out pointer-events-none" />
        </div>
      </div>

      {/* BOTTOM */}
      <div className="bg-(--background) px-4 py-4 flex-1">
        <h3 className="text-sm leading-4 text-(--foreground) font-medium line-clamp-2 overflow-hidden">
          {item.title}
        </h3>

        <p className="text-[#2563EB] font-semibold text-sm mt-2">
          {item.price}
        </p>

        <p className="text-xs text-(--muted-foreground) line-through mt-1">
          {item.oldPrice}
        </p>
      </div>
    </motion.a>
  );
}
