import Link from 'next/link';
import JsonLd from '@/platform/seo/JsonLd';
import {
  createPageMetadata,
  createFaqJsonLd,
  createBreadcrumbJsonLd,
} from '@/platform/seo/generateMetadata';

import {
  getGroupsWithCategories,
  getTrendingLists,
  getFeaturedLists,
  totals,
} from '../lib/data.js';
import { Band, SectionHead, Breadcrumbs, Stat, Faq, Meter } from '../components/primitives.jsx';
import { ListCard } from '../components/cards.jsx';
import ExploreMore from '../components/ExploreMore.jsx';

export const dynamic = 'force-static';

const PATH = '/top49/how-we-rank';

const STEPS = [
  {
    n: '01',
    title: 'Define the field',
    body: 'Every list starts with an explicit inclusion rule — what qualifies, what is out of scope, and why. A list of the best laptops states its price ceiling before a single machine is assessed, so nothing is quietly excluded later to protect a result.',
  },
  {
    n: '02',
    title: 'Publish the criteria',
    body: 'Four criteria, each with a fixed weight, printed on the list itself before the first entry. Weights differ by category because the questions differ: durability matters more for a shoe than for a novel. What never changes is that the weights are visible.',
  },
  {
    n: '03',
    title: 'Score each criterion independently',
    body: 'Entries are scored one criterion at a time, across the whole field, before any of them are combined. Assessing every entry on a single axis at once is what stops a strong reputation from lifting a weak score on an unrelated measure.',
  },
  {
    n: '04',
    title: 'Combine and rank',
    body: 'The four criterion scores are multiplied by their weights and summed into a single number out of 100. Positions follow from the arithmetic.',
  },
  {
    n: '05',
    title: 'Re-score, never inherit',
    body: 'When a list is revised, every entry is scored again from the criteria rather than adjusted from the previous edition. This is why an entry can move without changing — the field around it did.',
  },
];

const PRINCIPLES = [
  {
    title: 'No paid placement',
    body: 'Position cannot be bought, and no commercial relationship influences a score. If a page carries advertising it is the site’s standard inventory, sold against the page rather than against the ranking.',
  },
  {
    title: 'Weights before results',
    body: 'Criteria and weights are fixed before scoring begins. Adjusting the weighting after seeing the outcome is the most common way rankings get quietly rigged, so it is the thing we hold hardest against.',
  },
  {
    title: 'Audience scoring is one input',
    body: 'Where a preview list includes an audience score, it appears as one illustrative criterion alongside the other published weights rather than as a live popularity signal.',
  },
  {
    title: 'Age is adjusted, not rewarded',
    body: 'Older entries are scored against the technical standards of their own era. This stops a fifty-year-old film being penalised for its effects and stops a new release inheriting credit it has not yet earned.',
  },
  {
    title: 'Disagreement is recorded',
    body: 'Where critics and audiences diverge sharply, or where the underlying record is genuinely contested, the entry says so. A confident-sounding ranking that hides a real dispute is worse than a hedged one.',
  },
  {
    title: 'Reservations are mandatory',
    body: 'Every entry carries at least one reservation. If a panel cannot name something an entry gives up, that entry has not been examined closely enough to rank.',
  },
];

const FAQS = [
  {
    question: 'Why is the score out of 100 rather than five stars?',
    answer:
      'A hundred-point scale makes the weighting legible. When four criteria are combined, a five-point scale rounds away exactly the distinctions that decide positions in the middle of a list, where the field is tightest.',
  },
  {
    question: 'Why do two lists give the same entry different scores?',
    answer:
      'Because they ask different questions. An entry judged on durability in one list and on design ambition in another will score differently, and both figures are correct within their own criteria. Scores are comparable inside a list, not across lists.',
  },
  {
    question: 'How often does a list change?',
    answer:
      'Each demonstration list stores an intended cadence, but this preview is not connected to a live review schedule. Dates and figures remain illustrative until sourced editorial records replace them.',
  },
  {
    question: 'What is an editor’s pick?',
    answer:
      'A flag, not a score. It marks entries the panel considers the strongest recommendation in their bracket, which is sometimes not the highest-ranked entry — the best of something is not always the one most people should choose.',
  },
  {
    question: 'Can I see the underlying criterion scores?',
    answer:
      'Yes. Every entry page shows the full breakdown, criterion by criterion, alongside the weight each one carried. The arithmetic that produced the total is always visible.',
  },
  {
    question: 'Is the data on this section real?',
    answer:
      'The rankings here are curated editorial demonstration data built to exercise the full system — real entities, plausible figures, and a scoring model that behaves exactly as described. Treat the figures as illustrative rather than as a live dataset.',
  },
];

