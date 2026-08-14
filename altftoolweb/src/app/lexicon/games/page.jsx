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
import { getManifest } from "@altftool/core/lexicon/corpus";

import { AnswerFirst, Breadcrumb, StatStrip } from "../_components/WordAtoms";
import { GameFaq, SourceNote } from "./_shared/GamePageParts";
import { GAMES } from "./_shared/catalog";

export const revalidate = 86400;

const PATH = "/lexicon/games";

const gamePath = (slug) => `${PATH}/${slug}`;

/*
 * "30 rounds" -> 30.
 *
 * The catalog carries the phrase because the phrase is what every card prints;
 * the total below is the one place a number is wanted instead, and reading it
 * back out of the phrase keeps the hub from being able to disagree with the
 * game pages about how long a game is.
 */
const roundCount = (game) => Number.parseInt(game.rounds, 10) || 0;

const TOTAL_ROUNDS = GAMES.reduce((sum, game) => sum + roundCount(game), 0);

const description =
  "Four free word games built on a 147,478-entry dictionary: word scramble, guess the definition, syllable split and odd one out. No account, no timer, and every answer opens its full entry.";

const FAQS = [
  {
    question: "What makes these different from other word games?",
    answer:
      "Every puzzle is drawn from the dictionary underneath them rather than from a word list typed out by hand. The scramble's clue is the answer's own WordNet definition, the definition quiz's wrong answers are real definitions of other entries, the syllable game's counts come from the CMU Pronouncing Dictionary, and the odd-one-out groupings are WordNet's own subject files. That means every answer is checkable, and every answer opens the full dictionary entry it came from.",
  },
  {
    question: "Do I get the same puzzles as everyone else?",
    answer: `Yes, and that is deliberate. Nothing here calls a random number generator: every round is selected by hashing the word's slug, so a build today and the same build regenerated tomorrow contain the same ${TOTAL_ROUNDS} rounds in the same order. Restarting a game reshuffles the order in your browser; it never changes which words are in it.`,
  },
  {
    question: "Do the games need an account, a sign-in or a payment?",
    answer:
      "None of the three. Every round is inside the page when it loads, so the game runs entirely in your browser, keeps working with the network switched off, and sends nothing about how you played anywhere.",
  },
  {
    question: "Which game should I start with?",
    answer:
      "Word scramble if you want the familiar one, guess the definition if you want a vocabulary test with real teeth, syllable split if you want to learn something about how English is said rather than spelled, and odd one out if you want the hardest of the four — its groupings come from a lexicographer's classification, so intuition gets you most of the way and not all of it.",
  },
  {
    question: "Are these suitable for a classroom?",
    answer:
      "Yes. There is no timer, no lives, no advertising and no sign-in, the reveal after every round explains the answer rather than only marking it, and each game states the rule its rounds were selected by so a teacher can say where the words came from.",
  },
];

export async function generateMetadata() {
  return createPageMetadata({
    title: `Word games — ${GAMES.length} free games built on a real dictionary`,
    description,
    path: PATH,
    keywords: [
      "word games",
      "free word games",
      "vocabulary games",
      "word scramble",
      "syllable game",
      "odd one out word game",
      "dictionary games",
    ],
  });
}

