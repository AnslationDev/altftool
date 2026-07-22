import React from "react";
import { Shield, Smartphone, Zap, BarChart3, Clock, Lock } from "lucide-react";

const featureList = [
  {
    icon: Shield,
    title: "Privacy First",
    description: "Your health data never leaves your device. Everything is stored locally for maximum privacy."
  },
  {
    icon: BarChart3,
    title: "Smart Analytics",
    description: "Visualize trends and detect patterns between your lifestyle and symptoms automatically."
  },
  {
    icon: Smartphone,
    title: "Mobile Ready",
    description: "Log symptoms on the go with a fully responsive, touch-optimized interface."
  },
  {
    icon: Clock,
    title: "Detailed Tracking",
    description: "Record everything from severity and duration to triggers, mood, and medication."
  },
  {
    icon: Zap,
    title: "Quick Entry",
    description: "Intuitive forms designed for speed, so you can log your health status in seconds."
  },
  {
    icon: Lock,
    title: "Secure Storage",
    description: "Uses browser local storage to keep your history persistent across sessions."
  }
];

export default function Features() {
  return (
    <div className="mt-24 max-w-4xl mx-auto px-4 pb-24">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-black text-(--foreground) uppercase tracking-tighter mb-4">
          Why Track Your Symptoms?
        </h2>
        <p className="text-(--muted-foreground) font-bold uppercase tracking-[0.2em] text-xs">
          Comprehensive Health Monitoring
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {featureList.map((feature, i) => (
          <div
            key={i}
            className="bg-(--card) p-8 rounded-3xl border border-(--border) shadow-xl hover:shadow-2xl hover:border-blue-500/30 transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
              <feature.icon className="text-blue-600" size={28} />
            </div>
            <h3 className="text-xl font-black text-(--foreground) mb-3 uppercase tracking-tight">{feature.title}</h3>
            <p className="text-sm text-(--muted-foreground) leading-relaxed font-medium">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
