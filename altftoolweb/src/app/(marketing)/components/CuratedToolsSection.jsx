"use client";

import Image from "next/image";
import {
  HeartHandshake,
  Radar,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";

const aboutHighlights = [
  {
    title: "Our Mission",
    description: "Make finding useful digital tools simple and hassle-free.",
    icon: Radar,
    tone: "mission",
  },
  {
    title: "Our Vision",
    description: "Become the go-to destination for discovering trusted tools.",
    icon: ShieldCheck,
    tone: "vision",
  },
  {
    title: "Our Values",
    description: "Quality, simplicity, and user-first experiences.",
    icon: Sparkles,
    tone: "values",
  },
  {
    title: "Our Team",
    description: "Passionate creators focused on building better solutions.",
    icon: UsersRound,
    tone: "team",
  },
];

export default function CuratedToolsSection() {
  return (
    <section className="section home-curated-section">
      <div className="home-curated-shell">
        <div className="home-curated-visual" aria-hidden="true">
          <Image
            src="/assets/home-about-visual-transparent.png"
            alt=""
            width={1275}
            height={1020}
            className="home-curated-image"
          />
        </div>

        <div className="home-curated-copy">
          <div className="home-reference-badge">
            <HeartHandshake className="h-4 w-4" strokeWidth={2.35} />
            ABOUT US
          </div>

          <h2 className="home-curated-title">
            Helping You Discover{" "}
            <span>The Right Tools Faster</span>
          </h2>

          <p className="home-curated-description">
            We simplify tool discovery by bringing trusted apps, extensions, and
            resources together in one place, helping you save time and work smarter.
          </p>

          <div className="home-curated-about-grid">
            {aboutHighlights.map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.title} className="home-curated-about-card">
                  <span className={`home-curated-about-icon home-curated-about-icon-${item.tone}`}>
                    <Icon className="h-[1.35rem] w-[1.35rem]" strokeWidth={2.35} />
                  </span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
