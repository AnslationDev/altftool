import React from "react";
import {
  ArrowLeftRight,
  Hash,
  Globe,
  Zap,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

const steps = [
  {
    icon: ArrowLeftRight,
    title: "Select Your Currencies",
    description: "Choose the currency you want to convert from and the currency you want to convert to using the dropdown menus.",
  },
  {
    icon: Hash,
    title: "Enter the Amount",
    description: "Type the amount you want to convert in the input field. Only valid numeric values are accepted for accurate results.",
  },
  {
    icon: Globe,
    title: "Fetch Live Exchange Rates",
    description: "The app automatically retrieves the latest real-time exchange rates from a trusted financial API.",
  },
  {
    icon: Zap,
    title: "Instant Conversion",
    description: "As soon as you enter the amount, the converted value is calculated and displayed instantly.",
  },
  {
    icon: RefreshCw,
    title: "Swap Currencies Easily",
    description: "Use the swap button to quickly switch between selected currencies without re-entering the data.",
  },
  {
    icon: ShieldCheck,
    title: "Accurate & Secure Data",
    description: "All exchange rates are fetched securely and updated frequently to ensure maximum accuracy.",
  },
];

export default function Description() {
  return (
    <section className="py-12 sm:py-16 lg:py-24 px-4 bg-(background)">
      <div className="max-w-6xl mx-auto">
        
        {/* Heading - Fluid size */}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-10 sm:mb-16 text-(--foreground) px-2">
          How It Works 
        </h2>

        {/* The REAL Responsive Grid */}
        <div className="flex flex-wrap justify-center gap-6 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div
                key={index}
                /* Mobile par max-width 350px rakhi hai taaki box 'ajib' bada na ho */
                className="group bg-(--card) text-(--foreground) rounded-2xl  border-(--border) shadow-lg hover:shadow-xl transition-all duration-300 w-full max-w-[350px] sm:max-w-none p-6 sm:p-8 flex flex-col"
              >
                {/* Icon Box */}
                <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl bg-(--muted) mb-6 gtransition-colors duration-300">
                  <Icon className="text-(--primary) w-6 h-6  shadow transition-colors" />
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold mb-3 text-(--foreground)  transition-colors">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-(--foreground) text-sm sm:text-base leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}