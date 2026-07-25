import Link from "next/link";
import {
  ArrowRight,
  FileImage,
  Gauge,
  ImageDown,
  KeyRound,
  NotebookPen,
  ReceiptText,
  Repeat2,
  Scale,
  TrendingUp,
} from "lucide-react";

const popularTools = [
  {
    title: "Image Compressor",
    category: "Image & photo",
    href: "/tools/all/image-compressor",
    icon: ImageDown,
  },
  {
    title: "Image Resizer",
    category: "Image & photo",
    href: "/tools/all/image-resizer",
    icon: FileImage,
  },
  {
    title: "Unit Converter",
    category: "Converters",
    href: "/tools/all/unit-converter",
    icon: Repeat2,
  },
  {
    title: "Password Generator",
    category: "Security & privacy",
    href: "/tools/all/password-generator",
    icon: KeyRound,
  },
  {
    title: "BMI Calculator",
    category: "Health calculators",
    href: "/tools/all/bmi-calculator",
    icon: Scale,
  },
  {
    title: "Invoice Generator",
    category: "Business",
    href: "/tools/all/invoice-generator",
    icon: ReceiptText,
  },
  {
    title: "Web Speed Checker",
    category: "Developer",
    href: "/tools/all/web-speed-checker",
    icon: Gauge,
  },
  {
    title: "Markdown Preview",
    category: "Text & writing",
    href: "/tools/all/markdown-preview",
    icon: NotebookPen,
  },
];

export default function TrendingSection() {
  return (
    <section className="border-b border-border bg-surface-soft" aria-labelledby="popular-tools-title">
      <div className="mx-auto w-full max-w-[var(--anslation-ds-container)] px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
              <TrendingUp className="h-4 w-4" aria-hidden="true" />
              Quick launch
            </p>
            <h2
              id="popular-tools-title"
              className="mt-2 text-2xl font-bold text-foreground sm:text-3xl"
            >
              Popular browser tools
            </h2>
            <span
              className="mt-3 block h-1 w-12 rounded-full bg-gradient-to-r from-primary to-secondary"
              aria-hidden="true"
            />
          </div>
          <Link
            href="/tools/all"
            className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-primary transition-colors duration-150 hover:text-[var(--primary-hover)] focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Browse all tools
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {popularTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.href}
                href={tool.href}
                className="group flex min-h-20 items-center gap-3 rounded-lg border border-border bg-card p-3 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary hover:shadow-md motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/30"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-muted text-primary transition duration-200 group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-foreground">
                    {tool.title}
                  </span>
                  <span className="mt-1 block truncate text-xs text-muted-foreground">
                    {tool.category}
                  </span>
                </span>
                <ArrowRight
                  className="h-4 w-4 shrink-0 text-muted-foreground transition duration-150 group-hover:translate-x-0.5 group-hover:text-primary motion-reduce:transform-none"
                  aria-hidden="true"
                />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
