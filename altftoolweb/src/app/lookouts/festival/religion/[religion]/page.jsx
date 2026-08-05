import { notFound } from "next/navigation";
import { createPageMetadata } from "@/platform/seo/generateMetadata";
import { RELIGIONS, getReligion } from "../../data/religions";
import { getFestivalsByReligion } from "../../lib/getFestivals";
import { resolveLiveDates } from "../../lib/resolveLiveFestivals";
import { fetchFestivalPhotos } from "../../lib/upstream";
import FestivalListPage from "../../components/shared/FestivalListPage";
import "../../../festival.css";

const PAGE_SIZE = 12;

export async function generateStaticParams() {
  return RELIGIONS.map((religion) => ({ religion: religion.slug }));
}

// Declared for completeness, but note it does NOT gate this route the way it
// gates [slug]. dynamicParams only applies to statically-generated segments,
// and this one reads searchParams for pagination, which makes it dynamic (`ƒ`
// in the build output). Verified against `npm start`: /religion/bogus still
// answers 200. See the robots note in generateMetadata for what actually
// keeps unknown taxonomies out of the index.
export const dynamicParams = false;

export async function generateMetadata({ params }) {
  const { religion: slug } = await params;
  const religion = getReligion(slug);
  // An unknown slug renders the not-found body but cannot carry a 404 status:
  // festival/loading.jsx opens a Suspense boundary above this route, so the
  // response has already streamed by the time notFound() runs. That boundary
  // is load-bearing (it fixes a hydration/event-wiring race — see its own
  // comment), so rather than trade a real bug for a status code, the page
  // tells crawlers not to index it. Metadata is resolved before the stream, so
  // this tag does land.
  if (!religion) return { robots: { index: false, follow: false } };

  return createPageMetadata({
    title: `${religion.name} Festivals — Dates, Traditions & Countdowns`,
    description: `${religion.description} Explore every ${religion.name} festival with live dates and countdowns.`,
    path: `/lookouts/festival/religion/${religion.slug}`,
  });
}

export default async function ReligionFestivalsPage({ params, searchParams }) {
  const { religion: slug } = await params;
  const religion = getReligion(slug);
  if (!religion) notFound();

  const sp = await searchParams;
  const page = Math.max(1, Number(sp?.page) || 1);

  const all = getFestivalsByReligion(religion.slug);
  const totalPages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
  const pageItems = all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const now = new Date();
  const liveDates = await resolveLiveDates(pageItems, { now });
  const dates = Object.fromEntries(pageItems.map((f) => [f.slug, liveDates.get(f.slug)?.date]));

  const photoEntries = await Promise.all(
    pageItems.map(async (f) => [f.slug, (await fetchFestivalPhotos(f.unsplashQuery))?.[0] || null]),
  );
  const photos = Object.fromEntries(photoEntries);

  return (
    <FestivalListPage
      breadcrumbItems={[
        { label: "Festivals", href: "/lookouts/festival" },
        { label: "Religions", href: "/lookouts/festival#religions" },
        { label: religion.name },
      ]}
      title={`${religion.name} Festivals`}
      description={`${religion.description} ${all.length} festival${all.length === 1 ? "" : "s"} in our dataset.`}
      festivals={pageItems}
      dates={dates}
      photos={photos}
      page={page}
      totalPages={totalPages}
    />
  );
}
