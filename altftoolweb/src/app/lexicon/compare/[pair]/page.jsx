import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createFaqJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { COMMONNESS, POS_BY_KEY, normalizePos, posLabel, slugifyWord } from "@altftool/core/lexicon";
import { getPairs, getWord } from "@altftool/core/lexicon/corpus";
import {
  AnswerFirst,
  Breadcrumb,
  CommonnessMeter,
  PosChip,
  SyllableLine,
} from "../../_components/WordAtoms";

export const revalidate = 86400;
export const dynamicParams = true;

/*
 * "X vs Y" is the most durable editorial shape in the category — dictionary.com
 * publishes nearly two hundred of them by hand. Ours are computed, in three
 * kinds, each answering a different question:
 *
 *   homophone      they sound identical, so which spelling do I want?
 *   near-spelling  they look almost identical, so which one did I mean?
 *   synonym        they mean nearly the same, so which one should I use?
 *
 * The route accepts any two words in the corpus, not only the stored pairs, so
 * a reader can compare anything — but only the stored pairs are pre-rendered
 * and offered in the sitemap.
 */

const PAIR_KINDS = {
  homophone: {
    label: "Sound the same",
    lead: (a, b) =>
      `${a.w} and ${b.w} are homophones: they are pronounced identically and spelled differently, which is why they are so often swapped.`,
  },
  "near-spelling": {
    label: "Look the same",
    lead: (a, b) =>
      `${a.w} and ${b.w} differ by a single letter, buried far enough into the word to be easy to miss.`,
  },
  synonym: {
    label: "Mean the same",
    lead: (a, b) =>
      `${a.w} and ${b.w} share a recorded sense, so the question is not what they mean but which one fits.`,
  },
};

const parsePair = (slug) => {
  const match = String(slug).match(/^(.+?)-vs-(.+)$/);
  if (!match) return null;
  const a = slugifyWord(match[1]);
  const b = slugifyWord(match[2]);
  return a && b && a !== b ? { a, b } : null;
};

export async function generateStaticParams() {
  const pairs = await getPairs();
  // Homophones first — they are the highest-intent of the three kinds and the
  // ones most likely to be hit cold.
  return pairs
    .filter((pair) => pair.kind === "homophone")
    .slice(0, 120)
    .map((pair) => ({ pair: `${pair.a}-vs-${pair.b}` }));
}

async function load(slug) {
  const parsed = parsePair(slug);
  if (!parsed) return null;

  const [a, b, pairs] = await Promise.all([getWord(parsed.a), getWord(parsed.b), getPairs()]);
  if (!a || !b) return null;

  const stored = pairs.find(
    (pair) =>
      (pair.a === parsed.a && pair.b === parsed.b) || (pair.a === parsed.b && pair.b === parsed.a),
  );

  return { a, b, kind: stored?.kind ?? null, stored: Boolean(stored) };
}

export async function generateMetadata({ params }) {
  const { pair } = await params;
  const loaded = await load(pair);

  if (!loaded) {
    return createPageMetadata({
      title: "Comparison not found",
      description: "Compare any two words in AltF Lexicon side by side.",
      path: `/lexicon/compare/${pair}`,
      noindex: true,
    });
  }

  const { a, b, stored } = loaded;
  return createPageMetadata({
    title: `${a.w} vs ${b.w} — what is the difference?`,
    description: `${a.w} means "${a.sn[0].g}". ${b.w} means "${b.sn[0].g}". Side-by-side pronunciation, part of speech, how common each is, and which to use.`,
    path: `/lexicon/compare/${a.s}-vs-${b.s}`,
    keywords: [
      `${a.w} vs ${b.w}`,
      `difference between ${a.w} and ${b.w}`,
      `${a.w} or ${b.w}`,
      `${a.w} meaning`,
      `${b.w} meaning`,
    ],
    // An arbitrary reader-constructed comparison is a real page but not one we
    // ask search engines to crawl — only the computed pairs are offered.
    noindex: !stored,
  });
}

