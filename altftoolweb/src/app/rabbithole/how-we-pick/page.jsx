import Link from "next/link";
import { ArrowRight, Check, X } from "lucide-react";
import JsonLd from "@/platform/seo/JsonLd";
import {
  absoluteUrl,
  createBreadcrumbJsonLd,
  createFaqJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { STATS } from "@altftool/core/rabbithole";
import {
  CATEGORIES,
  COLLECTIONS,
  REVIEWED_ON,
  TIME_BANDS,
  VIBES,
} from "@altftool/core/rabbithole/taxonomy";
import PageHeader from "../_components/PageHeader";
import SectionHeading from "../_components/SectionHeading";

const description = `How the ${STATS.total} sites in this directory are chosen, written up, classified and removed — including what we refuse to list and why nobody can pay to be here.`;

const INCLUDE = [
  "It does one thing, and does it unusually well.",
  "It works right now, in a normal browser, without a plugin or an install.",
  "Somebody would send the link to a friend rather than just bookmark it.",
  "It is reachable at its own URL, so it can be linked to and checked again later.",
  "It is free, or free enough that you can tell whether you want it before paying.",
];

const EXCLUDE = [
  "Anything that needs an account before it will show you anything at all.",
  "Sites whose main purpose is to sell you the site.",
  "Pages that only existed as a joke about a moment in 2013 and no longer land.",
  "Anything requiring a download, an extension, or a desktop app.",
  "Content farms, AI-generated listicles, and directories of directories.",
  "Anything we could not open ourselves and form an opinion about.",
];

const STEPS = [
  {
    title: "Find it",
    body: "Candidates come from the classic best-of lists, from the small-web directories that predate us, from the people who make this sort of thing, and from a lot of following links sideways. Nothing is scraped and no submission queue feeds the catalog.",
  },
  {
    title: "Open it",
    body: "Every candidate is loaded and actually used — the game gets played, the generator gets run, the sound gets turned on. A site nobody here has used does not get an entry, which is the single rule that keeps the directory honest.",
  },
  {
    title: "Write it up",
    body: "Each entry gets an original description and a specific reason to open it. Nothing is copied from the site's own marketing copy, its meta description, or any listicle. If we cannot name what is good about it in one sentence, that is usually a sign it should not be listed.",
  },
  {
    title: "Classify it",
    body: `It lands in exactly one of ${CATEGORIES.length} categories, gets one of ${TIME_BANDS.length} time bands for how long it takes to be worth it, and up to three of ${VIBES.length} vibe tags. The ${COLLECTIONS.length} collections are then derived from those fields rather than hand-assembled, so they cannot drift out of date.`,
  },
  {
    title: "Check it again",
    body: `Links rot. The whole catalog was last swept on ${REVIEWED_ON.label}. Anything that has died since comes out rather than sitting in the list as a broken promise, and the notable losses are recorded on the sites we lost page.`,
  },
];

const FAQS = [
  {
    question: "Can I pay to be listed?",
    answer:
      "No. There is no paid placement, no sponsored entry, no featured slot and no affiliate arrangement behind any link in this directory. Nothing on this page is negotiable for money, which is the only reason the ranking means anything.",
  },
  {
    question: "How do you decide the order?",
    answer:
      "Categories group sites by how long they take to be worth it, not by how good we think they are — there is no ranked number one. The browse page opens on an order that deals one site per category in rotation so the first screen shows the breadth rather than eighteen archives in a row.",
  },
  {
    question: "Do you accept submissions?",
    answer:
      "Suggestions are welcome but there is no form, because a submission queue turns a curated list into an inbox. If something belongs here, it will be opened and used before it is written up like everything else.",
  },
  {
    question: "What happens when a site dies?",
    answer:
      "It is removed from the directory rather than left in place. Sites that mattered get a line on the sites we lost page, with a successor named where one exists. A directory that quietly accumulates dead links is worse than no directory.",
  },
  {
    question: "Do the outbound links make you money?",
    answer:
      "No. Links go straight to the site, with no affiliate tag, no redirect service and no click tracking on the destination. They carry rel=noopener for browser security and nothing else.",
  },
  {
    question: "Are the descriptions written by AI?",
    answer:
      "Every description and every reason-to-visit is written and checked by a person. The whole value of a curated directory is that somebody actually looked, and a page of generated summaries would be indistinguishable from the content farms this exists to beat.",
  },
];

export async function generateMetadata() {
  return createPageMetadata({
    title: "How we pick — the editorial standards behind this directory",
    description,
    path: "/rabbithole/how-we-pick",
    keywords: [
      "curated website directory",
      "editorial standards",
      "how sites are chosen",
      "website directory methodology",
    ],
  });
}

export default function HowWePickPage() {
  const path = "/rabbithole/how-we-pick";
  const crumbs = [
    { name: "Rabbithole", path: "/rabbithole" },
    { name: "How we pick", path },
  ];

  // AboutPage rather than CollectionPage: this describes the directory itself,
  // and it is the page every category page points at as its provenance.
  const aboutJsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": `${absoluteUrl(path)}#about`,
    url: absoluteUrl(path),
    name: "How we pick",
    description,
    dateModified: REVIEWED_ON.iso,
    mainEntity: {
      "@type": "CollectionPage",
      "@id": `${absoluteUrl("/rabbithole")}#collection`,
    },
  };

  return (
    <div className="bg-background">
      <JsonLd
        id="rabbithole-how-we-pick"
        data={[
          createBreadcrumbJsonLd([{ name: "Home", path: "/" }, ...crumbs]),
          aboutJsonLd,
          createFaqJsonLd({ path, questions: FAQS }),
        ]}
      />

      <PageHeader
        crumbs={crumbs}
        eyebrow="Editorial standards"
        title="How we pick"
        lede={`Every one of the ${STATS.total} sites here was opened, used and written up by hand. Nothing is scraped, nobody can pay to be listed, and dead links come out rather than sitting in the list. This page is the whole method, so you can decide how much to trust the rest of it.`}
      >
        <p className="mt-5 font-mono text-xs text-muted-foreground">
          Catalog last checked in full on{" "}
          <time dateTime={REVIEWED_ON.iso} className="text-foreground">
            {REVIEWED_ON.label}
          </time>
        </p>
      </PageHeader>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <section>
          <SectionHeading
            eyebrow="The process"
            title="Five steps, in order"
            description="The same five happen to every entry, including the ones that came from a listicle we were superseding."
            as="h2"
          />
          <ol className="grid gap-4 lg:grid-cols-2">
            {STEPS.map((step, index) => (
              <li
                key={step.title}
                className="rounded-[var(--anslation-ds-radius-xl)] border border-border p-5"
              >
                <span className="font-mono text-xs text-muted-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-1 text-base font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-14 grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              What gets in
            </h2>
            <ul className="mt-3 space-y-2.5">
              {INCLUDE.map((rule) => (
                <li key={rule} className="flex gap-2.5 text-sm leading-relaxed">
                  <Check
                    className="mt-0.5 h-4 w-4 shrink-0 text-[var(--rh-green)]"
                    aria-hidden="true"
                  />
                  <span className="text-muted-foreground">{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground">
              What does not
            </h2>
            <ul className="mt-3 space-y-2.5">
              {EXCLUDE.map((rule) => (
                <li key={rule} className="flex gap-2.5 text-sm leading-relaxed">
                  <X
                    className="mt-0.5 h-4 w-4 shrink-0 text-[var(--rh-red)]"
                    aria-hidden="true"
                  />
                  <span className="text-muted-foreground">{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-lg font-semibold text-foreground">
            Common questions
          </h2>
          <dl className="mt-3 divide-y divide-border border-y border-border">
            {FAQS.map((faq) => (
              <div key={faq.question} className="py-4">
                <dt className="text-sm font-semibold text-foreground">
                  {faq.question}
                </dt>
                <dd className="mt-1.5 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                  {faq.answer}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-12 flex flex-wrap gap-3">
          <Link
            href="/rabbithole/browse"
            className="inline-flex h-11 items-center gap-2 rounded-[var(--anslation-ds-radius-pill)] bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Browse the directory
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            href="/rabbithole/sites-we-lost"
            className="inline-flex h-11 items-center rounded-[var(--anslation-ds-radius-pill)] border border-border px-5 text-sm font-medium text-foreground transition hover:border-primary"
          >
            Sites we lost
          </Link>
        </section>
      </div>
    </div>
  );
}
