import {
  Zap,
  Lock,
  Target,
  Code,
  Copy,
  Rocket
} from "lucide-react";

const features = [
  {
    icon: Target,
    title: "Paste Your Text",
    desc: "Simply paste the text, code, JSON, or content you want to modify into the input box."
  },
  {
    icon: Zap,
    title: "Enter Find & Replace",
    desc: "Type the word or phrase you want to find and the new text you want to replace it with."
  },
  {
    icon: Code,
    title: "Choose Options",
    desc: "Enable smart matching like case-sensitive mode for more precise replacements."
  },
  {
    icon: Rocket,
    title: "Run Replacement",
    desc: "Click the replace button and instantly update hundreds or thousands of lines."
  },
  {
    icon: Copy,
    title: "Review Output",
    desc: "Check the updated text in the output section with clean formatting."
  },
  {
    icon: Lock,
    title: "Copy & Use Anywhere",
    desc: "Copy your final result with one click and use it wherever you need."
  }
];

export default function Cards() {
  return (
    <section className="mt-28">
      <div className="max-w-7xl mx-auto px-6">

        <h2 className="text-3xl md:text-4xl font-semibold text-(--foreground) mb-12 text-center">
          How It Works?
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">

          {features.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
  key={index}
  className="
    group
    bg-(--card)
    rounded-2xl
    shadow-md
    border border-(--border)
    p-6 sm:p-8
    flex flex-col
    hover:shadow-xl
    hover:-translate-y-2
    transition-all duration-300
  "
>
  <div className="space-y-4">

    <div className="w-12 h-12 rounded-xl bg-(--muted) flex items-center justify-center">
      <Icon className="w-6 h-6 text-(--primary)" />
    </div>

    <h3 className="text-lg font-semibold text-[var(--foreground)] group-hover:text-blue-500 transition-colors duration-300">
      {item.title}
    </h3>

    <p className="text-sm text-(--muted-foreground) leading-relaxed">
      {item.desc}
    </p>

  </div>
</div>

            );
          })}
        </div>

      </div>
    </section>
  );
}
