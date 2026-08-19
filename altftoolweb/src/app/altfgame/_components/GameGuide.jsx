// Server-rendered guide for a single game page: the answer-first summary, an
// ordered how-to and the hand-written FAQs. Rendered only when the game has a
// real entry in _data/gameContent.js — no entry, no block.

export default function GameGuide({ game, content }) {
  if (!game || !content) return null;

  return (
    <section
      id="game-guide"
      aria-labelledby="game-guide-heading"
      className="mt-10 border-t border-border pt-8"
    >
      <h2 id="game-guide-heading" className="text-xl font-bold tracking-tight sm:text-2xl">
        What is {game.title}?
      </h2>
      <p className="mt-3 max-w-3xl text-foreground/90">{content.answer}</p>
      <p className="mt-3 max-w-3xl text-foreground/80">{content.about}</p>

      <h3 className="mt-8 text-lg font-bold tracking-tight">
        How to play {game.title} step by step
      </h3>
      <ol className="mt-3 max-w-3xl list-decimal space-y-2 pl-5 text-foreground/80 marker:font-semibold marker:text-primary">
        {content.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>

      {content.faqs?.length > 0 && (
        <>
          <h3 className="mt-8 text-lg font-bold tracking-tight">
            {game.title} questions
          </h3>
          <dl className="mt-3 max-w-3xl space-y-5">
            {content.faqs.map((faq) => (
              <div key={faq.question}>
                <dt className="font-semibold text-foreground">{faq.question}</dt>
                <dd className="mt-1 text-foreground/80">{faq.answer}</dd>
              </div>
            ))}
          </dl>
        </>
      )}
    </section>
  );
}
