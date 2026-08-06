import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Info, TriangleAlert } from "lucide-react";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createFaqJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import {
  COST_LABELS,
  EFFORT_LABELS,
  PRIORITY_LABELS,
  STATUS_LABELS,
  getAllItems,
  getGroup,
  getItemBySlug,
  impactTier,
  queryItems,
} from "@altftool/core/backlinks";
import ImpactBadge from "../_components/ImpactBadge";
import OpportunityRow from "../_components/OpportunityRow";

export const revalidate = 21600;
export const dynamicParams = true;

/* 661 detail pages, each a real answer to "how do I get listed on <site>".
   All of them prerender: the set is small enough that the build cost is
   negligible and every one is a potential long-tail entry point. */
export async function generateStaticParams() {
  const items = await getAllItems();
  return items.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const item = await getItemBySlug(slug);
  if (!item) return createPageMetadata({ title: "Not found", path: `/backlinks/${slug}` });

  return createPageMetadata({
    title: `How to get listed on ${item.website} (${COST_LABELS[item.cost]})`,
    description: `${item.website} accepts ${item.rawType.toLowerCase()} submissions. ${item.guidance} Cost: ${COST_LABELS[item.cost]}. Effort: ${EFFORT_LABELS[item.effort].toLowerCase()}.`,
    path: `/backlinks/${item.slug}`,
    keywords: [
      `submit to ${item.website}`,
      `${item.website} listing`,
      `${item.domain} submission`,
      item.rawCategory,
    ],
  });
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-2.5 text-sm last:border-b-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-mono text-[0.8125rem] text-foreground">{value}</dd>
    </div>
  );
}

