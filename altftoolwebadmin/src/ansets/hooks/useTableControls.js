"use client";

import { useMemo, useState } from "react";

/**
 * Search + filter + sort + "show more" for a client-side list.
 *
 * Every list screen re-implemented this, and the audit caught the classic bug
 * more than once: a search predicate reading `row.email.toLowerCase()` with no
 * guard, so one record missing that field white-screened the page as soon as
 * anything was typed. `searchFields` is read defensively here, once.
 *
 * @param {Array}  rows
 * @param {object} [opts]
 * @param {string[]} [opts.searchFields]  Fields the search box matches against.
 * @param {object} [opts.filters]  { filterKey: (row, value) => boolean }
 * @param {number} [opts.pageSize] Rows shown before "show more". 0 disables paging.
 */
export function useTableControls(rows = [], { searchFields = [], filters = {}, pageSize = 0 } = {}) {
  const [search, setSearch] = useState("");
  const [filterValues, setFilterValues] = useState({});
  const [sort, setSort] = useState(null);
  const [visible, setVisible] = useState(pageSize || Infinity);

  const setFilter = (key, value) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
    setVisible(pageSize || Infinity);
  };

  const onSearchChange = (value) => {
    setSearch(value);
    setVisible(pageSize || Infinity);
  };

  const processed = useMemo(() => {
    const needle = search.trim().toLowerCase();

    let out = rows.filter((row) => {
      if (needle) {
        const hit = searchFields.some((field) => {
          const raw = row?.[field];
          return raw != null && String(raw).toLowerCase().includes(needle);
        });
        if (!hit) return false;
      }

      for (const [key, predicate] of Object.entries(filters)) {
        const value = filterValues[key];
        // "all" / empty means the filter is off.
        if (!value || value === "all") continue;
        if (!predicate(row, value)) return false;
      }

      return true;
    });

    if (sort?.key) {
      const dir = sort.direction === "desc" ? -1 : 1;
      out = [...out].sort((a, b) => {
        const av = a?.[sort.key];
        const bv = b?.[sort.key];
        if (av == null && bv == null) return 0;
        if (av == null) return 1; // missing values sink, in both directions
        if (bv == null) return -1;
        if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
        return String(av).localeCompare(String(bv), undefined, { numeric: true }) * dir;
      });
    }

    return out;
  }, [rows, search, filterValues, filters, searchFields, sort]);

  const paged = pageSize ? processed.slice(0, visible) : processed;

  return {
    search,
    onSearchChange,
    filterValues,
    setFilter,
    sort,
    setSort,
    rows: paged,
    total: rows.length,
    matched: processed.length,
    hasMore: paged.length < processed.length,
    showMore: () => setVisible((n) => n + (pageSize || 0)),
    countLabel: `${processed.length} of ${rows.length}`,
  };
}

export default useTableControls;
