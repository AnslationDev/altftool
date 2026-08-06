// Animal Hub page sections — the compositions the homepage and category
// pages assemble from primitives.
//
// Every section takes its content as props. None of them import data, none
// know about a specific animal or category, and each is safe to reorder or
// reuse. They are grouped in one file because they share the same editorial
// vocabulary and are always read together.
//
// Deliberate variety: no two adjacent sections use the same layout. The hero
// pairs type with an index, featured animals use a cover-story grid, popular
// animals are a ranked column, habitats are a weighted list, and quick facts
// are an asymmetric fact table. That variation is what stops a long page from
// reading as a stack of identical card rows.

import Link from "next/link";
import { AhContainer, AhSection, AhSectionHeader } from "./AhLayout";
import { AhButton, AhTag } from "./AhElements";
import { AnimalGrid, AnimalRankedList, CategoryIndexRow } from "./AnimalCards";
import { AnimalSearchField } from "./AnimalSearchField";

/* ─────────────────────────── Homepage ─────────────────────────── */

/**
 * Hero: an editorial masthead rather than a centred banner. Type sits left
 * with the search field beneath it; the right column carries the catalogue's
 * own numbers, so the first thing a visitor sees is evidence of substance.
 */
export function HomeHero({ stats, searchIndex, categories = [] }) {
  return (
    <AhSection as="section" className="ah-hero">
      <AhContainer>
        <div className="ah-hero__grid">
          <div className="ah-hero__main">
            <span className="ah-eyebrow ah-eyebrow--rule">Animal Hub</span>
            <h1 className="ah-display ah-display--xl ah-hero__title">
              The living world,
              <span className="ah-hero__title-accent"> carefully documented</span>
            </h1>
            <p className="ah-lead ah-hero__lead">
              Species profiles built from primary sources — habitat and range, diet and
              hunting, behaviour, taxonomy and conservation status. Written to be read,
              not skimmed.
            </p>

            <div className="ah-hero__search">
              <AnimalSearchField
                index={searchIndex}
                size="lg"
                placeholder="Search by common or scientific name"
              />
            </div>

            {categories.length ? (
              <p className="ah-hero__jump">
                <span>Jump to</span>
                {categories.slice(0, 4).map((category) => (
                  <Link key={category.slug} href={`/animalhub/${category.slug}`}>
                    {category.name}
                  </Link>
                ))}
              </p>
            ) : null}
          </div>

          {stats ? (
            <aside className="ah-hero__stats" aria-label="Catalogue at a glance">
              <dl>
                <div className="ah-hero__stat">
                  <dt>Species profiled</dt>
                  <dd>{String(stats.animals).padStart(2, "0")}</dd>
                </div>
                <div className="ah-hero__stat">
                  <dt>Animal groups</dt>
                  <dd>{String(stats.categories).padStart(2, "0")}</dd>
                </div>
                <div className="ah-hero__stat">
                  <dt>Threatened or worse</dt>
                  <dd>{String(stats.threatened).padStart(2, "0")}</dd>
                </div>
              </dl>
              <p className="ah-hero__stats-note">
                Conservation status follows the IUCN Red List.
              </p>
            </aside>
          ) : null}
        </div>
      </AhContainer>
    </AhSection>
  );
}

/** Featured animals as a cover-story grid — the lead tile runs 2×2. */
export function FeaturedAnimals({ animals = [] }) {
  if (!animals.length) return null;
  return (
    <AhSection as="section">
      <AhContainer>
        <AhSectionHeader
          eyebrow="Featured"
          title="Start with these"
          titleSize="lg"
          lead="A cross-section of the catalogue — a big cat, a record-breaking bird, a salamander that regrows its own brain."
          action={
            <AhButton href="/animalhub/mammals" variant="outline" size="sm">
              Browse all species
            </AhButton>
          }
        />
        <AnimalGrid animals={animals} variant="feature" priorityFirst />
      </AhContainer>
    </AhSection>
  );
}

/** Categories as a table of contents, not a tile grid. */
export function CategoryIndex({ categories = [] }) {
  if (!categories.length) return null;
  return (
    <AhSection as="section" tint>
      <AhContainer>
        <AhSectionHeader
          eyebrow="Browse"
          title="By animal group"
          titleSize="lg"
          lead="Six groups, each with its own profiles. Every species sits in exactly one."
        />
        <ul className="ah-index">
          {categories.map((category, i) => (
            <CategoryIndexRow key={category.slug} category={category} index={i} />
          ))}
        </ul>
      </AhContainer>
    </AhSection>
  );
}

