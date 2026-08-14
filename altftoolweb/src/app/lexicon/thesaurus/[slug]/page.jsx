import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createFaqJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import {
  POS_BY_KEY,
  indefiniteArticle,
  normalizePos,
  slugifyWord,
} from "@altftool/core/lexicon";
import { getWord } from "@altftool/core/lexicon/corpus";
import {
  AnswerFirst,
  Breadcrumb,
  CommonnessMeter,
  PosChips,
  StatStrip,
  SyllableLine,
} from "../../_components/WordAtoms";

export const revalidate = 86400;
export const dynamicParams = true;

const HUB_PATH = "/lexicon/thesaurus";
const CHIP_LIMIT = 40;
const ITEM_LIST_CAP = 50;

/*
 * The per-word thesaurus.
 *
 * The one rule this page exists to obey: synonyms are a property of a SENSE,
 * not of a word. WordNet models them as synsets — sets of word forms that are
 * interchangeable in one particular context — so flattening them into a single
 * alphabetised column, which is what every general-purpose thesaurus on the
 * web does, throws away the only information that tells you which substitution
 * is safe. Nothing here is flattened.
 */

/*
 * Pre-render the common, heavily polysemous words — the ones where the sense
 * grouping is the reason to visit, and the ones with the traffic. The other
 * ~147,000 render on demand and are cached by ISR; building them all would add
 * hours to CI for pages nobody requests in their first month.
 */
const PRERENDER = [
  "take", "make", "go", "run", "get", "light", "clear", "see", "start", "stop",
  "play", "give", "work", "heavy", "close", "good", "big", "right", "low", "free",
  "look", "dull", "open", "quiet", "dark", "clean", "short", "love", "hard", "come",
  "calm", "slow", "old", "dirty", "rough", "sharp", "easy", "know", "near", "thick",
  "false", "talk", "funny", "thin", "think", "tell", "gentle", "smooth", "bad", "fast",
  "high", "wide", "weak", "true", "loud", "wrong", "need", "smart", "simple", "late",
  "deep", "full", "small", "rich", "ask", "brave", "wise", "rude", "narrow", "strong",
  "cold", "poor", "say", "stupid", "quick", "bright", "long", "answer", "like", "ugly",
];

export function generateStaticParams() {
  return PRERENDER.map((slug) => ({ slug }));
}

/* ------------------------------------------------------------------ *
 * Shaping
 * ------------------------------------------------------------------ */

/**
 * Everything the page needs, measured once.
 *
 * `senses` keeps only those carrying at least one relation — a sense with no
 * synonym, antonym, broader or narrower term contributes nothing to a
 * thesaurus, and the page says how many were left out rather than silently
 * shortening the list.
 */
function shape(entry) {
  const synonyms = new Set();
  const antonyms = new Set();

  for (const sense of entry.sn) {
    for (const word of sense.sy || []) synonyms.add(word);
    for (const word of sense.an || []) antonyms.add(word);
  }

  const carries = (sense) =>
    (sense.sy?.length || 0) +
      (sense.an?.length || 0) +
      (sense.br?.length || 0) +
      (sense.nr?.length || 0) >
    0;

  // Grouped by part of speech and numbered within the group, exactly as the
  // full word page numbers them, so a reader moving between the two pages is
  // looking at the same sense 3.
  const groups = [];
  const counters = new Map();
  for (const sense of entry.sn) {
    const pos = normalizePos(sense.p);
    const position = (counters.get(pos) || 0) + 1;
    counters.set(pos, position);
    if (!carries(sense)) continue;

    let group = groups.find((candidate) => candidate.pos === pos);
    if (!group) {
      group = { pos, senses: [], total: 0 };
      groups.push(group);
    }
    group.senses.push({ sense, position });
  }
  for (const group of groups) group.total = counters.get(group.pos) || group.senses.length;

  const shown = groups.reduce((sum, group) => sum + group.senses.length, 0);

  return {
    synonyms: [...synonyms],
    antonyms: [...antonyms],
    groups,
    sensesShown: shown,
    sensesWithSynonyms: entry.sn.filter((sense) => (sense.sy?.length || 0) > 0).length,
    sensesBare: entry.ns - shown,
  };
}

