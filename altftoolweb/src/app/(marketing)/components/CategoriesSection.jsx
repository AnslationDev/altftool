import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Calculator,
  Code2,
  FileText,
  ImageIcon,
  ShieldCheck,
  Tags,
} from "lucide-react";

const categories = [
  {
    title: "Image & photo",
    description: "Compress, resize, convert, edit, and inspect images in your browser.",
    href: "/tools/image-photo",
    icon: ImageIcon,
  },
  {
    title: "PDF & documents",
    description: "Merge, split, convert, summarize, and prepare document workflows.",
    href: "/tools/pdf-documents",
    icon: FileText,
  },
  {
    title: "Calculators",
    description: "Everyday, finance, health, education, and conversion calculators.",
    href: "/tools/calculators",
    icon: Calculator,
  },
  {
    title: "Developer",
    description: "Work with JSON, APIs, code, regular expressions, DNS, and web data.",
    href: "/tools/developer",
    icon: Code2,
  },
  {
    title: "Security & privacy",
    description: "Review passwords, authentication, privacy, headers, and browser data.",
    href: "/tools/security-privacy",
    icon: ShieldCheck,
  },
  {
    title: "AI tools",
    description: "Create, summarize, analyze, and plan with focused AI-assisted tools.",
    href: "/tools/ai-tools",
    icon: Bot,
  },
];

export default function CategoriesSection() {
  return (
    <section className="border-b border-border bg-background" aria-labelledby="tool-categories-title">
      <div className="mx-auto w-full max-w-[var(--anslation-ds-container)] px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase text-primary">
              <Tags className="h-4 w-4" aria-hidden="true" />
              Tool categories
            </p>
            <h2
              id="tool-categories-title"
              className="mt-2 text-2xl font-bold text-foreground sm:text-3xl"
            >
              Browse by the work in front of you
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
              These category pages group related tools and keep one canonical
              detail route for every utility.
            </p>
          </div>
          <Link
            href="/tools/all"
            className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-primary transition hover:text-[var(--primary-hover)] focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            All tool categories
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.href}
                href={category.href}
                className="group flex min-h-36 items-start gap-4 rounded-lg border border-border bg-card p-4 shadow-sm transition hover:border-primary hover:shadow-md focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/30"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-muted text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="flex items-center justify-between gap-3">
                    <span className="text-base font-semibold text-foreground">
                      {category.title}
                    </span>
                    <ArrowRight
                      className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary"
                      aria-hidden="true"
                    />
                  </span>
                  <span className="mt-2 block text-sm leading-6 text-muted-foreground">
                    {category.description}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
