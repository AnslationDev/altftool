"use client";

import React from "react";
import "../style/TipJarSection.css";

export default function TipJarSection({ onOpenSupport }) {
  return (
    <section className="windowswap-tipjar relative w-full h-screen flex flex-col justify-center items-center p-6 text-center overflow-hidden bg-zinc-950">

      {/* Full-width panoramic background photo */}
      <div className="windowswap-tipjar-overlay absolute inset-0 bg-black/40 z-10" />
      <img
        src="/windowswap-assets/tip-jar-bg.png"
        alt="Open window overlooking turquoise sea view"
        className="windowswap-tipjar-image absolute inset-0 w-full h-full object-cover opacity-80 z-0 pointer-events-none hover:scale-102 transition duration-[5000ms] select-none"
      />

      {/* Main Overlay Content */}
      <div className="windowswap-tipjar-content relative z-20 max-w-2xl flex flex-col items-center px-6">
        <h2 className="windowswap-tipjar-title font-serif text-5xl md:text-6xl font-bold tracking-wide text-white mb-6 drop-shadow-md">
          The Tip Jar
        </h2>

        <p className="windowswap-tipjar-copy font-serif text-base md:text-lg text-white leading-relaxed font-light mb-8 max-w-xl drop-shadow-sm">
          Send some virtual tips/thanks for sharing windows, or receive tips from someone who loved yours
        </p>

        <button
          onClick={onOpenSupport}
          className="windowswap-tipjar-cta bg-white hover:bg-zinc-100 text-zinc-950 px-10 py-3 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg font-semibold tracking-wide text-xs cursor-pointer"
        >
          Find out how
        </button>
      </div>

      <div className="windowswap-tipjar-credit absolute bottom-4 left-6 text-[10px] tracking-widest text-zinc-200 z-20 pointer-events-none">
        Alessio - Tellaro, Italy
      </div>
    </section>
  );
}
