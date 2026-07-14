"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { findPrank, f11Image, mascotImage, showcaseTiles, sliderImages } from "../data/pranxData";
import { playPranxSound } from "../lib/audio";
import { useInterval } from "../hooks/useInterval";
import AdSidebar from "@/ads/layouts/shared/AdSidebar";
import AdBottomBanner from "@/ads/layouts/shared/AdBottomBanner";

function HeroSlider() {
  const slides = [
    { title: "Office Mischief", body: "Safe fake screens and browser games for harmless demos.", image: sliderImages[0] },
    { title: "Classic Computer Pranks", body: "Retro terminals, updates, matrix rain, screensavers, and tiny games.", image: sliderImages[1] },
    { title: "Just Pranx", body: "Pick a card, open fullscreen, and exit anytime with Esc.", image: sliderImages[2] },
  ];
  const [index, setIndex] = useState(0);
  useInterval(() => setIndex((current) => (current + 1) % slides.length), 3500);
  const slide = slides[index];
  return (
    <div className="relative min-h-[320px] overflow-hidden bg-[#2f7080] shadow-[0_5px_0_#235969] sm:min-h-[430px]">
      <img src={slide.image} alt="" className="h-full min-h-[320px] w-full object-cover sm:min-h-[430px]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/45 to-transparent p-5 text-white sm:p-7">
        <h1 className="text-3xl font-black leading-tight sm:text-5xl" style={{ textShadow: "0 3px 0 rgba(0,0,0,0.4)" }}>{slide.title}</h1>
        <p className="mt-2 max-w-2xl text-sm font-bold leading-6 text-white/90 sm:text-lg">{slide.body}</p>
      </div>
      <div className="absolute bottom-4 right-4 flex gap-2">
        {slides.map((item, dot) => (
          <button key={item.title} onClick={() => setIndex(dot)} className={`h-3 rounded-full border border-white/60 transition ${dot === index ? "w-10 bg-white" : "w-3 bg-white/40"}`} aria-label={`Show ${item.title}`} />
        ))}
      </div>
    </div>
  );
}

const effectDefaults = {
  scrollSounds: true,
  glitchTitle: true,
  insects: true,
  welcomePopup: false,
};

const effectRows = [
  { key: "scrollSounds", label: "Scroll sounds" },
  { key: "glitchTitle", label: "Glitch title" },
  { key: "insects", label: "Insects" },
  { key: "welcomePopup", label: "Welcome popup" },
];

function useScrollSound(enabled) {
  const lastPlayedRef = useRef(0);

  useEffect(() => {
    if (!enabled) return undefined;

    const playBlip = () => {
      const now = performance.now();
      if (now - lastPlayedRef.current < 95) return;
      lastPlayedRef.current = now;
      playPranxSound("scroll", window.scrollY);
    };

    window.addEventListener("scroll", playBlip, { passive: true });
    return () => window.removeEventListener("scroll", playBlip);
  }, [enabled]);
}

function useGlitchTitle(enabled) {
  useEffect(() => {
    const originalTitle = document.title || "Pranx";
    if (!enabled) return undefined;

    const titles = ["PRANX!!!", "P̷R̵A̴N̶X̸", "Just Pranx, Bro!", "SYSTEM FUN MODE", "Pranx.com"];
    let index = 0;
    const id = window.setInterval(() => {
      document.title = titles[index % titles.length];
      if (index % 2 === 0) playPranxSound("glitch", index * 113);
      index += 1;
    }, 720);

    return () => {
      window.clearInterval(id);
      document.title = originalTitle;
    };
  }, [enabled]);
}

function useMosquitoSound(enabled) {
  useEffect(() => {
    if (!enabled) return undefined;

    const firstBuzz = window.setTimeout(() => playPranxSound("mosquito"), 900);
    const buzz = window.setInterval(() => playPranxSound("mosquito"), 3600);

    return () => {
      window.clearTimeout(firstBuzz);
      window.clearInterval(buzz);
    };
  }, [enabled]);
}

