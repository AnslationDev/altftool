// Animal Hub card family — the listing vocabulary shared by every surface.
//
// These are the only components that know the shape of a card projection
// (see toAnimalCard in _lib/animalModel.js). They are still generic: nothing
// here is written for a particular animal or category, and every value comes
// from props. The homepage, category pages and future related rails all
// render the same components, so a change to how an animal reads in a list is
// a change in one place.

import Link from "next/link";
import clsx from "clsx";
import { AhCard, AhCardBody, AhCardMedia, AhCardMeta, AhCardText, AhCardTitle } from "./AhCard";
import { AhBadge } from "./AhElements";
import { AhGrid } from "./AhLayout";
import { AhImage } from "./AhImage";

/**
 * Conservation status chip. Takes the resolved conservation object carried on
 * a card, so no component needs the IUCN lookup table. `compact` shows the
 * code alone (cards); full shows the label (detail contexts).
 */
export function ConservationBadge({ conservation, compact = false }) {
  if (!conservation) return null;
  return (
    <AhBadge tone={conservation.tone} title={conservation.label}>
      {compact ? conservation.code : conservation.label}
    </AhBadge>
  );
}

/**
 * One animal in a listing. `size="feature"` is the cover-story treatment used
 * by the first tile of a feature grid — wider media, larger type, visible
 * summary. `index` renders an editorial ordinal when a list is ranked.
 */
export function AnimalCard({ animal, size = "default", index, priority = false }) {
  if (!animal) return null;
  const isFeature = size === "feature";

  return (
    <AhCard className={clsx("ah-animal-card", isFeature && "ah-animal-card--feature")}>
      <AhCardMedia>
        <AhImage
          image={animal.heroImage}
          alt={animal.heroImage?.alt || animal.name}
          ratio={isFeature ? "4 / 3" : "3 / 2"}
          sizes={
            isFeature
              ? "(min-width: 64rem) 50vw, 100vw"
              : "(min-width: 64rem) 25vw, (min-width: 40rem) 50vw, 100vw"
          }
          rounded={false}
          priority={priority}
          fallbackLabel={animal.name}
        />
        {typeof index === "number" ? (
          <span className="ah-animal-card__index" aria-hidden="true">
            {String(index + 1).padStart(2, "0")}
          </span>
        ) : null}
      </AhCardMedia>

      <AhCardBody>
        <AhCardTitle href={animal.href} as={isFeature ? "h2" : "h3"}>
          {animal.name}
        </AhCardTitle>
        {animal.scientificName ? (
          <p className="ah-animal-card__latin">{animal.scientificName}</p>
        ) : null}
        {isFeature && animal.summary ? (
          <AhCardText lines={3}>{animal.summary}</AhCardText>
        ) : null}
        {animal.traits && animal.traits.length > 0 ? (
          <div className="ah-animal-card__traits">
            {animal.traits.slice(0, 2).map((trait) => (
              <span key={trait.key} className="ah-animal-card__trait" title={trait.value}>
                {trait.value}
              </span>
            ))}
          </div>
        ) : null}
        <AhCardMeta>
          <span className="ah-animal-card__category">{animal.category}</span>
        </AhCardMeta>
      </AhCardBody>
    </AhCard>
  );
}

/**
 * A grid of animal cards with a built-in empty state. `variant="feature"`
 * promotes the first card to a 2×2 cover tile; `ranked` numbers the cards.
 */
export function AnimalGrid({
  animals = [],
  variant = "cols-4",
  ranked = false,
  emptyMessage = "No animals match this view yet.",
  priorityFirst = false,
}) {
  if (!animals.length) {
    return <p className="ah-empty">{emptyMessage}</p>;
  }

  return (
    <AhGrid variant={variant}>
      {animals.map((animal, i) => (
        <AnimalCard
          key={animal.slug}
          animal={animal}
          size={variant === "feature" && i === 0 ? "feature" : "default"}
          index={ranked ? i : undefined}
          priority={priorityFirst && i === 0}
        />
      ))}
    </AhGrid>
  );
}

/**
 * Category entry rendered as an index row rather than a card: a large ordinal,
 * the name, its count, and a rule that fills the remaining space. Reads as a
 * table of contents, which is why the homepage does not look like a grid of
 * identical tiles.
 */
export function CategoryIndexRow({ category, index }) {
  if (!category) return null;
  return (
    <li className="ah-index-row">
      <Link href={`/animalhub/${category.slug}`} className="ah-index-row__link">
        <span className="ah-index-row__ordinal" aria-hidden="true">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="ah-index-row__body">
          <span className="ah-index-row__name">{category.name}</span>
          <span className="ah-index-row__desc">{category.description}</span>
        </span>
        <span className="ah-index-row__count">
          {category.animalCount}
          <span className="ah-index-row__count-label">
            {category.animalCount === 1 ? " species" : " species"}
          </span>
        </span>
      </Link>
    </li>
  );
}

/**
 * Ranked list used for the popular rail — an editorial "most referenced"
 * column rather than another row of cards, so two adjacent sections on the
 * homepage never read the same way.
 */
export function AnimalRankedList({ animals = [] }) {
  if (!animals.length) return null;
  return (
    <ol className="ah-ranked">
      {animals.map((animal, i) => (
        <li key={animal.slug} className="ah-ranked__item">
          <Link href={animal.href} className="ah-ranked__link">
            <span className="ah-ranked__ordinal" aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="ah-ranked__body">
              <span className="ah-ranked__name">{animal.name}</span>
              <span className="ah-ranked__latin">{animal.scientificName}</span>
            </span>
            <ConservationBadge conservation={animal.conservation} compact />
          </Link>
        </li>
      ))}
    </ol>
  );
}
