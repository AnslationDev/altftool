"use client";

import FestivalHeader from "../shared/FestivalHeader";
import FestivalFooter from "../shared/FestivalFooter";
import FestivalHero from "./FestivalHero";
import UpcomingFestivalsSection from "./UpcomingFestivalsSection";
import CategoryGrid from "./CategoryGrid";
import ReligionGrid from "./ReligionGrid";
import CountryGrid from "./CountryGrid";
import FeaturedFestivalSpotlight from "./FeaturedFestivalSpotlight";
import MonthlyCalendarSection from "./MonthlyCalendarSection";
import FoodCultureSection from "./FoodCultureSection";
import StatsBand from "./StatsBand";
import NewsletterSection from "./NewsletterSection";

export default function FestivalHome({
  stats,
  upcoming,
  featured,
  foodPhotos,
  calendarYear,
  initialCalendarMonth,
}) {
  return (
    <div className="festival-page">
      <FestivalHeader />
      <FestivalHero stats={stats} upcoming={upcoming} />
      <UpcomingFestivalsSection items={upcoming} />
      <CategoryGrid />
      <ReligionGrid />
      <CountryGrid />
      {featured ? (
        <FeaturedFestivalSpotlight
          festival={featured.festival}
          dateIso={featured.dateIso}
          photo={featured.photo}
          historyExtract={featured.historyExtract}
        />
      ) : null}
      <MonthlyCalendarSection calendarYear={calendarYear} initialMonth={initialCalendarMonth} />
      <FoodCultureSection photos={foodPhotos} />
      <StatsBand stats={stats} />
      <NewsletterSection />
      <FestivalFooter />
    </div>
  );
}
