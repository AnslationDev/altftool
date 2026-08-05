import { notFound } from "next/navigation";
import { createPageMetadata } from "@/platform/seo/generateMetadata";
import { getAllCountryCodesUsed, getFestivalsByCountry } from "../../lib/getFestivals";
import { getCountryName } from "../../data/countryNames";
import { countryCodeToFlagEmoji } from "../../lib/flagEmoji";
import { resolveLiveDates } from "../../lib/resolveLiveFestivals";
import { fetchCountryInfo, fetchFestivalPhotos } from "../../lib/upstream";
import FestivalListPage from "../../components/shared/FestivalListPage";
import "../../../festival.css";

const PAGE_SIZE = 12;

export async function generateStaticParams() {
  return getAllCountryCodesUsed().map((code) => ({ code: code.toLowerCase() }));
}

export async function generateMetadata({ params }) {
  const { code } = await params;
  const name = getCountryName(code.toUpperCase());
  return createPageMetadata({
    title: `Festivals in ${name} — Dates, Traditions & Countdowns`,
    description: `Every festival celebrated in ${name}, with live dates, traditions, and countdowns.`,
    path: `/lookouts/festival/country/${code.toLowerCase()}`,
  });
}

function CountryInfoCard({ code, country }) {
  return (
    <div className="festival-country-info-card">
      <span className="country-flag">{countryCodeToFlagEmoji(code)}</span>
      <div>
        <h3>{country?.name?.common || getCountryName(code)}</h3>
        {country ? (
          <p>
            {country.region}
            {country.subregion ? ` · ${country.subregion}` : ""} · Capital: {country.capital?.[0] || "—"} ·{" "}
            {country.population ? `${country.population.toLocaleString()} people` : ""}
          </p>
        ) : (
          <p>Country facts are temporarily unavailable.</p>
        )}
      </div>
    </div>
  );
}

export default async function CountryFestivalsPage({ params, searchParams }) {
  const { code } = await params;
  const upperCode = code.toUpperCase();
  const all = getFestivalsByCountry(upperCode);
  if (!all.length) notFound();

  const sp = await searchParams;
  const page = Math.max(1, Number(sp?.page) || 1);
  const totalPages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
  const pageItems = all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const now = new Date();
  const [liveDates, countries] = await Promise.all([
    resolveLiveDates(pageItems, { now }),
    fetchCountryInfo([upperCode]),
  ]);
  const dates = Object.fromEntries(pageItems.map((f) => [f.slug, liveDates.get(f.slug)?.date]));

  const photoEntries = await Promise.all(
    pageItems.map(async (f) => [f.slug, (await fetchFestivalPhotos(f.unsplashQuery))?.[0] || null]),
  );
  const photos = Object.fromEntries(photoEntries);

  const countryName = countries?.[0]?.name?.common || getCountryName(upperCode);

  return (
    <FestivalListPage
      breadcrumbItems={[
        { label: "Festivals", href: "/lookouts/festival" },
        { label: "Countries", href: "/lookouts/festival#countries" },
        { label: countryName },
      ]}
      title={`Festivals in ${countryName}`}
      description={`${all.length} festival${all.length === 1 ? "" : "s"} celebrated in ${countryName}.`}
      infoCard={<CountryInfoCard code={upperCode} country={countries?.[0]} />}
      festivals={pageItems}
      dates={dates}
      photos={photos}
      page={page}
      totalPages={totalPages}
    />
  );
}
