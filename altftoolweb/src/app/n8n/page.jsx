import Hero from "./components/Hero";
import WorkflowExplorer from "./components/WorkflowExplorer";
import StatsStrip from "./components/StatsStrip";
import CategoryBrowse from "./components/CategoryBrowse";
import HowToUse from "./components/HowToUse";
import { getTrendingCards, getCategories, getStats } from "./data/service";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createPageMetadata,
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
} from "@/platform/seo/generateMetadata";

const DESCRIPTION =
  "Browse a curated library of production-ready n8n workflows. Copy JSON, understand n8n nodes, and master low-code automation with AltFTool.";

export async function generateMetadata() {
  return createPageMetadata({
    title: "n8n Workflows – Production-Ready Automation Templates",
    description: DESCRIPTION,
    path: "/n8n",
  });
}

export default function Page() {
  const workflows = getTrendingCards(200);
  const categories = getCategories();
  const stats = getStats();

  return (
    <>
      <JsonLd
        id="n8n-schema"
        data={[
          createCollectionPageJsonLd({
            path: "/n8n",
            name: "n8n Workflows Library",
            description: DESCRIPTION,
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "n8n Workflows", path: "/n8n" },
          ]),
        ]}
      />
      <main className="min-h-screen bg-(--color-background)">
        <Hero />
        <div className="mx-auto max-w-7xl px-4 pb-20">
          <WorkflowExplorer workflows={workflows} categories={categories} />

          <StatsStrip stats={stats} />
          <CategoryBrowse categories={categories} />
          <HowToUse />
        </div>
      </main>
    </>
  );
}
