"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Download,
  Grid2X2,
  Eye,
  HelpCircle,
  Image as ImageIcon,
  Instagram,
  Layers,
  Lightbulb,
  Lock,
  MessageCircle,
  Mic,
  MonitorSmartphone,
  MoreVertical,
  Palette,
  PenLine,
  ScreenShare,
  Send,
  Sparkles,
  Star,
  ThumbsUp,
  Twitter,
  Wand2,
  Zap,
} from "lucide-react";
import { Navbar } from "./components/site/Navbar";
import { Button } from "./components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./components/ui/accordion";
import { TEMPLATES } from "./lib/templates";

export default function Page() {
  return (
    <div className="min-h-screen bg-hero animate-gradient">
      <Navbar />
      <Hero />
      <Stats />
      <Templates />
      <Features />
      <HowItWorks />
      <BottomBand />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Rich background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-60 -top-20 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-violet-300/50 to-blue-200/30 blur-[80px] animate-float" />
        <div className="absolute right-[-150px] top-0 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-cyan-200/50 to-teal-200/30 blur-[80px] animate-float-slow" />
        <div className="absolute bottom-[-50px] left-1/3 h-72 w-[700px] rounded-full bg-gradient-to-t from-indigo-200/40 to-transparent blur-3xl" />
        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, #6366f1 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
      </div>

      <div className="mx-auto grid max-w-[1380px] gap-12 px-6 pt-6 pb-14 md:py-14 lg:grid-cols-[0.95fr_1.05fr] lg:py-20">
        <div className="animate-fade-up self-center flex flex-col items-center text-center lg:items-start lg:text-left">

          {/* Animated live badge */}
          <div className="inline-flex items-center gap-2.5 rounded-full border border-violet-200/80 bg-white/70 backdrop-blur-sm px-4 py-2 text-sm font-semibold text-violet-700 shadow-md shadow-violet-100/60 ring-1 ring-inset ring-violet-100">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
            </span>
            Studio-grade mockup generator
            <span className="rounded-full bg-gradient-to-r from-violet-600 to-blue-500 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm">FREE</span>
          </div>

          {/* Heading — no underline SVG */}
          <h1 className="mt-6 text-5xl font-black leading-[1.08] tracking-tight text-slate-950 lg:text-6xl xl:text-[72px]">
            Create Ultra{" "}
            <span className="gradient-text">Realistic Social</span>
            <br className="hidden lg:block" />{" "}
            Mockups Instantly
          </h1>

          {/* Floating platform pills */}
          <div className="mt-5 flex flex-wrap justify-center lg:justify-start gap-2">
            {[
              { label: "WhatsApp", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
              { label: "Instagram", color: "bg-pink-50 text-pink-700 border-pink-200" },
              { label: "Twitter / X", color: "bg-sky-50 text-sky-700 border-sky-200" },
              { label: "Snapchat", color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
              { label: "iMessage", color: "bg-blue-50 text-blue-700 border-blue-200" },
              { label: "+ 60 more", color: "bg-violet-50 text-violet-700 border-violet-200" },
            ].map((p) => (
              <span key={p.label} className={`inline-flex items-center rounded-full border px-3 py-1 text-[12px] font-semibold ${p.color} shadow-sm`}>
                {p.label}
              </span>
            ))}
          </div>

          {/* Subtext */}
          <p className="mt-6 max-w-xl text-[16px] leading-[1.8] text-slate-500">
            Design pixel-perfect social mockups in seconds — all in your browser. No signup, no installs. One click PNG export.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row w-full sm:w-auto gap-3">
            <Button asChild size="lg" className="h-14 w-full sm:w-auto rounded-2xl bg-gradient-primary px-8 text-primary-foreground shadow-glow hover:opacity-95 hover:-translate-y-0.5 transition-all">
              <Link href="/prank-socialmedia/templates">
                Start Creating Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 w-full sm:w-auto rounded-2xl border-slate-200 bg-white px-8 text-[15px] font-semibold hover:-translate-y-0.5 transition-all shadow-sm">
              <Link href="/prank-socialmedia/templates">Explore Templates</Link>
            </Button>
          </div>

          {/* Social proof */}
          <div className="mt-8 flex flex-col items-center lg:items-start gap-3">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {[
                  "bg-gradient-to-br from-pink-400 to-rose-500",
                  "bg-gradient-to-br from-violet-400 to-purple-500",
                  "bg-gradient-to-br from-blue-400 to-cyan-500",
                  "bg-gradient-to-br from-emerald-400 to-teal-500",
                  "bg-gradient-to-br from-orange-400 to-amber-500",
                ].map((g, i) => (
                  <span key={i} className={`h-8 w-8 rounded-full border-2 border-white ${g} flex items-center justify-center text-white text-[10px] font-bold shadow-sm`}>
                    {["J","A","M","S","R"][i]}
                  </span>
                ))}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-0.5">
                  {[1,2,3,4,5].map(s => (
                    <svg key={s} className="h-3.5 w-3.5 text-amber-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  ))}
                  <span className="text-xs font-bold text-slate-800 ml-1.5">4.9/5</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">Loved by <span className="font-semibold text-slate-700">12,000+</span> creators worldwide</p>
              </div>
            </div>

            <ul className="flex flex-wrap justify-center lg:justify-start gap-x-5 gap-y-2 text-[13px] text-slate-500">
              {["No signup required", "Always free", "HD PNG export", "60+ mockup types"].map((f) => (
                <li key={f} className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />{f}
                </li>
              ))}
            </ul>
          </div>

          {/* Scroll down arrow — mobile only */}
          <button
            className="mt-8 flex lg:hidden flex-col items-center gap-1 text-slate-400 group mx-auto"
            onClick={() => {
              const el = document.getElementById("stats-section");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            aria-label="Scroll down"
          >
            <span className="text-xs font-medium text-slate-400 group-hover:text-violet-500 transition-colors">Scroll down</span>
            <span className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-200 bg-white shadow-sm group-hover:border-violet-400 group-hover:shadow-violet-100 transition-all animate-bounce">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 group-hover:text-violet-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </button>
        </div>

        <div className="relative h-[490px] sm:h-[550px] lg:h-[590px]">
          <FloatingPreviews />
        </div>
      </div>
    </section>
  );
}

function FloatingPreviews() {
  const avatars = [
    "/pranx-assets/thumbs/download-2.jpg",
    "/pranx-assets/thumbs/download-3.jpg",
    "/pranx-assets/thumbs/download-4.jpg",
    "/pranx-assets/thumbs/download-5.jpg",
    "/pranx-assets/thumbs/download-6.jpg",
  ];

  return (
    <div className="absolute inset-x-0 top-0 flex justify-center lg:block perspective-1000">
      <div className="relative w-[340px] sm:w-[400px] lg:w-full h-[590px] scale-[0.83] sm:scale-95 lg:scale-100 origin-top lg:origin-center preserve-3d group hover:rotate-y-[-5deg] hover:rotate-x-[2deg] transition-transform duration-1000 ease-out">

        {/* Glowing Orb Behind Phone */}
        <div className="absolute left-1/2 -translate-x-1/2 lg:left-[18%] lg:translate-x-0 top-[10%] w-[300px] h-[400px] bg-gradient-to-r from-emerald-400/30 to-teal-500/30 blur-[80px] rounded-full animate-pulse" />

        {/* Main Phone */}
        <div className="absolute left-1/2 -translate-x-1/2 lg:left-[18%] lg:translate-x-0 top-0 h-[560px] w-[300px] rotate-[-7deg] rounded-[42px] border-[12px] border-slate-900 bg-slate-950 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5),inset_0_0_20px_rgba(255,255,255,0.1)] transition-transform duration-700 group-hover:-translate-y-4 group-hover:rotate-[-5deg]">
          {/* Hardware buttons */}
          <div className="absolute -left-[14px] top-24 h-12 w-[3px] rounded-l-md bg-slate-800" />
          <div className="absolute -left-[14px] top-40 h-16 w-[3px] rounded-l-md bg-slate-800" />
          <div className="absolute -right-[14px] top-32 h-20 w-[3px] rounded-r-md bg-slate-800" />

          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-7 bg-slate-950 rounded-b-3xl z-20 shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
             <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-1.5 rounded-full bg-slate-800" />
          </div>

          <div className="h-full overflow-hidden rounded-[30px] bg-[#E5DDD5]">
            {/* WhatsApp Header */}
            <div className="relative flex h-[80px] items-center justify-between bg-[#008069] px-5 pt-6 text-white shadow-md z-10">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-white/20 text-sm font-bold shadow-inner">A</div>
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#008069] bg-[#25D366]"></span>
                </div>
                <div>
                  <p className="text-[15px] font-semibold leading-tight">Alex</p>
                  <p className="text-[11px] font-medium text-emerald-100">online</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-white">
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1.02l-2.2 2.2z"/></svg>
                <MoreVertical className="h-5 w-5" />
              </div>
            </div>
            {/* Chat area */}
            <div className="relative h-full space-y-4 p-4 pt-6 bg-[#E5DDD5] before:absolute before:inset-0 before:bg-[url('https://i.pinimg.com/1200x/8c/98/99/8c98994518b575bfd8c949e91d20548b.jpg')] before:opacity-30 before:bg-cover">
              <div className="relative z-10 space-y-4">
                <ChatBubble right text="Got the design 🎨" time="09:41" status="read" />
                <ChatBubble text="It looks amazing! 🔥 This is exactly what we needed." time="09:42" />
                <ChatBubble right text="Love it! Let's ship it 🚀" time="09:43" status="read" />
                {/* Typing indicator */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex gap-1.5 rounded-2xl rounded-bl-sm bg-white px-4 py-3 shadow-sm w-fit">
                    <span className="h-2 w-2 rounded-full bg-[#008069] animate-bounce" style={{animationDelay:"0ms"}}/>
                    <span className="h-2 w-2 rounded-full bg-[#008069] animate-bounce" style={{animationDelay:"150ms"}}/>
                    <span className="h-2 w-2 rounded-full bg-[#008069] animate-bounce" style={{animationDelay:"300ms"}}/>
                  </div>
                </div>
              </div>
            </div>
            {/* Input bar */}
            <div className="absolute bottom-4 left-3 right-3 flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-xl border border-slate-100 z-10">
              <span className="text-xl text-slate-400 font-light">+</span>
              <span className="flex-1 text-[13px] text-slate-400 pl-1">Type a message</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#008069] shadow-md hover:scale-105 transition-transform cursor-pointer">
                <Mic className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Instagram Card — top right */}
        <div className="absolute right-[-10px] sm:right-5 top-8 w-[310px] sm:w-[320px] rotate-[6deg] animate-float-slow rounded-3xl bg-white/70 backdrop-blur-xl p-5 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),inset_0_0_0_1px_rgba(255,255,255,0.9)] border border-white/50 z-30 transition-all duration-500 hover:scale-105 hover:rotate-[3deg]">
          {/* Pink accent top bar */}
          <div className="absolute top-0 left-4 right-4 h-[4px] rounded-b-xl bg-gradient-to-r from-[#f09433] via-[#e6683c] to-[#bc1888]" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888] text-white shadow-lg shadow-pink-300/50 p-[2px]">
                  <div className="h-full w-full rounded-full border-2 border-white bg-white/20 backdrop-blur-sm grid place-items-center">
                    <Instagram className="h-5 w-5" />
                  </div>
                </span>
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-white">3</span>
              </div>
              <div>
                <p className="text-[14px] font-bold text-slate-900 flex items-center gap-1">mockly_app <svg className="h-3.5 w-3.5 text-blue-500 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.9 14.7L6 12.6l1.5-1.5 2.6 2.6 6.4-6.4 1.5 1.5-7.9 7.9z"/></svg></p>
                <p className="text-[11px] font-medium text-slate-500">Just now</p>
              </div>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-600 hover:bg-slate-200 cursor-pointer transition-colors">Follow</span>
          </div>
          <p className="mt-4 text-[14px] font-semibold text-slate-800 leading-snug">Shipping a brand new editor today! ✨ Tag a friend who needs this. 👇</p>
          <div className="mt-4 flex items-center gap-5 text-[12px] font-medium text-slate-500 border-t border-slate-200/60 pt-3">
            <span className="flex items-center gap-1.5 text-red-500 cursor-pointer hover:scale-110 transition-transform">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              2.4K
            </span>
            <span className="flex items-center gap-1.5 hover:text-slate-700 cursor-pointer transition-colors">
              <MessageCircle className="h-4 w-4" /> 372
            </span>
            <span className="flex items-center gap-1.5 hover:text-slate-700 cursor-pointer transition-colors">
              <Send className="h-4 w-4" /> 88
            </span>
          </div>
        </div>

        {/* Twitter/X Card — middle */}
        <div className="absolute left-[-10px] sm:left-auto sm:right-16 top-[280px] w-[280px] sm:w-[290px] rotate-[-5deg] animate-float rounded-3xl bg-white/80 backdrop-blur-xl p-5 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),inset_0_0_0_1px_rgba(255,255,255,0.8)] border border-white/40 z-20 transition-all duration-500 hover:scale-105 hover:rotate-[-2deg]">
          <div className="absolute top-0 left-0 bottom-0 w-[4px] rounded-l-3xl bg-gradient-to-b from-[#1DA1F2] to-blue-600" />
          <div className="flex items-start gap-3.5">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#1DA1F2] to-blue-600 text-white shadow-lg shadow-sky-300/50">
              <Twitter className="h-5 w-5" />
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <p className="text-[14px] font-bold text-slate-900">Mockly</p>
                <svg className="h-3.5 w-3.5 text-[#1DA1F2] fill-current shrink-0" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>
              </div>
              <p className="text-[12px] font-medium text-slate-500">@mocklyapp · 2m</p>
              <p className="mt-2 text-[13px] font-medium text-slate-800 leading-relaxed">Your export is ready to download! High-res PNG generated successfully. 🚀🔥</p>
              <div className="mt-4 flex justify-between text-slate-400 pr-4">
                <span className="flex items-center gap-1.5 hover:text-[#1DA1F2] transition-colors cursor-pointer"><MessageCircle className="h-4 w-4" /> 12</span>
                <span className="flex items-center gap-1.5 hover:text-emerald-500 transition-colors cursor-pointer"><Send className="h-4 w-4" /> 8</span>
                <span className="flex items-center gap-1.5 hover:text-pink-500 transition-colors cursor-pointer"><Star className="h-4 w-4" /> 142</span>
              </div>
            </div>
          </div>
        </div>

        {/* Trusted by card — bottom */}
        <div className="absolute left-1/2 -translate-x-1/2 sm:left-auto sm:-translate-x-0 sm:right-6 bottom-0 w-[270px] sm:w-[280px] rounded-[24px] border border-white/50 bg-white/60 backdrop-blur-2xl p-4 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] z-40 transition-transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <p className="text-[12px] font-bold text-slate-600 uppercase tracking-wide">Trusted worldwide</p>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 shadow-md shadow-emerald-500/30">
              <svg className="h-3.5 w-3.5 text-white fill-current" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </span>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex -space-x-3">
              {avatars.map((src, i) => (
                <Image
                  key={src}
                  src={src}
                  alt=""
                  width={36}
                  height={36}
                  className="-ml-2 h-9 w-9 rounded-full border-2 border-white object-cover shadow-md hover:-translate-y-1 hover:z-50 transition-transform first:ml-0"
                  style={{ zIndex: 10 - i }}
                />
              ))}
            </div>
            <div>
              <p className="text-[15px] font-black text-slate-900">+12,000</p>
              <div className="flex gap-0.5 mt-0.5">
                {[1,2,3,4,5].map(s => <svg key={s} className="h-3 w-3 text-amber-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>)}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function ChatBubble({ text, right = false, time, status }) {
  return (
    <div className={`flex flex-col ${right ? "items-end" : "items-start"}`}>
      <div className={`${right ? "bg-[#DCF8C6]" : "bg-white"} relative w-fit max-w-[85%] rounded-[10px] px-3 py-2 text-[14px] text-[#111B21] shadow-sm`}>
        {/* Tail */}
        <div className={`absolute top-0 w-3 h-3 ${right ? "-right-2 bg-[#DCF8C6]" : "-left-2 bg-white"}`} style={{ clipPath: right ? 'polygon(0 0, 0 100%, 100% 0)' : 'polygon(100% 0, 100% 100%, 0 0)' }} />
        <span className="relative z-10 break-words">{text}</span>
        <div className="float-right -mb-1 ml-2 mt-1 flex items-center gap-1 opacity-60">
          <span className="text-[10px]">{time}</span>
          {right && status === 'read' && (
             <svg viewBox="0 0 16 15" width="16" height="15" className="text-[#53bdeb] fill-current"><path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"/></svg>
          )}
        </div>
      </div>
    </div>
  );
}

function Stats() {
  const items = [
    { icon: Wand2, value: "50+", label: "Templates", bg: "bg-violet-100 text-violet-600" },
    { icon: PenLine, value: "100K+", label: "Mockups Created", bg: "bg-pink-100 text-pink-600" },
    { icon: Sparkles, value: "99.9%", label: "Uptime", bg: "bg-sky-100 text-sky-600" },
    { icon: Star, value: "4.9/5", label: "User Rating", bg: "bg-indigo-100 text-indigo-600" },
  ];
  return (
    <section id="stats-section" className="mx-auto max-w-[1360px] px-6">
      <div className="grid gap-4 rounded-3xl border border-slate-200 bg-white/65 p-6 shadow-soft backdrop-blur md:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-5 px-4">
            <span className={`grid h-16 w-16 place-items-center rounded-full ${item.bg}`}><item.icon className="h-7 w-7" /></span>
            <div><p className="text-3xl font-black">{item.value}</p><p className="text-sm text-slate-500">{item.label}</p></div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Templates() {
  return (
    <section className="mx-auto max-w-[1360px] px-6 py-10" id="templates">
      {/* Header — stacks on mobile, side-by-side on md+ */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-3xl font-black"><Sparkles className="h-5 w-5 text-primary" /> Templates for every screen</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">66 carefully crafted generators - every pixel modeled after the real thing.</p>
        </div>
        {/* Desktop button — right side */}
        <Button asChild variant="outline" className="hidden h-14 shrink-0 rounded-2xl bg-white px-8 md:inline-flex">
          <Link href="/prank-socialmedia/templates">View all templates <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {TEMPLATES.slice(0, 8).map((t, i) => (
          <Link
            key={t.slug}
            href={`/prank-socialmedia/editor/${t.slug}`}
            style={{ animationDelay: `${i * 60}ms` }}
            className="group animate-fade-up overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-soft transition hover:-translate-y-1 hover:shadow-glow"
          >
            <div className="flex items-start gap-4">
              <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${t.accent} text-white shadow-glow`}>
                <t.icon className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-bold">{t.name}</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{t.short}</p>
              </div>
            </div>
            <div className="mt-2 flex justify-end">
              <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold text-blue-600">New</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Mobile button — centered below grid */}
      <div className="mt-8 flex justify-center md:hidden">
        <Button asChild variant="outline" className="h-13 w-full max-w-sm rounded-2xl border-slate-200 bg-white px-8 text-[15px] font-semibold shadow-sm">
          <Link href="/prank-socialmedia/templates" className="flex items-center justify-center gap-2">
            View all templates <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}

function Features() {
  const items = [
    { icon: Eye, title: "Real-time live preview", desc: "Every keystroke updates the mock instantly." },
    { icon: Layers, title: "Exact UI clones", desc: "Typography, spacing, ticks, badges - all to spec." },
    { icon: MonitorSmartphone, title: "Mobile + desktop", desc: "Designed responsive from day one." },
    { icon: Palette, title: "Light, dark, AMOLED", desc: "Switch themes with one click." },
    { icon: Zap, title: "Browser-based", desc: "No installs. Nothing leaves your device." },
    { icon: Download, title: "Instant PNG export", desc: "High-resolution screenshots in a click." },
  ];
  return (
    <section id="features" className="mx-auto max-w-[1360px] px-6 py-8">
      <div className="mb-6 text-center">
        <p className="text-sm font-medium text-primary">Features</p>
        <h2 className="mt-1 text-3xl font-black">Built like a real product</h2>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
        {items.map((f, i) => (
          <div key={i} className="animate-fade-up rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-soft transition hover:shadow-glow" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-gradient-mint text-primary"><f.icon className="h-7 w-7" /></div>
            <h3 className="text-sm font-bold">{f.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "01",
      t: "Choose a template",
      d: "Pick from 60+ social and system mockups designed for every platform.",
      tone: "violet",
      icon: Grid2X2,
      visual: "templates",
    },
    {
      n: "02",
      t: "Customize content",
      d: "Edit names, messages, themes, devices and everything to match your needs.",
      tone: "blue",
      icon: PenLine,
      visual: "chat",
    },
    {
      n: "03",
      t: "Export your screenshot",
      d: "Download a high-quality PNG screenshot in one click and share anywhere.",
      tone: "green",
      icon: Download,
      visual: "export",
    },
  ];
  return (
    <section id="how" className="mx-auto max-w-[1500px] px-6 py-10">
      <div className="mb-6 text-center">
        <p className="text-sm font-medium text-primary">How it works</p>
        <h2 className="mt-1 text-3xl font-black">Three steps. That&apos;s it.</h2>
      </div>
      <div className="grid items-stretch gap-8 xl:grid-cols-[1fr_auto_1fr_auto_1fr]">
        {steps.map((s, i) => (
          <div key={s.n} className="contents">
            <div
              className={`relative min-h-[350px] overflow-hidden rounded-[1.75rem] border bg-white shadow-soft animate-fade-up ${stepBorderClass(s.tone)}`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="relative z-10 flex h-full min-h-[350px] flex-col justify-between p-7 sm:max-w-[55%] lg:max-w-[58%] xl:max-w-[55%]">
                <div>
                  <span className={`inline-grid h-14 w-14 place-items-center rounded-full text-xl font-black text-white ${stepBadgeClass(s.tone)}`}>{s.n}</span>
                  <h3 className="mt-7 text-2xl font-black leading-tight text-slate-950 pr-2">{s.t}</h3>
                  <p className="mt-4 text-[15px] leading-7 text-slate-600">{s.d}</p>
                </div>
                <span className={`grid h-12 w-12 place-items-center rounded-xl border text-white ${stepIconClass(s.tone)}`}>
                  <s.icon className="h-6 w-6" />
                </span>
              </div>
              <StepVisual type={s.visual} />
            </div>
            {i < steps.length - 1 && (
              <span className="hidden self-center rounded-full bg-white p-4 text-primary shadow-soft xl:grid">
                <ChevronRight className="h-7 w-7" />
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function stepBadgeClass(tone) {
  if (tone === "green") return "bg-gradient-to-br from-emerald-400 to-green-600";
  if (tone === "blue") return "bg-gradient-to-br from-blue-400 to-blue-700";
  return "bg-gradient-to-br from-violet-400 to-purple-600";
}

function stepIconClass(tone) {
  if (tone === "green") return "border-emerald-200 bg-emerald-100 text-emerald-600";
  if (tone === "blue") return "border-blue-200 bg-blue-100 text-blue-600";
  return "border-violet-200 bg-violet-100 text-violet-600";
}

function stepBorderClass(tone) {
  if (tone === "green") return "border-emerald-200 shadow-[0_16px_45px_-24px_rgba(34,197,94,0.7)]";
  if (tone === "blue") return "border-blue-200 shadow-[0_16px_45px_-24px_rgba(59,130,246,0.7)]";
  return "border-violet-200 shadow-[0_16px_45px_-24px_rgba(139,92,246,0.7)]";
}

function StepVisual({ type }) {
  if (type === "templates") return <TemplateLaptopVisual />;
  if (type === "chat") return <ChatPhoneVisual />;
  return <ExportPostVisual />;
}

function TemplateLaptopVisual() {
  return (
    <>
      <div className="absolute bottom-4 right-8 hidden h-[315px] w-[170px] rotate-[7deg] rounded-[2rem] border-[8px] border-slate-900 bg-slate-900 shadow-2xl sm:block z-10">
        <div className="h-full overflow-hidden rounded-[1.4rem] bg-white p-3">
          <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-slate-200" />
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[10px] font-black">All Templates</span>
            <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[8px] font-bold text-emerald-600">66</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {["from-emerald-400 to-green-600", "from-pink-400 to-orange-400", "from-sky-400 to-blue-600", "from-violet-400 to-purple-600", "from-red-400 to-rose-600", "from-yellow-300 to-orange-400"].map((c) => (
              <div key={c} className="rounded-lg border border-slate-100 bg-slate-50 p-1">
                <div className={`h-10 rounded-md bg-gradient-to-br ${c}`} />
                <div className="mt-1 h-1 w-9 rounded bg-slate-200" />
                <div className="mt-1 h-1 w-6 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="absolute bottom-10 right-[-8px] hidden h-20 w-10 rounded-l-full bg-emerald-100 sm:block" />
    </>
  );
}

function ChatPhoneVisual() {
  return (
    <div className="absolute bottom-4 right-8 hidden h-[315px] w-[170px] rotate-[-8deg] rounded-[2rem] border-[8px] border-slate-900 bg-slate-900 shadow-2xl sm:block">
      <div className="h-full overflow-hidden rounded-[1.4rem] bg-[#f3eee6]">
        <div className="flex h-12 items-center gap-2 bg-emerald-600 px-3 text-white">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-white/30 text-[10px]">A</span>
          <div>
            <p className="text-[10px] font-bold">Alex</p>
            <p className="text-[8px] opacity-80">online</p>
          </div>
        </div>
        <div className="space-y-4 p-4 pt-7 text-[10px] font-medium">
          <div className="ml-auto w-28 rounded-xl rounded-br-sm bg-[#dcf8c6] px-3 py-2 shadow-sm">Got the design</div>
          <div className="w-24 rounded-xl rounded-bl-sm bg-white px-3 py-2 shadow-sm">It looks amazing!</div>
          <div className="ml-auto w-20 rounded-xl rounded-br-sm bg-[#dcf8c6] px-3 py-2 shadow-sm">Love it!</div>
        </div>
        <div className="absolute bottom-4 left-3 right-3 rounded-full bg-white px-3 py-2 text-[9px] text-slate-400 shadow">Type a message</div>
      </div>
    </div>
  );
}

function ExportPostVisual() {
  return (
    <div className="absolute bottom-4 right-8 hidden h-[315px] w-[170px] rotate-[8deg] rounded-[2rem] border-[8px] border-slate-900 bg-white shadow-2xl sm:block">
      <div className="h-full overflow-hidden rounded-[1.4rem] bg-white">
        <div className="flex h-12 items-center justify-between px-3">
          <span className="text-[10px] font-black">Instagram</span>
          <Instagram className="h-4 w-4 text-rose-500" />
        </div>
        <div className="flex items-center gap-2 px-3 pb-2">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-tr from-pink-500 to-orange-400 text-[9px] text-white">m</span>
          <span className="text-[9px] font-bold">mocklyapp</span>
        </div>
        <div className="mx-3 h-36 rounded-xl bg-gradient-to-br from-sky-200 via-blue-400 to-slate-700">
          <div className="h-full rounded-xl bg-[linear-gradient(150deg,transparent_45%,rgba(255,255,255,.9)_46%,transparent_62%)]" />
        </div>
        <div className="flex gap-2 px-3 py-2 text-slate-700">
          <span className="h-3 w-3 rounded-full bg-rose-500" />
          <MessageCircle className="h-3 w-3" />
          <Send className="h-3 w-3" />
        </div>
        <div className="px-3 text-[8px] leading-4">
          <p className="font-black">2,455 likes</p>
          <p><span className="font-black">mocklyapp</span> Create stunning mockups instantly.</p>
        </div>
      </div>
    </div>
  );
}

function BottomBand() {
  return (
    <section className="mx-auto max-w-[1300px] px-6 py-20" id="faq">
      <div className="mb-12 text-center flex flex-col items-center">
        <div className="mb-5 flex items-center justify-center gap-4 text-[12px] font-bold text-blue-500 tracking-widest uppercase">
          <span className="h-[1px] w-8 bg-blue-200" />
          <HelpCircle className="h-4 w-4" />
          FAQ
          <HelpCircle className="h-4 w-4" />
          <span className="h-[1px] w-8 bg-blue-200" />
        </div>
        <h2 className="text-3xl font-black md:text-4xl text-slate-900 tracking-tight">
          Questions, answered
        </h2>
        <p className="mt-4 text-[17px] text-slate-500">
          Find quick answers to the most common questions about our mockups and AI tools.
        </p>
      </div>
      <div className="grid gap-8 lg:grid-cols-2 items-start">
        <FAQ />
        <FAQCta />
      </div>
    </section>
  );
}

function FAQ() {
  const qs = [
    { q: "Is Mockly free?", a: "Yes! Mockly is free to use for everyone. You can create, customize and export mockups without any cost.", icon: Sparkles },
    { q: "Is it responsive?", a: "Yes. Mockly works on mobile, tablet and desktop. Editors adapt their layout to your screen.", icon: Zap },
    { q: "Can I export screenshots?", a: "Yes. Every editor includes a one-click PNG export at high resolution.", icon: ScreenShare },
    { q: "Is it for entertainment only?", a: "Strictly. Mockly is meant for parody, design, and educational mockups - never for fraud or impersonation.", icon: Lock },
  ];
  return (
    <div className="w-full">
      <Accordion type="single" collapsible defaultValue="q-0" className="space-y-4 w-full">
        {qs.map((item, i) => (
          <AccordionItem
            key={i}
            value={`q-${i}`}
            className="rounded-3xl border border-transparent bg-white px-6 py-3 shadow-sm data-[state=open]:border-violet-200 data-[state=open]:bg-[#faf5ff] transition-colors [&[data-state=open]_.icon-container]:text-violet-600"
          >
            <AccordionTrigger className="gap-5 text-left text-[17px] font-bold hover:no-underline text-slate-800 py-4">
              <span className="flex items-center gap-5">
                <span className="icon-container grid h-12 w-12 shrink-0 place-items-center rounded-full bg-violet-50 text-blue-500 transition-colors">
                  <item.icon className="h-6 w-6" />
                </span>
                {item.q}
              </span>
            </AccordionTrigger>
            <AccordionContent className="pb-5 pl-[68px] pr-4 text-[15px] leading-relaxed text-slate-500">
              {item.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

function FAQCta() {
  return (
    <div className="relative min-h-[580px] md:min-h-[380px] w-full overflow-hidden rounded-3xl bg-gradient-to-br from-[#f6f8ff] to-[#eef1ff] p-8 md:p-10">
      <div className="relative z-10 max-w-full md:max-w-[320px] flex flex-col items-start">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-[12px] font-bold text-blue-600 shadow-sm mb-4">
          <Sparkles className="h-3.5 w-3.5 text-violet-500" /> New & Improved
        </span>
        <h3 className="text-[28px] md:text-[32px] font-black leading-[1.15] md:leading-[1.1] text-slate-900 tracking-tight mb-4">
          Ready to create something <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#8b5cf6] to-[#6366f1]">
            amazing?
            <svg className="absolute bottom-[-10px] left-0 w-full h-3 text-[#6366f1]" viewBox="0 0 100 15" preserveAspectRatio="none">
              <path d="M0,10 Q50,0 100,10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </span>
        </h3>
        <p className="text-[14px] leading-relaxed text-slate-500 pr-0 md:pr-4 mb-6 mt-1 md:mt-0">
          Start building ultra-realistic social mockups in seconds.<br className="hidden md:block" />No signup required.
        </p>
        <Button asChild className="h-12 rounded-full bg-gradient-to-r from-[#6366f1] to-[#3b82f6] px-6 text-[15px] font-bold text-white shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 border-0">
          <Link href="/prank-socialmedia/templates">Start Creating Now <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
      </div>

      {/* Blue 4-point star on the left of laptop */}
      <div className="absolute top-[330px] left-[20px] md:top-[160px] md:left-[320px] z-10 text-[#60a5fa] scale-75 md:scale-100">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" className="hidden" />
          <path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z" fill="currentColor" stroke="none" />
        </svg>
      </div>

      {/* Decorative Elements on Right */}
      <div className="absolute right-[-40px] sm:right-[-20px] bottom-[-20px] md:bottom-[-20px] h-[360px] w-[380px] scale-[0.75] sm:scale-90 md:scale-100 origin-bottom-right">

        {/* Laptop Base */}
        <div className="absolute bottom-[40px] left-[60px] z-10 h-[14px] w-[270px] rounded-b-xl rounded-t-sm bg-[#60a5fa] shadow-xl" />
        <div className="absolute bottom-[54px] left-[65px] z-10 h-[6px] w-[260px] rounded-t-sm bg-[#e2e8f0]" />
        <div className="absolute bottom-[54px] left-[160px] z-10 h-[4px] w-[60px] rounded-t-sm bg-[#cbd5e1]" /> {/* Trackpad */}

        {/* Laptop Screen Bezel */}
        <div className="absolute bottom-[60px] left-[70px] z-0 h-[180px] w-[250px] rounded-t-2xl border-[8px] border-[#1e293b] bg-[#1e293b] shadow-2xl overflow-hidden flex flex-col rotate-[-2deg] origin-bottom">
          {/* Screen UI Content */}
          <div className="flex-1 bg-gradient-to-br from-[#eff6ff] to-[#f8fafc] p-3 flex flex-col gap-2 relative">
             <div className="flex items-center gap-3 rounded-lg bg-white p-3 shadow-sm">
               <span className="h-8 w-8 rounded-full bg-gradient-to-br from-[#a78bfa] to-[#818cf8] flex items-center justify-center">
                 <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
               </span>
               <div className="space-y-2 flex-1">
                 <span className="block h-2.5 w-16 rounded-full bg-[#cbd5e1]" />
                 <span className="block h-2 w-24 rounded-full bg-[#e2e8f0]" />
               </div>
             </div>

             <div className="flex gap-2">
                <div className="w-12 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center p-2">
                   <span className="block w-full h-1 rounded bg-[#e2e8f0] mt-1" />
                </div>
                <div className="flex-1 space-y-2 pt-1">
                   <span className="block h-2 w-28 rounded-full bg-[#e2e8f0]" />
                   <span className="block h-2 w-20 rounded-full bg-[#e2e8f0]" />
                   <span className="block h-2 w-24 rounded-full bg-[#e2e8f0]" />
                </div>
             </div>
          </div>
        </div>

        {/* Floating Icons */}
        {/* Purple Image Icon */}
        <div className="absolute bottom-[230px] left-[30px] z-20 grid h-14 w-14 rotate-[-15deg] place-items-center rounded-2xl bg-gradient-to-br from-[#c084fc] to-[#9333ea] text-white shadow-xl shadow-purple-500/20 ring-[3px] ring-white/50">
          <ImageIcon className="h-7 w-7 opacity-90" />
        </div>

        {/* Blue Thumbs Up Icon */}
        <div className="absolute bottom-[230px] right-[110px] z-20 grid h-14 w-14 rotate-[5deg] place-items-center rounded-2xl bg-gradient-to-br from-[#60a5fa] to-[#2563eb] text-white shadow-xl shadow-blue-500/20 ring-[3px] ring-white/50">
          <ThumbsUp className="h-7 w-7 opacity-90 fill-current" />
        </div>

        {/* Green Chat Icon */}
        <div className="absolute bottom-[170px] right-[20px] z-20 grid h-12 w-12 rotate-[12deg] place-items-center rounded-xl bg-gradient-to-br from-[#4ade80] to-[#16a34a] text-white shadow-xl shadow-green-500/20 ring-[3px] ring-white/50">
          <div className="relative">
            <svg className="h-6 w-6 opacity-90 fill-current" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <div className="absolute inset-0 flex items-center justify-center gap-[3px] pb-[4px]">
              <span className="h-1 w-1 rounded-full bg-white" />
              <span className="h-1 w-1 rounded-full bg-white" />
              <span className="h-1 w-1 rounded-full bg-white" />
            </div>
          </div>
        </div>

        {/* Plant */}
        <div className="absolute bottom-[35px] right-[20px] z-20">
           {/* Leaves */}
           <div className="absolute bottom-[18px] right-[4px] h-10 w-4 -rotate-[40deg] rounded-full rounded-bl-sm bg-[#4ade80]" />
           <div className="absolute bottom-[20px] right-[12px] h-12 w-5 -rotate-[10deg] rounded-full rounded-b-sm bg-[#22c55e]" />
           <div className="absolute bottom-[16px] right-[20px] h-9 w-4 rotate-[35deg] rounded-full rounded-br-sm bg-[#4ade80]" />
           {/* Pot */}
           <div className="relative h-9 w-14 rounded-b-[14px] rounded-t-sm bg-white shadow-md border border-slate-100" />
        </div>
      </div>
    </div>
  );
}
