export default function Features() {
  const features = [
    {
      title: "Live Beautification",
      description:
        "Paste messy CSS and instantly convert it into clean, readable, properly indented code.",
    },
    {
      title: "Syntax Validation",
      description:
        "Catch common CSS formatting issues while you work so the final stylesheet stays easier to review.",
    },
    {
      title: "Production Minify",
      description:
        "Switch to minify mode when you need compact CSS for faster production delivery.",
    },
    {
      title: "Split Comparison",
      description:
        "Compare the original input and formatted output side by side before copying or downloading.",
    },
    {
      title: "Local Autosave",
      description:
        "Your recent CSS and formatter settings are saved locally in your browser for quick recovery.",
    },
    {
      title: "Copy and Download",
      description:
        "Copy the formatted stylesheet or download it as a CSS file with one click.",
    },
  ];

  return (
    <section className="py-8 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-(--foreground) mb-4">
            Why Choose Our CSS Beautification and Formatting Tool?
          </h2>
          <p className="text-base sm:text-lg text-(--muted-foreground) max-w-2xl mx-auto leading-relaxed">
            Simple, fast, and accurate CSS formatting for cleaner stylesheets
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="
                rounded-3xl
                cf-glass
                p-6 sm:p-8
                flex flex-col
                hover:shadow-xl
                hover:-translate-y-2
                transition-all duration-300
              "
            >
              <h3 className="text-lg sm:text-xl font-bold text-(--foreground) mb-3">
                {feature.title}
              </h3>

              <p className="text-sm sm:text-base text-(--muted-foreground) leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
