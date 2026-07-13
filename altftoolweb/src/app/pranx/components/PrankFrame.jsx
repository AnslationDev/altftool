"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { findPrank, getPrankImage, navGroups } from "../data/pranxData";
import { secondaryButton } from "./uiClasses";
import AdSidebar from "@/ads/layouts/shared/AdSidebar";
import AdBottomBanner from "@/ads/layouts/shared/AdBottomBanner";

export default function PrankFrame({ prank, children, wide = false }) {
  const Icon = prank.icon;
  const image = getPrankImage(prank);
  return (
    <main className={`mx-auto w-full ${wide ? "max-w-[1500px]" : "max-w-7xl"} px-4 py-6 text-white sm:px-6 sm:py-8`}>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/pranx" className={secondaryButton}>
          <ArrowLeft className="h-4 w-4" /> All pranks
        </Link>
        <div className="flex flex-wrap gap-2">
          {navGroups.flatMap((group) => group.items).slice(0, 5).map((slug) => {
            const item = findPrank(slug);
            return item ? (
              <Link key={slug} href={`/pranx/${slug}`} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-black text-slate-200">
                {item.title}
              </Link>
            ) : null;
          })}
        </div>
      </div>
      <header className="mb-6 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] shadow-2xl shadow-black/20">
        <div className="grid min-w-0 gap-0 lg:grid-cols-[1fr_22rem]">
          <div className="flex min-w-0 items-start gap-4 p-5 sm:p-8">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-indigo-500/20 text-indigo-200">
              <Icon className="h-7 w-7" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-200">{prank.category}</p>
              <h1 className="mt-2 break-words text-3xl font-black leading-tight sm:text-5xl">{prank.title}</h1>
              <p className="mt-3 max-w-4xl break-words text-sm leading-6 text-slate-300 sm:text-base">{prank.description}</p>
            </div>
          </div>
          <div className="relative min-h-[210px] border-t border-white/10 bg-slate-900 lg:border-l lg:border-t-0">
            <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-90" />
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950/10 via-slate-950/20 to-slate-950/85" />
            <div className="absolute bottom-4 left-4 right-4">
              <span className="inline-flex rounded-full bg-black/45 px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-white backdrop-blur">local visual asset</span>
            </div>
          </div>
        </div>
      </header>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0">
          {children}
          <div className="mt-8">
            <AdBottomBanner ad={{ bannerUrl: "/banners/rectangle-long.png", redirect: "#" }} />
          </div>
        </div>
        <div className="w-full lg:w-[250px] shrink-0 sticky top-24 h-fit">
          <AdSidebar ad={{ bannerUrl: "/banners/vertical.jpg", redirect: "#" }} />
        </div>
      </div>
    </main>
  );
}
