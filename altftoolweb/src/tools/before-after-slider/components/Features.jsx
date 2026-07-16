const features = [
  {
    title: "Drag & Drop Images",
    desc: "Upload your before and after images with simple drag & drop. Supports PNG, JPG, WEBP, and more.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
    ),
  },
  {
    title: "Interactive Slider",
    desc: "Drag the slider handle or use the range input to slide between before and after views seamlessly.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
  },
  {
    title: "Instant Results",
    desc: "Everything runs in your browser. No uploads to servers, no waiting. Your images stay private.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
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
