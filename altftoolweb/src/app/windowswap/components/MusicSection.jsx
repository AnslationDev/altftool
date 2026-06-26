"use client";

import React from "react";
import "../style/MusicSection.css";

export default function MusicSection() {
  return (
    <section id="music" className="windowswap-music windowswap-section w-full py-20 px-6 sm:px-12 md:px-16 lg:px-20">
      <div className="max-w-[1360px] mx-auto grid grid-cols-1 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.56fr)] gap-12 lg:gap-14 items-start">

        {/* Left: Responsive iframe embed */}
        <div className="windowswap-music-frame windowswap-card relative w-full max-w-[860px] aspect-[16/9] overflow-hidden select-none">
          <iframe
            src="https://player.vimeo.com/video/522685321?autoplay=0&loop=1&color=df8664&title=0&byline=0&portrait=0&muted=1"
            className="absolute inset-0 w-full h-full"
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>

        {/* Right: Text descriptions and actions */}
        <div className="windowswap-music-copy flex flex-col items-start text-left lg:pt-10 lg:pl-4 max-w-[320px]">

          <span className="text-xs tracking-[0.3em] font-semibold text-windowswap-cream uppercase mb-3">WINDOWSWAP PLAYLISTS</span>
          <div className="windowswap-rule h-[2px] w-16 mb-8 rounded-full" />

          <p className="font-display text-[22px] md:text-[28px] leading-[1.08] font-extrabold mb-4 max-w-[250px]" style={{color: 'var(--windowswap-foreground)'}}>
            <span className="block">50 Windows.</span>
            <span className="block">30 Countries.</span>
            <span className="block">3 Artists.</span>
            <span className="block">1 Digital Choir.</span>
            <span className="block mt-2">A worldwide collaborative music video.</span>
          </p>

        </div>

      </div>
    </section>
  );
}
