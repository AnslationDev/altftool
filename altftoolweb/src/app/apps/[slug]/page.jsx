import { notFound } from "next/navigation";
import AppDetailClient from "../components/AppDetailClient";
import { apps, getAppBySlug, getRelatedApps } from "../data/apps";

export function generateStaticParams() {
  return apps.map((app) => ({ slug: app.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const app = getAppBySlug(slug);

  if (!app) {
    return {
      title: "App Not Found",
    };
  }

  return {
    title: `${app.name} APK Download`,
    description: app.shortDescription,
    alternates: {
      canonical: `/apps/${app.slug}`,
    },
    openGraph: {
      title: `${app.name} APK Download`,
      description: app.shortDescription,
      url: `/apps/${app.slug}`,
      images: [
        {
          url: app.iconUrl,
          width: 256,
          height: 256,
          alt: `${app.name} icon`,
        },
      ],
    },
  };
}

export default async function AppDetailPage({ params }) {
  const { slug } = await params;
  const app = getAppBySlug(slug);

  if (!app) {
    notFound();
  }

  return <AppDetailClient app={app} relatedApps={getRelatedApps(slug)} />;
}