/* ------------------------------------------------------------------ *
 * Copy helpers
 * ------------------------------------------------------------------ */

function answerSentence(entry, data) {
  if (data.synonyms.length === 0 && data.antonyms.length === 0) {
    return `WordNet records no synonym and no antonym for ${entry.w}. It is the only member of ${
      entry.ns === 1 ? "its synset" : "each of its synsets"
    }, which is common for technical, taxonomic and single-sense vocabulary — there is no other English word that means the same thing. The broader and narrower terms below are the useful relations in that case.`;
  }

  const synPart =
    data.synonyms.length > 0
      ? `${data.synonyms.length} distinct ${
          data.synonyms.length === 1 ? "synonym" : "synonyms"
        } spread across ${data.sensesWithSynonyms} of its ${entry.ns} ${
          entry.ns === 1 ? "sense" : "senses"
        }`
      : "no recorded synonym";

  const antPart =
    data.antonyms.length > 0
      ? ` Its ${data.antonyms.length === 1 ? "one recorded opposite is" : `${data.antonyms.length} recorded opposites are`} ${data.antonyms.join(", ")}.`
      : " WordNet records no antonym for it — antonymy is a relation between word forms rather than concepts, so it is deliberately sparse.";

  return `${entry.w} has ${synPart}. Each sense below keeps its own list, because a synonym belongs to a meaning and not to a word: swapping one sense's substitute into another sense's sentence is how a thesaurus makes writing worse.${antPart}`;
}

function buildFaqs(entry, data) {
  const faqs = [];

  if (data.synonyms.length > 0) {
    const first = data.groups[0]?.senses[0];
    faqs.push({
      question: `What is another word for ${entry.w}?`,
      answer: first?.sense.sy?.length
        ? `It depends which ${entry.w} you mean. In the sense “${first.sense.g}”, the synonyms are ${first.sense.sy.join(", ")}. Across all ${entry.ns} ${entry.ns === 1 ? "sense" : "senses"} there are ${data.synonyms.length} distinct synonyms, and they are not interchangeable with each other — this page lists them under the sense each one belongs to.`
        : `Across its ${entry.ns} ${entry.ns === 1 ? "sense" : "senses"}, ${entry.w} has ${data.synonyms.length} distinct synonyms: ${data.synonyms.slice(0, 8).join(", ")}${data.synonyms.length > 8 ? ", and others" : ""}. Each belongs to a specific meaning, listed on this page under the sense it serves.`,
    });
  }

  faqs.push({
    question: `What is the opposite of ${entry.w}?`,
    answer:
      data.antonyms.length > 0
        ? `${data.antonyms.length === 1 ? `The recorded antonym is ${data.antonyms[0]}` : `The recorded antonyms are ${data.antonyms.join(", ")}`}. Opposites are sense-specific too: this page shows which meaning each one is the opposite of, because a word rarely has a single opposite that holds for all of its senses.`
        : `WordNet records no antonym for ${entry.w}. Antonymy in WordNet is a relation between specific word forms rather than between concepts, so it is recorded only where lexicographers judged the pairing direct. An absence here means none was recorded, not that none can be imagined.`,
  });

  if (entry.ns > 1) {
    faqs.push({
      question: `Why are the synonyms for ${entry.w} split into groups?`,
      answer: `Because ${entry.w} carries ${entry.ns} recorded senses and each has its own set of substitutes. A single flat list would put words from unrelated meanings side by side with nothing to tell them apart, which is exactly how a writer picks the wrong one. The grouping comes from WordNet's synsets, not from an editorial judgement of ours.`,
    });
  }

  if (data.sensesBare > 0) {
    faqs.push({
      question: `Does this page cover every sense of ${entry.w}?`,
      answer: `It covers the ${data.sensesShown} ${data.sensesShown === 1 ? "sense that carries" : "senses that carry"} a synonym, antonym, broader or narrower term. The remaining ${data.sensesBare} ${data.sensesBare === 1 ? "sense has" : "senses have"} none recorded, so ${data.sensesBare === 1 ? "it is" : "they are"} left off a thesaurus page and shown in full on the word page instead.`,
    });
  }

  faqs.push({
    question: `Where do the synonyms for ${entry.w} come from?`,
    answer:
      "From Princeton University's WordNet, a lexical database maintained by lexicographers since 1985. A synonym here means a word form that shares a synset with this word — a set of forms interchangeable in one recorded context. Nothing on this page is generated by a language model.",
  });

  return faqs;
}

