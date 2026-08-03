"use client";

import { Loader2, SearchX } from "lucide-react";

/** Loading / empty / error states for a query that matched no category on this page. */
export default function SearchStatus({ status, query }) {
  const loading = status === "loading";

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center gap-3 px-5 py-16 text-center text-(--muted-foreground) font-secondary"
    >
      {loading ? (
        <Loader2 className="h-6 w-6 animate-spin motion-reduce:animate-none" aria-hidden="true" />
      ) : (
        <SearchX className="h-6 w-6" aria-hidden="true" />
      )}
      <p className="text-sm">
        {loading
          ? `Searching Wikipedia for “${query}”…`
          : status === "error"
            ? `Wikipedia could not be reached for “${query}” just now. Try again in a moment.`
            : `No Wikipedia results with a picture for “${query}”. Try a broader term, or pick a category above.`}
      </p>
    </div>
  );
}
