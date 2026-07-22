// src/components/InfoPages/HowItWorksPage.tsx

import React from "react";
import { Search, Package, Zap, type LucideIcon } from "lucide-react";

interface Step {
  step: number;
  title: string;
  description: string;
  icon: LucideIcon;
}

const steps: Step[] = [
  {
    step: 1,
    title: "Enter Primary Keyword",
    description:
      "Provide a simple noun representing your idea, such as cloud, data, or finance.",
    icon: Search,
  },
  {
    step: 2,
    title: "Smart Synonym Generation",
    description:
      "The system fetches related words using a public dictionary API to simulate AI-driven ideation.",
    icon: Zap,
  },
  {
    step: 3,
    title: "Domain Name Creation",
    description:
      "Keywords are intelligently combined with popular TLDs to generate creative domain ideas.",
    icon: Package,
  },
];

const HowItWorksPage: React.FC = () => {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-14">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg mb-6">
          <Zap className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-3">
          How It Works
        </h1>
        <p className="text-muted-foreground text-lg">
          A simple three-step process to generate creative domain ideas
        </p>
      </div>

      {/* Steps */}
      <div className="grid gap-6 md:grid-cols-3">
        {steps.map((item) => (
          <div
            key={item.step}
            className="relative bg-background border border-border rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-50 mb-6">
              <item.icon className="w-6 h-6 text-indigo-600" />
            </div>

            <span className="absolute top-6 right-6 text-sm font-semibold text-indigo-600">
              Step {item.step}
            </span>

            <h3 className="text-xl font-semibold text-foreground mb-3">
              {item.title}
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {item.description}
            </p>
          </div>
        ))}
      </div>

      {/* Technical Note Card */}
      <div className="mt-16 bg-muted/40 border border-border rounded-2xl p-8 max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold text-foreground mb-5">
          Technical Notes
        </h2>
        <ul className="space-y-4 text-muted-foreground">
          <li className="flex gap-3">
            <span className="text-indigo-600 font-bold">•</span>
            Uses a free, public dictionary API — no authentication required.
          </li>
          <li className="flex gap-3">
            <span className="text-indigo-600 font-bold">•</span>
            Real-time domain availability is not checked due to API limitations.
          </li>
          <li className="flex gap-3">
            <span className="text-indigo-600 font-bold">•</span>
            Final verification should be done via registrars like Namecheap or
            Google Domains.
          </li>
        </ul>
      </div>
    </section>
  );
};

export default HowItWorksPage;
