const features = [
  { title: "Remove Duplicates", description: "Automatically remove duplicate leads based on email." },
  { title: "Normalize Columns", description: "Fixes column inconsistencies for CRM-ready CSV." },
  { title: "Offline Processing", description: "All processing is done locally in your browser." },
];

export default function Cards() {
  return (
    <section className="mt-20">
      <div className="max-w-6xl mx-auto px-6">

        {/* Section Header */}
        <div className="text-center mb-12 mt-[-120]">
          <h2 className=" md:text-5xl text-(--foreground)">Powerful CSV Features</h2>
          <p className="description mt-3 mb-10 max-w-4xl mx-auto">
            Clean, optimize, and prepare your CSV files instantly — right in your browser.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div
              key={i}
              className="
                group relative
                bg-(--card)
                text-(--card-foreground)
                border border-(--border)
                p-8 rounded-2xl
                shadow-md hover:shadow-xl
                transition-all duration-300
                hover:-translate-y-2
              "
            >
              {/* Subtle Hover Glow */}
              <div className="
                absolute inset-0 rounded-2xl
                opacity-0 group-hover:opacity-100
                bg-gradient-to-br from-(--primary)/5 to-transparent
                transition duration-300
              " />

              <div className="relative">
                <h3 className="text-xl font-semibold mb-3 text-(--primary)">
                  {f.title}
                </h3>

                <p className="description leading-relaxed">
                  {f.description}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
