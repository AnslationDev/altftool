function AncestorPromoFeatureCard({ feature }) {
  return (
    <div className="bg-[#f8f8f6] rounded-2xl p-8 flex flex-col items-center text-center hover:shadow-md transition-shadow dark:bg-(--muted)">
      <div className="mb-5">{feature.icon}</div>
      <p className="text-gray-800 dark:text-(--foreground) font-medium leading-relaxed mb-2">
        {feature.title}
      </p>
      <p className="text-[#005831] text-sm font-semibold hover:underline cursor-pointer">
        {feature.sub}
      </p>
    </div>
  );
}

export function AncestorPromoSection() {
  const features = [
    {
      icon: (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="12" fill="#e8f0e8" />
          <rect x="10" y="14" width="20" height="4" rx="1" fill="#005831" opacity="0.3" />
          <rect x="10" y="20" width="28" height="2" rx="1" fill="#005831" opacity="0.2" />
          <rect x="10" y="24" width="24" height="2" rx="1" fill="#005831" opacity="0.2" />
          <rect x="10" y="28" width="26" height="2" rx="1" fill="#005831" opacity="0.2" />
          <circle cx="34" cy="32" r="7" fill="white" stroke="#005831" strokeWidth="1.5" />
          <path d="M31.5 32h5M34 29.5v5" stroke="#005831" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
      title: "Explore billions of records on altfestory.",
      sub: "Start making discoveries.",
    },
    {
      icon: (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="12" fill="#e8f0e8" />
          <circle cx="24" cy="20" r="7" fill="none" stroke="#005831" strokeWidth="1.5" opacity="0.6" />
          <path d="M16 38c0-5 3.6-9 8-9s8 4 8 9" stroke="#005831" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
          <circle cx="34" cy="16" r="4" fill="none" stroke="#005831" strokeWidth="1.2" opacity="0.4" />
          <circle cx="14" cy="16" r="4" fill="none" stroke="#005831" strokeWidth="1.2" opacity="0.4" />
          <path d="M20 12l-4-4M28 12l4-4" stroke="#005831" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
        </svg>
      ),
      title: "Make family history discoveries with altfestory Hints.",
      sub: "Start building your tree.",
    },
    {
      icon: (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="12" fill="#e8f0e8" />
          <path d="M24 12c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12z" fill="none" stroke="#005831" strokeWidth="1.5" opacity="0.5" />
          <path d="M24 16v8l5 3" stroke="#005831" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
          <circle cx="24" cy="24" r="2" fill="#005831" opacity="0.8" />
          <path d="M12 24H8M40 24h-4M24 12V8M24 40v-4" stroke="#005831" strokeWidth="1" strokeLinecap="round" opacity="0.3" />
        </svg>
      ),
      title: "Connect with altfestory matches to recover missing family stories.",
      sub: "Order altfestoryDNA.",
    },
  ];

  return (
    <section className="py-16 bg-white border-t border-gray-100 dark:bg-(--background) dark:border-(--border)">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-(--foreground) text-center mb-3"
          style={{ fontFamily: "Georgia, serif" }}>
          Discover the people behind the names in your family using altfestory.
        </h2>
        <p className="text-center text-gray-500 dark:text-(--muted-foreground) mb-12 max-w-xl mx-auto">
          With the world&apos;s largest collection of online family history records, altfestory helps find the details of your family story.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map(f => (
            <AncestorPromoFeatureCard key={f.title} feature={f} />
          ))}
        </div>
      </div>
    </section>
  );
}
