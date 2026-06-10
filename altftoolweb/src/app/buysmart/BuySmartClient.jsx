"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  ListChecks,
  Search,
  ShieldCheck,
  TicketPercent,
} from "lucide-react";

import HeroBanner from "./components/HeroBanner";
import useIdleRedirect from "@/hooks/useIdleRedirect";
import RouteLazySection from "@/components/ui/RouteLazySection";
import {
  AlphabetFilterSkeleton,
  CategoriesSkeleton,
  DiscoverBrandsSkeleton,
  FeatureBrandSkeleton,
  SearchExploreSkeleton,
  TrendingSkeleton,
} from "@/components/ui/skeleton";

const Trending = dynamic(() => import("./components/Trending"), {
  loading: () => <TrendingSkeleton />,
});
const SavingsHub = dynamic(() => import("./components/SavingsHub"), {
  loading: () => <CategoriesSkeleton cards={6} />,
});
const FeatureBrand = dynamic(() => import("./components/FeatureBrand"), {
  loading: () => <FeatureBrandSkeleton />,
});
const DiscoverBrands = dynamic(() => import("./components/DiscoverBrands"), {
  loading: () => <DiscoverBrandsSkeleton />,
});
const SearchExplore = dynamic(() => import("./components/SearchExplore"), {
  loading: () => <SearchExploreSkeleton />,
});
const AlphabetFilter = dynamic(() => import("./components/AlphabetFilter"), {
  loading: () => <AlphabetFilterSkeleton />,
});
const Categories = dynamic(() => import("./components/Categories"), {
  loading: () => <CategoriesSkeleton />,
});

export default function Page() {
  const [selectedLetter, setSelectedLetter] = useState("All");
  const [filteredCategory, setFilteredCategory] = useState(null);
  const [searchInput, SetSearchInput] = useState("");

  useIdleRedirect();

  const filterRef = useRef(null);
  const scrollToFilter = () => {
    filterRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  const handleSelect = (char) => {
    setSelectedLetter(char);
  };

  return (
    <div
      data-testid="buysmart-page"
      className="route-page-shell mx-auto"
    >
      <section data-testid="buysmart-hero-section" className="section !py-4 sm:!py-5">
        <HeroBanner />
      </section>

      <section className="section !pt-0">
        <BuySmartFlowStrip scrollToFilter={scrollToFilter} />
      </section>

      <RouteLazySection
        fallback={<SearchExploreSkeleton />}
        idleDelay={700}
        minHeight={380}
        rootMargin="900px 0px"
      >
        <section id="brand-search" className="section">
          <SearchExplore
            scrollToFilter={scrollToFilter}
            SetSearchInput={SetSearchInput}
            searchInput={searchInput}
            onSearchResult={(category) => {
              setFilteredCategory(category);
            }}
          />
        </section>
      </RouteLazySection>

      <RouteLazySection
        fallback={<CategoriesSkeleton />}
        idleDelay={800}
        minHeight={680}
        rootMargin="900px 0px"
      >
        <section id="brand-directory" className="section">
          <AlphabetFilter
            onSelect={handleSelect}
            selectedLetter={selectedLetter}
          />

          <div ref={filterRef}>
            <Categories
              selectedLetter={selectedLetter}
              filteredCategory={filteredCategory}
            />
          </div>
        </section>
      </RouteLazySection>

      <RouteLazySection
        fallback={<CategoriesSkeleton cards={6} />}
        idleDelay={900}
        minHeight={620}
        rootMargin="900px 0px"
      >
        <section id="buysmart-savings" className="section">
          <SavingsHub />
        </section>
      </RouteLazySection>

      <RouteLazySection
        fallback={<TrendingSkeleton />}
        idleDelay={1000}
        minHeight={360}
        rootMargin="900px 0px"
      >
        <section className="section">
          <Trending />
        </section>
      </RouteLazySection>

      <RouteLazySection
        fallback={<FeatureBrandSkeleton />}
        idleDelay={1100}
        minHeight={520}
        rootMargin="900px 0px"
      >
        <section className="section">
          <FeatureBrand />
        </section>
      </RouteLazySection>

      <RouteLazySection
        fallback={<DiscoverBrandsSkeleton />}
        idleDelay={1200}
        minHeight={260}
        rootMargin="900px 0px"
      >
        <section className="section">
          <DiscoverBrands />
        </section>
      </RouteLazySection>
    </div>
  );
}

function BuySmartFlowStrip({ scrollToFilter }) {
  const items = [
    {
      icon: ShieldCheck,
      label: "Verify",
      title: "Check active offers",
      description: "See codes, cashback, rewards, and expiry notes before opening a store.",
      href: "#buysmart-savings",
    },
    {
      icon: Search,
      label: "Search",
      title: "Find a brand fast",
      description: "Search by brand, category, keyword, audience, or offer type.",
      href: "#brand-search",
    },
    {
      icon: ListChecks,
      label: "Compare",
      title: "Browse A-Z",
      description: "Filter by category and jump through the full BuySmart directory.",
      action: scrollToFilter,
    },
    {
      icon: TicketPercent,
      label: "Save",
      title: "Open all stores",
      description: "Use the complete store directory when you want a broader shortlist.",
      href: "/buysmart/view-all",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map(({ icon: Icon, label, title, description, href, action }) => {
        const content = (
          <>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--anslation-ds-radius)] bg-(--muted) text-(--primary)">
              <Icon className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wide text-(--muted-foreground)">
                {label}
              </span>
              <span className="mt-1 block text-sm font-bold text-(--foreground)">
                {title}
              </span>
              <span className="mt-1 line-clamp-2 block text-xs leading-5 text-(--muted-foreground)">
                {description}
              </span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-(--primary)" />
          </>
        );

        const className = "interactive-card group flex min-h-[116px] items-start gap-3 p-3 text-left motion-reduce:transform-none";

        if (action) {
          return (
            <button key={title} type="button" onClick={action} className={className}>
              {content}
            </button>
          );
        }

        return (
          <Link key={title} href={href} className={className}>
            {content}
          </Link>
        );
      })}
      <div className="surface-panel flex items-center gap-2 px-3 py-2 text-xs font-semibold text-(--muted-foreground) sm:col-span-2 lg:col-span-4">
        <BadgeCheck className="h-4 w-4 text-(--primary)" />
        BuySmart keeps fallback data ready while live Firebase content syncs in, so the page stays useful even during slow network reads.
      </div>
    </div>
  );
}
