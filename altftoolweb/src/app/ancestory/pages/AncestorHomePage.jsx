'use client'
/* eslint-disable @next/next/no-img-element */

import { AncestorSearchPanel } from "../components/AncestorSearchPanel";
import { AncestorNameOfDay } from "../components/AncestorNameOfDay";
import { AncestorPopularNames } from "../components/AncestorPopularNames";
import { AncestorPromoSection } from "../components/AncestorPromoSection";
import { AncestorFAQ } from "../components/AncestorFAQ";

function AncestorHeroSection() {
  return (
    <section className="bg-white dark:bg-(--background) pb-14 pt-8">
      <div className="max-w-6xl mx-auto px-6">
        <div className="relative flex flex-col items-center">
          <div className="relative w-full max-w-5xl">
            <img 
              src="/ancestory-images/home-hero.avif" 
              alt="altfestory Heritage"
              className="w-full h-auto block mx-auto"
            />
            <div className="absolute inset-x-0 bottom-[15%] text-center px-6">
              <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow-md leading-tight" style={{ fontFamily: "Georgia, serif" }}>
                Discover the meaning and history behind <span className="text-[#97c53f]">your name.</span>
              </h1>
            </div>
          </div>
        </div>

        <p className="text-center text-[#5c5c5a] dark:text-(--secondary-foreground) mt-12 mb-2 text-sm md:text-base">
          Your name gives you a sense of identity and helps you discover who you are and where you come from.
        </p>
        <p className="text-center text-[#5c5c5a] dark:text-(--secondary-foreground) mb-8 text-sm md:text-base">Enter a name to learn its meaning and origin.</p>

        <AncestorSearchPanel large placeholder="First or last name" />
      </div>
    </section>
  );
}

function AncestorCuriositySection() {
  return (
    <section className="bg-[#f6f7f5] dark:bg-(--background) py-20 border-t border-[#e2e2de] dark:border-(--border)">
      <div className="max-w-5xl mx-auto px-6 text-center">
        <h2 className="text-5xl text-[#2f2f2e] dark:text-(--foreground) mb-3" style={{ fontFamily: "Georgia, serif" }}>What are you curious about?</h2>
        <p className="text-[#5b5b58] dark:text-(--secondary-foreground) mb-10">Ready to learn more about your own family? Here are two ways to begin.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Card 1: Free Trial */}
          <div className="group bg-[#f8f9f7] dark:bg-(--muted-gray) rounded-[32px] p-8 border border-[#e2e2de] dark:border-(--border) hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="h-48 rounded-2xl bg-[#d7e0d2] dark:bg-(--muted) mb-8 overflow-hidden flex items-center justify-center p-4">
              <img 
                src="/ancestory-images/promo-trial.avif" 
                alt="Get a free trial" 
                className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="text-center">
              <button className="bg-[#005831] hover:bg-[#004526] text-white font-bold px-8 py-3 rounded-full shadow-md hover:shadow-lg transition-all active:scale-95">
                Get a free trial
              </button>
            </div>
          </div>

          {/* Card 2: altfestoryDNA */}
          <div className="group bg-[#f8f9f7] dark:bg-(--muted-gray) rounded-[32px] p-8 border border-[#e2e2de] dark:border-(--border) hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="h-48 rounded-2xl bg-[#d9e5ed] dark:bg-(--muted) mb-8 overflow-hidden flex items-center justify-center p-4">
              <img 
                src="/ancestory-images/promo-dna.avif" 
                alt="Order altfestoryDNA" 
                className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="text-center">
              <button className="bg-[#005831] hover:bg-[#004526] text-white font-bold px-8 py-3 rounded-full shadow-md hover:shadow-lg transition-all active:scale-95">
                Order altfestoryDNA
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function AncestorHomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-(--background)">
      <AncestorHeroSection />
      <AncestorNameOfDay />
      <AncestorPopularNames />
      <AncestorPromoSection />
      <AncestorCuriositySection />
      <AncestorFAQ />
    </div>
  );
}
