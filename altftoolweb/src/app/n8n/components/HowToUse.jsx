import { Search, Copy, Import } from "lucide-react";

const STEPS = [
  {
    icon: Search,
    title: "Find Workflows",
    text: "Browse the n8n workflows library and select a workflow that fits your use case.",
  },
  {
    icon: Copy,
    title: "Copy JSON",
    text: "Click the 'Download Workflow' button to get the raw JSON to your clipboard or file.",
  },
  {
    icon: Import,
    title: "Import",
    text: "Paste directly into your n8n canvas (Ctrl+V) or import the JSON file.",
  },
];

export default function HowToUse() {
  return (
    <section className="mt-16">
      <h2 className="text-xl font-bold text-(--color-foreground)">
        How to Use These Workflows
      </h2>
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {STEPS.map((s, i) => (
          <div
            key={s.title}
            className="rounded-2xl border border-(--color-border) bg-(--color-card) p-6"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--color-primary)/10 text-(--color-primary)">
              <s.icon size={20} />
            </div>
            <h3 className="mt-4 font-semibold text-(--color-foreground)">
              {i + 1}. {s.title}
            </h3>
            <p className="mt-1 text-sm text-(--color-muted-foreground)">{s.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
