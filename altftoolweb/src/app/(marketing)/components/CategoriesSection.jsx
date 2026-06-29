import Link from "next/link";
import {
  ArrowRight,
  Tags,
} from "lucide-react";

const categories = [
  {
    title: "Design Tools",
    description: "Canva, Figma, Adobe & more",
    count: "50+ tools",
    href: "/tools/all",
    tone: "blue",
    icon: "design",
  },
  {
    title: "Writing Tools",
    description: "Grammarly, Jasper, QuillBot & more",
    count: "45+ tools",
    href: "/tools/all",
    tone: "amber",
    icon: "writing",
  },
  {
    title: "Developer Tools",
    description: "GitHub, Cursor, Replit & more",
    count: "40+ tools",
    href: "/tools/developer",
    tone: "indigo",
    icon: "developer",
  },
  {
    title: "Productivity Tools",
    description: "Notion, Todoist, ClickUp & more",
    count: "60+ tools",
    href: "/tools/all",
    tone: "violet",
    icon: "productivity",
  },
  {
    title: "Video Tools",
    description: "Descript, CapCut, VEED & more",
    count: "35+ tools",
    href: "/tools/all",
    tone: "indigo",
    icon: "video",
  },
  {
    title: "More Categories",
    description: "Explore all tools in one place",
    count: "View all",
    href: "/tools/all",
    tone: "soft",
    more: true,
    icon: "more",
  },
];

function CategoryIcon({ type }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 2.2,
  };

  if (type === "design") {
    return (
      <svg viewBox="0 0 72 72" className="home-category-line-icon" aria-hidden="true">
        <path {...common} d="M18 22h36M24 22c0 7 2 12 8 17M48 22c0 7-2 12-8 17" />
        <path {...common} d="M36 18v20" />
        <path {...common} d="M31 40h10l5 15-10 8-10-8 5-15Z" />
        <path {...common} d="M36 40v16" />
        <circle cx="18" cy="22" r="3" fill="currentColor" />
        <circle cx="36" cy="18" r="3" fill="currentColor" />
        <circle cx="54" cy="22" r="3" fill="currentColor" />
      </svg>
    );
  }

  if (type === "writing") {
    return (
      <svg viewBox="0 0 72 72" className="home-category-line-icon" aria-hidden="true">
        <path {...common} d="M20 12h28l10 10v36a4 4 0 0 1-4 4H20a4 4 0 0 1-4-4V16a4 4 0 0 1 4-4Z" />
        <path {...common} d="M48 12v12h12M25 31h22M25 42h15" />
        <path {...common} d="m43 53 14-14 6 6-14 14-8 2 2-8Z" />
      </svg>
    );
  }

  if (type === "developer") {
    return (
      <svg viewBox="0 0 72 72" className="home-category-line-icon" aria-hidden="true">
        <rect {...common} x="13" y="18" width="46" height="38" rx="4" />
        <path {...common} d="M13 27h46M22 23h1M29 23h1M36 23h1M31 38l-7 7 7 7M42 38l7 7-7 7M39 36l-6 18" />
      </svg>
    );
  }

  if (type === "productivity") {
    return (
      <svg viewBox="0 0 72 72" className="home-category-line-icon" aria-hidden="true">
        <path {...common} d="M22 16h28a5 5 0 0 1 5 5v35a5 5 0 0 1-5 5H22a5 5 0 0 1-5-5V21a5 5 0 0 1 5-5Z" />
        <path {...common} d="M29 14h14l3 7H26l3-7ZM29 34h18M29 49h18" />
        <circle cx="25" cy="34" r="5" fill="currentColor" opacity=".18" />
        <circle cx="25" cy="49" r="5" fill="currentColor" opacity=".18" />
        <path {...common} d="m22 34 2 2 4-5M22 49l2 2 4-5" />
      </svg>
    );
  }

  if (type === "video") {
    return (
      <svg viewBox="0 0 72 72" className="home-category-line-icon" aria-hidden="true">
        <rect {...common} x="14" y="18" width="44" height="32" rx="4" />
        <path d="m32 28 14 8-14 8V28Z" fill="currentColor" opacity=".85" />
        <path {...common} d="M28 58h16M36 50v8M24 58h-6M54 58h-6" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 72 72" className="home-category-line-icon" aria-hidden="true">
      <rect x="16" y="16" width="16" height="16" rx="5" fill="currentColor" opacity=".88" />
      <rect x="40" y="16" width="16" height="16" rx="5" fill="currentColor" opacity=".64" />
      <rect x="16" y="40" width="16" height="16" rx="5" fill="currentColor" opacity=".64" />
      <rect x="40" y="40" width="16" height="16" rx="5" fill="currentColor" opacity=".88" />
    </svg>
  );
}

function CategoryAsset({ category }) {
  return (
    <span className="home-category-asset" aria-hidden="true">
      <span className="home-category-asset-ring">
        <CategoryIcon type={category.icon} />
      </span>
    </span>
  );
}

export default function CategoriesSection() {
  return (
    <section className="section">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="home-kicker">
            <Tags className="h-4 w-4" strokeWidth={2.35} />
            Explore by category
          </p>
          <h2 className="section-title">Browse tools by what you do</h2>
          <p className="mt-3 max-w-[42rem] text-[15px] font-normal leading-[1.7] text-[var(--muted-foreground)]">
            Find the perfect tools and resources tailored to your needs.
          </p>
        </div>
        <Link href="/tools/all" className="home-reference-link">
          View all categories
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 xl:gap-6">
        {categories.map((category) => (
          <Link
            key={category.title}
            href={category.href}
            className={`home-category-ref-card home-category-ref-card-${category.tone} group`}
          >
            <CategoryAsset category={category} />
            <span className="home-category-card-copy">
              <span className="block text-[1.22rem] font-semibold leading-tight text-[var(--foreground)]">
                {category.title}
              </span>
              <span className="home-category-card-description">
                {category.description}
              </span>
              <span className="home-category-count-pill">
                <span>{category.count}</span>
                <span className="home-category-arrow">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
