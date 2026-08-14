import Link from "next/link";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createFaqJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { getPairs } from "@altftool/core/lexicon/corpus";
import {
  AnswerFirst,
  Breadcrumb,
  Pagination,
  SectionHeading,
  StatStrip,
} from "../_components/WordAtoms";

export const revalidate = 86400;

const description =
  "Side-by-side comparisons of the words English speakers mix up: homophones that sound identical, near-spellings that differ by one buried letter, and synonyms where the only question is which one to use.";

const GROUPS = [
  {
    kind: "homophone",
    title: "Sound the same",
    blurb:
      "Identical pronunciation, different spelling. Computed by matching full phonetic transcriptions, so every pair here genuinely sounds alike — this is not a list of words that merely rhyme.",
  },
  {
    kind: "near-spelling",
    title: "Look the same",
    blurb:
      "Six letters or more, differing by a single character at least three letters in. The constraint matters: without it the same method returns beach and reach, which nobody confuses.",
  },
  {
    kind: "synonym",
    title: "Mean the same",
    blurb:
      "Pairs WordNet records as sharing a sense, but which sit in different commonness bands. The question is not what they mean, it is which one belongs in your sentence.",
  },
];

const FAQS = [
  {
    question: "How were these pairs chosen?",
    answer:
      "All three kinds are computed from the corpus, not typed by hand. Homophones come from matching full phonetic transcriptions. Near-spellings come from a single-character edit at least three letters into words of six letters or more. Synonym pairs come from WordNet recording both words in the same sense while a frequency corpus puts them in different commonness bands.",
  },
  {
    question: "Can I compare any two words?",
    answer:
      "Yes. The comparison page accepts any two entries in the dictionary — put them in the URL as word-one-vs-word-two. Only the computed pairs are listed here and offered to search engines, but the page works for anything in the corpus.",
  },
  {
    question: "Why are some obvious pairs missing?",
    answer:
      "A pair only appears if both words clear a commonness threshold and both are in the pronouncing dictionary where the comparison needs pronunciation. Pairs involving a word too rare to be confused with anything are left out deliberately.",
  },
];

export async function generateMetadata() {
  return createPageMetadata({
    title: "Word comparisons — which one do you mean?",
    description,
    path: "/lexicon/compare",
    keywords: [
      "commonly confused words",
      "homophones list",
      "word vs word",
      "difference between words",
      "which word to use",
    ],
  });
}

/*
 * The hub is paginated because it cannot afford not to be.
 *
 * 1,422 pairs rendered as links is a 2.1 MB document, and the build gate fails
 * any prerendered page over 1 MiB. Without a `kind` the page shows a bounded
 * preview of each group; with one it becomes that group's full paginated list,
 * so every pair stays reachable from here and not only from the sitemap.
 */
const PREVIEW_PER_GROUP = 48;
const PER_PAGE = 150;

