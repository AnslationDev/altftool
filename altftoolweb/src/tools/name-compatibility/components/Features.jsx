import { Heart, Calculator, Sparkles, Shield, Users } from "lucide-react";

const features = [
  {
    title: "Numerology Engine",
    description: "Powered by ancient numerology principles that analyze the vibrational energy of each letter in the names.",
    icon: Calculator,
  },
  {
    title: "Multi-Dimensional Analysis",
    description: "Get love, friendship, soulmate, and business compatibility scores — not just a single number.",
    icon: Heart,
  },
  {
    title: "Name Energy Profiles",
    description: "Discover the name number, soul urge, personality, and destiny numbers for both names.",
    icon: Sparkles,
  },
  {
    title: "Detailed Insights",
    description: "Receive personalized analysis and explanations for each type of compatibility.",
    icon: Shield,
  },
  {
    title: "Zodiac Integration",
    description: "Each name is mapped to a zodiac sign and element for deeper astrological insights.",
    icon: Users,
  },
  {
    title: "100% Private",
    description: "All calculations happen in your browser. No data is sent to any server.",
    icon: Shield,
  },
];

export default function Features() {
  return (
    <section className="py-8 sm:py-10 px-4 bg-[var(--background)]">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--foreground)] mb-4">
            How Does Name Compatibility Work?
          </h2>
          <p className="text-base sm:text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto leading-relaxed">
            Ancient numerology meets modern analysis for comprehensive relationship insights
          </p>
        </div>

        <div className="tool-feature-grid">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-[var(--card)] rounded-2xl shadow-md border border-[var(--border)] p-6 sm:p-8 flex flex-col hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-[var(--muted)] flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-[var(--primary)]" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[var(--foreground)] mb-3">
                {feature.title}
              </h3>
              <p className="text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