/**
 * Popular animals beside the habitat index — two narrow columns rather than
 * another full-width band, which keeps the page's rhythm from flattening.
 */
export function PopularAndHabitats({ popular = [], habitats = [] }) {
  if (!popular.length && !habitats.length) return null;
  const maxCount = habitats.reduce((max, habitat) => Math.max(max, habitat.count), 0) || 1;

  return (
    <AhSection as="section">
      <AhContainer>
        <div className="ah-split">
          {popular.length ? (
            <div className="ah-split__col">
              <AhSectionHeader
                eyebrow="Most referenced"
                title="Popular species"
                lead="Ranked by how often other profiles in the catalogue point to them."
              />
              <AnimalRankedList animals={popular} />
            </div>
          ) : null}

          {habitats.length ? (
            <div className="ah-split__col">
              <AhSectionHeader
                eyebrow="Explore"
                title="By habitat"
                lead="Every environment named across the catalogue, weighted by how many species live there."
              />
              <ul className="ah-habitats">
                {habitats.map((habitat) => (
                  <li key={habitat.name} className="ah-habitats__item">
                    <span className="ah-habitats__name">{habitat.name}</span>
                    <span className="ah-habitats__bar" aria-hidden="true">
                      <span style={{ "--ah-bar": `${(habitat.count / maxCount) * 100}%` }} />
                    </span>
                    <span className="ah-habitats__count">
                      {habitat.count}
                      <span className="sr-only">
                        {habitat.count === 1 ? " species" : " species"}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </AhContainer>
    </AhSection>
  );
}

/** Notable measurements pulled from the records themselves. */
export function QuickFacts({ facts = [] }) {
  if (!facts.length) return null;
  return (
    <AhSection as="section" tint>
      <AhContainer>
        <AhSectionHeader
          eyebrow="Quick facts"
          title="Numbers worth knowing"
          titleSize="lg"
          lead="Each drawn from the profile that documents it."
        />
        <dl className="ah-facts">
          {facts.map((fact) => (
            <div key={`${fact.animalHref}-${fact.label}`} className="ah-facts__item">
              <dt className="ah-facts__label">{fact.label}</dt>
              <dd>
                <p className="ah-facts__value">{fact.value}</p>
                {fact.note ? <p className="ah-facts__note">{fact.note}</p> : null}
                <Link href={fact.animalHref} className="ah-facts__source">
                  {fact.animalName}
                </Link>
              </dd>
            </div>
          ))}
        </dl>
      </AhContainer>
    </AhSection>
  );
}

/** Closing invitation — a quiet full-width band, no gradient. */
export function ExploreCta({ categories = [] }) {
  return (
    <AhSection as="section" className="ah-cta">
      <AhContainer size="narrow">
        <div className="ah-cta__inner">
          <span className="ah-eyebrow ah-eyebrow--rule">Keep exploring</span>
          <h2 className="ah-display ah-display--lg">
            Every profile cites its sources.
          </h2>
          <p className="ah-lead">
            The catalogue grows one researched species at a time. Start anywhere — the
            groups below are as good a place as any.
          </p>
          <div className="ah-cta__tags">
            {categories.map((category) => (
              <AhTag key={category.slug} href={`/animalhub/${category.slug}`}>
                {category.name}
              </AhTag>
            ))}
          </div>
        </div>
      </AhContainer>
    </AhSection>
  );
}

/* ─────────────────────────── Category page ─────────────────────────── */

/**
 * Category masthead: breadcrumb, oversized title, description, and the
 * group's own counts. Mirrors the homepage hero's structure so the two pages
 * feel like one publication without being the same layout.
 */
export function CategoryHero({ category, threatenedCount }) {
  if (!category) return null;
  return (
    <AhSection as="section" className="ah-cat-hero">
      <AhContainer>
        <nav className="ah-breadcrumb" aria-label="Breadcrumb">
          <Link href="/animalhub">Animal Hub</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{category.name}</span>
        </nav>

        <div className="ah-cat-hero__grid">
          <div>
            <h1 className="ah-display ah-display--xl">{category.name}</h1>
            <p className="ah-lead ah-cat-hero__lead">{category.description}</p>
          </div>
          <dl className="ah-cat-hero__stats">
            <div>
              <dt>Profiles</dt>
              <dd>{String(category.animalCount).padStart(2, "0")}</dd>
            </div>
            {typeof threatenedCount === "number" ? (
              <div>
                <dt>Threatened</dt>
                <dd>{String(threatenedCount).padStart(2, "0")}</dd>
              </div>
            ) : null}
          </dl>
        </div>
      </AhContainer>
    </AhSection>
  );
}