export default async function ComparePage({ searchParams }) {
  const params = await searchParams;
  const rawKind = Array.isArray(params?.kind) ? params.kind[0] : params?.kind;
  const activeKind = GROUPS.some((group) => group.kind === rawKind) ? rawKind : null;
  const page = Math.max(1, Number.parseInt(Array.isArray(params?.page) ? params.page[0] : params?.page, 10) || 1);

  const pairs = await getPairs();

  const byKind = new Map(GROUPS.map((group) => [group.kind, []]));
  for (const pair of pairs) {
    if (byKind.has(pair.kind)) byKind.get(pair.kind).push(pair);
  }

  const shownGroups = activeKind ? GROUPS.filter((group) => group.kind === activeKind) : GROUPS;
  const activeTotal = activeKind ? (byKind.get(activeKind) || []).length : 0;

  const featured = (byKind.get("homophone") || []).slice(0, 12);

  return (
    <>
      <JsonLd
        id="altf-lexicon-compare-index"
        data={[
          createCollectionPageJsonLd({
            path: "/lexicon/compare",
            name: "Word comparisons",
            description,
          }),
          createItemListJsonLd({
            path: "/lexicon/compare",
            name: "Commonly confused word pairs",
            items: featured.map((pair) => ({
              name: `${pair.a} vs ${pair.b}`,
              path: `/lexicon/compare/${pair.a}-vs-${pair.b}`,
            })),
          }),
          createFaqJsonLd({ path: "/lexicon/compare", questions: FAQS }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Lexicon", path: "/lexicon" },
            { name: "Compare", path: "/lexicon/compare" },
          ]),
        ]}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Breadcrumb items={[{ name: "Lexicon", path: "/lexicon" }, { name: "Compare" }]} />

        <header className="border-b border-border pb-8">
          <span className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-primary">
            Compare
          </span>
          <h1 className="mt-3 text-[clamp(1.875rem,3.6vw,2.75rem)] font-semibold leading-tight tracking-[-0.03em] text-foreground">
            Which one do you mean?
          </h1>

          <AnswerFirst>
            {pairs.length.toLocaleString("en-US")} word pairs that get mixed up, in three kinds:
            words that sound identical, words that look almost identical, and words that mean nearly
            the same thing. Each comparison puts the two side by side — pronunciation, part of
            speech, senses, and which of the two you are more likely to meet.
          </AnswerFirst>

          <StatStrip
            stats={GROUPS.map((group) => ({
              value: (byKind.get(group.kind) || []).length.toLocaleString("en-US"),
              label: group.title,
            })).concat({ value: pairs.length.toLocaleString("en-US"), label: "Total pairs" })}
          />
        </header>

        {shownGroups.map((group) => {
          const items = byKind.get(group.kind) || [];
          if (items.length === 0) return null;

          const isActive = activeKind === group.kind;
          const visible = isActive
            ? items.slice((page - 1) * PER_PAGE, page * PER_PAGE)
            : items.slice(0, PREVIEW_PER_GROUP);
          const hidden = isActive ? 0 : items.length - visible.length;

          return (
            <section key={group.kind} className="py-10">
              <SectionHeading
                eyebrow={`${items.length.toLocaleString("en-US")} pairs`}
                title={group.title}
                description={group.blurb}
                action={
                  hidden > 0 ? (
                    <Link
                      href={`/lexicon/compare?kind=${group.kind}`}
                      className="shrink-0 text-sm text-primary no-underline hover:underline"
                    >
                      All {items.length.toLocaleString("en-US")} →
                    </Link>
                  ) : isActive ? (
                    <Link
                      href="/lexicon/compare"
                      className="shrink-0 text-sm text-primary no-underline hover:underline"
                    >
                      ← All three kinds
                    </Link>
                  ) : null
                }
              />

              <ul
                className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(13rem,1fr))] gap-2"
                style={{ listStyle: "none" }}
              >
                {visible.map((pair) => (
                  <li key={`${pair.a}-${pair.b}`}>
                    <Link
                      href={`/lexicon/compare/${pair.a}-vs-${pair.b}`}
                      className="afl-card flex items-baseline justify-center gap-2 rounded-sm border border-border bg-surface-soft px-3 py-2 text-[0.9375rem] no-underline hover:bg-surface"
                    >
                      <span className="afl-headword truncate text-foreground">{pair.a}</span>
                      <span className="shrink-0 font-mono text-[0.6875rem] text-muted-foreground">
                        vs
                      </span>
                      <span className="afl-headword truncate text-foreground">{pair.b}</span>
                    </Link>
                  </li>
                ))}
              </ul>

              {!isActive && hidden > 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">
                  {hidden.toLocaleString("en-US")} more in this group.{" "}
                  <Link
                    href={`/lexicon/compare?kind=${group.kind}`}
                    className="text-primary hover:underline"
                  >
                    See them all
                  </Link>
                  .
                </p>
              ) : null}
            </section>
          );
        })}

        {activeKind ? (
          <Pagination
            page={page}
            total={activeTotal}
            perPage={PER_PAGE}
            basePath="/lexicon/compare"
            query={`?kind=${activeKind}`}
          />
        ) : null}

        <section className="border-t border-border py-10">
          <h2 className="text-xl font-semibold tracking-[-0.02em] text-foreground">
            About these comparisons
          </h2>
          <dl className="afl-divide mt-2 max-w-[70ch]">
            {FAQS.map((faq) => (
              <div key={faq.question} className="py-4">
                <dt className="text-[0.9375rem] font-semibold text-foreground">{faq.question}</dt>
                <dd className="mt-1.5 text-[0.9375rem] leading-relaxed text-muted-foreground">
                  {faq.answer}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </>
  );
}
