// Animal Hub comparison layer.
//
// Records store facts in whatever unit reads naturally for that animal — a
// hummingbird's weight in grams, a whale's in kilograms — because forcing one
// unit on 125 records would make the data files worse to read and would break
// again with every new species. facts.js states the contract directly: ranges
// in different units "are normalised by the compare layer using `unit`, not by
// the record". This is that layer.
//
// It compares by FACT KEY: `weight` against `weight`, never `weight` against
// `wingspan`. Within a key, values are converted to a family base unit and
// ranked. Where a key's units belong to DIFFERENT families the row still
// renders, but unranked and labelled — see the bite-force note below.

import { FACT_GROUPS, getFactDefinition } from "../_data/facts";

/**
 * unit → { family, toBase }. `toBase` multiplies into the family's base unit.
 *
 * Note that force and pressure are deliberately separate families. A bite
 * force in newtons and one in PSI cannot be converted into each other without
 * the contact area, which no record carries — PSI is a pressure, N is a force.
 * Several records legitimately hold each (the measured crocodilian figures are
 * published in newtons; the big-cat figures in PSI), so the comparison must
 * refuse to rank them rather than produce a confident wrong answer.
 */
const UNITS = {
  mm: { family: "length", toBase: 0.001 },
  cm: { family: "length", toBase: 0.01 },
  m: { family: "length", toBase: 1 },
  km: { family: "length", toBase: 1000 },

  g: { family: "mass", toBase: 0.001 },
  kg: { family: "mass", toBase: 1 },
  t: { family: "mass", toBase: 1000 },

  "m/s": { family: "speed", toBase: 3.6 },
  "km/h": { family: "speed", toBase: 1 },
  mph: { family: "speed", toBase: 1.609344 },

  N: { family: "force", toBase: 1 },
  kN: { family: "force", toBase: 1000 },
  PSI: { family: "pressure", toBase: 1 },

  days: { family: "duration", toBase: 1 },
  weeks: { family: "duration", toBase: 7 },
  months: { family: "duration", toBase: 30.44 },
  years: { family: "duration", toBase: 365.25 },
};

/** Base unit shown in a row header, per family. */
const FAMILY_BASE = {
  length: "m",
  mass: "kg",
  speed: "km/h",
  force: "N",
  pressure: "PSI",
  duration: "days",
};

function unitInfo(unit) {
  if (!unit) return null;
  return UNITS[unit] ?? null;
}

/**
 * A fact is rankable only if it carries a number. `value` is a display string
 * ("110–150 cm") and is never parsed — records set min/max explicitly, and a
 * fact with no range deliberately omits them rather than inventing one.
 */
function numericExtent(fact) {
  const min = typeof fact.min === "number" ? fact.min : null;
  const max = typeof fact.max === "number" ? fact.max : null;
  if (min === null && max === null) return null;
  return { min: min ?? max, max: max ?? min };
}

/** Every fact on a record, measurements and traits alike, keyed for lookup. */
function factsByKey(animal) {
  const all = [...(animal.measurements ?? []), ...(animal.traits ?? [])];
  return new Map(all.map((fact) => [fact.key, fact]));
}

/**
 * Build a comparison table for 2-4 animals.
 *
 * Returns groups in fact-catalog order, each holding rows. A row appears if at
 * least one selected animal has that fact — a blank cell is informative ("this
 * one has no recorded bite force"), so rows are not dropped for being partial.
 */
export function buildComparison(animals = []) {
  if (animals.length < 2) return { animals, groups: [] };

  const lookups = animals.map((animal) => factsByKey(animal));

  // Union of keys, preserving the order each record declared them in so the
  // table reads the way the profiles do.
  const keys = [];
  const seen = new Set();
  for (const lookup of lookups) {
    for (const key of lookup.keys()) {
      if (!seen.has(key)) {
        seen.add(key);
        keys.push(key);
      }
    }
  }

  const rows = keys.map((key) => {
    const definition = getFactDefinition(key);
    const cells = lookups.map((lookup, index) => {
      const fact = lookup.get(key);
      return {
        slug: animals[index].slug,
        fact: fact ?? null,
        display: fact?.value ?? null,
        note: fact?.note ?? null,
      };
    });

    const present = cells.filter((cell) => cell.fact);
    const label = definition?.label ?? present[0]?.fact?.label ?? key;

    // Rankable requires: the catalog allows it, every present value is
    // numeric, and every unit resolves to the SAME family.
    const extents = present.map((cell) => numericExtent(cell.fact));
    const units = present.map((cell) => unitInfo(cell.fact.unit));
    const families = new Set(units.map((u) => u?.family ?? null));

    const allNumeric = extents.every(Boolean);
    const oneFamily = families.size === 1 && !families.has(null);
    const catalogAllows = definition ? definition.comparable !== false : true;
    const rankable = catalogAllows && allNumeric && oneFamily && present.length > 1;

    let baseUnit = null;
    let conflict = null;

    if (rankable) {
      const family = [...families][0];
      baseUnit = FAMILY_BASE[family] ?? null;
      let best = -Infinity;

      present.forEach((cell, i) => {
        const scale = units[i].toBase;
        cell.baseMin = extents[i].min * scale;
        cell.baseMax = extents[i].max * scale;
        if (cell.baseMax > best) best = cell.baseMax;
      });

      // Ties are marked on every tied cell rather than the first — two animals
      // sharing a top value is a real outcome, not a rendering edge case.
      for (const cell of present) {
        if (cell.baseMax === best) cell.isHighest = true;
      }
    } else if (allNumeric && families.size > 1 && !families.has(null)) {
      conflict = `Recorded in ${[...families].join(" and ")} — not directly comparable`;
    }

    return {
      key,
      label,
      group: definition?.group ?? "other",
      rankable,
      baseUnit,
      conflict,
      cells,
      presentCount: present.length,
    };
  });

  const groups = FACT_GROUPS.map((group) => ({
    ...group,
    rows: rows.filter((row) => row.group === group.id && row.presentCount > 0),
  })).filter((group) => group.rows.length > 0);

  return { animals, groups };
}

/**
 * Conservation severity is the one cross-record value worth surfacing at the
 * top of a comparison, so a reader can see at a glance which of the animals in
 * front of them is in the most trouble.
 */
export function compareConservation(animals = []) {
  return animals.map((animal) => ({
    slug: animal.slug,
    code: animal.conservation?.status ?? null,
  }));
}
