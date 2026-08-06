"use client";

import React from "react";
import Link from "next/link";
import "../style/AllAccessSection.css";

export default function AllAccessSection() {
  return (
    <section id="all-access" className="windowswap-all-access windowswap-section w-full py-16 px-6 sm:px-12 md:px-24 flex flex-col items-center">

      <div className="max-w-9xl w-full mx-auto grid grid-cols-1 lg:grid-cols-[1.25fr_0.85fr] gap-16 items-center">

        {/* Left Card: Window view with cat */}
        <div className="windowswap-all-access-card windowswap-card relative group overflow-hidden w-full max-w-[960px] h-[560px] sm:h-[500px] lg:h-[560px] select-none mx-auto lg:mx-0">
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

          <span className="text-[10px] tracking-[0.2em] font-semibold uppercase" style={{color: 'var(--windowswap-muted)'}}>ALL-ACCESS CONCEPT — NOT AVAILABLE</span>
          <div className="windowswap-rule h-[2px] w-14 mt-3 mb-8 rounded-full" />

          <p className="font-display text-xl md:text-[22px] leading-relaxed font-bold mb-8 max-w-sm" style={{color: 'var(--windowswap-foreground)'}}>
            Preview features that could be part of a future membership. There is no account, subscription, billing, or creator payout system today.
          </p>

          <Link
            href="/windowswap/pricing"
            className="windowswap-all-access-cta windowswap-primary-button px-8 py-3 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 font-semibold tracking-wide text-xs cursor-pointer inline-block"
          >
            View the concept — no purchase
          </Link>

        </div>

      </div>
    </section>
  );
}
