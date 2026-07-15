import { CalendarDays, Clock, Sparkles, BarChart3, Trophy, Timer } from "lucide-react";

const features = [
  {
    title: "Date of Birth Picker",
    description: "Select your birth date from an intuitive calendar picker with validation for accurate results.",
    icon: CalendarDays,
  },
  {
    title: "Precision Age Calculator",
    description: "Get your exact age down to years, months, weeks, days, hours, minutes, and even seconds.",
    icon: Clock,
  },
  {
    title: "Birthday Insights",
    description: "Discover your Western zodiac, Chinese zodiac, birthstone, birth flower, element, and more.",
    icon: Sparkles,
  },
  {
    title: "Life Analytics",
    description: "See estimated heartbeats, breaths taken, and total sleep time since birth.",
    icon: BarChart3,
  },
  {
    title: "Milestones Tracker",
    description: "Track life milestones from 1 year to 100 years and see upcoming celebrations.",
    icon: Trophy,
  },
  {
    title: "Live Countdown",
    description: "Watch a real-time countdown to your next birthday with exact days, hours, minutes, and seconds.",
    icon: Timer,
  },
];

export default function Features() {
  return (
    <section className="py-8 sm:py-10 px-4 bg-(--background)">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-(--foreground) mb-4">
            Why Choose Our Birthday Analyzer?
          </h2>
          <p className="text-base sm:text-lg text-(--muted-foreground) max-w-2xl mx-auto leading-relaxed">
            Comprehensive birthday insights and analytics for everyone
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
