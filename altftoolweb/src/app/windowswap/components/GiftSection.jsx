"use client";

import React from "react";
import Link from "next/link";
import "../style/GiftSection.css";

export default function GiftSection() {
  return (
    <section className="windowswap-gift w-full bg-[#12333d] py-16 px-6 h-150 flex flex-col items-center text-center border-t border-white/5 ">

      {/* Premium hand-drawn sketchy gift box image */}
      <div className="windowswap-gift-illustration relative mb-6 flex flex-col items-center">
        <img
          src="/windowswap-assets/gift windowswap.png"
          alt="Gift WindowSwap!"
          className="w-80 h-70 object-contain select-none pointer-events-none"
        />
      </div>

      <h2 className="windowswap-gift-title font-serif text-xl md:text-2xl font-light tracking-wide text-windowswap-peach max-w-md mb-6 leading-snug">
        A gift of calm for someone you love
      </h2>

      <Link
        href="/windowswap/sendGift"
        className="windowswap-gift-cta bg-[#df8664] hover:bg-[#d07353] text-white px-8 py-3.5 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg font-semibold tracking-wide text-sm cursor-pointer inline-block"
      >
        Gift WindowSwap All-Access
      </Link>

    </section>
  );
}
