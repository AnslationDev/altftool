import Link from "next/link";
import { ArrowRight, ChevronDown, HelpCircle } from "lucide-react";
import { ALTFTOOL_POSITION } from "@/app/alternatives/data/incumbents";
import { CANONICAL_CATEGORIES } from "@/platform/registry/categoryTaxonomy";
import { toolMetaMap } from "@/platform/registry/toolMetaMap";
import { createFaqJsonLd } from "@/platform/seo/generateMetadata";
import JsonLd from "@/platform/seo/JsonLd";

const TOOL_COUNT = Object.keys(toolMetaMap).length;
const CATEGORY_COUNT = CANONICAL_CATEGORIES.length;

/**
 * One array drives both the visible <details> list and the FAQPage JSON-LD, so
 * the markup and the schema physically cannot drift apart.
 *
 * The account / pricing / processing / apps / API answers are quoted from
 * ALTFTOOL_POSITION rather than re-worded here. That constant is the audited
 * wording — in particular `processing` is scoped on purpose, because a blanket
 * "everything runs locally" is false for the tools that call an API.
 */
const faqs = [
  {
    question: "What is AltFTool?",
    answer: `AltFTool is a free website with ${TOOL_COUNT.toLocaleString()} online tools grouped into ${CATEGORY_COUNT} categories, covering converters, PDF and image editing, calculators, developer utilities, text and writing, security, generators and browser games. Every tool is a separate page you can open and use straight away.`,
  },
  {
    question: "Do I need an account to use AltFTool?",
    answer: `${ALTFTOOL_POSITION.account} An account exists only for optional features that save personal state, such as your dashboard.`,
  },
  {
    question: "What paid plans does AltFTool have?",
    answer: `${ALTFTOOL_POSITION.paid} Every tool on the site is usable in full without paying.`,
  },
  {
    question: "Does AltFTool show ads?",
    answer: ALTFTOOL_POSITION.ads,
  },
  {
    question: "Where is my data processed?",
    answer: ALTFTOOL_POSITION.processing,
  },
  {
    question: "Does AltFTool have a mobile or desktop app?",
    answer: `${ALTFTOOL_POSITION.apps} The directory, search and the tool pages are responsive and work in a mobile browser, though a few advanced editors are more comfortable on a larger screen.`,
  },
  {
    question: "Does AltFTool have a public API?",
    answer: ALTFTOOL_POSITION.api,
  },
  {
    question: "What is the difference between a tool, product, and automation?",
    answer:
      "A tool handles one focused task, a product workspace combines related tasks, and an automation template connects repeatable steps for use in n8n.",
  },
  {
    question: "How can I see every available page?",
    answer:
      "The human-readable site map groups canonical public routes by product area and links to the XML sitemap used by crawlers.",
  },
];

const faqJsonLd = createFaqJsonLd({ path: "/", questions: faqs });

export default function FAQSection() {
  return (
    <section className="bg-background" aria-labelledby="home-faq-title">
      {/* Schema mirrors the hand-written Q&As rendered directly below it. */}
      {faqJsonLd ? <JsonLd id="altftool-home-faq" data={faqJsonLd} /> : null}
      <div className="mx-auto grid w-full max-w-[var(--anslation-ds-container)] gap-6 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[minmax(16rem,0.65fr)_minmax(0,1fr)] lg:px-8">
        <div className="max-w-md">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
            <HelpCircle className="h-4 w-4" aria-hidden="true" />
            Common questions
          </p>
          <h2 id="home-faq-title" className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
            Understand the platform before you start
          </h2>
          <span
            className="mt-3 block h-1 w-12 rounded-full bg-gradient-to-r from-primary to-secondary"
            aria-hidden="true"
          />
          <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
            AltFTool separates quick utilities, larger workspaces, automation
            templates, and editorial routes so each flow stays focused.
          </p>
          <Link
            href="/policypages/faq"
            className="mt-5 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-primary transition-colors duration-150 hover:text-[var(--primary-hover)] focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Read all FAQs
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="divide-y divide-border border-y border-border">
          {faqs.map((faq, index) => (
            <details className="group" key={faq.question} open={index === 0}>
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-left text-sm font-semibold text-foreground transition-colors duration-150 hover:text-primary focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:text-base">
                {faq.question}
                <ChevronDown
                  className="h-4 w-4 shrink-0 text-primary transition-transform duration-200 group-open:rotate-180 motion-reduce:transform-none"
                  aria-hidden="true"
                />
              </summary>
              <p className="max-w-3xl translate-y-0 pb-4 pr-8 text-sm leading-6 text-muted-foreground opacity-100 motion-safe:transition-[opacity,translate] motion-safe:duration-300 motion-safe:ease-out starting:-translate-y-1 starting:opacity-0">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
