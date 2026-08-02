import { notFound } from "next/navigation";
import { getService, services } from "../../services-data";
import { ServiceDetailClient } from "./ServiceDetailClient";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { shouldDeferBulkPrerendering } from "@/lib/buildPrerenderPolicy";

export const dynamic = "force-static";

export function generateStaticParams() {
  if (shouldDeferBulkPrerendering()) return [];
  return services.map((service) => ({
    slug: service.slug,
  }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const service = getService(slug);

  if (!service) {
    return createPageMetadata({
      title: "Service Not Found | QuoteNest Pros",
      description:
        "This QuoteNest Pros home service does not exist. Browse the services directory to request a quote from a local pro.",
      path: `/homeserv/services/${slug}`,
      noindex: true,
    });
  }

  return createPageMetadata({
    title: `${service.title} Quotes | QuoteNest Pros`,
    description: service.subhead,
    path: `/homeserv/services/${slug}`,
  });
}

export default async function ServiceDetailPage({ params }) {
  const { slug } = await params;
  const service = getService(slug);

  if (!service) {
    notFound();
  }

  return (
    <>
      {/* BreadcrumbList only, deliberately.
          QuoteNest Pros is a demonstration front-end, not a live quote service:
          the ZIP flow tells the visitor "we don't yet have a live,
          location-matched partner network" and labels every listing an example
          placeholder, the call modal says the number "isn't connected to a live
          quote service", and the contact form saves locally and sends nothing.
          The provider names, 4.9 ratings, review counts and per-city price
          ranges in services-data.js are seed values, not records of work anyone
          performed. A Service/LocalBusiness node (provider, areaServed, offers,
          aggregateRating) would therefore publish a service that nobody
          delivers and prices nobody quoted, so the only honest entity these
          four pages support is their real navigational position. Wire a Service
          node in the day a real partner network and real quotes exist. */}
      <JsonLd
        id={`homeserv-service-schema-${slug}`}
        data={createBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "QuoteNest Pros", path: "/homeserv" },
          { name: service.title, path: `/homeserv/services/${slug}` },
        ])}
      />
      <ServiceDetailClient service={service} />
    </>
  );
}
