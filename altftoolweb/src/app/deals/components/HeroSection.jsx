"use client";

import { BadgeCheck, Gem, ShieldCheck, Zap } from "lucide-react";

import CountdownTimer from "./CountdownTimer";
import { getDeals, getTotalSavings } from "../data/deals";

const TRUST_ITEMS = [
  { icon: BadgeCheck, text: "Handpicked ALTFTool products" },
  { icon: ShieldCheck, text: "100% free — no credit card, ever" },
  { icon: Zap, text: "Instant access, no signup" },
];

export default function HeroSection() {
  const dealCount = getDeals().length;
  const totalSavings = getTotalSavings();

  const scrollToBrowse = () => {
    document.getElementById("browse-deals")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="section pt-10 pb-6 md:pt-14">
      <div className="mx-auto max-w-3xl text-center">
        <span className="afd-badge afd-badge-free mb-4 inline-flex">
          <Gem className="h-3.5 w-3.5" aria-hidden="true" />
          AltF Deals — every deal is 100% off, forever
        </span>
        <h1 className="text-4xl font-extrabold leading-tight text-(--foreground) md:text-5xl">
          Premium software deals.
          <span className="afd-gradient-text block">Price: free. Lifetime: yours.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-(--muted-foreground) md:text-lg">
          {dealCount} handpicked tools that replace ~${totalSavings.toLocaleString()}/yr of software
          subscriptions — built by ALTFTool, free for everyone, no strings attached.
        </p>

        <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <button type="button" onClick={scrollToBrowse} className="afd-cta max-w-55">
            Shop the deals
          </button>
        </div>

        <div className="mt-8 flex justify-center">
          <CountdownTimer />
        </div>

        <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {TRUST_ITEMS.map((item) => (
            <li key={item.text} className="flex items-center gap-2 text-sm text-(--muted-foreground)">
              <item.icon className="h-4 w-4 text-(--primary)" aria-hidden="true" />
              {item.text}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
