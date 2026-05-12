import Feeds from "../../components/sections/Feeds";
import topicsData from "../../../../../public/data/topics.json";

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

  return {
    title: `${label} News & Updates | AltFTool News`,
    description: `Read the latest ${label} stories, headlines, and updates on AltFTool News.`,
  };
}

export default async function TopicPage({ params }) {
  const { topic } = await params;
  const label = resolveTopicLabel(topic);

  return <Feeds topic={label} title={`${label} News`} />;
}
