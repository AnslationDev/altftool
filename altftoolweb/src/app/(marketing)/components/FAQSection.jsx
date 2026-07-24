import Link from "next/link";
import { ArrowRight, ChevronDown, HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "What is the difference between a tool, product, and automation?",
    answer:
      "A tool handles one focused task, a product workspace combines related tasks, and an automation template connects repeatable steps for use in n8n.",
  },
  {
    question: "Do I need an account to use AltFTool?",
    answer:
      "Most browser tools open without an account. Features that save personal state or use managed services can ask you to sign in.",
  },
  {
    question: "Where is my data processed?",
    answer:
      "Many tools process data locally in your browser. Tools that require an external API identify that dependency in their workspace or supporting information.",
  },
  {
    question: "Does AltFTool work on mobile?",
    answer:
      "The public directory, search, guides, and supported tool workspaces are responsive. A few advanced editors are more comfortable on a larger screen.",
  },
  {
    question: "How can I see every available page?",
    answer:
      "The human-readable site map groups canonical public routes by product area and links to the XML sitemap used by crawlers.",
  },
];

export default function FAQSection() {
  return (
    <section className="bg-background" aria-labelledby="home-faq-title">
      <div className="mx-auto grid w-full max-w-[var(--anslation-ds-container)] gap-6 px-4 py-10 sm:px-6 sm:py-12 lg:grid-cols-[minmax(16rem,0.65fr)_minmax(0,1fr)] lg:px-8">
        <div className="max-w-md">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase text-primary">
            <HelpCircle className="h-4 w-4" aria-hidden="true" />
            Common questions
          </p>
          <h2 id="home-faq-title" className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
            Understand the platform before you start
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
            AltFTool separates quick utilities, larger workspaces, automation
            templates, and editorial routes so each flow stays focused.
          </p>
          <Link
            href="/policypages/faq"
            className="mt-5 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-primary transition hover:text-[var(--primary-hover)] focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Read all FAQs
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="divide-y divide-border border-y border-border">
          {faqs.map((faq, index) => (
            <details className="group" key={faq.question} open={index === 0}>
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-left text-sm font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:text-base">
                {faq.question}
                <ChevronDown
                  className="h-4 w-4 shrink-0 text-primary transition group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <p className="max-w-3xl pb-4 pr-8 text-sm leading-6 text-muted-foreground">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
