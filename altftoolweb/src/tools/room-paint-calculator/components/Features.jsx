export default function Features() {
  const items = [
    {
      title: "Multi-Room Estimation",
      description: "Plan the full project in one place by adding multiple rooms with independent dimensions.",
    },
    {
      title: "Opening Deductions",
      description: "Subtract doors and windows from wall area to avoid over-ordering paint.",
    },
    {
      title: "Paint Type Presets",
      description: "Pick emulsion, enamel, distemper, or texture with editable coverage and rate.",
    },
    {
      title: "Flexible Coat Controls",
      description: "Set different wall, ceiling, and primer coats for a realistic paint quantity estimate.",
    },
    {
      title: "Wastage Adjustment",
      description: "Add a custom wastage percentage for roller loss, touch-ups, and site variation.",
    },
    {
      title: "Labor Rate Input",
      description: "Enter labor rate per sqft and automatically calculate labor amount from paintable area.",
    },
    {
      title: "Total Amount Calculation",
      description: "Get final estimate using paint materials + labor + contingency in one consolidated amount.",
    },
    {
      title: "Can Size Purchase Plan",
      description: "Receive optimized can distribution (20L, 10L, 4L, 1L) for easier procurement.",
    },
    {
      title: "Room-Wise Summary Table",
      description: "View net wall area, ceiling area, and total area for every room separately.",
    },
    {
      title: "Color Combination Suggestions",
      description: "Explore curated wall, trim, accent, and ceiling palette ideas with finish recommendations.",
    },
    {
      title: "Cost Breakdown Insights",
      description: "Review paint cost, labor cost, contingency, and total for better budget decisions.",
    },
    {
      title: "Contractor-Friendly Workflow",
      description: "Built for homeowners and professionals to quickly prepare quoting-ready estimates.",
    },
  ];

  return (
    <section className="mt-8 mb-2">
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-(--foreground)">Features</h2>
        <p className="text-(--muted-foreground) mt-2">Advanced estimation, budgeting, and color-planning tools for complete paint projects.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <div key={item.title} className="rounded-xl rpc-main-card p-4">
            <p className="text-sm font-semibold text-(--foreground)">{item.title}</p>
            <p className="text-xs text-(--muted-foreground) mt-1 leading-relaxed">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
