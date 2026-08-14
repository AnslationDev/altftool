// Animal Hub detail sections — the profile page's vocabulary.
//
// Every section takes a full animal record (or a slice of one) as props and
// renders nothing if the data is absent, so a record with no gallery or no
// FAQ simply skips those bands rather than showing an empty frame. Nothing
// here is written for a particular species.
//
// The FAQ uses native <details>/<summary>: fully accessible and keyboard
// operable with no JavaScript, which keeps the whole profile a server
// component. Answers stay in the DOM when collapsed, so the visible content
// matches the FAQPage structured data emitted alongside it.

import Link from "next/link";
import clsx from "clsx";
import { AhContainer, AhSection, AhSectionHeader } from "./AhLayout";
import { AhTag } from "./AhElements";
import { AhImage } from "./AhImage";
import { AnimalGrid, ConservationBadge } from "./AnimalCards";

/** Hero: breadcrumb, name, binomial, lead paragraph and the lead photograph. */
export function AnimalHero({ animal, categoryName, conservation, highlights = [] }) {
  return (
    <AhSection as="section" className="ah-profile-hero" flush>
      <AhContainer>
        <nav className="ah-breadcrumb" aria-label="Breadcrumb">
          <Link href="/animalhub">Animal Hub</Link>
          <span aria-hidden="true">/</span>
          <Link href={`/animalhub/${animal.category}`}>{categoryName || animal.category}</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{animal.name}</span>
        </nav>

        <div className="ah-profile-hero__grid">
          <div className="ah-profile-hero__text">
            <span className="ah-eyebrow ah-eyebrow--rule">{categoryName || animal.category}</span>
            <h1 className="ah-display ah-display--xl">{animal.name}</h1>
            <p className="ah-profile-hero__latin">{animal.scientificName}</p>
            <p className="ah-lead">{animal.headline}</p>

            <div className="ah-profile-hero__meta">
              <ConservationBadge conservation={conservation} />
              {animal.conservation?.populationTrend ? (
                <span className="ah-caption">
                  Population {animal.conservation.populationTrend}
                </span>
              ) : null}
            </div>
          </div>

          <div className="ah-profile-hero__media">
            <AhImage
              image={animal.heroImage}
              alt={animal.heroImage?.alt || animal.name}
              ratio="4 / 3"
              sizes="(min-width: 64rem) 52vw, 100vw"
              priority
              fallbackLabel={animal.name}
            />
          </div>
        </div>

        {highlights.length ? (
          <dl className="ah-strip">
            {highlights.map((fact) => (
              <div key={fact.key} className="ah-strip__item">
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </AhContainer>
    </AhSection>
  );
}

/** Opening paragraphs plus the long-form editorial sections. */
export function AnimalNarrative({ intro = [], sections = [] }) {
  if (!intro.length && !sections.length) return null;
  return (
    <div className="ah-prose ah-narrative">
      {intro.map((paragraph, i) => (
        <p key={`intro-${i}`} className={i === 0 ? "ah-narrative__opener" : undefined}>
          {paragraph}
        </p>
      ))}
      {sections.map((section) => (
        <section key={section.id} id={section.id} className="ah-narrative__section">
          <h2>{section.title}</h2>
          {section.body.map((paragraph, i) => (
            <p key={`${section.id}-${i}`}>{paragraph}</p>
          ))}
        </section>
      ))}
    </div>
  );
}

/** In-page navigation for the narrative sections. */
export function AnimalContents({ sections = [] }) {
  if (sections.length < 2) return null;
  return (
    <nav className="ah-contents" aria-label="On this page">
      <h2 className="ah-contents__heading">On this page</h2>
      <ol>
        {sections.map((section, i) => (
          <li key={section.id}>
            <a href={`#${section.id}`}>
              <span aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
              {section.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * Statistics panel — every renderable fact, bucketed by the fact catalog.
 *
 * The component does not know what a bite force or a wingspan is: it renders
 * whichever groups the record actually has. A bird shows Movement facts a
 * snake does not, without a single category conditional here.
 */
export function AnimalFacts({ groups = [] }) {
  if (!groups.length) return null;
  return (
    <section className="ah-panel">
      <h2 className="ah-panel__heading">Key facts</h2>
      {groups.map((group) => (
        <div key={group.id} className="ah-factgroup">
          <h3 className="ah-factgroup__label">{group.label}</h3>
          <dl className="ah-datalist">
            {group.facts.map((fact) => (
              <div key={fact.key} className="ah-datalist__row">
                <dt>{fact.label}</dt>
                <dd>
                  {fact.value}
                  {fact.note ? <span className="ah-datalist__note">{fact.note}</span> : null}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </section>
  );
}

/** Classification chain, rendered as an indented lineage rather than a table. */
export function AnimalTaxonomy({ taxonomy }) {
  if (!taxonomy) return null;
  const ranks = [
    ["Kingdom", taxonomy.kingdom],
    ["Phylum", taxonomy.phylum],
    ["Class", taxonomy.class],
    ["Order", taxonomy.order],
    ["Family", taxonomy.family],
    ["Genus", taxonomy.genus],
    ["Species", taxonomy.species],
  ];

  return (
    <section className="ah-panel">
      <h2 className="ah-panel__heading">Classification</h2>
      <ol className="ah-lineage">
        {ranks.map(([rank, value], i) => (
          <li key={rank} className="ah-lineage__item" style={{ "--ah-depth": i }}>
            <span className="ah-lineage__rank">{rank}</span>
            <span className="ah-lineage__value">{value}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Where the animal lives — habitats and regions as chips, plus any note. */
export function AnimalDistribution({ distribution }) {
  if (!distribution) return null;
  const { habitats = [], regions = [], continents = [], elevation, note } = distribution;
  if (!habitats.length && !regions.length && !note) return null;

  return (
    <AhSection as="section" tint>
      <AhContainer>
        <AhSectionHeader
          eyebrow="Distribution"
          title="Where it lives"
          titleSize="md"
          lead={note || undefined}
        />
        <div className="ah-dist">
          {habitats.length ? (
            <div className="ah-dist__group">
              <h3 className="ah-dist__label">Habitats</h3>
              <div className="ah-dist__tags">
                {habitats.map((habitat) => (
                  <AhTag key={habitat}>{habitat}</AhTag>
                ))}
              </div>
            </div>
          ) : null}

          {regions.length ? (
            <div className="ah-dist__group">
              <h3 className="ah-dist__label">Range</h3>
              <div className="ah-dist__tags">
                {regions.map((region) => (
                  <AhTag key={region}>{region}</AhTag>
                ))}
              </div>
            </div>
          ) : null}

          {continents.length || elevation ? (
            <div className="ah-dist__group">
              <h3 className="ah-dist__label">Also</h3>
              <dl className="ah-datalist ah-datalist--tight">
                {continents.length ? (
                  <div className="ah-datalist__row">
                    <dt>Continents</dt>
                    <dd>{continents.join(", ")}</dd>
                  </div>
                ) : null}
                {elevation ? (
                  <div className="ah-datalist__row">
                    <dt>Elevation</dt>
                    <dd>{elevation}</dd>
                  </div>
                ) : null}
              </dl>
            </div>
          ) : null}
        </div>
      </AhContainer>
    </AhSection>
  );
}

/**
 * Photo gallery — alternating image/text rows. Each entry may carry a `title`
 * and `caption`; when it does, the text sits beside the photograph and the
 * side flips row by row. Entries with neither run full width, so a record with
 * bare {src, alt} images still renders correctly.
 */
export function AnimalGallery({ images = [], name }) {
  if (!images.length) return null;
  return (
    <AhSection as="section">
      <AhContainer>
        <AhSectionHeader eyebrow="Gallery" title={`${name} in the wild`} titleSize="md" />
        <div className="ah-zigzag">
          {images.map((image, i) => {
            const hasBody = Boolean(image.title || image.caption);
            return (
              <article
                key={image.src || i}
                className={clsx(
                  "ah-zigzag__row",
                  hasBody && i % 2 === 1 && "ah-zigzag__row--flip",
                  !hasBody && "ah-zigzag__row--full"
                )}
              >
                <div className="ah-zigzag__media">
                  <AhImage
                    image={image}
                    ratio="3 / 2"
                    sizes={
                      hasBody
                        ? "(min-width: 48rem) 55vw, 100vw"
                        : "(min-width: 48rem) 70vw, 100vw"
                    }
                    fallbackLabel={name}
                  />
                </div>
                {hasBody ? (
                  <div className="ah-zigzag__body">
                    <span className="ah-zigzag__ordinal" aria-hidden="true">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {image.title ? <h3 className="ah-zigzag__title">{image.title}</h3> : null}
                    {image.caption ? (
                      <p className="ah-zigzag__caption">{image.caption}</p>
                    ) : null}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </AhContainer>
    </AhSection>
  );
}

/** FAQ — native disclosure elements, no JavaScript. */
export function AnimalFaq({ faqs = [], name }) {
  if (!faqs.length) return null;
  return (
    <AhSection as="section">
      <AhContainer size="narrow">
        <AhSectionHeader
          eyebrow="Common questions"
          title={`About the ${name.toLowerCase()}`}
          titleSize="md"
        />
        <div className="ah-faq">
          {faqs.map((faq) => (
            <details key={faq.q} className="ah-faq__item">
              <summary className="ah-faq__q">
                <span>{faq.q}</span>
                <span className="ah-faq__marker" aria-hidden="true" />
              </summary>
              <div className="ah-faq__a">
                <p>{faq.a}</p>
              </div>
            </details>
          ))}
        </div>
      </AhContainer>
    </AhSection>
  );
}

/** Conservation summary panel. */
export function AnimalConservation({ conservation, status }) {
  if (!conservation || !status) return null;
  return (
    <section className="ah-panel ah-panel--status">
      <h2 className="ah-panel__heading">Conservation status</h2>
      <div className="ah-status">
        <ConservationBadge conservation={status} />
        <p className="ah-status__desc">{status.description}</p>
      </div>
      <dl className="ah-datalist ah-datalist--tight">
        {conservation.assessmentYear ? (
          <div className="ah-datalist__row">
            <dt>Assessed</dt>
            <dd>{conservation.assessmentYear}</dd>
          </div>
        ) : null}
        {conservation.populationTrend ? (
          <div className="ah-datalist__row">
            <dt>Trend</dt>
            <dd>{conservation.populationTrend}</dd>
          </div>
        ) : null}
        {conservation.populationEstimate ? (
          <div className="ah-datalist__row">
            <dt>Population</dt>
            <dd>{conservation.populationEstimate}</dd>
          </div>
        ) : null}
      </dl>
      {conservation.note ? <p className="ah-status__note">{conservation.note}</p> : null}
    </section>
  );
}

/** Source list — a researched encyclopedia shows its working. */
export function AnimalSources({ sources = [], updatedAt }) {
  if (!sources.length) return null;
  return (
    <section className="ah-panel">
      <h2 className="ah-panel__heading">Sources</h2>
      <ul className="ah-sources">
        {sources.map((source) => (
          <li key={source.url}>
            <a href={source.url} target="_blank" rel="noopener noreferrer">
              {source.label}
            </a>
            <span className="ah-sources__publisher">{source.publisher}</span>
          </li>
        ))}
      </ul>
      {updatedAt ? <p className="ah-caption ah-sources__updated">Reviewed {updatedAt}</p> : null}
    </section>
  );
}

/** Related animals rail. */
export function AnimalRelated({ animals = [] }) {
  if (!animals.length) return null;
  return (
    <AhSection as="section" tint>
      <AhContainer>
        <AhSectionHeader eyebrow="Related" title="Read next" titleSize="md" />
        <AnimalGrid animals={animals} variant="cols-4" />
      </AhContainer>
    </AhSection>
  );
}
