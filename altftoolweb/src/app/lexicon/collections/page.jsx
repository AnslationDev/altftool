import Link from "next/link";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { COLLECTION_GROUPS } from "@altftool/core/lexicon/collections";
import { getCollectionIndex, getManifest } from "@altftool/core/lexicon/corpus";
import { AnswerFirst, Breadcrumb, StatStrip } from "../_components/WordAtoms";

export const revalidate = 86400;

const PATH = "/lexicon/collections";

const description =
  "Every word collection in AltF Lexicon, grouped by subject, register, shape, sound and learning. Each one is a rule applied to the corpus, and each page states the rule it was built from.";

export async function generateMetadata() {
  const index = await getCollectionIndex();

  return createPageMetadata({
    title: `${index.length} word collections — subject, register, shape and sound`,
    description,
    path: PATH,
    keywords: [
      "word collections",
      "word lists by category",
      "words by subject",
      "types of words in English",
      "word categories",
    ],
  });
}

export default async function CollectionsIndexPage() {
  const [index, manifest] = await Promise.all([getCollectionIndex(), getManifest()]);

  // The index arrives sorted by size. Filtering per group preserves that, so
  // the biggest and most useful list in each group is the first thing read.
  const grouped = COLLECTION_GROUPS.map((group) => ({
    ...group,
    items: index.filter((collection) => collection.group === group.id),
  })).filter((group) => group.items.length > 0);

  const fromLabels = index.filter((collection) => collection.derivedFrom).length;
  const largest = index[0];

  return (
    <>
      <JsonLd
        id="altf-lexicon-collections"
        data={[
          createCollectionPageJsonLd({
            path: PATH,
            name: "AltF Lexicon word collections",
            description,
          }),
          createItemListJsonLd({
            path: PATH,
            name: "Word collections",
            items: index.map((collection) => ({
              name: collection.name,
              path: `${PATH}/${collection.slug}`,
            })),
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Lexicon", path: "/lexicon" },
            { name: "Collections", path: PATH },
          ]),
        ]}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Breadcrumb items={[{ name: "Lexicon", path: "/lexicon" }, { name: "Collections" }]} />

        <header className="border-b border-border pb-8">
          <span className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-primary">
            Collections
          </span>
          <h1 className="mt-3 text-[clamp(1.875rem,3.6vw,2.75rem)] font-semibold leading-tight tracking-[-0.03em] text-foreground">
            {index.length} ways to slice the dictionary
          </h1>

          <AnswerFirst>
            A collection is a named slice of AltF Lexicon defined by a rule rather than by a
            hand-typed word list. {index.length} of them cover the {manifest.total.toLocaleString("en-US")}{" "}
            entries in the corpus. Most membership comes straight from WordNet&rsquo;s own
            lexicographer files and domain labels — the classification a lexicographer applied to
            each sense. The rest comes from properties of the word you can check yourself: how many
            letters it has, how many syllables, where the stress falls, how many meanings it
            carries, how often it appears in everyday English.
          </AnswerFirst>

          <StatStrip
            stats={[
              { value: index.length.toLocaleString("en-US"), label: "Collections" },
              { value: String(grouped.length), label: "Groups" },
              { value: fromLabels.toLocaleString("en-US"), label: "Built from WordNet labels" },
              {
                value: largest.count.toLocaleString("en-US"),
                label: `Largest list (${largest.name.toLowerCase()})`,
              },
            ]}
          />
        </header>

        {/* ---------------- How a collection is built ---------------- */}
        <section className="border-b border-border py-8">
          <h2 className="text-[1.375rem] font-semibold tracking-tight text-foreground">
            How these lists are built
          </h2>
          <p className="mt-3 max-w-[68ch] leading-relaxed text-muted-foreground">
            Nothing on this page was typed out by hand. Every collection is a predicate run over the
            whole corpus, in three descending orders of authority, and every collection page repeats
            its own rule at the top so you can judge the list before you trust it.
          </p>

          <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" style={{ listStyle: "none" }}>
            <BuildRule
              n="1"
              title="WordNet lexicographer files"
              body="Every WordNet sense is filed by a lexicographer under one of 45 subject files — noun.animal, verb.motion, noun.food. If a sense is filed under animals, the word is an animal. That is a classification decision made by a person reading the sense, not a keyword match against the definition text."
            />
            <BuildRule
              n="2"
              title="WordNet domain labels"
              body={`Senses also carry topic, region and usage pointers — the field a term belongs to, where it is spoken, how formal it is. Every label with at least 25 member entries becomes its own collection, which is where "Indian English", "slang" and "law vocabulary" come from. ${fromLabels.toLocaleString(
                "en-US",
              )} of the ${index.length} collections here are generated this way.`}
            />
            <BuildRule
              n="3"
              title="Properties of the word itself"
              body="Length, repeated letters, missing vowels, syllable count, stress position, sense count, frequency band. These are objective and checkable: you can count the letters in a palindrome and see whether we were right."
            />
          </ol>

          <p className="mt-6 max-w-[68ch] text-sm leading-relaxed text-muted-foreground">
            Each list is ranked by how common its words are, so the vocabulary you half know sits at
            the top and the specialist tail sits below it. Lists store up to 600 words on the page;
            where a collection is larger than that, the page says so and gives the true total.
          </p>
        </section>

        {/* ---------------- The collections ---------------- */}
        {grouped.map((group) => (
          <section key={group.id} className="border-b border-border py-8 last:border-b-0">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h2 className="text-[1.375rem] font-semibold tracking-tight text-foreground">
                {group.label}
              </h2>
              <span className="font-mono text-xs tabular-nums text-muted-foreground">
                {group.items.length} collections
              </span>
            </div>
            <p className="mt-2 max-w-[68ch] text-[0.9375rem] leading-relaxed text-muted-foreground">
              {group.blurb}
            </p>

            <ul
              className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
              style={{ listStyle: "none" }}
            >
              {group.items.map((collection) => (
                <li key={collection.slug}>
                  <Link
                    href={`${PATH}/${collection.slug}`}
                    className="afl-card group flex h-full flex-col rounded-lg border border-border bg-surface p-4 no-underline"
                  >
                    <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <span className="text-[0.9375rem] font-semibold text-foreground group-hover:text-primary">
                        {collection.name}
                      </span>
                      <span className="font-mono text-xs tabular-nums text-muted-foreground">
                        {collection.count.toLocaleString("en-US")}
                      </span>
                    </span>
                    <span className="mt-1.5 line-clamp-2 text-[0.8125rem] leading-relaxed text-muted-foreground">
                      {collection.description}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <p className="border-t border-border py-8 text-xs leading-relaxed text-muted-foreground">
          Subject classification, domain labels and semantic relations come from WordNet. Syllables
          and stress come from the CMU Pronouncing Dictionary where a word is recorded in it.
          Commonness comes from a frequency list built on everyday English.{" "}
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

function BuildRule({ n, title, body }) {
  return (
    <li className="rounded-lg border border-border bg-surface-soft p-4">
      <span className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-primary">
        Rule {n}
      </span>
      <h3 className="mt-2 text-[0.9375rem] font-semibold text-foreground">{title}</h3>
      <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-muted-foreground">{body}</p>
    </li>
  );
}
