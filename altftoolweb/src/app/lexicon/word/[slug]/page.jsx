import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Info } from "lucide-react";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createDefinedTermJsonLd,
  createFaqJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import {
  COMMONNESS,
  POS_BY_KEY,
  indefiniteArticle,
  inflectedForms,
  letterOf,
  normalizePos,
  posLabel,
  shortDefinition,
} from "@altftool/core/lexicon";
import {
  getCollectionIndex,
  getLetterIndex,
  getManifest,
  getRecordedForms,
  getRhymes,
  getWords,
  resolveWord,
} from "@altftool/core/lexicon/corpus";
import {
  AnswerFirst,
  Breadcrumb,
  CommonnessMeter,
  PosChip,
  SyllableLine,
  WordChips,
} from "../../_components/WordAtoms";

export const revalidate = 86400;
export const dynamicParams = true;

/** How a confusable pair got onto the list, said in three words. */
const CONFUSION_LABEL = {
  homophone: "sounds the same",
  "near-spelling": "looks the same",
  synonym: "means the same",
};

/*
 * Pre-render the words people actually look up; the other ~146,000 render on
 * demand and are then cached by ISR. Building the whole corpus up front would
 * add hours to CI and produce an artifact that blows the deploy size cap, for
 * pages that receive no traffic in their first month.
 */
export async function generateStaticParams() {
  const rows = await getLetterIndex("a");
  return rows
    .filter((row) => row.c >= 4)
    .slice(0, 300)
    .map((row) => ({ slug: row.s }));
}

/* ------------------------------------------------------------------ *
 * Copy helpers
 * ------------------------------------------------------------------ */

/**
 * The answer-first sentence.
 *
 * Written to be liftable verbatim by a search or answer engine: it names the
 * word, its part of speech and its primary meaning in one sentence, with no
 * preamble. Everything after it is elaboration.
 */
function answerSentence(entry) {
  const first = entry.sn[0];
  const parts = entry.p.map(posLabel);
  const list =
    parts.length === 1
      ? parts[0]
      : `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
  // The article is derived from the first part of speech, so "an adjective,
  // noun, verb and adverb" reads correctly however many there are.
  const posPhrase = `${indefiniteArticle(parts[0])} ${list}`;

  const senseCount =
    entry.ns === 1 ? "It carries one recorded sense." : `It carries ${entry.ns} recorded senses.`;

  return `${entry.w} is ${posPhrase} meaning "${first.g}". ${senseCount}`;
}

function buildFaqs(entry, rhymeCount) {
  const first = entry.sn[0];
  const faqs = [
    {
      question: `What does ${entry.w} mean?`,
      answer: `${entry.w} means "${first.g}".${
        entry.ns > 1
          ? ` That is the primary sense; the word has ${entry.ns} in total, listed in full on this page.`
          : ""
      }`,
    },
  ];

  if (entry.sy) {
    // Two shapes, because ~560 entries have a recorded count but no printable
    // split. Naming a division we do not have would be the one part of this
    // answer a reader could catch us inventing.
    const divided = entry.pt?.length
      ? `: ${entry.pt.join("-")}.${
          entry.pt.length > 1 ? ` The stress falls on "${entry.pt[entry.st]}".` : ""
        }`
      : ", though it cannot be divided in writing — the spelling has fewer vowels than the word has beats.";

    faqs.push({
      question: `How many syllables are in ${entry.w}?`,
      answer: `${entry.w} has ${entry.sy} ${entry.sy === 1 ? "syllable" : "syllables"}${divided}${
        entry.ip ? ` In IPA it is /${entry.ip}/.` : ""
      }`,
    });
  }

  const synonyms = entry.sn.flatMap((sense) => sense.sy || []);
  if (synonyms.length) {
    faqs.push({
      question: `What is another word for ${entry.w}?`,
      answer: `Close synonyms include ${synonyms.slice(0, 5).join(", ")}. Each sense on this page lists its own synonyms, because a word with several meanings rarely has one substitute that works for all of them.`,
    });
  }

  const antonyms = entry.sn.flatMap((sense) => sense.an || []);
  if (antonyms.length) {
    faqs.push({
      question: `What is the opposite of ${entry.w}?`,
      answer: `The recorded antonyms are ${antonyms.slice(0, 4).join(", ")}.`,
    });
  }

  const band = COMMONNESS.find((entry_) => entry_.band === entry.c);
  faqs.push({
    question: `Is ${entry.w} a common word?`,
    answer: `${entry.w} is banded "${band.label}" — ${band.blurb.toLowerCase()} The band comes from how often the word appears in a large corpus of everyday English, not from an editor's impression.`,
  });

  if (rhymeCount > 0) {
    faqs.push({
      question: `What rhymes with ${entry.w}?`,
      answer: `${rhymeCount} ${rhymeCount === 1 ? "word rhymes" : "words rhyme"} with ${entry.w}. Rhymes are matched on the phonemes from the last stressed vowel onward, which is the definition a reader has in their head.`,
    });
  }

  return faqs;
}

