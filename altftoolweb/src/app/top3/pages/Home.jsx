"use client";

import { Hero } from "../components/Hero";
import { FeaturedRankings } from "../components/FeaturedRankings";
import { TrendingWeek } from "../components/TrendingWeek";
import { EditorsPicks } from "../components/EditorsPicks";
import { CategoryExplorer } from "../components/CategoryExplorer";
import { MostPopular } from "../components/MostPopular";
import { FeaturedComparison } from "../components/FeaturedComparison";
import { CommunitySection } from "../components/CommunitySection";
import { TrustSection } from "../components/TrustSection";
import { PeopleStats } from "../components/PeopleStats";
import { Newsletter } from "../components/Newsletter";

export function Home() {
  return (
    <>
      <Hero />
      <FeaturedRankings />
      <TrendingWeek />
      <EditorsPicks />
      <CategoryExplorer />
      <MostPopular />
      <FeaturedComparison />
      <CommunitySection />
      <TrustSection />
      <PeopleStats />
      <Newsletter />
    </>
  );
}
