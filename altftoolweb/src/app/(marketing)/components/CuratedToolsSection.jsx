"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Puzzle,
  Smartphone,
  Sparkles,
} from "lucide-react";

const toolTypes = [
  { label: "AI Tools", icon: Bot },
  { label: "Browser Extensions", icon: Puzzle },
  { label: "Mobile Apps", icon: Smartphone },
  { label: "Productivity Apps", icon: CheckCircle2 },
];

export default function CuratedToolsSection() {
  return (
    <section className="section home-curated-section">
      <div className="home-curated-shell">
        <div className="home-curated-visual" aria-hidden="true">
          <Image
            src="/assets/home-curated-tools-person.png"
            alt=""
            width={1403}
            height={1121}
            className="home-curated-image"
          />
        </div>

        <div className="home-curated-copy">
          <div className="home-reference-badge">
            <Sparkles className="h-4 w-4" />
            Discover tools
          </div>

          <h2 className="home-curated-title">
            200+ Curated Tools{" "}
            <span>In One Place</span>
          </h2>

          <p className="home-curated-description">
            Explore trusted tools, extensions, and apps curated to help you work smarter.
          </p>

          <div className="home-curated-grid">
            {toolTypes.map((item) => {
              const Icon = item.icon;

              return (
                <Link key={item.label} href="/tools/all" className="home-curated-feature">
                  <span>
                    <Icon className="h-5 w-5" />
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </div>

          <Link href="/tools/all" className="home-curated-cta">
            Explore All Tools
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
