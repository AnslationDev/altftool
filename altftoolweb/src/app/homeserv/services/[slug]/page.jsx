import { notFound } from "next/navigation";
import { getService, services } from "../../services-data";
import { ServiceDetailClient } from "./ServiceDetailClient";

export function generateStaticParams() {
  return services.map((service) => ({
    slug: service.slug,
  }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const service = getService(slug);

  if (!service) {
    return {
      title: "Service Not Found | QuoteNest Pros",
    };
  }

  return {
    title: `${service.title} Quotes | QuoteNest Pros`,
    description: service.subhead,
  };
}

export default async function ServiceDetailPage({ params }) {
  const { slug } = await params;
  const service = getService(slug);

  if (!service) {
    notFound();
  }

  return <ServiceDetailClient service={service} />;
}
