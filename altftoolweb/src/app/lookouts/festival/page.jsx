import JsonLd from "@/platform/seo/JsonLd";
import {
  absoluteUrl,
  createBreadcrumbJsonLd,
  createPageMetadata,
  getSiteUrl,
  siteConfig,
} from "@/platform/seo/generateMetadata";
import { computeRealStats, getFeaturedFestival, getFestivalBySlug, getUpcomingFestivals } from "./lib/getFestivals";
import { resolveLiveDates } from "./lib/resolveLiveFestivals";
import { fetchFestivalPhoto, fetchWikiSummary } from "./lib/upstream";
import { getStatusLabel } from "./lib/dateMath";
import { FOOD_CULTURE } from "./data/foodCulture";
import FestivalHome from "./components/home/FestivalHome";
import "../festival.css";

const STATS = computeRealStats();

const PAGE_DESCRIPTION = `Explore ${STATS.festivals}+ real festivals across ${STATS.countries}+ countries and ${STATS.religions} religions — live countdowns, traditions, foods, and history sourced from Nager.Date, REST Countries, and Wikipedia.`;

export async function generateMetadata() {
  return createPageMetadata({
    title: "World Festival Hub — Explore Every Festival on the Planet",
    description: PAGE_DESCRIPTION,
    path: "/lookouts/festival",
    keywords: [
      "world festivals",
      "festival calendar",
      "religious festivals",
      "cultural festivals",
      "festival explorer",
      "public holidays by country",
    ],
  });
}

function createCollectionJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${absoluteUrl("/lookouts/festival")}#webpage`,
    name: "World Festival Hub",
    url: absoluteUrl("/lookouts/festival"),
    description: PAGE_DESCRIPTION,
    isPartOf: { "@id": `${getSiteUrl()}/#website` },
    publisher: { "@id": `${getSiteUrl()}/#organization` },
  };
}

export default async function FestivalHubPage() {
  const now = new Date();

  const upcomingCandidates = getUpcomingFestivals({ now, limit: 10 });
  const liveDates = await resolveLiveDates(upcomingCandidates, { now });

  const topUpcoming = [...upcomingCandidates]
    .sort((a, b) => {
      const dateA = liveDates.get(a.slug)?.date || "9999";
      const dateB = liveDates.get(b.slug)?.date || "9999";
      return dateA < dateB ? -1 : dateA > dateB ? 1 : 0;
    })
    .slice(0, 6);

  const upcoming = await Promise.all(
    topUpcoming.map(async (festival) => {
      const dateIso = liveDates.get(festival.slug)?.date;
      const photo = await fetchFestivalPhoto(festival);
      return {
        festival,
        dateIso,
        photo,
        statusLabel: getStatusLabel(dateIso, now),
      };
    }),
  );

  const featuredFestival = topUpcoming[0] || getFeaturedFestival({ now });
  const featuredDateIso = liveDates.get(featuredFestival.slug)?.date;
  const [featuredWiki, featuredPhoto] = await Promise.all([
    fetchWikiSummary(featuredFestival.wikipediaTitle),
    fetchFestivalPhoto(featuredFestival),
  ]);

  // Food cards have no Wikipedia page of their own, so they fall back to the
  // photo of the festival they belong to rather than showing nothing.
  const foodPhotoEntries = await Promise.all(
    FOOD_CULTURE.map(async (item) => {
      const festival = getFestivalBySlug(item.festivalSlug);
      const photo = await fetchFestivalPhoto({
        unsplashQuery: item.unsplashQuery,
        wikipediaTitle: festival?.wikipediaTitle,
        name: item.food,
      });
      return [item.food, photo];
    }),
  );
  const foodPhotos = Object.fromEntries(foodPhotoEntries);

  return (
    <>
      <JsonLd
        id="festival-hub-schema"
        data={[
          createCollectionJsonLd(),
          createBreadcrumbJsonLd([
            { name: siteConfig.name, path: "/" },
            { name: "Lookouts", path: "/lookouts" },
            { name: "World Festival Hub", path: "/lookouts/festival" },
          ]),
        ]}
      />
      <FestivalHome
        stats={STATS}
        upcoming={upcoming}
        calendarYear={now.getUTCFullYear()}
        initialCalendarMonth={now.getUTCMonth() + 1}
        featured={{
          festival: featuredFestival,
          dateIso: featuredDateIso,
          photo: featuredPhoto ? { ...featuredPhoto, url: featuredPhoto.fullUrl || featuredPhoto.url } : null,
          historyExtract: featuredWiki?.extract || null,
        }}
        foodPhotos={foodPhotos}
      />
    </>
  );
}
