import { cache } from "react";
import { notFound } from "next/navigation";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createPageMetadata,
  createBreadcrumbJsonLd,
  createFaqJsonLd,
} from "@/platform/seo/generateMetadata";
import { fetchFirebaseLanderBySlug, fetchAllPublishedLanderSlugs } from "../data/firebaseLanders";
import LanderSections from "../components/LanderSections";
import { shouldDeferBulkPrerendering } from "@/lib/buildPrerenderPolicy";

export const dynamic = "force-static";
export const revalidate = 3600;

const getLander = cache((slug) => fetchFirebaseLanderBySlug(slug));

// Collect FAQ Q&A across every FAQ section for structured data.
function collectFaq(sections = []) {
  const out = [];
  for (const s of sections) {
    if (s?.type === "faq" && !s.hidden) {
      for (const it of s.props?.items || []) {
        if (it?.question && it?.answer) out.push({ question: it.question, answer: it.answer });
      }
    }
  }
  return out;
}

export async function generateStaticParams() {
  if (shouldDeferBulkPrerendering()) return [];
  try {
    const items = await fetchAllPublishedLanderSlugs();
    return items.map((it) => ({ slug: it.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const lander = await getLander(slug);
  if (!lander) return { title: "Landing page not found" };

  const seo = lander.seo || {};
  const path = `/lander/${lander.slug}`;
  return createPageMetadata({
    title: seo.metaTitle || lander.title,
    description: seo.metaDescription || "",
    path,
    canonical: seo.canonical || path,
    image: seo.ogImage || undefined,
    keywords: Array.isArray(seo.keywords) ? seo.keywords : [],
    noindex: !!seo.noIndex,
    follow: !seo.noFollow,
  });
}

export default async function LanderPage({ params }) {
  const { slug } = await params;
  const lander = await getLander(slug);
  if (!lander) notFound();

  const path = `/lander/${lander.slug}`;
  const schema = lander.schema || {};
  const jsonLd = [];

  if (schema.breadcrumbs !== false) {
    jsonLd.push(createBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: lander.title || "Landing", path },
    ]));
  }
  if (schema.faq !== false) {
    const faq = collectFaq(lander.sections);
    if (faq.length) jsonLd.push(createFaqJsonLd({ path, questions: faq }));
  }

  return (
    <main className="min-h-screen bg-(--background)">
      <JsonLd data={jsonLd.filter(Boolean)} id="lander-jsonld" />
      <LanderSections sections={lander.sections} theme={lander.theme || {}} />
    </main>
  );
}
