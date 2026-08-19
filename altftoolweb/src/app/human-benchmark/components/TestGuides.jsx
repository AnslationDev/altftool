import { BENCHMARK_TESTS } from "../data/tests";

/**
 * Server-rendered explainer for the eight tests behind /human-benchmark.
 *
 * The tests themselves only render after a click (`view === "test"`), so none of
 * their content reaches the initial HTML. Eight separate queries compete for
 * this one URL, so each test gets its own <h2>, its own anchor and an
 * answer-first opening sentence that stands on its own when lifted out of the
 * page.
 *
 * No icons and no client JavaScript: this is plain HTML from data/tests.js, and
 * layout.jsx emits the matching ItemList and FAQPage nodes from the same
 * strings.
 */
export default function TestGuides() {
  return (
    <section
      id="test-guides"
      aria-labelledby="test-guides-heading"
      className="bg-background text-foreground"
    >
      <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:py-16">
        <h2
          id="test-guides-heading"
          className="text-2xl font-bold tracking-tight sm:text-3xl"
        >
          The eight tests at a glance
        </h2>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          Reflex Lab runs eight browser tests of reaction speed, memory, aim and
          typing. Each one measures a single ability and reports one number, and
          every attempt is written to this browser only — there is no account,
          no upload and no leaderboard.
        </p>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[38rem] border-collapse text-left text-sm">
            <caption className="sr-only">
              The eight AltF Reflex Lab tests, what each measures and how each is
              scored
            </caption>
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Test
                </th>
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Measures
                </th>
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Score
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Better score
                </th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              {BENCHMARK_TESTS.map((test) => (
                <tr key={test.id} className="border-b border-border last:border-0">
                  <th
                    scope="row"
                    className="py-3 pr-4 font-medium text-foreground"
                  >
                    <a
                      className="rounded-sm underline underline-offset-2 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      href={`#${test.anchor}`}
                    >
                      {test.name}
                    </a>
                  </th>
                  <td className="py-3 pr-4">{test.measures}</td>
                  <td className="py-3 pr-4">{test.unit}</td>
                  <td className="py-3">
                    {test.lowerBetter ? "Lower" : "Higher"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {BENCHMARK_TESTS.map((test) => (
          <article key={test.id} className="mt-10 scroll-mt-20" id={test.anchor}>
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
              {test.question}
            </h2>
            <p className="mt-3 text-base leading-7">{test.answer}</p>
            <p className="mt-3 text-base leading-7 text-muted-foreground">
              {test.mechanics}
            </p>
            <p className="mt-3 text-sm font-medium text-muted-foreground">
              <span className="text-foreground">Scoring:</span> {test.scoring}
            </p>
          </article>
        ))}

        <h2 className="mt-12 text-2xl font-bold tracking-tight">
          Where are my scores stored?
        </h2>
        <p className="mt-3 text-base leading-7">
          Your best score and every attempt stay in this browser&apos;s local
          storage. Nothing is sent to a server, so scores do not follow you to
          another browser or device, clearing site data erases them, and the
          Reset All button on the score table wipes them immediately.
        </p>
      </div>
    </section>
  );
}
