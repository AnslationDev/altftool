"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Hero from "./Hero";
import "../styles/academy.css";
import { getAcademyList } from "../service/academyService";
import RouteLazySection from "@/components/ui/RouteLazySection";
import {
  AcademyResultsSkeleton,
  ExplorePlatformSkeleton,
  FeaturedAcademiesSkeleton,
  LearningPlatformSkeleton,
} from "@/components/ui/skeleton";
import { RouteSectionSkeleton } from "@/components/ui/route-loading";

const FeaturedAcademies = dynamic(() => import("../components/FeaturedAcademies"), {
  loading: () => <FeaturedAcademiesSkeleton />,
});
const LearningPlatform = dynamic(() => import("./LearningPlatform"), {
  loading: () => <LearningPlatformSkeleton />,
});
const ExplorePlatform = dynamic(() => import("../components/ExplorePlatform"), {
  loading: () => <ExplorePlatformSkeleton />,
});
const AcademyResults = dynamic(() => import("./AcademyResults"), {
  loading: () => <AcademyResultsSkeleton />,
});
const Feedback = dynamic(() => import("../components/Feedback"), {
  loading: () => <RouteSectionSkeleton cards={3} />,
});
const FaqSection = dynamic(() => import("./FAQs"), {
  loading: () => <RouteSectionSkeleton cards={2} />,
});

export default function AcademyProject() {
  const [activeCategory, setActiveCategory] = useState("Skills & Career Growth");
  const [academies, setAcademies] = useState([]);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    const fetchData = async () => {
      const data = await getAcademyList();
      setAcademies(data);
      setLoading(false);
    };

    fetchData();
  }, []);

  const filtered = useMemo(() => {
    if (!activeCategory) return [];
    if (activeCategory === "All") return academies;

    return academies.filter(
      (a) =>
        a.category?.toLowerCase().trim() ===
        activeCategory.toLowerCase().trim()
    );
  }, [activeCategory, academies]);

  const featured = academies.slice(0, 6);

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <div className="">
        <Hero loading={loading} />
        <RouteLazySection fallback={<FeaturedAcademiesSkeleton />} minHeight={180}>
          <FeaturedAcademies items={featured} loading={loading} />
        </RouteLazySection>
        <RouteLazySection fallback={<LearningPlatformSkeleton />} minHeight={560}>
          <LearningPlatform loading={loading} />
        </RouteLazySection>
        <RouteLazySection fallback={<ExplorePlatformSkeleton />} minHeight={520}>
          <ExplorePlatform
            loading={loading}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
          />
        </RouteLazySection>

        <RouteLazySection fallback={<AcademyResultsSkeleton />} minHeight={620}>
          <AcademyResults
            loading={loading}
            items={filtered}
            activeCategory={activeCategory}
          />
        </RouteLazySection>

        <RouteLazySection fallback={<RouteSectionSkeleton cards={3} />} minHeight={300}>
          <Feedback />
        </RouteLazySection>
        <RouteLazySection fallback={<RouteSectionSkeleton cards={2} />} minHeight={260}>
          <FaqSection />
        </RouteLazySection>
      </div>
    </main>
  );
}
