import { notFound } from "next/navigation";
import JsonLd from "@/platform/seo/JsonLd";
import {
  absoluteUrl,
  createBreadcrumbJsonLd,
  createPageMetadata,
  siteConfig,
} from "@/platform/seo/generateMetadata";
import { getAllFestivals, getFestivalBySlug, getRelatedFestivals } from "../lib/getFestivals";
import { resolveLiveDates } from "../lib/resolveLiveFestivals";
import { fetchCountryInfo, fetchFestivalPhotos, fetchWikiSummary } from "../lib/upstream";
import FestivalDetail from "../components/detail/FestivalDetail";
import "../../festival.css";

export async function generateStaticParams() {
  return getAllFestivals().map((festival) => ({ slug: festival.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const festival = getFestivalBySlug(slug);
  if (!festival) return {};

  return createPageMetadata({
    title: `${festival.name} — Date, Traditions, History & Countdown`,
    description: `${festival.tagline} Live countdown, real dates, traditions, foods, and travel info for ${festival.name}, celebrated in ${festival.regionLabel}.`,
    path: `/lookouts/festival/${festival.slug}`,
    keywords: [festival.name, ...(festival.altNames || []), festival.religion, festival.category, "festival dates"],
  });
}

function createEventJsonLd(festival, dateIso, countries) {
  const primary = countries?.[0];
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: festival.name,
    description: festival.tagline,
    startDate: dateIso,
    eventAttendanceMode: "https://schema.org/MixedEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: {
      "@type": "Place",
      name: festival.regionLabel,
      address: primary?.name?.common || festival.regionLabel,
    },
    url: absoluteUrl(`/lookouts/festival/${festival.slug}`),
  };
}

export default async function FestivalDetailPage({ params }) {
  const { slug } = await params;
  const festival = getFestivalBySlug(slug);
  if (!festival) notFound();

  const now = new Date();
  const liveDates = await resolveLiveDates([festival], { now });
  const { date: dateIso, source: dateSource } = liveDates.get(festival.slug) || {};

  const related = getRelatedFestivals(festival, { limit: 4 });
  const relatedLiveDates = await resolveLiveDates(related, { now });
  const relatedDates = Object.fromEntries(
    related.map((f) => [f.slug, relatedLiveDates.get(f.slug)?.date]),
  );

  const [wiki, photos, countries] = await Promise.all([
    fetchWikiSummary(festival.wikipediaTitle),
    fetchFestivalPhotos(festival.unsplashQuery),
    fetchCountryInfo(festival.countryCodes),
  ]);

  const heroPhoto = photos?.[0]
    ? { ...photos[0], url: photos[0].fullUrl || photos[0].url }
    : wiki?.originalImageUrl
      ? { url: wiki.originalImageUrl, alt: festival.name, credit: "Wikipedia", source: "wikipedia" }
      : null;

  return (
    <>
      <JsonLd
        id={`festival-detail-schema-${festival.slug}`}
        data={[
          createEventJsonLd(festival, dateIso, countries),
          createBreadcrumbJsonLd([
            { name: siteConfig.name, path: "/" },
            { name: "World Festival Hub", path: "/lookouts/festival" },
            { name: festival.name, path: `/lookouts/festival/${festival.slug}` },
          ]),
        ]}
      />
      <FestivalDetail
        festival={festival}
        dateIso={dateIso}
        dateSource={dateSource}
        photo={heroPhoto}
        photos={photos || []}
        wiki={wiki}
        countries={countries}
        related={related}
        relatedDates={relatedDates}
      />
    </>
  );
}
