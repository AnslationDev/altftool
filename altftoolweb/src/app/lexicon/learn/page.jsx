import Link from "next/link";
import { ArrowRight } from "lucide-react";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createFaqJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { getFacets, getManifest } from "@altftool/core/lexicon/corpus";
import { AnswerFirst, Breadcrumb, StatStrip } from "../_components/WordAtoms";
import { GUIDES, buildFacts, fillFacts, usedTokens } from "./guides";

export const revalidate = 86400;

const PATH = "/lexicon/learn";

const description =
  "Eight guides to the machinery a dictionary usually leaves implicit — syllables and stress, the respelling scheme, parts of speech, why synonyms are not interchangeable, and why a few words carry fifty meanings.";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Learn — how English words are built, counted and divided",
    description,
    path: PATH,
    keywords: [
      "how to count syllables",
      "word stress English",
      "parts of speech",
      "how to use a thesaurus",
      "English vocabulary guides",
      "pronunciation respelling",
    ],
  });
}

/*
 * The guard.
 *
 * Guide prose cites the corpus through `{{tokens}}`, and `buildFacts` is the
 * whole list of tokens a guide is allowed to use. If a guide ever cites one
 * that `buildFacts` does not produce, `fillFacts` leaves the raw `{{token}}`
 * in the rendered text — which is loud and correct, because the alternative
 * is a sentence that silently loses its number and still reads as a claim.
 * This surfaces the same failure at the top of the index rather than making
 * someone find it in the middle of a paragraph.
 */
function missingTokens(facts) {
  return usedTokens().filter((token) => facts[token] === undefined);
}

