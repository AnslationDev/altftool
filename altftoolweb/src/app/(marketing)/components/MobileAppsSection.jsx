"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Smartphone,
  Zap,
} from "lucide-react";

const benefits = [
  { label: "Made for Every Device", icon: Smartphone },
  { label: "Secure & Reliable", icon: ShieldCheck },
  { label: "Fast & Lightweight", icon: Zap },
];

export default function MobileAppsSection() {
  return (
    <section className="section home-apps-section">
      <div className="home-apps-shell">
        <div className="home-apps-copy">
          <div className="home-kicker home-apps-kicker">
            <Smartphone className="h-4 w-4" />
            MOBILE APPS
          </div>

          <h2 className="section-title mt-3 max-w-[31rem]">
            We&apos;ve got powerful <span className="bg-gradient-to-r from-[var(--primary)] to-[#38BDF8] bg-clip-text text-transparent">apps</span> for you too.
          </h2>

          <p className="mt-4 max-w-[29rem] text-[0.96rem] font-semibold leading-7 text-[var(--muted-foreground)]">
            Discover a growing collection of mobile apps built to simplify your work and everyday life.
          </p>

          <div className="home-apps-actions">
            <Link href="/apps" className="home-ref-primary-btn">
              Explore Apps
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="home-apps-benefits">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <Link key={benefit.label} href="/apps" className="home-apps-benefit-card">
                  <span className="home-apps-benefit-icon">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span>{benefit.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="home-apps-visual home-apps-image-visual" aria-hidden="true">
          <Image
            src="/assets/home-mobile-apps-premium-transparent-clean-v2.png"
            alt=""
            width={1536}
            height={1024}
            className="home-apps-showcase-image"
            unoptimized
          />
        </div>
      </div>
    </section>
  );
}
