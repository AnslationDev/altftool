import Link from "next/link";
import topicsData from "../../../../public/data/topics.json";

export default function TopicsPage() {
  return (
    <section>
      <h1 className="mb-8 text-2xl font-bold">Topics Directory</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-y-4 gap-x-8">
        {topicsData.topics.map((topic) => (
          <Link
            key={topic}
            href={`/news/topics/${topic.toLowerCase().replace(/\s+/g, "-")}`}
            className="text-sm text-[var(--primary)] hover:underline"
          >
            {topic}
          </Link>
        ))}
      </div>
    </section>
  );
}
