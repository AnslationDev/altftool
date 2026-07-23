import { notFound } from "next/navigation";
import { getService, services } from "../../services-data";
import { ServiceDetailClient } from "./ServiceDetailClient";
import { createPageMetadata } from "@/platform/seo/generateMetadata";
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
      path: `/homeserv/services/${slug}`,
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

  return <ServiceDetailClient service={service} />;
}