/* ------------------------------------------------------------------ *
 * Metadata
 * ------------------------------------------------------------------ */

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const entry = await getWord(slug);

  if (!entry) {
    return createPageMetadata({
      title: `${slug.replace(/-/g, " ")} — no thesaurus entry`,
      description: "That word is not in AltF Lexicon.",
      path: `${HUB_PATH}/${slug}`,
      noindex: true,
    });
  }

  const data = shape(entry);
  const bare = data.synonyms.length === 0 && data.antonyms.length === 0;

  return createPageMetadata({
    title: bare
      ? `${entry.w} — no recorded synonyms`
      : `${entry.w} synonyms and antonyms, grouped by sense`,
    description: bare
      ? `WordNet records no synonym or antonym for ${entry.w}. Its broader and narrower terms, and all ${entry.ns} of its senses, are on this page.`
      : `${data.synonyms.length} synonyms and ${data.antonyms.length} antonyms for ${entry.w}, listed under each of its ${entry.ns} senses rather than flattened into one list.`,
    path: `${HUB_PATH}/${entry.s}`,
    keywords: [
      `${entry.w} synonyms`,
      `another word for ${entry.w}`,
      `${entry.w} antonyms`,
      `opposite of ${entry.w}`,
      `${entry.w} thesaurus`,
    ],
    // A thesaurus page with neither a synonym nor an antonym has nothing a
    // searcher for "another word for X" wants. It stays reachable and stays
    // out of the index.
    noindex: bare || !entry.ix,
  });
}

/* ------------------------------------------------------------------ *
 * Page
 * ------------------------------------------------------------------ */

