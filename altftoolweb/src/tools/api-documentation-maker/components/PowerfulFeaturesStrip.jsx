import { Activity, BarChart3, Braces, KeyRound, Sliders } from "lucide-react";

const FEATURES = [
  {
    icon: Sliders,
    title: "Structured Endpoint Input",
    description: "Define paths, methods, headers & parameters as JSON",
  },
  {
    icon: KeyRound,
    title: "Auth-aware Docs",
    description: "Document API keys, bearer tokens & required fields",
  },
  {
    icon: Braces,
    title: "Request & Response",
    description: "Readable JSON editor with schema-based examples",
  },
  {
    icon: Activity,
    title: "Status & Health Codes",
    description: "Document every response code with live health checks",
  },
  {
    icon: BarChart3,
    title: "Latency Insights",
    description: "Estimate and visualize per-endpoint latency",
  },
];

export default function PowerfulFeaturesStrip() {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 mt-5">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 sm:p-6">
        <h2 className="text-sm font-bold text-[var(--foreground)] mb-4">Powerful Features</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex flex-col gap-2">
              <span className="w-9 h-9 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center">
                <Icon size={16} />
              </span>
              <span className="text-sm font-semibold text-[var(--foreground)]">{title}</span>
              <span className="text-xs text-[var(--muted-foreground)] leading-snug">
                {description}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
