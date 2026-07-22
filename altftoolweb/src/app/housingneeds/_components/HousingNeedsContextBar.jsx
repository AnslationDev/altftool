"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, House } from "lucide-react";
import { HN_CATEGORIES } from "../_data/categories";

const SERVICE_ROUTES = HN_CATEGORIES.flatMap((category) =>
  category.pages
    .filter((page) => !page.tags?.includes("Guide"))
    .map((page) => ({ category, page })),
).sort((a, b) => b.page.href.length - a.page.href.length);

export default function HousingNeedsContextBar() {
  const pathname = usePathname() || "";
  const match = SERVICE_ROUTES.find(
    ({ page }) => pathname === page.href || pathname.startsWith(`${page.href}/`),
  );

  if (!match) return null;

  return (
    <nav className="hn-context-bar" aria-label="HousingNeeds service navigation">
      <div className="hn-context-bar__inner">
        <Link href="/housingneeds" className="hn-context-bar__back">
          <ArrowLeft size={16} aria-hidden="true" />
          <span className="hn-context-bar__brand"><House size={16} aria-hidden="true" /> HousingNeeds</span>
        </Link>
        <span className="hn-context-bar__separator" aria-hidden="true" />
        <span className="hn-context-bar__location">{match.category.name} / {match.page.name}</span>
        <span className="hn-context-bar__preview">Service experience preview</span>
        <Link href={`/housingneeds?category=${match.category.slug}`} className="hn-context-bar__directory">
          View category
        </Link>
      </div>
    </nav>
  );
}