export default async function GamesHubPage() {
  const manifest = await getManifest();

  const answer = `AltF Lexicon has ${GAMES.length} word games — ${GAMES.map((game) => game.name.toLowerCase()).join(", ")} — and ${TOTAL_ROUNDS} rounds between them. Every puzzle is drawn from the same ${manifest.total.toLocaleString("en-US")}-entry dictionary by a deterministic hash rather than a random draw, so every player gets the same rounds on every visit, and every answer links to the full entry it came from. No account, no timer, no cost.`;

  return (
    <>
      <JsonLd
        id="altf-lexicon-games-hub"
        data={[
          createCollectionPageJsonLd({
            path: PATH,
            name: "AltF Lexicon word games",
            description:
              "Word scramble, guess the definition, syllable split and odd one out — four word games whose puzzles are drawn from a 147,478-entry dictionary by a reproducible hash.",
          }),
          createItemListJsonLd({
            path: PATH,
            name: "AltF Lexicon word games",
            items: GAMES.map((game) => ({ name: game.name, path: gamePath(game.slug) })),
          }),
          createFaqJsonLd({ path: PATH, questions: FAQS }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Lexicon", path: "/lexicon" },
            { name: "Word games", path: PATH },
          ]),
        ]}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Breadcrumb items={[{ name: "Lexicon", path: "/lexicon" }, { name: "Word games" }]} />

        <header className="border-b border-border pb-8">
          <span className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-primary">
            Word games
          </span>
          <h1 className="mt-2 text-[clamp(1.875rem,3.6vw,2.75rem)] font-semibold tracking-[-0.02em] text-foreground">
            {GAMES.length} games, one dictionary
          </h1>

          <AnswerFirst>{answer}</AnswerFirst>

          <StatStrip
            stats={[
              { value: GAMES.length, label: "Games" },
              { value: TOTAL_ROUNDS, label: "Rounds in total" },
              { value: manifest.total.toLocaleString("en-US"), label: "Entries behind them" },
              { value: "0", label: "Sign-ins required" },
            ]}
          />
        </header>

        {/* ---------------- The four games ---------------- */}
        <ul className="mt-10 grid gap-4 sm:grid-cols-2" style={{ listStyle: "none" }}>
          {GAMES.map((game) => (
            <li key={game.slug}>
              <Link
                href={gamePath(game.slug)}
                className="afl-card group flex h-full flex-col rounded-xl border border-border bg-surface p-5 no-underline sm:p-6"
              >
                <span className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <span className="text-lg font-semibold tracking-[-0.01em] text-foreground group-hover:text-primary">
                    {game.name}
                  </span>
                  <span className="font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-muted-foreground">
                    {game.rounds}
                  </span>
                </span>

                <span className="mt-1.5 text-[0.9375rem] leading-relaxed text-foreground">
                  {game.tagline}
                </span>

                <span className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {game.blurb}
                </span>

                <span className="mt-4 block rounded-lg border border-border bg-surface-soft p-3">
                  <span className="block font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-muted-foreground">
                    How the rounds are chosen
                  </span>
                  <span className="mt-1.5 block text-sm leading-relaxed text-muted-foreground">
                    {game.rule}
                  </span>
                </span>

                <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-medium text-primary">
                  Play {game.name.toLowerCase()}
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {/* ---------------- Why these are not generic word games ---------------- */}
        <section className="mt-14">
          <h2 className="border-b border-border pb-3 text-xl font-semibold tracking-[-0.02em] text-foreground">
            What makes these different
          </h2>
          <div className="mt-4 max-w-[68ch] space-y-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
            <p>
              A word game usually stands on a list somebody typed out: a thousand words picked for
              being gettable, reused until you have met them all. These four stand on the dictionary
              instead. Every round is selected at build time from the live corpus of{" "}
              {manifest.total.toLocaleString("en-US")} entries — definitions and semantic
              classification from Princeton University&rsquo;s WordNet, syllables and stress from
              the CMU Pronouncing Dictionary — and every round says which rule selected it.
            </p>
            <p>
              The selection is a hash, not a random draw. Each candidate word&rsquo;s slug is run
              through the same 32-bit hash the rest of this dictionary uses, and the lowest{" "}
              {TOTAL_ROUNDS} across the four games become the rounds. Hashing rather than sampling
              is what makes the games reproducible: the page built at deploy time and the page
              regenerated by a daily revalidation contain the same puzzles in the same order, so a
              round you tell someone about is the round they will get. It also spreads the draw
              across the whole corpus — slicing the top of a list ordered by commonness would return
              thirty words that all start with A.
            </p>
            <p>
              Because the puzzles come from real entries, the answers are not dead ends. Solve a
              scramble and its full entry is one click away, with every sense, the pronunciation and
              the synonyms; lose an odd-one-out round and the reveal names the subject file WordNet
              filed each of the four words under, so a grouping you disagree with is one you can go
              and check. That is the whole design: a game you can argue with, and a dictionary
              waiting behind the argument.
            </p>
            <p>
              None of the four fetches anything once it has loaded. All {TOTAL_ROUNDS} rounds ship
              inside the HTML, which is why there is no pause between rounds, no timer to race, and
              nothing sent anywhere about how you played.
            </p>
          </div>
        </section>

        <GameFaq questions={FAQS} heading="Questions about these games" />

        {/* ---------------- Out to the rest of the dictionary ---------------- */}
        <section className="mt-12">
          <h2 className="border-b border-border pb-3 text-xl font-semibold tracking-[-0.02em] text-foreground">
            Elsewhere in the dictionary
          </h2>
          <ul className="mt-5 flex flex-wrap gap-2" style={{ listStyle: "none" }}>
            {[
              { href: "/lexicon", label: "Look up a word" },
              { href: "/lexicon/tools", label: "Word tools" },
              { href: "/lexicon/collections", label: "Collections" },
              { href: "/lexicon/word-of-the-day", label: "Word of the day" },
              { href: "/lexicon/browse", label: "Browse A–Z" },
              { href: "/lexicon/sources", label: "Sources and licences" },
            ].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex min-h-[2.75rem] items-center rounded-lg border border-border bg-surface px-4 text-sm text-muted-foreground no-underline motion-safe:transition hover:border-border-strong hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <SourceNote pronunciation />

        <div className="h-16" />
      </div>
    </>
  );
}
