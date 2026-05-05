export default function Privacy() {
  const policies = [
    {
      title: "No Data Upload",
      description:
        "Your CSV files are never uploaded to any server. All processing happens locally in your browser.",
    },
    {
      title: "No Tracking",
      description:
        "We do not track users, store files, or collect personal information.",
    },
    {
      title: "Offline Friendly",
      description:
        "Once loaded, the app works even without an internet connection.",
    },
  ];

  return (
    <section className="max-w-5xl mx-auto px-6 py-16">
      <div className="text-center mb-14">
        <h1 className="text-center text-5xl mb-12 mt-[-120]">
          Privacy Policy
        </h1>
        <p className="description mt-4 max-w-2xl mx-auto">
          Your data stays on your device. We believe privacy should be the default — not a feature.
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {policies.map((policy, i) => (
          <div
            key={i}
            className="
              group
              bg-(--card)
              text-(--card-foreground)
              border border-(--border)
              rounded-2xl
              p-8
              shadow-md
              hover:shadow-xl
              transition-all duration-300
              hover:-translate-y-1
            "
          >
            <h2 className="text-xl font-semibold mb-4 text-(--foreground) group-hover:text-(--primary) transition-colors">
              {policy.title}
            </h2>

            <p className="description">
              {policy.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