/* ------------------------------------------------------------------ *
 * Metadata
 * ------------------------------------------------------------------ */

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const resolved = await resolveWord(slug);

  if (!resolved) {
    return createPageMetadata({
      title: `${slug.replace(/-/g, " ")} — word not found`,
      description: "That word is not in AltF Lexicon. Search 147,000 entries for the one you want.",
      path: `/lexicon/word/${slug}`,
      noindex: true,
    });
  }

  const { entry } = resolved;
  const definition = shortDefinition(entry.sn[0].g, 120);
  const posBits = entry.p.map((key) => POS_BY_KEY[normalizePos(key)]?.abbr).filter(Boolean);

  return createPageMetadata({
    title: `${entry.w} — meaning, pronunciation and ${entry.ns === 1 ? "definition" : `${entry.ns} definitions`}`,
    description: `${entry.w} (${posBits.join(", ")}): ${definition} Syllables, IPA pronunciation, synonyms, antonyms and usage examples.`,
    path: `/lexicon/word/${entry.s}`,
    keywords: [
      `${entry.w} meaning`,
      `${entry.w} definition`,
      `what does ${entry.w} mean`,
      `${entry.w} synonyms`,
      `how to pronounce ${entry.w}`,
    ],
    /*
     * Two different reasons a page stays out of the index, and they need
     * different tools.
     *
     * The taxonomic tail ("genus acer") is a real entry and a bad search
     * result, so it is noindexed outright.
     *
     * A slug-collision duplicate is different: ".22 caliber" and ".22-caliber"
     * are one word WordNet records twice, and the slug cannot tell them apart
     * once the hyphen is stripped. That wants a canonical, not a noindex —
     * combining the two is contradictory guidance, and noindex can propagate
     * to the canonical target. So `ca` gets the canonical and is dropped from
     * the sitemap via `ix`, but is never noindexed.
     */
    noindex: !entry.ix && !entry.ca,
    canonical: entry.ca ? `/lexicon/word/${entry.ca}` : undefined,
  });
}

/* ------------------------------------------------------------------ *
 * Page
 * ------------------------------------------------------------------ */

