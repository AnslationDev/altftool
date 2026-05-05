import React from "react";
import {
  FileText,
  Edit3,
  Search,
  PlusCircle,
  MinusCircle,
  CheckCircle,
} from "lucide-react";

const steps = [
  {
    icon: FileText,
    title: "Enter Original Text",
    description:
      "Paste your original paragraph into the first input box. This will act as the base version for comparison.",
  },
  {
    icon: Edit3,
    title: "Enter Modified Text",
    description:
      "Paste the updated or edited paragraph into the second input box to compare the changes.",
  },
  {
    icon: Search,
    title: "Click Compare",
    description:
      "Press the Compare button to analyze the differences between the two paragraphs instantly.",
  },
  {
    icon: PlusCircle,
    title: "Highlight Added Text",
    description:
      "Newly added words or sentences are highlighted in green so you can easily identify inserted content.",
  },
  {
    icon: MinusCircle,
    title: "Highlight Removed Text",
    description:
      "Removed or deleted text is shown in red, making it clear what has been taken out.",
  },
  {
    icon: CheckCircle,
    title: "Instant Difference Report",
    description:
      "Get a clear visual comparison report that helps you quickly understand all modifications between both texts.",
  },
];

export default function Description() {
  return (
    <section className="py-16 px-4 border border-(--border) rounded-2xl shadow-md">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 mt-[-40]">
          How It Works ?
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="group bg-(--card) rounded-2xl shadow-md p-6 hover:shadow-xl transition duration-300"
              >
                <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-(--primary)/10 mb-4 group-hover:bg-(--primary)/20 transition">
                  <Icon className="text-(--primary) w-6 h-6" />
                  
                </div>

                <h3 className="text-lg font-semibold mb-2 transition-colors duration-300 group-hover:text-(--primary)">
                  {step.title}
                </h3>

                <p className="text-(--muted-foreground) text-sm leading-relaxed">
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