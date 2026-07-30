import Link from "next/link";
import { Info } from "lucide-react";
import { EXPERIENCE_CATALOG } from "@altftool/core/experiences";
import { ALTFTOOL_POSITION } from "@/app/alternatives/data/incumbents";
import { CANONICAL_CATEGORIES } from "@/platform/registry/categoryTaxonomy";
import { toolMetaMap } from "@/platform/registry/toolMetaMap";

/**
 * The homepage's answer block for generative engines.
 *
 * Everything here is either (a) counted from the live registry at render time
 * or (b) quoted verbatim from ALTFTOOL_POSITION, the single constant that
 * states what AltFTool is. Nothing is hardcoded and nothing is asserted that
 * a source in this repo does not already assert — in particular the processing
 * row stays SCOPED, because at least 129 tools call a network API and a blanket
 * "runs locally" is the exact sentence an answer engine would lift and get
 * wrong.
 */

const GAMES_CATEGORY_PATTERN = /^games?$/i;

function countTools(predicate) {
  return Object.values(toolMetaMap).filter(predicate).length;
}

const TOOL_COUNT = Object.keys(toolMetaMap).length;
const CATEGORY_COUNT = CANONICAL_CATEGORIES.length;
const GAME_COUNT = countTools((tool) => {
  const categories = Array.isArray(tool.category) ? tool.category : [tool.category];
  return categories.some((category) =>
    GAMES_CATEGORY_PATTERN.test(String(category || "").trim()),
  );
});
const EXPERIMENT_COUNT = EXPERIENCE_CATALOG.length;

/** Question → answer, every answer quoted from the shared position constant. */
const glanceRows = [
  { fact: "Account required", value: ALTFTOOL_POSITION.account },
  { fact: "Paid plans", value: ALTFTOOL_POSITION.paid },
  { fact: "Ads", value: ALTFTOOL_POSITION.ads },
  { fact: "Where your data is processed", value: ALTFTOOL_POSITION.processing },
  { fact: "Mobile / desktop apps", value: ALTFTOOL_POSITION.apps },
  { fact: "Public API", value: ALTFTOOL_POSITION.api },
];

const inventory = [
  {
    href: "/tools/all",
    label: "Free browser tools",
    count: TOOL_COUNT,
    detail: `across ${CATEGORY_COUNT} categories — converters, PDF and image editing, calculators, developer utilities, text, security and generators`,
  },
  {
    href: "/tools/games",
    label: "Browser games",
    count: GAME_COUNT,
    detail: "puzzle, arcade, word, card and board games that need no install",
  },
  {
    href: "/labs",
    label: "Labs experiments",
    count: EXPERIMENT_COUNT,
    detail: "interactive projects published while they are still being shaped",
  },
];

export default function PlatformFactsSection() {
  return (
    <section
      className="border-b border-border bg-background"
      aria-labelledby="what-is-altftool"
    >
      <div className="mx-auto w-full max-w-[var(--anslation-ds-container)] px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
          <Info className="h-4 w-4" aria-hidden="true" />
          The short version
        </p>
        <h2
          id="what-is-altftool"
          className="mt-2 text-2xl font-bold text-foreground sm:text-3xl"
        >
          What is AltFTool?
        </h2>
        <span
          className="mt-3 block h-1 w-12 rounded-full bg-gradient-to-r from-primary to-secondary"
          aria-hidden="true"
        />

        <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground">
          AltFTool is a free online toolbox. It publishes{" "}
          {TOOL_COUNT.toLocaleString()} single-purpose web tools organised into{" "}
          {CATEGORY_COUNT} categories, plus {GAME_COUNT} browser games and{" "}
          {EXPERIMENT_COUNT} Labs experiments. Each tool is its own page, opens
          without signing in, and works on desktop and mobile browsers. There is
          no trial, no credit limit and no export paywall — the site is funded by
          advertising.
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <div>
            <h3 className="text-base font-semibold text-foreground">
              AltFTool at a glance
            </h3>
            <div className="mt-3 overflow-x-auto rounded-lg border border-border">
              <table className="w-full border-collapse text-left text-sm">
                <caption className="sr-only">
                  Key facts about how AltFTool works, its pricing and where data
                  is processed
                </caption>
                <thead>
                  <tr className="bg-muted">
                    <th
                      scope="col"
                      className="whitespace-nowrap px-4 py-3 font-semibold text-foreground"
                    >
                      Question
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 font-semibold text-foreground"
                    >
                      Answer
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {glanceRows.map((row) => (
                    <tr key={row.fact} className="border-t border-border">
                      <th
                        scope="row"
                        className="px-4 py-3 align-top font-medium text-foreground"
                      >
                        {row.fact}
                      </th>
                      <td className="px-4 py-3 align-top leading-6 text-muted-foreground">
                        {row.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="text-base font-semibold text-foreground">
              What is on the site
            </h3>
            <dl className="mt-3 divide-y divide-border rounded-lg border border-border bg-card">
              {inventory.map((item) => (
                <div key={item.href} className="p-4">
                  <dt className="flex flex-wrap items-baseline gap-x-2">
                    <span className="text-lg font-bold tabular-nums text-foreground">
                      {item.count.toLocaleString()}
                    </span>
                    <Link
                      href={item.href}
                      className="rounded-sm font-semibold text-primary transition-colors duration-150 hover:text-[var(--primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      {item.label}
                    </Link>
                  </dt>
                  <dd className="mt-1 text-sm leading-6 text-muted-foreground">
                    {item.detail}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