function EffectsOverlay({ effects }) {
  if (!effects.insects) return null;

  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-[70] overflow-hidden">
        <span className="pranx-mosquito" aria-hidden="true" />
      </div>
      <style jsx global>{`
        .pranx-mosquito {
          position: fixed;
          z-index: 71;
          left: 8vw;
          top: 16vh;
          width: 18px;
          height: 11px;
          border-radius: 55% 45% 55% 45%;
          background: #24150f;
          box-shadow: 8px 2px 0 -5px #24150f, -6px 1px 0 -5px #24150f, 0 2px 4px rgba(0, 0, 0, 0.35);
          pointer-events: none;
          opacity: 0.9;
          transform-origin: center;
          animation: pranx-mosquito-flight 19s linear infinite, pranx-mosquito-jitter 0.16s steps(2) infinite;
        }
        .pranx-mosquito::before,
        .pranx-mosquito::after {
          content: "";
          position: absolute;
          top: -6px;
          width: 13px;
          height: 9px;
          border-radius: 70% 30% 70% 30%;
          border: 1px solid rgba(37, 24, 16, 0.55);
          background: rgba(255, 255, 255, 0.38);
          filter: blur(0.2px);
          animation: pranx-mosquito-wing 0.08s linear infinite alternate;
        }
        .pranx-mosquito::before {
          left: -3px;
          transform: rotate(-24deg);
        }
        .pranx-mosquito::after {
          right: -3px;
          transform: rotate(24deg) scaleX(-1);
        }
        @keyframes pranx-mosquito-flight {
          0% { left: 6vw; top: 14vh; transform: rotate(18deg) scale(1); }
          12% { left: 28vw; top: 8vh; transform: rotate(-12deg) scale(1.08); }
          25% { left: 72vw; top: 22vh; transform: rotate(24deg) scale(0.95); }
          38% { left: 88vw; top: 58vh; transform: rotate(72deg) scale(1.1); }
          52% { left: 58vw; top: 82vh; transform: rotate(142deg) scale(1); }
          66% { left: 18vw; top: 70vh; transform: rotate(218deg) scale(0.96); }
          80% { left: 38vw; top: 36vh; transform: rotate(310deg) scale(1.12); }
          100% { left: 6vw; top: 14vh; transform: rotate(378deg) scale(1); }
        }
        @keyframes pranx-mosquito-jitter {
          0% { margin-left: 0; margin-top: 0; }
          50% { margin-left: 2px; margin-top: -1px; }
          100% { margin-left: -1px; margin-top: 1px; }
        }
        @keyframes pranx-mosquito-wing {
          from { opacity: 0.3; transform: rotate(-30deg) scaleY(0.8); }
          to { opacity: 0.78; transform: rotate(28deg) scaleY(1.05); }
        }
      `}</style>
    </>
  );
}

