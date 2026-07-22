"use client";

import { useState, useMemo } from "react";
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import SynonymResults from "../components/SynonymResults";
import { getWordDetail } from "../utils/synonymUtils";

export default function SynonymFinder() {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const hasSearched = Boolean(normalizedQuery);

  const wordDetail = useMemo(
    () => (normalizedQuery ? getWordDetail(normalizedQuery) : null),
    [normalizedQuery],
  );

  return (
    <div className="bg-[var(--background)] px-4 py-6 text-[var(--foreground)] transition-colors sm:px-6">
      <div className="mx-auto max-w-3xl">
        <Header />

        <div className="space-y-6">
          <SearchBar value={query} onChange={setQuery} />

          {!hasSearched && (
            <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)] p-10 text-center shadow-sm">
              <p className="text-sm text-[var(--muted-foreground)]">
                Type any English word above to find its synonyms and antonyms.
              </p>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                Database: 250+ headwords with 2000+ synonyms.
              </p>
            </div>
          )}

          {hasSearched && <SynonymResults wordDetail={wordDetail} hasSearched={hasSearched} />}
        </div>

        <p className="mt-6 text-center text-xs text-[var(--muted-foreground)]">
          All data is local — no network requests. 250+ headwords with 2000+ synonyms and antonyms.
        </p>
      </div>
    </div>
  );
}
