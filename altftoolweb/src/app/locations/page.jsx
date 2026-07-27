import Link from "next/link";
import { ArrowUpRight, Globe2 } from "lucide-react";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createPageMetadata,
  siteConfig,
} from "@/platform/seo/generateMetadata";
import { getAllGeoLocations } from "@/platform/seo/geoLocations";
import { DIFFERENTIATED_GEOS } from "@/platform/seo/geoEntities";
import { buildIndiaHubModel } from "./_components/IndiaHub";
import { CARD, CTA_CLASS, CTA_STYLE, T } from "./_components/tokens";

/**
 * /locations — the hub for the geo route family.
 *
 * It answers one real question: does where you are change what AltFTool does?
 * For a browser-based tool the honest answer is "almost never" — so this page
 * says so, points at the one market that IS different (India), and then acts
 * as the internal-link index for the rest. The child pages stay reachable and
 * followable; only the differentiated ones are indexable (DIFFERENTIATED_GEOS
 * in src/platform/seo/geoEntities.js).
 */

export const dynamic = "force-static";
export const revalidate = 86400;

export async function generateMetadata() {
  const { toolCount } = buildIndiaHubModel();
  return createPageMetadata({
    title: `${siteConfig.name} by Location — Where the Tools Change, and Where They Don't`,
    description: `${siteConfig.name}'s tools run in your browser, so they behave identically in every country. India is the exception: ${toolCount} tools follow Indian tax, currency and document rules. Browse every location shortcut here.`,
    path: "/locations",
  });
}

function LocationGroup({ title, blurb, locations }) {
  if (!locations.length) return null;
  return (
    <section className="rounded-[24px] p-5 sm:p-7" style={CARD} aria-label={title}>
      <h2 className="text-lg font-extrabold tracking-tight" style={{ color: T.ink }}>
        {title}
      </h2>
      {blurb && (
        <p className="mt-2 max-w-3xl text-sm font-medium leading-relaxed" style={{ color: T.ink }}>
          {blurb}
        </p>
      )}
      <ul className="mt-4 flex flex-wrap gap-2">
        {locations.map((location) => (
          <li key={location.slug}>
            <Link
              href={`/locations/${location.slug}`}
              className="inline-flex items-center rounded-full px-3.5 py-1.5 text-sm font-bold transition-all duration-150 hover:-translate-y-0.5 hover:text-(--sc-indigo)"
              style={{ backgroundColor: T.tile, color: T.ink }}
            >
              {location.name}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function LocationsPage() {
  const all = getAllGeoLocations();
  const countries = all.filter((entry) => entry.type === "Country");
  const states = all.filter((entry) => entry.type === "State");
  const cities = all.filter((entry) => entry.type === "City");
  const { toolCount, groups } = buildIndiaHubModel();
  const localised = DIFFERENTIATED_GEOS.map((slug) =>
    all.find((entry) => entry.slug === slug),
  ).filter(Boolean);

  return (
    <div
      className="mx-auto w-full max-w-6xl space-y-5 px-4 pb-14 pt-6 sm:px-6 lg:px-8"
      style={{ color: T.ink }}
    >
      <JsonLd
        id="locations-hub"
        data={[
          createCollectionPageJsonLd({
            path: "/locations",
            name: `${siteConfig.name} by location`,
            description: `Where ${siteConfig.name}'s free online tools change by country, and where they do not.`,
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Locations", path: "/locations" },
          ]),
        ]}
      />

      <section className="rounded-[24px] p-5 sm:p-7" style={CARD}>
        <p
          className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.16em]"
          style={{ color: T.indigo }}
        >
          <Globe2 size={13} aria-hidden="true" />
          Available worldwide
        </p>
        <h1
          className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl"
          style={{ color: T.ink }}
        >
          {siteConfig.name} by location — where the tools change, and where they don&apos;t
        </h1>
        <p className="mt-4 max-w-3xl text-sm font-medium leading-relaxed" style={{ color: T.ink }}>
          Every {siteConfig.name} tool runs inside your own browser, so in almost every country it
          behaves identically: the same features, the same privacy, and free everywhere with no
          account. The exception is India, where {toolCount} tools follow rules that only exist
          there — GST, the Indian income tax regimes, EMI lending conventions, government savings
          schemes, and PAN, Aadhaar, GSTIN and IFSC formats. Everything below the India section is a
          directory shortcut, not a different toolset.
        </p>
      </section>

      <section className="rounded-[24px] p-5 sm:p-7" style={CARD}>
        <h2 className="text-lg font-extrabold tracking-tight" style={{ color: T.ink }}>
          Which locations have location-specific tools?
        </h2>
        <p className="mt-2 max-w-3xl text-sm font-medium leading-relaxed" style={{ color: T.ink }}>
          One, today: India, where {toolCount} tools are grouped into {groups.length} kinds of work.
          If a country is not listed here it means we have not built tooling that behaves
          differently there, and saying otherwise would be dressing the same tools in a new name.
        </p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {localised.map((entry) => (
            <li key={entry.slug}>
              <Link
                href={`/locations/${entry.slug}`}
                className={CTA_CLASS}
                style={CTA_STYLE}
              >
                {siteConfig.name} {entry.name} — {toolCount} localised tools
                <ArrowUpRight size={14} aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
        <ul className="mt-3 flex flex-wrap gap-2">
          {groups.map((group) => (
            <li key={group.id}>
              <Link
                href={`/locations/india#india-${group.id}`}
                className="inline-flex items-center rounded-full px-3.5 py-1.5 text-sm font-bold transition-all duration-150 hover:-translate-y-0.5 hover:text-(--sc-indigo)"
                style={{ backgroundColor: T.tile, color: T.ink }}
              >
                {group.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <LocationGroup
        title="Countries"
        blurb="Shortcuts into the directory. The tools behave the same in each of them."
        locations={countries}
      />
      <LocationGroup
        title="States in India"
        blurb="State-level differences are handled inside the tools themselves — the stamp duty estimator, professional tax calculator and land area converter all ask which state you are in."
        locations={states}
      />
      <LocationGroup title="Cities" locations={cities} />
    </div>
  );
}
