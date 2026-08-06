import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createFaqJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { getGroup, getGroups, getManifest, queryItems } from "@altftool/core/backlinks";
import OpportunityRow from "../../_components/OpportunityRow";

export const revalidate = 21600;

const PER_PAGE = 40;

export async function generateStaticParams() {
  const groups = await getGroups();
  return groups.map((g) => ({ group: g.id }));
}

export async function generateMetadata({ params }) {
  const { group: id } = await params;
  const group = await getGroup(id);
  if (!group) return createPageMetadata({ title: "Not found", path: `/backlinks/category/${id}` });

  return createPageMetadata({
    title: `${group.count} ${group.label.toLowerCase()} that accept submissions`,
    description: `${group.blurb} ${group.count} places to submit, with cost, effort and priority on every entry.`,
    path: `/backlinks/category/${id}`,
    keywords: [group.label, `submit to ${group.label.toLowerCase()}`, "backlink opportunities"],
  });
}

export default async function CategoryPage({ params, searchParams }) {
  const [{ group: id }, sp] = await Promise.all([params, searchParams]);
  const group = await getGroup(id);
  if (!group) notFound();

  const page = Math.max(1, Number.parseInt(sp?.page ?? "1", 10) || 1);
  const [manifest, result, freeResult] = await Promise.all([
    getManifest(),
    queryItems({ group: id, page, perPage: PER_PAGE, sort: "impact" }),
    queryItems({ group: id, freeOnly: true, perPage: 1 }),
  ]);

  const quick = result.rows.filter((r) => r.effort === "low" && r.cost === "free").length;

  const faqs = [
    {
      question: `How many ${group.label.toLowerCase()} are in this list?`,
      answer: `${group.count}. Of those, ${freeResult.total} are free or offer a free tier. The strongest by impact is ${result.rows[0]?.website ?? "—"} at ${result.rows[0]?.impact ?? "—"}/100.`,
    },
    {
      question: `Which of these should I do first?`,
      answer: `Sort by impact and start at the top — that ordering already accounts for cost and effort, so the first entries are the ones with the best return for the least work. On this page ${quick} of the current results are both free and quick.`,
    },
    {
      question: group.label === "Launch platforms"
        ? "When should I use a launch platform?"
        : `What do ${group.label.toLowerCase()} usually ask for?`,
      answer: group.label === "Launch platforms"
        ? "Only when your product is genuinely ready. Launches are one-shot: you get a single good attempt per platform, and a launch to a half-finished product spends that attempt for nothing."
        : "Most want a homepage URL, a short description, a logo and one or two screenshots. Having those ready turns a twenty-minute submission into a five-minute one.",
    },
  ];

  const others = manifest.groups.filter((g) => g.id !== id);

  return (
    <>
      <JsonLd
        id={`altf-backlinks-cat-${id}`}
        data={[
          createCollectionPageJsonLd({
            path: `/backlinks/category/${id}`,
            name: group.label,
            description: group.blurb,
          }),
          createItemListJsonLd({
            path: `/backlinks/category/${id}`,
            name: `${group.label} accepting submissions`,
            items: result.rows.map((i) => ({ name: i.website, path: `/backlinks/${i.slug}` })),
          }),
          createFaqJsonLd({ path: `/backlinks/category/${id}`, questions: faqs }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Backlinks", path: "/backlinks" },
            { name: group.label, path: `/backlinks/category/${id}` },
          ]),
        ]}
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 py-5 font-mono text-xs text-muted-foreground"
        >
          <Link href="/backlinks" className="hover:text-primary">
            Backlinks
          </Link>
          <span aria-hidden="true" className="opacity-40">/</span>
          <span className="text-foreground">{group.label}</span>
        </nav>

        <header className="border-b border-border pb-7">
          <span className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-primary">
            Category
          </span>
          <h1 className="mt-3 text-[clamp(1.75rem,3.4vw,2.5rem)] font-semibold leading-tight tracking-[-0.03em] text-foreground">
            {group.label}
          </h1>
          <p className="mt-3 max-w-[66ch] text-[clamp(1rem,1.3vw,1.0625rem)] leading-relaxed text-muted-foreground">
            {group.blurb} There are {group.count} in this list, {freeResult.total} of them free or
            with a free tier. Every entry shows what it costs, how much work it takes, and links
            straight to the submission page.
          </p>
          <dl className="mt-5 flex flex-wrap gap-x-9 gap-y-3">
            <div>
              <dd className="font-mono text-xl font-semibold tabular-nums text-foreground">
                {group.count}
              </dd>
              <dt className="text-xs text-muted-foreground">In this category</dt>
            </div>
            <div>
              <dd className="font-mono text-xl font-semibold tabular-nums text-foreground">
                {freeResult.total}
              </dd>
              <dt className="text-xs text-muted-foreground">Free or freemium</dt>
            </div>
            <div>
              <dd className="font-mono text-xl font-semibold tabular-nums text-foreground">
                {result.rows[0]?.impact ?? "—"}
              </dd>
              <dt className="text-xs text-muted-foreground">Top impact score</dt>
            </div>
          </dl>
        </header>

        <section className="py-7">
          <ul className="flex flex-col gap-2">
            {result.rows.map((item) => (
              <OpportunityRow key={item.slug} item={item} showGroupLabel />
            ))}
          </ul>

          {result.lastPage > 1 ? (
            <nav
              className="mt-6 flex items-center justify-between gap-4 border-t border-border pt-5"
              aria-label="Pagination"
            >
              {result.page > 1 ? (
                <Link
                  href={`/backlinks/category/${id}?page=${result.page - 1}`}
                  className="inline-flex h-10 items-center rounded-lg border border-border px-4 text-sm font-medium hover:bg-surface-soft"
                >
                  ← Previous
                </Link>
              ) : (
                <span />
              )}
              <span className="font-mono text-xs text-muted-foreground">
                Page {result.page} of {result.lastPage}
              </span>
              {result.page < result.lastPage ? (
                <Link
                  href={`/backlinks/category/${id}?page=${result.page + 1}`}
                  className="inline-flex h-10 items-center rounded-lg border border-border px-4 text-sm font-medium hover:bg-surface-soft"
                >
                  Next →
                </Link>
              ) : (
                <span />
              )}
            </nav>
          ) : null}
        </section>

        <section className="border-t border-border py-7">
          <h2 className="mb-4 text-lg font-semibold tracking-tight text-foreground">Questions</h2>
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

        <section className="border-t border-border py-7">
          <h2 className="mb-3 text-lg font-semibold tracking-tight text-foreground">
            Other categories
          </h2>
          <div className="flex flex-wrap gap-2">
            {others.map((g) => (
              <Link
                key={g.id}
                href={`/backlinks/category/${g.id}`}
                className="rounded-sm border border-border bg-surface-soft px-2.5 py-1 font-mono text-xs text-muted-foreground transition hover:border-border-strong hover:text-foreground"
              >
                {g.label}
                <span className="ml-1.5 opacity-50">{g.count}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
