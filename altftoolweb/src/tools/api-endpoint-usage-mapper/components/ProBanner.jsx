import { CheckCircle2, LineChart, ShieldCheck } from "lucide-react";

const LOCAL_FEATURES = [
  "Runs entirely in your browser",
  "Normalizes dynamic route parameters",
  "Flags latency and error-rate risks",
  "Exports reusable analysis",
];

export default function ProBanner() {
  return (
    <section
      aria-label="Private endpoint analysis"
      className="flex flex-col items-start gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-5 sm:p-6 lg:flex-row lg:items-center"
    >
      <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <LineChart aria-hidden="true" size={24} />
      </span>
      <div className="min-w-0 flex-1">
        <h2 className="text-base font-bold text-foreground">
          Private endpoint analysis
        </h2>
        <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5">
          {LOCAL_FEATURES.map((feature) => (
            <li
              key={feature}
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
            >
              <CheckCircle2
                aria-hidden="true"
                size={13}
                className="shrink-0 text-success"
              />
              {feature}
            </li>
          ))}
        </ul>
      </div>
      <span className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm font-semibold text-foreground">
        <ShieldCheck aria-hidden="true" size={16} className="text-success" />
        Local only
      </span>
    </section>
  );
}
