import { createPageMetadata } from "@/platform/seo/generateMetadata";
import { getAllFestivals, searchFestivals } from "../lib/getFestivals";
import { resolveLiveDates } from "../lib/resolveLiveFestivals";
import { fetchFestivalPhotos } from "../lib/upstream";
import FestivalListPage from "../components/shared/FestivalListPage";
import CalendarFilters from "../components/shared/CalendarFilters";
import "../../festival.css";

const PAGE_SIZE = 12;

export async function generateMetadata() {
  return createPageMetadata({
    title: "Festival Calendar — Search & Filter Every Festival",
    description: "Browse the full festival calendar. Filter by country, month, and category, with live-resolved dates and countdowns.",
    path: "/lookouts/festival/calendar",
  });
}

function applyFilters(festivals, { query, country, month, category }) {
  let result = query ? searchFestivals(query) : festivals;
  if (country) result = result.filter((f) => f.countryCodes.includes(country.toUpperCase()));
  if (month) result = result.filter((f) => f.month === Number(month));
  if (category) result = result.filter((f) => f.category === category);
  return result;
}

export default async function FestivalCalendarPage({ searchParams }) {
  const sp = await searchParams;
  const query = sp?.query || "";
  const country = sp?.country || "";
  const month = sp?.month || "";
  const category = sp?.category || "";
  const page = Math.max(1, Number(sp?.page) || 1);

  const filtered = applyFilters(getAllFestivals(), { query, country, month, category });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const now = new Date();
  const liveDates = await resolveLiveDates(pageItems, { now });
  const dates = Object.fromEntries(pageItems.map((f) => [f.slug, liveDates.get(f.slug)?.date]));

  const photoEntries = await Promise.all(
    pageItems.map(async (f) => [f.slug, (await fetchFestivalPhotos(f.unsplashQuery))?.[0] || null]),
  );
  const photos = Object.fromEntries(photoEntries);

  return (
    <FestivalListPage
      breadcrumbItems={[{ label: "Festivals", href: "/lookouts/festival" }, { label: "Calendar" }]}
      title="Festival Calendar"
      description={`${filtered.length} festival${filtered.length === 1 ? "" : "s"} match your filters.`}
      filters={<CalendarFilters initial={{ query, country, month, category }} />}
      festivals={pageItems}
      dates={dates}
      photos={photos}
      page={page}
      totalPages={totalPages}
    />
  );
}
