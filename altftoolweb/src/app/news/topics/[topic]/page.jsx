import Feeds from "../../components/sections/Feeds";
import topicsData from "../../../../../public/data/topics.json";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";

function slugify(value = "") {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function labelFromSlug(value = "") {
  return String(value)
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function resolveTopicLabel(topic = "") {
  const decoded = decodeURIComponent(topic);
  const topicSlug = slugify(decoded);
  return (
    topicsData.topics.find((item) => slugify(item) === topicSlug) ||
    labelFromSlug(topicSlug)
  );
}

export async function generateMetadata({ params }) {
  const { topic } = await params;
  const label = resolveTopicLabel(topic);
  const topicSlug = slugify(label);

  return createPageMetadata({
    title: `${label} News & Updates | AltFTool News`,
    description: `Read the latest ${label} stories, headlines, and updates on AltFTool News.`,
    path: `/news/topics/${topicSlug}`,
    keywords: [`${label} news`, `${label} updates`, "AltFTool News"],
  });
}

export default async function TopicPage({ params }) {
  const { topic } = await params;
  const label = resolveTopicLabel(topic);
  const topicSlug = slugify(label);

  return (
    <>
      <JsonLd
        id={`news-topic-schema-${topicSlug}`}
        data={[
          createCollectionPageJsonLd({
            path: `/news/topics/${topicSlug}`,
            name: `${label} News`,
            description: `Latest ${label} stories, headlines, and updates on AltFTool News.`,
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "News", path: "/news" },
            { name: `${label} News`, path: `/news/topics/${topicSlug}` },
          ]),
        ]}
      />
      <Feeds topic={label} title={`${label} News`} />
    </>
  );
}