function WelcomePopup({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/45 px-4 backdrop-blur-[2px]">
      <div className="relative w-full max-w-lg rounded-3xl border-4 border-[#2f7080] bg-white p-6 text-center text-[#2f3938] shadow-2xl">
        <button onClick={onClose} className="absolute -right-3 -top-3 grid h-10 w-10 place-items-center rounded-full bg-red-500 text-2xl font-black text-white shadow-lg" aria-label="Close welcome popup">
          ×
        </button>
        <img src={mascotImage} alt="" className="mx-auto h-28 w-auto" />
        <h2 className="mt-3 text-4xl font-black">Welcome to Pranx!</h2>
        <p className="mx-auto mt-3 max-w-md text-lg font-bold leading-7 text-slate-600">
          Pick a prank, switch to fullscreen, and use these effects to make the page feel alive.
        </p>
        <button onClick={onClose} className="mt-6 rounded-xl bg-[#3f7f91] px-6 py-3 text-lg font-black text-white shadow-[5px_5px_0_#0f172a]">
          Start Pranking
        </button>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [effects, setEffects] = useState(effectDefaults);
  const filtered = showcaseTiles.filter((item) => `${item.title} ${findPrank(item.slug)?.description || ""}`.toLowerCase().includes(query.toLowerCase()));
  useScrollSound(effects.scrollSounds);
  useGlitchTitle(effects.glitchTitle);
  useMosquitoSound(effects.insects);

  const toggleEffect = (key) => {
    const nextValue = !effects[key];
    if (nextValue) {
      if (key === "glitchTitle") playPranxSound("glitch");
      else if (key === "insects") playPranxSound("mosquito");
      else if (key === "welcomePopup") playPranxSound("welcome");
      else playPranxSound("toggle-on");
    } else {
      playPranxSound("toggle-off");
    }
    setEffects((current) => ({ ...current, [key]: nextValue }));
  };

  return (
    <main className="bg-white text-[#2f3938]">
      <EffectsOverlay effects={effects} />
      <WelcomePopup open={effects.welcomePopup} onClose={() => setEffects((current) => ({ ...current, welcomePopup: false }))} />
      <section className="bg-[#3f7f91]">
        <div className="mx-auto grid max-w-[1500px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-center">
          <HeroSlider />
          <aside className="grid gap-5">
            <label className="relative block rounded-xl bg-white p-4 shadow-lg">
              <input value={query} onChange={(event) => setQuery(event.target.value)} className="h-11 w-full rounded-md border-2 border-[#2f7080] px-4 pr-12 text-2xl font-semibold text-slate-700 outline-none placeholder:text-slate-400" placeholder="Search..." />
              <Search className="absolute right-7 top-1/2 h-9 w-9 -translate-y-1/2 text-slate-600" />
            </label>
            <div className="rounded-xl bg-white p-4 shadow-lg">
              <div className="flex flex-wrap items-center justify-center gap-2">
                {["f", "X", "P", "in", "✉"].map((item) => (
                  <span key={item} className="grid h-10 min-w-10 place-items-center rounded-md bg-[#2f7080] px-2 text-lg font-black text-white">{item}</span>
                ))}
              </div>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-lg">
              <p className="text-2xl font-black leading-tight text-slate-700">I used to think the browser was serious. Then this page started smiling back.</p>
              <button
                type="button"
                onClick={() => playPranxSound("joke")}
                className="mt-6 inline-flex w-full max-w-[17rem] items-center justify-center bg-[#3f7f91] px-5 py-4 text-3xl font-black uppercase leading-none text-white shadow-[8px_8px_0_#0f172a]"
              >
                Next Joke
                <span className="ml-4 text-5xl leading-none">›</span>
              </button>
            </div>
          </aside>
        </div>
      </section>

      <section className="border-b-4 border-[#3f7f91] bg-white">
        <div className="mx-auto flex max-w-[1500px] flex-col items-center justify-center gap-6 px-4 py-8 text-center sm:flex-row sm:px-6">
          <img src={mascotImage} alt="" className="h-32 w-auto sm:h-44" />
          <h2 className="text-5xl font-black tracking-[0.08em] text-[#574a40] sm:text-7xl lg:text-8xl">Just Pranx, Bro!</h2>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1500px] gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {filtered.map((tile, index) => {
            const prank = findPrank(tile.slug);
            return (
              <Link key={`${tile.slug}-${index}`} href={`/pranx/${tile.slug}`} onClick={() => playPranxSound("joke")} className="group relative min-w-0 overflow-hidden rounded-lg bg-[#2f7080] shadow-lg ring-0 ring-[#2f7080] transition hover:-translate-y-1 hover:ring-4">
                <div className="relative aspect-[3/2] overflow-hidden">
                  <img src={tile.image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-3 py-2">
                    <h3 className="truncate text-center text-2xl font-black text-white" style={{ textShadow: "0 3px 0 rgba(0,0,0,0.5)" }}>{tile.title}</h3>
                  </div>
                  {tile.badge ? <span className="absolute right-3 top-3 rotate-[-12deg] rounded bg-red-500 px-3 py-1 text-sm font-black uppercase text-white">{tile.badge}</span> : null}
                </div>
                <span className="sr-only">{prank?.description}</span>
              </Link>
            );
          })}
        </div>
        <aside className="h-fit rounded-2xl bg-white p-5 text-center shadow-lg ring-1 ring-slate-200 lg:sticky lg:top-28">
          <h3 className="text-2xl font-black text-[#2f3938]">Effects</h3>
          <div className="mt-6 grid gap-4 text-left text-lg font-black text-slate-600">
            {effectRows.map((item) => (
              <button key={item.key} type="button" onClick={() => toggleEffect(item.key)} className="flex items-center justify-between gap-3 rounded-xl px-1 py-1 text-left transition hover:bg-slate-100" aria-pressed={effects[item.key]}>
                <span>{item.label}:</span>
                <span className={`h-8 w-16 rounded-full p-1 transition ${effects[item.key] ? "bg-[#3f7f91]" : "bg-slate-300"}`}>
                  <span className={`block h-6 w-6 rounded-full bg-white shadow transition ${effects[item.key] ? "ml-8" : ""}`} />
                </span>
              </button>
            ))}
          </div>
          <div className="mt-6">
            <AdSidebar ad={{ bannerUrl: "/banners/vertical.jpg", redirect: "#" }} />
          </div>
        </aside>
      </section>

      <div className="mx-auto max-w-[1500px] px-4 sm:px-6 mb-8">
        <AdBottomBanner ad={{ bannerUrl: "/banners/rectangle-long.png", redirect: "#" }} />
      </div>

      <section className="border-t-4 border-[#3f7f91] bg-white">
        <div className="mx-auto max-w-5xl px-4 py-10 text-xl font-bold leading-8 text-[#2f3938] sm:px-6">
          <h2 className="text-4xl font-black">Online Pranks</h2>
          <p className="mt-5">Open a safe browser prank, switch to fullscreen, and let the page do the acting. These local demos are designed for playful testing, training videos, and harmless reactions.</p>
          <div className="my-8 flex justify-center">
            <img src={f11Image} alt="" className="w-full max-w-2xl rounded-lg object-cover shadow-lg" />
          </div>
          <h3 className="mt-8 text-3xl font-black">How To Use The Online Pranks?</h3>
          <ol className="mt-5 grid gap-4">
            <li>1. Pick a simulator card from the gallery.</li>
            <li>2. Use fullscreen when the route supports it.</li>
            <li>3. Press Esc anytime to return to normal browsing.</li>
          </ol>
          <Link href="#top" className="mx-auto mt-10 flex w-fit text-2xl font-black text-[#2f7080] underline">Back to top</Link>
        </div>
      </section>
    </main>
  );
}
