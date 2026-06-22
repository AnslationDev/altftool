"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Puzzle,
  Search,
  Star,
} from "lucide-react";

const heroTiles = [
  {
    label: "AI Tools",
    asset: "/assets/home-icons/hero-ai.svg",
    className: "home-hero-tool-tile-ai",
  },
  {
    label: "PDF Tools",
    asset: "/assets/home-icons/hero-pdf.svg",
    className: "home-hero-tool-tile-pdf",
  },
  {
    label: "Image Tools",
    asset: "/assets/home-icons/hero-image.svg",
    className: "home-hero-tool-tile-image",
  },
  {
    label: "Extensions",
    asset: "/assets/home-icons/hero-extension.svg",
    className: "home-hero-tool-tile-extension",
  },
];

const avatars = [
  "https://i.pravatar.cc/80?img=12",
  "https://i.pravatar.cc/80?img=32",
  "https://i.pravatar.cc/80?img=68",
];

const heroFloatingIcons = [
  {
    className: "home-hero-orbit-card-top",
    asset: "/assets/home-icons/hero-image.svg",
  },
  {
    className: "home-hero-orbit-card-code",
    asset: "/assets/home-icons/hero-code.svg",
  },
  {
    className: "home-hero-orbit-card-star",
    asset: "/assets/home-icons/hero-star.svg",
  },
  {
    className: "home-hero-orbit-card-chat",
    asset: "/assets/home-icons/hero-pdf.svg",
  },
  {
    className: "home-hero-orbit-card-image",
    asset: "/assets/home-icons/hero-image.svg",
  },
];

