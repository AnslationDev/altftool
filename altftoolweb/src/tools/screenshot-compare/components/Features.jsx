const features = [
  {
    title: "Multiple View Modes",
    desc: "Switch between slider, side-by-side, and diff overlay views to analyze changes however you prefer.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    title: "Pixel-Level Diff",
    desc: "Detect even the smallest visual differences with automatic pixel comparison and highlight overlays.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "100% Private",
    desc: "All image processing happens in your browser. Nothing is uploaded to any server.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
];

export default function Features({ heading = "Features" }) {
  return (
    <section className="py-12">
      <h2 className="text-2xl font-bold text-(--foreground) text-center mb-8">{heading}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature, i) => (
          <div key={i} className="rounded-xl border border-(--border) bg-(--card) p-6 text-center hover:shadow-md transition-shadow">
            <div className="mx-auto w-12 h-12 rounded-full bg-(--primary)/10 flex items-center justify-center text-(--primary) mb-4">
              {feature.icon}
            </div>
            <h3 className="font-semibold text-(--foreground) mb-2">{feature.title}</h3>
            <p className="text-sm text-(--muted-foreground)">{feature.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
