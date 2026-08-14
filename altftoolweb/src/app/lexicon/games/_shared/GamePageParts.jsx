import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { otherGames } from "./catalog";

/*
 * The server-rendered furniture every game page carries.
 *
 * All of it is static markup: instructions, the rule the rounds were built by,
 * the questions people ask, and the way out to the rest of the dictionary. None
 * of it is inside the client component, because a reader who wants to know how
 * a game works should not have to wait for JavaScript to find out, and a search
 * engine reading the page should see the instructions in the HTML.
 */

export function HowToPlay({ steps = [], children }) {
  return (
    <section className="mt-14">
      <h2 className="border-b border-border pb-3 text-xl font-semibold tracking-[-0.02em] text-foreground">
        How to play
      </h2>
      <ol className="afl-divide mt-2" style={{ listStyle: "none" }}>
        {steps.map((step, index) => (
          <li key={step} className="afl-sense">
            <span className="afl-sense__n">{index + 1}.</span>
            <p className="text-[0.9375rem] leading-relaxed text-foreground">{step}</p>
          </li>
        ))}
      </ol>
      {children ? (
        <p className="mt-4 max-w-[68ch] text-[0.9375rem] leading-relaxed text-muted-foreground">
          {children}
        </p>
      ) : null}
    </section>
  );
}

/** How the rounds were chosen. Every computed list on this site says its rule. */
export function HowItWasBuilt({ children }) {
  return (
    <section className="mt-12">
      <h2 className="border-b border-border pb-3 text-xl font-semibold tracking-[-0.02em] text-foreground">
        How these rounds were chosen
      </h2>
      <div className="mt-4 max-w-[68ch] space-y-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}

export function GameFaq({ questions = [], heading = "Questions" }) {
  if (questions.length === 0) return null;
  return (
    <section className="mt-12">
      <h2 className="border-b border-border pb-3 text-xl font-semibold tracking-[-0.02em] text-foreground">
        {heading}
      </h2>
      <dl className="afl-divide mt-2">
        {questions.map((faq) => (
          <div key={faq.question} className="py-4">
            <dt className="text-[0.9375rem] font-semibold text-foreground">{faq.question}</dt>
            <dd className="mt-1.5 max-w-[68ch] text-[0.9375rem] leading-relaxed text-muted-foreground">
              {faq.answer}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function MoreGames({ current }) {
  const rest = otherGames(current);
  return (
    <section className="mt-12">
      <h2 className="border-b border-border pb-3 text-xl font-semibold tracking-[-0.02em] text-foreground">
        More word games
      </h2>
      <ul
        className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        style={{ listStyle: "none" }}
      >
        {rest.map((game) => (
          <li key={game.slug}>
            <Link
              href={`/lexicon/games/${game.slug}`}
              className="afl-card group flex h-full flex-col rounded-lg border border-border bg-surface p-4 no-underline"
            >
              <span className="text-[0.9375rem] font-semibold text-foreground group-hover:text-primary">
                {game.name}
              </span>
              <span className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {game.tagline}
              </span>
              <span className="mt-auto pt-3 font-mono text-[0.6875rem] text-muted-foreground">
                {game.rounds}
              </span>
            </Link>
          </li>
        ))}
        <li>
          <Link
            href="/lexicon/games"
            className="afl-card group flex h-full flex-col rounded-lg border border-border bg-surface-soft p-4 no-underline"
          >
            <span className="text-[0.9375rem] font-semibold text-foreground group-hover:text-primary">
              All word games
            </span>
            <span className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              The hub, plus what each game is testing.
            </span>
            <span className="mt-auto inline-flex items-center gap-1.5 pt-3 text-sm text-primary">
              Open <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
          </Link>
        </li>
      </ul>
    </section>
  );
}

/** WordNet and CMUdict both require the notice. Every page that shows their data carries it. */
export function SourceNote({ pronunciation = false }) {
  return (
    <p className="mt-10 rounded-lg border border-border bg-surface-soft p-4 text-xs leading-relaxed text-muted-foreground">
      The words, definitions and semantic fields in this game come from Princeton
      University&rsquo;s WordNet.{" "}
      {pronunciation
        ? "Syllable splits, stress and IPA come from the CMU Pronouncing Dictionary. "
        : ""}
      Commonness bands are measured against a corpus of everyday English.{" "}
      <Link href="/lexicon/sources" className="text-primary hover:underline">
        Full sources and licences
      </Link>
      .
    </p>
  );
}
