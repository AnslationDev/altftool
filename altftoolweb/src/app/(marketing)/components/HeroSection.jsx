"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  LayoutGrid,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";

const heroStats = [
  { label: "50K+ Users", icon: Users },
  { label: "4.9/5 Rating", icon: Star, accent: "gold" },
  { label: "Trusted Platform", icon: ShieldCheck, accent: "green" },
];

export default function HeroSection() {
  return (
    <section className="section home-hero-section relative overflow-hidden">
      <div className="home-hero-band relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 home-subtle-grid opacity-70" />
        <div className="pointer-events-none absolute -left-40 top-10 h-[32rem] w-[32rem] rounded-full bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] blur-3xl" />

        <div className="home-hero-inner relative mx-auto max-w-[1280px] px-[var(--anslation-ds-gutter)]">
          <div className="home-hero-content-grid grid items-center gap-9 lg:grid-cols-[0.96fr_1.04fr] xl:gap-14">
            <div className="home-reveal">
              <div className="home-reference-badge">
                <span className="home-reference-badge-icon" aria-hidden="true">
                  <LayoutGrid className="h-3.5 w-3.5" />
                </span>
                All-in-one productivity platform
              </div>

              <h1 className="mt-6 max-w-[39rem] text-balance text-[clamp(2.35rem,3.9vw,3.45rem)] font-extrabold leading-[1.06] tracking-normal text-[var(--foreground)] [font-family:var(--home-font-display)]">
                Find Tools. Extensions.{" "}
                <span className="bg-gradient-to-r from-[var(--primary)] to-[#38BDF8] bg-clip-text text-transparent">
                  Apps.
                </span>
                {" "}All In One Place.
              </h1>

              <p className="mt-6 max-w-[35rem] text-[0.98rem] font-normal leading-8 text-[var(--muted-foreground)]">
                Discover trusted productivity tools, browser extensions, and
                mobile apps curated to help you work smarter.
              </p>

              <div className="mt-7 flex flex-col gap-4 sm:flex-row">
                <Link href="/tools/all" className="home-ref-primary-btn">
                  Explore Tools
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/about-us" className="home-ref-secondary-btn">
                  Learn More
                </Link>
              </div>

              <div className="home-hero-stat-strip mt-8">
                {heroStats.map((item) => {
                  const Icon = item.icon;

                  return (
                    <span key={item.label} className="home-hero-stat-item">
                      <Icon className={`h-5 w-5 ${item.accent ? `home-hero-stat-icon-${item.accent}` : ""}`} />
                      {item.label}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="home-reveal home-hero-visual home-hero-reference-visual relative flex min-h-[330px] items-center justify-center [animation-delay:110ms]">
              <Image
                src="/assets/home-hero-generated-team-transparent-v3.png"
                alt="Creators exploring AltFTool digital tools on a laptop"
                width={1341}
                height={1013}
                priority
                className="home-hero-reference-image"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
