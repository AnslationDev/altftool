import { Paintbrush, SlidersHorizontal, Download, Layers, Sparkles, Eye } from "lucide-react";

const features = [
  {
    title: "Multiple Art Styles",
    description: "Choose from 11 unique cartoon styles including Classic, Anime, Comic Book, Sketch, and more.",
    icon: Paintbrush,
  },
  {
    title: "Real-time Preview",
    description: "See your cartoon transformation instantly as you adjust styles and settings.",
    icon: Eye,
  },
  {
    title: "Fine-tuned Controls",
    description: "Adjust brightness, contrast, saturation, sharpness, and smoothness.",
    icon: SlidersHorizontal,
  },
  {
    title: "Before/After Comparison",
    description: "Compare your original photo with the cartoon version using the interactive slider.",
    icon: Layers,
  },
  {
    title: "Multiple Export Formats",
    description: "Download your cartoon in PNG, JPEG, or WEBP format with adjustable quality.",
    icon: Download,
  },
  {
    title: "AI-Powered Effects",
    description: "Advanced filter algorithms create realistic cartoon effects from your photos.",
    icon: Sparkles,
  },
];

export default function Features() {
  return (
    <section className="py-8 sm:py-10 px-4 bg-(--background)">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-(--foreground) mb-4">
            Why Choose Our Cartoon Tool?
          </h2>
          <p className="text-base sm:text-lg text-(--muted-foreground) max-w-2xl mx-auto leading-relaxed">
            Professional cartoon transformation with advanced customization
          </p>
        </div>

        <div className="tool-feature-grid">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-(--card) rounded-2xl shadow-md border border-(--border) p-6 sm:p-8 flex flex-col hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-(--muted) flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-(--primary)" />
              </div>
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
