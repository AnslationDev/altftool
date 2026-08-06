"use client";

// Category browser — search, filter, sort and grid for one category.
//
// Receives the category's animal cards from the server and works entirely on
// that array: no fetching, no data imports. Every control is real rather than
// decorative, because a filter that does not filter is worse than no filter,
// and the card projection already carries everything the controls need
// (habitats and conservation are denormalised onto it for exactly this).
//
// When the catalogue outgrows client-side filtering, the same controls move
// to URL state and the service layer paginates — the component's props
// (animals, facets) do not change shape.

import { useMemo, useState } from "react";
import { AhContainer, AhSection } from "./AhLayout";
import { AnimalGrid } from "./AnimalCards";
import { AnimalSearchField } from "./AnimalSearchField";

const SORTS = [
  { value: "curated", label: "Curated order" },
  { value: "name", label: "Name A–Z" },
  { value: "risk", label: "Most at risk" },
];

export function CategoryBrowser({ animals = [], searchIndex = [], categoryName = "" }) {
  const [query, setQuery] = useState("");
  const [habitat, setHabitat] = useState("all");
  const [risk, setRisk] = useState("all");
  const [sort, setSort] = useState("curated");

  // Facets are derived from the animals actually present, so a filter never
  // offers an option that would return nothing.
  const habitats = useMemo(() => {
    const counts = new Map();
    for (const animal of animals) {
      for (const name of animal.habitats || []) {
        counts.set(name, (counts.get(name) || 0) + 1);
      }
    }
    return [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [animals]);

  const hasThreatened = useMemo(
    () => animals.some((animal) => animal.conservation?.threatened),
    [animals],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();

    let list = animals.filter((animal) => {
      if (habitat !== "all" && !(animal.habitats || []).includes(habitat)) return false;
      if (risk === "threatened" && !animal.conservation?.threatened) return false;
      if (!q) return true;
      return [animal.name, animal.scientificName, animal.summary]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(q));
    });

    if (sort === "name") {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "risk") {
      list = [...list].sort(
        (a, b) => (b.conservation?.severity ?? 0) - (a.conservation?.severity ?? 0),
      );
    }

    return list;
  }, [animals, query, habitat, risk, sort]);

  const isFiltered = query.trim() || habitat !== "all" || risk !== "all";

  function reset() {
    setQuery("");
    setHabitat("all");
    setRisk("all");
    setSort("curated");
  }

  return (
    <AhSection as="section" flush>
      <div className="ah-toolbar">
        <AhContainer>
          <div className="ah-toolbar__inner">
            <div className="ah-toolbar__search">
              <label className="sr-only" htmlFor="ah-cat-filter">
                Filter {categoryName} by name
              </label>
              <input
                id="ah-cat-filter"
                type="search"
                className="ah-toolbar__input"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={`Filter ${categoryName.toLowerCase()}…`}
                autoComplete="off"
              />
            </div>

            <div className="ah-toolbar__controls">
              {habitats.length > 1 ? (
                <label className="ah-field">
                  <span className="ah-field__label">Habitat</span>
                  <select
                    className="ah-field__select"
                    value={habitat}
                    onChange={(event) => setHabitat(event.target.value)}
                  >
                    <option value="all">All habitats</option>
                    {habitats.map((entry) => (
                      <option key={entry.name} value={entry.name}>
                        {entry.name} ({entry.count})
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}

              {hasThreatened ? (
                <label className="ah-field">
                  <span className="ah-field__label">Status</span>
                  <select
                    className="ah-field__select"
                    value={risk}
                    onChange={(event) => setRisk(event.target.value)}
                  >
                    <option value="all">Any status</option>
                    <option value="threatened">Threatened only</option>
                  </select>
                </label>
              ) : null}

              <label className="ah-field">
                <span className="ah-field__label">Sort</span>
                <select
                  className="ah-field__select"
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                >
                  {SORTS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </AhContainer>
      </div>

      <AhContainer>
        <div className="ah-results">
          <p className="ah-results__count" role="status">
            {visible.length} of {animals.length} {animals.length === 1 ? "profile" : "profiles"}
            {isFiltered ? " shown" : ""}
          </p>
          {isFiltered ? (
            <button type="button" className="ah-results__reset" onClick={reset}>
              Clear filters
            </button>
          ) : null}
        </div>

        <AnimalGrid
          animals={visible}
          variant="cols-3"
          emptyMessage={
            animals.length
              ? "No species in this group match those filters yet."
              : "Profiles for this group are being written."
          }
        />

        {searchIndex.length ? (
          <div className="ah-results__wider">
            <p className="ah-caption">Looking for something in another group?</p>
            <AnimalSearchField
              index={searchIndex}
              placeholder="Search the whole catalogue"
              label="Search all animals"
            />
          </div>
        ) : null}
      </AhContainer>
    </AhSection>
  );
}
