import { notFound } from "next/navigation";
import AppDetailClient from "../components/AppDetailClient";
import { apps, getAppBySlug, getRelatedApps } from "../data/apps";
import JsonLd from "@/platform/seo/JsonLd";
import {
  absoluteUrl,
  createBreadcrumbJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { shouldDeferBulkPrerendering } from "@/lib/buildPrerenderPolicy";
import { getRelatedContentForPreset, RelatedContentSection } from "@/platform/linking";

export const dynamic = "force-static";

export function generateStaticParams() {
  if (shouldDeferBulkPrerendering()) return [];
  return apps.map((app) => ({ slug: app.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const app = getAppBySlug(slug);

  if (!app) {
    return createPageMetadata({
      title: "App Not Found",
      description:
        "This APK download page does not exist. Browse the AltFTool apps directory to find the Android app you were looking for.",
      path: `/apps/${slug}`,
      noindex: true,
    });
  }

  return createPageMetadata({
    title: `${app.name} APK Download | AltFTool Apps`,
    description: app.shortDescription,
    path: `/apps/${app.slug}`,
    image: app.iconUrl,
    keywords: [
      app.name,
      `${app.name} APK`,
      `${app.name} Android app`,
      app.category,
      "AltFTool apps",
    ],
  });
}

function createAppJsonLd(app) {
  if (!app?.slug) return null;

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${absoluteUrl(`/apps/${app.slug}`)}#software`,
    name: app.name,
    description: app.description || app.shortDescription,
    url: absoluteUrl(`/apps/${app.slug}`),
    image: absoluteUrl(app.iconUrl),
    applicationCategory: app.category || "MobileApplication",
    applicationSubCategory: app.category,
    operatingSystem: app.androidRequired || "Android",
    softwareVersion: app.version,
    fileSize: app.apkSize,
    downloadUrl: absoluteUrl(app.apkUrl),
    author: {
      "@type": "Organization",
      name: app.developer || "AltFTool Team",
    },
    publisher: {
      "@type": "Organization",
      name: "AltFTool",
      url: absoluteUrl("/"),
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}

export default async function AppDetailPage({ params }) {
  const { slug } = await params;
  const app = getAppBySlug(slug);

  if (!app) {
    notFound();
  }

  const moreFromAltftool = getRelatedContentForPreset(
    {
      href: `/apps/${app.slug}`,
      title: app.name,
      description: app.shortDescription,
      tags: [app.category],
      section: "apps",
    },
    "utility",
  );

  return (
    <>
      <JsonLd
        id={`${app.slug}-app-schema`}
        data={[
          createAppJsonLd(app),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Apps", path: "/apps" },
            { name: app.name, path: `/apps/${app.slug}` },
          ]),
        ]}
      />
      <AppDetailClient app={app} relatedApps={getRelatedApps(slug)} />
      <RelatedContentSection
        title="More from AltFTool"
        items={moreFromAltftool}
        path={`/apps/${app.slug}`}
        jsonLdName={`More from AltFTool for ${app.name}`}
      />
    </>
  );
}
