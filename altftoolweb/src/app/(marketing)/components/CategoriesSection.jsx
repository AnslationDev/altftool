"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";

const categories = [
  {
    title: "Design Tools",
    description: "Canva, Figma, Adobe & more",
    count: "50+ tools",
    href: "/tools/all",
    tone: "blue",
    asset: "/assets/category-3d/design-tools.svg",
  },
  {
    title: "Writing Tools",
    description: "Grammarly, Jasper, QuillBot & more",
    count: "45+ tools",
    href: "/tools/all",
    tone: "amber",
    asset: "/assets/category-3d/writing-tools.svg",
  },
  {
    title: "Developer Tools",
    description: "GitHub, Cursor, Replit & more",
    count: "40+ tools",
    href: "/tools/developer",
    tone: "indigo",
    asset: "/assets/category-3d/developer-tools.svg",
  },
  {
    title: "Productivity Tools",
    description: "Notion, Todoist, ClickUp & more",
    count: "60+ tools",
    href: "/tools/all",
    tone: "violet",
    asset: "/assets/category-3d/productivity-tools.svg",
  },
  {
    title: "Video Tools",
    description: "Descript, CapCut, VEED & more",
    count: "35+ tools",
    href: "/tools/all",
    tone: "indigo",
    asset: "/assets/category-3d/video-tools.svg",
  },
  {
    title: "More Categories",
    description: "Explore all tools in one place",
    count: "View all",
    href: "/tools/all",
    tone: "soft",
    more: true,
    asset: "/assets/category-3d/more-categories.svg",
  },
];

function CategoryAsset({ category }) {
  return (
    <span className="home-category-asset home-category-asset-image">
      <Image
        src={category.asset}
        alt=""
        aria-hidden
        width={220}
        height={170}
        className="home-category-asset-img"
        loading="lazy"
        unoptimized
      />
    </span>
  );
}

export default function CategoriesSection() {
  return (
    <section className="section">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="home-kicker">
            <Sparkles className="h-4 w-4" />
            Explore by category
          </p>
          <h2 className="section-title">Browse tools by what you do</h2>
        </div>
        <Link href="/tools/all" className="home-reference-link">
          View all categories
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => (
          <Link
            key={category.title}
            href={category.href}
            className={`home-category-ref-card home-category-ref-card-${category.tone} group`}
          >
            <span className="home-category-card-copy">
              <span className="block text-lg font-black leading-tight text-[var(--foreground)]">
                {category.title}
              </span>
              <span className="home-category-card-description">
                {category.description}
              </span>
              <span className="mt-5 inline-flex items-center gap-1 text-sm font-black text-[var(--primary)]">
                {category.count}
                {category.more ? <ArrowRight className="h-3.5 w-3.5" /> : null}
              </span>
            </span>
            <CategoryAsset category={category} />
          </Link>
        ))}
      </div>
    </section>
  );
}
