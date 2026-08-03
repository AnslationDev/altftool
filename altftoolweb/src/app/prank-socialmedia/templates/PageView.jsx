"use client";

import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  ChevronRight,
  MessageCircle,
  Search,
  Sparkles,
  Star,
  Video,
} from "lucide-react";
import { Navbar } from "../components/site/Navbar";
import { TEMPLATES } from "../lib/templates";
import { Button } from "../components/ui/button";

export default function TemplatesPage() {
  return (
    <div className="min-h-screen bg-hero animate-gradient">
      <Navbar />
      <section className="relative mx-auto max-w-[1500px] overflow-hidden px-5 pb-12 pt-12">
        <HeroHeader />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
          {TEMPLATES.map((t, i) => (
            <Link
              key={t.slug}
              href={`/prank-socialmedia/editor/${t.slug}`}
              style={{ animationDelay: `${Math.min(i, 18) * 25}ms` }}
              className="group animate-fade-up rounded-xl border border-slate-200 bg-white p-4 shadow-soft transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-glow"
            >
              <div className="flex items-start justify-between gap-3">
                <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br ${t.accent} text-white shadow-sm`}>
                  <t.icon className="h-4 w-4" />
                </div>
                <ChevronRight className="mt-1 h-4 w-4 text-slate-300 transition group-hover:text-blue-500" />
              </div>
              <h3 className="mt-4 line-clamp-1 text-sm font-bold text-slate-950">{t.name}</h3>
              <p className="mt-1 line-clamp-2 min-h-10 text-xs leading-5 text-slate-500">{t.short}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600">
                  Ready
                </span>
                <span className="text-[11px] font-bold text-primary opacity-0 transition group-hover:opacity-100">Open</span>
              </div>
            </Link>
          ))}
        </div>
        <NeedBanner />
      </section>
    </div>
  );
}

function HeroHeader() {
  return (
    <div className="relative mx-auto max-w-5xl pt-2 pb-12 text-center">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-32 w-32 -translate-x-1/2 rounded-full bg-blue-200/45 blur-3xl" />
      </div>
      <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-bold text-blue-600">
        <Sparkles className="h-3.5 w-3.5" /> 66+ Mockup AI Generators
      </span>
      <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-black leading-tight text-slate-950 md:text-6xl">
        All <span className="gradient-text">AI Generators</span>, One Smart Platform.
      </h1>
      <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
        Explore 66+ AI-powered tools to create, animate, convert and customize anything in seconds. Chrome, Pixel & iOS ready.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button asChild className="h-12 rounded-2xl bg-gradient-primary px-7 text-white shadow-glow">
          <Link href="/prank-socialmedia/editor/whatsapp">Start with WhatsApp <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
        <Button asChild variant="outline" className="h-12 rounded-2xl bg-white px-7">
          <Link href="/prank-socialmedia#features">View Features</Link>
        </Button>
      </div>
      <FloatingIcons />
    </div>
  );
}

function FloatingIcons() {
  const icons = [
    { icon: MessageCircle, className: "left-[16%] top-12 bg-blue-500 rotate-[-12deg]" },
    { icon: Sparkles, className: "right-[18%] top-8 bg-pink-400 rotate-[14deg]" },
    { icon: Video, className: "left-[24%] bottom-8 bg-violet-400 rotate-[10deg]" },
    { icon: Search, className: "right-[24%] bottom-10 bg-emerald-400 rotate-[-9deg]" },
    { icon: Star, className: "right-[10%] top-28 bg-orange-400 rotate-[18deg]" },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 hidden md:block">
      {icons.map((item, i) => (
        <span key={i} className={`absolute grid h-11 w-11 place-items-center rounded-xl text-white shadow-soft animate-float ${item.className}`}>
          <item.icon className="h-5 w-5" />
        </span>
      ))}
    </div>
  );
}

function NeedBanner() {
  return (
    <div className="relative mt-9 overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-500 px-7 py-8 text-white shadow-glow">
      <div className="relative z-10 max-w-xl">
        <h2 className="text-2xl font-black">Can&apos;t find what you need?</h2>
        <p className="mt-2 text-sm leading-6 text-white/85">Suggest a new prank mockup generator and we&apos;ll add it to the platform.</p>
        <Button asChild className="mt-5 rounded-2xl bg-white px-6 text-blue-600 hover:bg-white/90">
          <Link href="/prank-socialmedia">Back to home <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
      </div>
      <div className="absolute bottom-[-55px] right-10 h-28 w-52 rounded-t-full bg-white/90" />
      <div className="absolute bottom-10 right-32 grid h-20 w-20 rotate-[-18deg] place-items-center rounded-3xl bg-white text-blue-600 shadow-2xl">
        <Boxes className="h-10 w-10" />
      </div>
      <Sparkles className="absolute right-16 top-12 h-7 w-7 text-yellow-200" />
      <Sparkles className="absolute right-72 bottom-20 h-4 w-4 text-white/70" />
    </div>
  );
}