export async function generateMetadata() {
  return createPageMetadata({
    title: 'How we rank',
    description:
      'The Top 49 methodology: how criteria are chosen and weighted, how scores are calculated, and the principles that govern every list.',
    path: PATH,
    noindex: true,
    follow: true,
  });
}

export default async function HowWeRankPage() {
  const [groupsWithCategories, trending, featured] = await Promise.all([
    getGroupsWithCategories(),
    getTrendingLists(6),
    getFeaturedLists(3),
  ]);

  return (
    <main>
      <JsonLd
        id="top49-methodology-schema"
        data={[
          createFaqJsonLd({ path: PATH, questions: FAQS }),
          createBreadcrumbJsonLd([
            { name: 'Top 49', path: '/top49' },
            { name: 'How we rank', path: PATH },
          ]),
        ].filter(Boolean)}
      />

      <Band as="header" size="tight">
        <Breadcrumbs trail={[{ label: 'Top 49', href: '/top49' }, { label: 'How we rank' }]} />
        <p className="t49-eyebrow" style={{ marginTop: 22 }}>
          Methodology
        </p>
        <h1 className="t49-hero-heavy" style={{ marginTop: 16 }}>
          Show the
          <br />
          arithmetic
        </h1>
        <p className="t49-lead" style={{ marginTop: 22, maxWidth: '62ch' }}>
          A ranking is only worth reading if you can see how it was produced. Every Top 49 list
          publishes its criteria and weights before the first entry, scores each criterion
          independently, and shows the full breakdown on every entry page.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(24px, 5vw, 52px)', marginTop: 34 }}>
          <Stat value={totals.lists} label="Lists scored this way" />
          <Stat value={totals.items} label="Entries assessed" />
          <Stat value={4} label="Criteria per list" />
        </div>
      </Band>

      {/* Process */}
      <Band tone="parchment" aria-labelledby="t49-process">
        <SectionHead
          id="t49-process"
          eyebrow="The process"
          title="Five steps, applied to every list"
          lead="The same sequence runs for a list of horror films and a list of index funds. Only the criteria change."
        />
        <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 4 }}>
          {STEPS.map((step) => (
            <li
              key={step.n}
              style={{
                display: 'grid',
                gap: 'clamp(12px, 3vw, 40px)',
                gridTemplateColumns: 'minmax(0, 1fr)',
                padding: '28px 0',
                borderTop: '1px solid var(--border)',
              }}
              className="t49-step"
            >
              <span className="t49-numeral" style={{ fontSize: 'clamp(40px, 2rem + 2vw, 64px)', color: 'var(--primary)' }}>
                {step.n}
              </span>
              <div>
                <h3 className="t49-display-sm">{step.title}</h3>
                <p className="t49-body t49-muted" style={{ marginTop: 10, maxWidth: '68ch' }}>
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Band>

      {/* Worked example */}
      <Band tone="dark" aria-labelledby="t49-worked">
        <div className="t49-split">
          <div>
            <p className="t49-eyebrow">Worked example</p>
            <h2 id="t49-worked" className="t49-display" style={{ marginTop: 14 }}>
              How a 96.4 is actually assembled
            </h2>
            <p className="t49-lead" style={{ marginTop: 16, color: 'color-mix(in srgb, var(--on-media) 82%, transparent)' }}>
              Take a film scoring 99 on cultural impact but 94 on rewatchability. Because impact
              carries 25% and rewatchability 20%, the gap between those two numbers moves the
              total by less than a point — which is exactly the intent.
            </p>
            <dl style={{ marginTop: 32, display: 'grid', gap: 20 }}>
              {[
                ['Critical acclaim', 30, 98],
                ['Audience rating', 25, 94],
                ['Cultural impact', 25, 99],
                ['Rewatchability', 20, 94],
              ].map(([name, weight, value]) => (
                <div key={name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'baseline' }}>
                    <dt className="t49-body-strong">
                      {name}
                      <span className="t49-fine" style={{ color: 'color-mix(in srgb, var(--on-media) 68%, transparent)', marginLeft: 8 }}>
                        × {weight}%
                      </span>
                    </dt>
                    <dd className="t49-body-strong t49-num" style={{ margin: 0 }}>
                      {value}
                    </dd>
                  </div>
                  <Meter value={value} label={`${name} scored ${value} out of 100`} />
                </div>
              ))}
            </dl>
          </div>

          <aside className="t49-split__aside">
            <div
              style={{
                border: '1px solid var(--anslation-ds-footer-border)',
                borderRadius: 'var(--t49-r-lg)',
                padding: 'var(--t49-lg)',
              }}
            >
              <p className="t49-caption" style={{ color: 'color-mix(in srgb, var(--on-media) 82%, transparent)' }}>
                Weighted total
              </p>
              <p className="t49-numeral" style={{ marginTop: 10, fontSize: 'clamp(48px, 3rem + 2vw, 76px)' }}>
                96.4
              </p>
              <hr className="t49-divide" style={{ borderColor: 'var(--anslation-ds-footer-border)', margin: '16px 0' }} />
              <p className="t49-fine t49-num" style={{ color: 'color-mix(in srgb, var(--on-media) 82%, transparent)', lineHeight: 1.9 }}>
                (98 × 0.30) = 29.4
                <br />
                (94 × 0.25) = 23.5
                <br />
                (99 × 0.25) = 24.75
                <br />
                (94 × 0.20) = 18.8
                <br />
                <strong style={{ color: 'var(--on-media)' }}>total = 96.45 → 96.4</strong>
              </p>
            </div>
          </aside>
        </div>
      </Band>

      {/* Principles */}
      <Band aria-labelledby="t49-principles">
        <SectionHead
          id="t49-principles"
          eyebrow="Standing rules"
          title="What we hold to, list after list"
          lead="These apply whether the subject is a camera lens or a national park."
        />
        <div className="t49-grid t49-grid--3">
          {PRINCIPLES.map((p) => (
            <article
              key={p.title}
              style={{ borderTop: '2px solid var(--primary)', paddingTop: 18 }}
            >
              <h3 className="t49-tagline">{p.title}</h3>
              <p className="t49-body t49-muted" style={{ marginTop: 10 }}>
                {p.body}
              </p>
            </article>
          ))}
        </div>
      </Band>

      {/* FAQ */}
      <Band tone="parchment" wrap="prose" aria-labelledby="t49-method-faq">
        <p className="t49-eyebrow">Questions</p>
        <h2 id="t49-method-faq" className="t49-display" style={{ marginTop: 14, marginBottom: 24 }}>
          Common questions about the score
        </h2>
        <Faq items={FAQS} />
      </Band>

      {/* See it applied */}
      {featured.length ? (
        <Band aria-labelledby="t49-method-examples">
          <SectionHead
            id="t49-method-examples"
            eyebrow="See it applied"
            title="Lists where the working is visible"
            action={
              <Link href="/top49/categories" className="t49-btn t49-btn--ghost t49-btn--sm">
                All categories
              </Link>
            }
          />
          <div className="t49-grid t49-grid--3">
            {featured.map((list) => (
              <ListCard key={list.slug} list={list} />
            ))}
          </div>
        </Band>
      ) : null}

      <ExploreMore groups={groupsWithCategories} trending={trending} />
    </main>
  );
}
