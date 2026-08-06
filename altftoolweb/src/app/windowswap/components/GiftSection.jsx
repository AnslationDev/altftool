"use client";

import React from "react";
import Link from "next/link";
import "../style/GiftSection.css";

export default function GiftSection() {
  return (
    <section className="windowswap-gift windowswap-section w-full py-16 px-6 min-h-[36rem] flex flex-col items-center text-center border-t border-border">

      {/* Premium hand-drawn sketchy gift box image */}
      <div className="windowswap-gift-illustration relative mb-6 flex flex-col items-center">
        <img
          src="/windowswap-assets/gift windowswap.png"
          alt="Gift WindowSwap!"
          className="w-80 h-70 object-contain select-none pointer-events-none"
        />
      </div>

      <h2 className="windowswap-gift-title font-display text-xl md:text-2xl font-extrabold tracking-normal max-w-md mb-6 leading-snug" style={{color: 'var(--windowswap-foreground)'}}>
        Preview a local gift draft
      </h2>

      <p className="mb-6 max-w-md text-sm text-muted-foreground">
        Gift subscriptions and email delivery are not available. The preview
        saves a draft only in your browser and never charges anyone.
      </p>

      <Link
        href="/windowswap/sendGift"
        className="windowswap-gift-cta windowswap-primary-button px-8 py-3.5 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 font-semibold tracking-wide text-sm cursor-pointer inline-block"
      >
        Create a local gift draft
      </Link>

    </section>
  );
}