export default async function LexiconLearnIndexPage() {
  const [manifest, facets] = await Promise.all([getManifest(), getFacets()]);
  const facts = buildFacts({ manifest, facets });
  const missing = missingTokens(facts);

  if (missing.length > 0) {
    console.warn(
      `[lexicon/learn] ${missing.length} guide token(s) have no fact in buildFacts and will render raw: ${missing.join(", ")}`,
    );
  }

  // Titles and summaries carry tokens of their own, so the index resolves them
  // exactly as the guide pages do. Nothing countable is typed twice.
  const guides = GUIDES.map((guide) => ({
    slug: guide.slug,
    title: fillFacts(guide.title, facts),
    summary: fillFacts(guide.summary, facts),
    readingTime: guide.readingTime,
    updated: guide.updated,
    keywords: (guide.keywords ?? []).map((keyword) => fillFacts(keyword, facts)),
  }));

  const totalMinutes = guides.reduce((sum, guide) => sum + (guide.readingTime || 0), 0);

  const faqs = [
    {
      question: "What are these guides?",
      answer: `Eight explanations of how English words are built and how this dictionary records them — syllable division, stress, the respelling scheme, the four parts of speech, sense-grouped synonyms, the broader/narrower hierarchy, variety differences, and how to grow a vocabulary. They cover the reasoning a word page cannot fit, across the ${facts.total} entries and ${facts.senses} senses in the corpus.`,
    },
    {
      question: "Are the numbers in these guides kept up to date?",
      answer: `They cannot go out of date. Every countable claim is a placeholder resolved against the live corpus when the page renders, so a figure like "${facts.withPronunciation} recorded pronunciations" is read from the data rather than typed into the prose. Regenerate the corpus and the sentences change with it.`,
    },
    {
      question: "Why is there nothing about word origins?",
      answer:
        "Because WordNet records no etymology, and neither does any other source this dictionary is built from. A word history invented to fill a section would be the one thing on the page a reader could not check against anything, so no guide claims one.",
    },
    {
      question: "Do I need to read them in order?",
      answer:
        "No. Each one stands alone and links to the two or three that follow on from it. If you want a starting point, the syllables and stress guide is the one whose ideas the others lean on most.",
    },
    {
      question: "How long do they take to read?",
      answer: `Between 8 and 9 minutes each, ${totalMinutes} minutes for all eight. Each guide opens with a short answer block that states the conclusion before the explanation, so a guide is useful even if you only read the first paragraph.`,
    },
  ];

  return (
    <>
      <JsonLd
        id="altf-lexicon-learn"
        data={[
          createCollectionPageJsonLd({
            path: PATH,
            name: "AltF Lexicon guides",
            description,
          }),
          createItemListJsonLd({
            path: PATH,
            name: "Guides to English words, sounds and meanings",
            items: guides.map((guide) => ({
              name: guide.title,
              path: `${PATH}/${guide.slug}`,
            })),
          }),
          createFaqJsonLd({ path: PATH, questions: faqs }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Lexicon", path: "/lexicon" },
            { name: "Learn", path: PATH },
          ]),
        ]}
      />

      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <Breadcrumb items={[{ name: "Lexicon", path: "/lexicon" }, { name: "Learn" }]} />

        <header className="border-b border-border pb-8">
          <span className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-primary">
            Learn
          </span>
          <h1 className="mt-3 text-[clamp(1.875rem,3.6vw,2.75rem)] font-semibold leading-tight tracking-[-0.03em] text-foreground">
            How English words are built, counted and divided
          </h1>

          <AnswerFirst>
            Eight guides to the machinery a dictionary normally leaves implicit: where a syllable
            breaks and how to find the stressed one, how to read a pronunciation without learning
            IPA, what a part of speech actually tests for, why a thesaurus that pools senses hands
            you the wrong word, and why {facts.core} words carry most of the language while{" "}
            {facts.rare} sit in the rarest band. Each one is written against the {facts.total}{" "}
            entries in this corpus rather than about English in general.
          </AnswerFirst>

          <StatStrip
            stats={[
              { value: String(guides.length), label: "Guides" },
              { value: `${totalMinutes} min`, label: "To read all of them" },
              { value: facts.total, label: "Entries described" },
              { value: facts.senses, label: "Senses behind them" },
            ]}
          />
        </header>

        {missing.length > 0 ? (
          <p
            role="alert"
            className="mt-8 rounded-lg border border-border-strong bg-surface-soft p-5 text-[0.9375rem] leading-relaxed text-foreground"
          >
            <strong className="font-semibold">Unresolved guide tokens.</strong> {missing.length}{" "}
            placeholder{missing.length === 1 ? "" : "s"} used in the guides ha
            {missing.length === 1 ? "s" : "ve"} no matching fact in{" "}
            <code className="font-mono text-[0.8125rem]">buildFacts</code> and will render raw
            rather than silently vanish:{" "}
            <code className="font-mono text-[0.8125rem]">{missing.join(", ")}</code>. Add them to{" "}
            <code className="font-mono text-[0.8125rem]">buildFacts</code> or remove them from the
            prose.
          </p>
        ) : null}

        {/* ---------------- The rule ---------------- */}
        <section className="border-b border-border py-10">
          <h2 className="text-xl font-semibold tracking-[-0.02em] text-foreground">
            What these guides are, and the rule they follow
          </h2>
          <p className="mt-3 max-w-[68ch] text-[0.9375rem] leading-relaxed text-muted-foreground">
            A word page can show you that <em>photographer</em> is stressed on its second syllable.
            It cannot tell you why the stress moved there from <em>photograph</em>, or how to find
            the stress in a word you have never said aloud. These guides are the part that does not
            fit on an entry.
          </p>
          <p className="mt-3 max-w-[68ch] text-[0.9375rem] leading-relaxed text-muted-foreground">
            They follow one rule strictly, and it is the reason they can be trusted on numbers:
          </p>

          <ul className="mt-5 max-w-[68ch] space-y-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
            <li className="flex gap-3">
              <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>
                <strong className="text-foreground">
                  Every countable claim is resolved from the live corpus at render time.
                </strong>{" "}
                No figure is typed into the prose. Each is a placeholder filled from the corpus
                manifest and facets when the page is built, so a guide cannot drift away from the
                dictionary it describes when the dictionary is regenerated.
              </span>
            </li>
            <li className="flex gap-3">
              <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>
                <strong className="text-foreground">
                  Where the corpus cannot support a claim, the guide says so.
                </strong>{" "}
                {facts.withPronunciation} of the {facts.withSyllables} single words carry a recorded
                pronunciation; the other {facts.noTranscription} are named as a gap rather than
                filled with a plausible guess.
              </span>
            </li>
            <li className="flex gap-3">
              <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>
                <strong className="text-foreground">Nothing about etymology.</strong> The data
                carries no word origins at all, so no guide claims any. An invented word history is
                the one thing on a page a reader has no way to check.
              </span>
            </li>
          </ul>
        </section>

        {/* ---------------- The guides ---------------- */}
        <section className="py-10">
          <h2 className="text-xl font-semibold tracking-[-0.02em] text-foreground">
            The eight guides
          </h2>
          <p className="mt-2 max-w-[68ch] text-[0.9375rem] leading-relaxed text-muted-foreground">
            Each stands alone and links onward to the two or three it follows from. Start anywhere;
            syllables and stress is the one the others lean on most.
          </p>

          <ol className="afl-divide mt-6" style={{ listStyle: "none" }}>
            {guides.map((guide, index) => (
              <li key={guide.slug} className="py-7 first:pt-0">
                <Link href={`${PATH}/${guide.slug}`} className="group block no-underline">
                  <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1 font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-muted-foreground">
                    <span className="tabular-nums text-primary">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>{guide.readingTime} min read</span>
                    <span aria-hidden="true" className="opacity-40">
                      /
                    </span>
                    <span>Updated {guide.updated}</span>
                  </span>

                  <h3 className="mt-2 max-w-[46ch] text-[1.1875rem] font-semibold leading-snug tracking-[-0.015em] text-foreground group-hover:text-primary sm:text-[1.3125rem]">
                    {guide.title}
                  </h3>

                  <p className="mt-2 max-w-[68ch] text-[0.9375rem] leading-relaxed text-muted-foreground">
                    {guide.summary}
                  </p>
                </Link>

                {guide.keywords.length > 0 ? (
                  <ul
                    className="mt-3.5 flex flex-wrap gap-1.5"
                    style={{ listStyle: "none" }}
                    aria-label={`Questions ${guide.title} answers`}
                  >
                    {guide.keywords.map((keyword) => (
                      <li
                        key={keyword}
                        className="rounded-sm border border-border bg-surface-soft px-2 py-0.5 font-mono text-[0.6875rem] text-muted-foreground"
                      >
                        {keyword}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ol>
        </section>

        {/* ---------------- FAQ ---------------- */}
        <section className="border-t border-border py-10">
          <h2 className="text-xl font-semibold tracking-[-0.02em] text-foreground">
            Questions about these guides
          </h2>
          <dl className="afl-divide mt-2 max-w-[72ch]">
            {faqs.map((faq) => (
              <div key={faq.question} className="py-4">
                <dt className="text-[0.9375rem] font-semibold text-foreground">{faq.question}</dt>
                <dd className="mt-1.5 text-[0.9375rem] leading-relaxed text-muted-foreground">
                  {faq.answer}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ---------------- Onward ---------------- */}
        <section className="border-t border-border py-10">
          <h2 className="text-xl font-semibold tracking-[-0.02em] text-foreground">
            Then go and use it
          </h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              {
                href: "/lexicon/browse",
                label: "Browse A–Z",
                hint: `All ${facts.total} entries, by letter`,
              },
              {
                href: "/lexicon/collections",
                label: "Collections",
                hint: `${facts.collections} curated and derived word lists`,
              },
              {
                href: "/lexicon/sources",
                label: "Sources & licences",
                hint: "Where every field on a word page comes from",
              },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="afl-card flex h-full flex-col rounded-lg border border-border bg-surface p-4 no-underline"
              >
                <span className="inline-flex items-center gap-1.5 text-[0.9375rem] font-semibold text-foreground">
                  {link.label}
                  <ArrowRight className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                </span>
                <span className="mt-1.5 text-[0.8125rem] leading-relaxed text-muted-foreground">
                  {link.hint}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
