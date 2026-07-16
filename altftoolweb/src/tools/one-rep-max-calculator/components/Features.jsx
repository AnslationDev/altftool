export default function Features() {
  const items = [
    {
      title: "Multiple Formulas",
      desc: "Switch between Brzycki, Lander, Lombardi, Mayhew, O'Conner, Wathan, and Adams.",
    },
    {
      title: "Fast Strength Estimate",
      desc: "Get your estimated one-rep max instantly from your working weight and reps.",
    },
    {
      title: "Training Zones",
      desc: "Use 70%-95% zones to plan accessory, volume, and heavy training days.",
    },
  ];

  return (
    <div className="py-12 bg-[var(--background)]">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-black tracking-widest uppercase text-[var(--foreground)]">
            How It Helps
          </h2>
          <div className="w-16 h-1.5 bg-[var(--primary)] mx-auto mt-4 rounded-full"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl p-6 border bg-[var(--card)] border-[var(--border)]"
            >
              <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">{item.title}</h3>
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