export default async function OpportunityDetailPage({ params }) {
  const { slug } = await params;
  const item = await getItemBySlug(slug);
  if (!item) notFound();

  const [group, siblings] = await Promise.all([
    getGroup(item.group),
    queryItems({ group: item.group, perPage: 7, sort: "impact" }),
  ]);

  const tier = impactTier(item.impact);
  const related = siblings.rows.filter((r) => r.slug !== item.slug).slice(0, 6);

  const answerFirst = `${item.website} (${item.domain}) accepts ${item.rawType.toLowerCase()}. It is ${COST_LABELS[item.cost].toLowerCase()} to submit, takes ${EFFORT_LABELS[item.effort].toLowerCase() === "quick" ? "only a few minutes" : EFFORT_LABELS[item.effort].toLowerCase() === "moderate" ? "a moderate amount of preparation" : "real preparation and a written pitch"}, and scores ${item.impact}/100 on our impact ranking (${tier.label.toLowerCase()}).`;

  const faqs = [
    {
      question: `Is it free to submit to ${item.website}?`,
      answer:
        item.cost === "free"
          ? `Yes. Submitting to ${item.website} is free.${item.rawCost && item.rawCost.toLowerCase() !== "free" ? ` The source notes: ${item.rawCost}.` : ""}`
          : item.cost === "freemium"
            ? `There is a free path. ${item.website} offers a free listing with paid upgrades available — the source records this as "${item.rawCost}".`
            : item.cost === "paid"
              ? `No. ${item.website} requires payment — recorded as "${item.rawCost}".`
              : `Not clearly stated. Check the submission page directly before committing time.`,
    },
    {
      question: `What do I need before submitting to ${item.website}?`,
      answer: item.guidance || `Have your homepage URL, a clear one-line description, a logo and screenshots ready before you start.`,
    },
    ...(item.rules
      ? [
          {
            question: `Are there rules or restrictions on ${item.website}?`,
            answer: item.rules,
          },
        ]
      : []),
  ];

  return (
    <>
      <JsonLd
        id={`altf-backlink-${item.slug}`}
        data={[
          {
            "@context": "https://schema.org",
            "@type": "HowTo",
            name: `How to get listed on ${item.website}`,
            description: answerFirst,
            totalTime: item.effort === "low" ? "PT10M" : item.effort === "medium" ? "PT45M" : "PT3H",
            estimatedCost:
              item.cost === "free"
                ? { "@type": "MonetaryAmount", value: "0", currency: "USD" }
                : undefined,
            step: [
              {
                "@type": "HowToStep",
                name: "Prepare your assets",
                text: item.guidance || "Have your homepage URL, description, logo and screenshots ready.",
              },
              ...(item.rules
                ? [{ "@type": "HowToStep", name: "Check the rules", text: item.rules }]
                : []),
              {
                "@type": "HowToStep",
                name: "Submit",
                text: `Open the submission page on ${item.domain} and complete the form.`,
                url: item.url,
              },
            ],
          },
          createFaqJsonLd({ path: `/backlinks/${item.slug}`, questions: faqs }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Backlinks", path: "/backlinks" },
            ...(group ? [{ name: group.label, path: `/backlinks/category/${group.id}` }] : []),
            { name: item.website, path: `/backlinks/${item.slug}` },
          ]),
        ]}
      />

      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-2 py-5 font-mono text-xs text-muted-foreground"
        >
          <Link href="/backlinks" className="hover:text-primary">
            Backlinks
          </Link>
          {group ? (
            <>
              <span aria-hidden="true" className="opacity-40">/</span>
              <Link href={`/backlinks/category/${group.id}`} className="hover:text-primary">
                {group.label}
              </Link>
            </>
          ) : null}
          <span aria-hidden="true" className="opacity-40">/</span>
          <span className="text-foreground">{item.website}</span>
        </nav>

        <header className="flex flex-wrap items-start gap-5 border-b border-border pb-7">
          <ImpactBadge impact={item.impact} size={64} />
          <div className="min-w-0 flex-1">
            <h1 className="text-[clamp(1.5rem,3vw,2.25rem)] font-semibold leading-tight tracking-[-0.03em] text-foreground">
              How to get listed on {item.website}
            </h1>
            <p className="mt-1.5 font-mono text-sm text-muted-foreground">{item.domain}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              <span className="bl-chip">{COST_LABELS[item.cost]}</span>
              <span className="bl-chip">{EFFORT_LABELS[item.effort]} to do</span>
              <span className="bl-chip">{PRIORITY_LABELS[item.priority]}</span>
              <span className="bl-chip">{STATUS_LABELS[item.status]}</span>
              {item.rawCategory ? <span className="bl-chip">{item.rawCategory}</span> : null}
            </div>
          </div>
          <a
            className="bl-open !h-11 !px-5 !text-sm"
            href={item.url}
            target="_blank"
            rel="noopener noreferrer nofollow ugc"
          >
            Open submit page
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </header>

        <div className="grid items-start gap-8 py-8 lg:grid-cols-[1fr_16rem] lg:gap-10">
          <div>
            <div className="mb-7 rounded-lg border border-border border-l-[3px] border-l-primary bg-canvas p-5">
              <p className="text-[0.9375rem] leading-relaxed text-foreground">
                <strong>In short:</strong> {answerFirst}
              </p>
            </div>

            <section className="border-b border-border pb-7">
              <h2 className="mb-3 text-xl font-semibold tracking-tight text-foreground">
                What to submit
              </h2>
              <p className="max-w-[68ch] leading-relaxed text-muted-foreground">
                {item.guidance ||
                  "Have your homepage URL, a clear one-line description, a logo and a couple of screenshots ready before you open the form."}
              </p>
            </section>

            {item.rules ? (
              <section className="border-b border-border py-7">
                <h2 className="mb-3 text-xl font-semibold tracking-tight text-foreground">
                  Rules and caveats
                </h2>
                <div className="flex gap-3 rounded-lg border border-warning/30 bg-warning-soft p-4">
                  <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
                  <p className="text-[0.9375rem] leading-relaxed text-foreground">{item.rules}</p>
                </div>
              </section>
            ) : null}

            <section className="border-b border-border py-7">
              <h2 className="mb-3 text-xl font-semibold tracking-tight text-foreground">
                Why it scores {item.impact}
              </h2>
              <div className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <p>
                  Priority is <strong className="text-foreground">{PRIORITY_LABELS[item.priority].toLowerCase()}</strong>,
                  which sets the band. It is {COST_LABELS[item.cost].toLowerCase()} and{" "}
                  {EFFORT_LABELS[item.effort].toLowerCase()} to complete, which adjusts it within
                  that band. The score ranks your queue — it is not a measure of domain authority.
                </p>
              </div>
            </section>

            <section className="py-7">
              <h2 className="mb-3 text-xl font-semibold tracking-tight text-foreground">Questions</h2>
              <div className="max-w-3xl">
                {faqs.map((faq, i) => (
                  <details key={faq.question} className="border-b border-border" open={i === 0}>
                    <summary className="cursor-pointer list-none py-3.5 text-[0.9375rem] font-medium text-foreground marker:hidden hover:text-primary">
                      {faq.question}
                    </summary>
                    <div className="pb-4 text-sm leading-relaxed text-muted-foreground">
                      {faq.answer}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          </div>

          <aside className="flex flex-col gap-4 lg:sticky lg:top-20">
            <div className="rounded-lg border border-card-border bg-card p-5">
              <h2 className="mb-3 font-mono text-[0.625rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                At a glance
              </h2>
              <dl>
                <Row label="Impact" value={`${item.impact} / 100`} />
                <Row label="Cost" value={COST_LABELS[item.cost]} />
                <Row label="Effort" value={EFFORT_LABELS[item.effort]} />
                <Row label="Priority" value={PRIORITY_LABELS[item.priority]} />
                <Row label="Status" value={STATUS_LABELS[item.status]} />
                {item.checked ? <Row label="Source checked" value={item.checked} /> : null}
              </dl>
            </div>

            {related.length > 0 && group ? (
              <div className="rounded-lg border border-card-border bg-card p-5">
                <h2 className="mb-3 font-mono text-[0.625rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  More {group.label.toLowerCase()}
                </h2>
                <ul>
                  {related.map((r) => (
                    <li key={r.slug} className="border-b border-border last:border-b-0">
                      <Link
                        href={`/backlinks/${r.slug}`}
                        className="flex items-center gap-2.5 py-2.5 hover:text-primary"
                      >
                        <span className="w-7 shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                          {r.impact}
                        </span>
                        <span className="truncate text-[0.8125rem] text-foreground">{r.website}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/backlinks/category/${group.id}`}
                  className="mt-2 inline-block text-xs text-primary hover:underline"
                >
                  All {group.count} →
                </Link>
              </div>
            ) : null}
          </aside>
        </div>
      </div>
    </>
  );
}