export default async function ComparePage({ params }) {
  const { pair } = await params;
  const loaded = await load(pair);
  if (!loaded) notFound();

  const { a, b, kind } = loaded;
  const meta = kind ? PAIR_KINDS[kind] : null;

  const bandOf = (entry) => COMMONNESS.find((band) => band.band === entry.c);
  const commoner = a.c === b.c ? null : a.c > b.c ? a : b;
  const rarer = commoner ? (commoner === a ? b : a) : null;

  const sharedPos = a.p.filter((pos) => b.p.includes(pos));
  const sameSound = Boolean(a.ip && b.ip && a.ip === b.ip);

  const faqs = [
    {
      question: `What is the difference between ${a.w} and ${b.w}?`,
      answer: `${a.w} means "${a.sn[0].g}". ${b.w} means "${b.sn[0].g}".${
        sameSound
          ? ` They are pronounced identically — /${a.ip}/ — so only the spelling and the meaning separate them.`
          : ""
      }`,
    },
    {
      question: `Which is more common, ${a.w} or ${b.w}?`,
      answer: commoner
        ? `${commoner.w} is the more common of the two — banded "${bandOf(commoner).label}" against "${bandOf(rarer).label}" for ${rarer.w}. Commonness is measured against a large corpus of everyday English, not judged.`
        : `Neither is markedly more common — both sit in the "${bandOf(a).label}" band.`,
    },
  ];

  if (sameSound) {
    faqs.push({
      question: `Are ${a.w} and ${b.w} pronounced the same?`,
      answer: `Yes. Both are /${a.ip}/${a.rs ? `, said ${a.rs}` : ""}. Words that sound alike and are spelled differently are homophones, and they are the commonest source of written mix-ups in English.`,
    });
  }

  if (sharedPos.length > 0) {
    faqs.push({
      question: `Can ${a.w} and ${b.w} be used in the same place in a sentence?`,
      answer: `Both work as ${sharedPos.map(posLabel).join(" and ")}${sharedPos.length > 1 ? "s" : "s"}, so they are grammatically interchangeable. That is exactly what makes the meaning difference worth checking.`,
    });
  }

  return (
    <>
      <JsonLd
        id={`altf-lexicon-compare-${a.s}-${b.s}`}
        data={[
          createFaqJsonLd({ path: `/lexicon/compare/${a.s}-vs-${b.s}`, questions: faqs }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Lexicon", path: "/lexicon" },
            { name: "Compare", path: "/lexicon/compare" },
            { name: `${a.w} vs ${b.w}`, path: `/lexicon/compare/${a.s}-vs-${b.s}` },
          ]),
        ]}
      />

      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <Breadcrumb
          items={[
            { name: "Lexicon", path: "/lexicon" },
            { name: "Compare", path: "/lexicon/compare" },
            { name: `${a.w} vs ${b.w}` },
          ]}
        />

        <header className="border-b border-border pb-8">
          {meta ? (
            <span className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-primary">
              {meta.label}
            </span>
          ) : null}
          <h1 className="mt-3 text-[clamp(1.875rem,4.4vw,3rem)] font-semibold leading-tight tracking-[-0.03em] text-foreground">
            <span className="afl-headword">{a.w}</span>{" "}
            <span className="text-muted-foreground">vs</span>{" "}
            <span className="afl-headword">{b.w}</span>
          </h1>

          <AnswerFirst>
            {meta ? `${meta.lead(a, b)} ` : ""}
            {/* Explicit {" "} either side of the closing tag: JSX collapses the
                whitespace at a line break, which renders "meetmeans". */}
            <strong>{a.w}</strong>
            {" means "}
            &ldquo;{a.sn[0].g}&rdquo;.{" "}
            <strong>{b.w}</strong>
            {" means "}
            &ldquo;{b.sn[0].g}&rdquo;.
            {commoner ? ` ${commoner.w} is the more common of the two in everyday English.` : ""}
          </AnswerFirst>
        </header>

        {/* ---------------- Side by side ---------------- */}
        <section className="grid gap-6 py-10 sm:grid-cols-2">
          {[a, b].map((entry) => (
            <article
              key={entry.s}
              className="flex flex-col rounded-lg border border-border bg-surface p-5"
            >
              <Link
                href={`/lexicon/word/${entry.s}`}
                className="afl-headword text-[clamp(1.5rem,3vw,2rem)] text-foreground no-underline hover:text-primary"
              >
                {entry.w}
              </Link>

              {entry.pt?.length ? (
                <div className="mt-2">
                  <SyllableLine parts={entry.pt} stress={entry.st} size="sm" />
                  {entry.ip ? (
                    <p className="mt-1 font-mono text-xs text-muted-foreground">/{entry.ip}/</p>
                  ) : null}
                </div>
              ) : null}

              <div className="mt-3 flex flex-wrap gap-1.5">
                {entry.p.map((pos) => (
                  <PosChip key={pos} pos={pos} />
                ))}
              </div>

              <div className="mt-3">
                <CommonnessMeter band={entry.c} />
              </div>

              <ol className="afl-divide mt-4 flex-1" style={{ listStyle: "none" }}>
                {entry.sn.slice(0, 3).map((sense, index) => (
                  <li key={index} className="py-2.5">
                    <p className="flex gap-2 text-[0.9375rem] leading-relaxed text-foreground">
                      <span className="shrink-0 font-mono text-xs text-muted-foreground">
                        {index + 1}.
                      </span>
                      <span>
                        <span
                          className="mr-1.5 font-mono text-[0.6875rem] italic"
                          style={{ color: `var(${POS_BY_KEY[normalizePos(sense.p)].cssVar})` }}
                        >
                          {POS_BY_KEY[normalizePos(sense.p)].abbr}
                        </span>
                        {sense.g}
                      </span>
                    </p>
                    {sense.ex?.[0] ? (
                      <p className="afl-sense__example ml-6 text-[0.875rem]">
                        &ldquo;{sense.ex[0]}&rdquo;
                      </p>
                    ) : null}
                  </li>
                ))}
              </ol>

              {entry.ns > 3 ? (
                <Link
                  href={`/lexicon/word/${entry.s}`}
                  className="mt-3 text-sm text-primary no-underline hover:underline"
                >
                  All {entry.ns} senses of {entry.w} →
                </Link>
              ) : null}
            </article>
          ))}
        </section>

        {/* ---------------- Table ---------------- */}
        <section className="border-t border-border py-10">
          <h2 className="text-xl font-semibold tracking-[-0.02em] text-foreground">
            Side by side
          </h2>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-3 pr-4 font-mono text-xs font-medium uppercase tracking-[0.06em] text-muted-foreground">
                    &nbsp;
                  </th>
                  <th className="afl-headword py-3 pr-4 text-base text-foreground">{a.w}</th>
                  <th className="afl-headword py-3 text-base text-foreground">{b.w}</th>
                </tr>
              </thead>
              <tbody>
                <Row label="Pronunciation" a={a.ip ? `/${a.ip}/` : "not recorded"} b={b.ip ? `/${b.ip}/` : "not recorded"} />
                <Row label="Said" a={a.rs || "—"} b={b.rs || "—"} />
                <Row label="Syllables" a={a.sy ?? "—"} b={b.sy ?? "—"} />
                <Row label="Letters" a={a.w.replace(/[^a-zA-Z]/g, "").length} b={b.w.replace(/[^a-zA-Z]/g, "").length} />
                <Row label="Parts of speech" a={a.p.map(posLabel).join(", ")} b={b.p.map(posLabel).join(", ")} />
                <Row label="Senses" a={a.ns} b={b.ns} />
                <Row label="How common" a={bandOf(a).label} b={bandOf(b).label} />
                <Row
                  label="Synonyms"
                  a={(a.sn[0].sy || []).slice(0, 3).join(", ") || "none recorded"}
                  b={(b.sn[0].sy || []).slice(0, 3).join(", ") || "none recorded"}
                />
              </tbody>
            </table>
          </div>
        </section>

        {/* ---------------- FAQ ---------------- */}
        <section className="border-t border-border py-10">
          <h2 className="text-xl font-semibold tracking-[-0.02em] text-foreground">
            {a.w} or {b.w}?
          </h2>
          <dl className="afl-divide mt-2">
            {faqs.map((faq) => (
              <div key={faq.question} className="py-4">
                <dt className="text-[0.9375rem] font-semibold text-foreground">{faq.question}</dt>
                <dd className="mt-1.5 text-[0.9375rem] leading-relaxed text-muted-foreground">
                  {faq.answer}
                </dd>
              </div>
            ))}
          </dl>

          <p className="mt-8 text-sm text-muted-foreground">
            <Link href={`/lexicon/word/${a.s}`} className="text-primary hover:underline">
              Full entry for {a.w}
            </Link>
            {" · "}
            <Link href={`/lexicon/word/${b.s}`} className="text-primary hover:underline">
              Full entry for {b.w}
            </Link>
            {" · "}
            <Link href="/lexicon/compare" className="text-primary hover:underline">
              More comparisons
            </Link>
          </p>
        </section>
      </div>
    </>
  );
}

function Row({ label, a, b }) {
  return (
    <tr className="border-b border-border align-top">
      <td className="py-3 pr-4 font-mono text-xs uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </td>
      <td className="py-3 pr-4 text-foreground">{a}</td>
      <td className="py-3 text-foreground">{b}</td>
    </tr>
  );
}
