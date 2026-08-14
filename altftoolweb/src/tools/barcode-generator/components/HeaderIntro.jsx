import { Gift, LayoutGrid, ShieldCheck, Zap } from "lucide-react";

const CHIPS = [
  { icon: LayoutGrid, label: "20 Formats" },
  { icon: ShieldCheck, label: "High Quality" },
  { icon: Zap, label: "Instant Preview" },
  { icon: Gift, label: "100% Free" },
];

export default function HeaderIntro() {
  return (
    <div className="min-w-0">
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
        Barcode{" "}
        <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Generator
        </span>
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
        Create high-quality barcodes in seconds. Supports 20 formats with customization options
        and bulk generation.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {CHIPS.map(({ icon: Icon, label }) => (
          <span
            key={label}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground"
          >
            <Icon aria-hidden="true" size={14} className="text-primary" />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