export default async function ThesaurusWordPage({ params }) {
  const { slug } = await params;
  const entry = await getWord(slug);
  if (!entry) notFound();

  const data = shape(entry);
  const path = `${HUB_PATH}/${entry.s}`;
  const faqs = buildFaqs(entry, data);

  return (
    <>
      <JsonLd
        id={`altf-lexicon-thesaurus-${entry.s}`}
        data={[
          createItemListJsonLd({
            path,
            name: `Synonyms for ${entry.w}`,
            items: data.synonyms.slice(0, ITEM_LIST_CAP).map((word) => ({
              name: word,
              path: `/lexicon/word/${slugifyWord(word)}`,
            })),
          }),
          createFaqJsonLd({ path, questions: faqs }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Lexicon", path: "/lexicon" },
            { name: "Thesaurus", path: HUB_PATH },
            { name: entry.w, path },
          ]),
        ]}
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Breadcrumb
          items={[
            { name: "Lexicon", path: "/lexicon" },
            { name: "Thesaurus", path: HUB_PATH },
            { name: entry.w },
          ]}
        />

        <header className="border-b border-border pb-8">
          <span className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-primary">
            Synonyms and antonyms
          </span>

          <div className="mt-3 flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
            <div className="min-w-0">
              <h1 className="afl-headword text-[clamp(2.25rem,6vw,3.75rem)] text-foreground">
                {entry.w}
              </h1>
              {entry.pt?.length ? (
                <div className="mt-2.5 flex flex-wrap items-baseline gap-x-5 gap-y-2">
                  <SyllableLine parts={entry.pt} stress={entry.st} size="md" />
                  {entry.ip ? (
                    <span className="font-mono text-sm text-muted-foreground">/{entry.ip}/</span>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-x-6 gap-y-3">
              <PosChips parts={entry.p} />
              <CommonnessMeter band={entry.c} />
            </div>
          </div>

          <AnswerFirst>{answerSentence(entry, data)}</AnswerFirst>

          <StatStrip
            stats={[
              {
                value: data.synonyms.length.toLocaleString("en-US"),
                label: data.synonyms.length === 1 ? "Distinct synonym" : "Distinct synonyms",
              },
              {
                value: data.antonyms.length.toLocaleString("en-US"),
                label: data.antonyms.length === 1 ? "Antonym" : "Antonyms",
              },
              {
                value: `${data.sensesShown} of ${entry.ns}`,
                label: "Senses with a relation",
              },
            ]}
          />

          <p className="mt-4 max-w-[80ch] text-xs leading-relaxed text-muted-foreground">
            Counts are distinct word forms across every sense. A synonym that appears under three
            senses is counted once here and shown three times below, under each sense it belongs to.
          </p>
        </header>

        {/* ---------------- Senses ---------------- */}
        {data.groups.length > 0 ? (
          <div className="py-8">
            {data.groups.map((group) => {
              const meta = POS_BY_KEY[group.pos];
              return (
                <section key={group.pos} className="mb-10">
                  <div className="flex flex-wrap items-baseline gap-3 border-b border-border pb-3">
                    <h2 className="afl-headword text-2xl">
                      <span style={{ color: `var(${meta.cssVar})` }}>
                        {entry.w} as {indefiniteArticle(meta.label)} {meta.label}
                      </span>
                    </h2>
                    <span className="font-mono text-xs tabular-nums text-muted-foreground">
                      {group.senses.length} of {group.total}{" "}
                      {group.total === 1 ? "sense" : "senses"} carry a relation
                    </span>
                  </div>

                  <ol className="afl-divide mt-2" style={{ listStyle: "none" }}>
                    {group.senses.map(({ sense, position }) => (
                      <li key={`${group.pos}-${position}`} className="afl-sense">
                        <span className="afl-sense__n">{position}.</span>
                        <div className="min-w-0">
                          <p className="afl-sense__gloss">{sense.g}</p>
                          {sense.ex?.length ? (
                            <p className="afl-sense__example">“{sense.ex[0]}”</p>
                          ) : null}

                          <div className="mt-3 space-y-2">
                            <RelationRow
                              label="Synonyms"
                              words={sense.sy}
                              tone="var(--afl-verb)"
                              empty="No synonym recorded for this sense."
                            />
                            <RelationRow
                              label="Antonyms"
                              words={sense.an}
                              tone="var(--afl-adverb)"
                            />
                          </div>

                          {sense.br?.length || sense.nr?.length ? (
                            <div className="mt-3 rounded-md border border-border bg-surface-soft p-3">
                              <span className="font-mono text-[0.6875rem] uppercase tracking-[0.06em] text-muted-foreground">
                                Related
                              </span>
                              <div className="mt-2 space-y-2">
                                <RelationRow
                                  label="Broader"
                                  words={sense.br}
                                  tone="var(--afl-noun)"
                                />
                                <RelationRow
                                  label="Narrower"
                                  words={sense.nr}
                                  tone="var(--afl-adjective)"
                                />
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </li>
                    ))}
                  </ol>
                </section>
              );
            })}
          </div>
        ) : (
          <section className="py-10">
            <p className="max-w-[80ch] rounded-lg border border-border bg-surface-soft p-5 text-[0.9375rem] leading-relaxed text-muted-foreground">
              WordNet records no synonym, antonym, broader or narrower term for any of the{" "}
              {entry.ns} {entry.ns === 1 ? "sense" : "senses"} of {entry.w}. That is a fact about
              the database, not a gap we intend to fill by guessing: a great deal of technical,
              taxonomic and proper-noun vocabulary sits alone in its synset because English has no
              other word for it.{" "}
              <Link href={`/lexicon/word/${entry.s}`} className="text-primary hover:underline">
                The full entry
              </Link>{" "}
              still carries every definition, example and pronunciation.
            </p>
          </section>
        )}

        {data.sensesBare > 0 && data.groups.length > 0 ? (
          <p className="max-w-[80ch] rounded-lg border border-border bg-surface-soft p-4 text-sm leading-relaxed text-muted-foreground">
            {data.sensesBare} of the {entry.ns} recorded{" "}
            {data.sensesBare === 1 ? "senses carries" : "senses carry"} no synonym, antonym or
            related term, so {data.sensesBare === 1 ? "it is" : "they are"} not shown above. Every
            sense, with its definition and examples, is on{" "}
            <Link href={`/lexicon/word/${entry.s}`} className="text-primary hover:underline">
              the full entry for {entry.w}
            </Link>
            .
          </p>
        ) : null}

        {/* ---------------- FAQ ---------------- */}
        <section className="border-t border-border py-8">
          <h2 className="text-[1.375rem] font-semibold tracking-tight text-foreground">
            Questions about {entry.w}
          </h2>
          <dl className="afl-divide mt-2 max-w-[80ch]">
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

        {/* ---------------- Across ---------------- */}
        <section className="border-t border-border py-8">
          <h2 className="text-[1.375rem] font-semibold tracking-tight text-foreground">
            Other views of {entry.w}
          </h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-3" style={{ listStyle: "none" }}>
            <CrossLink
              href={`/lexicon/word/${entry.s}`}
              title={`Full entry for ${entry.w}`}
              blurb={`All ${entry.ns} ${entry.ns === 1 ? "sense" : "senses"}, with examples, usage labels, syllables and pronunciation.`}
            />
            <CrossLink
              href={`/lexicon/rhymes/${entry.s}`}
              title={`Rhymes for ${entry.w}`}
              blurb={
                entry.rk
                  ? "Words matching from the last stressed vowel onward, grouped by syllable count."
                  : "Whether this word can be rhymed at all — it is not in the pronouncing dictionary."
              }
            />
            <CrossLink
              href={HUB_PATH}
              title="Thesaurus home"
              blurb="How WordNet synsets work, and the collections built for synonym work."
            />
          </ul>
        </section>

        <p className="border-t border-border py-8 text-xs leading-relaxed text-muted-foreground">
          Synonyms, antonyms and the broader and narrower relations for {entry.w} come from
          Princeton University&rsquo;s WordNet.{" "}
          <Link href="/lexicon/sources" className="text-primary hover:underline">
            Full sources and licences
          </Link>
          .
        </p>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ *
 * Local pieces
 * ------------------------------------------------------------------ */

function RelationRow({ label, words, tone, empty }) {
  if (!words || words.length === 0) {
    if (!empty) return null;
    return (
      <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
        <span
          className="shrink-0 font-mono text-[0.6875rem] uppercase tracking-[0.06em] opacity-50"
          style={{ color: tone }}
        >
          {label}
        </span>
        <span className="text-xs text-muted-foreground">{empty}</span>
      </div>
    );
  }

  const shown = words.slice(0, CHIP_LIMIT);

  return (
    <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1.5">
      <span
        className="shrink-0 font-mono text-[0.6875rem] uppercase tracking-[0.06em]"
        style={{ color: tone }}
      >
        {label}
      </span>
      <span className="flex flex-wrap gap-1.5">
        {shown.map((word) => (
          <Link
            key={word}
            href={`${HUB_PATH}/${slugifyWord(word)}`}
            className="rounded-sm border border-border bg-surface-soft px-2 py-0.5 font-mono text-xs text-muted-foreground no-underline transition hover:border-border-strong hover:text-foreground"
          >
            {word}
          </Link>
        ))}
        {words.length > shown.length ? (
          <span className="px-1 font-mono text-xs text-muted-foreground">
            +{words.length - shown.length} more
          </span>
        ) : null}
      </span>
    </div>
  );
}

function CrossLink({ href, title, blurb }) {
  return (
    <li>
      <Link
        href={href}
        className="afl-card group flex h-full flex-col rounded-lg border border-border bg-surface p-4 no-underline"
      >
        <span className="flex items-center justify-between gap-2 text-[0.9375rem] font-semibold text-foreground group-hover:text-primary">
          {title}
          <ArrowRight className="h-3.5 w-3.5 shrink-0 opacity-50" aria-hidden="true" />
        </span>
        <span className="mt-1.5 text-[0.8125rem] leading-relaxed text-muted-foreground">
          {blurb}
        </span>
      </Link>
    </li>
  );
}
