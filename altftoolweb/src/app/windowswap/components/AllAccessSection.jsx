"use client";

import React from "react";
import Link from "next/link";
import "../style/AllAccessSection.css";

export default function AllAccessSection() {
  return (
    <section id="all-access" className="windowswap-all-access w-full bg-[#133d45] py-16 px-6 sm:px-12 md:px-24 flex flex-col items-center">

      <div className="max-w-9xl w-full mx-auto grid grid-cols-1 lg:grid-cols-[1.25fr_0.85fr] gap-16 items-center">

        {/* Left Card: Window view with cat */}
        <div className="windowswap-all-access-card relative group rounded-none overflow-hidden shadow-2xl w-full max-w-[960px] h-[560px] sm:h-[500px] lg:h-[560px] bg-zinc-900 select-none mx-auto lg:mx-0">
          <img
            src="/windowswap-assets/all-access-bg.jpg"
            alt="Cozy Edinburgh autumn window view"
            className="w-full h-full object-cover group-hover:scale-105 transition duration-[3000ms] ease-out opacity-85 pointer-events-none"
          />
          <div className="absolute inset-0 bg-black/15 pointer-events-none" />

          {/* Core overlay titles matching screenshot exactly (bold serif, no italics) */}
          <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-6 pointer-events-none select-none">
            <h3 className="font-serif text-5xl md:text-[56px] font-bold tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] leading-none">
              WindowSwap
            </h3>
            <h4 className="font-serif text-4xl md:text-[48px] font-bold tracking-tight text-white mt-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] leading-none">
              All-Access
            </h4>
          </div>

          <div className="absolute bottom-6 left-6 text-xs text-white/90 font-medium pointer-events-none drop-shadow-sm">
            Idil - Edinburgh, Scotland
          </div>
        </div>

        {/* Right Panel: Text and details */}
        <div className="windowswap-all-access-copy flex flex-col items-start lg:pl-4 text-left max-w-[620px] mx-auto lg:mx-0">

          <span className="text-[10px] tracking-[0.2em] font-semibold text-zinc-300/80 uppercase">WINDOWSWAP ALL-ACCESS</span>
          <div className="h-[1px] w-14 bg-white/20 mt-3 mb-8" />

          <p className="font-serif text-xl md:text-[22px] text-[#df8664] leading-relaxed font-normal mb-8 max-w-sm">
            Get access to all windows ever uploaded, unlimited bookmarks, playlists and even a back button.
          </p>

          <Link
            href="/windowswap/pricing"
            className="windowswap-all-access-cta bg-[#df8664] hover:bg-[#d07353] text-white px-8 py-3 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 shadow-md font-semibold tracking-wide text-xs cursor-pointer inline-block"
          >
            Upgrade for $5 monthly
          </Link>

        </div>

      </div>
    </section>
  );
}
