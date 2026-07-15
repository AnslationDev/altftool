export default function Description() {
  return (
    <section className="mt-12 max-w-3xl mx-auto">
      <div className="rounded-2xl border border-(--border) bg-(--surface) p-6 shadow-md">
        <h2 className="text-lg font-semibold mb-3">About the Random Business Idea Generator</h2>
        <div className="space-y-3 text-sm text-(--muted-foreground) leading-relaxed">
          <p>
            Whether you're an aspiring entrepreneur, a student working on a project, or just
            curious about what kind of business you could start — this tool generates unique,
            structured business ideas on demand.
          </p>
          <p>
            Each idea is built by combining elements from five key dimensions:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong className="text-(--foreground)">Industry</strong> — 28 sectors from healthcare to gaming</li>
            <li><strong className="text-(--foreground)">Problem</strong> — Real-world pain points and inefficiencies</li>
            <li><strong className="text-(--foreground)">Technology</strong> — 25+ emerging and established technologies</li>
            <li><strong className="text-(--foreground)">Business Model</strong> — 20+ proven monetization strategies</li>
            <li><strong className="text-(--foreground)">Target Audience</strong> — 25+ specific user segments</li>
          </ul>
          <p>
            The result is over 10 million possible combinations — each with a company name,
            tagline, description, feasibility score, startup costs, monetization strategy,
            market rationale, and key challenges. Filter by industry, generate multiple at once,
            save your favourites, and copy the details to share with your co-founder.
          </p>
        </div>
      </div>
    </section>
  );
}
