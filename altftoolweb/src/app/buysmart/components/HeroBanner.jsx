"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
} from "lucide-react";

import "./buysmart-hero.css";

export default function HeroBanner({ children }) {
  return <PremiumBuySmartHero>{children}</PremiumBuySmartHero>;
}

function PremiumBuySmartHero({ children }) {
  const stats = [
    { label: "Categories", value: "100+" },
    { label: "Verified stores", value: "15K+" },
    { label: "Happy shoppers", value: "2M+" },
  ];

  return (
    <section className="buy-smart-hero animate-slide-up">
      <div className="buy-smart-hero-glow" aria-hidden="true" />
      <div className="buy-smart-hero-topline" aria-hidden="true" />

      <div className="buy-smart-hero-inner">
        <div className="buy-smart-hero-grid">
        <div className="buy-smart-hero-copy">
          <div className="buy-smart-hero-badge">
            <BadgeCheck className="h-3.5 w-3.5" />
            Smart shopping starts here
          </div>
          <h1 className="buy-smart-hero-title">
            Smarter <span>Shopping</span> Starts Here
          </h1>
          <p className="buy-smart-hero-description">
            Compare brands, explore offers, and shop from trusted stores with confidence.
          </p>

          <div className="buy-smart-hero-actions">
            <Link
              href="#buysmart-savings"
              className="buy-smart-hero-primary"
            >
              Explore savings
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/buysmart/view-all"
              className="buy-smart-hero-secondary"
            >
              View all stores
            </Link>
          </div>

          <div className="buy-smart-hero-stats">
            {stats.map(({ label, value }) => (
              <div
                key={label}
                className="buy-smart-hero-stat-card"
              >
                <p>{value}</p>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="buy-smart-hero-visual" aria-hidden="true">
          <div className="buy-smart-hero-visual-glow" />
          <Image
            src="/buy-smart/buysmart-hero-removebg-2026-07-07.png"
            alt=""
            width={566}
            height={437}
            sizes="(max-width: 768px) 92vw, 52vw"
            priority
            className="buy-smart-hero-image"
          />
        </div>
        </div>
        {children ? <div className="buy-smart-hero-features">{children}</div> : null}
      </div>
    </section>
  );
}
