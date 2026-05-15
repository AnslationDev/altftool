import Link from "next/link";
import topicsData from "../../../../public/data/topics.json";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";

export const metadata = createPageMetadata({
  title: "News Topics Directory | AltFTool News",
  description: "Browse all AltFTool News topics, from technology and business to science, health, sports, and world updates.",
  path: "/news/topics",
  keywords: ["news topics", "topic directory", "technology news topics"],
});

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
      <h1 className="mb-8 text-2xl font-bold">Topics Directory</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-y-4 gap-x-8">
        {topicsData.topics.map((topic) => (
          <Link
            key={topic}
            href={`/news/topics/${slugify(topic)}`}
            className="text-sm text-[var(--primary)] hover:underline"
          >
            {topic}
          </Link>
        ))}
      </div>
    </section>
  );
}
