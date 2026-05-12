'use client'

import Link from "next/link";
import { POPULAR_NAMES } from "../utils/constants.jsx";

function AncestorPopularNameCard({ item }) {
  return (
    <Link href={`/ancestory/meaning?type=first&first=${encodeURIComponent(item.name)}`}>
      <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-[#005831]/30 hover:shadow-md transition-all cursor-pointer group dark:bg-(--muted) dark:border-(--border)">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold text-sm dark:bg-(--muted-gray) dark:text-(--secondary-foreground)">
            {item.rank}
          </span>
          <h4 className="text-lg font-bold text-gray-900 dark:text-(--foreground) group-hover:text-[#005831] transition-colors">
            {item.name}
          </h4>
        </div>
        <p className="text-xs text-gray-400 dark:text-(--muted-foreground)">
          Country of origin: <span className="text-gray-600 dark:text-(--secondary-foreground)">{item.origin}</span>
        </p>
        <p className="text-xs text-[#005831] mt-1 font-medium">{item.meaning}</p>
      </div>
    </Link>
  );
}

export function AncestorPopularNames() {
  return (
    <section className="py-16 bg-[#f8f8f6] relative overflow-hidden dark:bg-(--background)">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.04]">
        <svg viewBox="0 0 1400 700" className="w-full h-full object-cover">
          <ellipse cx="250" cy="270" rx="200" ry="140" fill="#005831" />
          <ellipse cx="560" cy="240" rx="160" ry="120" fill="#005831" />
          <ellipse cx="770" cy="230" rx="130" ry="110" fill="#005831" />
        </svg>
      </div>
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-(--foreground) text-center mb-2" style={{ fontFamily: "Georgia, serif" }}>
          The most popular first names from 1900 to 1999*
        </h2>
        <p className="text-center text-gray-500 dark:text-(--muted-foreground) text-sm mb-10 max-w-xl mx-auto">
          Discover the stories behind the names that defined a century.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          {POPULAR_NAMES.map((item) => (
            <AncestorPopularNameCard key={item.rank} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