export default async function WordPage({ params }) {
  const { slug } = await params;
  const resolved = await resolveWord(slug);
  if (!resolved) notFound();

  const { entry, via } = resolved;

  const [manifest, rhymeSlugs, letterRows, recordedForms, catalog] = await Promise.all([
    getManifest(),
    getRhymes(entry),
    getLetterIndex(letterOf(entry.s)),
    getRecordedForms(entry.s),
    entry.co?.length ? getCollectionIndex() : Promise.resolve([]),
  ]);

  const forms = inflectedForms(entry, recordedForms);

  /* The collections this word belongs to, stamped onto the entry at build time
     and ordered smallest-first — the narrow ones say something about the word,
     "concrete nouns" says almost nothing. */
  const collections = (entry.co || [])
    .map((slug) => catalog.find((item) => item.slug === slug))
    .filter(Boolean);

  const confusedWith = entry.cf || [];

  const rhymes = await getWords(rhymeSlugs.slice(0, 18));

  // Dictionary neighbours: the entries either side of this one in the printed
  // order. Cheap to compute, and it is how people browse a physical dictionary.
  const position = letterRows.findIndex((row) => row.s === entry.s);
  const neighbours =
    position === -1
      ? []
      : letterRows.slice(Math.max(0, position - 4), position + 5).filter((row) => row.s !== entry.s);

  const faqs = buildFaqs(entry, rhymeSlugs.length);
  const answer = answerSentence(entry);

  // Group senses by part of speech, preserving WordNet's own sense order
  // within each group — sense 1 is the one a reader most likely wants.
  const grouped = [];
  for (const sense of entry.sn) {
    const key = normalizePos(sense.p);
    let group = grouped.find((candidate) => candidate.pos === key);
    if (!group) {
      group = { pos: key, senses: [] };
      grouped.push(group);
    }
    group.senses.push(sense);
  }

  const wordLength = entry.w.replace(/[^a-zA-Z]/g, "").length;
  const firstLetter = letterOf(entry.s);

  const domains = [...new Set(entry.sn.map((sense) => sense.d).filter(Boolean))];
  const registers = [
    ...new Set(entry.sn.flatMap((sense) => [...(sense.us || []), ...(sense.rg || [])])),
  ];
  const topics = [...new Set(entry.sn.flatMap((sense) => sense.tp || []))];

  return (
    <>
      <JsonLd
        id={`altf-lexicon-${entry.s}`}
        data={[
          createDefinedTermJsonLd({
            path: `/lexicon/word/${entry.s}`,
            name: entry.w,
            description: entry.sn[0].g,
            setPath: "/lexicon",
            setName: "AltF Lexicon",
            termCode: entry.w,
            partOfSpeech: entry.p.map(posLabel).join(", "),
          }),
          createFaqJsonLd({ path: `/lexicon/word/${entry.s}`, questions: faqs }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Lexicon", path: "/lexicon" },
            { name: firstLetter.toUpperCase(), path: `/lexicon/browse/${firstLetter}` },
            { name: entry.w, path: `/lexicon/word/${entry.s}` },
          ]),
        ]}
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Breadcrumb
          items={[
            { name: "Lexicon", path: "/lexicon" },
            { name: firstLetter.toUpperCase(), path: `/lexicon/browse/${firstLetter}` },
            { name: entry.w },
          ]}
        />

        {via ? (
          <p className="mb-4 flex items-start gap-2 rounded-lg border border-border bg-surface-soft p-3 text-sm text-muted-foreground">
            <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              Showing <strong className="text-foreground">{entry.w}</strong> — the{" "}
              {via.kind === "irregular" ? "irregular" : "base"} form of{" "}
              <em>{via.from.replace(/-/g, " ")}</em>.
            </span>
          </p>
        ) : null}

        {/* ---------------- Headword block ---------------- */}
        <header className="border-b border-border pb-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="min-w-0">
              <h1 className="afl-headword text-[clamp(2.5rem,7vw,4.5rem)] text-foreground">
                {entry.w}
              </h1>

              {/* The IPA is NOT nested inside the syllable-line guard. About
                  560 entries have a real transcription but no printable split
                  — "abc" is three syllables and one written vowel — and hiding
                  their pronunciation because we cannot hyphenate them would
                  lose the more useful of the two. */}
              {entry.pt?.length || entry.ip ? (
                <div className="mt-3 flex flex-wrap items-baseline gap-x-5 gap-y-2">
                  {entry.pt?.length ? (
                    <SyllableLine parts={entry.pt} stress={entry.st} size="lg" />
                  ) : null}
                  {entry.ip ? (
                    <span className="font-mono text-[0.9375rem] text-muted-foreground">
                      /{entry.ip}/
                    </span>
                  ) : null}
                </div>
              ) : null}

              {entry.rs ? (
                <p className="mt-1.5 font-mono text-sm text-muted-foreground">
                  say it: <span className="text-foreground">{entry.rs}</span>
                </p>
              ) : null}

              {entry.pd ? (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Syllable division derived from spelling — this word is not in the pronouncing
                  dictionary, so no phonetic transcription is shown rather than a guessed one.
                </p>
              ) : null}
            </div>

            <dl className="flex shrink-0 flex-wrap gap-x-8 gap-y-3">
              <div>
                <dt className="text-xs text-muted-foreground">Part of speech</dt>
                <dd className="mt-1.5 flex flex-wrap gap-1.5">
                  {entry.p.map((pos) => (
                    <PosChip key={pos} pos={pos} />
                  ))}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">How common</dt>
                <dd className="mt-1.5">
                  <CommonnessMeter band={entry.c} />
                </dd>
              </div>
              {entry.sy ? (
                <div>
                  <dt className="text-xs text-muted-foreground">Syllables</dt>
                  <dd className="mt-1 font-mono text-lg font-semibold tabular-nums text-foreground">
                    {entry.sy}
                  </dd>
                </div>
              ) : null}
              <div>
                <dt className="text-xs text-muted-foreground">Letters</dt>
                <dd className="mt-1 font-mono text-lg font-semibold tabular-nums text-foreground">
                  {wordLength}
                </dd>
              </div>
            </dl>
          </div>

          <AnswerFirst>{answer}</AnswerFirst>
        </header>

        <div className="grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-14">
          {/* ---------------- Senses ---------------- */}
          <main>
            {grouped.map((group) => {
              const meta = POS_BY_KEY[group.pos];
              return (
                <section key={group.pos} className="mb-10">
                  <div className="flex flex-wrap items-baseline gap-3 border-b border-border pb-3">
                    <h2 className="afl-headword text-2xl text-foreground">
                      <span style={{ color: `var(${meta.cssVar})` }}>{meta.label}</span>
                    </h2>
                    <span className="font-mono text-xs text-muted-foreground">
                      {group.senses.length} {group.senses.length === 1 ? "sense" : "senses"}
                    </span>
                    <span className="text-xs text-muted-foreground">{meta.blurb}</span>
                  </div>

                  <ol className="afl-divide mt-2" style={{ listStyle: "none" }}>
                    {group.senses.map((sense, index) => (
                      <li key={`${group.pos}-${index}`} className="afl-sense">
                        <span className="afl-sense__n">{index + 1}.</span>
                        <div className="min-w-0">
                          <p className="afl-sense__gloss">{sense.g}</p>

                          {sense.ex?.map((example) => (
                            <p key={example} className="afl-sense__example">
                              “{example}”
                            </p>
                          ))}

                          <div className="mt-3 space-y-2">
                            {sense.sy?.length ? (
                              <Relation label="Synonyms" words={sense.sy} tone="var(--afl-verb)" />
                            ) : null}
                            {sense.an?.length ? (
                              <Relation label="Antonyms" words={sense.an} tone="var(--afl-adverb)" />
                            ) : null}
                            {sense.br?.length ? (
                              <Relation label="Broader" words={sense.br} tone="var(--afl-noun)" />
                            ) : null}
                            {sense.nr?.length ? (
                              <Relation
                                label="Narrower"
                                words={sense.nr}
                                tone="var(--afl-adjective)"
                              />
                            ) : null}
                            {sense.si?.length ? (
                              <Relation label="Similar" words={sense.si} tone="var(--afl-phrase)" />
                            ) : null}
                            {sense.pt?.length ? (
                              <Relation label="Part of" words={sense.pt} tone="var(--afl-phrase)" />
                            ) : null}
                            {sense.pr?.length ? (
                              <Relation label="Parts" words={sense.pr} tone="var(--afl-phrase)" />
                            ) : null}
                          </div>

                          {(sense.us?.length || sense.rg?.length || sense.tp?.length) ? (
                            <p className="mt-2.5 font-mono text-[0.6875rem] uppercase tracking-[0.06em] text-muted-foreground">
                              {[...(sense.us || []), ...(sense.rg || []), ...(sense.tp || [])].join(
                                " · ",
                              )}
                            </p>
                          ) : null}
                        </div>
                      </li>
                    ))}
                  </ol>
                </section>
              );
            })}

            {/* ---------------- Forms ---------------- */}
            {forms.length > 0 ? (
              <section className="mb-10">
                <h2 className="border-b border-border pb-3 text-xl font-semibold tracking-[-0.02em] text-foreground">
                  Other forms of {entry.w}
                </h2>
                <dl className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                  {forms.map((form) => (
                    <div key={`${form.label}-${form.form}`} className="flex flex-wrap items-baseline gap-x-2.5">
                      <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.06em] text-muted-foreground">
                        {form.label}
                      </dt>
                      <dd className="afl-headword text-[1.0625rem] text-foreground">
                        {form.form}
                        {form.note ? (
                          <span className="ml-1.5 font-sans text-xs text-muted-foreground">
                            ({form.note})
                          </span>
                        ) : null}
                        {form.certainty === "regular" ? (
                          <span
                            className="ml-1 align-super font-sans text-[0.6875rem] text-muted-foreground"
                            title="Formed by rule, not recorded in the source data"
                          >
                            ·
                          </span>
                        ) : null}
                      </dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                  Forms marked <span className="align-super">·</span> are formed by the regular rule
                  rather than recorded in the source data. English keeps a few hundred irregulars
                  and the rest follow the pattern, so the rule is right far more often than not —
                  but it is a rule, and the mark says so.
                </p>
              </section>
            ) : null}

            {/* ---------------- FAQ ---------------- */}
            <section className="mb-10">
              <h2 className="border-b border-border pb-3 text-xl font-semibold tracking-[-0.02em] text-foreground">
                Questions about {entry.w}
              </h2>
              <dl className="afl-divide mt-2">
                {faqs.map((faq) => (
                  <div key={faq.question} className="py-4">
                    <dt className="text-[0.9375rem] font-semibold text-foreground">
                      {faq.question}
                    </dt>
                    <dd className="mt-1.5 text-[0.9375rem] leading-relaxed text-muted-foreground">
                      {faq.answer}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>

            <p className="rounded-lg border border-border bg-surface-soft p-4 text-xs leading-relaxed text-muted-foreground">
              Definitions, synonyms and semantic relations for {entry.w} come from Princeton
              University&rsquo;s WordNet.{" "}
              {entry.ip
                ? "The pronunciation comes from the CMU Pronouncing Dictionary. "
                : ""}
              Commonness is measured against a corpus of everyday English.{" "}
              <Link href="/lexicon/sources" className="text-primary hover:underline">
                Full sources and licences
              </Link>
              .
            </p>
          </main>

          {/* ---------------- Rail ---------------- */}
          <aside className="space-y-8">
            {rhymes.length > 0 ? (
              <RailSection
                title={`Rhymes with ${entry.w}`}
                action={{ label: "All rhymes", href: `/lexicon/rhymes/${entry.s}` }}
              >
                <div className="flex flex-wrap gap-1.5">
                  {rhymes.map((rhyme) => (
                    <Link
                      key={rhyme.s}
                      href={`/lexicon/word/${rhyme.s}`}
                      className="rounded-sm border border-border bg-surface-soft px-2 py-0.5 font-mono text-xs text-muted-foreground no-underline transition hover:border-border-strong hover:text-foreground"
                    >
                      {rhyme.w}
                    </Link>
                  ))}
                </div>
              </RailSection>
            ) : null}

            {confusedWith.length > 0 ? (
              <RailSection title={`Often confused with ${entry.w}`}>
                <ul className="space-y-2" style={{ listStyle: "none" }}>
                  {confusedWith.map(([other, kind]) => (
                    <li key={other}>
                      <Link
                        href={`/lexicon/compare/${entry.s < other ? entry.s : other}-vs-${
                          entry.s < other ? other : entry.s
                        }`}
                        className="flex items-baseline justify-between gap-2 text-sm no-underline"
                      >
                        <span className="afl-headword text-[0.9375rem] text-foreground hover:text-primary">
                          {other.replace(/-/g, " ")}
                        </span>
                        <span className="shrink-0 font-mono text-[0.6875rem] text-muted-foreground">
                          {CONFUSION_LABEL[kind] || kind}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </RailSection>
            ) : null}

            {collections.length > 0 ? (
              <RailSection
                title="Appears in"
                action={{ label: "All collections", href: "/lexicon/collections" }}
              >
                <ul className="space-y-2" style={{ listStyle: "none" }}>
                  {collections.map((collection) => (
                    <li key={collection.slug}>
                      <Link
                        href={`/lexicon/collections/${collection.slug}`}
                        className="flex items-baseline justify-between gap-2 text-sm text-muted-foreground no-underline hover:text-primary"
                      >
                        <span className="min-w-0 truncate text-foreground">{collection.name}</span>
                        <span className="shrink-0 font-mono text-[0.6875rem] tabular-nums">
                          {collection.count.toLocaleString("en-US")}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </RailSection>
            ) : null}

            {neighbours.length > 0 ? (
              <RailSection title="Nearby in the dictionary">
                <ul className="space-y-1.5" style={{ listStyle: "none" }}>
                  {neighbours.map((row) => (
                    <li key={row.s}>
                      <Link
                        href={`/lexicon/word/${row.s}`}
                        className="flex items-baseline gap-2 text-sm text-muted-foreground no-underline hover:text-primary"
                      >
                        <span className="afl-headword shrink-0 whitespace-nowrap text-[0.9375rem] text-foreground">
                          {row.w}
                        </span>
                        <span className="min-w-0 truncate text-xs">{row.g}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </RailSection>
            ) : null}

            {domains.length > 0 || topics.length > 0 || registers.length > 0 ? (
              <RailSection title="Where this word lives">
                <dl className="space-y-3 text-sm">
                  {domains.length > 0 ? (
                    <div>
                      <dt className="text-xs text-muted-foreground">Semantic field</dt>
                      <dd className="mt-1 font-mono text-[0.8125rem] text-foreground">
                        {domains.join(", ")}
                      </dd>
                    </div>
                  ) : null}
                  {topics.length > 0 ? (
                    <div>
                      <dt className="text-xs text-muted-foreground">Subject</dt>
                      <dd className="mt-1 text-[0.8125rem] text-foreground">{topics.join(", ")}</dd>
                    </div>
                  ) : null}
                  {registers.length > 0 ? (
                    <div>
                      <dt className="text-xs text-muted-foreground">Register</dt>
                      <dd className="mt-1 text-[0.8125rem] text-foreground">
                        {registers.join(", ")}
                      </dd>
                    </div>
                  ) : null}
                </dl>
              </RailSection>
            ) : null}

            <RailSection title="Explore from here">
              <ul className="space-y-2 text-sm" style={{ listStyle: "none" }}>
                <RailLink
                  href={`/lexicon/words/starting-with-${firstLetter}`}
                  label={`Words starting with ${firstLetter.toUpperCase()}`}
                />
                {wordLength >= 2 && wordLength <= 15 ? (
                  <RailLink
                    href={`/lexicon/words/${wordLength}-letter-words`}
                    label={`${wordLength}-letter words`}
                  />
                ) : null}
                {wordLength >= 2 && wordLength <= 12 ? (
                  <RailLink
                    href={`/lexicon/words/${wordLength}-letter-words-starting-with-${firstLetter}`}
                    label={`${wordLength}-letter words starting with ${firstLetter.toUpperCase()}`}
                  />
                ) : null}
                <RailLink href={`/lexicon/browse/${firstLetter}`} label={`Browse ${firstLetter.toUpperCase()}`} />
                <RailLink href="/lexicon/collections" label="All word collections" />
              </ul>
            </RailSection>

            <div className="rounded-lg border border-border bg-surface p-4">
              <p className="text-sm text-foreground">
                <strong className="font-semibold">
                  {manifest.total.toLocaleString("en-US")} entries
                </strong>{" "}
                in AltF Lexicon, every one with its syllables marked.
              </p>
              <Link
                href="/lexicon"
                className="mt-3 inline-flex items-center gap-1.5 text-sm text-primary no-underline hover:underline"
              >
                Look up another word <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ *
 * Local pieces
 * ------------------------------------------------------------------ */

function Relation({ label, words, tone }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
      <span
        className="shrink-0 font-mono text-[0.6875rem] uppercase tracking-[0.06em]"
        style={{ color: tone }}
      >
        {label}
      </span>
      <WordChips words={words} limit={14} />
    </div>
  );
}

function RailSection({ title, action, children }) {
  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between gap-3 border-b border-border pb-2">
        <h2 className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-primary">
          {title}
        </h2>
        {action ? (
          <Link href={action.href} className="text-xs text-muted-foreground no-underline hover:text-primary">
            {action.label}
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function RailLink({ href, label }) {
  return (
    <li>
      <Link
        href={href}
        className="flex items-center justify-between gap-2 text-muted-foreground no-underline transition hover:text-primary"
      >
        <span>{label}</span>
        <ArrowRight className="h-3.5 w-3.5 shrink-0 opacity-50" aria-hidden="true" />
      </Link>
    </li>
  );
}
