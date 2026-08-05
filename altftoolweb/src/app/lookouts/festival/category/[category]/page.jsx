import { notFound } from "next/navigation";
import { createPageMetadata } from "@/platform/seo/generateMetadata";
import { CATEGORIES, getCategory } from "../../data/categories";
import { getFestivalsByCategory } from "../../lib/getFestivals";
import { resolveLiveDates } from "../../lib/resolveLiveFestivals";
import { fetchFestivalPhotos } from "../../lib/upstream";
import FestivalListPage from "../../components/shared/FestivalListPage";
import "../../../festival.css";

const PAGE_SIZE = 12;

export async function generateStaticParams() {
  return CATEGORIES.map((category) => ({ category: category.slug }));
}

// Does NOT gate this route — dynamicParams only applies to statically
// generated segments, and this one reads searchParams for pagination, which
// makes it dynamic. See the fuller note in religion/[religion]/page.jsx.
export const dynamicParams = false;

export async function generateMetadata({ params }) {
  const { category: slug } = await params;
  const category = getCategory(slug);
  // Unknown slug: renders the not-found body but cannot carry a 404 (the
  // response has already streamed past festival/loading.jsx's boundary), so
  // keep it out of the index instead. See religion/[religion]/page.jsx.
  if (!category) return { robots: { index: false, follow: false } };

  return createPageMetadata({
    title: `${category.name} Festivals — Dates, Traditions & Countdowns`,
    description: `Explore every ${category.name.toLowerCase()} festival worldwide with live dates and countdowns.`,
    path: `/lookouts/festival/category/${category.slug}`,
  });
}

export default async function CategoryFestivalsPage({ params, searchParams }) {
  const { category: slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();

  const sp = await searchParams;
  const page = Math.max(1, Number(sp?.page) || 1);

  const all = getFestivalsByCategory(category.slug);
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
        { label: "Categories", href: "/lookouts/festival#categories" },
        { label: category.name },
      ]}
      title={`${category.name} Festivals`}
      description={`${all.length} ${category.name.toLowerCase()} festival${all.length === 1 ? "" : "s"} in our dataset.`}
      festivals={pageItems}
      dates={dates}
      photos={photos}
      page={page}
      totalPages={totalPages}
    />
  );
}
