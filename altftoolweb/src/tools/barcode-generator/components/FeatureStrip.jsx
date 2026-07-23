import { Layers, Lock, ShieldCheck, Wand2 } from "lucide-react";

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "High Quality Output",
    description: "Crisp, clear barcodes for any use case",
  },
  {
    icon: Layers,
    title: "Multiple Formats",
    description: "Export in PNG, SVG, PDF, EPS and more",
  },
  {
    icon: Wand2,
    title: "Fully Customizable",
    description: "Adjust size, color, margin and other options",
  },
  {
    icon: Lock,
    title: "Privacy First",
    description: "Your data stays in your browser. We don't store anything.",
  },
];

export default function FeatureStrip() {
  return (
    <section aria-label="Tool highlights" className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-border">
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <div key={title} className="flex items-start gap-3 lg:px-5 lg:first:pl-0 lg:last:pr-0">
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon aria-hidden="true" size={19} />
            </span>
            <div>
              <h3 className="text-sm font-bold text-foreground">{title}</h3>
              <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
