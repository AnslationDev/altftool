import { PawPrint, Brain, Sparkles, Heart, Users, Shield } from "lucide-react";

const features = [
  {
    title: "10 Personality Questions",
    description: "Thoughtfully designed questions that reveal your deepest nature and connection with the animal kingdom.",
    icon: Brain,
  },
  {
    title: "16 Spirit Animals",
    description: "Choose from 16 unique spirit animals, each with detailed profiles, strengths, and life lessons.",
    icon: PawPrint,
  },
  {
    title: "Accurate Matching",
    description: "Our algorithm scores your answers against each animal's traits for the most accurate spirit animal match.",
    icon: Sparkles,
  },
  {
    title: "Detailed Profiles",
    description: "Get a full profile of your spirit animal including strengths, weaknesses, career paths, and love style.",
    icon: Shield,
  },
  {
    title: "Secondary Matches",
    description: "Discover your secondary and tertiary spirit animal companions for a complete spiritual picture.",
    icon: Users,
  },
  {
    title: "Share Your Result",
    description: "Share your spirit animal result with friends and see what their spirit animal is.",
    icon: Heart,
  },
];

export default function Features() {
  return (
    <section className="py-8 sm:py-10 px-4 bg-[var(--background)]">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--foreground)] mb-4">
            Discover Your Spirit Animal
          </h2>
          <p className="text-base sm:text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto leading-relaxed">
            Connect with your deeper self through the wisdom of animal spirits
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
