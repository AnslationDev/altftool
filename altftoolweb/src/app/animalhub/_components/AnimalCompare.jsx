// Animal Hub comparison table.
//
// Server-rendered: the selection lives in the URL, so a comparison is
// linkable, indexable and needs no client state. The only interactive piece is
// the picker, which is a separate client island.
//
// Nothing here knows what any particular fact means. It renders whichever rows
// buildComparison produced, marks the highest value where the compare layer
// says ranking is valid, and shows a plain note where it is not.

import { Fragment } from "react";
import Link from "next/link";
import clsx from "clsx";
import { AhContainer, AhSection, AhSectionHeader } from "./AhLayout";
import { AhImage } from "./AhImage";
import { ConservationBadge } from "./AnimalCards";

/** Column header: the animal itself, with a way to drop it from the set. */
function CompareHead({ animal, onRemoveHref }) {
  return (
    <th scope="col" className="ah-compare__head">
      <Link href={animal.href} className="ah-compare__head-link">
        <AhImage
          image={animal.heroImage}
          alt={animal.heroImage?.alt || animal.name}
          ratio="4 / 3"
          sizes="(min-width: 64rem) 20vw, 40vw"
          fallbackLabel={animal.name}
        />
        <span className="ah-compare__head-name">{animal.name}</span>
        <span className="ah-compare__head-latin">{animal.scientificName}</span>
      </Link>
      {onRemoveHref ? (
        <Link href={onRemoveHref} className="ah-compare__remove" aria-label={`Remove ${animal.name}`}>
          Remove
        </Link>
      ) : null}
    </th>
  );
}

export function AnimalCompareTable({ comparison, statuses = [], buildRemoveHref }) {
  const { animals, groups } = comparison;

  if (animals.length < 2) {
    return (
      <p className="ah-empty">
        Pick at least two animals to compare.
      </p>
    );
  }

  return (
    <div className="ah-compare__scroll">
      <table className="ah-compare">
        <caption className="ah-visually-hidden">
          Measurements and traits compared across {animals.length} animals
        </caption>
        <thead>
          <tr>
            <th scope="col" className="ah-compare__corner">
              <span className="ah-visually-hidden">Fact</span>
            </th>
            {animals.map((animal) => (
              <CompareHead
                key={animal.slug}
                animal={animal}
                onRemoveHref={buildRemoveHref ? buildRemoveHref(animal.slug) : null}
              />
            ))}
          </tr>
        </thead>

        <tbody>
          {statuses.length ? (
            <tr className="ah-compare__row ah-compare__row--status">
              <th scope="row">Conservation status</th>
              {animals.map((animal) => {
                const status = statuses.find((entry) => entry.slug === animal.slug);
                return (
                  <td key={animal.slug}>
                    {status?.meta ? (
                      <ConservationBadge conservation={status.meta} />
                    ) : (
                      <span className="ah-compare__absent">—</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ) : null}

          {groups.map((group) => (
            <Fragment key={group.id}>
              <tr className="ah-compare__group">
                <th scope="rowgroup" colSpan={animals.length + 1}>
                  {group.label}
                </th>
              </tr>
              {group.rows.map((row) => (
                <tr key={row.key} className="ah-compare__row">
                  <th scope="row">
                    {row.label}
                    {row.conflict ? (
                      <span className="ah-compare__conflict">{row.conflict}</span>
                    ) : null}
                  </th>
                  {row.cells.map((cell) => (
                    <td
                      key={cell.slug}
                      className={clsx(
                        cell.isHighest && "ah-compare__cell--highest",
                        !cell.fact && "ah-compare__cell--absent"
                      )}
                    >
                      {cell.display ? (
                        <>
                          <span className="ah-compare__value">{cell.display}</span>
                          {cell.isHighest ? (
                            <span className="ah-visually-hidden"> — highest of those compared</span>
                          ) : null}
                        </>
                      ) : (
                        <span className="ah-compare__absent" aria-label="Not recorded">
                          —
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Section wrapper so the compare page matches the rest of the module. */
export function AnimalCompareSection({ children, count }) {
  return (
    <AhSection as="section">
      <AhContainer>
        <AhSectionHeader
          eyebrow="Compare"
          title={count >= 2 ? "Side by side" : "Choose animals to compare"}
          titleSize="md"
        />
        {children}
      </AhContainer>
    </AhSection>
  );
}
