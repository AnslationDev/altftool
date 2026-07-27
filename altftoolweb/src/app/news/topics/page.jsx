import Link from "next/link";
import { ArrowRight } from "lucide-react";
import topicsData from "../../../../public/data/topics.json";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";

export async function generateMetadata() {
  return createPageMetadata({
  title: "News Topics Directory | AltFTool News",
  description: "Browse all AltFTool News topics, from technology and business to science, health, sports, and world updates.",
  path: "/news/topics",
  keywords: ["news topics", "topic directory", "technology news topics"],
  // Directory of /news/topics/[topic] pages, which are already noindex —
  // the whole news section stays out of the index (follow stays on).
  noindex: true,
});
}

function slugify(value = "") {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function TopicsPage() {
  const topicItems = topicsData.topics.map((topic) => ({
    name: topic,
    path: `/news/topics/${slugify(topic)}`,
  }));

  return (
    <section>
      <JsonLd
        id="news-topics-schema"
        data={[
          createCollectionPageJsonLd({
            path: "/news/topics",
            name: "News Topics Directory",
            description: "Browse all AltFTool News topics and focused news feeds.",
          }),
          createItemListJsonLd({
            path: "/news/topics",
            name: "AltFTool News topics",
            items: topicItems,
          }),
        ]}
      />
      <nav aria-label="Breadcrumb" className="text-[13px]">
        <ol className="flex flex-wrap items-center gap-2 text-(--muted-foreground)">
          <li>
            <Link href="/news" className="hover:text-(--primary-text) hover:underline">
              News
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="font-medium text-(--foreground)">
            Topics
          </li>
        </ol>
      </nav>

      <header className="mt-4 max-w-2xl">
        <p className="text-[11px] font-bold uppercase tracking-wide text-(--muted-foreground)">
          News archive
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-(--foreground) sm:text-4xl">
          Topics Directory
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-(--muted-foreground)">
          Browse every AltFTool News topic, from technology and business to science, health,
          sports, and world updates.
        </p>
      </header>

      <div className="mt-8 grid gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {topicItems.map((topic) => (
          <Link
            key={topic.name}
            href={topic.path}
            className="group flex min-h-11 items-center justify-between gap-3 border-b border-(--border) py-2 text-sm font-medium text-(--foreground) transition hover:border-(--primary) hover:text-(--primary-text)"
          >
            <span className="line-clamp-2">{topic.name}</span>
            <ArrowRight
              aria-hidden="true"
              className="h-4 w-4 shrink-0 text-(--muted-foreground) transition group-hover:translate-x-0.5 group-hover:text-(--primary-text)"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
