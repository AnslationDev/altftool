export default function Features() {
  const items = [
    { title: "No Self Matches", description: "Guarantees participants are never assigned to themselves." },
    { title: "Custom Exclusions", description: "Block specific giver-receiver pairs to avoid awkward assignments." },
    { title: "Retry-Safe Generator", description: "Automatically retries randomization when constraints conflict." },
    { title: "Private Reveal Mode", description: "Reveal one participant assignment at a time." },
    { title: "Copy and Export", description: "Copy all pairings or export as JSON for easy sharing." },
    { title: "Participant Health Checks", description: "Warns when constraints make valid pairing impossible." },
  ];

  return (
    <section className="mt-8 mb-2">
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-(--foreground)">Features</h2>
        <p className="text-(--muted-foreground) mt-2">Built for family, friends, teams, and office holiday events.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item.title} className="rounded-xl border border-(--border) bg-(--card) p-4 shadow-sm">
            <p className="text-sm font-semibold text-(--foreground)">{item.title}</p>
            <p className="text-xs text-(--muted-foreground) mt-1 leading-relaxed">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
