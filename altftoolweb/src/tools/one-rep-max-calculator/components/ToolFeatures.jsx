export default function ToolFeatures() {
  const items = [
    {
      title: "Multi-Formula 1RM Estimates",
      desc: "Calculate one-rep max with Brzycki, Lander, Lombardi, Mayhew, O'Conner, Wathan, and Adams to compare estimation styles.",
    },
    {
      title: "RPE + RIR Adjusted Output",
      desc: "Refine your result using effort-based inputs so your estimated max better reflects real training intensity.",
    },
    {
      title: "kg/lb Unit Conversion",
      desc: "Switch between kilograms and pounds seamlessly while keeping calculations and planning values consistent.",
    },
    {
      title: "Warm-Up + Training Zones",
      desc: "Get ready-to-use warm-up sets and % based training loads (70-95%) for practical session planning.",
    },
    {
      title: "Plate Loading Breakdown",
      desc: "See per-side plate suggestions for target percentages to load bars faster and reduce setup mistakes.",
    },
    {
      title: "Chart + Goal + Deload Planning",
      desc: "Use rep max charts, weekly goal estimation, and deload suggestions to build smarter progression cycles.",
    },
    {
      title: "History + Progress Tracking",
      desc: "Save sessions, pin important records, and track best lifts by exercise to monitor long-term strength growth.",
    },
    {
      title: "Export + Share Tools",
      desc: "Export CSV history, generate PNG summary cards, print reports, or share results instantly.",
    },
  ];

  return (
    <div className="py-12 bg-[var(--background)]">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-black tracking-widest uppercase text-[var(--foreground)]">
            Key Features
          </h2>
          <div className="w-16 h-1.5 bg-[var(--primary)] mx-auto mt-4 rounded-full"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div
              key={item.title}
              className="rounded-xl p-4 border bg-[var(--card)] border-[var(--border)]"
            >
              <h3 className="text-sm font-bold text-[var(--foreground)] mb-2">{item.title}</h3>
              <p className="text-xs leading-relaxed text-[var(--muted-foreground)]">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
