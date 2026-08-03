"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

const SearchContext = createContext({ open: false, openSearch: () => {}, closeSearch: () => {} });

/**
 * Holds the command-palette open state for the whole section.
 *
 * The standalone build passed `openSearch` down through every page as a prop.
 * Under the App Router the pages are separate routes, so the shared state lives
 * in one provider mounted by the Top11 layout instead.
 */
export function SearchProvider({ children }) {
  const [open, setOpen] = useState(false);

  const openSearch = useCallback(() => setOpen(true), []);
  // Selecting a result calls this and routes in the same tick. The palette has
  // no exit animation, so it unmounts synchronously and can never outlive the
  // navigation (see SearchDialog).
  const closeSearch = useCallback(() => setOpen(false), []);

  const value = useMemo(
    () => ({ open, openSearch, closeSearch }),
    [open, openSearch, closeSearch],
  );

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export function useTop11Search() {
  return useContext(SearchContext);
}
