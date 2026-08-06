import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createFaqJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { EXPERIENCE_CATALOG } from "@altftool/core/experiences";
import { ALTF_MATCHES } from "@altftool/core/rabbithole";
import PageHeader from "../_components/PageHeader";
import SectionHeading from "../_components/SectionHeading";
import SiteMark from "../_components/SiteMark";
import { categoryStyle } from "../_lib/presentation";

const description =
  "Some of the ideas in this directory we liked enough to build our own version of. Here is every AltF experience, side by side with the site that inspired it.";

const FAQS = [
  {
    question: "Are these copies of the original sites?",
    answer:
      "No. They are our own builds of the same idea, and we link to the original in every case so you can use whichever you prefer. Where the original is still the better version, we say so on its page.",
  },
  {
    question: "Why build your own when the original exists?",
    answer:
      "Three reasons, usually: the original stopped being maintained, it needed a plugin or an account we did not want to ask for, or it never worked properly on a phone. If none of those apply we just link out and leave it alone.",
  },
  {
    question: "Do the AltF versions cost anything?",
    answer:
      "No. Every experience listed here is free to open, with no account and no install.",
  },
];

export async function generateMetadata() {
  return createPageMetadata({
    title: "Built by AltF — our own versions of the internet's best ideas",
    description,
    path: "/rabbithole/built-by-altf",
    keywords: [
      "AltF experiences",
      "free browser experiences",
      "alternatives to fun websites",
      "interactive web toys",
    ],
  });
}

export default function BuiltByAltfPage() {
  const path = "/rabbithole/built-by-altf";
  const crumbs = [
    { name: "Rabbithole", path: "/rabbithole" },
    { name: "Built by AltF", path },
  ];

  // Index the catalog by the experience it points at, so each experience can
  // show every original it relates to rather than only the first match.
  const inspirations = new Map();
  for (const site of ALTF_MATCHES) {
    if (!inspirations.has(site.altfAlternative)) {
      inspirations.set(site.altfAlternative, []);
    }
    inspirations.get(site.altfAlternative).push(site);
  }

  const experiences = EXPERIENCE_CATALOG.map((experience) => ({
    experience,
    sources: inspirations.get(experience.slug) || [],
  })).sort((a, b) => b.sources.length - a.sources.length);

  return (
    <div className="bg-background">
      <JsonLd
        id="rabbithole-built-by-altf"
        data={[
          createBreadcrumbJsonLd([{ name: "Home", path: "/" }, ...crumbs]),
          createCollectionPageJsonLd({
            path,
            name: "Built by AltF",
            description,
          }),
          createItemListJsonLd({
            path,
            name: "AltF experiences",
            items: EXPERIENCE_CATALOG.map((experience) => ({
              name: experience.name,
              path: experience.href,
            })),
          }),
          createFaqJsonLd({ path, questions: FAQS }),
        ]}
      />

      <PageHeader
        crumbs={crumbs}
        eyebrow={`${EXPERIENCE_CATALOG.length} experiences`}
        title="The ones we built ourselves"
        lede={description}
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="rh-grid rh-grid--wide">
          {experiences.map(({ experience, sources }) => (
            <article key={experience.slug} className="rh-card p-5">
              <p className="rh-eyebrow">{experience.tag}</p>

              <h2 className="mt-1.5 text-lg font-semibold leading-tight text-foreground">
                <Link href={experience.href} className="rh-card__link">
                  {experience.name}
                </Link>
              </h2>

              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">
                {experience.tagline || experience.description}
              </p>

              {sources.length ? (
                <div className="mt-4 border-t border-border pt-3">
                  <p className="rh-eyebrow mb-2">In the same spirit as</p>
                  <ul className="flex flex-col gap-2">
                    {sources.map((site) => (
                      <li
                        key={site.slug}
                        className="rh-toned flex items-center gap-2"
                        style={categoryStyle(site.category)}
                      >
                        <SiteMark site={site} size="sm" />
                        <Link
                          href={`/rabbithole/site/${site.slug}`}
                          className="relative z-10 min-w-0 truncate text-sm text-foreground underline-offset-4 hover:underline"
                        >
                          {site.name}
                        </Link>
                        <span className="min-w-0 truncate font-mono text-[0.6875rem] text-muted-foreground">
                          {site.host}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="mt-4 border-t border-border pt-3 text-sm text-muted-foreground">
                  Built from scratch, with no direct equivalent in the directory.
                </p>
              )}

              <p className="mt-4 flex items-center gap-1 text-sm font-medium text-primary">
                {experience.cta || `Open ${experience.name}`}
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </p>
            </article>
          ))}
        </div>

        <section className="mt-16 border-t border-border pt-10">
          <SectionHeading
            eyebrow="Questions"
            title="Why we build our own"
            as="h2"
          />
          <dl className="divide-y divide-border border-y border-border">
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

          <Link
            href="/rabbithole/browse"
            className="mt-8 inline-flex h-11 items-center gap-2 rounded-[var(--anslation-ds-radius-pill)] bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Browse the full directory
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </section>
      </div>
    </div>
  );
}