export default function HeroSection() {
  const [heroSearchQuery, setHeroSearchQuery] = useState("");
  const [heroSearchError, setHeroSearchError] = useState("");
  const router = useRouter();

  const handleHeroSearch = (event) => {
    event.preventDefault();
    const trimmed = heroSearchQuery.trim();

    if (trimmed.length < 2) {
      setHeroSearchError("Type at least 2 characters.");
      return;
    }

    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    setHeroSearchQuery(trimmed);
    setHeroSearchError("");
  };

  return (
    <section className="section home-hero-section relative overflow-hidden">
      <div className="home-hero-band relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 home-subtle-grid opacity-70" />
        <div className="pointer-events-none absolute -left-40 top-10 h-[32rem] w-[32rem] rounded-full bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] blur-3xl" />

        <div className="home-hero-inner relative mx-auto max-w-[1280px] px-[var(--anslation-ds-gutter)]">
          <div className="home-hero-content-grid grid items-center gap-10 lg:grid-cols-[0.94fr_1.06fr] xl:gap-16">
            <div className="home-reveal">
              <div className="home-reference-badge">
                <Image
                  src="/assets/home-icons/platform-badge.svg"
                  alt=""
                  aria-hidden
                  width={36}
                  height={36}
                  className="h-4 w-4"
                  unoptimized
                />
                All-in-one productivity platform
              </div>

              <h1 className="mt-6 max-w-[39rem] text-balance text-[clamp(2.65rem,4.45vw,3.92rem)] font-black leading-[1.03] tracking-normal text-[var(--foreground)]">
                <span className="block sm:whitespace-nowrap">Find the right tool.</span>
                <span className="mt-2 block bg-gradient-to-r from-[var(--primary)] to-[#4e8cff] bg-clip-text text-transparent">
                  Finish work faster.
                </span>
              </h1>

              <p className="mt-6 max-w-[34rem] text-[1.04rem] font-semibold leading-8 text-[var(--muted-foreground)]">
                Discover 200+ trusted tools, extensions, and deals to simplify
                your work and boost productivity.
              </p>

              <div className="mt-7 flex flex-col gap-4 sm:flex-row">
                <Link href="/tools/all" className="home-ref-primary-btn">
                  Explore Tools
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/extensions" className="home-ref-secondary-btn">
                  View Extensions
                  <Puzzle className="h-5 w-5" />
                </Link>
              </div>

              <div className="mt-7">
                <p className="text-[0.92rem] font-bold text-[var(--muted-foreground)]">
                  Trusted by 50K+ users worldwide
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <div className="flex -space-x-2">
                    {avatars.map((avatar, index) => (
                      <Image
                        key={avatar}
                        src={avatar}
                        alt={`AltFTool trusted user ${index + 1}`}
                        width={38}
                        height={38}
                        unoptimized
                        className="h-[38px] w-[38px] rounded-full border-[3px] border-white object-cover shadow-[0_8px_18px_rgba(55,49,120,0.14)]"
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-0.5 text-[#f6b313]">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} className="h-[18px] w-[18px] fill-current" />
                    ))}
                  </div>
                  <span className="text-lg font-black text-[var(--foreground)]">
                    4.9/5
                  </span>
                </div>
              </div>

            </div>

            <div className="home-reveal home-hero-visual relative flex min-h-[285px] items-center [animation-delay:110ms]">
              <div className="home-hero-blob-field" aria-hidden="true">
                <span className="home-hero-blob home-hero-blob-a" />
                <span className="home-hero-blob home-hero-blob-b" />
                <span className="home-hero-blob home-hero-blob-c" />
                <span className="home-hero-blob home-hero-blob-d" />
                <span className="home-hero-blob home-hero-blob-e" />
                <span className="home-hero-blob-glow" />
              </div>

              {heroFloatingIcons.map(({ className, asset }) => (
                <span
                  key={className}
                  className={`home-hero-orbit-card ${className}`}
                  aria-hidden="true"
                >
                  <Image
                    src={asset}
                    alt=""
                    aria-hidden
                    width={72}
                    height={72}
                    className="home-hero-orbit-icon"
                    unoptimized
                  />
                </span>
              ))}

              <form
                onSubmit={handleHeroSearch}
                className="home-hero-search-card relative mx-auto mt-8 w-full max-w-[620px] rounded-[1.8rem] bg-white p-5 dark:bg-[color-mix(in_srgb,var(--card)_92%,#071426)] lg:mt-0"
              >
                <div className="relative">
                  <label className="flex h-[58px] items-center gap-3 rounded-[1.05rem] border border-[var(--home-border)] bg-white px-5 shadow-[0_8px_20px_rgba(55,49,120,0.045)] transition focus-within:border-[color-mix(in_srgb,var(--primary)_34%,var(--home-border))] dark:bg-[var(--card)]">
                    <Search className="h-4.5 w-4.5 text-[var(--muted-foreground)]" />
                    <input
                      value={heroSearchQuery}
                      onChange={(event) => {
                        setHeroSearchQuery(event.target.value);
                        if (heroSearchError) setHeroSearchError("");
                      }}
                      placeholder="Search tools, extensions, deals..."
                      className="home-hero-search-input min-w-0 flex-1 border-0 bg-transparent text-[0.92rem] font-bold text-[var(--foreground)] outline-none placeholder:text-[var(--muted-foreground)]"
                      aria-label="Search tools, extensions, and deals"
                      aria-invalid={heroSearchError ? "true" : "false"}
                    />
                    <button type="submit" className="home-ref-search-btn" aria-label="Search">
                      <Search className="h-4.5 w-4.5" />
                    </button>
                  </label>
                  {heroSearchError ? (
                    <p className="mt-2 text-xs font-bold text-[var(--anslation-ds-danger)]">
                      {heroSearchError}
                    </p>
                  ) : null}

                  <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {heroTiles.map(({ label, asset, className }) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setHeroSearchQuery(label)}
                        className={`home-hero-tool-tile group ${className}`}
                      >
                        <span className="home-hero-tool-icon home-hero-tool-icon-asset">
                          <Image
                            src={asset}
                            alt=""
                            aria-hidden
                            width={72}
                            height={72}
                            className="h-10 w-10"
                            unoptimized
                          />
                        </span>
                        <span className="home-hero-tool-label mt-2.5 text-xs font-black text-[var(--foreground)]">
                          {label}
                        </span>
                        <ArrowRight className="home-hero-tool-arrow h-3.5 w-3.5" />
                      </button>
                    ))}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
